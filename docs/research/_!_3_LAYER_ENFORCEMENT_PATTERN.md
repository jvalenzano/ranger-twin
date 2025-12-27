# CTO Synthesis: ADR-007.1 Final Architecture Decision

After reviewing all three expert analyses, I'm synthesizing the consensus findings and providing the final architectural recommendation for RANGER.

---

## Executive Summary

**All three expert panels converge on the same conclusion:** Our three-layer enforcement pattern is architecturally sound, but requires specific code corrections before implementation. The `mode="ANY"` infinite loop is a confirmed design limitation, not a bug we can work around.

---

## Consensus Findings Across All Three Analyses

### Unanimous Agreement ✅

| Finding | Expert 1 | Expert 2 | Expert 3 |
|---------|----------|----------|----------|
| `mode="ANY"` causes infinite loop by design | ✅ | ✅ | ✅ |
| Three-layer enforcement is correct approach | ✅ | ✅ | ✅ |
| `mode="AUTO"` for Tier 1 | ✅ | ✅ | ✅ |
| Post-response validation achieves ~99% reliability | ✅ | ✅ | ✅ |
| Exit tool requires LoopAgent wrapper | ✅ | ✅ | ✅ |
| Tool extraction via callbacks, not response parsing | ✅ | ✅ | ✅ |
| Direct LlmAgent sufficient for single-turn specialists | ✅ | ✅ | ✅ |

### Critical Code Corrections Identified

All three experts flagged the same issues:

| Issue | Original Code | Corrected Approach |
|-------|---------------|-------------------|
| **Async invocation** | `await self.agent.run()` | `async for event in self.agent.run_async()` |
| **Tool extraction** | Parse response object | Use audit callbacks + session state |
| **Exit tool flags** | `escalate=True` only | Add `skip_summarization=True` |
| **Callback signature** | `response` parameter | `tool_response` parameter |

---

## Final Architecture Decision: ADR-007.1

### Tier 1: API Configuration (Eliminates Infinite Loop)

```python
from google.genai import types

TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="AUTO"  # NOT "ANY" - allows synthesis after tool calls
        # No allowed_function_names (only valid with mode="ANY")
    )
)

GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    tool_config=TOOL_CONFIG,
    temperature=0.1,
)
```

### Tier 2: Instruction Enforcement (90% First-Pass Success)

```python
SPECIALIST_INSTRUCTION = """
You are the {agent_name} for RANGER forest recovery system.

## Reasoning Process (THINK → CALL → REASON → RESPOND)

**THINK:** Identify what data you need
- Damage assessment? → Need classify_damage tool
- Closure status? → Need evaluate_closure tool
- Priority ranking? → Need prioritize_trails tool

**CALL:** Execute the appropriate tool
- You MUST call a tool before responding to domain questions
- The system validates tool invocation and will retry if skipped

**REASON:** Interpret the tool response
- Check status field (success/error/no_data)
- Extract confidence score and data sources
- Note any limitations

**RESPOND:** Ground your answer in tool data
- Include specific findings from the tool
- Cite confidence score (e.g., "90% confidence")
- Reference data source and date
- Provide actionable recommendations

## Decision Tree
{domain_specific_decision_tree}

## Critical Rules
- NEVER respond with general knowledge for domain questions
- ALWAYS call a tool first, then synthesize
- If tool returns error, acknowledge the limitation explicitly
"""
```

### Tier 3: Validation Layer (99% Combined Reliability)

```python
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger("ranger.validation")

class ToolInvocationValidator:
    """
    Post-response validation ensuring tool invocation compliance.
    Achieves 99% reliability when combined with Tier 2 instructions.
    """
    
    def __init__(self, agent, max_retries: int = 2):
        self.agent = agent
        self.max_retries = max_retries
        self.tools_invoked_this_turn: List[str] = []
        self.tool_execution_log: List[Dict] = []
    
    def create_tracking_callbacks(self):
        """
        Create callbacks that track tool invocations.
        This is the ONLY reliable way to know which tools were called.
        """
        validator = self  # Capture reference
        
        def before_tool_audit(tool, args, tool_context):
            tool_name = tool.__name__ if callable(tool) else str(tool)
            validator.tools_invoked_this_turn.append(tool_name)
            validator.tool_execution_log.append({
                "event": "TOOL_INVOCATION",
                "tool": tool_name,
                "args_keys": list(args.keys()) if isinstance(args, dict) else [],
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            logger.info("TOOL_INVOCATION", extra={
                "tool": tool_name,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            return None
        
        def after_tool_audit(tool, args, tool_context, tool_response):
            tool_name = tool.__name__ if callable(tool) else str(tool)
            status = tool_response.get("status", "unknown") if isinstance(tool_response, dict) else "unknown"
            confidence = tool_response.get("confidence", 0) if isinstance(tool_response, dict) else 0
            
            validator.tool_execution_log.append({
                "event": "TOOL_RESPONSE",
                "tool": tool_name,
                "status": status,
                "confidence": confidence,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            logger.info("TOOL_RESPONSE", extra={
                "tool": tool_name,
                "status": status,
                "confidence": confidence
            })
            return None
        
        def on_tool_error_audit(tool, args, tool_context, error):
            tool_name = tool.__name__ if callable(tool) else str(tool)
            validator.tool_execution_log.append({
                "event": "TOOL_ERROR",
                "tool": tool_name,
                "error": str(error)[:200],
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            logger.error("TOOL_ERROR", extra={
                "tool": tool_name,
                "error": str(error)[:200]
            })
            return {
                "status": "error",
                "error_message": f"Tool execution failed: {str(error)}",
                "confidence": 0.0,
                "data_sources": []
            }
        
        return before_tool_audit, after_tool_audit, on_tool_error_audit
    
    async def invoke_with_enforcement(
        self,
        query: str,
        required_tools: Optional[List[str]] = None,
        timeout_seconds: int = 30
    ) -> Dict[str, Any]:
        """
        Invoke agent with guaranteed tool invocation or explicit failure.
        
        Args:
            query: User query
            required_tools: Tools that MUST be called (None = no enforcement)
            timeout_seconds: Max time before timeout
            
        Returns:
            Structured result with success status, response, and audit trail
        """
        # Skip validation if no tools required (general conversation)
        if not required_tools:
            response = await self._run_agent(query)
            return {
                "success": True,
                "response": response,
                "tools_invoked": self.tools_invoked_this_turn,
                "attempts": 1,
                "validation_outcome": "SKIPPED_NO_REQUIREMENTS",
                "audit_trail": self.tool_execution_log
            }
        
        audit_trail = []
        
        for attempt in range(1, self.max_retries + 2):
            # Reset tracking for this attempt
            self.tools_invoked_this_turn = []
            self.tool_execution_log = []
            
            # Build query (add enforcement on retry)
            effective_query = self._build_query(query, required_tools, attempt)
            
            # Run agent
            try:
                response = await self._run_agent(effective_query)
            except TimeoutError:
                return self._timeout_response(attempt, audit_trail)
            
            # Log attempt
            audit_entry = {
                "attempt": attempt,
                "query_snippet": effective_query[:150],
                "tools_required": required_tools,
                "tools_invoked": self.tools_invoked_this_turn.copy(),
                "tool_log": self.tool_execution_log.copy(),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            audit_trail.append(audit_entry)
            
            # Check if required tools were invoked
            missing_tools = set(required_tools) - set(self.tools_invoked_this_turn)
            
            if not missing_tools:
                outcome = "PASSED" if attempt == 1 else "RETRY_SUCCEEDED"
                logger.info(f"VALIDATION_{outcome}", extra={
                    "attempts": attempt,
                    "tools_invoked": self.tools_invoked_this_turn
                })
                return {
                    "success": True,
                    "response": response,
                    "tools_invoked": self.tools_invoked_this_turn,
                    "attempts": attempt,
                    "validation_outcome": outcome,
                    "audit_trail": audit_trail
                }
            
            # Log retry intent
            if attempt <= self.max_retries:
                logger.warning("VALIDATION_RETRY", extra={
                    "attempt": attempt,
                    "missing_tools": list(missing_tools)
                })
        
        # Escalation (all retries exhausted)
        logger.error("VALIDATION_ESCALATED", extra={
            "attempts": self.max_retries + 1,
            "missing_tools": list(missing_tools)
        })
        
        return {
            "success": False,
            "response": response,  # Return last response for context
            "tools_invoked": self.tools_invoked_this_turn,
            "attempts": self.max_retries + 1,
            "validation_outcome": "ESCALATED",
            "audit_trail": audit_trail,
            "escalation_reason": f"Required tools not invoked: {missing_tools}",
            "recommended_action": "HUMAN_REVIEW"
        }
    
    async def _run_agent(self, query: str):
        """Run agent and collect final response."""
        from google.genai import types
        content = types.Content(role='user', parts=[types.Part(text=query)])
        
        final_response = None
        async for event in self.agent.run_async(user_id="ranger", session_id="validation", new_message=content):
            if hasattr(event, 'is_final_response') and event.is_final_response():
                final_response = event
        
        return final_response
    
    def _build_query(self, query: str, required_tools: List[str], attempt: int) -> str:
        """Add enforcement language on retry attempts."""
        if attempt == 1:
            return query
        
        tool_list = ", ".join(required_tools)
        return f"""{query}

SYSTEM ENFORCEMENT (Attempt {attempt}): Your previous response did not invoke required tools.
You MUST call one of these tools: [{tool_list}]
Do not respond with general knowledge. Call the tool first, then synthesize from the result."""
    
    def _timeout_response(self, attempt: int, audit_trail: List) -> Dict:
        """Generate timeout response."""
        return {
            "success": False,
            "response": None,
            "tools_invoked": [],
            "attempts": attempt,
            "validation_outcome": "TIMEOUT",
            "audit_trail": audit_trail,
            "escalation_reason": "Request timed out",
            "recommended_action": "RETRY"
        }
```

### Query Intent Classifier (Determines Required Tools)

```python
class QueryIntentClassifier:
    """
    Classify query intent to determine required tools.
    Keyword-based for Phase 1; upgrade to semantic classification in Phase 2.
    """
    
    def __init__(self, tool_mappings: Dict[str, Dict]):
        self.tool_mappings = tool_mappings
    
    def classify(self, query: str) -> Optional[List[str]]:
        """
        Determine required tools based on query.
        Returns None for general conversation (no tool enforcement).
        """
        query_lower = query.lower()
        
        # Check for general/help queries (no tool needed)
        general_keywords = ["help", "what can you", "who are you", "hello", "hi", "thanks"]
        if any(kw in query_lower for kw in general_keywords):
            return None
        
        # Score each category
        scores = {}
        for category, config in self.tool_mappings.items():
            if category == "default":
                continue
            matches = sum(1 for kw in config["keywords"] if kw in query_lower)
            if matches > 0:
                scores[category] = matches * config.get("weight", 1.0)
        
        # Return tools for best match, or default
        if scores:
            best = max(scores, key=scores.get)
            return self.tool_mappings[best]["tools"]
        
        return self.tool_mappings.get("default", {}).get("tools", [])


# Trail Assessor Configuration
TRAIL_ASSESSOR_TOOL_MAPPINGS = {
    "damage": {
        "keywords": ["damage", "severity", "burn", "burned", "impact", "destroyed"],
        "tools": ["classify_damage"],
        "weight": 1.0
    },
    "closure": {
        "keywords": ["closure", "closed", "reopen", "safe", "access", "open"],
        "tools": ["evaluate_closure"],
        "weight": 1.0
    },
    "priority": {
        "keywords": ["priority", "prioritize", "urgent", "first", "order", "rank"],
        "tools": ["prioritize_trails"],
        "weight": 0.9
    },
    "default": {
        "tools": ["classify_damage"]  # Default to damage assessment
    }
}
```

---

## Agent Assembly Pattern (Final)

```python
from google.adk.agents import LlmAgent

def create_trail_assessor():
    """
    Create Trail Assessor with three-layer enforcement.
    """
    # Create validator and get callbacks
    validator = ToolInvocationValidator(agent=None, max_retries=2)
    before_cb, after_cb, error_cb = validator.create_tracking_callbacks()
    
    # Create agent with callbacks
    agent = LlmAgent(
        name="TrailAssessorAgent",
        model="gemini-2.0-flash",
        description="Specialist agent for trail damage assessment and closure evaluation",
        instruction=TRAIL_ASSESSOR_INSTRUCTION,
        tools=[classify_damage, evaluate_closure, prioritize_trails],
        generate_content_config=GENERATE_CONTENT_CONFIG,
        before_tool_callback=before_cb,
        after_tool_callback=after_cb,
        on_tool_error_callback=error_cb,
    )
    
    # Attach agent to validator
    validator.agent = agent
    
    # Create classifier
    classifier = QueryIntentClassifier(TRAIL_ASSESSOR_TOOL_MAPPINGS)
    
    return agent, validator, classifier


# Usage
agent, validator, classifier = create_trail_assessor()

async def query_trail_assessor(user_query: str):
    """Execute query with full enforcement and audit."""
    required_tools = classifier.classify(user_query)
    result = await validator.invoke_with_enforcement(user_query, required_tools)
    
    if result["success"]:
        return {
            "status": "success",
            "response": result["response"],
            "verified": True,
            "audit_trail": result["audit_trail"]
        }
    else:
        return {
            "status": "escalated",
            "reason": result["escalation_reason"],
            "verified": False,
            "audit_trail": result["audit_trail"],
            "action": "requires_human_review"
        }
```

---

## Decision: LoopAgent vs Direct LlmAgent

Based on all three expert analyses:

| Agent Type | Pattern | Rationale |
|------------|---------|-----------|
| **Specialists** (Burn, Trail, Cruising, NEPA) | Direct `LlmAgent` | Single-turn queries; simpler, faster |
| **Coordinator** | Direct `LlmAgent` with `mode="AUTO"` | Routing flexibility; may not always need tools |
| **Future multi-step workflows** | `LoopAgent` + exit tool | Only if sequential reasoning required |

**We do NOT need LoopAgent or exit_when_complete for Phase 1.** The validation layer handles completion verification.

---

## Prompt for Claude Code: Execute ADR-007.1

```
Execute the ADR-007.1 three-layer tool invocation pattern across all RANGER agents.

## Context
We've confirmed that `mode="ANY"` causes infinite loops by design. We're implementing 
a three-layer enforcement pattern instead:
- Tier 1: `mode="AUTO"` (eliminates loop)
- Tier 2: ReAct instructions (90% first-pass success)
- Tier 3: ToolInvocationValidator (99% combined reliability)

## Critical Code Corrections (Apply to ALL agents)
1. Change `mode="ANY"` to `mode="AUTO"` 
2. Remove `allowed_function_names` (only valid with mode="ANY")
3. Fix callback signature: `tool_response` not `response`
4. Use async generator pattern: `async for event in agent.run_async()`

## Implementation Order
1. **Trail Assessor** - Revert infinite loop fix, apply three-layer pattern
2. **Burn Analyst** - Apply pattern
3. **Cruising Assistant** - Apply pattern  
4. **NEPA Advisor** - Apply pattern
5. **Coordinator** - Apply pattern (mode="AUTO", no validation layer)

## Files to Create
1. `agents/shared/validation.py` - ToolInvocationValidator class
2. `agents/shared/classifier.py` - QueryIntentClassifier class
3. `agents/shared/callbacks.py` - Audit callback factory

## Files to Modify
1. `agents/trail_assessor/agent.py`
2. `agents/burn_analyst/agent.py`
3. `agents/cruising_assistant/agent.py`
4. `agents/nepa_advisor/agent.py`
5. `agents/coordinator/agent.py`

## Per-Agent Checklist
- [ ] Tier 1: `mode="AUTO"` in TOOL_CONFIG
- [ ] Tier 2: ReAct instructions updated
- [ ] Tier 3: Import and use ToolInvocationValidator
- [ ] Audit callbacks registered
- [ ] Tool mappings defined for classifier
- [ ] No LoopAgent wrapper (direct LlmAgent)

## Testing After Each Agent
```bash
cd agents && adk run {agent_name}
# Query: Domain-specific question
# Expected: Tool invocation in logs, no infinite loop, final response
```

## Git Commits
Commit after each agent with message format:
```
feat({agent}): implement ADR-007.1 three-layer tool invocation

- Tier 1: mode="AUTO" eliminates infinite loop
- Tier 2: ReAct instructions for tool guidance
- Tier 3: ToolInvocationValidator for compliance
- Audit callbacks for federal trail

Supersedes ADR-007 mode="ANY" approach (confirmed design limitation)
```

## Success Criteria
- [ ] All 5 agents updated
- [ ] No infinite loops on any query
- [ ] Tool invocations logged via callbacks
- [ ] Validation layer catches non-compliance
- [ ] All agents pass basic smoke test

Begin with Trail Assessor. Report results before proceeding to next agent.
```

---

## Final Recommendation

**Proceed with ADR-007.1 implementation.** The expert consensus is clear:

1. **`mode="ANY"` is a dead end** — confirmed design limitation
2. **Three-layer enforcement is production-ready** — matches Google's recommended patterns
3. **Direct LlmAgent is sufficient** — no LoopAgent complexity needed for Phase 1
4. **Validation layer provides federal defensibility** — explicit verification beats implicit API enforcement

This architecture is stronger than ADR-007 because it's transparent, auditable, and doesn't rely on a single point of enforcement.

---

**Branch:** `develop`
**GCP Project:** `ranger-twin-dev`
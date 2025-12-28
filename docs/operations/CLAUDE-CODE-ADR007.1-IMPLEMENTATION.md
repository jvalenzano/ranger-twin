# Execute ADR-007.1: Three-Layer Tool Invocation Implementation

> **Purpose:** Implementation prompt for Claude Code
> **Reference:** [ADR-007.1](../adr/ADR-007.1-tool-invocation-strategy.md)
> **Date:** December 28, 2025

---

## Context

We've confirmed that `mode="ANY"` causes infinite loops by design. We're implementing a three-layer enforcement pattern instead:

- **Tier 1:** `mode="AUTO"` (eliminates loop)
- **Tier 2:** ReAct instructions (90% first-pass success)
- **Tier 3:** ToolInvocationValidator (99% combined reliability)

Reference ADR: `docs/adr/ADR-007.1-tool-invocation-strategy.md`

---

## Critical Code Corrections (Apply to ALL agents)

1. **Change `mode="ANY"` to `mode="AUTO"`**
2. **Remove `allowed_function_names`** (only valid with mode="ANY")
3. **Fix callback signature:** `tool_response` not `response`
4. **Use async generator pattern:** `async for event in agent.run_async()`

---

## Implementation Order

1. **Create shared infrastructure** (`agents/shared/`)
2. **Trail Assessor** - Apply three-layer pattern, test
3. **Burn Analyst** - Apply pattern
4. **Cruising Assistant** - Apply pattern  
5. **NEPA Advisor** - Apply pattern
6. **Coordinator** - Apply pattern (mode="AUTO", **NO** validation layer)

---

## Files to Create

```
agents/shared/
├── __init__.py
├── config.py          # Shared GENERATE_CONTENT_CONFIG
├── callbacks.py       # Audit callback factory
├── classifier.py      # QueryIntentClassifier class
└── validation.py      # ToolInvocationValidator class
```

### `config.py` - Shared Configuration

```python
"""Shared configuration for RANGER agents (ADR-007.1)"""
from google.genai import types

# =============================================================================
# TIER 1: API-LEVEL CONFIGURATION
# =============================================================================

TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="AUTO"  # NOT "ANY" - allows synthesis after tool calls
        # No allowed_function_names (only valid with mode="ANY")
    )
)

GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    tool_config=TOOL_CONFIG,
    temperature=0.1,  # Low temperature for deterministic tool selection
)
```

### `callbacks.py` - Audit Callback Factory

```python
"""Audit callbacks for federal compliance (ADR-007.1 Tier 3)"""
import logging
from datetime import datetime, timezone
from typing import List, Dict, Callable, Tuple

def create_audit_callbacks(
    agent_name: str,
    tools_tracker: List[str],
    execution_log: List[Dict]
) -> Tuple[Callable, Callable, Callable]:
    """
    Create audit callbacks that track tool invocations.
    
    Args:
        agent_name: Name of the agent for logging
        tools_tracker: List to append invoked tool names (mutable)
        execution_log: List to append execution records (mutable)
    
    Returns:
        Tuple of (before_callback, after_callback, error_callback)
    """
    logger = logging.getLogger(f"ranger.{agent_name}")
    
    def before_tool_audit(tool, args, tool_context):
        """Log tool invocation for audit trail."""
        tool_name = tool.__name__ if callable(tool) else str(tool)
        tools_tracker.append(tool_name)
        
        entry = {
            "event": "TOOL_INVOCATION",
            "agent": agent_name,
            "tool": tool_name,
            "args_keys": list(args.keys()) if isinstance(args, dict) else [],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        execution_log.append(entry)
        logger.info("TOOL_INVOCATION", extra=entry)
        return None
    
    def after_tool_audit(tool, args, tool_context, tool_response):
        """Log tool response for audit trail."""
        tool_name = tool.__name__ if callable(tool) else str(tool)
        
        status = tool_response.get("status", "unknown") if isinstance(tool_response, dict) else "unknown"
        confidence = tool_response.get("confidence", 0) if isinstance(tool_response, dict) else 0
        data_sources = tool_response.get("data_sources", []) if isinstance(tool_response, dict) else []
        
        entry = {
            "event": "TOOL_RESPONSE",
            "agent": agent_name,
            "tool": tool_name,
            "status": status,
            "confidence": confidence,
            "data_sources": data_sources,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        execution_log.append(entry)
        logger.info("TOOL_RESPONSE", extra=entry)
        return None
    
    def on_tool_error_audit(tool, args, tool_context, error):
        """Log tool errors for audit trail."""
        tool_name = tool.__name__ if callable(tool) else str(tool)
        
        entry = {
            "event": "TOOL_ERROR",
            "agent": agent_name,
            "tool": tool_name,
            "error": str(error)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        execution_log.append(entry)
        logger.error("TOOL_ERROR", extra=entry)
        
        return {
            "status": "error",
            "error_message": f"Tool execution failed: {str(error)}",
            "confidence": 0.0,
            "data_sources": [],
            "recommendations": ["Please try again or contact support."]
        }
    
    return before_tool_audit, after_tool_audit, on_tool_error_audit
```

### `classifier.py` - Query Intent Classifier

```python
"""Query intent classification for tool requirement mapping (ADR-007.1 Tier 3)"""
import logging
from typing import Dict, List, Optional

logger = logging.getLogger("ranger.classifier")

class QueryIntentClassifier:
    """
    Classify query intent to determine required tools.
    Keyword-based for Phase 1; upgrade to semantic classification in Phase 2.
    """
    
    # General queries that don't require tool invocation
    GENERAL_KEYWORDS = [
        "help", "what can you", "who are you", "hello", "hi", 
        "thanks", "thank you", "bye", "goodbye"
    ]
    
    def __init__(self, tool_mappings: Dict[str, Dict]):
        """
        Args:
            tool_mappings: Dict mapping categories to config:
                {
                    "damage": {
                        "keywords": ["damage", "severity", ...],
                        "tools": ["classify_damage"],
                        "weight": 1.0
                    },
                    "default": {
                        "tools": ["classify_damage"]
                    }
                }
        """
        self.tool_mappings = tool_mappings
    
    def classify(self, query: str) -> Optional[List[str]]:
        """
        Determine required tools based on query.
        
        Returns:
            List of required tool names, or None for general queries
        """
        query_lower = query.lower()
        
        # Check for general/help queries (no tool needed)
        if any(kw in query_lower for kw in self.GENERAL_KEYWORDS):
            logger.debug(f"Query classified as GENERAL (no tools required)")
            return None
        
        # Score each category
        scores = {}
        for category, config in self.tool_mappings.items():
            if category == "default":
                continue
            keywords = config.get("keywords", [])
            weight = config.get("weight", 1.0)
            matches = sum(1 for kw in keywords if kw in query_lower)
            if matches > 0:
                scores[category] = matches * weight
        
        # Return tools for best match, or default
        if scores:
            best = max(scores, key=scores.get)
            tools = self.tool_mappings[best]["tools"]
            logger.debug(f"Query classified as '{best}' → {tools}")
            return tools
        
        # Fall back to default
        default_tools = self.tool_mappings.get("default", {}).get("tools", [])
        if default_tools:
            logger.debug(f"Query classified as DEFAULT → {default_tools}")
            return default_tools
        
        return None
```

### `validation.py` - Tool Invocation Validator

```python
"""Post-response validation for tool invocation compliance (ADR-007.1 Tier 3)"""
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from google.genai import types

from .callbacks import create_audit_callbacks
from .classifier import QueryIntentClassifier

logger = logging.getLogger("ranger.validation")

class ToolInvocationValidator:
    """
    Post-response validation ensuring tool invocation compliance.
    Achieves 99% reliability when combined with Tier 2 instructions.
    """
    
    def __init__(self, agent, classifier: QueryIntentClassifier, max_retries: int = 2):
        """
        Args:
            agent: The ADK agent to wrap
            classifier: QueryIntentClassifier for determining required tools
            max_retries: Number of retry attempts before escalation
        """
        self.agent = agent
        self.classifier = classifier
        self.max_retries = max_retries
        
        # Tracking state (reset per invocation)
        self.tools_invoked_this_turn: List[str] = []
        self.tool_execution_log: List[Dict] = []
    
    def get_callbacks(self):
        """Get audit callbacks wired to this validator's tracking state."""
        return create_audit_callbacks(
            agent_name=self.agent.name if hasattr(self.agent, 'name') else "unknown",
            tools_tracker=self.tools_invoked_this_turn,
            execution_log=self.tool_execution_log
        )
    
    async def invoke_with_enforcement(
        self,
        query: str,
        user_id: str = "ranger",
        session_id: str = "session"
    ) -> Dict[str, Any]:
        """
        Invoke agent with guaranteed tool invocation or explicit failure.
        
        Args:
            query: User query
            user_id: User identifier for ADK session
            session_id: Session identifier for ADK session
            
        Returns:
            {
                "success": bool,
                "response": agent_response,
                "tools_invoked": List[str],
                "attempts": int,
                "validation_outcome": "PASSED" | "RETRY_SUCCEEDED" | "ESCALATED" | "SKIPPED",
                "audit_trail": List[dict]
            }
        """
        # Determine required tools from query intent
        required_tools = self.classifier.classify(query)
        
        # Skip validation for general queries
        if required_tools is None:
            self._reset_tracking()
            response = await self._run_agent(query, user_id, session_id)
            return {
                "success": True,
                "response": response,
                "tools_invoked": self.tools_invoked_this_turn.copy(),
                "attempts": 1,
                "validation_outcome": "SKIPPED",
                "audit_trail": self.tool_execution_log.copy()
            }
        
        audit_trail = []
        
        for attempt in range(1, self.max_retries + 2):
            # Reset tracking for this attempt
            self._reset_tracking()
            
            # Build query (add enforcement on retry)
            effective_query = self._build_query(query, required_tools, attempt)
            
            # Run agent
            try:
                response = await self._run_agent(effective_query, user_id, session_id)
            except Exception as e:
                logger.error(f"Agent invocation failed: {e}")
                return self._error_response(str(e), attempt, audit_trail)
            
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
                    "tools_invoked": self.tools_invoked_this_turn.copy(),
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
            "tools_invoked": self.tools_invoked_this_turn.copy(),
            "attempts": self.max_retries + 1,
            "validation_outcome": "ESCALATED",
            "audit_trail": audit_trail,
            "escalation_reason": f"Required tools not invoked: {missing_tools}",
            "recommended_action": "HUMAN_REVIEW"
        }
    
    def _reset_tracking(self):
        """Reset tracking state for new invocation."""
        self.tools_invoked_this_turn = []
        self.tool_execution_log = []
    
    async def _run_agent(self, query: str, user_id: str, session_id: str):
        """Run agent and collect final response."""
        content = types.Content(role='user', parts=[types.Part(text=query)])
        
        final_response = None
        async for event in self.agent.run_async(
            user_id=user_id, 
            session_id=session_id, 
            new_message=content
        ):
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
    
    def _error_response(self, error: str, attempt: int, audit_trail: List) -> Dict:
        """Generate error response."""
        return {
            "success": False,
            "response": None,
            "tools_invoked": [],
            "attempts": attempt,
            "validation_outcome": "ERROR",
            "audit_trail": audit_trail,
            "escalation_reason": error,
            "recommended_action": "RETRY"
        }
```

---

## Files to Modify

- `agents/trail_assessor/agent.py`
- `agents/burn_analyst/agent.py`
- `agents/cruising_assistant/agent.py`
- `agents/nepa_advisor/agent.py`
- `agents/coordinator/agent.py`

---

## Per-Agent Checklist

For each specialist agent:

- [ ] Import shared modules from `agents.shared`
- [ ] Tier 1: Use `GENERATE_CONTENT_CONFIG` from shared config
- [ ] Tier 2: Update instruction to ReAct pattern (THINK → CALL → REASON → RESPOND)
- [ ] Tier 3: Create `QueryIntentClassifier` with agent-specific tool mappings
- [ ] Tier 3: Create `ToolInvocationValidator` wrapping the agent
- [ ] Register audit callbacks with correct signatures
- [ ] No LoopAgent wrapper (direct LlmAgent)

For Coordinator:

- [ ] Import shared config
- [ ] Tier 1: Use `GENERATE_CONTENT_CONFIG`
- [ ] Tier 2: Update instruction to ReAct pattern
- [ ] **NO Tier 3** (no validation layer - routing flexibility required)
- [ ] Register audit callbacks for logging only

---

## Tool Mappings by Agent

### Trail Assessor
```python
TOOL_MAPPINGS = {
    "damage": {
        "keywords": ["damage", "severity", "burn", "burned", "impact", "destroyed", "condition"],
        "tools": ["classify_damage"],
        "weight": 1.0
    },
    "closure": {
        "keywords": ["closure", "closed", "reopen", "safe", "access", "open", "passable"],
        "tools": ["evaluate_closure"],
        "weight": 1.0
    },
    "priority": {
        "keywords": ["priority", "prioritize", "urgent", "first", "order", "rank", "important"],
        "tools": ["prioritize_trails"],
        "weight": 0.9
    },
    "default": {
        "tools": ["classify_damage"]
    }
}
```

### Burn Analyst
```python
TOOL_MAPPINGS = {
    "severity": {
        "keywords": ["severity", "burn", "fire", "damage", "impact", "intense"],
        "tools": ["assess_severity"],
        "weight": 1.0
    },
    "classification": {
        "keywords": ["classify", "classification", "mtbs", "category", "type"],
        "tools": ["classify_mtbs"],
        "weight": 1.0
    },
    "boundary": {
        "keywords": ["boundary", "perimeter", "edge", "extent", "area"],
        "tools": ["validate_boundary"],
        "weight": 0.9
    },
    "default": {
        "tools": ["assess_severity"]
    }
}
```

### Cruising Assistant
```python
TOOL_MAPPINGS = {
    "volume": {
        "keywords": ["volume", "timber", "board feet", "mbf", "estimate", "quantity"],
        "tools": ["estimate_volume"],
        "weight": 1.0
    },
    "salvage": {
        "keywords": ["salvage", "harvest", "recover", "viable", "marketable"],
        "tools": ["assess_salvage"],
        "weight": 1.0
    },
    "methodology": {
        "keywords": ["method", "methodology", "approach", "technique", "cruise"],
        "tools": ["recommend_methodology"],
        "weight": 0.9
    },
    "csv": {
        "keywords": ["csv", "data", "file", "import", "analyze"],
        "tools": ["analyze_csv_data"],
        "weight": 0.8
    },
    "default": {
        "tools": ["estimate_volume"]
    }
}
```

### NEPA Advisor
```python
TOOL_MAPPINGS = {
    "pathway": {
        "keywords": ["pathway", "nepa", "ce", "ea", "eis", "categorical", "exclusion", "assessment"],
        "tools": ["decide_pathway"],
        "weight": 1.0
    },
    "timeline": {
        "keywords": ["timeline", "schedule", "duration", "how long", "time"],
        "tools": ["estimate_compliance_timeline"],
        "weight": 1.0
    },
    "checklist": {
        "keywords": ["checklist", "documentation", "requirements", "documents", "needed"],
        "tools": ["generate_documentation_checklist"],
        "weight": 0.9
    },
    "search": {
        "keywords": ["regulation", "search", "find", "look up", "fsm", "fsh", "policy"],
        "tools": ["search_regulatory_documents"],
        "weight": 0.9
    },
    "default": {
        "tools": ["decide_pathway"]
    }
}
```

---

## Testing After Each Agent

```bash
# Setup
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)

# Test agent (after updates)
cd agents && adk run {agent_name}

# Test queries
# Domain query (should invoke tool):
"What is the damage classification for Cedar Creek trails?"

# General query (should skip validation):
"Hello, what can you help me with?"

# Expected: 
# - Tool invocation in logs for domain queries
# - Final response returned
# - NO infinite loop
```

---

## Git Commits

Commit after each milestone:

### After shared infrastructure:
```
feat(agents): add shared infrastructure for ADR-007.1 three-layer pattern

- config.py: Shared GENERATE_CONTENT_CONFIG with mode="AUTO"
- callbacks.py: Audit callback factory for federal compliance
- classifier.py: QueryIntentClassifier for tool requirement mapping
- validation.py: ToolInvocationValidator with retry logic

Implements ADR-007.1 three-layer tool invocation strategy
```

### After each agent:
```
feat({agent}): implement ADR-007.1 three-layer tool invocation

- Tier 1: mode="AUTO" eliminates infinite loop
- Tier 2: ReAct instructions for tool guidance
- Tier 3: ToolInvocationValidator for compliance
- Audit callbacks for federal trail

Supersedes ADR-007 mode="ANY" approach (confirmed design limitation)
```

---

## Success Criteria

- [ ] Shared infrastructure created in `agents/shared/`
- [ ] All 5 agents updated
- [ ] No infinite loops on any query
- [ ] Tool invocations logged via callbacks
- [ ] Validation layer catches non-compliance on domain queries
- [ ] General queries bypass validation (classifier returns None)
- [ ] All agents pass smoke test via ADK CLI

---

## Begin Implementation

Start with creating `agents/shared/` infrastructure, then Trail Assessor.
Report results before proceeding to next agent.

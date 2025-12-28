# Session Warmup: ADR-007.1 Implementation

> **Purpose:** Context priming for ADR-007.1 implementation session  
> **Project:** RANGER - AI-Powered Forest Recovery System  
> **Focus:** Three-Layer Tool Invocation Pattern Implementation  
> **Date:** December 29, 2025

---

## Quick Context Reload

RANGER is a **multi-agent AI system** for USDA Forest Service post-fire recovery, built on **Google ADK with Gemini 2.0 Flash**. You're the CTO overseeing implementation of the Skills-First architecture (ADR-005).

### What Happened Last Session

We discovered that `mode="ANY"` in `FunctionCallingConfig` creates an **infinite loop** by design—it's intended for single-turn tool invocation, not conversational agents that need to synthesize responses.

**Expert panel research confirmed:**
- `mode="ANY"` = every response MUST contain tool call (including synthesis)
- This is a design limitation, not a bug
- Google's recommended pattern: `mode="AUTO"` + explicit completion mechanisms

**We created ADR-007.1** specifying a three-layer enforcement pattern:
- **Tier 1:** `mode="AUTO"` (eliminates loop)
- **Tier 2:** ReAct instructions (~90% first-pass success)
- **Tier 3:** ToolInvocationValidator (~99% combined reliability)

---

## Current State

### Completed ✅
- ADR-007.1 drafted and accepted
- Three-layer pattern validated by expert panel
- Code corrections identified (async pattern, callback signatures)
- Implementation prompt prepared for Claude Code

### Ready to Execute 🔄
- Apply three-layer pattern to all 5 agents
- Create shared validation infrastructure
- Test each agent for loop elimination

### Pending ⏳
- MCP Server Readiness (Sub-Agent 2 working on this)
- SSE Proof Layer Streaming (Sub-Agent 3 working on this)
- Cloud Run deployment
- UI integration

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `docs/adr/ADR-007.1-tool-invocation-strategy.md` | Architecture decision | ✅ Created |
| `docs/operations/CLAUDE-CODE-ADR007.1-IMPLEMENTATION.md` | Implementation prompt | ✅ Created |
| `agents/shared/validation.py` | ToolInvocationValidator | ⏳ To create |
| `agents/shared/classifier.py` | QueryIntentClassifier | ⏳ To create |
| `agents/shared/callbacks.py` | Audit callback factory | ⏳ To create |
| `agents/trail_assessor/agent.py` | First agent to update | ⏳ Ready |
| `agents/burn_analyst/agent.py` | Second agent | ⏳ Ready |
| `agents/cruising_assistant/agent.py` | Third agent | ⏳ Ready |
| `agents/nepa_advisor/agent.py` | Fourth agent | ⏳ Ready |
| `agents/coordinator/agent.py` | Fifth agent (no validation) | ⏳ Ready |

---

## Three-Layer Implementation Checklist

### Shared Infrastructure (Create First)

```
agents/shared/
├── __init__.py
├── config.py          # Shared GENERATE_CONTENT_CONFIG
├── callbacks.py       # Audit callback factory
├── classifier.py      # QueryIntentClassifier  
└── validation.py      # ToolInvocationValidator
```

### Per-Agent Updates

| Agent | Tier 1 | Tier 2 | Tier 3 | Status |
|-------|--------|--------|--------|--------|
| Trail Assessor | mode="AUTO" | ReAct instructions | Validator + classifier | ⏳ |
| Burn Analyst | mode="AUTO" | ReAct instructions | Validator + classifier | ⏳ |
| Cruising Assistant | mode="AUTO" | ReAct instructions | Validator + classifier | ⏳ |
| NEPA Advisor | mode="AUTO" | ReAct instructions | Validator + classifier | ⏳ |
| Coordinator | mode="AUTO" | ReAct instructions | **None** (routing flexibility) | ⏳ |

---

## Critical Code Patterns

### Tier 1: API Config
```python
TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="AUTO"  # NOT "ANY"
    )
)
```

### Tier 3: Async Invocation (CORRECTED)
```python
# WRONG (causes issues)
response = await self.agent.run(query)

# CORRECT (async generator pattern)
async for event in self.agent.run_async(user_id="ranger", session_id="session", new_message=content):
    if event.is_final_response():
        final_response = event
```

### Callback Signature (CORRECTED)
```python
# WRONG
def after_tool_audit(tool, args, tool_context, response):

# CORRECT  
def after_tool_audit(tool, args, tool_context, tool_response):
```

---

## Testing Commands

```bash
# Setup
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)

# Test agent (after updates)
cd agents && adk run trail_assessor

# Test queries
"What is the damage classification for Cedar Creek trails?"  # Should invoke classify_damage
"Hello, what can you help me with?"  # Should NOT require tool (general query)

# Expected: Tool invocation logged, final response returned, NO infinite loop
```

---

## Success Criteria

1. ✅ Shared infrastructure created (`agents/shared/`)
2. ✅ All 5 agents updated with three-layer pattern
3. ✅ No infinite loops on any query
4. ✅ Tool invocations logged via callbacks
5. ✅ Validation layer catches non-compliance on domain queries
6. ✅ General queries bypass validation (no false enforcement)
7. ✅ All agents pass smoke test via ADK CLI

---

## Parallel Workstreams Status

| Sub-Agent | Task | Status |
|-----------|------|--------|
| #1 (Primary) | ADR-007.1 Implementation | 🔄 Ready to execute |
| #2 | MCP Server Readiness Audit | 🔄 In progress |
| #3 | SSE Proof Layer Spike | 🔄 In progress |

---

## Questions Resolved from Last Session

| Question | Resolution |
|----------|------------|
| Does `mode="ANY"` work for conversational agents? | ❌ No - infinite loop by design |
| Do we need LoopAgent? | ❌ No - Direct LlmAgent sufficient for single-turn |
| How to extract invoked tools? | Via audit callbacks, not response parsing |
| Correct async pattern? | `async for event in agent.run_async()` |

---

## Ready to Execute

The implementation prompt is at: `docs/operations/CLAUDE-CODE-ADR007.1-IMPLEMENTATION.md`

Begin with:

1. Create `agents/shared/` infrastructure
2. Update Trail Assessor (validate pattern works)
3. Proceed to remaining agents
4. Commit incrementally with proper messages

**Let's ship ADR-007.1.**

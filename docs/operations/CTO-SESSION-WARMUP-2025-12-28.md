# CTO Session Warmup: December 28, 2025

> **Purpose:** Context priming for CTO advisory session continuation  
> **Project:** RANGER - AI-Powered Forest Recovery System  
> **Focus:** ADR-007 Implementation - Three-Tier Tool Invocation Strategy

---

## Quick Context Reload

RANGER is a **multi-agent AI system** for USDA Forest Service post-fire recovery, built on **Google ADK with Gemini 2.0 Flash**. You're the CTO overseeing the implementation of a Skills-First architecture (ADR-005).

### The Problem We Solved Yesterday

**Issue:** Gemini agents weren't reliably invoking their registered tools. Instead of calling `classify_damage()` to get actual trail data, agents responded with generic text like "I don't have damage data for that trail."

**Root Cause:** Instruction-level enforcement ("YOU MUST CALL tools") is probabilistic (~85-90% reliability). Gemini treats instructions as guidance, not law.

**Solution (ADR-007):** Three-Tier Tool Invocation Strategy

| Tier | Mechanism | Purpose |
|------|-----------|---------|
| **1** | `mode="ANY"` in ToolConfig | API rejects text-only responses (99.5%+ reliability) |
| **2** | ReAct pattern instructions | THINK→CALL→REASON→RESPOND transparency |
| **3** | Audit callbacks | before/after/error logging for federal compliance |

---

## Current State

### Completed ✅
- Phase A: Proved tools work locally (scripts execute, tools registered)
- ADR-007 created and accepted
- Reference implementation created: `docs/operations/trail_assessor_three_tier_reference.py`
- Deployment plan updated to version 2.0

### In Progress 🔄
- Phase B: Applying three-tier pattern to all specialist agents
- Claude Code was updating agents when we paused for expert panel review

### Pending ⏳
- Phase C: MCP connectivity
- Phase D: Cloud Run redeployment
- Phase E: UI integration

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/adr/ADR-007-tool-invocation-strategy.md` | Architecture decision record |
| `docs/operations/trail_assessor_three_tier_reference.py` | Template for all agents |
| `docs/operations/DEPLOYMENT-READINESS-PLAN.md` | Master execution plan (v2.0) |
| `agents/trail_assessor/agent.py` | Current agent (needs three-tier update) |
| `agents/burn_analyst/agent.py` | Second agent to update |
| `agents/cruising_assistant/agent.py` | Third agent to update |
| `agents/nepa_advisor/agent.py` | Fourth agent to update |
| `agents/coordinator/agent.py` | Uses `mode="AUTO"` (routing flexibility) |

---

## The Three-Tier Implementation Pattern

### Tier 1: API-Level Enforcement
```python
from google.genai import types

generate_content_config=types.GenerateContentConfig(
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(
            mode="ANY",  # CRITICAL: API rejects text-only responses
            allowed_function_names=["tool1", "tool2", "tool3"]
        )
    )
)
```

### Tier 2: Structured Reasoning Instructions
```python
instruction="""
THINK: Identify what data you need
CALL: Execute the appropriate tool (system enforces this)
REASON: Interpret the response (confidence, source, limitations)
RESPOND: Ground your answer in tool data
"""
```

### Tier 3: Audit Callbacks
```python
before_tool_callback=audit_invocation,
after_tool_callback=audit_response,
on_tool_error_callback=graceful_error_handler,
```

---

## Agent Update Checklist

| Agent | Mode | Tools to Whitelist | Status |
|-------|------|-------------------|--------|
| Trail Assessor | `ANY` | classify_damage, evaluate_closure, prioritize_trails | ⏳ |
| Burn Analyst | `ANY` | assess_severity, classify_mtbs, validate_boundary | ⏳ |
| Cruising Assistant | `ANY` | estimate_volume, assess_salvage, recommend_methodology, analyze_csv | ⏳ |
| NEPA Advisor | `ANY` | decide_pathway, estimate_timeline, generate_checklist, search_regulatory_documents | ⏳ |
| Coordinator | `AUTO` | (routing tools, no enforcement) | ⏳ |

---

## Testing Commands

```bash
# Setup
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)

# Test single agent
cd agents && adk run trail_assessor

# Test query
"What is the damage classification for Cedar Creek fire?"

# Expected: classify_damage tool invocation visible, specific damage data returned
```

---

## Success Criteria for This Session

1. ✅ All 4 specialist agents updated with three-tier pattern
2. ✅ Coordinator configured with `mode="AUTO"`
3. ✅ At least one agent tested via ADK CLI showing tool invocation
4. ✅ Changes committed to feature branch with proper Git management
5. ✅ Deployment plan updated with completion status

---

## Questions to Consider

1. Should we test each agent individually before moving to the next, or batch the updates?
2. Do we need to handle the case where `generate_content_config` isn't passed through ADK to the model?
3. What's the fallback if `mode="ANY"` isn't supported in our ADK version?

---

**Ready to continue implementation with Claude Code.**

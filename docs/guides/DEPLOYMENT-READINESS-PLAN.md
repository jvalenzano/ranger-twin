# RANGER Deployment Readiness Plan

> **Single Source of Truth** for getting RANGER from "agents exist" to "agents work"

**Version:** 2.0  
**Date:** December 27, 2025  
**Status:** Active — Updated with Three-Tier Tool Invocation Strategy  
**Owner:** CTO, TechTrend Federal

---

## Executive Summary

RANGER has working infrastructure but **hollow intelligence**. The agents route correctly, the UI streams properly, but Gemini wasn't invoking the tools reliably. 

**Root Cause:** Instruction-level enforcement ("MUST call tool") is probabilistic (~85-90% reliability).

**Solution (ADR-007):** Three-Tier Tool Invocation Strategy using API-level enforcement (`mode="ANY"`) for 99.5%+ reliability.

---

## Progress Tracker

| Phase | Status | Date | Notes |
|-------|--------|------|-------|
| **Phase A: Prove Tools Work Locally** | ✅ COMPLETE | Dec 27, 2025 | Tools execute correctly in isolation |
| **Phase B: Force Tool Invocation** | 🔄 REVISED | Dec 27, 2025 | Expert panel recommends API-level enforcement |
| **Phase C: Connect MCP** | ⏳ PENDING | — | MCP server exists, needs agent wiring |
| **Phase D: Deploy to Cloud Run** | ⏳ PENDING | — | Services deployed but need updates |
| **Phase E: UI Integration** | ⏳ PENDING | — | Event transformer ready |

---

## Key Architecture Decision (ADR-007)

### Three-Tier Tool Invocation Strategy

**Tier 1: API-Level Enforcement (Technical Guarantee)**
```python
generate_content_config=types.GenerateContentConfig(
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(
            mode="ANY",  # API rejects text-only responses
            allowed_function_names=["classify_damage", "evaluate_closure", "prioritize_trails"]
        )
    )
)
```

**Tier 2: Structured Reasoning (Transparency)**
```python
instruction="""
THINK: Identify what data you need
CALL: Execute the appropriate tool (system enforces this)
REASON: Interpret the response
RESPOND: Ground your answer in tool data
"""
```

**Tier 3: Audit Trail (Compliance)**
- `before_tool_callback`: Log invocation
- `after_tool_callback`: Log response with confidence/sources
- `on_tool_error_callback`: Graceful error handling

### Why This Matters

| Factor | Instruction-Only (Before) | API-Level (After) |
|--------|--------------------------|-------------------|
| Reliability | ~85-90% | 99.5%+ |
| Enforcement | Probabilistic | Deterministic |
| Audit Evidence | "Model chose to call" | "System enforced" |
| Federal Defensibility | ⚠️ Weak | ✅ Strong |

---

## Implementation Plan (Revised)

### Phase B: Implement Three-Tier Pattern 🔄 IN PROGRESS

**Reference Implementation:** `docs/operations/trail_assessor_three_tier_reference.py`

#### B.1: Update Trail Assessor

Replace `agents/trail_assessor/agent.py` with three-tier pattern:

```python
from google.adk.agents import Agent
from google.genai import types

root_agent = Agent(
    name="trail_assessor",
    model="gemini-2.0-flash",
    instruction=STRUCTURED_REASONING_INSTRUCTION,
    tools=[classify_damage, evaluate_closure, prioritize_trails],
    
    # TIER 1: API-level enforcement
    generate_content_config=types.GenerateContentConfig(
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(
                mode="ANY",
                allowed_function_names=["classify_damage", "evaluate_closure", "prioritize_trails"]
            )
        )
    ),
    
    # TIER 3: Audit callbacks
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)
```

#### B.2: Update All Specialist Agents

| Agent | File | Mode | Allowed Tools |
|-------|------|------|---------------|
| Trail Assessor | `agents/trail_assessor/agent.py` | `ANY` | classify_damage, evaluate_closure, prioritize_trails |
| Burn Analyst | `agents/burn_analyst/agent.py` | `ANY` | assess_severity, classify_mtbs, validate_boundary |
| Cruising Assistant | `agents/cruising_assistant/agent.py` | `ANY` | estimate_volume, assess_salvage, recommend_methodology |
| NEPA Advisor | `agents/nepa_advisor/agent.py` | `ANY` | decide_pathway, estimate_timeline, generate_checklist, search_regulatory_documents |
| **Coordinator** | `agents/coordinator/agent.py` | `AUTO` | routing flexibility |

#### B.3: Verification Test

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
source ../.venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY coordinator/.env | cut -d'=' -f2)
adk run trail_assessor
```

Query: `"What is the damage classification for Cedar Creek fire?"`

**Success Criteria:**
- [ ] Tool call visible in ADK output (`classify_damage` invoked)
- [ ] Response includes specific damage points (WL-001, BL-001)
- [ ] Confidence from tool (90%), not hardcoded
- [ ] Audit log entries present

---

### Phase C: Connect MCP ⏳ PENDING

No changes from previous plan. MCP connection happens after tool invocation is verified.

---

### Phase D: Deploy to Cloud Run ⏳ PENDING

Ensure `generate_content_config` with `tool_config` is properly serialized in deployment.

---

### Phase E: UI Integration ⏳ PENDING

Verify audit trail data flows to Proof Layer:
- Confidence from tool → displayed in UI
- Data sources from tool → citation chips
- Reasoning chain → expandable reasoning panel

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/adr/ADR-007-tool-invocation-strategy.md` | Architecture decision record |
| `docs/operations/trail_assessor_three_tier_reference.py` | Reference implementation |
| `agents/trail_assessor/agent.py` | First agent to update |
| `agents/burn_analyst/agent.py` | Second agent to update |
| `agents/cruising_assistant/agent.py` | Third agent to update |
| `agents/nepa_advisor/agent.py` | Fourth agent to update |
| `agents/coordinator/agent.py` | Coordinator (mode=AUTO) |

---

## Commands Reference

```bash
# Setup
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)

# Test single agent via ADK CLI
cd agents && adk run trail_assessor

# Verify tool_config is accepted
python -c "
from google.genai import types
config = types.GenerateContentConfig(
    tool_config=types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(mode='ANY')
    )
)
print('tool_config valid:', config.tool_config is not None)
"
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `generate_content_config` not passed to model | Verify in ADK source; test with debug logging |
| General questions fail with mode=ANY | Coordinator uses mode=AUTO to route appropriately |
| Tool failures crash agent | on_tool_error_callback provides graceful fallback |
| Audit logs too verbose | Configure log level; use structured logging |

---

## Timeline (Revised)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Day 1 | Phase B.1-B.2 | Trail Assessor + Burn Analyst updated |
| Day 2 | Phase B.2-B.3 | All specialists updated, verification tests |
| Day 3 | Phase C | MCP connectivity verified |
| Day 4 | Phase D | Cloud Run redeployment |
| Day 5 | Phase E | UI integration and demo validation |

---

## Data Layer Consolidation

Pre-deployment checklist for data layer technical debt:

- [ ] TD-001: Burn severity layers consolidated to TiTiler-only

---

## Related Documents

| Document | Status | Purpose |
|----------|--------|---------|
| `ADR-005-skills-first-architecture.md` | ✅ Current | Architecture foundation |
| `ADR-006-google-only-llm-strategy.md` | ✅ Current | LLM strategy |
| `ADR-007-tool-invocation-strategy.md` | ✅ NEW | Three-tier tool invocation |
| `_!_PRODUCT-SUMMARY.md` | ✅ Current | Vision and product positioning |

---

**Document Owner:** CTO, TechTrend Federal  
**Last Updated:** December 27, 2025  
**Version:** 2.0 — Updated with Three-Tier Strategy (ADR-007)

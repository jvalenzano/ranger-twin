# RANGER CTO Synthesis: Agent Coordination Report

**Date:** December 28, 2025
**Status:** Dual-Agent Coordination Required
**Priority:** IMMEDIATE - Unblock Demo Path

---

## Executive Summary

Two Claude Code agents have been working on parallel tracks. This document synthesizes their findings, identifies the true blockers, and provides clear instructions for each agent to move forward.

### The Good News ✅

1. **Documentation is aligned** - Agent 1 completed audit, all docs now reflect AgentTool pattern
2. **Cruising Assistant is fixed** - PL-004 resolved with ADR-009 Fixture-First loading
3. **Infrastructure is working** - Frontend, backend deployed and healthy
4. **Fixtures are bundled** - `data/fixtures/cedar-creek/` and `bootleg/` in Docker image

### The Bad News ❌

**Agent orchestration is failing on deployment.** The End-to-End test revealed:
- Coordinator calls specialist tools
- Specialist tools try to use MCP client (via `agents/shared/mcp_client.py`)
- MCP client fails because `MCP_FIXTURES_URL` not set AND `services/mcp-fixtures/server.py` doesn't exist in the container

### Root Cause

There's an **inconsistency** between how different specialists load data:

| Agent | Skill Data Loading | MCP Toolset Import | Status |
|-------|-------------------|-------------------|--------|
| **burn_analyst** | ✅ `load_fixture_data()` in assess_severity.py | ❌ Imports MCP_TOOLSET | BLOCKED |
| **trail_assessor** | ✅ Skills load fixtures | ❌ Imports MCP_TOOLSET | BLOCKED |
| **cruising_assistant** | ✅ `load_plots_data()`, `load_fire_metadata()` | ❌ Imports MCP_TOOLSET | BLOCKED |
| **nepa_advisor** | ✅ Uses Google File Search | ✅ No MCP import | WORKING |

**Skills work fine! But all 3 data-connected agents import MCP Toolset which fails.**

In `burn_analyst/agent.py`:
```python
try:
    from agents.shared.mcp_client import get_burn_analyst_toolset
    MCP_TOOLSET = get_burn_analyst_toolset()  # <-- This fails!
except ImportError:
    MCP_TOOLSET = None
```

When `MCP_FIXTURES_URL` is not set, it tries stdio transport to a non-existent server.

---

## The Fix Required

**The MCP client is not needed for Phase 1 demo.** Per ADR-009, skills should load bundled fixtures directly. The `mcp_client.py` code was aspirational for Phase 2.

### The Pattern to Remove (in all 3 agents):

```python
# REMOVE this entire block:
try:
    from agents.shared.mcp_client import get_XXX_toolset
    MCP_TOOLSET = get_XXX_toolset()
except ImportError:
    MCP_TOOLSET = None

# REMOVE this from tools list:
*([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
```

### Files to Modify:

1. **`agents/burn_analyst/agent.py`**
   - Remove `from agents.shared.mcp_client import get_burn_analyst_toolset`
   - Remove `MCP_TOOLSET = get_burn_analyst_toolset()`
   - Remove `*([] if MCP_TOOLSET is None else [MCP_TOOLSET]),` from tools

2. **`agents/trail_assessor/agent.py`**
   - Remove `from agents.shared.mcp_client import get_trail_assessor_toolset`
   - Remove `MCP_TOOLSET = get_trail_assessor_toolset()`
   - Remove `*([] if MCP_TOOLSET is None else [MCP_TOOLSET]),` from tools

3. **`agents/cruising_assistant/agent.py`**
   - Remove `from agents.shared.mcp_client import get_cruising_assistant_toolset`
   - Remove `MCP_TOOLSET = get_cruising_assistant_toolset()`
   - Remove `*([] if MCP_TOOLSET is None else [MCP_TOOLSET]),` from tools

4. **`agents/nepa_advisor/agent.py`** - NO CHANGES NEEDED (uses Google File Search, not MCP)

---

## Instructions for Agent 1 (Documentation Agent)

**Your work is COMPLETE.** The documentation audit is finished and well-executed.

### Validation Checklist ✅
- [x] AGENTIC-ARCHITECTURE.md reflects AgentTool pattern
- [x] GCP-DEPLOYMENT.md reflects 2-service deployment
- [x] ADR-007.1, ADR-008, ADR-009 documented
- [x] FIXTURE-DATA-FORMATS.md updated
- [x] Audit report created

### Next Task (Optional)
If idle, you could:
1. Create `docs/runbooks/PHASE1-DEMO-SCRIPT.md` - A step-by-step demo guide
2. Update main `README.md` with current architecture diagram
3. Create `docs/KNOWN-ISSUES.md` for Phase 1 limitations

---

## Instructions for Agent 2 (Testing/Implementation Agent)

**Your work is PARTIALLY COMPLETE. You identified the real issue but need to complete the fix.**

### Immediate Task: Remove MCP Toolset from 3 Agents

The skills already load fixtures directly. We just need to remove the MCP toolset that's causing connection failures.

#### Step 1: Update burn_analyst/agent.py

**Remove lines ~24-29:**
```python
# DELETE THIS:
try:
    from agents.shared.mcp_client import get_burn_analyst_toolset
    MCP_TOOLSET = get_burn_analyst_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None
```

**Update tools list (around line 218):**
```python
# FROM:
tools=[
    *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
    assess_severity,
    classify_mtbs,
    validate_boundary,
],

# TO:
tools=[
    assess_severity,
    classify_mtbs,
    validate_boundary,
],
```

#### Step 2: Update trail_assessor/agent.py

**Remove lines ~25-30:**
```python
# DELETE THIS:
try:
    from agents.shared.mcp_client import get_trail_assessor_toolset
    MCP_TOOLSET = get_trail_assessor_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None
```

**Update tools list (around line 232):**
```python
# FROM:
tools=[
    *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
    classify_damage,
    evaluate_closure,
    prioritize_trails,
],

# TO:
tools=[
    classify_damage,
    evaluate_closure,
    prioritize_trails,
],
```

#### Step 3: Update cruising_assistant/agent.py

**Remove lines ~24-29:**
```python
# DELETE THIS:
try:
    from agents.shared.mcp_client import get_cruising_assistant_toolset
    MCP_TOOLSET = get_cruising_assistant_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None
```

**Update tools list (around line 270):**
```python
# FROM:
tools=[
    *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
    recommend_methodology,
    estimate_volume,
    assess_salvage,
    analyze_csv_data,
],

# TO:
tools=[
    recommend_methodology,
    estimate_volume,
    assess_salvage,
    analyze_csv_data,
],
```

#### Step 4: Verify nepa_advisor/agent.py

The NEPA Advisor uses Google File Search (Managed RAG), NOT MCP. Verify it does NOT import from `mcp_client.py`. It should be clean already.

#### Step 5: Local Test

```bash
cd /Users/jvalenzano/Projects/ranger-twin

# Test each agent individually
python -c "from agents.burn_analyst.agent import root_agent; print('Burn Analyst OK')"
python -c "from agents.trail_assessor.agent import root_agent; print('Trail Assessor OK')"
python -c "from agents.cruising_assistant.agent import root_agent; print('Cruising Assistant OK')"
python -c "from agents.nepa_advisor.agent import root_agent; print('NEPA Advisor OK')"
python -c "from agents.coordinator.agent import root_agent; print('Coordinator OK')"

# Full integration test
cd agents/coordinator
adk run .
# Type: "What is the burn severity for Cedar Creek?"
# Should return data without MCP errors
```

#### Step 6: Deploy and Test

```bash
# Deploy backend
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1 \
  --allow-unauthenticated

# Test API
curl -X POST "https://ranger-coordinator-1058891520442.us-central1.run.app/apps/coordinator/users/test/sessions" \
  -H "Content-Type: application/json" \
  -d '{"id": "test-session"}'

curl -X POST "https://ranger-coordinator-1058891520442.us-central1.run.app/apps/coordinator/users/test/sessions/test-session/runs" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the burn severity for Cedar Creek?"}'
```

### Verification Checklist

After changes:
- [ ] `adk run coordinator` works locally with all 4 specialists
- [ ] "Give me a recovery briefing" calls all 4 specialists without errors
- [ ] Confidence scores vary (not all 75%)
- [ ] Citations include fixture sources
- [ ] Deployed service responds correctly

---

## Architecture Clarification

### What MCP Client Was Supposed To Do (Phase 2)

The `agents/shared/mcp_client.py` was designed to connect agents to an MCP server that provides:
- Dynamic data fetching from NIFC API
- Real-time fire perimeters
- Live weather data
- Federal database queries

### What We're Doing in Phase 1 (Demo)

Per ADR-009 Fixture-First:
- Static fixtures bundled in Docker image
- Skills load JSON files directly from `/app/data/fixtures/`
- No external API calls for demo data
- MCP is completely bypassed

### The Mismatch We Found

- Skills correctly load fixtures directly
- Agent definitions incorrectly try to add MCP toolset to tool list
- When MCP toolset initialization fails, it can cause cascading errors

---

## Current Punch List Status

| ID | Issue | Status | Owner |
|----|-------|--------|-------|
| PL-001 | Profile avatar not rendering | Open (P3) | Frontend |
| PL-002 | Wrong ADK pattern | ✅ Fixed | Agent 2 |
| PL-003 | Confidence scores static | Partially Fixed | Agent 2 |
| PL-004 | Salvage TypeError | ✅ Fixed | Agent 2 |
| **NEW** | MCP Toolset causing agent failures | **OPEN (P0)** | Agent 2 |

---

## Success Criteria for Demo-Ready

1. [ ] Single-domain queries work (burn severity, trail damage, timber, NEPA)
2. [ ] Multi-domain queries work ("recovery briefing")
3. [ ] Coordinator calls all 4 specialists without errors
4. [ ] Response includes confidence scores from each specialist
5. [ ] Proof Layer shows reasoning chain
6. [ ] Demo script runs end-to-end in < 30 seconds

---

## Timeline

| Time | Action |
|------|--------|
| **Now** | Agent 2: Remove MCP toolset from agent definitions |
| **+30 min** | Agent 2: Test locally with `adk run coordinator` |
| **+1 hour** | Agent 2: Redeploy to Cloud Run |
| **+1.5 hours** | Agent 2: End-to-end validation |
| **+2 hours** | Ready for stakeholder demo |

---

*Document created by CTO synthesis from dual-agent reports*

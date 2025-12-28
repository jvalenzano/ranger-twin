# RANGER Punch List

> **Purpose:** Track bugs, UX issues, and improvements discovered during testing
> **Format:** Simple, scannable, actionable

---

## How to Log Issues

```
### [PL-XXX] Short Title
- **Type:** Bug | UX | Enhancement | Performance
- **Severity:** P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Low)
- **Location:** Where in the app
- **Description:** What's wrong
- **Expected:** What should happen
- **Screenshot:** (if applicable)
- **Status:** Open | In Progress | Fixed | Won't Fix
```

---

## Open Issues

### [PL-001] Profile Avatar Not Rendering
- **Type:** Bug
- **Severity:** P3 (Low)
- **Location:** Mission Control → Header (top right)
- **Description:** Profile picture shows broken/missing image icon instead of avatar
- **Expected:** Should show user avatar or default placeholder icon
- **Screenshot:** See initial login screenshot (December 27, 2025)
- **Status:** Open
- **Notes:** Visible on first load of Mission Control view

---

### [PL-002] Recovery Briefing Query Fails - Wrong ADK Pattern
- **Type:** Bug (Architecture)
- **Severity:** P0 (Blocker)
- **Location:** Backend → Agent Orchestration
- **Description:** "Give me a recovery briefing" routes to Burn Analyst which refuses, instead of Coordinator orchestrating all specialists
- **Root Cause:** Using `sub_agents=[]` pattern which transfers control. Should use `AgentTool` wrappers to keep Coordinator in control.
- **Expected:** Coordinator should call all 4 specialist tools and synthesize results
- **Status:** ✅ **Fixed + Deployed**
- **Fix Details:**
  - Refactored `agents/coordinator/agent.py` to use `AgentTool` wrappers
  - Removed `sub_agents` parameter, added tools: `burn_analyst_tool`, `trail_assessor_tool`, etc.
  - Updated system prompt with explicit tool usage guidance
  - Deployed to Cloud Run: revision `ranger-coordinator-00005-l8x`
  - Deployment timestamp: 2025-12-27 21:53 PST
- **Verification Status:** Deployed, awaiting frontend validation
- **Fix Reference:** `docs/adr/ADR-008-agent-tool-pattern.md`, `CRITICAL-FIX-SUMMARY.md`
- **Commit:** 3fb715d
- **Notes:** Expert panel identified this as fundamental ADK pattern mismatch (Dec 27, 2025). See deployment report for smoke test checklist.

---

### [PL-003] Confidence Scores Static at 75%
- **Type:** Bug
- **Severity:** P1 (High)
- **Location:** Chat → Agent Responses
- **Description:** All responses show "75% confidence" regardless of actual skill output
- **Root Cause:** Skills return dynamic confidence (0.85-0.98) but LLM summarizes as text, losing numeric value. Frontend defaults to 0.75 when parsing fails.
- **Expected:** Confidence should reflect actual skill calculations (vary between 0.82-0.98)
- **Status:** Partially Fixed
- **Fix Details:**
  - Updated coordinator system prompt to instruct: "Preserve exact confidence values from specialist outputs"
  - AgentTool pattern (PL-002 fix) ensures tool results flow to coordinator
  - Deployed with revision `ranger-coordinator-00005-l8x`
- **Remaining Work:** Frontend validation to confirm confidence values now vary
- **Fix Reference:** `docs/runbooks/GOOGLE-ADK-RUNBOOK.md` - "Confidence Score Propagation" section
- **Notes:** Should be resolved by PL-002 fix. Verify burn severity queries show 92% confidence (not 75%).

---

### [PL-004] Salvage Assessment TypeError - Missing Fixture Loading
- **Type:** Bug (Data Loading)
- **Severity:** P0 (Blocker)
- **Location:** Backend → Cruising Assistant → Salvage Assessment Skill
- **Description:** "Assess salvage viability" fails with `TypeError: strptime() argument 1 must be str, not None`
- **Root Cause:** Agent wrapper passed `fire_date=None` explicitly, overriding skill's default value. Violated ADR-009 Fixture-First Strategy.
- **Expected:** Skill should load `containment_date` from `incident-metadata.json` fixture when `fire_date` not provided
- **Status:** ✅ **Fixed + Deployed**
- **Fix Details:**
  - Added `load_fire_metadata()` function to load incident-metadata.json fixture
  - Updated `execute()` to load `containment_date` from fixture when `fire_date` missing
  - Fixed agent wrapper to only include params if actually provided (not `None`)
  - Implemented ADR-009 Fixture-First pattern: "Skills load bundled fixtures directly"
  - Deployed to Cloud Run: revision `ranger-coordinator-00008-wkn`
  - Deployment timestamp: 2025-12-28 00:15 PST
- **Verification Status:** Deployed and verified
  - ✅ Local test passes: loads `containment_date='2022-10-14'` from fixture
  - ✅ Returns `confidence=0.91` (dynamic, not static 0.75)
  - ✅ Calculates `months_since_fire=38.4` correctly
  - ✅ No errors in deployment logs
- **Fix Reference:** ADR-009 Fixture-First Development Strategy
- **Commit:** 36d9534
- **Notes:** This validates the user's diagnosis: "We don't need MCP for Phase 1. Skills load fixtures directly." The MCP client was aspirational code that wasn't needed yet.

---

## Fixed Issues

### [PL-002] Recovery Briefing Query Fails - Wrong ADK Pattern ✅
- **Fixed:** 2025-12-27
- **Deployed:** 2025-12-27 21:53 PST (revision ranger-coordinator-00005-l8x)
- **Verification:** Awaiting frontend smoke tests
- **See:** ADR-008, CRITICAL-FIX-SUMMARY.md

---

## Won't Fix / Deferred

*(Issues intentionally not addressing in current phase)*

---

## Issue Statistics

| Status | Count |
|--------|-------|
| Open | 1 |
| Partially Fixed | 1 |
| Fixed (Deployed, Verified) | 2 |
| Won't Fix | 0 |

**Total Issues:** 4
**Resolved:** 2 (50%)

---

**Last Updated:** December 28, 2025 (Post Fixture-First Fix Deployment)

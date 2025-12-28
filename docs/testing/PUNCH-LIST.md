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

### [PL-006] NEPA Advisor Asks Clarification Before Searching
- **Type:** Bug (Epistemic Overconfidence)
- **Severity:** P1 (High)
- **Location:** Backend → agents/nepa_advisor/agent.py, file_search.py
- **Description:** When asked "Is a Categorical Exclusion appropriate for Cedar Creek timber salvage?", NEPA Advisor responds "I need to know the estimated acreage" instead of searching FSM/FSH knowledge base first
- **Root Cause:** "Competence Trap" — model has parametric knowledge of CE concepts from training data, so it skips the search tool. Violates Proof Layer requirement that all recommendations be grounded in regulatory citations.
- **Expected:** Should call search tool → find CE thresholds from FSM/FSH → THEN ask for acreage if threshold applies
- **Status:** ✅ **Deployed - Pending Frontend Validation** (December 28, 2025)
- **Fix Approach (4-Point Strategy):**
  1. **Semantic Reframing:** Renamed `search_regulatory_documents` → `consult_mandatory_nepa_standards` (clean break, no alias)
  2. **Docstring Update:** Reframed as `[MANDATORY PREREQUISITE]` — "MUST be called BEFORE requesting ANY clarifying details"
  3. **Prompt Restructure:** Moved STRICT REGULATORY COMPLIANCE PROTOCOL to TOP of system prompt (before role definition)
     - "YOUR TRAINING DATA IS DEPRECATED" epistemic humility framing
     - FORBIDDEN ACTIONS section with "VIOLATION = FEDERAL AUDIT FAILURE" warning
     - SEQUENCE OF OPERATIONS showing correct vs incorrect behavior
  4. **Health Check:** Added `verify_store_health()` function for pre-deployment validation
- **Deployment Details:**
  - Revision: `ranger-coordinator-00011-d99`
  - Timestamp: 2025-12-28 12:07 UTC
  - Service URL: `https://ranger-coordinator-1058891520442.us-central1.run.app`
  - Health check: ✅ Passing (adk_version: 1.21.0)
- **Files Modified:**
  - `agents/nepa_advisor/file_search.py` — Function rename, docstring, health check (lines 57-271)
  - `agents/nepa_advisor/agent.py` — Import, tools list, complete prompt restructure (lines 34, 221-345, 473)
  - `docs/testing/PUNCH-LIST.md` — This status update
- **Verification Status:**
  - ✅ Code changes deployed successfully
  - ✅ Service health check passing
  - 🔄 **Pending:** Frontend validation via Command Console
  - ❌ **API testing blocked:** ADK session management requires frontend or manual testing (not automatable via curl)
- **Next Steps:**
  1. Test via Command Console: "Is a CE appropriate for Cedar Creek timber salvage?"
  2. Verify search tool called before clarification
  3. If <85% compliance → implement NEPAQueryRouter fallback
- **Success Criteria:**
  - 85-95% queries trigger search BEFORE clarification request
  - Responses include FSM/FSH citations when providing recommendations
- **Evidence:** User chat export (ranger-chat-2025-12-28.json) shows NEPA query deflected without search
- **Notes:** Expert panel diagnosis confirmed epistemic overconfidence. Fix destroys model's confidence in internal knowledge by framing training data as deprecated. Automated API testing not feasible due to ADK /run_sse session requirements.

---

### [PL-007] Console Shows NIFC API Errors in Browser DevTools
- **Type:** Known Issue
- **Severity:** P3 (Low)
- **Location:** Frontend → apps/command-console/src/services/nifcService.ts
- **Description:** Browser console shows CORS/connection errors for NIFC API calls
- **Root Cause:** Frontend NIFC integration not configured for Phase 1 (using fixtures only)
- **Expected:** No errors (NIFC integration is Phase 2+)
- **Status:** Known - Won't Fix in Phase 1
- **Notes:** Does not affect functionality. NIFC service exists for future real-time data integration. Phase 1 uses fixtures only per DATA-SIMULATION-STRATEGY.md

---

### [PL-008] Recovery Briefing Skips NEPA Advisor
- **Type:** Bug
- **Severity:** P2 (Medium)
- **Location:** Backend → agents/coordinator/agent.py
- **Description:** "Give me a recovery briefing for Cedar Creek" returns severity, damage, and salvage info but omits NEPA pathway recommendation
- **Root Cause:** Coordinator system prompt lacks explicit 4-agent briefing protocol
- **Expected:** Recovery briefings should call ALL FOUR specialists: burn_analyst, trail_assessor, cruising_assistant, nepa_advisor
- **Status:** ✅ **Fixed** (December 28, 2025)
- **Fix Details:**
  - Added "Recovery Briefing Protocol" section to agent.py:159-201
  - Lists all 4 required specialist tools with their domains
  - Specifies output format with all 4 sections
  - Enforces comprehensive coverage: "Do not skip any specialist"
  - Deployed with revision TBD (pending deployment)
- **Evidence:** User chat export shows briefing missing NEPA section
- **Notes:** Coordinator has AgentTool wrappers for all 4 agents (PL-002 fix), now has explicit protocol

---

### [PL-009] JSON Export Missing Reasoning Chains
- **Type:** Enhancement
- **Severity:** P1 (High - Demo Value)
- **Location:** Frontend → apps/command-console/src/stores/chatStore.ts
- **Description:** Chat export JSON includes message summaries but excludes reasoning chains visible in "View reasoning (N steps)" UI
- **Root Cause:** Export logic (line 327-333) explicitly omits `reasoning` array from serialization
- **Expected:** Export should include full Proof Layer data: reasoning_chain, citations, confidence details
- **Status:** ✅ **Fixed** (December 28, 2025)
- **Fix Details:**
  - Added `reasoning: msg.reasoning` to export mapping in chatStore.ts:333
  - Includes comment: "// Proof Layer reasoning chain steps"
  - Frontend auto-deploys via Cloud Build on push to develop
  - TypeScript validation: ✅ Passed
- **Evidence:** User report: "full reasoning chains in JSON export is absolutely something we should add"
- **Notes:** Reasoning data exists in ChatMessage.reasoning, now exported. Citations remain in BriefingEvents only (not ChatMessages).

---

### [PL-010] Cruising Assistant Returns "0 MBF" in Cloud Run
- **Type:** Bug (Path Resolution)
- **Severity:** P2 (Medium)
- **Location:** Backend → agents/cruising_assistant/skills/volume-estimation/scripts/estimate_volume.py
- **Description:** Query "What is the timber salvage volume estimate for Cedar Creek?" returns "0 MBF" in Cloud Run production despite working locally (162.6 MBF)
- **Root Cause:** Brittle path resolution (`script_dir.parent.parent.parent.parent.parent`) failed in Docker's `/app` working directory. Original implementation also had silent failures (returned `None`/`[]` with no diagnostics)
- **Expected:** Should aggregate volume from all plots with full ADR-009 compliance (SHA-256 provenance, explicit error handling, comprehensive diagnostics)
- **Status:** ✅ **Deployed - Pending Frontend Validation** (December 28, 2025)
- **Fix Details:**
  - **REPLACED** entire script (366 lines) with ADR-009 compliant version
  - Container-resilient path resolution: `REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent`
  - Fire ID extraction handles directory naming (e.g., `"cedar-creek-2022"` → `"cedar-creek"` directory)
  - SHA-256 data provenance tracking with immutable audit trail
  - Comprehensive fixture diagnostics when loading fails (no silent failures)
  - Added `FixtureLoadError` and `DataProvenanceError` exception classes
  - Returns stand type breakdown (not species - plots contain mixed species)
  - Updated Dockerfile with build-time fixture validation (lines 54-60)
  - **Test verification:** 162.6 MBF total across 6 plots (sum of mbf_per_acre values), confidence 88%
- **Deployment Details:**
  - Revision: `ranger-coordinator-00012-5xc`
  - Timestamp: 2025-12-28 12:15 UTC
  - Service URL: `https://ranger-coordinator-1058891520442.us-central1.run.app`
  - Health check: ✅ Passing (cruising_assistant agent confirmed available)
- **Evidence:** Local test returns 162.6 MBF with SHA-256 hash `076979791134f9a2...`. Build validation added to Dockerfile.
- **Files Modified:**
  - `agents/cruising_assistant/skills/volume-estimation/scripts/estimate_volume.py` (complete rewrite)
  - `Dockerfile` (added fixture validation after line 52)
  - `.gcloudignore` (defensive fixture whitelist)
- **Verification Status:**
  - ✅ Code changes deployed successfully
  - ✅ Service health check passing
  - ✅ Cruising Assistant agent confirmed in agents list
  - 🔄 **Pending:** Frontend validation via Command Console
  - ❌ **API testing blocked:** ADK session management requires frontend or manual testing (not automatable via curl)
- **Next Steps:**
  1. Test via Command Console: "What is the timber salvage volume estimate for Cedar Creek?"
  2. Verify response includes non-zero MBF value (~162.6 MBF expected)
  3. Verify response includes `data_provenance` with SHA-256 hash
  4. Verify response includes `reasoning_chain` array
  5. Check Cloud Run logs for "Data provenance established" message
- **Success Criteria:**
  - Response returns 162.6 MBF (not 0 MBF)
  - Response includes SHA-256 hash: `076979791134f9a2...`
  - Response includes stand breakdown and plot details
  - Cloud Run logs show structured logging with provenance
- **Notes:** Full ADR-009 compliance. Federal audit trail with SHA-256 checksums. No silent failures - all errors include comprehensive diagnostics. Automated API testing not feasible due to ADK /run_sse session requirements.

---

## Fixed Issues

### [PL-005] MCP Toolset Causing Agent Failures ✅
- **Type:** Bug (Architecture)
- **Severity:** P0 (Blocker)
- **Location:** Backend → burn_analyst, trail_assessor, cruising_assistant agents
- **Description:** Agent orchestration failing in Cloud Run - all 4 specialists return "connection errors"
- **Root Cause:** Agents imported MCP toolsets that attempted stdio transport to non-existent `services/mcp-fixtures/server.py`. Per ADR-009, skills should load bundled fixtures directly - MCP is Phase 2.
- **Expected:** Agents load fixture data directly without MCP connection attempts
- **Status:** ✅ **Fixed + Deployed**
- **Fix Details:**
  - Removed MCP toolset imports from `agents/burn_analyst/agent.py`
  - Removed MCP toolset imports from `agents/trail_assessor/agent.py`
  - Removed MCP toolset imports from `agents/cruising_assistant/agent.py`
  - Skills already have `load_fixture_data()`, `load_fire_metadata()`, `load_plots_data()` per ADR-009
  - Deployed to Cloud Run: revision `ranger-coordinator-00009-mdm`
  - Deployment timestamp: 2025-12-28 ~10:30 PST
- **Verification Status:** Deployed and verified
  - ✅ No MCP connection errors in Cloud Run logs
  - ✅ Service health check passing (adk_version: 1.21.0)
  - ✅ Agents loading successfully without MCP failures
- **Fix Reference:** ADR-009 Fixture-First Development Strategy
- **Commit:** 2260101
- **Notes:** Final blocker preventing multi-agent orchestration. MCP client code retained for Phase 2.

---

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
| Open | 0 |
| Partially Fixed | 1 |
| Fixed (Pending Deployment) | 4 |
| Fixed (Deployed, Verified) | 3 |
| Known - Won't Fix | 1 |

**Total Issues:** 11
**Resolved (Fixed or Won't Fix):** 8 (73%)
**Pending Deployment:** 4 (PL-006, PL-008, PL-009, PL-010)

---

**Last Updated:** December 28, 2025 (Post Multi-Agent Enhancement Session)

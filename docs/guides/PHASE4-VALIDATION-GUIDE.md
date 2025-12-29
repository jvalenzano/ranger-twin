# RANGER Phase 4 Validation Guide

**Purpose:** Human-in-the-loop validation of ADK multi-agent workflows
**Audience:** Jason (Developer/Product Owner)
**Date:** December 27, 2025
**Frontend URL:** http://localhost:3000
**Backend URL:** https://ranger-coordinator-1058891520442.us-central1.run.app

---

## How to Use This Guide

Each validation section follows this format:

| Column | Description |
|--------|-------------|
| **Step** | What you physically do (click, type, observe) |
| **Expected Result** | What you should see in the UI |
| **What's Happening** | Technical explanation of the system activity |

This dual-column approach lets you validate functionality while understanding the architecture.

---

## Pre-Flight Checklist

Before starting validation, confirm these prerequisites:

| Check | How to Verify | What It Means |
|-------|---------------|---------------|
| ☐ Frontend running | Browser shows http://localhost:3000 | Vite dev server serving React app |
| ☐ ADK badge visible | Look for "ADK" badge in chat panel header | `VITE_USE_ADK=true` is set in `.env.local` |
| ☐ Connection indicator green | Green dot next to ADK badge | Frontend successfully called `/health` on Cloud Run |
| ☐ Map loads | 3D terrain visible with fire markers | MapTiler API key valid, base layers loading |

**If ADK badge shows "Legacy" or is missing:**
- Check `apps/command-console/.env.local` has `VITE_USE_ADK=true`
- Restart the dev server: `npm run dev`

---

## Validation 1: ADK Connection & Health

**Goal:** Verify frontend-to-backend connectivity through Cloud Run.

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Open browser DevTools (F12) → Network tab | Network panel visible | Preparing to observe HTTP traffic |
| 2. Refresh the page (Cmd+R) | See requests to `ranger-coordinator...run.app` | React app initializing, calling ADK health check |
| 3. Find the `/health` request | Status: 200, Response: `{"status":"healthy","adk_version":"1.21.0",...}` | **adkChatService.healthCheck()** calls Cloud Run. Response confirms ADK 1.21.0 is running with in-memory sessions |
| 4. Check ADK badge color | Green dot = connected | **useChatStore** updates `connectionStatus` state based on health response |

**Technical Deep Dive:**
```
Browser                    Cloud Run (Coordinator)
   │                              │
   │─── GET /health ─────────────>│
   │                              │ FastAPI returns JSON with:
   │                              │ - ADK version (1.21.0)
   │                              │ - Session backend (in-memory)
   │<── 200 OK + JSON ────────────│
   │                              │
   └── Update React state ────────┘
```

The health check runs every 30 seconds to maintain the connection indicator. If Cloud Run scales to zero (cold start), the next request triggers a ~5-8 second startup.

---

## Validation 2: Session Creation

**Goal:** Verify ADK session management works correctly.

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Open DevTools Console tab | Console visible | Preparing to see debug logs |
| 2. Look for session creation log | `[ADK] Session created: <uuid>` | **adkChatService** generates UUID and calls session endpoint |
| 3. In Network tab, find POST to `/apps/coordinator/users/.../sessions` | Status: 200, Response includes `id` field | Cloud Run creates in-memory session object |

**Technical Deep Dive:**
```
Frontend                   Cloud Run                    ADK Runtime
   │                          │                             │
   │── POST /apps/coordinator/│                             │
   │   users/usfs-demo/       │                             │
   │   sessions {}            │                             │
   │                          │── InMemorySessionService ──>│
   │                          │   .create_session()         │
   │                          │<── Session object ──────────│
   │<── 200 {id: "uuid"} ─────│                             │
   │                          │                             │
   └── Store sessionId ───────┘
```

**Why Sessions Matter:**
- ADK tracks conversation history per session
- Each session has isolated state (no cross-user data leakage)
- In-memory sessions reset when Cloud Run restarts (production would use Firestore)

---

## Validation 3: Coordinator Delegation (The Heart of Multi-Agent)

**Goal:** Observe how the Coordinator routes queries to specialist agents.

### Test Query: Burn Severity

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Type in chat: `What is the burn severity for cedar-creek-2022?` | Message appears in chat | React updates `messages` array in chatStore |
| 2. Press Enter or click Send | Loading indicator appears | **streamADK()** opens SSE connection to `/run_sse` |
| 3. Watch Network tab for `/run_sse` request | EventStream type, Status: 200 | Server-Sent Events connection established |
| 4. Observe SSE events in EventStream tab | Multiple `data:` lines streaming | Each line is a JSON event from ADK |
| 5. First agent response appears | "I am transferring you to the burn analyst..." | Coordinator's `delegate_query` tool identified "burn severity" keywords |
| 6. Final response appears | Detailed severity breakdown with percentages | Burn Analyst's `assess_severity` tool executed |

**Technical Deep Dive - The Delegation Flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COORDINATOR AGENT                                    │
│  Model: gemini-2.0-flash                                                    │
│  Tools: delegate_query, portfolio_triage, transfer_to_agent                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Query: "What is the burn severity for cedar-creek-2022?"              │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────────────────────────────────┐                                   │
│  │ Tool Call: delegate_query           │                                   │
│  │ Args: {query: "...", context: {}}   │                                   │
│  └─────────────────────────────────────┘                                   │
│                          │                                                  │
│                          ▼                                                  │
│  Keyword Matching: "burn", "severity" → burn-analyst (confidence: 0.55)    │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────────────────────────────────┐                                   │
│  │ Tool Call: transfer_to_agent        │                                   │
│  │ Args: {agent_name: "burn_analyst"}  │                                   │
│  └─────────────────────────────────────┘                                   │
│                          │                                                  │
└──────────────────────────│──────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BURN ANALYST AGENT                                   │
│  Model: gemini-2.0-flash                                                    │
│  Tools: assess_severity, classify_mtbs, validate_boundary                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Received Query: "What is the burn severity for cedar-creek-2022?"          │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────────────────────────────────┐                                   │
│  │ Tool Call: assess_severity          │                                   │
│  │ Args: {fire_id: "cedar-creek-2022"} │                                   │
│  └─────────────────────────────────────┘                                   │
│                          │                                                  │
│                          ▼                                                  │
│  Load fixtures/cedar-creek/burn-severity.json                              │
│  Calculate severity breakdown, erosion risks                                │
│  Return structured analysis with 92% confidence                            │
│                          │                                                  │
│                          ▼                                                  │
│  Synthesize natural language response                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**SSE Event Types You'll See:**

| Event Pattern | Meaning |
|---------------|---------|
| `"functionCall":{"name":"delegate_query"...}` | Coordinator analyzing which agent should handle query |
| `"functionResponse":{"name":"delegate_query"...}` | Delegation decision made (target_agent, confidence) |
| `"functionCall":{"name":"transfer_to_agent"...}` | Coordinator handing off to specialist |
| `"transferToAgent":"burn_analyst"` | Control transferred to Burn Analyst |
| `"author":"burn_analyst"` | Events now from Burn Analyst agent |
| `"functionCall":{"name":"assess_severity"...}` | Burn Analyst calling skill tool |
| `"text":"The Cedar Creek Fire..."` | Final synthesized response |

---

## Validation 4: Each Specialist Agent

### 4A: Burn Analyst

| Sample Query | Expected Delegation | Key Tool Called |
|--------------|---------------------|-----------------|
| `What is the burn severity for cedar-creek-2022?` | burn-analyst | assess_severity |
| `Classify the MTBS data for Cedar Creek` | burn-analyst | classify_mtbs |
| `Validate the fire boundary for cedar-creek-2022` | burn-analyst | validate_boundary |

**What's Happening:**
- **assess_severity**: Loads `burn-severity.json`, calculates dNBR thresholds (HIGH ≥0.66, MODERATE 0.27-0.66, LOW 0.1-0.27), returns sector-by-sector analysis
- **classify_mtbs**: Assigns MTBS classes 1-4 based on dNBR values
- **validate_boundary**: Checks geometry validity, compares reported vs calculated acreage

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit: `What is the burn severity for cedar-creek-2022?` | Response with 127,341 acres, 63.6% high severity | assess_severity tool loads fixture, applies dNBR thresholds |
| 2. Check for confidence score | "Confidence: 92%" in response | Tool returns `confidence: 0.92` based on data completeness |
| 3. Check for data sources | "Data Sources: MTBS, Imagery date: 2022-09-15" | Tool includes provenance in response |
| 4. Look for sector breakdown | 8 sectors listed with severity, acres, concerns | Each sector processed through classification logic |

---

### 4B: Trail Assessor

| Sample Query | Expected Delegation | Key Tool Called |
|--------------|---------------------|-----------------|
| `What trails need to be closed after Cedar Creek?` | trail-assessor | evaluate_closure |
| `Classify the trail damage for cedar-creek-2022` | trail-assessor | classify_damage |
| `Prioritize trail repairs with a $200k budget` | trail-assessor | prioritize_trails |

**What's Happening:**
- **classify_damage**: Assigns USFS Type I-IV damage categories
- **evaluate_closure**: Calculates risk scores (0-100) for closure decisions
- **prioritize_trails**: Multi-factor ranking based on usage, access, cost-effectiveness

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit: `What trails need to be closed after Cedar Creek fire?` | Agent transfer, then closure recommendations | evaluate_closure calculates risk scores per trail |
| 2. Look for risk scores | Trails listed with OPEN/CLOSED status and scores | Risk formula: base_damage_score + hazard_modifiers + infrastructure_factors |
| 3. Check for Waldo Lake Trail | Should show HIGH risk, CLOSED recommendation | Fixture has severity=5 damage points for this trail |

---

### 4C: Cruising Assistant

| Sample Query | Expected Delegation | Key Tool Called |
|--------------|---------------------|-----------------|
| `What is the salvage potential for cedar-creek-2022?` | cruising-assistant | assess_salvage |
| `Estimate timber volume for the fire area` | cruising-assistant | estimate_volume |
| `What cruise methodology should we use?` | cruising-assistant | recommend_methodology |

**What's Happening:**
- **assess_salvage**: Calculates deterioration timelines by species (Douglas-fir: 12mo blue stain onset)
- **estimate_volume**: Uses PNW volume equations, applies defect deductions
- **recommend_methodology**: Selects cruise protocol based on stand characteristics

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit: `What is the salvage potential for cedar-creek-2022?` | Salvage viability assessment with priority plots | assess_salvage loads timber-plots.json, calculates months since fire |
| 2. Look for urgency indicators | Plots ranked by viability score and urgency | Species-specific decay rates applied (PSME 12mo, TSHE 6mo) |
| 3. Check for volume estimates | MBF (thousand board feet) values | Volume calculated using BAF expansion |

---

### 4D: NEPA Advisor

| Sample Query | Expected Delegation | Key Tool Called |
|--------------|---------------------|-----------------|
| `What NEPA pathway should we use for Cedar Creek?` | nepa-advisor | determine_pathway |
| `What is the compliance timeline?` | nepa-advisor | estimate_timeline |
| `Generate a NEPA checklist` | nepa-advisor | generate_checklist |

**What's Happening:**
- **determine_pathway**: Analyzes project scope to recommend CE, EA, or EIS
- **estimate_timeline**: Calculates milestones based on pathway and project complexity
- **generate_checklist**: Creates compliance documentation checklist

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit: `What NEPA pathway for post-fire recovery at Cedar Creek?` | Pathway recommendation (likely EA for 127k acres) | determine_pathway evaluates acreage, sensitivity, precedent |
| 2. Look for rationale | Explanation of why EA vs CE vs EIS | Decision tree based on project characteristics |

---

## Validation 5: Proof Layer (Reasoning Transparency)

**Goal:** Verify that agent reasoning is visible and traceable.

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit a burn severity query | Response appears with analysis | Agent processes query through tools |
| 2. Look for "reasoning_chain" in response | Step-by-step logic visible | Each tool returns its decision process |
| 3. Check briefing panel (right side) | Events streaming with agent attributions | **ADKEventTransformer** converts SSE to AgentBriefingEvent |
| 4. Click on an event in briefing panel | Expanded view with details | Event contains full context, sources, confidence |

**Example Reasoning Chain:**
```
[
  "Loaded 8 sectors for Cedar Creek Fire (127,341 total acres)",
  "CORE-1 (Central Fire Origin): dNBR 0.81 >= 0.66 -> HIGH severity",
  "NW-1 (Waldo Lake North): dNBR 0.72 >= 0.66 -> HIGH severity",
  "High severity dominates (63.6%) - significant BAER resources needed"
]
```

**Why This Matters:**
For federal AI systems, stakeholders need to understand *why* the AI made a recommendation. The reasoning chain provides:
- Auditability (which data led to which conclusion)
- Trust calibration (see the logic, not just the answer)
- Error detection (spot incorrect reasoning before acting on it)

---

## Validation 6: Error Handling

**Goal:** Verify graceful degradation when things go wrong.

### 6A: Invalid Fire ID

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Submit: `What is the burn severity for nonexistent-fire?` | Error message or clarification request | Tool returns `{"error": "No data found"}` |
| 2. Agent should NOT crash | Conversation continues | Error caught, synthesized into user-friendly message |

### 6B: Network Interruption (Simulated)

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. In DevTools, go to Network tab | Network panel visible | Preparing to throttle |
| 2. Click "Offline" checkbox | Network disabled | Simulating connection loss |
| 3. Submit a query | Error message about connection | Fetch fails, retry logic activates |
| 4. Uncheck "Offline" | Network restored | Should recover on next request |

---

## Validation 7: ADK Mode Toggle

**Goal:** Verify the dual-mode architecture (ADK vs Legacy).

| Step | Expected Result | What's Happening |
|------|-----------------|------------------|
| 1. Find the ADK toggle in chat panel | Toggle or button visible | UI shows current mode |
| 2. Click to switch to Legacy mode | Badge changes to "Legacy" | **useChatStore.toggleADKMode()** called |
| 3. Submit a query in Legacy mode | Response from mock service | **aiBriefingService** handles query locally |
| 4. Compare response quality | Legacy uses simpler mock data | Different service paths active |
| 5. Toggle back to ADK mode | Badge returns to "ADK" | State flips, next query uses Cloud Run |

**Why Dual Mode Exists:**
- **ADK Mode**: Production path using Cloud Run + Gemini + multi-agent orchestration
- **Legacy Mode**: Fallback for demos when Cloud Run is unavailable, or for offline development

---

## Validation Matrix Summary

Use this checklist to confirm all validations passed:

| # | Validation | Status | Notes |
|---|------------|--------|-------|
| 1 | ADK Connection & Health | ☐ Pass / ☐ Fail | |
| 2 | Session Creation | ☐ Pass / ☐ Fail | |
| 3 | Coordinator Delegation | ☐ Pass / ☐ Fail | |
| 4A | Burn Analyst | ☐ Pass / ☐ Fail | |
| 4B | Trail Assessor | ☐ Pass / ☐ Fail | |
| 4C | Cruising Assistant | ☐ Pass / ☐ Fail | |
| 4D | NEPA Advisor | ☐ Pass / ☐ Fail | |
| 5 | Proof Layer | ☐ Pass / ☐ Fail | |
| 6A | Error Handling (Invalid Fire) | ☐ Pass / ☐ Fail | |
| 6B | Error Handling (Network) | ☐ Pass / ☐ Fail | |
| 7 | ADK Mode Toggle | ☐ Pass / ☐ Fail | |

---

## Validation Run: December 26, 2025

**Executor:** Claude Code (automated)
**Backend:** http://localhost:8000 (local ADK orchestrator)
**Frontend:** http://localhost:3000

### Results Summary

| # | Validation | Status | Notes |
|---|------------|--------|-------|
| 1 | ADK Connection & Health | ✅ Pass | `/health` returns `{"status":"healthy","adk_version":"1.21.0"}` |
| 2 | Session Creation | ✅ Pass | Sessions created, server-assigned IDs captured |
| 3 | Coordinator Delegation | ✅ Pass | Coordinator lists agents, routes to specialists |
| 4 | Agent Transfer | ✅ Pass | `transfer_to_agent` → burn_analyst works |
| MCP | MCP Fixtures Server | ✅ Pass | Server running, fixtures loaded |

### Bugs Discovered and Fixed

During validation, three frontend bugs were discovered and fixed:

#### Bug #1: HTTP 422 - Invalid Message Format

**Symptom:** POST to `/run_sse` returned `422 Unprocessable Entity: Input should be a valid dictionary`

**Root Cause:** The `adkClient.ts` was sending `new_message` as a plain string instead of ADK Content format.

**Fix Location:** `apps/command-console/src/lib/adkClient.ts`

```typescript
// BEFORE (broken):
new_message: request.new_message  // string

// AFTER (fixed):
new_message: {
  role: 'user',
  parts: [{ text: request.new_message }],
}
```

**Changes Made:**
- Added `ADKMessageContent` interface for proper message format
- Added `ADKStreamInput` interface for string-based input
- Modified `streamADK()` to convert string → ADK Content format

---

#### Bug #2: HTTP 404 - Session Not Created

**Symptom:** After fixing Bug #1, requests returned `404: Session not found`

**Root Cause:** The frontend generated a session ID locally but never created the session on the server before sending messages.

**Fix Location:** `apps/command-console/src/services/adkChatService.ts`

```typescript
// ADDED: Session creation method
private async createSession(): Promise<void> {
  if (this.sessionCreated) return;

  const response = await fetch(
    `${ADK_URL}/apps/${ADK_APP_NAME}/users/${ADK_USER_ID}/sessions`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
  );

  // ...
}
```

**Changes Made:**
- Added `sessionCreated` flag to track server-side session state
- Added `createSession()` method to call `/apps/{app}/users/{user}/sessions`
- Updated `streamQuery()` to create session before streaming

---

#### Bug #3: HTTP 404 - Session ID Mismatch

**Symptom:** Even after creating sessions, still getting 404 errors

**Root Cause:** The ADK server ignores client-provided session IDs and assigns its own. The frontend was using its locally-generated ID instead of the server-assigned one.

**Fix Location:** `apps/command-console/src/services/adkChatService.ts:91-92`

```typescript
// BEFORE (broken):
body: JSON.stringify({ id: this.sessionId })  // Server ignores this
this.sessionCreated = true;
console.log('[ADK] Session created:', this.sessionId);  // Wrong ID logged

// AFTER (fixed):
body: JSON.stringify({})  // Let server assign ID
const sessionData = await response.json();
this.sessionId = sessionData.id;  // Capture server-assigned ID
this.sessionCreated = true;
console.log('[ADK] Session created:', this.sessionId);  // Correct ID
```

**Key Insight:** The ADK session endpoint returns the assigned session ID in the response. The frontend must capture and use this ID for all subsequent requests.

---

### Verification Commands

These curl commands verify the ADK backend is working correctly:

```bash
# 1. Health check
curl -s http://localhost:8000/health

# 2. Create session (note: server assigns the ID)
curl -s -X POST "http://localhost:8000/apps/coordinator/users/usfs-demo/sessions" \
  -H "Content-Type: application/json" -d '{}'

# 3. Test SSE (use session ID from step 2)
curl -s -X POST "http://localhost:8000/run_sse" \
  -H "Content-Type: application/json" \
  -d '{"app_name":"coordinator","user_id":"usfs-demo","session_id":"<ID_FROM_STEP_2>","new_message":{"role":"user","parts":[{"text":"Hello, what agents do you have?"}]}}'
```

**Expected Response (Step 3):**
```
data: {"content":{"parts":[{"text":"I can route your requests to these specialist agents:\n\n- **burn-analyst**: Fire severity, MTBS classification...\n"}]...}
```

---

### Files Modified

| File | Changes |
|------|---------|
| `apps/command-console/src/lib/adkClient.ts` | Added ADK Content format conversion |
| `apps/command-console/src/services/adkChatService.ts` | Added session creation with server ID capture |

### Remaining Work

- [ ] Browser UI validation (Chrome extension was unavailable during test)
- [ ] Cloud Run deployment needs Vertex AI env vars (`GOOGLE_GENAI_USE_VERTEXAI=TRUE`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`) and service account with `roles/aiplatform.user`
- [ ] Full specialist agent tests (4A-4D) pending MCP integration in production

---

## Quick Reference: Sample Queries by Agent

### Coordinator (Routes to Specialists)
```
What can you help me with?
Give me an overview of Cedar Creek fire recovery status.
```

### Burn Analyst
```
What is the burn severity for cedar-creek-2022?
Classify MTBS data for Cedar Creek.
Which sectors have critical erosion risk?
```

### Trail Assessor
```
What trails need to be closed after Cedar Creek?
Prioritize trail repairs with a $200,000 budget.
What is the damage classification for Waldo Lake Trail?
```

### Cruising Assistant
```
What is the salvage potential for cedar-creek-2022?
Estimate timber volume for the high severity sectors.
What cruise methodology should we use for salvage?
```

### NEPA Advisor
```
What NEPA pathway for Cedar Creek recovery?
What is the compliance timeline for an EA?
Generate a NEPA checklist for post-fire salvage.
```

---

## Architecture Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Chat Panel    │    │ Briefing Panel  │    │    Map View     │         │
│  │  (Input/Output) │    │  (Proof Layer)  │    │   (3D Terrain)  │         │
│  └────────┬────────┘    └────────┬────────┘    └─────────────────┘         │
│           │                      │                                          │
│           ▼                      ▼                                          │
│  ┌─────────────────────────────────────────┐                               │
│  │           Zustand Stores                │                               │
│  │  chatStore | briefingStore | mapStore   │                               │
│  └────────────────────┬────────────────────┘                               │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────┐                               │
│  │         adkChatService                  │                               │
│  │  - Session management                   │                               │
│  │  - SSE streaming                        │                               │
│  │  - Event transformation                 │                               │
│  └────────────────────┬────────────────────┘                               │
└───────────────────────│─────────────────────────────────────────────────────┘
                        │ HTTPS/SSE
                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUD RUN (Coordinator)                              │
│  URL: https://ranger-coordinator-....run.app                                │
│  ┌─────────────────────────────────────────┐                               │
│  │           FastAPI + ADK                 │                               │
│  │  - /health (GET)                        │                               │
│  │  - /apps/{app}/users/{user}/sessions    │                               │
│  │  - /run_sse (POST) → SSE stream         │                               │
│  └────────────────────┬────────────────────┘                               │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────┐                               │
│  │         ADK Agent Runtime               │                               │
│  │  ┌─────────────┐ ┌─────────────┐        │                               │
│  │  │ Coordinator │→│ Sub-Agents  │        │                               │
│  │  │  (Router)   │ │  (4 types)  │        │                               │
│  │  └─────────────┘ └─────────────┘        │                               │
│  └────────────────────┬────────────────────┘                               │
│                       │                                                     │
│                       ▼                                                     │
│  ┌─────────────────────────────────────────┐                               │
│  │         Vertex AI (Gemini 2.0)          │                               │
│  │  - gemini-2.0-flash model               │                               │
│  │  - Function calling for tools           │                               │
│  │  - ADC authentication (no API key)      │                               │
│  └─────────────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼ (Optional MCP connection)
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLOUD RUN (MCP Fixtures)                                │
│  URL: https://ranger-mcp-fixtures-....run.app                               │
│  - /health (GET)                                                            │
│  - /sse (GET/POST) → MCP protocol                                           │
│  - Tools: get_fire_context, mtbs_classify, assess_trails, get_timber_plots  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Glossary

| Term | Definition |
|------|------------|
| **ADK** | Agent Development Kit - Google's framework for multi-agent AI systems |
| **SSE** | Server-Sent Events - HTTP-based streaming protocol (one-way, server→client) |
| **Coordinator** | Root agent that routes queries to specialist agents |
| **Sub-Agent** | Specialist agent (Burn Analyst, Trail Assessor, etc.) |
| **Tool** | Function an agent can call (e.g., assess_severity) |
| **Skill** | Domain expertise packaged with prompts, scripts, and resources |
| **MCP** | Model Context Protocol - Standard for LLM-to-service communication |
| **dNBR** | Differenced Normalized Burn Ratio - Satellite-derived burn severity metric |
| **MTBS** | Monitoring Trends in Burn Severity - Federal burn mapping program |
| **BAER** | Burned Area Emergency Response - Post-fire assessment team |
| **Proof Layer** | UI showing agent reasoning, sources, and confidence |

---

**Document Version:** 1.0
**Created:** December 27, 2025
**Author:** Claude Code (with Jason as HITL)

# RANGER Agent Architecture Audit Report
Date: 2025-12-27
Auditor: Claude Code
Project: RANGER Multi-Agent Post-Fire Recovery Platform

---

## Executive Summary

**Investigation Objective:** Diagnose why RANGER's multi-agent delegation is failing in production, causing specialists to refuse queries and all confidence scores to display as static 75%.

**Key Findings:**
1. ✅ **Infrastructure is Correct**: All 5 agents deployed, coordinator has sub_agents wired, single `/run_sse` endpoint
2. ❌ **Delegation Not Invoked**: Coordinator's system prompt lacks explicit instruction to USE the delegation tool
3. ✅ **Confidence is Calculated**: Skills return dynamic confidence (0.1-0.98 range)
4. ❌ **Confidence is Lost**: Gap between tool results and frontend display - LLM may not preserve tool confidence in natural language responses

**Root Causes Identified:** 2 critical gaps blocking expected behavior
**Immediate Impact:** Multi-agent orchestration is non-functional, confidence transparency is lost

---

## Deployed Services Status

| Service | Status | URL | Notes |
|---------|--------|-----|-------|
| `ranger-coordinator` | ✅ Running | `https://ranger-coordinator-fqd6rb7jba-uc.a.run.app` | ADK backend, Vertex AI Gemini 2.0 Flash |
| `ranger-console` | ✅ Running | `https://ranger-console-fqd6rb7jba-uc.a.run.app` | React frontend |
| `ranger-mcp-fixtures` | ✅ Running | `https://ranger-mcp-fixtures-fqd6rb7jba-uc.a.run.app` | Cedar Creek simulation data |

**Endpoint Validation:**
- `POST /run_sse` - SSE streaming (single entry point) ✅
- `GET /health` - Health check ✅
- No direct specialist endpoints (correct) ✅

**Configuration:**
- Model: `gemini-2.0-flash` (fast, cost-effective)
- Session backend: Firestore (`ranger-twin-dev`)
- MCP integration: Connected to fixtures server
- CORS: Configured for frontend origin

---

## Agent Implementation Status

| Agent | Code Exists | Deployed | Wired to Coordinator | Tools Registered | Notes |
|-------|-------------|----------|---------------------|------------------|-------|
| **Recovery Coordinator** | ✅ | ✅ | N/A (root) | `portfolio_triage`, `delegate_query` | System prompt issue (see below) |
| **Burn Analyst** | ✅ | ✅ | ✅ | `assess_severity`, `classify_mtbs`, `validate_boundary` | Mandatory tool usage enforced |
| **Trail Assessor** | ✅ | ✅ | ✅ | `classify_damage`, `evaluate_closure`, `prioritize_trails` | Full implementation |
| **Cruising Assistant** | ✅ | ✅ | ✅ | `recommend_methodology`, `estimate_volume`, `assess_salvage`, `analyze_csv_data` | Full implementation |
| **NEPA Advisor** | ✅ | ✅ | ✅ | `decide_pathway`, `generate_documentation_checklist`, `estimate_compliance_timeline`, `extract_pdf_content` | Full implementation |

**Skills Verification:** 16 total skills across 5 agents, all present and functional.

**Sub-Agent Wiring (Coordinator):**
```python
# agents/coordinator/agent.py:201
sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor]
```
✅ **Verified**: All 4 specialists registered as sub_agents in ADK.

---

## Root Cause Analysis

### ROOT CAUSE #1: Coordinator System Prompt Lacks Delegation Instruction

**File:** `agents/coordinator/agent.py:158-196`

**Issue:** The coordinator's system prompt DESCRIBES the `delegate_query` tool but does NOT explicitly instruct the agent to USE it.

**Current State (Lines 168-176):**
```
### delegate_query
Use this tool to determine which specialist agent should handle a query.
It analyzes the query and returns:
- target_agent: Which agent should handle this (may be yourself for greetings, portfolio questions)
- confidence: How confident the routing decision is (0-1)
- reasoning: Why this agent was selected
- requires_synthesis: Whether multiple specialists are needed

Use this when you need to decide whether to handle something yourself or delegate.
```

**Problem:** The phrase "Use this when you need to decide..." is passive. The coordinator knows the tool exists but isn't told to PROACTIVELY use it for incoming queries.

**Impact:**
- Coordinator responds directly to domain-specific queries without routing
- Specialists never receive delegated work
- Multi-agent orchestration is bypassed
- Users see generic responses instead of data-driven specialist insights

**Evidence:**
- Burn Analyst refusing "recovery briefing" queries → Never received delegation
- Queries about soil burn severity going unanswered → Coordinator doesn't know to delegate to Burn Analyst
- No tool invocations in logs for `delegate_query`

**Why This Matters:**
ADK agents require EXPLICIT tool usage instructions. Describing a tool's capabilities is not enough - the system prompt must say "ALWAYS call this tool for X" or "Your first step should be to call this tool."

**Analogous Pattern in Burn Analyst (Lines 193-200):**
```
## ⚠️ MANDATORY TOOL USAGE - CRITICAL

**YOU MUST CALL A TOOL BEFORE RESPONDING TO ANY DOMAIN QUESTION.**

- DO NOT answer from general knowledge
- DO NOT say "I don't have data" or "Let me help you with that" without calling a tool first
- DO NOT generate generic responses
- ALWAYS call the appropriate tool first, even if you're uncertain it will return results
```

The Burn Analyst has EXPLICIT mandatory tool usage - the Coordinator lacks this for delegation.

---

### ROOT CAUSE #2: Confidence Score Propagation Gap

**Issue:** Skills calculate dynamic confidence, but it's lost between tool results and frontend display.

**Confidence Flow Analysis:**

#### Step 1: Skill Calculates Confidence ✅
**File:** `agents/burn_analyst/skills/soil-burn-severity/scripts/assess_severity.py:336-350`

```python
# Calculate confidence
# High confidence for complete fixture data, reduce for missing fields
confidence = 0.92
if not fire_data:
    confidence = 0.85  # User-provided data slightly lower confidence

return {
    "fire_id": fire_id,
    "fire_name": fire_name,
    "total_acres": fire_data.get("total_acres", total_acres) if fire_data else total_acres,
    "severity_breakdown": severity_breakdown,
    "sectors": assessed_sectors,
    "priority_sectors": priority_sectors[:5],
    "reasoning_chain": reasoning_chain,
    "confidence": confidence,  # ← Confidence IS returned
    "data_sources": data_sources,
    "recommendations": recommendations,
}
```

✅ **Verified**: Skill returns `confidence: 0.92` or `0.85` in result dictionary.

#### Step 2: Agent Tool Returns Full Result ✅
**File:** `agents/burn_analyst/agent.py:78-85`

```python
def assess_severity(fire_id: str, sectors_json: str = "[]", include_geometry: bool = False) -> dict:
    import json
    from assess_severity import execute
    sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "include_geometry": include_geometry,
    })
```

✅ **Verified**: Tool function returns the complete dict from skill, including `confidence`.

#### Step 3: ADK Processes Tool Result ❓
**Gap:** ADK receives the tool result dict. Does it:
- Option A: Embed the full JSON in an SSE event for the LLM to summarize?
- Option B: Pass the JSON to the LLM as context, which then generates a natural language response?

**Critical Question:** When the LLM generates a natural language response, does it preserve the numeric confidence value?

#### Step 4: Frontend Extracts Confidence ❌
**File:** `apps/command-console/src/services/adkEventTransformer.ts:187-213`

```typescript
function extractConfidence(event: ADKEvent): number {
  const text = event.content?.parts?.[0]?.text || '';

  // Try to parse as JSON and extract confidence
  try {
    const data = JSON.parse(text);
    if (typeof data.confidence === 'number') {
      return data.confidence;
    }
  } catch {
    // Not JSON, continue with text analysis
  }

  // Look for confidence mentions in text
  const match = text.match(/(\d{1,3})%?\s*confiden/i);
  if (match && match[1]) {
    const value = parseInt(match[1], 10);
    return value > 1 ? value / 100 : value;
  }

  // Default confidence based on event type
  if (event.actions?.tool_call) {
    return 0.9; // Tool-based responses have high confidence
  }

  return 0.75; // Default moderate confidence  ← THIS IS THE 75% USERS SEE
}
```

**Problem:** The transformer tries to extract confidence from `event.content.parts[0].text`, which contains the LLM's natural language response, not the raw tool result.

**Scenarios:**
1. **If LLM response is JSON** (unlikely for conversational agent): Parser extracts confidence ✅
2. **If LLM says "75% confidence"** in text: Regex extracts it ✅
3. **If LLM says "high confidence" or doesn't mention confidence**: Defaults to 0.75 ❌

**Result:** Users see static 75% because the LLM's natural language responses don't include numeric confidence values.

---

**Confidence Sources Identified in Codebase:**

| Source | Location | Value | Type | Propagated? |
|--------|----------|-------|------|-------------|
| Portfolio Triage | `coordinator/skills/portfolio-triage/scripts/calculate_priority.py:178` | 0.92 | Static | ❓ |
| Delegation Routing | `coordinator/skills/delegation/scripts/route_query.py:165-185` | 0.1-0.98 | Dynamic (keyword matching) | ❓ |
| Soil Burn Severity | `burn_analyst/skills/soil-burn-severity/scripts/assess_severity.py:338` | 0.92/0.85 | Static (data source) | ❌ |
| NEPA Timeline | `nepa_advisor/skills/compliance-timeline/scripts/estimate_timeline.py:316-320` | 0.75-0.85 | Dynamic (consultation count) | ❓ |
| Frontend Fallback | `adkEventTransformer.ts:212` | 0.75 | Hardcoded default | ✅ (always shown) |

**Gap Hypothesis:** Skills calculate confidence → Tool results include it → LLM summarizes results in natural language → Numeric confidence is lost → Frontend defaults to 0.75.

---

## Routing Logic Verification

### Frontend → Backend Flow ✅

**File:** `apps/command-console/src/stores/chatStore.ts:123-129`

```typescript
sendMessage: async (query: string) => {
  const { useADK } = get();
  if (useADK) {
    return get().sendMessageADK(query);      // → ADK Orchestrator
  }
  return get().sendMessageLegacy(query);     // → Legacy service
},
```

**File:** `apps/command-console/src/services/adkChatService.ts:24`

```typescript
const ADK_APP_NAME = 'coordinator';
```

✅ **Verified**: Frontend sends ALL queries to coordinator. No direct specialist routing in frontend.

### Backend Orchestrator ✅

**File:** `main.py:59-64`

```python
app = get_fast_api_app(
    agents_dir=AGENTS_DIR,              # Directory: agents/
    session_service_uri=SESSION_SERVICE_URI,
    allow_origins=ALLOW_ORIGINS,
    web=False,  # Disable UI, use React console
)
```

**Endpoint:** `POST /run_sse` (single entry point)

✅ **Verified**: ADK loads all agents from `agents/` directory, coordinator is root.

### Delegation Decision Logic ✅

**File:** `agents/coordinator/skills/delegation/scripts/route_query.py`

**Routing Rules (Keyword-Based):**
- **Burn Analyst** (53-64): `["burn", "fire severity", "soil burn", "dnbr", "mtbs", ...]`
- **Trail Assessor** (66-77): `["trail", "closure", "hazard tree", "bridge", "erosion", ...]`
- **Cruising Assistant** (79-90): `["timber", "salvage", "merchantable", "board feet", "volume", ...]`
- **NEPA Advisor** (91-102): `["nepa", "compliance", "eis", "ea", "categorical exclusion", ...]`
- **Coordinator** (103-114): `["portfolio", "prioritize", "triage", "overview", "hello", ...]`

**Confidence Calculation (Lines 165-185):**
```python
score = base_score (len(matches) * 0.15, capped at 0.6)
      + specificity_bonus (multi-word phrases +0.1, long keywords +0.05)
      + base_confidence (0.1)
# Result range: 0.1-0.98
```

**Multi-Agent Synthesis Detection:**
If 2+ specialists have meaningful matches AND no single agent dominates (>= 3x ratio), coordinator returns:
```python
{
    "target_agent": "coordinator",
    "confidence": 0.88,
    "requires_synthesis": True,
    "synthesis_agents": ["burn-analyst", "trail-assessor", ...]
}
```

✅ **Verified**: Delegation logic is sophisticated and production-ready.

**Problem:** This logic is NEVER INVOKED because the coordinator's system prompt doesn't instruct it to call `delegate_query()`.

---

## SSE Event Stream Structure

**ADK Event Interface** (`apps/command-console/src/utils/adkClient.ts:66-76`):
```typescript
export interface ADKEvent {
  id: string;
  invocationId?: string;
  author?: string;              // Agent name (e.g., "burn_analyst")
  content?: ADKEventContent;    // LLM's response (natural language)
  actions?: ADKActions;         // Tool calls (NOT tool results)
  partial: boolean;
  timestamp?: number;
  error_code?: string;
  error_message?: string;
}

export interface ADKActions {
  tool_call?: ADKToolCall;      // Tool invocation
  state_delta?: Record<string, unknown>;
  // NOTE: No tool_result field!
}
```

**Key Finding:** ADK events do NOT have a dedicated `tool_result` field. Tool results must be embedded in `content.parts[].text`, which is what the transformer already tries to parse (lines 191-195).

**Hypothesis:** The LLM receives tool results as context and generates a natural language response. Numeric confidence values are lost in this natural language generation unless the LLM explicitly includes them (which it typically doesn't).

---

## Recommendations

### CRITICAL FIX #1: Add Explicit Delegation Instruction to Coordinator

**File to Modify:** `agents/coordinator/agent.py:158-196`

**Change:** Add mandatory delegation instruction to system prompt BEFORE tool descriptions.

**Recommended Addition (Insert after line 159, before line 160):**
```python
## Query Routing Protocol

**CRITICAL: MANDATORY DELEGATION FOR ALL QUERIES**

When you receive a user query, you MUST FIRST determine routing:

1. **ALWAYS call delegate_query() as your FIRST action** for any user query
2. Analyze the routing result:
   - If target_agent is a specialist → Defer to that specialist (do NOT answer yourself)
   - If target_agent is "coordinator" and requires_synthesis=False → Handle directly using portfolio_triage
   - If requires_synthesis=True → Coordinate responses from multiple synthesis_agents

3. **NEVER refuse or say "out of scope"** - routing ensures correct specialist handles it
4. **NEVER answer domain-specific questions directly** - delegate to specialists

### Examples:
- "What is soil burn severity?" → delegate_query() → Routes to burn-analyst
- "Which trails are closed?" → delegate_query() → Routes to trail-assessor
- "Which fires need BAER?" → delegate_query() → Routes to self, use portfolio_triage()
- "Give me a recovery briefing" → delegate_query() → requires_synthesis=True, coordinate multiple agents

## Tools Available
```

**Impact:** This will force the coordinator to ALWAYS invoke delegation logic, ensuring specialist agents receive appropriate queries.

**Testing:** After deploying this change:
1. Query "What is the soil burn severity at Cedar Creek?" → Should delegate to Burn Analyst
2. Query "Give me a recovery briefing" → Should coordinate multiple specialists
3. Query "Which fires need BAER assessments?" → Should handle directly with portfolio_triage

---

### CRITICAL FIX #2: Preserve Confidence Through LLM Response

**Problem:** Tool results include confidence, but LLM natural language responses don't preserve the numeric value.

**Three-Part Solution:**

#### Part 2A: Instruct Coordinator to Extract and Relay Confidence

**File to Modify:** `agents/coordinator/agent.py:190-196` (Response Format section)

**Change:** Add explicit confidence propagation instruction.

**Recommended Addition:**
```python
## Response Format
Always structure your responses with:
1. Direct answer to the user's question
2. Key supporting details (include reasoning chain from tools when available)
3. Recommended next steps (if applicable)
4. **Confidence level and data sources**

**CRITICAL: Confidence Propagation**
When you receive tool results that include a "confidence" field:
- ALWAYS include the numeric confidence value in your response
- Format: "Confidence: 0.92" or "92% confidence"
- Do NOT round or approximate - use the exact value from the tool
- Include it near the end of your response, before data sources
```

#### Part 2B: Improve Frontend Confidence Extraction

**File to Modify:** `apps/command-console/src/services/adkEventTransformer.ts:187-213`

**Change:** Enhance regex pattern to catch more confidence formats.

**Current Pattern (Line 201):**
```typescript
const match = text.match(/(\d{1,3})%?\s*confiden/i);
```

**Improved Pattern:**
```typescript
// Enhanced pattern to catch multiple formats:
// "Confidence: 0.92", "92% confidence", "confidence of 85%", "0.85 confidence"
const patterns = [
  /confidence[:\s]+(\d*\.?\d+)/i,           // "Confidence: 0.92"
  /(\d{1,3})%\s*confidence/i,                // "92% confidence"
  /confidence\s+of\s+(\d*\.?\d+)/i,         // "confidence of 0.85"
  /confidence[:\s]+(\d{1,3})%/i,            // "Confidence: 92%"
];

for (const pattern of patterns) {
  const match = text.match(pattern);
  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return value > 1 ? value / 100 : value;
  }
}
```

#### Part 2C: Consider Structured Tool Result Events (Long-Term)

**Investigation Needed:** Determine if ADK supports emitting tool results as separate SSE events (not just LLM summaries).

**If ADK supports it:**
- Configure agents to emit raw tool results in addition to LLM responses
- Frontend can extract confidence from structured tool_result events
- Fallback to text extraction for backwards compatibility

**If ADK doesn't support it:**
- Current solution (instructing LLM to include confidence) is best path
- Consider post-processing: Extract confidence from tool calls before LLM summarizes

---

### MEDIUM-PRIORITY FIX #3: Confidence Ledger Implementation

**File:** `packages/agent-common/agent_common/types/briefing.py:208-232`

The `ProofLayer` schema already defines a `confidence_ledger` structure:
```python
confidence_ledger: Optional[Dict[str, ConfidenceEntry]] = None
```

**Recommendation:** Populate this ledger in skills with:
- **Input sources**: Which data sources contributed (e.g., MTBS, user-provided, fixture)
- **Confidence per source**: Tier 1 (0.9+), Tier 2 (0.7-0.85), Tier 3 (<0.7)
- **Aggregation method**: How multi-source confidence was combined

**Example (Soil Burn Severity Skill):**
```python
confidence_ledger = {
    "mtbs_imagery": {"confidence": 0.95, "tier": 1, "reasoning": "2022-09-15 Landsat 8 imagery"},
    "slope_data": {"confidence": 0.88, "tier": 2, "reasoning": "USGS DEM, 10m resolution"},
    "aggregation": {"method": "minimum", "result": 0.88}
}
```

**Benefit:** Users can drill down to see WHY confidence is 0.88 vs 0.92.

---

## Testing Plan

### Post-Fix Validation Tests

After deploying **CRITICAL FIX #1** (delegation instruction):

```bash
# Test 1: Burn severity delegation
curl -X POST $COORDINATOR_URL/run_sse \
  -H "Content-Type: application/json" -H "Accept: text/event-stream" \
  -d '{"app_name": "coordinator", "user_id": "test", "sessionId": "test-001", "new_message": {"role": "user", "parts": [{"text": "What is the soil burn severity at Cedar Creek?"}]}}' \
  --no-buffer

# Expected: Coordinator calls delegate_query(), routes to burn_analyst, burn_analyst calls assess_severity()
# Success indicators: SSE events show "burn_analyst" as author, tool_call for assess_severity

# Test 2: Multi-domain synthesis
curl -X POST $COORDINATOR_URL/run_sse \
  -H "Content-Type: application/json" -H "Accept: text/event-stream" \
  -d '{"app_name": "coordinator", "user_id": "test", "sessionId": "test-002", "new_message": {"role": "user", "parts": [{"text": "Give me a comprehensive recovery briefing for Cedar Creek"}]}}' \
  --no-buffer

# Expected: delegate_query() returns requires_synthesis=True, coordinator orchestrates burn_analyst + trail_assessor + cruising_assistant + nepa_advisor
# Success indicators: Multiple agent names in events, synthesis acknowledgment

# Test 3: Portfolio self-handling
curl -X POST $COORDINATOR_URL/run_sse \
  -H "Content-Type: application/json" -H "Accept: text/event-stream" \
  -d '{"app_name": "coordinator", "user_id": "test", "sessionId": "test-003", "new_message": {"role": "user", "parts": [{"text": "Which fires need BAER assessments?"}]}}' \
  --no-buffer

# Expected: delegate_query() routes to self, coordinator calls portfolio_triage()
# Success indicators: portfolio_triage tool_call, triage scores in response
```

After deploying **CRITICAL FIX #2** (confidence propagation):

```
# Frontend test (manual in browser)
1. Open RANGER Command Console
2. Send query: "What is the burn severity at Cedar Creek?"
3. Check briefing card for confidence score
4. Expected: "Confidence: 0.92" or "92%" instead of static "75%"

# Variation test
1. Send query requiring multiple data sources
2. Expected: Lower confidence (0.85 or less) for incomplete data
```

---

## Deployment Checklist

- [ ] **Code Changes:**
  - [ ] Update `agents/coordinator/agent.py` with delegation instruction (FIX #1)
  - [ ] Update `agents/coordinator/agent.py` with confidence propagation instruction (FIX #2A)
  - [ ] Update `apps/command-console/src/services/adkEventTransformer.ts` with improved regex (FIX #2B)

- [ ] **Testing:**
  - [ ] Run local ADK tests: `cd agents && pytest coordinator/tests/ -v`
  - [ ] Run frontend typecheck: `cd apps/command-console && npm run typecheck`
  - [ ] Manual smoke test with `adk run coordinator` CLI

- [ ] **Deployment:**
  - [ ] Deploy coordinator: `gcloud run deploy ranger-coordinator --source . --project ranger-twin-dev --region us-central1`
  - [ ] Deploy frontend: `gcloud run deploy ranger-console --source apps/command-console --project ranger-twin-dev --region us-central1`
  - [ ] Wait for health checks: `gcloud run services list --project ranger-twin-dev`

- [ ] **Validation:**
  - [ ] Run Test 1, 2, 3 from Testing Plan
  - [ ] Check logs for delegate_query tool invocations
  - [ ] Verify confidence scores vary (not always 75%)

- [ ] **Documentation:**
  - [ ] Update `docs/specs/agent-interface.md` with delegation protocol
  - [ ] Add runbook entry for debugging delegation failures
  - [ ] Document confidence extraction patterns for future skills

---

## Long-Term Architecture Considerations

### 1. Delegation as a Pattern, Not a Tool

**Current:** Delegation is a TOOL the coordinator must remember to call.
**Better:** Delegation is AUTOMATIC - ADK routes based on agent descriptions.

**Investigation:** Can ADK's native `sub_agents` mechanism auto-route without explicit tool calls? If yes, remove delegation tool and rely on ADK's built-in logic.

**Trade-off:** Lose fine-grained routing control (keyword matching, confidence scoring) but gain simpler prompt engineering.

### 2. Structured Confidence Metadata

**Current:** Confidence is a single 0-1 float.
**Better:** Confidence is a structured object with sources, tiers, and reasoning.

**Proposal:** Extend ADK event structure (or agent response format) to include:
```json
{
  "content": { ... },
  "metadata": {
    "confidence": {
      "overall": 0.88,
      "breakdown": {
        "data_quality": 0.92,
        "model_certainty": 0.85,
        "recency": 0.90
      },
      "sources": ["MTBS 2022-09-15", "USGS DEM"]
    }
  }
}
```

**Benefit:** Frontend can visualize confidence breakdown, users trust scores more.

### 3. Tool Result Pass-Through Mode

**Current:** LLM summarizes tool results in natural language.
**Better:** Option to pass tool results directly to frontend as structured data.

**Use Case:** For data-heavy queries (e.g., "show me all sectors"), frontend could render a table directly from tool JSON without LLM intermediation.

**Implementation:** Add `raw_mode: true` flag to agent config or query state.

---

## Appendix: File Locations

### Critical Files for Routing Fix
1. `agents/coordinator/agent.py:158-196` - System prompt (ADD delegation instruction)
2. `agents/coordinator/skills/delegation/scripts/route_query.py` - Routing logic (already correct)
3. `main.py:59-64` - ADK orchestrator (already correct)

### Critical Files for Confidence Fix
1. `agents/coordinator/agent.py:190-196` - Response format (ADD confidence instruction)
2. `apps/command-console/src/services/adkEventTransformer.ts:187-213` - Confidence extraction (IMPROVE regex)
3. `agents/burn_analyst/skills/soil-burn-severity/scripts/assess_severity.py:338` - Skill confidence (reference impl, already correct)

### Reference Implementations
1. Burn Analyst mandatory tool usage: `agents/burn_analyst/agent.py:193-200`
2. Delegation routing algorithm: `agents/coordinator/skills/delegation/scripts/route_query.py:165-254`
3. Skill confidence calculation: Multiple files, see table in Root Cause #2

---

## Conclusion

RANGER's multi-agent architecture is **fundamentally sound** - all infrastructure is in place, skills are production-ready, and routing logic is sophisticated. The system fails due to **two missing instructions**:

1. **Coordinator doesn't know to delegate** → Add "ALWAYS call delegate_query()" to system prompt
2. **LLM doesn't preserve confidence** → Instruct "ALWAYS include numeric confidence in response"

These are **prompt engineering fixes**, not architectural flaws. Estimated implementation time: **2 hours** (1 hour for changes, 1 hour for testing and deployment).

**Expected Outcome After Fixes:**
- "Give me a recovery briefing" → Coordinator orchestrates all 4 specialists
- "What is soil burn severity?" → Routes to Burn Analyst → Shows "Confidence: 0.92"
- "Which trails are closed?" → Routes to Trail Assessor → Data-driven response
- Portfolio queries → Coordinator handles directly with triage scoring

**RANGER will function as a true multi-agent system with transparent confidence scoring.**

---

**End of Report**

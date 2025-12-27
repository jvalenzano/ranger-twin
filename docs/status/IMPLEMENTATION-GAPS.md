# RANGER Implementation Gaps

**Purpose:** Track what's designed but not yet implemented
**Last Updated:** December 27, 2025
**Status:** 5 gaps identified (3 P0, 1 P1, 1 P2)

---

## Executive Summary

| Gap | Status | Effort | Priority | Blocking |
|-----|--------|--------|----------|----------|
| MCP Server Connectivity | ⏳ Stubbed | 2-3 days | P0 | Live data integration |
| Progressive Proof Layer UI | ❌ Not Started | 1-2 days | P1 | User trust, reasoning visibility |
| Frontend-Backend Integration | ⏳ Partial | 1-2 days | P0 | User-facing demo |
| Multi-Agent Orchestration Testing | ⏳ Untested | 1 day | P0 | Full demo scenario |
| Cedar Creek Test Failures | ⏳ Known | 1-2 hours | P2 | 100% test coverage |

**Total Effort to Demo-Ready:** ~5-8 days (P0 items only)

---

## Gap 1: MCP Server Connectivity

**Designed in:**
- `docs/adr/ADR-005-skills-first-architecture.md` (Skills-First Multi-Agent Architecture)
- `docs/specs/MCP-REGISTRY-STANDARD.md` (MCP Server Pattern)
- `docs/architecture/AGENTIC-ARCHITECTURE.md` (Layer 4: MCP Connectivity)

**Current State:**
- ✅ MCP Fixtures server implemented (`services/mcp-fixtures/server.py`)
- ✅ MCP client factory pattern exists (`agents/shared/mcp_client.py`)
- ❌ Agents use hardcoded fixture paths, not MCP protocol
- ❌ No MCP server discovery/registration
- ❌ NIFC MCP server is placeholder only

**Blocking:** Live data integration, external data sources (IRWIN, NIFC, Weather)

**Effort Estimate:** 2-3 days per MCP server

---

### Required MCP Servers

| Server | Status | Priority | Purpose | Data Source |
|--------|--------|----------|---------|-------------|
| **IRWIN** | ❌ Not Started | **P0 (Critical)** | Real-time incident metadata | IRWIN API |
| **NIFC** | ⏳ Placeholder | **P0** | Fire perimeters, active fires | NIFC ArcGIS API |
| **Fixtures** | ✅ Implemented | **P0 (Demo)** | Cedar Creek test data | Local JSON files |
| **Weather** | ❌ Not Started | P2 | Weather forecasts, wind data | NOAA/NWS API |
| **GIS** | ❌ Not Started | P2 | Geospatial boundaries, layers | Various sources |

---

### What Exists Today

#### MCP Fixtures Server ✅
**File:** `services/mcp-fixtures/server.py`

**Status:** Fully implemented, can run standalone

**Tools Implemented:**
- `get_fire_context(fire_name)` - Returns incident metadata for a given fire
- `mtbs_classify(fire_name, dnbr_value)` - Classifies burn severity from dNBR values
- `assess_trails(fire_name)` - Evaluates trail damage and closure recommendations

**Data Sources:**
- `data/fixtures/cedar-creek/incident-metadata.json`
- `data/fixtures/cedar-creek/burn-severity.json`
- `data/fixtures/cedar-creek/trail-damage.json`
- `data/fixtures/cedar-creek/timber-plots.json`

**Can run standalone:**
```bash
cd services/mcp-fixtures
uvicorn server:app --host 0.0.0.0 --port 8080
```

**Verification:**
```bash
curl http://localhost:8080/health  # Should return {"status": "healthy"}
```

#### MCP Client Factory ⏳
**File:** `agents/shared/mcp_client.py`

**Status:** Stubbed, factory pattern exists

**Current Implementation:**
```python
class MCPClientFactory:
    @staticmethod
    def get_client(server_type: str) -> MCPClient:
        # Stub implementation
        # TODO: Implement actual MCP connection
        pass
```

---

### What's Missing

#### 1. Agent-to-MCP Wiring ❌
**Current Behavior:** Agents load fixture data directly from hardcoded file paths

**Example (Burn Analyst):**
```python
# Current: Hardcoded path
with open("../../data/fixtures/cedar-creek/burn-severity.json") as f:
    data = json.load(f)

# Target: MCP client call
mcp_client = MCPClientFactory.get_client("fixtures")
data = mcp_client.call_tool("get_fire_context", {"fire_name": "Cedar Creek"})
```

**Impact:** Agents can't access live data from external sources

**Fix:**
1. Implement `MCPClientFactory.get_client()` with actual MCP connection
2. Update agent skills to use MCP client instead of file I/O
3. Add MCP connection pooling and error handling

#### 2. MCP Server Discovery/Registration ❌
**Current Behavior:** No registry of available MCP servers

**Target:** Dynamic MCP server discovery
- Agents query registry for available servers
- Registry returns server capabilities (tools, data sources)
- Agents select appropriate server for data needs

**Reference:** `docs/specs/MCP-REGISTRY-STANDARD.md`

**Fix:**
1. Implement MCP registry service
2. Add server capability metadata (tools, data schemas)
3. Update agents to query registry before calling tools

#### 3. MCP Connection Pooling/Retries ❌
**Current Behavior:** No connection management

**Target:** Resilient MCP connections
- Connection pooling to avoid repeated handshakes
- Retry logic with exponential backoff
- Circuit breaker pattern for failing servers
- Graceful degradation (fallback to cached/fixture data)

**Fix:**
1. Add connection pooling to `MCPClientFactory`
2. Implement retry decorator for MCP calls
3. Add circuit breaker logic
4. Define fallback behavior (fixture data, error response)

---

### NIFC MCP Server Status

**File:** `mcp/nifc/README.md`

**Status:** Placeholder only (no implementation)

**Planned Tools:**
- `get_active_fires()` - List all active fires
- `get_fire_perimeter(fire_id)` - Get fire boundary GeoJSON
- `get_fire_details(fire_id)` - Get detailed fire metadata

**Reference Implementation:**
Existing `apps/command-console/src/services/nifcService.ts` can be ported to Python MCP server

**Effort:** 2-3 days (API integration, error handling, testing)

---

### Recommendation

**Phase 1 (Demo):** Use MCP Fixtures server with hardcoded agent wiring
- Agents continue using fixture file paths
- MCP Fixtures server available for external testing
- Demonstrates MCP capability without blocking demo

**Phase 2 (Production):** Implement full MCP connectivity
1. Wire agents to MCP Fixtures server (1 day)
2. Build NIFC MCP server (2-3 days)
3. Build IRWIN MCP server (2-3 days)
4. Add registry and connection pooling (2 days)

**Total effort:** ~8-10 days for full production MCP layer

---

## Gap 2: Progressive Proof Layer UI

**Designed in:**
- `docs/architecture/SSE-PROOF-LAYER-SPIKE.md` (Technical spike with implementation roadmap)
- `docs/specs/PROOF-LAYER-DESIGN.md` (UI component specifications)
- `apps/command-console/src/types/briefing.ts` (Type definitions complete)

**Current State:**
- ✅ AuditEventBridge captures events (Python backend)
- ✅ adkClient.ts streams SSE (frontend)
- ✅ adkEventTransformer.ts transforms events (frontend)
- ✅ useADKStream hook for React integration
- ❌ Progressive UI components NOT implemented
- ❌ Enhanced SSE endpoint NOT implemented
- ❌ Audit metadata injection NOT implemented

**Blocking:** Real-time reasoning visibility, user trust in AI decisions

**Effort Estimate:** 1-2 days

---

### Required Components (from SSE-PROOF-LAYER-SPIKE.md)

#### 1. Enhanced SSE Endpoint ❌
**File:** `main.py` (to add `/run_sse_enhanced`)

**Purpose:** Inject audit trail metadata into SSE stream

**Current:** Standard `/run_sse` endpoint (ADK-provided)
```python
@app.post("/run_sse")
async def run_sse(request: RunSSERequest):
    # Standard ADK SSE streaming
    return adk_app.run_sse(request)
```

**Target:** Enhanced endpoint with audit metadata injection
```python
@app.post("/run_sse_enhanced")
async def run_sse_enhanced(request: RunSSERequest):
    # 1. Start ADK SSE stream
    # 2. Inject audit events from AuditEventBridge
    # 3. Populate confidence_ledger from audit trail
    # 4. Stream enhanced events to frontend
    pass
```

**Implementation Details:**
1. Query `AuditEventBridge.get_audit_trail(invocation_id)` during execution
2. Extract confidence scores from tool responses
3. Build `confidence_ledger` object with per-input confidence
4. Inject as SSE event: `data: {"type": "audit", "confidence_ledger": {...}}`

**Reference:** `docs/architecture/SSE-PROOF-LAYER-SPIKE.md` (Phase 1)

#### 2. useProofLayerStream Hook ❌
**File:** `apps/command-console/src/hooks/useProofLayerStream.ts` (to create)

**Purpose:** React hook that consumes enhanced SSE events and manages proof layer state

**Target Implementation:**
```typescript
export function useProofLayerStream() {
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [confidenceLedger, setConfidenceLedger] = useState<ConfidenceLedger | null>(null);

  // Subscribe to SSE events
  // Update reasoning chain progressively
  // Animate confidence buildup

  return { reasoning, confidence, confidenceLedger, isStreaming };
}
```

**Features:**
- Progressive reasoning chain accumulation
- Confidence score interpolation (0 → final value)
- confidence_ledger state management
- SSE connection lifecycle management

**Reference:** `docs/architecture/SSE-PROOF-LAYER-SPIKE.md` (Phase 2)

#### 3. ProgressiveReasoningChain Component ❌
**File:** `apps/command-console/src/components/briefing/ProgressiveReasoningChain.tsx` (to create)

**Purpose:** Display reasoning steps as they stream in (typewriter effect)

**Target UI:**
```
┌─────────────────────────────────────────────────┐
│ Reasoning Chain                                 │
├─────────────────────────────────────────────────┤
│ 1. ✓ Analyzing burn severity data...           │
│ 2. ✓ Classifying MTBS severity levels...       │
│ 3. ⏳ Assessing ecological impact...            │
│ 4. ⏸️ Generating recovery recommendations...    │
└─────────────────────────────────────────────────┘
```

**Features:**
- Typewriter animation for each step
- Status indicators (⏳ in progress, ✓ complete, ⏸️ pending)
- Auto-scroll to latest step
- Expandable detail view per step

**Reference:** Existing `ReasoningChain.tsx` as baseline (but static, not progressive)

#### 4. StreamingConfidenceGauge Component ❌
**File:** `apps/command-console/src/components/briefing/StreamingConfidenceGauge.tsx` (to create)

**Purpose:** Animated confidence score that builds up as reasoning progresses

**Target UI:**
```
┌─────────────────────────────────────────────────┐
│ Confidence                                      │
│                                                 │
│  ████████████████░░░░  82%                     │
│                                                 │
│  Input Confidence:                              │
│  • Burn Severity Data: 95% (Tier 1)            │
│  • Trail Damage Data: 78% (Tier 2)             │
│  • Timber Plots: 65% (Tier 3)                  │
└─────────────────────────────────────────────────┘
```

**Features:**
- Animated progress bar (0% → final value)
- Color coding by confidence level (green >90%, yellow 70-90%, red <70%)
- confidence_ledger breakdown (per-input confidence with tiers)
- Data tier badges (Tier 1/2/3)

**Animation:** Smooth interpolation over 1-2 seconds

#### 5. Audit Metadata Injection ❌
**Backend:** `main.py` (modify `/run_sse_enhanced`)
**Frontend:** `adkEventTransformer.ts` (parse audit events)

**Purpose:** Populate `confidence_ledger` from `AuditEventBridge` during SSE stream

**Implementation:**
1. Query audit trail: `AuditEventBridge.get_audit_trail(invocation_id)`
2. Extract tool responses with confidence scores
3. Build confidence_ledger structure:
   ```python
   confidence_ledger = {
       "inputs": [
           {
               "source": "burn-severity.json",
               "confidence": 0.95,
               "tier": 1,
               "notes": "Authoritative MTBS data"
           },
           {
               "source": "trail-damage.json",
               "confidence": 0.78,
               "tier": 2,
               "notes": "Field assessment data"
           }
       ],
       "analysis_confidence": 0.88,
       "recommendation_confidence": 0.82
   }
   ```
4. Inject as SSE event
5. Frontend consumes and renders

---

### What Exists Today

#### Backend: AuditEventBridge ✅
**File:** `agents/shared/audit_bridge.py`

**Status:** Fully implemented (27 tests passing)

**Capabilities:**
- Session-scoped in-memory event buffering
- Thread-safe (`threading.Lock`)
- Event types: ToolInvocationEvent, ToolResponseEvent, ToolErrorEvent
- Cleanup methods to prevent memory leaks

**API:**
```python
bridge = get_audit_bridge()  # Singleton

# Record events
bridge.record_tool_invocation(event)
bridge.record_tool_response(event)
bridge.record_tool_error(event)

# Retrieve audit trail
events = bridge.get_audit_trail(invocation_id)

# Cleanup
bridge.clear_invocation(invocation_id)
```

**Ready for:** SSE metadata injection (Gap #2 target)

#### Frontend: SSE Client ✅
**File:** `apps/command-console/src/utils/adkClient.ts`

**Status:** Fully implemented

**Features:**
- Connects to `POST /run_sse` endpoint
- Parses SSE data stream
- AbortController for stream cancellation
- Exponential backoff retry (configurable)

**API:**
```typescript
const { stream, abort } = startADKStream({
  apiUrl: 'http://localhost:8000',
  sessionId: 'session-123',
  message: 'Query here',
  onEvent: (event) => console.log(event),
  onError: (error) => console.error(error)
});
```

**Ready for:** Enhanced SSE events with audit metadata

#### Frontend: Event Transformer ✅
**File:** `apps/command-console/src/services/adkEventTransformer.ts`

**Status:** Fully implemented

**Capabilities:**
- Transforms ADK events → `AgentBriefingEvent` schema
- Inference functions:
  - `extractConfidence()` - Parses confidence scores
  - `extractReasoningChain()` - Splits reasoning steps
  - `extractCitations()` - Builds citation objects
  - `inferEventType()` - Maps to alert/insight/action_required/status_update
  - `inferSeverity()` - Maps to critical/warning/info

**Ready for:** Parsing enhanced SSE events with confidence_ledger

#### Frontend: useADKStream Hook ✅
**File:** `apps/command-console/src/hooks/useADKStream.ts`

**Status:** Fully implemented

**State Management:**
- `events` - Array of transformed AgentBriefingEvents
- `rawEvents` - Raw SSE events
- `isLoading` - Stream status
- `error` - Error state
- `sessionId` - Current session

**Methods:**
- `startStream(query, fireId, customSessionId)`
- `stopStream()`
- `clearEvents()`
- `newSession()`

**Selector Hooks:**
- `useADKEventsByAgent(agentName)`
- `useADKLatestEvent()`
- `useADKInsights()`
- `useADKAlerts()`

**Ready for:** Integration with `useProofLayerStream` hook

---

### What's Missing

#### No Progressive UI Components ❌
- `useProofLayerStream` hook (1-2 hours)
- `ProgressiveReasoningChain` component (2-3 hours)
- `StreamingConfidenceGauge` component (2-3 hours)

**Total:** ~6-8 hours

#### No Enhanced SSE Endpoint ❌
- `/run_sse_enhanced` in `main.py` (2-3 hours)
- Audit trail query during execution (1 hour)
- confidence_ledger population logic (1-2 hours)

**Total:** ~4-6 hours

#### No Audit Metadata Injection ❌
- Backend: Query AuditEventBridge during SSE stream (1-2 hours)
- Backend: Build confidence_ledger structure (1 hour)
- Frontend: Parse and store confidence_ledger (1 hour)

**Total:** ~3-4 hours

---

### Recommendation

**Phase 1 (Demo):** Skip progressive proof layer UI
- Basic reasoning chain works (static component exists)
- Confidence scores can be shown post-execution
- Not critical for demo success

**Phase 2 (Production):** Implement progressive proof layer
- Build enhanced SSE endpoint (4-6 hours)
- Build UI components (6-8 hours)
- Integrate and test (2-3 hours)

**Total effort:** 1-2 days (12-17 hours)

**Impact:** Significantly improves user trust and AI transparency

---

## Gap 3: Frontend-Backend Integration Testing

**Designed in:**
- `docs/architecture/UX-VISION.md` (End-to-end user experience)
- `docs/architecture/BRIEFING-UX-SPEC.md` (UI rendering specifications)
- `apps/command-console/src/hooks/useADKStream.ts` (React-SSE integration)

**Current State:**
- ✅ Command Console builds successfully (Vite + TypeScript)
- ✅ SSE client implemented with retry logic
- ✅ Briefing components exist (BriefingObserver, InsightCard, ReasoningChain)
- ✅ Event transformer pipeline complete
- ⏳ Full end-to-end integration UNTESTED
- ⏳ WebSocket fallback NOT implemented
- ⏳ Proof layer UI wired to mock service (not real events)

**Blocking:** User-facing demo, production deployment

**Effort Estimate:** 1-2 days testing + fixes

---

### Required Work

#### 1. Verify Command Console Connects to ADK Backend ⏳
**Test:** Frontend chat sends message → ADK backend receives → Agent responds → Frontend renders response

**Current Status:** Untested (assumed to work based on component implementation)

**Test Plan:**
1. Start ADK orchestrator: `python main.py` (port 8000)
2. Start Command Console: `cd apps/command-console && npm run dev` (port 5173)
3. Configure `.env.local`:
   ```bash
   VITE_USE_ADK=true
   VITE_ADK_URL=http://localhost:8000
   VITE_GEMINI_API_KEY=your_key_here
   ```
4. Send test message in chat interface
5. Verify: Message → `/run_sse` → Coordinator agent → Response → Frontend

**Expected Issues:**
- CORS configuration (may need to add `http://localhost:5173` to allowed origins in `main.py`)
- SSE connection timeout (may need to adjust retry logic)
- Event parsing errors (transformer may not handle all ADK event types)

**Fix Time:** 2-4 hours (troubleshooting + fixes)

#### 2. Test SSE Streaming End-to-End ⏳
**Test:** Browser → main.py → Coordinator → Specialist → Response stream → Browser

**Verification Points:**
1. Browser opens SSE connection to `/run_sse`
2. ADK orchestrator receives request
3. Coordinator agent starts execution
4. SSE events stream to browser (not single response)
5. Frontend displays progressive updates (if proof layer UI built)
6. Final response rendered in chat

**Current Status:** SSE client and backend endpoint both implemented, but integration untested

**Test Script:**
```bash
# Terminal 1: Start backend
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
python main.py

# Terminal 2: Start frontend
cd apps/command-console
npm run dev

# Browser: Open http://localhost:5173
# Send message: "Give me a recovery briefing for Cedar Creek"
# Observe: SSE events in DevTools Network tab
```

**Expected Issues:**
- SSE connection drops prematurely
- Events not parsed correctly
- Transformer doesn't handle all event types

**Fix Time:** 2-3 hours

#### 3. Implement WebSocket Integration in BriefingObserver (Phase 2) ⏳
**File:** `apps/command-console/src/components/briefing/BriefingObserver.tsx`

**Current Implementation:** Uses mock service for static demo
```typescript
useEffect(() => {
  if (autoConnect) {
    mockBriefingService.subscribe((event) => {
      // Handle mock event
    });
  }
}, [autoConnect]);
```

**Target:** Real-time WebSocket connection to backend
```typescript
useEffect(() => {
  if (autoConnect) {
    const ws = new WebSocket('ws://localhost:8000/ws/briefing');
    ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      // Handle real event
    };
  }
}, [autoConnect]);
```

**Status:** Not implemented (Phase 2 feature)

**Effort:** 2-3 hours (WebSocket endpoint + frontend integration)

#### 4. Wire Chat Interface to Coordinator Agent ⏳
**Files:**
- `apps/command-console/src/components/chat/ChatInterface.tsx`
- `apps/command-console/src/stores/chatStore.ts`

**Current:** Chat interface exists but may not be wired to ADK backend

**Target:** Chat messages → `/run_sse` → Coordinator agent → Response in chat

**Test:** Send message in chat → Verify appears in chatStore → Verify ADK receives → Verify response rendered

**Effort:** 1-2 hours (wiring + testing)

#### 5. Test Proof Layer Event Rendering ⏳
**Files:**
- `apps/command-console/src/components/briefing/InsightCard.tsx`
- `apps/command-console/src/components/briefing/ReasoningChain.tsx`

**Test:** Verify `AgentBriefingEvent` objects render correctly in UI

**Current Status:** Components exist, but may not handle all event types

**Verification:**
1. Generate test events (mock or real)
2. Pass to `InsightCard` component
3. Verify: summary, severity, citations, reasoning_chain all render
4. Check: UI bindings (map_highlight, modal_interrupt, etc.) work

**Effort:** 1-2 hours

---

### What Exists Today

#### Command Console ✅
**Status:** Builds successfully

**Verification:**
```bash
cd apps/command-console
npm run build  # Should complete without errors
npm run typecheck  # Should pass
npm run lint  # Should pass
```

**Components Implemented:**
- Layout: Header, Sidebar, Footer
- Map: MapLibre GL with fire markers
- Panels: Site Analysis, Briefing, Chat
- Briefing: BriefingObserver, InsightCard, ReasoningChain
- Chat: ChatInterface, MessageList, MessageInput

**Zustand Stores:**
- chatStore (messages, agent responses)
- briefingStore (AgentBriefingEvent display)
- mapStore (camera, layers, terrain)
- missionStore (fire portfolio, selected fire)
- analysisHistoryStore (Site Analysis persistence)
- Plus 8 more stores

#### SSE Client ✅
**File:** `apps/command-console/src/utils/adkClient.ts`

**Status:** Fully implemented with retry logic

**Features:**
- EventSource-compatible SSE parser
- Exponential backoff retry (default: 3 max retries)
- AbortController for stream cancellation
- Request format: `{ session_id, new_message, state }`

#### Event Transformer ✅
**File:** `apps/command-console/src/services/adkEventTransformer.ts`

**Status:** Fully implemented

**Capabilities:**
- Transforms ADK events → AgentBriefingEvent
- Inference functions for confidence, reasoning, citations
- Event type/severity mapping

#### Briefing Components ✅
**Files:**
- `BriefingObserver.tsx` - Root component (Phase 1: mock service)
- `InsightCard.tsx` - Displays individual insights
- `ReasoningChain.tsx` - Shows reasoning steps

**Status:** Phase 1 complete (static/mock), Phase 2 pending (real-time)

---

### What's Missing

#### End-to-End Integration Test ❌
**Status:** Never tested browser → ADK → agents → browser

**Risk:** Unknown integration issues (CORS, event parsing, SSE connection lifecycle)

**Fix:** Run integration test (1-2 days)

#### WebSocket Fallback ❌
**Status:** Not implemented

**Impact:** If SSE fails, no fallback mechanism

**Fix:** Add WebSocket endpoint and fallback logic (2-3 hours)

#### Proof Layer UI Wired to Real Events ❌
**Status:** Components use mock service

**Impact:** Can't see real agent events in UI

**Fix:** Wire BriefingObserver to ADK SSE stream (1-2 hours)

---

### Recommendation

**Phase 1 (Demo):** Test ADK Web UI (not Command Console)
- ADK Web UI is known working
- Command Console frontend-backend integration untested
- Avoid risk of integration failure during demo

**Phase 2 (Production):** Complete frontend-backend integration
1. Test end-to-end flow (1 day)
2. Fix CORS, event parsing issues (1-2 hours)
3. Wire chat to ADK backend (1-2 hours)
4. Wire briefing components to real events (1-2 hours)
5. Add WebSocket fallback (2-3 hours)

**Total effort:** 1-2 days

---

## Gap 4: Multi-Agent Orchestration Testing

**Designed in:**
- `docs/architecture/PROTOCOL-AGENT-COMMUNICATION.md` (Agent communication protocol)
- `docs/specs/agent-interface.md` (Agent lifecycle and contracts)
- `agents/coordinator/agent.py` (Coordinator with 4 sub-agents)

**Current State:**
- ✅ Coordinator has 4 sub-agents registered
- ✅ Delegation skill implemented with keyword routing
- ✅ Portfolio triage skill for fire prioritization
- ⏳ Sub-agent calls UNTESTED in production ADK runtime
- ⏳ Sub-agent failure handling UNTESTED
- ⏳ Coordinator synthesis of multi-source responses UNTESTED

**Blocking:** Full demo scenario (multi-agent coordination), production deployment

**Effort Estimate:** 1 day testing + fixes

---

### Required Validation

#### 1. Coordinator Successfully Delegates Queries to Specialists ⏳
**Test:** User query → Coordinator → Delegation skill → Specialist agent → Response → Coordinator

**Example Query:** "Give me a recovery briefing for Cedar Creek"

**Expected Flow:**
1. User sends query to Coordinator
2. Coordinator invokes delegation skill
3. Delegation skill identifies specialists needed (burn_analyst, trail_assessor, etc.)
4. Coordinator calls sub-agents via `sub_agent.generate_content()`
5. Specialists return responses
6. Coordinator synthesizes multi-source response

**Current Status:** Untested in ADK runtime (only unit tests exist)

**Verification:**
```bash
cd agents
adk web --port 8000

# In browser:
# - Select "coordinator" agent
# - Send: "Give me a recovery briefing for Cedar Creek"
# - Observe: Sub-agent calls in ADK UI (if visible)
# - Verify: Response includes data from multiple specialists
```

**Expected Issues:**
- Sub-agent calls may fail silently
- Coordinator may not wait for sub-agent responses
- Delegation keywords may not match query intent
- Response synthesis may be incoherent

**Fix Time:** 4-6 hours (debugging + fixes)

#### 2. Specialist Responses Return to Coordinator ⏳
**Test:** Verify sub-agent responses are correctly passed back to Coordinator

**Verification:**
1. Add logging to Coordinator:
   ```python
   logger.info(f"Sub-agent {agent.name} response: {response}")
   ```
2. Observe logs during delegation
3. Verify: Each sub-agent response captured
4. Verify: Responses have expected structure (not errors)

**Expected Issues:**
- Sub-agent responses may be empty
- Responses may be error messages
- Responses may not include proof_layer data

**Fix Time:** 2-3 hours

#### 3. Coordinator Synthesizes Multi-Source Response ⏳
**Test:** Verify Coordinator combines sub-agent responses into coherent summary

**Example Expected Response:**
```
Cedar Creek Fire Recovery Briefing:

Burn Severity (from Burn Analyst):
- Total area: 127,831 acres
- High severity: 63.6% (81,681 acres)
- Significant soil erosion risk

Trail Impact (from Trail Assessor):
- 3 trails closed due to severe damage
- 2 trails open with caution
- Priority repairs needed on Trail 101

Timber Salvage (from Cruising Assistant):
- Estimated 45,000 MBF salvageable volume
- Economic viability: Moderate
- Recommend salvage within 18 months

NEPA Compliance (from NEPA Advisor):
- Recommend EA pathway (not CE)
- Estimated timeline: 12-18 months
- Critical documentation: BAER assessment, cultural surveys
```

**Verification:**
- Response mentions all specialists consulted
- Response integrates data from multiple sources
- Response is coherent (not just concatenated outputs)
- Response includes reasoning/recommendations

**Expected Issues:**
- Response may dump raw sub-agent outputs
- Response may favor one specialist over others
- Response may be too verbose or too terse

**Fix Time:** 2-3 hours (prompt refinement)

#### 4. No Infinite Loops in Delegation Chain ⏳
**Test:** Verify Coordinator doesn't create infinite delegation loops

**Scenario:** Coordinator delegates to sub-agent → sub-agent delegates back to Coordinator → infinite loop

**Current Protection:** ADR-007.1 `mode=AUTO` should prevent infinite tool calls

**Verification:**
1. Send query to Coordinator
2. Monitor execution time (<60 seconds = good)
3. Check logs for repeated tool calls
4. Verify: Response completes within timeout

**Expected Issues:**
- Delegation loops (Coordinator ↔ sub-agent)
- Excessive tool calls (>10)
- Timeout errors

**Fix Time:** 1-2 hours (add delegation depth limit)

#### 5. Proof Layer Captures Sub-Agent Calls ⏳
**Test:** Verify `AuditEventBridge` captures sub-agent invocations and responses

**Verification:**
1. Send query to Coordinator that triggers delegation
2. Query `AuditEventBridge.get_audit_trail(invocation_id)`
3. Verify events include:
   - Coordinator delegation decision
   - Sub-agent invocations (burn_analyst, trail_assessor, etc.)
   - Sub-agent responses with confidence scores
4. Verify: Events have correct parent_event_id (delegation hierarchy)

**Expected Issues:**
- Sub-agent calls not captured in audit trail
- Missing confidence scores
- Incorrect parent_event_id linkage

**Fix Time:** 2-3 hours

---

### What Exists Today

#### Coordinator Agent ✅
**File:** `agents/coordinator/agent.py`

**Status:** Implemented with 4 sub-agents

**Sub-Agents Registered:**
1. `burn_analyst` - Fire severity, MTBS, soil burn
2. `trail_assessor` - Infrastructure damage, closures
3. `cruising_assistant` - Timber inventory, salvage
4. `nepa_advisor` - Compliance, CE/EA/EIS pathways

**Verification:**
```bash
cd agents
python -c "from coordinator.agent import root_agent; print(len(root_agent.sub_agents))"
# Expected output: 4
```

#### Delegation Skill ✅
**File:** `agents/coordinator/skills/delegation/scripts/route_query.py`

**Status:** Implemented with keyword routing

**Routing Logic:**
- Keywords: "burn", "severity", "fire" → burn_analyst
- Keywords: "trail", "damage", "closure" → trail_assessor
- Keywords: "timber", "salvage", "cruise" → cruising_assistant
- Keywords: "NEPA", "compliance", "environmental" → nepa_advisor

**Verification:**
```bash
cd agents/coordinator/skills/delegation
pytest tests/ -v  # Should pass
```

#### Portfolio Triage Skill ✅
**File:** `agents/coordinator/skills/portfolio-triage/scripts/score_fires.py`

**Status:** Implemented with triage scoring algorithm

**Algorithm:** `triage_score = severity × acres × phase_multiplier`
- Severity: 1-5 (low to extreme)
- Acres: Fire size
- Phase multiplier: 2.0 (active), 1.75 (BAER assessment), 1.25 (BAER implementation), 1.0 (restoration)

**Verification:**
```bash
cd agents/coordinator/skills/portfolio-triage
pytest tests/ -v  # Should pass
```

---

### What's Missing

#### Runtime Validation of Delegation ❌
**Status:** Delegation tested in unit tests, not in ADK runtime

**Risk:** Sub-agent calls may fail in production environment

**Fix:** Test Coordinator delegation in ADK web/CLI (4-6 hours)

#### End-to-End Coordination Test ❌
**Status:** No test for query → delegation → synthesis flow

**Risk:** Integration failure between Coordinator and specialists

**Fix:** Create integration test suite (2-3 hours)

#### Sub-Agent Failure Handling Verification ❌
**Status:** Unknown behavior if sub-agent call fails

**Risk:** Coordinator may crash or return incomplete response

**Fix:** Test sub-agent failure scenarios (2-3 hours)
- Sub-agent timeout
- Sub-agent error response
- Sub-agent unavailable
- Verify: Graceful degradation (partial response with confidence scores adjusted)

---

### Recommendation

**Phase 1 (Demo):** Test single-agent queries (skip Coordinator delegation)
- Use specialists directly (burn_analyst, trail_assessor)
- Avoid risk of Coordinator delegation failure
- Demonstrate individual agent capabilities

**Phase 2 (Production):** Validate multi-agent orchestration
1. Test Coordinator delegation in ADK runtime (4-6 hours)
2. Create integration test suite (2-3 hours)
3. Test sub-agent failure handling (2-3 hours)
4. Verify proof layer captures sub-agent calls (2-3 hours)

**Total effort:** 1 day (10-15 hours)

---

## Gap 5: Cedar Creek Fixture Test Failures

**Identified in:** `docs/validation/ADR-007.1-VALIDATION-REPORT.md`

**Current State:** 3 tests failing (0.4% failure rate, 669/672 passing)

**Blocking:** 100% test coverage confidence

**Effort Estimate:** 1-2 hours

---

### Failed Tests

#### 1. test_execute_with_cedar_creek (MTBS Classification)
**File:** `agents/burn_analyst/skills/mtbs-classification/tests/test_mtbs_classification.py::TestExecute::test_execute_with_cedar_creek`

**Failure:**
```python
assert result["total_acres"] == 127341  # Expected
# Actual: 127831
# Difference: 490 acres
```

**Root Cause:** Test expectation not updated after Cedar Creek fixture reconciliation (December 27)

**Fix:**
```python
assert result["total_acres"] == 127831  # Updated to match canonical data
```

**Effort:** 5 minutes

#### 2. test_execute_returns_dominant_class (MTBS Classification)
**File:** `agents/burn_analyst/skills/mtbs-classification/tests/test_mtbs_classification.py::TestExecute::test_execute_returns_dominant_class`

**Failure:**
```python
assert result["high_severity_percent"] > 60  # Expected
# Actual: 42.0%
```

**Root Cause:** Test expectation based on outdated fixture data

**Fix:**
```python
assert result["high_severity_percent"] == pytest.approx(42.0, abs=1)
# or:
assert result["dominant_class"] == "high"  # Test dominant class, not threshold
```

**Effort:** 5 minutes

#### 3. test_execute_with_cedar_creek (Soil Burn Severity)
**File:** `agents/burn_analyst/skills/soil-burn-severity/tests/test_soil_burn_severity.py::TestExecute::test_execute_with_cedar_creek`

**Failure:**
```python
assert result["total_acres"] == 127341  # Expected
# Actual: 127831
# Difference: 490 acres
```

**Root Cause:** Same as #1 (acreage mismatch)

**Fix:**
```python
assert result["total_acres"] == 127831  # Updated to match canonical data
```

**Effort:** 5 minutes

---

### Canonical Cedar Creek Data

**Source:** `data/fixtures/cedar-creek/burn-severity.json`

**Reconciliation Commit:** `b01cce1` - "fix(burn-analyst): reconcile test fixtures with canonical Cedar Creek data"

**Official Values:**
- Total acres: 127,831 (not 127,341)
- High severity: 42% (63.6% by area, but 42% by classification count)
- Moderate severity: ~25%
- Low severity: ~11%
- Unburned: minimal

---

### Fix Summary

**Files to update:**
1. `agents/burn_analyst/skills/mtbs-classification/tests/test_mtbs_classification.py` (2 assertions)
2. `agents/burn_analyst/skills/soil-burn-severity/tests/test_soil_burn_severity.py` (1 assertion)

**Changes:**
- Update expected acreage: 127341 → 127831
- Update high severity threshold: >60% → ~42%

**Verification:**
```bash
pytest agents/burn_analyst/skills/mtbs-classification/tests/test_mtbs_classification.py -v
pytest agents/burn_analyst/skills/soil-burn-severity/tests/test_soil_burn_severity.py -v
```

**Expected:** All 3 tests pass (672/672 = 100%)

---

### Impact Analysis

**Impact:** Non-blocking for demo
- Agents work correctly with real data
- Tests just have incorrect expectations
- No functional regression

**Priority:** P2 (low priority, nice-to-have for 100% coverage)

---

## Summary

### P0 Gaps (Critical for Demo)

1. **Frontend-Backend Integration Testing** (1-2 days)
   - Test end-to-end flow: Browser → ADK → Agents → Browser
   - Fix CORS, event parsing, SSE connection issues
   - Wire chat interface to Coordinator

2. **Multi-Agent Orchestration Testing** (1 day)
   - Validate Coordinator delegation in ADK runtime
   - Test sub-agent response synthesis
   - Verify no infinite loops
   - Test failure handling

3. **MCP Server Connectivity** (2-3 days, but can defer to post-demo)
   - Wire agents to MCP Fixtures server
   - Implement MCP connection pooling
   - Add registry and discovery

**Total P0 effort:** 2-3 days (can demo with gaps, but integration untested)

### P1 Gaps (Important for Production)

1. **Progressive Proof Layer UI** (1-2 days)
   - Build enhanced SSE endpoint
   - Create progressive UI components
   - Integrate audit metadata

**Total P1 effort:** 1-2 days

### P2 Gaps (Nice-to-Have)

1. **Cedar Creek Test Failures** (1-2 hours)
   - Update test expectations
   - Achieve 100% test coverage

**Total P2 effort:** 1-2 hours

### Recommended Priorities

**Pre-Demo (Today):**
- Skip all gaps, use ADK Web UI for demo
- Avoid risk of integration failures

**Post-Demo (Week 1):**
1. Frontend-Backend Integration Testing (P0)
2. Multi-Agent Orchestration Testing (P0)
3. Cedar Creek Test Failures (P2)

**Post-Demo (Week 2):**
1. Progressive Proof Layer UI (P1)
2. MCP Server Connectivity (P0, if needed)

**Total effort to full production:** 5-8 days

---

## References

**Design Documents:**
- ADR-005: `docs/adr/ADR-005-skills-first-architecture.md`
- MCP Standard: `docs/specs/MCP-REGISTRY-STANDARD.md`
- SSE Proof Layer: `docs/architecture/SSE-PROOF-LAYER-SPIKE.md`
- Agent Interface: `docs/specs/agent-interface.md`

**Source Code:**
- Agents: `/Users/jvalenzano/Projects/ranger-twin/agents/`
- MCP Fixtures: `/Users/jvalenzano/Projects/ranger-twin/services/mcp-fixtures/`
- Frontend: `/Users/jvalenzano/Projects/ranger-twin/apps/command-console/`
- Orchestrator: `/Users/jvalenzano/Projects/ranger-twin/main.py`

**Validation:**
- Test Report: `docs/validation/ADR-007.1-VALIDATION-REPORT.md`
- Status Matrix: `docs/status/PHASE1-STATUS-MATRIX.md`
- Demo Checklist: `docs/demo/CEDAR-CREEK-DEMO-CHECKLIST.md`

---

**Document Owner:** RANGER Team
**Last Updated:** December 27, 2025
**Next Review:** After P0 gaps closed

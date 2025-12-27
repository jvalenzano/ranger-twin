# SSE Proof Layer Streaming Architecture - Technical Spike

**Author:** Claude Code
**Date:** December 27, 2025
**Status:** Design Document
**Target:** `docs/architecture/SSE-PROOF-LAYER-SPIKE.md`

---

## Executive Summary

This technical spike defines how RANGER's Proof Layer audit callbacks transform into real-time SSE events that populate the AgentBriefingEvent proof_layer schema. The architecture enables federal compliance transparency by streaming reasoning steps, citations, and confidence scores as agents execute, rather than only after completion.

**Key Innovation:** Hybrid progressive disclosure - status updates stream incrementally (reasoning steps), while complete proof layer data aggregates at tool completion.

---

## 1. Current State Analysis

### 1.1 What Exists

**ADR-007 Three-Tier Tool Invocation:**
- **Tier 1 (API):** `mode="ANY"` enforces tool calls via Gemini API
- **Tier 2 (Reasoning):** ReAct pattern in agent instructions
- **Tier 3 (Audit):** Callbacks log tool invocations to Python logger

**Location:** `agents/trail_assessor/agent.py:353-408`

```python
def before_tool_audit(tool, args, tool_context):
    logger.info("TOOL_INVOCATION", extra={
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agent": "trail_assessor",
        "tool": tool.name,
        "parameters": args,
        "session_id": getattr(tool_context, 'session_id', 'unknown'),
        "enforcement": "API-level mode=ANY"
    })
```

**SSE Streaming Pipeline:**
```
ADK Agent → main.py /run_sse → adkClient.ts → adkEventTransformer.ts → AgentBriefingEvent
```

**Proof Layer Schema (v1.1.0):**
```typescript
interface ProofLayer {
  confidence: number;                    // Overall 0-1
  confidence_ledger?: ConfidenceLedger;  // Currently always null ⚠️
  citations: Citation[];                 // Generic fallbacks ⚠️
  reasoning_chain: string[];             // Heuristic text parsing ⚠️
}
```

### 1.2 Critical Gaps

1. **Audit logs stay in Python logger** - Never reach SSE stream
2. **confidence_ledger always null** - No per-input granularity
3. **Citations are generic** - Not linked to actual data sources
4. **Reasoning chains inferred** - Text parsing vs. structured logs
5. **No real-time updates** - Proof layer only shows after completion

---

## 2. Architecture Design

### 2.1 Component Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    ADK Agent (Python)                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │before_tool   │──▶│ Tool Execute │──▶│ after_tool   │     │
│  │  callback    │   │              │   │  callback    │     │
│  └──────┬───────┘   └──────────────┘   └──────┬───────┘     │
│         │                                       │             │
│         │      ┌────────────────────┐          │             │
│         └─────▶│ AuditEventBridge   │◀─────────┘             │
│                │ (Session-scoped)   │                        │
│                └──────────┬─────────┘                        │
└───────────────────────────┼──────────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │  AuditEventStore        │
               │  (In-memory buffer)     │
               │  Key: invocationId      │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Enhanced SSE Stream    │
               │  /run_sse_enhanced      │
               │  (injects _audit_meta)  │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  adkClient.ts           │
               │  Parse _audit_metadata  │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  adkEventTransformer.ts │
               │  Build ProofLayer       │
               └─────────────────────────┘
```

### 2.2 Core Components

#### A. AuditEventBridge (New - Python)

**Location:** `packages/agent-common/agent_common/audit_bridge.py`

**Purpose:** Session-scoped singleton capturing audit callbacks and injecting them into SSE stream

**Key Classes:**
```python
@dataclass
class ToolInvocationEvent:
    event_type: str = "tool_invocation"
    timestamp: str
    agent: str
    tool: str
    parameters: dict
    invocation_id: str
    session_id: str

@dataclass
class ToolResponseEvent:
    event_type: str = "tool_response"
    timestamp: str
    agent: str
    tool: str
    status: str
    confidence: float
    data_sources: list[str]
    reasoning_chain: list[str]
    invocation_id: str

class AuditEventBridge:
    """Buffers audit events by invocationId for SSE injection."""

    def record_tool_invocation(event: ToolInvocationEvent)
    def record_tool_response(event: ToolResponseEvent)
    def get_audit_trail(invocation_id: str) -> list[dict]
    def clear_invocation(invocation_id: str)
```

#### B. Enhanced SSE Endpoint (Modified - Python)

**Location:** `main.py`

**Modification:** Create `/run_sse_enhanced` endpoint that wraps ADK runner and injects audit metadata

```python
@app.post("/run_sse_enhanced")
async def run_sse_enhanced(request: dict):
    """Enhanced SSE with audit metadata injection."""
    async def stream_with_audit():
        async for event in runner.run_async(...):
            event_dict = event.model_dump()

            # Inject audit metadata
            invocation_id = event_dict.get("invocationId")
            if invocation_id:
                audit_trail = get_audit_bridge().get_audit_trail(invocation_id)
                event_dict["_audit_metadata"] = audit_trail

            yield f"data: {json.dumps(event_dict)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_with_audit(), media_type="text/event-stream")
```

#### C. Enhanced ADKEvent Interface (Modified - TypeScript)

**Location:** `apps/command-console/src/utils/adkClient.ts`

```typescript
export interface ADKEvent {
  id: string;
  invocationId?: string;
  author?: string;
  content?: ADKEventContent;
  actions?: ADKActions;
  partial: boolean;
  _audit_metadata?: AuditTrailEvent[];  // NEW
}

export interface AuditTrailEvent {
  event_type: 'tool_invocation' | 'tool_response' | 'tool_error';
  timestamp: string;
  agent: string;
  tool: string;
  confidence?: number;
  data_sources?: string[];
  reasoning_chain?: string[];
}
```

#### D. Enhanced Transformer (Modified - TypeScript)

**Location:** `apps/command-console/src/services/adkEventTransformer.ts`

**New Functions:**
```typescript
function extractConfidence(event: ADKEvent): number {
  // Check audit metadata first
  const toolResponse = event._audit_metadata?.find(
    e => e.event_type === 'tool_response'
  );
  if (toolResponse?.confidence) {
    return toolResponse.confidence;
  }
  // Fallback to existing heuristic
  return extractConfidenceFromText(event);
}

function buildConfidenceLedger(event: ADKEvent): ConfidenceLedger | null {
  const toolResponse = event._audit_metadata?.find(
    e => e.event_type === 'tool_response'
  );

  if (!toolResponse?.data_sources) return null;

  return {
    inputs: toolResponse.data_sources.map(source => ({
      source,
      confidence: toolResponse.confidence,
      tier: toolResponse.confidence >= 0.9 ? 1 :
            toolResponse.confidence >= 0.7 ? 2 : 3,
      notes: `From ${toolResponse.tool} execution`
    })),
    analysis_confidence: toolResponse.confidence,
    recommendation_confidence: toolResponse.confidence
  };
}
```

---

## 3. Event Schema Mapping

### 3.1 Audit Event Types (7 Core Types)

| Event Type | Purpose | Emitted By | Maps To |
|------------|---------|------------|---------|
| `tool_invocation` | Tool call initiated | `before_tool_audit` | Tracking |
| `tool_response` | Tool completed | `after_tool_audit` | confidence, citations, reasoning |
| `tool_error` | Tool failed | `on_tool_error_audit` | confidence=0.0 |
| `mcp_fetch` | MCP data retrieval | MCP wrapper | citations, tier |
| `data_load` | Fixture loaded | Skill script | citations, tier |
| `reasoning_step` | Logic logged | Skill execution | reasoning_chain |
| `confidence_calc` | Confidence computed | Skill aggregation | confidence_ledger |

### 3.2 tool_response Event Schema

```json
{
  "event_type": "tool_response",
  "event_id": "evt_002",
  "timestamp": "2025-12-27T10:30:05.234Z",
  "correlation_id": "inv_abc123",
  "agent": "trail_assessor",
  "session_id": "sess_xyz",
  "parent_event_id": "evt_001",

  "payload": {
    "tool_name": "classify_damage",
    "skill_id": "damage-classification",
    "status": "success",
    "execution_time_ms": 5234,

    "confidence": 0.90,
    "data_sources": ["Cedar Creek field assessment 2022-10-25"],
    "reasoning_steps": [
      "Loaded 5 trails with 15 total damage points",
      "WL-001: Severity 5 classified as TYPE_IV"
    ]
  }
}
```

### 3.3 Mapping Rules

**Rule 1: Confidence → proof_layer.confidence**
```python
def calculate_overall_confidence(audit_events: list) -> float:
    tool_response = find_event_by_type(audit_events, "tool_response")
    return tool_response.payload.confidence if tool_response else 0.0
```

**Rule 2: Data Sources → proof_layer.citations[]**
```python
def build_citations(audit_events: list) -> list[Citation]:
    citations = []
    for event in filter_by_type(audit_events, ["data_load", "mcp_fetch"]):
        fire_id = event.payload.fire_id
        citations.append({
            "source_type": "RANGER-Fixtures",
            "id": fire_id,
            "uri": f"ranger://fixtures/{fire_id}",
            "excerpt": event.payload.data_source_label
        })
    return citations
```

**Rule 3: Reasoning Steps → proof_layer.reasoning_chain[]**
```python
def build_reasoning_chain(audit_events: list) -> list[str]:
    chain = []

    # Add reasoning_step events
    for event in filter_by_type(audit_events, ["reasoning_step"]):
        chain.append(event.payload.description)

    # Add tool_response reasoning
    tool_response = find_event_by_type(audit_events, "tool_response")
    if tool_response?.reasoning_steps:
        chain.extend(tool_response.reasoning_steps)

    return sorted(chain, key=lambda e: e.timestamp)
```

**Rule 4: Data Sources → confidence_ledger.inputs[]**
```python
def build_confidence_ledger(audit_events: list) -> ConfidenceLedger:
    inputs = []

    for event in filter_by_type(audit_events, ["data_load", "mcp_fetch"]):
        inputs.append({
            "source": event.payload.data_source_label,
            "confidence": event.payload.data_confidence,
            "tier": event.payload.data_tier,
            "notes": event.payload.get("notes", "")
        })

    tool_response = find_event_by_type(audit_events, "tool_response")

    return {
        "inputs": inputs,
        "analysis_confidence": tool_response.confidence,
        "recommendation_confidence": tool_response.confidence - 0.03
    }
```

### 3.4 Data Tier Classification (Phase 1)

| Data Source | Tier | Confidence | Notes |
|-------------|------|------------|-------|
| Cedar Creek Fixtures | 3 | 0.70-0.80 | Simulated Phase 1 data |
| User Parameters | 2 | 0.75-0.85 | Manually entered |
| Skill Calculations | 2 | 0.80-0.90 | Derived from Tier 3 |

---

## 4. Frontend Subscription Pattern

### 4.1 Design Decision: Hybrid Progressive Disclosure

**Pattern:** Stream reasoning steps incrementally + buffer final proof layer

**Rationale:**
- **User Trust:** Real-time reasoning builds confidence
- **Performance:** 300ms buffering prevents UI thrashing
- **Compliance:** Complete audit trail at completion

### 4.2 New Hook: useProofLayerStream

**Location:** `apps/command-console/src/hooks/useProofLayerStream.ts` (NEW)

```typescript
export interface ProofLayerStreamState {
  reasoningSteps: ReasoningStep[];
  citations: Citation[];
  confidenceHistory: ConfidenceUpdate[];
  currentConfidence: number;
  isComplete: boolean;
  eventCount: number;
}

export function useProofLayerStream(options: {
  correlationId: string;
  bufferMs?: number;  // Default: 300ms
  enableProgressiveReasoning?: boolean;  // Default: true
}) {
  const [state, setState] = useState<ProofLayerStreamState>(initial);
  const bufferRef = useRef<ProofLayerEvent[]>([]);

  // Buffer events to prevent UI thrashing
  const bufferEvent = useCallback((event: ProofLayerEvent) => {
    bufferRef.current.push(event);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(flushBuffer, options.bufferMs ?? 300);
  }, []);

  // Process buffered events in sequence order
  const flushBuffer = useCallback(() => {
    const events = bufferRef.current.sort((a, b) => a.sequence - b.sequence);
    bufferRef.current = [];

    setState(prev => applyEvents(prev, events));
  }, []);

  return { ...state, bufferEvent };
}
```

### 4.3 Enhanced Event Types

```typescript
export interface ADKProofLayerEvent extends ADKEvent {
  proof_type?: 'reasoning_step' | 'citation_accessed' | 'confidence_update';
  sequence?: number;
  proof_data?: {
    step?: string;
    citation?: Citation;
    confidence?: number;
  };
}

export interface ReasoningStep {
  sequence: number;
  text: string;
  timestamp: string;
  confidence?: number;
  citations?: string[];
}
```

### 4.4 UI Components

**ProgressiveReasoningChain** (NEW)
```typescript
// Shows steps incrementally with auto-scroll
<ProgressiveReasoningChain
  steps={proofLayer.reasoningSteps}
  isComplete={proofLayer.isComplete}
/>
```

**StreamingConfidenceGauge** (NEW)
```typescript
// Shows confidence building over time
<StreamingConfidenceGauge
  history={proofLayer.confidenceHistory}
  current={proofLayer.currentConfidence}
/>
```

**CitationStream** (NEW)
```typescript
// Citations appear as data sources accessed
<CitationStream
  citations={proofLayer.citations}
  activeStepCitations={currentStep.citations}
/>
```

### 4.5 Update Strategy (Three Tiers)

**Tier 1: Immediate (< 100ms)**
- Critical alerts
- Error states
- Final responses

**Tier 2: Buffered Progressive (300ms)**
- Reasoning steps
- Citations
- Confidence updates

**Tier 3: Debounced Aggregate (1s)**
- Audit logs (opt-in)
- Status updates
- Metadata

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Backend - Week 1)

**Deliverables:**
1. Create `AuditEventBridge` class in `packages/agent-common/agent_common/audit_bridge.py`
2. Define `ToolInvocationEvent`, `ToolResponseEvent`, `ToolErrorEvent` dataclasses
3. Unit tests for event buffering and retrieval

**Files to Create:**
- `packages/agent-common/agent_common/audit_bridge.py`
- `tests/audit/test_audit_bridge.py`

### Phase 2: Agent Integration (Week 1)

**Deliverables:**
1. Modify `trail_assessor/agent.py` callbacks to publish to `AuditEventBridge`
2. Verify logging + bridge publication
3. Test with local ADK runner

**Files to Modify:**
- `agents/trail_assessor/agent.py` (lines 353-408)

### Phase 3: SSE Enhancement (Week 2)

**Deliverables:**
1. Create `/run_sse_enhanced` endpoint in `main.py`
2. Implement audit metadata injection middleware
3. Test SSE stream includes `_audit_metadata` field

**Files to Modify:**
- `main.py`

### Phase 4: Frontend Integration (Week 2)

**Deliverables:**
1. Update `ADKEvent` interface with `_audit_metadata`
2. Modify `adkEventTransformer.ts` to use audit metadata
3. Implement `buildConfidenceLedger()` function

**Files to Modify:**
- `apps/command-console/src/utils/adkClient.ts`
- `apps/command-console/src/services/adkEventTransformer.ts`

### Phase 5: Progressive UI (Week 3)

**Deliverables:**
1. Create `useProofLayerStream` hook
2. Build `ProgressiveReasoningChain` component
3. Build `StreamingConfidenceGauge` component

**Files to Create:**
- `apps/command-console/src/hooks/useProofLayerStream.ts`
- `apps/command-console/src/components/briefing/ProgressiveReasoningChain.tsx`
- `apps/command-console/src/components/briefing/StreamingConfidenceGauge.tsx`

### Phase 6: Rollout (Week 4)

**Deliverables:**
1. Apply pattern to `burn_analyst`, `cruising_assistant`, `nepa_advisor`
2. E2E tests for proof layer population
3. Documentation update

---

## 6. Critical Files Reference

### Backend (Python)

| File | Purpose | Status |
|------|---------|--------|
| `packages/agent-common/agent_common/audit_bridge.py` | Core audit event capture | **NEW** |
| `agents/trail_assessor/agent.py` | Reference callback implementation | **MODIFY** (lines 353-408) |
| `main.py` | SSE endpoint with audit injection | **MODIFY** |
| `packages/agent-common/agent_common/types/briefing.py` | Proof layer types (reference) | READ-ONLY |

### Frontend (TypeScript)

| File | Purpose | Status |
|------|---------|--------|
| `apps/command-console/src/utils/adkClient.ts` | SSE client with audit metadata | **MODIFY** |
| `apps/command-console/src/services/adkEventTransformer.ts` | Proof layer builder | **MODIFY** |
| `apps/command-console/src/hooks/useProofLayerStream.ts` | Progressive subscription hook | **NEW** |
| `apps/command-console/src/components/briefing/ProgressiveReasoningChain.tsx` | Real-time reasoning UI | **NEW** |
| `apps/command-console/src/types/briefing.ts` | Type definitions (reference) | READ-ONLY |

---

## 7. Success Criteria

- [ ] `AuditEventBridge` captures all tool invocations/responses/errors
- [ ] SSE stream includes `_audit_metadata` for events with `invocationId`
- [ ] Frontend `AgentBriefingEvent` has populated `confidence_ledger`
- [ ] Proof layer confidence scores match tool output (no inference)
- [ ] Reasoning chains come directly from skill execution logs
- [ ] Citations include tool-provided `data_sources`
- [ ] Memory usage bounded (no audit event leaks)
- [ ] All 5 agents emit audit metadata
- [ ] Federal compliance: Full decision chain reconstructable from audit trail

---

## 8. Key Trade-offs & Decisions

### Decision 1: Unified vs. Separate SSE Stream

**Choice:** Unified stream with `_audit_metadata` field

**Rationale:**
- Simpler client-side implementation
- Guaranteed correlation via `invocationId`
- No additional stream management overhead

### Decision 2: Event Buffering Strategy

**Choice:** Per-invocation lifecycle with explicit cleanup

**Implementation:**
```python
if event.partial == False:  # Final event
    get_audit_bridge().clear_invocation(invocation_id)
```

**Benefits:**
- Bounded memory
- Natural cleanup tied to event lifecycle

### Decision 3: Progressive vs. Batch Updates

**Choice:** Hybrid - progressive reasoning + batch proof layer

**Pattern:**
- Stream `status_update` events for reasoning steps (real-time)
- Buffer complete `insight` with full proof layer (on completion)

**UX Benefit:** Users see thinking process without final data incompleteness

---

## 9. Appendix: Event Flow Example

### User Query
```
"What damage is on trails in Cedar Creek?"
```

### Event Sequence

**1. before_tool_callback fires**
```json
{"event_type": "tool_invocation", "tool": "classify_damage", "invocation_id": "abc-123"}
```
→ Published to `AuditEventBridge`

**2. Tool executes**
```python
return {
  "confidence": 0.90,
  "reasoning_chain": ["Loaded 5 trails", "WL-001: TYPE_IV"],
  "data_sources": ["Cedar Creek field assessment"]
}
```

**3. after_tool_callback fires**
```json
{"event_type": "tool_response", "confidence": 0.90, "invocation_id": "abc-123"}
```
→ Published to `AuditEventBridge`

**4. ADK emits response event**
```json
{"id": "evt-001", "invocationId": "abc-123", "author": "trail_assessor", "content": {...}}
```

**5. SSE middleware injects**
```json
{
  "id": "evt-001",
  "invocationId": "abc-123",
  "_audit_metadata": [
    {"event_type": "tool_invocation", ...},
    {"event_type": "tool_response", "confidence": 0.90, ...}
  ]
}
```

**6. Frontend transformer builds**
```typescript
{
  proof_layer: {
    confidence: 0.90,  // From audit metadata
    confidence_ledger: {  // NEWLY POPULATED
      inputs: [{source: "Cedar Creek...", confidence: 0.90, tier: 3}]
    },
    reasoning_chain: ["Loaded 5 trails", "WL-001: TYPE_IV"],
    citations: [{source_type: "RANGER-Fixtures", ...}]
  }
}
```

---

**End of Technical Spike**

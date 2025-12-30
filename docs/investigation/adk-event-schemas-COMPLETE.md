# ADK Event Stream Schemas - COMPLETE CAPTURE

**Date:** 2024-12-30
**Session:** a98cb787-06c7-4358-88cb-5a571ca8b239
**Query:** "Give me a recovery briefing for Cedar Creek Fire"
**Status:** ✅ **SUCCESSFULLY CAPTURED**

---

## Executive Summary

**Total Events:** 5 ADK events captured
**Multi-Agent Delegation:** ✅ CONFIRMED - Coordinator invoked all 4 specialists
**Confidence Scores:** ✅ PRESENT - Embedded in specialist results (text format)
**Citations:** ✅ PRESENT - Embedded in specialist results (text format)
**Proof Layer Field:** ❌ NOT PRESENT - No separate `proof_layer` object

---

## Event Flow Sequence

### Event 1: Coordinator Delegates to All 4 Specialists

**Type:** Model response with `functionCall` parts
**Author:** `coordinator`
**Purpose:** Parallel delegation to all specialists

**Schema:**
```json
{
  "modelVersion": "gemini-2.0-flash",
  "content": {
    "parts": [
      {"functionCall": {"id": "adk-...", "args": {"request": "fire_id:cedar-creek-2022"}, "name": "burn_analyst"}},
      {"functionCall": {"id": "adk-...", "args": {"request": "fire_id:cedar-creek-2022"}, "name": "trail_assessor"}},
      {"functionCall": {"id": "adk-...", "args": {"request": "fire_id:cedar-creek-2022"}, "name": "cruising_assistant"}},
      {"functionCall": {"id": "adk-...", "args": {"request": "fire_id:cedar-creek-2022"}, "name": "nepa_advisor"}}
    ],
    "role": "model"
  },
  "invocationId": "e-a3237f79-5ffa-4fb8-b6b3-f71faa15d712",
  "author": "coordinator",
  "timestamp": 1767081391.059711
}
```

**Key Fields:**
- `invocationId` - Unique ID for this conversation turn
- `functionCall.name` - Specialist agent name
- `function Call.args` - Request parameters
- `functionCall.id` - Unique call ID for response matching

---

### Event 2: Function Responses from All 4 Specialists

**Type:** User-role content with `functionResponse` parts
**Author:** `coordinator`
**Purpose:** Return specialist results to coordinator

**Schema:**
```json
{
  "content": {
    "parts": [
      {
        "functionResponse": {
          "id": "adk-3ea2f26d-9a45-4d32-8544-c60c1afca831",
          "name": "burn_analyst",
          "response": {
            "result": "### 1. Summary\n...\n### 5. Confidence & Source\n**Confidence:** 92%\n**Source:** MTBS, Imagery date: 2022-09-15\n"
          }
        }
      },
      {
        "functionResponse": {
          "id": "adk-b44d14f4-fa1e-406a-90f0-6b0fb1a88661",
          "name": "trail_assessor",
          "response": {
            "result": "### 1. Summary\n...\n### 4. Confidence & Source\n**Confidence:** 90%\n**Source:** Cedar Creek field assessment 2022-10-25\n"
          }
        }
      }
      // ... cruising_assistant, nepa_advisor
    ],
    "role": "user"
  },
  "invocationId": "e-a3237f79-5ffa-4fb8-b6b3-f71faa15d712",
  "author": "coordinator",
  "timestamp": 1767081397.518132
}
```

**Critical Discovery:** Specialist responses include confidence and source **as formatted text**, not structured fields!

**Burn Analyst Result Format:**
```markdown
### 5. Confidence & Source
**Confidence:** 92%
**Source:** MTBS, Imagery date: 2022-09-15
```

**Trail Assessor Result Format:**
```markdown
### 4. Confidence & Source
**Confidence:** 90%
**Source:** Cedar Creek field assessment 2022-10-25
```

---

### Event 3-5: Coordinator Follow-Up and Synthesis

**Pattern:** Coordinator asks follow-up questions to specialists, then synthesizes final answer.

**Final Event Schema (Coordinator Synthesis):**
```json
{
  "modelVersion": "gemini-2.0-flash",
  "content": {
    "parts": [
      {
        "text": "**Fire Severity:** ... (Confidence: 92%)\n\n**Infrastructure Damage:** ... (Confidence: 90%)\n\n**Timber Salvage:** ... (Confidence: 91%)\n\n**NEPA Pathway:** ... (Confidence: 95% for timber, 90% for trails)\n\n**Overall Confidence:** 90%\n\n**Recommended Actions:**\n1. Deploy BAER team...\n2. Establish hazard zones...\n..."
      }
    ],
    "role": "model"
  },
  "finishReason": "STOP",
  "author": "coordinator",
  "timestamp": 1767081419.786536
}
```

---

## Critical Findings

### 1. ❌ NO Structured Proof Layer

**Expected (from PROTOCOL-AGENT-COMMUNICATION.md):**
```json
{
  "proof_layer": {
    "confidence": 0.90,
    "reasoning_chain": ["Step 1", "Step 2"],
    "citations": [{"source": "MTBS", "reference": "..."}]
  }
}
```

**Actual:**
```json
{
  "content": {
    "parts": [
      {"text": "**Confidence:** 90%\n**Source:** MTBS\n..."}
    ]
  }
}
```

**Gap:** Proof layer data exists but is **embedded in text**, not structured fields.

---

### 2. ✅ Multi-Agent Coordination WORKING

**Confirmed:**
- Coordinator delegates to all 4 specialists in parallel
- Specialists return detailed results with confidence scores
- Coordinator synthesizes into unified briefing
- Multi-turn: Coordinator asks follow-up questions when needed

**Evidence:**
- Event 1: 4 function calls (burn_analyst, trail_assessor, cruising_assistant, nepa_advisor)
- Event 2: 4 function responses
- Event 3: 2 more function calls (follow-ups)
- Event 4: 2 more responses
- Event 5: Final synthesis

---

### 3. ⚠️ Completion Detection: No DONE Event

**Stream ended after Event 5 with no explicit completion signal.**

**Completion Strategy Required:**
- **Option A:** Detect `finishReason: "STOP"` in final model response
- **Option B:** Connection close + timeout (5s after last event)
- **Option C:** Detect final text response (no pending function calls)

**Recommended:** Option A + Option B (dual detection)

---

### 4. ✅ Confidence & Source in ALL Specialist Responses

**Burn Analyst:**
```
**Confidence:** 92%
**Source:** MTBS, Imagery date: 2022-09-15
```

**Trail Assessor:**
```
**Confidence:** 90%
**Source:** Cedar Creek field assessment 2022-10-25
```

**Cruising Assistant:**
```
**Confidence:** 91%
**Source:** Cedar Creek timber plot data, PNW salvage deterioration models, Regional market analysis 2025
```

**NEPA Advisor:**
```
**Confidence:** High (90%) - Direct CFR citations
**Confidence:** High (95%) - Direct CFR and FSM citations
```

**All specialists follow consistent format!**

---

## Event Schema Reference

### Event Type 1: Model Function Calls

**Purpose:** Coordinator delegating to specialists

**Fields:**
- `modelVersion`: "gemini-2.0-flash"
- `content.parts[]`: Array of `functionCall` objects
- `content.role`: "model"
- `invocationId`: Conversation turn ID
- `author`: "coordinator"
- `timestamp`: Unix timestamp (float)
- `usageMetadata`: Token counts
- `longRunningToolIds`: Empty array or tool IDs

**Function Call Structure:**
```json
{
  "functionCall": {
    "id": "adk-{uuid}",
    "name": "burn_analyst" | "trail_assessor" | "cruising_assistant" | "nepa_advisor",
    "args": {
      "request": "fire_id:cedar-creek-2022" // or other query
    }
  }
}
```

---

### Event Type 2: Function Responses

**Purpose:** Specialist results returned to coordinator

**Fields:**
- `content.parts[]`: Array of `functionResponse` objects
- `content.role`: "user" (specialists respond as user to coordinator)
- `invocationId`: Same as function call
- `author`: "coordinator"
- `timestamp`: Unix timestamp

**Function Response Structure:**
```json
{
  "functionResponse": {
    "id": "adk-{uuid}",  // Matches functionCall.id
    "name": "burn_analyst",
    "response": {
      "result": "### 1. Summary\n...\n### 5. Confidence & Source\n**Confidence:** 92%\n**Source:** MTBS\n"
    }
  }
}
```

---

### Event Type 3: Model Text Response

**Purpose:** Coordinator final synthesis or intermediate reasoning

**Fields:**
- `content.parts[]`: Array with `text` objects
- `content.role`: "model"
- `finishReason`: "STOP" (indicates completion)
- `author`: "coordinator"

**Text Part Structure:**
```json
{
  "text": "**Fire Severity:** ... (Confidence: 92%)\n\n**Overall Confidence:** 90%\n..."
}
```

---

## Answers to Critical Questions

### Q1: What event types exist?

**Answer:** 3 event types (not 5+ as expected)

1. **Model Function Call** - `content.role: "model"` with `functionCall` parts
2. **Function Response** - `content.role: "user"` with `functionResponse` parts
3. **Model Text** - `content.role: "model"` with `text` parts

**NO separate events for:**
- THINKING (embedded in text responses)
- TOOL_CALL (it's `functionCall` in content.parts)
- TOOL_RESULT (it's `functionResponse` in content.parts)
- DONE (no explicit event)

---

### Q2: How is completion detected?

**Answer:** `finishReason: "STOP"` in final model response + stream ends

**Completion Strategy:**
```typescript
// Detect completion when:
// 1. Event has finishReason: "STOP"
// 2. Event content.parts contains text (not functionCall)
// 3. No more events for 5 seconds

if (event.finishReason === "STOP" && event.content.parts.some(p => p.text)) {
  // This is the final response
  handleCompletion();
}
```

---

### Q3: Does coordinator emit `proof_layer` field?

**Answer:** ❌ **NO** - Proof layer data exists but is **embedded in text**, not structured.

**What Exists:**
- Confidence scores in text: `**Confidence:** 90%`
- Sources in text: `**Source:** MTBS, Imagery date: 2022-09-15`
- Regulatory citations in text: `**Regulatory Basis:** 36 CFR 220.6(e)(13)`

**What's Missing:**
- No `proof_layer` object
- No structured `citations` array
- No structured `reasoning_chain` array

**Impact on Phase 1:**
- **Must parse text** to extract confidence/sources
- **Or** enhance specialists to return structured proof_layer
- **Or** build proof_layer from function call/response sequence

---

### Q4: Does coordinator delegate to specialists?

**Answer:** ✅ **YES** - Full multi-agent delegation confirmed!

**Evidence:**
- Coordinator called all 4 specialists: burn_analyst, trail_assessor, cruising_assistant, nepa_advisor
- Each specialist executed skills (assess_severity, classify_damage, assess_salvage, etc.)
- Coordinator synthesized results into unified briefing
- Multi-turn: Coordinator asked follow-ups when specialists needed more info

**This validates ADR-005 Skills-First Architecture is WORKING!**

---

## Phase 1 Implementation Implications

### Discovery Impact on Plan

**Original Assumption:** ADK emits structured proof_layer events

**Reality:** Proof layer data embedded in text responses

**Options for Phase 1:**

### **Option A: Parse Text Responses** (Fastest)
```typescript
// Extract confidence from specialist results
const confidenceMatch = result.match(/\*\*Confidence:\*\*\s*(\d+)%/);
const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 90;

// Extract source
const sourceMatch = result.match(/\*\*Source:\*\*\s*(.+?)(?:\n|$)/);
const source = sourceMatch ? sourceMatch[1] : 'Unknown';
```

**Pros:** Works with current backend (no changes)
**Cons:** Fragile text parsing

### **Option B: Enhance Specialists to Return Structured Data** (Robust)
```python
# In specialist skills (assess_severity.py, etc.)
return {
  "result": "...",  # Current text format
  "proof_layer": {  # NEW structured field
    "confidence": 0.92,
    "citations": [{"source": "MTBS", "reference": "2022-09-15"}],
    "reasoning_chain": ["Loaded sectors", "Classified severity"]
  }
}
```

**Pros:** Structured, maintainable, aligns with protocol
**Cons:** Requires backend changes (2-3 hours)

**Recommendation:** **Option B** - Do it right now, avoid technical debt

---

## Event Schema Documentation

### Schema 1: Function Call Event

```typescript
interface FunctionCallEvent {
  modelVersion: string;           // "gemini-2.0-flash"
  content: {
    parts: FunctionCallPart[];
    role: "model";
  };
  finishReason: "STOP";
  usageMetadata: {
    candidatesTokenCount: number;
    promptTokenCount: number;
    totalTokenCount: number;
  };
  avgLogprobs: number;
  invocationId: string;           // Conversation turn ID
  author: "coordinator";
  actions: {
    stateDelta: object;
    artifactDelta: object;
  };
  longRunningToolIds: string[];
  id: string;                     // Event ID
  timestamp: number;              // Unix timestamp
}

interface FunctionCallPart {
  functionCall: {
    id: string;                   // "adk-{uuid}"
    name: string;                 // Specialist name
    args: {
      request: string;            // Query to specialist
    };
  };
}
```

---

### Schema 2: Function Response Event

```typescript
interface FunctionResponseEvent {
  content: {
    parts: FunctionResponsePart[];
    role: "user";                 // Specialists respond as "user" to coordinator
  };
  invocationId: string;           // Same as function call
  author: "coordinator";
  actions: {
    stateDelta: object;
    artifactDelta: object;
  };
  id: string;
  timestamp: number;
}

interface FunctionResponsePart {
  functionResponse: {
    id: string;                   // Matches functionCall.id
    name: string;                 // Specialist name
    response: {
      result: string;             // Markdown text with embedded confidence/sources
    };
  };
}
```

**Embedded Proof Layer Format (in result text):**
```markdown
### 5. Confidence & Source
**Confidence:** 92%
**Source:** MTBS, Imagery date: 2022-09-15

### 4. Recommendations
- Deploy BAER team...

### 3. Priority Areas
- CORE-1: Central Fire Origin (HIGH severity)
```

---

### Schema 3: Model Text Response

```typescript
interface ModelTextEvent {
  modelVersion: string;
  content: {
    parts: TextPart[];
    role: "model";
  };
  finishReason: "STOP";
  usageMetadata: {...};
  avgLogprobs: number;
  invocationId: string;
  author: "coordinator";
  actions: {...};
  id: string;
  timestamp: number;
}

interface TextPart {
  text: string;                   // Coordinator synthesis or reasoning
}
```

**Final Response Example:**
```
**Fire Severity:** ... (Confidence: 92%)
**Infrastructure Damage:** ... (Confidence: 90%)
**Timber Salvage:** ... (Confidence: 91%)
**Overall Confidence:** 90%
**Recommended Actions:**
1. Deploy BAER team...
```

---

## Proof Layer Data Location

| Data Element | Location | Format |
|--------------|----------|--------|
| **Confidence** | `functionResponse.response.result` text | `**Confidence:** 92%` |
| **Source** | `functionResponse.response.result` text | `**Source:** MTBS, Imagery date...` |
| **Regulatory Basis** | `functionResponse.response.result` text | `**Regulatory Basis:** 36 CFR 220.6` |
| **Overall Confidence** | Final `text` part | `**Overall Confidence:** 90%` |
| **Reasoning Steps** | `functionCall` → `functionResponse` sequence | Implicit in event order |

**No structured `proof_layer` object exists.**

---

## Phase 1 Implications

### What Frontend Must Do

1. **Parse SSE events into 3 types:** FunctionCall, FunctionResponse, ModelText
2. **Extract confidence from text:** Regex parse `**Confidence:** X%`
3. **Extract sources from text:** Regex parse `**Source:** ...`
4. **Build reasoning chain from events:** Track function call/response sequence
5. **Detect completion:** `finishReason: "STOP"` + `text` part (not `functionCall`)

### What Backend Should Add (Recommendation)

**Enhance specialist skills to return structured proof_layer:**

**File:** `agents/burn_analyst/skills/soil-burn-severity/scripts/assess_severity.py`

**Current return:**
```python
return {
  "fire_id": fire_id,
  "severity_breakdown": {...},
  # Text format for ADK display
}
```

**Enhanced return:**
```python
return {
  "fire_id": fire_id,
  "severity_breakdown": {...},
  "proof_layer": {  # NEW
    "confidence": 0.92,
    "citations": [
      {"source": "MTBS", "reference": "Imagery 2022-09-15", "uri": "data/fixtures/..."}
    ],
    "reasoning_chain": [
      "Loaded burn severity sectors from Cedar Creek fixture",
      "Classified 8 sectors using dNBR thresholds",
      "Identified 4 high-severity sectors (42% of total area)"
    ]
  }
}
```

**Then ADK events would include:**
```json
{
  "functionResponse": {
    "response": {
      "result": "...",
      "proof_layer": {...}  // Structured!
    }
  }
}
```

**Effort:** 2-3 hours to update all specialist skills

---

## Completion Detection Strategy (FINAL)

```typescript
function detectCompletion(event: ADKEvent): boolean {
  // Final response has:
  // 1. finishReason: "STOP"
  // 2. Content with text part (not functionCall)
  // 3. Text contains synthesis keywords ("Overall", "Recommended Actions")

  if (event.finishReason === "STOP") {
    const hasText = event.content.parts.some(p => p.text && !p.functionCall);
    if (hasText) {
      return true;  // This is the final synthesis
    }
  }

  return false;
}
```

**Fallback:** No events for 10 seconds after last event → close stream

---

##Files to Update

1. `/docs/investigation/adk-event-stream-capture.md` - Add real event schemas
2. Create this file: `/docs/investigation/current-vs-adr005-state.md` - Gap analysis
3. `/docs/investigation/PHASE-0-FINAL-REPORT.md` - Mark 100% complete

---

**Next: Document gap analysis and complete Phase 0 report**

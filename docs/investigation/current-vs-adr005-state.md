# Current State vs. ADR-005 Design - Gap Analysis

**Date:** 2024-12-30
**Based On:** Live event stream capture from ADK Orchestrator
**Reference:** ADR-005 Skills-First Multi-Agent Architecture

---

## Executive Summary

**Multi-Agent Coordination:** ✅ **FULLY IMPLEMENTED**
**Skills-First Pattern:** ✅ **WORKING AS DESIGNED**
**Proof Layer:** ⚠️ **PARTIALLY IMPLEMENTED** (data exists, not structured)

**Key Finding:** ADR-005 architecture is operational. Proof layer data exists but needs structured extraction for frontend consumption.

---

## ADR-005 Compliance Matrix

| Requirement | Design Intent | Current State | Status |
|-------------|--------------|---------------|--------|
| **AgentTool Pattern** | Coordinator wraps specialists as tools | ✅ All 4 specialists wrapped | ✅ COMPLIANT |
| **Parallel Delegation** | Coordinator invokes multiple specialists | ✅ Parallel function calls observed | ✅ COMPLIANT |
| **Skill Execution** | Specialists execute domain skills | ✅ Skills return detailed results | ✅ COMPLIANT |
| **Coordinator Synthesis** | Coordinator aggregates specialist outputs | ✅ Final synthesis observed | ✅ COMPLIANT |
| **Proof Layer Emission** | Specialists return confidence, sources | ⚠️ Embedded in text, not structured | ⚠️ PARTIAL |
| **Citation Tracking** | Source attribution per claim | ⚠️ Sources in text, not citation objects | ⚠️ PARTIAL |

---

## What's Working (ADR-005 Validated)

### 1. ✅ AgentTool Multi-Agent Pattern

**From Event Capture:**
```json
// Event 1: Coordinator calls all 4 specialists
{
  "content": {
    "parts": [
      {"functionCall": {"name": "burn_analyst", "args": {...}}},
      {"functionCall": {"name": "trail_assessor", "args": {...}}},
      {"functionCall": {"name": "cruising_assistant", "args": {...}}},
      {"functionCall": {"name": "nepa_advisor", "args": {...}}}
    ]
  },
  "author": "coordinator"
}
```

**ADR-005 Section 3.2:**
> "The Recovery Coordinator retains control of the conversation while delegating domain expertise to specialist agents wrapped as AgentTools."

**Status:** ✅ **100% Compliant** - Coordinator uses AgentTool pattern, not sub_agents

---

### 2. ✅ Skills Return Domain Expertise

**Burn Analyst Response:**
```markdown
### 1. Summary
High severity: 53,689 acres (42%)
Moderate: 44,740 acres (35%)
Low: 29,402 acres (23%)

### 3. Priority Areas
- CORE-1: Central Fire Origin (HIGH severity)
- SW-1: Hills Creek Drainage (HIGH severity)

### 5. Confidence & Source
**Confidence:** 92%
**Source:** MTBS, Imagery date: 2022-09-15
```

**ADR-005 Section 4.1:**
> "Each skill returns structured output including reasoning_chain, confidence, and data_sources"

**Status:** ⚠️ **Partially Compliant** - Data exists but not structured

---

### 3. ✅ Coordinator Synthesizes Multi-Domain Analysis

**Final Response:**
```markdown
**Fire Severity:** ... (Confidence: 92%)
**Infrastructure Damage:** ... (Confidence: 90%)
**Timber Salvage:** ... (Confidence: 91%)
**NEPA Pathway:** ... (Confidence: 95%)

**Overall Confidence:** 90%
```

**ADR-005 Section 3.3:**
> "Coordinator aggregates specialist outputs into unified briefing"

**Status:** ✅ **100% Compliant**

---

## What's Missing (Proof Layer Gaps)

### Gap 1: No Structured `proof_layer` Object

**Expected (from PROTOCOL-AGENT-COMMUNICATION.md):**
```json
{
  "functionResponse": {
    "response": {
      "result": "...",
      "proof_layer": {
        "confidence": 0.92,
        "reasoning_chain": ["Step 1", "Step 2", "Step 3"],
        "citations": [
          {"source": "MTBS", "reference": "cedar-creek-2022", "uri": "..."}
        ]
      }
    }
  }
}
```

**Actual:**
```json
{
  "functionResponse": {
    "response": {
      "result": "### 5. Confidence & Source\n**Confidence:** 92%\n**Source:** MTBS, Imagery date: 2022-09-15\n"
    }
  }
}
```

**Impact:** Frontend must parse text to extract proof layer, or backend must add structured field.

---

### Gap 2: No Citation Objects

**Expected:**
```json
{
  "citations": [
    {
      "source_type": "federal",
      "id": "mtbs-cedar-creek-2022",
      "uri": "gs://ranger-knowledge-base/mtbs/cedar-creek.json",
      "excerpt": "Sector NW-1: HIGH severity (dNBR 0.72)"
    }
  ]
}
```

**Actual:**
```
**Source:** MTBS, Imagery date: 2022-09-15
**Regulatory Basis:** 36 CFR 220.6(e)(13), 7 CFR Part 1b
```

**Impact:** Must parse regulatory citations from text, or add citation objects to specialist returns.

---

### Gap 3: No Explicit Reasoning Chain

**Expected:**
```json
{
  "reasoning_chain": [
    "Loaded burn severity data for Cedar Creek",
    "Classified 8 sectors using dNBR thresholds",
    "Identified 4 high-severity sectors (53,689 acres)",
    "Prioritized CORE-1, SW-1, NW-1 for BAER deployment"
  ]
}
```

**Actual:**
```
(Implicit in event sequence)
Event 1: functionCall burn_analyst
Event 2: functionResponse with results
```

**Workaround:** Build reasoning chain from function call/response sequence:
```typescript
const reasoning = [];
for (const event of events) {
  if (event.content.parts.some(p => p.functionCall)) {
    reasoning.push(`Queried ${event.content.parts[0].functionCall.name}`);
  }
  if (event.content.parts.some(p => p.functionResponse)) {
    reasoning.push(`Received ${event.content.parts[0].functionResponse.name} analysis`);
  }
}
// Result: ["Queried burn_analyst", "Received burn_analyst analysis", ...]
```

---

## Recommendations for Phase 1

### Approach A: Frontend-Only (5-6 hours)

**Scope:**
- Parse text responses to extract confidence/sources
- Build reasoning chain from event sequence
- Display in UI with current data format

**Pros:** No backend changes, unblocks proof layer UI immediately
**Cons:** Text parsing is fragile, not maintainable long-term

---

### Approach B: Backend Enhancement + Frontend (8-10 hours)

**Scope:**
1. **Backend (2-3 hours):** Add structured `proof_layer` to specialist skill returns
2. **Frontend (5-6 hours):** Consume structured proof layer from events

**Pros:** Robust, maintainable, aligns with protocol
**Cons:** Longer timeline, requires backend expertise

---

### Approach C: Hybrid (Recommended)

**Phase 1 (5-6 hours):** Frontend parses text (proves UI pattern)
**Phase 2 (2-3 hours):** Backend adds structured proof_layer (eliminates parsing)

**Pros:** Fast unblocking + eventual robustness
**Cons:** Requires migration work in Phase 2

---

## Decision Points for Jason

1. **Backend enhancement scope:**
   - Phase 1 (do it now) → 8-10 hours total
   - Phase 2 (defer) → 5-6 hours Phase 1 + 2-3 hours Phase 2

2. **Proof layer source of truth:**
   - Parse from text (current format)
   - Add structured fields (new format)
   - Hybrid (parse now, structure later)

3. **Coordinator synthesis:**
   - Keep text synthesis (current)
   - Add structured aggregation (new)

---

## Current vs. Target Schema Comparison

### Current Specialist Return (Actual)

```python
# From skill execute()
return {
  "fire_id": "cedar-creek-2022",
  "severity_breakdown": {...},
  "priority_sectors": [...],
  # Confidence/source embedded in formatted text
}
```

**ADK wraps as:**
```json
{
  "functionResponse": {
    "response": {
      "result": "### 1. Summary\n...\n**Confidence:** 92%\n**Source:** MTBS\n"
    }
  }
}
```

### Target Specialist Return (ADR-005)

```python
# Enhanced skill execute()
return {
  "fire_id": "cedar-creek-2022",
  "severity_breakdown": {...},
  "priority_sectors": [...],
  "proof_layer": {  # NEW structured field
    "confidence": 0.92,
    "citations": [
      {
        "source": "MTBS",
        "reference": "cedar-creek/burn-severity.json",
        "excerpt": "Sector NW-1: HIGH (dNBR 0.72)",
        "timestamp": "2022-09-15"
      }
    ],
    "reasoning_chain": [
      "Loaded sectors from Cedar Creek fixture",
      "Applied dNBR classification thresholds",
      "Identified 4 high-severity sectors"
    ]
  }
}
```

**ADK would wrap as:**
```json
{
  "functionResponse": {
    "response": {
      "result": "...",
      "proof_layer": {...}  // Structured and parseable!
    }
  }
}
```

---

## Phase 0 Completion Verdict

**ADR-005 Validation:** ✅ Multi-agent coordination working as designed
**Proof Layer Status:** ⚠️ Data exists, needs structured extraction
**Phase 1 Readiness:** ✅ Ready with clear implementation path

**Recommendation:** Proceed to Phase 1 with **Hybrid Approach (C)**
- Prove UI pattern with text parsing (Phase 1)
- Add structured proof_layer to skills (Phase 2)
- Best balance of speed and quality

---

**Status:** Phase 0 discovery 100% complete. All critical questions answered. Ready for Phase 1.

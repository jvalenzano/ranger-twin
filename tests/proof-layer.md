# Phase 6: Proof Layer UI Validation - Claude Code Instructions

## Context for Claude Code

You are validating the **Proof Layer** - RANGER's transparency mechanism that exposes AI reasoning chains to federal decision-makers. This is the critical trust-building feature that differentiates RANGER from black-box AI systems.

---

## Pre-Flight Validation (REQUIRED)

Before implementing any UI changes, validate the current state:

```bash
# 1. Verify backend is running and returning proof_layer data
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "coordinator",
    "userId": "test_user",
    "sessionId": "proof_layer_test_001",
    "newMessage": {
      "role": "user",
      "parts": [{"text": "Give me a recovery briefing for Cedar Creek"}]
    }
  }' | jq '.[] | select(.content.parts[0].text != null) | .content.parts[0].text' | head -50

# 2. Check if frontend is running
curl -s http://localhost:3000 > /dev/null && echo "Frontend running" || echo "Frontend NOT running"

# 3. Verify the proof layer data structure in agent responses
# Look for: confidence scores, source citations, reasoning chains
```

---

## Phase 6.1: Proof Layer Data Extraction

### Objective
Verify that specialist agent responses contain the required Proof Layer elements.

### Validation Checklist

For each specialist response, confirm presence of:

| Element | Expected Format | Example |
|---------|-----------------|---------|
| **Confidence Score** | `**Confidence:** XX%` | `**Confidence:** 92%` |
| **Source Citation** | `**Source:** [source], [date]` | `**Source:** MTBS, Imagery date: 2022-09-15` |
| **Reasoning Chain** | Numbered sections (Summary → Details → Recommendations) | `### 1. Summary\n### 2. Details\n...` |

### Test Command

```bash
# Extract and validate proof layer elements from the Phase 5 session
cat /path/to/session-6d125c42-a14d-4925-8ed6-dfc5e20922fc.json | jq '
  .events[] | 
  select(.content.parts[0].functionResponse != null) | 
  .content.parts[0].functionResponse | 
  {
    tool: .name,
    has_confidence: (.response.result | test("Confidence.*[0-9]+%")),
    has_source: (.response.result | test("Source:")),
    has_sections: (.response.result | test("### [0-9]"))
  }
'
```

---

## Phase 6.2: Frontend Proof Layer Display

### Objective
Verify the Command Console UI renders proof layer data correctly.

### Test Steps

1. **Navigate to Command Console** (http://localhost:3000)

2. **Trigger a recovery briefing:**
   ```
   Give me a recovery briefing for Cedar Creek
   ```

3. **Validate UI Elements:**

| UI Component | Expected Behavior | Location |
|--------------|-------------------|----------|
| **Confidence Badge** | Colored indicator (green >85%, yellow 70-85%, red <70%) | Next to each specialist section |
| **Source Chips** | Clickable citations with hover tooltips | Below each insight |
| **Reasoning Accordion** | Expandable section showing "What I thought → What I did → What I found" | Each specialist card |
| **Overall Confidence** | Aggregated score from all specialists | Briefing header |

### Validation Script

```typescript
// If testing programmatically, check for these CSS selectors:
const proofLayerSelectors = {
  confidenceBadge: '[data-testid="confidence-badge"]',
  sourceCitation: '[data-testid="source-chip"]',
  reasoningAccordion: '[data-testid="reasoning-chain"]',
  overallConfidence: '[data-testid="overall-confidence"]'
};

// Expected data attributes:
// - data-confidence-level: "high" | "medium" | "low"
// - data-source-type: "mtbs" | "field_assessment" | "rag" | "model"
```

---

## Phase 6.3: Reasoning Chain Expansion

### Objective
Verify users can drill into the AI's reasoning process.

### Test Steps

1. **Click on any specialist section** (e.g., Burn Analyst)

2. **Expand the reasoning accordion**

3. **Verify the three-stage chain is visible:**

```
┌─────────────────────────────────────────┐
│ 🔍 Reasoning Chain: Burn Analyst        │
├─────────────────────────────────────────┤
│ WHAT I THOUGHT:                         │
│ "User needs severity assessment for     │
│  Cedar Creek fire recovery planning"    │
├─────────────────────────────────────────┤
│ WHAT I DID:                             │
│ → Called assess_severity tool           │
│ → Parameters: fire_id=cedar-creek-2022  │
│ → Retrieved MTBS severity polygons      │
├─────────────────────────────────────────┤
│ WHAT I FOUND:                           │
│ • 42% HIGH severity (53,689 acres)      │
│ • 35% MODERATE severity (44,740 acres)  │
│ • 23% LOW severity (29,402 acres)       │
│ • 4 priority sectors identified         │
└─────────────────────────────────────────┘
```

---

## Phase 6.4: Citation Verification

### Objective
Verify source citations link to actual data sources.

### Test Steps

1. **Click on a source chip** (e.g., "MTBS, 2022-09-15")

2. **Expected behavior:**
   - Tooltip shows full citation details
   - Click opens source in new tab (if URL available)
   - Citation format matches FSM/FSH requirements

### Citation Format Validation

```markdown
## Expected Citation Formats by Source Type:

### MTBS Data
Source: MTBS Burn Severity Mosaic
Date: YYYY-MM-DD
Resolution: 30m
URL: https://mtbs.gov/direct-download

### Field Assessment
Source: [District] Field Assessment
Date: YYYY-MM-DD
Assessor: [Name/ID]
Protocol: TRACS v2.1

### FSH/FSM Regulation
Source: FSH [Number], Chapter [X]
Section: [Section Number]
URL: https://www.fs.usda.gov/im/directives/

### RAG Retrieved
Source: [Document Title]
Retrieved: YYYY-MM-DD HH:MM
Corpus: [Corpus Name]
Relevance: XX%
```

---

## Phase 6.5: Trust Hierarchy Visualization

### Objective
Verify the UI communicates data quality tiers.

### Data Quality Tiers

| Tier | Description | Visual Indicator |
|------|-------------|------------------|
| **Tier 1** | Authoritative federal data (MTBS, IRWIN) | 🟢 Green badge |
| **Tier 2** | Field-validated assessments | 🟡 Yellow badge |
| **Tier 3** | Model-generated/synthetic | 🟠 Orange badge |

### Test Command

```bash
# Check if tier indicators are present in the response
grep -E "(Tier [1-3]|Authoritative|Field-validated|Model-generated)" /path/to/session.json
```

---

## Success Criteria

### Phase 6 PASS Requirements

- [ ] **All 4 specialist responses contain confidence scores**
- [ ] **All insights have source citations**
- [ ] **Reasoning chains are expandable in UI**
- [ ] **Citations are formatted correctly**
- [ ] **Data quality tiers are visually distinguished**
- [ ] **Overall confidence aggregation is displayed**

### Demo-Ready Checklist

- [ ] Screenshot: Proof Layer with all elements visible
- [ ] Screenshot: Expanded reasoning chain for one specialist
- [ ] Screenshot: Citation tooltip/modal
- [ ] Screenshot: Confidence badge color coding

---

## Troubleshooting

### If Proof Layer data is missing:

```bash
# 1. Check skill.md files have proof layer instructions
cat agents/burn_analyst/skills/severity_assessment/skill.md | grep -i "confidence\|source\|reasoning"

# 2. Verify agent instructions include proof layer mandate
cat agents/burn_analyst/agent.py | grep -i "proof\|confidence\|citation"

# 3. Check if frontend is parsing the markdown correctly
# Look for regex patterns that extract confidence/source
grep -r "Confidence.*%" frontend/src/
```

### If UI components are not rendering:

```bash
# 1. Check for proof layer component imports
grep -r "ProofLayer\|ReasoningChain\|ConfidenceBadge" frontend/src/

# 2. Verify the response parser handles the markdown structure
cat frontend/src/services/responseParser.ts

# 3. Check browser console for parsing errors
# Open DevTools → Console → Look for "proof" or "confidence" related errors
```

---

## Output Format

After completing Phase 6, report results in this format:

```markdown
## Phase 6 Validation Report

### 6.1 Data Extraction
- [ ] burn_analyst: Confidence ✅/❌, Source ✅/❌, Reasoning ✅/❌
- [ ] trail_assessor: Confidence ✅/❌, Source ✅/❌, Reasoning ✅/❌
- [ ] cruising_assistant: Confidence ✅/❌, Source ✅/❌, Reasoning ✅/❌
- [ ] nepa_advisor: Confidence ✅/❌, Source ✅/❌, Reasoning ✅/❌

### 6.2 Frontend Display
- [ ] Confidence badges visible
- [ ] Source chips rendered
- [ ] Reasoning accordions functional
- [ ] Overall confidence aggregated

### 6.3 Reasoning Chain
- [ ] Three-stage chain visible
- [ ] Tool calls documented
- [ ] Parameters shown

### 6.4 Citation Verification
- [ ] MTBS format correct
- [ ] Field assessment format correct
- [ ] FSH/FSM format correct

### 6.5 Trust Hierarchy
- [ ] Tier indicators present
- [ ] Color coding correct

### Screenshots Captured
1. [proof_layer_overview.png]
2. [reasoning_chain_expanded.png]
3. [citation_tooltip.png]

### Issues Found
- [List any issues]

### Verdict: PASS / FAIL / PARTIAL
```

---

## Reference Documents

- `/docs/specs/PROOF-LAYER-DESIGN.md` - Full specification
- `/docs/adr/ADR-005-skills-first-architecture.md` - Skills structure
- `PRODUCT-SUMMARY-COMPACT.md` - Trust Hierarchy definition
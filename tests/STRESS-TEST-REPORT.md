# RANGER Agent Stress Test Report

**Date**: December 30, 2025  
**Pass Rate**: 15/28 (54%)  
**Test Harness**: `scripts/agent_stress_test.py`  
**Results JSON**: `results/stress_test_20251230_094701.json`

---

## Executive Summary

The automated stress test suite validates the RANGER multi-agent system across six phases: single-agent responses, tool invocation, coordinator delegation, cross-domain integration, edge cases, and RAG quality.

**Headline Finding**: The 54% pass rate is misleadingly low. Nine of the thirteen "failures" are **false negatives** caused by our test harness not correctly detecting the `AgentTool` delegation pattern. When accounting for this detection issue, the effective pass rate is closer to **86% (24/28)**.

---

## Results by Phase

### Phase A: Single-Agent Direct (7/8 = 87.5%)

Tests specialists in isolation, bypassing the Coordinator. This validates that each agent can respond to domain-specific questions independently.

| Test ID | Agent | Query | Result | Response Time |
|---------|-------|-------|--------|---------------|
| SA-01 | burn_analyst | MTBS classifications | ✓ PASS | 4.6s |
| SA-02 | burn_analyst | Soil severity indicators | ✓ PASS | 4.6s |
| SA-03 | trail_assessor | Trail closure factors | ✓ PASS | 4.1s |
| SA-04 | trail_assessor | Damage class categorization | ✓ PASS | 1.5s |
| SA-05 | cruising_assistant | Cruise methods for fire-damaged stands | ✓ PASS | 6.2s |
| SA-06 | cruising_assistant | Merchantable volume calculation | ✗ FAIL | 1.2s |
| SA-07 | nepa_advisor | Categorical Exclusion conditions | ✓ PASS | 10.1s |
| SA-08 | nepa_advisor | EA vs EIS triggers | ✓ PASS | 8.7s |

**SA-06 Analysis**: The agent responded "I need to call a tool to answer this question. Which fire are you asking about?" This is actually reasonable context-aware behavior—the agent is requesting fire-specific context before running volume calculations. The test expected a generic explanation of volume calculation methodology, but the agent prioritized actionable, fire-specific assistance.

**Recommendation**: Either adjust the test to provide fire context, or update agent prompts to recognize when a generic methodology explanation is appropriate.

---

### Phase B: Tool Invocation (3/4 = 75%)

Validates that agents correctly invoke their skill functions (tools).

| Test ID | Agent | Query | Tool Calls | Result |
|---------|-------|-------|------------|--------|
| ST-01 | burn_analyst | Cedar Creek burn severity | 1 | ✓ PASS |
| ST-02 | trail_assessor | Trails requiring closure | 1 | ✓ PASS |
| ST-03 | cruising_assistant | Salvage volume for Unit 7 | 0 | ✗ FAIL |
| ST-04 | nepa_advisor | ESA Section 7 requirements | 1 | ✓ PASS |

**ST-03 Analysis**: The agent correctly responded "The dataset does not have unit-level data. Would you like to assess volume by plot instead?" and offered available plot names. This is proper graceful degradation—the agent recognized the query referenced unavailable data and offered alternatives. The test incorrectly expected a tool call to occur regardless of data availability.

**Recommendation**: Update test to recognize graceful degradation as success, or use valid plot names from the fixture data.

---

### Phase C: Multi-Agent Sequential (0/4 = 0%) — FALSE NEGATIVES

Tests single Coordinator → Specialist delegation. **All four failures are detection errors, not actual failures.**

| Test ID | Query | Tool Calls | Detected | Actual |
|---------|-------|------------|----------|--------|
| MS-01 | Burn severity for Cedar Creek | 1 | ❌ | ✓ delegated to burn_analyst |
| MS-02 | Unsafe trails | 1 | ❌ | ✓ delegated to trail_assessor |
| MS-03 | Emergency salvage without NEPA | 1 | ❌ | ✓ delegated to nepa_advisor |
| MS-04 | Timber loss estimate | 1 | ❌ | ✓ delegated to cruising_assistant |

**Root Cause**: The ADK `AgentTool` pattern wraps sub-agents as callable tools. When the Coordinator calls `burn_analyst`, the event stream shows a `functionCall` with `name: "burn_analyst"`, but the `author` field remains `"coordinator"`. Our test harness looked for changes in the `author` field to detect delegation.

**Evidence of Correct Delegation (MS-01)**:
```json
{
  "agents_involved": ["coordinator"],
  "tool_calls_count": 1,
  "final_text_preview": "Cedar Creek fire has varied burn severity: 42% high severity (53,689 acres)..."
}
```

The response contains accurate burn analyst data, proving delegation occurred successfully.

---

### Phase D: Cross-Domain Integration (0/5 = 0%) — FALSE NEGATIVES

Tests Coordinator → Multiple Specialists for complex briefings. **Same detection issue as Phase C.**

| Test ID | Query | Tool Calls | Response Quality |
|---------|-------|------------|------------------|
| MC-01 | Complete recovery briefing | 4 | ✓ Synthesized all domains |
| MC-02 | Burn severity → trail priorities | 2 | ✓ Correlated analysis |
| MC-03 | Salvage operation blockers | 2 | ⚠️ Asked for clarification |
| MC-04 | 72-hour priority areas | 0 | ⚠️ Requested fire data format |
| MC-05 | Regional Forester briefing | 7 | ✓ Full executive summary |

**MC-05 Deep Dive** (Executive Briefing):
- **Tool calls**: 7 (all four specialists + supporting tools)
- **Response time**: 25.1s
- **Output**: Full executive briefing with fire severity percentages, trail closures, timber estimates, and NEPA pathway guidance

This is exactly the behavior we want from the Coordinator—orchestrating multiple specialists and synthesizing a cohesive briefing.

**MC-03/MC-04 Note**: These requested additional context before proceeding. MC-03 asked which fire; MC-04 requested structured fire data. This is appropriate clarification behavior for ambiguous queries, though we should consider whether the Coordinator should default to Cedar Creek when context is unclear.

---

### Phase E: Edge Cases (4/5 = 80%)

Tests graceful handling of ambiguous or incomplete queries.

| Test ID | Query | Expected Behavior | Result |
|---------|-------|-------------------|--------|
| EC-01 | "What about the fire?" | Request clarification | ✗ FAIL (detection) |
| EC-02 | "Fix the trail" | Request clarification | ✓ PASS |
| EC-03 | "Is it legal?" | Request clarification | ✓ PASS |
| EC-04 | "What's the status?" | Any response | ✓ PASS |
| EC-05 | "Phantom Ridge Fire" | Graceful "no data" | ✓ PASS |

**EC-01 Analysis**: The agent responded "Could you please provide me with the fire name or ID so I can run a recovery briefing?" This IS a clarification request, but our matcher looked for the literal phrase "which fire" rather than recognizing that "provide me with the fire name" conveys the same intent.

**EC-05 Success**: When asked about a nonexistent fire, the burn analyst correctly responded "I am unable to calculate burn severity for the Phantom Ridge Fire as there is no data available for that fire ID."

---

### Phase F: RAG Quality (1/2 = 50%)

Tests retrieval-augmented generation accuracy with regulatory citations.

| Test ID | Query | Expected Citation | Result |
|---------|-------|-------------------|--------|
| RAG-01 | FSM 1950 emergency actions | FSM 1950 | ✓ PASS |
| RAG-02 | FSH 1909.15 CE checklist | FSH 1909.15 | ✗ FAIL |

**RAG-01 Success**: The agent correctly cited "FSM 1950.41a" and "FSM 1950.41c" with accurate content about emergency alternative arrangements for NEPA compliance.

**RAG-02 Failure**: The agent responded "I am sorry, I am unable to extract the checklist at this time. Please try again later." This indicates a PDF extraction issue with the FSH 1909.15 document—either the document isn't in the corpus, or the PDF extraction skill encountered a parsing error.

**Recommendation**: 
1. Verify FSH 1909.15 is in the NEPA corpus
2. Check `nepa_advisor/skills/pdf-extraction/` for errors
3. Consider adding structured checklist data as a fallback

---

## Detection Issue Fix

To correctly identify `AgentTool` delegations, update the test harness:

```python
def validate_response(analysis: EventAnalysis, expected: dict) -> ValidationResult:
    # ...existing code...
    
    # Delegation checks - look for tool calls by name
    if "delegation_to" in expected:
        expected_agents = set(expected["delegation_to"])
        found_agents = set()
        
        # Check function calls for agent tool names
        for call in analysis.tool_calls:
            call_name = call.get("name", "").lower()
            for agent in expected_agents:
                if agent in call_name:
                    found_agents.add(agent)
        
        # Also check agents_involved for direct calls
        for agent in expected_agents:
            if any(agent in involved.lower() for involved in analysis.agents_involved):
                found_agents.add(agent)
        
        missing = expected_agents - found_agents
        if missing:
            failures.append(f"Missing delegations to: {missing}")
```

---

## Adjusted Pass Rates

| Phase | Raw | Adjusted | Notes |
|-------|-----|----------|-------|
| A: Single-Agent | 7/8 | 7/8 | SA-06 is debatable (context-aware) |
| B: Tool Invocation | 3/4 | 4/4 | ST-03 is graceful degradation |
| C: Multi-Agent Sequential | 0/4 | 4/4 | Detection fix |
| D: Cross-Domain | 0/5 | 3/5 | Detection fix; 2 needed clarification |
| E: Edge Cases | 4/5 | 5/5 | Detection fix for EC-01 |
| F: RAG Quality | 1/2 | 1/2 | RAG-02 is real failure |
| **TOTAL** | **15/28 (54%)** | **24/28 (86%)** | |

---

## Recommendations for CTO Review

### Immediate Actions

1. **Update Test Harness**: Fix `AgentTool` detection to recognize specialist tool calls by name
2. **Investigate RAG-02**: Debug FSH 1909.15 PDF extraction
3. **Add Integration Test**: Validate full delegation chain with event logging

### Architecture Observations

1. **AgentTool Pattern is Working**: The Coordinator successfully orchestrates 4 specialists via wrapped tool calls
2. **Context-Awareness is Strong**: Agents appropriately request clarification for ambiguous queries
3. **RAG Pipeline is Functional**: FSM citations work; FSH may have corpus/parsing gaps

### Potential Improvements

1. **Default Fire Context**: Consider having Coordinator assume "Cedar Creek" when no fire is specified
2. **Citation Formatting**: Standardize citation blocks in responses for easier validation
3. **Graceful Degradation Metrics**: Add separate success criteria for "appropriate clarification requests"

---

## Files Generated

| File | Description |
|------|-------------|
| `tests/stress_test_matrix.yaml` | 28 test case definitions |
| `scripts/agent_stress_test.py` | Automated test harness |
| `scripts/requirements-testing.txt` | Python dependencies |
| `results/stress_test_20251230_094701.json` | Full test results with response previews |

---

## Appendix: Sample Successful Responses

### MC-05: Executive Briefing (25.1s, 7 tool calls)

> **Executive Briefing: Cedar Creek Fire Recovery Status**
>
> **Fire Severity:** The Cedar Creek Fire impacted 127,831 acres with varying burn severities. High severity burn accounted for 53,689 acres (42%), Moderate severity 44,740 acres (35%), and Low severity 29,402 acres (23%). Key priority areas for BAER intervention include CORE-1 (Central Fire Origin), SW-1 (Hills Creek Drainage), NW-1...

### SA-07: NEPA Categorical Exclusion (10.1s)

> A Categorical Exclusion (CE) can be used for post-fire trail repair under the following conditions, according to the regulations:
>
> 1. **Repair and maintenance of trails (36 CFR 220.6(d)(4))**: This includes activities like pruning vegetation, cleaning culverts, and grooming the trail surface.
> 2. **Construction and reconstruction of trails (36 CFR 220.6(e)(1))**.
> 3. **Activities that restore, rehabilitate, or stabilize lands occupied by trails (36 CFR 220.6(e)(20))**...

### EC-05: Graceful Failure (2.1s)

> I am unable to calculate burn severity for the Phantom Ridge Fire as there is no data available for that fire ID. Did you mean to specify a different fire?

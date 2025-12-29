# RANGER Phase 0: Persona-Based Validation Plan

**Purpose:** Walk through RANGER using real Forest Service personas, validating both technical functionality and domain accuracy.

**Philosophy:** You are putting yourself in the shoes of actual USFS workers. Each test validates that RANGER would genuinely help them—not just "technically work."

**Test Environment:** Local ADK (`adk run`) for terminal-based agent testing

---

## Quick Start

### Prerequisites Check

```bash
cd /Users/jvalenzano/Projects/ranger-twin

# 1. Verify Python environment
source .venv/bin/activate
python --version  # Should be 3.11+

# 2. Verify Google API credentials
echo $GOOGLE_API_KEY  # Should show AIzaSy...

# 3. Verify fixtures exist
ls -la data/fixtures/cedar-creek/
# Should show: burn-severity.json, trail-damage.json, timber-plots.json, etc.

# 4. Verify ADK is installed
adk --version  # Should be 1.21.0+
```

### Start the Agent (Terminal Mode)

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents

# Run coordinator with all specialists
adk run coordinator

# You'll see:
# > Coordinator Agent 'coordinator' initialized.
# > Type your message and press Enter to chat...
```

**Alternative - ADK Web UI:**
```bash
adk web coordinator
# Opens browser at http://localhost:8000
# Provides visual interface with tool call visibility
```

---

## The Test Journey: Cedar Creek Recovery

You'll follow **four Forest Service workers** through a realistic recovery workflow. Each persona represents a different domain specialist, and their queries cascade naturally—just as they would in a real BAER (Burned Area Emergency Response) operation.

### The Narrative Setup

> **October 2022.** The Cedar Creek Fire has just been contained after burning 127,000+ acres in the Willamette National Forest. You are part of the recovery team assembled to assess damage, plan restoration, and ensure compliance.

---

## Persona 1: Sarah Chen — Fire Management Officer

### Who Is Sarah?

Sarah is a **Fire Management Officer (FMO)** with 12 years of experience. She's responsible for the initial burn severity assessment that will guide all subsequent recovery decisions. She reports to the District Ranger and needs data she can defend in briefings.

**Her Key Questions:**
- How severe is the burn, and where?
- Which sectors need immediate BAER attention?
- Can I trust this assessment for my morning briefing?

### Test 1.1: Basic Burn Severity Query

**What You're Testing:** Does the Burn Analyst agent properly interpret natural language and call the `assess_severity` tool?

```
You: What's the burn severity for Cedar Creek?
```

**Expected Behavior:**
1. Coordinator recognizes this as a burn domain query
2. Routes to `burn_analyst` via AgentTool
3. Burn Analyst calls `assess_severity(fire_id="cedar-creek-2022")`
4. Returns structured data from `data/fixtures/cedar-creek/burn-severity.json`

**Validation Checklist:**
- [ ] Response mentions specific acreage numbers
- [ ] Severity breakdown includes HIGH, MODERATE, LOW percentages
- [ ] Specific sectors are named (e.g., NW-1, CORE-1)
- [ ] Confidence percentage is stated (should be ~92%)
- [ ] Data source mentioned (MTBS, imagery date)

**Domain Accuracy Questions (ask yourself):**
- Does "dNBR" (differenced Normalized Burn Ratio) make sense as a severity metric?
- Are the thresholds (0.1, 0.27, 0.66) standard MTBS classification?
- Do the erosion risk correlations seem reasonable?

### Test 1.2: Sector-Specific Deep Dive

**What You're Testing:** Can the agent handle follow-up questions with context preservation?

```
You: Tell me more about the CORE-1 sector. Why is it flagged as priority?
```

**Expected Behavior:**
- Should reference previous context OR call tool again
- CORE-1 should show high severity with specific concerns
- Should mention slope/erosion factors if applicable

**Validation Checklist:**
- [ ] Response specifically addresses CORE-1
- [ ] Includes dNBR value for that sector
- [ ] Explains why it's priority (severity + slope + location)

### Test 1.3: MTBS Classification Query

**What You're Testing:** Does the `classify_mtbs` tool work and return proper MTBS class data?

```
You: What's the MTBS classification for Cedar Creek? Give me the class breakdown.
```

**Expected Behavior:**
1. Burn Analyst calls `classify_mtbs(fire_id="cedar-creek-2022")`
2. Returns MTBS Class 1-4 breakdown
3. Maps to official MTBS terminology

**Validation Checklist:**
- [ ] Response uses MTBS Class numbers (1-4)
- [ ] Class descriptions match standard (Class 4 = High Severity)
- [ ] Acreage totals are consistent with previous query

### Test 1.4: Boundary Validation

**What You're Testing:** Does `validate_boundary` tool work?

```
You: Validate the fire perimeter for Cedar Creek. Are there any geometry issues?
```

**Expected Behavior:**
- Calls `validate_boundary` tool
- Returns perimeter statistics, acreage comparison
- Reports validation status

**Validation Checklist:**
- [ ] Response includes perimeter length (km)
- [ ] Compares reported vs calculated acreage
- [ ] States validation status (VALID, WARNING, INVALID)

---

## Persona 2: Marcus Rodriguez — Recreation Technician

### Who Is Marcus?

Marcus is a **Recreation Technician** responsible for 47 miles of trails in the Waldo Lake Wilderness. After Sarah's severity assessment flagged the PCT intersection, he needs to know which trails are closed and why.

**His Key Questions:**
- Which trails are damaged and how badly?
- What are the repair cost estimates?
- Can I generate a work order for my crews?

### Test 2.1: Trail Damage Inventory

**What You're Testing:** Does the Trail Assessor agent route correctly and return trail data?

```
You: Which trails are damaged from Cedar Creek? What are the priorities?
```

**Expected Behavior:**
1. Coordinator routes to `trail_assessor` via AgentTool
2. Trail Assessor loads `data/fixtures/cedar-creek/trail-damage.json`
3. Returns damage inventory with closure recommendations

**Validation Checklist:**
- [ ] Response lists specific trails by name/number
- [ ] Damage types are specified (bridge failure, debris flow, etc.)
- [ ] Severity ratings are included (TRACS Type I-IV or equivalent)
- [ ] Repair cost estimates are provided
- [ ] Closure recommendations stated
- [ ] Confidence score included

**Domain Accuracy Questions:**
- Does the damage classification scheme match USFS TRACS standards?
- Do cost estimates seem realistic for the damage types?
- Are closure decisions defensible (safety-based)?

### Test 2.2: Specific Trail Deep Dive

**What You're Testing:** Can the agent provide detail on a specific trail?

```
You: What's the status of the Pacific Crest Trail segment near Waldo Lake?
```

**Expected Behavior:**
- Should identify PCT damage points in the dataset
- Provide specific mile marker references
- Detail damage type and repair needs

**Validation Checklist:**
- [ ] Response identifies PCT-related damage points
- [ ] Geographic specificity (mile markers or location names)
- [ ] Actionable repair guidance

---

## Persona 3: Elena Vasquez — Timber Cruiser

### Who Is Elena?

Elena is a **Timber Cruiser** tasked with assessing salvage timber before decay reduces value. She heard from Marcus that access routes may be blocked, so she needs to factor that in.

**Her Key Questions:**
- How much merchantable timber is available?
- What's the salvage window before decay?
- Are there access constraints I need to know about?

### Test 3.1: Timber Salvage Assessment

**What You're Testing:** Does the Cruising Assistant agent work with timber data?

```
You: What's the timber salvage potential for Cedar Creek? Give me volume estimates.
```

**Expected Behavior:**
1. Coordinator routes to `cruising_assistant` via AgentTool
2. Cruising Assistant loads `data/fixtures/cedar-creek/timber-plots.json`
3. Returns salvage assessment with volume, species, and economics

**Validation Checklist:**
- [ ] Response includes MBF (thousand board feet) estimates
- [ ] Species breakdown provided (PSME, THPL, TSHE, etc.)
- [ ] Mortality rates stated
- [ ] Salvage window timeline mentioned (18-24 months)
- [ ] Stumpage value estimates included
- [ ] Access constraints noted (if trail damage blocks routes)

**Domain Accuracy Questions:**
- Are species codes correct (PSME = Douglas Fir, etc.)?
- Do MBF values seem realistic for the acreage?
- Is the 18-24 month salvage window accurate for Pacific Northwest conditions?

### Test 3.2: Cross-Domain Constraint Awareness

**What You're Testing:** Does the system preserve context from previous agents?

```
You: Marcus mentioned the bridge failure at Mile 47.3. Does that affect timber access for any units?
```

**Expected Behavior:**
- Should connect trail damage to timber access
- May need to call both agents or reference session context
- Should identify any timber units affected by access constraints

**Validation Checklist:**
- [ ] Response acknowledges the bridge failure context
- [ ] Identifies which timber units (if any) are access-constrained
- [ ] Provides alternative access suggestions or flags the issue

---

## Persona 4: Dr. James Park — Environmental Coordinator

### Who Is Dr. Park?

Dr. Park is an **Environmental Coordinator** responsible for NEPA compliance. He needs to determine the appropriate pathway (CE, EA, or EIS) for the recovery actions being planned.

**His Key Questions:**
- What NEPA pathway applies to salvage logging?
- Are there Section 106 (historic preservation) triggers?
- What's the timeline for compliance?

### Test 4.1: NEPA Pathway Determination

**What You're Testing:** Does the NEPA Advisor agent provide compliance guidance?

```
You: What NEPA pathway should we use for timber salvage at Cedar Creek?
```

**Expected Behavior:**
1. Coordinator routes to `nepa_advisor` via AgentTool
2. NEPA Advisor analyzes project type against FSM/FSH requirements
3. Returns pathway recommendation with citations

**Validation Checklist:**
- [ ] Response recommends specific pathway (CE, EA, or EIS)
- [ ] Rationale provided (why not other pathways)
- [ ] Regulatory citations included (FSH 1909.15, 36 CFR 800, etc.)
- [ ] Timeline estimate provided
- [ ] Section 106 triggers identified (if PCT proximity applies)
- [ ] Confidence score stated

**Domain Accuracy Questions:**
- Is the CE/EA/EIS decision logic correct for salvage operations?
- Are the regulatory citations accurate (check FSM/FSH numbers)?
- Does Section 106 correctly trigger for National Historic Trail proximity?

### Test 4.2: Compliance Integration

**What You're Testing:** Does NEPA Advisor receive context from upstream agents?

```
You: Elena said Unit 12 is within 200m of the Pacific Crest Trail. Does that change the NEPA requirements?
```

**Expected Behavior:**
- Should recognize Section 106 trigger
- Should modify pathway recommendation if needed
- Should cite specific regulations for historic properties

**Validation Checklist:**
- [ ] Response acknowledges PCT proximity
- [ ] Section 106 consultation requirement identified
- [ ] SHPO notification mentioned
- [ ] EA pathway confirmed (CE typically not available with extraordinary circumstances)

---

## Persona 5: District Ranger — Synthesis Test

### The Ultimate Test: Recovery Briefing

The District Ranger needs a comprehensive briefing that synthesizes all four domains. This tests the Coordinator's ability to orchestrate multiple agents.

### Test 5.1: Full Recovery Briefing

**What You're Testing:** Does the Coordinator call ALL FOUR specialists and synthesize results?

```
You: Give me a complete recovery briefing for Cedar Creek. I need to brief the Regional Forester in 10 minutes.
```

**Expected Behavior:**
1. Coordinator calls `burn_analyst` → gets severity assessment
2. Coordinator calls `trail_assessor` → gets damage inventory
3. Coordinator calls `cruising_assistant` → gets salvage assessment
4. Coordinator calls `nepa_advisor` → gets compliance guidance
5. Synthesizes all four into coherent briefing

**Validation Checklist:**
- [ ] All four domains represented in response
- [ ] Burn severity summary with acreage
- [ ] Trail closures counted with cost estimate
- [ ] Timber volume and salvage window
- [ ] NEPA pathway recommendation
- [ ] Cross-domain insights (e.g., "bridge repair unlocks timber access")
- [ ] Overall confidence (should be lowest of four specialists)
- [ ] Recommended next steps prioritized
- [ ] Response time < 60 seconds for full synthesis

**This is the money test.** If this works, the multi-agent orchestration is validated.

---

## Edge Case Tests

### Test E1: Unknown Fire ID

```
You: What's the burn severity for Bootleg Fire?
```

**Expected:** Should indicate no data available for Bootleg (fixtures only have Cedar Creek), but handle gracefully without crashing.

### Test E2: Ambiguous Query

```
You: What should we do next?
```

**Expected:** Coordinator should ask for clarification or provide general guidance without calling specialists unnecessarily.

### Test E3: Out-of-Domain Query

```
You: What's the weather forecast for next week?
```

**Expected:** Should acknowledge this is outside scope, not hallucinate a response.

### Test E4: Malformed Fire ID

```
You: Burn severity for cedar creek
```

**Expected:** Fire ID normalization should handle "cedar creek" → "cedar-creek-2022"

---

## Validation Summary Template

After completing all tests, fill out this summary:

```markdown
# RANGER Phase 0 Validation Summary
**Date:** [DATE]
**Tester:** [NAME]
**Environment:** Local ADK (`adk run coordinator`)

## Persona Test Results

| Persona | Test | Pass/Fail | Notes |
|---------|------|-----------|-------|
| Sarah (Burn) | 1.1 Severity | | |
| Sarah (Burn) | 1.2 Sector | | |
| Sarah (Burn) | 1.3 MTBS | | |
| Sarah (Burn) | 1.4 Boundary | | |
| Marcus (Trail) | 2.1 Inventory | | |
| Marcus (Trail) | 2.2 Deep Dive | | |
| Elena (Timber) | 3.1 Salvage | | |
| Elena (Timber) | 3.2 Cross-Domain | | |
| Dr. Park (NEPA) | 4.1 Pathway | | |
| Dr. Park (NEPA) | 4.2 Section 106 | | |
| District Ranger | 5.1 Full Briefing | | |

## Edge Cases

| Test | Result | Notes |
|------|--------|-------|
| E1: Unknown Fire | | |
| E2: Ambiguous | | |
| E3: Out-of-Domain | | |
| E4: Malformed ID | | |

## Domain Accuracy Assessment

- [ ] Burn severity thresholds are correct (MTBS standards)
- [ ] Trail damage classifications match TRACS
- [ ] Timber species codes are valid (FIA codes)
- [ ] NEPA regulatory citations are accurate
- [ ] Cross-domain dependencies make sense

## Technical Quality

- [ ] All four specialists successfully called
- [ ] Confidence scores preserved end-to-end
- [ ] Citations included in responses
- [ ] Reasoning chains visible (if requested)
- [ ] Response times acceptable (< 30s typical, < 60s for full briefing)

## Issues Found

1. [Issue description, severity, recommended fix]
2. ...

## Ready for Deployment?

[ ] Yes - All critical tests pass, domain accuracy validated
[ ] No - Blocking issues: [list]
```

---

## CLI Testing Commands (For Quick Checks)

If you want to test individual skills without going through the agent:

```bash
# Test Burn Severity skill directly
cd /Users/jvalenzano/Projects/ranger-twin
python -c "
from agents.burn_analyst.skills.soil_burn_severity.scripts.assess_severity import execute
import json
result = execute({'fire_id': 'cedar-creek-2022'})
print(json.dumps(result, indent=2))
"

# Test Trail Damage skill directly
python -c "
from agents.trail_assessor.skills.damage_classification.scripts.classify_damage import execute
import json
result = execute({'fire_id': 'cedar-creek-2022'})
print(json.dumps(result, indent=2))
"
```

---

## Next Steps After Validation

1. **If all tests pass:** Proceed to Phase 1 (cascade triggers, proactive alerts)
2. **If domain issues found:** Update skill logic or fixtures
3. **If technical issues found:** Debug agent routing or tool invocation
4. **If UX issues found:** Document for Command Console improvements

---

*Document Version: 1.0 — December 29, 2025*
*Aligned with: ADR-005 (Skills-First), USER-JOURNEYS-AND-PERSONAS.md*

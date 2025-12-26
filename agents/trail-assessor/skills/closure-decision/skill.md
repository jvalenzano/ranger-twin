# Closure Decision

## Description
Evaluates trail safety and determines risk-based closure recommendations following post-fire
assessment protocols. Calculates composite risk scores based on damage severity, hazard trees,
infrastructure condition, and public safety factors. This is the Trail Assessor's primary tool
for making trail closure and reopening decisions.

## Triggers
When should the agent invoke this skill?
- User asks about trail closure recommendations or decisions
- Query mentions trail safety or risk assessment
- Request for reopening timelines or schedules
- Questions about seasonal access considerations
- Public safety concerns related to trails
- Closure status queries for specific trails

## Instructions
Step-by-step reasoning for the agent:
1. **Load Trail Data**: Retrieve trail and damage data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Optionally filter by trail_id for specific trail analysis
   - Load from Cedar Creek fixtures or provided data
   - Validate damage points and trail metadata
2. **Calculate Risk Score**: Assess multiple risk factors (0-100 scale)
   - Damage severity: Weight damage point severities
   - Hazard trees: Count and density of hazard trees
   - Infrastructure: Bridge/culvert failures
   - Accessibility: Trail class and remoteness
3. **Apply Seasonal Adjustments**: Modify risk based on season
   - Summer: Baseline risk
   - Fall: +10 risk (increased debris)
   - Winter: +20 risk (snow, ice, reduced access)
   - Spring: +15 risk (snowmelt, runoff)
4. **Determine Closure Status**: Apply risk thresholds
   - OPEN: Risk < 25 - Safe for public use
   - OPEN_CAUTION: Risk 25-50 - Use with awareness
   - RESTRICTED: Risk 50-75 - Limited access only
   - CLOSED: Risk >= 75 - Unsafe, no public access
5. **Estimate Reopening Timeline**: Based on closure status and work required
   - OPEN: Immediate
   - OPEN_CAUTION: 1-2 months with warnings
   - RESTRICTED: 3-6 months with treatments
   - CLOSED: 6-12+ months with major reconstruction
6. **Generate Reasoning Chain**: Document risk calculation decisions
   - Include risk component scores and seasonal factors
   - Note critical safety concerns

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| trail_id | string | No | Optional specific trail to analyze (analyzes all if not provided) |
| season | string | No | Season for risk adjustment (summer, fall, winter, spring) - defaults to summer |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| trails_evaluated | number | Number of trails evaluated |
| closure_decisions | array | Risk scores and closure status per trail |
| risk_factors | object | Breakdown of contributing risk factors by trail |
| reopening_timeline | object | Estimated timeline for each trail |
| seasonal_adjustments | object | Season-specific risk considerations |
| reasoning_chain | array | Step-by-step closure decisions |
| confidence | number | Assessment confidence (0-1) |
| data_sources | array | Sources used |
| recommendations | array | Closure and reopening recommendations |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the fire by ID and load trail damage data
2. Then, calculate risk scores for each trail using weighted factors
3. Next, apply seasonal adjustments based on the specified season
4. Then, determine closure status using risk thresholds
5. Finally, estimate reopening timelines and generate recommendations

## Resources
- `resources/risk-thresholds.json` - Risk components, weights, and closure level definitions

## Scripts
- `scripts/evaluate_closure.py` - Python implementation of closure decision analysis
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022", "season": "summer"}`
  - Returns: Complete closure analysis with risk scores and timelines

## Examples

### Example 1: All Trails Assessment
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "season": "summer"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trails_evaluated": 5,
  "season": "summer",
  "closure_decisions": [
    {
      "trail_id": "hills-creek-3510",
      "trail_name": "Hills Creek Trail #3510",
      "risk_score": 88.0,
      "closure_status": "CLOSED",
      "primary_concerns": ["Bridge failure", "Massive debris flow", "Multiple high-severity damage"]
    },
    {
      "trail_id": "waldo-lake-3536",
      "trail_name": "Waldo Lake Trail #3536",
      "risk_score": 72.0,
      "closure_status": "RESTRICTED",
      "primary_concerns": ["Bridge failure", "Major debris accumulation", "Hazard tree corridor"]
    },
    {
      "trail_id": "timpanogas-3527",
      "trail_name": "Timpanogas Lake Trail #3527",
      "risk_score": 18.0,
      "closure_status": "OPEN",
      "primary_concerns": []
    }
  ],
  "reopening_timeline": {
    "hills-creek-3510": {
      "status": "CLOSED",
      "estimated_months": 12,
      "timeline": "12+ months",
      "dependencies": ["Bridge replacement", "Debris clearing", "Full reconstruction"]
    },
    "waldo-lake-3536": {
      "status": "RESTRICTED",
      "estimated_months": 6,
      "timeline": "3-6 months",
      "dependencies": ["Bridge replacement", "Hazard tree removal"]
    },
    "timpanogas-3527": {
      "status": "OPEN",
      "estimated_months": 0,
      "timeline": "Immediate",
      "dependencies": []
    }
  },
  "reasoning_chain": [
    "Evaluating 5 trails for Cedar Creek Fire (season: summer)",
    "Hills Creek Trail: Base risk 88.0 (4 damage points, avg severity 4.25) -> CLOSED",
    "Waldo Lake Trail: Base risk 72.0 (4 damage points, 1 bridge failure) -> RESTRICTED",
    "Timpanogas Trail: Base risk 18.0 (2 minor damage points) -> OPEN"
  ],
  "confidence": 0.88,
  "data_sources": ["Cedar Creek field assessment 2022-10-25"],
  "recommendations": [
    "Maintain CLOSED status for Hills Creek Trail pending engineering assessment",
    "Restrict Waldo Lake Trail access to designated areas only",
    "Open Timpanogas Trail with hazard tree warning signage"
  ]
}
```

### Example 2: Single Trail Winter Assessment
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trail_id": "waldo-lake-3536",
  "season": "winter"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trails_evaluated": 1,
  "season": "winter",
  "closure_decisions": [
    {
      "trail_id": "waldo-lake-3536",
      "trail_name": "Waldo Lake Trail #3536",
      "risk_score": 92.0,
      "base_risk": 72.0,
      "seasonal_adjustment": 20.0,
      "closure_status": "CLOSED",
      "primary_concerns": ["Winter conditions increase hazard tree risk", "Bridge failure", "Snow limits rescue access"]
    }
  ],
  "seasonal_adjustments": {
    "season": "winter",
    "adjustment": 20.0,
    "rationale": "Winter conditions: snow, ice, reduced access for emergency response"
  },
  "reopening_timeline": {
    "waldo-lake-3536": {
      "status": "CLOSED",
      "estimated_months": 6,
      "timeline": "Spring 2023 at earliest",
      "dependencies": ["Wait for snowmelt", "Bridge replacement", "Hazard tree removal"]
    }
  },
  "reasoning_chain": [
    "Analyzing Waldo Lake Trail #3536 for winter season",
    "Base risk: 72.0 (bridge failure + debris + hazard trees)",
    "Winter adjustment: +20 (snow/ice hazards) -> Total risk: 92.0",
    "Risk 92.0 >= 75 -> CLOSED status required"
  ],
  "confidence": 0.88
}
```

## References
- USFS Trail Closure Decision Matrix
- Post-Fire Trail Safety Assessment Guidelines
- Cedar Creek Trail Damage Fixture: `data/fixtures/cedar-creek/trail-damage.json`

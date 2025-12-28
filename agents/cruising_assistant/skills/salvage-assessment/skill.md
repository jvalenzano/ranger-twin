# Salvage Assessment

## Description
Assesses timber salvage viability after wildfire based on deterioration timelines, species-specific
decay rates, wood quality degradation, access difficulty, and market factors. Calculates salvage
windows, viability scores, and prioritizes plots for harvest operations.

## Triggers
When should the agent invoke this skill?
- User asks about salvage viability or timing
- Query mentions "salvage window" or "deterioration"
- Request for salvage prioritization or ranking
- Questions about blue stain, wood quality degradation
- Post-fire timber recovery planning
- Market analysis for burned timber

## Instructions
Step-by-step reasoning for the agent:
1. **Calculate Time Since Fire**: Determine months elapsed from fire containment
   - Use fire date and current/assessment date
   - Factor in seasonal deterioration rates
2. **Assess Deterioration Stage**: Evaluate wood quality degradation
   - Blue stain onset: TSHE 6mo, PICO 6mo, PSME 12mo, THPL 24mo
   - Structural degradation: bark beetles, checking, rot
   - Species-specific decay resistance
3. **Calculate Salvage Window**: Determine remaining time for harvest
   - Quality tiers: Premium (Grade 1-2), Commercial (Grade 3), Utility (Grade 4)
   - Window shrinks with mortality percentage and burn severity
4. **Assess Grade Impact**: Calculate grade degradation from fire damage
   - Original grade from pre-fire assessments
   - Downgrade based on char, checking, blue stain
   - Volume loss from defect progression
5. **Calculate Viability Score**: Weighted composite score (0-100)
   - Deterioration stage (30%), Access difficulty (25%)
   - Market demand (25%), Volume/value (20%)
6. **Rank by Priority**: Sort plots for operational planning
   - Highest viability plots harvest first
   - Group by access corridor for efficiency

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| fire_date | string | No | Fire containment date (YYYY-MM-DD) |
| assessment_date | string | No | Current assessment date (default: today) |
| plots | array | No | Plot data with species, volume, quality, access |
| include_recommendations | boolean | No | Include detailed harvest recommendations (default: true) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| months_since_fire | number | Elapsed time since fire containment |
| plots_assessed | number | Number of plots analyzed |
| priority_plots | array | Ranked plots with viability scores and urgency |
| deterioration_summary | object | Overall decay status by species |
| salvage_window | object | Remaining time windows by quality tier |
| reasoning_chain | array | Step-by-step viability assessments |
| confidence | number | Assessment confidence (0-1) |
| data_sources | array | Sources used for deterioration models |
| recommendations | array | Operational harvest guidance |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, calculate elapsed time since fire and current deterioration stage
2. Then, assess each plot's wood quality based on species decay rates
3. Next, calculate remaining salvage windows before quality drops
4. Then, score viability based on deterioration, access, market, and volume
5. Finally, rank plots and generate priority harvest schedule

## Resources
- `resources/deterioration-models.json` - Decay timelines by species and severity
- `resources/market-factors.json` - PNW timber prices and demand by grade
- `resources/viability-criteria.json` - Scoring weights and thresholds

## Scripts
- `scripts/assess_salvage.py` - Python implementation of salvage assessment
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022", "fire_date": "2022-09-15"}`
  - Returns: Complete salvage viability analysis with priority ranking

## Examples

### Example 1: Cedar Creek Salvage Assessment
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "fire_date": "2022-09-15",
  "assessment_date": "2023-03-01"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "months_since_fire": 5.5,
  "plots_assessed": 6,
  "priority_plots": [
    {
      "plot_id": "52-FOXTROT",
      "sector": "SW-1",
      "viability_score": 95,
      "urgency": "IMMEDIATE",
      "deterioration_stage": "Early - Premium quality retained",
      "salvage_window_months": 12,
      "volume_mbf": 48.2,
      "salvage_value": 3225000,
      "primary_species": "PSME",
      "access": "Good - Road 1934-340 cable system",
      "recommendation": "Highest priority. Extract immediately to preserve Grade 1S lumber."
    },
    {
      "plot_id": "47-BRAVO",
      "sector": "SW-1",
      "viability_score": 92,
      "urgency": "HIGH",
      "deterioration_stage": "Early - No visible blue stain",
      "salvage_window_months": 10,
      "volume_mbf": 42.8,
      "salvage_value": 2914000,
      "primary_species": "PSME",
      "access": "Moderate - Cable yarding required",
      "recommendation": "Prioritize for Q1 2023 harvest before spring moisture accelerates decay."
    }
  ],
  "deterioration_summary": {
    "PSME": {
      "stage": "Early",
      "months_to_blue_stain": 6.5,
      "quality_retention": "95%",
      "notes": "Douglas-fir holding grade well. Act before 12-month threshold."
    },
    "TSHE": {
      "stage": "Moderate",
      "months_to_blue_stain": 0.5,
      "quality_retention": "70%",
      "notes": "Western hemlock entering blue stain phase. Grade degradation expected."
    }
  },
  "salvage_window": {
    "premium": {
      "months_remaining": 6.5,
      "deadline": "2023-09-15",
      "volume_at_risk_mbf": 90.6
    },
    "commercial": {
      "months_remaining": 18,
      "deadline": "2024-03-15",
      "volume_at_risk_mbf": 45.2
    }
  },
  "reasoning_chain": [
    "Fire contained 2022-09-15, assessment 2023-03-01 = 5.5 months elapsed",
    "Plot 52-FOXTROT: PSME dominant, 5.5 months < 12-month blue stain threshold -> EARLY stage",
    "Plot 52-FOXTROT: Premium sawlogs (Grade 1S), excellent access -> Viability 95/100",
    "Plot 47-BRAVO: PSME, early stage, steep access -> Viability 92/100",
    "TSHE plots approaching 6-month blue stain threshold - monitor closely",
    "Recommend immediate operations on SW-1 sector high-value plots"
  ],
  "confidence": 0.91,
  "data_sources": [
    "PNW salvage deterioration models",
    "Cedar Creek timber plot data",
    "Regional market analysis Q1 2023"
  ],
  "recommendations": [
    "Mobilize harvest operations for SW-1 sector by April 2023",
    "Prioritize plots 52-FOXTROT and 47-BRAVO for cable yarding",
    "Establish log decks within 2 miles for rapid extraction",
    "Monitor hemlock plots monthly for blue stain progression",
    "Consider helicopter extraction for high-value NW-1 if road access fails"
  ]
}
```

### Example 2: Late-Stage Salvage Window Expired
**Input:**
```json
{
  "fire_id": "old-fire-2020",
  "fire_date": "2020-08-01",
  "assessment_date": "2023-03-01"
}
```

**Output:**
```json
{
  "fire_id": "old-fire-2020",
  "months_since_fire": 31,
  "plots_assessed": 3,
  "priority_plots": [
    {
      "plot_id": "TEST-1",
      "viability_score": 25,
      "urgency": "LOW",
      "deterioration_stage": "Advanced - Blue stain throughout",
      "salvage_window_months": 0,
      "grade_impact": "Downgraded from 2S to 4S",
      "recommendation": "Consider for firewood/biomass only. Structural lumber no longer viable."
    }
  ],
  "reasoning_chain": [
    "Fire contained 31 months ago - well past premium salvage window",
    "All species beyond blue stain threshold",
    "Volume degraded 40-60% due to checking and decay",
    "Only utility-grade value remains"
  ],
  "recommendations": [
    "Abandon plans for commercial sawlog recovery",
    "Evaluate biomass utilization for fire prevention",
    "Leave low-value plots for wildlife habitat"
  ]
}
```

## References
- Filip, G.M. & Goheen, D.J. (1984) "Root Diseases Cause Severe Mortality in White and Grand Fir"
- Harrington, T.B. (2013) "Forest Vegetation Responses to Eastern Oregon Wildfires"
- PNW-GTR-850: "Salvage Timber Sale Guidelines"
- Blue Stain Decay Curves: Russell (2008) post-fire timber studies
- Cedar Creek Timber Plots: `data/fixtures/cedar-creek/timber-plots.json`

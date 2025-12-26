# Damage Classification

## Description
Classifies trail damage into USFS Type I-IV categories based on severity and damage type.
Provides standardized damage assessment for repair prioritization, cost estimation, and
resource allocation. This is the Trail Assessor's primary tool for understanding trail
infrastructure condition post-fire.

## Triggers
When should the agent invoke this skill?
- User asks about trail damage assessment or classification
- Query mentions specific damage points or severity levels
- Request for infrastructure damage analysis (bridges, culverts)
- Questions about damage types or categorization
- Repair cost estimates or work type identification
- Hazard zone identification requests

## Instructions
Step-by-step reasoning for the agent:
1. **Load Trail Data**: Retrieve trail damage data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Optionally filter by trail_id for specific trail analysis
   - Load from Cedar Creek fixtures or provided data
   - Validate that damage points include severity and type
2. **Classify Each Damage Point**: Apply USFS Type I-IV standards
   - TYPE I (Minor): Severity 1-2, passable with caution
   - TYPE II (Moderate): Severity 3, significant erosion or damage
   - TYPE III (Major): Severity 4, structural failure
   - TYPE IV (Severe): Severity 5, complete destruction
3. **Assess Infrastructure**: Evaluate bridges, culverts, and structures
   - Identify infrastructure-specific damage (bridge failure, culvert damage)
   - Assess structural integrity and replacement needs
   - Flag critical access points requiring immediate attention
4. **Identify Hazard Zones**: Flag high-risk areas
   - Multiple damage points in proximity
   - High severity (4-5) concentrations
   - Critical infrastructure failures
   - Public safety concerns
5. **Generate Reasoning Chain**: Document each classification decision
   - Include damage IDs, types, and severity values
   - Note infrastructure concerns and hazard zones
6. **Calculate Confidence**: Based on data quality
   - Complete fixture data: 0.90 base confidence
   - Reduce for missing fields or incomplete assessments

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| trail_id | string | No | Optional specific trail to analyze (analyzes all if not provided) |
| damage_points | array | No | Optional pre-loaded damage point data (uses fixtures if not provided) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| trails_assessed | number | Number of trails analyzed |
| total_damage_points | number | Total damage points classified |
| damage_points | array | Classified damage points with type assignments |
| type_summary | object | Count and cost breakdown by Type I-IV |
| infrastructure_issues | array | Bridge and culvert damage summary |
| hazard_zones | array | High-risk areas requiring immediate attention |
| reasoning_chain | array | Step-by-step classification decisions |
| confidence | number | Assessment confidence (0-1) |
| data_sources | array | Sources used |
| recommendations | array | Damage mitigation recommendations |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the fire by ID and load trail damage data
2. Then, classify each damage point using USFS Type I-IV standards
3. Next, aggregate damage by type with cost totals
4. Then, identify infrastructure failures and hazard zones
5. Finally, generate prioritized recommendations for trail managers

## Resources
- `resources/damage-type-matrix.json` - USFS Type I-IV definitions with severity ranges

## Scripts
- `scripts/classify_damage.py` - Python implementation of damage classification
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022"}`
  - Returns: Complete damage classification with type breakdown and recommendations

## Examples

### Example 1: Full Fire Assessment
**Input:**
```json
{
  "fire_id": "cedar-creek-2022"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trails_assessed": 5,
  "total_damage_points": 16,
  "type_summary": {
    "TYPE_IV": {
      "count": 4,
      "total_cost": 298000,
      "severity_range": "5"
    },
    "TYPE_III": {
      "count": 4,
      "total_cost": 80000,
      "severity_range": "4"
    },
    "TYPE_II": {
      "count": 5,
      "total_cost": 61500,
      "severity_range": "3"
    },
    "TYPE_I": {
      "count": 3,
      "total_cost": 7300,
      "severity_range": "1-2"
    }
  },
  "infrastructure_issues": [
    {
      "damage_id": "WL-001",
      "trail_name": "Waldo Lake Trail #3536",
      "type": "BRIDGE_FAILURE",
      "severity": 5,
      "estimated_cost": 85000,
      "concern": "Complete loss of 40ft timber bridge. Requires full replacement."
    }
  ],
  "hazard_zones": [
    {
      "trail_id": "hills-creek-3510",
      "trail_name": "Hills Creek Trail #3510",
      "damage_count": 4,
      "avg_severity": 4.25,
      "total_cost": 238000,
      "concern": "Multiple high-severity damage points along primary access route"
    }
  ],
  "reasoning_chain": [
    "Loaded 5 trails with 16 total damage points for Cedar Creek Fire",
    "WL-001: Severity 5 -> TYPE IV (Severe) - Bridge failure requiring replacement",
    "HC-001: Severity 5 -> TYPE IV (Severe) - Critical infrastructure damage",
    "BL-002: Severity 4 -> TYPE III (Major) - Dense hazard tree concentration",
    "Identified 3 bridge failures as infrastructure issues",
    "Hills Creek Trail flagged as hazard zone: 4 damage points, avg severity 4.25"
  ],
  "confidence": 0.90,
  "data_sources": ["Cedar Creek field assessment 2022-10-25"],
  "recommendations": [
    "Immediate attention to TYPE IV damage at WL-001, HC-001, BL-001, HC-002",
    "Deploy engineering team for bridge replacement assessment (3 failures)",
    "Establish hazard zone closures at Hills Creek Trail pending mitigation"
  ]
}
```

### Example 2: Single Trail Assessment
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trail_id": "waldo-lake-3536"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "trails_assessed": 1,
  "total_damage_points": 4,
  "damage_points": [
    {
      "damage_id": "WL-001",
      "milepost": 2.3,
      "type": "BRIDGE_FAILURE",
      "severity": 5,
      "damage_type": "TYPE_IV",
      "estimated_cost": 85000,
      "reasoning": "Severity 5 -> TYPE IV (Severe). Complete bridge replacement required."
    }
  ],
  "type_summary": {
    "TYPE_IV": {"count": 1, "total_cost": 85000},
    "TYPE_III": {"count": 1, "total_cost": 12000},
    "TYPE_II": {"count": 1, "total_cost": 32000},
    "TYPE_I": {"count": 1, "total_cost": 4500}
  },
  "reasoning_chain": [
    "Analyzing Waldo Lake Trail #3536 (4 damage points)",
    "WL-001: Severity 5 -> TYPE IV - Bridge failure",
    "WL-002: Severity 4 -> TYPE III - Major debris flow",
    "WL-003: Severity 3 -> TYPE II - Hazard tree corridor",
    "WL-004: Severity 2 -> TYPE I - Minor tread erosion"
  ],
  "confidence": 0.90
}
```

## References
- USFS Trail Construction and Maintenance Notebook
- Trail Damage Assessment Protocols (BAER Program)
- Cedar Creek Trail Damage Fixture: `data/fixtures/cedar-creek/trail-damage.json`

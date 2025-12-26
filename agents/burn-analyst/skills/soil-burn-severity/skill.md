# Soil Burn Severity

## Description
Assesses soil burn severity for a fire incident using dNBR (differenced Normalized Burn
Ratio) values and field indicators. Provides severity classification, affected acreage
breakdown, and BAER assessment recommendations. This is the Burn Analyst's primary tool
for understanding fire impact on soil resources.

## Triggers
When should the agent invoke this skill?
- User asks about burn severity for a specific fire
- Query mentions "soil burn" or "burn severity"
- Request for BAER (Burned Area Emergency Response) assessment data
- Questions about fire impact on soil or watershed
- dNBR analysis or interpretation requests
- Severity classification or breakdown requests
- Fire damage assessment queries

## Instructions
Step-by-step reasoning for the agent:
1. **Load Fire Data**: Retrieve burn severity data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Load from Cedar Creek fixtures or provided data
   - Validate that sector data includes dNBR values
2. **Classify Each Sector**: Apply dNBR thresholds to determine severity
   - UNBURNED: dNBR < 0.1
   - LOW: 0.1 ≤ dNBR < 0.27
   - MODERATE: 0.27 ≤ dNBR < 0.66
   - HIGH: dNBR ≥ 0.66
3. **Calculate Acreage Breakdown**: Sum acres by severity class
   - Total acres for each severity level
   - Percentage distribution
4. **Assess Risk Factors**: Evaluate erosion and recovery concerns
   - High severity + steep slopes = critical erosion risk
   - Watershed proximity increases priority
   - Old-growth or seed source considerations
5. **Generate Reasoning Chain**: Document each classification decision
   - Include sector names and dNBR values
   - Note special concerns from priority_notes
6. **Calculate Confidence**: Based on data quality
   - Complete fixture data: 0.92 base confidence
   - Reduce for missing fields or stale imagery

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| sectors | array | No | Optional pre-loaded sector data (uses fixtures if not provided) |
| include_geometry | boolean | No | Whether to include GeoJSON in response (default: false) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| fire_name | string | Display name of the fire |
| total_acres | number | Total burned acres assessed |
| severity_breakdown | object | Acres and percentage by severity class |
| sectors | array | Sector-level assessments with severity and concerns |
| priority_sectors | array | Sectors requiring immediate attention |
| reasoning_chain | array | Step-by-step classification decisions |
| confidence | number | Assessment confidence (0-1) |
| data_sources | array | Sources used (e.g., MTBS, imagery date) |
| recommendations | array | BAER assessment recommendations |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the fire by ID and load sector-level burn data
2. Then, classify each sector using standardized dNBR thresholds
3. Next, aggregate acreage by severity class with percentages
4. Then, evaluate each sector for risk factors (slope, watershed, access)
5. Finally, generate prioritized recommendations for BAER team deployment

## Resources
- `resources/severity-indicators.json` - dNBR thresholds and field indicators

## Scripts
- `scripts/assess_severity.py` - Python implementation of severity assessment
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022"}`
  - Returns: Complete severity assessment with breakdown and recommendations

## Examples

### Example 1: Basic Severity Query
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
  "fire_name": "Cedar Creek Fire",
  "total_acres": 127341,
  "severity_breakdown": {
    "high": {
      "acres": 81041,
      "percentage": 63.6,
      "sector_count": 4
    },
    "moderate": {
      "acres": 37900,
      "percentage": 29.8,
      "sector_count": 3
    },
    "low": {
      "acres": 8400,
      "percentage": 6.6,
      "sector_count": 1
    }
  },
  "priority_sectors": [
    {
      "id": "CORE-1",
      "name": "Central Fire Origin",
      "severity": "HIGH",
      "dnbr_mean": 0.81,
      "acres": 27001,
      "concern": "Fire origin area. Complete stand replacement. Seed source planning critical."
    },
    {
      "id": "SW-1",
      "name": "Hills Creek Drainage",
      "severity": "HIGH",
      "dnbr_mean": 0.76,
      "acres": 21500,
      "concern": "Highest priority salvage. Commercial timber value. Critical road access needed."
    }
  ],
  "reasoning_chain": [
    "Loaded 8 sectors for Cedar Creek Fire (127,341 total acres)",
    "CORE-1 (Central Fire Origin): dNBR 0.81 >= 0.66 -> HIGH severity",
    "SW-1 (Hills Creek Drainage): dNBR 0.76 >= 0.66 -> HIGH severity",
    "NW-1 (Waldo Lake North): dNBR 0.72 >= 0.66 -> HIGH severity",
    "NW-2 (Waldo Lake South): dNBR 0.68 >= 0.66 -> HIGH severity",
    "SE-1 (Odell Lake Corridor): dNBR 0.48 in [0.27, 0.66) -> MODERATE severity",
    "NE-1 (Charlton Lake Area): dNBR 0.45 in [0.27, 0.66) -> MODERATE severity",
    "NE-2 (Bobby Lake Basin): dNBR 0.42 in [0.27, 0.66) -> MODERATE severity",
    "SW-2 (Timpanogas Lake Area): dNBR 0.22 in [0.1, 0.27) -> LOW severity",
    "High severity dominates (63.6%) - significant BAER resources needed"
  ],
  "confidence": 0.92,
  "data_sources": ["MTBS", "Imagery date: 2022-09-15"],
  "recommendations": [
    "Deploy BAER team to CORE-1 (Central Fire Origin) - highest dNBR with complete stand replacement",
    "Prioritize erosion control at SW-1 (Hills Creek Drainage) - 45° average slope with high severity",
    "Assess watershed impacts at NW-1 (Waldo Lake North) - critical watershed protection area"
  ]
}
```

### Example 2: Specific Sector Query
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "sectors": [
    {
      "id": "SW-1",
      "name": "Hills Creek Drainage",
      "dnbr_mean": 0.76,
      "acres": 21500,
      "slope_avg": 45
    }
  ]
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "fire_name": "Cedar Creek Fire",
  "total_acres": 21500,
  "severity_breakdown": {
    "high": {
      "acres": 21500,
      "percentage": 100.0,
      "sector_count": 1
    }
  },
  "sectors": [
    {
      "id": "SW-1",
      "name": "Hills Creek Drainage",
      "severity": "HIGH",
      "severity_class": 4,
      "dnbr_mean": 0.76,
      "acres": 21500,
      "slope_avg": 45,
      "erosion_risk": "CRITICAL",
      "reasoning": "dNBR 0.76 >= 0.66 -> HIGH. Steep slope (45°) + high severity = critical erosion risk."
    }
  ],
  "reasoning_chain": [
    "Analyzing 1 sector for Cedar Creek Fire",
    "SW-1: dNBR 0.76 >= 0.66 -> HIGH severity (class 4)",
    "SW-1: Slope 45° + HIGH severity -> CRITICAL erosion risk"
  ],
  "confidence": 0.92,
  "data_sources": ["User-provided sector data"]
}
```

## References
- MTBS Classification: https://www.mtbs.gov/
- BAER Program: https://www.fs.usda.gov/naturalresources/watershed/burnedareas.shtml
- dNBR Thresholds: Key & Benson (2006) landscape assessment protocol
- Cedar Creek Fire Fixture: `data/fixtures/cedar-creek/burn-severity.json`

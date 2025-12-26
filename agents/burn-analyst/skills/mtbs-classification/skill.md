# MTBS Classification

## Description
Classifies fire sectors using the Monitoring Trends in Burn Severity (MTBS) protocol.
Provides standardized severity class assignments (1-4) with MTBS data source citations.
This skill focuses on the classification methodology and sector-level assignments,
complementing the Soil Burn Severity skill's detailed assessment.

## Triggers
When should the agent invoke this skill?
- User asks for MTBS classification of a fire
- Query requests severity class numbers (1-4 scale)
- Questions about MTBS methodology or protocol
- Request for severity map classes
- Questions about severity thresholding methodology
- Comparison of sectors by MTBS class

## Instructions
Step-by-step reasoning for the agent:
1. **Load Fire Data**: Retrieve sector data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Load from Cedar Creek fixtures or provided data
   - Validate that sector data includes dNBR values
2. **Apply MTBS Protocol**: Classify using MTBS thresholds
   - Class 1: Unburned/Unchanged (dNBR < 0.1)
   - Class 2: Low Severity (0.1 ≤ dNBR < 0.27)
   - Class 3: Moderate Severity (0.27 ≤ dNBR < 0.66)
   - Class 4: High Severity (dNBR ≥ 0.66)
3. **Assign Class Labels**: Apply standard MTBS nomenclature
   - Use numeric class (1-4) for mapping systems
   - Use text label for human readability
4. **Calculate Class Distribution**: Aggregate by severity class
   - Sector count per class
   - Acreage per class
   - Percentage of total area
5. **Generate Classification Report**: Document methodology
   - Include MTBS source citation
   - Note imagery date and sensor
   - Provide class definitions

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| sectors | array | No | Optional pre-loaded sector data (uses fixtures if not provided) |
| include_class_map | boolean | No | Whether to include GeoJSON class map (default: false) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The classified fire identifier |
| fire_name | string | Display name of the fire |
| total_acres | number | Total acres classified |
| classification_summary | object | Acres and percentage by MTBS class |
| sector_classifications | array | Sector-level class assignments |
| dominant_class | object | Most prevalent severity class |
| mtbs_metadata | object | MTBS source, imagery date, thresholds |
| reasoning_chain | array | Step-by-step classification decisions |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, identify the fire and load sector-level dNBR data
2. Then, apply MTBS classification thresholds to each sector
3. Next, assign numeric class (1-4) and text label
4. Then, aggregate class distribution across all sectors
5. Finally, identify the dominant severity class and generate report

## Resources
- `resources/mtbs-thresholds.json` - Official MTBS classification thresholds

## Scripts
- `scripts/classify_mtbs.py` - Python implementation of MTBS classification
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022"}`
  - Returns: Classification report with sector assignments

## Examples

### Example 1: Basic MTBS Classification
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
  "classification_summary": {
    "class_4": {
      "label": "High Severity",
      "acres": 81041,
      "percentage": 63.6,
      "sector_count": 4
    },
    "class_3": {
      "label": "Moderate Severity",
      "acres": 37900,
      "percentage": 29.8,
      "sector_count": 3
    },
    "class_2": {
      "label": "Low Severity",
      "acres": 8400,
      "percentage": 6.6,
      "sector_count": 1
    }
  },
  "sector_classifications": [
    {
      "id": "CORE-1",
      "name": "Central Fire Origin",
      "mtbs_class": 4,
      "mtbs_label": "High Severity",
      "dnbr_mean": 0.81,
      "acres": 27001
    }
  ],
  "dominant_class": {
    "class": 4,
    "label": "High Severity",
    "percentage": 63.6
  },
  "mtbs_metadata": {
    "source": "MTBS",
    "imagery_date": "2022-09-15",
    "thresholds": "Key & Benson (2006)",
    "sensor": "Landsat 8 OLI"
  },
  "reasoning_chain": [
    "Loaded 8 sectors for Cedar Creek Fire",
    "Applied MTBS classification to each sector",
    "Class 4 (High Severity) is dominant at 63.6% of area"
  ]
}
```

## References
- MTBS Classification: https://www.mtbs.gov/
- Key & Benson (2006) Landscape Assessment
- Landsat dNBR methodology: https://www.usgs.gov/landsat-missions

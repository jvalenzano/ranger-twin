# Boundary Mapping

## Description
Validates fire perimeter geometry and provides boundary analysis. Calculates
perimeter statistics, identifies geometry issues, and compares reported versus
calculated acreage. Essential for verifying NIFC perimeter data quality and
identifying mapping inconsistencies.

## Triggers
When should the agent invoke this skill?
- User asks about fire perimeter or boundary
- Questions about fire extent or area calculations
- Request to validate perimeter geometry
- Query about reported vs actual acreage discrepancy
- Questions about sector boundary alignment
- Perimeter quality assessment requests

## Instructions
Step-by-step reasoning for the agent:
1. **Load Perimeter Data**: Retrieve geometry data for the specified fire
   - Accept fire_id parameter to identify the fire
   - Load sector geometries from fixtures or provided data
   - Validate that geometries are present
2. **Validate Geometry**: Check each sector polygon for issues
   - Verify polygon closure (first point = last point)
   - Check for valid coordinate ranges
   - Identify self-intersections if possible
3. **Calculate Statistics**: Compute perimeter metrics
   - Calculate perimeter length (degrees to approximate meters)
   - Calculate area from coordinates
   - Sum across all sectors
4. **Compare Acreage**: Check reported vs calculated
   - Convert calculated area to acres
   - Compare to reported acres
   - Flag significant discrepancies (>5%)
5. **Generate Report**: Document findings
   - List any geometry issues found
   - Provide perimeter statistics
   - Include acreage comparison

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| sectors | array | No | Optional pre-loaded sector data (uses fixtures if not provided) |
| tolerance | number | No | Acreage discrepancy tolerance percentage (default: 5.0) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The validated fire identifier |
| fire_name | string | Display name of the fire |
| total_perimeter_km | number | Combined perimeter length in kilometers |
| reported_acres | number | Official reported acreage |
| calculated_acres | number | Acreage computed from geometry |
| acreage_discrepancy_pct | number | Percentage difference |
| sector_boundaries | array | Per-sector boundary statistics |
| geometry_issues | array | List of detected geometry problems |
| validation_status | string | VALID, WARNING, or INVALID |
| reasoning_chain | array | Step-by-step validation decisions |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, load sector geometries for the specified fire
2. Then, validate each polygon for closure and coordinate validity
3. Next, calculate perimeter length and area for each sector
4. Then, compare calculated total to reported acreage
5. Finally, generate validation report with any issues found

## Resources
- `resources/geometry-standards.json` - Validation thresholds and standards

## Scripts
- `scripts/validate_boundary.py` - Python implementation of boundary validation
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022"}`
  - Returns: Boundary validation report with statistics

## Examples

### Example 1: Basic Boundary Validation
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
  "total_perimeter_km": 245.6,
  "reported_acres": 127341,
  "calculated_acres": 126850,
  "acreage_discrepancy_pct": 0.4,
  "sector_boundaries": [
    {
      "id": "CORE-1",
      "name": "Central Fire Origin",
      "perimeter_km": 42.3,
      "calculated_acres": 27100,
      "reported_acres": 27001,
      "is_valid": true
    }
  ],
  "geometry_issues": [],
  "validation_status": "VALID",
  "reasoning_chain": [
    "Loaded 8 sector geometries for Cedar Creek Fire",
    "All 8 polygons pass closure validation",
    "Total calculated area: 126,850 acres",
    "Discrepancy from reported (127,341 ac): 0.4% - within tolerance"
  ]
}
```

## References
- NIFC Perimeter Standards: https://data-nifc.opendata.arcgis.com/
- GeoJSON Specification: RFC 7946
- USFS Fire Perimeter Guidelines

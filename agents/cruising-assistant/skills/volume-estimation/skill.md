# Volume Estimation

## Description
Calculates timber volume using Pacific Northwest (PNW) volume equations. Supports multiple
log rules (Scribner, Doyle, International 1/4") and applies defect deductions. Expands
plot-level volumes to per-acre estimates and aggregates by species for salvage planning.

## Triggers
When should the agent invoke this skill?
- User asks about timber volume or board feet
- Query mentions "volume estimation" or "MBF"
- Request for per-acre volume calculations
- Questions about log rules or volume equations
- Plot data analysis requests
- Salvage volume assessment

## Instructions
Step-by-step reasoning for the agent:
1. **Load Tree Data**: Parse individual tree measurements (species, DBH, height)
   - Support FSVeg species codes (PSME, TSHE, THPL, etc.)
   - Validate DBH and height ranges for realism
2. **Calculate Individual Tree Volume**: Apply PNW volume equations
   - Use species-specific equation parameters
   - Support Scribner, Doyle, and International log rules
   - Return gross volume before defect deduction
3. **Apply Defect Deductions**: Reduce gross volume by defect percentage
   - Fire damage, rot, sweep, crook
   - Typical salvage defect: 15-40%
4. **Expand to Per-Acre**: Convert plot volume to per-acre basis
   - Variable radius: Use BAF and tree count
   - Fixed radius: Use plot area
5. **Aggregate by Species**: Sum volumes and categorize
   - Commercial species (Douglas-fir, hemlock)
   - Secondary species (true firs, pine)
   - Low-value species (lodgepole)

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| fire_id | string | Yes | Unique fire identifier (e.g., "cedar-creek-2022") |
| plot_id | string | No | Specific plot to analyze |
| trees | array | No | Tree measurement data (species, DBH, height, defect) |
| baf | number | No | Basal area factor for variable radius plots (default: 20) |
| log_rule | string | No | Volume log rule: "scribner", "doyle", "international" (default: "scribner") |
| include_defect | boolean | No | Whether to apply defect deductions (default: true) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| fire_id | string | The analyzed fire identifier |
| plot_id | string | Plot identifier (if provided) |
| total_volume_mbf | number | Total net volume in thousand board feet (MBF) |
| volume_per_acre_mbf | number | Expanded per-acre volume in MBF |
| trees_analyzed | number | Count of trees in analysis |
| species_breakdown | object | Volume by species with percentages |
| log_rule | string | Log rule used for calculations |
| reasoning_chain | array | Step-by-step volume calculations |
| confidence | number | Calculation confidence (0-1) |
| data_sources | array | Sources used (PNW equations, log rules) |
| recommendations | array | Volume utilization guidance |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, load tree measurement data from plot or fixture
2. Then, calculate gross volume for each tree using PNW equations
3. Next, apply defect deductions based on fire damage and quality
4. Then, expand plot totals to per-acre estimates using BAF or plot area
5. Finally, aggregate by species and generate salvage recommendations

## Resources
- `resources/volume-tables.json` - PNW volume equation coefficients by species
- `resources/species-factors.json` - FSVeg species codes and bark ratios
- `resources/log-rules.json` - Scribner, Doyle, International conversion factors

## Scripts
- `scripts/estimate_volume.py` - Python implementation of volume estimation
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"fire_id": "cedar-creek-2022", "plot_id": "47-ALPHA"}`
  - Returns: Complete volume analysis with species breakdown

## Examples

### Example 1: Single Plot Volume Estimation
**Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "plot_id": "47-ALPHA",
  "baf": 20,
  "log_rule": "scribner"
}
```

**Output:**
```json
{
  "fire_id": "cedar-creek-2022",
  "plot_id": "47-ALPHA",
  "total_volume_mbf": 32.4,
  "volume_per_acre_mbf": 32.4,
  "trees_analyzed": 6,
  "species_breakdown": {
    "PSME": {
      "volume_mbf": 26.8,
      "percentage": 82.7,
      "tree_count": 4,
      "avg_dbh": 28.0
    },
    "TSHE": {
      "volume_mbf": 2.9,
      "percentage": 9.0,
      "tree_count": 1,
      "avg_dbh": 18.4
    },
    "THPL": {
      "volume_mbf": 2.7,
      "percentage": 8.3,
      "tree_count": 1,
      "avg_dbh": 22.3
    }
  },
  "log_rule": "scribner",
  "reasoning_chain": [
    "Loaded 6 trees from plot 47-ALPHA",
    "Tree #1 PSME 28.5\" DBH × 145' height = 1.82 MBF gross, 1.55 MBF net (15% defect)",
    "Tree #2 PSME 24.2\" DBH × 132' height = 1.24 MBF gross, 0.93 MBF net (25% defect)",
    "Tree #3 PSME 32.1\" DBH × 158' height = 2.45 MBF gross, 2.20 MBF net (10% defect)",
    "Tree #4 TSHE 18.4\" DBH × 98' height = 0.67 MBF gross, 0.44 MBF net (35% defect)",
    "Tree #5 PSME 26.8\" DBH × 140' height = 1.58 MBF gross, 1.26 MBF net (20% defect)",
    "Tree #6 THPL 22.3\" DBH × 112' height = 1.12 MBF gross, 0.95 MBF net (15% defect)",
    "Plot total: 32.4 MBF, BAF 20 expansion = 32.4 MBF/acre",
    "Douglas-fir dominates (82.7%) with high salvage value"
  ],
  "confidence": 0.94,
  "data_sources": ["PNW-GTR volume equations", "Scribner log rule"],
  "recommendations": [
    "High-value Douglas-fir salvage potential: 26.8 MBF/acre",
    "Monitor defect progression in western hemlock (high defect)",
    "Prioritize this plot for immediate salvage operations"
  ]
}
```

### Example 2: Custom Tree List
**Input:**
```json
{
  "fire_id": "test-fire",
  "trees": [
    {"species": "PSME", "dbh": 30.0, "height": 150, "defect_pct": 12},
    {"species": "PSME", "dbh": 28.0, "height": 145, "defect_pct": 18},
    {"species": "PIPO", "dbh": 26.0, "height": 120, "defect_pct": 15}
  ],
  "baf": 20,
  "log_rule": "international"
}
```

**Output:**
```json
{
  "fire_id": "test-fire",
  "total_volume_mbf": 15.8,
  "volume_per_acre_mbf": 15.8,
  "trees_analyzed": 3,
  "species_breakdown": {
    "PSME": {
      "volume_mbf": 11.6,
      "percentage": 73.4,
      "tree_count": 2
    },
    "PIPO": {
      "volume_mbf": 4.2,
      "percentage": 26.6,
      "tree_count": 1
    }
  },
  "log_rule": "international",
  "reasoning_chain": [
    "Analyzing 3 custom trees",
    "Tree PSME 30.0\" × 150' = 2.12 MBF gross, 1.87 MBF net (12% defect)",
    "Tree PSME 28.0\" × 145' = 1.82 MBF gross, 1.49 MBF net (18% defect)",
    "Tree PIPO 26.0\" × 120' = 1.65 MBF gross, 1.40 MBF net (15% defect)",
    "Total net volume: 15.8 MBF"
  ],
  "confidence": 0.88,
  "data_sources": ["User-provided tree data", "International 1/4\" log rule"]
}
```

## References
- Brackett, M. (1973) "Notes on Tarif Tree Volume Computation"
- PNW-GTR-019: "Volume Equations for Commercial Species"
- Scribner Decimal C Log Rule
- International 1/4-inch Log Rule
- Cedar Creek Timber Plots: `data/fixtures/cedar-creek/timber-plots.json`

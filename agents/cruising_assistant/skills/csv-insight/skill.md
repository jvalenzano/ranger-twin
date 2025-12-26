# CSV Insight

## Description
Analyzes timber inventory CSV files to provide statistical summaries, species breakdowns, volume aggregations, and data quality assessments. Designed for cruise data, plot summaries, and timber sale tabulations. Supports FSVeg-standard column names and custom field mappings.

## Triggers
When should the agent invoke this skill?
- User uploads or references a CSV file for analysis
- Query requests summary statistics from tabular data
- Need to aggregate timber data by species, plot, or unit
- Request for data quality assessment or validation
- User asks to "analyze", "summarize", or "review" cruise data
- Cross-tabulation or pivot analysis of inventory data

## Instructions
Step-by-step reasoning for the agent:
1. **Load CSV Data**: Parse the CSV file with automatic delimiter detection
   - Support comma, tab, and pipe delimiters
   - Handle header row detection
   - Parse numeric columns appropriately
2. **Identify Column Types**: Classify columns by content
   - Numeric columns (DBH, height, volume, defect)
   - Categorical columns (species, plot_id, grade)
   - Date columns (cruise_date, fire_date)
3. **Generate Summary Statistics**: Calculate descriptive stats
   - Count, mean, median, std, min, max for numeric columns
   - Value counts and percentages for categorical columns
   - Missing value detection and reporting
4. **Timber-Specific Analysis**: Apply forestry domain knowledge
   - Species distribution and dominance
   - Volume summaries by species, plot, or unit
   - Defect percentages and quality distribution
   - DBH class distributions
5. **Quality Assessment**: Validate data integrity
   - Out-of-range values (DBH < 5" or > 60")
   - Missing required fields
   - Duplicate records
   - Logical inconsistencies

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| file_path | string | Yes | Path to CSV file |
| analysis_type | string | No | Analysis type: "summary", "species", "volume", "quality" (default: "summary") |
| group_by | string | No | Column to group by for aggregation (e.g., "species", "plot_id") |
| columns | array | No | Specific columns to analyze (default: all) |
| filters | object | No | Filter conditions (e.g., {"species": "PSME", "dbh_min": 12}) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| success | boolean | Whether analysis succeeded |
| file_name | string | Name of the analyzed CSV file |
| row_count | integer | Total rows in the dataset |
| column_count | integer | Total columns in the dataset |
| columns | array | List of column names with types |
| summary | object | Statistical summary by column |
| species_breakdown | object | Species distribution (if species column exists) |
| volume_summary | object | Volume aggregations (if volume columns exist) |
| quality_issues | array | Data quality problems detected |
| insights | array | Key findings and observations |
| error | string | Error message if analysis failed |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, load and validate the CSV file structure
2. Then, identify column types and timber-relevant fields
3. Next, calculate summary statistics for numeric columns
4. Then, generate categorical breakdowns (species, grades)
5. Finally, assess data quality and provide insights

## Resources
- `resources/column-mappings.json` - Standard FSVeg column name mappings
- `resources/valid-ranges.json` - Valid value ranges for timber measurements

## Scripts
- `scripts/analyze_csv.py` - Python implementation of CSV analysis
  - Functions:
    - `load_csv(file_path: str) -> dict` - Load and parse CSV
    - `summarize_numeric(df, columns) -> dict` - Numeric statistics
    - `summarize_categorical(df, columns) -> dict` - Categorical counts
    - `analyze_species(df) -> dict` - Species-specific analysis
    - `check_quality(df) -> list` - Data quality checks
    - `execute(inputs: dict) -> dict` - Main entry point

## Examples

### Example 1: Basic Summary
**Input:**
```json
{
  "file_path": "cruise-data.csv",
  "analysis_type": "summary"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "cruise-data.csv",
  "row_count": 156,
  "column_count": 12,
  "columns": [
    {"name": "plot_id", "type": "string", "unique": 24},
    {"name": "tree_num", "type": "integer", "unique": 156},
    {"name": "species", "type": "string", "unique": 6},
    {"name": "dbh", "type": "float", "min": 8.2, "max": 42.5, "mean": 22.4},
    {"name": "height", "type": "float", "min": 45, "max": 165, "mean": 112.3},
    {"name": "volume_bf", "type": "float", "min": 120, "max": 2450, "mean": 892}
  ],
  "summary": {
    "dbh": {"count": 156, "mean": 22.4, "std": 7.8, "min": 8.2, "max": 42.5, "median": 21.2},
    "height": {"count": 156, "mean": 112.3, "std": 28.4, "min": 45, "max": 165, "median": 115},
    "volume_bf": {"count": 156, "mean": 892, "std": 456, "min": 120, "max": 2450, "median": 780}
  },
  "species_breakdown": {
    "PSME": {"count": 78, "percentage": 50.0, "avg_dbh": 24.5, "total_volume": 82400},
    "TSHE": {"count": 34, "percentage": 21.8, "avg_dbh": 18.2, "total_volume": 24800},
    "THPL": {"count": 22, "percentage": 14.1, "avg_dbh": 26.8, "total_volume": 28600},
    "ABGR": {"count": 12, "percentage": 7.7, "avg_dbh": 16.4, "total_volume": 8200},
    "PICO": {"count": 10, "percentage": 6.4, "avg_dbh": 12.1, "total_volume": 4100}
  },
  "quality_issues": [],
  "insights": [
    "156 trees measured across 24 plots",
    "Douglas-fir (PSME) dominates at 50% of stems and 56% of volume",
    "Average DBH of 22.4 inches indicates mature second-growth stand",
    "No data quality issues detected"
  ],
  "error": null
}
```

### Example 2: Species-Grouped Analysis
**Input:**
```json
{
  "file_path": "plot-summary.csv",
  "analysis_type": "volume",
  "group_by": "species"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "plot-summary.csv",
  "row_count": 6,
  "volume_summary": {
    "by_species": {
      "PSME": {"mbf": 45.2, "percentage": 52.4, "plots": 18},
      "TSHE": {"mbf": 18.6, "percentage": 21.6, "plots": 12},
      "THPL": {"mbf": 14.8, "percentage": 17.2, "plots": 8},
      "ABGR": {"mbf": 7.6, "percentage": 8.8, "plots": 6}
    },
    "total_mbf": 86.2,
    "mbf_per_acre": 28.7
  },
  "insights": [
    "Total merchantable volume: 86.2 MBF across 3.0 acres",
    "Douglas-fir provides highest per-acre yield at 15.1 MBF/acre",
    "Western redcedar volume concentrated in riparian plots"
  ],
  "error": null
}
```

### Example 3: Data Quality Check
**Input:**
```json
{
  "file_path": "raw-cruise.csv",
  "analysis_type": "quality"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "raw-cruise.csv",
  "row_count": 203,
  "quality_issues": [
    {"type": "out_of_range", "column": "dbh", "row": 45, "value": 72.5, "message": "DBH exceeds maximum (60\")"},
    {"type": "missing", "column": "height", "rows": [12, 67, 89], "message": "3 trees missing height measurements"},
    {"type": "invalid", "column": "species", "row": 102, "value": "XXXX", "message": "Unknown species code"}
  ],
  "quality_score": 0.92,
  "insights": [
    "3 data quality issues found affecting 4 records (2.0%)",
    "1 DBH value appears to be measurement error (72.5\")",
    "3 trees missing height - consider field verification",
    "Unknown species code 'XXXX' on row 102 needs correction"
  ],
  "error": null
}
```

## References
- FSVeg Common Stand Exam User Guide
- USFS Region 6 Cruise Compilation Standards
- Timber Cruising Handbook (FSH 2409.12)

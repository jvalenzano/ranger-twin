"""
CSV Insight Script for Cruising Assistant

Analyzes timber inventory CSV files with statistical summaries,
species breakdowns, volume aggregations, and data quality checks.

Requires:
    pip install pandas
"""

import csv
import re
from pathlib import Path
from typing import Any


def _detect_delimiter(file_path: str, sample_size: int = 5) -> str:
    """Detect CSV delimiter by analyzing first few lines."""
    with open(file_path, 'r', encoding='utf-8') as f:
        sample = f.read(4096)

    # Count potential delimiters
    delimiters = {',': 0, '\t': 0, '|': 0, ';': 0}
    for delim in delimiters:
        delimiters[delim] = sample.count(delim)

    # Return most common delimiter
    return max(delimiters, key=delimiters.get)


def _infer_column_type(values: list) -> str:
    """Infer column data type from sample values."""
    non_null = [v for v in values if v is not None and str(v).strip() != '']
    if not non_null:
        return 'empty'

    # Try numeric
    numeric_count = 0
    for v in non_null[:100]:  # Sample first 100
        try:
            float(str(v).replace(',', ''))
            numeric_count += 1
        except (ValueError, TypeError):
            pass

    if numeric_count / len(non_null[:100]) > 0.9:
        # Check if integer or float
        try:
            if all(float(str(v).replace(',', '')).is_integer() for v in non_null[:100] if v):
                return 'integer'
        except (ValueError, TypeError):
            pass
        return 'float'

    return 'string'


def _parse_numeric(value: Any) -> float | None:
    """Parse a value as numeric, handling common formats."""
    if value is None:
        return None
    try:
        return float(str(value).replace(',', '').strip())
    except (ValueError, TypeError):
        return None


def load_csv(file_path: str) -> dict[str, Any]:
    """
    Load and parse a CSV file.

    Args:
        file_path: Path to CSV file

    Returns:
        Dictionary with parsed data and metadata
    """
    path = Path(file_path)
    if not path.exists():
        return {
            "success": False,
            "error": f"File not found: {file_path}",
            "rows": [],
            "columns": [],
        }

    try:
        delimiter = _detect_delimiter(file_path)

        with open(file_path, 'r', encoding='utf-8') as f:
            # Use csv.DictReader for easier handling
            reader = csv.DictReader(f, delimiter=delimiter)
            rows = list(reader)
            columns = reader.fieldnames or []

        return {
            "success": True,
            "file_name": path.name,
            "rows": rows,
            "columns": columns,
            "row_count": len(rows),
            "column_count": len(columns),
            "delimiter": delimiter,
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to parse CSV: {str(e)}",
            "rows": [],
            "columns": [],
        }


def summarize_numeric(rows: list[dict], column: str) -> dict[str, Any]:
    """Calculate summary statistics for a numeric column."""
    values = [_parse_numeric(row.get(column)) for row in rows]
    values = [v for v in values if v is not None]

    if not values:
        return {"count": 0, "missing": len(rows)}

    sorted_vals = sorted(values)
    n = len(values)

    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / n if n > 1 else 0
    std = variance ** 0.5

    # Median
    if n % 2 == 0:
        median = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
    else:
        median = sorted_vals[n // 2]

    return {
        "count": n,
        "missing": len(rows) - n,
        "mean": round(mean, 2),
        "std": round(std, 2),
        "min": round(min(values), 2),
        "max": round(max(values), 2),
        "median": round(median, 2),
        "sum": round(sum(values), 2),
    }


def summarize_categorical(rows: list[dict], column: str, top_n: int = 10) -> dict[str, Any]:
    """Calculate value counts for a categorical column."""
    values = [str(row.get(column, '')).strip() for row in rows]
    values = [v for v in values if v]

    if not values:
        return {"count": 0, "unique": 0, "top_values": {}}

    # Count occurrences
    counts = {}
    for v in values:
        counts[v] = counts.get(v, 0) + 1

    # Sort by count descending
    sorted_counts = sorted(counts.items(), key=lambda x: -x[1])

    top_values = {}
    total = len(values)
    for val, count in sorted_counts[:top_n]:
        top_values[val] = {
            "count": count,
            "percentage": round(100 * count / total, 1),
        }

    return {
        "count": len(values),
        "missing": len(rows) - len(values),
        "unique": len(counts),
        "top_values": top_values,
    }


def analyze_species(rows: list[dict], species_col: str = None) -> dict[str, Any]:
    """Analyze species distribution with timber-specific metrics."""
    # Find species column
    if not species_col:
        for col in ['species', 'SPECIES', 'Species', 'spp', 'SPP', 'sp_code']:
            if any(col in row for row in rows[:1]):
                species_col = col
                break

    if not species_col:
        return {"error": "No species column found"}

    # Find related columns
    dbh_col = None
    vol_col = None
    for col in rows[0].keys() if rows else []:
        col_lower = col.lower()
        if 'dbh' in col_lower or 'diameter' in col_lower:
            dbh_col = col
        if 'vol' in col_lower or 'mbf' in col_lower or 'bf' in col_lower:
            vol_col = col

    # Aggregate by species
    species_data = {}
    for row in rows:
        sp = str(row.get(species_col, '')).strip().upper()
        if not sp:
            continue

        if sp not in species_data:
            species_data[sp] = {
                "count": 0,
                "dbh_values": [],
                "volume_sum": 0,
            }

        species_data[sp]["count"] += 1

        if dbh_col:
            dbh = _parse_numeric(row.get(dbh_col))
            if dbh is not None:
                species_data[sp]["dbh_values"].append(dbh)

        if vol_col:
            vol = _parse_numeric(row.get(vol_col))
            if vol is not None:
                species_data[sp]["volume_sum"] += vol

    # Calculate percentages and averages
    total_count = sum(d["count"] for d in species_data.values())
    total_volume = sum(d["volume_sum"] for d in species_data.values())

    result = {}
    for sp, data in sorted(species_data.items(), key=lambda x: -x[1]["count"]):
        result[sp] = {
            "count": data["count"],
            "percentage": round(100 * data["count"] / total_count, 1) if total_count else 0,
        }
        if data["dbh_values"]:
            result[sp]["avg_dbh"] = round(sum(data["dbh_values"]) / len(data["dbh_values"]), 1)
        if data["volume_sum"] > 0:
            result[sp]["total_volume"] = round(data["volume_sum"], 1)
            result[sp]["volume_pct"] = round(100 * data["volume_sum"] / total_volume, 1) if total_volume else 0

    return {
        "species_column": species_col,
        "species_count": len(result),
        "total_trees": total_count,
        "total_volume": round(total_volume, 1) if total_volume else None,
        "by_species": result,
    }


def check_quality(rows: list[dict]) -> list[dict]:
    """Check data quality and identify issues."""
    issues = []

    if not rows:
        return [{"type": "empty", "message": "No data rows found"}]

    # Get column info
    columns = list(rows[0].keys())

    # Check each column
    for col in columns:
        col_lower = col.lower()
        values = [row.get(col) for row in rows]

        # Check for missing values
        missing_rows = [i + 2 for i, v in enumerate(values) if v is None or str(v).strip() == '']
        if missing_rows and len(missing_rows) < len(rows) * 0.5:  # Report if not all missing
            issues.append({
                "type": "missing",
                "column": col,
                "rows": missing_rows[:10],  # First 10 rows
                "count": len(missing_rows),
                "message": f"{len(missing_rows)} missing values in '{col}'",
            })

        # DBH range check
        if 'dbh' in col_lower or 'diameter' in col_lower:
            for i, v in enumerate(values):
                num = _parse_numeric(v)
                if num is not None:
                    if num < 1:
                        issues.append({
                            "type": "out_of_range",
                            "column": col,
                            "row": i + 2,
                            "value": num,
                            "message": f"DBH too small ({num}\")",
                        })
                    elif num > 80:
                        issues.append({
                            "type": "out_of_range",
                            "column": col,
                            "row": i + 2,
                            "value": num,
                            "message": f"DBH exceeds typical maximum ({num}\")",
                        })

        # Height range check
        if 'height' in col_lower or 'ht' in col_lower:
            for i, v in enumerate(values):
                num = _parse_numeric(v)
                if num is not None:
                    if num < 10:
                        issues.append({
                            "type": "out_of_range",
                            "column": col,
                            "row": i + 2,
                            "value": num,
                            "message": f"Height too small ({num}')",
                        })
                    elif num > 400:
                        issues.append({
                            "type": "out_of_range",
                            "column": col,
                            "row": i + 2,
                            "value": num,
                            "message": f"Height exceeds typical maximum ({num}')",
                        })

        # Species code validation
        if 'species' in col_lower or col_lower == 'spp':
            valid_species = {
                'PSME', 'TSHE', 'THPL', 'ABGR', 'ABAM', 'PICO', 'PIPO',
                'PILA', 'PIMO', 'CANO', 'ALRU', 'ACMA', 'QUGA', 'POTR',
            }
            for i, v in enumerate(values):
                sp = str(v).strip().upper() if v else ''
                if sp and len(sp) == 4 and sp not in valid_species:
                    issues.append({
                        "type": "invalid",
                        "column": col,
                        "row": i + 2,
                        "value": sp,
                        "message": f"Unknown species code '{sp}'",
                    })

    return issues[:50]  # Limit to first 50 issues


def generate_insights(rows: list, summary: dict, species: dict, issues: list) -> list[str]:
    """Generate human-readable insights from the analysis."""
    insights = []

    if not rows:
        return ["No data available for analysis"]

    # Basic count
    insights.append(f"{len(rows)} records analyzed")

    # Species insights
    if species and "by_species" in species:
        sp_data = species["by_species"]
        if sp_data:
            dominant = list(sp_data.keys())[0]
            dom_pct = sp_data[dominant].get("percentage", 0)

            # Species code to name mapping
            names = {
                "PSME": "Douglas-fir", "TSHE": "Western hemlock", "THPL": "Western redcedar",
                "ABGR": "Grand fir", "PICO": "Lodgepole pine", "PIPO": "Ponderosa pine",
            }
            dom_name = names.get(dominant, dominant)
            insights.append(f"{dom_name} ({dominant}) dominates at {dom_pct}% of stems")

            if species.get("total_volume"):
                insights.append(f"Total volume: {species['total_volume']:,.0f} board feet")

    # DBH insights
    for col, stats in summary.items():
        if 'dbh' in col.lower() and isinstance(stats, dict):
            mean_dbh = stats.get("mean", 0)
            if mean_dbh > 24:
                insights.append(f"Average DBH of {mean_dbh}\" indicates mature timber")
            elif mean_dbh < 12:
                insights.append(f"Average DBH of {mean_dbh}\" indicates young/pole timber")
            else:
                insights.append(f"Average DBH of {mean_dbh}\" indicates mid-rotation stand")

    # Quality insights
    if issues:
        insights.append(f"{len(issues)} data quality issues detected")
    else:
        insights.append("No data quality issues detected")

    return insights


def execute(inputs: dict) -> dict[str, Any]:
    """
    Main entry point for CSV analysis.

    Args:
        inputs: Dictionary containing:
            - file_path (str): Path to CSV file
            - analysis_type (str): "summary", "species", "volume", "quality"
            - group_by (str): Column to group by
            - columns (list): Specific columns to analyze
            - filters (dict): Filter conditions

    Returns:
        Dictionary with analysis results
    """
    file_path = inputs.get("file_path", "")
    analysis_type = inputs.get("analysis_type", "summary").lower()
    group_by = inputs.get("group_by")
    columns = inputs.get("columns")
    filters = inputs.get("filters", {})

    if not file_path:
        return {
            "success": False,
            "error": "No file_path provided",
        }

    # Resolve relative paths
    path = Path(file_path)
    if not path.is_absolute():
        # Try relative to skill data directory
        skill_dir = Path(__file__).parent.parent
        agent_dir = skill_dir.parent.parent
        data_paths = [
            skill_dir / "data" / file_path,
            agent_dir / "data" / file_path,
            path,
        ]
        for p in data_paths:
            if p.exists():
                file_path = str(p)
                break

    # Load CSV
    loaded = load_csv(file_path)
    if not loaded.get("success"):
        return loaded

    rows = loaded["rows"]
    all_columns = loaded["columns"]

    # Apply filters
    if filters:
        filtered_rows = []
        for row in rows:
            match = True
            for key, val in filters.items():
                if key.endswith("_min"):
                    col = key[:-4]
                    num = _parse_numeric(row.get(col))
                    if num is None or num < val:
                        match = False
                elif key.endswith("_max"):
                    col = key[:-4]
                    num = _parse_numeric(row.get(col))
                    if num is None or num > val:
                        match = False
                else:
                    if str(row.get(key, "")).upper() != str(val).upper():
                        match = False
            if match:
                filtered_rows.append(row)
        rows = filtered_rows

    # Determine columns to analyze
    if columns:
        analyze_cols = [c for c in columns if c in all_columns]
    else:
        analyze_cols = all_columns

    # Build response
    result = {
        "success": True,
        "file_name": loaded["file_name"],
        "row_count": len(rows),
        "column_count": len(all_columns),
    }

    # Column metadata
    col_info = []
    for col in all_columns:
        values = [row.get(col) for row in rows]
        col_type = _infer_column_type(values)
        info = {"name": col, "type": col_type}

        if col_type in ("integer", "float"):
            nums = [_parse_numeric(v) for v in values]
            nums = [n for n in nums if n is not None]
            if nums:
                info["min"] = round(min(nums), 2)
                info["max"] = round(max(nums), 2)
                info["mean"] = round(sum(nums) / len(nums), 2)
        else:
            unique = len(set(str(v) for v in values if v))
            info["unique"] = unique

        col_info.append(info)

    result["columns"] = col_info

    # Numeric summaries
    summary = {}
    for col in analyze_cols:
        col_type = _infer_column_type([row.get(col) for row in rows])
        if col_type in ("integer", "float"):
            summary[col] = summarize_numeric(rows, col)
    result["summary"] = summary

    # Species analysis
    species_analysis = analyze_species(rows)
    if "by_species" in species_analysis:
        result["species_breakdown"] = species_analysis

    # Quality check
    quality_issues = check_quality(rows)
    result["quality_issues"] = quality_issues

    quality_score = 1.0 - (len(quality_issues) / max(len(rows), 1))
    result["quality_score"] = round(max(0, quality_score), 2)

    # Generate insights
    result["insights"] = generate_insights(rows, summary, species_analysis, quality_issues)

    result["error"] = None
    return result


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        result = execute({"file_path": test_file})
        print(f"Success: {result.get('success')}")
        print(f"Rows: {result.get('row_count')}")
        print(f"Columns: {result.get('column_count')}")
        if result.get("insights"):
            print("\nInsights:")
            for insight in result["insights"]:
                print(f"  - {insight}")
        if result.get("error"):
            print(f"Error: {result.get('error')}")
    else:
        print("Usage: python analyze_csv.py <path_to_csv>")

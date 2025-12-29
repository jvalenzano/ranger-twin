#!/usr/bin/env python3
"""
Test script for MCP Fixtures Server
Validates MCP tool invocations return properly formatted data
"""

import json
import sys
from pathlib import Path

# Add project root to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def load_local_fixture(filepath):
    """Load and validate a local fixture file"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        return {"status": "success", "data": data}
    except FileNotFoundError:
        return {"status": "error", "error": f"File not found: {filepath}"}
    except json.JSONDecodeError as e:
        return {"status": "error", "error": f"Invalid JSON: {e}"}


def validate_metadata(data, fixture_name):
    """Validate metadata fields according to ADR-005"""
    results = {
        "fixture": fixture_name,
        "has_metadata_block": False,
        "has_source": False,
        "has_timestamp": False,
        "has_confidence_tier": False,
        "status": "FAIL"
    }

    if "metadata" in data:
        results["has_metadata_block"] = True
        meta = data["metadata"]
        results["has_source"] = "source" in meta
        results["has_timestamp"] = "retrieved_at" in meta
        results["has_confidence_tier"] = "confidence_tier" in meta

        if results["has_source"] and results["has_timestamp"] and results["has_confidence_tier"]:
            results["status"] = "PASS"

    return results


def validate_schema(data, fixture_type):
    """Validate fixture schema based on type"""
    errors = []

    if fixture_type == "incident":
        required_fields = ["fire_id", "name", "discovery_date", "acres", "forest", "coordinates"]
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")

    elif fixture_type == "burn_severity":
        required_fields = ["fire_id", "fire_name", "total_acres", "sectors", "summary"]
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")

        if "sectors" in data:
            for idx, sector in enumerate(data["sectors"]):
                required_sector_fields = ["id", "name", "severity", "acres", "dnbr_mean"]
                for field in required_sector_fields:
                    if field not in sector:
                        errors.append(f"Sector {idx} missing field: {field}")

    elif fixture_type == "trail":
        required_fields = ["fire_id", "assessment_date", "trails", "summary"]
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")

        if "trails" in data:
            for idx, trail in enumerate(data["trails"]):
                required_trail_fields = ["trail_id", "trail_name", "damage_points", "total_estimated_cost"]
                for field in required_trail_fields:
                    if field not in trail:
                        errors.append(f"Trail {idx} missing field: {field}")

    elif fixture_type == "timber":
        required_fields = ["fire_id", "cruise_id", "plots", "summary"]
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")

        if "plots" in data:
            for idx, plot in enumerate(data["plots"]):
                required_plot_fields = ["plot_id", "sector", "coords", "trees", "plot_summary"]
                for field in required_plot_fields:
                    if field not in plot:
                        errors.append(f"Plot {idx} missing field: {field}")

    return {
        "status": "PASS" if not errors else "FAIL",
        "errors": errors
    }


def main():
    fixtures_base = project_root / "data" / "fixtures"

    # Test files in both locations
    test_cases = [
        {
            "name": "Incidents - cedar-creek.json",
            "path": fixtures_base / "incidents" / "cedar-creek.json",
            "type": "incident"
        },
        {
            "name": "Burn Severity - cedar-creek-sectors.json",
            "path": fixtures_base / "burn-severity" / "cedar-creek-sectors.json",
            "type": "burn_severity"
        },
        {
            "name": "Trails - cedar-creek-trails.json",
            "path": fixtures_base / "trails" / "cedar-creek-trails.json",
            "type": "trail"
        },
        {
            "name": "Timber - cedar-creek-salvage.json",
            "path": fixtures_base / "timber" / "cedar-creek-salvage.json",
            "type": "timber"
        },
        {
            "name": "Cedar Creek - incident-metadata.json",
            "path": fixtures_base / "cedar-creek" / "incident-metadata.json",
            "type": "incident"
        },
        {
            "name": "Cedar Creek - burn-severity.json",
            "path": fixtures_base / "cedar-creek" / "burn-severity.json",
            "type": "burn_severity"
        },
        {
            "name": "Cedar Creek - trail-damage.json",
            "path": fixtures_base / "cedar-creek" / "trail-damage.json",
            "type": "trail"
        },
        {
            "name": "Cedar Creek - timber-plots.json",
            "path": fixtures_base / "cedar-creek" / "timber-plots.json",
            "type": "timber"
        }
    ]

    print("=" * 80)
    print("MCP FIXTURES VALIDATION REPORT")
    print("=" * 80)
    print()

    results = []

    for test_case in test_cases:
        print(f"Testing: {test_case['name']}")
        print("-" * 80)

        # Load fixture
        load_result = load_local_fixture(test_case["path"])

        if load_result["status"] == "error":
            print(f"  ERROR: {load_result['error']}")
            results.append({
                "name": test_case["name"],
                "status": "ERROR",
                "details": load_result["error"]
            })
            print()
            continue

        data = load_result["data"]

        # Validate JSON structure
        print(f"  Valid JSON: YES")

        # Validate metadata
        metadata_result = validate_metadata(data, test_case["name"])
        print(f"  Metadata Block: {metadata_result['has_metadata_block']}")
        print(f"  Source Field: {metadata_result['has_source']}")
        print(f"  Timestamp Field: {metadata_result['has_timestamp']}")
        print(f"  Confidence Tier: {metadata_result['has_confidence_tier']}")
        print(f"  Metadata Status: {metadata_result['status']}")

        # Validate schema
        schema_result = validate_schema(data, test_case["type"])
        print(f"  Schema Status: {schema_result['status']}")
        if schema_result["errors"]:
            for error in schema_result["errors"]:
                print(f"    - {error}")

        overall_status = "PASS" if metadata_result["status"] == "PASS" and schema_result["status"] == "PASS" else "FAIL"
        print(f"  Overall: {overall_status}")
        print()

        results.append({
            "name": test_case["name"],
            "status": overall_status,
            "metadata": metadata_result["status"],
            "schema": schema_result["status"]
        })

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    errors = sum(1 for r in results if r["status"] == "ERROR")

    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Errors: {errors}")
    print()

    if failed > 0 or errors > 0:
        print("FAILED TESTS:")
        for r in results:
            if r["status"] != "PASS":
                print(f"  - {r['name']}: {r['status']}")
                if "details" in r:
                    print(f"    {r['details']}")

    return 0 if (failed == 0 and errors == 0) else 1


if __name__ == "__main__":
    sys.exit(main())

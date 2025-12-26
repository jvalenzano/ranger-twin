"""
Boundary Mapping Validation Script

Validates fire perimeter geometry, calculates boundary statistics,
and compares reported versus calculated acreage.
"""

import json
import math
from pathlib import Path
from typing import Literal, TypedDict


ValidationStatus = Literal["VALID", "WARNING", "INVALID"]


class SectorBoundary(TypedDict, total=False):
    """Boundary statistics for a single sector."""
    id: str
    name: str
    perimeter_km: float
    calculated_acres: float
    reported_acres: float
    is_valid: bool
    issues: list[str]


class GeometryIssue(TypedDict):
    """A detected geometry problem."""
    sector_id: str
    issue_type: str
    description: str
    severity: str


def load_fixture_data(fire_id: str) -> dict | None:
    """
    Load burn severity data from fixtures.

    Args:
        fire_id: Fire identifier (e.g., "cedar-creek-2022")

    Returns:
        Fire data dict or None if not found
    """
    script_dir = Path(__file__).parent
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "burn-severity.json"

    if not fixture_path.exists():
        fixture_path = Path("data/fixtures/cedar-creek/burn-severity.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                return data

    return None


def calculate_polygon_perimeter(coordinates: list[list[float]]) -> float:
    """
    Calculate approximate perimeter of a polygon in kilometers.

    Uses Haversine formula for geodetic distance between points.

    Args:
        coordinates: List of [lon, lat] coordinate pairs

    Returns:
        Perimeter length in kilometers
    """
    if len(coordinates) < 3:
        return 0.0

    total_distance = 0.0
    R = 6371  # Earth's radius in km

    for i in range(len(coordinates) - 1):
        lon1, lat1 = coordinates[i]
        lon2, lat2 = coordinates[i + 1]

        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        # Haversine formula
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        total_distance += R * c

    return round(total_distance, 2)


def calculate_polygon_area_acres(coordinates: list[list[float]]) -> float:
    """
    Calculate approximate area of a polygon in acres.

    Uses the Shoelace formula with latitude correction.

    Args:
        coordinates: List of [lon, lat] coordinate pairs

    Returns:
        Area in acres
    """
    if len(coordinates) < 3:
        return 0.0

    # Calculate centroid latitude for area correction
    avg_lat = sum(coord[1] for coord in coordinates) / len(coordinates)
    lat_rad = math.radians(avg_lat)

    # Approximate degrees to meters at this latitude
    # 1 degree latitude ~ 111,320 meters
    # 1 degree longitude ~ 111,320 * cos(latitude) meters
    meters_per_deg_lat = 111320
    meters_per_deg_lon = 111320 * math.cos(lat_rad)

    # Convert coordinates to meters (relative to first point)
    x_coords = [(coord[0] - coordinates[0][0]) * meters_per_deg_lon for coord in coordinates]
    y_coords = [(coord[1] - coordinates[0][1]) * meters_per_deg_lat for coord in coordinates]

    # Shoelace formula
    n = len(coordinates)
    area = 0.0
    for i in range(n - 1):
        area += x_coords[i] * y_coords[i + 1]
        area -= x_coords[i + 1] * y_coords[i]
    area = abs(area) / 2.0

    # Convert square meters to acres (1 acre = 4046.86 m²)
    acres = area / 4046.86

    return round(acres, 1)


def validate_polygon_closure(coordinates: list[list[float]]) -> bool:
    """
    Check if polygon is properly closed (first point equals last point).

    Args:
        coordinates: List of [lon, lat] coordinate pairs

    Returns:
        True if polygon is closed
    """
    if len(coordinates) < 3:
        return False

    first = coordinates[0]
    last = coordinates[-1]

    # Allow small tolerance for floating point comparison
    tolerance = 1e-10
    return (abs(first[0] - last[0]) < tolerance and
            abs(first[1] - last[1]) < tolerance)


def validate_coordinate_range(coordinates: list[list[float]]) -> tuple[bool, str | None]:
    """
    Check if coordinates are within valid WGS84 ranges.

    Args:
        coordinates: List of [lon, lat] coordinate pairs

    Returns:
        Tuple of (is_valid, error_message)
    """
    for lon, lat in coordinates:
        if not (-180 <= lon <= 180):
            return False, f"Longitude {lon} out of range [-180, 180]"
        if not (-90 <= lat <= 90):
            return False, f"Latitude {lat} out of range [-90, 90]"

    return True, None


def execute(inputs: dict) -> dict:
    """
    Execute boundary mapping validation.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - sectors: Optional pre-loaded sector data
            - tolerance: Acreage discrepancy tolerance % (default: 5.0)

    Returns:
        Dictionary with boundary validation report including
        perimeter statistics, acreage comparison, and issues.
    """
    fire_id = inputs.get("fire_id")
    sectors_input = inputs.get("sectors")
    tolerance = inputs.get("tolerance", 5.0)

    if not fire_id:
        return {
            "error": "fire_id is required",
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Load data
    fire_data = None
    sectors = sectors_input
    sectors_provided = "sectors" in inputs and inputs["sectors"] is not None

    if not sectors_provided:
        fire_data = load_fixture_data(fire_id)
        if fire_data:
            sectors = fire_data.get("sectors", [])
        else:
            return {
                "fire_id": fire_id,
                "error": f"No data found for fire_id: {fire_id}",
                "reasoning_chain": [f"ERROR: Could not load data for {fire_id}"],
            }

    fire_name = fire_data.get("fire_name", "Unknown Fire") if fire_data else "Unknown Fire"
    reported_total = fire_data.get("total_acres", 0) if fire_data else 0

    # Handle empty sectors
    if not sectors:
        return {
            "fire_id": fire_id,
            "fire_name": fire_name,
            "total_perimeter_km": 0,
            "reported_acres": reported_total,
            "calculated_acres": 0,
            "acreage_discrepancy_pct": 0,
            "sector_boundaries": [],
            "geometry_issues": [],
            "validation_status": "INVALID",
            "reasoning_chain": [f"No sectors with geometry found for {fire_id}"],
        }

    # Process sectors
    sector_boundaries: list[SectorBoundary] = []
    geometry_issues: list[GeometryIssue] = []
    reasoning_chain: list[str] = []
    total_perimeter = 0.0
    total_calculated_acres = 0.0
    valid_count = 0
    total_with_geometry = 0

    reasoning_chain.append(f"Loaded {len(sectors)} sectors for {fire_name}")

    for sector in sectors:
        sector_id = sector.get("id", "unknown")
        sector_name = sector.get("name", sector_id)
        geometry = sector.get("geometry")
        reported_acres = sector.get("acres", 0)

        if not geometry or geometry.get("type") != "Polygon":
            geometry_issues.append({
                "sector_id": sector_id,
                "issue_type": "MISSING_GEOMETRY",
                "description": f"Sector {sector_id} has no valid polygon geometry",
                "severity": "WARNING",
            })
            continue

        total_with_geometry += 1
        coordinates = geometry.get("coordinates", [[]])[0]  # First ring (exterior)

        if len(coordinates) < 3:
            geometry_issues.append({
                "sector_id": sector_id,
                "issue_type": "INSUFFICIENT_POINTS",
                "description": f"Polygon has only {len(coordinates)} points (minimum 3 required)",
                "severity": "ERROR",
            })
            continue

        # Validate polygon
        issues: list[str] = []
        is_valid = True

        # Check closure
        if not validate_polygon_closure(coordinates):
            issues.append("Polygon not closed")
            geometry_issues.append({
                "sector_id": sector_id,
                "issue_type": "NOT_CLOSED",
                "description": "First and last coordinates do not match",
                "severity": "ERROR",
            })
            is_valid = False

        # Check coordinate ranges
        coord_valid, coord_error = validate_coordinate_range(coordinates)
        if not coord_valid:
            issues.append(coord_error)
            geometry_issues.append({
                "sector_id": sector_id,
                "issue_type": "INVALID_COORDINATES",
                "description": coord_error,
                "severity": "ERROR",
            })
            is_valid = False

        # Calculate metrics
        perimeter_km = calculate_polygon_perimeter(coordinates)
        calculated_acres = calculate_polygon_area_acres(coordinates)

        sector_boundary: SectorBoundary = {
            "id": sector_id,
            "name": sector_name,
            "perimeter_km": perimeter_km,
            "calculated_acres": calculated_acres,
            "reported_acres": reported_acres,
            "is_valid": is_valid,
        }

        if issues:
            sector_boundary["issues"] = issues

        sector_boundaries.append(sector_boundary)

        total_perimeter += perimeter_km
        total_calculated_acres += calculated_acres
        if is_valid:
            valid_count += 1

    # Add validation summary to reasoning
    if total_with_geometry > 0:
        if valid_count == total_with_geometry:
            reasoning_chain.append(f"All {total_with_geometry} polygons pass closure validation")
        else:
            reasoning_chain.append(f"{valid_count} of {total_with_geometry} polygons valid")

    reasoning_chain.append(f"Total calculated area: {total_calculated_acres:,.0f} acres")

    # Calculate discrepancy
    if reported_total > 0:
        discrepancy_pct = abs(total_calculated_acres - reported_total) / reported_total * 100
    else:
        discrepancy_pct = 0 if total_calculated_acres == 0 else 100

    discrepancy_pct = round(discrepancy_pct, 1)

    # Determine validation status
    if geometry_issues:
        error_issues = [i for i in geometry_issues if i["severity"] == "ERROR"]
        if error_issues:
            validation_status = "INVALID"
        else:
            validation_status = "WARNING"
    elif discrepancy_pct > tolerance:
        validation_status = "WARNING"
        reasoning_chain.append(
            f"Discrepancy from reported ({reported_total:,} ac): {discrepancy_pct}% - exceeds {tolerance}% tolerance"
        )
    else:
        validation_status = "VALID"
        reasoning_chain.append(
            f"Discrepancy from reported ({reported_total:,} ac): {discrepancy_pct}% - within tolerance"
        )

    # Sort sectors by perimeter (largest first)
    sector_boundaries.sort(key=lambda x: -x["perimeter_km"])

    return {
        "fire_id": fire_id,
        "fire_name": fire_name,
        "total_perimeter_km": round(total_perimeter, 1),
        "reported_acres": reported_total,
        "calculated_acres": round(total_calculated_acres, 0),
        "acreage_discrepancy_pct": discrepancy_pct,
        "sector_boundaries": sector_boundaries,
        "geometry_issues": geometry_issues,
        "validation_status": validation_status,
        "reasoning_chain": reasoning_chain,
    }


if __name__ == "__main__":
    test_input = {"fire_id": "cedar-creek-2022"}
    result = execute(test_input)
    print(json.dumps(result, indent=2))

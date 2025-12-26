"""
Trail Damage Classification Script

Implements USFS Type I-IV damage classification for trail damage points.
Analyzes damage severity, infrastructure condition, and hazard zones.
"""

import json
from pathlib import Path
from typing import Literal, TypedDict


# Damage type classifications
DAMAGE_TYPES = {
    "TYPE_I": {"label": "Minor", "severity_range": (1, 2)},
    "TYPE_II": {"label": "Moderate", "severity_range": (3, 3)},
    "TYPE_III": {"label": "Major", "severity_range": (4, 4)},
    "TYPE_IV": {"label": "Severe", "severity_range": (5, 5)},
}

DamageType = Literal["TYPE_I", "TYPE_II", "TYPE_III", "TYPE_IV"]


class DamagePoint(TypedDict, total=False):
    """Classified damage point."""
    damage_id: str
    trail_id: str
    trail_name: str
    milepost: float
    type: str
    severity: int
    damage_type: DamageType
    description: str
    estimated_cost: int | float
    work_type: str
    crew_days: int
    reasoning: str


class InfrastructureIssue(TypedDict):
    """Infrastructure-specific damage."""
    damage_id: str
    trail_id: str
    trail_name: str
    type: str
    severity: int
    estimated_cost: int | float
    concern: str


class HazardZone(TypedDict):
    """High-risk area with multiple damage points."""
    trail_id: str
    trail_name: str
    damage_count: int
    avg_severity: float
    total_cost: float
    concern: str


def classify_damage_point(damage_point: dict) -> tuple[DamageType, dict, str]:
    """
    Classify a single damage point into USFS Type I-IV.

    Args:
        damage_point: Damage point data with severity field

    Returns:
        Tuple of (damage_type, updated_damage_dict, reasoning)
    """
    severity = damage_point.get("severity", 0)
    damage_id = damage_point.get("damage_id", "unknown")
    damage_type_str = damage_point.get("type", "UNKNOWN")

    # Classify based on severity
    if severity <= 2:
        damage_type = "TYPE_I"
        label = "Minor"
    elif severity == 3:
        damage_type = "TYPE_II"
        label = "Moderate"
    elif severity == 4:
        damage_type = "TYPE_III"
        label = "Major"
    else:  # severity >= 5
        damage_type = "TYPE_IV"
        label = "Severe"

    reasoning = f"{damage_id}: Severity {severity} -> {damage_type} ({label})"

    # Add context from damage type
    if damage_type_str == "BRIDGE_FAILURE":
        reasoning += " - Bridge failure requiring replacement"
    elif damage_type_str == "DEBRIS_FLOW" and severity >= 4:
        reasoning += " - Major debris accumulation"
    elif damage_type_str == "HAZARD_TREES" and severity >= 4:
        reasoning += " - Dense hazard tree concentration"

    # Create updated damage point
    classified = damage_point.copy()
    classified["damage_type"] = damage_type
    classified["reasoning"] = reasoning

    return damage_type, classified, reasoning


def assess_infrastructure(damage_point: dict) -> dict | None:
    """
    Assess if damage point is critical infrastructure.

    Args:
        damage_point: Damage point data

    Returns:
        Infrastructure issue dict if critical, None otherwise
    """
    damage_type = damage_point.get("type", "")
    severity = damage_point.get("severity", 0)

    # Infrastructure types requiring special attention
    infrastructure_types = ["BRIDGE_FAILURE", "CULVERT_DAMAGE", "PUNCHEON_FAILURE"]

    if damage_type in infrastructure_types or (damage_type == "BRIDGE_FAILURE" and severity >= 4):
        return {
            "damage_id": damage_point.get("damage_id", "unknown"),
            "trail_id": damage_point.get("trail_id", ""),
            "trail_name": damage_point.get("trail_name", ""),
            "type": damage_type,
            "severity": severity,
            "estimated_cost": damage_point.get("estimated_cost", 0),
            "concern": damage_point.get("description", "Infrastructure damage"),
        }

    return None


def identify_hazard_zone(trail: dict) -> dict | None:
    """
    Identify if trail qualifies as a hazard zone.

    Args:
        trail: Trail data with damage_points

    Returns:
        Hazard zone dict if qualifying, None otherwise
    """
    damage_points = trail.get("damage_points", [])

    if len(damage_points) < 3:
        return None

    # Calculate average severity
    severities = [dp.get("severity", 0) for dp in damage_points]
    avg_severity = sum(severities) / len(severities) if severities else 0

    # Check if qualifies as hazard zone (3+ damage points, avg severity >= 4)
    if len(damage_points) >= 3 and avg_severity >= 4.0:
        total_cost = trail.get("total_estimated_cost", 0)

        return {
            "trail_id": trail.get("trail_id", ""),
            "trail_name": trail.get("trail_name", ""),
            "damage_count": len(damage_points),
            "avg_severity": round(avg_severity, 2),
            "total_cost": total_cost,
            "concern": f"Multiple high-severity damage points along {trail.get('trail_name', 'trail')}",
        }

    return None


def load_fixture_data(fire_id: str) -> dict | None:
    """
    Load trail damage data from fixtures.

    Args:
        fire_id: Fire identifier (e.g., "cedar-creek-2022")

    Returns:
        Trail damage data dict or None if not found
    """
    # Path relative to this script
    script_dir = Path(__file__).parent

    # Cedar Creek fixture location
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "trail-damage.json"

    if not fixture_path.exists():
        # Try alternate path (running from project root)
        fixture_path = Path("data/fixtures/cedar-creek/trail-damage.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                return data

    return None


def execute(inputs: dict) -> dict:
    """
    Execute trail damage classification.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - trail_id: Optional specific trail to analyze
            - damage_points: Optional pre-loaded damage point data

    Returns:
        Dictionary with damage classification including type breakdown,
        infrastructure issues, hazard zones, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    trail_id_filter = inputs.get("trail_id")
    damage_points_input = inputs.get("damage_points")

    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Load data
    trails_data = None
    data_sources = []

    if damage_points_input is not None:
        # Use provided damage points
        data_sources.append("User-provided damage points")
        trails = [{"damage_points": damage_points_input}]
    else:
        # Load from fixtures
        trails_data = load_fixture_data(fire_id)
        if trails_data:
            trails = trails_data.get("trails", [])
            data_sources.append(f"Cedar Creek field assessment {trails_data.get('assessment_date', 'unknown')}")
        else:
            return {
                "fire_id": fire_id,
                "error": f"No data found for fire_id: {fire_id}",
                "confidence": 0.0,
                "reasoning_chain": [f"ERROR: Could not load data for {fire_id}"],
            }

    # Filter by trail_id if provided
    if trail_id_filter:
        trails = [t for t in trails if t.get("trail_id") == trail_id_filter]

    if not trails:
        return {
            "fire_id": fire_id,
            "trails_assessed": 0,
            "total_damage_points": 0,
            "reasoning_chain": [f"No trails found for fire {fire_id}" + (f" with trail_id {trail_id_filter}" if trail_id_filter else "")],
            "confidence": 0.5,
            "data_sources": data_sources,
        }

    # Process damage points
    all_damage_points: list[DamagePoint] = []
    infrastructure_issues: list[InfrastructureIssue] = []
    hazard_zones: list[HazardZone] = []
    reasoning_chain: list[str] = []
    type_counts: dict[str, dict] = {
        "TYPE_IV": {"count": 0, "total_cost": 0},
        "TYPE_III": {"count": 0, "total_cost": 0},
        "TYPE_II": {"count": 0, "total_cost": 0},
        "TYPE_I": {"count": 0, "total_cost": 0},
    }

    # Count total damage points
    total_damage_points = sum(len(t.get("damage_points", [])) for t in trails)

    # Initial reasoning
    if trail_id_filter:
        trail_name = trails[0].get("trail_name", trail_id_filter)
        reasoning_chain.append(f"Analyzing {trail_name} ({total_damage_points} damage points)")
    else:
        reasoning_chain.append(f"Loaded {len(trails)} trails with {total_damage_points} total damage points for {fire_id}")

    # Process each trail
    for trail in trails:
        trail_id = trail.get("trail_id", "")
        trail_name = trail.get("trail_name", trail_id)
        damage_points = trail.get("damage_points", [])

        # Classify each damage point
        for dp in damage_points:
            # Add trail context
            dp["trail_id"] = trail_id
            dp["trail_name"] = trail_name

            # Classify
            damage_type, classified_dp, reasoning = classify_damage_point(dp)

            all_damage_points.append(classified_dp)
            reasoning_chain.append(reasoning)

            # Update type counts
            cost = dp.get("estimated_cost", 0)
            type_counts[damage_type]["count"] += 1
            type_counts[damage_type]["total_cost"] += cost

            # Check for infrastructure issues
            infra_issue = assess_infrastructure(dp)
            if infra_issue:
                infrastructure_issues.append(infra_issue)

        # Check if trail is a hazard zone
        hazard_zone = identify_hazard_zone(trail)
        if hazard_zone:
            hazard_zones.append(hazard_zone)
            reasoning_chain.append(
                f"{trail_name} flagged as hazard zone: {hazard_zone['damage_count']} damage points, "
                f"avg severity {hazard_zone['avg_severity']}"
            )

    # Build type summary (only include types with count > 0)
    type_summary = {}
    for type_key, data in type_counts.items():
        if data["count"] > 0:
            severity_range = DAMAGE_TYPES[type_key]["severity_range"]
            if severity_range[0] == severity_range[1]:
                sev_str = str(severity_range[0])
            else:
                sev_str = f"{severity_range[0]}-{severity_range[1]}"

            type_summary[type_key] = {
                "count": data["count"],
                "total_cost": data["total_cost"],
                "severity_range": sev_str,
            }

    # Generate recommendations
    recommendations = []

    # Recommend immediate attention for TYPE IV damage
    type4_damage = [dp for dp in all_damage_points if dp.get("damage_type") == "TYPE_IV"]
    if type4_damage:
        type4_ids = [dp["damage_id"] for dp in type4_damage[:4]]
        recommendations.append(f"Immediate attention to TYPE IV damage at {', '.join(type4_ids)}")

    # Recommend engineering assessment for infrastructure
    if infrastructure_issues:
        bridge_count = len([i for i in infrastructure_issues if "BRIDGE" in i["type"]])
        if bridge_count > 0:
            recommendations.append(f"Deploy engineering team for bridge replacement assessment ({bridge_count} failures)")

    # Recommend hazard zone closures
    if hazard_zones:
        for hz in hazard_zones[:2]:  # Top 2 hazard zones
            recommendations.append(f"Establish hazard zone closures at {hz['trail_name']} pending mitigation")

    # Calculate confidence
    confidence = 0.90  # High confidence for complete fixture data
    if damage_points_input is not None:
        confidence = 0.85  # Slightly lower for user-provided data

    return {
        "fire_id": fire_id,
        "trails_assessed": len(trails),
        "total_damage_points": total_damage_points,
        "damage_points": all_damage_points,
        "type_summary": type_summary,
        "infrastructure_issues": infrastructure_issues,
        "hazard_zones": hazard_zones,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": data_sources,
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    # Quick test with Cedar Creek
    test_input = {"fire_id": "cedar-creek-2022"}
    result = execute(test_input)
    print(json.dumps(result, indent=2))

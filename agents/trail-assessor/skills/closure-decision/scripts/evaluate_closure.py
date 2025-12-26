"""
Trail Closure Decision Script

Implements risk-based closure decision analysis for post-fire trail assessment.
Calculates risk scores and determines closure status based on safety factors.
"""

import json
from pathlib import Path
from typing import Literal, TypedDict


# Closure status types
ClosureStatus = Literal["OPEN", "OPEN_CAUTION", "RESTRICTED", "CLOSED"]

# Seasonal adjustments (risk score increase)
SEASONAL_ADJUSTMENTS = {
    "summer": 0,
    "fall": 10,
    "winter": 20,
    "spring": 15,
}


class ClosureDecision(TypedDict, total=False):
    """Closure decision for a trail."""
    trail_id: str
    trail_name: str
    risk_score: float
    base_risk: float
    seasonal_adjustment: float
    closure_status: ClosureStatus
    primary_concerns: list[str]


class ReopeningTimeline(TypedDict):
    """Reopening timeline estimate."""
    status: ClosureStatus
    estimated_months: int
    timeline: str
    dependencies: list[str]


def calculate_risk_score(trail: dict, factors: dict) -> tuple[float, list[str]]:
    """
    Calculate composite risk score for a trail.

    Args:
        trail: Trail data with damage points
        factors: Risk factor weights

    Returns:
        Tuple of (risk_score, primary_concerns)
    """
    damage_points = trail.get("damage_points", [])
    concerns = []

    # 1. Damage Severity Score (0-100, weighted 40%)
    if damage_points:
        severities = [dp.get("severity", 0) for dp in damage_points]
        avg_severity = sum(severities) / len(severities)
        max_severity = max(severities)
        # Scale: avg_severity/5 * 100, but boost if max is 5
        severity_score = (avg_severity / 5.0) * 100
        if max_severity == 5:
            severity_score = min(100, severity_score * 1.2)  # 20% boost for critical damage
    else:
        severity_score = 0

    # 2. Hazard Trees Score (0-100, weighted 25%)
    hazard_tree_points = [dp for dp in damage_points if dp.get("type") == "HAZARD_TREES"]
    if hazard_tree_points:
        # Higher severity hazard trees = higher risk
        hazard_severities = [dp.get("severity", 0) for dp in hazard_tree_points]
        hazard_score = (max(hazard_severities) / 5.0) * 100
        concerns.append("Hazard trees present")
    else:
        hazard_score = 0

    # 3. Infrastructure Score (0-100, weighted 25%)
    infrastructure_damage = [
        dp for dp in damage_points
        if dp.get("type") in ["BRIDGE_FAILURE", "CULVERT_DAMAGE", "PUNCHEON_FAILURE"]
    ]
    if infrastructure_damage:
        # Any infrastructure failure is critical
        infra_severities = [dp.get("severity", 0) for dp in infrastructure_damage]
        infrastructure_score = (max(infra_severities) / 5.0) * 100

        # Add specific concerns
        for dp in infrastructure_damage:
            if dp.get("type") == "BRIDGE_FAILURE":
                concerns.append("Bridge failure")
            elif dp.get("type") == "CULVERT_DAMAGE":
                concerns.append("Culvert damage")
    else:
        infrastructure_score = 0

    # 4. Accessibility Score (0-100, weighted 10%)
    # Trail class 1 = primitive (higher risk due to remoteness)
    # Trail class 5 = paved (lower risk, easier rescue)
    trail_class = int(trail.get("trail_class", 3))
    accessibility_score = ((5 - trail_class) / 4.0) * 100  # Inverse: class 1 = 100, class 5 = 0

    # Calculate weighted composite risk
    weights = factors.get("risk_components", {})
    damage_weight = weights.get("damage_severity", {}).get("weight", 0.40)
    hazard_weight = weights.get("hazard_trees", {}).get("weight", 0.25)
    infra_weight = weights.get("infrastructure", {}).get("weight", 0.25)
    access_weight = weights.get("accessibility", {}).get("weight", 0.10)

    risk_score = (
        severity_score * damage_weight +
        hazard_score * hazard_weight +
        infrastructure_score * infra_weight +
        accessibility_score * access_weight
    )

    # Add concerns for high-severity damage
    if damage_points:
        severe_damage = [dp for dp in damage_points if dp.get("severity", 0) >= 4]
        if len(severe_damage) > 1:
            concerns.append("Multiple high-severity damage")

        # Check for specific damage types
        debris_flows = [dp for dp in damage_points if dp.get("type") == "DEBRIS_FLOW" and dp.get("severity", 0) >= 4]
        if debris_flows:
            concerns.append("Major debris accumulation" if len(debris_flows) == 1 else "Multiple debris flows")

    return round(risk_score, 1), concerns


def apply_seasonal_adjustment(base_risk: float, season: str) -> float:
    """
    Apply seasonal risk adjustment.

    Args:
        base_risk: Base risk score (0-100)
        season: Season name (summer, fall, winter, spring)

    Returns:
        Adjusted risk score
    """
    adjustment = SEASONAL_ADJUSTMENTS.get(season.lower(), 0)
    return min(100.0, base_risk + adjustment)


def estimate_reopening_timeline(trail: dict, closure_status: ClosureStatus) -> dict:
    """
    Estimate reopening timeline based on closure status and work required.

    Args:
        trail: Trail data with damage points
        closure_status: Assigned closure status

    Returns:
        Reopening timeline dict with estimates and dependencies
    """
    damage_points = trail.get("damage_points", [])

    # Base estimates by closure status
    timeline_map = {
        "OPEN": {"months": 0, "description": "Immediate"},
        "OPEN_CAUTION": {"months": 1, "description": "1-2 months"},
        "RESTRICTED": {"months": 4, "description": "3-6 months"},
        "CLOSED": {"months": 12, "description": "12+ months"},
    }

    base_estimate = timeline_map.get(closure_status, {"months": 6, "description": "6 months"})

    # Identify dependencies
    dependencies = []

    # Check for major work items
    bridge_failures = [dp for dp in damage_points if dp.get("type") == "BRIDGE_FAILURE"]
    if bridge_failures:
        dependencies.append("Bridge replacement")

    debris_flows = [dp for dp in damage_points if dp.get("type") == "DEBRIS_FLOW"]
    if debris_flows:
        dependencies.append("Debris clearing")

    hazard_trees = [dp for dp in damage_points if dp.get("type") == "HAZARD_TREES"]
    if hazard_trees:
        dependencies.append("Hazard tree removal")

    # Severe damage needs reconstruction
    severe_damage = [dp for dp in damage_points if dp.get("severity", 0) == 5]
    if len(severe_damage) >= 2:
        dependencies.append("Full reconstruction")

    return {
        "status": closure_status,
        "estimated_months": base_estimate["months"],
        "timeline": base_estimate["description"],
        "dependencies": dependencies,
    }


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


def load_risk_factors() -> dict:
    """
    Load risk factor weights and thresholds.

    Returns:
        Risk factors configuration dict
    """
    script_dir = Path(__file__).parent
    resources_path = script_dir.parent / "resources" / "risk-thresholds.json"

    if resources_path.exists():
        with open(resources_path) as f:
            return json.load(f)

    # Fallback defaults
    return {
        "risk_components": {
            "damage_severity": {"weight": 0.40},
            "hazard_trees": {"weight": 0.25},
            "infrastructure": {"weight": 0.25},
            "accessibility": {"weight": 0.10},
        }
    }


def execute(inputs: dict) -> dict:
    """
    Execute trail closure decision analysis.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - trail_id: Optional specific trail to analyze
            - season: Season for adjustment (default: summer)

    Returns:
        Dictionary with closure decisions, risk scores, timelines,
        reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    trail_id_filter = inputs.get("trail_id")
    season = inputs.get("season", "summer")

    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Load data
    trails_data = load_fixture_data(fire_id)
    if not trails_data:
        return {
            "fire_id": fire_id,
            "error": f"No data found for fire_id: {fire_id}",
            "confidence": 0.0,
            "reasoning_chain": [f"ERROR: Could not load data for {fire_id}"],
        }

    # Load risk factors
    risk_factors = load_risk_factors()

    # Get trails
    trails = trails_data.get("trails", [])
    data_sources = [f"Cedar Creek field assessment {trails_data.get('assessment_date', 'unknown')}"]

    # Filter by trail_id if provided
    if trail_id_filter:
        trails = [t for t in trails if t.get("trail_id") == trail_id_filter]

    if not trails:
        return {
            "fire_id": fire_id,
            "trails_evaluated": 0,
            "reasoning_chain": [f"No trails found for {fire_id}" + (f" with trail_id {trail_id_filter}" if trail_id_filter else "")],
            "confidence": 0.5,
            "data_sources": data_sources,
        }

    # Process each trail
    closure_decisions: list[ClosureDecision] = []
    reopening_timeline: dict[str, ReopeningTimeline] = {}
    reasoning_chain: list[str] = []

    # Initial reasoning
    if trail_id_filter:
        reasoning_chain.append(f"Analyzing {trails[0].get('trail_name', trail_id_filter)} for {season} season")
    else:
        reasoning_chain.append(f"Evaluating {len(trails)} trails for {fire_id} (season: {season})")

    for trail in trails:
        trail_id = trail.get("trail_id", "")
        trail_name = trail.get("trail_name", trail_id)

        # Calculate base risk
        base_risk, concerns = calculate_risk_score(trail, risk_factors)

        # Apply seasonal adjustment
        seasonal_adj = SEASONAL_ADJUSTMENTS.get(season.lower(), 0)
        final_risk = apply_seasonal_adjustment(base_risk, season)

        # Determine closure status
        if final_risk >= 75:
            closure_status = "CLOSED"
        elif final_risk >= 50:
            closure_status = "RESTRICTED"
        elif final_risk >= 25:
            closure_status = "OPEN_CAUTION"
        else:
            closure_status = "OPEN"

        # Add seasonal concerns if adjustment applied
        if seasonal_adj > 0:
            if season == "winter":
                concerns.insert(0, "Winter conditions increase hazard tree risk")
            elif season == "fall":
                concerns.insert(0, "Fall season: increased debris")
            elif season == "spring":
                concerns.insert(0, "Spring runoff increases erosion risk")

        # Build closure decision
        decision: ClosureDecision = {
            "trail_id": trail_id,
            "trail_name": trail_name,
            "risk_score": final_risk,
            "closure_status": closure_status,
            "primary_concerns": concerns,
        }

        if seasonal_adj > 0:
            decision["base_risk"] = base_risk
            decision["seasonal_adjustment"] = seasonal_adj

        closure_decisions.append(decision)

        # Estimate reopening
        reopening_timeline[trail_id] = estimate_reopening_timeline(trail, closure_status)

        # Add reasoning
        if seasonal_adj > 0:
            reasoning_chain.append(
                f"{trail_name}: Base risk {base_risk} + {season} adjustment {seasonal_adj} = {final_risk} -> {closure_status}"
            )
        else:
            damage_count = len(trail.get("damage_points", []))
            reasoning_chain.append(
                f"{trail_name}: Risk {final_risk} ({damage_count} damage points) -> {closure_status}"
            )

    # Sort by risk score (highest first)
    closure_decisions.sort(key=lambda x: x["risk_score"], reverse=True)

    # Generate recommendations
    recommendations = []

    # Recommend actions for CLOSED trails
    closed_trails = [d for d in closure_decisions if d["closure_status"] == "CLOSED"]
    for trail in closed_trails[:2]:  # Top 2
        recommendations.append(f"Maintain CLOSED status for {trail['trail_name']} pending engineering assessment")

    # Recommend actions for RESTRICTED trails
    restricted_trails = [d for d in closure_decisions if d["closure_status"] == "RESTRICTED"]
    for trail in restricted_trails[:2]:  # Top 2
        recommendations.append(f"Restrict {trail['trail_name']} access to designated areas only")

    # Recommend OPEN trails with signage
    open_caution = [d for d in closure_decisions if d["closure_status"] == "OPEN_CAUTION"]
    for trail in open_caution[:2]:
        primary_concern = trail["primary_concerns"][0] if trail["primary_concerns"] else "hazards"
        recommendations.append(f"Open {trail['trail_name']} with {primary_concern} warning signage")

    # Seasonal adjustments summary
    seasonal_summary = {
        "season": season,
        "adjustment": SEASONAL_ADJUSTMENTS.get(season.lower(), 0),
        "rationale": "",
    }

    if season == "winter":
        seasonal_summary["rationale"] = "Winter conditions: snow, ice, reduced access for emergency response"
    elif season == "fall":
        seasonal_summary["rationale"] = "Fall conditions: increased debris from wind, reduced daylight"
    elif season == "spring":
        seasonal_summary["rationale"] = "Spring conditions: snowmelt, runoff, erosion"
    else:
        seasonal_summary["rationale"] = "Summer baseline conditions"

    # Calculate confidence
    confidence = 0.88  # High confidence for complete data

    return {
        "fire_id": fire_id,
        "trails_evaluated": len(trails),
        "season": season,
        "closure_decisions": closure_decisions,
        "reopening_timeline": reopening_timeline,
        "seasonal_adjustments": seasonal_summary,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": data_sources,
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    # Quick test with Cedar Creek
    test_input = {"fire_id": "cedar-creek-2022", "season": "summer"}
    result = execute(test_input)
    print(json.dumps(result, indent=2))

"""
Trail Prioritization Script

Implements multi-factor prioritization for trail repair planning.
Calculates usage, access, and cost-effectiveness scores to optimize resource allocation.
"""

import json
from pathlib import Path
from typing import TypedDict


class TrailPriority(TypedDict, total=False):
    """Priority ranking for a trail."""
    rank: int
    trail_id: str
    trail_name: str
    priority_score: float
    usage_score: float
    access_score: float
    cost_effectiveness: float
    total_cost: float
    rationale: str


class QuickWin(TypedDict):
    """Quick-win opportunity."""
    trail_id: str
    trail_name: str
    total_cost: float
    priority_score: float
    estimated_timeline: str
    rationale: str


def calculate_usage_score(trail: dict) -> tuple[float, str]:
    """
    Calculate usage score based on visitor traffic and trail characteristics.

    Args:
        trail: Trail data

    Returns:
        Tuple of (usage_score, reasoning)
    """
    # Priority rank (inverse: rank 1 = highest score)
    # Cedar Creek trails are ranked 1-5 in priority_rank field
    priority_rank = trail.get("priority_rank", 5)
    rank_score = ((6 - priority_rank) / 5.0) * 100  # Rank 1 = 100, Rank 5 = 20

    # Trail miles (longer trails = higher value, but with diminishing returns)
    total_miles = trail.get("total_miles", 0)
    # Score: sqrt scaling for diminishing returns, cap at 20 miles
    miles_score = min(100, (total_miles / 20.0) ** 0.5 * 100)

    # Trail class (lower class number = more primitive = typically higher use for wilderness)
    # Class 1 = primitive, Class 5 = paved
    trail_class = int(trail.get("trail_class", 3))
    # Invert: class 1 = 80, class 3 = 40, class 5 = 0
    class_score = ((5 - trail_class) / 4.0) * 80

    # Weighted composite (weights from resources)
    usage_score = (
        rank_score * 0.50 +
        miles_score * 0.30 +
        class_score * 0.20
    )

    reasoning = f"Usage: rank {priority_rank} ({rank_score:.0f}), {total_miles:.1f} mi ({miles_score:.0f}), class {trail_class} ({class_score:.0f})"

    return round(usage_score, 1), reasoning


def calculate_access_score(trail: dict) -> tuple[float, str]:
    """
    Calculate access score based on connectivity and strategic value.

    Args:
        trail: Trail data

    Returns:
        Tuple of (access_score, reasoning)
    """
    score = 0
    factors = []

    # Base score from priority rationale (heuristic parsing)
    rationale = trail.get("priority_rationale", "").lower()

    # Wilderness gateway access
    if "waldo lake" in trail.get("trail_name", "").lower() or "primary" in rationale:
        score += 30
        factors.append("wilderness gateway")

    # Trail system connector
    if "access" in rationale or "corridor" in rationale:
        score += 25
        factors.append("access route")

    # Unique destination
    if "lake" in trail.get("trail_name", "").lower():
        score += 25
        factors.append("destination value")

    # Economic value (salvage, etc.)
    if "salvage" in rationale or "economic" in rationale:
        score += 20
        factors.append("economic value")

    # Seasonal access (longer trail = more seasonal impact)
    if trail.get("total_miles", 0) > 10:
        score += 20
        factors.append("extended season")

    # Cap at 100
    score = min(100, score)

    reasoning = f"Access: {', '.join(factors) if factors else 'standard access'} ({score:.0f})"

    return round(score, 1), reasoning


def calculate_cost_effectiveness(trail: dict) -> tuple[float, str]:
    """
    Calculate cost-effectiveness score.

    Args:
        trail: Trail data

    Returns:
        Tuple of (cost_effectiveness_score, reasoning)
    """
    total_cost = trail.get("total_estimated_cost", 0)
    total_miles = trail.get("total_miles", 1)  # Avoid division by zero

    # Cost per mile
    cost_per_mile = total_cost / total_miles if total_miles > 0 else 999999

    # Score based on cost efficiency bands
    if cost_per_mile <= 5000:
        score = 100
        band = "excellent"
    elif cost_per_mile <= 15000:
        score = 75
        band = "good"
    elif cost_per_mile <= 30000:
        score = 50
        band = "fair"
    else:
        score = 25
        band = "poor"

    reasoning = f"Cost-eff: ${cost_per_mile:,.0f}/mi ({band}, {score:.0f})"

    return round(score, 1), reasoning


def identify_quick_wins(trails: list[dict]) -> list[QuickWin]:
    """
    Identify quick-win opportunities.

    Args:
        trails: List of trail data with priority scores

    Returns:
        List of quick-win trails
    """
    quick_wins = []

    for trail in trails:
        total_cost = trail.get("total_estimated_cost", 0)
        crew_days = trail.get("total_crew_days", sum(dp.get("crew_days", 0) for dp in trail.get("damage_points", [])))
        usage_score = trail.get("_usage_score", 0)  # Set during priority calculation

        # Quick win criteria: low cost, decent usage, short timeline
        if total_cost <= 15000 and usage_score >= 60 and crew_days <= 10:
            # Estimate timeline based on crew days
            if crew_days <= 3:
                timeline = "1 month"
            elif crew_days <= 7:
                timeline = "1-2 months"
            else:
                timeline = "2 months"

            quick_wins.append({
                "trail_id": trail.get("trail_id", ""),
                "trail_name": trail.get("trail_name", ""),
                "total_cost": total_cost,
                "priority_score": trail.get("_priority_score", 0),
                "estimated_timeline": timeline,
                "rationale": trail.get("priority_rationale", "Quick reopening opportunity"),
            })

    # Sort by priority score
    quick_wins.sort(key=lambda x: x["priority_score"], reverse=True)

    return quick_wins


def allocate_resources(trails: list[dict], budget: float | None) -> dict:
    """
    Allocate budget across trails optimally.

    Args:
        trails: List of trail data sorted by priority
        budget: Available budget (None = unlimited)

    Returns:
        Resource allocation dict
    """
    if budget is None:
        return {}

    funded_trails = []
    deferred_trails = []
    total_allocated = 0.0

    for trail in trails:
        cost = trail.get("total_estimated_cost", 0)
        priority_score = trail.get("_priority_score", 0)

        if total_allocated + cost <= budget:
            # Fund this trail
            funded_trails.append({
                "trail_id": trail.get("trail_id", ""),
                "trail_name": trail.get("trail_name", ""),
                "cost": cost,
                "priority_score": priority_score,
            })
            total_allocated += cost
        else:
            # Defer this trail
            shortfall = cost - (budget - total_allocated)
            deferred_trails.append({
                "trail_id": trail.get("trail_id", ""),
                "trail_name": trail.get("trail_name", ""),
                "cost": cost,
                "priority_score": priority_score,
                "shortfall": shortfall,
            })

    return {
        "funded_trails": funded_trails,
        "total_allocated": total_allocated,
        "remaining_budget": budget - total_allocated,
        "deferred_trails": deferred_trails,
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


def execute(inputs: dict) -> dict:
    """
    Execute trail prioritization analysis.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - budget: Optional budget constraint
            - include_quick_wins: Whether to identify quick wins (default: True)

    Returns:
        Dictionary with priority rankings, quick wins, resource allocation,
        reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    budget = inputs.get("budget")
    include_quick_wins = inputs.get("include_quick_wins", True)

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

    # Get trails
    trails = trails_data.get("trails", [])
    data_sources = [f"Cedar Creek field assessment {trails_data.get('assessment_date', 'unknown')}"]

    if not trails:
        return {
            "fire_id": fire_id,
            "total_trails": 0,
            "reasoning_chain": [f"No trails found for {fire_id}"],
            "confidence": 0.5,
            "data_sources": data_sources,
        }

    # Calculate scores for each trail
    priority_ranking: list[TrailPriority] = []
    reasoning_chain: list[str] = []

    reasoning_chain.append(f"Evaluating {len(trails)} trails for {fire_id}")
    if budget is not None:
        reasoning_chain.append(f"Budget: ${budget:,.0f} available")

    for trail in trails:
        trail_id = trail.get("trail_id", "")
        trail_name = trail.get("trail_name", trail_id)

        # Calculate component scores
        usage_score, usage_reason = calculate_usage_score(trail)
        access_score, access_reason = calculate_access_score(trail)
        cost_eff, cost_reason = calculate_cost_effectiveness(trail)

        # Calculate composite priority score (weighted)
        # Usage: 35%, Access: 30%, Cost-eff: 20%, Strategic: 15% (implied from access)
        priority_score = (
            usage_score * 0.35 +
            access_score * 0.30 +
            cost_eff * 0.20 +
            access_score * 0.15  # Strategic value approximated by access
        )

        priority_score = round(priority_score, 1)

        # Store scores in trail for quick wins calculation
        trail["_usage_score"] = usage_score
        trail["_priority_score"] = priority_score

        # Build priority entry
        priority_entry: TrailPriority = {
            "trail_id": trail_id,
            "trail_name": trail_name,
            "priority_score": priority_score,
            "usage_score": usage_score,
            "access_score": access_score,
            "cost_effectiveness": cost_eff,
            "total_cost": trail.get("total_estimated_cost", 0),
            "rationale": trail.get("priority_rationale", ""),
        }

        priority_ranking.append(priority_entry)

        # Add reasoning
        reasoning_chain.append(
            f"{trail_name}: Usage {usage_score}, Access {access_score}, "
            f"Cost-Eff {cost_eff} -> Priority {priority_score}"
        )

    # Sort by priority score (highest first)
    priority_ranking.sort(key=lambda x: x["priority_score"], reverse=True)
    trails.sort(key=lambda x: x["_priority_score"], reverse=True)

    # Add rank numbers
    for i, entry in enumerate(priority_ranking):
        entry["rank"] = i + 1

    # Identify quick wins
    quick_wins = []
    if include_quick_wins:
        quick_wins = identify_quick_wins(trails)
        if quick_wins:
            qw_summary = ", ".join([f"{qw['trail_name']} (${qw['total_cost']/1000:.1f}K)" for qw in quick_wins])
            reasoning_chain.append(f"Identified {len(quick_wins)} quick wins: {qw_summary}")

    # Allocate resources if budget provided
    resource_allocation = {}
    if budget is not None:
        resource_allocation = allocate_resources(trails, budget)

        # Add budget reasoning
        for funded in resource_allocation.get("funded_trails", []):
            reasoning_chain.append(f"Funded: {funded['trail_name']} (${funded['cost']:,.0f})")

        remaining = resource_allocation.get("remaining_budget", 0)
        reasoning_chain.append(f"Remaining budget: ${remaining:,.0f}")

        for deferred in resource_allocation.get("deferred_trails", []):
            reasoning_chain.append(
                f"Deferred: {deferred['trail_name']} (${deferred['cost']:,.0f}) - "
                f"shortfall ${deferred['shortfall']:,.0f}"
            )

    # Generate recommendations
    recommendations = []

    # Phase 1: Quick wins
    if quick_wins:
        qw_names = ", ".join([qw["trail_name"].split("#")[0].strip() for qw in quick_wins[:2]])
        recommendations.append(f"Phase 1: Address quick wins ({qw_names}) for early reopenings")

    # Phase 2: Top priority trail
    if priority_ranking:
        top_trail = priority_ranking[0]
        recommendations.append(
            f"Phase 2: Prioritize {top_trail['trail_name']} "
            f"({top_trail['rationale'][:50]}...)" if len(top_trail['rationale']) > 50 else f"({top_trail['rationale']})"
        )

    # Phase 3: Second priority
    if len(priority_ranking) > 1:
        second_trail = priority_ranking[1]
        # Check for special considerations
        if "salvage" in second_trail.get("rationale", "").lower():
            recommendations.append(
                f"Phase 3: Coordinate {second_trail['trail_name']} repair with timber salvage operations"
            )
        else:
            recommendations.append(f"Phase 3: Address {second_trail['trail_name']}")

    # Budget-specific recommendations
    if budget is not None and resource_allocation.get("deferred_trails"):
        top_deferred = resource_allocation["deferred_trails"][0]
        recommendations.append(
            f"Seek additional ${top_deferred['shortfall']:,.0f} for "
            f"{top_deferred['trail_name']} in next fiscal year"
        )

    # Calculate confidence
    confidence = 0.85  # High confidence for complete data

    result = {
        "fire_id": fire_id,
        "total_trails": len(trails),
        "priority_ranking": priority_ranking,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": data_sources,
        "recommendations": recommendations,
    }

    if quick_wins:
        result["quick_wins"] = quick_wins

    if budget is not None:
        result["budget"] = budget
        result["resource_allocation"] = resource_allocation

    return result


if __name__ == "__main__":
    # Quick test with Cedar Creek
    test_input = {"fire_id": "cedar-creek-2022", "budget": 200000}
    result = execute(test_input)
    print(json.dumps(result, indent=2))

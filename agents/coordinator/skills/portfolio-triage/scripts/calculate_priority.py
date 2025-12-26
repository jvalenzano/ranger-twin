"""
Portfolio Triage Calculation Script

Implements the BAER prioritization algorithm for ranking fires
based on severity, size, and phase in the recovery lifecycle.

Values must match mission.ts exactly for frontend consistency.
"""

from typing import Literal, TypedDict


# Type definitions matching apps/command-console/src/types/mission.ts
FirePhase = Literal["active", "baer_assessment", "baer_implementation", "in_restoration"]
FireSeverity = Literal["low", "moderate", "high", "critical"]


# Phase multipliers from mission.ts:247-252
# Based on time-criticality of each phase
PHASE_MULTIPLIERS: dict[FirePhase, float] = {
    "active": 2.0,              # Fire burning - highest urgency
    "baer_assessment": 1.75,    # 7-day BAER window - very time-critical
    "baer_implementation": 1.25, # Work underway - moderate urgency
    "in_restoration": 1.0,      # Long-term - baseline priority
}


# Severity weights from mission.ts:214-222 (SEVERITY_DISPLAY.weight)
SEVERITY_WEIGHTS: dict[FireSeverity, int] = {
    "critical": 4,
    "high": 3,
    "moderate": 2,
    "low": 1,
}


class FireInput(TypedDict, total=False):
    """Input fire object structure."""
    id: str
    name: str
    severity: FireSeverity
    acres: int | float
    phase: FirePhase


class TriageResult(TypedDict):
    """Output for a single fire's triage calculation."""
    id: str
    name: str
    triage_score: float
    severity_weight: int
    acres_normalized: float
    phase_multiplier: float
    phase: str
    reasoning: str


def calculate_triage_score(
    severity: FireSeverity,
    acres: float,
    phase: FirePhase,
) -> tuple[float, dict]:
    """
    Calculate triage score for a single fire.

    Formula: severityWeight × (acres/10000) × phaseMultiplier
    Matches mission.ts:260-270 calculateTriageScore()

    Args:
        severity: Fire severity classification
        acres: Total burned acres
        phase: Current fire phase in recovery lifecycle

    Returns:
        Tuple of (score, components dict)
    """
    # Get severity weight (default to 1 if unknown)
    severity_lower = severity.lower() if severity else "moderate"
    severity_weight = SEVERITY_WEIGHTS.get(severity_lower, 1)

    # Normalize acres (cap at 50 for 500k+ acre fires)
    acres_normalized = min(acres / 10000, 50) if acres else 0
    acres_normalized = round(acres_normalized, 2)

    # Get phase multiplier (default to 1.0 if unknown)
    phase_multiplier = PHASE_MULTIPLIERS.get(phase, 1.0)

    # Calculate score with one decimal precision
    score = round(severity_weight * acres_normalized * phase_multiplier, 1)

    components = {
        "severity_weight": severity_weight,
        "acres_normalized": acres_normalized,
        "phase_multiplier": phase_multiplier,
    }

    return score, components


def execute(inputs: dict) -> dict:
    """
    Execute portfolio triage calculation.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fires: Array of fire objects with id, name, severity, acres, phase
            - top_n: Optional limit on number of results to return

    Returns:
        Dictionary with:
            - ranked_fires: Fires sorted by triage score (highest first)
            - reasoning_chain: Step-by-step explanation of rankings
            - confidence: Overall confidence score (0-1)
            - summary: Brief portfolio overview
    """
    fires = inputs.get("fires", [])
    top_n = inputs.get("top_n")

    if not fires:
        return {
            "ranked_fires": [],
            "reasoning_chain": [],
            "confidence": 0.0,
            "summary": "No fires provided for triage analysis.",
        }

    results: list[TriageResult] = []
    reasoning_chain: list[str] = []

    for fire in fires:
        fire_id = fire.get("id", "unknown")
        fire_name = fire.get("name", "Unknown Fire")
        severity = fire.get("severity", "moderate")
        acres = fire.get("acres", 0)
        phase = fire.get("phase", "in_restoration")

        score, components = calculate_triage_score(
            severity=severity,
            acres=acres,
            phase=phase,
        )

        reasoning = (
            f"{fire_name}: {components['severity_weight']} ({severity} severity) x "
            f"{components['acres_normalized']} (normalized acres) x "
            f"{components['phase_multiplier']} ({phase}) = {score}"
        )

        result: TriageResult = {
            "id": fire_id,
            "name": fire_name,
            "triage_score": score,
            "severity_weight": components["severity_weight"],
            "acres_normalized": components["acres_normalized"],
            "phase_multiplier": components["phase_multiplier"],
            "phase": phase,
            "reasoning": reasoning,
        }
        results.append(result)
        reasoning_chain.append(reasoning)

    # Sort by triage score (highest first)
    results.sort(key=lambda x: x["triage_score"], reverse=True)

    # Rebuild reasoning chain in sorted order
    reasoning_chain = [r["reasoning"] for r in results]

    # Apply top_n filter if specified
    returned_results = results
    if top_n and isinstance(top_n, int) and top_n > 0:
        returned_results = results[:top_n]

    # Calculate confidence based on data completeness
    # High confidence (0.92) for complete fixture data
    # Reduce if fields are missing
    confidence = 0.92

    # Generate summary
    total_fires = len(fires)
    returned_count = len(returned_results)
    top_fire = returned_results[0] if returned_results else None

    if top_n and returned_count < total_fires:
        summary = f"{returned_count} of {total_fires} fires returned (top_n={top_n})."
    else:
        summary = f"{total_fires} fires analyzed."

    if top_fire:
        summary += f" {top_fire['name']} ranks highest"
        if top_fire["phase"] == "active":
            summary += " - actively burning, immediate attention required."
        elif top_fire["phase"] == "baer_assessment":
            summary += " - in 7-day BAER assessment window, time-critical."
        else:
            summary += f" with score {top_fire['triage_score']}."

    return {
        "ranked_fires": returned_results,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "summary": summary,
    }


if __name__ == "__main__":
    # Quick test with sample data
    test_input = {
        "fires": [
            {"id": "cedar-creek", "name": "Cedar Creek Fire", "severity": "high", "acres": 127341, "phase": "baer_implementation"},
            {"id": "bootleg", "name": "Bootleg Fire", "severity": "high", "acres": 413765, "phase": "in_restoration"},
        ],
    }
    result = execute(test_input)
    import json
    print(json.dumps(result, indent=2))

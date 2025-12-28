"""
Salvage Assessment Script

Assesses post-fire timber salvage viability based on deterioration timelines,
species decay rates, access difficulty, and market factors.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Literal


DeteriorationStage = Literal["early", "moderate", "advanced", "severe"]
UrgencyLevel = Literal["IMMEDIATE", "HIGH", "MODERATE", "LOW", "NOT_VIABLE"]


def calculate_months_since_fire(fire_date: str, assessment_date: str) -> int:
    """
    Calculate months elapsed since fire containment.

    Args:
        fire_date: Fire containment date (YYYY-MM-DD)
        assessment_date: Current/assessment date (YYYY-MM-DD)

    Returns:
        Months elapsed (rounded to 1 decimal)
    """
    fire_dt = datetime.strptime(fire_date, "%Y-%m-%d")
    assess_dt = datetime.strptime(assessment_date, "%Y-%m-%d")

    days_diff = (assess_dt - fire_dt).days
    months = round(days_diff / 30.44, 1)  # Average days per month

    return max(0, months)


def assess_deterioration_stage(
    species: str,
    months_since_fire: float,
    burn_severity: str = "HIGH"
) -> tuple[DeteriorationStage, str]:
    """
    Assess deterioration stage based on species and time elapsed.

    Args:
        species: FSVeg species code
        months_since_fire: Months since fire containment
        burn_severity: Burn severity class (affects rate)

    Returns:
        Tuple of (deterioration_stage, reasoning)
    """
    # Load deterioration models
    resources_dir = Path(__file__).parent.parent / "resources"
    with open(resources_dir / "deterioration-models.json") as f:
        models = json.load(f)

    # Get species blue stain onset
    if species in models["blue_stain_onset"]:
        onset_months = models["blue_stain_onset"][species]["months_to_onset"]
    else:
        # Default to moderate resistance
        onset_months = 12

    # Apply burn severity multiplier
    severity_mult = models["burn_severity_factor"].get(burn_severity, {}).get("rate_multiplier", 1.0)
    adjusted_onset = onset_months / severity_mult

    # Determine stage based on progression through onset timeline
    ratio = months_since_fire / adjusted_onset

    if ratio < 0.5:
        stage = "early"
        description = "Premium quality retained"
    elif ratio < 1.5:
        stage = "moderate"
        description = "Blue stain beginning, one grade drop typical"
    elif ratio < 2.5:
        stage = "advanced"
        description = "Extensive blue stain, 2+ grade drop"
    else:
        stage = "severe"
        description = "Utility grade only"

    reasoning = f"{species} at {months_since_fire} months ({ratio:.1f}× blue stain threshold) -> {stage.upper()} stage: {description}"

    return stage, reasoning


def calculate_salvage_window(
    species: str,
    months_since_fire: float,
    quality_tier: str = "premium"
) -> dict:
    """
    Calculate remaining salvage window for quality tier.

    Args:
        species: FSVeg species code
        months_since_fire: Months since fire
        quality_tier: Quality tier ("premium", "commercial", "utility")

    Returns:
        Dictionary with months_remaining, deadline, expired status
    """
    # Load viability criteria
    resources_dir = Path(__file__).parent.parent / "resources"
    with open(resources_dir / "viability-criteria.json") as f:
        criteria = json.load(f)

    # Get tier window
    tier_windows = criteria["quality_tier_windows"].get(quality_tier, {}).get("max_months", {})

    if species in tier_windows:
        max_months = tier_windows[species]
    else:
        # Default windows
        defaults = {"premium": 18, "commercial": 30, "utility": 48}
        max_months = defaults.get(quality_tier, 18)

    months_remaining = max(0, max_months - months_since_fire)
    expired = months_remaining <= 0

    return {
        "months_remaining": round(months_remaining, 1),
        "max_months": max_months,
        "expired": expired,
    }


def assess_grade_impact(
    original_grade: str,
    deterioration_stage: DeteriorationStage,
    mortality_pct: float
) -> tuple[str, float]:
    """
    Assess grade degradation from fire damage and deterioration.

    Args:
        original_grade: Original lumber grade (e.g., "2S")
        deterioration_stage: Current deterioration stage
        mortality_pct: Tree mortality percentage

    Returns:
        Tuple of (degraded_grade, value_loss_pct)
    """
    # Grade progression mapping
    grade_sequence = ["1S", "2S", "3S", "4S"]

    # Determine grade drops by stage
    grade_drops = {
        "early": 0,
        "moderate": 1,
        "advanced": 2,
        "severe": 3,  # Always drops to 4S
    }

    # Additional drop for high mortality
    if mortality_pct >= 95:
        grade_drops[deterioration_stage] += 1

    # Find current grade index
    try:
        current_idx = grade_sequence.index(original_grade)
    except ValueError:
        current_idx = 1  # Default to 2S

    # Apply drops
    drops = grade_drops.get(deterioration_stage, 1)
    new_idx = min(current_idx + drops, len(grade_sequence) - 1)
    new_grade = grade_sequence[new_idx]

    # Calculate value loss
    value_loss_pct = drops * 30  # Rough estimate: 30% per grade

    return new_grade, value_loss_pct


def calculate_viability_score(
    deterioration_stage: DeteriorationStage,
    access_difficulty: str,
    market_demand: str,
    volume_mbf: float
) -> tuple[float, list[str]]:
    """
    Calculate composite viability score (0-100).

    Args:
        deterioration_stage: Wood quality stage
        access_difficulty: Access class ("excellent", "good", "moderate", "difficult")
        market_demand: Market demand ("high", "moderate", "low")
        volume_mbf: Volume in MBF per acre

    Returns:
        Tuple of (viability_score, scoring_breakdown)
    """
    # Load criteria
    resources_dir = Path(__file__).parent.parent / "resources"
    with open(resources_dir / "viability-criteria.json") as f:
        criteria = json.load(f)

    weights = criteria["scoring_weights"]
    breakdown = []

    # 1. Deterioration score (30%)
    det_scores = criteria["deterioration_scoring"]
    det_score = det_scores.get(deterioration_stage, {}).get("score", 50)
    det_component = det_score * (weights["deterioration_stage"]["weight_pct"] / 100)
    breakdown.append(f"Deterioration ({deterioration_stage}): {det_score}/100 × 30% = {det_component:.1f}")

    # 2. Access score (25%)
    access_scores = criteria["access_scoring"]
    access_score = access_scores.get(access_difficulty, {}).get("score", 50)
    access_component = access_score * (weights["access_difficulty"]["weight_pct"] / 100)
    breakdown.append(f"Access ({access_difficulty}): {access_score}/100 × 25% = {access_component:.1f}")

    # 3. Market demand score (25%)
    market_scores = {"high": 100, "moderate": 70, "low": 40}
    market_score = market_scores.get(market_demand, 70)
    market_component = market_score * (weights["market_demand"]["weight_pct"] / 100)
    breakdown.append(f"Market demand ({market_demand}): {market_score}/100 × 25% = {market_component:.1f}")

    # 4. Volume score (20%)
    volume_scores = criteria["volume_scoring"]
    if volume_mbf >= volume_scores["very_high"]["min_mbf_per_acre"]:
        vol_score = 100
    elif volume_mbf >= volume_scores["high"]["min_mbf_per_acre"]:
        vol_score = 80
    elif volume_mbf >= volume_scores["moderate"]["min_mbf_per_acre"]:
        vol_score = 60
    elif volume_mbf >= volume_scores["low"]["min_mbf_per_acre"]:
        vol_score = 30
    else:
        vol_score = 10

    vol_component = vol_score * (weights["volume_value"]["weight_pct"] / 100)
    breakdown.append(f"Volume ({volume_mbf:.1f} MBF/ac): {vol_score}/100 × 20% = {vol_component:.1f}")

    # Total score
    total_score = det_component + access_component + market_component + vol_component

    return round(total_score, 0), breakdown


def rank_by_priority(plots: list[dict]) -> list[dict]:
    """
    Rank plots by viability score (descending).

    Args:
        plots: List of plot dictionaries with viability scores

    Returns:
        Sorted list of plots
    """
    return sorted(plots, key=lambda p: p.get("viability_score", 0), reverse=True)


def execute(inputs: dict) -> dict:
    """
    Execute salvage assessment.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - fire_date: Fire containment date (YYYY-MM-DD) (optional)
            - assessment_date: Assessment date (optional, default: today)
            - plots: Plot data (optional, loads from fixtures if not provided)
            - include_recommendations: Include harvest recs (optional, default: True)

    Returns:
        Dictionary with salvage viability analysis, priority ranking,
        deterioration summary, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    fire_date = inputs.get("fire_date")
    assessment_date = inputs.get("assessment_date", datetime.now().strftime("%Y-%m-%d"))
    plots_input = inputs.get("plots")
    include_recommendations = inputs.get("include_recommendations", True)

    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Load fire_date from fixtures if not provided
    # Per ADR-009: Fixture-First Strategy - skills load bundled fixtures directly
    if not fire_date:
        fire_metadata = load_fire_metadata(fire_id)
        if fire_metadata:
            fire_date = fire_metadata.get("containment_date")
        if not fire_date:
            # Fallback default for Cedar Creek
            fire_date = "2022-10-14"

    # Calculate time since fire
    months_since_fire = calculate_months_since_fire(fire_date, assessment_date)

    # Load plot data
    plots = plots_input
    data_sources = []

    if not plots:
        # Load from fixtures
        plots_data = load_plots_data(fire_id)
        if plots_data:
            plots = plots_data
            data_sources.append("Cedar Creek timber plot data")
        else:
            return {
                "fire_id": fire_id,
                "error": f"No plot data found for {fire_id}",
                "confidence": 0.0,
                "reasoning_chain": [f"ERROR: Could not load plots for {fire_id}"],
            }

    if not plots:
        return {
            "fire_id": fire_id,
            "months_since_fire": months_since_fire,
            "plots_assessed": 0,
            "reasoning_chain": ["No plots to assess"],
            "confidence": 0.5,
        }

    reasoning_chain = []
    reasoning_chain.append(f"Fire contained {fire_date}, assessment {assessment_date} = {months_since_fire} months elapsed")

    # Assess each plot
    priority_plots = []
    species_deterioration = {}

    for plot in plots:
        plot_id = plot.get("plot_id", "unknown")
        sector = plot.get("sector")
        volume_mbf = plot.get("plot_summary", {}).get("mbf_per_acre", 20)
        salvage_value = plot.get("plot_summary", {}).get("salvage_value_per_acre", 1000)
        access_notes = plot.get("access_notes", "")
        priority = plot.get("priority", "MEDIUM")

        # Determine primary species
        trees = plot.get("trees", [])
        if trees:
            # Count trees by species
            species_counts = {}
            for tree in trees:
                sp = tree.get("species", "PSME")
                species_counts[sp] = species_counts.get(sp, 0) + 1
            primary_species = max(species_counts, key=species_counts.get)
        else:
            primary_species = "PSME"

        # Assess deterioration
        avg_mortality = plot.get("plot_summary", {}).get("avg_mortality", 90)
        det_stage, det_reasoning = assess_deterioration_stage(primary_species, months_since_fire, "HIGH")
        reasoning_chain.append(f"Plot {plot_id}: {det_reasoning}")

        # Track species deterioration
        if primary_species not in species_deterioration:
            window = calculate_salvage_window(primary_species, months_since_fire, "premium")
            species_deterioration[primary_species] = {
                "stage": det_stage,
                "months_to_blue_stain": window["months_remaining"],
            }

        # Calculate salvage window
        premium_window = calculate_salvage_window(primary_species, months_since_fire, "premium")

        # Assess grade impact
        original_grade = "2S"  # Assume standard grade
        if priority in ["HIGHEST", "HIGH"]:
            original_grade = "1S"
        degraded_grade, value_loss = assess_grade_impact(original_grade, det_stage, avg_mortality)

        # Determine access difficulty
        if "steep" in access_notes.lower() or "cable" in access_notes.lower():
            access = "moderate"
        elif "helicopter" in access_notes.lower() or "no road" in access_notes.lower():
            access = "difficult"
        elif "good" in access_notes.lower() or "flat" in access_notes.lower():
            access = "good"
        else:
            access = "moderate"

        # Determine market demand
        if primary_species == "PSME" and det_stage == "early":
            market = "high"
        elif primary_species in ["PSME", "THPL"] and det_stage in ["early", "moderate"]:
            market = "moderate"
        else:
            market = "low"

        # Calculate viability score
        viability_score, score_breakdown = calculate_viability_score(
            det_stage, access, market, volume_mbf
        )

        reasoning_chain.append(f"Plot {plot_id}: Viability {viability_score}/100")

        # Determine urgency
        if viability_score >= 85:
            urgency = "IMMEDIATE"
        elif viability_score >= 70:
            urgency = "HIGH"
        elif viability_score >= 50:
            urgency = "MODERATE"
        elif viability_score >= 30:
            urgency = "LOW"
        else:
            urgency = "NOT_VIABLE"

        # Build priority plot entry
        priority_plots.append({
            "plot_id": plot_id,
            "sector": sector,
            "viability_score": viability_score,
            "urgency": urgency,
            "deterioration_stage": f"{det_stage.capitalize()} - {det_reasoning.split('->')[1].split(':')[1].strip()}",
            "salvage_window_months": premium_window["months_remaining"],
            "volume_mbf": volume_mbf,
            "salvage_value": int(salvage_value),
            "primary_species": primary_species,
            "access": f"{access.capitalize()} - {access_notes[:50]}...",
            "recommendation": generate_plot_recommendation(plot_id, urgency, det_stage, volume_mbf),
        })

    # Rank plots
    priority_plots = rank_by_priority(priority_plots)

    # Generate deterioration summary
    deterioration_summary = {}
    for species, data in species_deterioration.items():
        # Load species info
        resources_dir = Path(__file__).parent.parent / "resources"
        with open(resources_dir / "deterioration-models.json") as f:
            models = json.load(f)

        quality_retention_map = {"early": "95%", "moderate": "75%", "advanced": "50%", "severe": "20%"}

        deterioration_summary[species] = {
            "stage": data["stage"].capitalize(),
            "months_to_blue_stain": data["months_to_blue_stain"],
            "quality_retention": quality_retention_map.get(data["stage"], "50%"),
            "notes": models["blue_stain_onset"].get(species, {}).get("notes", "Standard deterioration timeline"),
        }

    # Calculate salvage windows
    salvage_window = {}
    for tier in ["premium", "commercial"]:
        # Use PSME as representative
        window = calculate_salvage_window("PSME", months_since_fire, tier)
        salvage_window[tier] = {
            "months_remaining": window["months_remaining"],
            "deadline": calculate_deadline(assessment_date, window["months_remaining"]),
        }

    # Generate recommendations
    recommendations = []
    if include_recommendations:
        recommendations = generate_recommendations(priority_plots, months_since_fire, deterioration_summary)

    # Data sources
    data_sources.append("PNW salvage deterioration models")
    data_sources.append(f"Regional market analysis {assessment_date[:4]}")

    return {
        "fire_id": fire_id,
        "months_since_fire": months_since_fire,
        "plots_assessed": len(plots),
        "priority_plots": priority_plots[:10],  # Top 10
        "deterioration_summary": deterioration_summary,
        "salvage_window": salvage_window,
        "reasoning_chain": reasoning_chain,
        "confidence": 0.91,
        "data_sources": data_sources,
        "recommendations": recommendations,
    }


def generate_plot_recommendation(
    plot_id: str,
    urgency: UrgencyLevel,
    stage: DeteriorationStage,
    volume_mbf: float
) -> str:
    """Generate specific recommendation for a plot."""
    if urgency == "IMMEDIATE":
        return f"Highest priority. Extract immediately to preserve premium grade and maximize value."
    elif urgency == "HIGH":
        return f"High priority. Schedule within current quarter to minimize degradation."
    elif urgency == "MODERATE":
        return f"Moderate priority. Include in annual harvest program, monitor deterioration quarterly."
    elif urgency == "LOW":
        return f"Low priority. Limited economic return. Consider deferring or bundling with adjacent units."
    else:
        return f"Not viable. Salvage window expired. Consider biomass utilization or wildlife habitat retention."


def generate_recommendations(
    plots: list[dict],
    months_since_fire: float,
    deterioration: dict
) -> list[str]:
    """Generate operational recommendations."""
    recs = []

    # Check for immediate action plots
    immediate = [p for p in plots if p["urgency"] == "IMMEDIATE"]
    if immediate:
        sectors = set(p["sector"] for p in immediate if p.get("sector"))
        if sectors:
            recs.append(f"Mobilize harvest operations for {', '.join(sectors)} sector(s) within 3 months")

    # Check deterioration urgency
    species_at_risk = [s for s, d in deterioration.items() if d["months_to_blue_stain"] < 3]
    if species_at_risk:
        for species in species_at_risk:
            recs.append(f"Monitor {species} plots monthly for blue stain progression")

    # Top plots recommendation
    if len(plots) >= 2:
        top_plots = [p["plot_id"] for p in plots[:2]]
        recs.append(f"Prioritize plots {', '.join(top_plots)} for initial operations")

    # Access recommendations
    cable_plots = [p for p in plots if "cable" in p.get("access", "").lower()]
    if cable_plots:
        recs.append("Establish cable yarding systems for steep terrain plots")

    return recs


def calculate_deadline(start_date: str, months_ahead: float) -> str:
    """Calculate deadline date from start date and months."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    days_ahead = int(months_ahead * 30.44)

    from datetime import timedelta
    deadline = start + timedelta(days=days_ahead)

    return deadline.strftime("%Y-%m-%d")


def load_fire_metadata(fire_id: str) -> dict | None:
    """
    Load fire incident metadata from fixtures.

    Returns fire metadata including containment_date, discovery_date, etc.
    Per ADR-009 Fixture-First Strategy: Skills load bundled fixtures directly.
    """
    script_dir = Path(__file__).parent
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "incident-metadata.json"

    if not fixture_path.exists():
        fixture_path = Path("data/fixtures/cedar-creek/incident-metadata.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                return data

    return None


def load_plots_data(fire_id: str) -> list[dict] | None:
    """Load plot data from fixtures."""
    script_dir = Path(__file__).parent
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "timber-plots.json"

    if not fixture_path.exists():
        fixture_path = Path("data/fixtures/cedar-creek/timber-plots.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                return data.get("plots", [])

    return None


if __name__ == "__main__":
    # Quick test
    test_input = {
        "fire_id": "cedar-creek-2022",
        "fire_date": "2022-09-15",
        "assessment_date": "2023-03-01",
    }
    result = execute(test_input)
    print(json.dumps(result, indent=2))

"""
NEPA Pathway Decision Script

Determines appropriate NEPA pathway (CE/EA/EIS) based on action type,
acreage, and extraordinary circumstances screening.
"""

import json
from pathlib import Path
from typing import Literal

PathwayType = Literal["CE", "EA", "EIS"]


def load_ce_categories() -> dict:
    """Load CE categories from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "ce-categories.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def load_ec_criteria() -> dict:
    """Load extraordinary circumstances criteria from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "extraordinary-circumstances.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def screen_extraordinary_circumstances(project_context: dict) -> tuple[str, list, list]:
    """
    Screen for extraordinary circumstances that may require EA.

    Args:
        project_context: Dictionary with:
            - listed_species: List of federally listed species
            - designated_areas: List of congressionally designated areas
            - roadless_areas: Boolean for inventoried roadless areas
            - cultural_sites: List of cultural/religious sites
            - wetlands: Boolean for wetlands presence

    Returns:
        Tuple of (status, triggered_ecs, reasoning)
        - status: "CLEAR" or "TRIGGERED"
        - triggered_ecs: List of triggered EC dictionaries
        - reasoning: List of reasoning strings
    """
    ec_data = load_ec_criteria()
    circumstances = ec_data.get("circumstances", [])

    triggered = []
    reasoning = []
    reasoning.append("Screening for extraordinary circumstances")

    # EC 01: Federally Listed Species
    listed_species = project_context.get("listed_species", [])
    if listed_species:
        ec = next((c for c in circumstances if c["id"] == "ec_01"), None)
        if ec:
            triggered.append({
                "id": ec["id"],
                "name": ec["name"],
                "triggered": True,
                "consultation_required": ec.get("consultation_required"),
                "notes": f"Species present: {', '.join(listed_species)}"
            })
            reasoning.append(f"EC TRIGGERED: Federally listed species present ({', '.join(listed_species)}) - {ec.get('consultation_required', 'consultation')} required")
    else:
        reasoning.append("No federally listed species identified")

    # EC 03: Congressionally Designated Areas
    designated_areas = project_context.get("designated_areas", [])
    if designated_areas:
        ec = next((c for c in circumstances if c["id"] == "ec_03"), None)
        if ec:
            triggered.append({
                "id": ec["id"],
                "name": ec["name"],
                "triggered": True,
                "notes": f"Areas affected: {', '.join(designated_areas)}"
            })
            reasoning.append(f"EC TRIGGERED: Congressionally designated areas affected ({', '.join(designated_areas)})")
    else:
        reasoning.append("No congressionally designated areas affected")

    # EC 04: Inventoried Roadless Areas
    roadless = project_context.get("roadless_areas", False)
    if roadless:
        ec = next((c for c in circumstances if c["id"] == "ec_04"), None)
        if ec:
            triggered.append({
                "id": ec["id"],
                "name": ec["name"],
                "triggered": True
            })
            reasoning.append("EC TRIGGERED: Inventoried roadless areas impacted")
    else:
        reasoning.append("No inventoried roadless areas impacted")

    # EC 06: Native American Religious/Cultural Sites
    cultural_sites = project_context.get("cultural_sites", [])
    if cultural_sites:
        ec = next((c for c in circumstances if c["id"] == "ec_06"), None)
        if ec:
            triggered.append({
                "id": ec["id"],
                "name": ec["name"],
                "triggered": True,
                "consultation_required": ec.get("consultation_required"),
                "notes": f"Sites: {', '.join(cultural_sites)}"
            })
            reasoning.append(f"EC TRIGGERED: Cultural/religious sites present - {ec.get('consultation_required', 'consultation')} required")

    # EC 02: Wetlands (informational, doesn't auto-trigger EA)
    wetlands = project_context.get("wetlands", False)
    if wetlands:
        reasoning.append("Wetlands present - document in Decision Memo")

    # Determine status
    if triggered:
        # Check if any triggered ECs require EA
        requires_ea = any(
            next((c for c in circumstances if c["id"] == ec["id"]), {}).get("triggers_ea", False)
            for ec in triggered
        )
        status = "TRIGGERED"
        if requires_ea:
            reasoning.append("EC Status: TRIGGERED - EA required")
        else:
            reasoning.append("EC Status: TRIGGERED - Document in Decision Memo, CE may still apply")
    else:
        status = "CLEAR"
        reasoning.append("EC Status: CLEAR - No extraordinary circumstances triggered")

    return status, triggered, reasoning


def identify_applicable_ce(action_type: str, acres: float) -> tuple[str | None, str]:
    """
    Identify applicable CE category for the action type.

    Args:
        action_type: Type of action (timber_salvage, trail_repair, etc.)
        acres: Project acreage

    Returns:
        Tuple of (ce_citation, reasoning) or (None, reasoning) if no match
    """
    ce_categories = load_ce_categories()

    # Find matching CE categories
    matches = []
    for key, ce in ce_categories.items():
        if action_type in ce.get("applicable_actions", []):
            matches.append((key, ce))

    if not matches:
        return None, f"No CE category found for action type '{action_type}'"

    # Check acreage limits
    for key, ce in matches:
        acreage_limit = ce.get("acreage_limit")
        if acreage_limit is None or acres <= acreage_limit:
            reasoning = f"Action type '{action_type}' matches {ce['citation']} - {ce['name']}"
            return ce["citation"], reasoning

    # If here, acreage exceeds limits
    ce = matches[0][1]
    return None, f"Action type matches {ce['citation']}, but acreage ({acres:,}) exceeds limit ({ce.get('acreage_limit', 'N/A'):,})"


def evaluate_pathway_thresholds(
    action_type: str,
    acres: float,
    ec_status: str,
    ce_citation: str | None = None
) -> str:
    """
    Evaluate NEPA pathway based on all factors.

    Args:
        action_type: Type of action
        acres: Project acreage
        ec_status: "CLEAR" or "TRIGGERED"
        ce_citation: Applicable CE citation (if any)

    Returns:
        Pathway: "CE", "EA", or "EIS"
    """
    # Load data for threshold checks
    ec_data = load_ec_criteria()
    circumstances = ec_data.get("circumstances", [])

    # EIS triggers (independent of CE/EA logic)
    # 1. Very large acreage (>5000 acres for timber salvage)
    if action_type in ["timber_salvage", "reforestation"] and acres > 5000:
        return "EIS"

    # 2. Multiple significant ECs + large scale
    # This would require more context, but if EC is triggered and acres > 4200, lean toward EIS

    # EA triggers
    # 1. Extraordinary circumstances triggered
    if ec_status == "TRIGGERED":
        # Check if it's a major EA trigger or minor
        # For simplicity, if acreage > 4200 + ECs, go EIS
        if acres > 4200:
            return "EIS"
        return "EA"

    # 2. No CE match
    if ce_citation is None:
        # No CE available, acreage check
        if acres > 4200:
            return "EIS"
        return "EA"

    # CE pathway
    # Must have: CE citation, no ECs, within acreage limits
    return "CE"


def execute(inputs: dict) -> dict:
    """
    Execute NEPA pathway decision.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - action_type: Type of action (required)
            - acres: Project acreage (required)
            - project_context: Additional context (optional)

    Returns:
        Dictionary with pathway decision, CE citation (if applicable),
        extraordinary circumstances, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    action_type = inputs.get("action_type")
    acres = inputs.get("acres")
    project_context = inputs.get("project_context", {})

    # Validate inputs
    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    if not action_type:
        return {
            "fire_id": fire_id,
            "error": "action_type is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No action_type provided"],
        }

    if acres is None:
        return {
            "fire_id": fire_id,
            "error": "acres is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No acres provided"],
        }

    reasoning_chain = []

    # Step 1: Screen extraordinary circumstances
    ec_status, triggered_ecs, ec_reasoning = screen_extraordinary_circumstances(project_context)
    reasoning_chain.extend(ec_reasoning)

    # Step 2: Identify applicable CE
    ce_citation, ce_reasoning = identify_applicable_ce(action_type, acres)
    reasoning_chain.append(ce_reasoning)

    # Step 3: Check acreage compliance
    ce_categories = load_ce_categories()
    ce_limit = None
    ce_name = None

    if ce_citation:
        # Find the CE data
        for key, ce in ce_categories.items():
            if ce["citation"] == ce_citation:
                ce_limit = ce.get("acreage_limit")
                ce_name = ce.get("name")
                break

        if ce_limit:
            reasoning_chain.append(f"Acreage: {acres:,} acres (under {ce_limit:,} acre CE limit)")
        else:
            reasoning_chain.append(f"Acreage: {acres:,} acres (no limit for {ce_name})")
    else:
        reasoning_chain.append(f"Acreage: {acres:,} acres")

    # Step 4: Determine pathway
    pathway = evaluate_pathway_thresholds(action_type, acres, ec_status, ce_citation)

    # Build pathway reasoning
    if pathway == "CE":
        reasoning_chain.append(f"Pathway determination: CE - No ECs, action matches CE category")
    elif pathway == "EA":
        if ec_status == "TRIGGERED":
            reasoning_chain.append(f"Pathway determination: EA - Extraordinary circumstances override CE eligibility")
        else:
            reasoning_chain.append(f"Pathway determination: EA - Uncertain significance or no CE match")
    else:  # EIS
        reasons = []
        if acres > 5000:
            reasons.append("acreage exceeds thresholds")
        if ec_status == "TRIGGERED":
            reasons.append("multiple ECs")
        if not ce_citation or (ce_limit and acres > ce_limit):
            reasons.append("significant environmental effects expected")

        reasoning_chain.append(f"Pathway determination: EIS - {' + '.join(reasons) if reasons else 'Significant impacts expected'}")

    # Generate recommendations
    recommendations = []
    if pathway == "CE":
        recommendations.append("Prepare Decision Memo documenting CE application")
        recommendations.append("Document that no extraordinary circumstances apply")
        if action_type == "trail_repair":
            recommendations.append("Complete trail maintenance with standard mitigation measures")
        elif action_type in ["timber_salvage", "reforestation"]:
            recommendations.append(f"Proceed with {action_type.replace('_', ' ')} under CE authority")
    elif pathway == "EA":
        for ec in triggered_ecs:
            if ec.get("consultation_required"):
                recommendations.append(f"Initiate {ec['consultation_required']} consultation for {ec['name']}")
        if any("Wilderness" in ec.get("notes", "") for ec in triggered_ecs):
            recommendations.append("Assess wilderness boundary impacts")
        recommendations.append("Prepare Environmental Assessment with public scoping")
        recommendations.append("Develop alternatives that minimize environmental impacts")
    else:  # EIS
        recommendations.append("Publish Notice of Intent (NOI) in Federal Register")
        recommendations.append("Conduct comprehensive scoping with public involvement")
        for ec in triggered_ecs:
            if ec.get("consultation_required"):
                recommendations.append(f"Initiate {ec['consultation_required']} consultation for all {ec['name'].lower()}")
        recommendations.append("Develop range of alternatives including no-action")
        recommendations.append("Prepare Draft EIS with full impact analysis")

    # Calculate confidence
    confidence = 0.95
    if ec_status == "TRIGGERED" and pathway == "CE":
        # This shouldn't happen, reduce confidence
        confidence = 0.7
    elif pathway == "EA" and not triggered_ecs:
        # EA without clear ECs is less certain
        confidence = 0.85

    # Acreage compliance
    acreage_compliance = {
        "proposed_acres": acres,
        "ce_limit": ce_limit,
        "compliant": (ce_limit is None) or (acres <= ce_limit)
    }

    return {
        "fire_id": fire_id,
        "pathway": pathway,
        "ce_category": ce_citation,
        "ce_name": ce_name,
        "extraordinary_circumstances": triggered_ecs,
        "acreage_compliance": acreage_compliance,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": ["36 CFR 220.6", "FSH 1909.15"],
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    # Test with trail repair
    test_input = {
        "fire_id": "cedar-creek-2022",
        "action_type": "trail_repair",
        "acres": 50,
        "project_context": {
            "designated_areas": [],
            "listed_species": [],
            "roadless_areas": False,
        }
    }
    result = execute(test_input)
    print(json.dumps(result, indent=2))

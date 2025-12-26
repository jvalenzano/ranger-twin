"""
Documentation Checklist Generation Script

Generates comprehensive documentation checklists based on NEPA pathway,
including specialist reports and consultation requirements.
"""

import json
from pathlib import Path
from typing import Literal

PathwayType = Literal["CE", "EA", "EIS"]


def load_documentation_requirements() -> dict:
    """Load documentation requirements from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "documentation-requirements.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def load_templates() -> dict:
    """Load template information from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "templates.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def load_specialist_reports() -> dict:
    """Load specialist report requirements from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "specialist-reports.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def get_documentation_requirements(pathway: str) -> list:
    """
    Get required documentation for a NEPA pathway.

    Args:
        pathway: NEPA pathway (CE, EA, EIS)

    Returns:
        List of required documents with descriptions
    """
    doc_reqs = load_documentation_requirements()
    pathway_data = doc_reqs.get(pathway, {})
    return pathway_data.get("required_documents", [])


def identify_specialist_reports(action_type: str, project_context: dict) -> list:
    """
    Identify required specialist reports based on action type and context.

    Args:
        action_type: Type of action (timber_salvage, trail_repair, etc.)
        project_context: Dictionary with:
            - listed_species: List of federally listed species
            - designated_areas: List of designated areas
            - cultural_sites: List of cultural sites
            - streams: Boolean for stream presence

    Returns:
        List of specialist report requirements
    """
    specialist_data = load_specialist_reports()
    disciplines = specialist_data.get("disciplines", {})
    action_mapping = specialist_data.get("action_type_mapping", {})

    # Get base disciplines for this action type
    required_disciplines = action_mapping.get(action_type, [])

    reports = []
    reasoning = []

    # Add reports for each required discipline
    for discipline_key in required_disciplines:
        discipline = disciplines.get(discipline_key, {})
        discipline_name = discipline.get("discipline")
        discipline_reports = discipline.get("reports", [])

        if discipline_reports:
            # Take the first (primary) report for this discipline
            report = discipline_reports[0]
            reports.append({
                "discipline": discipline_name,
                "report_type": report["report_type"],
                "required": True,
                "rationale": f"{action_type.replace('_', ' ').title()} action requires {discipline_name.lower()} assessment"
            })
            reasoning.append(f"Action type '{action_type}' - {discipline_name} specialist report required")

    # Add context-driven reports
    # Wildlife Biology for listed species
    listed_species = project_context.get("listed_species", [])
    if listed_species:
        # Check if we already have wildlife biology
        if not any(r["discipline"] == "Wildlife Biology" for r in reports):
            reports.append({
                "discipline": "Wildlife Biology",
                "report_type": "Biological Assessment",
                "required": True,
                "rationale": f"{', '.join(listed_species)} present - ESA Section 7 consultation required"
            })
            reasoning.append(f"{', '.join(listed_species)} present - Wildlife Biology BA required + ESA Section 7 consultation")
        else:
            # Update existing wildlife report to BA
            for r in reports:
                if r["discipline"] == "Wildlife Biology":
                    r["report_type"] = "Biological Assessment"
                    r["rationale"] = f"{', '.join(listed_species)} present - ESA Section 7 consultation required"
            reasoning.append(f"{', '.join(listed_species)} present - Wildlife Biology BA required + ESA Section 7 consultation")

    # Fisheries for aquatic species
    aquatic_species = [s for s in listed_species if "Trout" in s or "Salmon" in s or "Steelhead" in s]
    if aquatic_species:
        if not any(r["discipline"] == "Fisheries Biology" for r in reports):
            reports.append({
                "discipline": "Fisheries Biology",
                "report_type": "Aquatic Effects Analysis",
                "required": True,
                "rationale": f"{', '.join(aquatic_species)} present - analyze impacts to aquatic habitat"
            })

    # Archaeology for cultural sites
    cultural_sites = project_context.get("cultural_sites", [])
    if cultural_sites:
        if not any(r["discipline"] == "Archaeology" for r in reports):
            reports.append({
                "discipline": "Archaeology",
                "report_type": "Cultural Resources Survey",
                "required": True,
                "rationale": f"Cultural sites present - NHPA Section 106 compliance required"
            })

    # Recreation for wilderness areas
    designated_areas = project_context.get("designated_areas", [])
    wilderness_areas = [a for a in designated_areas if "Wilderness" in a]
    if wilderness_areas:
        if not any(r["discipline"] == "Recreation" for r in reports):
            reports.append({
                "discipline": "Recreation",
                "report_type": "Wilderness Boundary Analysis",
                "required": True,
                "rationale": f"Proximity to {', '.join(wilderness_areas)} requires special analysis"
            })
            reasoning.append(f"Wilderness proximity - Recreation specialist analysis required")

    # Hydrology for watershed concerns
    if action_type in ["timber_salvage", "road_construction"] and not any(r["discipline"] == "Hydrology" for r in reports):
        reports.append({
            "discipline": "Hydrology",
            "report_type": "Watershed Effects Analysis",
            "required": True,
            "rationale": f"{action_type.replace('_', ' ').title()} can affect watershed function"
        })

    return reports


def identify_consultations(project_context: dict) -> list:
    """
    Identify required agency consultations.

    Args:
        project_context: Project context with species, sites, etc.

    Returns:
        List of consultation requirements
    """
    consultations = []

    listed_species = project_context.get("listed_species", [])
    cultural_sites = project_context.get("cultural_sites", [])

    # ESA Section 7 consultations
    terrestrial_species = [s for s in listed_species if "Trout" not in s and "Salmon" not in s and "Steelhead" not in s]
    aquatic_species = [s for s in listed_species if "Trout" in s or "Salmon" in s or "Steelhead" in s]

    if terrestrial_species:
        consultations.append({
            "agency": "U.S. Fish and Wildlife Service",
            "consultation_type": "ESA Section 7 Formal Consultation",
            "trigger": f"{', '.join(terrestrial_species)} presence",
            "documents_needed": ["Biological Assessment", "Species occurrence data"]
        })

    if aquatic_species:
        consultations.append({
            "agency": "NOAA Fisheries",
            "consultation_type": "ESA Section 7 Formal Consultation",
            "trigger": f"{', '.join(aquatic_species)} presence",
            "documents_needed": ["Biological Assessment", "Aquatic effects analysis"]
        })

    # NHPA Section 106
    if cultural_sites:
        consultations.append({
            "agency": "State Historic Preservation Office",
            "consultation_type": "NHPA Section 106 Consultation",
            "trigger": "Cultural/historic sites present",
            "documents_needed": ["Cultural resources survey", "Site evaluation forms"]
        })

    return consultations


def select_template(pathway: str) -> tuple[str, str]:
    """
    Select appropriate template for NEPA pathway.

    Args:
        pathway: NEPA pathway (CE, EA, EIS)

    Returns:
        Tuple of (template_name, template_reference)
    """
    templates = load_templates()
    pathway_template = templates.get(pathway, {})

    template_name = pathway_template.get("template_name", f"{pathway} Template")
    reference = pathway_template.get("reference", "FSH 1909.15")

    return template_name, reference


def execute(inputs: dict) -> dict:
    """
    Execute documentation checklist generation.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - pathway: NEPA pathway (required)
            - action_type: Type of action (required)
            - project_context: Additional context (optional)

    Returns:
        Dictionary with checklist, specialist reports, consultations,
        template selection, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    pathway = inputs.get("pathway")
    action_type = inputs.get("action_type")
    project_context = inputs.get("project_context", {})

    # Validate inputs
    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    if not pathway:
        return {
            "fire_id": fire_id,
            "error": "pathway is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No pathway provided"],
        }

    if pathway not in ["CE", "EA", "EIS"]:
        return {
            "fire_id": fire_id,
            "error": f"Invalid pathway: {pathway}. Must be CE, EA, or EIS",
            "confidence": 0.0,
            "reasoning_chain": [f"ERROR: Invalid pathway '{pathway}'"],
        }

    if not action_type:
        return {
            "fire_id": fire_id,
            "error": "action_type is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No action_type provided"],
        }

    reasoning_chain = []
    reasoning_chain.append(f"NEPA pathway: {pathway}")

    # Step 1: Get base documentation requirements
    doc_reqs_data = load_documentation_requirements()
    pathway_name = doc_reqs_data.get(pathway, {}).get("pathway", pathway)
    reasoning_chain.append(f"Loading documentation requirements for {pathway_name}")

    documentation_checklist = get_documentation_requirements(pathway)

    # Build summary of required docs
    required_docs = [d["document"] for d in documentation_checklist if d.get("required", True)]
    reasoning_chain.append(f"{pathway} requires: {', '.join(required_docs)}")

    # Step 2: Identify specialist reports
    specialist_reports = identify_specialist_reports(action_type, project_context)

    # Add specialist report reasoning
    for report in specialist_reports:
        if report.get("required"):
            reasoning_chain.append(f"{report['discipline']} - {report['report_type']} required")

    # Step 3: Identify consultations
    consultation_requirements = identify_consultations(project_context)

    # Add consultation reasoning
    listed_species = project_context.get("listed_species", [])
    cultural_sites = project_context.get("cultural_sites", [])

    if listed_species:
        reasoning_chain.append(f"Listed species present - ESA consultations required")
    if cultural_sites:
        reasoning_chain.append(f"Cultural sites present - NHPA Section 106 consultation required")

    if not listed_species and not cultural_sites:
        reasoning_chain.append("No listed species or cultural sites - no consultation requirements")

    # Step 4: Select template
    template_name, template_reference = select_template(pathway)
    reasoning_chain.append(f"Template selected: {template_name} ({template_reference})")

    # Generate recommendations
    recommendations = []

    if pathway == "CE":
        recommendations.append(f"Start with Decision Memo template from FSH 1909.15 Chapter 70")
        recommendations.append("Complete EC screening worksheet for all eight circumstances")
        if specialist_reports:
            recommendations.append(f"Obtain {specialist_reports[0]['discipline'].lower()} assessment for {action_type.replace('_', ' ')} scope")
        recommendations.append("Compile project file with maps showing work areas")
    elif pathway == "EA":
        recommendations.append(f"Use EA template from FSH 1909.15 Chapter 40")
        for consult in consultation_requirements:
            if "ESA" in consult["consultation_type"]:
                recommendations.append(f"Initiate {consult['consultation_type']} with {consult['agency']} early in process")
        recommendations.append("Develop 2-3 action alternatives plus no-action alternative")
        recommendations.append("Conduct public scoping with 30-day comment period")
        recommendations.append("Coordinate with interdisciplinary team for specialist reports")
    else:  # EIS
        recommendations.append("Publish NOI in Federal Register to initiate EIS process")
        recommendations.append(f"Use EIS template from FSH 1909.15 Chapter 50 and 40 CFR 1502")
        recommendations.append("Conduct comprehensive scoping with minimum 45-day comment period")
        if consultation_requirements:
            agencies = list(set([c["agency"] for c in consultation_requirements]))
            if len(agencies) > 1:
                recommendations.append(f"Initiate ESA consultations with both {' and '.join(agencies)} early")
            else:
                recommendations.append(f"Initiate ESA consultation with {agencies[0]} early")
        recommendations.append("Develop robust alternatives analysis with minimum 4-5 alternatives")
        recommendations.append("Allow 18-24 months for full EIS process completion")

    # Calculate confidence
    confidence = 0.95
    if not specialist_reports:
        confidence = 0.85  # Lower if we couldn't identify specialist reports

    return {
        "fire_id": fire_id,
        "pathway": pathway,
        "template_name": template_name,
        "template_reference": template_reference,
        "documentation_checklist": documentation_checklist,
        "specialist_reports": specialist_reports,
        "consultation_requirements": consultation_requirements,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": ["FSH 1909.15", "40 CFR 1500-1508", "36 CFR 220.6"],
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    # Test with CE pathway
    test_input = {
        "fire_id": "cedar-creek-2022",
        "pathway": "CE",
        "action_type": "trail_repair",
        "project_context": {
            "listed_species": [],
            "cultural_sites": []
        }
    }
    result = execute(test_input)
    print(json.dumps(result, indent=2))

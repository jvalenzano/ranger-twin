"""
Compliance Timeline Estimation Script

Estimates compliance timelines for NEPA pathways including comment periods,
consultations, and key milestones.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Literal

PathwayType = Literal["CE", "EA", "EIS"]


def load_timelines() -> dict:
    """Load timeline data from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "timelines.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def load_consultation_requirements() -> dict:
    """Load consultation duration data from resources."""
    script_dir = Path(__file__).parent
    resource_path = script_dir.parent / "resources" / "consultation-requirements.json"

    if resource_path.exists():
        with open(resource_path) as f:
            return json.load(f)
    return {}


def calculate_comment_periods(pathway: str) -> list:
    """
    Get required comment periods for a NEPA pathway.

    Args:
        pathway: NEPA pathway (CE, EA, EIS)

    Returns:
        List of comment period dictionaries
    """
    timelines = load_timelines()
    pathway_data = timelines.get(pathway, {})
    return pathway_data.get("comment_periods", [])


def estimate_consultation_duration(consultation_type: str) -> dict:
    """
    Estimate duration for a consultation type.

    Args:
        consultation_type: Type of consultation (e.g., "ESA Section 7 Formal")

    Returns:
        Dictionary with duration estimate and phases
    """
    consult_data = load_consultation_requirements()

    # Try to match consultation type
    for key, value in consult_data.items():
        if consultation_type in key or key in consultation_type:
            return {
                "consultation_type": value["consultation_type"],
                "duration_days": value["typical_duration_days"],
                "phases": value.get("phases", []),
                "regulation": value.get("regulation"),
            }

    # Default estimate if no match
    return {
        "consultation_type": consultation_type,
        "duration_days": 90,
        "phases": [{"phase": "Consultation", "days": 90}],
        "regulation": "Unknown"
    }


def parse_date(date_str: str) -> datetime:
    """Parse ISO date string to datetime."""
    try:
        return datetime.fromisoformat(date_str)
    except (ValueError, AttributeError):
        return datetime.now()


def format_date(dt: datetime) -> str:
    """Format datetime to ISO date string."""
    return dt.strftime("%Y-%m-%d")


def build_milestone_schedule(
    pathway: str,
    consultations: list,
    start_date: str | None = None
) -> tuple[list, int, list]:
    """
    Build milestone schedule with dates.

    Args:
        pathway: NEPA pathway
        consultations: List of consultation requirements
        start_date: ISO date string for project start

    Returns:
        Tuple of (milestones, total_days, critical_path)
    """
    timelines = load_timelines()
    pathway_data = timelines.get(pathway, {})

    # Parse start date
    start = parse_date(start_date) if start_date else datetime.now()

    # Get base milestones
    base_milestones = pathway_data.get("milestones", [])
    base_duration = pathway_data.get("base_duration_days", 30)

    milestones = []
    for ms in base_milestones:
        milestone_date = start + timedelta(days=ms["day_offset"])
        milestones.append({
            "milestone": ms["name"],
            "date": format_date(milestone_date),
            "duration_days": ms.get("duration", 0),
            "description": ms.get("description", "")
        })

    # Add consultation milestones if present
    consult_days = 0
    for consult in consultations:
        consult_type = consult.get("type", consult.get("consultation_type", ""))
        agency = consult.get("agency", "Agency")

        duration_data = estimate_consultation_duration(consult_type)
        duration = duration_data["duration_days"]

        if duration > consult_days:
            consult_days = duration

        # Add consultation milestone
        consult_start = start + timedelta(days=45)  # Usually start after scoping
        consult_end = consult_start + timedelta(days=duration)

        milestones.append({
            "milestone": f"{consult_type} Complete ({agency})",
            "date": format_date(consult_end),
            "duration_days": duration,
            "description": f"{consult_type} with {agency}"
        })

    # Adjust total duration if consultations extend timeline
    total_days = max(base_duration, consult_days + 45)  # Consults + initial prep

    # Identify critical path
    critical_path = []
    if pathway == "CE":
        critical_path = [
            "Specialist input availability",
            "Decision Memo review and signature"
        ]
    elif pathway == "EA":
        critical_path = ["Public comment periods (60 days total)"]
        if consultations:
            critical_path.insert(0, f"Consultations ({consult_days} days)")
    else:  # EIS
        critical_path = [
            "Draft EIS preparation (255 days)",
            "Public comment periods (120 days total)",
            "Final EIS preparation (175 days)"
        ]
        if consultations:
            critical_path.insert(0, f"Consultations ({consult_days} days)")

    # Sort milestones by date
    milestones.sort(key=lambda x: x["date"])

    return milestones, total_days, critical_path


def execute(inputs: dict) -> dict:
    """
    Execute compliance timeline estimation.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - pathway: NEPA pathway (required)
            - consultations: List of consultation requirements (optional)
            - start_date: ISO date string (optional, defaults to today)

    Returns:
        Dictionary with timeline estimate, milestones, comment periods,
        consultation timelines, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    pathway = inputs.get("pathway")
    consultations = inputs.get("consultations", [])
    start_date = inputs.get("start_date")

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
            "error": f"Invalid pathway: {pathway}",
            "confidence": 0.0,
            "reasoning_chain": [f"ERROR: Invalid pathway '{pathway}'"],
        }

    reasoning_chain = []
    reasoning_chain.append(f"NEPA pathway: {pathway}")

    # Load timeline data
    timelines = load_timelines()
    pathway_data = timelines.get(pathway, {})
    base_duration = pathway_data.get("base_duration_days", 30)
    base_months = pathway_data.get("base_duration_months", 1)

    # Adjust duration based on consultations
    total_consult_days = 0
    consultation_timelines = []

    for consult in consultations:
        consult_type = consult.get("type", consult.get("consultation_type", ""))
        agency = consult.get("agency", "Unknown Agency")

        duration_data = estimate_consultation_duration(consult_type)
        duration = duration_data["duration_days"]

        consultation_timelines.append({
            "consultation_type": consult_type,
            "agency": agency,
            "duration_days": duration,
            "phases": duration_data.get("phases", [])
        })

        if duration > total_consult_days:
            total_consult_days = duration

        reasoning_chain.append(f"{consult_type}: {duration} days")

    # Calculate comment periods
    comment_periods = calculate_comment_periods(pathway)
    total_comment_days = sum(cp["duration_days"] for cp in comment_periods)

    if comment_periods:
        comment_summary = ", ".join([f"{cp['period']} ({cp['duration_days']} days)" for cp in comment_periods])
        reasoning_chain.append(f"Comment periods: {comment_summary}")

    # Build milestone schedule
    milestones, adjusted_duration, critical_path = build_milestone_schedule(
        pathway, consultations, start_date
    )

    # Use adjusted duration if consultations extend timeline
    if total_consult_days > 0 and pathway in ["EA", "EIS"]:
        # Consultations can extend timeline
        if pathway == "EA":
            adjusted_duration = max(base_duration, total_consult_days + 75)  # Consults + EA prep/comment
        else:  # EIS
            adjusted_duration = max(base_duration, total_consult_days + 300)  # Consults + EIS process

    total_duration_days = adjusted_duration
    total_duration_months = round(total_duration_days / 30, 1)

    # Add duration reasoning
    if consultations:
        reasoning_chain.append(f"Base {pathway} duration adjusted for consultations: {total_duration_days} days ({total_duration_months} months)")
    else:
        reasoning_chain.append(f"Base {pathway} duration: {total_duration_days} days ({total_duration_months} months)")

    reasoning_chain.append(f"Total duration: {total_duration_days} days ({total_duration_months} months)")

    # Generate recommendations
    recommendations = []

    if pathway == "CE":
        recommendations.append("Expedite specialist input to maintain 3-week timeline")
        recommendations.append("Pre-coordinate with decision maker for quick signature")
        recommendations.append("Complete EC screening early to avoid delays")
    elif pathway == "EA":
        if consultations:
            recommendations.append("Initiate consultations immediately - they are on critical path")
        recommendations.append("Begin specialist reports during scoping to save time")
        recommendations.append("Coordinate early with consulting agencies")
        if total_consult_days > 120:
            recommendations.append("Consider requesting consultation extensions if needed")
    else:  # EIS
        recommendations.append("Initiate all consultations immediately after scoping")
        if len(consultations) > 1:
            recommendations.append("Run consultations in parallel to save time")
        recommendations.append(f"Allow {total_duration_months}+ months for full EIS process")
        recommendations.append("Build in contingency time for consultation delays")
        recommendations.append("Coordinate early and often with all consulting agencies")

    # Calculate confidence
    confidence = 0.85
    if consultations:
        confidence = 0.80  # Consultations add uncertainty
    if len(consultations) > 2:
        confidence = 0.75  # Multiple consultations = more uncertainty

    return {
        "fire_id": fire_id,
        "pathway": pathway,
        "total_duration_days": total_duration_days,
        "total_duration_months": total_duration_months,
        "comment_periods": comment_periods,
        "consultation_timelines": consultation_timelines,
        "milestones": milestones,
        "critical_path": critical_path,
        "reasoning_chain": reasoning_chain,
        "confidence": confidence,
        "data_sources": ["FSH 1909.15", "40 CFR 1500-1508"],
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    # Test with EA pathway
    test_input = {
        "fire_id": "cedar-creek-2022",
        "pathway": "EA",
        "consultations": [
            {"type": "ESA Section 7 Formal", "agency": "USFWS"}
        ],
        "start_date": "2024-01-15"
    }
    result = execute(test_input)
    print(json.dumps(result, indent=2))

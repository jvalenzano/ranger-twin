"""
Soil Burn Severity Assessment Script

Implements dNBR-based severity classification for fire sectors.
Uses MTBS thresholds per Key & Benson (2006) landscape assessment.
"""

import json
import sys
from pathlib import Path
from typing import Literal, TypedDict

# Add shared utilities to path
_shared_path = Path(__file__).parent.parent.parent.parent.parent / "shared"
if str(_shared_path) not in sys.path:
    sys.path.insert(0, str(_shared_path))

try:
    from fire_utils import normalize_fire_id
except ImportError:
    # Fallback if shared module not available
    def normalize_fire_id(fire_id: str) -> str:
        if fire_id and fire_id.lower() in ["cedar-creek", "cedar_creek", "cc-2022"]:
            return "cedar-creek-2022"
        return fire_id


# dNBR classification thresholds
# Based on Key & Benson (2006) Landscape Assessment
DNBR_THRESHOLDS = {
    "UNBURNED": (None, 0.1),      # dNBR < 0.1
    "LOW": (0.1, 0.27),            # 0.1 <= dNBR < 0.27
    "MODERATE": (0.27, 0.66),      # 0.27 <= dNBR < 0.66
    "HIGH": (0.66, None),          # dNBR >= 0.66
}

SEVERITY_CLASS = {
    "UNBURNED": 1,
    "LOW": 2,
    "MODERATE": 3,
    "HIGH": 4,
}

SeverityLevel = Literal["UNBURNED", "LOW", "MODERATE", "HIGH"]


class SectorAssessment(TypedDict, total=False):
    """Assessment result for a single sector."""
    id: str
    name: str
    severity: SeverityLevel
    severity_class: int
    dnbr_mean: float
    acres: int | float
    hectares: int | float
    slope_avg: int | float
    erosion_risk: str
    reasoning: str
    concern: str


class SeverityBreakdown(TypedDict):
    """Acreage breakdown by severity class."""
    acres: float
    percentage: float
    sector_count: int


def classify_severity(dnbr: float) -> tuple[SeverityLevel, int, str]:
    """
    Classify burn severity based on dNBR value.

    Args:
        dnbr: Mean dNBR value for the sector

    Returns:
        Tuple of (severity_label, severity_class, reasoning)
    """
    if dnbr < 0.1:
        return "UNBURNED", 1, f"dNBR {dnbr} < 0.1 -> UNBURNED"
    elif dnbr < 0.27:
        return "LOW", 2, f"dNBR {dnbr} in [0.1, 0.27) -> LOW severity"
    elif dnbr < 0.66:
        return "MODERATE", 3, f"dNBR {dnbr} in [0.27, 0.66) -> MODERATE severity"
    else:
        return "HIGH", 4, f"dNBR {dnbr} >= 0.66 -> HIGH severity"


def assess_erosion_risk(severity: SeverityLevel, slope_avg: float | None) -> str:
    """
    Assess erosion risk based on severity and slope.

    Args:
        severity: Classified burn severity
        slope_avg: Average slope in degrees (or percent)

    Returns:
        Erosion risk level: "LOW", "MODERATE", "HIGH", or "CRITICAL"
    """
    if slope_avg is None:
        # Without slope data, base on severity only
        if severity == "HIGH":
            return "HIGH"
        elif severity == "MODERATE":
            return "MODERATE"
        return "LOW"

    # With slope data, use matrix
    if severity == "HIGH":
        if slope_avg >= 30:
            return "CRITICAL"
        elif slope_avg >= 15:
            return "HIGH"
        return "MODERATE"
    elif severity == "MODERATE":
        if slope_avg >= 30:
            return "HIGH"
        elif slope_avg >= 15:
            return "MODERATE"
        return "LOW"
    else:
        return "LOW"


def load_fixture_data(fire_id: str) -> dict | None:
    """
    Load burn severity data from fixtures.

    Args:
        fire_id: Fire identifier (e.g., "cedar-creek-2022" or "cedar-creek")

    Returns:
        Fire data dict or None if not found
    """
    # Normalize fire ID to canonical form
    canonical_id = normalize_fire_id(fire_id)

    # Path relative to this script
    script_dir = Path(__file__).parent

    # Cedar Creek fixture location
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "burn-severity.json"

    if not fixture_path.exists():
        # Try alternate path (running from project root)
        fixture_path = Path("data/fixtures/cedar-creek/burn-severity.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            # Match against canonical fire ID
            if data.get("fire_id") == canonical_id:
                return data

    return None


def execute(inputs: dict) -> dict:
    """
    Execute soil burn severity assessment.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - sectors: Optional pre-loaded sector data
            - include_geometry: Whether to include GeoJSON (default: False)

    Returns:
        Dictionary with severity assessment including breakdown,
        sector details, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    sectors_input = inputs.get("sectors")
    include_geometry = inputs.get("include_geometry", False)

    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Load data - use provided sectors or load from fixtures
    fire_data = None
    sectors = sectors_input
    data_sources = []

    # Check if sectors was explicitly provided (even if empty list)
    sectors_provided = "sectors" in inputs and inputs["sectors"] is not None

    if not sectors_provided:
        # No sectors provided, load from fixtures
        fire_data = load_fixture_data(fire_id)
        if fire_data:
            sectors = fire_data.get("sectors", [])
            data_sources.append("MTBS")
            if fire_data.get("imagery_date"):
                data_sources.append(f"Imagery date: {fire_data['imagery_date']}")
        else:
            return {
                "fire_id": fire_id,
                "error": f"No data found for fire_id: {fire_id}",
                "confidence": 0.0,
                "reasoning_chain": [f"ERROR: Could not load data for {fire_id}"],
            }
    else:
        data_sources.append("User-provided sector data")

    # Get fire metadata
    fire_name = fire_data.get("fire_name", "Unknown Fire") if fire_data else "Unknown Fire"

    # Process sectors
    assessed_sectors: list[SectorAssessment] = []
    reasoning_chain: list[str] = []
    severity_counts: dict[str, dict] = {
        "HIGH": {"acres": 0, "count": 0},
        "MODERATE": {"acres": 0, "count": 0},
        "LOW": {"acres": 0, "count": 0},
        "UNBURNED": {"acres": 0, "count": 0},
    }
    priority_sectors: list[dict] = []
    total_acres = 0

    # Handle empty sectors case
    if not sectors:
        return {
            "fire_id": fire_id,
            "fire_name": fire_name,
            "total_acres": 0,
            "severity_breakdown": {},
            "sectors": [],
            "priority_sectors": [],
            "reasoning_chain": [f"No sectors provided for {fire_id}"],
            "confidence": 0.5,
            "data_sources": data_sources,
            "recommendations": [],
        }

    # Initial reasoning
    reasoning_chain.append(f"Loaded {len(sectors)} sectors for {fire_name} ({fire_data.get('total_acres', 'unknown'):,} total acres)" if fire_data else f"Analyzing {len(sectors)} sectors for {fire_id}")

    for sector in sectors:
        sector_id = sector.get("id", "unknown")
        sector_name = sector.get("name", sector_id)
        dnbr = sector.get("dnbr_mean", 0)
        acres = sector.get("acres", 0)
        slope_avg = sector.get("slope_avg")
        priority_notes = sector.get("priority_notes", "")

        # Classify severity
        severity, severity_class, classification_reasoning = classify_severity(dnbr)

        # Assess erosion risk
        erosion_risk = assess_erosion_risk(severity, slope_avg)

        # Build reasoning
        reasoning = f"{sector_id} ({sector_name}): {classification_reasoning}"
        if slope_avg and severity in ["HIGH", "MODERATE"]:
            reasoning += f". Slope {slope_avg}° + {severity} severity -> {erosion_risk} erosion risk"
        reasoning_chain.append(reasoning)

        # Build sector assessment
        assessment: SectorAssessment = {
            "id": sector_id,
            "name": sector_name,
            "severity": severity,
            "severity_class": severity_class,
            "dnbr_mean": dnbr,
            "acres": acres,
            "erosion_risk": erosion_risk,
            "reasoning": reasoning,
        }

        # Include optional fields
        if slope_avg:
            assessment["slope_avg"] = slope_avg
        if sector.get("hectares"):
            assessment["hectares"] = sector["hectares"]
        if priority_notes:
            assessment["concern"] = priority_notes
        if include_geometry and sector.get("geometry"):
            assessment["geometry"] = sector["geometry"]

        assessed_sectors.append(assessment)

        # Update counts
        severity_counts[severity]["acres"] += acres
        severity_counts[severity]["count"] += 1
        total_acres += acres

        # Track priority sectors (HIGH severity or CRITICAL erosion)
        if severity == "HIGH" or erosion_risk == "CRITICAL":
            priority_sectors.append({
                "id": sector_id,
                "name": sector_name,
                "severity": severity,
                "dnbr_mean": dnbr,
                "acres": acres,
                "concern": priority_notes or f"{severity} severity with {erosion_risk} erosion risk",
            })

    # Sort sectors by severity (highest first), then by acres
    assessed_sectors.sort(key=lambda x: (-x["severity_class"], -x["acres"]))
    priority_sectors.sort(key=lambda x: (-SEVERITY_CLASS.get(x["severity"], 0), -x["acres"]))

    # Calculate breakdown percentages
    severity_breakdown = {}
    for sev, data in severity_counts.items():
        if data["count"] > 0:
            pct = round((data["acres"] / total_acres * 100), 1) if total_acres > 0 else 0
            severity_breakdown[sev.lower()] = {
                "acres": data["acres"],
                "percentage": pct,
                "sector_count": data["count"],
            }

    # Add summary reasoning
    if severity_counts["HIGH"]["count"] > 0:
        high_pct = severity_breakdown.get("high", {}).get("percentage", 0)
        reasoning_chain.append(f"High severity dominates ({high_pct}%) - significant BAER resources needed")

    # Generate recommendations
    recommendations = []
    for ps in priority_sectors[:3]:  # Top 3 priority sectors
        if ps.get("concern"):
            recommendations.append(
                f"Deploy BAER team to {ps['id']} ({ps['name']}) - {ps['concern']}"
            )
        else:
            recommendations.append(
                f"Assess {ps['id']} ({ps['name']}) - {ps['severity']} severity, {ps['acres']:,} acres"
            )

    # Calculate confidence
    # High confidence for complete fixture data, reduce for missing fields
    confidence = 0.92
    if not fire_data:
        confidence = 0.85  # User-provided data slightly lower confidence

    return {
        "fire_id": fire_id,
        "fire_name": fire_name,
        "total_acres": fire_data.get("total_acres", total_acres) if fire_data else total_acres,
        "severity_breakdown": severity_breakdown,
        "sectors": assessed_sectors,
        "priority_sectors": priority_sectors[:5],  # Top 5 priority
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

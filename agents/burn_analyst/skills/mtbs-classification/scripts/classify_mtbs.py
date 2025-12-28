"""
MTBS Classification Script

Implements sector-level severity classification using the
Monitoring Trends in Burn Severity (MTBS) protocol.
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
    def normalize_fire_id(fire_id: str) -> str:
        if fire_id and fire_id.lower() in ["cedar-creek", "cedar_creek", "cc-2022"]:
            return "cedar-creek-2022"
        return fire_id


# MTBS classification thresholds (Key & Benson 2006)
MTBS_THRESHOLDS = {
    1: {"min": None, "max": 0.1, "label": "Unburned/Unchanged"},
    2: {"min": 0.1, "max": 0.27, "label": "Low Severity"},
    3: {"min": 0.27, "max": 0.66, "label": "Moderate Severity"},
    4: {"min": 0.66, "max": None, "label": "High Severity"},
}

MTBSClass = Literal[1, 2, 3, 4]


class SectorClassification(TypedDict, total=False):
    """Classification result for a single sector."""
    id: str
    name: str
    mtbs_class: int
    mtbs_label: str
    dnbr_mean: float
    acres: int | float
    geometry: dict


class ClassSummary(TypedDict):
    """Summary for a severity class."""
    label: str
    acres: float
    percentage: float
    sector_count: int


def classify_dnbr(dnbr: float) -> tuple[int, str]:
    """
    Classify dNBR value to MTBS class.

    Args:
        dnbr: Mean dNBR value for the sector

    Returns:
        Tuple of (mtbs_class, mtbs_label)
    """
    if dnbr < 0.1:
        return 1, "Unburned/Unchanged"
    elif dnbr < 0.27:
        return 2, "Low Severity"
    elif dnbr < 0.66:
        return 3, "Moderate Severity"
    else:
        return 4, "High Severity"


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

    script_dir = Path(__file__).parent
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "burn-severity.json"

    if not fixture_path.exists():
        fixture_path = Path("data/fixtures/cedar-creek/burn-severity.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == canonical_id:
                return data

    return None


def execute(inputs: dict) -> dict:
    """
    Execute MTBS classification for fire sectors.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - sectors: Optional pre-loaded sector data
            - include_class_map: Whether to include GeoJSON (default: False)

    Returns:
        Dictionary with MTBS classification including sector assignments,
        class distribution, and methodology documentation.
    """
    fire_id = inputs.get("fire_id")
    sectors_input = inputs.get("sectors")
    include_class_map = inputs.get("include_class_map", False)

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

    # Handle empty sectors
    if not sectors:
        return {
            "fire_id": fire_id,
            "fire_name": fire_name,
            "total_acres": 0,
            "classification_summary": {},
            "sector_classifications": [],
            "dominant_class": None,
            "mtbs_metadata": _get_metadata(fire_data),
            "reasoning_chain": [f"No sectors provided for {fire_id}"],
        }

    # Classify sectors
    sector_classifications: list[SectorClassification] = []
    class_counts: dict[int, dict] = {
        1: {"label": "Unburned/Unchanged", "acres": 0, "count": 0},
        2: {"label": "Low Severity", "acres": 0, "count": 0},
        3: {"label": "Moderate Severity", "acres": 0, "count": 0},
        4: {"label": "High Severity", "acres": 0, "count": 0},
    }
    total_acres = 0
    reasoning_chain: list[str] = []

    reasoning_chain.append(f"Loaded {len(sectors)} sectors for {fire_name}")

    for sector in sectors:
        sector_id = sector.get("id", "unknown")
        sector_name = sector.get("name", sector_id)
        dnbr = sector.get("dnbr_mean", 0)
        acres = sector.get("acres", 0)

        mtbs_class, mtbs_label = classify_dnbr(dnbr)

        classification: SectorClassification = {
            "id": sector_id,
            "name": sector_name,
            "mtbs_class": mtbs_class,
            "mtbs_label": mtbs_label,
            "dnbr_mean": dnbr,
            "acres": acres,
        }

        if include_class_map and sector.get("geometry"):
            classification["geometry"] = sector["geometry"]

        sector_classifications.append(classification)

        class_counts[mtbs_class]["acres"] += acres
        class_counts[mtbs_class]["count"] += 1
        total_acres += acres

    reasoning_chain.append("Applied MTBS classification to each sector")

    # Sort by class (highest first), then by acres
    sector_classifications.sort(key=lambda x: (-x["mtbs_class"], -x["acres"]))

    # Build classification summary
    classification_summary = {}
    dominant_class = None
    max_acres = 0

    for cls, data in class_counts.items():
        if data["count"] > 0:
            pct = round((data["acres"] / total_acres * 100), 1) if total_acres > 0 else 0
            classification_summary[f"class_{cls}"] = {
                "label": data["label"],
                "acres": data["acres"],
                "percentage": pct,
                "sector_count": data["count"],
            }

            if data["acres"] > max_acres:
                max_acres = data["acres"]
                dominant_class = {
                    "class": cls,
                    "label": data["label"],
                    "percentage": pct,
                }

    if dominant_class:
        reasoning_chain.append(
            f"Class {dominant_class['class']} ({dominant_class['label']}) is dominant at {dominant_class['percentage']}% of area"
        )

    return {
        "fire_id": fire_id,
        "fire_name": fire_name,
        "total_acres": fire_data.get("total_acres", total_acres) if fire_data else total_acres,
        "classification_summary": classification_summary,
        "sector_classifications": sector_classifications,
        "dominant_class": dominant_class,
        "mtbs_metadata": _get_metadata(fire_data),
        "reasoning_chain": reasoning_chain,
    }


def _get_metadata(fire_data: dict | None) -> dict:
    """Build MTBS metadata object."""
    return {
        "source": "MTBS",
        "imagery_date": fire_data.get("imagery_date") if fire_data else None,
        "thresholds": "Key & Benson (2006)",
        "sensor": "Landsat 8 OLI",
        "classification_scheme": {
            "class_1": "Unburned/Unchanged (dNBR < 0.1)",
            "class_2": "Low Severity (0.1 ≤ dNBR < 0.27)",
            "class_3": "Moderate Severity (0.27 ≤ dNBR < 0.66)",
            "class_4": "High Severity (dNBR ≥ 0.66)",
        },
    }


if __name__ == "__main__":
    test_input = {"fire_id": "cedar-creek-2022"}
    result = execute(test_input)
    print(json.dumps(result, indent=2))

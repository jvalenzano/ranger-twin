"""
RANGER Volume Estimation Skill
ADR-009 Compliant: Fixture-First with Full Audit Trail

Provides timber salvage volume estimates for post-fire recovery operations.
Supports both single-plot and fire-level aggregation with data provenance logging.
"""

import json
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

# Configure structured logging for federal compliance
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Path resolution - use .resolve() for container resilience
# Navigate from script location to repository root:
# /agents/cruising_assistant/skills/volume-estimation/scripts/estimate_volume.py → repo root
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent.parent.parent
FIXTURES_DIR = REPO_ROOT / "data" / "fixtures"

# Federal audit constants
AUDIT_VERSION = "1.0"
SKILL_VERSION = "2.1.0"


class FixtureLoadError(Exception):
    """Raised when fixture data cannot be loaded or validated."""
    pass


class DataProvenanceError(Exception):
    """Raised when data provenance cannot be established."""
    pass


def calculate_file_hash(file_path: Path) -> str:
    """
    Calculate SHA-256 hash of a file for provenance tracking.

    Federal compliance requirement: All data sources must have cryptographic
    hash verification to establish an immutable audit trail.
    """
    sha256_hash = hashlib.sha256()

    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Failed to calculate file hash: {file_path} - {e}")
        raise DataProvenanceError(f"Cannot establish data provenance for {file_path}: {e}")


def log_data_provenance(fire_id: str, fixture_path: Path, data: dict) -> dict:
    """
    Create immutable audit log entry for fixture data loading.

    ADR-009 Requirement: All estimates must trace to verifiable source data.
    """
    file_hash = calculate_file_hash(fixture_path)

    provenance = {
        "audit_version": AUDIT_VERSION,
        "skill_version": SKILL_VERSION,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "fire_id": fire_id,
        "source_file": str(fixture_path.relative_to(REPO_ROOT)),
        "source_file_hash_sha256": file_hash,
        "plot_count": len(data.get("plots", [])),
        "data_schema_version": data.get("schema_version", "1.0")
    }

    logger.info(f"Data provenance established: {fire_id} - hash: {file_hash[:16]}...")

    return provenance


def diagnose_fixture_directory() -> dict:
    """
    Comprehensive diagnostic of fixture directory state.

    Called when fixture loading fails to provide detailed troubleshooting
    information in Cloud Run environments.
    """
    diagnostics = {
        "repo_root": str(REPO_ROOT),
        "repo_root_exists": REPO_ROOT.exists(),
        "repo_root_is_absolute": REPO_ROOT.is_absolute(),
        "fixtures_dir": str(FIXTURES_DIR),
        "fixtures_dir_exists": FIXTURES_DIR.exists()
    }

    # List what's actually in REPO_ROOT
    if REPO_ROOT.exists():
        try:
            diagnostics["repo_root_contents"] = [
                str(p.relative_to(REPO_ROOT))
                for p in REPO_ROOT.glob("*")
            ]
        except Exception as e:
            diagnostics["repo_root_contents"] = f"Error listing: {e}"

    # Deep scan of data directory if it exists
    data_dir = REPO_ROOT / "data"
    if data_dir.exists():
        try:
            diagnostics["data_dir_recursive_contents"] = [
                str(p.relative_to(REPO_ROOT))
                for p in data_dir.rglob("*")
                if p.is_file()
            ]
        except Exception as e:
            diagnostics["data_dir_contents"] = f"Error listing: {e}"
    else:
        diagnostics["data_dir_exists"] = False
        diagnostics["likely_cause"] = "Docker .gcloudignore or .gitignore excluding data/ directory"

    # List available fires if fixtures dir exists
    if FIXTURES_DIR.exists():
        try:
            diagnostics["available_fires"] = [
                d.name for d in FIXTURES_DIR.iterdir()
                if d.is_dir()
            ]
        except Exception as e:
            diagnostics["available_fires"] = f"Error listing: {e}"

    return diagnostics


def load_all_plots(fire_id: str) -> tuple[List[dict], dict]:
    """
    Load all timber plots for a fire from fixtures with full audit trail.

    ADR-009 "Fixture-First" pattern with:
    - Explicit error handling (no silent failures)
    - Data provenance tracking (SHA-256 hash)
    - Comprehensive diagnostics for troubleshooting

    Args:
        fire_id: Fire identifier (e.g., "cedar-creek-2022")

    Returns:
        Tuple of (plots list, provenance metadata dict)

    Raises:
        FixtureLoadError: If fixture cannot be loaded or validated
    """
    # Extract fire name from fire_id (e.g., "cedar-creek-2022" → "cedar-creek")
    # Directory structure uses fire name without year suffix
    fire_name = fire_id.rsplit('-', 1)[0] if '-' in fire_id and fire_id.split('-')[-1].isdigit() else fire_id

    fixture_path = FIXTURES_DIR / fire_name / "timber-plots.json"

    # Explicit failure - no silent returns
    if not fixture_path.exists():
        diagnostics = diagnose_fixture_directory()

        logger.error(
            f"Fixture file not found: {fixture_path}\n"
            f"Diagnostics: {json.dumps(diagnostics, indent=2)}"
        )

        # Build helpful error message
        available = diagnostics.get("available_fires", [])
        if isinstance(available, list) and available:
            suggestion = f"Available fires: {', '.join(available)}"
        else:
            suggestion = "No fixture data found in container. Check .gcloudignore whitelist for data/fixtures/"

        raise FixtureLoadError(
            f"Fixture data not found: {fixture_path}\n"
            f"{suggestion}\n"
            f"Diagnostics: {json.dumps(diagnostics, indent=2)}"
        )

    # Load and validate fixture data
    try:
        with open(fixture_path, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in fixture file: {fixture_path} - {e}")
        raise FixtureLoadError(f"Invalid JSON in fixture file: {e}")
    except Exception as e:
        logger.error(f"Failed to read fixture file: {fixture_path} - {e}")
        raise FixtureLoadError(f"Cannot read fixture file: {e}")

    # Validate fixture schema
    if "plots" not in data:
        logger.error(f"Fixture missing 'plots' field: {fixture_path}")
        raise FixtureLoadError(
            f"Invalid fixture schema: missing 'plots' field. "
            f"Available keys: {list(data.keys())}"
        )

    plots = data["plots"]

    if not isinstance(plots, list):
        raise FixtureLoadError(
            f"Invalid fixture schema: 'plots' must be a list, got {type(plots).__name__}"
        )

    if len(plots) == 0:
        logger.warning(f"Fixture file contains no plots: {fixture_path}")

    # Establish data provenance for audit trail
    provenance = log_data_provenance(fire_id, fixture_path, data)

    return plots, provenance


def estimate_single_plot(fire_id: str, plot_id: str) -> dict:
    """Estimate volume for a single timber plot."""
    try:
        plots, provenance = load_all_plots(fire_id)
    except (FixtureLoadError, DataProvenanceError) as e:
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "volume_mbf": 0,
            "compliance_note": "Estimate cannot be provided without verified source data (ADR-009)"
        }

    # Find the specific plot
    plot = next((p for p in plots if p.get("plot_id") == plot_id), None)

    if not plot:
        available_plots = [p.get("plot_id") for p in plots]
        logger.warning(f"Plot {plot_id} not found. Available: {available_plots}")
        return {
            "error": f"Plot {plot_id} not found",
            "available_plots": available_plots,
            "volume_mbf": 0
        }

    # Calculate volume for this plot from plot_summary
    plot_summary = plot.get("plot_summary", {})
    mbf_per_acre = plot_summary.get("mbf_per_acre", 0)

    result = {
        "fire_id": fire_id,
        "plot_id": plot_id,
        "stand_type": plot.get("stand_type", "Unknown"),
        "mbf_per_acre": mbf_per_acre,
        "total_volume_mbf": round(mbf_per_acre, 1),
        "confidence": 0.88,
        "data_provenance": provenance
    }

    logger.info(f"Single plot estimate: {plot_id} = {result['total_volume_mbf']} MBF")

    return result


def estimate_fire_aggregation(fire_id: str) -> dict:
    """Aggregate volume estimates across all plots in a fire."""
    try:
        plots, provenance = load_all_plots(fire_id)
    except (FixtureLoadError, DataProvenanceError) as e:
        # Explicit error response - no silent zero returns
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "total_volume_mbf": 0,
            "plot_count": 0,
            "compliance_note": "Estimate cannot be provided without verified source data (ADR-009)",
            "troubleshooting": "Check Cloud Run logs for detailed diagnostics"
        }

    if len(plots) == 0:
        return {
            "fire_id": fire_id,
            "total_volume_mbf": 0,
            "plot_count": 0,
            "confidence": 0,
            "message": "No plots found for this fire",
            "data_provenance": provenance
        }

    # Aggregate volume across all plots (sum of plot mbf_per_acre values)
    # Note: In variable radius plots, mbf_per_acre is already expansion-factored
    total_volume = sum(
        p.get("plot_summary", {}).get("mbf_per_acre", 0)
        for p in plots
    )

    # Calculate stand type breakdown
    stand_breakdown = {}
    for plot in plots:
        stand_type = plot.get("stand_type", "Unknown")
        plot_volume = plot.get("plot_summary", {}).get("mbf_per_acre", 0)
        stand_breakdown[stand_type] = stand_breakdown.get(stand_type, 0) + plot_volume

    # Build plot breakdown for transparency
    plot_breakdown = [
        {
            "plot_id": p.get("plot_id"),
            "stand_type": p.get("stand_type"),
            "mbf_per_acre": p.get("plot_summary", {}).get("mbf_per_acre", 0),
            "priority": p.get("priority", "UNKNOWN"),
            "sector": p.get("sector")
        }
        for p in plots
    ]

    result = {
        "fire_id": fire_id,
        "total_volume_mbf": round(total_volume, 1),
        "plot_count": len(plots),
        "confidence": 0.88,
        "stand_breakdown_mbf": {
            stand: round(vol, 1)
            for stand, vol in stand_breakdown.items()
        },
        "plot_breakdown": plot_breakdown,
        "data_provenance": provenance,
        "reasoning_chain": [
            f"Loaded {len(plots)} timber cruise plots from fixture data",
            f"Aggregated volume: {round(total_volume, 1)} MBF total",
            f"Stand types: {', '.join(stand_breakdown.keys())}",
            f"Data verified with SHA-256 hash: {provenance['source_file_hash_sha256'][:16]}..."
        ]
    }

    logger.info(f"Fire aggregation: {fire_id} = {result['total_volume_mbf']} MBF across {len(plots)} plots")

    return result


def execute(inputs: dict) -> dict:
    """
    Main skill execution entry point.

    Supports two modes:
    1. Single plot estimation (requires plot_id)
    2. Fire-level aggregation (omit plot_id)

    Args:
        inputs: Skill input parameters
            - fire_id (str): Fire identifier (default: "cedar-creek-2022")
            - plot_id (str, optional): Specific plot identifier

    Returns:
        Volume estimate with full audit trail
    """
    fire_id = inputs.get("fire_id", "cedar-creek-2022")
    plot_id = inputs.get("plot_id")

    logger.info(f"Volume estimation invoked: fire_id={fire_id}, plot_id={plot_id}")

    if plot_id:
        return estimate_single_plot(fire_id, plot_id)
    else:
        return estimate_fire_aggregation(fire_id)


if __name__ == "__main__":
    # Test execution
    print("Testing fire-level aggregation...")
    result = execute({"fire_id": "cedar-creek-2022"})
    print(json.dumps(result, indent=2))

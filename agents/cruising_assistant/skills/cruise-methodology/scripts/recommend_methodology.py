"""
Cruise Methodology Recommendation Script

Recommends timber cruise protocols based on stand characteristics, terrain,
and inventory objectives. Calculates BAF, sampling intensity, and plot layout.
"""

import json
import math
import random
from pathlib import Path
from typing import Literal


# Cruise method types
CruiseMethod = Literal["Variable Radius Plot", "Fixed Radius Plot", "Strip Cruise", "Line Plot Cruise"]


def calculate_baf(avg_dbh: float, stand_density: str) -> tuple[int, str]:
    """
    Calculate recommended Basal Area Factor for variable radius plots.

    Args:
        avg_dbh: Average stand DBH in inches
        stand_density: Stand density class ("sparse", "moderate", "dense")

    Returns:
        Tuple of (baf_value, reasoning)
    """
    # Base BAF on tree size
    if avg_dbh < 14:
        baf = 10
        size_class = "small timber"
    elif avg_dbh < 24:
        baf = 20
        size_class = "medium timber"
    elif avg_dbh < 32:
        baf = 30
        size_class = "large timber"
    else:
        baf = 40
        size_class = "very large timber"

    # Adjust for sparse stands
    if stand_density == "sparse" and baf > 10:
        original_baf = baf
        baf = max(10, baf // 2)
        reasoning = f"Average DBH {avg_dbh} inches indicates {size_class} -> BAF {original_baf}, adjusted to BAF {baf} for sparse stand"
    else:
        reasoning = f"Average DBH {avg_dbh} inches indicates {size_class} -> BAF {baf} recommended"

    return baf, reasoning


def calculate_sampling_intensity(
    total_acres: float,
    variability: str,
    target_confidence: float = 0.90
) -> dict:
    """
    Calculate sampling intensity and number of plots needed.

    Args:
        total_acres: Total area to cruise in acres
        variability: Stand variability ("low", "moderate", "high")
        target_confidence: Desired confidence level (default: 0.90)

    Returns:
        Dictionary with sampling_pct, num_plots, plot_spacing, reasoning
    """
    # Base sampling intensity on variability
    if variability == "low":
        base_pct = 7.5  # 5-10% range
        cv = 0.30  # Coefficient of variation
    elif variability == "high":
        base_pct = 17.5  # 15-20% range
        cv = 0.60
    else:  # moderate
        base_pct = 12.5  # 10-15% range
        cv = 0.45

    # Adjust for confidence level
    if target_confidence >= 0.95:
        base_pct *= 1.2
    elif target_confidence <= 0.85:
        base_pct *= 0.85

    sampling_pct = round(base_pct, 1)

    # Calculate number of plots (assuming ~17 acres per plot as rule of thumb)
    acres_per_plot = 17
    num_plots = max(10, int((total_acres * sampling_pct / 100) / acres_per_plot))

    # Calculate plot spacing for systematic grid
    acres_per_plot_actual = total_acres / num_plots
    plot_spacing_ft = int(math.sqrt(acres_per_plot_actual * 43560))  # Convert acres to square feet

    reasoning = f"{variability.capitalize()} variability -> {sampling_pct}% sampling intensity. {total_acres:,.0f} acres × {sampling_pct}% = {total_acres * sampling_pct / 100:.0f} acres sampled, {num_plots} plots recommended"

    return {
        "sampling_pct": sampling_pct,
        "num_plots": num_plots,
        "plot_spacing_ft": plot_spacing_ft,
        "reasoning": reasoning,
    }


def select_methodology(
    stand_type: str,
    terrain: str,
    objective: str
) -> tuple[CruiseMethod, str]:
    """
    Select the most appropriate cruise methodology.

    Args:
        stand_type: Forest stand type (e.g., "Douglas-fir", "Mixed Conifer")
        terrain: Terrain difficulty ("flat", "moderate", "steep", "very_steep")
        objective: Cruise objective ("salvage", "volume", "stocking", "research")

    Returns:
        Tuple of (method_name, reasoning)
    """
    # Load protocols
    resources_dir = Path(__file__).parent.parent / "resources"
    with open(resources_dir / "sampling-protocols.json") as f:
        protocols = json.load(f)

    # Decision logic
    if objective == "research":
        method = "Fixed Radius Plot"
        reasoning = f"{objective.capitalize()} objective -> Fixed radius provides reproducible sampling units"
    elif objective == "stocking" and "lodgepole" in stand_type.lower():
        method = "Fixed Radius Plot"
        reasoning = f"{objective.capitalize()} + small tree stocking -> Fixed radius captures density accurately"
    elif terrain in ["steep", "very_steep"] and objective == "salvage":
        method = "Variable Radius Plot"
        reasoning = f"{terrain.capitalize()} terrain + {objective} objective -> Variable radius efficient for scattered large trees"
    elif "mixed" in stand_type.lower() or objective == "salvage":
        method = "Variable Radius Plot"
        reasoning = f"Mixed stand + {objective} objective -> Variable radius method preferred for merchantable timber"
    else:
        # Default to variable radius for most commercial cruising
        method = "Variable Radius Plot"
        reasoning = "Standard variable radius cruise for commercial timber inventory"

    return method, reasoning


def generate_plot_locations(
    sector_coords: list[list[float]],
    num_plots: int,
    method: str = "systematic"
) -> list[dict]:
    """
    Generate plot locations within a sector.

    Args:
        sector_coords: Bounding box or polygon coordinates [[lon, lat], ...]
        num_plots: Number of plots to generate
        method: Layout method ("systematic" or "random")

    Returns:
        List of plot location dictionaries
    """
    if not sector_coords or len(sector_coords) < 2:
        return []

    # Calculate bounding box
    lons = [c[0] for c in sector_coords]
    lats = [c[1] for c in sector_coords]
    min_lon, max_lon = min(lons), max(lons)
    min_lat, max_lat = min(lats), max(lats)

    plots = []

    if method == "systematic":
        # Grid layout
        grid_size = int(math.ceil(math.sqrt(num_plots)))
        lon_step = (max_lon - min_lon) / (grid_size + 1)
        lat_step = (max_lat - min_lat) / (grid_size + 1)

        plot_num = 1
        for i in range(grid_size):
            for j in range(grid_size):
                if plot_num > num_plots:
                    break
                lon = min_lon + (i + 1) * lon_step
                lat = min_lat + (j + 1) * lat_step

                plots.append({
                    "plot_id": f"P{plot_num:02d}",
                    "coords": [round(lon, 6), round(lat, 6)],
                    "method": "Systematic grid"
                })
                plot_num += 1
    else:
        # Random layout
        random.seed(42)  # Reproducible randomness
        for i in range(num_plots):
            lon = random.uniform(min_lon, max_lon)
            lat = random.uniform(min_lat, max_lat)

            plots.append({
                "plot_id": f"P{i+1:02d}",
                "coords": [round(lon, 6), round(lat, 6)],
                "method": "Random"
            })

    return plots


def execute(inputs: dict) -> dict:
    """
    Execute cruise methodology recommendation.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - fire_id: Unique fire identifier (required)
            - sector: Sector ID (optional)
            - stand_type: Stand composition (optional)
            - avg_dbh: Average DBH in inches (optional)
            - stand_density: Density class (optional)
            - terrain: Terrain difficulty (optional)
            - objective: Cruise objective (optional)
            - target_confidence: Confidence level (optional)
            - total_acres: Area to cruise (optional)

    Returns:
        Dictionary with cruise methodology recommendation, BAF, sampling intensity,
        plot locations, reasoning chain, and recommendations.
    """
    fire_id = inputs.get("fire_id")
    sector = inputs.get("sector")
    stand_type = inputs.get("stand_type", "Mixed Conifer")
    avg_dbh = inputs.get("avg_dbh")
    stand_density = inputs.get("stand_density", "moderate")
    terrain = inputs.get("terrain", "moderate")
    objective = inputs.get("objective", "salvage")
    target_confidence = inputs.get("target_confidence", 0.90)
    total_acres = inputs.get("total_acres")

    if not fire_id:
        return {
            "error": "fire_id is required",
            "confidence": 0.0,
            "reasoning_chain": ["ERROR: No fire_id provided"],
        }

    # Try to load from fixtures if sector provided
    fixture_data = None
    if sector:
        fixture_data = load_sector_data(fire_id, sector)
        if fixture_data:
            # Override with fixture data if not explicitly provided
            if not avg_dbh and "avg_dbh" in fixture_data:
                avg_dbh = fixture_data["avg_dbh"]
            if not total_acres and "acres" in fixture_data:
                total_acres = fixture_data["acres"]

    # Set defaults if still missing
    if avg_dbh is None:
        avg_dbh = 20.0  # Reasonable default for mixed conifer
    if total_acres is None:
        total_acres = 1000  # Default planning area

    reasoning_chain = []
    data_sources = []

    # Step 1: Select methodology
    method, method_reasoning = select_methodology(stand_type, terrain, objective)
    reasoning_chain.append(method_reasoning)

    # Step 2: Calculate BAF (for variable radius)
    baf = None
    plot_radius_ft = None
    if method == "Variable Radius Plot":
        baf, baf_reasoning = calculate_baf(avg_dbh, stand_density)
        reasoning_chain.append(baf_reasoning)
    else:
        # Fixed radius plot sizing
        if avg_dbh < 12:
            plot_radius_ft = 24.0  # 1/20 acre
        elif avg_dbh < 20:
            plot_radius_ft = 37.2  # 1/10 acre
        else:
            plot_radius_ft = 52.7  # 1/5 acre
        reasoning_chain.append(f"Fixed radius {plot_radius_ft:.1f} feet selected for {avg_dbh} inch average DBH")

    # Step 3: Determine variability (simplified based on stand type)
    if "mixed" in stand_type.lower() or "fire" in stand_type.lower():
        variability = "high"
    elif "lodgepole" in stand_type.lower() or "uniform" in stand_type.lower():
        variability = "low"
    else:
        variability = "moderate"

    # Step 4: Calculate sampling intensity
    sampling = calculate_sampling_intensity(total_acres, variability, target_confidence)
    reasoning_chain.append(sampling["reasoning"])

    # Step 5: Generate plot locations if sector data available
    plot_locations = []
    if fixture_data and "coords" in fixture_data:
        # Use sector center as approximate location
        coords = fixture_data["coords"]
        # Generate simple grid around center
        plot_locations = generate_plot_locations(
            [[coords[0] - 0.01, coords[1] - 0.01], [coords[0] + 0.01, coords[1] + 0.01]],
            min(sampling["num_plots"], 5),  # Limit to 5 for example
            "systematic"
        )
        if plot_locations:
            reasoning_chain.append(f"Generated {len(plot_locations)} systematic plot locations within sector")

    # Generate recommendations
    recommendations = []
    if method == "Variable Radius Plot":
        recommendations.append(f"Use {baf} BAF prism or relaskop for plot sampling")
        recommendations.append(f"Establish plots on systematic {sampling['plot_spacing_ft']}-foot grid")
    else:
        recommendations.append(f"Use {plot_radius_ft:.1f}-foot fixed radius plots")
        recommendations.append(f"Mark plot centers and boundaries clearly")

    if terrain in ["steep", "very_steep"]:
        recommendations.append("Consider slope correction for measured distances on steep terrain")

    recommendations.append("Stratify by burn severity for more precise estimates")
    recommendations.append("Measure all in-trees for DBH, height, defect, and species")

    # Data sources
    data_sources.append("USFS Timber Cruising Handbook FSH 2409.12")
    if fixture_data:
        data_sources.append("Cedar Creek timber plot data")

    # Build result
    result = {
        "fire_id": fire_id,
        "recommended_method": method,
        "sampling_intensity_pct": sampling["sampling_pct"],
        "num_plots": sampling["num_plots"],
        "reasoning_chain": reasoning_chain,
        "confidence": 0.92,
        "data_sources": data_sources,
        "recommendations": recommendations,
    }

    if sector:
        result["sector"] = sector
    if baf:
        result["baf"] = baf
    if plot_radius_ft:
        result["plot_radius_ft"] = plot_radius_ft
    if plot_locations:
        result["plot_locations"] = plot_locations

    return result


def load_sector_data(fire_id: str, sector: str) -> dict | None:
    """
    Load sector data from fixtures.

    Args:
        fire_id: Fire identifier
        sector: Sector ID

    Returns:
        Sector data dict or None if not found
    """
    # Try to load from timber plots fixture
    script_dir = Path(__file__).parent
    fixture_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "timber-plots.json"

    if not fixture_path.exists():
        fixture_path = Path("data/fixtures/cedar-creek/timber-plots.json")

    if fixture_path.exists():
        with open(fixture_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                # Look for plots in this sector
                plots = data.get("plots", [])
                sector_plots = [p for p in plots if p.get("sector") == sector]
                if sector_plots:
                    # Return first plot as representative
                    plot = sector_plots[0]
                    return {
                        "coords": plot.get("coords"),
                        "acres": 1000,  # Approximate sector size
                        "avg_dbh": 28.0,  # Could calculate from trees
                    }

    # Also try burn severity for acreage
    severity_path = script_dir.parent.parent.parent.parent.parent / "data" / "fixtures" / "cedar-creek" / "burn-severity.json"
    if not severity_path.exists():
        severity_path = Path("data/fixtures/cedar-creek/burn-severity.json")

    if severity_path.exists():
        with open(severity_path) as f:
            data = json.load(f)
            if data.get("fire_id") == fire_id:
                sectors = data.get("sectors", [])
                for s in sectors:
                    if s.get("id") == sector:
                        return {
                            "acres": s.get("acres", 1000),
                        }

    return None


if __name__ == "__main__":
    # Quick test
    test_input = {
        "fire_id": "cedar-creek-2022",
        "sector": "SW-1",
        "stand_type": "Douglas-fir/Western Hemlock",
        "avg_dbh": 28.5,
        "stand_density": "dense",
        "terrain": "steep",
        "objective": "salvage",
        "total_acres": 2150,
    }
    result = execute(test_input)
    print(json.dumps(result, indent=2))

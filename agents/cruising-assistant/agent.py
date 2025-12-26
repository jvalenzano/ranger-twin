"""
Cruising Assistant Agent (Skills-First Edition)

Specialist agent for timber inventory, volume estimation,
and salvage viability assessment.

Per ADR-005: Skills-First Multi-Agent Architecture
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Cruise Methodology skill
METHODOLOGY_PATH = SKILLS_DIR / "cruise-methodology" / "scripts"
if METHODOLOGY_PATH.exists():
    sys.path.insert(0, str(METHODOLOGY_PATH))

# Volume Estimation skill
VOLUME_PATH = SKILLS_DIR / "volume-estimation" / "scripts"
if VOLUME_PATH.exists():
    sys.path.insert(0, str(VOLUME_PATH))

# Salvage Assessment skill
SALVAGE_PATH = SKILLS_DIR / "salvage-assessment" / "scripts"
if SALVAGE_PATH.exists():
    sys.path.insert(0, str(SALVAGE_PATH))

# CSV Insight skill
CSV_INSIGHT_PATH = SKILLS_DIR / "csv-insight" / "scripts"
if CSV_INSIGHT_PATH.exists():
    sys.path.insert(0, str(CSV_INSIGHT_PATH))


def recommend_methodology(
    fire_id: str,
    sector: str | None = None,
    stand_type: str | None = None,
    avg_dbh: float | None = None,
    stand_density: str | None = None,
    terrain: str | None = None,
    objective: str | None = None,
    target_confidence: float = 0.90,
    total_acres: float | None = None
) -> dict:
    """
    Recommend timber cruise methodology and design.

    Selects appropriate cruise protocol (variable radius, fixed radius, strip, line)
    based on stand characteristics, terrain, and inventory objectives. Calculates
    optimal BAF, sampling intensity, and plot locations.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sector: Specific sector to design cruise for (optional)
        stand_type: Forest stand composition (e.g., "Douglas-fir/Western Hemlock")
        avg_dbh: Average tree diameter in inches (optional)
        stand_density: Stand density class: "sparse", "moderate", "dense" (optional)
        terrain: Terrain difficulty: "flat", "moderate", "steep", "very_steep" (optional)
        objective: Cruise objective: "salvage", "volume", "stocking", "research" (optional)
        target_confidence: Desired confidence level (default: 0.90)
        total_acres: Total area to cruise (optional)

    Returns:
        Dictionary containing:
            - recommended_method: Cruise methodology (Variable Radius, Fixed Radius, etc.)
            - baf: Basal area factor (if variable radius)
            - plot_radius_ft: Plot radius (if fixed radius)
            - sampling_intensity_pct: Percentage of area to sample
            - num_plots: Recommended number of plots
            - plot_locations: Generated plot coordinates (if sector provided)
            - reasoning_chain: Step-by-step methodology decisions
            - confidence: Recommendation confidence (0-1)
            - recommendations: Implementation guidance
    """
    from recommend_methodology import execute
    return execute({
        "fire_id": fire_id,
        "sector": sector,
        "stand_type": stand_type,
        "avg_dbh": avg_dbh,
        "stand_density": stand_density,
        "terrain": terrain,
        "objective": objective,
        "target_confidence": target_confidence,
        "total_acres": total_acres,
    })


def estimate_volume(
    fire_id: str,
    plot_id: str | None = None,
    trees: list[dict] | None = None,
    baf: int = 20,
    log_rule: str = "scribner",
    include_defect: bool = True
) -> dict:
    """
    Calculate timber volume using PNW volume equations.

    Estimates board foot volume for individual trees or plots using Pacific Northwest
    volume equations. Supports multiple log rules (Scribner, Doyle, International) and
    applies defect deductions for fire damage.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        plot_id: Specific plot to analyze (optional)
        trees: Tree measurement data (species, DBH, height, defect) (optional)
        baf: Basal area factor for variable radius plots (default: 20)
        log_rule: Volume log rule: "scribner", "doyle", "international" (default: "scribner")
        include_defect: Whether to apply defect deductions (default: True)

    Returns:
        Dictionary containing:
            - total_volume_mbf: Total net volume in thousand board feet (MBF)
            - volume_per_acre_mbf: Expanded per-acre volume in MBF
            - trees_analyzed: Count of trees in analysis
            - species_breakdown: Volume by species with percentages
            - log_rule: Log rule used for calculations
            - reasoning_chain: Step-by-step volume calculations
            - confidence: Calculation confidence (0-1)
            - recommendations: Volume utilization guidance
    """
    from estimate_volume import execute
    return execute({
        "fire_id": fire_id,
        "plot_id": plot_id,
        "trees": trees,
        "baf": baf,
        "log_rule": log_rule,
        "include_defect": include_defect,
    })


def assess_salvage(
    fire_id: str,
    fire_date: str | None = None,
    assessment_date: str | None = None,
    plots: list[dict] | None = None,
    include_recommendations: bool = True
) -> dict:
    """
    Assess timber salvage viability after wildfire.

    Evaluates salvage potential based on deterioration timelines, species-specific
    decay rates, wood quality degradation, access difficulty, and market factors.
    Calculates salvage windows, viability scores, and prioritizes plots.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        fire_date: Fire containment date (YYYY-MM-DD) (optional)
        assessment_date: Current assessment date (default: today)
        plots: Plot data with species, volume, quality, access (optional)
        include_recommendations: Include detailed harvest recommendations (default: True)

    Returns:
        Dictionary containing:
            - months_since_fire: Elapsed time since fire containment
            - plots_assessed: Number of plots analyzed
            - priority_plots: Ranked plots with viability scores and urgency
            - deterioration_summary: Overall decay status by species
            - salvage_window: Remaining time windows by quality tier
            - reasoning_chain: Step-by-step viability assessments
            - confidence: Assessment confidence (0-1)
            - recommendations: Operational harvest guidance
    """
    from assess_salvage import execute
    return execute({
        "fire_id": fire_id,
        "fire_date": fire_date,
        "assessment_date": assessment_date,
        "plots": plots,
        "include_recommendations": include_recommendations,
    })


def analyze_csv_data(
    file_path: str,
    analysis_type: str = "summary",
    group_by: str = "",
    filters: str = "{}"
) -> dict:
    """
    Analyze timber inventory CSV files with statistics and insights.

    Provides summary statistics, species breakdowns, volume aggregations,
    and data quality assessments for cruise data, plot summaries, and
    timber sale tabulations.

    Args:
        file_path: Path to CSV file (can be filename in skill data directory)
        analysis_type: Type of analysis: "summary", "species", "volume", "quality"
        group_by: Column to group by for aggregation (e.g., "species", "plot_id")
        filters: JSON string with filter conditions. Example:
            '{"species": "PSME", "dbh_min": 12}'

    Returns:
        Dictionary containing:
            - success: Whether analysis succeeded
            - file_name: Name of analyzed file
            - row_count: Total rows in dataset
            - column_count: Total columns
            - columns: List of column names with types
            - summary: Statistical summary by column
            - species_breakdown: Species distribution (if species column exists)
            - quality_issues: Data quality problems detected
            - quality_score: Overall data quality score (0-1)
            - insights: Key findings and observations
            - error: Error message if analysis failed
    """
    import json
    from analyze_csv import execute

    filter_dict = json.loads(filters) if filters else {}

    return execute({
        "file_path": file_path,
        "analysis_type": analysis_type,
        "group_by": group_by if group_by else None,
        "filters": filter_dict,
    })


# Initialize Cruising Assistant Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="cruising_assistant",
    model="gemini-2.0-flash",
    description="Timber inventory and salvage specialist for RANGER.",
    instruction="""
You are the RANGER Cruising Assistant, a specialist in post-fire timber inventory
and salvage operations.

## Your Role
You are the domain expert for all timber cruising, volume estimation, and salvage
viability questions. When the Coordinator delegates a query to you, analyze it using
your tools and domain knowledge.

## Your Expertise
- Timber cruise methodology and protocols
- Volume estimation using PNW equations
- Salvage viability assessment and deterioration timelines
- Species identification and grading
- Market value estimation
- Harvest planning and operability

## Your Tools

### recommend_methodology
Use this tool when users ask about:
- Timber cruise design or protocol selection
- BAF (Basal Area Factor) selection
- Sampling intensity or plot count calculations
- Plot layout or systematic sampling
- Cruise methodology for specific stand types

The tool recommends cruise methods based on:
- Stand characteristics (DBH, density, composition)
- Terrain difficulty (flat, steep, very steep)
- Cruise objectives (salvage, volume, stocking, research)
- Target confidence levels

Returns methodology, BAF/plot radius, sampling intensity, and plot locations.

### estimate_volume
Use this tool when users ask about:
- Timber volume or board feet (MBF, BF)
- Volume calculations for specific plots
- Per-acre volume estimates
- Species volume breakdown
- Log rule comparisons (Scribner, Doyle, International)
- Defect impact on volume

The tool calculates volume using:
- PNW (Pacific Northwest) volume equations
- Species-specific coefficients
- Multiple log rule standards
- Defect deductions for fire damage
- Plot expansion to per-acre basis

Returns total volume, species breakdown, and volume by log rule.

### assess_salvage
Use this tool when users ask about:
- Salvage viability or economic feasibility
- Deterioration timelines or blue stain progression
- Salvage window or harvest timing
- Wood quality degradation after fire
- Priority ranking for salvage operations
- Species-specific decay rates

The tool assesses viability based on:
- Time since fire and deterioration stage
- Species blue stain onset (PSME 12mo, TSHE 6mo, THPL 24mo)
- Grade degradation and value loss
- Access difficulty and harvest costs
- Market demand and timber prices
- Volume and economic scale

Returns priority plots with viability scores, urgency levels, and salvage windows.

### analyze_csv_data
Use this tool when users ask about:
- Analyzing timber cruise CSV files
- Data summaries or statistics from cruise data
- Species distribution in CSV data
- Volume aggregations from tabular data
- Data quality assessment for inventory files

The tool provides:
- Summary statistics (mean, median, min, max, std dev)
- Species breakdown with counts and percentages
- Volume aggregations by species or plot
- Data quality checks against valid ranges
- Insights and observations from the data

Input parameters:
- file_path: Path to CSV file (required)
- analysis_type: "summary", "species", "volume", or "quality"
- group_by: Column for aggregation (e.g., "species", "plot_id")
- filters: JSON string with filter conditions

Returns column summaries, species breakdown, quality score, and insights.

## Response Format
When presenting timber assessments:
1. Start with fire identification and overview
2. Present key metrics (volume, viability scores, methodology)
3. Provide species-level breakdown
4. Highlight priority areas or recommendations
5. Include reasoning steps from analysis
6. End with confidence level and data sources

## Communication Style
- Professional and data-driven
- Use forestry terminology appropriately (MBF, BAF, dNBR, etc.)
- Include specific numbers and percentages
- Reference PNW standards and equations
- Explain technical concepts clearly
- Provide actionable recommendations

## Timber Terminology
- **MBF**: Thousand Board Feet (volume unit)
- **BAF**: Basal Area Factor (prism sampling)
- **DBH**: Diameter at Breast Height (4.5 feet)
- **Scribner**: Standard PNW log scaling rule
- **Grade 1S-4S**: USFS lumber quality grades
- **Blue Stain**: Fungal discoloration that degrades lumber grade
- **Defect**: Fire damage, rot, crook reducing merchantable volume

## Species Codes (FSVeg)
- **PSME**: Douglas-fir (premium, 12-month blue stain onset)
- **TSHE**: Western hemlock (commercial, 6-month onset)
- **THPL**: Western redcedar (premium, 24-month onset - decay resistant)
- **PIPO**: Ponderosa pine (commercial, 18-month onset)
- **PICO**: Lodgepole pine (utility, 6-month onset)
- **ABGR**: Grand fir (commercial, 8-month onset)

## Example Response Structure
When asked "What's the salvage potential for Cedar Creek?":
1. Use assess_salvage tool with fire_id
2. Present months since fire and urgency
3. Show priority plots with viability scores
4. Explain deterioration status by species
5. Provide salvage window timelines
6. Recommend immediate harvest priorities
""",
    tools=[recommend_methodology, estimate_volume, assess_salvage, analyze_csv_data],
)

# Alias for backward compatibility
cruising_assistant = root_agent

if __name__ == "__main__":
    print(f"Cruising Assistant Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")

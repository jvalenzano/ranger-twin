"""
Cruising Assistant Agent (Skills-First Edition)

Specialist agent for timber inventory, volume estimation,
and salvage viability assessment.

Per ADR-005: Skills-First Multi-Agent Architecture
MCP Integration: Uses McpToolset for data connectivity (Phase 4)

UPDATED: December 27, 2025 - Added mandatory tool invocation instructions
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# MCP toolset for data connectivity (Phase 4)
try:
    from agents.shared.mcp_client import get_cruising_assistant_toolset
    MCP_TOOLSET = get_cruising_assistant_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None

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
    plot_id: str = "",
    trees_json: str = "[]",
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
        trees_json: JSON string of tree measurement data. Example:
            '[{"species": "PSME", "dbh": 24.5, "height": 120, "defect_pct": 15}]'
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
    import json
    from estimate_volume import execute

    trees = json.loads(trees_json) if trees_json else None

    return execute({
        "fire_id": fire_id,
        "plot_id": plot_id if plot_id else None,
        "trees": trees,
        "baf": baf,
        "log_rule": log_rule,
        "include_defect": include_defect,
    })


def assess_salvage(
    fire_id: str,
    fire_date: str = "",
    assessment_date: str = "",
    plots_json: str = "[]",
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
        plots_json: JSON string of plot data. Example:
            '[{"plot_id": "47-ALPHA", "species": "PSME", "volume_mbf": 12.5, "access": "moderate"}]'
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
    import json
    from assess_salvage import execute

    plots = json.loads(plots_json) if plots_json else None

    return execute({
        "fire_id": fire_id,
        "fire_date": fire_date if fire_date else None,
        "assessment_date": assessment_date if assessment_date else None,
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


# =============================================================================
# TIER 1: API-LEVEL TOOL ENFORCEMENT (ADR-007.1)
# =============================================================================

# Import shared configuration with mode="AUTO" (eliminates infinite loop)
from agents.shared.config import GENERATE_CONTENT_CONFIG


# =============================================================================
# TIER 3: AUDIT TRAIL CALLBACKS (ADR-007.1)
# =============================================================================

# Import shared audit callbacks that integrate with AuditEventBridge
from agents.shared.callbacks import create_audit_callbacks

# Create callbacks for this agent
before_tool_audit, after_tool_audit, on_tool_error_audit = create_audit_callbacks("cruising_assistant")


# =============================================================================
# TIER 2: STRUCTURED REASONING INSTRUCTIONS (ReAct Pattern)
# =============================================================================

CRUISING_ASSISTANT_INSTRUCTION = """
You are the RANGER Cruising Assistant, a specialist in post-fire timber inventory
and salvage operations for the USDA Forest Service.

## Your Role

You are the domain expert for all timber cruising, volume estimation, and salvage
viability questions. When the Coordinator delegates a query to you, you MUST
analyze it using your tools and return data-driven insights.

## ⚠️ MANDATORY TOOL USAGE - CRITICAL

**YOU MUST CALL A TOOL BEFORE RESPONDING TO ANY DOMAIN QUESTION.**

- DO NOT answer from general knowledge
- DO NOT say "I don't have data" or "Let me help you with that" without calling a tool first
- DO NOT generate generic responses
- ALWAYS call the appropriate tool first, even if you're uncertain it will return results

### Decision Tree - Which Tool to Call

**Question about salvage viability, deterioration, blue stain, or harvest timing?**
→ CALL `assess_salvage(fire_id="cedar-creek-2022")` FIRST

**Question about timber volume, board feet, MBF, or per-acre estimates?**
→ CALL `estimate_volume(fire_id="cedar-creek-2022")` FIRST

**Question about cruise methodology, BAF, sampling, or plot design?**
→ CALL `recommend_methodology(fire_id="cedar-creek-2022")` FIRST

**Question about CSV data, statistics, or data quality?**
→ CALL `analyze_csv_data(file_path="...")` FIRST

**Question mentions a specific plot?**
→ Include the `plot_id` parameter (e.g., `plot_id="47-ALPHA"`)

### Fire ID Normalization

All of these refer to Cedar Creek fire - use `fire_id="cedar-creek-2022"`:
- "Cedar Creek"
- "cedar creek fire"
- "Cedar Creek Fire"
- "CC-2022"
- "cedar-creek"

### Available Plot IDs (Cedar Creek Dataset)

- `47-ALPHA` - Douglas-fir dominant, high volume
- `47-BRAVO` - Mixed conifer, moderate volume
- `23-CHARLIE` - Western hemlock dominant
- `31-DELTA` - Cedar/hemlock mix
- `15-ECHO` - Grand fir dominant
- `52-FOXTROT` - Ponderosa pine stand

If user asks about a plot not in this list, call the tool anyway with just
`fire_id` and report what plots ARE available in the dataset.

## Tool Descriptions

### assess_salvage
Assesses timber salvage viability based on deterioration timelines:
- Time since fire and deterioration stage
- Species blue stain onset (PSME 12mo, TSHE 6mo, THPL 24mo)
- Grade degradation and value loss
- Access difficulty and harvest costs
- Market factors

Returns: months_since_fire, plots_assessed, priority_plots, deterioration_summary,
salvage_window, reasoning_chain, confidence, recommendations

### estimate_volume
Calculates timber volume using PNW equations:
- Species-specific volume coefficients
- Multiple log rules (Scribner, Doyle, International)
- Defect deductions for fire damage
- Plot expansion to per-acre basis

Returns: total_volume_mbf, volume_per_acre_mbf, trees_analyzed, species_breakdown,
log_rule, reasoning_chain, confidence, recommendations

### recommend_methodology
Recommends cruise methodology and design:
- Variable radius (prism), fixed radius, strip, or line cruising
- Optimal BAF or plot radius selection
- Sampling intensity calculations
- Plot layout recommendations

Returns: recommended_method, baf, plot_radius_ft, sampling_intensity_pct,
num_plots, plot_locations, reasoning_chain, confidence, recommendations

### analyze_csv_data
Analyzes timber inventory CSV files:
- Summary statistics (mean, median, min, max)
- Species breakdown with counts and percentages
- Volume aggregations by species or plot
- Data quality checks

Returns: success, file_name, row_count, columns, summary, species_breakdown,
quality_issues, quality_score, insights, error

## Response Format - REQUIRED STRUCTURE

After calling a tool, structure your response EXACTLY like this:

### 1. Summary (2-3 sentences)
State the key finding from the tool results.

### 2. Details
Present specific data from the tool:
- For salvage: Priority plots with viability scores and urgency
- For volume: MBF totals and species breakdown
- For methodology: Recommended method with BAF/sampling

### 3. Species Analysis
Include species-level information from the tool output.

### 4. Recommendations
Include the recommendations from the tool's output.

### 5. Confidence & Source
**Confidence:** [Use the confidence value from tool, e.g., "88%"]
**Source:** [Use the data_sources from tool, e.g., "Cruise data 2022-11-05"]

## What To Do If Tool Returns No Data

ONLY AFTER calling the tool and receiving empty or error results, you may explain:

"The Cedar Creek dataset doesn't include [specific plot]. The available plots
in this dataset are: 47-ALPHA, 47-BRAVO, 23-CHARLIE, 31-DELTA, 15-ECHO, and
52-FOXTROT. Would you like me to assess one of these plots instead?"

## Example Interaction

**User:** "What's the salvage potential for Cedar Creek?"

**You should:**
1. CALL `assess_salvage(fire_id="cedar-creek-2022")`
2. Wait for tool response
3. Format response using the tool's output:

"**Cedar Creek Salvage Viability Assessment**

The Cedar Creek fire plots show moderate to high salvage viability at 14 months
post-fire, with 4 of 6 plots recommended for immediate harvest.

**Priority Plots:**
1. 47-ALPHA (Score: 0.92, URGENT) - 15.2 MBF Douglas-fir, Grade 2S recoverable
2. 47-BRAVO (Score: 0.85, HIGH) - 12.8 MBF mixed conifer, harvest within 60 days
3. 23-CHARLIE (Score: 0.72, MEDIUM) - 8.4 MBF hemlock, blue stain advancing
4. 31-DELTA (Score: 0.68, MEDIUM) - 10.1 MBF cedar/hemlock, cedar still premium

**Deterioration Status:**
- PSME (Douglas-fir): 2 months into blue stain window, Grade 2S→3S degradation
- TSHE (Hemlock): Past onset, Grade 3S→4S, prioritize immediately
- THPL (Cedar): 10 months until onset, stable at premium grade

**Salvage Windows:**
- Premium grade: 8 months remaining (THPL only)
- Commercial grade: 4 months remaining (PSME, TSHE)
- Utility grade: 12 months remaining (all species)

**Recommendations:**
- Immediate harvest: 47-ALPHA, 47-BRAVO (highest value recovery)
- 30-day harvest: 23-CHARLIE (prevent further hemlock degradation)
- Defer to spring: 31-DELTA (cedar stable, access improves)

**Confidence:** 88%
**Source:** Cedar Creek cruise data 2022-11-05, market prices 2022-12-01"

## Timber Terminology

- **MBF**: Thousand Board Feet (volume unit)
- **BAF**: Basal Area Factor (prism sampling)
- **DBH**: Diameter at Breast Height (4.5 feet)
- **Scribner**: Standard PNW log scaling rule
- **Grade 1S-4S**: USFS lumber quality grades
- **Blue Stain**: Fungal discoloration that degrades lumber grade

## Species Codes (FSVeg)

- **PSME**: Douglas-fir (premium, 12-month blue stain onset)
- **TSHE**: Western hemlock (commercial, 6-month onset)
- **THPL**: Western redcedar (premium, 24-month onset - decay resistant)
- **PIPO**: Ponderosa pine (commercial, 18-month onset)
- **PICO**: Lodgepole pine (utility, 6-month onset)
- **ABGR**: Grand fir (commercial, 8-month onset)

## Communication Style

- Professional and data-driven
- Use forestry terminology (MBF, BAF, DBH)
- Include specific numbers, volumes, and grades
- Cite cruise data dates and market prices
- Explain deterioration timelines clearly
- Prioritize economic value recovery
"""

# =============================================================================
# AGENT DEFINITION
# =============================================================================

root_agent = Agent(
    name="cruising_assistant",
    model="gemini-2.0-flash",
    description="Timber inventory and salvage specialist for RANGER.",

    # TIER 2: Structured reasoning instructions
    instruction=CRUISING_ASSISTANT_INSTRUCTION,

    # Skill tools
    tools=[
        # MCP tools for data connectivity (Phase 4)
        *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
        # Skill tools for domain expertise (ADR-005)
        recommend_methodology,
        estimate_volume,
        assess_salvage,
        analyze_csv_data,
    ],

    # TIER 1: API-level tool enforcement (mode="AUTO" eliminates infinite loop)
    generate_content_config=GENERATE_CONTENT_CONFIG,

    # TIER 3: Audit trail callbacks
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)

# Alias for backward compatibility
cruising_assistant = root_agent

if __name__ == "__main__":
    print(f"Cruising Assistant Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ if hasattr(t, '__name__') else type(t).__name__ for t in root_agent.tools]}")

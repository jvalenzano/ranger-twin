"""
Burn Analyst Agent (Skills-First Edition)

Specialist agent for fire severity analysis, MTBS classification,
and soil burn severity assessment.

Per ADR-005: Skills-First Multi-Agent Architecture
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Soil Burn Severity skill
SEVERITY_PATH = SKILLS_DIR / "soil-burn-severity" / "scripts"
if SEVERITY_PATH.exists():
    sys.path.insert(0, str(SEVERITY_PATH))

# MTBS Classification skill
MTBS_PATH = SKILLS_DIR / "mtbs-classification" / "scripts"
if MTBS_PATH.exists():
    sys.path.insert(0, str(MTBS_PATH))

# Boundary Mapping skill
BOUNDARY_PATH = SKILLS_DIR / "boundary-mapping" / "scripts"
if BOUNDARY_PATH.exists():
    sys.path.insert(0, str(BOUNDARY_PATH))


def assess_severity(fire_id: str, sectors: list[dict] | None = None, include_geometry: bool = False) -> dict:
    """
    Assess soil burn severity for a fire incident.

    Analyzes dNBR (differenced Normalized Burn Ratio) values to classify
    burn severity and identify priority areas for BAER (Burned Area
    Emergency Response) assessment.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors: Optional pre-loaded sector data with dNBR values.
                 If not provided, loads from Cedar Creek fixtures.
        include_geometry: Whether to include GeoJSON in response (default: False)

    Returns:
        Dictionary containing:
            - fire_id: The analyzed fire identifier
            - fire_name: Display name of the fire
            - total_acres: Total burned acres assessed
            - severity_breakdown: Acres and percentage by severity class
            - sectors: Sector-level assessments with severity and concerns
            - priority_sectors: Sectors requiring immediate attention
            - reasoning_chain: Step-by-step classification decisions
            - confidence: Assessment confidence (0-1)
            - data_sources: Sources used (e.g., MTBS, imagery date)
            - recommendations: BAER assessment recommendations
    """
    from assess_severity import execute
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "include_geometry": include_geometry,
    })


def classify_mtbs(fire_id: str, sectors: list[dict] | None = None, include_class_map: bool = False) -> dict:
    """
    Classify fire sectors using MTBS (Monitoring Trends in Burn Severity) protocol.

    Assigns standardized severity classes (1-4) to each sector based on dNBR values,
    following the official MTBS classification methodology.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors: Optional pre-loaded sector data with dNBR values.
                 If not provided, loads from Cedar Creek fixtures.
        include_class_map: Whether to include GeoJSON in response (default: False)

    Returns:
        Dictionary containing:
            - fire_id: The classified fire identifier
            - fire_name: Display name of the fire
            - total_acres: Total acres classified
            - classification_summary: Acres and percentage by MTBS class
            - sector_classifications: Sector-level class assignments
            - dominant_class: Most prevalent severity class
            - mtbs_metadata: MTBS source, imagery date, thresholds
            - reasoning_chain: Step-by-step classification decisions
    """
    from classify_mtbs import execute
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "include_class_map": include_class_map,
    })


def validate_boundary(fire_id: str, sectors: list[dict] | None = None, tolerance: float = 5.0) -> dict:
    """
    Validate fire perimeter geometry and calculate boundary statistics.

    Checks polygon validity, calculates perimeter length and area,
    and compares reported versus calculated acreage.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors: Optional pre-loaded sector data with geometry.
                 If not provided, loads from Cedar Creek fixtures.
        tolerance: Acreage discrepancy tolerance percentage (default: 5.0)

    Returns:
        Dictionary containing:
            - fire_id: The validated fire identifier
            - fire_name: Display name of the fire
            - total_perimeter_km: Combined perimeter length in kilometers
            - reported_acres: Official reported acreage
            - calculated_acres: Acreage computed from geometry
            - acreage_discrepancy_pct: Percentage difference
            - sector_boundaries: Per-sector boundary statistics
            - geometry_issues: List of detected geometry problems
            - validation_status: VALID, WARNING, or INVALID
            - reasoning_chain: Step-by-step validation decisions
    """
    from validate_boundary import execute
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "tolerance": tolerance,
    })


# Initialize Burn Analyst Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    description="Fire severity and burn analysis specialist for RANGER.",
    instruction="""
You are the RANGER Burn Analyst, a specialist in post-fire severity assessment
and burn impact analysis.

## Your Role
You are the domain expert for all burn severity questions. When the Coordinator
delegates a query to you, analyze it using your tools and domain knowledge.

## Your Expertise
- MTBS (Monitoring Trends in Burn Severity) classification
- dNBR (differenced Normalized Burn Ratio) interpretation
- Soil burn severity assessment
- Fire perimeter and boundary analysis
- Burn severity mapping and visualization

## Your Tools

### assess_severity
Use this tool when users ask about:
- Burn severity for a specific fire
- Soil burn severity assessment
- dNBR classification or interpretation
- BAER assessment data
- Fire impact on soil or watershed
- Priority areas for treatment

The tool uses standardized dNBR thresholds:
- UNBURNED: dNBR < 0.1 - No fire impact
- LOW: 0.1 ≤ dNBR < 0.27 - Light ground char, surface litter consumed
- MODERATE: 0.27 ≤ dNBR < 0.66 - Ground char, shrubs consumed
- HIGH: dNBR ≥ 0.66 - Deep char, tree mortality, white ash

### classify_mtbs
Use this tool when users ask about:
- MTBS classification or methodology
- Severity class numbers (1-4 scale)
- Fire severity mapping standards
- Comparison of sectors by MTBS class
- Official severity classification protocol

Returns standardized MTBS classes:
- Class 1: Unburned/Unchanged
- Class 2: Low Severity
- Class 3: Moderate Severity
- Class 4: High Severity

### validate_boundary
Use this tool when users ask about:
- Fire perimeter or boundary validation
- Acreage verification or discrepancies
- Geometry or GIS data quality
- Perimeter statistics (length, area)
- Sector boundary alignment

Validates polygon geometry and compares reported vs calculated acreage.

## Response Format
When presenting severity assessments:
1. Start with fire identification and total acreage
2. Present severity breakdown (acres and percentages by class)
3. Highlight priority sectors with specific concerns
4. Include key reasoning steps from the analysis
5. Provide BAER team recommendations
6. End with confidence level and data sources

## Communication Style
- Professional and data-driven
- Use USFS terminology appropriately
- Include specific numbers and percentages
- Cite sources (MTBS, imagery dates)
- Explain reasoning transparently

## Example Response Structure
When asked "What's the burn severity for Cedar Creek?":
1. Identify the fire and load data
2. Use assess_severity tool with fire_id
3. Present the severity breakdown clearly
4. Highlight the most critical sectors
5. Provide actionable recommendations
""",
    tools=[assess_severity, classify_mtbs, validate_boundary],
)

# Alias for backward compatibility
burn_analyst = root_agent

if __name__ == "__main__":
    print(f"Burn Analyst Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")

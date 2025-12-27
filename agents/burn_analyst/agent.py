"""
Burn Analyst Agent (Skills-First Edition)

Specialist agent for fire severity analysis, MTBS classification,
and soil burn severity assessment.

Per ADR-005: Skills-First Multi-Agent Architecture
MCP Integration: Uses McpToolset for data connectivity (Phase 4)

UPDATED: December 27, 2025 - Added mandatory tool invocation instructions
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add project root to path for agents.shared imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# MCP toolset for data connectivity (Phase 4)
try:
    from agents.shared.mcp_client import get_burn_analyst_toolset
    MCP_TOOLSET = get_burn_analyst_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None

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


def assess_severity(fire_id: str, sectors_json: str = "[]", include_geometry: bool = False) -> dict:
    """
    Assess soil burn severity for a fire incident.

    Analyzes dNBR (differenced Normalized Burn Ratio) values to classify
    burn severity and identify priority areas for BAER (Burned Area
    Emergency Response) assessment.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors_json: JSON array of sector data with dNBR values. Example:
            '[{"id": "sector-1", "dnbr": 0.45, "acres": 500}]'
            If empty, loads from Cedar Creek fixtures.
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
    import json
    from assess_severity import execute
    sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "include_geometry": include_geometry,
    })


def classify_mtbs(fire_id: str, sectors_json: str = "[]", include_class_map: bool = False) -> dict:
    """
    Classify fire sectors using MTBS (Monitoring Trends in Burn Severity) protocol.

    Assigns standardized severity classes (1-4) to each sector based on dNBR values,
    following the official MTBS classification methodology.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors_json: JSON array of sector data with dNBR values. Example:
            '[{"id": "sector-1", "dnbr": 0.45, "acres": 500}]'
            If empty, loads from Cedar Creek fixtures.
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
    import json
    from classify_mtbs import execute
    sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "include_class_map": include_class_map,
    })


def validate_boundary(fire_id: str, sectors_json: str = "[]", tolerance: float = 5.0) -> dict:
    """
    Validate fire perimeter geometry and calculate boundary statistics.

    Checks polygon validity, calculates perimeter length and area,
    and compares reported versus calculated acreage.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        sectors_json: JSON array of sector data with geometry. Example:
            '[{"id": "sector-1", "geometry": {...}, "reported_acres": 500}]'
            If empty, loads from Cedar Creek fixtures.
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
    import json
    from validate_boundary import execute
    sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
    return execute({
        "fire_id": fire_id,
        "sectors": sectors,
        "tolerance": tolerance,
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
before_tool_audit, after_tool_audit, on_tool_error_audit = create_audit_callbacks("burn_analyst")


# =============================================================================
# TIER 2: STRUCTURED REASONING INSTRUCTIONS (ReAct Pattern)
# =============================================================================

BURN_ANALYST_INSTRUCTION = """
You are the RANGER Burn Analyst, a specialist in post-fire severity assessment
and burn impact analysis for the USDA Forest Service.

## Your Role

You are the domain expert for all burn severity questions. When the Coordinator
delegates a query to you, you MUST analyze it using your tools and return
data-driven insights.

## ⚠️ MANDATORY TOOL USAGE - CRITICAL

**YOU MUST CALL A TOOL BEFORE RESPONDING TO ANY DOMAIN QUESTION.**

- DO NOT answer from general knowledge
- DO NOT say "I don't have data" or "Let me help you with that" without calling a tool first
- DO NOT generate generic responses
- ALWAYS call the appropriate tool first, even if you're uncertain it will return results

### Decision Tree - Which Tool to Call

**Question about burn severity, dNBR, soil impacts, or BAER assessment?**
→ CALL `assess_severity(fire_id="cedar-creek-2022")` FIRST

**Question about MTBS classification, severity classes (1-4), or mapping standards?**
→ CALL `classify_mtbs(fire_id="cedar-creek-2022")` FIRST

**Question about fire perimeter, boundary, acreage, or GIS data quality?**
→ CALL `validate_boundary(fire_id="cedar-creek-2022")` FIRST

**Question mentions a specific sector?**
→ Use `sectors_json` parameter with the sector data

### Fire ID Normalization

All of these refer to Cedar Creek fire - use `fire_id="cedar-creek-2022"`:
- "Cedar Creek"
- "cedar creek fire"
- "Cedar Creek Fire"
- "CC-2022"
- "cedar-creek"

### Available Sector IDs (Cedar Creek Dataset)

- Northwest sectors: `NW-1`, `NW-2`
- Northeast sectors: `NE-1`, `NE-2`
- Southwest sectors: `SW-1`, `SW-2`
- Southeast sector: `SE-1`
- Core area: `CORE-1`

If user asks about a sector not in this list, call the tool anyway with just
`fire_id` and report what sectors ARE available in the dataset.

## Tool Descriptions

### assess_severity
Assesses soil burn severity using dNBR thresholds:
- **UNBURNED**: dNBR < 0.1 - No fire impact
- **LOW**: 0.1 ≤ dNBR < 0.27 - Light ground char, surface litter consumed
- **MODERATE**: 0.27 ≤ dNBR < 0.66 - Ground char, shrubs consumed
- **HIGH**: dNBR ≥ 0.66 - Deep char, tree mortality, white ash

Returns: fire_id, fire_name, total_acres, severity_breakdown, sectors,
priority_sectors, reasoning_chain, confidence, data_sources, recommendations

### classify_mtbs
Classifies sectors using MTBS (Monitoring Trends in Burn Severity) protocol:
- **Class 1**: Unburned/Unchanged
- **Class 2**: Low Severity
- **Class 3**: Moderate Severity
- **Class 4**: High Severity

Returns: fire_id, fire_name, total_acres, classification_summary,
sector_classifications, dominant_class, mtbs_metadata, reasoning_chain

### validate_boundary
Validates fire perimeter geometry and calculates boundary statistics:
- Checks polygon validity
- Calculates perimeter length and area
- Compares reported vs calculated acreage
- Flags geometry issues

Returns: fire_id, fire_name, total_perimeter_km, reported_acres, calculated_acres,
acreage_discrepancy_pct, sector_boundaries, geometry_issues, validation_status,
reasoning_chain

## Response Format - REQUIRED STRUCTURE

After calling a tool, structure your response EXACTLY like this:

### 1. Summary (2-3 sentences)
State the key finding from the tool results.

### 2. Details
Present specific data from the tool:
- For severity: Acres and percentage by severity class
- For MTBS: Sectors by class with acreage
- For boundary: Perimeter stats and any discrepancies

### 3. Priority Areas
Highlight critical sectors from the tool's priority_sectors field.

### 4. Recommendations
Include the recommendations from the tool's output.

### 5. Confidence & Source
**Confidence:** [Use the confidence value from tool, e.g., "92%"]
**Source:** [Use the data_sources from tool, e.g., "MTBS imagery 2022-10-15"]

## What To Do If Tool Returns No Data

ONLY AFTER calling the tool and receiving empty or error results, you may explain:

"The Cedar Creek dataset doesn't include [specific sector]. The available
sectors in this dataset are: NW-1, NW-2, NE-1, NE-2, SW-1, SW-2, SE-1, and
CORE-1. Would you like me to assess one of these sectors instead?"

## Example Interaction

**User:** "What's the burn severity for Cedar Creek?"

**You should:**
1. CALL `assess_severity(fire_id="cedar-creek-2022")`
2. Wait for tool response
3. Format response using the tool's output:

"**Cedar Creek Burn Severity Assessment**

The Cedar Creek fire burned 24,850 acres with predominantly moderate to high
severity across the affected area.

**Severity Breakdown:**
- HIGH: 8,200 acres (33%) - Deep char, complete canopy loss
- MODERATE: 10,400 acres (42%) - Ground char, partial canopy loss
- LOW: 4,500 acres (18%) - Surface litter consumed
- UNBURNED: 1,750 acres (7%) - Islands within perimeter

**Priority Sectors:**
- CORE-1: 95% high severity, immediate BAER attention needed
- NW-1: 78% high severity, steep slopes increase erosion risk

**Recommendations:**
- Deploy BAER team to CORE-1 within 7-day assessment window
- Install erosion barriers on NW-1 steep slopes
- Schedule reforestation planning for high-severity areas

**Confidence:** 92%
**Source:** MTBS imagery 2022-10-15, field verification 2022-10-20"

## Communication Style

- Professional and data-driven
- Use USFS and MTBS terminology
- Include specific numbers, acreage, and percentages
- Cite data sources from tool output (imagery dates)
- Explain dNBR thresholds when relevant
- Provide actionable BAER recommendations
"""

# =============================================================================
# AGENT DEFINITION
# =============================================================================

root_agent = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    description="Fire severity and burn analysis specialist for RANGER.",

    # TIER 2: Structured reasoning instructions
    instruction=BURN_ANALYST_INSTRUCTION,

    # Skill tools
    tools=[
        # MCP tools for data connectivity (Phase 4)
        *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
        # Skill tools for domain expertise (ADR-005)
        assess_severity,
        classify_mtbs,
        validate_boundary,
    ],

    # TIER 1: API-level tool enforcement (mode="AUTO" eliminates infinite loop)
    generate_content_config=GENERATE_CONTENT_CONFIG,

    # TIER 3: Audit trail callbacks
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)

# Alias for backward compatibility
burn_analyst = root_agent

if __name__ == "__main__":
    print(f"Burn Analyst Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ if hasattr(t, '__name__') else type(t).__name__ for t in root_agent.tools]}")

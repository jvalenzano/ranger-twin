"""
Trail Assessor Agent (Skills-First Edition)

Specialist agent for trail damage assessment, closure decisions,
and recreation priority planning post-fire.

Per ADR-005: Skills-First Multi-Agent Architecture
MCP Integration: Uses McpToolset for data connectivity (Phase 4)

UPDATED: December 27, 2025 - Added mandatory tool invocation instructions
"""

import sys
import logging
from pathlib import Path
from datetime import datetime, timezone

from google.adk.agents import Agent
from google.genai import types

# Add project root to path for agents.shared imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Configure audit logging
logger = logging.getLogger("ranger.trail_assessor")

# MCP toolset for data connectivity (Phase 4)
try:
    from agents.shared.mcp_client import get_trail_assessor_toolset
    MCP_TOOLSET = get_trail_assessor_toolset()
except ImportError:
    # Fallback for local development without MCP
    MCP_TOOLSET = None

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Damage Classification skill
DAMAGE_PATH = SKILLS_DIR / "damage-classification" / "scripts"
if DAMAGE_PATH.exists():
    sys.path.insert(0, str(DAMAGE_PATH))

# Closure Decision skill
CLOSURE_PATH = SKILLS_DIR / "closure-decision" / "scripts"
if CLOSURE_PATH.exists():
    sys.path.insert(0, str(CLOSURE_PATH))

# Recreation Priority skill
PRIORITY_PATH = SKILLS_DIR / "recreation-priority" / "scripts"
if PRIORITY_PATH.exists():
    sys.path.insert(0, str(PRIORITY_PATH))


def classify_damage(fire_id: str, trail_id: str = "", damage_points_json: str = "[]") -> dict:
    """
    Classify trail damage into USFS Type I-IV categories.

    Analyzes damage severity and type to assign standardized damage classifications
    that determine repair priorities and resource allocation.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        trail_id: Specific trail to analyze (analyzes all if empty)
        damage_points_json: JSON array of damage point data. Example:
            '[{"trail_id": "TR-101", "location": "mile 2.3", "severity": 4, "type": "washout"}]'
            If empty, loads from Cedar Creek fixtures.

    Returns:
        Dictionary containing:
            - fire_id: The analyzed fire identifier
            - trails_assessed: Number of trails analyzed
            - damage_points: Classified damage points with type assignments
            - type_summary: Count and cost by Type I-IV
            - infrastructure_issues: Bridge and culvert damage summary
            - hazard_zones: High-risk areas requiring immediate attention
            - reasoning_chain: Step-by-step classification decisions
            - confidence: Assessment confidence (0-1)
            - data_sources: Sources used
            - recommendations: Damage mitigation recommendations
    """
    import json
    from classify_damage import execute
    damage_points = json.loads(damage_points_json) if damage_points_json and damage_points_json != "[]" else None
    return execute({
        "fire_id": fire_id,
        "trail_id": trail_id if trail_id else None,
        "damage_points": damage_points,
    })


def evaluate_closure(fire_id: str, trail_id: str = "", season: str = "summer") -> dict:
    """
    Determine risk-based trail closure recommendations.

    Calculates risk scores based on damage severity, hazard trees, infrastructure
    condition, and accessibility to recommend closure status for each trail.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        trail_id: Specific trail to analyze (analyzes all if empty)
        season: Season for risk adjustment (summer, fall, winter, spring)

    Returns:
        Dictionary containing:
            - fire_id: The analyzed fire identifier
            - trails_evaluated: Number of trails evaluated
            - closure_decisions: Risk scores and closure status per trail
            - risk_factors: Breakdown of contributing risk factors
            - reopening_timeline: Estimated timeline for each trail
            - seasonal_adjustments: Season-specific risk considerations
            - reasoning_chain: Step-by-step closure decisions
            - confidence: Assessment confidence (0-1)
            - data_sources: Sources used
            - recommendations: Closure and reopening recommendations
    """
    from evaluate_closure import execute
    return execute({
        "fire_id": fire_id,
        "trail_id": trail_id if trail_id else None,
        "season": season,
    })


def prioritize_trails(fire_id: str, budget: float = 0.0, include_quick_wins: bool = True) -> dict:
    """
    Prioritize trail repairs using multi-factor analysis.

    Evaluates trails based on usage, access value, cost-effectiveness, and
    strategic importance to create a prioritized repair schedule within budget.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        budget: Budget constraint in dollars (0 = no limit)
        include_quick_wins: Whether to identify quick-win opportunities (default: True)

    Returns:
        Dictionary containing:
            - fire_id: The analyzed fire identifier
            - total_trails: Number of trails analyzed
            - priority_ranking: Trails ranked by composite priority score
            - quick_wins: Low-cost, high-impact opportunities
            - resource_allocation: Budget allocation if budget provided
            - factor_scores: Usage, access, and cost scores per trail
            - reasoning_chain: Step-by-step prioritization decisions
            - confidence: Assessment confidence (0-1)
            - data_sources: Sources used
            - recommendations: Repair sequencing recommendations
    """
    from prioritize_trails import execute
    return execute({
        "fire_id": fire_id,
        "budget": budget if budget > 0 else None,
        "include_quick_wins": include_quick_wins,
    })


# =============================================================================
# TIER 1: API-LEVEL TOOL ENFORCEMENT (ADR-007.1)
# =============================================================================

# Import shared configuration with mode="AUTO" (eliminates infinite loop)
# Previously used mode="ANY" which caused infinite loops (ADR-007.1)
from agents.shared.config import GENERATE_CONTENT_CONFIG


# =============================================================================
# TIER 2: STRUCTURED REASONING INSTRUCTIONS (ReAct Pattern)
# =============================================================================

TRAIL_ASSESSOR_INSTRUCTION = """
You are the RANGER Trail Assessor, a specialist in post-fire trail damage
assessment and recreation infrastructure planning for the USDA Forest Service.

## Your Role

You provide data-driven trail damage assessments, closure recommendations,
and repair prioritization. You have three specialized tools that contain
actual assessment data.

## Reasoning Process (THINK → CALL → REASON → RESPOND)

**THINK:** Identify what data you need
- Damage/severity/repair costs → classify_damage
- Closures/safety/reopening → evaluate_closure
- Priorities/budgets/sequencing → prioritize_trails

**CALL:** Execute the appropriate tool
- The system enforces tool execution (API-level mode=ANY)
- Always use fire_id="cedar-creek-2022" for Cedar Creek queries

**REASON:** Interpret the tool response
- Read the status field (success/error/no_data)
- Extract key findings (damage_type, confidence, data_source)
- Note any limitations from the response

**RESPOND:** Ground your answer in tool data
- Include specific findings from the tool
- Cite the confidence score
- Reference the data source
- Include recommendations from the tool

### Decision Tree - Which Tool to Call

**Question about trail damage, severity, classification, or repair costs?**
→ CALL `classify_damage(fire_id="cedar-creek-2022")` FIRST

**Question about closures, safety, reopening, or public access?**
→ CALL `evaluate_closure(fire_id="cedar-creek-2022")` FIRST

**Question about repair priorities, budgets, or resource allocation?**
→ CALL `prioritize_trails(fire_id="cedar-creek-2022")` FIRST

**Question mentions a specific trail?**
→ Include the `trail_id` parameter (e.g., `trail_id="waldo-lake-3536"`)

### Fire ID Normalization

All of these refer to Cedar Creek fire - use `fire_id="cedar-creek-2022"`:
- "Cedar Creek"
- "cedar creek fire"
- "Cedar Creek Fire"
- "CC-2022"
- "cedar-creek"

### Available Trail IDs (Cedar Creek Dataset)

- Waldo Lake Trail #3536 → `trail_id="waldo-lake-3536"`
- Bobby Lake Trail #3526 → `trail_id="bobby-lake-3526"`
- Fuji Mountain Trail #3674 → `trail_id="fuji-mountain-3674"`
- Wahanna Trail #3521 → `trail_id="wahanna-3521"`
- Lillian Falls Trail #3618 → `trail_id="lillian-falls-3618"`

If user asks about a trail not in this list, call the tool anyway with just
`fire_id` and report what trails ARE available in the dataset.

## Tool Descriptions

### classify_damage
Classifies trail damage into USFS Type I-IV categories:
- **TYPE I (Minor)**: Severity 1-2, passable with caution
- **TYPE II (Moderate)**: Severity 3, significant erosion/damage
- **TYPE III (Major)**: Severity 4, structural failure
- **TYPE IV (Severe)**: Severity 5, complete destruction

Returns: trails_assessed, damage_points, type_summary, infrastructure_issues,
hazard_zones, reasoning_chain, confidence, data_sources, recommendations

### evaluate_closure
Determines risk-based closure recommendations:
- **OPEN**: Risk < 25 - Safe for public use
- **OPEN_CAUTION**: Risk 25-50 - Use with awareness
- **RESTRICTED**: Risk 50-75 - Limited access only
- **CLOSED**: Risk >= 75 - Unsafe, no access

Returns: trails_evaluated, closure_decisions, risk_factors, reopening_timeline,
reasoning_chain, confidence, data_sources, recommendations

### prioritize_trails
Ranks trails for repair using multi-factor analysis:
- Usage score (visitor traffic)
- Access score (connectivity, wilderness access)
- Cost-effectiveness (repair cost vs. benefit)
- Strategic value (economic, ecological, cultural)

Returns: total_trails, priority_ranking, quick_wins, factor_scores,
reasoning_chain, confidence, data_sources, recommendations

## Response Format - REQUIRED STRUCTURE

After calling a tool, structure your response EXACTLY like this:

### 1. Summary (2-3 sentences)
State the key finding from the tool results.

### 2. Details
Present specific data from the tool:
- For damage: List damage points with Type classifications
- For closures: List trails with status and risk scores
- For priorities: List ranked trails with scores

### 3. Recommendations
Include the recommendations from the tool's output.

### 4. Confidence & Source
**Confidence:** [Use the confidence value from tool, e.g., "90%"]
**Source:** [Use the data_sources from tool, e.g., "Field assessment 2022-10-25"]

## What To Do If Tool Returns No Data

ONLY AFTER calling the tool and receiving empty or error results, you may explain:

"The Cedar Creek dataset doesn't include [specific trail name]. The available
trails in this dataset are: Waldo Lake #3536, Bobby Lake #3526, Fuji Mountain
#3674, Wahanna #3521, and Lillian Falls #3618. Would you like me to assess
one of these trails instead?"

## Example Interaction

**User:** "What's the damage on Cedar Creek trails?"

**You should:**
1. CALL `classify_damage(fire_id="cedar-creek-2022")`
2. Wait for tool response
3. Format response using the tool's output:

"**Cedar Creek Trail Damage Assessment**

The Cedar Creek fire damaged 5 trails with 15 total damage points across
the affected area.

**Damage by Type:**
- TYPE IV (Severe): 2 points - $117,000 estimated repair
- TYPE III (Major): 4 points - $89,000 estimated repair
- TYPE II (Moderate): 5 points - $34,000 estimated repair
- TYPE I (Minor): 4 points - $12,000 estimated repair

**Critical Issues:**
- WL-001: Complete bridge failure at Waldo Lake Trail mile 2.3 (TYPE IV)
- BL-001: Bridge failure at Bobby Lake Trail mile 0.8 (TYPE IV)

**Recommendations:**
- Immediate attention to TYPE IV damage at WL-001, BL-001
- Deploy engineering team for bridge replacement assessment

**Confidence:** 90%
**Source:** Cedar Creek field assessment 2022-10-25"

## Communication Style

- Professional and safety-focused
- Use USFS trail terminology
- Include specific numbers, costs, and percentages
- Cite data sources from tool output
- Explain reasoning from the tool's reasoning_chain
- Prioritize public safety in all recommendations
"""


# =============================================================================
# TIER 3: AUDIT TRAIL CALLBACKS (ADR-007.1)
# =============================================================================

# Import shared audit callbacks that integrate with AuditEventBridge
# Replaces manual logging-only callbacks with proof layer integration
from agents.shared.callbacks import create_audit_callbacks

# Create callbacks for this agent
before_tool_audit, after_tool_audit, on_tool_error_audit = create_audit_callbacks("trail_assessor")


# =============================================================================
# AGENT DEFINITION - THREE-TIER IMPLEMENTATION
# =============================================================================

root_agent = Agent(
    name="trail_assessor",
    model="gemini-2.0-flash",
    description="Trail damage assessment and recreation priority specialist for RANGER.",

    # TIER 2: Structured reasoning instructions
    instruction=TRAIL_ASSESSOR_INSTRUCTION,

    # Skill tools
    tools=[
        # MCP tools for data connectivity (Phase 4)
        *([] if MCP_TOOLSET is None else [MCP_TOOLSET]),
        # Skill tools for domain expertise (ADR-005)
        classify_damage,
        evaluate_closure,
        prioritize_trails,
    ],

    # TIER 1: API-level tool enforcement
    generate_content_config=GENERATE_CONTENT_CONFIG,

    # TIER 3: Audit trail callbacks
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)

# Alias for backward compatibility
trail_assessor = root_agent

if __name__ == "__main__":
    print(f"Trail Assessor Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ if hasattr(t, '__name__') else type(t).__name__ for t in root_agent.tools]}")

"""
Trail Assessor Agent - Three-Tier Tool Invocation Reference Implementation

This is the reference implementation for ADR-007: Three-Tier Tool Invocation Strategy.

TIER 1: API-Level Enforcement (mode="ANY")
TIER 2: Structured Reasoning Instructions (ReAct pattern)
TIER 3: Audit Trail (logging callbacks)

Use this as the template for all specialist agents.
"""

import sys
import logging
from pathlib import Path
from datetime import datetime, timezone

from google.adk.agents import Agent
from google.genai import types

# Configure audit logging
logger = logging.getLogger("ranger.trail_assessor")

# =============================================================================
# SKILL TOOL IMPORTS
# =============================================================================

SKILLS_DIR = Path(__file__).parent / "skills"

DAMAGE_PATH = SKILLS_DIR / "damage-classification" / "scripts"
if DAMAGE_PATH.exists():
    sys.path.insert(0, str(DAMAGE_PATH))

CLOSURE_PATH = SKILLS_DIR / "closure-decision" / "scripts"
if CLOSURE_PATH.exists():
    sys.path.insert(0, str(CLOSURE_PATH))

PRIORITY_PATH = SKILLS_DIR / "recreation-priority" / "scripts"
if PRIORITY_PATH.exists():
    sys.path.insert(0, str(PRIORITY_PATH))


# =============================================================================
# SKILL TOOL DEFINITIONS
# =============================================================================

def classify_damage(fire_id: str, trail_id: str = "", damage_points_json: str = "[]") -> dict:
    """
    Classify trail damage into USFS Type I-IV categories.
    
    This tool MUST be called for any question about trail damage, severity,
    repair costs, or damage classification.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        trail_id: Specific trail to analyze (analyzes all if empty)
        damage_points_json: JSON array of damage point data (loads fixtures if empty)

    Returns:
        Dictionary with trails_assessed, damage_points, type_summary, 
        reasoning_chain, confidence, data_sources, recommendations
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
    
    This tool MUST be called for any question about trail closures, safety,
    reopening timelines, or public access.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        trail_id: Specific trail to analyze (analyzes all if empty)
        season: Season for risk adjustment (summer, fall, winter, spring)

    Returns:
        Dictionary with trails_evaluated, closure_decisions, risk_factors,
        reopening_timeline, reasoning_chain, confidence, data_sources
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
    
    This tool MUST be called for any question about repair priorities, budgets,
    resource allocation, or repair sequencing.

    Args:
        fire_id: Unique fire identifier (e.g., "cedar-creek-2022")
        budget: Budget constraint in dollars (0 = no limit)
        include_quick_wins: Whether to identify quick-win opportunities

    Returns:
        Dictionary with priority_ranking, quick_wins, factor_scores,
        reasoning_chain, confidence, data_sources, recommendations
    """
    from prioritize_trails import execute
    return execute({
        "fire_id": fire_id,
        "budget": budget if budget > 0 else None,
        "include_quick_wins": include_quick_wins,
    })


# =============================================================================
# TIER 1: API-LEVEL TOOL ENFORCEMENT
# =============================================================================

# Define which tools are allowed and REQUIRE at least one to be called
TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="ANY",  # CRITICAL: API rejects text-only responses
        allowed_function_names=[
            "classify_damage",
            "evaluate_closure",
            "prioritize_trails",
        ]
    )
)

GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    tool_config=TOOL_CONFIG,
    temperature=0.1,  # Lower temperature for more deterministic tool selection
)


# =============================================================================
# TIER 2: STRUCTURED REASONING INSTRUCTIONS (ReAct Pattern)
# =============================================================================

TRAIL_ASSESSOR_INSTRUCTION = """
You are the RANGER Trail Assessor, a specialist in post-fire trail damage
assessment for the USDA Forest Service.

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
- The system enforces tool execution
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

## Fire ID Normalization

These all refer to Cedar Creek - use fire_id="cedar-creek-2022":
- "Cedar Creek", "cedar creek fire", "CC-2022", "cedar-creek"

## Available Trail IDs

- Waldo Lake Trail #3536 → trail_id="waldo-lake-3536"
- Bobby Lake Trail #3526 → trail_id="bobby-lake-3526"
- Fuji Mountain Trail #3674 → trail_id="fuji-mountain-3674"
- Wahanna Trail #3521 → trail_id="wahanna-3521"
- Lillian Falls Trail #3618 → trail_id="lillian-falls-3618"

## Response Format

After receiving tool results, structure your response as:

**Finding:** [Main conclusion from tool data]
**Details:** [Specific data points from tool]
**Recommendations:** [From tool's recommendations field]
**Confidence:** [From tool's confidence field, e.g., "90%"]
**Source:** [From tool's data_sources field]

## Handling Tool Responses

If tool returns success: Use the data to form your response
If tool returns no_data: Explain what data is available instead
If tool returns error: Report the error and suggest alternatives

Never respond with general knowledge when tool data is available.
"""


# =============================================================================
# TIER 3: AUDIT TRAIL CALLBACKS
# =============================================================================

def before_tool_audit(tool, args, tool_context):
    """Log tool invocation for audit trail."""
    logger.info(
        "TOOL_INVOCATION",
        extra={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": "trail_assessor",
            "tool": tool.name if hasattr(tool, 'name') else str(tool),
            "parameters": args,
            "session_id": getattr(tool_context, 'session_id', 'unknown'),
            "enforcement": "API-level mode=ANY"
        }
    )
    return None  # Continue with tool execution


def after_tool_audit(tool, args, tool_context, response):
    """Log tool response for audit trail."""
    confidence = response.get('confidence', 'unknown') if isinstance(response, dict) else 'unknown'
    data_sources = response.get('data_sources', []) if isinstance(response, dict) else []
    status = response.get('status', 'unknown') if isinstance(response, dict) else 'unknown'
    
    logger.info(
        "TOOL_RESPONSE",
        extra={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": "trail_assessor",
            "tool": tool.name if hasattr(tool, 'name') else str(tool),
            "status": status,
            "confidence": confidence,
            "data_sources": data_sources,
        }
    )
    return None  # Use original response


def on_tool_error_audit(tool, args, tool_context, error):
    """Log tool errors for audit trail and graceful handling."""
    logger.error(
        "TOOL_ERROR",
        extra={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": "trail_assessor",
            "tool": tool.name if hasattr(tool, 'name') else str(tool),
            "parameters": args,
            "error": str(error),
        }
    )
    # Return graceful error response instead of crashing
    return {
        "status": "error",
        "error_message": f"Tool execution failed: {str(error)}",
        "recommendations": ["Please try again or contact support."],
        "confidence": 0.0,
        "data_sources": [],
    }


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
    print(f"Trail Assessor Agent (Three-Tier) initialized")
    print(f"  Name: {root_agent.name}")
    print(f"  Model: {root_agent.model}")
    print(f"  Tool Enforcement: mode='ANY' (API-level)")
    print(f"  Tools: {[t.__name__ for t in root_agent.tools if hasattr(t, '__name__')]}")
    print(f"  Audit Callbacks: before_tool, after_tool, on_tool_error")

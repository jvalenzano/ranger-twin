"""
Trail Assessor Agent (Skills-First Edition)

Specialist agent for trail damage assessment, closure decisions,
and recreation priority planning post-fire.

Per ADR-005: Skills-First Multi-Agent Architecture
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

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


# Initialize Trail Assessor Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="trail_assessor",
    model="gemini-2.0-flash",
    description="Trail damage assessment and recreation priority specialist for RANGER.",
    instruction="""
You are the RANGER Trail Assessor, a specialist in post-fire trail damage
assessment and recreation infrastructure planning.

## Your Role
You are the domain expert for all trail damage and recreation planning questions.
When the Coordinator delegates a query to you, analyze it using your tools and
domain knowledge.

## Your Expertise
- USFS trail damage classification (Type I-IV)
- Risk-based closure decision analysis
- Trail repair prioritization
- Recreation infrastructure assessment
- Bridge and culvert damage evaluation
- Hazard tree identification
- Resource allocation and budget planning

## Your Tools

### classify_damage
Use this tool when users ask about:
- Trail damage assessment or classification
- Specific damage points or severity
- Infrastructure damage (bridges, culverts)
- Damage type categorization
- Repair cost estimates
- Hazard zones or high-risk areas

The tool uses USFS damage type standards:
- TYPE I (Minor): Severity 1-2, passable with caution
- TYPE II (Moderate): Severity 3, significant erosion/damage
- TYPE III (Major): Severity 4, structural failure
- TYPE IV (Severe): Severity 5, complete destruction

### evaluate_closure
Use this tool when users ask about:
- Trail closure decisions or recommendations
- Trail safety or risk assessment
- Reopening timelines or schedules
- Seasonal access considerations
- Public safety concerns
- Closure status for specific trails

Returns risk-based closure recommendations:
- OPEN: Risk < 25 - Safe for public use
- OPEN_CAUTION: Risk 25-50 - Use with awareness
- RESTRICTED: Risk 50-75 - Limited access only
- CLOSED: Risk >= 75 - Unsafe, no access

### prioritize_trails
Use this tool when users ask about:
- Trail repair priorities or sequencing
- Budget allocation or resource planning
- Quick-win opportunities
- Trail ranking by importance
- Usage-based prioritization
- Cost-effectiveness analysis
- Multi-year repair planning

Evaluates trails based on:
- Usage score (visitor traffic, seasonal patterns)
- Access score (connectivity, alternatives, wilderness access)
- Cost-effectiveness (repair cost vs. benefit)
- Strategic value (economic, ecological, cultural)

## Response Format
When presenting trail assessments:
1. Start with fire identification and number of trails assessed
2. Present damage classification or risk scores clearly
3. Highlight critical damage points or high-priority trails
4. Include key reasoning steps from the analysis
5. Provide actionable recommendations for trail managers
6. End with confidence level and data sources

## Communication Style
- Professional and safety-focused
- Use USFS trail terminology appropriately
- Include specific numbers and cost estimates
- Cite sources (field assessments, damage dates)
- Explain reasoning transparently
- Prioritize public safety in all recommendations

## Example Response Structure
When asked "What trails need to be closed after Cedar Creek?":
1. Identify the fire and load trail damage data
2. Use evaluate_closure tool with fire_id
3. Present the closure decisions clearly with risk scores
4. Highlight the most critical safety concerns
5. Provide reopening timeline estimates
6. Recommend mitigation actions
""",
    tools=[classify_damage, evaluate_closure, prioritize_trails],
)

# Alias for backward compatibility
trail_assessor = root_agent

if __name__ == "__main__":
    print(f"Trail Assessor Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")

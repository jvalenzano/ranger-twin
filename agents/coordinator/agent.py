"""
Recovery Coordinator Agent (Skills-First Edition)

The root orchestrator for the RANGER platform, using the Google ADK.
This agent is responsible for delegating queries to specialty agents
and synthesizing domain-specific skills for cross-functional insights.

Per ADR-005: Skills-First Multi-Agent Architecture

Sub-Agents:
    - burn_analyst: Fire severity, MTBS classification, soil burn severity
    - trail_assessor: Trail damage, closures, recreation infrastructure
    - cruising_assistant: Timber inventory, volume estimation, salvage
    - nepa_advisor: NEPA compliance, CE/EA/EIS pathway decisions
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Import specialist agents for multi-agent orchestration
# Note: Using relative imports within agents/ directory
AGENTS_DIR = Path(__file__).parent.parent
if str(AGENTS_DIR) not in sys.path:
    sys.path.insert(0, str(AGENTS_DIR))

from burn_analyst.agent import root_agent as burn_analyst
from trail_assessor.agent import root_agent as trail_assessor
from cruising_assistant.agent import root_agent as cruising_assistant
from nepa_advisor.agent import root_agent as nepa_advisor

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Portfolio Triage skill
TRIAGE_PATH = SKILLS_DIR / "portfolio-triage" / "scripts"
if TRIAGE_PATH.exists():
    sys.path.insert(0, str(TRIAGE_PATH))

# Delegation skill
DELEGATION_PATH = SKILLS_DIR / "delegation" / "scripts"
if DELEGATION_PATH.exists():
    sys.path.insert(0, str(DELEGATION_PATH))


def portfolio_triage(fires_json: str, top_n: int = 0) -> dict:
    """
    Calculate portfolio triage scores for BAER prioritization.

    Prioritizes fire incidents based on severity, size, and phase in the
    recovery lifecycle. Uses the RANGER 4-phase model (active, baer_assessment,
    baer_implementation, in_restoration) with weighted scoring.

    Args:
        fires_json: JSON array of fire objects. Example:
            '[{"id": "cedar-creek", "name": "Cedar Creek Fire", "severity": "high", "acres": 12000, "phase": "baer_assessment"}]'
        top_n: Limit on number of results (0 = all fires)

    Returns:
        Dictionary containing:
            - ranked_fires: Fires sorted by triage score (highest priority first)
            - reasoning_chain: Step-by-step explanation of each fire's ranking
            - confidence: Overall confidence in the ranking (0-1)
            - summary: Brief portfolio overview for briefings
    """
    import json
    from calculate_priority import execute
    fires = json.loads(fires_json) if fires_json else []
    return execute({"fires": fires, "top_n": top_n if top_n > 0 else None})


def delegate_query(query: str, context_json: str = "{}") -> dict:
    """
    Route a user query to the appropriate specialist agent.

    Analyzes the query content to determine whether it should be handled by
    the Coordinator directly or delegated to a specialist: Burn Analyst,
    Trail Assessor, Cruising Assistant, or NEPA Advisor.

    Args:
        query: The user's natural language query
        context_json: JSON string with session context. Example:
            '{"active_fire": "cedar-creek-2022", "previous_agent": "burn-analyst"}'

    Returns:
        Dictionary containing:
            - target_agent: Recommended agent (coordinator, burn-analyst, trail-assessor, cruising-assistant, nepa-advisor)
            - confidence: Routing confidence (0-1)
            - reasoning: Explanation of routing decision
            - matched_keywords: Domain keywords found in query
            - fallback_agents: Alternative agents if primary is unavailable
            - requires_synthesis: Whether response needs multi-agent synthesis
            - synthesis_agents: List of agents needed for synthesis (if applicable)
    """
    import json
    from route_query import execute
    context = json.loads(context_json) if context_json else {}
    return execute({"query": query, "context": context})


# =============================================================================
# TIER 1: API-LEVEL TOOL ENFORCEMENT (ADR-007.1)
# =============================================================================

# Import shared configuration with mode="AUTO" (eliminates infinite loop)
from agents.shared.config import GENERATE_CONTENT_CONFIG


# =============================================================================
# TIER 3: AUDIT TRAIL CALLBACKS (ADR-007.1)
# =============================================================================

# Import shared audit callbacks for transparency (optional for coordinator)
# Coordinator does NOT use validation layer - routing flexibility is intentional
from agents.shared.callbacks import create_audit_callbacks

# Create callbacks for audit trail visibility
before_tool_audit, after_tool_audit, on_tool_error_audit = create_audit_callbacks("coordinator")


# =============================================================================
# AGENT DEFINITION
# =============================================================================

# Initialize Coordinator Agent
# Export as `root_agent` per ADK convention for `adk run` command
root_agent = Agent(
    name="coordinator",
    model="gemini-2.0-flash",
    description="Root orchestrator for RANGER post-fire recovery platform.",

    # TIER 2: Basic orchestration instructions (intentionally flexible)
    instruction="""
You are the RANGER Recovery Coordinator, the central intelligence hub for
post-fire forest recovery operations.

## Your Role
You are the first point of contact for all user queries. Your job is to:
1. Understand what the user needs
2. Use your Portfolio Triage skill for fire prioritization questions
3. Delegate specialized queries to the appropriate specialist agent
4. Synthesize responses from multiple specialists when needed
5. Provide actionable recovery briefings

## Your Tools

### portfolio_triage
Use this tool when users ask about:
- Which fires need attention first
- BAER triage or prioritization
- Fire ranking or priority ordering
- Resource allocation across fires
- Portfolio summaries

The tool calculates a triage score using:
- Severity Weight: critical=4, high=3, moderate=2, low=1
- Normalized Acres: acres/10000 (capped at 50 for 500k+ acre fires)
- Phase Multiplier: active=2.0, baer_assessment=1.75, baer_implementation=1.25, in_restoration=1.0

Formula: Triage Score = Severity × Normalized Acres × Phase Multiplier

### delegate_query
Use this tool to determine which specialist agent should handle a query.
It analyzes the query and returns:
- target_agent: Which agent should handle this (may be yourself for greetings, portfolio questions)
- confidence: How confident the routing decision is (0-1)
- reasoning: Why this agent was selected
- requires_synthesis: Whether multiple specialists are needed

Use this when you need to decide whether to handle something yourself or delegate.

## Specialist Agents You Can Delegate To
- **burn-analyst**: Fire severity, MTBS classification, soil burn severity
- **trail-assessor**: Trail damage, closures, recreation infrastructure
- **cruising-assistant**: Timber inventory, volume estimation, salvage viability
- **nepa-advisor**: NEPA compliance, CE/EA/EIS pathways, documentation

## Communication Style
- Professional and mission-focused
- Clear and actionable
- Include confidence levels and citations when available
- Use USFS terminology appropriately

## Response Format
Always structure your responses with:
1. Direct answer to the user's question
2. Key supporting details (include reasoning chain from tools when available)
3. Recommended next steps (if applicable)
4. Confidence level and data sources
""",
    # Orchestration tools
    tools=[portfolio_triage, delegate_query],

    # Specialist agents for delegation
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor],

    # TIER 1: API-level tool enforcement (mode="AUTO" allows flexible routing)
    generate_content_config=GENERATE_CONTENT_CONFIG,

    # TIER 3: Audit trail callbacks (for transparency, NO validation layer)
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)

# Alias for backward compatibility
coordinator = root_agent

if __name__ == "__main__":
    print(f"Coordinator Agent '{root_agent.name}' initialized.")
    print(f"Model: {root_agent.model}")
    print(f"Description: {root_agent.description}")
    print(f"Tools: {[t.__name__ for t in root_agent.tools]}")
    print(f"Sub-agents: {[a.name for a in root_agent.sub_agents]}")

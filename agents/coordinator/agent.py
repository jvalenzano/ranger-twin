"""
Recovery Coordinator Agent (Skills-First Edition)

The root orchestrator for the RANGER platform, using the Google ADK.
This agent calls specialist agents as tools (AgentTool pattern) to retain
control of the conversation while leveraging domain expertise.

Per ADR-005: Skills-First Multi-Agent Architecture
Pattern: AgentTool wrappers (NOT sub_agents - coordinator retains control)

Specialist Tools:
    - burn_analyst_tool: Fire severity, MTBS classification, soil burn severity
    - trail_assessor_tool: Trail damage, closures, recreation infrastructure
    - cruising_assistant_tool: Timber inventory, volume estimation, salvage
    - nepa_advisor_tool: NEPA compliance, CE/EA/EIS pathway decisions
"""

import sys
from pathlib import Path

from google.adk.agents import Agent
from google.adk.tools import AgentTool

# Add project root to path for agents.shared imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import specialist agents for multi-agent orchestration
# Note: Using relative imports within agents/ directory
AGENTS_DIR = Path(__file__).parent.parent
if str(AGENTS_DIR) not in sys.path:
    sys.path.insert(0, str(AGENTS_DIR))

from burn_analyst.agent import root_agent as burn_analyst
from trail_assessor.agent import root_agent as trail_assessor
from cruising_assistant.agent import root_agent as cruising_assistant
from nepa_advisor.agent import root_agent as nepa_advisor

# Wrap specialists as AgentTools (coordinator retains control)
burn_analyst_tool = AgentTool(agent=burn_analyst)
trail_assessor_tool = AgentTool(agent=trail_assessor)
cruising_assistant_tool = AgentTool(agent=cruising_assistant)
nepa_advisor_tool = AgentTool(agent=nepa_advisor)

# Add skill scripts to path for dynamic loading
SKILLS_DIR = Path(__file__).parent / "skills"

# Portfolio Triage skill
TRIAGE_PATH = SKILLS_DIR / "portfolio-triage" / "scripts"
if TRIAGE_PATH.exists():
    sys.path.insert(0, str(TRIAGE_PATH))

# Note: Delegation skill no longer used with AgentTool pattern


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


# NOTE: delegate_query() function removed - no longer needed with AgentTool pattern.
# Coordinator now calls specialist tools directly instead of using delegation routing.


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

    # TIER 2: Orchestration instructions with explicit tool usage guidance
    instruction="""
You are the RANGER Recovery Coordinator, the central intelligence hub for
post-fire forest recovery operations.

## Your Role
You orchestrate recovery analysis by calling specialist tools and synthesizing
their outputs into actionable briefings. You coordinate—you don't guess.

## Query Handling Protocol

### Single-Domain Queries
Call the appropriate specialist tool based on the query domain:

- **burn_analyst**: Call for burn severity, fire impact, MTBS classification, soil burn severity, dNBR analysis
  - Examples: "What is the burn severity?", "Show me MTBS classification", "Assess soil burn severity"

- **trail_assessor**: Call for trail damage, infrastructure impacts, closure decisions, recreation access
  - Examples: "Which trails are damaged?", "Should we close this trail?", "Recreation infrastructure status"

- **cruising_assistant**: Call for timber salvage, volume estimates, merchantable timber, salvage windows
  - Examples: "Estimate timber volume", "Is salvage viable?", "What's the salvage window?"

- **nepa_advisor**: Call for NEPA compliance, CE/EA/EIS pathways, environmental review, regulatory timelines
  - Examples: "What NEPA pathway?", "Do we need an EIS?", "Compliance timeline"

### Multi-Domain Queries
For "recovery briefing", "status update", or questions spanning multiple domains:
1. Call ALL FOUR specialist tools sequentially (burn_analyst, trail_assessor, cruising_assistant, nepa_advisor)
2. Synthesize their outputs into a coherent briefing
3. Highlight cross-domain dependencies (e.g., "bridge repair unlocks timber access")
4. Include specific numbers and confidence scores from each specialist

### Portfolio Queries
Use `portfolio_triage` for fire prioritization questions:
- "Which fires need attention first?"
- "BAER triage for active fires"
- "Prioritize these incidents"

Triage Score Formula: Severity × (Acres/10000) × Phase Multiplier

## Recovery Briefing Protocol

When asked for:
- "Recovery briefing"
- "Summary for my supervisor"
- "Status update on [fire name]"
- "Give me a comprehensive overview"
- "Brief me on [fire name]"

You MUST call ALL FOUR specialist tools in sequence:

1. **burn_analyst_tool**
   - Fire severity assessment (MTBS classification, acres by severity class)
   - Soil burn severity and watershed impacts
   - Boundary verification and fire perimeter data

2. **trail_assessor_tool**
   - Infrastructure damage status (trails closed, damage points, Type I-IV classification)
   - Closure decisions and public safety assessments
   - Repair cost estimates and prioritization

3. **cruising_assistant_tool**
   - Timber salvage viability (volume estimates, deterioration timelines)
   - Economic analysis (MBF estimates, salvage windows, species breakdown)
   - Harvest prioritization and access constraints

4. **nepa_advisor_tool**
   - Compliance pathway recommendation (CE/EA/EIS determination)
   - Required documentation and specialist reports
   - Timeline estimates and regulatory milestones

After calling all four tools, synthesize their responses into a unified briefing with this structure:

**Fire Severity:** [Burn Analyst findings with acreage breakdown by severity class]
**Infrastructure Damage:** [Trail Assessor findings with closure count and repair priorities]
**Timber Salvage:** [Cruising Assistant volume estimates and economic viability]
**NEPA Pathway:** [NEPA Advisor recommendation with regulatory citations]
**Overall Confidence:** [Lowest confidence among the four specialists]%
**Recommended Actions:** [Prioritized next steps integrating all four domains]

**Do not skip any specialist.** A recovery briefing is incomplete without all four domains.
If a specialist returns an error or no data, note this in your briefing but still call
all other specialists to provide comprehensive coverage.

## Critical Rules

1. **NEVER answer domain questions from general knowledge** - ALWAYS call the appropriate specialist tool
2. **For recovery briefings, call ALL FOUR specialists** - comprehensive coverage required
3. **Preserve exact confidence values from specialist outputs**
   - Format as percentage with label: "Confidence: 92%" (not "Confidence: 0.92" or "high confidence")
   - Use specialist's confidence, not your own assessment
   - If synthesizing multiple specialists, report the lowest confidence value
   - Extract confidence from tool result JSON (e.g., tool returns `"confidence": 0.92`, you say "Confidence: 92%")
4. **Include citations** from specialist responses in your synthesis
5. **After calling specialists, synthesize** - don't just repeat their outputs

## Response Format

After gathering specialist outputs:
1. **Lead with the most critical finding** (often from burn_analyst)
2. **Cross-domain insights**: Show how domains interconnect
3. **Specific data**: Include acres, severity classes, closure counts, MBF estimates
4. **Confidence scores**: State each specialist's confidence (e.g., "Burn: 92%, Timber: 85%")
5. **Recommended actions**: Prioritized next steps based on all specialist inputs

## Example Flow

User: "Give me a recovery briefing for Cedar Creek"

You should:
1. Call burn_analyst(fire_id="cedar-creek-2022")
2. Call trail_assessor(fire_id="cedar-creek-2022")
3. Call cruising_assistant(fire_id="cedar-creek-2022")
4. Call nepa_advisor(fire_id="cedar-creek-2022")
5. Synthesize: "Cedar Creek (12,334 acres) shows 45% high severity burn (Confidence: 92%).
   Three trail segments require immediate closure due to hazard trees (Confidence: 88%).
   Salvage window: 18-24 months, estimated 2.5 MBF merchantable (Confidence: 85%).
   NEPA: Categorical Exclusion pathway viable for trail work, EA required for timber (Confidence: 78%).

   Recommended actions:
   - Deploy BAER team to high-severity sectors NW-1, NW-2 (immediate)
   - Close Trail #405, #406, #407 pending hazard tree assessment (this week)
   - Initiate timber cruise for salvage feasibility (within 30 days)
   - Begin CE documentation for trail repairs (parallel track)"
""",
    # Coordinator tools: specialist agents (as callable tools) + portfolio management
    tools=[
        burn_analyst_tool,
        trail_assessor_tool,
        cruising_assistant_tool,
        nepa_advisor_tool,
        portfolio_triage,
    ],

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
    print(f"Tools: {[t.__name__ if hasattr(t, '__name__') else type(t).__name__ for t in root_agent.tools]}")

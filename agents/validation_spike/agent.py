"""
Validation Spike: Multi-Agent Wiring Test

This temporary agent configuration tests:
1. Coordinator with sub_agents wiring
2. SSE event format when delegating to specialists
3. Event author field format

Run with: adk web --port 8001
Test URL: http://localhost:8001
"""

import sys
from pathlib import Path

from google.adk.agents import Agent

# Add parent directory for importing other agents
AGENTS_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(AGENTS_DIR))

# Import specialist agents
from burn_analyst.agent import root_agent as burn_analyst
from trail_assessor.agent import root_agent as trail_assessor


# Create a multi-agent coordinator with sub_agents
root_agent = Agent(
    name="recovery_coordinator",
    model="gemini-2.0-flash",
    description="Multi-agent coordinator for RANGER - delegates to specialists",
    instruction="""
You are the Recovery Coordinator for USFS forest recovery operations.

## Your Role
When a user asks about fire severity, burn analysis, or MTBS data:
- Transfer to the burn_analyst sub-agent

When a user asks about trails, closures, or recreation damage:
- Transfer to the trail_assessor sub-agent

For general questions or portfolio-level queries:
- Answer directly using your knowledge

## Transfer Instructions
To delegate a query, you can transfer control to a sub-agent.
The sub-agent will handle the specialized analysis and return results.

Always acknowledge receipt of the query before transferring if appropriate.
""",
    sub_agents=[burn_analyst, trail_assessor],
    tools=[],  # No local tools - pure delegation
)


if __name__ == "__main__":
    print(f"Validation Spike Agent: {root_agent.name}")
    print(f"Sub-agents: {[a.name for a in root_agent.sub_agents]}")
    print("\nRun with: adk web --port 8001")
    print("Then query: 'What is the burn severity for Cedar Creek?'")

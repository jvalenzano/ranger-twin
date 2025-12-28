# RANGER Agents

ADK-based agents implementing the Skills-First architecture for forest recovery coordination.

## Overview

RANGER uses a multi-agent architecture where a Recovery Coordinator orchestrates specialist agents, each enhanced with domain-specific Skills. All agents run on the Google ADK framework with Gemini 2.0 Flash.

## Agent Roster

| Agent | Directory | Role | Model |
|-------|-----------|------|-------|
| **Recovery Coordinator** | `coordinator/` | Mission orchestration, delegation | gemini-2.0-flash |
| **Burn Analyst** | `burn_analyst/` | Fire severity, MTBS classification | gemini-2.0-flash |
| **Trail Assessor** | `trail_assessor/` | Infrastructure damage, closures | gemini-2.0-flash |
| **Cruising Assistant** | `cruising_assistant/` | Timber inventory, salvage | gemini-2.0-flash |
| **NEPA Advisor** | `nepa_advisor/` | Regulatory compliance, CE/EA/EIS | gemini-2.5-flash |

## Directory Structure

```
agents/
├── coordinator/           # Root orchestrator (entry point)
│   ├── agent.py           #   Agent definition
│   ├── skills/            #   Coordinator-specific skills
│   └── tests/             #   Agent tests
│
├── burn_analyst/          # Fire severity specialist
├── trail_assessor/        # Infrastructure specialist
├── cruising_assistant/    # Timber specialist
├── nepa_advisor/          # Compliance specialist
│
├── shared/                # Shared utilities across agents
│   ├── audit_bridge.py    #   Audit trail handling
│   ├── callbacks.py       #   ADK callbacks
│   └── mcp_client.py      #   MCP connectivity
│
├── docs/                  # Agent-specific documentation
│
└── validation_spike/      # Validation testing (experimental)
```

## Running Agents

### ADK Web Interface

```bash
cd agents
adk web --port 8000
# → http://localhost:8000
```

### ADK CLI

```bash
cd agents
adk run coordinator
```

### FastAPI Orchestrator

```bash
python main.py
# → http://localhost:8000
```

## Testing

```bash
# All agent tests
pytest agents/ -v

# Single agent
pytest agents/coordinator/ -v

# Shared utilities
pytest agents/shared/ -v
```

## Agent Pattern (ADR-008)

Agents use the `AgentTool` pattern where the Coordinator calls specialists as tools:

```python
from google.adk.agents import AgentTool

burn_analyst_tool = AgentTool(
    agent=burn_analyst_agent,
    name="burn_analyst",
    description="Analyze burn severity...",
)
```

This ensures the Coordinator retains control and can synthesize results.

## Tool Invocation (ADR-007.1)

All agents use `mode="AUTO"` (never `mode="ANY"`) to prevent infinite loops:

```python
agent = Agent(
    model="gemini-2.0-flash",
    name="coordinator",
    tools=[...],
    generate_content_config=GenerateContentConfig(
        tool_config=ToolConfig(mode="AUTO")  # Critical!
    ),
)
```

## References

- **ADR-005:** Skills-First Architecture
- **ADR-007.1:** Tool Invocation Strategy
- **ADR-008:** AgentTool Pattern
- **Runbook:** `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md`

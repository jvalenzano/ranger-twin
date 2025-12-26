# agent-common

> Shared utilities for AI agents in Project RANGER

## Overview

Common utilities, base classes, and prompts shared across all AI agents. Provides consistent patterns for agent implementation, response formatting, and inter-agent communication.

## Installation

```bash
pip install -e packages/agent-common
```

## Structure

```
agent_common/
├── __init__.py
├── base/
│   ├── __init__.py
│   ├── agent.py             # BaseAgent class
│   ├── tool.py              # BaseTool class
│   └── response.py          # Response models
├── prompts/
│   ├── __init__.py
│   ├── loader.py            # Prompt template loader
│   └── templates/
│       ├── confidence.md    # Confidence scoring prompt
│       ├── citation.md      # Citation formatting prompt
│       └── suggestion.md    # Follow-up suggestion prompt
├── clients/
│   ├── __init__.py
│   ├── gemini.py            # Gemini API client wrapper
│   └── agent.py             # Inter-agent communication
├── utils/
│   ├── __init__.py
│   ├── formatting.py        # Response formatting
│   └── validation.py        # Input validation
└── types/
    ├── __init__.py
    └── responses.py         # Shared response types
```

## Base Agent

All agents extend `BaseAgent`:

```python
from agent_common.base import BaseAgent, AgentResponse

class BurnAnalyst(BaseAgent):
    name = "BurnAnalyst"
    description = "Satellite-based burn severity assessment"

    async def query(self, question: str, context: dict) -> AgentResponse:
        # Implementation
        return AgentResponse(
            answer="Based on my analysis...",
            confidence=0.94,
            sources=[...],
            suggestions=[...]
        )
```

## Response Model

Standard response format for all agents:

```python
from agent_common.types import AgentResponse, Source, Suggestion

response = AgentResponse(
    answer="The burn severity analysis shows...",
    confidence=0.94,
    sources=[
        Source(type="sentinel-2", date="2022-09-15", url="..."),
        Source(type="calculation", method="dNBR")
    ],
    suggestions=[
        Suggestion(text="Compare to Holiday Farm Fire", query="compare holiday-farm"),
        Suggestion(text="Show erosion risk areas", query="erosion-risk")
    ],
    metadata={
        "agent": "BurnAnalyst",
        "version": "1.0.0",
        "processing_time_ms": 1234
    }
)
```

## Gemini Client

Wrapper around Vertex AI Gemini API:

```python
from agent_common.clients import GeminiClient

client = GeminiClient(
    model="gemini-3-flash",  # Updated per ADR-003
    temperature=0.3,
    max_tokens=2048
)

response = await client.generate(
    system_prompt="You are BurnAnalyst...",
    user_message="What is the burn severity?",
    context={"fire_id": "cedar-creek-2022"}
)
```

## Inter-Agent Communication

For RecoveryCoordinator to query specialist agents:

```python
from agent_common.clients import AgentClient

burn_analyst = AgentClient("http://burn-analyst:8001")
trail_assessor = AgentClient("http://trail-assessor:8002")

# Query multiple agents
results = await asyncio.gather(
    burn_analyst.query("What's the severity breakdown?", context),
    trail_assessor.query("What are the critical damage points?", context)
)
```

## Prompt Templates

Load and format prompt templates:

```python
from agent_common.prompts import PromptLoader

loader = PromptLoader("burn_analyst/prompts")
system_prompt = loader.load("system.md", variables={
    "fire_id": "cedar-creek-2022",
    "region": "Pacific Northwest"
})
```

## Development

```bash
# Install in editable mode
pip install -e .

# Run tests
pytest

# Format
black agent_common/
ruff check agent_common/
```

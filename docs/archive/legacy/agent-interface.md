# Agent Interface Specification (v1.0)

**Status:** Active
**Last Updated:** December 25, 2025
**Owner:** RANGER Team

---

## Overview

This document defines the interface and communication protocol between the **Coordinator**
and **Specialist** agents within the RANGER platform, utilizing the Google ADK (Agent
Development Kit).

---

## Agent Types

### Coordinator Agent
| Property | Value |
|----------|-------|
| Name | `coordinator` |
| Role | Root orchestrator |
| Model | `gemini-2.0-flash` |
| Location | `agents/coordinator/` |

**Responsibilities:**
- Receive user queries from UI
- Delegate to appropriate specialist agents
- Synthesize specialist responses
- Manage conversation state
- Generate final briefings

### Specialist Agents

| Agent | Name | Domain | Primary Skills |
|-------|------|--------|----------------|
| Burn Analyst | `burn-analyst` | Fire severity | MTBS, Soil Burn Severity |
| Trail Assessor | `trail-assessor` | Infrastructure | Damage Classification, Closures |
| Cruising Assistant | `cruising-assistant` | Timber | Volume Estimation, Salvage |
| NEPA Advisor | `nepa-advisor` | Compliance | Pathway Decision, Documentation |

---

## Agent Lifecycle

### 1. Initialization
Agents load their configuration and discover available skills.

```python
from google.adk.agents import Agent

root_agent = Agent(
    name="agent-name",
    model="gemini-2.0-flash",
    description="Agent description",
    instruction="Agent instructions...",
    tools=[],
)
```

**Required Parameters:**
- `name`: Unique identifier (kebab-case)
- `model`: LLM model to use
- `instruction`: System prompt defining agent behavior

**Optional Parameters:**
- `description`: Human-readable description
- `tools`: List of available tools/functions

### 2. Registration (Future)
In production, agents register with the Central Runtime for discovery and load balancing.

### 3. Query Processing
```
User Query → Coordinator → Delegation Skill → Specialist → Response → Coordinator → User
```

**Flow Details:**
1. User sends query via chat interface
2. FastAPI endpoint receives request
3. Coordinator agent processes query
4. Coordinator invokes Delegation skill to route
5. Specialist agent processes domain-specific query
6. Response flows back through Coordinator
7. Coordinator synthesizes and formats final response

---

## Communication Protocol

### Message Format

Agents communicate via the ADK tool-calling mechanism. For UI rendering, RANGER
uses the `AgentBriefingEvent` schema from `packages/agent-common`:

```python
from agent_common import AgentBriefingEvent, EventType, SourceAgent

event = AgentBriefingEvent(
    correlation_id="fire-123",
    type=EventType.INSIGHT,
    source_agent=SourceAgent.BURN_ANALYST,
    content={
        "summary": "Brief summary",
        "detail": "Detailed explanation",
    },
    proof_layer={
        "confidence": 0.94,
        "citations": ["MTBS 2022-09-15", "Sentinel-2 imagery"],
        "reasoning_chain": [
            "Analyzed dNBR values",
            "Classified severity based on thresholds",
            "Cross-referenced with soil indicators"
        ],
    }
)
```

### Event Types

| Type | Purpose | UI Rendering |
|------|---------|--------------|
| `INSIGHT` | Domain analysis result | Panel injection |
| `ALERT` | Time-sensitive warning | Toast notification + highlight |
| `ACTION` | Suggested next step | Action button |
| `STATUS` | Progress update | Status bar |

### Source Agents

| Enum Value | Agent |
|------------|-------|
| `COORDINATOR` | Recovery Coordinator |
| `BURN_ANALYST` | Burn Analyst |
| `TRAIL_ASSESSOR` | Trail Assessor |
| `CRUISING_ASSISTANT` | Cruising Assistant |
| `NEPA_ADVISOR` | NEPA Advisor |

---

## Configuration (config.yaml)

Each agent must have a `config.yaml` at its root:

```yaml
# Agent Configuration
# Per ADR-005: Skills-First Multi-Agent Architecture

agent:
  name: agent-name
  model: gemini-2.0-flash
  version: 0.1.0
  description: "Agent description"
  role: specialist  # or orchestrator

runtime:
  type: google-adk
  environment: local  # or cloud

skills:
  enabled: true
  paths:
    - ./skills                    # Agent-specific skills
    - ../../skills/foundation     # Shared foundation skills
    - ../../skills/forest-service # Agency skills

logging:
  level: INFO
  format: structured
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `agent.name` | Yes | Unique identifier |
| `agent.model` | Yes | LLM model name |
| `agent.version` | Yes | Semantic version |
| `agent.description` | Yes | Human-readable description |
| `agent.role` | Yes | `orchestrator` or `specialist` |
| `runtime.type` | Yes | Always `google-adk` |
| `runtime.environment` | Yes | `local` or `cloud` |
| `skills.enabled` | Yes | Enable skill loading |
| `skills.paths` | Yes | Directories to scan for skills |
| `logging.level` | No | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

---

## Directory Structure

Each agent follows this structure:

```
agent-name/
├── agent.py          # Agent definition (Required)
├── config.yaml       # Configuration (Required)
├── __init__.py       # Package marker (Required)
├── .env.example      # Environment template (Required)
├── skills/           # Agent-specific skills (Optional)
│   ├── skill-one/
│   └── skill-two/
└── tests/            # Test suite (Required)
    ├── __init__.py
    └── test_agent.py
```

### File Descriptions

| File | Purpose |
|------|---------|
| `agent.py` | Agent definition with `root_agent` export |
| `config.yaml` | Runtime configuration |
| `__init__.py` | Exports `root_agent` for import |
| `.env.example` | Template for required environment variables |
| `skills/` | Agent-specific skills (not shared) |
| `tests/` | pytest-compatible test suite |

---

## Running Agents

### Development (CLI)
```bash
cd agents
adk run coordinator
```

### Development (Web UI)
```bash
cd agents
adk web --port 8000
```

This launches a web interface for interactive testing.

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Set API key
export GOOGLE_API_KEY=your_key_here

# Or add to .env file
echo "GOOGLE_API_KEY=your_key" >> .env
```

### Running Tests
```bash
# All agent tests
pytest agents/ -v

# Specific agent
pytest agents/coordinator/tests/ -v
```

---

## Testing Requirements

### Unit Tests

Every agent must have these minimum tests:

```python
def test_agent_module_imports():
    """Agent module should be importable."""

def test_root_agent_exists():
    """Root agent should be properly initialized."""

def test_agent_has_instruction():
    """Agent should have non-empty instruction."""

def test_agent_has_description():
    """Agent should have a description."""

def test_agent_uses_correct_model():
    """Agent should use gemini-2.0-flash model."""
```

### Integration Tests (Phase 1+)
- Coordinator can delegate to specialists
- End-to-end query produces valid response
- Response matches AgentBriefingEvent schema

---

## Error Handling

Agents must handle errors gracefully:

```python
try:
    result = process_query(query)
except SkillNotFoundError:
    return create_error_response(
        "Skill unavailable",
        "The requested capability is not currently available."
    )
except ExternalServiceError as e:
    return create_error_response(
        "Service error",
        f"Unable to access external service: {e}"
    )
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return create_error_response(
        "Internal error",
        "An unexpected error occurred. Please try again."
    )
```

### Error Response Format
```python
{
    "error": True,
    "error_type": "SkillNotFoundError",
    "message": "Human-readable error message",
    "suggestion": "What the user should do next"
}
```

---

## Security Considerations

### API Keys
- Store in `.env` file (never committed)
- Use `GOOGLE_API_KEY` environment variable
- Rotate keys regularly

### Input Validation
- Validate all user input before processing
- Sanitize inputs to prevent injection attacks
- Limit query length and complexity

### Sandboxing
- Script execution runs in isolated environment
- Network access requires explicit permission
- File system access restricted to skill directory

### Rate Limiting (Production)
- Implement per-user rate limits
- Track API usage for billing
- Graceful degradation under load

---

## Deployment Architecture

### Local Development
```
┌─────────────────┐
│  adk run/web    │
│  (Single Agent) │
└─────────────────┘
```

### Production (Cloud Run)
```
┌─────────────────────────────────────────────────┐
│  ranger-orchestrator (Cloud Run)                 │
│  ├── FastAPI Router                              │
│  ├── Coordinator Agent                           │
│  └── All Specialist Agents (bundled)             │
└─────────────────────────────────────────────────┘
```

All agents run in a single container for Phase 1. Future phases may
separate into microservices for independent scaling.

---

## References

- ADR-005: Skills-First Multi-Agent Architecture
- RANGER Implementation Roadmap
- Google ADK Documentation
- `packages/agent-common` - Shared types

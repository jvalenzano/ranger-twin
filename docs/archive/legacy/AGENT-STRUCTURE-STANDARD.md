# Agent Structure Standard

This document defines the canonical directory structure for RANGER agent services.

## Standard Structure

```
agent-name/
├── pyproject.toml          # Project configuration with ranger-agent-common dependency
├── README.md               # Lightweight operational guide (links to spec)
├── app/
│   ├── __init__.py         # Package marker
│   ├── main.py             # FastAPI application entry point
│   └── agent.py            # Agent business logic
├── tests/
│   ├── __init__.py         # Test package marker
│   ├── conftest.py         # Shared pytest fixtures
│   └── test_main.py        # API endpoint tests
└── .env.example            # Environment variable documentation
```

## Required Dependencies

All agents must include in `pyproject.toml`:
- `ranger-agent-common` - Shared types and messaging
- `fastapi>=0.109.0` - API framework
- `uvicorn>=0.27.0` - ASGI server
- `redis>=5.0.0` - Event publishing
- `pydantic>=2.0.0` - Data validation

## Port Assignments

| Agent | Port | Description |
|-------|------|-------------|
| burn-analyst | 8001 | Burn severity analysis |
| trail-assessor | 8002 | Trail damage assessment |
| cruising-assistant | 8003 | Timber inventory |
| nepa-advisor | 8004 | NEPA compliance guidance |
| recovery-coordinator | 8005 | Root orchestrator |

## README Guidelines

Service READMEs should be lightweight operational guides:
- Link to full spec in `docs/agents/`
- Include Quick Start commands
- Document API endpoints
- List environment variables

Full feature documentation belongs in `docs/agents/{AGENT}-SPEC.md`.

## Testing Requirements

All agents must have:
- `tests/conftest.py` with `client` fixture
- `tests/test_main.py` with health check test
- Optional: `tests/test_agent.py` for business logic

## Required API Endpoints

All agents must implement:

### GET /health
Health check endpoint returning agent status.

**Response:**
```json
{
  "status": "healthy",
  "agent": "agent-name",
  "version": "0.1.0"
}
```

### GET /
Agent information endpoint.

**Response:**
```json
{
  "agent": "agent-name",
  "status": "active|scaffold",
  "description": "Brief agent description"
}
```

## Environment Variables

All agents should support:
- `PORT` - HTTP port (defaults to assigned port)
- `REDIS_URL` - Redis connection string
- `LOG_LEVEL` - Logging verbosity (INFO, DEBUG, etc.)

## Development Workflow

### Creating a New Agent

1. Create agent directory: `services/agents/agent-name/`
2. Add `pyproject.toml` with dependencies
3. Create `app/__init__.py` and `app/main.py`
4. Add health check and info endpoints
5. Create test structure with fixtures
6. Document in `README.md`
7. Add `.env.example`

### Running an Agent

```bash
cd services/agents/agent-name
uvicorn app.main:app --reload --port 800X
```

### Testing an Agent

```bash
cd services/agents/agent-name
pytest tests/
```

## File Naming Conventions

- Python modules: `snake_case.py`
- Classes: `PascalCase`
- Functions: `snake_case()`
- Constants: `UPPER_SNAKE_CASE`

## Import Structure

```python
# Standard library
import os
from typing import Optional

# Third-party
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Local
from app.agent import AgentService
```

## Versioning

All agents use semantic versioning (0.1.0, 0.2.0, etc.):
- Scaffold status: 0.1.0
- Initial implementation: 0.2.0
- Feature additions: increment minor version
- Breaking changes: increment major version

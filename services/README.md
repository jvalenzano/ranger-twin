# Services

Production-ready service implementations for RANGER deployment.

## Overview

This directory contains containerized services that can be deployed to Cloud Run or other container platforms. Each service is self-contained with its own Dockerfile, dependencies, and configuration.

## Directory Structure

```
services/
└── mcp-fixtures/          # MCP Fixtures server (implemented)
    ├── server.py          #   MCP server implementation
    ├── Dockerfile         #   Container definition
    └── requirements.txt   #   Python dependencies
```

## Service Descriptions

### `mcp-fixtures/`

Model Context Protocol server for fixture data access. Allows agents to query simulated data through the standard MCP interface.

**Status:** Implemented. See `mcp/fixtures/README.md` for specification.

## Note on Agent Backend

The canonical agent backend is the root `main.py` (Google ADK orchestrator), NOT a separate service in this directory. Per ADR-005/008, all agents run as a single ADK service deployed via the root Dockerfile.

For agent code, see: `/agents/`

## Deployment

### Local Development

```bash
# Run individual service
cd services/mcp-fixtures
pip install -r requirements.txt
python server.py
```

### Cloud Run Deployment

```bash
# Deploy MCP fixtures server
gcloud run deploy mcp-fixtures \
  --source services/mcp-fixtures \
  --project ranger-twin-dev \
  --region us-central1
```

## Relationship to Other Directories

| Directory | Purpose | Relationship |
|-----------|---------|--------------|
| `agents/` | Agent definitions (code) | Services wrap agents for deployment |
| `mcp/` | MCP server specifications | Services implement specifications |
| `packages/` | Shared libraries | Services import shared code |
| `infrastructure/` | IaC definitions | Terraform deploys services |

## References

- **Agent Code:** `agents/`
- **MCP Specifications:** `mcp/`
- **Deployment:** `docs/deployment/`
- **Architecture:** ADR-005 (Skills-First)

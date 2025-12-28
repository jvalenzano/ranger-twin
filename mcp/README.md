# MCP Server Specifications

Model Context Protocol (MCP) server specifications for RANGER data connectivity.

## Overview

This directory contains **specifications** for MCP servers. The actual implementations live in `services/mcp-*` directories.

MCP provides a standardized protocol for agents to connect to external data sources. Instead of custom API integrations, RANGER agents discover and use data through MCP tools.

## Directory Structure

```
mcp/
├── fixtures/              # Local fixture data server
│   └── README.md          #   Specification document
│
└── nifc/                  # NIFC (National Interagency Fire Center) data
    └── README.md          #   Specification document

services/
└── mcp-fixtures/          # ← Implementation of fixtures server
    ├── server.py
    ├── Dockerfile
    └── requirements.txt
```

## Specification vs Implementation

| Directory | Purpose |
|-----------|---------|
| `mcp/fixtures/` | **What** the server should do (specification) |
| `services/mcp-fixtures/` | **How** the server does it (implementation) |

This separation allows:
- Clear documentation of expected behavior
- Multiple implementations (Python, TypeScript)
- Easier onboarding and code review

## MCP Servers

### Fixtures Server

**Spec:** `mcp/fixtures/README.md`
**Implementation:** `services/mcp-fixtures/`
**Status:** Implemented

Provides access to local fixture data for development and testing.

### NIFC Server

**Spec:** `mcp/nifc/README.md`
**Implementation:** Planned (Phase 4)
**Status:** Specification only

Will provide access to NIFC fire incident data and perimeters.

## Adding New MCP Servers

1. Create specification in `mcp/{server-name}/README.md`
2. Define tools, inputs, and outputs
3. Implement in `services/mcp-{server-name}/`
4. Register in MCP registry (see `docs/specs/MCP-REGISTRY-STANDARD.md`)

## References

- **Protocol:** [Model Context Protocol](https://modelcontextprotocol.io/)
- **Registry Spec:** `docs/specs/MCP-REGISTRY-STANDARD.md`
- **Architecture:** ADR-005 (Skills-First, MCP connectivity layer)

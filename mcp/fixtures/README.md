# Fixtures MCP Server

> **Status:** Specification only. See `services/mcp-fixtures/` for implementation.

Model Context Protocol server specification for local fixture data access.

## Purpose

This directory contains the **specification** for the Fixtures MCP Server. The actual implementation lives in `services/mcp-fixtures/`.

The Fixtures MCP Server provides access to local fixture data (Cedar Creek, Bootleg Fire, etc.) for development and testing. It allows agents to query simulated data in the same way they would query real data sources.

## Directory Structure

```
mcp/
├── fixtures/              # ← You are here (specification)
│   └── README.md          #   Server specification
└── nifc/                  #   NIFC server specification (placeholder)

services/
└── mcp-fixtures/          # ← Implementation
    ├── server.py          #   MCP server implementation
    ├── Dockerfile         #   Container definition
    └── requirements.txt   #   Python dependencies
```

## Fixture Data Locations

Actual fixture data lives in `data/fixtures/`:

```
data/fixtures/
├── cedar-creek/           # Primary test fire (Willamette NF, OR, 2022)
│   ├── incident-metadata.json
│   ├── burn-severity.json
│   ├── trail-damage.json
│   ├── timber-plots.json
│   └── briefing-events.json
└── bootleg/               # Secondary test fire (Fremont-Winema NF, OR, 2021)
    ├── burn-severity.json
    ├── trail-damage.json
    ├── timber-plots.json
    └── briefing-events.json
```

## Planned MCP Tools

The MCP server exposes the following tools to agents:

| Tool | Description |
|------|-------------|
| `get_fire_fixture` | Get fixture data for a specific fire by ID |
| `list_fixtures` | List available fixture datasets |
| `get_assessment_data` | Get assessment data for a location/sector |

## References

- **Implementation:** `services/mcp-fixtures/server.py`
- **Fixture Data:** `data/fixtures/`
- **Data Formats:** `docs/architecture/FIXTURE-DATA-FORMATS.md`
- [ADR-005](../../docs/adr/ADR-005-skills-first-architecture.md) — Skills-First Architecture
- [ADR-009](../../docs/adr/ADR-009-fixture-first-development.md) — Fixture-First Development

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **MCP** | Model Context Protocol | Protocol for data connectivity |
| **NF** | National Forest | USFS-managed forest land |

→ **[Full Glossary](../../docs/GLOSSARY.md)**

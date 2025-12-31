# NIFC MCP Server

> **Status:** Specification only (placeholder). Implementation planned for Phase 4.

Model Context Protocol server specification for NIFC (National Interagency Fire Center) data.

## Purpose

This directory contains the **specification** for the NIFC MCP Server. The server will provide fire incident data, perimeters, and status updates from NIFC APIs to RANGER agents via the Model Context Protocol.

## Directory Structure

```
mcp/
├── fixtures/              #   Fixtures server specification
└── nifc/                  # ← You are here (specification)
    └── README.md          #   Server specification
```

## Planned Capabilities

- Active fire incidents list
- Fire perimeter GeoJSON
- Incident status updates
- Historical fire data

## Reference Implementation

Refactor from existing frontend service:
`apps/command-console/src/services/nifcService.ts`

## Planned MCP Tools

| Tool | Description |
|------|-------------|
| `get_active_fires` | List active fire incidents |
| `get_fire_perimeter` | Get GeoJSON perimeter for fire |
| `get_fire_details` | Get detailed incident information |

## Data Sources

- [NIFC Open Data](https://data-nifc.opendata.arcgis.com/)
- [IRWIN API](https://irwin.doi.gov/) (Integrated Reporting of Wildland-Fire Information)

## References

- **Protocol:** [Model Context Protocol](https://modelcontextprotocol.io/)
- [ADR-005](../../docs/adr/ADR-005-skills-first-architecture.md) — Skills-First Architecture
- **Registry Spec:** `MCP-REGISTRY-STANDARD.md`

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **API** | Application Programming Interface | Protocol for software interaction |
| **IRWIN** | Integrated Reporting of Wildland-Fire Information | Federal fire incident system |
| **MCP** | Model Context Protocol | Protocol for data connectivity |
| **NIFC** | National Interagency Fire Center | Coordination center for wildfire response |

→ **[Full Glossary](../../docs/GLOSSARY.md)**

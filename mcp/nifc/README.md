# NIFC MCP Server

Model Context Protocol server for NIFC (National Interagency Fire Center) data.

## Status

**Phase:** Placeholder (Phase 0)
**Implementation:** Phase 4

## Purpose

Provides fire incident data, perimeters, and status updates from NIFC APIs to
RANGER agents via the Model Context Protocol.

## Planned Capabilities

- Active fire incidents list
- Fire perimeter GeoJSON
- Incident status updates
- Historical fire data

## Reference Implementation

Refactor from existing frontend service:
`apps/command-console/src/services/nifcService.ts`

## API Endpoints

To be defined in Phase 4. Will expose MCP-compatible tools for:
- `get_active_fires` - List active fire incidents
- `get_fire_perimeter` - Get GeoJSON perimeter for fire
- `get_fire_details` - Get detailed incident information

## References

- [NIFC Open Data](https://data-nifc.opendata.arcgis.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- ADR-005: Skills-First Multi-Agent Architecture

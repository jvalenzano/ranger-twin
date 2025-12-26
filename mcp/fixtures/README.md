# Fixtures MCP Server

Model Context Protocol server for local fixture data access.

## Status

**Phase:** Placeholder (Phase 0)
**Implementation:** Phase 4

## Purpose

Provides access to local fixture data (Cedar Creek, Bootleg Fire, etc.) for
development and testing. Allows agents to query simulated data in the same
way they would query real data sources.

## Planned Capabilities

- Fire fixture data access
- Trail assessment fixtures
- Timber inventory fixtures
- NEPA documentation fixtures

## Fixture Locations

```
data/fixtures/
├── cedar-creek/     # Primary test fire
├── bootleg-fire/    # Secondary test fire
└── ...
```

## API Endpoints

To be defined in Phase 4. Will expose MCP-compatible tools for:
- `get_fire_fixture` - Get fixture data for a fire
- `list_fixtures` - List available fixture datasets
- `get_assessment_data` - Get assessment data for location

## References

- `data/fixtures/` - Fixture data directory
- `docs/architecture/FIXTURE-DATA-FORMATS.md` - Data format spec
- ADR-005: Skills-First Multi-Agent Architecture

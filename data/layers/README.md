# Vector Layers

This folder is reserved for GeoJSON and vector data files for future phases.

## Current Status: Empty (Phase 1)

Phase 1 uses simulated data loaded directly from `data/fixtures/cedar-creek/`.

**Why this is empty:** Phase 1 focuses on proving multi-agent orchestration. Real GeoJSON layers from USFS production systems will be integrated in Phase 2+ via data adapters.

**See:** [`data/fixtures/cedar-creek/README.md`](../fixtures/cedar-creek/README.md) for active simulation data used in Phase 1.

## Future Use (Phase 2+)

This folder will contain:
- Fire perimeter polygons (from NIFC/InciWeb)
- Burn severity zones (from MTBS dNBR classifications)
- Trail network lines (from USFS trail database)
- Timber stand polygons (from FSVeg)
- Administrative boundaries

## Data Sources

| Layer | Source | Format |
|-------|--------|--------|
| Fire Perimeters | NIFC Open Data | GeoJSON |
| Burn Severity | MTBS / RAVG | GeoJSON |
| Trails | USFS INFRA | GeoJSON |
| Timber Stands | FSVeg | GeoJSON |

## Notes

In production, this data would be served from:
- PostGIS database
- Cloud-hosted vector tile service
- USFS data APIs

This folder is for local development and testing only.

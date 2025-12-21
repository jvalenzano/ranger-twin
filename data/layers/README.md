# Vector Layers

This folder is reserved for GeoJSON and vector data files for future phases.

## Current Status: Empty (Phase 1)

Phase 1 uses simulated data loaded directly into the frontend from `apps/command-console/public/fixtures/`.

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

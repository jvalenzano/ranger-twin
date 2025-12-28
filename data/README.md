# Data

Data directory for RANGER development and testing.

## Overview

This directory contains all data assets used by RANGER agents, organized by type and purpose. Phase 1 uses fixture (simulated) data; Phase 2+ will integrate real federal data sources.

## Directory Structure

```
data/
├── fixtures/              # Phase 1 simulation data
│   ├── cedar-creek/       #   Primary test fire (Willamette NF, OR)
│   └── bootleg/           #   Secondary test fire (Fremont-Winema NF, OR)
│
├── documents/             # NEPA documents, regulations, FSM/FSH
│
├── layers/                # GIS vector layers (GeoJSON, shapefiles)
│
├── rasters/               # Satellite imagery, burn severity maps
│
└── synthetic/             # Generated test data for edge cases
```

## Data Types

### Fixtures (`fixtures/`)

Simulated data for Phase 1 development. Each fire has:
- `incident-metadata.json` - Fire details, dates, location
- `burn-severity.json` - MTBS-style severity polygons
- `trail-damage.json` - TRACS-compatible damage inventory
- `timber-plots.json` - FSVeg cruise plot data
- `briefing-events.json` - Pre-composed agent briefing events

### Documents (`documents/`)

Reference documents for the NEPA Advisor agent:
- Forest Service Manual (FSM) excerpts
- Forest Service Handbook (FSH) excerpts
- NEPA categorical exclusions
- Template documents

### Layers (`layers/`)

GIS vector data:
- Fire perimeters (GeoJSON)
- Trail networks
- Administrative boundaries
- Treatment units

### Rasters (`rasters/`)

Satellite imagery and derived products:
- Burn severity maps (dNBR)
- Pre/post-fire imagery
- Terrain models

### Synthetic (`synthetic/`)

Generated test data for:
- Edge case testing
- Performance benchmarks
- Schema validation

## Data Quality Tiers

| Tier | Description | Examples |
|------|-------------|----------|
| **Tier 1: Authoritative** | Federal production systems | IRWIN, MTBS, FSVeg |
| **Tier 2: Validated** | Curated from real sources | Cedar Creek fixtures |
| **Tier 3: Synthetic** | Generated for testing | Edge case scenarios |

## Production Mapping

Phase 1 fixtures are designed to match production data schemas:

| Fixture | Production Source | Notes |
|---------|------------------|-------|
| `burn-severity.json` | MTBS, RAVG | GeoJSON FeatureCollection |
| `trail-damage.json` | TRACS | Exportable to TRACS CSV |
| `timber-plots.json` | FSVeg | Common Stand Exam format |

## References

- **Fixture Formats:** `docs/architecture/FIXTURE-DATA-FORMATS.md`
- **Simulation Strategy:** `docs/archive/phase1/DATA-SIMULATION-STRATEGY.md`
- **Architecture:** ADR-009 (Fixture-First Development)

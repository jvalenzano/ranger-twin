# Burn Severity Layer Consolidation

**Status:** Tracked - Pre-Pilot Required
**Created:** 2025-01-01
**Owner:** TBD
**Target:** Before Phase 1 Pilot Deployment

## Problem Statement

CedarCreekMap currently renders burn severity data from two independent sources:

| Layer | Source | Data Type | Authority |
|-------|--------|-----------|-----------|
| TiTiler Raster | MTBS COG via ranger-titiler | Real satellite-derived | Tier 1 (Authoritative) |
| GeoJSON Polygons | `data/fixtures/cedar-creek/` | Synthetic demo data | Tier 3 (Synthetic) |

This dual-source architecture violates the Proof Layer protocol (see `docs/specs/PROOF-LAYER-DESIGN.md`),
which requires every AI insight to cite a single authoritative source.

## Impact

- **Proof Layer Ambiguity:** Which source should the Burn Analyst cite?
- **User Confusion:** Visual discrepancies between raster and vector representations
- **State Management Complexity:** Two visibility toggles for conceptually same data

## Consolidation Plan

### Option A: TiTiler-Only (Recommended)

Remove GeoJSON synthetic polygons entirely. Use TiTiler raster for all burn severity visualization.

**Pros:**
- Single source of truth (MTBS = Tier 1 authority)
- Proof Layer citations are unambiguous
- Reduced bundle size and render complexity

**Cons:**
- Requires TiTiler availability (dependency on Cloud Run service)
- Loss of synthetic demo fallback

**Implementation:**
1. Remove GeoJSON burn severity layer code from CedarCreekMap
2. Update BurnSeverityLayer to be the sole burn severity renderer
3. Add offline/error fallback messaging when TiTiler unavailable
4. Update Burn Analyst skill to cite MTBS exclusively

### Option B: Hybrid with Clear Hierarchy

Keep both but establish clear precedence: TiTiler primary, GeoJSON fallback only.

**Pros:**
- Graceful degradation if TiTiler fails
- Demo works without cloud dependencies

**Cons:**
- Still requires Proof Layer logic to determine which source is active
- Adds complexity to citation generation

### Option C: Vector Tile Conversion (Future)

Convert MTBS raster to vector tiles (PMTiles) for unified vector-based rendering.

**Pros:**
- Consistent with ADR-013 geospatial strategy
- Better labeling and interaction capabilities

**Cons:**
- Requires additional data pipeline work
- Deferred to Phase 2

## Decision

**Selected:** Option A (TiTiler-Only)

**Rationale:** Aligns with Trust Hierarchy principle—users must trust the data display
before trusting AI recommendations. A single, clearly-sourced layer builds that trust.

## Acceptance Criteria

- [ ] GeoJSON burn severity polygon code removed from CedarCreekMap
- [ ] BurnSeverityLayer is sole burn severity renderer
- [ ] FloatingLegend shows single "Burn Severity" section (no duplication)
- [ ] Burn Analyst skill cites "MTBS via TiTiler" as source
- [ ] Error state displays user-friendly message when TiTiler unavailable
- [ ] No console errors related to burn severity rendering

## References

- ADR-005: Skills-First Architecture
- ADR-013: Geospatial Intelligence Layers
- PROOF-LAYER-DESIGN.md: Citation requirements
- BurnSeverityLayer.tsx: Current TiTiler implementation

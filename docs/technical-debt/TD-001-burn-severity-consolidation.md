## Task: Document Burn Severity Layer Consolidation & Create Tracking Issue

### Context

We've successfully integrated TiTiler-based burn severity raster rendering alongside 
the existing GeoJSON synthetic burn severity polygons. Both layers currently coexist 
in CedarCreekMap, which is acceptable for the demo phase but creates ambiguity for 
the Proof Layer's citation requirements.

**Current State:**
- `BurnSeverityLayer.tsx` - TiTiler raster tiles from MTBS COG (REAL data)
- GeoJSON polygons in CedarCreekMap - Synthetic fixture data
- Both render independently, controlled by different mechanisms

**Problem:** When the Proof Layer cites burn severity data, it must reference a single 
authoritative source. Dual layers create citation ambiguity and potential user confusion.

### Instructions

#### 1. Create Technical Debt Tracking Document

Create file: `docs/technical-debt/BURN-SEVERITY-CONSOLIDATION.md`
```markdown
# Burn Severity Layer Consolidation

**Status:** 🟡 Tracked - Pre-Pilot Required  
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
```

#### 2. Add Entry to Technical Debt Index

If `docs/technical-debt/INDEX.md` exists, add entry. If not, create it:
```markdown
# Technical Debt Registry

Tracking document for known technical debt requiring resolution before production deployment.

## Pre-Pilot (Phase 1) Required

| ID | Issue | Impact | Owner | Status |
|----|-------|--------|-------|--------|
| TD-001 | Burn Severity Layer Consolidation | Proof Layer citation ambiguity | TBD | 🟡 Tracked |

## Phase 2 Candidates

| ID | Issue | Impact | Owner | Status |
|----|-------|--------|-------|--------|
| | | | | |

## Resolved

| ID | Issue | Resolution Date | Notes |
|----|-------|-----------------|-------|
| | | | |
```

#### 3. Add TODO Comment in CedarCreekMap.tsx

Locate the GeoJSON burn severity layer code and add a tracking comment:
```typescript
// TODO: TD-001 - Remove GeoJSON burn severity polygons before pilot
// See: docs/technical-debt/BURN-SEVERITY-CONSOLIDATION.md
// TiTiler raster layer (BurnSeverityLayer.tsx) should be sole source
// This synthetic data creates Proof Layer citation ambiguity
```

#### 4. Update DEPLOYMENT-READINESS-PLAN.md (if exists)

Add to pre-deployment checklist:
```markdown
### Data Layer Consolidation
- [ ] TD-001: Burn severity layers consolidated to TiTiler-only
```

### Verification

After completing these tasks:
1. Confirm `docs/technical-debt/BURN-SEVERITY-CONSOLIDATION.md` exists and is well-formed
2. Confirm INDEX.md references TD-001
3. Confirm TODO comment exists in CedarCreekMap.tsx near GeoJSON burn severity code
4. Run `grep -r "TD-001" .` to verify cross-references are in place

### Commit Message
```
docs: track burn severity layer consolidation as TD-001

- Create technical debt tracking for dual burn severity sources
- TiTiler raster vs GeoJSON synthetic creates Proof Layer ambiguity
- Decision: consolidate to TiTiler-only before pilot
- Add TODO marker in CedarCreekMap.tsx for future cleanup
```
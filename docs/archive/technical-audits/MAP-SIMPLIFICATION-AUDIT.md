# Map Complexity Audit & Simplification Plan

**Status:** Audit Complete
**Date:** 2025-12-24
**Purpose:** Identify over-engineered map features and recommend simplifications aligned with "Nerve Center, Not Sensors" philosophy

---

## Executive Summary

The current map implementation includes ~2,500 lines of complex WebGL rendering code designed for rich interactive experiences. Following the "Nerve Center, Not Sensors" principle, much of this complexity is unnecessary when:

1. **Static previews** suffice for fire selection context
2. **NASA FIRMS** provides authoritative real-time fire visualization
3. **RANGER's value** is in agentic workflows, not map interactions

**Recommendation:** Simplify to static previews + deep links, retaining tactical map for mission-critical workflows only.

---

## Current State Inventory

### Map-Related Files (2,500+ lines total)

| File | Lines | Purpose | Simplification Candidate? |
|------|-------|---------|--------------------------|
| `CedarCreekMap.tsx` | 1,105 | Tactical map with 3D terrain, overlays | PARTIAL - keep core, remove 3D/IR |
| `NationalMap.tsx` | 755 | National portfolio view | YES - simplify to markers + static |
| `FloatingLegend.tsx` | 348 | Draggable legend widget | YES - replace with simple sidebar |
| `mapStore.ts` | 382 | Map state management | PARTIAL - reduce stored state |
| `firmsService.ts` | 306 | NASA FIRMS API integration | KEEP - valuable for data |
| `firePreviewService.ts` | 266 | Static image URL generation | KEEP - aligned with philosophy |
| `mapTilerStatic.ts` | 141 | Static map API | KEEP - aligned with philosophy |
| `MapControls.tsx` | 109 | Measurement display | REMOVE - not needed for MVP |
| `MeasureTool.tsx` | ~100 | Distance/area measurement | REMOVE - over-engineered |

### Currently Implemented Features

**Tactical Map (CedarCreekMap):**
- MapLibre GL JS with Raster-DEM 3D terrain
- Adjustable terrain exaggeration (1.5x - 2.5x)
- 3 base layer modes: Satellite, Terrain, IR thermal
- 4 GeoJSON overlay layers (perimeter, burn severity, trail damage, timber plots)
- Interactive hover/click with feature popups
- "Analyze Site" visual audit workflow trigger
- Camera animations with flyTo
- 7 keyboard shortcuts (N, S, T, I, +, -, Shift+0)
- Measurement tool with distance/area calculation

**National Map (NationalMap):**
- WebGL circle layers for managed fires
- NASA FIRMS real-time hotspot overlay
- Severity-based color coding
- Hover/selection highlight rings
- Double-click to enter tactical view

**Supporting UI:**
- Draggable, collapsible floating legend
- Legend persistence to localStorage
- Phase-based layer visibility toggling
- React component injection into MapLibre popups

---

## Over-Engineering Analysis

### SIGNIFICANTLY OVER-ENGINEERED

| Feature | Complexity | Reason Not Needed |
|---------|-----------|-------------------|
| **3D Terrain** | High (~150 lines) | Static images have no 3D; NASA FIRMS provides better terrain context |
| **IR Mode** | Medium (~100 lines) | Thermal simulation not backed by real data; misleading |
| **Terrain exaggeration controls** | Medium (~80 lines) | User control for demo effect, not mission-critical |
| **Draggable legend** | Medium (~200 lines) | Could be simple fixed sidebar |
| **Measurement tool** | High (~200 lines) | Field crews use dedicated GPS tools |
| **7 keyboard shortcuts** | Low (~40 lines) | Nice-to-have, not essential |
| **Multiple base layers** | Medium (~100 lines) | Satellite-only sufficient for context |
| **Camera animations** | Medium (~80 lines) | Static positioning adequate |
| **Feature hover states** | Medium (~60 lines) | Click-only sufficient |
| **Legend localStorage** | Low (~30 lines) | Session-only sufficient |

### APPROPRIATELY DESIGNED

| Feature | Value | Keep Reason |
|---------|-------|-------------|
| **Static preview URLs** | High | Aligns with philosophy - fast, no JS |
| **NASA FIRMS data service** | High | Real satellite detections, authoritative |
| **Fire modal with FIRMS link** | High | "Link out" pattern - just added |
| **Basic GeoJSON overlays** | Medium | Needed for tactical mission context |
| **Click popups** | Medium | Minimal interaction for mission selection |

---

## Simplification Recommendations

### Phase 1: Quick Wins (1-2 days)

1. **Remove IR mode**
   - Delete `baseMode === 'IR'` conditional styling
   - Remove IR button from layer switcher
   - ~100 lines removed

2. **Remove measurement tool**
   - Delete `MeasureTool.tsx`
   - Delete `measureStore.ts`
   - Remove measurement UI from `MapControls.tsx`
   - ~300 lines removed

3. **Simplify legend**
   - Replace `FloatingLegend.tsx` with static sidebar legend
   - Remove drag handling, localStorage, collapse animation
   - ~250 lines removed

4. **Remove keyboard shortcuts**
   - Delete `useEffect` keyboard handlers
   - ~40 lines removed

**Estimated reduction: ~700 lines (28%)**

### Phase 2: Moderate Effort (3-5 days)

1. **Remove 3D terrain**
   - Remove Raster-DEM source and terrain configuration
   - Remove sky/fog atmospheric effects
   - Remove terrain exaggeration controls
   - Flatten to 2D satellite imagery only
   - ~150 lines removed

2. **Simplify base layers**
   - Keep satellite only
   - Remove terrain/IR mode switching UI
   - ~100 lines removed

3. **Reduce camera complexity**
   - Remove flyTo animations
   - Use simple `jumpTo` for view changes
   - Remove camera timeout/safety logic
   - ~80 lines removed

4. **Consolidate static preview utilities**
   - Merge `mapTilerStatic.ts` and `firePreviewService.ts`
   - Single utility with fallback chain
   - ~100 lines consolidated

**Estimated reduction: ~430 lines (17%)**

### Phase 3: Strategic Simplification (future)

1. **National map → pure markers**
   - Replace WebGL circles with simple DOM markers
   - Remove FIRMS overlay (rely on external link)
   - ~400 lines removed

2. **Tactical map → minimal context**
   - GeoJSON overlays only
   - No hover states, simple click popups
   - Static camera positioning
   - ~300 lines removed

**Potential additional reduction: ~700 lines**

---

## Recommended Architecture

### Before (Current)

```
┌──────────────────────────────────────────────────────────┐
│                     RANGER UI                             │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐    │
│  │  National Map   │  │       Tactical Map          │    │
│  │  - WebGL circles│  │  - 3D terrain               │    │
│  │  - FIRMS overlay│  │  - 3 base modes (SAT/TER/IR)│    │
│  │  - Hover effects│  │  - 4 GeoJSON overlays       │    │
│  │  - Click/select │  │  - Measurement tools        │    │
│  │                 │  │  - Keyboard shortcuts       │    │
│  │                 │  │  - Animated cameras         │    │
│  │                 │  │  - Draggable legend         │    │
│  └─────────────────┘  └─────────────────────────────┘    │
│           ~755 lines            ~1,105 lines              │
└──────────────────────────────────────────────────────────┘
```

### After (Recommended)

```
┌──────────────────────────────────────────────────────────┐
│                     RANGER UI                             │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────┐    │
│  │  Fire Selection │  │       Mission Context       │    │
│  │  - Static       │  │  - 2D satellite base        │    │
│  │    previews     │  │  - GeoJSON overlays         │    │
│  │  - Fire cards   │  │  - Simple click popups      │    │
│  │  - FIRMS link   │  │  - Fixed sidebar legend     │    │
│  │    button ↗     │  │                             │    │
│  └─────────────────┘  └─────────────────────────────┘    │
│           ~300 lines            ~600 lines                │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              External Links                         │ │
│  │  "View on NASA FIRMS" → Deep link with coordinates  │ │
│  │  "View on InciWeb" → Incident page                  │ │
│  │  "View on NIFC" → Historical perimeters             │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Files to Modify/Delete

### DELETE (remove entirely)

- [ ] `apps/command-console/src/components/map/MeasureTool.tsx`
- [ ] `apps/command-console/src/stores/measureStore.ts`

### SIGNIFICANTLY SIMPLIFY

- [ ] `apps/command-console/src/components/map/CedarCreekMap.tsx`
  - Remove 3D terrain (~150 lines)
  - Remove IR mode (~100 lines)
  - Remove keyboard shortcuts (~40 lines)
  - Remove terrain exaggeration (~80 lines)

- [ ] `apps/command-console/src/components/map/FloatingLegend.tsx`
  - Replace with simple `<SidebarLegend>` component (~250 lines saved)

- [ ] `apps/command-console/src/components/map/MapControls.tsx`
  - Remove measurement display, keep minimal controls (~80 lines)

- [ ] `apps/command-console/src/stores/mapStore.ts`
  - Remove legend position/collapsed state (~50 lines)
  - Remove measurement state (~30 lines)
  - Remove base mode state (~20 lines)

### KEEP AS-IS

- `apps/command-console/src/services/firmsService.ts` - Valuable data source
- `apps/command-console/src/utils/firePreviewService.ts` - Aligned with philosophy
- `apps/command-console/src/utils/mapTilerStatic.ts` - Aligned with philosophy

---

## Success Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Total map code lines | ~2,500 | ~1,200 | 52% reduction |
| Initial bundle impact | ~400KB | ~200KB | 50% reduction |
| Time to first fire card | ~2s | <0.5s | 4x faster |
| Map-related store complexity | High | Low | Simpler state |
| Features requiring MapLibre | All | Tactical only | Scoped usage |

---

## Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Add NASA FIRMS deep link | "Nerve center" philosophy - link to authoritative tools | 2025-12-24 |
| Document design principle | Establish architectural guidance for future decisions | 2025-12-24 |
| Recommend 3D removal | Demo effect with no mission value; misleading without real data | 2025-12-24 |
| Keep FIRMS service | Real satellite data is valuable for agent consumption | 2025-12-24 |

---

## References

- [DATA-INGESTION-ADAPTERS.md](./DATA-INGESTION-ADAPTERS.md) - "Nerve Center, Not Sensors" philosophy
- [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/usfs/map/) - Authoritative fire visualization
- [MapTiler Static API](https://docs.maptiler.com/cloud/api/static-maps/) - Static preview generation

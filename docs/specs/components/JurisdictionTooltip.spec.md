# JurisdictionTooltip Component Specification

**Status:** ✅ Complete  
**Priority:** Week 4  
**ADR Reference:** [ADR-012 Hover Jurisdiction Lookup](../../adr/ADR-012-mission-control-ui-overhaul.md#hover-jurisdiction-lookup)  
**Expert Review:** Completed 2025-12-30

---

## Overview

JurisdictionTooltip displays ownership information when hovering over map features (hotspots, fire markers, or land boundaries). It provides instant jurisdiction answers without requiring click interaction.

### User Story

> As Regional Forester Maria, I need to hover over a hotspot cluster and immediately see which agency manages that land so I can determine if it's my responsibility without clicking or drilling down.

### Visual Reference

See high-fidelity mockup: [`docs/designs/mockups/ranger-cc-ui-mockup.png`](../../designs/mockups/ranger-cc-ui-mockup.png)

---

## Props Interface

```typescript
/**
 * JurisdictionTooltip - Hover popup showing land ownership
 * 
 * Rendered as a MapLibre Popup, positioned at cursor.
 * 
 * @example
 * <JurisdictionTooltip
 *   jurisdiction={{
 *     owner: 'USFS',
 *     unit: 'Deschutes National Forest',
 *     subunit: 'Bend Ranger District'
 *   }}
 *   position={[lng, lat]}
 * />
 */
interface JurisdictionTooltipProps {
  /** Jurisdiction data from queryRenderedFeatures */
  jurisdiction: {
    owner: 'USFS' | 'BLM' | 'Tribal' | 'State' | 'Private' | 'Unknown';
    unit: string;
    subunit?: string;
  } | null;
  
  /** Map coordinates for popup positioning */
  position: [number, number] | null;
  
  /** Optional: For clustered hotspots */
  clusterInfo?: {
    count: number;
    dominant: string;
    jurisdictions: Record<string, number>;
  };
}
```

---

## State Contract

### Reads From

| Store | Selector | Purpose |
|-------|----------|---------|
| `missionStore` | `useHoveredJurisdiction` | Current hover data |

### Writes To

This component does not write to stores.

---

## Visual States

```
Single Hotspot (Deschutes NF)          Cluster (Mixed Jurisdiction)
┌─────────────────────────────┐       ┌─────────────────────────────┐
│ 🏛️ USFS                     │       │ 🔴 47 hotspots              │
│ Deschutes National Forest   │       │ 🟩 USFS: 38 (81%)           │
│ Bend Ranger District        │       │ 🟨 BLM: 6 (13%)             │
│ Phase: BAER Assessment      │       │ ⬜ Private: 3 (6%)          │
│ Confidence: 87%             │       │ Dominant: USFS              │
└─────────────────────────────┘       └─────────────────────────────┘

Loading                          Unknown Jurisdiction
┌─────────────────────────────┐       ┌─────────────────────────────┐
│ ▓▓▓ USFS                    │       │ ❓ Unknown                  │
│ ▓▓▓ Deschutes NF            │       │ No boundary data available  │
│ ▓▓▓ Bend RD                 │       │ Click for incident details  │
└─────────────────────────────┘       └─────────────────────────────┘
```

| State | Background | Width | Max Height | Animation |
|-------|------------|-------|------------|-----------|
| **Single** | `glass-panel` | 280px | 120px | Fade in 150ms |
| **Cluster** | `glass-panel warning` | 300px | 140px | Slide up 200ms |
| **Loading** | `skeleton shimmer` | 260px | 80px | Pulse 1s |
| **Unknown** | `glass-panel muted` | 260px | 80px | Fade in 100ms |

---

## Behavior

### Positioning & Lifecycle

```tsx
// Follows cursor with smart offset
const [mousePos, setMousePos] = useState<[number, number] | null>(null);

useEffect(() => {
  let timeout: NodeJS.Timeout;
  const handleMouseMove = (e: MapMouseEvent) => {
    setMousePos([e.lngLat.lng, e.lngLat.lat]);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => setMousePos(null), 300); // Hide after 300ms idle
  };
  map.on('mousemove', 'hotspots', handleMouseMove);
  return () => map.off('mousemove', 'hotspots', handleMouseMove);
}, []);
```

### Smart Positioning (edge-aware)

```tsx
const getOffset = (lngLat: LngLat, mapSize: {width: number, height: number}) => {
  const edgeBuffer = 20;
  const preferRight = lngLat.lng > mapSize.width / 2;
  return preferRight ? [15, -10] : [-15, -10]; // Right or left offset
};
```

### Latency Targets

- `mousemove` → `queryRenderedFeatures` → render: **<50ms** (rendered features cached)
- Cluster fallback → "Mixed jurisdictions": **<10ms** (no spatial query)

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Role** | `role="tooltip"` (not focusable) |
| **Live Region** | `aria-live="polite"` for dynamic updates |
| **Alternative** | Jurisdiction data duplicated in IncidentCard (click path) |
| **Contrast** | WCAG AAA 7:1 field mode |
| **Reduced Motion** | No animations when `prefers-reduced-motion` |

```tsx
<div 
  role="tooltip" 
  aria-live="polite"
  aria-label={`Jurisdiction: ${jurisdiction?.owner || 'unknown'}`}
  className="glass-panel p-3 rounded-lg shadow-2xl max-w-[280px]"
/>
```

---

## Dependencies

| Type | Import | Purpose |
|------|--------|---------|
| **Store** | `useHoveredJurisdiction` | Current tooltip data |
| **Hook** | `useJurisdictionQuery` | `queryRenderedFeatures` wrapper |
| **Map** | `useMap` (react-map-gl) | Map instance access |
| **Icons** | `Building2`, `Circle` from `lucide-react` | Agency icons, jurisdiction swatches |
| **Utils** | `formatJurisdiction` | Owner → display name |

### useJurisdictionQuery Hook

```tsx
// hooks/useJurisdictionQuery.ts
export const useJurisdictionQuery = () => {
  const map = useMap();
  const setHovered = useSetHoveredJurisdiction();
  
  const queryJurisdiction = useCallback((point: Point) => {
    const layers = ['usfs-fill', 'blm-fill', 'tribal-fill'].filter(
      id => map.getLayoutProperty(id, 'visibility') === 'visible'
    );
    
    const features = map.queryRenderedFeatures(point, { layers });
    const top = features[0];
    
    if (top) {
      setHovered({
        owner: top.properties.Mang_Type as OwnerType,
        unit: top.properties.Unit_Nm,
        subunit: top.properties.Dist_Nm,
      });
    }
  }, [map]);
  
  return { queryJurisdiction };
};
```

---

## Test Scenarios

### Unit Tests

| Test | Assertion |
|------|-----------|
| `renders single jurisdiction` | Shows "USFS Deschutes NF Bend RD" |
| `renders cluster breakdown` | Shows percentages, dominant label |
| `loading skeleton` | Shimmer animation during query |
| `unknown fallback` | "❓ Unknown" with click instruction |

### Integration Tests

| Test | Mock | Assertion |
|------|------|-----------|
| `queryRenderedFeatures USFS` | Mock features array | Correct jurisdiction parsed |
| `no visible layers` | Empty features | Shows "Unknown" |
| `cluster properties` | Mock cluster data | Dominant + percentages |

### Visual Regression

| Scenario | Viewport | State |
|----------|----------|-------|
| `single-usfs` | 1440×900 | Deschutes NF example |
| `cluster-mixed` | 1440×900 | 47 hotspots breakdown |
| `edge-position` | 1440×900 | Near map edge (flipped) |
| `field-mode` | 390×844 | High contrast variant |

---

## Implementation Notes

### Performance Optimizations

```tsx
// Debounce expensive queries
const debouncedQuery = useDebounce(queryJurisdiction, 50);

// Cache recent results (last 10 points)
const queryCache = useRef<Map<string, Jurisdiction>>(new Map());
const cacheKey = `${point.x}-${point.y}`;
if (queryCache.current.has(cacheKey)) return queryCache.current.get(cacheKey)!;
```

### Client Limitations & Phase 2

| Issue | Client Behavior | Phase 2 Server Fix |
|-------|-----------------|-------------------|
| **Clusters** | "Mixed jurisdictions" | Pre-aggregate on FIRMS ingest |
| **Private land** | "Unknown" | PostGIS `ST_Intersects` all owners |
| **Multi-agency** | Topmost layer only | Weighted area calculation |

### Fallback Strategy

```
1. queryRenderedFeatures → Jurisdiction data ✓
2. Hotspot metadata.jurisdiction → Pre-computed ✓
3. "Mixed jurisdictions" → Safe default
4. "Unknown" → Click IncidentCard
```

---

## Required Pre-requisites (Week 3)

1. **PMTiles loaded** → `federal-boundaries` source exists
2. **Jurisdiction layers rendered** → `usfs-fill`, `blm-fill` visible
3. **missionStore.hoveredJurisdiction** → State shape defined

---

## File Location

```
apps/command-console/src/components/mission/JurisdictionTooltip.tsx
```

---

## Handoff Checklist

- [ ] PMTiles federal boundaries loaded (Week 3 prerequisite)
- [ ] `missionStore` has `hoveredJurisdiction` state
- [ ] `useJurisdictionQuery` hook created
- [ ] MapLibre Popup styling matches glass panel theme

---

## Implementation Priority

```
Day 1: useJurisdictionQuery hook + store state (3h)
Day 2: Tooltip component + visual states (3h)
Total: 6 hours → Week 4 Day 1 deliverable
```

**Critical Path:** Depends on Week 3 PMTiles pipeline. Test with real Deschutes NF boundaries first.

**Risk:** Low. `queryRenderedFeatures` is bulletproof for rendered layers.

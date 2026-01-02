# LayersPanel Component Specification

**Status:** ✅ Complete  
**Priority:** Week 4  
**ADR Reference:** [ADR-012 Appendix B](../../adr/ADR-012-mission-control-ui-overhaul.md#appendix-b-layerspanel-component-spec)  
**Expert Review:** Completed 2025-12-30

---

## Overview

The LayersPanel provides toggleable controls for jurisdictional boundary layers (USFS, BLM, Tribal, Ranger Districts, Wilderness). It enables users to customize map visibility for different ownership overlays.

### User Story

> As a Regional Forester, I need to toggle federal land boundaries on and off so I can quickly identify which fires fall under my jurisdiction versus BLM or Tribal lands.

### Visual Reference

See high-fidelity mockup: [`docs/designs/mockups/ranger-cc-ui-mockup.png`](../../designs/mockups/ranger-cc-ui-mockup.png)

---

## Props Interface

```typescript
/**
 * LayersPanel - Floating panel with boundary layer toggles
 * 
 * @example
 * <LayersPanel onToggle={(layerId) => console.log(`Toggled: ${layerId}`)} />
 */
interface LayersPanelProps {
  /** Callback when a layer is toggled */
  onToggle?: (layerId: string) => void;
  
  /** Optional className for container overrides */
  className?: string;
}
```

---

## State Contract

### Reads From

| Store | Selector | Purpose |
|-------|----------|---------|
| `missionStore` | `useLayersVisible` | Current visibility state per layer |

### Writes To

| Store | Action | Trigger |
|-------|--------|---------|
| `missionStore` | `toggleLayer(layerId)` | LayerToggle click |

---

## Visual States

```
Closed (Icon Only)              Open (Full Panel)               
┌──────────────┐              ┌──────────────────────────────┐
│ 🗂️  (3)      │              │ Layers (3/5 active) ▼ X     │
└──────────────┘              ├──────────────────────────────┤
                             │ Ownership                     │
34px circle                  │ ☑ 🟩 USFS  [outline preview]  │
                            │ ☐ 🟨 BLM                      │
                            │ ☑ 🟫 Tribal                   │
                            ├──────────────────────────────┤
                            │ Operations                    │
                            │ ☐ 🗺️ Ranger Districts        │
                            │ ☑ 🏔️ Wilderness              │
                            └──────────────────────────────┘
```

| State | Size | Content | Animation |
|-------|------|---------|-----------|
| **Closed** | 44px circle | Icon + active count badge | — |
| **Open** | 320×240px | Groups + toggles | Slide up 250ms |
| **Hover Toggle** | Same | Layer flashes on map 500ms | Preview glow |
| **Field Mode** | 360×280px | Larger text/targets | Higher contrast |

---

## Layer Configuration

```typescript
const LAYERS = [
  { id: 'usfs', group: 'ownership', label: 'USFS', color: '#10B981', icon: '🟩' },
  { id: 'blm', group: 'ownership', label: 'BLM', color: '#F59E0B', icon: '🟨' },
  { id: 'tribal', group: 'ownership', label: 'Tribal', color: '#92400E', icon: '🟫' },
  { id: 'rangerDistricts', group: 'operations', label: 'Ranger Districts', color: '#3B82F6', icon: '🗺️' },
  { id: 'wilderness', group: 'operations', label: 'Wilderness', color: '#8B5CF6', icon: '🏔️' },
] as const;
```

---

## Behavior

### Panel Lifecycle

1. **Click icon** → Open panel (slide up)
2. **Click X or outside** → Close panel
3. **Layer toggle** → `toggleLayer(id)` + MapLibre `setLayoutProperty`
4. **Hover toggle** → Flash layer preview 500ms

### MapLibre Integration

```tsx
const toggleLayer = useCallback((layerId: string) => {
  const map = useMap();
  const layerNames = {
    usfs: ['usfs-fill', 'usfs-outline'],
    blm: ['blm-fill', 'blm-outline'],
    // ...
  };
  
  const visibility = layersVisible[layerId] ? 'none' : 'visible';
  layerNames[layerId].forEach(layerName => {
    map.setLayoutProperty(layerName, 'visibility', visibility);
  });
  
  setLayersVisible(prev => ({ ...prev, [layerId]: !prev[layerId] }));
}, [layersVisible, map]);
```

### Hover Preview (500ms flash)

```tsx
const previewLayer = useCallback((layerId: string) => {
  const map = useMap();
  // Temporarily boost opacity
  map.setPaintProperty(`${layerId}-outline`, 'line-opacity', 1);
  setTimeout(() => {
    map.setPaintProperty(`${layerId}-outline`, 'line-opacity', 0.8);
  }, 500);
}, [map]);
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard** | `tabindex="0"`, Arrow/Enter toggles |
| **Screen Reader** | `aria-expanded` on panel, `aria-checked` on toggles |
| **Roles** | `role="region" aria-label="Layer controls"` |
| **Live Region** | `aria-live="polite"` announces "3 of 5 layers active" |
| **Touch Targets** | 48px min (field mode: 56px) |

```tsx
<div role="region" aria-label="Layer controls" aria-live="polite">
  <div role="button" aria-expanded={isOpen} aria-label="Toggle layers panel">
    {/* Icon + count */}
  </div>
</div>
```

---

## Dependencies

| Type | Import | Purpose |
|------|--------|---------|
| **Store** | `useLayersVisible`, `useToggleLayer` | Layer state management |
| **Map** | `useMap` (react-map-gl) | `setLayoutProperty` calls |
| **Child** | `LayerToggle` | Individual layer checkboxes |
| **Icons** | `Layers`, `X` from `lucide-react` | Panel controls |
| **Utils** | `cn`, `useClickOutside` | Conditional styling, close handler |

### missionStore Shape

```ts
layersVisible: Record<'usfs'|'blm'|'tribal'|'rangerDistricts'|'wilderness', boolean>;
toggleLayer: (id: LayerId) => void;
```

### LayerToggle Child

```tsx
// LayerToggle.tsx
interface Props { id: string; label: string; color: string; visible: boolean; onToggle: () => void; }
<LayerToggle id="usfs" label="USFS" color="#10B981" visible={layersVisible.usfs} onToggle={() => toggleLayer('usfs')} />
```

---

## Test Scenarios

### Unit Tests

| Test | Assertion |
|------|-----------|
| `renders correct layer count` | "3/5 active" badge |
| `toggles call onToggle` | Fires parent callback |
| `groups layers correctly` | Ownership/Operations separation |

### Integration Tests

| Test | Mock | Assertion |
|------|------|-----------|
| `MapLibre layer visibility` | Mock `useMap()` | `setLayoutProperty` called with correct params |
| `hover preview flashes` | Mock timeout | Opacity changes 500ms |
| `close on outside click` | Mock click event | Panel closes |

### Visual Regression

| Scenario | State | Layers Active |
|----------|-------|---------------|
| `closed-icon` | Closed | 3 active badge |
| `open-default` | Open | USFS/Tribal/Wilderness |
| `hover-preview` | USFS toggle hover | Outline glow on map |
| `field-mode-open` | Open | Larger targets, high contrast |

---

## Responsive Positioning

```tsx
const getPosition = useBreakpoint() => {
  switch (breakpoint) {
    case 'mobile': return 'bottom-20 left-4 w-full max-w-sm'; // Bottom sheet part
    case 'tablet': return 'bottom-4 right-4 w-72';
    case 'desktop': return 'bottom-4 right-[336px] w-80'; // Left of IncidentRail
    default: return 'bottom-4 right-4 w-72';
  }
};
```

---

## Implementation Notes

### Performance

- Layers stay loaded (`visibility: none`), just hidden
- No source re-fetching on toggle
- Hover preview only affects paint properties

### Z-Order Safety

```tsx
// Always render boundaries below hotspots
const LAYER_ORDER = [
  'usfs-fill', 'usfs-outline',     // z=1
  'blm-fill', 'blm-outline',       // z=2  
  'hotspots-clusters', 'hotspots'  // z=10 (always on top)
];
```

### Mobile Bottom Sheet Integration

```tsx
// Mobile: Part of IncidentRail bottom sheet
<BottomSheet>
  <LayersPanel className="mt-4" />
</BottomSheet>
```

---

## Required Pre-requisites (Week 3 Complete)

1. **PMTiles federal-boundaries source** loaded
2. **Boundary layers** rendered (`usfs-fill`, etc.)
3. **missionStore.layersVisible** state defined

---

## File Location

```
apps/command-console/src/components/mission/LayersPanel.tsx
```

---

## Handoff Checklist

- [ ] `missionStore` has `layersVisible` state
- [ ] PMTiles boundary data loaded (Week 3 prerequisite)
- [ ] `LayerToggle` component created
- [ ] Layer color constants defined

---

## Implementation Priority

```
Day 1: LayersPanel container + store integration (4h)
Day 2: LayerToggle child + MapLibre toggle logic (3h) 
Day 3: Hover preview + responsive + tests (3h)
```

**Critical Dependencies:** Week 3 PMTiles + store state.

**Risk:** Medium. MapLibre layer ID mismatches break toggles. **Test with real layer names first.**

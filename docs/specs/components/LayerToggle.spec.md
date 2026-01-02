# LayerToggle Component Specification

**Status:** ✅ Complete  
**Priority:** Week 4  
**ADR Reference:** [ADR-012 LayersPanel](../../adr/ADR-012-mission-control-ui-overhaul.md#appendix-b-layerspanel-component-spec)  
**Expert Review:** Completed 2025-12-30

---

## Overview

LayerToggle is an atomic component representing a single toggleable map layer with a color swatch indicator. Used within LayersPanel.

### User Story

> As a user interacting with the Layers Panel, I need to clearly see which layers are active and their associated colors so I can correlate map overlays with the toggles.

### Visual Reference

See high-fidelity mockup: [`docs/designs/mockups/ranger-cc-ui-mockup.png`](../../designs/mockups/ranger-cc-ui-mockup.png)

---

## Props Interface

```typescript
/**
 * LayerToggle - Individual layer checkbox with color swatch
 * 
 * @example
 * <LayerToggle
 *   id="usfs"
 *   label="USFS"
 *   color="#228B22"
 *   checked={layersVisible.usfs}
 *   onToggle={() => toggleLayer('usfs')}
 * />
 */
interface LayerToggleProps {
  /** Unique layer identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Color for the swatch (hex or CSS color) */
  color: string;
  
  /** Current visibility state */
  checked: boolean;
  
  /** Toggle callback */
  onToggle: () => void;
  
  /** Optional: Show preview on hover */
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  
  /** Optional className */
  className?: string;
}
```

---

## Visual States

```
Unchecked (Off)                    Checked (On)                  
┌─────────────────────────┐       ┌─────────────────────────┐
│ ☐ 🟥 USFS               │       │ ☑ 🟩 USFS               │
└─────────────────────────┘       └─────────────────────────┘

Hover (Unchecked)                  Hover (Checked)               
┌─────────────────────────┐       ┌─────────────────────────┐
│ ☐ 🟧 USFS *             │       │ ☑ 🟫 USFS *             │
└─────────────────────────┘       └─────────────────────────┘
          ↑                           ↑
     Swatch glow + asterisk        Swatch pulse
```

| State | Checkbox | Swatch | Label | Map Effect | Duration |
|-------|----------|--------|-------|------------|----------|
| **Unchecked** | `border-gray-400` | `opacity-50` | `text-gray-400` | — | — |
| **Checked** | `bg-emerald-500` | `border-2 ${color}` | `text-white` | Layer visible | — |
| **Hover (Unchecked)** | `ring-2 ring-blue-400` | `brightness-150` + `*` | `text-blue-400` | Flash preview | 500ms |
| **Hover (Checked)** | `ring-2 ring-emerald-400` | `scale-110 pulse` + `*` | `text-emerald-400` | Opacity pulse | 500ms |
| **Field Mode** | `min-h-14 min-w-14` | `border-3` | `font-bold text-shadow` | — | — |

### Precise Layout (44px height)

```
[44px height row]
│ [16x16 checkbox] [12x12 swatch] [gap-3] [Label text] [Asterisk* on hover] │
```

---

## Layer Color Constants

```typescript
// constants/layerColors.ts
export const LAYER_COLORS: Record<string, string> = {
  usfs: '#10B981',           // Emerald green
  blm: '#F59E0B',            // Amber orange  
  tribal: '#92400E',         // Brown
  rangerDistricts: '#3B82F6', // Blue
  wilderness: '#8B5CF6',     // Violet
} as const;
```

### MapLibre Paint Property Sync

```tsx
// Map style matches exactly
'usfs-fill': { 'fill-color': '#10B981', 'fill-opacity': 0.15 },
'usfs-outline': { 'line-color': '#10B981', 'line-width': 2 },
```

---

## Behavior

### Click Handler

```tsx
const handleToggle = () => {
  onToggle(); // → parent toggleLayer(id)
};
```

### Hover Preview (500ms flash)

```tsx
const [isPreviewing, setIsPreviewing] = useState(false);

const handleHoverStart = () => {
  onHoverStart?.(); // → LayersPanel.previewLayer(id)
  setIsPreviewing(true);
  
  // Self-timeout for asterisk
  setTimeout(() => setIsPreviewing(false), 500);
};

const handleHoverEnd = () => {
  onHoverEnd?.();
  setIsPreviewing(false);
};
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Role** | `role="checkbox" aria-checked={checked}` |
| **Label** | `<label>` wraps entire row (`htmlFor={id}`) |
| **Keyboard** | Enter/Space toggles (label focus) |
| **Screen Reader** | `aria-label="Toggle ${label} layer visibility"` |
| **Focus** | `focus-visible:ring-2 ring-blue-400` |

```tsx
<label htmlFor={id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/20 cursor-pointer group">
  <input
    id={id}
    type="checkbox"
    checked={checked}
    onChange={handleToggle}
    className="w-4 h-4 rounded focus:ring-2"
    aria-label={`Toggle ${label} layer`}
  />
  <div 
    className={cn(
      "w-3 h-3 rounded border-2 flex-shrink-0",
      checked ? `border-[${color}]` : 'border-gray-500 opacity-50',
      isPreviewing && 'animate-pulse brightness-150'
    )}
    style={{ backgroundColor: checked ? color : 'transparent' }}
  />
  <span className="font-medium text-sm flex-1">{label}</span>
  {isPreviewing && <span className="text-xs text-blue-400 ml-1">*</span>}
</label>
```

---

## Dependencies

| Type | Import | Purpose |
|------|--------|---------|
| **Constants** | `LAYER_COLORS` | Exact color matching |
| **Utils** | `cn` (clsx/tailwind-merge) | Complex conditional classes |
| **Icons** | None (uses CSS shapes) | Color swatch via `div` |
| **Parent** | `LayersPanel` | Provides `onHoverStart/End` |

---

## Test Scenarios

### Unit Tests

| Test | Input | Assertion |
|------|-------|-----------|
| `renders unchecked` | `checked={false}` | Empty checkbox, muted swatch |
| `renders checked` | `checked={true}` | Filled checkbox, color swatch |
| `calls onToggle` | Click | Fires callback once |
| `hover asterisk` | `onHoverStart` | Shows `*` for 500ms |
| `color prop sync` | `color="#10B981"` | Swatch border matches |

### Integration Tests (with LayersPanel)

| Test | Action | Assertion |
|------|--------|-----------|
| `parent receives toggle` | Click USFS | `LayersPanel.toggleLayer('usfs')` called |
| `hover triggers preview` | Hover USFS | `LayersPanel.previewLayer('usfs')` called |
| `field mode sizing` | Field mode on | Checkbox 56×56px |

### Visual Regression

| Scenario | State | Color |
|----------|-------|-------|
| `usfs-checked` | On | Emerald green |
| `blm-unchecked` | Off | Muted amber |
| `hover-active` | Hover checked | Pulse + asterisk |
| `field-mode` | Field mode | 56px targets, bold |

---

## Implementation Notes

**Performance:** Pure CSS hover effects, no JavaScript animations.

**Color Precision:** Swatch uses **exact hex** from `LAYER_COLORS` → zero mismatch with MapLibre.

**Field Mode Overrides:**

```css
.field-mode .layer-toggle {
  min-height: 56px;
  padding: 1rem;
}

.field-mode .layer-swatch {
  border-width: 3px !important;
}
```

**RTL Support:** Flex row handles right-to-left naturally.

---

## Required Pre-requisites

1. **LAYER_COLORS constant** defined (5min)
2. **LayersPanel parent** renders LayerToggle children

---

## File Location

```
apps/command-console/src/components/mission/LayerToggle.tsx
```

---

## Handoff Checklist

- [ ] Color constants for each layer defined
- [ ] Checkbox component from UI library or custom

---

## Implementation Priority

```
15min: Base checkbox + label wrapper
30min: Color swatch + hover states  
45min: Field mode + accessibility
30min: Tests + visual regression
```

**Total: 3 hours** → Week 4 Day 2 deliverable.

**Risk:** None. Standard checkbox pattern with color swatch.

**Pro tip:** Extract to shared `@ranger/ui` package. Used by 3+ future map screens (Tactical, Regional, Incident).

# FieldModeToggle Component Specification

**Status:** ✅ Complete  
**Priority:** Week 2  
**ADR Reference:** [ADR-012 Field Mode Styling](../../adr/ADR-012-mission-control-ui-overhaul.md#field-mode-styling)  
**Expert Review:** Completed 2025-12-30

---

## Overview

The FieldModeToggle provides a high-contrast display mode optimized for outdoor field use on tablets and mobile devices. When enabled, it removes glassmorphism effects, increases contrast ratios, and enlarges touch targets.

### User Story

> As a field crew member using RANGER on a tablet in bright sunlight, I need a high-contrast display mode so I can read the interface without squinting or seeking shade.

### Visual Reference

See high-fidelity mockup: [`docs/designs/mockups/ranger-cc-ui-mockup.png`](../../designs/mockups/ranger-cc-ui-mockup.png)

---

## Props Interface

```typescript
/**
 * FieldModeToggle - Switch between standard and high-contrast field mode
 * 
 * @example
 * <FieldModeToggle position="top-right" />
 */
interface FieldModeToggleProps {
  /** Position in the map container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /** Optional className for container overrides */
  className?: string;
}
```

---

## State Contract

### Reads From

| Store | Selector | Purpose |
|-------|----------|---------|
| `missionStore` | `useFieldMode` | Current field mode state |

### Writes To

| Store | Action | Trigger |
|-------|--------|---------|
| `missionStore` | `setFieldMode(enabled)` | Toggle click |

---

## Visual States

```
┌─────────────────┐    ┌─────────────────┐
│  ☀️              │    │  🌙              │
│                 │    │                 │
│  Field Mode     │    │  Field Mode     │
│     OFF         │    │      ON         │
└─────────────────┘    └─────────────────┘
     Default              Active
```

| State | Icon | Background | Border | Size | Tooltip |
|-------|------|------------|--------|------|---------|
| **Default (Off)** | ☀️ Sun | `bg-black/30` | None | 44px | "Enable field mode for sunlight" |
| **Hover** | ☀️ Sun | `bg-black/50` | `border-2 white/50` | 46px (scale 1.05) | — |
| **Active (On)** | 🌙 Contrast | `bg-emerald-500/90` | `border-2 emerald-400` | 44px | "Disable field mode" |
| **Field Mode (On + Field)** | 🌙 Contrast | `bg-emerald-600` | `border-2 white` | 52px | — |

### Implementation

```tsx
const Icon = fieldMode ? Sun : Contrast; // Lucide icons
className={cn(
  "glass-panel p-3 rounded-xl transition-all duration-200",
  fieldMode ? "bg-emerald-500/90 border-2 border-emerald-400 field-mode" : "bg-black/30 hover:bg-black/50 hover:scale-105"
)}
```

---

## Behavior

1. **Toggle Click** → `setFieldMode(!fieldMode)`
2. **Class Application** → Add/remove `field-mode` to `<html>` or `#mission-root`
3. **Persistence** → `localStorage.setItem('ranger:fieldMode', String(fieldMode))`
4. **System Respect** → Check `prefers-contrast: more` on mount
5. **Rehydration** → Read localStorage on app init

```tsx
// useFieldModeEffect.ts
useEffect(() => {
  if (fieldMode) {
    document.documentElement.classList.add('field-mode');
    localStorage.setItem('ranger:fieldMode', 'true');
  } else {
    document.documentElement.classList.remove('field-mode');
    localStorage.removeItem('ranger:fieldMode');
  }
}, [fieldMode]);

// Initial state
const initialFieldMode = useMemo(() => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ranger:fieldMode') === 'true' ||
         window.matchMedia('(prefers-contrast: more)').matches;
}, []);
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Touch Target** | 52px field mode, 44px default (WCAG 2.5.5) |
| **Keyboard** | `tabindex="0"`, Enter/Space toggles |
| **Screen Reader** | `role="switch" aria-checked={fieldMode}` |
| **Label** | `aria-label="Toggle field mode for outdoor visibility"` |
| **Live Region** | `aria-live="polite"` announces state change |

```tsx
<button
  role="switch"
  aria-checked={fieldMode}
  aria-label={`Field mode ${fieldMode ? 'on' : 'off'}`}
  className={buttonClasses}
  onClick={() => setFieldMode(!fieldMode)}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFieldMode(!fieldMode); }}
/>
```

---

## Dependencies

| Type | Import | Purpose |
|------|--------|---------|
| **Store** | `useFieldMode` from `missionStore` | Read/write field mode state |
| **Icons** | `Sun`, `Contrast` from `lucide-react` | Visual toggle state |
| **Utils** | `cn` from `clsx/tailwind-merge` | Conditional classes |
| **CSS** | `field-mode.css` (global) | App-wide style overrides |

### missionStore Addition

```ts
// stores/missionStore.ts
fieldMode: boolean;
setFieldMode: (enabled: boolean) => void;
```

---

## Test Scenarios

### Unit Tests

| Test | Assertion |
|------|-----------|
| `renders sun icon when off` | Finds ☀️, no `field-mode` class |
| `renders contrast icon when on` | Finds 🌙, has `field-mode` class |
| `toggles state on click` | Calls `setFieldMode` with `!current` |
| `respects initial localStorage` | Renders correct icon from stored value |

### Integration Tests

| Test | Assertion |
|------|-----------|
| `applies field-mode to html` | `document.documentElement.classList.contains('field-mode')` |
| `persists across page reload` | localStorage value matches UI state |
| `respects system prefers-contrast` | Initial state matches media query |

### Visual Regression

| Viewport | State | CSS Class |
|----------|-------|-----------|
| `desktop` | Off | No field-mode |
| `desktop` | On | field-mode active |
| `tablet` | Hover | Scale + border |
| `mobile-field` | On | 52px touch target |

---

## Implementation Notes

**Performance:** Single `classList.add/remove` on `<html>` → zero re-render cascade.

**Safari Fix:** iOS clipboard + field mode conflict:

```tsx
// FieldModeToggle.tsx
useEffect(() => {
  if (fieldMode && navigator.userAgent.includes('iPhone')) {
    // Boost iOS Safari contrast further
    document.documentElement.style.setProperty('--ios-contrast-boost', '1.3');
  }
}, [fieldMode]);
```

**Future:** Auto-detect sunlight via `AmbientLightSensor` API (Chrome 90+).

---

## Required Store Changes (Week 2 Pre-req)

```typescript
// missionStore.ts additions
interface MissionState {
  fieldMode: boolean;
  // ...
}

const useFieldModeStore = create((set) => ({
  fieldMode: false,
  setFieldMode: (enabled: boolean) => set({ fieldMode: enabled }),
}));
```

---

## CSS Completion (Global Import)

```css
/* styles/globals.css */
@import './field-mode.css';

/* Root variables */
:root {
  --panel-bg: rgba(0,0,0,0.7);
  --text-primary: #E5E7EB;
  --touch-target: 44px;
}

.field-mode {
  --panel-bg: rgba(0,0,0,0.95);
  --text-primary: #FFFFFF;
  --touch-target: 52px;
}

.field-mode * {
  min-height: var(--touch-target);
  min-width: var(--touch-target);
}
```

---

## File Location

```
apps/command-console/src/components/mission/FieldModeToggle.tsx
```

---

## Handoff Checklist

- [ ] `missionStore` has `fieldMode` state and `setFieldMode` action
- [ ] `field-mode.css` created in styles directory
- [ ] CSS imported in global stylesheet
- [ ] Sun/Contrast icons from Lucide

---

## Implementation Priority

```
Day 1: Store integration + component shell (2h)
Day 1: Visual states + toggle logic (2h)
Total: 4 hours → Week 2 Day 1 deliverable
```

**Risk:** Zero. Simplest component in suite. Store integration is the only dependency.

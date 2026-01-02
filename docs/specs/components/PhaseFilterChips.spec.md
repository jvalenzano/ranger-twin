# PhaseFilterChips Component Specification

**Status:** ✅ Complete  
**Priority:** Week 1  
**ADR Reference:** [ADR-012 Appendix A](../../adr/ADR-012-mission-control-ui-overhaul.md#appendix-a-phasefilterchips-component-spec)  

---

## Overview

PhaseFilterChips provides a chip-based multi-select filter for fire recovery phases. It replaces the ambiguous "Phase" dropdown with clear, contextual filtering that shows counts per phase.

### User Story

> As a Forest Supervisor, I need to quickly filter my portfolio by recovery phase so I can focus on fires that need BAER assessment attention right now versus those in active suppression.

### Visual Reference

Located in the Left Rail (`absolute left-0`) below the NavTabs (National | Watchlist). See mockup at `docs/designs/mockups/ranger-cc-ui-mockup.png`.

---

## Props Interface

```typescript
/**
 * PhaseFilterChips - Multi-select chip filter for fire recovery phases
 * 
 * Supports collapsed (icon-only) and expanded (full labels) states.
 * Integrates with missionStore for filter persistence.
 * 
 * @example
 * <PhaseFilterChips collapsed={isRailCollapsed} />
 */
interface PhaseFilterChipsProps {
  /** 
   * When true, shows compact view with colored dots and count badges.
   * When false, shows full labels with checkboxes.
   * @default false
   */
  collapsed?: boolean;
  
  /** Optional className for container overrides */
  className?: string;
}
```

---

## State Contract

### Reads From

| Store | Selector | Purpose |
|-------|----------|---------|
| `missionStore` | `usePhaseFilter` | Currently selected phases |
| React Query | `useIncidents` | Count of fires per phase |

### Writes To

| Store | Action | Trigger |
|-------|--------|---------|
| `missionStore` | `togglePhaseFilter(phase)` | Chip click |

### Local State

```typescript
// No local state needed - fully controlled by missionStore
```

---

## Data Model

### Phase Definitions

```typescript
type FirePhase = 'active' | 'baer_assessment' | 'baer_implementation' | 'in_restoration';

interface PhaseConfig {
  id: FirePhase;
  label: string;
  shortLabel: string;
  description: string;
  color: string;        // Tailwind color class
  dotColor: string;     // Hex for SVG dot
  icon: LucideIcon;
}

const PHASE_CONFIG: Record<FirePhase, PhaseConfig> = {
  active: {
    id: 'active',
    label: 'Active Suppression',
    shortLabel: 'Active',
    description: 'Fire is actively burning, suppression ongoing',
    color: 'bg-red-500',
    dotColor: '#EF4444',
    icon: Flame,
  },
  baer_assessment: {
    id: 'baer_assessment',
    label: 'BAER Assessment',
    shortLabel: 'Assessment',
    description: 'Post-fire, undergoing Burned Area Emergency Response assessment',
    color: 'bg-amber-500',
    dotColor: '#F59E0B',
    icon: ClipboardCheck,
  },
  baer_implementation: {
    id: 'baer_implementation',
    label: 'BAER Implementation',
    shortLabel: 'Implementation',
    description: 'BAER treatments approved and being implemented',
    color: 'bg-yellow-500',
    dotColor: '#EAB308',
    icon: Hammer,
  },
  in_restoration: {
    id: 'in_restoration',
    label: 'In Restoration',
    shortLabel: 'Restoration',
    description: 'Long-term restoration and monitoring phase',
    color: 'bg-green-500',
    dotColor: '#22C55E',
    icon: Sprout,
  },
};
```

---

## Visual States

### Expanded State (Default)

Full labels with checkboxes, multi-select enabled.

```
┌─────────────────────────────┐
│ Filter by Phase             │
├─────────────────────────────┤
│ ☑ 🔴 Active (12)           │
│ ☑ 🟠 BAER Assessment (32)  │
│ ☑ 🟡 BAER Implementation (11)│
│ ☑ 🟢 In Restoration (4)    │
├─────────────────────────────┤
│ 59 fires shown              │
└─────────────────────────────┘
```

### Collapsed State

Compact view with colored dots and count badges (48px wide).

```
┌────┐
│ 🔴 │ 12
│ 🟠 │ 32
│ 🟡 │ 11
│ 🟢 │ 4
└────┘
```

### Chip States

| State | Appearance |
|-------|------------|
| Selected | Filled background, white text, checkmark |
| Unselected | Outline only, muted text |
| Hover | Subtle glow, scale 1.02 |
| Disabled | 50% opacity (only when last chip would be deselected) |

### Phase Color Legend

| Phase | Color | Hex | Tailwind |
|-------|-------|-----|----------|
| Active | Red | #EF4444 | `bg-red-500` |
| BAER Assessment | Amber | #F59E0B | `bg-amber-500` |
| BAER Implementation | Yellow | #EAB308 | `bg-yellow-500` |
| In Restoration | Green | #22C55E | `bg-green-500` |

### Field Mode Variant
- Higher contrast borders (2px solid)
- Larger touch targets (56px height)
- Bold text (font-weight 700)
- No glassmorphism background

---

## Behavior

### Multi-Select Logic

1. User clicks a chip
2. If chip is selected → Deselect (unless it's the last selected)
3. If chip is unselected → Select
4. At least one phase must always be selected (prevents empty filter)
5. Store updates via `togglePhaseFilter(phase)`
6. Incident list and map filter immediately

### Prevent Empty Selection

```typescript
const handleToggle = (phase: FirePhase) => {
  const currentPhases = usePhaseFilter();
  
  // Prevent deselecting the last phase
  if (currentPhases.length === 1 && currentPhases[0] === phase) {
    // Show toast: "At least one phase must be selected"
    return;
  }
  
  togglePhaseFilter(phase);
};
```

### Collapse/Expand Behavior

| Trigger | Action |
|---------|--------|
| Rail collapses | Chips animate to collapsed state |
| Rail expands (hover) | Chips animate to expanded state |
| Mobile bottom sheet | Always expanded when visible |

### Animation

```css
/* Expand/collapse transition */
.phase-chip {
  transition: all 200ms ease-out;
}

.phase-chip.collapsed {
  width: 48px;
  padding: 8px;
}

.phase-chip.expanded {
  width: 100%;
  padding: 8px 16px;
}
```

### Count Updates

- Counts refresh when incident data updates (React Query)
- Show skeleton loader during initial fetch
- Counts reflect filters from other sources (region, search)

---

## Accessibility

### Touch Targets
- Expanded: 44px height minimum, full width
- Collapsed: 48px × 48px minimum
- Field mode: 56px height

### Keyboard Navigation
- Tab navigates between chips
- Space/Enter toggles selection
- Arrow keys navigate within group (optional enhancement)

### Screen Reader
- `role="group"` on container
- `aria-label="Filter fires by recovery phase"`
- Each chip: `role="checkbox"` with `aria-checked`
- Count announced: `aria-label="Active phase, 12 fires, selected"`

### Color Contrast
- Selected state: White text on colored background (7:1+)
- Unselected state: Standard text on transparent (4.5:1+)
- Color alone does not convey state (checkmark icon included)

---

## Dependencies

### Hooks
```typescript
import { usePhaseFilter, useMissionStore } from '@/stores/missionStore';
import { useFireStatistics } from '@/hooks/useFireStatistics'; // TO CREATE - wraps nationalFireService.getStatistics()
```

### Data Source Notes

**Current State:**
- Phase counts available via `nationalFireService.getStatistics().byPhase`
- Service returns `FireStatistics` with `byPhase: Record<FirePhase, number>`
- Need hook wrapper to enable component re-render on data refresh

### External Libraries
```typescript
import { Flame, ClipboardCheck, Hammer, Sprout, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Optional for animations
```

### Child Components
- `Chip` (internal, or from component library)
- `Tooltip` (for collapsed state hover)

---

## Test Scenarios

### Unit Tests

| Test | Description |
|------|-------------|
| `renders all four phases` | Verify all chips display |
| `shows correct counts` | Mock data, verify count badges |
| `toggles selection on click` | Click chip, verify store update |
| `prevents empty selection` | Last chip click shows toast, no deselect |
| `collapsed state renders dots` | Set collapsed=true, verify compact view |

### Integration Tests

| Test | Description |
|------|-------------|
| `filters incident list` | Toggle phase, verify list updates |
| `filters map markers` | Toggle phase, verify map layer filter |
| `persists across sessions` | Reload page, verify filter state restored |
| `syncs with URL params` | (Future) Verify URL reflects filter state |

### Visual Regression

| Test | Viewport | Variant |
|------|----------|---------|
| `expanded-all-selected` | 1440×900 | All phases selected |
| `expanded-partial` | 1440×900 | 2 of 4 selected |
| `collapsed-default` | 1440×900 | Collapsed state |
| `field-mode-expanded` | 1024×768 | Field mode active |
| `mobile-bottom-sheet` | 390×844 | Mobile layout |

---

## Implementation Notes

### Performance Considerations
- Use `useMemo` for phase count calculations
- Debounce rapid toggle clicks (300ms)
- Avoid re-renders on unrelated store updates

### Known Constraints
- missionStore v2 migration handles old 3-phase → 4-phase conversion
- "In BAER" splits into "Assessment" and "Implementation"
- "In Recovery" renamed to "In Restoration"

### Future Enhancements
- "Select All" / "Clear" actions
- Phase filter presets (e.g., "BAER Focus" = Assessment + Implementation)
- Drag to reorder phases
- URL param sync for shareable filter states

---

## File Location

```
apps/command-console/src/components/mission/PhaseFilterChips.tsx
```

---

## Related Components

| Component | Relationship |
|-----------|--------------|
| `IncidentRail` | Consumes phase filter to show filtered list |
| `NationalMap` | Consumes phase filter for marker visibility |
| `BriefingStrip` | Shows counts that respect phase filter |
| `CommandSidebar` | Parent container, controls collapsed state |

---

## Handoff Checklist

Before implementation, verify:

- [ ] `missionStore` has `togglePhaseFilter` action - ✅ Already exists
- [ ] Create `useFireStatistics` hook (wraps `nationalFireService.getStatistics()`)
- [ ] Tailwind phase colors defined in config - ✅ In `PHASE_DISPLAY` constant
- [ ] Lucide icons installed (`lucide-react`) - ✅ Already in project
- [ ] Toast library available for empty selection warning - Check if exists or use alert
- [ ] Field mode CSS variables defined (create if missing)
- [ ] Migration complete from v1 (3-phase) to v2 (4-phase) - ✅ Done in missionStore v2

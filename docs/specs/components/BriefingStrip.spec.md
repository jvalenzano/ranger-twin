# BriefingStrip Component Specification

**Status:** ✅ Complete  
**Priority:** Week 1  
**ADR Reference:** [ADR-012 Appendix C](../../adr/ADR-012-mission-control-ui-overhaul.md#appendix-c-briefingstrip-component-spec)  

---

## Overview

The BriefingStrip is a persistent top bar that displays portfolio-level metrics and provides a one-click briefing summary for the "8-minute reality" — Forest Supervisors need instant answers for Washington calls.

### User Story

> As Regional Forester Maria, I need to see portfolio status at a glance and copy a 30-second briefing summary so I can prepare for my 6:40 AM call with Washington in under 8 minutes.

### Visual Reference

Located at `absolute top-0 w-full` in the MissionControlView hierarchy. See mockup at `docs/designs/mockups/ranger-cc-ui-mockup.png`.

---

## Props Interface

```typescript
/**
 * BriefingStrip - Portfolio metrics bar with copy-to-clipboard briefing
 * 
 * @example
 * <BriefingStrip 
 *   onCopyBriefing={() => toast.success('Briefing copied!')}
 * />
 */
interface BriefingStripProps {
  /** Optional callback after briefing is copied to clipboard */
  onCopyBriefing?: () => void;
  
  /** Optional className for container overrides */
  className?: string;
}
```

---

## State Contract

### Reads From

| Store | Selector | Purpose |
|-------|----------|---------|
| `missionStore` | `useHotspotSettings` | Active hotspot count display |
| `missionStore` | `useMissionFilters` | Phase filter state for counts |
| React Query | `useIncidents` | Fire counts by phase, acres by jurisdiction |
| React Query | `useFIRMSData` | Last FIRMS update timestamp |

### Writes To

| Store | Action | Trigger |
|-------|--------|---------|
| None | — | BriefingStrip is read-only display |

### Local State

```typescript
const [isCopying, setIsCopying] = useState(false);
const [copySuccess, setCopySuccess] = useState(false);
```

---

## Visual States

### Default State
- Semi-transparent glass panel background
- 4 MetricChips in horizontal row
- "Copy Briefing" button on right
- Height: 48px (desktop), 40px (mobile)

### Metric Chip States

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔥 2,143      📊 47 fires      🌲 1.2M NFS     ⏱️ 0615 UTC        │
│  hotspots      32A | 11I | 4R   340K BLM       [Copy Briefing]     │
└─────────────────────────────────────────────────────────────────────┘
```

| Metric | Icon | Primary | Secondary |
|--------|------|---------|-----------|
| Active Hotspots | 🔥 (Flame) | Count (2,143) | — |
| Fires by Phase | 📊 (Chart) | Total (47 fires) | "32A \| 11I \| 4R" |
| Acres by Jurisdiction | 🌲 (Tree) | NFS acres (1.2M) | BLM acres (340K) |
| Last FIRMS Update | ⏱️ (Clock) | Time (0615 UTC) | — |

### Copy Button States

| State | Appearance |
|-------|------------|
| Default | Ghost button with clipboard icon |
| Hover | Slight background, scale 1.02 |
| Copying | Spinner icon, disabled |
| Success | Check icon, green tint, 2s duration |

### Field Mode Variant
- Full opacity background (no glassmorphism)
- Increased font weight (700)
- Higher contrast text
- Larger touch targets (min 48px)

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full labels, all metrics visible |
| Tablet (768-1024px) | Abbreviated labels, 4 metrics |
| Mobile (<768px) | Icons only, 3 metrics (hide FIRMS), stacked copy button |

---

## Behavior

### Copy Briefing Action

1. User clicks "Copy Briefing" button
2. Button shows loading spinner
3. Generate briefing text from current metrics:
   ```
   National Status (12/30 0640): 2,143 active hotspots across 47 incidents.
   BAER: 32 assessments, 11 implementations. 1.2M acres NFS, 340K BLM.
   Last FIRMS update: 0615 UTC.
   ```
4. Copy to clipboard via `navigator.clipboard.writeText()`
5. Show success state (check icon) for 2 seconds
6. Call `onCopyBriefing` callback if provided
7. Return to default state

### Briefing Text Template

```typescript
const generateBriefingText = (metrics: BriefingMetrics): string => {
  const now = new Date();
  const dateStr = format(now, 'MM/dd HHmm');
  
  return [
    `National Status (${dateStr}): ${metrics.activeHotspots.toLocaleString()} active hotspots across ${metrics.totalFires} incidents.`,
    `BAER: ${metrics.firesByPhase.baer_assessment} assessments, ${metrics.firesByPhase.baer_implementation} implementations.`,
    `${formatAcres(metrics.acresByJurisdiction.nfs)} acres NFS, ${formatAcres(metrics.acresByJurisdiction.blm)} BLM.`,
    `Last FIRMS update: ${format(metrics.lastFirmsUpdate, 'HHmm')} UTC.`,
  ].join(' ');
};
```

### Auto-Refresh

- Metrics update automatically via React Query background refetch
- No manual refresh button needed
- Stale indicator if data >15 minutes old

---

## Accessibility

### Touch Targets
- Copy button: 48px × 48px minimum (field mode)
- Metric chips: Not interactive (display only)

### Keyboard Navigation
- Copy button: Focusable, activates on Enter/Space
- Tab order: Natural flow left-to-right

### Screen Reader
- `aria-live="polite"` on metrics region for updates
- Copy button: `aria-label="Copy briefing summary to clipboard"`
- Success state: `aria-label="Briefing copied successfully"`

### Color Contrast
- Default: WCAG AA (4.5:1 minimum)
- Field mode: WCAG AAA (7:1 minimum)

---

## Dependencies

### Hooks
```typescript
import { useHotspotSettings } from '@/stores/missionStore';
import { useFireStatistics } from '@/hooks/useFireStatistics'; // TO CREATE
import { useFIRMSLastUpdate } from '@/hooks/useFIRMSData'; // TO CREATE
```

### Data Source Notes

**Current State (as of implementation):**
- `nationalFireService.getStatistics()` returns `FireStatistics` with `byPhase` counts
- Fire data is loaded via `nationalFireService.initialize()` in `IncidentRail`
- FIRMS data is loaded via `firmsService` with caching

**Recommended Approach:**
1. Create `useFireStatistics` hook that wraps `nationalFireService.getStatistics()`
2. Create `useFIRMSLastUpdate` hook that reads from `firmsService` cache metadata
3. Both hooks should support re-render on data refresh

### External Libraries
```typescript
import { format } from 'date-fns';
import { ClipboardCopy, Check, Loader2, Flame, BarChart3, Trees, Clock } from 'lucide-react';
```

### Child Components
- `MetricChip` (internal, not exported)
- `GlassPanel` (from component library)

---

## Test Scenarios

### Unit Tests

| Test | Description |
|------|-------------|
| `renders all four metrics` | Verify metric chips display with correct data |
| `formats large numbers` | 2143 → "2,143", 1200000 → "1.2M" |
| `generates correct briefing text` | Snapshot test of briefing template |
| `copy button state transitions` | Default → Copying → Success → Default |
| `handles clipboard API failure` | Falls back to error toast |

### Integration Tests

| Test | Description |
|------|-------------|
| `reflects real-time metric updates` | Mock React Query update, verify display |
| `persists across view transitions` | Navigate to tactical and back |
| `onCopyBriefing callback fires` | Verify parent component notification |

### Visual Regression

| Test | Viewport | Variant |
|------|----------|---------|
| `desktop-default` | 1440×900 | Light theme |
| `tablet-default` | 1024×768 | Light theme |
| `mobile-default` | 390×844 | Light theme |
| `desktop-field-mode` | 1440×900 | Field mode |
| `copy-success-state` | 1440×900 | After copy |

---

## Implementation Notes

### Performance Considerations
- Memoize `generateBriefingText` to avoid recalculation on every render
- Use `useMemo` for formatted metric values
- Avoid re-renders on unrelated store updates (use selectors)

### Known Constraints
- Clipboard API requires HTTPS in production
- Safari may require user gesture for clipboard access
- Field mode toggle is external (from FieldModeToggle component)

### Future Enhancements
- Customizable briefing template (user preferences)
- Export to PDF option
- Slack/Teams integration for briefing share
- Historical comparison ("vs yesterday")

---

## File Location

```
apps/command-console/src/components/mission/BriefingStrip.tsx
```

---

## Handoff Checklist

Before implementation, verify:

- [ ] Create `useFireStatistics` hook wrapping `nationalFireService.getStatistics()`
- [ ] Create `useFIRMSLastUpdate` hook reading from `firmsService` cache
- [ ] Lucide icons installed (`lucide-react`) - ✅ Already in project
- [ ] `date-fns` available for formatting - ✅ Already in project
- [ ] Tailwind configured with custom glass panel classes - ✅ Exists
- [ ] Field mode CSS variables defined (create if missing)
- [ ] Check `PortfolioSummary.tsx` for reusable patterns

# DX Tooltips Feature Specification

## Executive Summary

**DX Tooltips** (Developer Experience Tooltips) is a feature that provides contextual, in-app technical documentation. When enabled, UI elements display purple indicator dots that, when clicked, reveal detailed explanations of data flows, system integrations, and technical implementation details.

This is part of RANGER's **extensible tooltip category system**:
- **UX Tooltips** (cyan): User experience hints for end users (default: enabled)
- **DX Tooltips** (purple): Developer experience documentation (default: disabled)
- **Future categories**: PX (Product), OX (Operations), AX (Analyst), etc.

**Target Users:**
- Developer onboarding (new team members)
- Living documentation (always up-to-date with code)
- Technical demos (stakeholder presentations)
- Domain learning (understanding USFS workflows)

**Core Principle:** "Click anything to understand how it works."

---

## Feature Components

### 1. Preference Toggle

**File:** `src/stores/preferencesStore.ts`

**State:**
```typescript
interface PreferencesState {
    // Tooltip categories
    uxTooltipsEnabled: boolean;  // User experience tooltips (general help)
    dxTooltipsEnabled: boolean;  // Developer experience tooltips (technical docs)

    // Actions
    setUxTooltipsEnabled: (enabled: boolean) => void;
    toggleUxTooltips: () => void;
    setDxTooltipsEnabled: (enabled: boolean) => void;
    toggleDxTooltips: () => void;

    // Legacy aliases (backwards compatibility)
    tooltipsEnabled: boolean;           // → uxTooltipsEnabled
    technicalTooltipsEnabled: boolean;  // → dxTooltipsEnabled
}
```

**Persistence:** Uses Zustand `persist` middleware with localStorage key `ranger-preferences`.

**Migration:** Automatically migrates old keys (`tooltipsEnabled` → `uxTooltipsEnabled`, `technicalTooltipsEnabled` → `dxTooltipsEnabled`).

**Selector Hooks:**
```typescript
// Primary hooks (new naming)
export const useUxTooltipsEnabled = () => usePreferencesStore((state) => state.uxTooltipsEnabled);
export const useDxTooltipsEnabled = () => usePreferencesStore((state) => state.dxTooltipsEnabled);

// Legacy hooks (backwards compatibility)
export const useTooltipsEnabled = () => usePreferencesStore((state) => state.uxTooltipsEnabled);
export const useTechnicalTooltipsEnabled = () => usePreferencesStore((state) => state.dxTooltipsEnabled);
```

---

### 2. UI Toggle Location

**Files:**
- `src/components/mission/MissionHeader.tsx` (Mission Control)
- `src/components/layout/Header.tsx` (TwinView)

**Location:** Profile dropdown menu

**Visual Design (Sarah Chen Profile):**
```
┌─────────────────────────────────────┐
│ [Avatar] Sarah Chen                 │
│          District Resource Spec.    │
│                                     │
│ 🛡️ Willamette National Forest      │
├─────────────────────────────────────┤
│ [User] View Profile                 │
│ [Bell] Notification Settings        │
│ [Gear] Preferences                  │
│                                     │
│ [💬] UX Tooltips            [○────] │ ← Cyan toggle
│ [⚡] DX Tooltips            [────○] │ ← Purple toggle
│                                     │
│ Look for ● indicators on UI elements│
├─────────────────────────────────────┤
│ [↗] Sign Out                        │
└─────────────────────────────────────┘
```

**Avatar Indicator:** When DX enabled, profile avatar shows purple dot overlay (top-right).

**Consistent User Profile:**
```typescript
const MOCK_USER = {
  name: 'Sarah Chen',
  role: 'District Resource Specialist',
  district: 'Willamette National Forest',
  avatar: 'https://picsum.photos/seed/ranger-sarah/64/64',
};
```

---

### 3. TechnicalTooltip Component (DX Tooltip)

**File:** `src/components/common/TechnicalTooltip.tsx`

**Props Interface:**
```typescript
interface TechnicalTooltipProps {
    /** The element that triggers the tooltip */
    children: ReactNode;

    /** Title of the technical explanation */
    title: string;

    /** Brief one-line description */
    summary: string;

    /** Detailed technical flow/explanation (supports ASCII diagrams) */
    details: string;

    /** Optional: Source file reference */
    sourceFile?: string;

    /** Optional: Key data points to display */
    dataPoints?: { label: string; value: string }[];

    /** Position preference (auto-adjusts if would overflow viewport) */
    position?: 'top' | 'bottom' | 'left' | 'right';
}
```

**Behavior:**
1. **When disabled:** Component renders `children` only (no wrapper, no indicator)
2. **When enabled:**
   - Wraps children in clickable container
   - Shows pulsing purple dot indicator (top-right of element)
   - Click opens tooltip panel

**Tooltip Panel Structure:**
```
┌─────────────────────────────────────────────────┐
│ [Code2] TECHNICAL DOCS                      [×] │
├─────────────────────────────────────────────────┤
│ {title}                                         │
│ {summary} (gray, smaller)                       │
│                                                 │
│ @ {sourceFile} (if provided)                    │
│                                                 │
│ ┌─────────────┐ ┌─────────────┐                │
│ │ {label}     │ │ {label}     │ (dataPoints)   │
│ │ {value}     │ │ {value}     │                │
│ └─────────────┘ └─────────────┘                │
│                                                 │
│ [▶] Show Technical Flow                         │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ {details} - expanded section              │  │
│ │ Supports ASCII diagrams and code lines    │  │
│ └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ DX Tooltips enabled • Profile → DX Tooltips     │
└─────────────────────────────────────────────────┘
```

---

## Visual Design System

### Color Palette
| Category | Toggle Color | Indicator | Usage |
|----------|--------------|-----------|-------|
| UX Tooltips | `bg-cyan-500` | N/A | User help hints |
| DX Tooltips | `bg-purple-500` | Purple dot | Developer documentation |

### DX Tooltip Colors
| Element | Color | Usage |
|---------|-------|-------|
| Indicator dot | `bg-purple-500` | Pulsing dot on enabled elements |
| Header background | `bg-purple-500/10` | Tooltip header strip |
| Header text | `text-purple-300` | "TECHNICAL DOCS" label |
| Code lines | `text-cyan-300` | ASCII diagrams, code snippets |
| Accent | `border-purple-500/30` | Tooltip border, glow |

### Indicator Dot
```css
.absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse
```

### Tooltip Container
```css
.z-[100] bg-slate-950/98 backdrop-blur-xl
border border-purple-500/30 rounded-lg
shadow-[0_0_30px_rgba(168,85,247,0.15)]
```

---

## Dynamic Positioning Algorithm

**File:** `TechnicalTooltip.tsx` → `useLayoutEffect`

The tooltip auto-positions to stay within viewport:

```typescript
// 1. Get trigger element bounds
const trigger = triggerRef.current.getBoundingClientRect();
const tooltipWidth = 400;
const tooltipMaxHeight = Math.min(500, window.innerHeight * 0.7);

// 2. Horizontal positioning priority:
//    a) Left of trigger (if space available)
//    b) Right of trigger (if space available)
//    c) Centered horizontally (fallback)

// 3. Vertical positioning:
//    a) Below trigger (if enough space below)
//    b) Above trigger (if more space above than below)

// 4. Apply as fixed positioning
setTooltipStyle({
    position: 'fixed',
    left: `${calculatedLeft}px`,
    top: `${calculatedTop}px`,
    maxHeight: `${tooltipMaxHeight}px`,
    width: `${tooltipWidth}px`,
});
```

**Close Behavior:**
- Click outside tooltip → closes
- Click × button → closes
- Does NOT close on scroll (intentional for reading while referencing)

---

## Details Formatting

The `details` prop supports ASCII art and code diagrams. Lines are auto-formatted:

**Detection Rule:**
```typescript
const isCodeLine = /^[\s│├└┌┐┘┬┴┼─↓↑→←]/.test(line) || line.includes('→');
```

**Styling:**
- Code lines: `font-mono text-[11px] text-cyan-300`
- Regular text: `text-slate-300`

**Example Details:**
```
User clicks "Refresh Hotspots"
       ↓
fetchFirmsHotspots() in nationalFireService.ts
       ↓
NASA FIRMS API (last 24h, VIIRS sensor)
       ↓
Parse CSV → GeoJSON features
       ↓
setFirmsHotspots() updates store
       ↓
Map re-renders 'firms-layer' with new data
```

---

## Implementation Checklist

### Completed
- [x] `preferencesStore.ts` - Added `uxTooltipsEnabled` / `dxTooltipsEnabled` state with migration
- [x] `TechnicalTooltip.tsx` - Core component with dynamic positioning
- [x] `MissionHeader.tsx` - Sarah Chen profile + UX/DX toggles
- [x] `Header.tsx` (TwinView) - UX/DX toggles added to match Mission Control
- [x] First implementation: "Refresh Hotspots" button in `NationalMap.tsx`

### Phase 2: Mission Control Elements
| Element | File | Priority |
|---------|------|----------|
| Phase filter chips | `MissionHeader.tsx` | High |
| Timeframe dropdown | `MissionHeader.tsx` | High |
| Triage score | `IncidentCard.tsx` | High |
| Fire severity badge | `IncidentCard.tsx` | Medium |
| Watchlist star | `IncidentCard.tsx` | Medium |
| Map fire markers | `NationalMap.tsx` | Medium |
| FIRMS hotspot dots | `NationalMap.tsx` | Medium |
| Portfolio summary counts | `PortfolioSummary.tsx` | Low |

### Phase 3: TwinView / Briefing Interface Elements
| Element | File | Priority |
|---------|------|----------|
| Agent avatars | `BriefingMessage.tsx` | High |
| Confidence scores | `AgentConfidence.tsx` | High |
| Citation references | `BriefingCitation.tsx` | Medium |
| Reasoning chain nodes | `ReasoningChain.tsx` | Medium |
| Quick Query chips | `QuickQueryChips.tsx` | Low |

### Phase 4: Site Analysis Elements
| Element | File | Priority |
|---------|------|----------|
| Analysis severity indicator | `SiteAnalysisCard.tsx` | High |
| Chart data points | Various chart components | Medium |
| Report section headers | `AnalysisReport.tsx` | Low |

---

## Content Writing Guidelines

### Title
- Action-oriented or noun phrase
- 3-6 words
- Example: "FIRMS Satellite Detection", "Triage Score Calculation"

### Summary
- One sentence, plain English
- Explains WHAT it does (not HOW)
- Example: "Shows real-time thermal detections from NASA satellites."

### Details
- Start with user action or trigger
- Use arrows (→, ↓) to show data flow
- Include file references where relevant
- End with visible outcome
- Keep under 15 lines

### Data Points
- Use for key metrics or configuration values
- Format: `{ label: "Sensor", value: "VIIRS S-NPP" }`
- Maximum 4 data points per tooltip

### Source File
- Relative path from `src/`
- Example: `services/nationalFireService.ts`

---

## Example Implementation

**Adding DX Tooltip to Phase Filter Chips:**

```tsx
// In MissionHeader.tsx

import { TechnicalTooltip } from '@/components/common/TechnicalTooltip';

// Wrap the phase filter button:
<TechnicalTooltip
    title="Phase Filter"
    summary="Filters fires by their current recovery phase."
    sourceFile="stores/missionStore.ts"
    dataPoints={[
        { label: 'Phases', value: 'Active, BAER, Recovery' },
        { label: 'State', value: 'phaseFilter[]' },
    ]}
    details={`
User clicks phase chip
       ↓
togglePhaseFilter(phase) in missionStore
       ↓
Updates phaseFilter array (toggle on/off)
       ↓
useFilteredFires() selector recomputes
       ↓
IncidentRail re-renders with filtered list
       ↓
Map markers update via shared store
    `}
>
    <button onClick={() => togglePhaseFilter(phase)} ...>
        {display.label}
    </button>
</TechnicalTooltip>
```

---

## Testing Checklist

### Functional
- [ ] UX toggle turns UX tooltips on/off
- [ ] DX toggle turns DX tooltips on/off
- [ ] Both preferences persist across page refresh
- [ ] Purple indicator shows only when DX enabled
- [ ] Click opens tooltip, click outside closes
- [ ] Tooltip stays within viewport bounds
- [ ] Details section expands/collapses
- [ ] Multiple tooltips can exist (only one open at a time)
- [ ] Profile consistent between Mission Control and TwinView (Sarah Chen)

### Visual
- [ ] Purple (DX) and cyan (UX) color schemes distinct
- [ ] Backdrop blur effect working
- [ ] Pulsing animation smooth (not jarring)
- [ ] Text readable on dark background
- [ ] ASCII diagrams render in monospace
- [ ] Responsive on different viewport sizes

### Performance
- [ ] No re-renders when tooltips disabled
- [ ] Tooltip positioning doesn't cause layout thrashing
- [ ] No memory leaks from event listeners

---

## Future Enhancements (Backlog)

1. **Additional Tooltip Categories**
   - PX Tooltips (Product) - Business context, metrics explanations
   - OX Tooltips (Operations) - System health, deployment info
   - AX Tooltips (Analyst) - Data methodology, calculation notes

2. **Keyboard Navigation**
   - `Tab` to focus next tooltip trigger
   - `Enter` to open/close
   - `Escape` to close

3. **Search/Index**
   - Command palette to search all DX tooltips
   - Generate documentation index from tooltip content

4. **Export Documentation**
   - Button to export all tooltips as Markdown
   - Auto-generate onboarding guide

5. **Tooltip Versioning**
   - Track when tooltip content was last updated
   - Flag stale documentation

6. **Interactive Mode**
   - Guided tour connecting related tooltips
   - "Explain this workflow" multi-step walkthrough

---

## Tooltip Registry System

### Directory Structure
```
src/config/tooltips/
├── index.ts              # Main exports
├── types.ts              # Shared type definitions
└── dx/                   # DX tooltips (developer docs)
    ├── index.ts          # DX exports + helpers
    ├── concepts.ts       # Domain concepts (BAER, FIRMS, phases)
    └── missionControl.ts # UI element tooltips
```

### Using the Registry

**Option 1: Registry lookup (recommended)**
```tsx
import { TechnicalTooltip } from '@/components/common/TechnicalTooltip';

<TechnicalTooltip tooltipId="ui-triage-score">
  <span className="text-xl">{score}</span>
</TechnicalTooltip>
```

**Option 2: Direct props (for one-off tooltips)**
```tsx
<TechnicalTooltip
  title="Custom Tooltip"
  summary="A one-off explanation."
  details="Detailed flow..."
>
  <Button>Click me</Button>
</TechnicalTooltip>
```

### Registry Helpers

```typescript
import {
  dxTooltips,           // All tooltips
  getDxTooltip,         // Get by ID
  getDxTooltipsByCategory,  // Filter by category
  getDxTooltipsByLocation,  // Filter by component
  getHighPriorityDxTooltips, // Get high-priority
  getDxTooltipStats,    // Get counts
} from '@/config/tooltips';

// Get specific tooltip
const tooltip = getDxTooltip('ui-triage-score');

// Get all tooltips for Mission Control
const missionTooltips = getDxTooltipsByLocation('MissionHeader');

// Get stats for documentation
const stats = getDxTooltipStats();
// { total: 25, byCategory: {...}, byPriority: {...} }
```

### Adding New Tooltips

1. Choose the right file:
   - `concepts.ts` - Domain knowledge (BAER, FIRMS, severity)
   - `missionControl.ts` - Mission Control UI elements
   - Create new file for TwinView, Site Analysis, etc.

2. Add tooltip definition:
```typescript
'ui-my-element': {
    id: 'ui-my-element',
    title: 'Element Name',
    summary: 'One-line description.',
    details: `
User does something
       ↓
Code does something
       ↓
Result appears
    `.trim(),
    sourceFile: 'path/to/file.ts',
    dataPoints: [
        { label: 'Key', value: 'Value' },
    ],
    category: 'ui',  // domain | data | ui | integration | navigation | technical
    priority: 'high', // high | medium | low
    location: 'ComponentName',
    relatedIds: ['other-tooltip-id'],
},
```

3. Use in component:
```tsx
<TechnicalTooltip tooltipId="ui-my-element">
  <MyElement />
</TechnicalTooltip>
```

---

## Current Registry Contents

### Domain Concepts (6 tooltips)
| ID | Title | Priority |
|----|-------|----------|
| `concept-baer` | BAER Assessment | High |
| `concept-phases` | Fire Recovery Phases | High |
| `concept-severity` | Fire Severity Classification | High |
| `concept-containment` | Fire Containment | Medium |
| `concept-regions` | USFS Regions | Low |
| `data-firms` | NASA FIRMS | High |

### Data Sources (4 tooltips)
| ID | Title | Priority |
|----|-------|----------|
| `data-firms` | NASA FIRMS | High |
| `data-nifc` | NIFC Data | Medium |
| `data-inciweb` | InciWeb | Low |
| `data-mtbs` | MTBS | Low |

### Mission Control UI (15 tooltips)
| ID | Title | Priority |
|----|-------|----------|
| `ui-phase-filter` | Phase Filter Chips | High |
| `ui-timeframe-filter` | Timeframe Filter | High |
| `ui-triage-score` | Triage Score | High |
| `ui-refresh-hotspots` | Refresh Hotspots | High |
| `ui-enter-simulation` | Enter Simulation | High |
| `ui-incident-card` | Incident Card | High |
| `ui-firms-legend` | NASA FIRMS Legend | High |
| `ui-view-dropdown` | Portfolio View Selector | Medium |
| `ui-severity-legend` | Managed Fires Legend | Medium |
| `ui-fire-markers` | Fire Map Markers | Medium |
| `ui-fire-popup` | Fire Popup Card | Medium |
| `ui-incident-rail` | Incident Rail | Medium |
| `ui-filter-summary` | Filter Summary Bar | Medium |
| `ui-watchlist-star` | Watchlist Star | Medium |
| `ui-reset-view` | Reset View Button | Low |
| `ui-firms-toggle` | FIRMS Layer Toggle | Low |
| `ui-external-tools` | External Tools Links | Low |

---

## File Reference

| File | Purpose |
|------|---------|
| `src/stores/preferencesStore.ts` | State management for UX/DX toggles |
| `src/components/common/TechnicalTooltip.tsx` | Core DX tooltip component |
| `src/components/ui/Tooltip.tsx` | Core UX tooltip component |
| `src/config/tooltips/` | **Tooltip content registry** |
| `src/config/tooltips/types.ts` | Type definitions |
| `src/config/tooltips/dx/concepts.ts` | Domain concept tooltips |
| `src/config/tooltips/dx/missionControl.ts` | Mission Control UI tooltips |
| `src/components/mission/MissionHeader.tsx` | Mission Control profile + toggles |
| `src/components/layout/Header.tsx` | TwinView profile + toggles |
| `docs/features/TECHNICAL-TOOLTIPS.md` | This specification |

---

*Last Updated: December 24, 2024*
*Status: Registry Complete (25 tooltips defined), Implementation Phase*

# Mission Control (National Dashboard) Implementation Plan

**Feature Status:** Planned  
**Branch:** `feature/mission-control`  
**Related Specs:** `docs/design/002-MISSION-CONTROL-SPEC.md`
**Mockup:** ![Mission Control Dashboard](../assets/mockup-iterations/mission-control.png)

## Overview
We are building the **National Mission Control** dashboard, a high-level strategic view for managing a portfolio of USFS fires. This shifts the application from a single-fire tactical tool to a multi-fire portfolio management system.

## Proposed Architecture

### 1. Data Layer (The Portfolio)
We need to simulate a national dataset.
- **`mockNationalService.ts`**: Generate 30+ mock fires across USFS regions (CA, OR, WA, AZ, CO).
- Attributes: `id`, `name`, `phase`, `severity`, `acres`, `coordinates`, `triageScore`.

### 2. The "Mission Control" Shell
A new layout component distinct from the current console.
- **`MissionControlLayout.tsx`**: CSS Grid layout: Stack (Left), Map (Center), Rail (Right), Slider (Bottom).
- **`MissionStack.tsx`**: Left navigation rail for switching contexts.
- **`IncidentRail.tsx`**: Right-side filtered list of incidents.
- **`SeasonSlider.tsx`**: Bottom temporal navigation control.

### 3. The National Map
- **`NationalMap.tsx`**:
  - **MapLibre** instance for the basemap (Dark mode).
  - **Deck.gl** overlay for clustering and "Beacon" visualization.
  - Interaction: Click cluster -> Zoom to bounds; Click fire -> Select.

### 4. Routing & App Structure
- Refactor **`App.tsx`** to introduce a "View Manager" state (`view: 'NATIONAL' | 'TACTICAL'`).
- If `NATIONAL`, render `MissionControl`.
- If `TACTICAL`, render the existing `CommandConsole`.
- Implement the "Swoop" transition logic (preserving camera state).

## Implementation Checklist

- [ ] **Step 1: Data Service**
    - Create `src/services/mockNationalService.ts`
    - Generate mock data for 30 fires (Regions 1-6)

- [ ] **Step 2: Component Shell**
    - Create `src/components/mission/MissionControlLayout.tsx`
    - Create `src/components/mission/MissionStack.tsx`
    - Create `src/components/mission/IncidentRail.tsx`
    - Create `src/components/mission/SeasonSlider.tsx`

- [ ] **Step 3: National Map**
    - Create `src/components/mission/NationalMap.tsx`
    - Integrate Deck.gl cluster layer

- [ ] **Step 4: Integration**
    - Modify `App.tsx` to handle view switching
    - Implement Camera FlyTo transition

## State Management

A dedicated Zustand store is required to coordinate Mission Control state across components.

### `missionStore.ts`
```typescript
interface MissionState {
  // Selection
  selectedFireId: string | null;
  hoveredFireId: string | null;

  // Filters
  regionFilter: number[];        // USFS regions 1-6
  severityFilter: ('low' | 'moderate' | 'high')[];
  phaseFilter: ('active' | 'contained' | 'recovery')[];

  // Temporal
  seasonPosition: number;        // 0-100, maps to fire season timeline

  // Actions
  selectFire: (id: string | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setSeasonPosition: (position: number) => void;
}
```

This store enables IncidentRail ↔ NationalMap ↔ SeasonSlider coordination without prop drilling.

## Camera Transition ("Swoop") Logic

The transition between National and Tactical views requires explicit camera state handoff.

### National → Tactical
1. Store current national camera bounds in `mapStore.nationalBounds`
2. Retrieve selected fire's bounding box from `mockNationalService`
3. Execute `flyTo()` animation to fire bounds
4. On animation complete, swap view to `TACTICAL`
5. Initialize tactical map at fire-specific zoom level

### Tactical → National
1. Store current tactical camera state (for potential return)
2. Execute `flyTo()` animation zooming out to stored `nationalBounds`
3. On animation complete, swap view to `NATIONAL`

### Implementation Note
Camera handoff lives in `mapStore.ts` with new actions:
- `prepareNationalToTactical(fireId: string)`
- `prepareTacticalToNational()`

## Data Schema Details

### Fire Object Schema
```typescript
interface NationalFire {
  id: string;                    // UUID
  name: string;                  // "Cedar Creek", "Bootleg", etc.
  region: number;                // USFS Region 1-6
  state: string;                 // Two-letter code
  phase: 'active' | 'contained' | 'recovery';
  severity: 'low' | 'moderate' | 'high';
  acres: number;
  containment: number;           // 0-100 percentage
  coordinates: [number, number]; // [lng, lat] centroid
  bounds: [[number, number], [number, number]]; // SW, NE corners
  triageScore: number;           // Computed priority score
  startDate: string;             // ISO date
}
```

### Triage Score Formula
```
triageScore = (severityWeight × acresNormalized × urgencyFactor)

Where:
- severityWeight: low=1, moderate=2, high=3
- acresNormalized: acres / 10000 (capped at 10)
- urgencyFactor: 1.0 for recovery, 1.5 for contained, 2.0 for active
```

Higher scores = higher priority for resource allocation.

## Error & Edge Cases

| Scenario | Behavior |
|----------|----------|
| No fires returned | Display empty state with "No active incidents" message |
| Filter yields zero results | Show "No fires match filters" with reset button |
| Network/service error | Toast notification + retry button |
| Invalid fire ID on transition | Fallback to national view with error toast |

## Verification Plan

### Manual Verification
1.  **Load:** Open app, verify it starts in "Mission Control" mode (National Map).
2.  **Data:** Verify 30+ fires appear on the US map.
3.  **Interaction:** Click a cluster -> zooms in. Click a fire -> selects on the right rail.
4.  **Transition:** Click "Enter Simulation" -> Verify smooth transition to the Tactical View (Cedar Creek).
5.  **Return:** Click "National View" in Tactical Sidebar -> Returns to National Map.
6.  **Filters:** Apply region/severity filters -> Verify map and rail update in sync.
7.  **Empty State:** Filter to impossible combination -> Verify empty state renders.
8.  **Season Slider:** Drag slider -> Verify fire visibility changes based on temporal position.

## Open Questions for Review

1. **Persistence:** Should selected fire / filter state persist across browser sessions (localStorage)?
2. **Deep Linking:** Do we need URL routing for shareable fire links (e.g., `/fire/cedar-creek`)?
3. **Animation Duration:** What's the appropriate flyTo duration for the swoop? (Suggest 1.5-2s)
4. **Mobile:** Is Mission Control desktop-only, or does Field Companion need a simplified version?

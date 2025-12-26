# Mission Control UX Implementation Plan

## Executive Summary

Transform Mission Control from a map viewer into a **decision-support tool for high-stress triage**. This plan incorporates expert consensus and codebase analysis to deliver maximum impact with minimal risk.

**Core Principle:** "What needs my attention next?"

---

## Tier 1: Critical Fixes (This Sprint)

### 1.1 Filter Feedback System
**Files:** `IncidentRail.tsx`, `MissionHeader.tsx`

**Current State:** No indication of filtered count or active filters

**Implementation:**
```
┌───────────────────────────────────────────────────────────────┐
│ Showing 12 of 47 fires │ [In Recovery ×] [Region 6 ×] │ Clear │
└───────────────────────────────────────────────────────────────┘
```

- Add filter summary bar below MissionHeader
- Display `filteredFires.length` of `allFires.length`
- Render active filter chips with dismiss (×) buttons
- Individual chip dismissal (safer than global "Clear all")
- Empty state: "No fires match filters. [Show all fires]"

**Data Flow:**
- Read from `useMissionFilters()` selector
- Chips call `togglePhaseFilter()` / `toggleRegionFilter()` on dismiss
- "Clear" calls `resetFilters()` action

---

### 1.2 Replace Season Slider with Timeframe Dropdown
**Files:** `SeasonSlider.tsx` (DELETE), `MissionControlLayout.tsx`, `missionStore.ts`, `mission.ts`

**Current State:** Draggable 0-100% slider with month labels (May-Oct)

**New Implementation:** Dropdown in MissionHeader
```
Timeframe: [Current Season ▾]
           ├─ Last 24 hours
           ├─ Last 7 days
           ├─ Current Season (2025)
           └─ All fires
```

**Changes:**
1. Delete `SeasonSlider.tsx` component
2. Remove grid row from `MissionControlLayout.tsx`:
   ```ts
   // Before: gridTemplateRows: '48px 1fr 64px'
   // After:  gridTemplateRows: '48px 1fr'
   ```
3. Add `TimeframeFilter` type to `mission.ts`:
   ```ts
   type TimeframeFilter = 'last_24h' | 'last_7d' | 'current_season' | 'all';
   ```
4. Add `timeframeFilter` to `MissionFilters` in store
5. Implement filtering in `fireDataProvider.ts` (filter by `lastUpdated` field)

---

### 1.3 Phase Filter Visual State
**Files:** `MissionHeader.tsx`

**Current State:** Pills look like labels, unclear toggle behavior

**Improvements:**
- **Selected:** Full opacity + colored bottom border (2px) + subtle glow
- **Unselected:** 50% opacity, no border, hover reveals clickability
- Add "Phase:" label prefix for clarity
- Ensure at least one phase always selected (already enforced in store)

---

### 1.4 Incident Card Hierarchy Redesign
**Files:** `IncidentCard.tsx`

**Current Layout (bottom-up priority, wrong):**
```
Fire Name + State + Region + Star
Phase Badge + Severity Badge
Acres + Containment
Severity Bar
Triage Score + Enter Button
```

**New Layout (triage-first):**
```
┌────────────────────────────────────────────┐
│ 165.5 ████████░░  Bootleg Fire          ☆ │
│ ▲ CRITICAL · IN RECOVERY                  │
├────────────────────────────────────────────┤
│ 414K acres · 100% contained · OR · R6     │
│                              [Enter →]    │
└────────────────────────────────────────────┘
```

**Changes:**
- Triage score: 24px bold, left-aligned with mini severity bar
- Severity + Phase: Single row with icon prefix
- Metadata: Compressed single line
- Remove "Triage:" label (score speaks for itself)
- Reduce card height from ~140px to ~100px

---

### 1.5 Triage Score Explainability (NEW - Expert Mandate)
**Files:** `IncidentCard.tsx`, new `TriageTooltip.tsx`

**Current State:** Score shown but never explained

**Implementation:** Hover tooltip on triage score
```
┌─────────────────────────────────────┐
│ Triage Score: 165.5                │
├─────────────────────────────────────┤
│ Size Impact       ████████░░  82%  │
│ Severity Weight   ██████░░░░  60%  │
│ Phase Urgency     ████░░░░░░  50%  │
├─────────────────────────────────────┤
│ Higher score = needs attention first│
└─────────────────────────────────────┘
```

**Formula Breakdown:**
From `calculateTriageScore()`:
- `severityWeight`: 1 (low) → 4 (critical)
- `acresNormalized`: `Math.min(acres / 10000, 50)` capped at 500k
- `phaseMultiplier`: active (2.0), in_baer (1.5), recovery (1.0)
- Final: `severityWeight × acresNormalized × phaseMultiplier`

Display each factor as percentage of its max contribution.

---

## Tier 2: Enhanced Interactions (Next Sprint)

### 2.1 Bidirectional Selection Sync (Enhanced)
**Files:** `NationalMap.tsx`, `IncidentRail.tsx`, `IncidentCard.tsx`

**Current State:** Partial sync exists via `hoveredFireId` / `selectedFireId`

**Enhancements:**
- **Hover card → Map:** Enlarge marker (already works via `fires-hover-layer`)
- **Hover marker → List:** Add visible highlight to card (currently only changes bg)
- **Click marker → List:** Auto-scroll to card with highlight animation
- **Edge case:** If fire is filtered out, show toast: "Fire not in current view. [Show]"

**Implementation:**
- Add `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on marker click
- Add 1s border pulse animation on scroll-to card
- Check if `selectedFireId` is in filtered list before scrolling

---

### 2.2 Smart Map Markers
**Files:** `NationalMap.tsx`

**Current State:** Circles colored by severity, sized by log(acres)

**Enhancements:**
- **Glyphs at zoom > 7:** Show phase icon inside marker
  - Active: 🔥 (flame)
  - In BAER: ⊕ (crosshairs)
  - In Recovery: 🌱 (seedling)
- **Labels at zoom > 8:** Fire name adjacent to marker
- **Pulse animation:** Critical severity fires pulse subtly
- Keep current size formula: `Math.max(8, Math.min(24, Math.log10(acres) * 5))`

---

### 2.3 Portfolio Summary Bar
**Files:** `MissionHeader.tsx` or new `PortfolioSummary.tsx`

**Implementation:**
```
47 fires · 4 Critical · 12 High · 28 Moderate · 3 Low
⚠️ 2 incidents updated in last 24h
```

- Clickable severity counts act as quick filters
- Show data freshness: "NIFC: 5 min ago"
- Alert badge for recent updates (based on `lastUpdated` field)

---

### 2.4 Collapse Left Rail to Header Dropdown
**Files:** `MissionStack.tsx`, `MissionHeader.tsx`, `MissionControlLayout.tsx`

**Current State:** 72px left rail with RANGER logo + 3 nav buttons

**Expert Recommendation:** Collapse to dropdown to recover horizontal space

**New Implementation:**
```
View: [National Portfolio ▾]
      ├─ National Portfolio (47)
      ├─ My Watchlist (3) ★
      └─ Selected Incident
```

**Changes:**
1. Move view selector to MissionHeader
2. Keep RANGER logo in header (smaller, left corner)
3. Update grid: `gridTemplateColumns: '1fr 320px'` (remove 72px column)
4. Reclaim 72px for map width

---

### 2.5 Tablet Responsive Layout
**Files:** `MissionControlLayout.tsx`, `index.css`

**Current State:** Fixed desktop layout, mobile breakpoints exist but no tablet

**Implementation (768px - 1024px):**
- Stack IncidentRail above map (portrait) or keep side-by-side (landscape)
- IncidentRail: Full width, max-height 40vh, scrollable
- Map: Remaining height
- Touch targets: Minimum 44px for all interactive elements
- Cards: Slightly wider (full rail width)

---

## Tier 3: Future Backlog

### 3.1 Compact Card View (Defer)
Wait for user testing to confirm need. Current card hierarchy redesign may solve scannability.

### 3.2 Scenario-Based Filters
Pre-defined operational scenarios:
- "Critical + High severity"
- "My region's fires"
- "Recently escalated (24h)"
- "Entering BAER soon"

Requires user research to validate which scenarios matter.

### 3.3 Triage Matrix View
2×2 grid visualization (Urgency × Resource Availability). Defer until resource data exists.

### 3.4 Offline-First Caching
IndexedDB storage, service worker, "Data as of HH:MM" indicator.

---

## Files to Modify

### Tier 1
| File | Changes |
|------|---------|
| `src/components/mission/IncidentRail.tsx` | Add filter summary bar, "X of Y" count |
| `src/components/mission/IncidentCard.tsx` | Redesign hierarchy, triage score first, add tooltip trigger |
| `src/components/mission/TriageTooltip.tsx` | **NEW** - Score breakdown component |
| `src/components/mission/MissionHeader.tsx` | Phase filter styling, timeframe dropdown |
| `src/components/mission/SeasonSlider.tsx` | **DELETE** |
| `src/components/mission/MissionControlLayout.tsx` | Remove slider row, adjust grid |
| `src/stores/missionStore.ts` | Add timeframeFilter, remove seasonPosition |
| `src/types/mission.ts` | Add TimeframeFilter type |
| `src/services/providers/fireDataProvider.ts` | Implement timeframe filtering |

### Tier 2
| File | Changes |
|------|---------|
| `src/components/mission/NationalMap.tsx` | Enhanced sync, smart markers |
| `src/components/mission/MissionStack.tsx` | Refactor to dropdown in header |
| `src/components/mission/PortfolioSummary.tsx` | **NEW** - Status bar |
| `src/index.css` | Tablet breakpoints (768-1024px) |

---

## Success Criteria

### Tier 1 Complete When:
- [ ] Filter summary shows "X of Y fires" with active filter chips
- [ ] Season slider replaced with timeframe dropdown
- [ ] Phase filters have clear selected/unselected states
- [ ] Incident cards lead with triage score (24px bold)
- [ ] Triage score shows breakdown tooltip on hover
- [ ] Empty state explains why no fires shown

### Tier 2 Complete When:
- [ ] Clicking map marker scrolls list to corresponding card
- [ ] Smart markers show glyphs at zoom > 7
- [ ] Portfolio summary shows severity distribution
- [ ] Left rail collapsed into header dropdown
- [ ] Tablet layout stacks list/map appropriately

---

## Implementation Order

1. **IncidentCard.tsx** - Hierarchy redesign + TriageTooltip (highest visual impact)
2. **SeasonSlider removal** - Delete component, update layout grid
3. **MissionHeader.tsx** - Add timeframe dropdown, fix phase filter styling
4. **IncidentRail.tsx** - Add filter summary bar
5. **missionStore.ts** - Add timeframeFilter state
6. **fireDataProvider.ts** - Implement timeframe filtering logic

---

## Design Principles (Agentic Context)

1. **AI Transparency:** Triage scores show breakdown on hover
2. **Human Agency:** AI recommends priority; human decides action
3. **Data Provenance:** Show "NIFC: X min ago" for trust
4. **Graceful Degradation:** Cached data with "Offline" indicator if services down
5. **Progressive Disclosure:** Ranked list first, spatial context on demand

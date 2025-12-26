# RANGER Domain-Informed Redesign Plan

## Summary

Based on expert feedback from fire recovery practitioners, this plan implements:
1. **Expanded Phase Model** (3 → 4 phases): Split BAER into Assessment + Implementation
2. **Triage Explainability**: Always-visible breakdown, delta indicators, percentile ranking
3. **Top Escalations Widget**: Surface fires needing immediate attention
4. **Terminology Alignment**: "In Recovery" → "In Restoration"

---

## Phase 1: Type System & Phase Model

### 1.1 Update FirePhase Type

**File:** `src/types/mission.ts`

```typescript
// OLD: 3 phases
type FirePhase = 'active' | 'in_baer' | 'in_recovery';

// NEW: 4 phases
type FirePhase = 'active' | 'baer_assessment' | 'baer_implementation' | 'in_restoration';
```

### 1.2 Update Phase Display Constants

```typescript
export const PHASE_DISPLAY: Record<FirePhase, { label: string; abbrev: string; color: string; bgColor: string }> = {
  active: {
    label: 'Active',
    abbrev: 'ACT',
    color: '#ef4444',        // Red
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
  baer_assessment: {
    label: 'BAER Assessment',
    abbrev: 'ASM',
    color: '#f59e0b',        // Amber
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  baer_implementation: {
    label: 'BAER Implementation',
    abbrev: 'IMP',
    color: '#eab308',        // Yellow/Gold
    bgColor: 'rgba(234, 179, 8, 0.2)',
  },
  in_restoration: {
    label: 'In Restoration',
    abbrev: 'RST',
    color: '#10b981',        // Green
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
};

export const PHASE_COLORS: Record<FirePhase, string> = {
  active: '#ef4444',
  baer_assessment: '#f59e0b',
  baer_implementation: '#eab308',
  in_restoration: '#10b981',
};
```

### 1.3 Update Triage Score Multipliers

```typescript
export function calculateTriageScore(severity: FireSeverity, acres: number, phase: FirePhase): number {
  const severityWeight = SEVERITY_DISPLAY[severity].weight;
  const acresNormalized = Math.min(acres / 10000, 50);

  const phaseMultipliers: Record<FirePhase, number> = {
    active: 2.0,              // Fire burning - highest priority
    baer_assessment: 1.75,    // 7-day window - very time-critical
    baer_implementation: 1.25, // Work underway
    in_restoration: 1.0,      // Long-term baseline
  };

  return Math.round(severityWeight * acresNormalized * phaseMultipliers[phase] * 10) / 10;
}
```

### 1.4 Add Delta Tracking Fields to NationalFire

```typescript
export interface NationalFire {
  // ... existing fields ...

  /** Previous triage score (24h ago) for delta tracking */
  previousTriageScore?: number;

  /** Percentile rank in current portfolio (0-100) */
  percentileRank?: number;
}

export type DeltaDirection = 'up' | 'down' | 'stable';

export function getDeltaDirection(current: number, previous?: number): DeltaDirection {
  if (previous === undefined) return 'stable';
  const delta = current - previous;
  if (delta > 0.5) return 'up';
  if (delta < -0.5) return 'down';
  return 'stable';
}
```

---

## Phase 2: Mock Data Updates

### 2.1 Update Phase Distribution

**File:** `src/services/mockNationalService.ts`

```typescript
// Distribution: 25% active, 25% assessment, 20% implementation, 30% restoration
const phaseRoll = random();
const phase: FirePhase =
  phaseRoll < 0.25 ? 'active'
  : phaseRoll < 0.50 ? 'baer_assessment'
  : phaseRoll < 0.70 ? 'baer_implementation'
  : 'in_restoration';
```

### 2.2 Generate Delta Data

```typescript
// After generating fires, compute percentile ranks and previous scores
fires.forEach((fire, index) => {
  // Percentile rank
  const rank = sortedByScore.findIndex(f => f.id === fire.id);
  fire.percentileRank = Math.round(((sortedByScore.length - rank) / sortedByScore.length) * 100);

  // ~30% of fires show meaningful delta
  const deltaRoll = random();
  if (deltaRoll < 0.15) {
    fire.previousTriageScore = fire.triageScore * (0.7 + random() * 0.2); // Escalated
  } else if (deltaRoll < 0.30) {
    fire.previousTriageScore = fire.triageScore * (1.1 + random() * 0.3); // De-escalated
  } else {
    fire.previousTriageScore = fire.triageScore * (0.95 + random() * 0.1); // Stable
  }
});
```

---

## Phase 3: State Management Updates

### 3.1 Update Store with Migration

**File:** `src/stores/missionStore.ts`

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'ranger-mission',
    version: 2, // Increment for migration
    migrate: (persistedState, version) => {
      if (version === 1 && state.filters?.phases) {
        // Map old phases to new
        const migratedPhases = state.filters.phases.map((phase) => {
          if (phase === 'in_baer') return 'baer_assessment';
          if (phase === 'in_recovery') return 'in_restoration';
          return phase;
        });
        // If had 'in_baer', add both BAER phases
        if (state.filters.phases.includes('in_baer')) {
          migratedPhases.push('baer_implementation');
        }
        state.filters.phases = migratedPhases;
      }
      return state;
    },
  }
)
```

---

## Phase 4: UI Component Updates

### 4.1 Enhanced IncidentCard with Delta Indicator

**File:** `src/components/mission/IncidentCard.tsx`

```
┌────────────────────────────────────────────────┐
│ ↑ 165.5 [▓▓▓░░░░░░░░░]  Cedar Creek Fire    ★ │
│         ^delta  ^mini breakdown                │
│ [CRITICAL] · [BAER ASSESSMENT]                 │
│ 127K acres · 45% contained · OR · R6    [→]   │
└────────────────────────────────────────────────┘
```

- Add `↑` / `↓` delta arrow before score (red for up, green for down)
- Add mini stacked bar showing severity/size/phase contribution
- Keep hover tooltip for full breakdown

### 4.2 Enhanced TriageTooltip with Percentile

**File:** `src/components/mission/TriageTooltip.tsx`

- Add "Top X%" percentile badge in header
- Show delta amount and direction
- Add "Escalated in last 24h" context text

### 4.3 New TopEscalations Widget

**File:** `src/components/mission/TopEscalations.tsx` (NEW)

```
┌────────────────────────────────────────────────┐
│ ↗ ESCALATIONS (3)                           ▲ │
├────────────────────────────────────────────────┤
│ ↑ +8.2  Pine Ridge Fire           165.5      │
│         CA · R5                               │
├────────────────────────────────────────────────┤
│ ↑ +5.1  Bear Canyon Fire          142.3      │
│         AZ · R3                               │
└────────────────────────────────────────────────┘
```

- Collapsible panel showing top 5 escalated fires
- Click to select fire, hover for full tooltip
- Hidden when no escalations

### 4.4 Update CommandSidebar Filters

**File:** `src/components/mission/CommandSidebar.tsx`

- Update PHASE_ORDER to 4 phases
- Use `abbrev` field for collapsed mode (ACT, ASM, IMP, RST)
- 4 color-coded filter buttons

### 4.5 Update NationalMap Legend

**File:** `src/components/mission/NationalMap.tsx`

- Update circle-color expression for 4 phases
- Update legend to show all 4 phases with colors

---

## Phase 5: Integration

### 5.1 Add TopEscalations to IncidentRail

**File:** `src/components/mission/IncidentRail.tsx`

```typescript
<PortfolioSummary fires={filteredFires} />
<TopEscalations fires={filteredFires} maxItems={5} />  {/* NEW */}
<div className="flex-1 overflow-y-auto">
  {/* Fire cards */}
</div>
```

### 5.2 Update Filter Logic

**File:** `src/services/providers/fireDataProvider.ts`

- Change phase filter threshold from 3 to 4
- Update calculateStatistics for 4 phases

---

## Files to Modify (Implementation Order)

| Order | File | Changes |
|-------|------|---------|
| 1 | `src/types/mission.ts` | FirePhase type, PHASE_DISPLAY, PHASE_COLORS, triage multipliers, delta helpers, NationalFire fields |
| 2 | `src/stores/missionStore.ts` | Version bump, migration logic for old phases |
| 3 | `src/services/providers/fireDataProvider.ts` | Update statistics, filter threshold |
| 4 | `src/services/mockNationalService.ts` | New phase distribution, delta generation |
| 5 | `src/services/providers/mockFireProvider.ts` | Update demo fires phases |
| 6 | `src/components/mission/TriageTooltip.tsx` | Add percentile, delta display |
| 7 | `src/components/mission/IncidentCard.tsx` | Delta indicator, mini breakdown bar |
| 8 | `src/components/mission/TopEscalations.tsx` | NEW: Escalations widget |
| 9 | `src/components/mission/IncidentRail.tsx` | Integrate TopEscalations |
| 10 | `src/components/mission/CommandSidebar.tsx` | 4-phase filters, abbrev labels |
| 11 | `src/components/mission/NationalMap.tsx` | 4-phase colors, legend update |
| 12 | `src/components/mission/index.ts` | Export TopEscalations |

---

## Expected Result

After implementation:
- **4 phase filters** in sidebar: Active (red), BAER Assessment (amber), BAER Implementation (yellow), In Restoration (green)
- **Delta indicators** on cards showing ↑/↓ for escalated/de-escalated fires
- **Top Escalations widget** surfacing fires that need immediate attention
- **Percentile ranking** in tooltips ("Top 5% of portfolio")
- **Mini breakdown bar** on each card showing severity/size/phase contribution
- **Practitioner terminology**: "In Restoration" instead of "In Recovery"

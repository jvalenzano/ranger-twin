# Phase 1: Static Demo Implementation Spec

**For:** Anti-Gravity (coding agent)
**From:** Claude (senior AI dev)
**Date:** 2024-12-20

---

## Objective

Wire the React frontend to use `mockBriefingService` instead of `briefingService`, enabling a fully functional static demo without any backend. When users click lifecycle rail items, pre-composed events from fixture data should fire and render in the UI.

---

## Current State

| File | Status | Issue |
|------|--------|-------|
| `src/services/mockBriefingService.ts` | Complete | Not used anywhere |
| `src/services/briefingService.ts` | Complete | Used in App.tsx and Sidebar, but requires backend |
| `src/App.tsx` | Partial | Uses `briefingService` (WebSocket), needs `mockBriefingService` |
| `src/components/layout/Sidebar.tsx` | Partial | Uses `briefingService` API calls, needs `mockBriefingService` |
| `public/fixtures/briefing-events.json` | Complete | Ready to use |

---

## Tasks

### Task 1: Update App.tsx to use MockBriefingService

**File:** `apps/command-console/src/App.tsx`

**Changes:**

1. Replace `briefingService` import with `mockBriefingService`
2. Call `loadFixtures()` on mount instead of `connect()`
3. Remove `disconnect()` call (mock service doesn't need it)

**Before:**
```tsx
import briefingService from '@/services/briefingService';

useEffect(() => {
  briefingService.connect();
  const unsubscribe = briefingService.subscribe((event) => {
    addEvent(event);
  });
  return () => {
    unsubscribe();
    briefingService.disconnect();
  };
}, [addEvent]);
```

**After:**
```tsx
import mockBriefingService from '@/services/mockBriefingService';

useEffect(() => {
  // Load fixture data
  mockBriefingService.loadFixtures().then(() => {
    setIsReady(true);
    console.log('[App] Fixtures loaded');
  });

  // Subscribe to events
  const unsubscribe = mockBriefingService.subscribe((event) => {
    console.log('[App] Received event:', event.event_id);
    addEvent(event);
  });

  return () => {
    unsubscribe();
  };
}, [addEvent]);
```

---

### Task 2: Update Sidebar to use MockBriefingService

**File:** `apps/command-console/src/components/layout/Sidebar.tsx`

**Changes:**

1. Replace `briefingService` import with `mockBriefingService`
2. Replace API calls with `triggerPhase()` method

**Before:**
```tsx
import briefingService from '@/services/briefingService';

const handlePhaseClick = (phase: LifecyclePhase) => {
  setActivePhase(phase);
  clearPulse(phase);

  if (phase === 'IMPACT') {
    briefingService.triggerBurnAnalysis('Sector NW-4');
  } else if (phase === 'DAMAGE') {
    briefingService.triggerTrailAssessment('Waldo Lake Trail');
  }
  // ... etc
};
```

**After:**
```tsx
import mockBriefingService from '@/services/mockBriefingService';
import type { LifecyclePhase as MockPhase } from '@/services/mockBriefingService';

const handlePhaseClick = (phase: LifecyclePhase) => {
  setActivePhase(phase);
  clearPulse(phase);

  // Fire the event for this phase from fixtures
  mockBriefingService.triggerPhase(phase as MockPhase);
};
```

---

### Task 3: Add Demo Button to Header (Optional Enhancement)

**File:** `apps/command-console/src/components/layout/Header.tsx`

Add a "Run Demo" button that fires the full cascade sequence with delays.

```tsx
import mockBriefingService from '@/services/mockBriefingService';

// In the header JSX, add:
<button
  onClick={() => mockBriefingService.runCascadeDemo()}
  className="px-3 py-1 text-xs mono uppercase bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan rounded hover:bg-accent-cyan/30"
>
  Run Demo
</button>
```

---

### Task 4: Verify BriefingObserver Integration

**File:** `apps/command-console/src/components/briefing/BriefingObserver.tsx`

Confirm this component is rendered in App.tsx. If not, add it.

The BriefingObserver watches the briefing store and triggers the appropriate UI renderers:
- `ModalInterrupt` for critical alerts
- `RailPulseManager` for lifecycle rail animations
- `PanelInjectManager` for panel content
- `MapHighlightManager` for map features

---

## Testing Checklist

After implementation, verify:

- [ ] App loads without errors
- [ ] Click IMPACT rail → Burn Analyst event appears in InsightPanel
- [ ] Click DAMAGE rail → Trail Assessor event appears
- [ ] Click TIMBER rail → Cruising Assistant event appears
- [ ] Click COMPLIANCE rail → NEPA Advisor event appears
- [ ] Events show reasoning chains and citations
- [ ] "Run Demo" button triggers full cascade with delays
- [ ] Modal interrupts display for critical events
- [ ] Rail items pulse when they have new insights

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/App.tsx` | Update imports, use mockBriefingService |
| `src/components/layout/Sidebar.tsx` | Update imports, use triggerPhase() |
| `src/components/layout/Header.tsx` | Add demo button (optional) |

---

## Success Criteria

1. **No backend required** — App works completely client-side
2. **Click → Event → Render** — Full loop works for all 4 lifecycle phases
3. **Cascade demo** — Running the demo shows the full agent-to-agent trigger sequence
4. **Ready for Vercel** — Can run `npm run build` and deploy static files

---

## Notes for A/G

- The `mockBriefingService` is a singleton — import and use directly
- The `LifecyclePhase` type exists in both `lifecycleStore` and `mockBriefingService` — they're compatible
- Fixture data path is `/fixtures/briefing-events.json` (Vite serves from `public/`)
- The store's `addEvent()` handles routing events to the correct UI targets automatically

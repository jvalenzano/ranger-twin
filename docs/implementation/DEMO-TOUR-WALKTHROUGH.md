# Demo Tour Walkthrough Implementation Spec

**For:** Anti-Gravity (coding agent)
**From:** Claude (senior AI dev)
**Date:** 2024-12-20
**Priority:** High — This makes the demo actually understandable

---

## Objective

Replace the rapid-fire `runCascadeDemo()` with a guided, user-paced walkthrough. Each step should:
1. Fire one agent event
2. Show an annotation overlay explaining what the user is seeing
3. Wait for user to click "Next" before advancing
4. Spotlight the relevant UI area

---

## Current State

- `Header.tsx` has "Run Demo" button calling `mockBriefingService.runCascadeDemo()`
- `runCascadeDemo()` fires 5 events with 1.5s delays — too fast to understand
- No annotations or explanations exist

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    DemoTourProvider                        │  │
│  │                                                            │  │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │  │
│  │   │   Header    │    │  Sidebar    │    │ InsightPanel│   │  │
│  │   │ [Run Demo]  │    │             │    │             │   │  │
│  │   └─────────────┘    └─────────────┘    └─────────────┘   │  │
│  │                                                            │  │
│  │   ┌────────────────────────────────────────────────────┐  │  │
│  │   │              DemoTourOverlay                        │  │  │
│  │   │  (renders when tour is active)                      │  │  │
│  │   │                                                      │  │  │
│  │   │  - Backdrop (dims non-spotlight areas)              │  │  │
│  │   │  - Annotation card (positioned near spotlight)      │  │  │
│  │   │  - Navigation (Back / Next / Skip)                  │  │  │
│  │   │  - Progress indicator                               │  │  │
│  │   └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/components/demo/DemoTourProvider.tsx` | Context provider for tour state |
| `src/components/demo/DemoTourOverlay.tsx` | The overlay UI (backdrop, annotation, nav) |
| `src/components/demo/demoSteps.ts` | Step definitions with content |
| `src/hooks/useDemoTour.ts` | Hook for accessing tour controls |

### Modified Files

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with `DemoTourProvider` |
| `src/components/layout/Header.tsx` | Change button to start tour instead of cascade |

---

## Step Definitions

Create `src/components/demo/demoSteps.ts`:

```typescript
import type { AgentBriefingEvent } from '@/types/briefing';

export interface DemoStep {
  id: string;
  eventId: string;           // Which fixture event to fire
  title: string;             // Step title
  agent: string;             // Agent name for display
  icon: string;              // Emoji for visual interest
  description: string;       // What this agent does
  lookFor: string;           // Specific thing to notice
  spotlight: SpotlightTarget; // Which UI area to highlight
  position: 'left' | 'right' | 'center'; // Where to show annotation
}

export type SpotlightTarget =
  | 'sidebar-impact'
  | 'sidebar-damage'
  | 'sidebar-timber'
  | 'sidebar-compliance'
  | 'insight-panel'
  | 'full-screen';  // For modal step

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'intro',
    eventId: '',  // No event, just intro
    title: 'Welcome to RANGER',
    agent: 'Recovery Coordinator',
    icon: '🎯',
    description:
      'RANGER orchestrates AI agents across the forest recovery lifecycle. ' +
      'Watch how insights cascade from one specialist to the next.',
    lookFor: 'The lifecycle rail on the left shows four recovery phases.',
    spotlight: 'full-screen',
    position: 'center',
  },
  {
    id: 'burn-analyst',
    eventId: 'evt_burn_001',
    title: 'Step 1: Impact Assessment',
    agent: 'Burn Analyst',
    icon: '🔥',
    description:
      'The Burn Analyst examines satellite imagery (Sentinel-2, MTBS) to classify ' +
      'burn severity across the fire perimeter. This is the foundation for all recovery decisions.',
    lookFor:
      'Notice the confidence score and the "Suggested Action" that will trigger ' +
      'the Trail Assessor. This is the cascade in action.',
    spotlight: 'insight-panel',
    position: 'left',
  },
  {
    id: 'trail-assessor',
    eventId: 'evt_trail_001',
    title: 'Step 2: Damage Inventory',
    agent: 'Trail Assessor',
    icon: '🗺️',
    description:
      'The Trail Assessor evaluates infrastructure damage — trails, bridges, signage. ' +
      'It prioritizes repairs based on burn proximity and public safety.',
    lookFor:
      'The reasoning chain shows how burn severity data (from Step 1) informs ' +
      'the damage priority assessment.',
    spotlight: 'insight-panel',
    position: 'left',
  },
  {
    id: 'cruising-assistant',
    eventId: 'evt_timber_001',
    title: 'Step 3: Salvage Analysis',
    agent: 'Cruising Assistant',
    icon: '🌲',
    description:
      'The Cruising Assistant identifies timber salvage opportunities. It analyzes ' +
      'mortality rates, species composition, and market conditions.',
    lookFor:
      'Citations reference FSVeg plot data and timber cruise standards. ' +
      'Every recommendation is traceable.',
    spotlight: 'insight-panel',
    position: 'left',
  },
  {
    id: 'nepa-advisor',
    eventId: 'evt_nepa_001',
    title: 'Step 4: Compliance Pathway',
    agent: 'NEPA Advisor',
    icon: '📋',
    description:
      'The NEPA Advisor identifies the fastest compliant path to action — Categorical ' +
      'Exclusion, Environmental Assessment, or full EIS.',
    lookFor:
      'The proof layer shows FSH/FSM citations. RANGER never recommends ' +
      'without regulatory backing.',
    spotlight: 'insight-panel',
    position: 'left',
  },
  {
    id: 'coordinator-synthesis',
    eventId: 'evt_coordinator_001',
    title: 'Step 5: Integrated Action Plan',
    agent: 'Recovery Coordinator',
    icon: '🎯',
    description:
      'The Recovery Coordinator synthesizes insights from all agents into a ' +
      'prioritized action plan. This is the "nerve center" value proposition.',
    lookFor:
      'This critical alert demands attention. The coordinator has identified ' +
      'time-sensitive opportunities across the entire recovery lifecycle.',
    spotlight: 'full-screen',
    position: 'center',
  },
  {
    id: 'conclusion',
    eventId: '',  // No event, just conclusion
    title: 'The Cascade Complete',
    agent: '',
    icon: '✅',
    description:
      'You\'ve just witnessed RANGER\'s core value: multi-agent orchestration ' +
      'that transforms siloed data into coordinated intelligence. ' +
      'Each agent builds on the previous, creating insights no single system could provide.',
    lookFor:
      'In a real deployment, this entire cascade could run in minutes, not weeks.',
    spotlight: 'full-screen',
    position: 'center',
  },
];
```

---

## Demo Tour Provider

Create `src/components/demo/DemoTourProvider.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_STEPS, type DemoStep } from './demoSteps';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';

interface DemoTourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: DemoStep | null;
  totalSteps: number;

  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export const useDemoTour = () => {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error('useDemoTour must be used within DemoTourProvider');
  }
  return context;
};

interface DemoTourProviderProps {
  children: React.ReactNode;
}

export const DemoTourProvider: React.FC<DemoTourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const addEvent = useBriefingStore((state) => state.addEvent);
  const clearEvents = useBriefingStore((state) => state.clearEvents);

  const currentStep = isActive ? DEMO_STEPS[currentStepIndex] : null;

  const fireEventForStep = useCallback((step: DemoStep) => {
    if (step.eventId) {
      const event = mockBriefingService.getEventById(step.eventId);
      if (event) {
        addEvent(event);
      }
    }
  }, [addEvent]);

  const startTour = useCallback(() => {
    // Clear any existing events
    clearEvents();
    mockBriefingService.reset();

    setCurrentStepIndex(0);
    setIsActive(true);

    // Fire event for first step if it has one
    const firstStep = DEMO_STEPS[0];
    if (firstStep.eventId) {
      fireEventForStep(firstStep);
    }
  }, [clearEvents, fireEventForStep]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Fire event for next step
      const nextStepData = DEMO_STEPS[nextIndex];
      fireEventForStep(nextStepData);
    } else {
      // Tour complete
      endTour();
    }
  }, [currentStepIndex, fireEventForStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      // Note: We don't un-fire events, they accumulate
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index);
      fireEventForStep(DEMO_STEPS[index]);
    }
  }, [fireEventForStep]);

  return (
    <DemoTourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: DEMO_STEPS.length,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
};

export default DemoTourProvider;
```

---

## Demo Tour Overlay

Create `src/components/demo/DemoTourOverlay.tsx`:

```typescript
import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDemoTour } from './DemoTourProvider';

export const DemoTourOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    endTour,
  } = useDemoTour();

  if (!isActive || !currentStep) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Position classes based on step configuration
  const positionClasses = {
    left: 'left-8 top-1/2 -translate-y-1/2 max-w-md',
    right: 'right-[420px] top-1/2 -translate-y-1/2 max-w-md', // Account for InsightPanel
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={endTour}
      />

      {/* Annotation Card */}
      <div
        className={`
          fixed z-50
          ${positionClasses[currentStep.position]}
        `}
      >
        <div className="bg-slate-900/95 border border-white/20 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800/50 px-5 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentStep.icon}</span>
              <div>
                <div className="text-xs text-text-muted uppercase tracking-wider font-medium">
                  {currentStep.agent || 'RANGER Demo'}
                </div>
                <div className="text-white font-semibold">
                  {currentStep.title}
                </div>
              </div>
            </div>
            <button
              onClick={endTour}
              className="text-text-muted hover:text-white transition-colors p-1"
              aria-label="Close tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-4">
            <p className="text-text-secondary leading-relaxed">
              {currentStep.description}
            </p>

            {currentStep.lookFor && (
              <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-md px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-accent-cyan text-lg">👀</span>
                  <div>
                    <div className="text-accent-cyan text-xs font-bold uppercase tracking-wider mb-1">
                      Look For
                    </div>
                    <p className="text-accent-cyan/90 text-sm leading-relaxed">
                      {currentStep.lookFor}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Navigation */}
          <div className="bg-slate-800/30 px-5 py-3 flex items-center justify-between border-t border-white/10">
            {/* Progress */}
            <div className="flex items-center gap-2">
              {DEMO_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${index === currentStepIndex
                      ? 'bg-accent-cyan w-4'
                      : index < currentStepIndex
                        ? 'bg-safe'
                        : 'bg-white/20'
                    }
                  `}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all
                  ${isFirstStep
                    ? 'text-text-muted cursor-not-allowed'
                    : 'text-white hover:bg-white/10'
                  }
                `}
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-medium bg-accent-cyan text-slate-900 hover:bg-accent-cyan/90 transition-all"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Need to import DEMO_STEPS for the progress dots
import { DEMO_STEPS } from './demoSteps';

export default DemoTourOverlay;
```

---

## Update App.tsx

Wrap the app with `DemoTourProvider` and add the overlay:

```typescript
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import Attribution from '@/components/map/Attribution';
import Terrain3D from '@/components/map/Terrain3D';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import BriefingObserver from '@/components/briefing/BriefingObserver';
import { DemoTourProvider } from '@/components/demo/DemoTourProvider';
import DemoTourOverlay from '@/components/demo/DemoTourOverlay';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const addEvent = useBriefingStore((state) => state.addEvent);

  useEffect(() => {
    mockBriefingService.loadFixtures()
      .then(() => {
        setIsReady(true);
        console.log('[App] Fixtures loaded');
      })
      .catch((err) => {
        console.error('[App] Failed to load fixtures:', err);
      });

    const unsubscribe = mockBriefingService.subscribe((event) => {
      console.log('[App] Received event:', event.event_id);
      addEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [addEvent]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm mono">Loading RANGER...</div>
      </div>
    );
  }

  return (
    <DemoTourProvider>
      <BriefingObserver autoConnect={false}>
        <div className="relative w-screen h-screen overflow-hidden bg-background flex text-text-primary">
          <Terrain3D />
          <Sidebar />
          <div className="flex-1 flex flex-col relative z-10">
            <Header />
            <main className="flex-1 relative p-6 pointer-events-none">
              <div className="pointer-events-auto contents">
                <InsightPanel />
                <MapControls />
                <Attribution />
              </div>
              {/* Geographic Markers ... (keep existing) */}
            </main>
          </div>
        </div>

        {/* Demo Tour Overlay - renders on top when active */}
        <DemoTourOverlay />
      </BriefingObserver>
    </DemoTourProvider>
  );
};

export default App;
```

---

## Update Header.tsx

Change the button to use the tour:

```typescript
import React from 'react';
import { Bell, ChevronRight, Play } from 'lucide-react';
import { useDemoTour } from '@/components/demo/DemoTourProvider';

const Header: React.FC = () => {
  const { startTour, isActive } = useDemoTour();

  return (
    <header className="h-[48px] w-full glass-header z-30 flex items-center justify-between px-8">
      {/* Left side Wordmark */}
      <div className="flex items-center pl-12">
        <span className="text-[18px] font-bold tracking-[0.05em] text-text-primary">
          RANGER
        </span>
      </div>

      {/* Center Breadcrumb */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-secondary text-[12px] font-medium tracking-wide">
        <span>Willamette NF</span>
        <ChevronRight size={14} className="opacity-40" />
        <span>Cedar Creek Fire</span>
        <ChevronRight size={14} className="opacity-40" />
        <span className="text-text-primary">Impact Analysis</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button
          onClick={startTour}
          disabled={isActive}
          className={`
            flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider
            rounded transition-all group
            ${isActive
              ? 'bg-slate-700/50 border border-white/10 text-text-muted cursor-not-allowed'
              : 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan/50'
            }
          `}
        >
          <Play size={10} className={`${isActive ? '' : 'fill-accent-cyan'} group-hover:scale-110 transition-transform`} />
          {isActive ? 'Tour Active' : 'Run Demo'}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe live-dot shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-safe uppercase text-[10px] font-bold tracking-widest">
            Live
          </span>
        </div>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
          <img
            src="https://picsum.photos/seed/ranger/32/32"
            alt="Avatar"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
```

---

## Directory Structure After Implementation

```
src/components/demo/
├── DemoTourProvider.tsx   # Context + state management
├── DemoTourOverlay.tsx    # Visual overlay component
├── demoSteps.ts           # Step definitions with content
└── index.ts               # Barrel export
```

Create `src/components/demo/index.ts`:
```typescript
export { DemoTourProvider, useDemoTour } from './DemoTourProvider';
export { DemoTourOverlay } from './DemoTourOverlay';
export { DEMO_STEPS } from './demoSteps';
export type { DemoStep, SpotlightTarget } from './demoSteps';
```

---

## Testing Checklist

- [ ] "Run Demo" button starts the tour
- [ ] Intro step appears with welcome message
- [ ] "Next" advances to Burn Analyst step
- [ ] Burn Analyst event appears in InsightPanel
- [ ] Progress dots update correctly
- [ ] "Back" button works (doesn't break anything)
- [ ] All 5 agent steps display correct annotations
- [ ] Coordinator step shows "Critical Alert" modal
- [ ] Conclusion step appears
- [ ] "Finish" button closes the tour
- [ ] Clicking backdrop closes tour
- [ ] X button closes tour
- [ ] Button shows "Tour Active" while running

---

## Success Criteria

1. **User controls the pace** — No auto-advance, user clicks "Next"
2. **Clear annotations** — Each step explains what the agent does
3. **"Look For" callouts** — Directs attention to specific UI elements
4. **Progress visible** — User knows where they are in the tour
5. **Graceful exit** — Multiple ways to close (X, backdrop, Finish)

---

## Future Enhancements (Not for Now)

- Spotlight effect with CSS clip-path to highlight specific regions
- Keyboard navigation (arrow keys, Escape to close)
- Persist "has seen tour" in localStorage
- Auto-start tour for first-time visitors

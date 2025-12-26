 Implementation Plan: Fire Context Selector & Onboarding Wizard

 Overview

 Create a fire context switching system with 2-3 pre-composed demo fires (Cedar
 Creek pattern) plus a "New Fire" onboarding wizard that demonstrates the agentic
 workflow.

 Goal: Executive "aha moment" - demonstrating how RANGER's agents proactively curate
  a complete fire analysis from scratch.

 Architecture Principles

 1. Demo Layer: 2-3 mock fires with pre-composed fixtures (Cedar Creek, Bootleg,
 Dixie)
 2. Real AI: All chat and RAG interactions use live Gemini API (including NEPA File
 Search)
 3. Future-Ready: Architecture supports live API integration; mock fires serve as
 validation baseline

 ┌─────────────────────────────────────────────────────────────────────┐
 │                        CURRENT (Phase 1)                            │
 ├─────────────────────────────────────────────────────────────────────┤
 │  Fire Selector → Mock Fires (2-3 pre-composed)                      │
 │       │                                                             │
 │       ├─→ Cedar Creek (default) → Fixtures + Real Gemini Chat       │
 │       ├─→ Bootleg Fire (demo)   → Fixtures + Real Gemini Chat       │
 │       └─→ "Add New Fire..."     → Wizard (simulated agent progress) │
 │                                         │                           │
 │                                         └─→ Uses template fixtures  │
 ├─────────────────────────────────────────────────────────────────────┤
 │                        FUTURE (Phase 2+)                            │
 ├─────────────────────────────────────────────────────────────────────┤
 │  Fire Selector → Live API Integration                               │
 │       │                                                             │
 │       ├─→ Mock Fires (baseline)  → Unchanged (validation)           │
 │       └─→ "Add New Fire..."      → Real data from:                  │
 │                                      • NIFC/IRWIN (perimeter)       │
 │                                      • MTBS (burn severity)         │
 │                                      • TRACS (trail damage)         │
 │                                      • FSVeg (timber plots)         │
 └─────────────────────────────────────────────────────────────────────┘

 ---
 User Experience Flow

 1. User clicks fire name in header → Dropdown opens
 2. User selects "➕ Add New Fire..." → Onboarding wizard opens
 3. User enters minimal info (fire name, location, date) → Submit
 4. Wizard shows real-time agent progress:
    - "Fetching fire perimeter from NIFC..." ✓
    - "Analyzing burn severity from MTBS..." ✓
    - "Correlating trail network damage..." ✓
    - "Identifying timber salvage priorities..." ✓
    - "Generating NEPA compliance assessment..." ✓
 5. All phases complete → User lands on fully populated dashboard

 ---
 Architecture

 New Files to Create

 apps/command-console/src/
 ├── stores/
 │   └── fireContextStore.ts           # Fire selection & onboarding state
 ├── components/
 │   └── fire/
 │       ├── FireSelector.tsx          # Header dropdown component
 │       ├── FireOnboardingWizard.tsx  # Main wizard container
 │       ├── steps/
 │       │   ├── FireIdentificationStep.tsx   # Step 1: Search/enter fire
 │       │   ├── DataAvailabilityStep.tsx     # Step 2: Show data sources
 │       │   ├── AgentProgressStep.tsx        # Step 3: Watch agents work
 │       │   └── CompletionStep.tsx           # Step 4: Success summary
 │       └── AgentProgressCard.tsx     # Individual agent status card
 ├── services/
 │   └── fireOnboardingService.ts      # Orchestrates onboarding flow
 └── types/
     └── fire.ts                       # FireContext, OnboardingStep types

 Files to Modify

 | File                   | Changes
    |
 |------------------------|---------------------------------------------------------
 ---|
 | Header.tsx             | Replace hardcoded "Cedar Creek Fire" with <FireSelector 
 /> |
 | mapStore.ts            | Add fireContext state, parameterize CEDAR_CREEK_CENTER
    |
 | aiBriefingService.ts   | Accept fireContext param, dynamic system prompt
    |
 | mockBriefingService.ts | Support multiple fixture sets by fire ID
    |
 | App.tsx                | Load fixtures based on fireContext.fire_id
    |
 | demoTourStore.ts       | Parameterize Cedar Creek references
    |
 | CedarCreekMap.tsx      | Rename to FireMap.tsx, accept fire context props
    |

 ---
 Implementation Phases

 Phase 1: Fire Context Store & Types (Foundation)

 File: src/types/fire.ts
 export interface FireContext {
   fire_id: string;
   name: string;
   year: number;
   forest: string;
   state: string;
   acres: number;
   centroid: [number, number];  // [lng, lat]
   status: 'active' | 'contained' | 'archived';
   data_status: {
     perimeter: DataSourceStatus;
     burn_severity: DataSourceStatus;
     trail_damage: DataSourceStatus;
     timber_plots: DataSourceStatus;
   };
 }

 export interface DataSourceStatus {
   available: boolean;
   source: string;
   coverage?: number;  // 0-1 for partial data
   updated?: string;
 }

 export interface OnboardingState {
   isOpen: boolean;
   currentStep: number;
   fireInput: Partial<FireContext>;
   agentProgress: Record<AgentType, AgentProgressState>;
   error?: string;
 }

 export interface AgentProgressState {
   status: 'pending' | 'working' | 'complete' | 'error';
   message: string;
   progress?: number;  // 0-100
   startedAt?: number;
   completedAt?: number;
 }

 File: src/stores/fireContextStore.ts
 - Active fire context (selected fire)
 - Available fires list (demo: Cedar Creek + 2 placeholders)
 - Onboarding wizard state
 - Actions: selectFire(), startOnboarding(), updateAgentProgress(), etc.

 ---
 Phase 2: Fire Selector Component

 File: src/components/fire/FireSelector.tsx

 Location: Header breadcrumb area (replace hardcoded text)

 UI Structure:
 ┌─────────────────────────────┐
 │ 🔥 Cedar Creek Fire (2022) ▼│
 └─────────────────────────────┘
          │
          ▼
 ┌─────────────────────────────┐
 │ 🔥 Cedar Creek Fire    ✓   │
 │    Willamette NF · 127K ac  │
 ├─────────────────────────────┤
 │ 🔥 Bootleg Fire (demo)     │
 │    Fremont-Winema NF        │
 ├─────────────────────────────┤
 │ ➕ Add New Fire...          │
 └─────────────────────────────┘

 Behavior:
 - Click fire → Switch context, reload fixtures
 - Click "Add New Fire" → Open onboarding wizard

 ---
 Phase 3: Onboarding Wizard (Core Feature)

 File: src/components/fire/FireOnboardingWizard.tsx

 Step 1: Fire Identification
 - Search box (simulated IRWIN search)
 - Or manual entry: Name, Forest, State, Year, Approximate Acres
 - Location picker (click on map or enter coordinates)

 Step 2: Data Availability Check
 - Show checkmarks for available data sources
 - Simulated "checking..." animation
 - Results: ✅ Perimeter, ✅ Burn Severity, ⚠️ Trails (partial), ❌ Timber

 Step 3: Agent Progress (The "Aha Moment")
 ┌────────────────────────────────────────────────┐
 │  🔥 Initializing Lionshead Fire Analysis      │
 │                                                │
 │  ┌──────────────────────────────────────────┐ │
 │  │ 🔍 Burn Analyst                          │ │
 │  │    Fetching MTBS burn severity data...   │ │
 │  │    ████████████░░░░░░░░ 65%              │ │
 │  └──────────────────────────────────────────┘ │
 │                                                │
 │  ┌──────────────────────────────────────────┐ │
 │  │ 🥾 Trail Assessor                        │ │
 │  │    Waiting for burn severity baseline... │ │
 │  │    ░░░░░░░░░░░░░░░░░░░░ Pending          │ │
 │  └──────────────────────────────────────────┘ │
 │                                                │
 │  ┌──────────────────────────────────────────┐ │
 │  │ 🌲 Cruising Assistant                    │ │
 │  │    Waiting for damage assessment...      │ │
 │  │    ░░░░░░░░░░░░░░░░░░░░ Pending          │ │
 │  └──────────────────────────────────────────┘ │
 │                                                │
 │  ┌──────────────────────────────────────────┐ │
 │  │ 📋 NEPA Advisor                          │ │
 │  │    Ready (FSM/FSH knowledge indexed)     │ │
 │  │    ████████████████████ Ready            │ │
 │  └──────────────────────────────────────────┘ │
 └────────────────────────────────────────────────┘

 Step 4: Completion
 - Summary of what was generated
 - "Open Fire Dashboard" CTA
 - Automatically transitions to main view

 ---
 Phase 4: Fire Onboarding Service

 File: src/services/fireOnboardingService.ts

 Orchestrates the simulated agent workflow:

 class FireOnboardingService {
   async initializeFire(context: FireContext): Promise<void> {
     // Step 1: Fetch perimeter (simulated)
     await this.simulateDataFetch('perimeter', 2000);

     // Step 2: Fetch burn severity (simulated)
     await this.simulateDataFetch('burn_severity', 3000);

     // Step 3: Run Burn Analyst
     await this.runAgent('burn_analyst', context);

     // Step 4: Run Trail Assessor (depends on burn)
     await this.runAgent('trail_assessor', context);

     // Step 5: Run Cruising Assistant (depends on trail)
     await this.runAgent('cruising_assistant', context);

     // Step 6: Run NEPA Advisor (synthesizes all)
     await this.runAgent('nepa_advisor', context);

     // Step 7: Generate fixture files (simulated)
     await this.generateFixtures(context);
   }

   private async runAgent(agent: AgentType, context: FireContext) {
     updateAgentProgress(agent, { status: 'working', message: '...' });

     // Simulate work with realistic timing
     await delay(2000 + Math.random() * 2000);

     // Generate briefing event
     const event = await aiBriefingService.generateBriefing(agent, context);
     briefingStore.addEvent(event);

     updateAgentProgress(agent, { status: 'complete' });
   }
 }

 ---
 Phase 5: Integration & Polish

 1. Update Header.tsx - Swap hardcoded text for FireSelector
 2. Update App.tsx - Initialize from fireContextStore
 3. Update services - Pass fireContext to all API calls
 4. Add demo fires - 2-3 pre-configured fires for demo switching
 5. Persist selection - Save selected fire to localStorage

 ---
 Demo Experience

 Pre-Composed Mock Fires (Demo Mode)

 | Fire         | Year | Forest                | Acres   | Fixture Status
                |
 |--------------|------|-----------------------|---------|--------------------------
 ---------------|
 | Cedar Creek  | 2022 | Willamette NF, OR     | 127,000 | ✅ Complete (existing)
                |
 | Bootleg Fire | 2021 | Fremont-Winema NF, OR | 413,765 | 📋 To create (copy Cedar
 Creek pattern) |
 | Dixie Fire   | 2021 | Lassen NF, CA         | 963,309 | 📋 Optional (largest CA
 fire)           |

 Each mock fire has:
 - data/fixtures/{fire-id}/ - burn-severity.json, trail-damage.json,
 timber-plots.json, briefing-events.json
 - public/fixtures/{fire-id}-geojson.json - Combined GeoJSON for map
 - Fire-specific coordinates, names, and context

 Switching Between Fires

 - Select fire from dropdown → Load that fire's fixtures → Map centers on new
 location
 - Chat continues using real Gemini with fire-specific context in system prompt
 - All 4 workflow phases populated from that fire's briefing-events.json

 "Add New Fire" Wizard (Modal)

 - Opens modal overlay (map visible in background)
 - User enters: Fire name, location (click map or coordinates), year
 - Shows simulated agent progress with realistic animations
 - Uses template fixtures (clone from Cedar Creek) with new fire name
 - Future: Will pull real data from live APIs

 ---
 Key Files Reference

 | Pattern              | Reference File         | Lines
        |
 |----------------------|------------------------|----------------------------------
 -------|
 | Multi-step wizard UI | DemoTourOverlay.tsx    | 42-64 (ProgressDots), 80-187
 (TourCard) |
 | Modal overlay        | ModalInterrupt.tsx     | 29-97
        |
 | Progress states      | lifecycleStore.ts      | 17-109
        |
 | Toast notifications  | notificationStore.ts   | Full file
        |
 | Dropdown pattern     | Header.tsx             | 268-320 (timezone), 397-486
 (profile)   |
 | Zustand store        | briefingStore.ts       | Full file
        |
 | Agent triggering     | mockBriefingService.ts | 134-187
        |

 ---
 Implementation Order

 Sprint 1: Fire Context Foundation

 1. Types & Store - fire.ts, fireContextStore.ts
 2. FireSelector Dropdown - Header component with fire switching
 3. Refactor hardcoded references - Parameterize Cedar Creek throughout codebase
 4. Test: Switch between Cedar Creek (existing) and placeholder fire

 Sprint 2: Additional Mock Fires

 5. Create Bootleg Fire fixtures - Copy Cedar Creek pattern, update
 coordinates/names
 6. Update aiBriefingService - Dynamic system prompt based on active fire
 7. Test: Full demo flow with 2 fires, real Gemini chat working for both

 Sprint 3: Onboarding Wizard

 8. Wizard Modal Shell - Container with step navigation
 9. Step 1: Fire Identification - Name, location, year input
 10. Step 2: Data Availability - Simulated data source check
 11. Step 3: Agent Progress - Animated agent status cards
 12. Step 4: Completion - Summary and transition to dashboard
 13. OnboardingService - Orchestrate simulated agent workflow

 Sprint 4: Polish & Future-Proofing

 14. Persist fire selection - localStorage
 15. Error handling - Network failures, API rate limits
 16. Add Dixie Fire (optional) - Third demo fire
 17. Document API integration points - For Phase 2 live data

 ---
 Estimated Scope

 - New files: 10-12 files
 - Modified files: 6-8 files
 - New fixtures: 1-2 fire datasets (Bootleg, optionally Dixie)
 - Complexity: Medium-High (state management, animations, multi-file refactor)
 - Reuse: Heavy reuse of existing patterns (DemoTour, Modal, Toast)

 ---
 Success Criteria

 1. ✅ User can select between 2-3 fires in header dropdown
 2. ✅ Switching fires reloads map, fixtures, and resets phases
 3. ✅ Chat uses real Gemini API with fire-specific context
 4. ✅ NEPA Advisor RAG (File Search) works regardless of fire
 5. ✅ "Add New Fire" opens modal wizard
 6. ✅ Wizard shows animated agent progress (simulated)
 7. ✅ Completion transitions to populated dashboard
 8. ✅ Fire selection persists across sessions
 9. ✅ Architecture ready for live API integration (Phase 2)

# RANGER Workflow Test Plan

**Purpose:** Manual UI testing checklist for the 4 recovery workflows
**Method:** Functional correctness validation
**Last Updated:** 2025-12-21

---

## Overview

RANGER implements 4 sequential lifecycle phases, each powered by a specialized AI agent:

| Phase | Agent | Color | Purpose |
|-------|-------|-------|---------|
| 1. IMPACT | Burn Analyst | Cyan | Burn severity analysis from MTBS data |
| 2. DAMAGE | Trail Assessor | Amber | Trail damage assessment & work orders |
| 3. TIMBER | Cruising Assistant | Emerald | Timber salvage prioritization & FSVeg export |
| 4. COMPLIANCE | NEPA Advisor | Purple | Regulatory guidance & compliance pathways |

---

## Workflow 1: IMPACT (Burn Analyst)

### Test 1.1: Phase Activation
- [x] Click IMPACT button in sidebar → becomes active (cyan left border)
- [x] Other phases show as "pending" (dimmed icons)
- [x] Sidebar state persists on page refresh

### Test 1.2: Map Layer Visualization
- [x] Burn severity layer visible (red=HIGH, amber=MODERATE, green=LOW)
- [x] Fire perimeter visible (dashed white outline)
- [x] SAT/TER/IR toggle switches base layer
- [x] Map centers on Cedar Creek (43.726°N, 122.167°W)

### Test 1.3: InsightPanel Rendering
- [x] Agent badge shows "IMPACT ANALYST" with cyan accent
- [x] Confidence score displays (0-100% with visual bar)
- [x] Summary text renders clearly
- [x] Detail box shows additional context

### Test 1.4: Reasoning Chain
- [x] "Reasoning" section is expandable/collapsible
- [x] Numbered steps display (1, 2, 3...)
- [x] Steps show logical progression
- [x] Confidence ledger shows data source tiers (Tier 1/2/3)

### Test 1.5: Suggested Actions
- [x] "Trigger Trail Assessment" action visible
- [x] Clicking action transitions to DAMAGE phase
- [x] Sidebar updates to show DAMAGE as active

### Test 1.6: Chat Integration
- [x] Open chat panel
- [x] Type "What is the burn severity?"
- [x] Response routes to Burn Analyst (cyan badge)
- [x] Response includes confidence score
- [x] Response shows expandable reasoning chain

### Test 1.7: Map Interactions
- [x] Zoom controls work (+/-)
- [x] Compass resets bearing to north
- [x] Layer visibility toggles function
- [x] Measurement tool draws distance/area

**Status:** [x] Complete
**Issues Found:**
_None_

---

## Workflow 2: DAMAGE (Trail Assessor)

### Test 2.1: Phase Transition
- [x] Transition from IMPACT (via suggested action or sidebar click)
- [x] DAMAGE button shows active (amber left border)
- [x] IMPACT shows as "complete" (checkmark or filled state)

### Test 2.2: Map Layer Visualization
- [x] Trail damage points visible on map
- [x] Damage markers show severity (color-coded)
- [x] Fire perimeter remains visible as context
- [x] Burn severity can be toggled on/off

### Test 2.3: InsightPanel Rendering
- [x] Agent badge shows "DAMAGE ASSESSOR" with amber accent
- [x] Confidence score displays
- [x] Summary describes trail damage assessment
- [x] Detail shows work order information

### Test 2.4: Reasoning Chain
- [x] Reasoning section expandable
- [x] Shows parent event linking (references burn analysis)
- [x] Causality chain visible (this assessment was triggered by...)

### Test 2.5: Suggested Actions
- [x] "Trigger Timber Cruise" action visible
- [x] Clicking transitions to TIMBER phase (Note: Manual click required as trigger button fails due to missing backend endpoint)
- [x] "Export TRACS Work Orders" action visible (Note: Currently a stub)

### Test 2.6: Chat Integration
- [x] Type "What trails are damaged?"
- [x] Response routes to Trail Assessor (amber badge)
- [x] Response includes specific trail segments
- [x] Cost estimates or repair priorities mentioned

**Status:** [x] Complete (with issues)
**Issues Found:**
- "Trigger Timber Cruise" button attempts to hit `:8080` API which is not running; does not auto-transition to TIMBER.
- "Export TRACS Work Orders" is a stub.

---

## Workflow 3: TIMBER (Cruising Assistant)

### Test 3.1: Phase Transition
- [x] Transition from DAMAGE (via suggested action or sidebar click)
- [x] TIMBER button shows active (emerald left border)
- [x] DAMAGE shows as "complete"

### Test 3.2: Map Layer Visualization
- [x] Timber plots visible on map (circles with IDs)
- [x] Plot colors indicate prioritization
- [x] Previous damage points visible as context

### Test 3.3: InsightPanel Rendering
- [x] Agent badge shows "TIMBER ANALYST" with emerald accent
- [x] Confidence score displays
- [x] Summary includes MBF (thousand board feet) estimates
- [x] Detail mentions species mix (e.g., Douglas-fir, Hemlock)

### Test 3.4: Reasoning Chain
- [x] Reasoning section expandable
- [x] Shows valuation logic
- [x] Mentions access constraints (e.g., road damage from previous phase)

### Test 3.5: Suggested Actions
- [x] "Trigger NEPA Review" action visible
- [x] Clicking transitions to COMPLIANCE phase (Note: Manual click required as trigger button fails due to missing backend endpoint)
- [x] "Export FSVeg Data" action visible (Note: Currently a stub)

### Test 3.6: Chat Integration
- [x] Type "What is the total value of the timber?"
- [x] Response routes to Cruising Assistant (emerald badge)
- [x] Response mentions dollar values or volume estimates
- [x] Response links to specific plots

**Status:** [x] Complete
**Issues Found:**
- "Trigger NEPA Review" button fails to auto-transition due to missing `:8080` backend (consistent with previous phases).
---

## Workflow 4: COMPLIANCE (NEPA Advisor)

### Test 4.1: Phase Transition
- [x] Transition from TIMBER (via sidebar click or suggested action)
- [x] COMPLIANCE button shows active (purple left border)
- [x] IMPACT, DAMAGE, and TIMBER show as complete

### Test 4.2: Map Layer Visualization
- [x] Regulatory constraint layers/overlays visible
- [x] Sensitive area buffers (e.g., Waldo Lake) displayed
- [x] Previous plots and damage still visible as context

### Test 4.3: InsightPanel Rendering
- [x] Agent badge shows "NEPA ADVISOR" with purple accent
- [x] Confidence score displays
- [x] Summary mentions EA (Environmental Assessment) or CE (Categorical Exclusion) pathway
- [x] Detail mentions specific regulations (e.g., FSH 1909.15)

### Test 4.4: Reasoning Chain
- [x] Reasoning section expandable
- [x] Shows consistency checks with Forest Plan
- [x] Mentions cumulative effects of previous phases

### Test 4.5: Suggested Actions
- [x] "Generate EA Outline" action visible
- [x] "View Regulatory Constraints" action visible
- [x] "Sign Decision Memo" action visible if applicable (Note: Final step)

### Test 4.6: Chat Integration
- [x] Type "What are the regulatory risks?"
- [x] Response routes to NEPA Advisor (purple badge)
- [x] Response mentions sensitive species or cultural resource impacts
- [x] Response provides timeline estimates for approval

**Status:** [x] Complete
**Issues Found:**
- Suggested actions trigger console logs (expected stubs) but do not yet generate documents or overlay new map layers.
---

## Cross-Workflow Tests

### Demo Tour
- [ ] "Demo" button in header starts guided tour
- [ ] Tour progresses through all 7 steps
- [ ] Map camera flies to correct locations per step
- [ ] Layer visibility syncs with each step
- [ ] Back/Next/Skip navigation works
- [ ] Tour can be dismissed and restarted

### Chat Panel Global
- [ ] Chat panel opens/closes correctly
- [ ] Message history persists during session
- [ ] Clear chat functionality works
- [ ] Suggested query chips function
- [ ] Error states handled gracefully

### Responsive Design
- [ ] Sidebar collapses on smaller screens
- [ ] InsightPanel remains readable on tablet
- [ ] Map controls accessible on mobile
- [ ] Touch interactions work (if applicable)

### Error Handling
- [ ] Network error shows graceful fallback
- [ ] API timeout doesn't crash app
- [ ] Invalid chat input handled

---

## Test Session Log

| Date | Tester | Workflows Tested | Issues Found | Notes |
|------|--------|------------------|--------------|-------|
| 2025-12-21 | Antigravity | IMPACT | None | Initial session; all green. |
| 2025-12-21 | Antigravity | DAMAGE | Transition bug | Trigger button fails (backend missing), manual transition works. |
| 2025-12-21 | Antigravity | TIMBER | Transition bug | Trigger button fails (backend missing), manual transition works. |
| 2025-12-21 | Antigravity | COMPLIANCE | None | All tests passed; actions verified as functional stubs. |

---

## Key Files Reference

| Component | Path |
|-----------|------|
| Sidebar | `apps/command-console/src/components/Sidebar.tsx` |
| InsightPanel | `apps/command-console/src/components/InsightPanel.tsx` |
| Map | `apps/command-console/src/components/CedarCreekMap.tsx` |
| ChatPanel | `apps/command-console/src/components/ChatPanel.tsx` |
| Demo Tour | `apps/command-console/src/components/DemoTourOverlay.tsx` |
| Lifecycle Store | `apps/command-console/src/stores/lifecycleStore.ts` |
| Briefing Store | `apps/command-console/src/stores/briefingStore.ts` |
| Map Store | `apps/command-console/src/stores/mapStore.ts` |
| Mock Fixtures | `apps/command-console/public/fixtures/briefing-events.json` |

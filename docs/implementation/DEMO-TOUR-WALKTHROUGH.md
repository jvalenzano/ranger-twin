# RANGER Onboarding Tour Walkthrough

**Product:** RANGER — Agentic OS for Natural Resource Recovery
**Version:** Phase 1 (Cedar Creek Fire)
**Objective:** Guide users through the "Nervous System" value proposition in under 5 minutes.

---

## Naming Conventions used in this Tour

| Context | Style | Example |
|---------|-------|---------|
| Sidebar | Phase Names | IMPACT, DAMAGE, TIMBER, COMPLIANCE |
| Insight Panel | Role Titles | IMPACT ANALYST, DAMAGE ASSESSOR |
| Tour Cards | **Friendly Names** | Burn Analyst, Trail Assessor |

---

## Tour Step Definitions

| Step | Title | Subtitle | Persona | Lifecycle Phase | Visible Layers | Base Layer |
|------|-------|----------|---------|-----------------|----------------|------------|
| 1 | Welcome to RANGER | The Nerve Center for Forest Recovery | — | IMPACT | Fire Perimeter, Burn Severity | Satellite |
| 2 | Burn Analyst | Impact Assessment Intelligence | Sarah Chen (FMO) | IMPACT | Fire Perimeter, Burn Severity | Satellite |
| 3 | Trail Assessor | Infrastructure Damage Analysis | Marcus Rodriguez (Rec Tech) | DAMAGE | Fire Perimeter, **Trail Damage** | Terrain |
| 4 | Cruising Assistant | Salvage Operations Planning | Elena Vasquez (Cruiser) | TIMBER | Fire Perimeter, Severity, **Timber Plots** | Satellite |
| 5 | NEPA Advisor | Regulatory Navigation | Dr. James Park (Env Coord) | COMPLIANCE | **ALL LAYERS** | Satellite |
| 6 | The Recovery Cascade | Connected Intelligence | — | COMPLIANCE | **ALL LAYERS** | Satellite |
| 7 | Speed of Insight | From Data to Decision in Minutes | — | COMPLIANCE | **ALL LAYERS** | Satellite |

---

## Step-by-Step Breakdown

### 1. Welcome to RANGER
*   **Focus:** Core Value Proposition (The Cascade).
*   **Copy:** Lead with the message that a single burn finding ripples through the entire recovery process.
*   **Map:** High-level overview of Cedar Creek (127k acres).
*   **Sidebar:** Starts in **IMPACT** phase.

### 2. Burn Analyst (Sarah Chen)
*   **Focus:** Processing high-resolution satellite imagery.
*   **Look For:** High severity zones (red) vs. moderate (yellow).
*   **Logic:** This data is the prerequisite for all downstream assessments.

### 3. Trail Assessor (Marcus Rodriguez)
*   **Focus:** Ground-truth damage to infrastructure.
*   **Look For:** **Bridge Failures** (red points), **Hazard Trees** (yellow), **Erosion** (amber).
*   **Sync:** Sidebar switches to **DAMAGE** phase. Map switches to **Terrain** view to highlight topography.

### 4. Cruising Assistant (Elena Vasquez)
*   **Focus:** Timber salvage and forest health.
*   **Look For:** **Timber Plot** markers (colored by salvage priority).
*   **Sync:** Sidebar switches to **TIMBER** phase.

### 5. NEPA Advisor (Dr. James Park)
*   **Focus:** Regulatory compliance and environmental coordination.
*   **Look For:** Synthesis of all data layers. How severity and plots intersect with regulatory constraints.
*   **Sync:** Sidebar switches to **COMPLIANCE**.

### 6. The Recovery Cascade
*   **Focus:** Integration and shared memory.
*   **Copy:** Explains that agents building on each other's work is RANGER's secret sauce.
*   **Visual:** All layers visible at once.

### 7. Recovery at the Speed of Insight
*   **Focus:** Efficiency and Closure.
*   **Copy:** Emphasizes that what once took weeks now happens in minutes.
*   **CTA:** "Finish Tour" button to enter the main application.

---

## Technical Specifications

### Sidebar Synchronization
*   The tour calls `lifecycleStore.setActivePhase(step.lifecyclePhase)` on every step change.
*   The Sidebar rail automatically updates its active state and animations based on this store.

### Map Layer Control
*   Visibility is managed via `mapStore.setVisibleLayers(step.visibleLayers)`.
*   Unlisted layers are hidden to reduce cognitive load (Recognition over Recall).

### Camera and Base Layer
*   Each step defines a `camera` object (center, zoom, bearing, pitch) and `baseLayer` (SAT/TER/IR).
*   Synchronization is handled by the `TourMapSync` component in `DemoTourOverlay.tsx`.

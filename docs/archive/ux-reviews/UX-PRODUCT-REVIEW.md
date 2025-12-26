# RANGER UX/Product Review: Comprehensive Analysis

**Product:** RANGER — Agentic OS for Natural Resource Recovery
**Version:** Phase 1 (Simulation/Demo Focus)
**Reviewer Role:** Senior UX/UI Developer & Product Strategy Specialist
**Date:** December 2025

---

## Scope & Deliverables

This review covers **three interconnected goals**:

1. **Fix the Onboarding Tour** — Code changes to resolve naming, layer visibility, and sidebar sync issues
2. **Update Documentation** — Align USER-JOURNEYS-AND-PERSONAS.md and related docs with current implementation
3. **Strategic Roadmap** — Prioritized recommendations for product improvements

### Naming Convention Decision

**Context-dependent naming** (approved):
| Context | Naming Style | Example |
|---------|--------------|---------|
| **Sidebar** | Phase names | IMPACT, DAMAGE, TIMBER, COMPLIANCE |
| **Insight Panel** | Role titles | IMPACT ANALYST, DAMAGE ASSESSOR |
| **Tour Cards** | Friendly names | Burn Analyst, Trail Assessor |

This preserves approachability in onboarding while maintaining professional terminology in the working interface.

---

## 1. Product & Persona Understanding

### What RANGER Is
RANGER is a **multi-agent AI orchestration platform** for post-fire forest recovery operations. The core value proposition:

> **"Turn weeks of siloed analysis into hours of coordinated intelligence."**

It's NOT a dashboard, not a map viewer, not a single AI tool — it's an **orchestration layer** that connects:
- Satellite burn severity data (IMPACT)
- Field trail assessments (DAMAGE)
- Timber salvage planning (TIMBER)
- NEPA regulatory compliance (COMPLIANCE)

### Platform Components
| Component | Purpose | User |
|-----------|---------|------|
| **Command Console** (Desktop) | Strategic nerve center; synthesis & decision-making | FMO, District Ranger, Environmental Coordinator |
| **Field Companion** (PWA) | Observational assistant; multimodal field capture | Trail Tech, Timber Cruiser |
| **Recovery Coordinator** | Root orchestrator; cross-agent coordination | System (invisible to user) |

### Phase 1 Scope
- **Real:** Gemini AI synthesis, agent orchestration, reasoning chains, UI/UX
- **Simulated:** Upstream data (MTBS, TRACS, FSVeg) — static fixtures
- **Scenario:** Cedar Creek Fire (2022), Willamette NF, Oregon

---

## 2. Persona Alignment Findings

### Primary Personas (Field Operations)

| Persona | Role | Environment | Goals | Pains |
|---------|------|-------------|-------|-------|
| **Sarah Chen** | Fire Management Officer | Office + field; GIS tools | Fast burn severity briefings | 2-3 hrs in QGIS; no downstream connection |
| **Marcus Rodriguez** | Recreation Technician | Trails; paper TRACS forms | Accurate damage inventory | Manual transcription; no spatial link to burn |
| **Elena Vasquez** | Timber Cruiser | Timber stands; FScruiser | FSVeg-compliant cruise data | No NEPA awareness; isolated workflow |
| **Dr. James Park** | Environmental Coordinator | Office; FSM/FSH manuals | Compliant EA documentation | Manual cite-checking; no cross-domain view |

### Secondary Personas (Stakeholders)

| Audience | Concern | What They Need to See |
|----------|---------|----------------------|
| DC Leadership | Budget justification | ROI metrics, open-source cost model |
| Regional Directors | Operational efficiency | 24x faster decisions |
| IT/OCIO | FedRAMP, architecture | Technical credibility |
| Field Staff | Job security | "Augmentation, not replacement" |

### Persona-Product Alignment Assessment

**Strong Alignment:**
- ✅ Four-phase lifecycle (IMPACT→DAMAGE→TIMBER→COMPLIANCE) maps directly to persona workflows
- ✅ Agent names are role titles ("Burn Analyst" not "BurnAI") — feels like digital colleague
- ✅ Proof layer with citations addresses trust concerns
- ✅ Legacy exports (TRACS CSV, FSVeg XML) respect existing tool investments

**Gaps Identified:**
- ⚠️ **Dr. Park is invisible** in the onboarding tour (mentioned in closing but never introduced)
- ⚠️ **Persona inconsistency** in tour — Steps 2-3 have personas, Step 4 doesn't
- ⚠️ **Field Companion** not demonstrated in onboarding (desktop-only tour)

---

## 3. First-Impression & Narrative Review

### First 30 Seconds Assessment

**What a new user sees (Tour Step 1):**
- Dark tactical interface with 3D terrain map
- Sidebar showing 4 workflow phases (IMPACT highlighted with "START")
- Tour card: "Welcome to RANGER — The Nerve Center for Forest Recovery"
- Map showing Cedar Creek Fire with severity zones

**First Impression (as new user):**
> "This looks like a military command center for forests. Professional, serious, maybe intimidating. I can see there are four phases of something, but I'm not sure what I'm supposed to do first."

### Clarity Test Results

| Question | Answer Clarity | Issue |
|----------|---------------|-------|
| "Who is this for?" | Medium | Tour doesn't explicitly state target user (foresters, rangers) |
| "What does it do for me?" | Medium | "Orchestrates AI agents" — but what does that *mean* for my day? |
| "Why use this over current tools?" | Low | Value prop buried until Step 6-7; "siloed data" is jargon |

### Narrative Flow Assessment

**Current Arc:** Introduction → 4 agents → Synthesis → Closing

**Strength:** The "cascade" concept (Step 6) is compelling — agents building on each other.

**Weakness:** The cascade payoff comes too late. First 5 steps feel like "here's another AI tool" rather than "watch how they connect."

**Recommendation:** Lead with the cascade in Step 1:
> "Watch how a single burn finding cascades through trail assessment, timber analysis, and compliance review — automatically. RANGER connects what used to be four separate workflows."

---

## 4. Core Flow & UX Issues

### Flow 1: Onboarding Tour (7 Steps)

**Intended Outcome:** User understands RANGER's orchestration value in 3-5 minutes.

**Step-by-Step Issues:**

| Step | Issue | Severity | Heuristic Violated |
|------|-------|----------|-------------------|
| 1 | "3D terrain" mentioned but map appears flat (camera pitch) | Medium | Match system/real-world |
| 1 | "Siloed data" is internal jargon | Low | Speak user's language |
| 1 | Timber plots visible but unexplained (47-ALPHA markers) | Medium | Recognition over recall |
| 2 | "Burn Analyst" in card vs. "IMPACT ANALYST" in panel | **High** | Consistency |
| 2 | "dNBR data" unexplained | Low | Speak user's language |
| 3 | **Map shows no trail damage** — only 1 timber plot marker | **Critical** | Match system/real-world |
| 3 | Sidebar doesn't highlight DAMAGE workflow | Medium | Visibility of system status |
| 4 | No persona (inconsistent with Steps 2-3) | Low | Consistency |
| 5 | "Sensitive areas" mentioned but not visualized | Medium | Match system/real-world |
| 6 | Copy uses old agent names ("Burn Analyst" not "IMPACT ANALYST") | **High** | Consistency |
| 7 | Dr. Park referenced without introduction | Medium | Recognition over recall |
| 7 | Card obscures map controls | Medium | User control |
| 7 | "LOOK FOR" section truncated | Low | Visibility |

**Critical Blocker:** Step 3 promises trail damage visualization that doesn't exist on the map. This breaks trust — users will think the product doesn't work.

### Flow 2: Lifecycle Navigation (Sidebar)

**Intended Outcome:** User can switch between recovery phases and see connected insights.

**Issues:**
- Sidebar correctly shows 4 phases with appropriate icons
- "START" badge on IMPACT is good orientation
- **Gap:** During tour, sidebar doesn't sync with active step (DAMAGE should highlight in Step 3, etc.)
- **Gap:** No visual indication of cross-phase connections (the "cascade")

### Flow 3: Agent Briefing (Insight Panel)

**Intended Outcome:** User sees AI-generated insight with reasoning transparency.

**Strengths:**
- ✅ Clear agent name and icon
- ✅ Confidence score with color coding
- ✅ Expandable reasoning chain
- ✅ Suggested actions with clear CTAs

**Issues:**
- Panel uses standardized names ("IMPACT ANALYST") but tour uses legacy names ("Burn Analyst")
- No explanation of what confidence score means (82% of what?)

---

## 5. UI & Interaction Findings

### Visual Hierarchy

**Strengths:**
- Primary map dominates viewport (correct for geo-centric product)
- Sidebar rail provides clear phase navigation
- Glassmorphic panels don't obscure map content

**Issues:**
- Tour card competes with Insight Panel (both on right side)
- Final tour step (Step 7) card positioned at bottom, obscures controls

### Copy & Microcopy

**Strengths:**
- "LOOK FOR" callouts are excellent — direct attention without patronizing
- Agent subtitles are clear ("Salvage Operations Planning")

**Issues:**
- Technical jargon: "dNBR", "categorical exclusions", "correlation trace"
- Inconsistent agent naming creates cognitive load
- "Siloed data" is consultant-speak

### Design System Coherence

**Strengths:**
- Consistent "Tactical Futurism" aesthetic (dark mode, glassmorphism)
- Emergency management colors (safe/warning/severe) used correctly
- Monospace for data, sans-serif for labels

**Issues:**
- Badge colors inconsistent in tour (Step 3 Trail Assessor badge is gray, should be amber)
- Progress dots work but could be more visually prominent

### Accessibility Concerns

- Contrast appears WCAG AA compliant (dark backgrounds, bright text)
- Tour navigation has keyboard issues (no Escape to close, no arrow key nav)
- Some touch targets may be small on mobile (not applicable to desktop tour)

---

## 6. Product & Business Observations

### Core Value Proposition

**Current Framing:** "RANGER orchestrates AI agents to transform siloed data into coordinated intelligence."

**Clearer Alternative:** "RANGER connects your burn severity maps, trail damage reports, timber cruises, and NEPA reviews into one recovery plan — automatically."

### Primary Success Metrics

| Metric | Current State | Target | How UX Supports |
|--------|--------------|--------|-----------------|
| Time to briefing | 2-3 hours | 5 minutes | Single interface, AI synthesis |
| Cross-domain visibility | 0% (siloed) | 100% | Correlation traces, cascade viz |
| Legacy export accuracy | Manual | 100% automated | TRACS/FSVeg generation |
| Trust in AI outputs | Low | High | Proof layer, citations |

### Differentiation

**What feels unique:**
- Orchestration across 4 domains (competitors do 1)
- "Proof layer" with reasoning chains and citations
- Open source cost model ($6-9K/year vs. $100K+ competitors)
- "Digital colleague" framing (role titles, not product names)

**What feels generic:**
- Dark tactical UI (common in gov/mil products)
- Map-centric interface (every GIS tool does this)
- AI assistant chat (table stakes)

### Trust & Proof Elements

**Present:**
- Confidence scores on every briefing
- Expandable reasoning chains
- FSM/FSH citations with direct links
- "Human-in-the-loop" messaging in docs

**Missing from Onboarding:**
- No explicit "you make the decision" moment
- No demo of reviewing/overriding AI recommendation
- No social proof (pilot results, user quotes)

---

## 7. Prioritized Recommendations

### Tier 1: Must-Fix Now (Blocking Understanding)

| # | Problem | Source | Recommendation | Success Measure |
|---|---------|--------|----------------|-----------------|
| 1.1 | **Trail damage layer missing (Step 3)** | PDF + Analysis | Add trail damage GeoJSON to fixtures; render markers (red=bridge failure, yellow=hazard tree, amber=erosion). PDF notes: "only shows one yellow marker (31-DELTA) which appears to be a timber plot, not trail damage" | Map shows 5+ distinct trail damage markers in Step 3 |
| 1.2 | **Sidebar doesn't sync during tour** | PDF + Analysis | Update `lifecycleStore.activePhase` as tour progresses. PDF notes: "Damage workflow should pulse or highlight" in Step 3 | Sidebar highlights correct phase at each step |
| 1.3 | **Value prop buried until Step 6** | Analysis | Rewrite Step 1 copy: "Watch how a single burn finding cascades through trail assessment, timber analysis, and compliance review — automatically." PDF alternative: "RANGER orchestrates AI agents to turn complex data into clear recovery decisions" | User understands orchestration value in first 30 seconds |
| 1.4 | **Map-copy mismatch throughout** | PDF | Ensure every "LOOK FOR" item is actually visible on the map for that step. PDF notes multiple instances where described elements don't appear | 100% alignment between copy and map state |

### Tier 2: High-Leverage Improvements

| # | Problem | Source | Recommendation | Success Measure |
|---|---------|--------|----------------|-----------------|
| 2.1 | **Dr. Park introduced without context** | PDF | Add persona to Step 5: "Dr. James Park (Environmental Coordinator) navigates categorical exclusions..." | All 4 personas introduced before Step 7 callback |
| 2.2 | **Persona pattern inconsistent** | PDF | Add Elena Vasquez to Step 4 (Cruising Assistant). Pattern: Sarah (2), Marcus (3), Elena (4), Dr. Park (5) | Consistent persona presence in Steps 2-5 |
| 2.3 | **Jargon unexplained** | PDF + Analysis | Remove "dNBR data" or explain as "burn severity index from satellite imagery"; replace "siloed data" with "disconnected systems" | Zero unexplained technical terms |
| 2.4 | **Step 7 card position/truncation** | PDF | Reposition to top-right; ensure full "LOOK FOR" section visible. PDF: "Card is cut off... partially overlapping map controls" | Card fully visible, controls accessible |
| 2.5 | **Badge colors inconsistent** | PDF | Step 3 badge should be amber (DAMAGE theme), not gray. PDF: "Badge color - TRAIL ASSESSOR badge is gray/neutral" | Color-coded badges matching workflow themes |
| 2.6 | **Timber plots visible in wrong steps** | PDF | Hide timber plot markers (47-ALPHA, etc.) in Steps 1-3; show only in Steps 4-6. PDF: "could confuse viewers since we're talking about severity zones" | Layer visibility controlled per step |
| 2.7 | **3D terrain claim vs. flat appearance** | PDF | Either adjust camera pitch to 45° OR change copy from "3D terrain showing the mountainous landscape" to "Satellite imagery of the burn area" | Copy matches visual reality |

### Tier 3: Nice-to-Have / Future

| # | Problem | Source | Recommendation | Success Measure |
|---|---------|--------|----------------|-----------------|
| 3.1 | **No human-in-the-loop moment** | Analysis | Add Step 5.5: "Review & Approve" showing user validating AI recommendation before action | Users see explicit approval workflow |
| 3.2 | **No "cascade" visualization** | Analysis | Add animated connection lines between sidebar phases during Step 6 | Users visually see agent connections |
| 3.3 | **Keyboard navigation missing** | Analysis | Add Escape to close tour, arrow keys to navigate | Full keyboard accessibility |
| 3.4 | **Field Companion not shown** | Analysis | Add optional "Mobile Demo" showing Marcus capturing trail data | Full journey visibility |
| 3.5 | **47-BRAVO appears inconsistently** | PDF | Ensure plot markers are consistent across steps (PDF notes 47-BRAVO "appears for the first time" in Step 5) | Consistent data across all steps |
| 3.6 | **Missing CTA on final step** | PDF | Add clear "Finish Tour" or "Get Started" button. PDF: "final step should have a clear call-to-action" | Explicit tour completion action |

---

## 8. Implementation Plan

### Phase A: Tour Code Fixes (Tier 1)

| File | Changes | Priority |
|------|---------|----------|
| `apps/command-console/src/stores/demoTourStore.ts` | 1. Update step copy to lead with cascade value<br>2. Add `lifecyclePhase` property to each step<br>3. Add `visibleLayers` property to control map state per step | P0 |
| `apps/command-console/src/components/tour/DemoTourOverlay.tsx` | 1. On step change, call `lifecycleStore.setActivePhase(step.lifecyclePhase)`<br>2. On step change, update map layer visibility<br>3. Fix Step 7 card positioning | P0 |
| `data/fixtures/cedar-creek-geojson.json` OR `data/layers/trail-damage.geojson` | Add trail damage features:<br>- 2 bridge failures (type: bridge, severity: high)<br>- 3 hazard trees (type: tree, severity: medium)<br>- 2 erosion gullies (type: erosion, severity: low) | P0 |
| `apps/command-console/src/components/map/CedarCreekMap.tsx` | 1. Add trail damage layer with appropriate styling<br>2. Wire layer visibility to tour step state | P0 |

### Phase B: Tour Polish (Tier 2)

| File | Changes | Priority |
|------|---------|----------|
| `apps/command-console/src/stores/demoTourStore.ts` | 1. Add personas to Steps 4-5 (Elena, Dr. Park)<br>2. Remove jargon (dNBR, siloed data)<br>3. Update badge colors per workflow theme | P1 |
| `apps/command-console/src/components/tour/DemoTourOverlay.tsx` | 1. Implement per-step badge color logic<br>2. Ensure "LOOK FOR" section fully visible | P1 |
| `apps/command-console/src/stores/mapStore.ts` | Add `setVisibleLayers(layers: string[])` action for tour control | P1 |

### Phase C: Documentation Updates

| File | Changes | Priority |
|------|---------|----------|
| `docs/assets/USER-JOURNEYS-AND-PERSONAS.md` | 1. Add note about context-dependent naming convention<br>2. Verify persona details match tour copy<br>3. Add reference to onboarding tour alignment | P1 |
| `docs/implementation/DEMO-TOUR-WALKTHROUGH.md` | 1. Update all step definitions with corrected copy<br>2. Add layer visibility requirements per step<br>3. Add sidebar sync requirements<br>4. Document naming convention decision | P0 |
| `docs/brand/BRAND-ARCHITECTURE.md` | Add section on context-dependent naming:<br>- Sidebar: Phase names<br>- Panel: Role titles<br>- Tour: Friendly names | P1 |
| `CLAUDE.md` | Add note about naming convention in Code Style section | P2 |

### Phase D: Strategic Roadmap Items (Tier 3)

| Item | Description | Effort |
|------|-------------|--------|
| Human-in-the-loop step | Add Step 5.5 showing user approval workflow | Medium |
| Cascade visualization | Animated connections in Step 6 | High |
| Keyboard navigation | Escape/arrow key support | Low |
| Field Companion demo | Optional mobile walkthrough | High |
| Confidence tooltips | Explain what % means | Low |

---

## 9. Revised Tour Step Definitions

For reference, here's the corrected step structure with all issues addressed:

### Step 1: Welcome to RANGER
- **Title:** Welcome to RANGER
- **Subtitle:** The Nerve Center for Forest Recovery
- **Copy:** "Watch how a single burn finding cascades through trail assessment, timber analysis, and compliance review — automatically. This is the Cedar Creek Fire (2022) in Oregon's Willamette National Forest—127,000 acres of complex recovery decisions."
- **LOOK FOR:**
  - The fire perimeter (dashed white line)
  - Burn severity zones (red = high, yellow = moderate, green = low)
  - The lifecycle rail on the left showing four recovery phases
- **Map State:** Fire perimeter + severity zones visible; timber plots HIDDEN
- **Sidebar:** IMPACT highlighted with "START" badge
- **Camera:** Pitch 0° (flat) OR update copy to not mention 3D terrain

### Step 2: Burn Analyst (IMPACT)
- **Title:** Burn Analyst
- **Subtitle:** Burn Severity Classification
- **Persona:** Sarah Chen (Fire Management Officer)
- **Copy:** "The Burn Analyst processes satellite imagery to classify burn severity. Sarah Chen (Fire Management Officer) needs this before any recovery planning can begin."
- **LOOK FOR:**
  - High severity zones concentrated in the northwest sector
  - Moderate severity creating a buffer around the core
  - Low severity areas that may recover naturally
- **Map State:** Severity zones visible; timber plots HIDDEN
- **Sidebar:** IMPACT active (cyan highlight)
- **Badge Color:** Red (#EF4444)

### Step 3: Trail Assessor (DAMAGE)
- **Title:** Trail Assessor
- **Subtitle:** Infrastructure Damage Analysis
- **Persona:** Marcus Rodriguez (Recreation Technician)
- **Copy:** "The Trail Assessor evaluates damage to trails and recreational infrastructure. Marcus Rodriguez (Recreation Technician) uses this to prioritize crew deployments."
- **LOOK FOR:**
  - Trail damage points sized by severity
  - Bridge failures (red) requiring immediate attention
  - Hazard trees (yellow) along popular trails
- **Map State:** Severity zones + TRAIL DAMAGE LAYER visible; timber plots HIDDEN
- **Sidebar:** DAMAGE active (amber pulse)
- **Badge Color:** Amber (#F59E0B)

### Step 4: Cruising Assistant (TIMBER)
- **Title:** Cruising Assistant
- **Subtitle:** Salvage Operations Planning
- **Persona:** Elena Vasquez (Timber Cruiser)
- **Copy:** "The Cruising Assistant analyzes timber stands for salvage potential. Elena Vasquez (Timber Cruiser) identifies priority plots based on species composition, burn severity, and market conditions."
- **LOOK FOR:**
  - Timber plot markers colored by priority
  - High-value plots in the eastern corridor
  - Plot IDs for field reference
- **Map State:** Severity zones + timber plots visible; trail damage HIDDEN
- **Sidebar:** TIMBER active (green highlight)
- **Badge Color:** Green (#10B981)

### Step 5: NEPA Advisor (COMPLIANCE)
- **Title:** NEPA Advisor
- **Subtitle:** Regulatory Navigation
- **Persona:** Dr. James Park (Environmental Coordinator)
- **Copy:** "The NEPA Advisor helps Dr. James Park (Environmental Coordinator) navigate categorical exclusions and streamlined pathways. Real citations from current regulations."
- **LOOK FOR:**
  - How burn severity informs NEPA pathways
  - Overlap between timber plots and sensitive areas
  - The integrated view of all data layers
- **Map State:** ALL layers visible (synthesis view)
- **Sidebar:** COMPLIANCE active (purple highlight)
- **Badge Color:** Purple (#8B5CF6)

### Step 6: The Recovery Cascade
- **Title:** The Recovery Cascade
- **Subtitle:** Connected Intelligence
- **Copy:** "This is RANGER's secret: agents don't work in isolation. The Burn Analyst's severity map informs the Trail Assessor's priorities. The Cruising Assistant considers NEPA constraints. Every insight feeds forward."
- **LOOK FOR:**
  - All layers visible simultaneously
  - How high-severity zones correlate with trail damage
  - Timber plots positioned in accessible, high-value areas
- **Map State:** ALL layers visible
- **Sidebar:** All 4 phases shown as connected (optional: cascade animation)
- **Badge Color:** Cyan (#06B6D4) — Recovery Coordinator

### Step 7: Recovery at the Speed of Insight
- **Title:** Recovery at the Speed of Insight
- **Subtitle:** From Data to Decision in Minutes
- **Copy:** "What once took weeks of manual coordination now happens in minutes. RANGER doesn't replace foresters—it amplifies them. Sarah, Marcus, Elena, and Dr. Park each get exactly what they need, when they need it."
- **LOOK FOR:**
  - The complete picture of Cedar Creek recovery
  - Four workflows, one coordinated plan
- **Map State:** ALL layers visible
- **Card Position:** Top-right (not bottom-center)
- **CTA:** "Finish Tour" button clearly visible

---

## 10. Summary

RANGER is a **well-architected product** solving a real problem: fragmented, slow forest recovery operations. The documentation shows sophisticated thinking about personas, messaging, and technical architecture.

**The onboarding tour is 80% there** — it has good narrative bones, strong visual design, and the right conceptual structure. But execution gaps (naming inconsistency, missing data layers, sidebar sync) create friction that undermines the core "orchestration" message.

### Key Findings (PDF + Analysis Merged)

| Category | PDF Observation | My Analysis | Agreement |
|----------|-----------------|-------------|-----------|
| Trail damage layer | "Map shows only 1 marker... not trail damage" | Critical blocker — breaks trust | ✅ Aligned |
| Naming inconsistency | "Card says X but sidebar says Y" throughout | Context-dependent naming is valid; document it | ⚠️ Partial |
| Sidebar sync | "Damage workflow should pulse or highlight" | Technical gap in store coordination | ✅ Aligned |
| Jargon | "dNBR won't mean anything to most viewers" | Replace with plain language | ✅ Aligned |
| Persona consistency | Steps 2-3 have personas, Step 4 doesn't | Add Elena (4) and Dr. Park (5) | ✅ Aligned |
| Value prop timing | (not noted in PDF) | Cascade story buried until Step 6 | 🆕 New finding |
| Human-in-the-loop | (not noted in PDF) | Missing approval moment | 🆕 New finding |

### Execution Order

1. **Week 1:** Tier 1 fixes (trail damage layer, sidebar sync, value prop copy)
2. **Week 2:** Tier 2 polish (personas, jargon, badge colors, card positioning)
3. **Week 3:** Documentation updates (all docs aligned with implementation)
4. **Backlog:** Tier 3 roadmap items (cascade viz, keyboard nav, Field Companion demo)

### Core Insight

> The product's value is **coordination**, not individual agent capability. The tour should make users feel like they're watching a relay race where each runner hands off to the next — not four separate sprints.

---

## Appendix: Files Reference

### Code Files
- `apps/command-console/src/stores/demoTourStore.ts` — Tour step definitions
- `apps/command-console/src/stores/lifecycleStore.ts` — Phase state management
- `apps/command-console/src/stores/mapStore.ts` — Map layer visibility
- `apps/command-console/src/components/tour/DemoTourOverlay.tsx` — Tour UI
- `apps/command-console/src/components/map/CedarCreekMap.tsx` — Map rendering
- `apps/command-console/src/components/layout/Sidebar.tsx` — Lifecycle rail
- `apps/command-console/src/components/panels/InsightPanel.tsx` — Agent briefings

### Data Files
- `data/fixtures/cedar-creek-geojson.json` — GeoJSON features
- `data/layers/` — Layer-specific GeoJSON files

### Documentation Files
- `docs/assets/USER-JOURNEYS-AND-PERSONAS.md` — Persona definitions
- `docs/implementation/DEMO-TOUR-WALKTHROUGH.md` — Tour spec
- `docs/brand/BRAND-ARCHITECTURE.md` — Naming conventions
- `docs/brand/STAKEHOLDER-MESSAGING.md` — Audience messaging
- `docs/architecture/UX-VISION.md` — Design philosophy
- `docs/architecture/BRIEFING-UX-SPEC.md` — Agent briefing UI spec

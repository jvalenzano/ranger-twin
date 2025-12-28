# RANGER Validation Harness & Domain Learning Guide

> **Purpose:** Systematic testing of deployed RANGER system with embedded domain education.
> **Target:** Both human manual testing and AI-assisted automated validation.
> **URL:** https://ranger-console-1058891520442.us-central1.run.app

---

## Quick Start

**Demo Credentials:**
- Username: `ranger`
- Password: `CedarCreek2025!`

---

## Part 1: System Architecture Overview

### The Two Views

| View | Purpose | URL Path |
|------|---------|----------|
| **Mission Control** (National) | Portfolio triage - manage 30-50 fires | `/` (default) |
| **Tactical View** | Single-fire deep dive with agents | Click any fire card |

### The 5-Agent Model

```
Recovery Coordinator (Brain)
├── Burn Analyst      → Fire severity assessment
├── Trail Assessor    → Infrastructure damage
├── Cruising Assistant → Timber salvage value
└── NEPA Advisor      → Regulatory compliance
```

---

## Part 2: Domain Glossary (Learn the Language)

### Fire Recovery Terms

| Term | Definition | RANGER Context |
|------|------------|----------------|
| **BAER** | Burned Area Emergency Response | 7-day post-containment assessment phase |
| **MTBS** | Monitoring Trends in Burn Severity | Satellite-based severity classification |
| **dNBR** | differenced Normalized Burn Ratio | Metric for burn severity (0.1=low, 0.7+=high) |
| **Salvage** | Post-fire timber harvest | Time-sensitive (18-month window) |
| **CE** | Categorical Exclusion | NEPA fast-track pathway |
| **EA** | Environmental Assessment | Standard NEPA analysis |

### Trail Assessment Terms

| Term | Definition | RANGER Context |
|------|------------|----------------|
| **TRACS** | Trail Assessment and Condition Survey | Federal trail inventory system |
| **Hazard Tree** | Fire-killed tree near trails/roads | Safety priority for removal |
| **Puncheon** | Wooden walkway over wet areas | Common damage type in fires |
| **Class 3 Trail** | Developed hiking trail | Most common in wilderness |

### Timber/Forestry Terms

| Term | Definition | RANGER Context |
|------|------------|----------------|
| **MBF** | Thousand Board Feet | Standard volume measurement |
| **BAF** | Basal Area Factor | Cruise sampling method |
| **FSVeg** | Field Sampled Vegetation | USFS timber database |
| **Blue Stain** | Fungal degradation in dead timber | Drives salvage urgency |
| **Douglas-fir** | Primary commercial species (PNW) | Highest value timber |

### NEPA/Regulatory Terms

| Term | Definition | RANGER Context |
|------|------------|----------------|
| **FSM** | Forest Service Manual | Policy directives |
| **FSH** | Forest Service Handbook | Procedures/standards |
| **36 CFR 220** | NEPA implementing regulations | Legal authority for CE/EA |
| **Spotted Owl** | ESA-listed species | Major salvage constraint |

---

## Part 3: Test Scenarios

### Scenario 1: Mission Control Portfolio Review

**Persona:** Forest Supervisor Maria, 8 minutes before 6:40 AM briefing

**Test Steps:**
1. [ ] Navigate to deployed URL
2. [ ] Authenticate with demo credentials
3. [ ] **Verify:** Mission Control view loads with fire cards
4. [ ] **Check:** Map markers appear at fire locations
5. [ ] **Observe:** Triage scores visible on cards
6. [ ] **Action:** Hover over triage score → should show breakdown
7. [ ] **Action:** Click phase filter chips (In BAER, In Recovery, etc.)
8. [ ] **Verify:** "Showing X of Y fires" indicator updates

**Domain Learning:** The triage score combines severity × size × phase. Maria needs to identify which 3-5 fires "need my attention in the next 72 hours."

**Expected Behavior:**
- Cards show fire name, acres, severity badge
- Map markers match card severity colors
- Filter chips affect both map and card list

---

### Scenario 2: Tactical View Entry (Fire Drill-Down)

**Test Steps:**
1. [ ] From Mission Control, click "Enter →" on Cedar Creek card
2. [ ] **Observe:** Swoop animation to tactical view
3. [ ] **Verify:** Map zooms to fire perimeter
4. [ ] **Verify:** Sidebar shows lifecycle phases
5. [ ] **Verify:** Header shows fire name and stats
6. [ ] **Check:** Chat FAB visible (bottom right or minimized)

**Domain Learning:** The tactical view is where specialists live. Each lifecycle phase (IMPACT → ASSESSMENT → PLANNING → RECOVERY) represents where the fire is in its recovery journey.

---

### Scenario 3: Chat Interface - Basic Query

**Test Steps:**
1. [ ] In Tactical View, open chat (click FAB or header icon)
2. [ ] Type: "What is the burn severity for Cedar Creek?"
3. [ ] **Observe:** Loading indicator appears
4. [ ] **Verify:** Response arrives from backend (not mock)
5. [ ] **Check:** Response mentions severity percentages
6. [ ] **Verify:** Token usage displayed (if enabled)

**Domain Learning:** Burn severity is classified as Low/Moderate/High/Very High based on dNBR satellite analysis. Cedar Creek has ~64% high severity.

**Expected Response Elements:**
- Mentions 127,341 acres
- Breaks down severity by percentage
- May cite MTBS as data source

---

### Scenario 4: Cross-Agent Cascade Demo

**Test Steps:**
1. [ ] Open chat in Tactical View
2. [ ] Type: "Give me a full recovery briefing for Cedar Creek"
3. [ ] **Observe:** Multi-agent response
4. [ ] **Verify:** Burn Analyst content appears
5. [ ] **Verify:** Trail Assessor content follows
6. [ ] **Verify:** Cruising Assistant content follows
7. [ ] **Verify:** NEPA Advisor content follows
8. [ ] **Verify:** Recovery Coordinator synthesis at end

**Domain Learning:** This demonstrates the "cascade" - each agent's output triggers the next. Burn severity → affects trail damage → affects salvage access → affects NEPA pathway.

**Key Numbers to Validate:**
- 81,041 acres high severity
- $447K trail repairs needed
- $13.9M salvage timber value
- 27:1 ROI on bridge repair

---

### Scenario 5: Map Feature Interaction

**Test Steps:**
1. [ ] In Tactical View, click a burn severity polygon
2. [ ] **Verify:** Popup appears with sector info
3. [ ] **Check:** Severity badge shown (color-coded)
4. [ ] Click a trail damage point marker
5. [ ] **Verify:** Popup shows damage details
6. [ ] **Check:** Quick query chips appear
7. [ ] Click "NFS Database" chip
8. [ ] **Verify:** Query auto-populates in chat

**Domain Learning:** The quick query chips are domain-specific templates. "NFS Database" queries the National Forest System trail records.

---

### Scenario 6: Proof Layer Transparency

**Test Steps:**
1. [ ] Trigger any agent response via chat
2. [ ] **Locate:** InsightCard in right panel
3. [ ] **Check:** Confidence indicator (0-100%)
4. [ ] **Action:** Expand "Show Reasoning" accordion
5. [ ] **Verify:** Step-by-step reasoning chain visible
6. [ ] **Check:** Citations present (MTBS, FSM, etc.)
7. [ ] **Verify:** Citation links are clickable

**Domain Learning:** The Proof Layer is RANGER's "show your work" feature. Every AI insight must have visible reasoning and citations. This builds trust with federal users.

**Confidence Tiers:**
- 90-100%: Green (high confidence)
- 60-89%: Amber (medium confidence)  
- <60%: Red (low confidence, needs human review)

---

### Scenario 7: Site Analysis Feature

**Test Steps:**
1. [ ] In Tactical View, click on a specific feature (trail point)
2. [ ] **Verify:** Analysis panel appears
3. [ ] **Check:** Feature properties displayed
4. [ ] Select multiple quick query chips
5. [ ] **Action:** Click "Analyze" or similar CTA
6. [ ] **Verify:** Combined query sent to chat
7. [ ] **Observe:** Response addresses all selected queries

**Domain Learning:** Site Analysis allows point-based queries against multiple federal databases. Trail analysis might check TRACS history, wilderness boundaries, and hazard tree density.

---

### Scenario 8: Navigation & State Persistence

**Test Steps:**
1. [ ] Navigate to Tactical View for Cedar Creek
2. [ ] Send a chat message
3. [ ] **Action:** Return to Mission Control (breadcrumb or back)
4. [ ] **Check:** Mission Control view loads correctly
5. [ ] **Action:** Re-enter Cedar Creek tactical view
6. [ ] **Verify:** Previous chat context preserved (or reset)

**Domain Learning:** State management is critical for the "8-minute reality" - supervisors switch between portfolio and tactical views constantly.

---

## Part 4: Error Scenarios

### E1: Backend Unavailable

**Test:** Disconnect backend or use invalid URL
**Expected:** 
- Graceful error message
- No silent failures
- Retry option visible

### E2: Slow Response

**Test:** Observe behavior with >5s response time
**Expected:**
- Loading indicator persists
- No timeout errors (within reason)
- User can cancel/retry

### E3: Invalid Query

**Test:** Send gibberish or empty query
**Expected:**
- Appropriate error message
- No crash
- Chat remains usable

---

## Part 5: Automation Hooks

### Claude Code Browser Testing

For automated validation using Claude Code's browser capabilities:

```bash
# Launch Claude Code with browser tools
cd /Users/jvalenzano/Projects/ranger-twin
claude

# Prompt template for automated testing:
"""
Navigate to https://ranger-console-1058891520442.us-central1.run.app
Authenticate with username 'ranger' and password 'CedarCreek2025!'

Execute the following test sequence:
1. Verify Mission Control view loads with fire cards
2. Click "Enter" on any fire card and verify tactical view loads
3. Open chat and send: "What is the burn severity for Cedar Creek?"
4. Verify response contains severity percentages
5. Screenshot final state

Report pass/fail for each step.
"""
```

### Puppeteer/Playwright Scripts

For CI/CD integration:

```javascript
// tests/e2e/mission-control.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://ranger-console-1058891520442.us-central1.run.app';
const AUTH = { username: 'ranger', password: 'CedarCreek2025!' };

test('Mission Control loads with fire cards', async ({ page }) => {
  await page.goto(BASE_URL);
  // Handle Basic Auth
  await page.setExtraHTTPHeaders({
    'Authorization': `Basic ${Buffer.from(`${AUTH.username}:${AUTH.password}`).toString('base64')}`
  });
  
  await page.goto(BASE_URL);
  await expect(page.locator('[data-testid="fire-card"]')).toBeVisible();
});
```

---

## Part 6: Validation Checklist

### Critical Path (Must Pass)

- [ ] **AUTH:** Basic auth works with demo credentials
- [ ] **MAP:** MapLibre loads with correct tiles
- [ ] **DATA:** Fire cards show in Mission Control
- [ ] **NAV:** Mission Control ↔ Tactical transitions work
- [ ] **CHAT:** Chat sends queries and receives responses
- [ ] **PROOF:** Reasoning chains visible in insight cards

### Nice to Have

- [ ] **PERF:** Initial load < 3 seconds
- [ ] **ANIM:** Swoop animation smooth (60fps)
- [ ] **RESPONSIVE:** Works on tablet (1024px width)
- [ ] **OFFLINE:** Graceful degradation without backend

---

## Part 7: Learning Resources

### Federal Systems Referenced

| System | URL | Description |
|--------|-----|-------------|
| NIFC | https://data-nifc.opendata.arcgis.com/ | National fire data |
| MTBS | https://mtbs.gov | Burn severity maps |
| FIRMS | https://firms.modaps.eosdis.nasa.gov/ | Active fire hotspots |
| ePlanning | https://www.fs.usda.gov/emc/nepa/eplanning/ | NEPA project tracking |

### Key Regulations

| Reg | Topic | RANGER Agent |
|-----|-------|--------------|
| FSM 2520 | Emergency Situations | NEPA Advisor |
| 36 CFR 220.6 | Categorical Exclusions | NEPA Advisor |
| FSH 2309.18 | Trail Standards | Trail Assessor |
| FSH 2409.12 | Common Stand Exam | Cruising Assistant |

### Product Documentation

| Doc | Path | Purpose |
|-----|------|---------|
| Product Summary | `docs/_!_PRODUCT-SUMMARY.md` | Business context |
| ADR-005 | `docs/adr/ADR-005-skills-first-architecture.md` | Architecture decisions |
| Proof Layer | `docs/specs/PROOF-LAYER-DESIGN.md` | Transparency requirements |

---

## Appendix: Cedar Creek Fire Context

### Real Fire Data

- **Name:** Cedar Creek Fire
- **Year:** 2022
- **Location:** Willamette National Forest, Oregon
- **Size:** 127,341 acres
- **Status:** In recovery (3+ years post-fire)

### Simulated Data Boundaries

Per `DATA-SIMULATION-STRATEGY.md`:
- Fire perimeter is **real** (from NIFC)
- Burn severity zones are **realistic** (derived from actual MTBS)
- Trail damage is **simulated** (realistic patterns, not actual surveys)
- Timber values are **simulated** (based on R6 standard rates)
- NEPA pathways are **accurate** (real regulations, hypothetical application)

---

**Last Updated:** December 27, 2025
**Next Review:** After stakeholder demo feedback

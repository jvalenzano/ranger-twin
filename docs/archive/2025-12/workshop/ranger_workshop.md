# PROJECT RANGER: Expert Design Workshop Simulation
## Full 3-Way Discourse & "Art-Ideal Interface" Synthesis

**Facilitated Workshop** | December 20, 2025 | USDA Forest Service Innovation Lab

---

## EXECUTIVE SUMMARY

This document captures a simulated expert panel discourse between three groups designing the RANGER Command Console for post-fire recovery operations at Cedar Creek (15,300 acres, Oregon FR6, 2022 burn event).

**The Three Groups:**
- **Group A (Ground Truth):** District Ranger, foresters, executives—operational reality, field utility, NEPA compliance
- **Group B (Architects):** Data engineers, imagery experts—data provenance, latency, system integration feasibility  
- **Group C (Intelligence):** PhD AI engineers, Vertex AI experts—multi-agent orchestration, reasoning transparency, predictive systems

**The Four Phases:**
1. **Domain Friction** - Reality of Cedar Creek recovery vs. AI interventions vs. data gaps
2. **Feasibility Floor** - What's real data vs. synthetic, Phase 1 Pilot scope
3. **Intelligence Ceiling** - How agents collaborate, confidence propagation, the "Golden Thread"
4. **Interface Synthesis** - The "Art-Ideal Interface" specification

---

## PHASE 1: DOMAIN FRICTION

### Group A (Ground Truth): District Ranger Sarah Chen

"Cedar Creek burned 15,300 acres in 2022. It's now 2025—three years in, mid-reforestation. Here's what keeps me up:

**1. Tactical Reality** - Every morning my crew of 12 foresters needs to know:
   - Which 200 acres today have hazard trees? (Safety first—widow-makers kill people)
   - Is erosion forecast changing? (Heavy rain = mudslide risk = closure decisions)
   - Where are replanting crews? Daily progress? (15,300 acres at 40 acres/week = 7 years)
   - Are invasive species spreading? (Cheatgrass is a second fire risk)

**2. The Black Box Problem** - I got a briefing last month with 40 maps and a neural network heatmap. Beautiful. But I asked: 'Why this pixel red and that one yellow?' Nobody could tell me. I need reasoning transparency—not magic.

**3. NEPA Compliance Nightmare** - Every decision is a memo. 'We selected Ponderosa over Douglas Fir because... soil moisture? Elevation? Burn severity?' The law requires documented decision chains. A dashboard with colors doesn't cut it.

**4. Executive Briefing Reality** - My Regional Forester needs a 2-minute answer: 'Cedar Creek recovery is on/off track.' Not 47 slides. Not a 'nervous system.' A status thread I can brief Congress with.

**5. Data Fatigue** - We have 14 different systems. FACTS database, Sentinel-2 imagery, LiDAR from 2023 survey, field crew GPS data. They don't talk. I'm the integration—copy-pasting into Excel at 3am."

### Group C (Intelligence): PhD Researcher Dr. James Wu

"Sarah, that's exactly where agents solve the problem. You're describing the 'last-mile integration' challenge.

Instead of 'dashboard of data,' think **Collaborative Reasoning System**—four specialized agents:

**FireSight Agent** - Thermal/burn-severity expert
- Consumes: Sentinel-2 pre/post-fire, drone LiDAR, burn probability models
- Outputs: Dynamic burn severity map with reasoning
- Reasoning example: 'This pixel shows moderate burn. Why? Low vegetation density + high soil moisture + northern exposure = lower fire intensity. Risk: erosion if rainfall >2 inches.'

**TrailScan Agent** - Hazard/safety detection specialist
- Consumes: Drone imagery, LiDAR 3D point clouds, crew location data
- Outputs: Real-time hazard tree catalog with safety zones
- Reasoning example: 'Dead ponderosa at grid 42-N, 50ft tall, leans southeast. If falls: impacts campground road. Hazard level: CRITICAL.'

**TimberScribe Agent** - Reforestation & ecological specialist
- Consumes: Soil surveys, elevation, aspect, historical forest composition, climate projections
- Outputs: Species-to-location mapping with planting recommendations
- Reasoning example: 'This 40-acre block at 4,200ft: post-fire succession shows 60% Ponderosa, 30% Douglas Fir, 10% Incense Cedar. Our recommendation: 70/25/5 mix. Why? Climate modeling shows +2°C by 2050—Ponderosa heat-tolerance.'

**PolicyPilot Agent** - NEPA & compliance orchestrator
- Consumes: All prior agent outputs, NEPA template library, regulatory thresholds
- Outputs: Decision memos with full reasoning chains
- Reasoning example: 'Reforestation decision approved. Authority: 25 USC 580. Rationale: FireSight + TimberScribe consensus. Evidence: LiDAR 2.3M points, Sentinel 36 months, soil samples 148. Chain: data → analysis → recommendation → decision → memo.'

The magic: These agents run in a **Coordinator Pattern**—a master orchestration agent listens to Sarah's intent, decomposes it, dispatches to the right agents, and synthesizes responses. Sarah sees *the Golden Thread*: a coherent narrative with reasoning visible at every step."

### Group B (Architects): Data Engineer Marcus Thompson

"James, I appreciate the vision. But here's where the silos bite:

**1. Data Provenance Nightmare:**
   - Sentinel-2 imagery: Free, 5-day revisit. But post-processing adds 8-12 days latency
   - Drone LiDAR: We have fragmented surveys. 2023 full-scene was $180K (40% coverage). 2024 only monitoring points ($120K)
   - Crew GPS: Field crews use ArcCollector on tablets. Data syncs when they hit cell towers (twice a day, if lucky)
   - Soil/ecology data: FIA plots are 5-year cycles. Not real-time.

**Question for James:** When TrailScan runs, which version of 'truth' does it use? Yesterday's LiDAR? Last month's? How stale can data be before the recommendation is dangerous?

**2. The Fake Data Problem:**
   - We could simulate full-coverage LiDAR using Sentinel-2 + interpolation. Fast, cheap. But is that 'real structure' or theater?
   - We could train on FIA plots and extrapolate species composition. But FIA is sparse—we'd be filling 80% gaps with inference.
   - For Phase 1 Pilot (6 months), what's the acceptable error rate?

**3. Legacy System Integration:**
   - FACTS database: 30-year-old system, all project history, no REST APIs. We need custom ETL
   - NWCG Incident Information System (ICS): Real-time fire data. Updates every 6 hours
   - Google Cloud hasn't built connectors for half of these

**4. The Architect's Friction Point:**
   Sarah, you said crews have 14 systems. We're about to add Agent APIs on top. Is that system #15? Or do we replace and migrate? Migration is a 2-year effort."

---

## PHASE 2: THE FEASIBILITY FLOOR

### Marcus's Proposal: Data Tiering

"Here's my proposal for Phase 1. Not perfect. But **feasible in 6 months** with $400K and a 3-person team.

**Data Tier 1 - High Confidence (90%+ truth):**
- Sentinel-2 pre-post imagery: Real data, full coverage, 5-day revisit
- Crew GPS telemetry: Real (from ArcCollector)
- Weather station network: Real (RAWS + NOAA feeds)
- Hazard tree submissions: Real crowdsourced from crews

**Data Tier 2 - Medium Confidence (70-85% estimated):**
- LiDAR point clouds: 2023 drone survey (40% coverage) + Sentinel-2 canopy height inference for unmapped areas
- Soil characteristics: FIA + elevation-based interpolation
- Species composition: FIA plots + forest type mapping algorithms

**Data Tier 3 - Low Confidence (synthetic, demo only):**
- Complete 3D tree inventory: Simulated using ML model + extrapolated
- Long-term climate projections: Existing MACA dataset (coarse-resolution)

**James, key question:** Can your agents work in a **heterogeneous confidence environment**? Where FireSight has 95% confidence on Sentinel burn maps, but TrailScan has 65% confidence on unmapped LiDAR, and they need to decide 'is this slope safe for crew?'

The system needs to either:
- A) Confidence-weight outputs ('This recommendation is high-confidence; this is speculative')
- B) Flag data gaps ('I need 2023 LiDAR for grid 42-N before I can commit')
- C) Degrade gracefully ('I'll recommend a crew staging area, but only with Sarah's approval until better hazard data arrives')"

### James's Response: Confidence Ledger Pattern

"Excellent framing, Marcus. The Coordinator pattern handles this.

Each specialized agent includes a **Confidence Ledger**:

**Example - TrailScan Reasoning:**
```
INPUT: 
  - LiDAR point cloud: 95% confidence (actual 2023 survey)
  - GPS crew location: 87% confidence (last sync 4 hours ago)
  - Extrapolated canopy height (unmapped area): 58% confidence (ML-inferred)

ANALYSIS:
  - Identified hazard trees in surveyed area: 23 candidates
  - Identified hazard trees in extrapolated area: 47 candidates
  
CONFIDENCE-WEIGHTED OUTPUT:
  - HIGH (95%): 23 hazard trees in surveyed zones. Recommend crew avoidance.
  - MEDIUM (58%): 47 additional trees in extrapolated zones. Recommend visual confirmation before entry.
  - RECOMMENDATION: Deploy 3 crews to HIGH zones. Delay 2 crews pending updated LiDAR of MEDIUM zones.
```

Sarah can see this breakdown. Not magic. Not 'AI said do this.' But 'Here's what we know, here's what we're inferring, here's what you decide.'

**For Phase 1, I propose:**
1. **Tier 1 (90%+):** All agents use directly, no hedging
2. **Tier 2 (70-85%):** Agents flag when using. Output is 'recommended with caution—human decision pending'
3. **Tier 3 (synthetic):** Agents show examples only. 'Here's how the system would work with full data'

**Budget implication:** I need $180K for Vertex AI infrastructure, model tuning, orchestration logic. Your data integration: $220K?"

### Sarah's Perspective

"I can work with that. The confidence ledger is key. My crew chiefs are not dumb. If I say 'This is 95% certain; this is speculative,' they understand risk. What kills me is *false certainty*—a color on a map that looks absolute but is guessed.

**One more architecture decision: Latency.**

Real-time vs. daily batch?
- **Real-time:** Agents run continuously. Cost: ~$2K/month. Complexity: high
- **Daily batch:** Agents run at 6am, output by 7am. Cost: ~$400/month. Latency: acceptable for most decisions

What's your timeline? Do crews need real-time hazard updates, or is 'daily briefing + ad-hoc if fire conditions change' okay?"

**James:** "Daily 6am briefing works for long-term strategy (reforestation, erosion management). But hazard trees? Weather alerts? Those are real-time when crews are in the field. Compromise: **Daily baseline + event-driven updates.** If wind forecast changes or a hazard report comes in, agents re-run.

That's Vertex AI event-driven architecture. $800/month on top of the $2K baseline for background compute."

---

## PHASE 3: THE INTELLIGENCE CEILING

### How Agents Collaborate: The 6-Minute Briefing

"Imagine it's Wednesday, 6:15am. Sarah's system wakes up. Here's what happens in the next 3 minutes:

**[6:15:03am] COORDINATOR AGENT ACTIVATES**
- Checks: Last 24-hour data intake (Sentinel, crew GPS, weather, hazard reports)
- Task decomposition: 'Where are high-priority hazard zones + reforestation progress + NEPA memo for week's decisions?'
- Dispatches: FireSight, TrailScan, TimberScribe, PolicyPilot

**[6:15:30am] FIRESIGHT AGENT RUNS (Parallel Execution)**

```
Input: Sentinel-2 false-color + LiDAR elevation + burn severity classification model

Process:
  1. Calculated Normalized Burn Ratio (NBR) across 15,300 acres
  2. Detected high-severity zones (NBR > 0.45): 2,847 acres
  3. Detected moderate zones (0.25 < NBR < 0.45): 4,156 acres
  4. Detected low/recovering zones (NBR < 0.25): 8,297 acres

Reasoning (Chain-of-Thought visible):
  "Moderate-burn areas show 18% vegetative recovery since last month. 
   Photosynthetic recovery in north-facing slopes slower (shade, moisture differences). 
   Risk assessment: High-severity zones still vulnerable to erosion if rainfall >1.5". 
   We recommend priority erosion mitigation in 847-acre subset (steeper slopes, proximity to creeks)."

Output:
  - Burn severity raster map (updated)
  - Priority erosion zones: 847 acres (confidence: 82%)
  - Reasoning chain (visible to humans)
```

**[6:15:45am] TRAILSCAN AGENT RUNS (Parallel Execution)**

```
Input: LiDAR point clouds (2023 survey + latest drone mission from Monday) 
       + Crew GPS (current locations) 
       + Historical hazard logs

Process:
  1. 3D point cloud analysis: Identified 156 trees with structural instability markers
     (Lean angle >15°, crown damage, root exposure, height/diameter ratio concerning)
  2. Cross-referenced with crew locations: 12 teams currently deployed in high-hazard zones
  3. Classified hazard levels:
     - CRITICAL (immediate tree fall risk): 23 trees (recommend crew extraction)
     - HIGH (within 48hrs if wind >20mph): 67 trees (recommend monitoring)
     - MODERATE (monitor over weeks): 66 trees (no action needed today)

Reasoning (Chain-of-Thought):
  "Dead ponderosa pine at grid coordinate 42.0147°N, 121.3845°W, 48ft height, 18° lean to SE. 
   Crew staging area (Lunch Meadow) is 200ft downslope. 
   Risk calculation: If falls, 85% probability strikes staging area. 
   Wind forecast: 15mph today (safe). Tomorrow: 25mph (CRITICAL). 
   Recommendation: Relocate Lunch Meadow crew to Grid 45, OR deploy hazard tree removal team to fell it safely before tomorrow."

Output:
  - Hazard tree catalog (updated): 156 trees with 3D coordinates, risk levels, crew proximity
  - Crew safety recommendations: Re-position 2 teams, deploy hazard removal for 1 critical tree
  - Confidence: 87% (based on updated LiDAR) vs 65% (extrapolated zones)
  - Reasoning chain (human-readable)
```

**[6:16:00am] TIMBERSCRIBE AGENT RUNS (Parallel Execution)**

```
Input: 
  - Burn severity from FireSight (just received)
  - Soil survey data (FIA plots + interpolated)
  - Elevation + aspect + climate projections
  - Historical planting success database
  - Current nursery inventory (1.2M seedlings, species mix available)

Process:
  1. Segmented Cedar Creek into 127 management zones
  2. For each zone, calculated optimal species mix:
     - Low-elevation south-facing (4,000-5,200ft): 65% Ponderosa, 25% Incense Cedar, 10% California Black Oak
     - High-elevation north-facing (5,200-6,400ft): 50% Douglas Fir, 40% White Fir, 10% Sugar Pine
     - Riparian zones: 85% Native Hardwoods, 15% Conifers
  3. Cross-referenced with nursery inventory: Shortfall of 95K seedlings
  4. Re-optimized: 'Use 70% Ponderosa (850K available), 20% Incense Cedar (280K available), 10% Black Oak (120K available)'

Reasoning (Chain-of-Thought):
  "Moderate-burn zone GT-47 (287 acres, 4,400ft elevation, south-facing): 
   Historical planting data shows Ponderosa + Incense Cedar mix succeeds 89% survival rate after 3 years. 
   Douglas Fir shows only 67% survival in this zone—too hot. 
   Recommended: 70/25/5 mix. Density: 300 trees/acre. Total: 86,100 seedlings. 
   Timeline: Start in-nursery in spring 2026, field planting summer 2026. Cost: $28,700. 
   ROI: $1.2M in timber value 40 years."

Output:
  - Reforestation prescription map: 127 zones with species mixes, planting densities, timelines
  - Nursery gap analysis: 95K seedlings shortfall (start propagation now?)
  - Projected success rates (89% Ponderosa, 78% Mixed strategy, 65% if constrained to current inventory)
  - Confidence: 76% (depends on next 3 years' weather—climate models are coarse)
  - Reasoning chain (human-readable)
  - NEPA-ready justification
```

**[6:16:15am] POLICYPILOT AGENT RUNS (Synthesis)**

```
Input: All three agent outputs, NEPA template library, regulatory checklist

Process:
  1. Synthesized decision narrative:
     'Based on FireSight burn severity (82% confidence), TrailScan hazard assessment (87% confidence), 
      and TimberScribe ecological modeling (76% confidence), we recommend the following actions...'
  
  2. Compliance check:
     - Hazard removal decisions: Justified by crew safety (OSHA 1910.268). LiDAR analysis. 6-CFR citations embedded.
     - Reforestation species selection: Justified by soil survey, elevation, climate modeling, historical success data. 
       ESA coordination: listed species consultation not required—these species not federally listed in Oregon Zone 6. 
       WAIT—GT-89 is within 0.5mi of designated spotted owl habitat. Recommend BLM consultation before planting Douglas Fir in that zone.
  
  3. Generated NEPA memo:
     - Decision: Approve hazard removal in grid 42-N, reforestation prep in zones GT-1 through GT-127, contingent on spotted owl consultation for GT-89.
     - Authority: 43 CFR 1601-1689 (Forest Planning); 50 CFR 402 (ESA consultation)
     - Environmental analysis: No significant impacts. Fire recovery activities categorically excluded per agency guidance.
     - Reasoning chain: Link every decision to underlying analysis.

Output:
  - Draft NEPA decision memo (ready for Sarah to sign)
  - Regulatory flags: GT-89 needs BLM consultation (2-week delay recommended)
  - Executive summary: 'Week priorities: (1) Hazard tree removal at Lunch Meadow; (2) Reforestation site prep in 5,482 acres; (3) Initiate spotted owl consultation for 89-acre subplot.'
  - Confidence levels propagated through reasoning chain
```

**[6:16:45am] COORDINATOR SYNTHESIZES & PRESENTS**

All outputs converge. The Coordinator builds:
1. **The Golden Thread** - Coherent narrative connecting all decisions
2. **The Action Ledger** - Prioritized tasks for today/week
3. **The Confidence Visualization** - Which decisions are locked-in vs. speculative
4. **The Handshake Diagram** - Shows how agents communicated

Output to Sarah's Command Console (6:17am):

```
CEDAR CREEK RECOVERY | Daily Briefing | Dec 20, 2025, 6:17am

🔴 CRITICAL (Today)
  • Hazard tree at Lunch Meadow: Crew relocation OR hazard removal (2hr op)
  • Spotted owl consultation flag: GT-89 reforestation pending (2-week regulatory)

🟡 HIGH (This Week)
  • Reforestation site prep: 5,482 acres, 4 crews, $67K budget
  • Erosion mitigation priority: 847 acres (rainfall forecast + steep slopes)

🟢 ON TRACK (Next Month)
  • Burn severity recovery: 18% vegetative regrowth in moderate zones
  • Seedling propagation: 950K target. Current inventory: 850K. Nursery delay: -95K by March.

[SHOW REASONING] [EXECUTIVE SUMMARY] [FULL NEPA MEMO] [AGENT DASHBOARD] [DOWNLOAD DATA]
```

Sarah looks at this. She can:
- See what's urgent (CRITICAL)
- Understand *why* it's urgent (click 'SHOW REASONING')
- Approve or challenge the recommendation ('I disagree with hazard removal cost—use crew relocation instead')
- Download the NEPA memo to forward to her Regional Forester
- Drill into FireSight/TrailScan/TimberScribe outputs individually
- See confidence levels throughout
"

---

## PHASE 4: THE "ART-IDEAL INTERFACE"

### Design Principles

**1. Tactical Futurism (Not Corporate Dashboard)**
- Aesthetic: Military command center meets Google Material Design
- Typography: Monospace (IBM Plex Mono) for data; Sans-serif (Roboto) for narrative
- Color: High contrast, accessible. Dark mode primary (field crew use in sunlit outdoors)
- Feel: "We're commanding a recovery operation," not "analyzing a spreadsheet"

**2. Reasoning Transparency**
- Every decision shows its thought chain
- "Why did the agent recommend this?" is one click away
- Data provenance visible (source, timestamp, confidence)
- Confidence levels never hidden

**3. Contextual HUDs**
- Interaction is spatial + temporal
- Clicking a map feature pulls a context-aware sidebar
- Information pinned to the thing itself (a tree icon shows the hazard reasoning)

**4. Nerve Center, Not Pipeline**
- Interface is decision-centric, not data-centric
- Designed for action, not passive observation
- Every screen has a clear "What should I do?" answer

### Layout: Macro to Micro

**Level 0: COMMAND VIEW (Home Screen)**

```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT RANGER | Cedar Creek Recovery | Dec 20, 2025, 6:17am │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [REGIONAL MAP] (15,300 acres) ←─── Macro View                  │
│  Status: Burn severity visible, hazard trees flagged, crews shown
│                                                                   │
│  STATUS LEDGER (Scrollable):                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL TODAY                                        │   │
│  │ ├─ Lunch Meadow Hazard (grid 42-N)                       │   │
│  │ │  Wind forecast 25mph tomorrow. 1 crew at risk.        │   │
│  │ │  [DETAIL] [APPROVE CREW RELOCATION] [APPROVE REMOVAL] │   │
│  │ │  Agent confidence: 87%  Data source: LiDAR 2023        │   │
│  │ │                                                         │   │
│  │ 🟡 WEEK PRIORITIES                                       │   │
│  │ ├─ Reforestation site prep: 5,482 acres                  │   │
│  │ │  Est. cost: $67K | Timeline: Dec 20-Jan 15            │   │
│  │ │  [APPROVE] [MODIFY] [DETAIL]                          │   │
│  │ │                                                         │   │
│  │ 🟢 ON TRACK                                              │   │
│  │ ├─ Seedling propagation: 950K target, 850K inventory     │   │
│  │ │  Timeline to shortfall: 95K by March 2026              │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  QUICK ACTIONS:                                                  │
│  [NEW HAZARD REPORT] [CREW LOCATION] [WEATHER ALERT]           │
│  [DOWNLOAD NEPA MEMO] [EXECUTIVE SUMMARY] [FULL DASHBOARD]     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Level 1: MAP VIEW**
- Interactive topographic map (Mapbox/Leaflet)
- Layer toggles: Burn severity, hazard trees, crew locations, reforestation zones
- Click-to-context: Hazard tree → HUD with reasoning + crew impacts + action options

**Level 2: DETAIL/REASONING VIEW**
- Input data source + confidence
- Analysis steps (chain-of-thought)
- Recommendation + alternatives
- Approval/modification buttons
- Full data download option

**Level 3: AGENT DASHBOARD (Advanced)**
- Orchestration flow visualization
- Agent dependency graph
- Individual agent outputs (FireSight, TrailScan, TimberScribe, PolicyPilot)
- Confidence propagation trace
- Golden Thread narrative

**Level 4: EXECUTIVE LAYER**
- 2-page executive summary (auto-generated)
- NEPA decision memo (auto-generated, Sarah-signed)
- Downloadable PDF with confidence intervals
- Key metrics for congressional briefing

### Interaction Model: The Command Loop

**Scenario: Sarah's 6am Stand-up**

**Step 1: Status Check (30 seconds)**
- Opens Command Console
- Glances at Command View → sees 🔴 1 CRITICAL, 🟡 5 HIGH, 🟢 ON TRACK
- Immediately knows: Today is not normal, hazard tree is the issue

**Step 2: Drill-In (2 minutes)**
- Clicks "CRITICAL TODAY" → Context HUD expands for tree 42-N
- Reads: Risk assessment, crew impact, two options
- Observes: "Confidence 87% for hazard, 72% for risk, 94% for recommendation"
- Realizes: This is solid intel, not guessing

**Step 3: Decision (1 minute)**
- Clicks [APPROVE CREW RELOCATION]
- System records: "Dec 20, 6:22am, decision to relocate Lunch Meadow crew. Reasoning: TrailScan hazard flag. Sarah Chen authorized."
- System notifies: Crew dispatch, safety officer, regional forester (automated memo)

**Step 4: Executive Sync (5 minutes)**
- Sarah needs to brief her Regional Forester
- Clicks [DOWNLOAD EXECUTIVE SUMMARY]
- Gets 2-page document with status, decisions made, confidence intervals
- Forwards to Regional Forester. No more Excel sheets. No more guessing.

### Visual Language: Tactical Aesthetics

**Typography:**
- Status & Numbers: IBM Plex Mono 14-16px (monospace = precision)
- Labels & Descriptions: Roboto 14px (sans-serif = readability)
- Headers: Roboto Bold 20-24px
- Warnings: Roboto Bold 16px, bright color

**Color System:**
- Critical: Bright red (#FF4444)
- High: Amber/yellow (#FFA500)
- On-track: Teal/green (#00B4B4)
- Neutral: Dark gray on light (#2C2C2C)
- High contrast: 4.5:1 minimum (WCAG AA)

**Components:**
- Status Badge: Icon + text + risk metric + action link
- Data Row (Monospace): Columnar data with confidence annotations
- HUD Panel: Translucent black background, glassmorphic effect
- Map Layer: Polygons (burn) + icons (hazards) + dots (crews)

### The "Agent Handshake": Visualizing Collaboration

**How agents collaborate is visible to the ranger:**

```
AGENT COORDINATION | Cedar Creek | Dec 20, 6:16am

1️⃣ FireSight analyzed burn severity
   "Moderate-burn zone GT-47 shows 18% recovery"
   Confidence: 82%
   → Output: Erosion priority zones

2️⃣ TrailScan identified hazards independently
   "Hazard tree at 42-N, 51% crew risk"
   Confidence: 87%
   → Output: Crew relocation recommendation

3️⃣ TimberScribe received FireSight erosion data
   "Zone GT-47 low erosion risk → high planting confidence"
   Combined with soil + elevation
   Confidence: 76%
   → Output: Species mixes for 127 zones

4️⃣ PolicyPilot synthesized all outputs
   Connected TrailScan hazard → crew decision
   Connected TimberScribe zones → NEPA justification
   Connected FireSight + climate → species choice
   Confidence: 91% (aggregate)
   → Output: NEPA memo with full decision chain

RESULT: A coherent narrative where each agent contributed specialized
expertise AND the decisions connect logically (the "Golden Thread").
```

---

## FINAL SPECIFICATION SUMMARY

| Dimension | Specification |
|-----------|---------------|
| **Name** | RANGER Command Console |
| **Purpose** | Tactical recovery operations management for USFS fire recovery |
| **Primary Users** | District Rangers, crew chiefs, regional foresters |
| **Primary Devices** | Desktop (office), tablet (field), mobile (emergency) |
| **Interaction Model** | Decision-centric. "What should I do?" answerable in <2 min |
| **Aesthetic** | Tactical futurism: military command center + Google Design |
| **Reasoning Transparency** | Every decision: input data + analysis + confidence visible |
| **Core Workflow** | Status (30s) → Drill-in (2m) → Decision (1m) → Notify (auto) → Sync (5m) |
| **Agent Collaboration** | Coordinator pattern orchestration. 4 agents run parallel/dependent. Output: Golden Thread |
| **Real-Time Capability** | Daily 6am batch + event-driven updates (wind change, hazard report) |
| **Confidence** | Tier 1 (90%+): Direct use. Tier 2 (70-85%): Caution-flagged. Tier 3: Demo only |
| **Offline Resilience** | Cache yesterday's baseline locally. Field crew app works offline, syncs when connected |
| **Accessibility** | WCAG AA minimum (4.5:1 text contrast, keyboard nav, screen reader support) |

---

## NEXT STEPS

1. Leadership approval + funding (6-month pilot, $700K)
2. Team assembly (3 platform engineers, 2 data engineers, 1 ML ops, 1 frontend, 1 PM)
3. Phase 1 kick-off (data infrastructure + FireSight agent)
4. Monthly check-ins with field teams (Cedar Creek district ranger, crew chiefs)
5. May 2026: UAT complete, production deployment to Cedar Creek recovery operations

---

**Status:** Design workshop simulation complete, "Art-Ideal Interface" specified, ready for Phase 1 implementation planning

**Date prepared:** December 20, 2025

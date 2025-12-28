# RANGER User Journeys & Personas

**Purpose:** Maps real USFS stakeholder roles to RANGER's multi-agent coordination, showing how the Skills-First architecture transforms their daily work.

**Architecture Alignment:** [ADR-005 Skills-First](../adr/ADR-005-skills-first-architecture.md) | [ADR-006 Google-Only LLM](../adr/ADR-006-google-only-llm-strategy.md)

---

## Phase 1 vs. Future Vision

This document describes user experiences at two levels:

| Scope | What's Real | What's Demonstrated |
|-------|-------------|---------------------|
| **Phase 1 (Current)** | Multi-agent coordination, reasoning transparency, Proof Layer, legacy export | Cedar Creek fixture data, chat interface, briefing cards |
| **Phase 2+ (Vision)** | Everything in Phase 1 plus... | Mobile field capture, computer vision, voice transcription, real-time satellite |

> **Key Insight:** Phase 1 proves the **orchestration value** using simulated data. The agents reason over fixtures exactly as they will reason over live data in Phase 2+.

---

## The Narrative: Cedar Creek Fire Recovery (2022)

All user journeys are grounded in the **Cedar Creek Fire** (Willamette National Forest, Oregon), which burned 127,000+ acres near Waldo Lake and the Pacific Crest Trail. This is our "frozen-in-time" proof-of-concept.

**Why Cedar Creek?**
- Real fire with public data (MTBS, Sentinel-2, 3DEP)
- Representative Pacific Northwest fire behavior
- Impacted trails, timber, and required NEPA compliance
- Well-documented recovery challenges

---

## The Four Specialists

| Agent | Icon | Primary Persona | Skills | Data Sources (Phase 1) |
|-------|------|-----------------|--------|------------------------|
| **Burn Analyst** | 🔥 | Fire Management Officer | `mtbs-classification`, `soil-burn-severity`, `boundary-mapping` | `burn-severity.json` fixtures |
| **Trail Assessor** | 🥾 | Recreation Technician | `damage-classification`, `closure-decision`, `recreation-priority` | `trail-damage.json` fixtures |
| **Cruising Assistant** | 🌲 | Timber Cruiser | `volume-estimation`, `salvage-assessment`, `cruise-methodology` | `timber-plots.json` fixtures |
| **NEPA Advisor** | 📋 | Environmental Coordinator | `pathway-decision`, `compliance-timeline`, `documentation` | FSM/FSH corpus (RAG) |

**Orchestrated by:** Recovery Coordinator (delegation, portfolio triage, cross-agent synthesis)

---

## Persona 1: Sarah Chen — Fire Management Officer

### Role
Sarah is a **Fire Management Officer (FMO)** for the McKenzie River Ranger District. Three weeks after Cedar Creek containment, she needs to brief the District Ranger on burn severity and downstream recovery priorities.

### The Pain (Pre-RANGER)
1. Download Sentinel-2 imagery from Copernicus Hub (requires GIS expertise)
2. Calculate dNBR in QGIS or ArcGIS (2-3 hours)
3. Manually classify severity zones using MTBS thresholds
4. Email static PDF maps to the District Ranger
5. **No connection** to trail damage, timber impacts, or NEPA implications
6. District Ranger asks follow-up questions → back to step 1

### The RANGER Way (Phase 1)

**Sarah opens the Command Console and types:**

> *"What's the burn severity status for Cedar Creek? Which sectors are highest priority?"*

**Recovery Coordinator delegates to Burn Analyst.** Within 30 seconds, Sarah sees:

**Briefing Card:**
```
BURN ANALYST ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cedar Creek Fire shows significant variability across 8 sectors:

• Sector NW-4: HIGH severity (18,340 acres, 42% of burn area)
  - dNBR mean: 0.76 | Slope: 38° average
  - Critical concern: Intersects Pacific Crest Trail mile markers 47-52
  
• Sector NE-2: MODERATE severity (12,500 acres)
  - dNBR mean: 0.42 | Slope: 22° average
  - Lower immediate risk but monitoring recommended

SUGGESTED ACTIONS:
[Trigger Trail Assessment for NW-4] [View Erosion Risk Model]

Confidence: 94%
```

**Proof Layer (expandable):**
```
REASONING CHAIN
───────────────
1. Retrieved Cedar Creek perimeter from NIFC fixtures
2. Loaded burn severity classifications from MTBS-derived data
3. Calculated zonal statistics: 42% high severity concentrated in NW quadrant
4. Cross-referenced slope data: NW-4 averages 38° (high erosion risk)
5. Identified PCT intersection → flagged for Trail Assessor prioritization

CITATIONS
─────────
[MTBS] Cedar Creek classification, 2022-09-15
[NIFC] Fire perimeter OR-WIF-000456
[FSM 2520] Burned Area Emergency Response standards
```

**Sarah clicks "Trigger Trail Assessment"** → The system emits an event with `correlation_id: cedar-creek-recovery-001`, and the Trail Assessor queue lights up.

### What Sarah Experiences (Phase 1)
- ✅ Natural language query → structured briefing
- ✅ Reasoning transparency (how the AI reached its conclusion)
- ✅ Citations to data sources
- ✅ One-click handoff to next specialist
- ✅ Correlation tracking across the recovery session

### What Sarah Will Experience (Phase 2+)
- Live Sentinel-2 imagery pulls via Google Earth Engine
- Real-time dNBR calculation (not pre-computed fixtures)
- Automated change detection from previous assessments

---

## Persona 2: Marcus Rodriguez — Recreation Technician

### Role
Marcus is a **Recreation Technician** responsible for maintaining 47 miles of trails in the Waldo Lake Wilderness. After Sarah's assessment, he receives a priority alert to evaluate PCT damage in Sector NW-4.

### The Pain (Pre-RANGER)
1. Print paper TRACS forms (Trail Assessment and Condition Survey)
2. Hike the trail with clipboard and camera
3. Manually sketch damage locations on paper map
4. Return to office, transcribe into TRACS database (legacy 1999 software)
5. **No spatial link** to burn severity data
6. **No coordination** with timber or NEPA teams

### The RANGER Way (Phase 1)

**Marcus sees a notification in the Command Console:**

> *"High-priority trail segment flagged by Burn Analyst. Sector NW-4 intersects PCT miles 47-52."*

**He asks the Trail Assessor:**

> *"What's the damage inventory for the PCT segment in NW-4? What are the repair priorities?"*

**Trail Assessor responds with:**

**Briefing Card:**
```
TRAIL ASSESSOR DAMAGE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pacific Crest Trail (Waldo Lake Segment) — 16 damage points identified:

CRITICAL (Closure Required):
• Mile 47.3: Bridge structural failure — Est. repair: $85,000
• Mile 49.1: Debris flow blocking trail — Est. clearing: $12,000

HIGH PRIORITY:
• Mile 48.2: Burned signpost cluster (4 signs) — Est. replacement: $2,400
• Mile 51.7: Tread erosion (200 linear ft) — Est. repair: $8,500

MODERATE:
• 12 additional points... [expand to view]

TOTAL ESTIMATED COST: $127,400
RECOMMENDED CLOSURE: Miles 47-50 until bridge assessment complete

SUGGESTED ACTIONS:
[Generate TRACS Work Order] [Export Damage CSV] [Notify Timber Access]

Confidence: 89%
```

**Proof Layer (expandable):**
```
REASONING CHAIN
───────────────
1. Received upstream context: NW-4 flagged as high severity (correlation_id: cedar-creek-recovery-001)
2. Loaded trail damage fixtures for PCT Waldo Lake segment
3. Classified 16 damage points using TRACS severity codes
4. Calculated repair cost estimates from FSM 2353 unit costs
5. Bridge failure at 47.3 triggers mandatory closure recommendation
6. Flagged timber crew access constraint for Cruising Assistant

CITATIONS
─────────
[TRACS] Damage classification codes (Table 2353-1)
[FSM 2353.03] Trail Maintenance Standards
[Upstream] Burn Analyst event #BA-001 (correlation: cedar-creek-recovery-001)
```

**Marcus clicks "Generate TRACS Work Order"** → Downloads a CSV file formatted for import into the legacy TRACS system.

### What Marcus Experiences (Phase 1)
- ✅ Context-aware briefing (knows about Sarah's burn severity finding)
- ✅ Structured damage inventory with cost estimates
- ✅ TRACS-compatible export (validated against federal schema)
- ✅ Closure recommendations with reasoning
- ✅ Handoff to timber team (access route implications)

### What Marcus Will Experience (Phase 2+)
- Mobile field capture with GPS tracking
- Video upload → computer vision damage detection
- Real-time sync from field to Command Console

---

## Persona 3: Elena Vasquez — Timber Cruiser

### Role
Elena is a **Timber Cruiser** tasked with surveying Salvage Unit 12 adjacent to the Cedar Creek burn perimeter. She needs to assess merchantable timber for salvage logging before decay reduces value.

### The Pain (Pre-RANGER)
1. Print FSCruiser data sheets
2. Walk the unit with DBH tape and clipboard
3. Manually record: Tree #, Species, DBH, Defect, Merchantability
4. Return to office, enter data into FSCruiser desktop software
5. Export FSVeg XML for timber sale contract
6. **No connection** to NEPA compliance or trail access constraints

### The RANGER Way (Phase 1)

**Elena sees that Marcus flagged access constraints near Unit 12. She asks:**

> *"What's the salvage potential for Unit 12? Are there any access or timing constraints I should know about?"*

**Cruising Assistant responds:**

**Briefing Card:**
```
CRUISING ASSISTANT SALVAGE ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Salvage Unit 12 — Cedar Creek Fire (6 cruise plots analyzed)

SPECIES COMPOSITION:
• Douglas Fir (PSME): 62% — High mortality (avg 78%)
• Western Red Cedar (THPL): 24% — Moderate mortality (avg 45%)
• Western Hemlock (TSHE): 14% — Low mortality (avg 22%)

VOLUME ESTIMATES:
• Gross MBF: 2,340
• Net Salvageable MBF: 1,680 (after defect deduction)
• Estimated Stumpage Value: $1.2M - $1.8M (market dependent)

CONSTRAINTS IDENTIFIED:
⚠️ Access via Forest Road 2127 blocked by PCT bridge failure (Mile 47.3)
⚠️ Salvage window: 18-24 months before decay significantly reduces value
⚠️ Unit 12 boundary within 200m of Pacific Crest Trail (Section 106 trigger)

SUGGESTED ACTIONS:
[Export FSVeg XML] [Request NEPA Screening] [View Access Alternatives]

Confidence: 86%
```

**Proof Layer (expandable):**
```
REASONING CHAIN
───────────────
1. Loaded timber plot fixtures for Unit 12 (6 plots, 47 trees)
2. Calculated species distribution and mortality rates
3. Applied FSVeg volume equations for Douglas Fir salvage
4. Retrieved access constraint from Trail Assessor (correlation_id: cedar-creek-recovery-001)
5. Identified Section 106 trigger: Unit boundary < 200m from PCT (historic trail)
6. Flagged for NEPA Advisor review before sale authorization

CITATIONS
─────────
[FSVeg] Volume equations (FIA Pacific Northwest variant)
[FSM 2430] Timber Sale Preparation
[Upstream] Trail Assessor event #TA-001 (bridge closure)
[36 CFR 800] Section 106 consultation requirements
```

**Elena clicks "Export FSVeg XML"** → Downloads an XML file that validates against the USFS FSVeg schema.

### What Elena Experiences (Phase 1)
- ✅ Cross-domain awareness (knows about trail access issues)
- ✅ Volume and value estimates with species breakdown
- ✅ Constraint identification (NEPA triggers, access blocks)
- ✅ FSVeg-compatible export (validated schema)
- ✅ Automatic handoff to NEPA Advisor

### What Elena Will Experience (Phase 2+)
- Voice narration → Whisper transcription → structured plot data
- Species confirmation via bark texture computer vision
- Mobile app with offline cruise data entry

---

## Persona 4: Dr. James Park — Environmental Coordinator

### Role
Dr. Park is an **Environmental Coordinator** responsible for ensuring all Cedar Creek recovery actions comply with NEPA, the Endangered Species Act, and cultural resource laws (Section 106).

### The Pain (Pre-RANGER)
1. Manually review trail repair plans (from Marcus)
2. Manually review salvage logging plans (from Elena)
3. Search through PDF copies of FSM/FSH for relevant regulations
4. Determine appropriate NEPA pathway (CE, EA, or EIS)
5. Draft Environmental Assessment in Microsoft Word
6. **No automated compliance checking**
7. **No audit trail** showing how decisions were reached

### The RANGER Way (Phase 1)

**Dr. Park sees the correlation trace showing Sarah → Marcus → Elena. He asks:**

> *"What NEPA pathway applies to the Unit 12 salvage sale? Are there any compliance flags I should address?"*

**NEPA Advisor responds:**

**Briefing Card:**
```
NEPA ADVISOR COMPLIANCE SCREENING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: Cedar Creek Salvage — Unit 12
Proposed Actions: Timber salvage, associated road work

RECOMMENDED PATHWAY: Environmental Assessment (EA)

RATIONALE:
Categorical Exclusion (CE) is NOT available due to:
• Unit 12 within 200m of Pacific Crest Trail (National Historic Trail)
• Section 106 consultation required under 36 CFR 800.3
• Extraordinary circumstances check triggered (FSH 1909.15, Ch. 30)

KEY COMPLIANCE REQUIREMENTS:
1. Section 106 consultation with State Historic Preservation Office (SHPO)
2. Watershed analysis for post-fire erosion (FSM 2520)
3. Public scoping period (minimum 30 days)
4. Biological evaluation for threatened species habitat

TIMELINE ESTIMATE: 4-6 months for EA completion

SUGGESTED ACTIONS:
[Generate Draft EA Outline] [View Section 106 Checklist] [Identify Consultation Contacts]

Confidence: 92%
```

**Proof Layer (expandable):**
```
REASONING CHAIN
───────────────
1. Received project context from upstream agents (correlation_id: cedar-creek-recovery-001)
2. Retrieved FSH 1909.15 Chapter 30 (Categorical Exclusions)
3. Checked CE applicability: FAILED — extraordinary circumstances present
4. Identified Section 106 trigger from Cruising Assistant (PCT proximity)
5. Retrieved 36 CFR 800.3 requirements for historic properties
6. Concluded EA pathway with 4-6 month timeline estimate

CITATIONS
─────────
[FSH 1909.15] NEPA Handbook, Chapter 30 (Categorical Exclusions)
[36 CFR 800.3] Section 106 Initiation of Consultation
[FSM 2520] Watershed and Air Management
[Upstream] Cruising Assistant event #CA-001 (Section 106 flag)
```

**Dr. Park clicks "Generate Draft EA Outline"** → Receives a structured outline with pre-populated project details and citation placeholders.

### What Dr. Park Experiences (Phase 1)
- ✅ Synthesized view across all recovery domains
- ✅ NEPA pathway recommendation with reasoning
- ✅ Compliance flags surfaced automatically
- ✅ Citations to FSM/FSH chapters (RAG-retrieved)
- ✅ Draft document generation

### What Dr. Park Will Experience (Phase 2+)
- Integration with USFS PALS (Planning Appeals Litigation System)
- Automated deadline tracking
- Multi-project portfolio compliance dashboard

---

## The Correlation Trace: Cross-Agent Memory

All four personas work within a **single recovery session** (`correlation_id: cedar-creek-recovery-001`). The system maintains context across interactions:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CORRELATION TRACE                                │
│                cedar-creek-recovery-001                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Sarah (Burn Analyst)                                               │
│  └─► "NW-4 is high severity, intersects PCT"                       │
│       │                                                             │
│       ▼                                                             │
│  Marcus (Trail Assessor)                                            │
│  └─► "Bridge failure at Mile 47.3, closure required"               │
│       │                                                             │
│       ▼                                                             │
│  Elena (Cruising Assistant)                                         │
│  └─► "Unit 12 access blocked, Section 106 trigger"                 │
│       │                                                             │
│       ▼                                                             │
│  Dr. Park (NEPA Advisor)                                            │
│  └─► "EA required, 4-6 month timeline"                             │
│                                                                     │
│  ════════════════════════════════════════════════════════════════  │
│  Total recovery picture: High severity burn → Trail closure →      │
│  Access constraint → NEPA pathway determined                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**This is the "Nervous System" in action:** Agents are not isolated tools. They are a coordinated crew with shared memory and context propagation.

---

## Technical Architecture (Phase 1)

### Data Flow

```
User Query
    │
    ▼
Recovery Coordinator (Google ADK)
    │
    ├─► Parses intent
    ├─► Selects specialist agent(s)
    ├─► Delegates via AgentTool pattern
    │
    ▼
Specialist Agent (e.g., Burn Analyst)
    │
    ├─► Loads relevant skills
    ├─► Calls MCP tools for data (fixtures in Phase 1)
    ├─► Gemini 2.0 Flash generates reasoning + briefing
    │
    ▼
AgentBriefingEvent (SSE stream)
    │
    ├─► event_id, correlation_id, source_agent
    ├─► content (summary, detail)
    ├─► proof_layer (confidence, reasoning_chain, citations)
    │
    ▼
Command Console (React)
    │
    ├─► Briefing card rendered
    ├─► Proof Layer expandable
    ├─► Action buttons trigger next delegation
    │
    ▼
[Cycle repeats with context preserved]
```

### Session State

- **Runtime:** Google ADK with InMemorySessionService (dev) / Firestore (prod)
- **Correlation:** `correlation_id` persists across all events in a recovery session
- **Context:** Upstream events available to downstream agents via session state

### Streaming

- **Protocol:** Server-Sent Events (SSE)
- **Endpoint:** `/stream` on ADK orchestrator
- **Events:** Reasoning traces, tool calls, final briefings

---

## Success Metrics

| Metric | Phase 1 Target | Measurement |
|--------|----------------|-------------|
| **Cross-agent cascade** | 100% completion | All 4 agents triggered with correlation tracking |
| **Reasoning visibility** | Every briefing | Expandable proof layer on all responses |
| **Citation accuracy** | 100% valid links | FSM/FSH references resolve correctly |
| **Legacy export fidelity** | Schema-valid | TRACS CSV and FSVeg XML pass validation |
| **Response latency** | < 30 seconds | User query to briefing card rendered |
| **Demo narrative** | Complete flow | Sarah → Marcus → Elena → Dr. Park in < 5 minutes |

---

## Appendix: Phase 2+ Vision Features

These capabilities are **not in Phase 1** but are part of the product roadmap:

### Mobile Field Capture
- Native iOS/Android app for offline data collection
- GPS track recording with automatic waypoint capture
- Photo/video attachment with metadata preservation
- Sync to Command Console when connectivity restored

### Computer Vision Processing
- Trail damage detection from video (YOLOv8-based)
- Species identification from bark texture
- Structural assessment from bridge imagery
- Automated TRACS damage code assignment

### Voice Transcription
- Whisper-based audio transcription
- Structured data extraction from cruiser narration
- Real-time plot data population during field work

### Real-Time Satellite Integration
- Google Earth Engine API for Sentinel-2 imagery
- On-demand dNBR calculation
- Change detection from previous assessments
- Automated severity classification updates

### Production System Integration
- IRWIN (Integrated Reporting of Wildland-Fire Information)
- NIFC (National Interagency Fire Center) perimeters
- PALS (Planning Appeals Litigation System)
- USDA eAuth / Login.gov authentication

---

*Document Version: 2.0 — December 2025*
*Aligned with: ADR-005 (Skills-First), ADR-006 (Google-Only LLM), PROOF-LAYER-DESIGN.md*

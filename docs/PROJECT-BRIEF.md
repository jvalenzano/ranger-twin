# RANGER: Project Brief

**Version:** 2.0
**Date:** December 20, 2025
**Team:** TechTrend Federal - Digital Twin Initiative

---

## 1. Executive Summary

### Vision Statement

> **RANGER is an Agentic OS for Natural Resource Recovery, built on open-source infrastructure and Google ADK orchestration. It transforms siloed data into coordinated intelligence, enabling "Forest Floor to Washington" oversight.**

We are not building a dashboard with AI features; we are building a **Coordinated AI Crew** that uses a shared digital twin as its sensory layer. The agents are the decision-support system; the UI is their console.

### Phase 1 Scope

**RANGER is the nerve center, not the sensors.** Phase 1 demonstrates multi-agent orchestration using simulated data inputs. We prove the coordination value, not the sensor capabilities.

For complete Phase 1 simulation strategy and boundaries, see [DATA-SIMULATION-STRATEGY.md](./DATA-SIMULATION-STRATEGY.md).

### Brand Architecture

| Layer | Name | Purpose |
|-------|------|---------|
| **Initiative** | Project RANGER | Strategic modernization effort (budget docs, leadership comms) |
| **Platform** | RANGER | The unified digital twin operating system |
| **Descriptor** | "The USFS Digital Twin" | Technical positioning |
| **Agents** | Role-based titles | AI specialists that augment human expertise |

See [ADR-002: Brand Naming Strategy](./adr/ADR-002-brand-naming-strategy.md) for decision rationale.

### The Opportunity

The Cedar Creek Fire (Willamette National Forest, 2022) serves as our "frozen-in-time" proof-of-concept. No competitor offers an integrated post-fire recovery lifecycle:

| Gap | Current State | RANGER Solution |
|-----|---------------|-----------------|
| **Burn Assessment** | RAVG (GIS expertise required) | Burn Analyst with natural language queries |
| **Trail Assessment** | TRACS (paper-based, 1999) | Trail Assessor with video-to-damage-inventory |
| **Timber Cruising** | FScruiser (manual data entry) | Cruising Assistant with voice + video → FSVeg |
| **NEPA Compliance** | Manual EA drafting (6-18 months) | NEPA Advisor with FSM/FSH RAG |
| **Integration** | Siloed workflows | Recovery Coordinator orchestrating all outputs |

### Key Differentiators

1. **Zero Licensing Costs** - 100% open source application stack
2. **AI-First Investment** - 80% of budget on agent capabilities, 20% on UI shell
3. **Agent-Native Architecture** - Users interact with specialized AI agents, not just dashboards
4. **Federal-Ready** - FedRAMP-compatible GCP architecture from day one
5. **Compelling Demo** - "Tactical Futurism" UI that commands attention

---

## 2. Architectural Philosophy

### The Fundamental Inversion

**Old Model (2015-2023):**
```
Expensive Application Licensing → AI Features (bolt-on)
├── License Esri: $100K/year
├── License Salesforce: $150/user/month
└── Add "AI" button: Limited capability
```

**RANGER AI Model (2025+):**
```
AI Capabilities (primary investment) → Application Shell (commodity)
├── Open source mapping: $0
├── Open source database: $0
├── Open source UI: $0
└── Frontier AI compute: $X (the actual product)
```

### Investment Allocation

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUDGET ALLOCATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              AI CAPABILITIES (80%)                      │   │
│   │                                                         │   │
│   │  • Gemini API costs for multimodal processing           │   │
│   │  • Custom model training (species ID, damage detection) │   │
│   │  • RAG corpus curation and embedding                    │   │
│   │  • Agent orchestration and testing                      │   │
│   │  • Prompt engineering and refinement                    │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           APPLICATION SHELL (20%)                       │   │
│   │                                                         │   │
│   │  • React + MapLibre GL JS (open source)                 │   │
│   │  • FastAPI backend (open source)                        │   │
│   │  • PostGIS + GeoServer (open source)                    │   │
│   │  • Basic UI components and styling                      │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Agents First** - Design the agent capabilities before the UI
2. **Open Source Default** - Only use commercial services when no viable OSS alternative exists
3. **Serverless Architecture** - Scale-to-zero for cost efficiency (fire recovery is seasonal)
4. **Public Data Priority** - Leverage freely available government datasets
5. **Federal Compliance Built-In** - FedRAMP-compatible patterns from the start

---

## 3. The Crew: Five AI Agents

### Agent Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   RANGER AGENT SYSTEM                           │
│                   "The Digital Crew"                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  ┌─────────────────────┐                        │
│                  │     RECOVERY        │                        │
│                  │    COORDINATOR      │                        │
│                  │   (Orchestrator)    │                        │
│                  └──────────┬──────────┘                        │
│                             │                                   │
│         ┌───────────┬───────┴───────┬───────────┐               │
│         ▼           ▼               ▼           ▼               │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│   │   BURN    │ │   TRAIL   │ │ CRUISING  │ │   NEPA    │       │
│   │  ANALYST  │ │ ASSESSOR  │ │ ASSISTANT │ │  ADVISOR  │       │
│   │           │ │           │ │           │ │           │       │
│   │ Severity  │ │  Damage   │ │  Timber   │ │Compliance │       │
│   │ Mapping   │ │ Inventory │ │ Inventory │ │ Guidance  │       │
│   └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                    SHARED CONTEXT LAYER                         │
│         (Cedar Creek Spatial Data + Temporal State)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Naming Principle:** Agent names are **role titles**, not product names. This frames AI as "digital colleagues" that assist human experts, not replacement technology.

### Agent Specifications

#### 3.1 Burn Analyst

**Role:** The Burn Analyst — Burn severity assessment and strategic briefings

| Attribute | Specification |
|-----------|---------------|
| **Phase 1 Input** | Static GeoJSON with burn severity classifications (simulated MTBS data) |
| **Output** | Coordinated Briefings for Recovery Coordinator, severity analysis, priority sector identification |
| **Model** | Gemini 2.0 Flash for narrative generation and reasoning |
| **Key Queries** | "Brief the coordinator on erosion risk" / "Compare severity to the 2020 Holiday Farm fire" / "Which sectors require immediate trail assessment?" |

**Future Vision:** Real-time satellite imagery processing (Sentinel-2/Landsat) with dNBR calculation pipelines would replace simulated inputs.

**Sample Interaction:**
```
User: What percentage of the Cedar Creek burn area is high severity?

Burn Analyst: Based on my analysis of burn severity data from September 2022:
- High Severity: 42% (18,340 acres)
- Moderate Severity: 31% (13,530 acres)
- Low Severity: 27% (11,780 acres)

The northwest quadrant shows concentrated high-severity burn. **I have briefed the Recovery Coordinator to task the Trail Assessor with prioritizing the Waldo Lake Trail segments in this sector.**

[Confidence: 94% | Source: MTBS classification data]
```

#### 3.2 Trail Assessor

**Role:** The Trail Assessor — Trail damage assessment and repair prioritization

| Attribute | Specification |
|-----------|---------------|
| **Phase 1 Input** | Static JSON with damage point data (as if detected from field video) |
| **Output** | TRACS-compatible work orders, cost estimates, repair prioritization |
| **Model** | Gemini 2.0 Flash for classification, cost estimation, and narrative |
| **Key Queries** | "Prioritize repairs by visitor safety" / "Estimate total repair cost" / "Which trails can reopen first?" |

**Future Vision:** Real-time computer vision processing (YOLOv8/SAM2) of field video would detect and classify damage automatically, feeding this agent.

**Sample Interaction:**
```
User: Show me the most critical trail damage in the Cedar Creek area.

Trail Assessor: I've identified 23 damage points across 4 trails. Critical issues:

1. **Rebel Creek Trail (Mile 2.3)** - Bridge washout
   - Severity: CRITICAL
   - Est. Repair: $45,000
   - Visitor Risk: HIGH (impassable)

2. **French Pete Trail (Mile 0.8)** - Debris flow across trail
   - Severity: HIGH
   - Est. Repair: $12,000
   - Visitor Risk: MODERATE (passable with caution)

[View all 23 damage points on map →]

Recommended repair sequence based on visitor traffic + cost efficiency:
French Pete → Rebel Creek → Olallie → Mink Lake

[Confidence: 87% | Source: Simulated field assessment Oct 2022]
```

#### 3.3 Cruising Assistant

**Role:** The Cruising Assistant — Timber inventory analysis and salvage planning

| Attribute | Specification |
|-----------|---------------|
| **Phase 1 Input** | Static JSON with timber plot data (as if transcribed from field narration) |
| **Output** | FSVeg-compatible plot records, species composition, volume estimates, salvage value |
| **Model** | Gemini 2.0 Flash for data structuring and analysis |
| **Key Queries** | "Identify salvageable timber stands" / "Generate cruise plan for unit 47" / "What's the board-foot value?" |

**Design Note:** "Assistant" explicitly positions the AI as a helper for the human cruiser, not a replacement.

**Future Vision:** Voice transcription (Whisper) and species identification from bark texture/video would automate field data capture, feeding this agent.

**Sample Interaction:**
```
User: "Show me the timber assessment for Unit 47."

Cruising Assistant: Plot 47-Alpha assessment:

Species Composition:
- Douglas Fir (Pseudotsuga menziesii): 12 stems, ~80% mortality
- Western Red Cedar: 3 stems, ~40% mortality
- Big Leaf Maple (understory): scattered, high survival

Estimated Salvage Volume: 18,400 board feet
Salvage Window: 12-18 months (bark beetle risk)

**Output Formatting:** Assessment is **FSVeg-compatible**. Export ready for legacy system ingestion.

[Export to FSVeg →] [Add to cruise plan →]

[Volume Estimate: ±15% | Source: Simulated cruise data]
```

#### 3.4 NEPA Advisor

**Role:** The NEPA Advisor — Regulatory guidance for NEPA and forest management compliance

| Attribute | Specification |
|-----------|---------------|
| **Phase 1 Input** | Project context from other agents + FSM/FSH corpus (real PDFs, chunked for RAG) |
| **Output** | Applicable regulations (FSM/FSH citations), compliance checklist, EA draft sections |
| **Model** | RAG retrieval from Forest Service Manual/Handbook + Gemini 2.0 Flash for synthesis |
| **Key Queries** | "What NEPA triggers apply to this salvage sale?" / "Draft the Purpose and Need section" / "Check for ESA consultation requirements" |

**Design Note:** "Advisor" implies expertise and counsel you consult — not an autopilot that makes decisions for you.

**Future Vision:** Integration with PALS (Planning, Appeals and Litigation System) would provide real-time project tracking and compliance status.

**Sample Interaction:**
```
User: What environmental compliance is required for the Cedar Creek timber salvage?

NEPA Advisor: Based on the proposed salvage sale location and scope,
the following compliance pathways apply:

NEPA REQUIREMENTS:
✓ Categorical Exclusion unlikely - Project exceeds 250 acres
⚠ Environmental Assessment (EA) required
  - FSH 1909.15, Section 31.2
  - 36 CFR 220.6(e) - Timber salvage sales

CONSULTATION REQUIREMENTS:
⚠ ESA Section 7 - Northern Spotted Owl habitat within 0.5 mi
⚠ NHPA Section 106 - Historic trail segments in project area
✓ Clean Water Act 404 - No wetland impacts identified

ESTIMATED TIMELINE:
- EA Preparation: 4-6 months
- Public Comment: 30 days
- Decision Notice: 2-3 months

[Generate EA Outline →] [View FSM/FSH Citations →]

[Citations verified against FSM 1900, FSH 1909.15, 36 CFR 220]
```

#### 3.5 Recovery Coordinator

**Role:** The Recovery Coordinator — Cross-agent orchestration and unified recovery planning

| Attribute | Specification |
|-----------|---------------|
| **Phase 1 Input** | User queries + AgentBriefingEvents from sub-agents |
| **Output** | Integrated recovery plans, resource allocation recommendations, timeline synthesis |
| **Model** | Google ADK coordinator pattern with Gemini 2.0 Flash for synthesis |
| **Key Queries** | "Create a 12-month recovery plan" / "What's the total recovery budget?" / "Optimize for fastest trail reopening" |

**Design Note:** This is the core product in Phase 1 - ADK-based routing, cross-agent synthesis, session state management, and correlation ID tracking are all real capabilities.

**Sample Interaction:**
```
User: Generate an integrated recovery plan for Cedar Creek prioritizing
      visitor access and timber salvage value.

Recovery Coordinator: CEDAR CREEK INTEGRATED RECOVERY PLAN

PHASE 1 (Months 1-3): Stabilization
├─ Burn Analyst: Erosion risk mapping complete → 3 priority watersheds
├─ Trail Assessor: Emergency repairs on French Pete Trail ($12K)
├─ Cruising Assistant: Salvage cruise of high-value units (est. $2.1M value)
└─ NEPA Advisor: Initiate EA for timber salvage (concurrent)

PHASE 2 (Months 4-6): Recovery Operations
├─ Trail repairs: Rebel Creek bridge ($45K), Olallie reroute ($8K)
├─ Timber salvage: Units 47, 52, 61 (18-month beetle window)
└─ EA public comment period

PHASE 3 (Months 7-12): Restoration
├─ Reforestation planning (Burn Analyst soil analysis)
├─ Trail system reopening (75% capacity)
└─ Salvage sale completion

BUDGET SUMMARY:
- Trail Repairs: $127,000
- EA/Compliance: $45,000
- Salvage Revenue: +$1.8M (net)

[Export to PDF →] [Share with District Ranger →]
```

---

## 4. Technical Stack

RANGER is built entirely on **open source tools** and **FedRAMP-compatible cloud services**. This eliminates licensing costs and ensures federal compliance from day one.

**Core Technologies:**
- **Frontend:** React 18, TypeScript, MapLibre GL JS, deck.gl, Tailwind CSS
- **Backend:** FastAPI, PostgreSQL with PostGIS, Redis, Celery
- **AI/ML:** Google Gemini 2.0 Flash, LangChain for RAG, Google ADK for orchestration
- **Cloud:** GCP services (Cloud Run, Cloud SQL, Vertex AI, Cloud Storage) — all FedRAMP High
- **Data Sources:** Public datasets from USGS, USFS, Copernicus (Sentinel-2), and OpenStreetMap

For detailed tool inventory and licensing, see [OPEN-SOURCE-INVENTORY.md](./architecture/OPEN-SOURCE-INVENTORY.md).

For GCP architecture patterns, see [GCP-ARCHITECTURE.md](./architecture/GCP-ARCHITECTURE.md).

---

## 5. UX Vision

### Design Philosophy: "Tactical Futurism"

> **F-35 Cockpit meets National Geographic** — A serious, mission-critical interface that federal operators will respect and want to use.

#### Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-safe` | `#10B981` | Low severity, success states |
| `--color-warning` | `#F59E0B` | Moderate severity, caution states |
| `--color-severe` | `#EF4444` | High severity, critical states |
| `--color-background` | `#0F172A` | Primary dark background |
| `--color-surface` | `#1E293B` | Card/panel backgrounds |
| `--color-glass` | `rgba(30, 41, 59, 0.8)` | Glassmorphic overlays |
| `--font-display` | `'Inter', sans-serif` | Headings, metrics |
| `--font-mono` | `'JetBrains Mono', monospace` | Data, coordinates |

### Interface Modes

#### 5.1 Command Console (Desktop)

**Target:** Strategic planners, District Rangers, Regional offices
**Device:** Desktop, large displays, command centers

```
┌─────────────────────────────────────────────────────────────────────────┐
│  RANGER: COMMAND CONSOLE                         2025.12.19 | 14:32 UTC │
├─────────┬───────────────────────────────────────────────┬───────────────┤
│         │                                               │               │
│ IMPACT  │                                               │  AI INSIGHT   │
│   ○     │                                               │ ┌───────────┐ │
│         │         3D DIGITAL TWIN VIEWPORT              │ │Burn      │ │
│ DAMAGE  │                                               │ │ ■■■■■□□□  │ │
│   ○     │        [Cedar Creek Fire Area]                │ │ 85% Severe│ │
│         │                                               │ └───────────┘ │
│ TIMBER  │         [Interactive 3D Terrain]              │               │
│   ○     │                                               │ ┌───────────┐ │
│         │        [Toggleable Data Layers]               │ │Est. Loss  │ │
│COMPLIAN │                                               │ │  $12.4M   │ │
│   ○     │                                               │ └───────────┘ │
│         │                                               │               │
│─────────│───────────────────────────────────────────────│ [💬 Ask AI] │
│ ← Back  │  [Satellite] [3D Canopy] [Infrared] [Trails]  │               │
└─────────┴───────────────────────────────────────────────┴───────────────┘
```

**Key Features:**
- **Lifecycle Rail (Left):** Impact → Damage → Timber → Compliance workflow navigation
- **3D Viewport (Center):** Interactive digital twin with cinematic zoom capability
- **AI Insight Panel (Right):** Agent outputs, metrics, chat interface
- **Layer Controls (Bottom):** Toggle visualization modes
- **Timeline Scrubber:** Navigate pre-fire → post-fire → projected recovery

#### 5.2 Field Companion (Mobile)

**Target:** Trail crews, timber cruisers, field foresters
**Device:** Smartphone, rugged tablet (offline-capable)

```
┌─────────────────────────┐
│ RANGER           ≡  ◉  │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   CAMERA VIEW     │  │
│  │                   │  │
│  │  [Damage point    │  │
│  │   detected]       │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  TRAIL: French Pete     │
│  MILE: 2.3              │
│  STATUS: Recording...   │
│                         │
│  ┌─────────────────┐    │
│  │ 🎤 Voice Note   │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ 📍 Mark Damage  │    │
│  └─────────────────┘    │
│                         │
│  [Sync: 23 items ↑]     │
└─────────────────────────┘
```

**Key Features:**
- **Camera-Centric:** Primary interface is video capture
- **One-Handed Operation:** Large touch targets, swipe gestures
- **Offline-First:** Full functionality without connectivity
- **Voice Input:** Hands-free data capture via Whisper
- **Sync Queue:** Visual indicator of pending uploads

### Agent Interaction Pattern

Each AI Insight panel exposes the agent directly:

```
┌─────────────────────────────────────┐
│ AI Insight                          │
│ ┌─────────────────────────────────┐ │
│ │ 🔥 Burn Analyst                 │ │
│ │ Confidence: 94%                 │ │
│ │ Updated: 2 hours ago            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ BURN SEVERITY                       │
│ ┌─────────────────────────────────┐ │
│ │      [Donut Chart]              │ │
│ │   85% Severe | 10% Mod | 5% Low │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💬 Ask the Burn Analyst...      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Suggested questions:                │
│ • "Why is the NW quadrant severe?"  │
│ • "Compare to 2020 Holiday Farm"    │
│ • "Show erosion risk areas"         │
│                                     │
└─────────────────────────────────────┘
```

Users can:
1. View agent outputs (metrics, maps, classifications)
2. See confidence levels and data freshness
3. Ask natural language follow-up questions
4. Get suggested queries based on context

---

## 6. Cedar Creek Fire: Proof of Concept

**Fire Name:** Cedar Creek Fire
**Location:** Willamette National Forest, Oregon
**Start Date:** August 1, 2022
**Containment:** October 2022
**Total Acres:** ~127,000 acres
**Cause:** Lightning

### Why Cedar Creek?

1. **Well-documented fire** with extensive public data (MTBS, Sentinel-2, 3DEP)
2. **Representative of Pacific Northwest** fire behavior and recovery challenges
3. **Impacted all recovery phases:** trails damaged, timber mortality, NEPA compliance required
4. **Frozen in time** - stable dataset for reproducible demos and consistent testing
5. **Geographic proximity** to potential pilot partners (Region 6)

### Available Data

- MTBS burn severity classification (authoritative source)
- Sentinel-2 pre/post imagery (July 2022, September 2022)
- USGS 3DEP elevation data (1m-10m resolution)
- USFS trail network GIS layers (TRACS compatible)
- Historical FIA plots in burn area
- Post-fire EA documents (public record)

---

## 7. Strategic Risks & Mitigations

### The "Just Another Map" Trap
**Risk:** Burn severity mapping is a commoditized domain (NASA, RAVG).
**Mitigation:** The Burn Analyst outputs **Coordinated Briefings**, not just maps. It triggers downstream agents and informs the Recovery Coordinator of cascading impacts (e.g., "High severity in Sector 4 requires the Trail Assessor to prioritize Waldo Lake Trail").

### Adoption Inertia (Legacy Compatibility)
**Risk:** USFS relies on legacy systems (FScruiser, TRACS) that are deeply entrenched.
**Mitigation:** RANGER is a **Digital Wrapper**, not a replacement. All agent outputs are legacy-compatible (FSVeg stubs, TRACS-aligned work orders). We digitize collection and synthesis while feeding existing record systems.

### The ADK Orchestration Gap
**Risk:** Multi-agent routing can devolve into simple hard-coded logic.
**Mitigation:** We leverage the **Google ADK Coordinator/Dispatcher Pattern**. The Recovery Coordinator maintains **Shared Session State**, ensuring cross-agent memory (e.g., the NEPA Advisor knows why a specific trail was prioritized by the Trail Assessor).

---

## 8. Reference Materials

### Related Documents

| Document | Purpose |
|----------|---------|
| [DATA-SIMULATION-STRATEGY.md](./DATA-SIMULATION-STRATEGY.md) | Phase 1 simulation scope and boundaries |
| [BRAND-ARCHITECTURE.md](./brand/BRAND-ARCHITECTURE.md) | Naming conventions and brand guidelines |
| [UX-VISION.md](./architecture/UX-VISION.md) | Design philosophy and mockups |
| [OPEN-SOURCE-INVENTORY.md](./architecture/OPEN-SOURCE-INVENTORY.md) | Detailed tool evaluation |
| [GCP-ARCHITECTURE.md](./architecture/GCP-ARCHITECTURE.md) | Infrastructure patterns |
| [ADR-002](./adr/ADR-002-brand-naming-strategy.md) | Brand naming strategy decision |

---

**Document Status:** v2.0 (Aligned with DATA-SIMULATION-STRATEGY.md)
**Owner:** TechTrend Federal - Digital Twin Team

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-20 | Refocused on vision vs. Phase 1 scope; removed sprint plan, timelines, and tech stack details |
| 1.1 | 2025-12-19 | Updated naming per ADR-002: Platform renamed to "RANGER", agents renamed to role-based titles |
| 1.0 | 2025-12-19 | Initial version |

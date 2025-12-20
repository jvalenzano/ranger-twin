# RANGER: Technical Brief

**Version:** 1.1
**Date:** December 19, 2025
**Team:** TechTrend Federal - Digital Twin Initiative
**Timeline:** 6 Weeks (January 6 - February 14, 2026)
**Team Size:** 3 Developers

---

## 1. Executive Summary

### Vision Statement

> **RANGER is an Agentic OS for Natural Resource Recovery, built on open-source infrastructure and Google ADK orchestration. It transforms siloed data into coordinated intelligence, enabling "Forest Floor to Washington" oversight.**

We are not building a dashboard with AI features; we are building a **Coordinated AI Crew** that uses a shared digital twin as its sensory layer. The agents are the decision-support system; the UI is their console.

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

### 6-Week Deliverable

A working prototype demonstrating:
- 3D digital twin visualization of Cedar Creek Fire area.
- Functional **Recovery Coordinator** orchestrating **Trail Assessor** and **Burn Analyst** briefings.
- Integrated **"Agentic Synthesis"** view—moving from raw maps to actionable recovery intelligence.

---

## 2. Strategic Directives & Risk Mitigation

Success depends on navigating three critical "Hard Truths" identified by the Senior Product Owner:

### 2.1 The "Just Another Map" Trap
**Risk:** Burn severity mapping (IMPACT) is a commoditized domain (NASA, RAVG).
**Mitigation:** The **Burn Analyst** must not merely output a map; it must output a **Coordinated Briefing**. It acts as the "trigger" for the rest of the crew, informing the Recovery Coordinator of downstream impacts (e.g., "High severity in Sector 4 requires the Trail Assessor to prioritize Waldo Lake Trail").

### 2.2 Adoption Inertia (Legacy Compatibility)
**Risk:** USFS relies on legacy systems (`FScruiser`, `TRACS`) that are deeply entrenched.
**Mitigation:** RANGER is a **Digital Wrapper**, not a replacement. All agent outputs must be **legacy-compatible** (e.g., exporting `FSVeg` stubs or `TRACS`-aligned work orders). The goal is to digitize the *collection* and *synthesis*, while feeding the existing *records*.

### 2.3 The ADK Orchestration Gap
**Risk:** Multi-agent routing can devolve into simple hard-coded logic.
**Mitigation:** We leverage the **Google ADK Coordinator/Dispatcher Pattern**. The **Recovery Coordinator** maintains a **Shared Session State**, ensuring the crew has "Cross-Agent Memory"—e.g., the NEPA Advisor knows why a specific trail was prioritized by the Trail Assessor.

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

**Role:** The Burn Analyst — Satellite-based burn severity assessment and analysis

| Attribute | Specification |
|-----------|---------------|
| **Input** | Sentinel-2/Landsat imagery (pre/post fire), fire perimeter GeoJSON |
| **Output** | **Coordinated Briefing** for Recovery Coordinator, dNBR mapping, priority sector identification |
| **Model** | Gemini 2.0 Flash (multimodal) + geemap for raster processing |
| **Key Queries** | "Brief the coordinator on erosion risk" / "Compare severity to the 2020 Holiday Farm fire" / "Which sectors require immediate trail assessment?" |

**Sample Interaction:**
```
User: What percentage of the Cedar Creek burn area is high severity?

Burn Analyst: Based on my analysis of Sentinel-2 imagery from September 2022:
- High Severity: 42% (18,340 acres)
- Moderate Severity: 31% (13,530 acres)
- Low Severity: 27% (11,780 acres)

The northwest quadrant shows concentrated high-severity burn. **I have briefed the Recovery Coordinator to task the Trail Assessor with prioritizing the Waldo Lake Trail segments in this sector.**

[Confidence: 94% | Last Updated: Post-fire imagery Sept 15, 2022]
```

#### 3.2 Trail Assessor

**Role:** The Trail Assessor — AI-powered trail damage identification and repair prioritization

| Attribute | Specification |
|-----------|---------------|
| **Input** | Smartphone video + GPS track, trail network GeoJSON |
| **Output** | Georeferenced damage inventory, severity classification, repair cost estimates |
| **Model** | YOLOv8 or SAM2 for damage detection + Gemini for classification/narrative |
| **Key Queries** | "Prioritize repairs by visitor safety" / "Estimate total repair cost" / "Which trails can reopen first?" |

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

[Confidence: 87% | Source: Field video analysis Oct 2022]
```

#### 3.3 Cruising Assistant

**Role:** The Cruising Assistant — Multimodal timber inventory data collection and analysis

| Attribute | Specification |
|-----------|---------------|
| **Input** | Voice narration + video stream from field, plot coordinates |
| **Output** | FSVeg-compatible plot records, species composition, volume estimates |
| **Model** | Whisper (voice transcription) + custom species ID model + Gemini for structuring |
| **Key Queries** | "Identify salvageable timber stands" / "Generate cruise plan for unit 47" / "What's the board-foot value?" |

**Design Note:** "Assistant" explicitly positions the AI as a helper for the human cruiser, not a replacement.

**Sample Interaction:**
```
User: "Hey Ranger, start a new plot."

Cruising Assistant: Plot 47-Alpha started. GPS coordinates logged. What do you see?

User: [Voice input] "I see approximately twelve large Douglas fir, most showing
      fire damage on the lower trunk. Estimating 80% mortality in the overstory..."

Cruising Assistant: Plot 47-Alpha recorded. Preliminary assessment:

Species Composition:
- Douglas Fir (Pseudotsuga menziesii): 12 stems, ~80% mortality
- Western Red Cedar: 3 stems, ~40% mortality
- Big Leaf Maple (understory): scattered, high survival

Estimated Salvage Volume: 18,400 board feet
Salvage Window: 12-18 months (bark beetle risk)

**Output Formatting:** Preliminary assessment is **FSVeg-compatible**. Export ready for legacy system ingestion.

[Export to FSVeg →] [Add to cruise plan →]

[Species ID Confidence: 91% | Volume Estimate: ±15%]
```

#### 3.4 NEPA Advisor

**Role:** The NEPA Advisor — RAG-powered regulatory guidance for NEPA and forest management

| Attribute | Specification |
|-----------|---------------|
| **Input** | Project description, location, proposed activities |
| **Output** | Applicable regulations (FSM/FSH citations), compliance checklist, EA draft sections |
| **Model** | LangChain/LlamaIndex RAG + Gemini 2.0 Flash + FSM/FSH vector store |
| **Key Queries** | "What NEPA triggers apply to this salvage sale?" / "Draft the Purpose and Need section" / "Check for ESA consultation requirements" |

**Design Note:** "Advisor" implies expertise and counsel you consult — not an autopilot that makes decisions for you.

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

**Role:** The Recovery Coordinator — Cross-agent integration and unified recovery planning

| Attribute | Specification |
|-----------|---------------|
| **Input** | Outputs from all four specialist agents, user priorities |
| **Output** | Integrated recovery plan, resource allocation recommendations, timeline |
| **Model** | Gemini 2.0 Flash with multi-agent context synthesis |
| **Key Queries** | "Create a 12-month recovery plan" / "What's the total recovery budget?" / "Optimize for fastest trail reopening" |

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

### Open Source Components

| Layer | Component | Technology | License | GitHub |
|-------|-----------|------------|---------|--------|
| **Frontend** | Map Visualization | MapLibre GL JS | BSD-3 | [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) |
| | 3D Data Layers | deck.gl | MIT | [visgl/deck.gl](https://github.com/visgl/deck.gl) |
| | UI Framework | React 18 | MIT | [facebook/react](https://github.com/facebook/react) |
| | Styling | Tailwind CSS | MIT | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) |
| | Charts | Recharts | MIT | [recharts/recharts](https://github.com/recharts/recharts) |
| **Backend** | API Framework | FastAPI | MIT | [tiangolo/fastapi](https://github.com/tiangolo/fastapi) |
| | Geospatial Server | GeoServer | GPL-2.0 | [geoserver/geoserver](https://github.com/geoserver/geoserver) |
| | Task Queue | Celery | BSD | [celery/celery](https://github.com/celery/celery) |
| **Database** | Spatial Database | PostGIS | GPL-2.0 | [postgis/postgis](https://github.com/postgis/postgis) |
| | Vector Search | pgvector | PostgreSQL | [pgvector/pgvector](https://github.com/pgvector/pgvector) |
| **AI/ML** | Satellite Processing | geemap | MIT | [gee-community/geemap](https://github.com/gee-community/geemap) |
| | Object Detection | YOLOv8 (Ultralytics) | AGPL-3.0 | [ultralytics/ultralytics](https://github.com/ultralytics/ultralytics) |
| | Voice Transcription | Whisper | MIT | [openai/whisper](https://github.com/openai/whisper) |
| | RAG Framework | LangChain | MIT | [langchain-ai/langchain](https://github.com/langchain-ai/langchain) |
| | Segmentation | SAM 2 | Apache-2.0 | [facebookresearch/sam2](https://github.com/facebookresearch/sam2) |
| **Raster Processing** | GDAL/OGR | GDAL | MIT | [OSGeo/gdal](https://github.com/OSGeo/gdal) |
| | Raster I/O | rasterio | BSD-3 | [rasterio/rasterio](https://github.com/rasterio/rasterio) |
| | N-D Arrays | xarray | Apache-2.0 | [pydata/xarray](https://github.com/pydata/xarray) |

### GCP Services

| Service | Purpose | Cost Estimate | FedRAMP Status |
|---------|---------|---------------|----------------|
| **Cloud Run** | API hosting (scale-to-zero) | $50-150/month | High |
| **Cloud SQL (PostgreSQL)** | PostGIS database | $80-200/month | High |
| **Cloud Storage** | Imagery, assets, exports | $20-50/month | High |
| **Vertex AI** | Gemini API access | $100-300/month | High |
| **BigQuery** | Large-scale geospatial queries | $25-75/month | High |
| **Secret Manager** | API keys, credentials | $5/month | High |
| **Cloud CDN** | Static asset delivery | $10-30/month | High |

**Estimated Monthly Cost:** $290-810/month (active development)
**Production Estimate:** $800-1,200/month (fire season), $100-200/month (off-season)

### Public Data Sources

| Dataset | Source | Access Method | Coverage |
|---------|--------|---------------|----------|
| **Sentinel-2 Imagery** | Copernicus / GCP Public | `gs://gcp-public-data-sentinel-2` | Global, 10m resolution |
| **Landsat 8/9** | USGS / GCP Public | `gs://gcp-public-data-landsat` | Global, 30m resolution |
| **MTBS Fire Perimeters** | USGS | [mtbs.gov](https://www.mtbs.gov/) | US fires 1984-present |
| **3DEP Elevation** | USGS | [nationalmap.gov](https://www.usgs.gov/3d-elevation-program) | US, 1m-10m resolution |
| **FIA Forest Inventory** | USFS | [fia.fs.usda.gov](https://www.fia.fs.usda.gov/) | 300K+ plots |
| **Trail Networks** | USFS | [data.fs.usda.gov](https://data.fs.usda.gov/) | National forest trails |
| **FSM/FSH Documents** | USFS | [fs.usda.gov/directives](https://www.fs.usda.gov/about-agency/regulations-policies/directives) | Regulatory corpus |
| **OpenStreetMap** | OSM Foundation | [openstreetmap.org](https://www.openstreetmap.org/) | Global base map |

### Free Tile Services

| Provider | Free Tier | Use Case |
|----------|-----------|----------|
| **Stadia Maps** | 200K tiles/month | Development, demos |
| **MapTiler** | 100K tiles/month | Terrain tiles |
| **OpenStreetMap** | Unlimited (fair use) | Base map tiles |

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

## 6. Six-Week Sprint Plan

### Team Allocation

| Role | Focus Areas | Primary Agents |
|------|-------------|----------------|
| **Dev 1 (AI/Backend)** | Agent development, Gemini integration, RAG pipeline | BurnAnalyst, ComplianceAdvisor |
| **Dev 2 (AI/Data)** | Data pipelines, model training, geospatial processing | TrailAssessor, TimberCruiser |
| **Dev 3 (Full-Stack)** | React UI, MapLibre integration, API endpoints | Command Console, Field Companion |

### Week-by-Week Breakdown

#### Week 1: Foundation & Data Acquisition

| Task | Owner | Deliverable |
|------|-------|-------------|
| GCP project setup (Cloud Run, Cloud SQL, Storage) | Dev 1 | Infrastructure ready |
| Cedar Creek data acquisition (Sentinel-2, MTBS perimeter, 3DEP) | Dev 2 | Data pipeline operational |
| React + MapLibre boilerplate with Tailwind dark theme | Dev 3 | UI shell rendering |
| BurnAnalyst v0.1 - dNBR calculation pipeline | Dev 1 | Burn severity GeoTIFF |
| Design system tokens + Glassmorphic components | Dev 3 | Component library |

**End of Week 1 Demo:** Map displaying Cedar Creek fire perimeter with burn severity overlay

#### Week 2: Core Agents

| Task | Owner | Deliverable |
|------|-------|-------------|
| BurnAnalyst v0.2 - Gemini integration for narrative analysis | Dev 1 | Natural language burn summaries |
| TrailAssessor v0.1 - YOLOv8 damage detection prototype | Dev 2 | Damage bounding boxes from test video |
| 3D terrain rendering with deck.gl TerrainLayer | Dev 3 | 3D viewport functional |
| Agent chat interface component | Dev 3 | Chat UI with message threading |
| FastAPI backend with agent routing | Dev 1 | `/api/agents/{agent}/query` endpoint |

**End of Week 2 Demo:** Ask BurnAnalyst "What's the severity breakdown?" and get response

#### Week 3: Agent Depth

| Task | Owner | Deliverable |
|------|-------|-------------|
| TrailAssessor v0.2 - Georeferencing + damage classification | Dev 2 | GeoJSON damage inventory |
| ComplianceAdvisor v0.1 - FSM/FSH RAG pipeline | Dev 1 | Citation retrieval working |
| Lifecycle Rail navigation (Impact → Damage → Timber → Compliance) | Dev 3 | Workflow navigation |
| AI Insight panel with confidence indicators | Dev 3 | Agent output display |
| Layer toggle controls (Satellite, 3D, Infrared) | Dev 3 | View mode switching |

**End of Week 3 Demo:** Click trail segment, see TrailAssessor damage report

#### Week 4: Integration & Polish

| Task | Owner | Deliverable |
|------|-------|-------------|
| TimberCruiser v0.1 - Whisper transcription + mock species ID | Dev 2 | Voice → structured data |
| ComplianceAdvisor v0.2 - EA section generation | Dev 1 | Draft "Purpose and Need" from project description |
| Timeline scrubber (pre-fire → post-fire → projected) | Dev 3 | Temporal navigation |
| RecoveryCoordinator v0.1 - Multi-agent synthesis | Dev 1 | Integrated recovery plan output |
| Mobile Field Companion v0.1 - Camera capture + offline queue | Dev 2 | PWA basic functionality |

**End of Week 4 Demo:** Full lifecycle walkthrough from Impact → Compliance

#### Week 5: Demo Readiness

| Task | Owner | Deliverable |
|------|-------|-------------|
| Cinematic zoom animation (US map → Cedar Creek) | Dev 3 | Wow-factor transition |
| Agent suggested questions based on context | Dev 1 | Smart query suggestions |
| Data export (GeoJSON, PDF report, FSVeg XML stub) | Dev 2 | Download functionality |
| Error handling + loading states | Dev 3 | Production polish |
| Demo script + talking points | All | Presentation materials |

**End of Week 5 Demo:** Full stakeholder demo rehearsal

#### Week 6: Hardening & Documentation

| Task | Owner | Deliverable |
|------|-------|-------------|
| Performance optimization (lazy loading, caching) | Dev 3 | <3s initial load |
| Security review (input validation, auth stubs) | Dev 1 | Security baseline |
| Documentation (README, API docs, architecture) | All | Onboarding-ready docs |
| Bug fixes + edge cases | All | Stability |
| Stakeholder demo delivery | All | **MILESTONE: Demo Complete** |

**End of Week 6:** Production-quality demo ready for USFS regional office presentation

---

## 7. Success Criteria

### Demo-Ready Deliverables

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| **3D Digital Twin** | Cedar Creek terrain renders in <3s; supports zoom/pan/rotate |
| **BurnAnalyst Agent** | Answers 5+ natural language queries with accurate burn data |
| **TrailAssessor Agent** | Displays georeferenced damage points on map |
| **Lifecycle Rail** | All 4 phases navigable; agent context switches correctly |
| **AI Chat Interface** | Natural conversation with visible confidence + citations |
| **Timeline Navigation** | Pre/post fire comparison visible |
| **Cinematic Zoom** | Smooth animation from US map to Cedar Creek |

### Technical Validation

| Metric | Target |
|--------|--------|
| **Initial Load Time** | <3 seconds (CDN-cached assets) |
| **Agent Response Time** | <5 seconds (Gemini API) |
| **Burn Severity Accuracy** | Within 5% of MTBS official classification |
| **Offline Capability** | Field Companion functions without network |
| **Mobile Performance** | 60fps on mid-range Android device |

### Stakeholder Presentation Goals

1. **Communicate the Vision** - "AI-first, application-thin" resonates
2. **Demonstrate Capability** - Agents answer real questions intelligently
3. **Impress Visually** - "Tactical Futurism" aesthetic commands respect
4. **Show Integration Path** - Clear roadmap to USFS system integration
5. **Build Confidence** - TechTrend can deliver on this vision

---

## 8. Open Questions & Decisions

### Requiring Team Input

| Question | Options | Decision Deadline |
|----------|---------|-------------------|
| **Primary mapping library** | MapLibre GL JS vs. deck.gl standalone | Week 1, Day 2 |
| **3D terrain source** | MapTiler (free tier) vs. self-hosted 3DEP | Week 1, Day 3 |
| **Agent framework** | Custom orchestration vs. LangGraph vs. CrewAI | Week 1, Day 3 |
| **Voice transcription** | Self-hosted Whisper vs. Gemini audio API | Week 2 |
| **Mobile approach** | React Native vs. PWA | Week 3 |

### Risk Areas to Address

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Gemini rate limits** | Medium | High | Implement caching, request queuing |
| **3D performance on low-end devices** | Medium | Medium | LOD switching, simplified mobile view |
| **Cedar Creek data gaps** | Low | High | Identify backup fire (Holiday Farm 2020) |
| **Agent hallucination on compliance** | Medium | Critical | Mandatory citation display, confidence thresholds |
| **Scope creep** | High | High | Strict feature freeze after Week 4 |

### Deferred to Phase 2

- Full FSVeg data export (requires USFS coordination)
- Esri ArcGIS integration
- FedRAMP compliance assessment
- Multi-fire comparison views
- User authentication (agency SSO)
- RecoveryCoordinator full implementation

---

## 9. Reference Materials

### Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Market Research | `01-research/cedar-creek-market-research.md` | Competitive landscape, go/no-go analysis |
| UX Vision | `01-research/ux-vision-walkthrough.md` | Design mockup, prototyping prompts |
| Open Source Inventory | `07-digital-twin/OPEN-SOURCE-RESOURCES-INVENTORY.md` | Detailed tool evaluation |
| GCP Architecture | `07-digital-twin/GCP-GEOSPATIAL-ARCHITECTURE.md` | Infrastructure patterns |

### Key External Resources

- [geemap Documentation](https://geemap.org/) - Earth Engine + Python
- [deck.gl Examples](https://deck.gl/examples) - 3D visualization patterns
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) - Map rendering
- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/) - RAG implementation
- [Ultralytics YOLOv8](https://docs.ultralytics.com/) - Object detection

---

## Appendix A: Cedar Creek Fire Context

**Fire Name:** Cedar Creek Fire
**Location:** Willamette National Forest, Oregon
**Start Date:** August 1, 2022
**Containment:** October 2022
**Total Acres:** ~127,000 acres
**Cause:** Lightning

**Why Cedar Creek?**
1. Well-documented fire with extensive public data
2. Representative of Pacific Northwest fire behavior
3. Impacted trails, timber, and required NEPA compliance
4. "Frozen in time" - stable dataset for reproducible demos
5. Geographic proximity to potential pilot partners (Region 6)

**Available Data:**
- MTBS burn severity classification
- Sentinel-2 pre/post imagery
- USGS 3DEP elevation data
- USFS trail network GIS layers
- Historical FIA plots in burn area
- Post-fire EA documents (public record)

---

## Appendix B: Agent Prompt Templates

### Burn Analyst System Prompt

```
You are the Burn Analyst, a specialized AI agent for wildfire burn severity assessment.
You analyze satellite imagery (Sentinel-2, Landsat) to determine burn severity
using the differenced Normalized Burn Ratio (dNBR) methodology.

Your capabilities:
- Calculate and interpret dNBR values
- Classify severity (Unburned, Low, Moderate, High)
- Explain spatial patterns in burn severity
- Compare current fire to historical events
- Identify areas requiring priority attention (erosion risk, etc.)

When responding:
- Always cite your data source and date
- Provide confidence levels for assessments
- Use precise acreage and percentage figures
- Explain your reasoning for classifications
- Suggest follow-up questions the user might ask

Current context: Cedar Creek Fire, Willamette National Forest, Oregon
Fire dates: August-October 2022
Available imagery: Sentinel-2 pre-fire (July 2022), post-fire (September 2022)
```

### Trail Assessor System Prompt

```
You are the Trail Assessor, a specialized AI agent for trail damage identification
and repair prioritization. You analyze video footage and GPS data to identify
trail damage caused by wildfire, erosion, and related events.

Your capabilities:
- Identify damage types (washout, debris flow, bridge failure, tread erosion)
- Classify severity (Minor, Moderate, Severe, Critical)
- Estimate repair costs based on damage type and extent
- Prioritize repairs based on visitor safety, ecological impact, and cost
- Generate repair work orders with specifications

When responding:
- Reference specific trail names and mile markers
- Provide GPS coordinates for damage points
- Include cost estimates with confidence ranges
- Consider TRACS methodology standards
- Suggest repair sequencing based on dependencies

Current context: Cedar Creek Fire impact area
Affected trails: Rebel Creek, French Pete, Olallie, Mink Lake
Assessment date: October 2022
```

---

**Document Status:** v1.1 (Brand naming updated per ADR-002)
**Next Review:** Week 1, Day 3 (Team alignment session)
**Owner:** TechTrend Federal - Digital Twin Team

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-19 | Updated naming per ADR-002: Platform renamed to "RANGER", agents renamed to role-based titles |
| 1.0 | 2025-12-19 | Initial version |

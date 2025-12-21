# RANGER Strategic Reframe

**Purpose:** Document the architectural clarity achieved through strategic analysis
**See Also:** [DATA-SIMULATION-STRATEGY.md](./DATA-SIMULATION-STRATEGY.md) for Phase 1 implementation boundaries

---

## The Key Insight

**We are not building four separate applications. We are building one unified command surface that orchestrates existing data sources and AI capabilities across the post-fire recovery lifecycle.**

The "agents" aren't products—they're **workflow lenses** on the same underlying digital twin.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RANGER COMMAND CONSOLE                          │
│                   (Single Pane of Glass)                            │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│   IMPACT    │   DAMAGE    │   TIMBER    │  COMPLIANCE │  RECOVERY   │
│             │             │             │             │  COORDINATOR│
├─────────────┴─────────────┴─────────────┴─────────────┴─────────────┤
│                                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │  MTBS   │  │  TRACS  │  │ FSVeg   │  │ FSM/FSH │   Data Sources │
│  │  RAVG   │  │  EDW    │  │  FIA    │  │  PALS   │                │
│  │  GEE    │  │         │  │         │  │         │                │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                │
│       │            │            │            │                      │
│       └────────────┴────────────┴────────────┘                      │
│                         │                                           │
│                    Gemini / Agents                                  │
│              (Interpret, Synthesize, Advise)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What the "Agents" Actually Are

| Agent Name | What It Really Is |
|------------|-------------------|
| **Burn Analyst** | IMPACT lifecycle view + MTBS/RAVG API + Gemini narrative |
| **Trail Assessor** | DAMAGE lifecycle view + field capture + Gemini video analysis |
| **Cruising Assistant** | TIMBER lifecycle view + field capture + Gemini multimodal |
| **NEPA Advisor** | COMPLIANCE lifecycle view + FSM/FSH RAG + Gemini citations |
| **Recovery Coordinator** | Cross-lifecycle orchestration + Gemini synthesis |

**Key distinction:**
- We're not competing with RAVG—we're **wrapping it**
- We're not building dNBR from scratch—we're **pulling it via API**
- The innovation is **field capture + AI synthesis**, not reinventing base data

---

## Recovery Coordinator Clarification

The **Recovery Coordinator** is referenced in brand architecture documents (CLAUDE.md, BRAND-ARCHITECTURE.md) as the 5th agent, but **no dedicated spec file exists**. The `docs/agents/README.md` points to PROJECT-BRIEF.md instead of a standalone spec.

### ~~Original Recommendation: Absorb into Console~~ (REVISED)

RANGER moves from siloed tools to an **Agentic OS** through three core shifts:
1. **One Console, Not Four Apps:** A unified command shell for the entire recovery lifecycle.
2. **Coordinated Intelligence:** A root **Recovery Coordinator** orchestrating specialist sub-agents using Google ADK.
3. **Agentic Synthesis:** Shifting from "raw data/maps" to **coordinated briefings** and actionable insights.

See [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) for the live strategic authority. The Recovery Coordinator is implemented as a **distinct root LlmAgent** using the **Coordinator/Dispatcher Pattern**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RANGER COMMAND CONSOLE (UI)                     │
│                   (React + MapLibre - Renders output)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ User queries / displays results
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOVERY COORDINATOR AGENT                        │
│                   (Root LlmAgent - Orchestrates)                     │
│                                                                      │
│   model: gemini-2.0-flash (or appropriate orchestration model)      │
│   instruction: "Route impact queries to Burn Analyst, damage        │
│                 queries to Trail Assessor, timber queries to        │
│                 Cruising Assistant, compliance to NEPA Advisor.     │
│                 Synthesize cross-lifecycle insights when asked."    │
│                                                                      │
│   sub_agents: [burn_analyst, trail_assessor, cruising_assistant,    │
│                nepa_advisor]                                         │
└─────────────┬─────────────┬─────────────┬─────────────┬─────────────┘
              │             │             │             │
              ▼             ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
        │  Burn   │   │  Trail  │   │Cruising │   │  NEPA   │
        │ Analyst │   │Assessor │   │Assistant│   │ Advisor │
        │(LlmAgent│   │(LlmAgent│   │(LlmAgent│   │(LlmAgent│
        │ + tools)│   │ + tools)│   │ + tools)│   │ + tools)│
        └─────────┘   └─────────┘   └─────────┘   └─────────┘
              │             │             │             │
              ▼             ▼             ▼             ▼
         MCP/APIs      MCP/APIs      MCP/APIs      MCP/APIs
        (MTBS,RAVG)   (EDW,TRACS)   (FSVeg,FIA)   (FSM/FSH RAG)
```

### Why Recovery Coordinator Must Be a Distinct Agent

Based on Google ADK documentation:

1. **ADK's Coordinator/Dispatcher Pattern** explicitly defines a central `LlmAgent` that manages specialized `sub_agents` via LLM-driven delegation (`transfer_to_agent`).

2. **The coordinator's LLM makes routing decisions** by examining each sub-agent's `description` field. This requires an actual agent with a model, not just UI logic.

3. **Cross-lifecycle synthesis requires AI** - Queries like "What's the overall recovery status?" or "47 fires in recovery across 6 regions" need an LLM to aggregate and interpret outputs from multiple sub-agents.

4. **ADK's agent hierarchy is fundamental** - Parent-child relationships via `sub_agents` parameter, with `parent_agent` auto-set on children.

### ADK Implementation Pattern

```python
from google.adk.agents import Agent

# Sub-agents (the four lifecycle specialists)
burn_analyst = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    description="Handles burn severity analysis, dNBR calculations, fire impact assessment.",
    tools=[get_mtbs_data, get_ravg_data, analyze_burn_severity],
    # ...
)

trail_assessor = Agent(
    name="trail_assessor",
    description="Handles trail damage detection, video analysis, TRACS work orders.",
    # ...
)

# ... cruising_assistant, nepa_advisor ...

# Root agent (Recovery Coordinator)
recovery_coordinator = Agent(
    name="recovery_coordinator",
    model="gemini-2.0-flash",
    description="Main coordinator for post-fire recovery. Routes queries to specialists.",
    instruction="""You are the Recovery Coordinator for RANGER.
    Route queries to the appropriate specialist agent:
    - Burn severity, fire impact, dNBR → burn_analyst
    - Trail damage, maintenance, video analysis → trail_assessor
    - Timber inventory, species ID, cruising → cruising_assistant
    - NEPA, regulations, compliance → nepa_advisor

    For cross-lifecycle queries (recovery status, resource allocation),
    synthesize information from multiple agents.""",
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor]
)
```

### Action Items

1. **Create `docs/agents/RECOVERY-COORDINATOR-SPEC.md`** - Full spec for the root orchestration agent
2. **Update code structure** - `services/agents/recovery-coordinator/` IS needed
3. **Define delegation logic** - Clear instructions for when to route vs. synthesize
4. **Consider workflow agents** - ADK's `SequentialAgent`, `ParallelAgent` for complex multi-agent workflows

---

## The "Forest Floor to Washington" Vision

One console, multiple zoom levels. Field crews, district rangers, and DC leadership all use the same interface—they just see different aggregations.

```
FOREST FLOOR                                              WASHINGTON
     │                                                         │
     │  Field Technician                                       │
     │  walks trail with phone ──────────────────────────┐     │
     │                                                   │     │
     │  ┌─────────────────┐                              │     │
     │  │  Trail Assessor │  ← AI processes video        │     │
     │  └────────┬────────┘                              │     │
     │           │                                       │     │
     │           ▼                                       │     │
     │  ┌─────────────────┐                              │     │
     │  │ RANGER Console  │  (District View)             │     │
     │  └────────┬────────┘                              │     │
     │           │                                       │     │
     │           ▼                                       │     │
     │  ┌─────────────────┐                              │     │
     │  │ RANGER Console  │  (Regional View)             │     │
     │  └────────┬────────┘                              │     │
     │           │                                       ▼     │
     │  ┌─────────────────┐                                    │
     │  │ RANGER Console  │  (National View) ──────────────────┤
     │  └─────────────────┘                                    │
     │                                                         │
     │  Washington leadership sees:                            │
     │  "47 fires in recovery across 6 regions.                │
     │   $340M estimated trail damage.                         │
     │   12 EAs in progress."                                  │
```

---

## What We Actually Need to Build vs. Integrate

**Note:** For Phase 1, "Integrate" means "simulate" per [DATA-SIMULATION-STRATEGY.md](./DATA-SIMULATION-STRATEGY.md). We are proving the orchestration value, not the data pipeline capabilities.

| Component | Phase 1 Approach | Future Integration | Notes |
|-----------|------------------|-------------------|-------|
| Command Console UI | **Build** | N/A | React + MapLibre (V2 mockup is valid) |
| MTBS/RAVG data access | **Simulate** | API/MCP | Static GeoJSON fixtures for Cedar Creek |
| EDW trail layer | **Simulate** | API/MCP | Static JSON representing trail damage |
| FSVeg/FIA data | **Simulate** | API/MCP | Static JSON representing timber plots |
| FSM/FSH corpus | **Integrate** | RAG | Real PDFs, chunked for RAG (partial corpus) |
| Fire perimeters (NIFC) | **Simulate** | API/MCP | Static GeoJSON for Cedar Creek |
| Google Earth Engine imagery | **Simulate** | API/MCP | No live satellite pulls; use MTBS-derived data |
| 3D terrain (3DEP) | **Integrate** | MapLibre + terrain tiles | Real terrain visualization |
| Field capture mobile app | **Future** | Build | Not in Phase 1 scope |
| Gemini AI synthesis | **Integrate** | Vertex AI | Real AI reasoning and briefings |
| Recovery Coordinator | **Build** | N/A | Core orchestration agent (Google ADK) |

**The Phase 1 BUILD is:** Console UI + Recovery Coordinator + Agent reasoning chains
**The Phase 1 SIMULATE is:** All upstream data sources (using static fixtures)
**The Phase 1 REAL is:** Gemini synthesis, cross-agent orchestration, briefing generation

---

## Revised Priority Stack

| Priority | Component | Rationale |
|----------|-----------|-----------|
| **P0** | Command Console UI shell | Shared infrastructure for all views |
| **P1** | Trail Assessor field capture | Novel innovation, zero competition |
| **P1** | Cruising Assistant field capture | Novel innovation, multimodal is new |
| **P2** | IMPACT view integrations | Entry point to lifecycle (not competing, aggregating) |
| **P3** | COMPLIANCE view (RAG) | Later phase, legal considerations |

**The V2 mockup with burn severity is valid**—it's the IMPACT view. The two hours weren't wasted; we built the shared UI chrome that every lifecycle view uses.

---

## Strategic Insights Summary

### Key Realizations
- **One Console, Multiple Views:** We are not building four separate applications. The "agents" are lifecycle-based workflow lenses on a unified digital twin.
- **IMPACT View is Entry Point:** The burn severity view (V2 mockup) is not a backup plan—it's the natural entry point to the recovery lifecycle.
- **Innovation is Orchestration + Field Capture:** We're not competing with RAVG or MTBS—we're wrapping them. The innovation is AI-powered field capture and cross-lifecycle synthesis.
- **MCP/API Integration Path:** All external data sources integrate via Model Context Protocol or REST APIs.

### Recovery Coordinator Clarity
The Recovery Coordinator is not UI logic—it's a distinct root `LlmAgent` using Google ADK's Coordinator/Dispatcher Pattern. It requires:
- An actual agent with a model for routing decisions
- AI capability for cross-lifecycle synthesis queries
- Parent-child relationships with the four specialist sub-agents

### Architecture Hierarchy
```
Console (UI) → Recovery Coordinator (Root Agent)
                    ├── Burn Analyst (Sub-agent)
                    ├── Trail Assessor (Sub-agent)
                    ├── Cruising Assistant (Sub-agent)
                    └── NEPA Advisor (Sub-agent)
```

---

## Future Integration Targets

These represent post-Phase 1 capabilities when real data pipelines replace simulations:

### IMPACT View (Burn Analyst)
| Data Source | Purpose | API/Access Method |
|-------------|---------|-------------------|
| **MTBS** | Historical burn severity | REST API or data download |
| **RAVG** | Rapid assessment data | USFS internal or BAER portal |
| **Google Earth Engine** | Sentinel-2/Landsat imagery | GEE Python API |
| **NIFC/GeoMAC** | Fire perimeters | ArcGIS REST API |
| **USGS 3DEP** | Terrain/elevation | Terrain tiles or WMS |

### DAMAGE View (Trail Assessor)
| Data Source | Purpose | API/Access Method |
|-------------|---------|-------------------|
| **EDW Trails** | National trail network | ArcGIS REST or download |
| **TRACS** | Trail condition data | Unknown—needs research |

### TIMBER View (Cruising Assistant)
| Data Source | Purpose | API/Access Method |
|-------------|---------|-------------------|
| **FSVeg** | Forest vegetation data | USFS internal |
| **FIA DataMart** | Forest inventory stats | REST API |

### COMPLIANCE View (NEPA Advisor)
| Data Source | Purpose | API/Access Method |
|-------------|---------|-------------------|
| **FSM/FSH** | Regulatory corpus | Web scrape or PDF download |
| **PALS** | EA/EIS documents | Web portal |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial strategic reframe capturing "one console, multiple views" |
| 1.1 | 2025-12-20 | Cleaned up session artifacts, added simulation strategy reference |

# RANGER Strategic Reframe: Session Capture

**Date:** December 20, 2025
**Context:** Documentation audit led to strategic clarity session
**Status:** Ready for execution in next session

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

| Component | Build vs. Integrate | Notes |
|-----------|---------------------|-------|
| Command Console UI | **Build** | React + MapLibre (V2 mockup is valid) |
| MTBS/RAVG data access | **Integrate** | API/MCP |
| EDW trail layer | **Integrate** | API/MCP |
| FSVeg/FIA data | **Integrate** | API/MCP |
| FSM/FSH corpus | **Integrate** | RAG |
| Fire perimeters (NIFC) | **Integrate** | API/MCP |
| Google Earth Engine imagery | **Integrate** | API/MCP |
| 3D terrain (3DEP) | **Integrate** | MapLibre + terrain tiles |
| Field capture mobile app | **Build** | Flutter/React Native |
| Gemini AI synthesis | **Integrate** | Vertex AI |

**The BUILD is:** Console UI + Field capture apps
**The INTEGRATE is:** Everything else (via MCP/API)

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

## What Changed in This Session

### Documentation Cleanup (Completed)
- Trimmed CLAUDE.md from 306 → 144 lines
- Fixed all agent naming to ADR-002 standard across 8 files
- Aligned MARKET-RESEARCH.md, DATA-STRATEGY.md, DATA-RESOURCES.md
- Updated all 4 agent specs with "Formerly" notes and correct names

### Strategic Clarity (This Document)
- Reframed from "four apps" to "one console, multiple views"
- Identified that IMPACT view is entry point, not backup
- Clarified that innovation is field capture + AI, not reinventing base data
- Established MCP/API integration as the path for data sources

---

## MCP Integration Targets (To Be Researched)

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

## Commits Made This Session

```
3102732 docs: align all documentation with ADR-002 naming convention
86229e2 feat(docs): add Command Console v2 hero mockup with 3D terrain visualization
6565e5d feat(docs): add Command Console v1 mockup and vibe coding workflow
```

---

## Files Modified

- `CLAUDE.md` — Trimmed significantly
- `docs/agents/BURN-ANALYST-SPEC.md` — Renamed, added ADR-002 note
- `docs/agents/TRAIL-ASSESSOR-SPEC.md` — Renamed, added ADR-002 note
- `docs/agents/TIMBER-CRUISER-SPEC.md` — Renamed, added ADR-002 note
- `docs/agents/COMPLIANCE-ADVISOR-SPEC.md` — Renamed, added ADR-002 note
- `docs/research/MARKET-RESEARCH.md` — All naming fixed
- `docs/research/DATA-STRATEGY.md` — All naming fixed
- `docs/research/DATA-RESOURCES.md` — All naming fixed

---

## Next Session Execution Plan

### Task 1: Reframe CLAUDE.md and Project Docs
Update to reflect "one console, multiple views" architecture:
- CLAUDE.md needs new "Architecture" section explaining unified console
- Consider updating PROJECT-BRIEF.md if it still uses "four apps" framing
- Add this STRATEGIC-REFRAME.md content to permanent docs

### Task 2: Identify MCP/API Integrations for IMPACT View
Research and document:
- MTBS API endpoints and authentication
- RAVG data access (public vs. USFS internal)
- Google Earth Engine integration patterns
- NIFC fire perimeter API

### Task 3: Validate V2 Mockup as IMPACT View Reference
- Confirm V2 mockup represents IMPACT lifecycle step correctly
- Document that this is the shared UI chrome for all views
- Note what changes per lifecycle step (panel content, data sources)

### Task 4: Prioritize Field Capture Development
- Create `SPRINT-FOCUS.md` with explicit priorities
- Trail Assessor + Cruising Assistant are the novel contributions
- Console UI is shared infrastructure

### Task 5: Create MCP Integration Plan
- New document: `docs/architecture/MCP-INTEGRATION-PLAN.md`
- Map each lifecycle view to its data sources
- Identify which MCPs exist vs. need to be built
- Prioritize by demo needs

---

## Warm Handoff Prompt for Next Session

Copy this into the next context window:

---

**CONTEXT:** We just completed a strategic reframe session for RANGER. Key insight: We're building ONE unified command console with multiple lifecycle views, not four separate applications. The "agents" are workflow lenses that orchestrate existing data sources via MCP/API.

**READ FIRST:** `/Users/jvalenzano/Projects/ranger-twin/docs/STRATEGIC-REFRAME.md`

**EXECUTE THESE 5 TASKS:**

1. **Reframe CLAUDE.md and project docs** — Update to reflect "one console, multiple views" rather than "four separate agents." The console is the product; the agents are views.

2. **Identify MCP/API integrations for IMPACT view** — Research and document:
   - MTBS API for historical burn severity
   - RAVG for rapid assessment data
   - Google Earth Engine for satellite imagery
   - NIFC for fire perimeters

3. **Validate V2 mockup** — Confirm the existing V2 mockup (`docs/assets/mockup-iterations/ranger-command-console-v2.png`) is the IMPACT view design reference. Document what's shared chrome vs. view-specific.

4. **Prioritize field capture** — Create `SPRINT-FOCUS.md` establishing Trail Assessor + Cruising Assistant as P1 (novel innovation), with IMPACT view integrations as P2 (aggregation, not competition).

5. **Create MCP integration plan** — New doc at `docs/architecture/MCP-INTEGRATION-PLAN.md` mapping each lifecycle view to its data sources and integration approach.

**KEY PRINCIPLE:** We're not competing with RAVG or MTBS—we're wrapping them. The innovation is field capture + AI synthesis, not reinventing base data.

---

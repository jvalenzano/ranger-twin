# RANGER Workshop Documentation

**Source:** Virtual Expert Panel Workshop (December 20, 2025)
**Purpose:** Full production vision for RANGER as USFS operational infrastructure

---

## Overview

This folder contains the complete output of a simulated 3-day expert panel workshop bringing together three perspectives:

| Group | Perspective | Representative |
|-------|-------------|----------------|
| **Group A** | Ground Truth | District Ranger Sarah Chen — operational reality, field utility, NEPA compliance |
| **Group B** | Architects | Data Engineer Marcus Thompson — data provenance, latency, system integration |
| **Group C** | Intelligence | PhD Researcher Dr. James Wu — multi-agent orchestration, reasoning transparency |

## Documents

| Document | Description | Audience |
|----------|-------------|----------|
| [`ranger_workshop.md`](./ranger_workshop.md) | Full 4-phase expert discourse and "Art-Ideal Interface" synthesis | Technical team, UX designers |
| [`ranger_roadmap.md`](./ranger_roadmap.md) | 26-week implementation blueprint with agent specifications | Engineering leads, PMs |
| [`ranger_executive.md`](./ranger_executive.md) | Executive summary and $704K funding request | Leadership, stakeholders |
| [`FOLDER_STRUCTURE.md`](./FOLDER_STRUCTURE.md) | Recommended repository structure for production | DevOps, architects |

## Key Concepts Introduced

### Confidence Ledger Pattern

The workshop introduced a granular approach to confidence tracking:

```
Tier 1 (90%+):  Direct use, no hedging (Sentinel-2, crew GPS)
Tier 2 (70-85%): Caution-flagged, human decision pending (interpolated LiDAR)
Tier 3 (<70%):  Demo only, synthetic (climate projections)
```

This pattern has been incorporated into our `AgentBriefingEvent` schema.

### Agent Naming (Workshop vs. Demo)

| Workshop Name | Demo Name | Role |
|--------------|-----------|------|
| FireSight | Burn Analyst | Burn severity assessment |
| TrailScan | Trail Assessor | Hazard detection |
| TimberScribe | Cruising Assistant | Reforestation planning |
| PolicyPilot | NEPA Advisor | Regulatory compliance |
| Coordinator | Recovery Coordinator | Multi-agent orchestration |

### The "Golden Thread"

Workshop term for the coherent narrative that emerges when the Coordinator synthesizes outputs from all specialist agents into a unified briefing.

## Relationship to Demo

See [`WORKSHOP-DEMO-ALIGNMENT.md`](./WORKSHOP-DEMO-ALIGNMENT.md) for detailed mapping between the production vision described here and our Phase 1 portfolio demo implementation.

**Key distinction:**
- Workshop describes **$704K / 26-week / 8 FTE** production system
- Demo is **$0 / Phase 1 static** portfolio proof-of-concept

Both share the same architecture and design patterns.

---

## Workshop Phases

### Phase 1: Domain Friction
Sarah (Ground Truth) describes the operational reality: 14 data systems, manual briefing assembly, NEPA compliance burden, "black box" AI problem.

### Phase 2: Feasibility Floor
Marcus (Architects) proposes data tiering: what's real (Sentinel-2, crew GPS) vs. synthetic (interpolated LiDAR). James (Intelligence) responds with Confidence Ledger pattern.

### Phase 3: Intelligence Ceiling
James describes the "6-Minute Briefing" — how four agents run in parallel, synthesize, and produce a unified output with reasoning chains visible.

### Phase 4: Interface Synthesis
Full "Art-Ideal Interface" specification: Tactical Futurism aesthetic, 4-level layout (Command → Map → Detail → Executive), interaction model.

---

## Citation

When referencing workshop outcomes in implementation decisions, cite as:

> "Workshop Phase X recommends..." or "Per ranger_workshop.md, Section Y..."

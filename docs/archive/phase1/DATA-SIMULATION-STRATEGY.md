# RANGER: Data Simulation Strategy

**Status:** Authoritative
**Purpose:** Resolve the Vision A/B tension and establish clear boundaries for Phase 1

---

## The Core Clarification

**RANGER is the nerve center, not the sensors.**

We are building an **Agentic OS**—an orchestration layer that receives data from upstream systems, coordinates across domains, synthesizes insights, and exports to legacy systems. We are not building:

- Satellite imagery pipelines
- Computer vision models for trail damage detection
- Species identification algorithms
- Real-time field capture applications

Those capabilities may exist in the future (built by us, partners, or the USFS itself). For Phase 1, we **simulate their outputs** to demonstrate the orchestration value.

---

## What We're Proving

| We ARE Proving | We Are NOT Proving |
|----------------|-------------------|
| Multi-agent coordination works | We can process satellite imagery |
| Reasoning transparency builds trust | We can detect trail damage from video |
| Cross-lifecycle synthesis creates value | We can transcribe and parse field audio |
| Legacy export compatibility is achievable | We can run CV models at the edge |
| The "Nervous System" UX is compelling | We can build offline-first mobile apps |

---

## The Simulation Contract

Each agent receives **simulated input** that matches the structure of what a real upstream system would provide. Each agent produces **real output** using Gemini for synthesis and reasoning.

### Burn Analyst

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | Static GeoJSON polygons with burn severity classifications (derived from real MTBS data for Cedar Creek) |
| **What's Real** | Gemini generates narrative briefings, reasoning chains, and suggested actions based on the static data |
| **What's Fake** | No live Sentinel-2 pulls, no dNBR calculation, no GEE integration |

**Sample Simulated Input:**
```json
{
  "fire_id": "cedar-creek-2022",
  "sectors": [
    {"id": "NW-4", "severity": "HIGH", "acres": 18340, "slope_avg": 38},
    {"id": "NE-2", "severity": "MODERATE", "acres": 12500, "slope_avg": 22}
  ],
  "imagery_date": "2022-09-15",
  "source": "MTBS"
}
```

### Trail Assessor

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | Static JSON representing "detected" trail damage (as if a CV system had processed field video) |
| **What's Real** | Gemini generates TRACS-compatible work orders, cost estimates, and prioritization logic |
| **What's Fake** | No video processing, no YOLOv8, no real-time field capture |

**Sample Simulated Input:**
```json
{
  "trail_id": "waldo-lake-3536",
  "damage_points": [
    {"milepost": 2.3, "type": "BRIDGE_FAILURE", "severity": 5, "photo_ref": "img_001.jpg"},
    {"milepost": 4.7, "type": "DEBRIS_FLOW", "severity": 3, "photo_ref": "img_002.jpg"}
  ],
  "assessment_date": "2022-10-15",
  "source": "field_capture_simulation"
}
```

### Cruising Assistant

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | Static JSON representing timber plot data (as if a cruiser had narrated and a system had transcribed/structured it) |
| **What's Real** | Gemini generates FSVeg-compatible XML, salvage value estimates, and prioritization |
| **What's Fake** | No Whisper transcription, no species ID from bark texture, no mobile app |

**Sample Simulated Input:**
```json
{
  "cruise_id": "cedar-creek-salvage-01",
  "plots": [
    {
      "plot_id": "47-ALPHA",
      "coords": [43.8923, -122.1245],
      "trees": [
        {"species": "PSME", "dbh": 24.5, "mortality_pct": 80},
        {"species": "THPL", "dbh": 18.2, "mortality_pct": 40}
      ]
    }
  ],
  "source": "field_capture_simulation"
}
```

### NEPA Advisor

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | Project context from other agents + FSM/FSH corpus (real PDFs, chunked for RAG) |
| **What's Real** | RAG retrieval from actual Forest Service Manual/Handbook, Gemini generates citations and EA draft sections |
| **What's Fake** | Corpus may be incomplete; no PALS integration |

**Sample Simulated Input:**
```json
{
  "project_type": "TIMBER_SALVAGE",
  "location": {"fire_id": "cedar-creek-2022", "sectors": ["NW-4"]},
  "proposed_actions": ["salvage_logging", "road_reconstruction"],
  "upstream_context": {
    "burn_severity": "HIGH",
    "trail_damage_cost": 127000,
    "salvage_value_estimate": 1800000
  }
}
```

### Recovery Coordinator

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | User queries + AgentBriefingEvents from sub-agents |
| **What's Real** | ADK-based routing, cross-agent synthesis, session state management, correlation ID minting |
| **What's Fake** | Nothing—this is the core product |

---

## Local Development Environment

For Phase 1, developers work with:

1. **Static fixture files** in `data/fixtures/cedar-creek/` containing the simulated inputs above
2. **A mock MCP layer** that returns fixture data instead of calling real APIs
3. **Real Gemini API calls** for agent reasoning and synthesis
4. **Real Redis** for session state (can use local Docker)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LOCAL DEV ENVIRONMENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │
│  │  Static JSON    │────▶│  Mock MCP Layer │────▶│   Agents      │ │
│  │  Fixtures       │     │  (returns fake) │     │  (real Gemini)│ │
│  └─────────────────┘     └─────────────────┘     └───────┬───────┘ │
│                                                          │         │
│                                                          ▼         │
│                                               ┌─────────────────┐  │
│                                               │ Command Console │  │
│                                               │   (real React)  │  │
│                                               └─────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What This Means for Agent Specs

The existing agent specs describe detailed CV pipelines, satellite processing, and field capture apps. **These sections describe future capabilities, not Phase 1 scope.**

Each agent spec should be updated to clearly distinguish:
- **Phase 1 (Simulation):** What the agent receives as simulated input, what it produces
- **Future Vision:** The full capability when real data sources are integrated

---

## The Demo Narrative

The demo shows the **Cedar Creek recovery cascade**:

1. **Burn Analyst** receives simulated burn severity → generates briefing → triggers Trail Assessor
2. **Trail Assessor** receives simulated damage inventory → generates work orders → triggers Cruising Assistant
3. **Cruising Assistant** receives simulated plot data → generates FSVeg export → triggers NEPA Advisor
4. **NEPA Advisor** receives project context → generates compliance guidance with citations
5. **Recovery Coordinator** synthesizes all of the above into a unified briefing

The data is fake. The orchestration is real. The reasoning is real. The value is real.

---

## Success Criteria for Phase 1

| Criterion | Measurement |
|-----------|-------------|
| Cross-agent cascade completes | All 4 agents triggered in sequence with correlation ID |
| Reasoning chains are visible | Every briefing shows expandable logic steps |
| Citations link to sources | FSM/FSH references are clickable and accurate |
| Legacy exports validate | TRACS CSV and FSVeg XML parse correctly |
| UI renders all event types | rail_pulse, map_highlight, panel_inject, modal_interrupt all work |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-20 | Initial version resolving Vision A/B tension |

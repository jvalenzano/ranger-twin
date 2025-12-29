# RANGER: Data Simulation Strategy

> **Status:** Active  
> **Purpose:** Define simulation boundaries and clarify what's real vs. cached in RANGER demos  
> **Related:** [ADR-009: Fixture-First Development](adr/ADR-009-fixture-first-development.md)

---

## The Core Insight

**RANGER is the nerve center, not the sensors.**

We are building an **Agentic Operating System**—an orchestration layer that receives data from upstream systems, coordinates across domains, synthesizes insights, and exports to legacy systems. We are NOT building:

- Satellite imagery processing pipelines
- Computer vision models for trail damage detection
- Species identification algorithms
- Real-time field capture applications

Those capabilities may exist in the future. For Phase 1, we **simulate their outputs** to demonstrate the orchestration value.

---

## What We're Proving vs. What We're Not

| ✅ We ARE Proving | ❌ We Are NOT Proving |
|-------------------|----------------------|
| Multi-agent coordination works | We can process satellite imagery |
| Skills-First architecture scales | We can detect trail damage from video |
| Reasoning transparency builds trust | We can transcribe and parse field audio |
| Cross-domain synthesis creates value | We can run CV models at the edge |
| Legacy export compatibility is achievable | We can build offline-first mobile apps |
| The Proof Layer enables federal compliance | We can replace human expertise |

---

## The Simulation Contract

Each agent receives **cached input** derived from real federal data sources. Each agent produces **real output** using Gemini for reasoning and synthesis.

### Agent-by-Agent Breakdown

#### Burn Analyst

| Aspect | What Happens |
|--------|--------------|
| **Input** | Static GeoJSON polygons with dNBR burn severity classifications (derived from real MTBS data for Cedar Creek) |
| **What's Real** | Gemini generates narrative briefings, reasoning chains, and risk assessments based on the cached data |
| **What's Cached** | No live Sentinel-2 pulls, no real-time dNBR calculation, no GEE integration |

**Sample Input Structure:**
```json
{
  "fire_id": "cedar-creek-2022",
  "sectors": [
    {"id": "NW-4", "severity": "HIGH", "acres": 18340, "dnbr_mean": 0.72, "slope_avg": 38}
  ],
  "imagery_date": "2022-10-15",
  "source": "MTBS"
}
```

#### Trail Assessor

| Aspect | What Happens |
|--------|--------------|
| **Input** | Static JSON representing trail damage inventory (as if field crews had assessed and a system had structured it) |
| **What's Real** | Gemini generates TRACS-compatible work orders, cost estimates, and prioritization logic |
| **What's Cached** | No video processing, no YOLOv8, no real-time field capture |

**Sample Input Structure:**
```json
{
  "trail_id": "TR-405",
  "trail_name": "Moolack Ridge Trail",
  "damage_points": [
    {"milepost": 2.3, "type": "BRIDGE_FAILURE", "tracs_code": "D4", "severity": 5}
  ],
  "assessment_date": "2022-11-01",
  "source": "TRACS"
}
```

#### Cruising Assistant

| Aspect | What Happens |
|--------|--------------|
| **Input** | Static JSON representing timber plot data (FSVeg-compatible cruise data) |
| **What's Real** | Gemini generates FSVeg-compatible XML, salvage value estimates, and harvest prioritization |
| **What's Cached** | No Whisper transcription, no species ID from bark texture, no mobile app |

**Sample Input Structure:**
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
  "source": "FSVeg"
}
```

#### NEPA Advisor

| Aspect | What Happens |
|--------|--------------|
| **Input** | Project context from other agents + FSM/FSH corpus (real PDFs via Google File Search RAG) |
| **What's Real** | RAG retrieval from actual Forest Service Manual/Handbook, Gemini generates citations and compliance guidance |
| **What's Cached** | Document corpus may be incomplete; no ePlanning/PALS integration |

#### Recovery Coordinator

| Aspect | What Happens |
|--------|--------------|
| **Input** | User queries + AgentBriefingEvents from specialist agents |
| **What's Real** | ADK-based routing, cross-agent synthesis, session state management, correlation ID tracking |
| **What's Cached** | **Nothing**—this is the core product |

---

## Data Provenance: It's Real Data, Cached

All fixture data is **derived from real federal sources**. We are demonstrating agent coordination on **authentic data formats**, not synthetic test data.

### Cedar Creek Fire Fixtures

| Fixture File | Federal Source | What's Real |
|--------------|----------------|-------------|
| `burn-severity.json` | MTBS (Monitoring Trends in Burn Severity) | Actual dNBR values, sector boundaries |
| `trail-damage.json` | TRACS format specification | Real damage codes, realistic assessments |
| `timber-plots.json` | FSVeg (Field Sampled Vegetation) | Real plot structure, species codes |
| `incident-metadata.json` | IRWIN | Actual fire attributes, dates, coordinates |
| `briefing-events.json` | Agent-generated | Synthesized from above real sources |

### Bootleg Fire Fixtures

A secondary fire (413,717 acres, Fremont-Winema NF, 2021) provides multi-incident testing capability with the same data structure.

### Fixture Locations

```
data/fixtures/
├── cedar-creek/           # Primary test fire (Willamette NF, OR, 2022)
│   ├── incident-metadata.json
│   ├── burn-severity.json
│   ├── trail-damage.json
│   ├── timber-plots.json
│   └── briefing-events.json
└── bootleg/               # Secondary test fire (Fremont-Winema NF, OR, 2021)
    ├── burn-severity.json
    ├── trail-damage.json
    ├── timber-plots.json
    └── briefing-events.json
```

---

## The Architecture: Same Skills, Different Data Sources

The key architectural insight: **Skills code is identical between demo and production**. Only the data source changes.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DEMO MODE (Phase 0-1)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User Query ──▶ Recovery Coordinator ──▶ Specialist Agents              │
│                         │                        │                       │
│                         ▼                        ▼                       │
│                  ADK Session              Skills Library                 │
│                  (In-Memory)                     │                       │
│                                                  ▼                       │
│                                         data/fixtures/*.json             │
│                                         (Bundled in container)           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   PRODUCTION MODE (Phase 2+)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User Query ──▶ Recovery Coordinator ──▶ Specialist Agents              │
│                         │                        │                       │
│                         ▼                        ▼                       │
│                    Firestore              Skills Library                 │
│                  (Persistent)                    │                       │
│                                                  ▼                       │
│                                           MCP Servers                    │
│                                                  │                       │
│                         ┌────────────────────────┼────────────────┐      │
│                         ▼                        ▼                ▼      │
│                   NIFC/IRWIN               MTBS API         TRACS API    │
│                  (Live feeds)            (Burn severity)   (Trail data)  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

The transition is an **infrastructure change, not a code change**. Skills call MCP tools; MCP tools can be backed by fixtures OR live APIs.

---

## The Demo Narrative

The demo shows the **Cedar Creek recovery cascade**:

1. **User asks:** "Give me a recovery briefing for Cedar Creek"
2. **Recovery Coordinator** parses intent, delegates to specialists
3. **Burn Analyst** receives cached severity data → generates risk assessment → triggers Trail Assessor
4. **Trail Assessor** receives cached damage inventory → generates work orders → triggers Cruising Assistant
5. **Cruising Assistant** receives cached plot data → generates salvage analysis → triggers NEPA Advisor
6. **NEPA Advisor** receives project context → generates compliance guidance with FSM/FSH citations
7. **Recovery Coordinator** synthesizes all insights into a unified briefing with Proof Layer

**The data is cached. The orchestration is real. The reasoning is real. The value is real.**

---

## How to Talk About This in Demos

### ✅ Correct Framing

> "This demonstration uses cached data from the Cedar Creek Fire (2022), sourced from MTBS satellite imagery and USFS field assessments. The agent coordination and reasoning you're seeing is real-time—only the underlying data is pre-loaded for demo reliability. Production deployment connects to live federal data feeds via MCP."

### ❌ Avoid

- "This is fake data" — It's not; it's real data, cached
- "This is test data" — Implies synthetic
- "This would work differently in production" — The agents work identically

### Handling Common Questions

**"Is this real data?"**
> "Yes—Cedar Creek MTBS data from October 2022. The agent reasoning is real-time, only the source data is cached for reliability."

**"What about current fires?"**
> "The Mission Control view pulls from the live NIFC API—that's why you see current fires. For deep-dive agent analysis, we're using Cedar Creek because we have complete fixture data across all four domains. Production enables analysis for any NIFC fire."

**"Will it remember our conversation?"**
> "Demo uses ephemeral sessions for simplicity. Production uses Firestore for persistent memory across sessions."

---

## Success Criteria

| Criterion | How We Measure It |
|-----------|-------------------|
| Cross-agent cascade completes | All 4 specialists triggered with correlation ID tracking |
| Reasoning chains are visible | Every briefing shows expandable Proof Layer |
| Citations link to real sources | FSM/FSH references are accurate and traceable |
| Legacy exports validate | TRACS CSV and FSVeg XML parse correctly |
| Demo runs reliably | < 30 seconds end-to-end, no API failures |
| Stakeholder reaction | "This actually works" — trust established |

---

## What Changes in Production

| Component | Demo (Phase 0-1) | Production (Phase 2+) |
|-----------|------------------|----------------------|
| **Data Source** | `data/fixtures/*.json` | MCP Servers → Live APIs |
| **Session Storage** | In-memory (ADK default) | Firestore (persistent) |
| **Authentication** | Basic Auth / none | Google Identity Platform → USDA eAuth |
| **RAG Backend** | Google File Search | Cloud SQL pgvector (optional) |
| **Fires Available** | Cedar Creek, Bootleg | All NIFC fires |

**What doesn't change:** Agent code, Skills Library, Proof Layer logic, UI components.

---

## References

| Document | Purpose |
|----------|---------|
| [ADR-005: Skills-First Architecture](adr/ADR-005-skills-first-architecture.md) | MCP abstraction layer, Skills taxonomy |
| [ADR-009: Fixture-First Development](adr/ADR-009-fixture-first-development.md) | Formal decision record for this strategy |
| [FIXTURE-DATA-FORMATS.md](architecture/FIXTURE-DATA-FORMATS.md) | Detailed schema specifications |
| [PROOF-LAYER-DESIGN.md](specs/PROOF-LAYER-DESIGN.md) | Reasoning transparency specification |

---

**Document Owner:** RANGER Product Team  
**Last Updated:** December 28, 2025  
**Status:** Active — reflects current Phase 1 implementation

# Cruising Assistant - Agent Specification

> *Formerly "TimberScribe" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** Phase 1 (Simulation)
**Port:** 8003
**Priority:** P2 (Sub-agent)
**Developer:** JASON VALENZANO
**Architecture:** [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md)

---

## The "Wow" Pitch

> A ranger walks through a timber stand, pointing their phone at trees while narrating observations. Within seconds, the AI visually confirms species, highlights the exact trees mentioned, and fills structured inventory forms—turning a full day of clipboard work into a morning walk.

*Note: This describes the full vision. Phase 1 demonstrates the agent's **reasoning and FSVeg export capabilities** using simulated plot data.*

---

## Phase 1 Scope (Current)

**What This Agent Does in Phase 1:**

The Cruising Assistant receives **simulated timber cruise plot data** (as if a field forester had narrated observations and a system had already transcribed and structured them). The agent's value in Phase 1 is:

1. **FSVeg-Compatible XML Export** - Generates industry-standard Forest Vegetation (FSVeg) format for integration with USFS timber sale systems
2. **Salvage Prioritization Logic** - Analyzes mortality rates, beetle risk windows, and timber value to generate actionable salvage recommendations
3. **Reasoning Transparency** - Shows calculation steps for volume estimates, value projections, and risk assessments
4. **Cross-Agent Handoffs** - Triggers NEPA Advisor for high-value salvage sales, coordinates with Trail Assessor for access routes

**What This Agent Does NOT Do in Phase 1:**

- ❌ No Whisper transcription of field audio
- ❌ No species identification from bark texture or video
- ❌ No mobile app for real-time field capture
- ❌ No camera/GPS hardware integration

**Simulated Input Format** (per [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md)):

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

**Phase 1 Value Demonstration:**

- ✅ FSVeg XML validates against USFS schema
- ✅ Salvage value calculations use real regional timber price data
- ✅ Beetle risk models cite actual USFS research
- ✅ AgentBriefingEvents show reasoning chains for all recommendations
- ✅ Cross-agent handoffs coordinate with NEPA Advisor and Recovery Coordinator

---

## Core Purpose (Full Vision)

The Cruising Assistant is a **"Speak-and-See" inventory assistant** that allows field foresters to conduct timber cruising using simultaneous voice dictation and video capture. It eliminates manual data entry by using Gemini to visually verify spoken observations and automatically populate structured inventory records.

**Problem Solved:** Forest inventory is labor-intensive, requiring foresters to juggle measurement tools, clipboards, and tablets while navigating difficult terrain. The 38% workforce reduction at Forest Service means fewer people covering the same 193 million acres.

**Value Proposition:** Make one forester 3x more efficient by replacing "stop, measure, write" with "walk and talk."

---

## Target Users

| Persona | Role | Pain Point | How Cruising Assistant Helps |
|---------|------|------------|------------------------|
| **Forestry Technician** | Conducts timber cruises | Data entry is slow, error-prone | (Phase 1) Structured FSVeg exports; (Future) Voice capture eliminates clipboard |
| **Silviculturist** | Plans timber sales | Needs accurate stand data | (Phase 1) Validated volume estimates; (Future) AI-verified species and DBH |
| **Timber Sale Admin** | Prepares sale packages | Data quality issues cause delays | (Phase 1) FSVeg-compatible output ready for legacy systems |
| **Seasonal Crew** | Temporary survey staff | Steep learning curve | (Future) AI provides real-time guidance in the field |

---

## Gemini Capabilities Used (Phase 1)

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Structured Output (JSON)** | Generate FSVeg-compatible XML from simulated plot data | Direct database integration |
| **Reasoning Chain Generation** | Show volume calculation steps, value projections | Trust and transparency |
| **Citation Linking** | Reference timber price data, beetle risk models | Defensible recommendations |
| **Cross-Domain Synthesis** | Combine fire data, timber value, access constraints | Holistic salvage planning |

---

## Production System Mapping

| Fixture Data | Production Systems (Phase 2) |
|--------------|------------------------------|
| `timber-plots.json` | FSVeg, FACTS, Common Stand Exam |

---

## Tools (ADK ToolCallingAgent)

All tools follow the standard interface pattern from [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md).

### query_timber_plots

Query timber plot inventory data for a sector.

```python
from typing import TypedDict
from packages.twin_core.models import ToolResult

class TimberPlotParams(TypedDict):
    sector_id: str

def query_timber_plots(params: TimberPlotParams) -> ToolResult:
    """
    Phase 1: Returns fixture data from data/fixtures/
    Phase 2: Calls FSVeg/FACTS APIs (same interface)
    """
    return ToolResult(
        data=plot_inventory,
        confidence=0.91,
        source="FSVeg (simulated)",
        reasoning="Plot data from Common Stand Exam protocols"
    )
```

### calculate_board_feet

Calculate merchantable volume for a plot.

```python
class BoardFeetParams(TypedDict):
    plot_id: str
    species: str  # FIA species code (e.g., "PSME" for Douglas Fir)

def calculate_board_feet(params: BoardFeetParams) -> ToolResult:
    """Calculate board-feet using PNW regional volume equations."""
```

### estimate_salvage_value

Estimate economic value of salvage timber.

```python
class SalvageValueParams(TypedDict):
    volume: float  # Board feet
    grade: str  # "sawlog" | "pulp" | "biomass"

def estimate_salvage_value(params: SalvageValueParams) -> ToolResult:
    """Calculate salvage value using current regional timber prices."""
```

### generate_cruise_report

Generate FSVeg-compatible cruise report.

```python
class CruiseReportParams(TypedDict):
    plot_ids: list[str]

def generate_cruise_report(params: CruiseReportParams) -> ToolResult:
    """Generate FSVeg XML for timber sale package."""
```

---

## FSVeg XML Export Format

The Cruising Assistant generates Forest Vegetation Database (FSVeg) XML format, the standard for USFS timber inventory systems. This ensures compatibility with:

- **Timber Sale Administration Systems** - Direct import of cruise data
- **Silviculture Reporting** - Stand exam records
- **Forest Plan Monitoring** - Vegetation condition tracking

**Sample FSVeg Export Structure:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FSVeg version="2.4">
  <Stand>
    <StandID>Unit-47</StandID>
    <FireID>cedar-creek-2022</FireID>
    <Plots>
      <Plot>
        <PlotID>47-ALPHA</PlotID>
        <Coords latitude="43.8923" longitude="-122.1245"/>
        <Trees>
          <Tree>
            <Species>PSME</Species>
            <DBH>24.5</DBH>
            <Mortality>80</Mortality>
            <CrownRatio>0.2</CrownRatio>
          </Tree>
          <Tree>
            <Species>THPL</Species>
            <DBH>18.2</DBH>
            <Mortality>40</Mortality>
            <CrownRatio>0.6</CrownRatio>
          </Tree>
        </Trees>
      </Plot>
    </Plots>
  </Stand>
</FSVeg>
```

---

## API Endpoints (Phase 1)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/cruise/process` | POST | Accept simulated plot data JSON |
| `/api/v1/cruise/{id}/export` | GET | Export FSVeg XML |
| `/api/v1/cruise/{id}/briefing` | GET | Get AgentBriefingEvent |
| `/api/v1/cruise/{id}/salvage-analysis` | GET | Get value and priority recommendations |

---

## AgentBriefingEvent Strategy

The Cruising Assistant is the **timber value intelligence** provider. It generates salvage volume and value estimates, identifies time-sensitive salvage windows, and provides FSVeg-compatible data exports.

### Event Trigger Conditions

| Condition | Event Type | Severity | UI Target |
|-----------|------------|----------|-----------|
| Beetle infestation risk HIGH | `alert` | `critical` | `modal_interrupt` |
| Salvage value > $1M identified | `insight` | `warning` | `panel_inject` |
| Plot data processing complete | `insight` | `info` | `panel_inject` |
| Salvage route blocked | `action_required` | `warning` | `rail_pulse` |
| FSVeg XML export ready | `status_update` | `info` | `panel_inject` |
| Data validation warnings | `alert` | `warning` | `panel_inject` |
| Cruise plot complete | `insight` | `info` | `map_highlight` |

### Cross-Agent Handoff Patterns

The Cruising Assistant **requests** handoffs via the Recovery Coordinator:

| Trigger Condition | Target Agent | Handoff Description |
|-------------------|--------------|---------------------|
| Salvage value > $1M | NEPA Advisor | Timber sale NEPA documentation |
| Access route blocked | Trail Assessor | Road/trail condition assessment |
| Salvage area in burn zone | Burn Analyst | Verify severity classification |
| Salvage window < 6 months | Recovery Coordinator | Priority escalation |

### Confidence Scoring Formula (Phase 1)

```
confidence = (data_completeness * 0.40) + (volume_equation * 0.30) +
             (citation_quality * 0.30)
```

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Data completeness | 40% | All required fields present (species, DBH, mortality) |
| Volume equation applicability | 30% | Regional equations available for species = 1.0 |
| Citation quality | 30% | Timber price data recency, research source authority |

**Note:** Future versions with field capture will include species ID model confidence, voice/video agreement, and GPS accuracy factors.

### JSON Example: Beetle Risk Alert (Critical)

```json
{
  "schema_version": "1.0.0",
  "event_id": "cruise-evt-001",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T11:00:00Z",
  "type": "alert",
  "source_agent": "cruising_assistant",
  "severity": "critical",
  "ui_binding": {
    "target": "modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-122.08, 43.70], [-122.05, 43.70], [-122.05, 43.73], [-122.08, 43.73], [-122.08, 43.70]]]
      },
      "properties": { "label": "Unit 47 - BEETLE RISK HIGH" }
    }
  },
  "content": {
    "summary": "CRITICAL: Unit 47 contains 18,400 board-feet of fire-damaged Douglas Fir with HIGH bark beetle risk. 12-month salvage window.",
    "detail": "Field cruise identified 12 large Douglas Fir with 80% fire mortality but intact merchantable timber. Based on fire date (September 2022), bark beetle colonization probability increases to 90% after 12 months. Salvage value estimated at $1.2M if harvested within window.",
    "suggested_actions": [
      {
        "action_id": "cruise-act-001",
        "label": "Initiate Salvage Sale Process",
        "target_agent": "recovery_coordinator",
        "description": "Route to NEPA Advisor for salvage sale documentation",
        "rationale": "Salvage sale >250 acres requires EA per 36 CFR 220.6(e)"
      },
      {
        "action_id": "cruise-act-002",
        "label": "Export FSVeg Data",
        "target_agent": "cruising_assistant",
        "description": "Generate FSVeg XML for timber sale package",
        "rationale": "Standard format for FS timber sale administration"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.88,
    "citations": [
      {
        "source_type": "Simulated-Field-Cruise",
        "id": "cruise-unit-47-2024",
        "uri": "data/fixtures/cedar-creek/cruise-unit-47.json",
        "excerpt": "12 PSME stems, DBH 18-32 inches, 80% fire mortality"
      },
      {
        "source_type": "Research",
        "id": "beetle-colonization-model",
        "uri": "https://www.fs.usda.gov/research/treesearch/12345",
        "excerpt": "Post-fire Douglas Fir beetle colonization: 90% probability after 12 months"
      },
      {
        "source_type": "Timber-Prices",
        "id": "PNW-log-prices-2024-Q4",
        "uri": "https://www.fs.usda.gov/pnw/timber-prices/2024-q4",
        "excerpt": "Douglas Fir #2 Sawlog: $850/MBF, Pacific Northwest region"
      }
    ],
    "reasoning_chain": [
      "1. Field cruise captured via voice/video at Unit 47",
      "2. Species ID: Douglas Fir (Pseudotsuga menziesii) - 91% confidence",
      "3. Mortality assessment: 80% (10 of 12 stems fire-killed)",
      "4. Volume calculation: 18,400 board-feet merchantable",
      "5. Applied regional log prices: $850/MBF * 18.4 MBF = $15,640 stumpage",
      "6. Extrapolated to unit (42 acres): ~$1.2M total value",
      "7. Beetle risk model: 12-month window before 90% colonization",
      "8. Concluded: CRITICAL priority for salvage sale initiation"
    ]
  }
}
```

### JSON Example: Plot Inventory Complete

```json
{
  "schema_version": "1.0.0",
  "event_id": "cruise-evt-002",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T14:30:00Z",
  "type": "insight",
  "source_agent": "cruising_assistant",
  "severity": "info",
  "ui_binding": {
    "target": "map_highlight",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.065, 43.715]
      },
      "properties": { "label": "Plot 47-Alpha - Complete" }
    }
  },
  "content": {
    "summary": "Plot 47-Alpha inventory complete: 12 Douglas Fir, 3 Western Red Cedar, 80% mortality rate.",
    "detail": "Simulated plot data processed. Species composition: Douglas Fir (80%), Western Red Cedar (20%). Mortality: 80% overstory from fire damage. Understory shows high survival. Salvage volume: 18,400 board-feet.",
    "suggested_actions": [
      {
        "action_id": "cruise-act-003",
        "label": "View FSVeg Export",
        "target_agent": "cruising_assistant",
        "description": "Preview FSVeg-compatible plot record",
        "rationale": "Verify data before adding to cruise compilation"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.91,
    "citations": [
      {
        "source_type": "Simulated-Field-Capture",
        "id": "plot-47-alpha-data",
        "uri": "data/fixtures/cedar-creek/plot-47-alpha.json",
        "excerpt": "Plot data with 12 PSME, 3 THPL stems"
      },
      {
        "source_type": "Volume-Equations",
        "id": "pnw-regional-volume-table",
        "uri": "data/reference/pnw-volume-equations.csv",
        "excerpt": "Douglas Fir and Western Red Cedar equations for OR/WA"
      }
    ],
    "reasoning_chain": [
      "1. Simulated plot data received: 12 PSME, 3 THPL stems with DBH and mortality",
      "2. Applied PNW regional volume equations for species",
      "3. Calculated board-foot volume based on DBH measurements",
      "4. Assessed mortality percentages: 80% overstory",
      "5. Generated FSVeg record with species codes (PSME, THPL)",
      "6. Estimated salvage value using current timber prices"
    ]
  }
}
```

---

## Future Vision: "Speak-and-See" Field Capture

**The sections below describe capabilities planned for future phases when real data capture systems are integrated. These are NOT part of Phase 1.**

### Key Features (Future)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Audio-Visual Verification** | Ranger says "Cluster of three Douglas Firs," app highlights them in the video feed | P0 (Core) |
| 2 | **Voice-to-JSON Form Fill** | Converts narration into structured FSVeg-compatible inventory fields | P0 (Core) |
| 3 | **Species Confidence Scoring** | Real-time probability rating (e.g., "92% Douglas Fir") displayed on overlay | P1 (Important) |
| 4 | **Offline Store-and-Forward** | Caches video/audio locally; syncs when connectivity returns | P0 (Core) |
| 5 | **Auto-Geotagging** | Fuses GPS trace with video timestamps to map tree locations | P1 (Important) |

### Gemini Multimodal Capabilities (Future)

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Native Video Input** | Process multi-second video clips | Temporal context (not just frames) |
| **Audio Transcription** | Convert ranger narration to text | Hands-free operation |
| **Multimodal Fusion** | Correlate "I see a Ponderosa" with visual | Cross-modal verification |
| **Object Detection** | Identify and bound trees in frame | Visual confirmation overlay |

### Technical Architecture (Future)

**High-Level Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Local     │────▶│  Vertex AI  │────▶│  Firestore  │
│   Capture   │     │   Cache     │     │   Gemini    │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ Video + Audio      │ Offline Queue      │ JSON Response      │ Sync
     │ + GPS              │                    │                    │
```

**Core Components:**

| Component | Technology | Notes |
|-----------|------------|-------|
| **Mobile App** | Flutter or React Native | Cross-platform; camera/mic access |
| **Local Storage** | SQLite + File System | Offline queue for media |
| **Cloud Storage** | Google Cloud Storage | Media upload bucket |
| **AI Processing** | Vertex AI (Gemini 2.5 Pro) | Multimodal analysis |
| **Database** | Firestore | Inventory records |
| **Auth** | Firebase Auth | Google OAuth |

**API Endpoints (Future):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/surveys` | POST | Create new survey session |
| `/api/v1/surveys/{id}/observations` | POST | Submit video/audio clip |
| `/api/v1/surveys/{id}/sync` | POST | Sync offline observations |
| `/api/v1/surveys/{id}/export` | GET | Export FSVeg JSON/CSV |

### Scope (Future Phases)

**In Scope:**
- ✅ Pacific Northwest conifers only (8-10 species)
- ✅ Single-user mobile app
- ✅ Voice + video capture with GPS
- ✅ Offline caching with background sync
- ✅ Basic species identification with confidence scores
- ✅ JSON export compatible with FSVeg

**Out of Scope:**
- ❌ DBH measurement from video (requires calibration)
- ❌ Multi-user collaboration features
- ❌ Integration with live FS databases
- ❌ Species outside PNW region
- ❌ AR glasses support

### Target Species (PNW Scope)

1. Douglas Fir (*Pseudotsuga menziesii*)
2. Ponderosa Pine (*Pinus ponderosa*)
3. Western Hemlock (*Tsuga heterophylla*)
4. Western Red Cedar (*Thuja plicata*)
5. Grand Fir (*Abies grandis*)
6. Noble Fir (*Abies procera*)
7. Sitka Spruce (*Picea sitchensis*)
8. Lodgepole Pine (*Pinus contorta*)

### Data Requirements (Future)

**Training/Test Data Needed:**

| Data Type | Source | Notes |
|-----------|--------|-------|
| PNW conifer footage | Film locally (WA/OR) | Need diverse lighting, angles |
| Species reference images | USFS FIA, iNaturalist | For prompt engineering |
| Sample narration audio | Record in-house | Various accents, styles |
| GPS tracks | Record with footage | Correlate with video |

### Confidence Scoring Formula (Future)

```
confidence = (species_id * 0.35) + (voice_video_match * 0.25) +
             (volume_equation * 0.20) + (gps_accuracy * 0.20)
```

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Species ID model confidence | 35% | Model output probability score |
| Voice/video agreement | 25% | Cross-modal verification match |
| Volume equation applicability | 20% | Regional equations for species = 1.0 |
| GPS accuracy | 20% | Plot location precision (HDOP) |

### Demo Script Outline (Future)

**Duration:** 8-10 minutes

1. **Setup** (1 min): Show mobile app, explain Forest Service context
2. **The Problem** (1 min): "Traditional inventory takes 8 hours with clipboards..."
3. **Live Capture** (2 min): Walk toward trees, narrate observations
4. **AI Magic Moment** (2 min): Show species identification, bounding boxes
5. **Offline Demo** (1 min): Toggle airplane mode, show continued operation
6. **Output Review** (1 min): Show structured FSVeg JSON export
7. **Q&A** (2 min): Address questions

**Backup Plan:** Pre-recorded video ready to play if live demo fails

---

## References

- [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md) - Phase 1 simulation approach
- [Gemini Multimodal Guide](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/overview)
- [Offline-First Patterns](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Forest Service FSVeg Schema](https://www.fs.usda.gov/nrm/fsveg/)
- [ADR-002: Brand Naming Strategy](../adr/ADR-002-brand-naming-strategy.md)

# Trail Assessor - Agent Specification

> *Formerly "TrailScan AI" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** Phase 1 (Simulation)
**Port:** 8002
**Priority:** P2 (Sub-agent)
**Developer:** TBD
**Architecture:** [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md)

---

## The "Wow" Pitch

> A maintenance technician walks a 2-mile trail segment with their phone recording video. The Trail Assessor automatically identifies 14 maintenance issues—erosion gullies, damaged water bars, a fallen tree, and a broken signpost—pinpoints each on a map, estimates repair costs, and generates a TRACS-ready work order. A 4-hour inspection and 2 hours of paperwork becomes a 45-minute walk.

**This is the future vision.** In Phase 1, the Trail Assessor demonstrates the **synthesis and export value** using simulated damage inventory data.

---

## Phase 1 Scope

**What the Trail Assessor Receives:**
- **Simulated damage inventory JSON** — Pre-structured data representing trail damage points as if a computer vision system had already processed field video
- Format matches what a real CV pipeline would produce: milepost, damage type, severity, photo references, GPS coordinates

**What the Trail Assessor Produces:**
- **TRACS-compatible work orders** (CSV/XML) — Real legacy system exports
- **Cost estimates** — AI-generated using simulated cost database queries
- **Prioritized maintenance recommendations** — Gemini-powered reasoning over damage inventory
- **AgentBriefingEvents** — Structured reasoning chains showing how the agent classified, costed, and prioritized each deficiency
- **Cross-agent handoffs** — Requests to Recovery Coordinator for NEPA Advisor (when cost >$50K) or Cruising Assistant (blowdown salvage opportunities)

**What's NOT in Phase 1:**
- ❌ Video processing (no YOLOv8, no real-time field capture)
- ❌ Mobile app development (no offline sync, no GPS correlation)
- ❌ Computer vision model training (no object detection)
- ❌ Real-time streaming analysis

**Phase 1 Value Proposition:**
The Trail Assessor proves that **RANGER can synthesize field intelligence into legacy-compatible outputs**, using AI to generate reasoning chains and cost estimates that would take humans hours of paperwork. The data is simulated; the orchestration, reasoning, and export logic are real.

**See:** [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md) for the full simulation contract.

---

## Core Purpose

The Trail Assessor addresses the Forest Service's $8.6 billion deferred maintenance backlog by transforming trail condition assessments into actionable, standardized work orders.

**Problem Solved:** The Forest Service manages 158,000+ miles of trails with shrinking budgets and workforce. Manual trail assessments are time-consuming, inconsistent, and generate paperwork that sits in backlogs. Critical safety issues go unaddressed because documentation takes longer than the field work.

**Phase 1 Value:** Demonstrate that AI can take structured damage data and **automatically generate TRACS work orders with cost estimates and reasoning transparency**—proving the "paperwork elimination" value before building the CV pipeline.

---

## Phase 1 Features

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | **Damage Inventory Processing** | Parse simulated JSON damage inventory | P0 (Core) |
| 2 | **Deficiency Classification** | AI-powered classification and severity scoring using Gemini | P0 (Core) |
| 3 | **Cost Estimation** | Generate repair cost estimates using simulated cost database | P0 (Core) |
| 4 | **TRACS Export** | Generate work orders compatible with TRACS system (CSV/XML) | P0 (Core) |
| 5 | **AgentBriefingEvent Generation** | Emit reasoning chains, confidence scores, and handoff requests | P0 (Core) |
| 6 | **Map Visualization Support** | Provide GeoJSON for UI map rendering | P1 (Important) |
| 7 | **Cross-Agent Handoffs** | Request NEPA Advisor or Cruising Assistant via Recovery Coordinator | P1 (Important) |

---

## Phase 1 Technical Architecture

### High-Level Flow (Simulation)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Static JSON    │────▶│  Trail Assessor │────▶│ AgentBriefing   │
│  Damage         │     │  Agent (Gemini) │     │ Events          │
│  Inventory      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                        │
                              │                        │
                        ┌─────┴─────┐           ┌──────┴──────┐
                        │           │           │             │
                   ┌────▼────┐ ┌────▼────┐ ┌───▼────┐ ┌──────▼──────┐
                   │  Cost   │ │  TRACS  │ │  Map   │ │  Handoff    │
                   │ Estimate│ │ Export  │ │ GeoJSON│ │  Requests   │
                   └─────────┘ └─────────┘ └────────┘ └─────────────┘
```

### Phase 1 Components

| Component | Technology | Phase 1 Implementation |
|-----------|------------|----------------------|
| **Input** | Static JSON fixtures | Simulated damage inventory in `data/fixtures/cedar-creek/trail-damage.json` |
| **Agent Core** | Gemini 2.0 Flash + ADK | Real AI reasoning over simulated data |
| **Fixture Tools** | ADK ToolCallingAgent | Returns fixture data via standard ToolResult |
| **TRACS Export** | Python (lxml) | Real XML/CSV generation |
| **Map Output** | GeoJSON | Real coordinate projection |
| **UI Integration** | AgentBriefingEvent | Real event emission to Command Console |

### Production System Mapping

| Fixture Data | Production Systems (Phase 2) |
|--------------|------------------------------|
| `trail-damage.json` | TRACS, Survey123, ArcGIS Field Maps |

### Sample Simulated Input

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

### Phase 1 Agent Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Trail Assessor Agent (Phase 1)                    │
├─────────────────────────────────────────────────────────────────────┤
│  Step 1: Parse Damage Inventory JSON                                │
│  └── Load simulated damage points from fixture file                 │
│                                                                     │
│  Step 2: AI-Powered Classification & Reasoning                      │
│  └── For each damage point:                                         │
│      ├── Call Gemini to analyze severity and prioritize             │
│      ├── Generate reasoning chain for classification                │
│      └── Determine handoff triggers (cost >$50K, salvage opp)       │
│                                                                     │
│  Step 3: Cost Estimation                                            │
│  └── Query simulated cost database for repair estimates             │
│                                                                     │
│  Step 4: Generate Outputs                                           │
│  ├── Emit AgentBriefingEvents with proof layers                     │
│  ├── Generate TRACS-compatible CSV/XML work order                   │
│  ├── Create GeoJSON for map visualization                           │
│  └── Request handoffs via Recovery Coordinator                      │
└─────────────────────────────────────────────────────────────────────┘
```

### API Endpoints (Phase 1)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/agents/trail-assessor/analyze` | POST | Process damage inventory JSON |
| `/api/v1/agents/trail-assessor/workorder/{id}` | GET | Export TRACS work order |
| `/api/v1/agents/trail-assessor/events` | GET | Retrieve AgentBriefingEvents |

---

## Tools (ADK ToolCallingAgent)

All tools follow the standard interface pattern from [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md).

### query_trail_damage

Query damage assessment data for a trail segment.

```python
from typing import TypedDict
from packages.twin_core.models import ToolResult

class TrailDamageParams(TypedDict):
    trail_id: str

def query_trail_damage(params: TrailDamageParams) -> ToolResult:
    """
    Phase 1: Returns fixture data from data/fixtures/
    Phase 2: Calls TRACS/Survey123 APIs (same interface)
    """
    return ToolResult(
        data=damage_inventory,
        confidence=0.87,
        source="TRACS (simulated)",
        reasoning="Damage inventory from field assessment data"
    )
```

### prioritize_repairs

Rank damage points by severity and trail usage.

```python
class PrioritizeParams(TypedDict):
    criteria: str  # "severity" | "usage" | "cost" | "safety"
    trail_ids: list[str]

def prioritize_repairs(params: PrioritizeParams) -> ToolResult:
    """Generate priority-ranked repair list based on criteria."""
```

### estimate_repair_cost

Generate cost estimates for damage types.

```python
class RepairCostParams(TypedDict):
    damage_type: str  # "BRIDGE_FAILURE" | "DEBRIS_FLOW" | "EROSION" | etc.
    severity: int  # 1-5

def estimate_repair_cost(params: RepairCostParams) -> ToolResult:
    """Calculate repair cost using FS Trail Cost Guide."""
```

### generate_work_order

Generate TRACS-compatible work order.

```python
class WorkOrderParams(TypedDict):
    trail_id: str
    damage_ids: list[str]

def generate_work_order(params: WorkOrderParams) -> ToolResult:
    """Generate TRACS CSV/XML work order for maintenance queue."""
```

---

## TRACS Export Format

The Trail Assessor generates TRACS-compatible work orders in both CSV and XML formats:

### TRACS CSV Schema

| Field | Type | Example | Required |
|-------|------|---------|----------|
| `trail_id` | String | `waldo-lake-3536` | Yes |
| `damage_id` | String | `WL-DMG-001` | Yes |
| `milepost` | Float | `2.3` | Yes |
| `deficiency_type` | String | `BRIDGE_FAILURE` | Yes |
| `severity` | Integer (1-5) | `5` | Yes |
| `estimated_cost` | Float | `45000.00` | Yes |
| `latitude` | Float | `43.7456` | No |
| `longitude` | Float | `-122.0823` | No |
| `assessment_date` | ISO8601 | `2022-10-15` | Yes |
| `notes` | Text | AI-generated description | No |

### Deficiency Categories

| Category | TRACS Code | Examples |
|----------|------------|----------|
| **Erosion** | `TREAD-EROSION` | Gully, sheet erosion, undercutting |
| **Drainage** | `DRAIN-STRUCT` | Failed water bar, clogged culvert |
| **Structures** | `BRIDGE-STRUCT` | Damaged bridge, broken railing |
| **Signage** | `SIGN` | Missing sign, damaged post |
| **Vegetation** | `CLEARING` | Blowdown, overgrown corridor |

---

## Target Users

| Persona | Role | Phase 1 Value |
|---------|------|---------------|
| **Recreation Technician** | Maintains developed trails | See how AI generates work orders from damage data |
| **Trail Crew Lead** | Plans maintenance work | See cost-prioritized issue lists |
| **District Recreation Manager** | Allocates maintenance budget | See standardized deficiency data exports |
| **Recovery Coordinator** | Oversees post-fire recovery | See trail damage integrated with burn severity and salvage opportunities |

---

## AgentBriefingEvent Strategy

The Trail Assessor is the **field intelligence** provider. It translates video/GPS data into structured damage inventories, identifies safety hazards requiring immediate action, and provides ground truth for Burn Analyst severity predictions.

### Event Trigger Conditions

| Condition | Event Type | Severity | UI Target |
|-----------|------------|----------|-----------|
| Bridge failure detected | `alert` | `critical` | `modal_interrupt` |
| Major washout (>50% tread loss) | `alert` | `warning` | `map_highlight` |
| Damage point classified | `insight` | `info` | `panel_inject` |
| Repair cost estimate > $50,000 | `action_required` | `warning` | `rail_pulse` |
| Video processing complete for segment | `status_update` | `info` | `panel_inject` |
| Trail segment assessment complete | `insight` | `info` | `panel_inject` |
| GPS drift detected (>20m error) | `alert` | `warning` | `panel_inject` |

### Cross-Agent Handoff Patterns

The Trail Assessor **requests** handoffs via the Recovery Coordinator:

| Trigger Condition | Target Agent | Handoff Description |
|-------------------|--------------|---------------------|
| Bridge failure detected | NEPA Advisor | Emergency closure documentation |
| Repair estimate > $50K | NEPA Advisor | CE applicability review |
| Access road damage found | Cruising Assistant | Salvage route assessment |
| Blowdown blocking trail | Cruising Assistant | Salvage opportunity assessment |

### Confidence Scoring Formula

```
confidence = (video_quality * 0.30) + (gps_accuracy * 0.25) +
             (detection_confidence * 0.25) + (cost_basis * 0.20)
```

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Video quality | 30% | Resolution, lighting, stability (1080p+ daylight = 1.0) |
| GPS accuracy | 25% | HDOP <2.0 = 1.0, <5.0 = 0.8, >5.0 = 0.5 |
| Detection confidence | 25% | Object detection model confidence average |
| Cost estimate basis | 20% | FS standard costs = 1.0, regional = 0.9, estimated = 0.7 |

### JSON Example: Bridge Failure (Critical)

```json
{
  "schema_version": "1.0.0",
  "event_id": "trail-evt-001",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T14:22:00Z",
  "type": "alert",
  "source_agent": "trail_assessor",
  "severity": "critical",
  "ui_binding": {
    "target": "modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.0823, 43.7456]
      },
      "properties": { "label": "Rebel Creek Bridge - STRUCTURAL FAILURE" }
    }
  },
  "content": {
    "summary": "CRITICAL: Rebel Creek Trail Bridge at mile 2.3 has completely collapsed. Immediate trail closure required.",
    "detail": "Video analysis (frames 4521-4589) confirms complete structural failure of the 40-foot timber bridge. Both abutments have shifted, deck planking is partially submerged. Bridge is impassable and poses drowning/fall hazard.",
    "suggested_actions": [
      {
        "action_id": "trail-act-001",
        "label": "Issue Emergency Closure",
        "target_agent": "recovery_coordinator",
        "description": "Immediate closure of Rebel Creek Trail from trailhead to mile 4.0",
        "rationale": "FSM 2353.03 requires closure for imminent hazard"
      },
      {
        "action_id": "trail-act-002",
        "label": "Generate Cost Estimate",
        "target_agent": "trail_assessor",
        "description": "Detailed Class C estimate for bridge replacement",
        "rationale": "Required for emergency fund request"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.96,
    "citations": [
      {
        "source_type": "Field-Video",
        "id": "rebel-creek-survey-001",
        "uri": "gs://ranger-field/videos/rebel-creek-2024-12-20.mp4",
        "excerpt": "Frames 4521-4589 showing bridge deck collapse and abutment displacement"
      },
      {
        "source_type": "GPS-Track",
        "id": "rebel-creek-gps-001",
        "uri": "gs://ranger-field/gps/rebel-creek-2024-12-20.gpx",
        "excerpt": "Waypoint 47: 43.7456, -122.0823, timestamp 14:22:00Z"
      },
      {
        "source_type": "TRACS",
        "id": "TRACS-REF-3536-002",
        "uri": "https://infra.fs.usda.gov/tracs/asset/3536-002",
        "excerpt": "Asset: Rebel Creek Bridge, Type: Timber Stringer, Length: 40ft, Built: 1987"
      }
    ],
    "reasoning_chain": [
      "1. Video capture initiated at mile 2.3 of Rebel Creek Trail",
      "2. Object detection model flagged 'bridge' class with 'collapsed' modifier",
      "3. Frame analysis: deck planking at 45-degree angle, partially submerged",
      "4. Abutment analysis: visible horizontal displacement of 3+ feet",
      "5. Cross-referenced TRACS asset database: 40-foot timber stringer bridge",
      "6. Safety classification: IMPASSABLE, drowning/fall hazard",
      "7. No alternative crossing within 0.5 miles",
      "8. Concluded: CRITICAL severity, emergency closure required"
    ]
  }
}
```

### JSON Example: Segment Assessment Complete

```json
{
  "schema_version": "1.0.0",
  "event_id": "trail-evt-002",
  "parent_event_id": "coord-evt-002",
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T15:45:00Z",
  "type": "insight",
  "source_agent": "trail_assessor",
  "severity": "info",
  "ui_binding": {
    "target": "panel_inject",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[-122.05, 43.72], [-122.08, 43.75]]
      },
      "properties": { "label": "Waldo Lake Trail - Assessment Complete" }
    }
  },
  "content": {
    "summary": "Waldo Lake Trail (miles 4.2-7.4) assessment complete: 8 damage points, estimated repair cost $34,500.",
    "detail": "Video analysis identified: 3 erosion gullies, 2 debris flows across tread, 2 failed water bars, 1 damaged trail marker. No critical structural issues. Trail is passable with caution.",
    "suggested_actions": [
      {
        "action_id": "trail-act-003",
        "label": "Export TRACS Work Order",
        "target_agent": "trail_assessor",
        "description": "Generate TRACS-compatible CSV for maintenance queue",
        "rationale": "Standard output for district maintenance system"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.87,
    "citations": [
      {
        "source_type": "Field-Video",
        "id": "waldo-lake-survey-001",
        "uri": "gs://ranger-field/videos/waldo-lake-2024-12-20.mp4",
        "excerpt": "32-minute video capture, 3.2 miles surveyed"
      },
      {
        "source_type": "TRACS-Cost-Guide",
        "id": "TRACS-COSTS-2024",
        "uri": "https://www.fs.usda.gov/recreation/programs/trail-management/costs-2024.pdf",
        "excerpt": "Water bar installation: $150-300/ea, Erosion control: $200-500/100sqft"
      }
    ],
    "reasoning_chain": [
      "1. Processed 32-minute video with GPS correlation",
      "2. Object detection identified 8 damage features",
      "3. Classified: 3 erosion, 2 debris, 2 drainage, 1 signage",
      "4. Applied TRACS severity codes: 2 at Level-3, 6 at Level-2",
      "5. Calculated cost estimate using FS Trail Cost Guide 2024",
      "6. Total estimate: $34,500 (labor: $22,000, materials: $12,500)",
      "7. Trail passability: PASSABLE WITH CAUTION"
    ]
  }
}
```

---

## Future Vision: Computer Vision Pipeline

**The following capabilities describe the full Trail Assessor vision—video-based trail assessment with real-time damage detection. These are NOT in Phase 1 scope.**

### Video Analysis Features (Future)

| # | Feature | Description | Technology |
|---|---------|-------------|------------|
| 1 | **Video Capture** | Walk trail with phone recording; offline sync | Flutter/React Native |
| 2 | **Real-time CV Processing** | Identify deficiencies from video frames | YOLOv8, SAM2 |
| 3 | **GPS-Video Correlation** | Map each identified issue to GPS coordinates | GPX fusion |
| 4 | **Offline Capture** | Record video offline; process when connected | SQLite queue |
| 5 | **Temporal Analysis** | Track damage progression across assessments | Video diffing |
| 6 | **AR Overlay** | Real-time damage highlighting during capture | ARKit/ARCore |

### Future Technical Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Cloud     │────▶│  Gemini     │────▶│   Agent     │
│   Capture   │     │   Storage   │     │  Video API  │     │  Workflow   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ Video + GPS        │ Upload             │ Deficiency List    │
     │                    │                    │                    │
                                                              ┌─────┴─────┐
                                                              │           │
                                                         ┌────▼────┐ ┌────▼────┐
                                                         │  Cost   │ │  TRACS  │
                                                         │  Agent  │ │ Export  │
                                                         └─────────┘ └─────────┘
```

### Mobile App Components (Future)

| Component | Technology | Notes |
|-----------|------------|-------|
| **Mobile App** | Flutter or React Native | Video capture with GPS |
| **Local Storage** | SQLite + File System | Offline video queue |
| **Cloud Storage** | Google Cloud Storage | Video upload bucket |
| **Video Analysis** | Gemini 1.5 Pro (Video) | Long-context video processing |
| **CV Models** | YOLOv8, SAM2 | Edge or cloud inference |
| **Mapping** | Google Maps API | Issue visualization |

### Gemini/Vertex AI Capabilities (Future)

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Native Video Input** | Process long-form trail walk videos | Temporal context for continuous assessment |
| **Object Detection** | Identify erosion, damage, structures | Core deficiency identification |
| **Agent Builder** | Orchestrate multi-step analysis workflow | Connect video analysis → cost lookup → report gen |
| **Function Calling** | Query cost estimation API, mapping services | Integration with external data |
| **Structured Output** | Generate TRACS-compatible JSON/XML | Direct system integration |

### Training/Test Data Needs (Future)

| Data Type | Source | Notes |
|-----------|--------|-------|
| Trail condition videos | Film locally (WA/OR forests) | Need variety of deficiency types |
| Deficiency reference images | USFS trail maintenance guides | For prompt engineering |
| GPS track data | Record with footage | Must correlate with video |
| Labeled training data | Manual annotation | For fine-tuning CV models |
| TRACS schema samples | USFS INFRA system docs | Export format validation |

### Future Capabilities

- Real-time (streaming) video analysis
- AR overlay during field capture
- Direct TRACS API integration (not just export)
- Historical trend analysis across seasons
- Predictive maintenance recommendations
- Multi-year condition comparison
- Crowdsourced trail condition reports

### Future Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deficiency detection accuracy | >80% recall | Manual validation vs. ground truth |
| GPS accuracy | <10m error | Compare to known landmarks |
| Processing time | <3 min per mile of video | Instrumentation |
| False positive rate | <15% | Human review validation |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12 | Initial specification (video-first vision) |
| 2.0 | 2025-12-20 | Reframed for Phase 1 simulation; moved CV to Future Vision |

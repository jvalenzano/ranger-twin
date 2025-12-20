# TrailScan AI - Application Brief

**Status:** 🔵 Planning  
**Priority:** 2 (Secondary)  
**Developer:** TBD  
**Sprint Target:** 6 weeks

---

## The "Wow" Pitch

> A maintenance technician walks a 2-mile trail segment with their phone recording video. TrailScan AI automatically identifies 14 maintenance issues—erosion gullies, damaged water bars, a fallen tree, and a broken signpost—pinpoints each on a map, estimates repair costs, and generates a TRACS-ready work order. A 4-hour inspection and 2 hours of paperwork becomes a 45-minute walk.

---

## Core Purpose

TrailScan AI is a **video-based trail assessment system** that uses computer vision and agentic AI to transform smartphone video into actionable maintenance work orders. It addresses the Forest Service's $8.6 billion deferred maintenance backlog by dramatically accelerating condition assessments and standardizing deficiency documentation.

**Problem Solved:** The Forest Service manages 158,000+ miles of trails with shrinking budgets and workforce. Manual trail assessments are time-consuming, inconsistent, and generate paperwork that sits in backlogs. Critical safety issues go unaddressed because documentation takes longer than the field work.

**Value Proposition:** Make every walk-through generate work orders automatically—no clipboards, no data entry, no backlog.

---

## Key Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Video Analysis** | Walk trail with phone recording; AI identifies deficiencies | P0 (Core) |
| 2 | **Deficiency Classification** | Categorize issues (erosion, drainage, structure, signage, vegetation) | P0 (Core) |
| 3 | **GPS-Video Correlation** | Map each identified issue to GPS coordinates | P0 (Core) |
| 4 | **Cost Estimation Agent** | AI agent calls cost database to estimate repair costs | P1 (Important) |
| 5 | **TRACS Export** | Generate work orders compatible with TRACS system | P1 (Important) |
| 6 | **Interactive Map** | View all issues on trail map with severity indicators | P1 (Important) |
| 7 | **Offline Capture** | Record video offline; process when connected | P0 (Core) |

---

## Target Users

| Persona | Role | Pain Point | How TrailScan Helps |
|---------|------|------------|---------------------|
| **Wilderness Ranger** | Patrols backcountry trails | No connectivity for data entry | Offline capture, sync later |
| **Recreation Technician** | Maintains developed trails | Paperwork bottleneck | Auto-generated work orders |
| **Trail Crew Lead** | Plans maintenance work | Unclear priorities | Cost-prioritized issue list |
| **District Recreation Manager** | Allocates maintenance budget | Inconsistent assessments | Standardized deficiency data |

---

## Gemini/Vertex AI Capabilities Used

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Native Video Input** | Process long-form trail walk videos | Temporal context for continuous assessment |
| **Object Detection** | Identify erosion, damage, structures | Core deficiency identification |
| **Agent Builder** | Orchestrate multi-step analysis workflow | Connect video analysis → cost lookup → report gen |
| **Function Calling** | Query cost estimation API, mapping services | Integration with external data |
| **Structured Output** | Generate TRACS-compatible JSON/XML | Direct system integration |

---

## Technical Architecture

### High-Level Flow

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

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Mobile App** | Flutter or React Native | Video capture with GPS |
| **Local Storage** | SQLite + File System | Offline video queue |
| **Cloud Storage** | Google Cloud Storage | Video upload bucket |
| **Video Analysis** | Gemini 1.5 Pro (Video) | Long-context video processing |
| **Agent Orchestration** | Vertex AI Agent Builder | Multi-step workflow |
| **Cost Database** | Firestore or Cloud SQL | Unit costs by deficiency type |
| **Mapping** | Google Maps API | Issue visualization |
| **Export** | Cloud Functions | TRACS XML generation |

### Agent Workflow Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TrailScan Agent                              │
├─────────────────────────────────────────────────────────────────────┤
│  Step 1: Analyze Video                                              │
│  └── Call Gemini API with video + prompt for deficiency detection   │
│                                                                     │
│  Step 2: Enrich Each Deficiency                                     │
│  └── For each issue:                                                │
│      ├── Correlate timestamp → GPS coordinate                       │
│      ├── Call cost estimation function (deficiency_type → cost)     │
│      └── Assign severity score                                      │
│                                                                     │
│  Step 3: Generate Outputs                                           │
│  ├── Create interactive map with markers                            │
│  ├── Generate TRACS-compatible work order                           │
│  └── Summarize total estimated cost                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/assessments` | POST | Create new trail assessment |
| `/api/v1/assessments/{id}/upload` | POST | Upload video file |
| `/api/v1/assessments/{id}/analyze` | POST | Trigger AI analysis |
| `/api/v1/assessments/{id}/deficiencies` | GET | Retrieve identified issues |
| `/api/v1/assessments/{id}/workorder` | GET | Export TRACS work order |
| `/api/v1/costs` | GET | Retrieve cost estimation data |

---

## Scope Constraints

### In Scope (MVP)
- ✅ Trail deficiency detection (5 categories)
- ✅ GPS-video correlation
- ✅ Basic cost estimation (configurable unit costs)
- ✅ TRACS-format work order export
- ✅ Interactive map visualization
- ✅ Offline video capture with sync

### Out of Scope (Future)
- ❌ Real-time (streaming) analysis
- ❌ AR overlay during capture
- ❌ Direct TRACS system integration (API)
- ❌ Historical trend analysis
- ❌ Predictive maintenance recommendations

### Deficiency Categories (MVP)

| Category | Examples | TRACS Code Mapping |
|----------|----------|-------------------|
| **Erosion** | Gully, sheet erosion, undercutting | Trail Tread - Erosion |
| **Drainage** | Failed water bar, clogged culvert | Drainage Structure |
| **Structures** | Damaged bridge, broken railing | Bridge/Structure |
| **Signage** | Missing sign, damaged post | Sign |
| **Vegetation** | Blowdown, overgrown corridor | Clearing |

---

## 6-Week Development Plan

| Week | Focus | Key Deliverables | Success Criteria |
|------|-------|------------------|------------------|
| **1** | Video Analysis | Gemini prompts for deficiency detection | >80% accuracy on test videos |
| **2** | Agent Framework | Basic agent workflow in Agent Builder | Multi-step pipeline functional |
| **3** | GPS Correlation | Timestamp-to-coordinate mapping | Issues plotted correctly on map |
| **4** | Cost & Export | Cost lookup; TRACS XML generation | Complete work order output |
| **5** | Mobile + Offline | Video capture app; offline queue | Capture without connectivity |
| **6** | Demo Prep | End-to-end polish; demo script | Smooth 10-minute demo |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Video processing latency** | High | Medium | Async processing; set expectations | Dev |
| **GPS drift** | High | Medium | Post-processing interpolation | Dev |
| **False positives** | Medium | Medium | Confidence thresholds; human review | Dev |
| **Long video handling** | Medium | High | Segment videos; parallel processing | Dev |
| **ADK maturity** | Medium | Medium | Fall back to Agent Builder | Lead |
| **TRACS schema changes** | Low | Medium | Configurable export templates | Dev |

---

## Data Requirements

### Training/Test Data Needed

| Data Type | Source | Status | Notes |
|-----------|--------|--------|-------|
| Trail condition videos | Film locally (WA/OR forests) | ⚪ Not Started | Need variety of deficiency types |
| Deficiency reference images | USFS trail maintenance guides | 🔵 Available | For prompt engineering |
| GPS track data | Record with footage | ⚪ Not Started | Must correlate with video |
| TRACS schema | USFS INFRA system docs | 🔵 Researching | Need export format spec |

### Cost Database Seed Data

| Deficiency Type | Unit | Est. Cost | Source |
|-----------------|------|-----------|--------|
| Water bar installation | Each | $150-300 | FS Trail Cost Guide |
| Erosion control (sq ft) | 100 sq ft | $200-500 | Regional estimates |
| Sign replacement | Each | $75-200 | Standard costs |
| Blowdown removal | Each | $50-150 | Labor estimates |
| Bridge deck repair | Linear ft | $100-400 | Structure standards |

---

## Demo Script Outline

**Duration:** 8-10 minutes

1. **Setup** (1 min): Show TrailScan interface, explain maintenance backlog
2. **The Problem** (1 min): "$8.6B deferred maintenance, shrinking workforce..."
3. **Video Upload** (1 min): Upload pre-recorded trail walk video
4. **AI Analysis** (2 min): Watch agent identify deficiencies in real-time
5. **Map Visualization** (1 min): Show issues plotted on trail map
6. **Work Order** (2 min): Display generated TRACS export with costs
7. **ROI Hook** (1 min): "Every ranger with a phone becomes an inspector"
8. **Q&A** (1 min): Address questions

**Pre-recorded Backup:** 90-second trail video with clear deficiencies

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deficiency detection accuracy | >80% recall | Manual validation vs. ground truth |
| GPS accuracy | <10m error | Compare to known landmarks |
| Processing time | <3 min per mile of video | Instrumentation |
| Work order completeness | All required TRACS fields | Schema validation |

---

## Open Questions

- [ ] Can we get sample TRACS export files for schema matching?
- [ ] What trail footage can we obtain (permission issues)?
- [ ] Should severity scoring be AI-determined or rule-based?
- [ ] What's the maximum video length we should support?

---

## References

- [Gemini Video Analysis Guide](https://ai.google.dev/docs/gemini/video)
- [Vertex AI Agent Builder](https://cloud.google.com/vertex-ai/docs/agent-builder/introduction)
- [Agent Development Kit (ADK)](https://cloud.google.com/blog/products/ai-machine-learning/introducing-agent-development-kit)
- [USFS INFRA TRACS](https://www.fs.usda.gov/recreation/programs/trail-management/)
- [TimberScribe APP-BRIEF](../timberscribe/APP-BRIEF.md) (Template Reference)

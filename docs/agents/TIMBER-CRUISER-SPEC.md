# Cruising Assistant - Agent Specification

> *Formerly "TimberScribe" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** 🔵 Planning
**Priority:** 1 (Primary)
**Developer:** JASON VALENZANO
**Sprint Target:** 6 weeks

---

## The "Wow" Pitch

> A ranger walks through a timber stand, pointing their phone at trees while narrating observations. Within seconds, the AI visually confirms species, highlights the exact trees mentioned, and fills structured inventory forms—turning a full day of clipboard work into a morning walk.

---

## Core Purpose

The Cruising Assistant is a **"Speak-and-See" inventory assistant** that allows field foresters to conduct timber cruising using simultaneous voice dictation and video capture. It eliminates manual data entry by using Gemini 2.0 Flash (or Gemini 2.5 Pro for enhanced accuracy) to visually verify spoken observations and automatically populate structured inventory records.

**Problem Solved:** Forest inventory is labor-intensive, requiring foresters to juggle measurement tools, clipboards, and tablets while navigating difficult terrain. The 38% workforce reduction at Forest Service means fewer people covering the same 193 million acres.

**Value Proposition:** Make one forester 3x more efficient by replacing "stop, measure, write" with "walk and talk."

---

## Key Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Audio-Visual Verification** | Ranger says "Cluster of three Douglas Firs," app highlights them in the video feed | P0 (Core) |
| 2 | **Voice-to-JSON Form Fill** | Converts narration into structured FSVeg-compatible inventory fields | P0 (Core) |
| 3 | **Species Confidence Scoring** | Real-time probability rating (e.g., "92% Douglas Fir") displayed on overlay | P1 (Important) |
| 4 | **Offline Store-and-Forward** | Caches video/audio locally; syncs when connectivity returns | P0 (Core) |
| 5 | **Auto-Geotagging** | Fuses GPS trace with video timestamps to map tree locations | P1 (Important) |

---

## Target Users

| Persona | Role | Pain Point | How Cruising Assistant Helps |
|---------|------|------------|------------------------|
| **Forestry Technician** | Conducts timber cruises | Data entry is slow, error-prone | Voice capture eliminates clipboard |
| **Silviculturist** | Plans timber sales | Needs accurate stand data | AI-verified species and DBH estimates |
| **Timber Sale Admin** | Prepares sale packages | Data quality issues cause delays | Structured, validated output |
| **Seasonal Crew** | Temporary survey staff | Steep learning curve | AI provides real-time guidance |

---

## Gemini Capabilities Used

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Native Video Input** | Process multi-second video clips | Temporal context (not just frames) |
| **Audio Transcription** | Convert ranger narration to text | Hands-free operation |
| **Multimodal Fusion** | Correlate "I see a Ponderosa" with visual | Cross-modal verification |
| **Structured Output (JSON)** | Generate FSVeg-compatible records | Direct database integration |
| **Object Detection** | Identify and bound trees in frame | Visual confirmation overlay |

---

## Technical Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Local     │────▶│  Vertex AI  │────▶│  Firestore  │
│   Capture   │     │   Cache     │     │Gemini 2.0/2.5│     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ Video + Audio      │ Offline Queue      │ JSON Response      │ Sync
     │ + GPS              │                    │                    │
```

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Mobile App** | Flutter or React Native | Cross-platform; camera/mic access |
| **Local Storage** | SQLite + File System | Offline queue for media |
| **Cloud Storage** | Google Cloud Storage | Media upload bucket |
| **AI Processing** | Vertex AI (Gemini 2.5 Pro) | Multimodal analysis |
| **Database** | Firestore | Inventory records |
| **Auth** | Firebase Auth | Google OAuth |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/surveys` | POST | Create new survey session |
| `/api/v1/surveys/{id}/observations` | POST | Submit video/audio clip |
| `/api/v1/surveys/{id}/sync` | POST | Sync offline observations |
| `/api/v1/surveys/{id}/export` | GET | Export FSVeg JSON/CSV |

---

## Scope Constraints

### In Scope (MVP)
- ✅ Pacific Northwest conifers only (8-10 species)
- ✅ Single-user mobile app
- ✅ Voice + video capture with GPS
- ✅ Offline caching with background sync
- ✅ Basic species identification with confidence scores
- ✅ JSON export compatible with FSVeg

### Out of Scope (Future)
- ❌ DBH measurement from video (requires calibration)
- ❌ Multi-user collaboration features
- ❌ Integration with live FS databases
- ❌ Species outside PNW region
- ❌ AR glasses support

---

## 6-Week Development Plan

| Week | Focus | Key Deliverables | Success Criteria |
|------|-------|------------------|------------------|
| **1** | Data & Prompting | PNW tree footage collected; Gemini prompts tested | 80%+ species ID accuracy on test set |
| **2** | Mobile Core | Camera app with audio recording and GPS | Video + audio captured and stored locally |
| **3** | AI Integration | Pipeline to Vertex AI; JSON parsing | End-to-end flow working (online) |
| **4** | Offline Mode | Local caching; sync queue; status UI | App works in airplane mode |
| **5** | UI Polish | AR overlay; bounding boxes; confidence display | "Magic moment" visually compelling |
| **6** | Demo Prep | Rehearsed demo; backup videos; edge cases | Can demo reliably in 10 minutes |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Poor species accuracy** | High | High | Strict scope to pre-tested species; show confidence scores | Dev |
| **Connectivity failure during demo** | Medium | Critical | Demo "Offline Mode" explicitly; pre-cached results | Dev |
| **Video processing latency** | Medium | Medium | Async processing; show "processing" UI | Dev |
| **Mobile dev complexity** | Medium | High | Assess team skills early; consider PWA fallback | Lead |
| **GPS drift** | High | Low | Post-processing correction; manual override | Dev |

---

## Data Requirements

### Training/Test Data Needed

| Data Type | Source | Status | Notes |
|-----------|--------|--------|-------|
| PNW conifer footage | Film locally (WA/OR) | ⚪ Not Started | Need diverse lighting, angles |
| Species reference images | USFS FIA, iNaturalist | 🔵 Available | For prompt engineering |
| Sample narration audio | Record in-house | ⚪ Not Started | Various accents, styles |
| GPS tracks | Record with footage | ⚪ Not Started | Correlate with video |

### Target Species (PNW Scope)

1. Douglas Fir (*Pseudotsuga menziesii*)
2. Ponderosa Pine (*Pinus ponderosa*)
3. Western Hemlock (*Tsuga heterophylla*)
4. Western Red Cedar (*Thuja plicata*)
5. Grand Fir (*Abies grandis*)
6. Noble Fir (*Abies procera*)
7. Sitka Spruce (*Picea sitchensis*)
8. Lodgepole Pine (*Pinus contorta*)

---

## Demo Script Outline

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

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Species ID accuracy | >85% on test set | Manual validation |
| Processing latency | <10 seconds per clip | Instrumentation |
| Demo completion rate | 100% (with backup) | Demo day |
| Audience engagement | Visible "wow" reaction | Observation |

---

## Open Questions

- [ ] What mobile framework does the team have experience with?
- [ ] Can we get access to a local forest area for filming?
- [ ] What's the expected demo venue connectivity?
- [ ] Should we target Android, iOS, or both?

---

## References

- [Gemini Multimodal Guide](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/overview)
- [Offline-First Patterns](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Forest Service FSVeg Schema](https://www.fs.usda.gov/nrm/fsveg/)
- [Winner Evaluation Report](../../../ideation/winner-perp.md)

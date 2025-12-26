# RANGER Demo Manifesto

**The Goal:** A fully functional, visually stunning demo that proves RANGER's value as an AI-powered forest recovery command center.

**The Philosophy:** Build fast, build complete, build impressive. No placeholders, no "coming soon," no excuses.

---

## The Vision

When someone sees this demo, they should think:

> "Holy shit, this actually works."

Not "this is a nice mockup" or "I can see where this is going." They should see:
- Real satellite imagery of a real fire
- AI agents that actually reason about the data
- A map that responds to intelligence
- A system that feels alive

---

## The Deliverable

A shareable URL where anyone can:

1. **See the Cedar Creek fire** on real satellite/terrain imagery
2. **Click lifecycle phases** and watch AI agents analyze the situation
3. **Run a guided demo** that explains the cascade
4. **Ask natural language questions** and get intelligent responses
5. **Watch the map respond** to agent insights (highlights, overlays)
6. **Switch between SAT/TER/IR** views
7. **Understand the reasoning** behind every recommendation

---

## The Milestones

### Milestone 1: The Living Map

**Objective:** Replace the SVG placeholder with real, interactive GIS.

| Task | Description |
|------|-------------|
| 1.1 | Integrate MapLibre GL JS |
| 1.2 | Configure MapTiler satellite tiles |
| 1.3 | Configure MapTiler terrain/hillshade tiles |
| 1.4 | Center map on Cedar Creek (43.7°N, 122.1°W, Willamette NF) |
| 1.5 | Wire SAT/TER layer toggle buttons |
| 1.6 | Wire zoom +/- controls |
| 1.7 | Wire compass (reset bearing) |
| 1.8 | Add 3D terrain exaggeration for visual impact |

**Success:** You can pan, zoom, and fly around the actual Cedar Creek fire area with real satellite imagery.

---

### Milestone 2: The Fire Story

**Objective:** Overlay Cedar Creek fire data on the map.

| Task | Description |
|------|-------------|
| 2.1 | Create/verify fire perimeter GeoJSON (from MTBS or InciWeb) |
| 2.2 | Add fire perimeter polygon layer (dashed white outline) |
| 2.3 | Create burn severity zones GeoJSON (from dNBR classifications) |
| 2.4 | Add severity layer with color gradient (green → yellow → red) |
| 2.5 | Create trail damage points GeoJSON |
| 2.6 | Add trail markers with damage class styling |
| 2.7 | Create timber plot points GeoJSON |
| 2.8 | Add timber markers |
| 2.9 | Wire map highlights to agent events (when Burn Analyst fires, pulse the severity layer) |

**Success:** The map tells the Cedar Creek story visually. Burn severity is obvious. Trail damage is visible. The fire's impact is undeniable.

---

### Milestone 3: The Guided Experience

**Objective:** Make the demo self-explanatory.

| Task | Description |
|------|-------------|
| 3.1 | Create DemoTourProvider (state management) |
| 3.2 | Create DemoTourOverlay (annotation cards) |
| 3.3 | Write step content for all 7 tour steps |
| 3.4 | Wire "Run Demo" button to tour |
| 3.5 | Add progress indicator (step dots) |
| 3.6 | Add Back/Next/Skip navigation |
| 3.7 | Sync tour steps with map view (fly to relevant area per step) |
| 3.8 | Sync tour steps with layer visibility (show severity layer during Burn Analyst step) |

**Success:** Click "Run Demo" and be guided through the entire RANGER value proposition. No explanation needed.

---

### Milestone 4: The Intelligent Core

**Objective:** Real AI responses, not fixtures.

| Task | Description |
|------|-------------|
| 4.1 | Set up Vercel project structure |
| 4.2 | Create Gemini client utility |
| 4.3 | Create Recovery Coordinator routing logic |
| 4.4 | Create Burn Analyst prompt template |
| 4.5 | Create Trail Assessor prompt template |
| 4.6 | Create Cruising Assistant prompt template |
| 4.7 | Create NEPA Advisor prompt template |
| 4.8 | Create /api/query endpoint |
| 4.9 | Test each agent with curl |
| 4.10 | Create aiBriefingService for frontend |
| 4.11 | Wire frontend to use AI service |
| 4.12 | Add loading states during Gemini calls |
| 4.13 | Add error handling and fallback to fixtures |

**Success:** Ask "What's the burn severity near Waldo Lake?" and get a real, contextual AI response with reasoning chain and citations.

---

### Milestone 5: The Conversation

**Objective:** Natural language interaction.

| Task | Description |
|------|-------------|
| 5.1 | Create ChatInput component |
| 5.2 | Add chat input to UI (bottom of InsightPanel or floating) |
| 5.3 | Wire chat to aiBriefingService.query() |
| 5.4 | Add chat history display |
| 5.5 | Style chat bubbles to match Tactical Futurism |
| 5.6 | Add suggested query chips ("Try asking...") |
| 5.7 | Handle multi-turn conversations (context passing) |

**Success:** Type questions, get answers. Feel like you're talking to an intelligent system.

---

### Milestone 6: The IR Layer

**Objective:** Thermal/infrared visualization for the "wow" factor.

| Task | Description |
|------|-------------|
| 6.1 | Research IR tile sources (Landsat thermal, VIIRS) |
| 6.2 | Create IR-style color ramp for burn severity |
| 6.3 | Wire IR button to show thermal-styled layer |
| 6.4 | Add heat signature animation on active fire areas |
| 6.5 | Ensure IR layer syncs with agent highlights |

**Success:** Click "IR" and see the fire in thermal vision. Visceral. Immediate. Impressive.

---

### Milestone 7: The Polish

**Objective:** Production-ready feel.

| Task | Description |
|------|-------------|
| 7.1 | Loading states for all async operations |
| 7.2 | Error boundaries and graceful degradation |
| 7.3 | Mobile responsiveness (or at least don't break) |
| 7.4 | Performance optimization (lazy load map, code split) |
| 7.5 | Favicon and meta tags |
| 7.6 | Open Graph image for social sharing |
| 7.7 | Deploy to Vercel |
| 7.8 | Custom domain (optional) |
| 7.9 | Create demo script document |
| 7.10 | Record a demo video (optional) |

**Success:** Share a URL. It loads fast. It works. It impresses.

---

## The Non-Negotiables

These are not optional. Every milestone must maintain:

1. **Tactical Futurism aesthetic** — Dark mode, glassmorphism, emergency colors
2. **Reasoning transparency** — Every AI response shows its logic
3. **Citation integrity** — No hallucinated sources
4. **Confidence scores** — Every insight has a trust level
5. **Cascade visibility** — Show how agents trigger each other
6. **Cedar Creek authenticity** — Real location, real fire, real context

---

## The Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand |
| Styling | Tailwind CSS |
| Maps | MapLibre GL JS + MapTiler |
| AI | Gemini 3 Flash via Google ADK (see [ADR-003](./adr/ADR-003-gemini-3-flash-file-search.md)) |
| RAG | Gemini File Search (FSM/FSH documents for NEPA Advisor) |
| Agents | 5 FastAPI services (ports 8001-8005) + Recovery Coordinator |
| Hosting | Vercel (frontend) / Docker (agents) |
| Data | GeoJSON fixtures (Cedar Creek specific) |

---

## The Order of Operations

```
Milestone 1 (Map)
     ↓
Milestone 2 (Fire Data)
     ↓
Milestone 3 (Demo Tour)    ←── Can demo at this point (static but impressive)
     ↓
Milestone 4 (AI Core)
     ↓
Milestone 5 (Chat)         ←── Full interactive demo
     ↓
Milestone 6 (IR Layer)     ←── Extra wow factor
     ↓
Milestone 7 (Polish)       ←── Ship it
```

---

## Current Status

**Last Updated:** 2025-12-22

| Milestone | Status | Notes |
|-----------|--------|-------|
| Milestone 1: Living Map | ✅ Complete | MapLibre + MapTiler, 3D terrain, SAT/TER/IR toggle |
| Milestone 2: Fire Story | ✅ Complete | Cedar Creek perimeter, burn severity, trails, timber plots |
| Milestone 3: Guided Experience | ✅ Complete | 7-step demo tour with map sync |
| Milestone 4: Intelligent Core | ✅ Complete | Gemini 3 Flash, 5 agents, ADK orchestration |
| Milestone 5: Conversation | ✅ Complete | Chat with persistence, suggested queries |
| Milestone 6: IR Layer | ✅ Complete | Thermal visualization mode |
| Milestone 7: Polish | ✅ Complete | Loading states, error handling, SEO |
| **Milestone 8: NEPA RAG** | ✅ Complete | File Search with FSM/FSH documents (ADR-003) |

---

## Post-Launch Enhancements (Completed 2025-12-22)

| Enhancement | Description |
|-------------|-------------|
| **Gemini 3 Flash Migration** | All agents updated to latest model per ADR-003 |
| **NEPA Advisor File Search** | RAG over 5 indexed FSM/FSH regulatory documents |
| **Agent Architecture Docs** | AGENTIC-ARCHITECTURE.md, agent specs updated |
| **Floating Legend** | Detachable legend with tooltips |
| **Chat Persistence** | Conversation history maintained across sessions |

---

## Related Documents

- [SPRINT-FOCUS.md](./SPRINT-FOCUS.md) — Current development priorities
- [PROGRESS-2025.md](../session-logs/PROGRESS-2025.md) — Detailed session logs
- [ADR-003](./adr/ADR-003-gemini-3-flash-file-search.md) — AI stack decisions
- [AGENTIC-ARCHITECTURE.md](./architecture/AGENTIC-ARCHITECTURE.md) — Agent system design

---

## Mission Accomplished

This document was the north star. The goal has been achieved:

> A fully functional demo that makes people say "Holy shit, this actually works."

All 8 milestones are complete. The RANGER Demo is live and ready for stakeholder presentations.

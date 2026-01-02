# RANGER Architecture: How It All Works

**Purpose:** Educational job aid explaining RANGER's end-to-end data flow  
**Audience:** New team members, stakeholders, anyone asking "what happens when I click that button?"  
**Related:** [Architecture Diagram](../infrastructure/ranger-arch-perp.png) | [ADR-005: Skills-First](./adr/ADR-005-skills-first-architecture.md)  
**Updated:** 2025-12-31

---

## The Big Picture

RANGER is a **distributed system** with distinct layers, each running in a different place:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WHERE THINGS RUN                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   YOUR BROWSER (laptop/tablet RAM)                                      │
│   └── React app, Zustand state, MapLibre maps                           │
│                                                                         │
│   CLOUD RUN: Frontend Service                                           │
│   └── Static files (React bundle, HTML, CSS, JS)                        │
│                                                                         │
│   CLOUD RUN: RANGER API (single service)                                │
│   └── ADK API Server + All Agents (Coordinator, Burn, Trail, etc.)      │
│                                                                         │
│   GCS (geospatial data only)                                            │
│   └── COG rasters (burn severity), PMTiles (treatment units)            │
│                                                                         │
│   GOOGLE VERTEX AI                                                      │
│   └── Gemini 2.0 Flash (LLM reasoning) + RAG Engine (FSH/FSM corpus)    │
│                                                                         │
│   EXTERNAL DATA SOURCES (free public APIs)                              │
│   └── NIFC (fires), FIRMS (hotspots), MTBS (burn severity catalog)      │ 
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

> **📝 Architecture Note:** RANGER uses a **Skills-First** architecture. Earlier versions showed separate Cloud Run services for each agent, but we now bundle the API routing and agent execution into a single "Orchestrator" service for performance (faster delegation) and cost efficiency.
>
> **The Metaphor:** Think of RANGER as a **Smart Vending Machine**. The machine is always there (Cloud Run), but it only uses electricity when you're actually pressing buttons to get a "recovery briefing" snack.

---

## Layer-by-Layer Breakdown

### 1. Your Browser (Client-Side)

**What runs here:** The entire RANGER user interface

| Technology | What It Does | Role in Onboarding |
|------------|--------------|--------------------|
| **React** | Renders the UI | The "Face" of the application |
| **Zustand** | **Client State** (Filters, toggles) | The "Short Term Memory" |
| **React Query** | **Server State** (Data from API) | The "Clipboard" for remote data |
| **MapLibre** | Renders interactive maps | The "Window" into the field |

**Key Insight:** We distinguish between **Client State** (Zustand: what YOU are choosing) and **Server State** (React Query: what the AGENTS are saying). This keeps the UI snappy and prevents unnecessary re-fetching.

> [!TIP]
> **Deep Dive:** [Zustand Explained](./guides/learning/ZUSTAND-EXPLAINED.md) | [React Query Caching](./guides/learning/REACT-QUERY-CACHING.md)

**Key insight:** Once you load the page, this code runs on YOUR device. Cloud Run served the files, but now your laptop is doing the work. That's why toggling a filter is instant—no server involved.

**Where state lives:**
```
Browser RAM (disappears on refresh)
├── phaseFilter: ['active', 'baer_assessment']
├── selectedFire: 'cedar-creek-2022'  
├── fieldMode: false
└── layersVisible: { usfs: true, blm: false }

localStorage (survives refresh)
├── ranger:fieldMode: 'true'
└── ranger:lastFire: 'cedar-creek-2022'
```

---

### 2. Cloud Run: Frontend Service

**URL:** `https://ranger-frontend-xxx.us-west1.run.app`

**What it does:** Serves static files. That's it.

```
User visits URL
      │
      ▼
Cloud Run wakes up (cold start: ~2s, warm: ~200ms)
      │
      ▼
Sends files: index.html, main.js (~2MB), styles.css
      │
      ▼
Cloud Run goes back to sleep (scale-to-zero)
      │
      ▼
YOUR BROWSER takes over, runs the React app
```

**Cost & Performance:** We use `min-instances: 0` for the frontend. If no one visits, it costs $0. The "Cold Start" is just the browser downloading the bundle once.

> [!TIP]
> **Deep Dive:** [Cloud Run Scaling Concepts](./guides/learning/CLOUD-RUN-SCALING.md) | [Environment Variables](./guides/learning/ENV-VARS-EXPLAINED.md)

---

### 3. Cloud Run: API Server (Orchestrator)

**URL:** `https://ranger-orchestrator-xxx.us-west1.run.app`

**What it does:** Routes requests to agents, manages sessions, streams responses back.

> [!NOTE]
> **Operation "Warm-Start":** Unlike the Frontend, we keep at least one instance of the API "warm" (`min-instances: 1`) to ensure that when Maria asks a question, the agent responds instantly without a 5-second cold start.

This is the **traffic controller**. When you ask a question:

```
Browser: "Give me a recovery briefing for Cedar Creek"
    │
    ▼
API Server receives request
    │
    ├─── Authenticates user (checks session)
    │
    ├─── Determines which agent(s) to call
    │
    ├─── Opens SSE (Server-Sent Events) stream back to browser
    │
    ▼
Calls Recovery Coordinator agent
    │
    ▼
Streams response chunks back as they arrive
```

**The Metaphor:** This is our **News Ticker**. Instead of waiting for the full story to be written, we stream it to the screen line-by-line so the user can start reading immediately.

### "The Pulse": Our Event Model
RANGER communicates using structured **Server-Sent Events (SSE)**. This isn't just text; it's a sequence of events:

1. `AgentBriefingEvent`: Sets the stage (who is talking, what tools they have).
2. `ThinkingEvent`: Shows the "Agent is thinking..." status.
3. `ToolCallEvent`: Discloses when the agent is looking up data (e.g., searching MTBS).
4. `TurnComplete`: Signals the end of the streaming response.

> [!TIP]
> **Deep Dive:** [SSE Streaming Guide](./guides/learning/SSE-STREAMING.md) | [Event Sourcing Pattern](./guides/learning/EVENT-SOURCING.md)

---

### 4. Cloud Run: Agent Services

**What they are:** Specialized AI agents, each an expert in one domain.

| Agent | Expertise | Example Question It Handles |
|-------|-----------|----------------------------|
| **Recovery Coordinator** | Orchestration, delegation | "Give me a full recovery briefing" |
| **Burn Analyst** | Fire severity, MTBS data | "What's the burn severity in sector NW-4?" |
| **Trail Assessor** | Trail damage, closures | "Which PCT miles should we close?" |
| **Cruising Assistant** | Timber volume, salvage | "Estimate salvage volume in the northeast sector" |
| **NEPA Advisor** | Compliance pathways | "Does this qualify for a Categorical Exclusion?" |

### Anatomy of a Skill
In RANGER, agents aren't just prompts—they have **Skills**. A skill is a versioned folder in our codebase that gives an agent a specific superpower.

```bash
skills/cruising-assistant/
├── skill.md       # The "Instructions" (How to estimate volume)
├── scripts/       # The "Tools" (Python script to calculate BF)
└── examples/      # The "Few-Shot" logic (Sample outputs)
```

> [!TIP]
> **Deep Dive:** [ADK Agent Anatomy](./guides/learning/ADK-AGENT-ANATOMY.md) | [Proof Layer Pattern](./guides/learning/PROOF-LAYER-PATTERN.md)

**How they work internally:**

```
Agent receives query
      │
      ▼
Agent has: Instructions (prompt) + Skills (tools) + Context (data)
      │
      ▼
Agent calls Gemini with: "You are a Burn Analyst. User asked: ___. 
                          You have these tools: ___."
      │
      ▼
Gemini reasons, picks tools, generates response
      │
      ▼
Agent formats response with citations, confidence scores
      │
      ▼
Returns to API Server → SSE → Your browser
```

---

### 5. Google Vertex AI (Gemini)

**What it is:** The "brain" that does the actual reasoning.

The agents don't think—Gemini thinks. Agents are wrappers that:
- Give Gemini the right context (system prompt, persona)
- Give Gemini access to tools (search MTBS data, calculate volume)
- Format Gemini's output for the UI (citations, confidence)

```
NEPA Advisor: "User asked about Categorical Exclusion for timber salvage."

Gemini reasons: 
  "I should check FSH 1909.15 Chapter 30... 
   Category 13 covers salvage of dead/dying timber...
   This appears to qualify if under 250 acres..."

Gemini returns:
**The Metaphor:** Gemini is a **Brilliant Librarian**. It knows where everything is, but it needs the Agents to tell it which book to open and which tools to use to summarize the answer.

> [!TIP]
> **Deep Dive:** [RAG Explained](./guides/learning/RAG-EXPLAINED.md)
```

**Cost implication:** You pay per token (input + output). A typical briefing costs ~$0.001-0.01.

---

### 6. External Data Sources

**What they are:** Where "ground truth" data comes from.

| Source | Data | How RANGER Accesses It |
|--------|------|------------------------|
| **NIFC (InciWeb/IRWIN)** | Fire perimeters, incident status | REST API (no auth required) |
| **NASA FIRMS** | Real-time hotspot detections | REST API (free API key) |
| **MTBS** | Historical burn severity | Downloaded rasters, pre-processed |
| **PAD-US** | Federal land boundaries | PMTiles (vector tiles) |
| **FSM/FSH** | Regulations | PDF corpus for RAG search |

**"No-Tile-Server" Architecture:** Unlike traditional maps that need a heavy server to generate "tile" images, RANGER uses **Cloud-Native Geospatial Formats** (PMTiles and COGs). 

These files sit on Cloud Storage, and the browser uses **HTTP Range Requests** to fetch only the tiny bits of the file it needs for the current view.

> [!TIP]
> **Deep Dive:** [Geospatial Formats](./guides/learning/GEOSPATIAL-FORMATS.md) | [MapLibre Integration](./guides/learning/MAPLIBRE-INTEGRATION.md) | [TiTiler Dynamic Tiles](./guides/learning/TITILER-DYNAMIC-TILES.md)

---

## End-to-End Example: "Give me a recovery briefing"

Here's exactly what happens when Regional Forester Maria types that query:

```
STEP 1: Browser
─────────────────────────────────────────────────────
Maria types: "Give me a recovery briefing for Cedar Creek"
React captures input, Zustand stores it as currentQuery
Browser sends POST to API Server with query text


STEP 2: API Server (Cloud Run)
─────────────────────────────────────────────────────
Receives request, opens SSE stream back to Maria's browser
Calls Recovery Coordinator: "User wants briefing for Cedar Creek"


STEP 3: Recovery Coordinator (Cloud Run)
─────────────────────────────────────────────────────
Sends to Gemini: "You are Recovery Coordinator. User wants briefing.
                  You can delegate to: Burn Analyst, Trail Assessor, 
                  Cruising Assistant, NEPA Advisor."

Gemini responds: "I'll delegate to all four specialists."

Coordinator calls Burn Analyst:    "Assess severity for Cedar Creek"
Coordinator calls Trail Assessor:  "Identify priority repairs"
Coordinator calls Cruising Asst:   "Evaluate salvage opportunities"
Coordinator calls NEPA Advisor:    "Pre-screen compliance requirements"


STEP 4: Specialist Agents (Cloud Run, parallel)
─────────────────────────────────────────────────────
Each agent queries its data sources:
  - Burn Analyst → queries MTBS fixtures → "42% high severity"
  - Trail Assessor → queries trail data → "PCT 2028-2034 damaged"
  - Cruising Asst → queries timber data → "1.2M board feet salvageable"
  - NEPA Advisor → searches FSH via RAG → "Category 13 CE applies"


STEP 5: Response Assembly
─────────────────────────────────────────────────────
Recovery Coordinator receives all four responses
Synthesizes into unified briefing with:
  - Executive summary
  - Per-domain findings
  - Confidence scores
  - Source citations

Streams back to API Server → SSE → Browser


STEP 6: Browser Renders Response
─────────────────────────────────────────────────────
Maria sees briefing appear chunk by chunk (SSE streaming)
React renders InsightCard with:
  - Agent badge ("Recovery Coordinator")
  - Briefing text
  - Expandable citations
  - Skills used badges

Total time: ~8-15 seconds
Total cost: ~$0.02-0.05 in Gemini tokens
```

---

## What Runs Where (Summary Table)

| Layer | Runs On | Stays Running? | What It Stores |
|-------|---------|----------------|----------------|
| **UI (React/Zustand)** | Your browser | Yes, while tab is open | UI state (filters, selections) |
| **Frontend Service** | Cloud Run | No, sleeps between requests | Nothing |
| **API Server** | Cloud Run | No, scales to zero | Session tokens (temporary) |
| **Agent Services** | Cloud Run | No, scales to zero | Nothing (stateless) |
| **Gemini** | Google's servers | Always on | Nothing about you |
| **Database (PostGIS)** | Cloud SQL | Yes, always on | Fire data, RAG vectors |

---

## Cost Model (Why This Architecture)

| What You Do | Cloud Cost |
|-------------|------------|
| Load the page | $0.0001 (serve static files) |
| Toggle filters, zoom map | $0.00 (runs in browser) |
| Ask agent a simple question | ~$0.01-0.02 (Gemini tokens) |
| Full recovery briefing | ~$0.05-0.10 (4 agents, longer context) |
| Leave tab open all day | $0.00 (no server activity) |

**Why scale-to-zero matters:** If no one asks questions, Cloud Run costs ~$0/day. You only pay when agents are thinking.

---

## Related Documentation

- [ADR-005: Skills-First Architecture](./adr/ADR-005-skills-first-architecture.md) — Why agents have "Skills"
- [ADR-006: Google-Only LLM Strategy](./adr/ADR-006-google-only-llm-strategy.md) — Why Gemini
- [PROOF-LAYER-DESIGN](./specs/PROOF-LAYER-DESIGN.md) — How citations and confidence work
- [ADK Operations Runbook](./guides/ADK-OPERATIONS-RUNBOOK.md) — Running agents locally

---

*Last updated: December 31, 2025*

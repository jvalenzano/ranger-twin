# Planned Developer Diagrams

Production-ready generation prompts for the four missing developer diagrams identified in the December 2025 audit. These prompts are aligned with the current Skills-First architecture (ADR-005, ADR-006, ADR-007.1, ADR-008).

**Actual Skill Inventory (verified from codebase):**

| Agent | Skills |
|-------|--------|
| **Coordinator** | `delegation`, `portfolio-triage` |
| **Burn Analyst** | `mtbs-classification`, `soil-burn-severity`, `boundary-mapping` |
| **Trail Assessor** | `damage-classification`, `closure-decision`, `recreation-priority` |
| **Cruising Assistant** | `volume-estimation`, `salvage-assessment`, `cruise-methodology`, `csv-insight` |
| **NEPA Advisor** | `pathway-decision`, `compliance-timeline`, `documentation`, `pdf-extraction` |

**Total: 5 agents, 16 skills**

---

## 1. Phase 4 ADK Developer Stack

**File:** `Phase 4 ADK Developer Stack.png`
**Priority:** P0 (Critical for onboarding)
**Supersedes:** `legacy/Local Developer Stack.png`

### Purpose

The first diagram a new developer needs. Answers: "What's running where? Which ports? Where do I look when something breaks?"

### Key Differences from Legacy Diagram

| Legacy (Archived) | Phase 4 (Current) |
|-------------------|-------------------|
| 6 ports (3000, 8000-8005) | 3 ports (5173, 8000, 8080) |
| Separate microservices per agent | Single ADK orchestrator |
| API Gateway + Coordinator separate | Combined in main.py |
| WebSocket streaming | SSE streaming |
| Redis session state | InMemorySessionService (dev) |

### Generation Prompt

```
Create a technical whiteboard diagram titled "RANGER Phase 4: Developer Environment"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk-drawn lines in white and cream. Hand-lettered labels. Use emerald green (#10B981) for active/running indicators, amber (#F59E0B) for data flow arrows, cyan (#06B6D4) for external services. Engineering blueprint aesthetic with slight hand-drawn imperfection.

Layout: Three horizontal tiers with clear visual hierarchy.

═══════════════════════════════════════════════════════════════════════════════
TOP TIER — "FRONTEND"
═══════════════════════════════════════════════════════════════════════════════

Large browser window frame labeled "Command Console"
- URL bar: "http://localhost:5173"
- Glowing green port badge: "5173"
- Inside browser: simplified UI showing:
  - Left sidebar with 4 phase icons (🔥 Impact, 🥾 Damage, 🌲 Timber, 📋 Compliance)
  - Center: 3D map with colored burn severity polygons
  - Right: Chat panel with agent responses
- Tech stack annotation: "React 18 + Vite + Tailwind + Zustand"
- Folder path: "apps/command-console/"

Arrow pointing DOWN from browser labeled "SSE Stream" with annotation "(not WebSocket)"

═══════════════════════════════════════════════════════════════════════════════
MIDDLE TIER — "ADK ORCHESTRATOR"
═══════════════════════════════════════════════════════════════════════════════

Large hexagon in center labeled "ADK Runtime"
- Port badge: "8000" (glowing green)
- Inside hexagon, show nested structure:
  - "Recovery Coordinator" (brain icon) at top
  - Four specialist icons below in a row:
    🔥 Burn Analyst
    🥾 Trail Assessor
    🌲 Cruising Assistant
    📋 NEPA Advisor
- Tech annotation: "Python 3.11 + Google ADK + Gemini 2.0 Flash"
- Folder path: "agents/"
- Key insight callout: "Single process • All agents in memory • AgentTool delegation"

Two arrows leaving the hexagon:
- LEFT arrow to "MCP Fixtures" labeled "Tool Calls"
- RIGHT arrow to cloud icon labeled "Gemini API (only external call)"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM TIER — "DATA LAYER"
═══════════════════════════════════════════════════════════════════════════════

LEFT BOX: "MCP Fixtures Server"
- Port badge: "8080" (glowing green)
- Icon: JSON file with MCP logo
- Contents listed:
  - burn-severity.json (8 sectors)
  - trail-damage.json (16 points)
  - timber-plots.json (6 plots)
- Folder path: "mcp/fixtures/"
- Annotation: "Phase 1: Simulated data • Phase 2: Real APIs"

RIGHT BOX: "Session State"
- Icon: Memory chip
- Label: "InMemorySessionService"
- Annotation: "(Redis in production)"

═══════════════════════════════════════════════════════════════════════════════
FLOW ARROWS (numbered request lifecycle in amber)
═══════════════════════════════════════════════════════════════════════════════

① User types: "What's the burn severity in Sector NW-4?"
② SSE connection established to :8000/stream
③ Coordinator delegates to Burn Analyst (AgentTool)
④ Burn Analyst calls get_burn_severity() tool
⑤ MCP Fixtures returns JSON from burn-severity.json
⑥ Gemini generates reasoning + briefing
⑦ AgentBriefingEvent streams to UI via SSE

═══════════════════════════════════════════════════════════════════════════════
CORNER ANNOTATIONS (handwritten chalk style)
═══════════════════════════════════════════════════════════════════════════════

Top-left: "Cedar Creek Fire • 127,000 acres • Willamette NF"
Top-right: "All AI reasoning is REAL • Only data is simulated"
Bottom-left: "mode=AUTO (ADR-007.1) • No infinite loops"
Bottom-right: "Google ADK + Gemini 2.0 Flash • FedRAMP path"

═══════════════════════════════════════════════════════════════════════════════
TERMINAL BOX (bottom center, monospace font)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  # Quick Start                                              │
│  cd apps/command-console && npm run dev    → :5173          │
│  python main.py                            → :8000          │
│  cd mcp/fixtures && python server.py       → :8080          │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
KEY INSIGHT CALLOUT (prominent chalk box)
═══════════════════════════════════════════════════════════════════════════════

"🎯 THE SIMPLIFICATION:
Phase 1-3: 6 ports, 6 processes, microservice complexity
Phase 4: 3 ports, 3 processes, Skills-First simplicity
Agent code lives in agents/ • Skills in agents/*/skills/
One orchestrator rules them all"

--ar 16:9
```

---

## 2. The MCP Abstraction Layer

**File:** `The MCP Abstraction Layer.png`
**Priority:** P1 (Critical for understanding fixture→production path)
**Supersedes:** `legacy/Phase 1 Architecture Boundaries.png`

### Purpose

Explains how MCP acts as the universal adapter between agents and data sources. Shows why agent code never changes between dev (fixtures) and production (real APIs).

### Generation Prompt

```
Create a technical whiteboard diagram titled "The MCP Abstraction Layer: Fixtures Today, APIs Tomorrow"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk lines. Engineering schematic feel. Use a "switchboard" or "patch panel" visual metaphor for MCP.

Layout: Left-to-right flow with central switching mechanism.

═══════════════════════════════════════════════════════════════════════════════
LEFT SECTION — "AGENTS (Consumers)"
═══════════════════════════════════════════════════════════════════════════════

Stack of 4 agent cards, each showing:
- Agent icon and name
- Example tool call in monospace:

🔥 Burn Analyst
   tool_call: get_burn_severity(sector="NW-4")

🥾 Trail Assessor
   tool_call: get_trail_damage(trail_id="PCT-47")

🌲 Cruising Assistant
   tool_call: get_timber_plots(unit="12")

📋 NEPA Advisor
   tool_call: search_regulations(topic="salvage")

Annotation below agents: "Agents don't know WHERE data comes from"
Arrow pointing right: "Standard Tool Interface"

═══════════════════════════════════════════════════════════════════════════════
CENTER — "MCP ROUTER (The Universal Adapter)"
═══════════════════════════════════════════════════════════════════════════════

Large visual of a patch panel / switchboard:
- Title: "Model Context Protocol"
- Subtitle: "stdio | SSE | HTTP"
- Visual: Multiple input jacks on left, multiple output jacks on right
- Cables connecting inputs to outputs
- Label: "Tool Routing Layer"

Inside the router box, show the decision logic:
┌─────────────────────────────────────┐
│  get_burn_severity(sector)          │
│  ├─ DEV:  → mcp-fixtures/:8080      │
│  └─ PROD: → mcp-geo/:8081 (GEE)     │
└─────────────────────────────────────┘

Annotation: "Configuration determines routing • Agent code unchanged"

═══════════════════════════════════════════════════════════════════════════════
RIGHT SECTION — "DATA SOURCES (Providers)"
═══════════════════════════════════════════════════════════════════════════════

Split into TOP (active) and BOTTOM (future):

TOP — "Phase 1: Fixtures" (solid lines, glowing)
┌─────────────────────────────────────┐
│  MCP Fixtures Server (:8080)        │
│  ├─ burn-severity.json              │
│  ├─ trail-damage.json               │
│  ├─ timber-plots.json               │
│  └─ returns: ToolResult(JSON)       │
└─────────────────────────────────────┘
Badge: "ACTIVE NOW"

BOTTOM — "Phase 2+: Production APIs" (dashed lines, dimmed)
┌─────────────────────────────────────┐
│  MCP Geo Server (future)            │
│  ├─ Google Earth Engine             │
│  ├─ Sentinel-2 API                  │
│  └─ returns: ToolResult(GeoJSON)    │
├─────────────────────────────────────┤
│  MCP IRWIN Server (future)          │
│  ├─ NIFC Perimeters                 │
│  ├─ InciWeb Integration             │
│  └─ returns: ToolResult(JSON)       │
└─────────────────────────────────────┘
Badge: "SWAP CONFIG → INSTANT UPGRADE"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM — "THE ARCHITECTURE PRINCIPLE"
═══════════════════════════════════════════════════════════════════════════════

Three-panel comparison:

PANEL 1: "Without MCP"
Agent code: if env == 'dev': load_json() else: call_api()
Label: "❌ Conditional logic everywhere"

PANEL 2: "With MCP"
Agent code: mcp.call_tool('get_burn_severity', {sector: 'NW-4'})
Label: "✅ One interface, any source"

PANEL 3: "The Result"
"Agents ask WHAT • MCP decides HOW"
"Test with fixtures • Deploy with APIs • Zero code changes"

═══════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════

"MCP is the contract between intelligence and data.
Change the wiring, not the code."

--ar 16:9
```

---

## 3. ADK Data Flow & SSE Streaming

**File:** `ADK Data Flow & SSE Streaming.png`
**Priority:** P2 (Important for understanding real-time updates)
**Supersedes:** `legacy/How the pieces fit together.png`

### Purpose

Shows the complete lifecycle of a user query through SSE streaming. Emphasizes that RANGER uses continuous streaming (SSE), not request/response or WebSocket.

### Generation Prompt

```
Create a sequence diagram titled "The Pulse: How Questions Become Briefings"

Style: Tactical whiteboard on dark slate background (#0F172A). Swimlane sequence diagram. Chalk-drawn with emerald (#10B981) for success events, amber (#F59E0B) for in-progress, cyan (#06B6D4) for data calls.

Layout: Four vertical swimlanes with horizontal flow.

═══════════════════════════════════════════════════════════════════════════════
SWIMLANES (left to right)
═══════════════════════════════════════════════════════════════════════════════

LANE 1: "👤 User (React)"
- Icon: Browser window
- Port: :5173

LANE 2: "🧠 ADK Orchestrator"
- Icon: Hexagon with brain
- Port: :8000
- Contains: Coordinator + Specialists

LANE 3: "🤖 Gemini API"
- Icon: Cloud with sparkles
- Label: "gemini-2.0-flash"

LANE 4: "📦 MCP Fixtures"
- Icon: Database/JSON
- Port: :8080

═══════════════════════════════════════════════════════════════════════════════
SEQUENCE FLOW (top to bottom, numbered steps)
═══════════════════════════════════════════════════════════════════════════════

① User → ADK: "What's the burn severity in Sector NW-4?"
   Arrow style: Solid, labeled "POST /chat"
   
② ADK opens SSE connection back to User
   Arrow style: Dashed double-line, labeled "SSE stream opened"
   Annotation: "Long-lived connection • Events push as they occur"

③ ADK → Gemini: Send prompt with context
   Arrow style: Solid amber
   Box showing prompt snippet:
   "You are the Recovery Coordinator...
    User asks about burn severity..."

④ Gemini → ADK: "Reasoning: I should delegate to Burn Analyst..."
   Arrow style: Dashed amber

⑤ ADK → User (SSE): Event: reasoning_trace
   Arrow style: Emerald
   UI annotation: "💭 Thinking indicator appears"

⑥ ADK internal: Coordinator delegates to Burn Analyst (AgentTool)
   Self-loop arrow on ADK lane
   Annotation: "mode=AUTO • ADR-007.1"

⑦ Burn Analyst → MCP: get_burn_severity(sector="NW-4")
   Arrow style: Cyan
   
⑧ MCP → Burn Analyst: ToolResult(JSON)
   Arrow style: Cyan
   Data snippet: { sector: "NW-4", severity: "HIGH", acres: 18340 }

⑨ Burn Analyst → Gemini: Tool result + generate briefing
   Arrow style: Amber

⑩ Gemini → Burn Analyst: Final analysis text
   Arrow style: Amber

⑪ ADK → User (SSE): Event: agent_briefing
   Arrow style: Emerald (thick)
   UI annotation: "📋 Briefing card renders with Proof Layer"

⑫ ADK → User (SSE): Event: stream_complete
   Arrow style: Emerald
   Annotation: "Connection closes gracefully"

═══════════════════════════════════════════════════════════════════════════════
TIMING ANNOTATIONS (right margin)
═══════════════════════════════════════════════════════════════════════════════

Steps ①-② : ~50ms (connection setup)
Steps ③-⑤ : ~500ms (initial reasoning)
Steps ⑥-⑩ : ~2-5s (tool execution + synthesis)
Steps ⑪-⑫ : ~100ms (delivery)

Total: 3-6 seconds for complete briefing

═══════════════════════════════════════════════════════════════════════════════
KEY CALLOUTS (chalk boxes)
═══════════════════════════════════════════════════════════════════════════════

BOX 1 (near step ②):
"SSE vs WebSocket:
• SSE: Server pushes to client (unidirectional)
• WebSocket: Bidirectional
• We use SSE: Simpler, sufficient for our needs"

BOX 2 (near step ⑥):
"AgentTool Pattern (ADR-008):
Coordinator calls specialists as tools
Specialists return results to Coordinator
Coordinator synthesizes final briefing"

BOX 3 (near step ⑪):
"AgentBriefingEvent includes:
• content.summary (one-liner)
• content.detail (full analysis)
• proof_layer.confidence (0-1)
• proof_layer.reasoning_chain[]
• proof_layer.citations[]"

═══════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════

"Every question triggers a cascade. Every step streams to the user.
Transparency isn't a feature—it's the architecture."

--ar 16:9
```

---

## 4. The Coordinator's Skill Roster

**File:** `The Coordinator's Skill Roster.png`
**Priority:** P2 (Important for understanding skill composition)
**Supersedes:** `legacy/Coordinator Routing & Cross-Agent Cascade.png`

### Purpose

Visual inventory of all agents and their skills. Helps developers understand the `agents/*/skills/` directory structure and which capabilities belong where.

### Generation Prompt

```
Create a roster diagram titled "The Coordinator's Skill Roster: 5 Agents, 16 Skills"

Style: Tactical whiteboard on dark slate background (#0F172A). Team roster / trading card aesthetic. Each agent is a "card" with skills listed. Hand-drawn chalk style with agent-specific accent colors.

Layout: Hierarchical tree with Coordinator at top, four specialists below.

═══════════════════════════════════════════════════════════════════════════════
TOP — "RECOVERY COORDINATOR" (The Orchestrator)
═══════════════════════════════════════════════════════════════════════════════

Large card at top center:
┌─────────────────────────────────────────────────────────────┐
│  🧠 RECOVERY COORDINATOR                                     │
│  ─────────────────────────────────────────────────────────  │
│  Role: Mission Commander                                     │
│  Model: gemini-2.0-flash                                     │
│  Pattern: AgentTool delegation (ADR-008)                     │
│                                                              │
│  SKILLS:                                                     │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ 📋 delegation   │  │ 📊 portfolio-   │                   │
│  │                 │  │    triage       │                   │
│  │ Routes queries  │  │ Prioritizes     │                   │
│  │ to specialists  │  │ incidents       │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                              │
│  Path: agents/coordinator/                                   │
└─────────────────────────────────────────────────────────────┘

Four arrows branch DOWN from Coordinator, labeled "AgentTool"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM ROW — FOUR SPECIALIST CARDS
═══════════════════════════════════════════════════════════════════════════════

CARD 1 (Orange tint):
┌─────────────────────────────────────────┐
│  🔥 BURN ANALYST                        │
│  ───────────────────────────────────── │
│  Role: Fire Impact Specialist           │
│  Model: gemini-2.0-flash                │
│                                         │
│  SKILLS (3):                            │
│  • mtbs-classification                  │
│    MTBS severity codes                  │
│  • soil-burn-severity                   │
│    Erosion risk assessment              │
│  • boundary-mapping                     │
│    Fire perimeter analysis              │
│                                         │
│  Path: agents/burn_analyst/             │
│  Data: burn-severity.json               │
└─────────────────────────────────────────┘

CARD 2 (Blue tint):
┌─────────────────────────────────────────┐
│  🥾 TRAIL ASSESSOR                      │
│  ───────────────────────────────────── │
│  Role: Infrastructure Expert            │
│  Model: gemini-2.0-flash                │
│                                         │
│  SKILLS (3):                            │
│  • damage-classification                │
│    TRACS damage codes                   │
│  • closure-decision                     │
│    Safety recommendations               │
│  • recreation-priority                  │
│    Visitor access ranking               │
│                                         │
│  Path: agents/trail_assessor/           │
│  Data: trail-damage.json                │
└─────────────────────────────────────────┘

CARD 3 (Green tint):
┌─────────────────────────────────────────┐
│  🌲 CRUISING ASSISTANT                  │
│  ───────────────────────────────────── │
│  Role: Timber Salvage Advisor           │
│  Model: gemini-2.0-flash                │
│                                         │
│  SKILLS (4):                            │
│  • volume-estimation                    │
│    Board feet calculation               │
│  • salvage-assessment                   │
│    Economic viability                   │
│  • cruise-methodology                   │
│    FSVeg protocols                      │
│  • csv-insight                          │
│    Spreadsheet analysis                 │
│                                         │
│  Path: agents/cruising_assistant/       │
│  Data: timber-plots.json                │
└─────────────────────────────────────────┘

CARD 4 (Purple tint):
┌─────────────────────────────────────────┐
│  📋 NEPA ADVISOR                        │
│  ───────────────────────────────────── │
│  Role: Compliance Specialist            │
│  Model: gemini-2.5-flash (reasoning)    │
│                                         │
│  SKILLS (4):                            │
│  • pathway-decision                     │
│    CE vs EA vs EIS                      │
│  • compliance-timeline                  │
│    Deadline tracking                    │
│  • documentation                        │
│    EA/CE template generation            │
│  • pdf-extraction                       │
│    FSM/FSH document parsing             │
│                                         │
│  Path: agents/nepa_advisor/             │
│  Data: RAG over FSM/FSH PDFs            │
└─────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
CENTER ANNOTATION (between Coordinator and Specialists)
═══════════════════════════════════════════════════════════════════════════════

"DELEGATION FLOW:
User asks → Coordinator parses intent → Delegates via AgentTool
Specialist executes skills → Returns result → Coordinator synthesizes"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM SECTION — "SKILLS-FIRST ARCHITECTURE (ADR-005)"
═══════════════════════════════════════════════════════════════════════════════

Three-column insight:

COLUMN 1: "Value Lives in Skills"
"Skills are portable expertise packages
Each skill/ folder contains:
• skill.md (instructions)
• scripts/ (tools)
• resources/ (data)"

COLUMN 2: "Agents Are Orchestration"
"Agents bundle skills into personas
The same skill can power multiple agents
Skills can be tested independently"

COLUMN 3: "The Math"
"5 agents × avg 3.2 skills = 16 total
606 tests across the system
Skills reusable across USDA agencies"

═══════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════

"In AI, Operating Systems (agents) commoditize.
Applications (skills) capture value.
RANGER is a Skills factory."

Reference: ADR-005 Skills-First Architecture

--ar 16:9
```

---

## Generation Order

Recommended sequence for diagram generation:

1. **Phase 4 ADK Developer Stack** — P0, blocks all onboarding
2. **The Coordinator's Skill Roster** — P2, but quick win for README
3. **The MCP Abstraction Layer** — P1, explains core architecture pattern
4. **ADK Data Flow & SSE Streaming** — P2, detailed sequence for advanced understanding

---

## Post-Generation Checklist

After generating each diagram:

- [ ] Save to `docs/assets/diagrams/developer/` with exact filename
- [ ] Verify Git LFS tracks the file (`git lfs ls-files`)
- [ ] Update `README.md` to remove "(Planned)" marker
- [ ] Update `DIAGRAM-NARRATIVES.md` with any prompt adjustments
- [ ] Test that diagram renders correctly in GitHub

---

*Document created: December 28, 2025*
*Aligned with: ADR-005, ADR-006, ADR-007.1, ADR-008*

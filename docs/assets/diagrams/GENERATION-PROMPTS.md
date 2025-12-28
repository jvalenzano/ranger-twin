# Nano Banana Generation Prompts

Copy-paste these prompts into Nano Banana to generate the four missing developer diagrams.

---

## 1. Phase 4 ADK Developer Stack (P0 - Critical)

**Filename:** `Phase 4 ADK Developer Stack.png`
**Save to:** `docs/assets/diagrams/developer/`

```
Create a technical whiteboard diagram titled "RANGER Phase 4: Developer Environment"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk-drawn lines in white and cream. Hand-lettered labels. Use emerald green (#10B981) for active/running indicators, amber (#F59E0B) for data flow arrows, cyan (#06B6D4) for external services. Engineering blueprint aesthetic with slight hand-drawn imperfection.

Layout: Three horizontal tiers showing the complete development stack.

TOP TIER - "FRONTEND"
Large browser window frame labeled "Command Console"
- URL bar: "http://localhost:5173"
- Glowing green port badge: "5173"
- Inside browser: simplified UI showing left sidebar with 4 phase icons (fire, boot, tree, document), center 3D map with colored burn severity polygons, right chat panel with agent responses
- Tech stack annotation: "React 18 + Vite + Tailwind + Zustand"
- Folder path: "apps/command-console/"
- Arrow pointing DOWN labeled "SSE Stream (not WebSocket)"

MIDDLE TIER - "ADK ORCHESTRATOR"
Large hexagon in center labeled "ADK Runtime"
- Port badge: "8000" (glowing green)
- Inside hexagon, show nested structure with "Recovery Coordinator" (brain icon) at top and four specialist icons below in a row: fire icon "Burn Analyst", boot icon "Trail Assessor", tree icon "Cruising Assistant", document icon "NEPA Advisor"
- Tech annotation: "Python 3.11 + Google ADK + Gemini 2.0 Flash"
- Folder path: "agents/"
- Key insight callout box: "Single process • All agents in memory • AgentTool delegation"
- LEFT arrow to MCP labeled "Tool Calls"
- RIGHT arrow to cloud icon labeled "Gemini API (only external call)"

BOTTOM TIER - "DATA LAYER"
LEFT BOX: "MCP Fixtures Server"
- Port badge: "8080" (glowing green)
- Icon: JSON file with MCP logo
- Contents: burn-severity.json, trail-damage.json, timber-plots.json
- Folder path: "mcp/fixtures/"
- Annotation: "Phase 1: Simulated • Phase 2: Real APIs"

RIGHT BOX: "Session State"
- Icon: Memory chip
- Label: "InMemorySessionService"
- Annotation: "(Redis in production)"

NUMBERED FLOW ARROWS in amber showing request lifecycle:
1. User types question at :5173
2. SSE connection to :8000/stream
3. Coordinator delegates via AgentTool
4. Tool calls to MCP at :8080
5. Gemini generates reasoning
6. AgentBriefingEvent streams to UI

TERMINAL BOX at bottom center with monospace font:
"# Quick Start
cd apps/command-console && npm run dev  → :5173
python main.py                          → :8000
cd mcp/fixtures && python server.py     → :8080"

CORNER ANNOTATIONS in handwritten chalk:
Top-left: "Cedar Creek Fire • 127,000 acres • Willamette NF"
Top-right: "All AI reasoning is REAL • Only data is simulated"
Bottom-left: "mode=AUTO (ADR-007.1) • No infinite loops"
Bottom-right: "Google ADK + Gemini 2.0 Flash • FedRAMP path"

KEY INSIGHT CALLOUT BOX prominently displayed:
"THE SIMPLIFICATION:
Phase 1-3: 6 ports, 6 processes, microservice complexity
Phase 4: 3 ports, 3 processes, Skills-First simplicity"

--ar 16:9
```

---

## 2. The MCP Abstraction Layer (P1)

**Filename:** `The MCP Abstraction Layer.png`
**Save to:** `docs/assets/diagrams/developer/`

```
Create a technical whiteboard diagram titled "The MCP Abstraction Layer: Fixtures Today, APIs Tomorrow"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk lines with engineering schematic feel. Use a switchboard or patch panel visual metaphor for MCP in the center.

Layout: Left-to-right flow with central switching mechanism.

LEFT SECTION - "AGENTS (Consumers)"
Stack of 4 agent cards showing icon, name, and example tool call in monospace:

Fire icon - Burn Analyst
tool_call: get_burn_severity(sector="NW-4")

Boot icon - Trail Assessor
tool_call: get_trail_damage(trail_id="PCT-47")

Tree icon - Cruising Assistant
tool_call: get_timber_plots(unit="12")

Document icon - NEPA Advisor
tool_call: search_regulations(topic="salvage")

Annotation: "Agents don't know WHERE data comes from"
Arrow pointing right: "Standard Tool Interface"

CENTER - "MCP ROUTER (The Universal Adapter)"
Large visual of a patch panel or switchboard with multiple input jacks on left and output jacks on right, cables connecting them
- Title: "Model Context Protocol"
- Subtitle: "stdio | SSE | HTTP"
- Label: "Tool Routing Layer"

Inside the router, show decision logic box:
"get_burn_severity(sector)
  DEV:  → mcp-fixtures/:8080
  PROD: → mcp-geo/:8081 (GEE)"

Annotation: "Configuration determines routing • Agent code unchanged"

RIGHT SECTION - "DATA SOURCES (Providers)"
Split into TOP (active, solid lines, glowing) and BOTTOM (future, dashed lines, dimmed):

TOP - "Phase 1: Fixtures"
Box showing MCP Fixtures Server (:8080) with burn-severity.json, trail-damage.json, timber-plots.json
Badge: "ACTIVE NOW"

BOTTOM - "Phase 2+: Production APIs"
Two boxes with dashed outlines:
- MCP Geo Server (Google Earth Engine, Sentinel-2 API)
- MCP IRWIN Server (NIFC Perimeters, InciWeb)
Badge: "SWAP CONFIG → INSTANT UPGRADE"

BOTTOM SECTION - Three-panel comparison:
Panel 1 "Without MCP": "if env == 'dev': load_json() else: call_api()" with red X "Conditional logic everywhere"
Panel 2 "With MCP": "mcp.call_tool('get_burn_severity', {sector: 'NW-4'})" with green check "One interface, any source"
Panel 3 "The Result": "Agents ask WHAT • MCP decides HOW"

FOOTER: "MCP is the contract between intelligence and data. Change the wiring, not the code."

--ar 16:9
```

---

## 3. ADK Data Flow & SSE Streaming (P2)

**Filename:** `ADK Data Flow & SSE Streaming.png`
**Save to:** `docs/assets/diagrams/developer/`

```
Create a sequence diagram titled "The Pulse: How Questions Become Briefings"

Style: Tactical whiteboard on dark slate background (#0F172A). Swimlane sequence diagram with chalk-drawn lines. Emerald (#10B981) for success events, amber (#F59E0B) for in-progress, cyan (#06B6D4) for data calls.

Layout: Four vertical swimlanes with horizontal message flow.

SWIMLANES from left to right:
1. "User (React)" - Browser window icon - Port :5173
2. "ADK Orchestrator" - Hexagon with brain - Port :8000 - Contains Coordinator + Specialists
3. "Gemini API" - Cloud with sparkles - Label "gemini-2.0-flash"
4. "MCP Fixtures" - Database/JSON icon - Port :8080

SEQUENCE FLOW with numbered steps:

Step 1: User to ADK solid arrow "What's the burn severity in Sector NW-4?" labeled "POST /chat"

Step 2: ADK opens dashed double-line back to User labeled "SSE stream opened" with annotation "Long-lived connection"

Step 3: ADK to Gemini amber arrow "Send prompt with context"

Step 4: Gemini to ADK dashed amber "Reasoning: I should delegate to Burn Analyst..."

Step 5: ADK to User emerald SSE arrow "Event: reasoning_trace" with UI annotation "Thinking indicator appears"

Step 6: Self-loop on ADK "Coordinator delegates to Burn Analyst (AgentTool)" with annotation "mode=AUTO"

Step 7: ADK to MCP cyan arrow "get_burn_severity(sector='NW-4')"

Step 8: MCP to ADK cyan arrow "ToolResult(JSON)" with data snippet showing sector NW-4 severity HIGH

Step 9: ADK to Gemini amber "Tool result + generate briefing"

Step 10: Gemini to ADK amber "Final analysis text"

Step 11: ADK to User thick emerald SSE arrow "Event: agent_briefing" with annotation "Briefing card renders with Proof Layer"

Step 12: ADK to User emerald "Event: stream_complete"

TIMING ANNOTATIONS on right margin:
Steps 1-2: ~50ms
Steps 3-5: ~500ms
Steps 6-10: ~2-5s
Steps 11-12: ~100ms
Total: 3-6 seconds

KEY CALLOUTS in chalk boxes:
Near step 2: "SSE vs WebSocket: SSE is server-push, unidirectional. Simpler, sufficient for our needs."
Near step 6: "AgentTool Pattern (ADR-008): Coordinator calls specialists as tools"
Near step 11: "AgentBriefingEvent includes: summary, detail, confidence, reasoning_chain, citations"

FOOTER: "Every question triggers a cascade. Every step streams to the user. Transparency isn't a feature—it's the architecture."

--ar 16:9
```

---

## 4. The Coordinator's Skill Roster (P2)

**Filename:** `The Coordinator's Skill Roster.png`
**Save to:** `docs/assets/diagrams/developer/`

```
Create a roster diagram titled "The Coordinator's Skill Roster: 5 Agents, 16 Skills"

Style: Tactical whiteboard on dark slate background (#0F172A). Team roster or trading card aesthetic. Each agent is a card with skills listed. Hand-drawn chalk style with agent-specific accent colors (orange for Burn, blue for Trail, green for Cruising, purple for NEPA).

Layout: Hierarchical tree with Coordinator card at top center, four specialist cards in row below.

TOP - RECOVERY COORDINATOR card (largest):
Brain icon, title "RECOVERY COORDINATOR"
Role: "Mission Commander"
Model: "gemini-2.0-flash"
Pattern: "AgentTool delegation (ADR-008)"
SKILLS section showing two skill boxes:
- "delegation" - Routes queries to specialists
- "portfolio-triage" - Prioritizes incidents
Path: "agents/coordinator/"

Four arrows branch DOWN from Coordinator labeled "AgentTool"

BOTTOM ROW - Four specialist cards:

CARD 1 (Orange tint) - BURN ANALYST
Fire icon
Role: "Fire Impact Specialist"
Model: "gemini-2.0-flash"
SKILLS (3):
- mtbs-classification: MTBS severity codes
- soil-burn-severity: Erosion risk assessment
- boundary-mapping: Fire perimeter analysis
Path: "agents/burn_analyst/"
Data: "burn-severity.json"

CARD 2 (Blue tint) - TRAIL ASSESSOR
Boot icon
Role: "Infrastructure Expert"
Model: "gemini-2.0-flash"
SKILLS (3):
- damage-classification: TRACS damage codes
- closure-decision: Safety recommendations
- recreation-priority: Visitor access ranking
Path: "agents/trail_assessor/"
Data: "trail-damage.json"

CARD 3 (Green tint) - CRUISING ASSISTANT
Tree icon
Role: "Timber Salvage Advisor"
Model: "gemini-2.0-flash"
SKILLS (4):
- volume-estimation: Board feet calculation
- salvage-assessment: Economic viability
- cruise-methodology: FSVeg protocols
- csv-insight: Spreadsheet analysis
Path: "agents/cruising_assistant/"
Data: "timber-plots.json"

CARD 4 (Purple tint) - NEPA ADVISOR
Document icon
Role: "Compliance Specialist"
Model: "gemini-2.5-flash (reasoning)"
SKILLS (4):
- pathway-decision: CE vs EA vs EIS
- compliance-timeline: Deadline tracking
- documentation: EA/CE template generation
- pdf-extraction: FSM/FSH document parsing
Path: "agents/nepa_advisor/"
Data: "RAG over FSM/FSH PDFs"

CENTER ANNOTATION between Coordinator and Specialists:
"DELEGATION FLOW: User asks → Coordinator parses intent → Delegates via AgentTool → Specialist executes skills → Returns result → Coordinator synthesizes"

BOTTOM SECTION - Three columns:
Column 1 "Value Lives in Skills": Skills are portable expertise packages with skill.md, scripts/, resources/
Column 2 "Agents Are Orchestration": Agents bundle skills into personas, same skill can power multiple agents
Column 3 "The Math": 5 agents × avg 3.2 skills = 16 total, 606 tests

FOOTER: "In AI, Operating Systems (agents) commoditize. Applications (skills) capture value. RANGER is a Skills factory."
Reference: "ADR-005 Skills-First Architecture"

--ar 16:9
```

---

## Post-Generation Checklist

After generating each diagram:

1. ☐ Download from Nano Banana
2. ☐ Rename to exact filename specified above
3. ☐ Move to `docs/assets/diagrams/developer/`
4. ☐ Verify Git LFS tracking: `git lfs ls-files | grep <filename>`
5. ☐ Commit: `git add . && git commit -m "docs: add <diagram name>"`
6. ☐ Update README.md to change status from "📋 Planned" to "✅ Current"

---

## Quick Reference

| Priority | Diagram | Filename |
|----------|---------|----------|
| **P0** | Phase 4 ADK Developer Stack | `Phase 4 ADK Developer Stack.png` |
| **P1** | The MCP Abstraction Layer | `The MCP Abstraction Layer.png` |
| **P2** | ADK Data Flow & SSE Streaming | `ADK Data Flow & SSE Streaming.png` |
| **P2** | The Coordinator's Skill Roster | `The Coordinator's Skill Roster.png` |

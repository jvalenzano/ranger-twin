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

---

## 5. The Knowledge Pipeline (RAG Architecture)

**Filename:** `rag-knowledge-pipeline.png`
**Save to:** `docs/assets/diagrams/developer/`

```
Create a technical whiteboard diagram titled "The Knowledge Pipeline: From Federal Docs to Agent Intelligence"

Style: Tactical whiteboard on dark slate background (#0F172A). Chalk-drawn lines in white and cream. Hand-lettered labels. Use emerald green (#10B981) for data flow arrows, amber (#F59E0B) for processing stages, cyan (#06B6D4) for cloud services. Engineering blueprint aesthetic with slight hand-drawn imperfection.

Layout: Left-to-right flow with five distinct processing stages, plus a bottom section showing the agent-corpus mapping.

═══════════════════════════════════════════════════════════════════════════════
TOP BANNER — "DOCUMENT PROVENANCE CHAIN"
═══════════════════════════════════════════════════════════════════════════════

Subtitle: "Every citation traceable to authoritative federal source"

═══════════════════════════════════════════════════════════════════════════════
STAGE 1 (Far Left) — "AUTHORITATIVE SOURCES"
═══════════════════════════════════════════════════════════════════════════════

Stack of official source badges with agency seals:

┌─────────────────────────────────┐
│  🏛️ OFFICIAL FEDERAL SOURCES   │
├─────────────────────────────────┤
│  [USFS Shield] FS Directives    │
│  FSM • FSH • GTR Publications   │
├─────────────────────────────────┤
│  [eCFR Logo] Code of Federal    │
│  Regulations (7 CFR, 36 CFR)    │
├─────────────────────────────────┤
│  [USGS Logo] MTBS Portal        │
│  Burn Severity Classification   │
├─────────────────────────────────┤
│  [NRCS Logo] Technical Notes    │
│  Post-Fire Hydrology            │
└─────────────────────────────────┘

Document count badge: "16 Documents (Tier 1)"
Annotation: "Not scraped • Official publications only"

Arrow pointing RIGHT labeled "1_download_documents.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 2 — "LOCAL STAGING"
═══════════════════════════════════════════════════════════════════════════════

Folder structure visualization:

┌─────────────────────────────────┐
│  📁 knowledge/local/            │
├─────────────────────────────────┤
│  ├─ 📁 nepa/                    │
│  │   └─ 3 PDFs                  │
│  ├─ 📁 burn_severity/           │
│  │   └─ 6 PDFs                  │
│  ├─ 📁 timber_salvage/          │
│  │   └─ 3 PDFs                  │
│  └─ 📁 trail_infrastructure/    │
│      └─ 4 PDFs                  │
└─────────────────────────────────┘

File icon showing: "manifest.yaml"
Annotation: "Single source of truth • 16 docs inventoried"

Arrow pointing RIGHT labeled "2_sync_to_gcs.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 3 — "CLOUD STORAGE"
═══════════════════════════════════════════════════════════════════════════════

Google Cloud Storage bucket visualization:

┌─────────────────────────────────┐
│  ☁️ gs://ranger-knowledge-base-eu/ │
│  Region: europe-west3 (Frankfurt)  │
├─────────────────────────────────┤
│  📦 nepa/                       │
│  📦 burn_severity/              │
│  📦 timber_salvage/             │
│  📦 trail_infrastructure/       │
└─────────────────────────────────┘

Badge: "~$0.20/month storage"
Annotation: "Persistent • Versioned • Auditable"

Arrow pointing RIGHT labeled "3_create_corpora.py + 4_import_documents.py"

═══════════════════════════════════════════════════════════════════════════════
STAGE 4 — "VERTEX AI RAG ENGINE"
═══════════════════════════════════════════════════════════════════════════════

Central processing engine visualization (hexagonal or cylindrical):

┌─────────────────────────────────┐
│  🧠 VERTEX AI RAG ENGINE        │
│  ─────────────────────────────  │
│  Embedding: text-embedding-005  │
│  Chunks: 512 tokens             │
│  Overlap: 100 tokens            │
├─────────────────────────────────┤
│  4 CORPORA:                     │
│  ┌───────────────────────────┐  │
│  │ ranger-nepa-regulations   │  │
│  │ ranger-burn-severity      │  │
│  │ ranger-timber-salvage     │  │
│  │ ranger-trail-infrastructure│ │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Badge: "FedRAMP High (via Vertex AI)"
Annotation: "Semantic search • Relevance scoring"

Arrow pointing RIGHT labeled "rag_query.py tool calls"

═══════════════════════════════════════════════════════════════════════════════
STAGE 5 (Far Right) — "AGENT RESPONSE + PROOF LAYER"
═══════════════════════════════════════════════════════════════════════════════

Agent briefing card with embedded citations:

┌─────────────────────────────────────────┐
│  📋 NEPA ADVISOR BRIEFING               │
│  ─────────────────────────────────────  │
│  "This action qualifies for a           │
│  Categorical Exclusion under            │
│  FSH 1909.15 Chapter 30..."             │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  PROOF LAYER                    │    │
│  │  Confidence: 94% ████████░░     │    │
│  │  ─────────────────────────────  │    │
│  │  Citations:                     │    │
│  │  [FSH] 1909.15-Ch30 §30.3      │    │
│  │  [CFR] 7 CFR 1b.3(a)(3)        │    │
│  │  ─────────────────────────────  │    │
│  │  Click citation → View source   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

Annotation: "Every claim traceable • Auditor-ready"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM SECTION — "CORPUS-TO-AGENT MAPPING"
═══════════════════════════════════════════════════════════════════════════════

Four-column mapping table with agent icons:

| Agent | Corpus | Documents | Domain Expertise |
|-------|--------|-----------|------------------|
| 📋 NEPA Advisor | ranger-nepa-regulations | 3 | CE/EA/EIS pathways, FSM/FSH |
| 🔥 Burn Analyst | ranger-burn-severity | 6 | MTBS, BAER, soil severity |
| 🌲 Cruising Assistant | ranger-timber-salvage | 3 | FSVeg, appraisal, deterioration |
| 🥾 Trail Assessor | ranger-trail-infrastructure | 4 | FSTAG, TMOs, accessibility |

Annotation below table: "Each agent queries ONLY its corpus • No cross-contamination • Domain isolation"

═══════════════════════════════════════════════════════════════════════════════
CORNER ANNOTATIONS (handwritten chalk style)
═══════════════════════════════════════════════════════════════════════════════

Top-left: "ADR-010: Vertex RAG Migration"
Top-right: "Region: europe-west3 (GA for RAG Engine)"
Bottom-left: "Pipeline: 5 idempotent scripts"
Bottom-right: "Total: 16 docs • 4 corpora • 1 source of truth"

═══════════════════════════════════════════════════════════════════════════════
KEY INSIGHT CALLOUT (prominent chalk box, center-bottom)
═══════════════════════════════════════════════════════════════════════════════

"🎯 THE KNOWLEDGE PRINCIPLE:
Agents are reasoning engines, not knowledge stores.
Domain expertise lives in RAG corpora.
Every insight cites its source.
Auditors can trace any claim to the original federal document."

--ar 16:9
```

---

## 6. The Federal Knowledge Base (Stakeholder View)

**Filename:** `federal-knowledge-base.png`
**Save to:** `docs/assets/diagrams/stakeholder/`

```
Create a stakeholder presentation diagram titled "The Federal Knowledge Base: Authoritative Intelligence"

Style: Professional dark presentation slide with tactical futurism aesthetic. Dark slate background (#0F172A) with subtle grid pattern. Clean sans-serif typography (not handwritten). Use RANGER brand colors: emerald (#10B981) for positive/trust elements, amber (#F59E0B) for highlights, slate grays for structure. Government/military briefing aesthetic—serious, trustworthy, precise.

Layout: Center-focused radial design with four domain quadrants, surrounded by source badges and trust indicators.

═══════════════════════════════════════════════════════════════════════════════
HEADER
═══════════════════════════════════════════════════════════════════════════════

Title: "RANGER KNOWLEDGE BASE"
Subtitle: "Authoritative Federal Sources • Transparent Citations • Auditable Trail"

Small RANGER logo (top-left), USDA Forest Service shield (top-right)

═══════════════════════════════════════════════════════════════════════════════
CENTER — "KNOWLEDGE DOMAINS" (Radial/Quadrant Layout)
═══════════════════════════════════════════════════════════════════════════════

Four domain quadrants arranged around a central hub, each with distinct color tint:

CENTRAL HUB:
- Hexagon shape
- Label: "Vertex AI RAG Engine"
- Badge: "FedRAMP High Path"
- Icon: Brain with document nodes

QUADRANT 1 (Top-Left, Purple tint) — NEPA COMPLIANCE:
┌─────────────────────────────────┐
│  📋 NEPA ADVISOR KNOWLEDGE      │
│  ─────────────────────────────  │
│  3 Documents                    │
│                                 │
│  📄 7 CFR Part 1b               │
│     USDA NEPA Procedures        │
│                                 │
│  📄 FSH 1909.15 Chapter 30      │
│     Categorical Exclusions      │
│                                 │
│  📄 FSM 1950                    │
│     Environmental Policy        │
│                                 │
│  ✓ CE/EA/EIS pathway decisions  │
│  ✓ Compliance timeline guidance │
└─────────────────────────────────┘

QUADRANT 2 (Top-Right, Orange tint) — BURN SEVERITY:
┌─────────────────────────────────┐
│  🔥 BURN ANALYST KNOWLEDGE      │
│  ─────────────────────────────  │
│  6 Documents                    │
│                                 │
│  📄 FSM 2500-2523 (BAER)        │
│     Emergency Response          │
│                                 │
│  📄 RMRS-GTR-243                │
│     Soil Burn Severity Guide    │
│                                 │
│  📄 MTBS Classification         │
│     Severity Mapping Protocol   │
│                                 │
│  + 3 more (hydrology, debris)   │
│                                 │
│  ✓ dNBR analysis guidance       │
│  ✓ BAER assessment protocols    │
└─────────────────────────────────┘

QUADRANT 3 (Bottom-Left, Green tint) — TIMBER SALVAGE:
┌─────────────────────────────────┐
│  🌲 CRUISING ASSISTANT KNOWLEDGE│
│  ─────────────────────────────  │
│  3 Documents                    │
│                                 │
│  📄 FSH 2409.12                 │
│     Timber Cruising Handbook    │
│                                 │
│  📄 FSH 2409.15                 │
│     Timber Sale Administration  │
│                                 │
│  📄 36 CFR Part 223             │
│     Appraisal & Pricing         │
│                                 │
│  ✓ Volume estimation methods    │
│  ✓ Salvage sale procedures      │
└─────────────────────────────────┘

QUADRANT 4 (Bottom-Right, Blue tint) — TRAIL INFRASTRUCTURE:
┌─────────────────────────────────┐
│  🥾 TRAIL ASSESSOR KNOWLEDGE    │
│  ─────────────────────────────  │
│  4 Documents                    │
│                                 │
│  📄 FSTAG                       │
│     Trail Accessibility Guide   │
│                                 │
│  📄 Trail Fundamentals (TMOs)   │
│     Management Objectives       │
│                                 │
│  📄 ABA Outdoor Standards       │
│     Accessibility Requirements  │
│                                 │
│  📄 Post-Fire Bridge Assessment │
│     Structural Evaluation       │
│                                 │
│  ✓ TRACS damage classification  │
│  ✓ Closure decision support     │
└─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
LEFT SIDEBAR — "AUTHORITATIVE SOURCES"
═══════════════════════════════════════════════════════════════════════════════

Vertical stack of official source badges with agency seals:

┌─────────────────────────────────┐
│  🏛️ SOURCE AUTHORITIES          │
├─────────────────────────────────┤
│  [USFS Shield]                  │
│  Forest Service Directives      │
│  FSM • FSH • Research Stations  │
├─────────────────────────────────┤
│  [Federal Register]             │
│  Code of Federal Regulations    │
│  7 CFR • 36 CFR                 │
├─────────────────────────────────┤
│  [USGS Logo]                    │
│  Monitoring Trends in           │
│  Burn Severity (MTBS)           │
├─────────────────────────────────┤
│  [NRCS Logo]                    │
│  Natural Resources              │
│  Conservation Service           │
└─────────────────────────────────┘

Caption: "Official publications only • No web scraping"

═══════════════════════════════════════════════════════════════════════════════
RIGHT SIDEBAR — "THE TRUST CHAIN"
═══════════════════════════════════════════════════════════════════════════════

Vertical flow showing citation transparency:

┌─────────────────────────────────┐
│  🔗 CITATION TRANSPARENCY       │
├─────────────────────────────────┤
│                                 │
│  ① Agent makes claim:           │
│     "Qualifies for CE under     │
│      FSH 1909.15 §30.3"         │
│            ↓                    │
│  ② Citation chip rendered:      │
│     [FSH 1909.15-Ch30]          │
│            ↓                    │
│  ③ User clicks chip:            │
│     → Opens source PDF          │
│     → Highlights relevant       │
│       passage                   │
│            ↓                    │
│  ④ Auditor verifies:            │
│     ✓ Claim matches source      │
│     ✓ Source is authoritative   │
│     ✓ Chain is unbroken         │
│                                 │
└─────────────────────────────────┘

Caption: "Every insight auditable"

═══════════════════════════════════════════════════════════════════════════════
BOTTOM SECTION — "TRUST INDICATORS"
═══════════════════════════════════════════════════════════════════════════════

Three trust badges in a horizontal row:

BADGE 1:
┌───────────────────┐
│  ✓ AUTHORITATIVE  │
│  ───────────────  │
│  16 Federal Docs  │
│  Official Sources │
│  Only             │
└───────────────────┘

BADGE 2:
┌───────────────────┐
│  ✓ TRANSPARENT    │
│  ───────────────  │
│  Every Claim      │
│  Cites Source     │
│  Click to Verify  │
└───────────────────┘

BADGE 3:
┌───────────────────┐
│  ✓ AUDITABLE      │
│  ───────────────  │
│  Full Provenance  │
│  FedRAMP Path     │
│  IG-Ready         │
└───────────────────┘

═══════════════════════════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════════════════════════

Left: "RANGER • Agentic OS for Forest Recovery"
Center: "16 Documents • 4 Domains • 1 Source of Truth"
Right: "TechTrend Federal"

═══════════════════════════════════════════════════════════════════════════════
KEY MESSAGE CALLOUT (bottom center, above footer)
═══════════════════════════════════════════════════════════════════════════════

Prominent box with emerald border:

"RANGER doesn't make things up.
Every recommendation traces to authoritative federal guidance.
Click any citation to verify the source."

--ar 16:9
```

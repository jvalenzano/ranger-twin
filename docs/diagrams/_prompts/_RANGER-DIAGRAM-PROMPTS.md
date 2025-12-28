# RANGER Diagram Generation Prompts

> **Tool:** Nano Banana Pro (Gemini 3 Pro Image)  
> **Platform:** Google AI Studio  
> **Aspect Ratio:** 16:9 (all diagrams)  
> **Style System:** Tactical Whiteboard (dark slate, chalk aesthetic)

---

## Style Guide: The RANGER Visual Language

Before generating any diagram, internalize this consistent visual language:

### Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background (Base) | Deep Slate Blue | #0F172A |
| Primary Lines/Text | Chalk White | #F8FAFC |
| Accent - Success/Info | RANGER Emerald | #10B981 |
| Accent - Warning | Amber | #F59E0B |
| Accent - Critical | Alert Red | #EF4444 |
| Accent - Highlight | Cyan | #06B6D4 |
| Muted/Archived | Slate Gray | #64748B |

### Agent Iconography (Consistent Across All Diagrams)
| Agent | Icon | Color Tint |
|-------|------|------------|
| Recovery Coordinator | Brain / Conductor | White |
| Burn Analyst | 🔥 Flame | Orange-red |
| Trail Assessor | 🥾 Hiking Boot | Blue |
| Cruising Assistant | 🌲 Conifer Tree | Green |
| NEPA Advisor | 📋 Document/Clipboard | Purple |

### Typography
- **Headers:** Bold, architectural lettering (chalk-drawn feel)
- **Labels:** Clean sans-serif, handwritten style
- **Code/Data:** Monospace (JetBrains Mono style)
- **Annotations:** Informal chalk notes in corners

### Visual Principles
1. **Flow Direction:** Left-to-right or top-to-bottom for narrative clarity
2. **Depth:** Use subtle glow/shadow to create visual hierarchy
3. **Contrast:** High contrast between elements for readability
4. **Annotations:** Include informal "chalk notes" that answer common questions

---

# TRACK 1: DEVELOPER DIAGRAMS

These diagrams live in `docs/diagrams/developer/` and serve as technical reference for the engineering team.

---

## 1.1 ADK Runtime & Skill Loading

**File:** `adk-runtime-skills.png`

**Purpose:** Shows how the Recovery Coordinator loads and invokes Skills from the Skills Library. This is the "brain" diagram showing the Skills-First architecture in action.

**Question It Answers:** "How does the Coordinator load and invoke Skills?"

### Generation Prompt

```
Create a highly detailed technical whiteboard diagram titled "ADK Runtime: The Skills-First Brain" on a deep textured slate blue background (#0F172A).

LAYOUT: Central hub-and-spoke architecture with three zones.

=== TOP ZONE: "User Intent" ===
A chat input field labeled "Command Console (React)" showing example text: "What's the recovery status?"
Arrow pointing DOWN labeled "SSE Connection" with a small lightning bolt icon.
Style: Glowing cyan border (#06B6D4) to indicate active connection.

=== CENTER ZONE: "The Brain" (largest element) ===
A large hexagonal shape representing the ADK Runtime.
Inside the hexagon, show three nested layers:
- Outer ring: "Google ADK Framework"
- Middle ring: "Session State Management"  
- Inner core: "Gemini 2.0 Flash" with a sparkle icon

Label the hexagon: "Recovery Coordinator Agent"
Subtitle: "The Stateful Orchestrator"

Below the hexagon, show the runtime capabilities as small icon badges:
- "Context Window" (document icon)
- "Tool Execution" (gear icon)
- "Reasoning Chains" (chain link icon)

=== LEFT ZONE: "Skills Library" ===
A vertical stack of 6 folder-shaped cards "plugging into" the central hexagon.
Each card has a small icon and label:
1. 📊 "Portfolio Triage" (emerald border)
2. 🔥 "Burn Severity Analysis" (orange border)
3. 🥾 "Trail Damage Assessment" (blue border)
4. 🌲 "Timber Cruise Analysis" (green border)
5. 📋 "NEPA Pathway Decision" (purple border)
6. 🔗 "Cross-Domain Synthesis" (cyan border)

Show dashed arrows from each skill card pointing INTO the hexagon.
Label this connection: "Dynamic Skill Loading"

Small annotation near the stack: "skills/ folder in monorepo"

=== RIGHT ZONE: "Data Layer (MCP)" ===
Two rounded rectangles representing MCP Servers:

Rectangle 1: "MCP Fixtures" 
- Icon: JSON file
- Subtitle: "localhost:8080"
- Connected to small file icons: "burn-severity.json", "trail-damage.json"

Rectangle 2: "MCP External" (slightly grayed/future state)
- Icon: Cloud
- Subtitle: "Phase 2+"
- Label: "Sentinel-2, NIFC, GEE"

Double-headed arrows connecting the hexagon to both MCP rectangles.
Label: "Tool Calls → ToolResult"

=== BOTTOM ZONE: "Output Stream" ===
Arrow pointing DOWN from the hexagon.
Show streaming events flowing to the UI:
- "AgentBriefingEvent" boxes flowing downward
- Each box has a small type indicator: "INSIGHT", "STATUS", "ALERT"

=== CORNER ANNOTATIONS (chalk-style) ===
Top-left: "Skills-First Architecture (ADR-005)"
Top-right: "Agents are just bundles of Skills"
Bottom-left: "Single Python process • No microservices"
Bottom-right: "FedRAMP compliant via Vertex AI"

=== KEY INSIGHT CALLOUT BOX ===
Bottom center, chalk-outlined box with emerald border:
"🎯 THE ARCHITECTURE PRINCIPLE:
Value lives in Skills, not Agents.
Skills are portable. Agents are configuration."

Style: Da Vinci engineering sketch meets tactical operations center. Clean chalk lines on dark slate. Subtle glow effects on active connections. 16:9 aspect ratio.
```

---

## 1.2 SSE Streaming Flow

**File:** `sse-streaming-flow.png`

**Purpose:** Shows how events flow from the ADK Runtime to the React frontend via Server-Sent Events. This is the "pulse" of the system.

**Question It Answers:** "How do events stream from backend to frontend?"

### Generation Prompt

```
Create a detailed technical sequence diagram titled "The Pulse: SSE Event Streaming" on a deep slate blue background (#0F172A).

LAYOUT: Vertical swimlane diagram with 4 columns and time flowing top-to-bottom.

=== SWIMLANE HEADERS (top row) ===
Column 1: "User (React)" - Browser icon - cyan tint
Column 2: "ADK Runtime (Python)" - Hexagon icon - white
Column 3: "Gemini API (Cloud)" - Brain/sparkle icon - amber
Column 4: "MCP Server (Data)" - Database icon - emerald

=== SEQUENCE STEPS (numbered, flowing down) ===

STEP ① 
User column: Chat bubble with "Analyze Sector 4"
Arrow RIGHT to ADK: "POST /chat (SSE connection opens)"
Label on arrow: "Connection stays open"

STEP ②
ADK column: Processing indicator
Arrow RIGHT to Gemini: "Prompt + Context + Tool Definitions"

STEP ③
Gemini column: Thinking indicator (sparkle animation implied)
Arrow LEFT to ADK: "reasoning: 'Checking severity data...'"
Note: "Interim thinking (not charged)"

STEP ④
ADK column: Event box
Arrow LEFT to User: "SSE: { type: 'THINKING', content: '...' }"
User column: Show UI element "Thinking spinner appears"

STEP ⑤
Gemini column: Tool call indicator
Arrow LEFT to ADK: "tool_call: get_burn_severity('sector-4')"

STEP ⑥
ADK column: Routing indicator
Arrow RIGHT to MCP: "MCP Request"

STEP ⑦
MCP column: Data retrieval
Arrow LEFT to ADK: "{ severity: 'HIGH', acres: 21500, dnbr: 0.76 }"

STEP ⑧
ADK column: Processing
Arrow RIGHT to Gemini: "Tool Result"

STEP ⑨
Gemini column: Final synthesis
Arrow LEFT to ADK: "Final Answer: 'Sector 4 shows critical burn...'"

STEP ⑩
ADK column: Event formatting
Arrow LEFT to User: "SSE: AgentBriefingEvent { type: 'INSIGHT', ... }"
User column: Show UI element "Briefing card renders"

=== TIMELINE ANNOTATIONS (right margin) ===
Show elapsed time markers:
- "0ms: Query sent"
- "200ms: Thinking begins"
- "800ms: Tool call"
- "1200ms: Data returned"
- "1800ms: Final response"
- "~2s total round trip"

=== KEY INSIGHT CALLOUT (bottom) ===
Chalk-outlined box:
"SSE vs WebSocket: One-way stream, simpler protocol.
Events flow continuously until connection closes.
No polling. Real-time updates."

=== CORNER ANNOTATIONS ===
Top-left: "PROTOCOL-AGENT-COMMUNICATION.md"
Top-right: "Single long-lived connection per session"
Bottom-right: "Zustand store → React re-render"

Style: Clean engineering diagram, subtle glow on active paths, time flowing clearly downward. Arrows should have small animated pulse indicators (implied). 16:9 aspect ratio.
```

---

## 1.3 MCP Data Layer

**File:** `mcp-data-layer.png`

**Purpose:** Shows how the MCP (Model Context Protocol) abstracts data sources, enabling seamless switching between fixtures (dev) and real APIs (prod).

**Question It Answers:** "How do Tools get data? How do we switch between fixtures and real APIs?"

### Generation Prompt

```
Create a technical architecture diagram titled "The Universal Adapter: MCP Data Layer" on a deep slate blue background (#0F172A).

LAYOUT: Three vertical zones representing the abstraction layers.

=== LEFT ZONE: "Consumers (Agents)" ===
Four agent boxes arranged vertically:

1. 🔥 "Burn Analyst Agent" (orange-tinted border)
   Code snippet below: `tool_call: get_burn_severity(sector_id)`

2. 🥾 "Trail Assessor Agent" (blue-tinted border)
   Code snippet below: `tool_call: get_trail_damage(trail_id)`

3. 🌲 "Cruising Assistant Agent" (green-tinted border)
   Code snippet below: `tool_call: get_timber_plots(unit_id)`

4. 📋 "NEPA Advisor Agent" (purple-tinted border)
   Code snippet below: `tool_call: search_regulations(query)`

All four boxes have arrows pointing RIGHT toward the center zone.
Collective label on arrows: "Standard Tool Interface"

=== CENTER ZONE: "MCP Router" (largest element) ===
A switchboard/patch-bay visual metaphor.
Large rounded rectangle with the title "Model Context Protocol"

Inside, show a routing matrix:
- Left side: "Tool Requests" (incoming arrows)
- Center: "Schema Validation + Routing" (gear icons)
- Right side: "Data Sources" (outgoing arrows)

Show a configuration toggle/switch labeled:
"Environment: [DEV] / PROD"
The DEV option is highlighted/selected.

Subtitle: "Agents ask 'What'. MCP decides 'How'."

=== RIGHT ZONE: "Providers (Data Sources)" ===
Split into TOP (Active) and BOTTOM (Future) sections.

TOP SECTION - "Development Mode" (bright, active):
Rounded rectangle: "MCP Fixtures Server"
- URL: "localhost:8080"
- Icon: JSON file stack

Connected to three file representations:
- "burn-severity.json" (orange tag)
- "trail-damage.json" (blue tag)  
- "timber-plots.json" (green tag)

Live wire/solid connection to MCP Router.
Green "ACTIVE" badge.

BOTTOM SECTION - "Production Mode" (grayed, dotted lines):
Three rounded rectangles:
1. "Sentinel-2 API" - Satellite icon
2. "NIFC REST API" - Fire icon
3. "Google Earth Engine" - Globe icon

Dotted wire connections to MCP Router.
Gray "PHASE 2" badges.

=== BOTTOM SECTION: "The Abstraction Benefit" ===
Two side-by-side code blocks showing the key insight:

LEFT CODE BLOCK (labeled "Agent Code - NEVER CHANGES"):
```python
result = await tool.get_burn_severity(
    sector_id="SW-4"
)
# Returns: ToolResult
```

RIGHT CODE BLOCK (labeled "MCP Config - CHANGES PER ENV"):
```yaml
# dev.yaml
burn_severity:
  provider: fixtures
  path: ./data/fixtures/

# prod.yaml  
burn_severity:
  provider: sentinel2
  api_key: ${SENTINEL_KEY}
```

Arrow between them labeled: "Same interface, different backend"

=== CORNER ANNOTATIONS ===
Top-left: "MCP-REGISTRY-STANDARD.md"
Top-right: "Zero code changes for production"
Bottom-left: "Fixtures match federal data schemas"
Bottom-right: "Lazy loading: fetch on demand"

=== KEY INSIGHT CALLOUT ===
Chalk-outlined box at bottom center:
"🎯 THE MCP PRINCIPLE:
Agent code is environment-agnostic.
Swap fixtures → APIs by changing config, not code."

Style: Patch-bay/switchboard aesthetic, clear visual separation between active and future states. 16:9 aspect ratio.
```

---

## 1.4 Developer Port Map

**File:** `developer-port-map.png`

**Purpose:** Quick reference showing all services and their ports for local development. The "what's running where" diagram.

**Question It Answers:** "What ports are running? What's the development environment topology?"

### Generation Prompt

```
Create a clean technical reference diagram titled "RANGER Dev Environment: Port Map" on a deep slate blue background (#0F172A).

LAYOUT: Three horizontal tiers representing the stack layers, with a terminal reference at bottom.

=== TOP TIER: "Frontend Layer" ===
Large browser window mockup labeled "Command Console"

Inside the browser:
- URL bar: "http://localhost:3000"
- Simplified UI showing: Left sidebar (4 phase icons), Center map area, Right chat panel

Tech stack badges below browser:
- "React 18" (cyan)
- "Vite" (purple)  
- "Tailwind CSS" (blue)
- "Zustand" (orange)

Port badge: Large glowing "3000" in emerald green

Folder path: "apps/command-console/"

Arrow pointing DOWN labeled "REST + SSE"

=== MIDDLE TIER: "Orchestration Layer" ===
Large hexagon labeled "ADK Runtime"

Inside hexagon:
- "Recovery Coordinator"
- "Google ADK + Gemini"
- "All Agents Loaded Here"

Port badge: Large glowing "8000" in white

Tech stack badges:
- "Python 3.11"
- "FastAPI"
- "google-adk"

Folder path: "agents/coordinator/"

Two arrows from hexagon:
- LEFT arrow to MCP (labeled "Tool Calls")
- RIGHT arrow to cloud (labeled "Gemini API")

=== BOTTOM TIER: "Data & External Services" ===

LEFT BOX: "MCP Fixtures Server"
- Port badge: "8080" in emerald
- Icon: JSON file stack
- Content: "Serves fixture data"
- Folder: "mcp/fixtures/"

CENTER BOX: "Session Store" (smaller)
- Label: "InMemorySessionService"
- Note: "(Redis in production)"
- No port (in-process)

RIGHT BOX: "Gemini API" (cloud shape)
- Label: "api.gemini.google.com"
- Badge: "External"
- Note: "Only external dependency"

=== BOTTOM SECTION: "Quick Start Commands" ===
Terminal-style box with dark background:

```bash
# Option 1: Docker Compose (recommended)
docker-compose up -d

# Option 2: Manual startup
cd apps/command-console && pnpm dev        # → :3000
cd agents && python -m coordinator.main    # → :8000
cd mcp/fixtures && python -m server        # → :8080
```

=== SERVICE CONNECTION MAP ===
Show connection lines between services:
- Browser (:3000) → ADK (:8000): "SSE Stream"
- ADK (:8000) → MCP (:8080): "Tool Requests"
- ADK (:8000) → Gemini Cloud: "LLM Inference"

=== CORNER ANNOTATIONS ===
Top-left: "Phase 4 Architecture"
Top-right: "3 processes total (dev mode)"
Bottom-left: "Hot reload enabled"
Bottom-right: "No microservices complexity"

=== KEY REFERENCE TABLE ===
Small table at bottom:

| Service | Port | Process | Health Check |
|---------|------|---------|--------------|
| Frontend | 3000 | Node/Vite | GET / |
| ADK Runtime | 8000 | Python | GET /health |
| MCP Fixtures | 8080 | Python | GET /status |

Style: Clean reference card aesthetic, high contrast port numbers, terminal styling for commands. 16:9 aspect ratio.
```

---

## 1.5 AgentBriefingEvent Schema

**File:** `agent-briefing-event.png`

**Purpose:** Shows the data contract between backend and frontend - the AgentBriefingEvent JSON schema and how it maps to UI components.

**Question It Answers:** "What's the data contract between backend and frontend?"

### Generation Prompt

```
Create a technical schema diagram titled "AgentBriefingEvent: The UI Contract" on a deep slate blue background (#0F172A).

LAYOUT: Left-to-right flow showing JSON structure transforming into UI elements.

=== LEFT ZONE: "Event Structure" ===
Large code block with JSON schema, syntax-highlighted:

```json
{
  "event_id": "uuid-1234",
  "correlation_id": "cedar-creek-001",
  "type": "INSIGHT",
  "source_agent": "burn_analyst",
  "skill_id": "burn-severity-analysis",
  
  "content": {
    "summary": "Sector SW-4 shows critical burn",
    "detail": "42% high-severity across 18,340 acres..."
  },
  
  "proof_layer": {
    "confidence": 0.94,
    "reasoning_chain": [
      "Retrieved MTBS data",
      "Calculated dNBR statistics",
      "Applied USFS thresholds"
    ],
    "citations": [
      { "source": "MTBS", "ref": "2022-09-15" },
      { "source": "Sentinel-2", "ref": "T10TEM" }
    ]
  },
  
  "ui_binding": {
    "target": "panel_inject",
    "severity": "critical",
    "map_highlight": "sector-sw-4"
  }
}
```

Color-code different sections:
- Identifiers (event_id, correlation_id): cyan
- Content fields: white
- Proof layer: emerald green
- UI binding: amber

=== CENTER ZONE: "Routing Matrix" ===
Decision tree showing how `ui_binding.target` maps to UI behavior:

```
ui_binding.target
├── "modal_interrupt" → 🚨 Full-screen modal (CRITICAL)
├── "rail_pulse" → 💡 Sidebar notification
├── "panel_inject" → 📋 Briefing card added
└── "map_highlight" → 🗺️ Polygon highlighted
```

Show `severity` affecting visual styling:
```
severity
├── "critical" → Red (#EF4444) + Pulse animation
├── "high" → Amber (#F59E0B) + Glow
├── "moderate" → White (default)
└── "low" → Gray (#64748B)
```

=== RIGHT ZONE: "UI Manifestation" ===
Four small UI mockups showing each binding target:

1. MODAL INTERRUPT
   - Full overlay, dimmed background
   - Big alert icon
   - "ACKNOWLEDGE" button
   - Red border

2. RAIL PULSE
   - Sidebar segment
   - Pulsing glow effect (rings radiating)
   - Agent icon (🔥)

3. PANEL INJECT
   - Briefing card component
   - Header with agent badge
   - Summary text
   - "Expand Reasoning" link
   - Citation chips

4. MAP HIGHLIGHT
   - Polygon with colored fill
   - Severity-matched color
   - Popup on hover

=== BOTTOM ZONE: "Proof Layer Rendering" ===
Detailed breakdown of how proof_layer renders:

Confidence Meter:
- Horizontal bar, 0-100%
- Filled to 94%
- Color zones: Red (0-50), Amber (50-75), Green (75-100)

Reasoning Chain:
- Numbered steps in collapsible accordion
- Each step with checkmark icon

Citation Chips:
- Small pill-shaped badges
- Source icon + reference ID
- "Click to verify" on hover

=== CORNER ANNOTATIONS ===
Top-left: "PROTOCOL-AGENT-COMMUNICATION.md"
Top-right: "Deterministic routing, not AI deciding"
Bottom-left: "Zustand → React re-render"
Bottom-right: "CommonMark for detail field"

=== KEY INSIGHT CALLOUT ===
"🎯 THE CONTRACT:
Backend emits structured events.
Frontend renders deterministically.
No guessing where things appear."

Style: Schema visualization with clear data-to-UI mapping. 16:9 aspect ratio.
```

---

## 1.6 Skill Anatomy

**File:** `skill-anatomy.png`

**Purpose:** Shows the internal structure of a Skill folder - what files it contains and how they work together.

**Question It Answers:** "What's inside a skill folder? How do I create a new skill?"

### Generation Prompt

```
Create a technical reference diagram titled "Skill Anatomy: What's Inside a Skill?" on a deep slate blue background (#0F172A).

LAYOUT: Exploded folder view showing skill contents with annotations.

=== LEFT ZONE: "Skill Folder Structure" ===
Large folder icon labeled "burn-severity-analysis/"

Exploded tree view showing contents:

```
burn-severity-analysis/
├── skill.md              ← "The Brain"
├── scripts/
│   ├── calculate_dnbr.py
│   └── classify_severity.py
├── resources/
│   ├── thresholds.json
│   └── usfs-severity-classes.json
├── examples/
│   ├── input-sector.json
│   └── output-assessment.json
└── tests/
    └── test_skill.py
```

Each file/folder has a small icon:
- skill.md: Brain/document icon (emerald highlight)
- scripts/: Gear icon
- resources/: Database icon
- examples/: Lightbulb icon
- tests/: Checkmark icon

=== CENTER ZONE: "skill.md Deep Dive" ===
Large document representation showing the skill.md template:

```markdown
# Burn Severity Analysis

## Description
Analyzes post-fire burn severity using dNBR 
calculations and USFS classification standards.

## Triggers
- User asks about burn severity
- Coordinator needs impact assessment
- Cross-reference with trail damage

## Instructions
1. Retrieve satellite imagery dates
2. Calculate dNBR for each sector
3. Apply USFS severity thresholds
4. Generate confidence score
5. Cite data sources

## Inputs
| Input | Type | Required |
|-------|------|----------|
| sector_id | string | Yes |
| imagery_date | date | No |

## Outputs
| Output | Type |
|--------|------|
| severity_class | LOW/MOD/HIGH |
| confidence | float (0-1) |
| reasoning_chain | string[] |

## Resources
- thresholds.json
- usfs-severity-classes.json

## Scripts
- calculate_dnbr.py
- classify_severity.py
```

Highlight sections with color coding:
- Triggers: Cyan (when to activate)
- Instructions: White (how to execute)
- Inputs/Outputs: Emerald (the interface)
- Resources/Scripts: Amber (the tools)

=== RIGHT ZONE: "How It All Connects" ===
Flow diagram showing runtime behavior:

1. "Coordinator receives query"
   ↓
2. "Scans skill.md Triggers"
   ↓
3. "Matches: 'burn severity'"
   ↓
4. "Loads Instructions into context"
   ↓
5. "Executes scripts/ as tools"
   ↓
6. "References resources/ for logic"
   ↓
7. "Validates output against schema"
   ↓
8. "Emits AgentBriefingEvent"

=== BOTTOM ZONE: "Skill Best Practices" ===
Three columns of tips:

COLUMN 1 - "Do":
✓ Keep skill.md under 2000 tokens
✓ Use concrete examples in examples/
✓ Write unit tests for scripts
✓ Document all inputs/outputs

COLUMN 2 - "Don't":
✗ Hardcode fire-specific data
✗ Skip the Triggers section
✗ Mix multiple domains in one skill
✗ Forget citations in outputs

COLUMN 3 - "Remember":
→ Skills are portable across agents
→ ADK loads skill.md at runtime
→ Scripts become callable tools
→ resources/ is for reference data

=== CORNER ANNOTATIONS ===
Top-left: "ADR-005: Skills-First Architecture"
Top-right: "skills/ folder in monorepo"
Bottom-left: "Progressive disclosure: metadata first"
Bottom-right: "Testable in isolation"

=== KEY INSIGHT CALLOUT ===
"🎯 THE SKILL PRINCIPLE:
skill.md is the brain (instructions).
scripts/ are the hands (actions).
resources/ are the memory (knowledge).
Together: Portable Expertise Package."

Style: Exploded view with clear component separation, documentation aesthetic. 16:9 aspect ratio.
```

---

## 1.7 Proof Layer Rendering

**File:** `proof-layer-rendering.png`

**Purpose:** Shows how the Proof Layer (citations, reasoning chains, confidence scores) renders in the UI. The "anti-hallucination" visual contract.

**Question It Answers:** "How do citations and reasoning chains render in the UI?"

### Generation Prompt

```
Create a detailed UI component diagram titled "Proof Layer: Rendering Trust" on a deep slate blue background (#0F172A).

LAYOUT: Three-column breakdown showing each Proof Layer component.

=== HEADER SECTION ===
Title with subtitle: "Proof Layer: Rendering Trust"
"Every AI insight must be verifiable. Here's how."

=== COLUMN 1: "Confidence Score" ===
Large confidence meter component:

Visual: Horizontal gauge with gradient fill
- Left end: "0%" (red zone)
- Middle: "50%" (amber zone)  
- Right end: "100%" (emerald zone)
- Current fill: 87% (in green zone)
- Pointer/needle at 87%

Below the gauge, breakdown:
```
Score Derivation:
├── Source Data Quality: 0.92
├── Model Certainty:     0.84
├── Cross-Validation:    0.85
└── Weighted Average:    0.87
```

UI States (three small meter examples):
- "HIGH (90-100%)" - Solid green, no animation
- "MODERATE (60-89%)" - Amber, subtle pulse
- "LOW (<60%)" - Red, strong pulse, warning icon

Annotation: "Not 'high/medium/low' — actual probability"

=== COLUMN 2: "Citation Chain" ===
Citation chips component mockup:

Three citation chips stacked:

Chip 1: [MTBS] "2022-09-15"
- Icon: Satellite
- Hover state: Preview thumbnail
- Click action: "Opens MTBS data page"

Chip 2: [FSM] "2353.03"
- Icon: Document
- Hover state: Regulation snippet
- Click action: "Opens FSM PDF"

Chip 3: [TRACS] "#4521"
- Icon: Database
- Hover state: Record preview
- Click action: "Opens TRACS system"

Below chips, the rendering rules:
```
Citation Styling:
├── Federal Data (MTBS, NIFC) → Blue chip
├── Regulations (FSM, FSH)    → Purple chip
├── Legacy Systems (TRACS)    → Gray chip
└── Calculated               → Emerald chip
```

Annotation: "Every claim traceable to source"

=== COLUMN 3: "Reasoning Chain" ===
Collapsible accordion component:

Header: "Show Reasoning ▼"

Expanded state showing steps:
```
┌─────────────────────────────────────┐
│ Step 1: Retrieved MTBS perimeter    │
│   └── Source: MTBS API              │
├─────────────────────────────────────┤
│ Step 2: Calculated dNBR statistics  │
│   └── Method: Zonal analysis        │
├─────────────────────────────────────┤
│ Step 3: Applied USFS thresholds     │
│   └── Reference: FSM 2353.03        │
├─────────────────────────────────────┤
│ Step 4: Cross-validated with RAVG   │
│   └── Agreement: 94%                │
└─────────────────────────────────────┘
```

Visual style:
- Numbered circles (1, 2, 3, 4) connected by vertical line
- Each step has sub-detail in lighter gray
- Completed steps have green checkmarks

Annotation: "Step-by-step logic, not magic"

=== BOTTOM ZONE: "Complete Briefing Card Example" ===
Full briefing card mockup showing all three components integrated:

```
┌────────────────────────────────────────────────┐
│ 🔥 Burn Analyst                    [CRITICAL]  │
│ Skill: burn-severity-analysis                  │
├────────────────────────────────────────────────┤
│ Sector SW-4 shows 42% high-severity burn       │
│ across 18,340 acres. Erosion risk elevated.    │
├────────────────────────────────────────────────┤
│ Confidence: [████████░░] 87%                   │
├────────────────────────────────────────────────┤
│ Sources: [MTBS] [Sentinel-2] [FSM 2353.03]     │
├────────────────────────────────────────────────┤
│ ▶ Show Reasoning Chain (4 steps)               │
└────────────────────────────────────────────────┘
```

=== CORNER ANNOTATIONS ===
Top-left: "PROOF-LAYER-DESIGN.md"
Top-right: "Government-grade accountability"
Bottom-left: "ISO 8601 timestamps always"
Bottom-right: "Immutable audit trail"

=== KEY INSIGHT CALLOUT ===
"🎯 THE TRUST PRINCIPLE:
Confidence tells you HOW SURE.
Citations tell you WHERE FROM.
Reasoning tells you HOW WE GOT THERE.
Together: Defensible AI."

Style: Clean UI component documentation, high-fidelity mockups. 16:9 aspect ratio.
```

---

# TRACK 2: STAKEHOLDER DIAGRAMS

These diagrams live in `docs/diagrams/stakeholder/` and serve as communication tools for external audiences.

---

## 2.1 Cedar Creek Context

**File:** `cedar-creek-context.png`

**Purpose:** Establishes the scale, timeline, and complexity of the Cedar Creek Fire - the real-world scenario demonstrating why RANGER matters.

**Question It Answers:** "Why does this problem matter?"

### Generation Prompt

```
Create a tactical briefing infographic titled "CEDAR CREEK FIRE • WILLAMETTE NATIONAL FOREST • 2022" on a deep slate blue background (#0F172A). This is dramatic and impactful, like a military operations briefing.

LAYOUT: Aerial perspective with data overlays.

=== CENTRAL COMPOSITION ===
Bird's-eye view of Oregon's Cascade Range wildfire scene:
- Waldo Lake as a distinctive pristine blue oval (geographic anchor)
- Mosaic burn severity patterns spreading westward toward Oakridge
  - Green patches: Unburned/low severity
  - Amber patches: Moderate severity
  - Red patches: High severity
- Topographic contour lines visible on terrain
- Dramatic pyrocumulonimbus cloud tower rising from burn zone
- Faint smoke haze adding atmosphere

=== TOP SECTION ===
Header: "CEDAR CREEK FIRE • WILLAMETTE NATIONAL FOREST • 2022"
Style: Bold military stencil typography

Key stats (top left): 
"127,311 ACRES • $58M • 2,000+ EVACUATED"
Style: Large, high-contrast numbers

Oregon locator map (top right corner):
- State silhouette
- Portland and Eugene marked
- Fire location glowing amber in Cascade Range

=== TIMELINE STRIP (bottom center) ===
Horizontal timeline with key dates:

"AUG 1: ¼ acre" → "SEPT 8: EAST WINDS" → "SEPT 11: 86,000 acres" → "NOV 22: CONTAINED"

Highlight the "4 DAYS" explosive growth period between Sept 8-11.

=== ASSESSMENT DOMAIN ICONS (above timeline) ===
Four icons representing RANGER's domains:
🔥 BURN SEVERITY | 🥾 TRAIL DAMAGE | 🌲 TIMBER | 📋 NEPA

These should be styled as tactical assessment badges.

=== TACTICAL ANNOTATIONS ===
Near Oakridge: "Level 3 Evacuation - Sept 9"
Near fire origin: "Rappellers refused - terrain too hazardous"
Near Waldo Lake: "8 IMT rotations"

=== CORNER BADGES ===
Bottom-left: USDA Forest Service shield
Bottom-right: "RANGER AGENTIC OS" badge with emerald accent

=== FOOTER INSIGHT ===
"This fire was so complex that recovery requires coordinating 4 specialist assessments across 127,000 acres of mosaic burn. That's why you need RANGER."

Style: Dramatic tactical briefing aesthetic, burnt orange and amber fire tones, cool blue lake contrast, cream annotations. Emergency operations center mood. Illustrated tactical map, not photorealistic. 16:9 aspect ratio.
```

---

## 2.2 The RANGER Value Loop

**File:** `ranger-value-loop.png`

**Purpose:** The "hero" diagram showing what RANGER does in 30 seconds. The core value proposition visualized.

**Question It Answers:** "What does RANGER do?"

### Generation Prompt

```
Create an elegant value proposition diagram titled "RANGER: The Value Loop" on a deep slate blue background (#0F172A). This is the "hero" diagram for executive presentations.

LAYOUT: Circular flow with central focal point.

=== CENTER: The Core Value ===
Large circle in the center with the RANGER logo/name.
Tagline below: "Recovery at the speed of insight."

Inside the circle, show:
- Brain icon (representing AI coordination)
- "Multi-Agent Orchestration"

=== CIRCULAR FLOW (clockwise from top) ===
Four major nodes connected by flowing arrows:

NODE 1 (Top): "USER QUESTION"
Icon: Chat bubble
Example: "What's the recovery status for Cedar Creek?"
Visual: Simple, clean question input

Arrow → flows to:

NODE 2 (Right): "COORDINATED ANALYSIS"
Icon: Network/hub with 4 spokes
Show four mini-agent icons: 🔥 🥾 🌲 📋
Label: "Specialists work in parallel"
Visual: Activity indicators on each agent

Arrow → flows to:

NODE 3 (Bottom): "UNIFIED BRIEFING"
Icon: Document with checkmarks
Show briefing card mockup:
- Summary text
- Confidence score
- Citation chips
Label: "Synthesized, cited, transparent"

Arrow → flows to:

NODE 4 (Left): "INFORMED DECISION"
Icon: Person with checkmark
Label: "Human decides with full context"
Visual: Decision point indicator

Arrow → completes the loop back to NODE 1

=== TIME INDICATORS ===
Between each node, show elapsed time:
- "0s: Question asked"
- "~2s: Analysis complete"
- "~3s: Briefing delivered"
- "Human takes action when ready"

Compare to traditional workflow:
"Traditional: 2+ hours across 14 systems"
"RANGER: 3 seconds with full transparency"

=== THE FOUR SPECIALIST BADGES (around the circle) ===
Small badges positioned around the main loop:

🔥 "Burn Analyst"
   "Severity • Erosion Risk • Recovery Timeline"

🥾 "Trail Assessor"
   "Damage • Closures • Repair Costs"

🌲 "Cruising Assistant"
   "Salvage Value • Access Routes • Timber Economics"

📋 "NEPA Advisor"
   "Compliance • Pathways • Documentation"

=== BOTTOM: Key Differentiators ===
Three boxes highlighting unique value:

Box 1: "Coordinated, Not Siloed"
"Four specialists, one unified answer"

Box 2: "Transparent, Not Black Box"
"Every insight cites sources"

Box 3: "Augments, Not Replaces"
"AI recommends, humans decide"

=== CORNER ANNOTATIONS ===
Top-left: "Agentic Operating System"
Top-right: "Skills-First Architecture"
Bottom-right: "FedRAMP compliant"

=== KEY TAGLINE (footer) ===
"RANGER compresses weeks of disconnected analysis into seconds of unified intelligence."

Style: Clean, professional, executive-ready. Flowing circular motion implies continuous value. Emerald accents on key elements. 16:9 aspect ratio.
```

---

## 2.3 Recovery Chain (Personas)

**File:** `recovery-chain-personas.png`

**Purpose:** Shows how four real USFS personas trigger each other through RANGER, demonstrating the human value of cross-agent coordination.

**Question It Answers:** "How does this help real USFS staff work together?"

### Generation Prompt

```
Create a persona-centered workflow diagram titled "The Cedar Creek Recovery Chain: Four Personas, One Mission" on a deep slate blue background (#0F172A).

LAYOUT: Circular relay flow with four persona stations.

=== CIRCULAR FLOW (clockwise from top-left) ===

PERSONA 1 (Top-Left): "Sarah Chen"
Badge: "Fire Management Officer (FMO)"
Color tint: Orange (matches Burn Analyst)
Human icon: Professional woman silhouette

Thought bubble: "Where are the high-severity burn zones?"
Below: Small burn severity map mockup
Output arrow →: "Sector 4 flagged for erosion risk"
Arrow label: "Triggers trail priority"

---

PERSONA 2 (Top-Right): "Marcus Rodriguez"
Badge: "Recreation Technician"
Color tint: Blue (matches Trail Assessor)
Human icon: Man with ranger hat silhouette

Receives insight from Sarah (highlighted connection)
Thought bubble: "Which trails need closure?"
Below: Small trail damage list mockup
Output arrow →: "Bridge washout on PCT Mile 47"
Arrow label: "Informs timber access routes"

---

PERSONA 3 (Bottom-Right): "Elena Vasquez"
Badge: "Timber Cruiser"
Color tint: Green (matches Cruising Assistant)
Human icon: Woman with hardhat silhouette

Receives insight from Marcus (highlighted connection)
Thought bubble: "What's the salvage potential?"
Below: Small timber plot data mockup
Output arrow →: "Unit 12 near historic trail"
Arrow label: "Triggers compliance check"

---

PERSONA 4 (Bottom-Left): "Dr. James Park"
Badge: "Environmental Coordinator (NEPA)"
Color tint: Purple (matches NEPA Advisor)
Human icon: Man with glasses silhouette

Receives insight from Elena (highlighted connection)
Thought bubble: "Are we compliant?"
Below: Small EA checklist mockup
Output arrow →: "Section 106 buffer required"
Arrow label: "Refines recovery scope"
Arrow completes circle back to Sarah

=== CENTER: Correlation Thread ===
Dashed circular line connecting all four personas through center.
Label: "correlation_id: cedar-creek-recovery-001"
Subtitle: "Shared context across all interactions"

Small icon in center: Chain link symbol

=== BOTTOM: Before/After Contrast ===
Two side-by-side boxes:

LEFT BOX (crossed out, red tint):
"BEFORE RANGER"
- 4 silos
- 4 separate workflows  
- Information lost in email
- Weeks of coordination

RIGHT BOX (highlighted, emerald tint):
"WITH RANGER"
- 1 coordinated recovery
- Automatic handoffs
- Nothing falls through cracks
- Hours, not weeks

=== CORNER ANNOTATIONS ===
Top-left: "Real USFS job titles"
Top-right: "Circular = Recovery is iterative"
Bottom-left: "Each insight triggers the next"
Bottom-right: "Human faces, real workflows"

=== KEY INSIGHT CALLOUT ===
"Recovery isn't linear. Sarah's burn assessment affects Marcus's trail priorities, which affects Elena's timber access, which affects James's compliance scope. RANGER keeps everyone connected."

Style: Human-centered, warm professional aesthetic, emphasizing people over technology. Agent colors subtly tie personas to their specialist agents. 16:9 aspect ratio.
```

---

## 2.4 Legacy Bridge

**File:** `legacy-bridge.png`

**Purpose:** Shows how modern AI insights transform into legacy-compatible formats (TRACS CSV, FSVeg XML) that existing USFS systems can import.

**Question It Answers:** "Do we have to replace our existing systems?"

**Note:** This diagram already exists and matches the attached example. The prompt below captures the proven style.

### Generation Prompt

```
Create a technical integration diagram titled "The Legacy Bridge: From AI Insight to 1999-Era Systems" on a deep slate blue background (#0F172A).

LAYOUT: Three-zone left-to-right flow with a literal bridge connecting modern and legacy.

=== LEFT ZONE: "Modern RANGER" (sleek styling) ===
Glowing panel showing AI briefing card:

Agent icon: 🥾 Trail Assessor Agent
Insight text: 
"Bridge at Mile 47: Structural failure detected.
Estimated repair: $45,000.
Priority: Critical."

Below, JSON snippet with syntax highlighting:
```json
{
  "damage_type": "structural_failure",
  "location": { "mile_marker": 47, "trail": "PCT" },
  "repair_estimate_usd": 45000,
  "priority": "critical"
}
```

Label: "Rich, structured, AI-generated"
Visual: Sleek, modern, glowing cyan borders

=== CENTER: "The Bridge" (literal bridge graphic) ===
Architectural steel bridge connecting left and right zones.
Bridge labeled: "Schema Transformer"

On the bridge deck, three transformation steps:
1. "Validate against TRACS schema"
2. "Map fields to legacy codes"
3. "Generate compliant output"

Small gears/cogs indicating automated processing.
Caption below bridge: "Zero data loss. Full compliance."

=== RIGHT ZONE: "Legacy Systems" (retro styling) ===
Two chunky, old-school computer terminals:

TERMINAL 1: "TRACS (Trail Assessment)"
- Retro CRT monitor aesthetic
- Year: "(1999)"
- CSV file icon with sample data:
```
TRAIL_ID,MILE,DAMAGE_CODE,EST_COST,PRIORITY
PCT-OR-001,47,STR-FAIL,45000,1
```
- Green checkmark: "Import validated"

TERMINAL 2: "FSVeg (Timber Data)"
- Retro terminal aesthetic
- XML file icon with sample tags:
```xml
<Plot ID="12">
  <Species>PSME</Species>
  <DBH>24.5</DBH>
  <Mortality>HIGH</Mortality>
</Plot>
```
- Green checkmark: "Schema validated"

=== BOTTOM: "Why This Matters" ===
Three benefit boxes:

Box 1: "No Rip and Replace"
Icon: Dollar sign with down arrow
"USFS keeps existing systems. RANGER augments, doesn't replace."

Box 2: "Audit Compliance"
Icon: Clipboard with checkmark
"Exports meet federal data standards. Auditors see familiar formats."

Box 3: "Training Continuity"
Icon: Person with graduation cap
"Staff use same legacy interfaces. AI benefits without retraining."

=== FOOTER TAGLINE ===
"The fastest path to adoption isn't replacing legacy systems—it's making them smarter."

Style: Strong visual contrast between sleek modern (left) and chunky retro (right). The bridge metaphor should be immediately clear. 16:9 aspect ratio.
```

---

## 2.5 Confidence Ledger (Trust Architecture)

**File:** `confidence-ledger.png`

**Purpose:** Deep-dive into how RANGER builds trust through the "Three Pillars of Proof" - confidence scores, citation chains, and reasoning transparency.

**Question It Answers:** "Can we trust AI recommendations?"

### Generation Prompt

```
Create a trust architecture diagram titled "The Confidence Ledger: How RANGER Builds Trust" on a deep slate blue background (#0F172A).

LAYOUT: Top contrast section, middle three-pillar section, bottom audit trail.

=== TOP SECTION: "The Trust Problem" ===
Two contrasting boxes side by side:

LEFT BOX (crossed out with red X):
Label: "Black Box AI"
Generic chatbot icon
Output: "The bridge is damaged"
- No source
- No confidence  
- No reasoning
Caption: "Trust me, bro"
Visual: Faded, untrustworthy appearance

RIGHT BOX (green checkmark):
Label: "RANGER Briefing"
Trail Assessor icon (🥾)
Output: "Bridge at Mile 47 shows structural failure"
- Three proof elements visible below
Caption: "Here's my evidence"
Visual: Bright, trustworthy appearance

=== MIDDLE SECTION: "The Three Pillars of Proof" ===
Three equal columns:

COLUMN 1: "Confidence Score"
Large circular gauge visualization:
- 0-100% scale
- Color zones: Red (0-50), Amber (50-75), Green (75-100)
- Needle pointing to 87%
- Large "87%" display

Below gauge:
"Derived from:"
- Source data quality: 0.92
- Model certainty: 0.84
- Cross-validation: 0.85

Caption: "Not just 'high/medium/low' — actual probability"

COLUMN 2: "Citation Chain"
Stack of three citation chips:
- [TRACS] "Report #4521" → links to PDF
- [Video] "Frame 00:42" → links to image
- [FSM] "2353.03" → links to regulation

Arrow showing: "Click to verify"

Caption: "Every claim traceable to source"

COLUMN 3: "Reasoning Chain"
Numbered steps in vertical flow:
1. "Video frame shows visible crack in support beam"
2. "Crack pattern matches Class III structural failure (FSM Table 2353-1)"
3. "Weight capacity reduced below safe threshold"
4. "Recommend immediate closure"

Caption: "Step-by-step logic, not magic"

=== BOTTOM SECTION: "The Audit Trail" ===
Horizontal timeline showing complete lifecycle:

Event markers:
- "2024-03-15 09:42:17 UTC: Event emitted"
- "Source: Trail Assessor"
- "Confidence: 0.87"
- "2024-03-15 09:45:33 UTC: User acknowledged"
- "Action: Closure order generated"

Database icon: "Immutable Event Log"

Caption: "Every briefing is auditable. Every decision is traceable."

=== CORNER ANNOTATIONS ===
Top-left: "Government-grade accountability"
Top-right: "Anti-hallucination architecture"
Bottom-left: "FedRAMP audit requirements"
Bottom-right: "PROOF-LAYER-DESIGN.md"

=== FOOTER TAGLINE ===
"Government-grade AI requires government-grade accountability. RANGER's Confidence Ledger makes every insight defensible."

Style: Clean, authoritative, trust-building aesthetic. Three pillars should feel like architectural columns supporting the system. 16:9 aspect ratio.
```

---

## 2.6 Maria's 8-Minute Morning

**File:** `marias-morning.png`

**Purpose:** Before/After workflow comparison showing how RANGER transforms the morning briefing workflow for a Forest Supervisor.

**Question It Answers:** "What's the real operational impact?"

### Generation Prompt

```
Create a before/after workflow comparison titled "Maria's 8-Minute Reality: Before & After RANGER" on a deep slate blue background (#0F172A).

LAYOUT: Split screen with timeline comparison.

=== HEADER ===
"Regional Forester Maria has 8 minutes before her Washington briefing call."
"She needs to know: What's going sideways? Where's the risk? What do I tell DC?"

=== LEFT SIDE: "BEFORE RANGER" (red/gray tint) ===
Label: "The Old Way" with clock showing 6:00 AM

Timeline flowing downward:

6:00 AM - "Start assembling briefing"
Icon: Multiple system windows
Note: "14 separate data systems"

6:30 AM - "Check MTBS for burn data"
Icon: Loading spinner
Note: "System slow today"

6:45 AM - "Cross-reference with TRACS"
Icon: Spreadsheet
Note: "Manual data entry"

7:00 AM - "Review NIFC incident reports"
Icon: Document stack
Note: "50+ pages to scan"

7:30 AM - "Draft talking points"
Icon: Notepad
Note: "Incomplete picture"

7:55 AM - "Run to briefing"
Icon: Running figure
Note: "Hope nothing's wrong"

8:00 AM - "Washington call"
Icon: Phone (red)
Note: "Fingers crossed"

Bottom stats:
- Time spent: 2+ hours
- Systems accessed: 14
- Confidence: Low
- Blind spots: Unknown

Visual: Stressed, chaotic, red warning indicators

=== RIGHT SIDE: "WITH RANGER" (emerald tint) ===
Label: "The RANGER Way" with clock showing 6:30 AM

Timeline flowing downward:

6:30 AM - "Open Mission Control"
Icon: RANGER dashboard
Note: "Single interface"

6:32 AM - "Review overnight summary"
Icon: AI-generated briefing
Note: "Auto-generated overnight"
Show: "3 incidents changed status. Bootleg: new erosion risk..."

6:35 AM - "Drill into Bootleg Fire"
Icon: Detailed view
Note: "Full context with citations"

6:38 AM - "Ask: 'What should I tell Washington?'"
Icon: Chat interface
Note: "Natural language query"

6:40 AM - "Receive executive summary"
Icon: Briefing card
Note: "Talking points with proof"

6:42 AM - "Confident and prepared"
Icon: Checkmark
Note: "Full transparency"

6:45 AM - "Washington call"
Icon: Phone (green)
Note: "Nailed it"

Bottom stats:
- Time spent: 15 minutes
- Systems accessed: 1
- Confidence: High
- Blind spots: Surfaced automatically

Visual: Calm, organized, emerald success indicators

=== CENTER DIVIDER ===
Large transformation arrow pointing from left to right.
Label: "RANGER transforms"

Key metrics highlighted:
"2 hours → 15 minutes (8x faster)"
"14 systems → 1 interface"
"Guessing → Knowing"

=== BOTTOM: The Three Questions ===
Three boxes showing Maria's key needs:

Box 1: "What's going sideways?"
Before: "Manual scan of 50 reports"
After: "AI surfaces anomalies automatically"

Box 2: "Where's the risk?"
Before: "Hope I didn't miss anything"
After: "Ranked by triage score with reasoning"

Box 3: "What do I tell Washington?"
Before: "Cobbled-together talking points"
After: "Executive summary with citations"

=== FOOTER TAGLINE ===
"RANGER doesn't replace Maria's judgment. It gives her 8 minutes back and the confidence to use them well."

Style: Clear before/after contrast, timeline flowing downward, stress vs. calm emotional resonance. 16:9 aspect ratio.
```

---

# APPENDIX: Generation Instructions

## How to Use These Prompts with Nano Banana Pro

### In Google AI Studio:

1. Navigate to [Google AI Studio](https://aistudio.google.com/)
2. Select the Gemini 3 Pro Image model (Nano Banana Pro)
3. Paste the complete prompt
4. Set aspect ratio to 16:9 in settings
5. Generate and iterate

### Best Practices (from Nano Banana Pro guide):

1. **Edit, Don't Re-roll:** If an image is 80% correct, ask for specific changes rather than regenerating from scratch.
   - Example: "That's great, but make the port numbers larger and add more glow to the active connections."

2. **Use Natural Language:** These prompts are written as creative director briefs, not tag soups.

3. **Maintain Consistency:** When generating multiple diagrams in a session, reference previous outputs:
   - "Use the same slate blue background and chalk aesthetic as the previous diagram."

4. **Iterate on Details:** Start with structure, then refine:
   - First pass: Get layout and flow correct
   - Second pass: Refine typography and labels
   - Third pass: Add annotations and polish

### Quality Checklist

Before finalizing any diagram, verify:

- [ ] 16:9 aspect ratio
- [ ] Dark slate blue background (#0F172A)
- [ ] Consistent agent iconography (🔥 🥾 🌲 📋)
- [ ] RANGER color palette applied
- [ ] All text is legible at presentation size
- [ ] Key insight callout box present
- [ ] Corner annotations add context
- [ ] Flow direction is clear (left→right or top→bottom)

---

## File Naming Convention

```
docs/diagrams/
├── developer/
│   ├── adk-runtime-skills.png
│   ├── sse-streaming-flow.png
│   ├── mcp-data-layer.png
│   ├── developer-port-map.png
│   ├── agent-briefing-event.png
│   ├── skill-anatomy.png
│   └── proof-layer-rendering.png
└── stakeholder/
    ├── cedar-creek-context.png
    ├── ranger-value-loop.png
    ├── recovery-chain-personas.png
    ├── legacy-bridge.png
    ├── confidence-ledger.png
    └── marias-morning.png
```

---

**Document Owner:** RANGER Product Team  
**Last Updated:** December 26, 2025  
**Prompt Version:** 1.0

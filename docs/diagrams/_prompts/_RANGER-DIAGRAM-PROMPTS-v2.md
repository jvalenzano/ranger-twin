# RANGER Diagram Generation Prompts (v2.0)

> **Tool:** Nano Banana Pro (Gemini 3 Pro Image)  
> **Platform:** Google AI Studio  
> **Aspect Ratio:** 16:9 (all diagrams)  
> **Style System:** Tactical Whiteboard (dark slate, chalk aesthetic)
> 
> **Version:** 2.0 (December 28, 2025)  
> **Aligned With:** ADR-007.1 Three-Layer Tool Invocation Strategy

---

## What Changed in v2.0

This version incorporates the **ADR-007.1 Three-Layer Enforcement Pattern** throughout the diagram library. Key updates:

| Change | Rationale |
|--------|-----------|
| Added **Three-Layer Enforcement** diagram (NEW) | Core architectural concept for federal compliance |
| Updated **ADK Runtime** to show validation layer | Accuracy with current implementation |
| Updated **SSE Streaming Flow** to show retry logic | Reflects actual event lifecycle |
| Enhanced **Confidence Ledger** with compliance language | Stakeholder trust building |
| Added **Federal Defensibility** annotations throughout | FedRAMP audit readiness |

---

## Style Guide: The RANGER Visual Language

Before generating any diagram, internalize this consistent visual language:

### Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Background (Base) | Deep Slate Blue | #0F172A |
| Primary Lines/Text | Chalk White | #F8FAFC |
| Accent - Success/Validated | RANGER Emerald | #10B981 |
| Accent - Warning/Retry | Amber | #F59E0B |
| Accent - Critical/Escalation | Alert Red | #EF4444 |
| Accent - Highlight/Active | Cyan | #06B6D4 |
| Muted/Archived | Slate Gray | #64748B |
| **NEW: Compliance/Federal** | Royal Purple | #7C3AED |

### Agent Iconography (Consistent Across All Diagrams)
| Agent | Icon | Color Tint |
|-------|------|------------|
| Recovery Coordinator | Brain / Conductor | White |
| Burn Analyst | 🔥 Flame | Orange-red |
| Trail Assessor | 🥾 Hiking Boot | Blue |
| Cruising Assistant | 🌲 Conifer Tree | Green |
| NEPA Advisor | 📋 Document/Clipboard | Purple |
| **NEW: Validation Layer** | 🛡️ Shield / Checkpoint | Emerald |

### Typography
- **Headers:** Bold, architectural lettering (chalk-drawn feel)
- **Labels:** Clean sans-serif, handwritten style
- **Code/Data:** Monospace (JetBrains Mono style)
- **Annotations:** Informal chalk notes in corners
- **NEW: Compliance Badges:** Bold, official-looking stamps

### Visual Principles
1. **Flow Direction:** Left-to-right or top-to-bottom for narrative clarity
2. **Depth:** Use subtle glow/shadow to create visual hierarchy
3. **Contrast:** High contrast between elements for readability
4. **Annotations:** Include informal "chalk notes" that answer common questions
5. **NEW: Federal Badges:** Include FedRAMP, audit, and compliance indicators where relevant

---

# TRACK 1: DEVELOPER DIAGRAMS

These diagrams live in `docs/diagrams/developer/` and serve as technical reference for the engineering team.

---

## 1.0 Three-Layer Enforcement Architecture (NEW - P0) ✅

**File:** `three-layer-enforcement.png`

**Purpose:** The definitive visual for ADR-007.1. Shows how RANGER achieves 99% tool invocation reliability through defense-in-depth, not single-point API enforcement.

**Question It Answers:** "How does RANGER guarantee tools are called? How is this auditable?"

**Federal Compliance Focus:** This diagram is specifically designed to satisfy auditor questions about AI reliability and determinism.

### Generation Prompt

```
Create a highly detailed technical architecture diagram titled "Three-Layer Enforcement: Defense-in-Depth for Federal AI" on a deep textured slate blue background (#0F172A).

LAYOUT: Three horizontal tiers stacked vertically, with a query flowing down through all three layers. Include federal compliance badges prominently.

=== HEADER SECTION ===
Title: "THREE-LAYER TOOL INVOCATION ENFORCEMENT"
Subtitle: "ADR-007.1 • 99% Reliability • Full Audit Trail"

Top-right corner: FedRAMP compliance badge (shield icon with checkmark)
Top-left corner: "Defense-in-Depth Architecture"

=== INCOMING QUERY (Top) ===
Arrow entering from top labeled: "User Query"
Example text in chat bubble: "What's the burn severity in Sector 4?"
Style: Glowing cyan border

=== TIER 1: API CONFIGURATION (First layer) ===
Large rounded rectangle with emerald border.
Header: "TIER 1: API Configuration"
Badge: "Technical Foundation"

Inside the rectangle:
- Code snippet: `mode="AUTO"` (highlighted in green)
- Crossed out: `mode="ANY"` with note "Causes infinite loops"
- Label: "Enables tool calls + text synthesis"
- Small icon: Gear/settings

Right side annotation:
"Why not mode='ANY'?"
"→ Infinite loop (confirmed)"
"→ Can't synthesize final response"
"→ Google Issue #784"

Reliability indicator: "Enables: ✓" (not a percentage - this is the foundation)

Arrow flowing DOWN to Tier 2

=== TIER 2: INSTRUCTION ENFORCEMENT (Second layer) ===
Large rounded rectangle with amber border.
Header: "TIER 2: ReAct Instruction Pattern"
Badge: "Guided Reasoning"

Inside the rectangle, show the ReAct flow:
```
THINK → CALL → REASON → RESPOND
```

Four connected boxes:
1. "THINK" - "Identify required data" (brain icon)
2. "CALL" - "Execute tool" (gear icon, emphasized)
3. "REASON" - "Interpret results" (lightbulb icon)
4. "RESPOND" - "Ground in data" (document icon)

Below, show decision tree snippet:
```
Query contains "burn" or "severity"?
  → MUST call: assess_severity()
Query contains "trail" or "damage"?
  → MUST call: classify_damage()
```

Right side annotation:
"Instructions guide, not enforce"
"~90% first-pass success rate"
"Model can still ignore (rare)"

Reliability indicator: "~90% first-pass"

Arrow flowing DOWN to Tier 3 (two paths: "Tool Called ✓" goes to success, "Tool Skipped ⚠" goes to validation)

=== TIER 3: VALIDATION LAYER (Third layer) ===
Large rounded rectangle with purple/violet border (compliance color).
Header: "TIER 3: ToolInvocationValidator"
Badge: "Federal Compliance Layer" with shield icon

Inside the rectangle, show the validation flow:

```
┌─────────────────────────────────────────────────────┐
│  POST-RESPONSE VALIDATION                           │
├─────────────────────────────────────────────────────┤
│  1. Check: tools_invoked_this_turn[]                │
│  2. If empty → RETRY with enforcement prompt        │
│  3. If retry fails → ESCALATE to human review       │
│  4. Log: timestamp, params, outcome, audit_id       │
└─────────────────────────────────────────────────────┘
```

Show three outcome paths:
PATH A (most common, green): "First Pass Success" → "Log & Continue" → Output
PATH B (amber): "Retry Required" → "Enforcement Prompt" → "Retry Success" → Output
PATH C (red, rare): "Max Retries Exceeded" → "Human Escalation" → "Manual Review"

Right side annotation:
"Every invocation logged"
"Timestamps + parameters"
"Immutable audit trail"
"Federal IG defensible"

Reliability indicator: "Combined: ~99%"

=== OUTPUT (Bottom) ===
Arrow exiting to final output.
Show AgentBriefingEvent with:
- Insight content
- proof_layer.confidence
- proof_layer.citations
- validation_outcome: "PASSED" | "RETRY_SUCCEEDED" | "ESCALATED"

=== AUDIT TRAIL SIDEBAR (Right side, full height) ===
Vertical strip showing the complete audit record:

```json
{
  "query_id": "uuid-1234",
  "timestamp": "2025-12-28T10:30:00Z",
  "agent": "burn_analyst",
  "tier_1": "mode=AUTO",
  "tier_2": "ReAct pattern applied",
  "tier_3": {
    "first_pass": true,
    "tools_invoked": ["assess_severity"],
    "retries": 0,
    "outcome": "PASSED"
  },
  "audit_hash": "sha256:abc123..."
}
```

Label: "Immutable Audit Log"
Icon: Database with lock

=== BOTTOM SECTION: Federal Compliance Summary ===
Three boxes side-by-side:

BOX 1: "Why Three Layers?"
- "No single point of failure"
- "If Tier 2 fails, Tier 3 catches"
- "Security best practice"
Icon: Shield with three layers

BOX 2: "Auditor Question"
Q: "How do you ensure AI uses real data?"
A: "Three independent mechanisms verify tool invocation. All logged with timestamps."
Icon: Clipboard with checkmark

BOX 3: "Reliability Math"
- "Tier 2: ~90% first-pass"
- "Tier 3: Catches remaining ~10%"
- "Combined: ~99% tool invocation"
- "Escalation: <1%"
Icon: Calculator/chart

=== CORNER ANNOTATIONS ===
Top-left: "ADR-007.1: Three-Layer Strategy"
Top-right: "FedRAMP High Compatible"
Bottom-left: "Supersedes mode='ANY' approach"
Bottom-right: "Defense-in-Depth, not Single-Point"

=== KEY INSIGHT CALLOUT BOX ===
Bottom center, chalk-outlined box with purple (compliance) border:

"🛡️ THE FEDERAL DEFENSIBILITY PRINCIPLE:
API enforcement alone is insufficient.
Instruction guidance alone is unreliable.
Validation with audit trail is defensible.
TOGETHER: Government-grade AI reliability."

Style: Military/federal compliance aesthetic. Clean layers with clear flow. Audit trail prominently displayed. FedRAMP badges visible. 16:9 aspect ratio.
```

---

## 1.1 ADK Runtime & Skill Loading (Updated) ✅

**File:** `adk-runtime-skills.png`

**Purpose:** Shows how the Recovery Coordinator loads and invokes Skills from the Skills Library, **now including the validation layer**.

**Question It Answers:** "How does the Coordinator load and invoke Skills? Where does validation happen?"

**Changes from v1:** Added Tier 3 Validation wrapper around agent invocation.

### Generation Prompt

```
Create a highly detailed technical whiteboard diagram titled "ADK Runtime: Skills-First with Validation Layer" on a deep textured slate blue background (#0F172A).

LAYOUT: Central hub-and-spoke architecture with three zones, plus a NEW validation wrapper.

=== TOP ZONE: "User Intent" ===
A chat input field labeled "Command Console (React)" showing example text: "What's the recovery status?"
Arrow pointing DOWN labeled "SSE Connection" with a small lightning bolt icon.
Style: Glowing cyan border (#06B6D4) to indicate active connection.

=== CENTER ZONE: "The Brain" (largest element) ===
A large hexagonal shape representing the ADK Runtime.

**NEW: Wrap the hexagon in a dashed purple border labeled "ToolInvocationValidator"**
Small shield icon on the wrapper border.
Annotation near wrapper: "Tier 3: Post-response verification"

Inside the hexagon, show three nested layers:
- Outer ring: "Google ADK Framework"
- Middle ring: "mode='AUTO' + ReAct Instructions" (NEW: explicit reference to Tiers 1 & 2)
- Inner core: "Gemini 2.0 Flash" with a sparkle icon

Label the hexagon: "Recovery Coordinator Agent"
Subtitle: "The Stateful Orchestrator"

Below the hexagon, show the runtime capabilities as small icon badges:
- "Context Window" (document icon)
- "Tool Execution" (gear icon)
- "Reasoning Chains" (chain link icon)
- **NEW:** "Validation Layer" (shield icon, emerald)

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

**NEW:** Add small checkpoint icon on arrows: "Logged to Audit Trail"

=== BOTTOM ZONE: "Output Stream" ===
Arrow pointing DOWN from the hexagon.

**NEW:** Show validation checkpoint before output:
Small box: "Validation Check"
- Path A (green): "Tools Invoked ✓" → Output
- Path B (amber): "Retry" → Loop back to hexagon
- Path C (red): "Escalate" → Human Review icon

Show streaming events flowing to the UI:
- "AgentBriefingEvent" boxes flowing downward
- Each box has a small type indicator: "INSIGHT", "STATUS", "ALERT"
- **NEW:** Each box also shows: "validation_outcome: PASSED"

=== CORNER ANNOTATIONS (chalk-style) ===
Top-left: "Skills-First Architecture (ADR-005)"
Top-right: "Three-Layer Enforcement (ADR-007.1)"
Bottom-left: "Single Python process • No microservices"
Bottom-right: "FedRAMP compliant via Vertex AI"

=== KEY INSIGHT CALLOUT BOX ===
Bottom center, chalk-outlined box with emerald border:

"🎯 THE ARCHITECTURE PRINCIPLE:
Value lives in Skills, not Agents.
Skills are portable. Agents are configuration.
Validation ensures compliance."

Style: Da Vinci engineering sketch meets tactical operations center. Clean chalk lines on dark slate. Subtle glow effects on active connections. Purple validation wrapper is prominent but not overwhelming. 16:9 aspect ratio.
```

---

## 1.2 SSE Streaming Flow (Updated) ✅

**File:** `sse-streaming-flow.png`

**Purpose:** Shows how events flow from the ADK Runtime to the React frontend via Server-Sent Events, **including validation and retry logic**.

**Question It Answers:** "How do events stream from backend to frontend? What happens if validation fails?"

**Changes from v1:** Added validation checkpoint and retry path in sequence.

### Generation Prompt

```
Create a detailed technical sequence diagram titled "The Pulse: SSE Event Streaming with Validation" on a deep slate blue background (#0F172A).

LAYOUT: Vertical swimlane diagram with 5 columns (added Validator) and time flowing top-to-bottom.

=== SWIMLANE HEADERS (top row) ===
Column 1: "User (React)" - Browser icon - cyan tint
Column 2: "ADK Runtime (Python)" - Hexagon icon - white
Column 3: "Validator (Tier 3)" - Shield icon - purple tint (NEW)
Column 4: "Gemini API (Cloud)" - Brain/sparkle icon - amber
Column 5: "MCP Server (Data)" - Database icon - emerald

=== SEQUENCE STEPS (numbered, flowing down) ===

STEP ① 
User column: Chat bubble with "Analyze Sector 4"
Arrow RIGHT to ADK: "POST /chat (SSE connection opens)"
Label on arrow: "Connection stays open"

STEP ②
ADK column: Processing indicator
Arrow RIGHT to Gemini: "Prompt + Context + Tool Definitions"
Note: "mode='AUTO' (Tier 1)"

STEP ③
Gemini column: Thinking indicator (sparkle animation implied)
Arrow LEFT to ADK: "reasoning: 'Checking severity data...'"
Note: "Interim thinking"

STEP ④
ADK column: Event box
Arrow LEFT to User: "SSE: { type: 'THINKING', content: '...' }"
User column: Show UI element "Thinking spinner appears"

STEP ⑤
Gemini column: Tool call indicator
Arrow LEFT to ADK: "tool_call: get_burn_severity('sector-4')"
Note: "ReAct pattern worked (Tier 2)"

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

=== NEW: VALIDATION CHECKPOINT (after Step ⑨) ===

STEP ⑩ (NEW)
ADK column: Event formatted
Arrow RIGHT to Validator: "Response ready for validation"

STEP ⑪ (NEW - Branch point)
Validator column: Checkpoint with shield icon
Label: "tools_invoked_this_turn?"

BRANCH A (Green path - most common):
Validator: "✓ Tool called: assess_severity"
Arrow LEFT to ADK: "validation_outcome: PASSED"
Continue to Step ⑫

BRANCH B (Amber path - retry):
Validator: "⚠ No tools invoked"
Arrow LEFT to ADK: "RETRY with enforcement prompt"
Loop back arrow to Step ② with label: "Retry (max 2)"
Note: "Adds explicit tool instruction"

BRANCH C (Red path - escalation):
Validator: "✗ Max retries exceeded"
Arrow LEFT to ADK: "ESCALATE"
Arrow to separate box: "Human Review Queue"
Note: "<1% of queries"

=== STEP ⑫ (Final output) ===
ADK column: Event formatting
Arrow LEFT to User: "SSE: AgentBriefingEvent { type: 'INSIGHT', validation_outcome: 'PASSED', ... }"
User column: Show UI element "Briefing card renders"

=== TIMELINE ANNOTATIONS (right margin) ===
Show elapsed time markers:
- "0ms: Query sent"
- "200ms: Thinking begins"
- "800ms: Tool call (Tier 2 success)"
- "1200ms: Data returned"
- "1800ms: Response ready"
- "1850ms: Validation passed (Tier 3)"
- "~2s total round trip"

=== AUDIT LOG INDICATOR ===
Small database icon at bottom with note:
"Every step logged with timestamp"
"Immutable audit trail"

=== KEY INSIGHT CALLOUT (bottom) ===
Chalk-outlined box:
"SSE + Validation: Real-time streaming WITH compliance.
Tier 3 adds ~50ms latency on success.
Retry adds ~2-3s if needed.
Every path is logged for federal audit."

=== CORNER ANNOTATIONS ===
Top-left: "PROTOCOL-AGENT-COMMUNICATION.md"
Top-right: "ADR-007.1 Three-Layer Enforcement"
Bottom-left: "Zustand store → React re-render"
Bottom-right: "FedRAMP audit trail enabled"

Style: Clean engineering diagram, subtle glow on active paths, time flowing clearly downward. Validation checkpoint prominently displayed in purple. Branch paths clearly distinguished by color. 16:9 aspect ratio.
```

---

## 1.3 MCP Data Layer (Minor Update) ✅

**File:** `mcp-data-layer.png`

**Purpose:** Shows how the MCP (Model Context Protocol) abstracts data sources.

**Changes from v1:** Added audit logging annotation on tool calls.

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

**NEW:** Small annotation on each arrow: "📝 Logged"

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

**NEW:** Bottom of router box:
"Audit: All tool calls logged with timestamp, params, result"
Small shield icon

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
# Automatically logged by ToolInvocationValidator
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
Bottom-right: "ADR-007.1: All calls validated & logged"

=== KEY INSIGHT CALLOUT ===
Chalk-outlined box at bottom center:
"🎯 THE MCP PRINCIPLE:
Agent code is environment-agnostic.
Swap fixtures → APIs by changing config, not code.
Every call logged for federal compliance."

Style: Patch-bay/switchboard aesthetic, clear visual separation between active and future states. Audit logging emphasized. 16:9 aspect ratio.
```

---

## 1.4 Developer Port Map (Minor Update)

**File:** `developer-port-map.png`

**Purpose:** Quick reference showing all services and their ports for local development.

**Changes from v1:** Added validation layer notation.

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
- **NEW:** "ToolInvocationValidator" (small shield icon)

Port badge: Large glowing "8000" in white

Tech stack badges:
- "Python 3.11"
- "FastAPI"
- "google-adk"
- **NEW:** "Tier 3 Validation" (purple badge)

Folder path: "agents/coordinator/"

Two arrows from hexagon:
- LEFT arrow to MCP (labeled "Tool Calls (Validated)")
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

**NEW:** AUDIT LOG BOX (bottom center):
- Label: "Audit Trail"
- Note: "All tool invocations logged"
- Icon: Database with lock

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
- ADK (:8000) → MCP (:8080): "Tool Requests (Validated)"
- ADK (:8000) → Gemini Cloud: "LLM Inference"
- **NEW:** ADK (:8000) → Audit Log: "All Events"

=== CORNER ANNOTATIONS ===
Top-left: "Phase 4 Architecture"
Top-right: "3 processes + validation layer"
Bottom-left: "Hot reload enabled"
Bottom-right: "ADR-007.1 compliant"

=== KEY REFERENCE TABLE ===
Small table at bottom:

| Service | Port | Process | Health Check | Validation |
|---------|------|---------|--------------|------------|
| Frontend | 3000 | Node/Vite | GET / | N/A |
| ADK Runtime | 8000 | Python | GET /health | Tier 3 ✓ |
| MCP Fixtures | 8080 | Python | GET /status | Logged ✓ |

Style: Clean reference card aesthetic, high contrast port numbers, terminal styling for commands. Validation layer integrated naturally. 16:9 aspect ratio.
```

---

## 1.5 AgentBriefingEvent Schema (Updated)

**File:** `agent-briefing-event.png`

**Purpose:** Shows the data contract between backend and frontend, **now including validation_outcome field**.

**Changes from v1:** Added validation_outcome to schema, updated UI rendering to show validation status.

### Generation Prompt

```
Create a technical schema diagram titled "AgentBriefingEvent: The UI Contract (with Validation)" on a deep slate blue background (#0F172A).

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
  
  "validation": {
    "outcome": "PASSED",
    "tools_invoked": ["assess_severity"],
    "attempts": 1,
    "audit_id": "audit-5678"
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
- **NEW:** Validation: purple (compliance color)
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

**NEW:** Validation outcome affects styling:
```
validation.outcome
├── "PASSED" → Normal rendering (green checkmark)
├── "RETRY_SUCCEEDED" → Amber indicator
└── "ESCALATED" → Red banner + "Pending Review"
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

3. PANEL INJECT (Updated)
   - Briefing card component
   - Header with agent badge
   - Summary text
   - "Expand Reasoning" link
   - Citation chips
   - **NEW:** Small "✓ Validated" badge in corner

4. MAP HIGHLIGHT
   - Polygon with colored fill
   - Severity-matched color
   - Popup on hover

=== BOTTOM ZONE: "Proof Layer + Validation Rendering" ===
Detailed breakdown of how proof_layer and validation render:

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

**NEW:** Validation Badge:
- Small shield icon
- "✓ Validated" or "⚠ Retry" or "🔴 Review"
- Tooltip: "tools_invoked: assess_severity"
- Click: Opens audit trail

=== CORNER ANNOTATIONS ===
Top-left: "PROTOCOL-AGENT-COMMUNICATION.md"
Top-right: "ADR-007.1 validation fields"
Bottom-left: "Zustand → React re-render"
Bottom-right: "Every event auditable"

=== KEY INSIGHT CALLOUT ===
"🎯 THE CONTRACT:
Backend emits structured events WITH validation proof.
Frontend renders deterministically.
Auditors can trace every insight to tool invocation."

Style: Schema visualization with clear data-to-UI mapping. Validation fields highlighted in purple. 16:9 aspect ratio.
```

---

## 1.6 Skill Anatomy (No Change)

**File:** `skill-anatomy.png`

**Purpose:** Shows the internal structure of a Skill folder.

**Changes from v1:** None - Skills structure is unchanged by ADR-007.1.

*(Prompt unchanged from v1)*

---

## 1.7 Proof Layer Rendering (Updated)

**File:** `proof-layer-rendering.png`

**Purpose:** Shows how the Proof Layer renders in the UI, **now including validation status as a fourth component**.

**Changes from v1:** Added "Validation Status" as fourth pillar of trust.

### Generation Prompt

```
Create a detailed UI component diagram titled "Proof Layer: Rendering Trust (with Validation)" on a deep slate blue background (#0F172A).

LAYOUT: Four-column breakdown showing each trust component. (Changed from three to four columns)

=== HEADER SECTION ===
Title with subtitle: "Proof Layer: The Four Pillars of Trust"
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

=== COLUMN 4: "Validation Status" (NEW) ===
Validation badge component:

Large shield icon with status indicator.

Three states shown:

STATE 1 (most common):
- Shield with green checkmark
- Label: "✓ VALIDATED"
- Subtitle: "Tool invoked on first pass"
- Color: Emerald

STATE 2 (occasional):
- Shield with amber triangle
- Label: "⚠ RETRY SUCCEEDED"
- Subtitle: "Tool invoked after retry"
- Color: Amber

STATE 3 (rare):
- Shield with red X
- Label: "🔴 PENDING REVIEW"
- Subtitle: "Escalated to human"
- Color: Red

Below states, the audit link:
```
Click to view:
├── Audit ID: audit-5678
├── Timestamp: 2025-12-28T10:30:00Z
├── Tools Invoked: [assess_severity]
├── Attempts: 1
└── Full audit trail →
```

Annotation: "Federal compliance checkpoint"

=== BOTTOM ZONE: "Complete Briefing Card Example" ===
Full briefing card mockup showing all four components integrated:

```
┌────────────────────────────────────────────────────────────────┐
│ 🔥 Burn Analyst                    [CRITICAL]  ✓ Validated    │
│ Skill: burn-severity-analysis                                  │
├────────────────────────────────────────────────────────────────┤
│ Sector SW-4 shows 42% high-severity burn                       │
│ across 18,340 acres. Erosion risk elevated.                    │
├────────────────────────────────────────────────────────────────┤
│ Confidence: [████████░░] 87%                                   │
├────────────────────────────────────────────────────────────────┤
│ Sources: [MTBS] [Sentinel-2] [FSM 2353.03]                     │
├────────────────────────────────────────────────────────────────┤
│ ▶ Show Reasoning Chain (4 steps)     📋 View Audit Trail      │
└────────────────────────────────────────────────────────────────┘
```

=== CORNER ANNOTATIONS ===
Top-left: "PROOF-LAYER-DESIGN.md"
Top-right: "ADR-007.1 Validation Layer"
Bottom-left: "ISO 8601 timestamps always"
Bottom-right: "FedRAMP audit compliance"

=== KEY INSIGHT CALLOUT ===
"🛡️ THE FOUR PILLARS OF TRUST:
Confidence tells you HOW SURE.
Citations tell you WHERE FROM.
Reasoning tells you HOW WE GOT THERE.
Validation tells you IT WAS ENFORCED.
Together: Government-grade defensible AI."

Style: Clean UI component documentation, high-fidelity mockups. Four equal columns. Validation (purple) as prominent as other three. 16:9 aspect ratio.
```

---

# TRACK 2: STAKEHOLDER DIAGRAMS

These diagrams live in `docs/diagrams/stakeholder/` and serve as communication tools for external audiences.

---

## 2.0 Federal Compliance Overview (NEW - P0)

**File:** `federal-compliance-overview.png`

**Purpose:** Executive-level diagram showing how RANGER meets federal AI compliance requirements. This is the "auditor-ready" slide.

**Question It Answers:** "Is this system compliant with federal AI requirements?"

### Generation Prompt

```
Create an executive compliance diagram titled "RANGER: Federal AI Compliance Architecture" on a deep slate blue background (#0F172A).

LAYOUT: Central compliance framework with supporting evidence pillars.

=== HEADER ===
Title: "FEDERAL AI COMPLIANCE ARCHITECTURE"
Subtitle: "How RANGER Meets Government AI Standards"

Badges across top:
- "FedRAMP High Compatible"
- "NIST AI RMF Aligned"
- "USDA GenAI Strategy Compliant"

=== CENTER: The Compliance Framework ===
Large rounded rectangle representing the RANGER system.

Inside, show three interconnected components:

COMPONENT 1: "Transparency"
Icon: Eye / lens
- "Every AI decision explained"
- "Reasoning chains visible"
- "No black box outputs"
Link to: Proof Layer

COMPONENT 2: "Auditability"
Icon: Clipboard / checkmark
- "Every tool call logged"
- "Immutable timestamps"
- "Full decision reconstruction"
Link to: Audit Trail

COMPONENT 3: "Reliability"
Icon: Shield
- "99% tool invocation"
- "Three-layer enforcement"
- "Explicit escalation path"
Link to: Validation Layer

Connecting arrows between all three, showing they work together.

=== LEFT PILLAR: "The Auditor Question" ===
Simulated Q&A format:

Q1: "How do you ensure AI uses real data?"
A1: "Three-layer enforcement verifies every tool call. All logged."

Q2: "What if the AI hallucinates?"
A2: "Citations required for every insight. No source = flagged."

Q3: "Can we reconstruct decisions?"
A3: "Yes. Full audit trail with timestamps, parameters, outcomes."

Q4: "What about model failures?"
A4: "Explicit escalation to human review. <1% of queries."

=== RIGHT PILLAR: "The Evidence" ===
Stack of compliance artifacts:

Document 1: "ADR-007.1"
- "Three-Layer Enforcement Pattern"
- "Defense-in-depth architecture"

Document 2: "Audit Log Schema"
- "JSON structure with timestamps"
- "Immutable storage"

Document 3: "Validation Metrics"
- "~90% first-pass success"
- "~99% combined reliability"
- "<1% escalation rate"

Document 4: "FedRAMP Controls"
- "Vertex AI (FedRAMP High)"
- "GCP infrastructure"

=== BOTTOM: Compliance Checklist ===
Visual checklist with green checkmarks:

✓ "AI decisions are explainable" (Reasoning Chains)
✓ "Data sources are cited" (Citation Chips)
✓ "Tool invocation is verified" (Validation Layer)
✓ "All events are logged" (Audit Trail)
✓ "Failures escalate to humans" (Escalation Path)
✓ "Infrastructure is FedRAMP authorized" (Vertex AI)

=== CORNER ANNOTATIONS ===
Top-left: "Executive Summary"
Top-right: "December 2025"
Bottom-left: "USDA GenAI Roadmap Aligned"
Bottom-right: "Defense-in-Depth Architecture"

=== KEY TAGLINE ===
"RANGER doesn't just use AI—it uses AI responsibly, transparently, and defensibly."

Style: Professional, executive-ready, government document aesthetic. Clean and authoritative. Emphasis on compliance and trust. 16:9 aspect ratio.
```

---

## 2.1 Cedar Creek Context (No Change)

**File:** `cedar-creek-context.png`

**Purpose:** Establishes the scale, timeline, and complexity of the Cedar Creek Fire.

**Changes from v1:** None - context diagram is unchanged.

*(Prompt unchanged from v1)*

---

## 2.2 The RANGER Value Loop (Updated)

**File:** `ranger-value-loop.png`

**Purpose:** The "hero" diagram showing what RANGER does in 30 seconds. **Now includes validation checkpoint.**

**Changes from v1:** Added validation as visible step in the loop.

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
- **NEW:** Small shield icon: "Validated"

=== CIRCULAR FLOW (clockwise from top) ===
Five major nodes connected by flowing arrows (added validation node):

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

NODE 3 (Bottom-Right, NEW): "VALIDATED"
Icon: Shield with checkmark
Label: "Tool invocation verified"
Visual: Green glow indicating validation passed
Small text: "Three-layer enforcement"

Arrow → flows to:

NODE 4 (Bottom-Left): "UNIFIED BRIEFING"
Icon: Document with checkmarks
Show briefing card mockup:
- Summary text
- Confidence score
- Citation chips
- **NEW:** Validation badge
Label: "Synthesized, cited, transparent, verified"

Arrow → flows to:

NODE 5 (Left): "INFORMED DECISION"
Icon: Person with checkmark
Label: "Human decides with full context"
Visual: Decision point indicator

Arrow → completes the loop back to NODE 1

=== TIME INDICATORS ===
Between each node, show elapsed time:
- "0s: Question asked"
- "~2s: Analysis complete"
- "~2.1s: Validation passed"
- "~2.5s: Briefing delivered"
- "Human takes action when ready"

Compare to traditional workflow:
"Traditional: 2+ hours across 14 systems"
"RANGER: 2.5 seconds with full transparency AND validation"

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
Four boxes highlighting unique value (added one):

Box 1: "Coordinated, Not Siloed"
"Four specialists, one unified answer"

Box 2: "Transparent, Not Black Box"
"Every insight cites sources"

Box 3: "Validated, Not Assumed"  (NEW)
"Every tool call verified and logged"

Box 4: "Augments, Not Replaces"
"AI recommends, humans decide"

=== CORNER ANNOTATIONS ===
Top-left: "Agentic Operating System"
Top-right: "Skills-First Architecture"
Bottom-left: "Three-Layer Enforcement"
Bottom-right: "FedRAMP compliant"

=== KEY TAGLINE (footer) ===
"RANGER compresses weeks of disconnected analysis into seconds of unified, validated intelligence."

Style: Clean, professional, executive-ready. Flowing circular motion implies continuous value. Validation node prominently displayed. Emerald accents on key elements. 16:9 aspect ratio.
```

---

## 2.3 Recovery Chain (Personas) (No Change)

**File:** `recovery-chain-personas.png`

**Purpose:** Shows how four real USFS personas trigger each other through RANGER.

**Changes from v1:** None - persona workflow is unchanged.

*(Prompt unchanged from v1)*

---

## 2.4 Legacy Bridge (No Change)

**File:** `legacy-bridge.png`

**Purpose:** Shows how modern AI insights transform into legacy-compatible formats.

**Changes from v1:** None - integration pattern is unchanged.

*(Prompt unchanged from v1)*

---

## 2.5 Confidence Ledger (Updated)

**File:** `confidence-ledger.png`

**Purpose:** Deep-dive into how RANGER builds trust. **Now includes validation as fourth pillar.**

**Changes from v1:** Added "Validation Status" as fourth pillar, enhanced federal compliance language.

### Generation Prompt

```
Create a trust architecture diagram titled "The Confidence Ledger: Four Pillars of Federal AI Trust" on a deep slate blue background (#0F172A).

LAYOUT: Top contrast section, middle four-pillar section, bottom audit trail.

=== TOP SECTION: "The Trust Problem" ===
Two contrasting boxes side by side:

LEFT BOX (crossed out with red X):
Label: "Black Box AI"
Generic chatbot icon
Output: "The bridge is damaged"
- No source
- No confidence  
- No reasoning
- **No validation**
Caption: "Trust me, bro"
Visual: Faded, untrustworthy appearance

RIGHT BOX (green checkmark):
Label: "RANGER Briefing"
Trail Assessor icon (🥾)
Output: "Bridge at Mile 47 shows structural failure"
- Four proof elements visible below
Caption: "Here's my evidence—verified"
Visual: Bright, trustworthy appearance

=== MIDDLE SECTION: "The Four Pillars of Trust" ===
Four equal columns (expanded from three):

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

Caption: "HOW SURE: Actual probability, not vibes"

COLUMN 2: "Citation Chain"
Stack of three citation chips:
- [TRACS] "Report #4521" → links to PDF
- [Video] "Frame 00:42" → links to image
- [FSM] "2353.03" → links to regulation

Arrow showing: "Click to verify"

Caption: "WHERE FROM: Every claim traceable"

COLUMN 3: "Reasoning Chain"
Numbered steps in vertical flow:
1. "Video frame shows visible crack in support beam"
2. "Crack pattern matches Class III structural failure"
3. "Weight capacity reduced below safe threshold"
4. "Recommend immediate closure"

Caption: "HOW WE GOT THERE: Step-by-step logic"

COLUMN 4: "Validation Status" (NEW)
Shield icon with verification indicator:
- Large shield with green checkmark
- "✓ VALIDATED"
- "Tool invoked: classify_damage()"
- "Attempts: 1"
- "Audit ID: audit-5678"

Below:
"Three-Layer Enforcement:"
- Tier 1: API enabled ✓
- Tier 2: ReAct guided ✓
- Tier 3: Validator confirmed ✓

Caption: "IT WAS ENFORCED: Verified, not assumed"

=== BOTTOM SECTION: "The Audit Trail" ===
Horizontal timeline showing complete lifecycle:

Event markers:
- "2024-03-15 09:42:17 UTC: Query received"
- "2024-03-15 09:42:19 UTC: Tool invoked (validated)"
- "2024-03-15 09:42:20 UTC: Event emitted"
- "2024-03-15 09:45:33 UTC: User acknowledged"
- "2024-03-15 09:46:00 UTC: Action: Closure order generated"

Database icon: "Immutable Event Log"
Shield icon: "Federal Audit Ready"

Caption: "Every briefing is auditable. Every decision is traceable. Every tool call is verified."

=== CORNER ANNOTATIONS ===
Top-left: "Government-grade accountability"
Top-right: "ADR-007.1 Three-Layer Enforcement"
Bottom-left: "FedRAMP audit requirements"
Bottom-right: "Defense-in-Depth Architecture"

=== FOOTER TAGLINE ===
"Government-grade AI requires government-grade accountability. RANGER's Confidence Ledger makes every insight defensible—and now, verified."

Style: Clean, authoritative, trust-building aesthetic. Four pillars should feel like architectural columns supporting the system. Validation pillar prominently displayed in purple. 16:9 aspect ratio.
```

---

## 2.6 Maria's 8-Minute Morning (Minor Update)

**File:** `marias-morning.png`

**Purpose:** Before/After workflow comparison showing how RANGER transforms the morning briefing workflow.

**Changes from v1:** Added validation checkmark to RANGER workflow.

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
Note: "Incomplete picture • No validation"

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
- Validation: None
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
**NEW:** Small "✓ Validated" badge

6:35 AM - "Drill into Bootleg Fire"
Icon: Detailed view
Note: "Full context with citations"
**NEW:** "All insights verified"

6:38 AM - "Ask: 'What should I tell Washington?'"
Icon: Chat interface
Note: "Natural language query"

6:40 AM - "Receive executive summary"
Icon: Briefing card
Note: "Talking points with proof"
**NEW:** "Tool calls logged"

6:42 AM - "Confident and prepared"
Icon: Checkmark + shield
Note: "Full transparency + validation"

6:45 AM - "Washington call"
Icon: Phone (green)
Note: "Nailed it—with audit trail"

Bottom stats:
- Time spent: 15 minutes
- Systems accessed: 1
- Confidence: High
- Validation: ✓ Every insight
- Blind spots: Surfaced automatically

Visual: Calm, organized, emerald success indicators

=== CENTER DIVIDER ===
Large transformation arrow pointing from left to right.
Label: "RANGER transforms"

Key metrics highlighted:
"2 hours → 15 minutes (8x faster)"
"14 systems → 1 interface"
"Guessing → Knowing"
"Unverified → Validated"

=== BOTTOM: The Three Questions + Audit ===
Four boxes showing Maria's key needs (added one):

Box 1: "What's going sideways?"
Before: "Manual scan of 50 reports"
After: "AI surfaces anomalies automatically"

Box 2: "Where's the risk?"
Before: "Hope I didn't miss anything"
After: "Ranked by triage score with reasoning"

Box 3: "What do I tell Washington?"
Before: "Cobbled-together talking points"
After: "Executive summary with citations"

Box 4: "Can I defend this?" (NEW)
Before: "No audit trail"
After: "Every insight validated and logged"

=== FOOTER TAGLINE ===
"RANGER doesn't replace Maria's judgment. It gives her 8 minutes back, the confidence to use them well, and an audit trail to prove it."

Style: Clear before/after contrast, timeline flowing downward, stress vs. calm emotional resonance. Validation badges visible in RANGER workflow. 16:9 aspect ratio.
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

### Best Practices:

1. **Edit, Don't Re-roll:** If an image is 80% correct, ask for specific changes rather than regenerating from scratch.

2. **Use Natural Language:** These prompts are written as creative director briefs, not tag soups.

3. **Maintain Consistency:** When generating multiple diagrams in a session, reference previous outputs.

4. **Iterate on Details:** Start with structure, then refine typography and labels, then add annotations.

### Quality Checklist (Updated for v2)

Before finalizing any diagram, verify:

- [ ] 16:9 aspect ratio
- [ ] Dark slate blue background (#0F172A)
- [ ] Consistent agent iconography (🔥 🥾 🌲 📋)
- [ ] RANGER color palette applied
- [ ] All text is legible at presentation size
- [ ] Key insight callout box present
- [ ] Corner annotations add context
- [ ] Flow direction is clear (left→right or top→bottom)
- [ ] **NEW:** Validation/compliance elements visible where relevant
- [ ] **NEW:** Federal/FedRAMP badges on compliance-focused diagrams
- [ ] **NEW:** ADR-007.1 referenced in annotations where applicable

---

## File Naming Convention (Updated)

```
docs/diagrams/
├── developer/
│   ├── three-layer-enforcement.png     (NEW)
│   ├── adk-runtime-skills.png          (Updated)
│   ├── sse-streaming-flow.png          (Updated)
│   ├── mcp-data-layer.png              (Minor update)
│   ├── developer-port-map.png          (Minor update)
│   ├── agent-briefing-event.png        (Updated)
│   ├── skill-anatomy.png               (Unchanged)
│   └── proof-layer-rendering.png       (Updated)
└── stakeholder/
    ├── federal-compliance-overview.png (NEW)
    ├── cedar-creek-context.png         (Unchanged)
    ├── ranger-value-loop.png           (Updated)
    ├── recovery-chain-personas.png     (Unchanged)
    ├── legacy-bridge.png               (Unchanged)
    ├── confidence-ledger.png           (Updated)
    └── marias-morning.png              (Minor update)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-26 | Initial diagram prompts |
| **2.0** | **2025-12-28** | **ADR-007.1 alignment: Three-layer enforcement, validation layer, federal compliance emphasis** |

---

**Document Owner:** RANGER Product Team  
**Last Updated:** December 28, 2025  
**Prompt Version:** 2.0  
**Aligned With:** ADR-007.1 Three-Layer Tool Invocation Strategy

# RANGER Diagram Narratives

Companion narratives for architectural diagrams. Use these as speaker notes, written accompaniment, or developer onboarding material.

---

## 1. AgentBriefingEvent Rendering Pipeline

**File:** `AgentBriefingEvent Rendering Pipeline.png`

**One-Sentence Summary:** Shows how a structured JSON event from an AI agent transforms into specific UI elements through a deterministic routing contract.

### The Story This Diagram Tells

Every insight RANGER's AI agents produce must eventually reach a human operator's screen. But *how* it appears matters enormously—a critical wildfire alert shouldn't arrive the same way a routine status update does. This diagram reveals the "UI Binding Contract" that governs that translation.

On the left, you see the `AgentBriefingEvent` structure: a JSON payload containing the event type, severity level, UI binding target, confidence score, and reasoning chain. This isn't free-form text—it's a structured contract that the frontend can parse deterministically.

The center panel shows the routing logic. When an event arrives via WebSocket, the system examines its type and severity to determine where it should render:
- **Critical alerts** interrupt with a modal overlay—the operator must acknowledge before continuing
- **Action-required events** pulse the sidebar rail AND inject a panel card—dual notification ensures visibility
- **Insights** flow quietly into the panel without demanding attention
- **Status updates** also go to panels, keeping the timeline current without distraction

The right side shows the actual UI manifestations: the pulsing glow on a sidebar icon, an expandable panel card, a highlighted polygon on the map, or a modal dialog demanding acknowledgment.

The bottom section—the "Proof Layer"—is what separates RANGER from black-box AI. Every briefing includes a confidence meter (not just "high/medium/low" but an actual 0-100% score), clickable citation chips linking to source data, and a collapsible reasoning chain showing exactly how the AI reached its conclusion.

### Key Talking Points

- **Deterministic, not magical:** The UI binding is a contract, not AI deciding where things go
- **Severity drives urgency:** Critical events interrupt; insights flow quietly
- **Proof is built-in:** Confidence scores, citations, and reasoning chains are first-class citizens
- **Four UI targets:** `rail_pulse`, `panel_inject`, `map_highlight`, `modal_interrupt`
- **WebSocket streaming:** Events arrive in real-time, not polling

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| Frontend developers | Understanding the rendering contract they must implement |
| Backend developers | Understanding what UI expects from their event payloads |
| UX designers | Seeing how severity maps to attention-demand |
| Technical reviewers | Evaluating our anti-hallucination architecture |

---

## 2. Recovery Coordinator: Query Routing & Agent Cascade

**File:** `Coordinator Routing & Cross-Agent Cascade.png`

**One-Sentence Summary:** Demonstrates how the Recovery Coordinator intelligently routes user queries—either to a single specialist agent or across multiple agents in parallel—then synthesizes cross-domain insights.

### The Story This Diagram Tells

This is the heart of RANGER's orchestration value. When a user asks "Create a recovery plan prioritizing visitor access," they're not just querying a database—they're triggering a coordinated intelligence operation across multiple AI specialists.

The diagram begins at the top with a user query entering the system. The Recovery Coordinator (powered by Gemini) makes the first critical decision: Is this a simple, single-domain question, or does it require multi-domain synthesis?

**Simple queries** (left path) get routed directly to the relevant specialist. If someone asks "What's the burn severity in Sector 7?", the Coordinator recognizes this is purely a Burn Analyst question and dispatches accordingly. One agent, one response, minimal latency.

**Complex queries** (right path) trigger the cascade. The recovery plan question requires:
- **Burn Analyst** → severity data (which areas are safe?)
- **Trail Assessor** → repair costs (what's the damage?)
- **Cruising Assistant** → salvage value (what timber economics apply?)
- **NEPA Advisor** → timeline constraints (what regulatory windows exist?)

These four agents execute in parallel, each returning their domain-specific analysis. The Coordinator then performs **synthesis**: aggregating outputs, detecting cross-domain patterns, minting a `correlation_id` to link related events, and emitting a coordinated briefing.

The "Cross-Agent Handoffs" callout on the right shows the cascade in action. When Burn Analyst reports "High severity zone detected," the Coordinator recognizes this should trigger Trail Assessor to prioritize damage assessment in that sector. When Trail Assessor finds a bridge failure, that insight flows to inform the overall plan. This isn't just parallel execution—it's intelligent handoff.

At the bottom, Session State (Redis) shows how the system maintains context across interactions, storing correlation IDs and user priorities for continuity.

### Key Talking Points

- **Smart routing, not just dispatch:** The Coordinator decides single vs. multi-agent based on query complexity
- **Parallel execution:** Complex queries hit all relevant agents simultaneously for speed
- **Synthesis is the magic:** Raw agent outputs become coordinated insights through pattern detection
- **Cross-agent handoffs:** One agent's finding can trigger prioritization by another
- **Correlation tracking:** Every related event shares a `correlation_id` for traceability
- **Session continuity:** Redis maintains state across the conversation

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| Investors/Partners | Explaining why orchestration creates value beyond single-agent chat |
| Forest Service stakeholders | Showing how their complex questions get answered |
| Demo walkthroughs | Explaining what happens "behind the curtain" |
| Architecture reviews | Evaluating the coordinator pattern implementation |

---

## 3. Phase 1 Architecture Boundaries

**File:** `Phase 1 Architecture Boundaries.png`

**One-Sentence Summary:** Clarifies exactly what Phase 1 builds (real AI reasoning and orchestration) versus what it simulates (data inputs), preventing scope confusion and setting realistic expectations.

### The Story This Diagram Tells

This is the "expectation management" diagram—arguably the most important one for external conversations. It answers the question every technical evaluator will ask: "What's real and what's smoke and mirrors?"

The diagram uses a three-column structure that makes the answer impossible to misunderstand:

**SIMULATED INPUTS (Left Column):** The gray zone. Phase 1 does NOT process satellite imagery, detect trail damage from video, or ingest real-time field data. Instead, we use carefully crafted fixture files:
- `burn-severity.json` with GeoJSON polygons representing severity zones
- `trail-damage.json` with damage points and repair cost estimates
- `timber-plots.json` with species composition and mortality percentages
- `briefing-events.json` with pre-authored demonstration events

These files flow through a "Mock MCP Layer" that returns fixture data instead of calling real APIs. The explicit callout states: "We're NOT processing satellite imagery or detecting damage from video."

**REAL AI (Center Column):** The blue zone. This is where the magic actually happens. The four specialist agents (Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor) are real Google ADK agents powered by Gemini 2.0 Flash. They generate:
- Narrative briefings (natural language summaries)
- Reasoning chains (step-by-step logic)
- Suggested actions (prioritized recommendations)
- Citations to sources (traceability)

The explicit callout states: "We ARE generating real AI reasoning and cross-agent orchestration."

**USER SEES (Right Column):** The green zone. The Command Console renders briefing cards, phases, maps with highlighted regions—all driven by Zustand state updates and React re-renders. Users see reasoning transparency and proof. The experience is real even though the underlying data is simulated.

The **Future State** footer at the bottom shows the upgrade path. The Mock MCP Layer becomes a gateway to real data sources: Sentinel-2 API for satellite imagery, Video ML for damage detection, Field Capture for mobile data collection. Crucially, "Gemini synthesis unchanged" and "UI unchanged"—we've architected for this evolution.

### Key Talking Points

- **Simulated data, real reasoning:** The AI is genuinely analyzing and synthesizing—we just feed it curated inputs
- **Fixture files are intentional:** Cedar Creek data lets us demonstrate without waiting for fire season
- **Orchestration is the product:** We're proving the coordination layer, not the perception layer
- **Clean upgrade path:** Swap Mock MCP for real APIs; everything else stays the same
- **No deception:** We're transparent about what Phase 1 does and doesn't do

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| Partners/Customers | Managing expectations about Phase 1 capabilities |
| Investors | Showing technical maturity and honest scope definition |
| Grant reviewers | Demonstrating clear Phase 1 vs. future roadmap |
| Internal team | Alignment on what we're building vs. what we're simulating |
| Technical due diligence | Answering "what's real?" directly |

---

## Visual Design Notes

All three diagrams share a consistent aesthetic:

- **Chalk-on-slate style:** Dark background (#0F172A-ish) with hand-drawn white lines
- **Color coding:** Matches RANGER's severity palette (green=safe, orange=warning, red=critical)
- **Agent icons:** Fire (Burn Analyst), Boot (Trail Assessor), Tree (Cruising Assistant), Document (NEPA Advisor)
- **Flow direction:** Generally left-to-right or top-to-bottom for narrative clarity
- **Annotations:** Handwritten-style callouts for key insights

This "tactical whiteboard" aesthetic reinforces RANGER's identity as an operational tool, not a polished consumer app. It suggests active planning, real-time decision-making, and field-ready pragmatism.

---

## Generation Prompts

The prompts used to generate each diagram are preserved here for reproducibility and future iterations.

### Prompt 1: AgentBriefingEvent Rendering Pipeline

```
Create a technical whiteboard diagram titled "From Agent Briefing to Screen: The UI Binding Contract"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White and light gray lines for structure. Use accent colors sparingly: emerald green (#10B981) for success/info, amber (#F59E0B) for warnings, red (#EF4444) for critical. Handwritten-style labels. No gradients or 3D effects.

Layout (left to right flow):

LEFT SECTION - "Event Structure"
Draw a rounded rectangle representing JSON with these visible fields stacked vertically:
- type: alert | insight | action_required | status_update
- severity: info | warning | critical
- ui_binding.target: rail_pulse | panel_inject | map_highlight | modal_interrupt
- confidence: 0.87
- reasoning_chain: [...]

CENTER SECTION - "Routing Logic"
A small decision tree or matrix showing:
- critical + alert → modal (red path)
- action_required → rail_pulse + panel (amber path)
- insight → panel only (green path)
- status_update → panel only (gray path)

RIGHT SECTION - "UI Result"
Four small UI mockup sketches stacked vertically:
1. Sidebar rail item with pulsing glow effect (show pulse rings)
2. Panel card with title, summary text, and expandable section
3. Map with a highlighted polygon region
4. Modal dialog overlay (full width, dimmed background)

BOTTOM SECTION - "Proof Layer (Anti-Hallucination)"
A horizontal band showing three components:
1. Confidence meter (0-100% bar, filled to 87%)
2. Citation chips: "Source A [link]", "Source B [link]"
3. Collapsible reasoning chain preview: "1. [Step 1 Reasoning] 2. [Step 2 Reasoning]..."

The diagram should flow left-to-right showing: Event arrives → Routing decision → UI manifestation, with the proof layer as a foundation underneath everything.
```

### Prompt 2: Coordinator Routing & Cross-Agent Cascade

```
Create a technical whiteboard diagram titled "Recovery Coordinator: Query Routing & Agent Cascade"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White lines and text. Agent nodes in muted colors: Burn Analyst (orange), Trail Assessor (blue), Cruising Assistant (green), NEPA Advisor (purple). Handwritten-style labels. No gradients.

Layout (top to bottom, branching):

TOP - "User Query Enters"
A chat bubble or input field icon with example: "Create recovery plan prioritizing visitor access"

MIDDLE-TOP - "Recovery Coordinator"
A central hexagon labeled "Recovery Coordinator (Gemini)" with a brain or conductor icon. Two arrows branch down from it, labeled:
- Left arrow: "Simple Query (single domain)"
- Right arrow: "Complex Query (multi-domain)"

LEFT BRANCH - "Direct Routing"
Single arrow to one agent box (e.g., Burn Analyst)
Arrow back up labeled "Single Event Response"

RIGHT BRANCH - "Parallel Dispatch + Synthesis"
Four parallel arrows going to four agent boxes arranged horizontally:
- Burn Analyst (orange) - "severity data"
- Trail Assessor (blue) - "repair costs"
- Cruising Assistant (green) - "salvage value"
- NEPA Advisor (purple) - "timeline constraints"

Below the four agents, arrows converge into a "Synthesis" node showing:
- "Aggregate outputs"
- "Detect cross-domain patterns"
- "Mint correlation_id"
- "Emit coordinated briefing"

BOTTOM-RIGHT - "Cross-Agent Handoffs"
Show 2-3 curved arrows between agents with labels:
- Burn Analyst → Trail Assessor: "High severity zone detected → prioritize this sector"
- Trail Assessor → NEPA Advisor: "Bridge failure → emergency closure needed"

BOTTOM - "Session State (Redis)"
Small database icon with key examples:
- ranger:session:{id}:correlation_id
- ranger:session:{id}:priorities

Keep hierarchical flow clear. The cascade concept should be immediately visible.
```

### Prompt 3: Phase 1 Architecture Boundaries

```
Create a technical whiteboard diagram titled "Phase 1: Where's the Magic? (Hint: It's the Reasoning, Not the Data)"

Style: Clean engineering whiteboard aesthetic. Three vertical swim lanes. Left lane has gray/muted background labeled "SIMULATED". Middle lane has normal background labeled "REAL AI". Right lane has slightly lighter background labeled "USER SEES". Dark slate blue base (#0F172A). Handwritten-style labels.

LEFT LANE - "Simulated Inputs" (gray tint)
Stack of file icons representing JSON fixtures:
- burn-severity.json (GeoJSON polygons)
- trail-damage.json (damage points, costs)
- timber-plots.json (species, mortality %)
- briefing-events.json (pre-authored events)

Below files, a box labeled "Mock MCP Layer" with note: "Returns fixture data, no real APIs"

Caption at bottom: "We're NOT processing satellite imagery or detecting damage from video"

MIDDLE LANE - "Real Agent Processing"
Four agent boxes stacked (Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor)

Arrow from left lane entering agents

Large "Gemini 2.0 Flash" cloud/API icon

Outputs listed:
- Narrative briefings
- Reasoning chains (step-by-step)
- Suggested actions
- Citations to sources

Caption: "We ARE generating real AI reasoning and cross-agent orchestration"

RIGHT LANE - "Command Console"
Simple UI mockup showing:
- Sidebar with lifecycle phases
- Main panel with briefing cards
- Map region

Arrow from middle lane showing "WebSocket stream"

Below UI:
- "Zustand state updates"
- "React re-renders"
- "User sees reasoning + proof"

Caption: "Orchestration value proven with frozen Cedar Creek data"

BOTTOM SECTION - "Future State" (lighter, below all lanes)
Left lane transforms: Files → "Sentinel-2 API, Video ML, Field Capture"
Middle lane stays same: "Gemini synthesis unchanged"
Right lane stays same: "UI unchanged"

Large arrow with label: "Add real data pipelines → full capability"

The key insight should be obvious: the architecture is production-ready, only the data sources are stubbed.
```

---

## Proposed New Diagrams

The following three diagrams would complement the existing set without duplication.

### Prompt 4: The Cedar Creek Recovery Chain (Persona Cascade)

**Purpose:** Shows how four real USFS personas trigger each other through RANGER, demonstrating the human-centric value of cross-agent coordination.

**Why it's unique:** Existing diagrams focus on technical flows (events, queries, architecture). This one tells the *human story*—the actual people whose work improves.

```
Create a technical whiteboard diagram titled "The Cedar Creek Recovery Chain: Four Personas, One Mission"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White lines and handwritten-style labels. Each persona gets a distinct muted color that matches their agent. Human icons (simple head/shoulder silhouettes) next to persona names. Include small role badges. Flow should feel like a relay race or chain reaction.

Layout (circular flow, clockwise):

TOP-LEFT - "Sarah Chen" (Fire Management Officer)
- Small human icon with "FMO" badge
- Color: Orange tint (matches Burn Analyst)
- Thought bubble: "Where are the high-severity burn zones?"
- Below: Small mockup of burn severity map
- Action arrow pointing right: "Triggers trail priority"
- Label on arrow: "Sector 4 flagged for erosion risk"

TOP-RIGHT - "Marcus Rodriguez" (Recreation Technician)
- Small human icon with "Rec Tech" badge
- Color: Blue tint (matches Trail Assessor)
- Thought bubble: "Which trails need closure?"
- Below: Small mockup of trail damage list
- Action arrow pointing down: "Informs access routes"
- Label on arrow: "Bridge washout on PCT Mile 47"

BOTTOM-RIGHT - "Elena Vasquez" (Timber Cruiser)
- Small human icon with "Cruiser" badge
- Color: Green tint (matches Cruising Assistant)
- Thought bubble: "What's the salvage potential?"
- Below: Small mockup of timber plot data
- Action arrow pointing left: "Triggers compliance check"
- Label on arrow: "Unit 12 near historic trail"

BOTTOM-LEFT - "Dr. James Park" (Environmental Coordinator)
- Small human icon with "NEPA" badge
- Color: Purple tint (matches NEPA Advisor)
- Thought bubble: "Are we compliant?"
- Below: Small mockup of EA checklist
- Action arrow pointing up (completing the circle): "Refines recovery scope"
- Label on arrow: "Section 106 buffer required"

CENTER - "Correlation Thread"
A dashed circular line connecting all four personas through the center
Label: "correlation_id: cedar-creek-recovery-001"
Small text: "Shared context across all interactions"

BOTTOM CAPTION
"Before RANGER: 4 silos, 4 separate workflows, information lost in email"
"With RANGER: 1 coordinated recovery, automatic handoffs, nothing falls through cracks"

The human faces and role badges should make this immediately relatable to USFS stakeholders. The circular flow shows that recovery is iterative, not linear.
```

### Prompt 5: The Confidence Ledger (Trust Architecture)

**Purpose:** Deep-dives into how RANGER builds trust through citations, confidence scores, and reasoning transparency—the "anti-hallucination" architecture.

**Why it's unique:** Diagram 1 mentions the proof layer briefly. This one makes trust the central theme, which is critical for government adoption.

```
Create a technical whiteboard diagram titled "The Confidence Ledger: How RANGER Builds Trust"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White lines and handwritten-style labels. Use a "ledger" or "audit trail" visual metaphor. Green checkmarks for verified elements. Amber question marks for uncertainty. The diagram should feel like a transparency report.

Layout (vertical stack with detail breakouts):

TOP SECTION - "The Trust Problem"
Two contrasting boxes side by side:

LEFT BOX - "Black Box AI" (crossed out or red X)
- Generic chatbot icon
- Output: "The bridge is damaged"
- No source, no confidence, no reasoning
- Caption: "Trust me, bro"

RIGHT BOX - "RANGER Briefing" (green checkmark)
- Agent icon (Trail Assessor boot)
- Output: "Bridge at Mile 47 shows structural failure"
- Three proof elements visible below (detailed in next section)
- Caption: "Here's my evidence"

MIDDLE SECTION - "The Three Pillars of Proof"
Three columns, each with an icon and detail:

COLUMN 1 - "Confidence Score" (gauge icon)
- Large circular gauge showing 0.87 (87%)
- Color gradient: red (0-50%), amber (50-75%), green (75-100%)
- Below gauge: "Derived from:"
  - Source data quality: 0.92
  - Model certainty: 0.84
  - Cross-validation: 0.85
- Caption: "Not just 'high/medium/low' — actual probability"

COLUMN 2 - "Citation Chain" (link icon)
- Stack of three citation chips:
  - "TRACS Report #4521" → links to PDF
  - "Mobile Video Frame 00:42" → links to image
  - "FSM 2353.03 (Trail Standards)" → links to regulation
- Arrow showing "Click to verify"
- Caption: "Every claim traceable to source"

COLUMN 3 - "Reasoning Chain" (steps icon)
- Numbered list (collapsible UI):
  1. "Video frame shows visible crack in support beam"
  2. "Crack pattern matches Class III structural failure (FSM Table 2353-1)"
  3. "Weight capacity reduced below safe threshold for pack stock"
  4. "Recommend immediate closure pending engineering review"
- Caption: "Step-by-step logic, not magic"

BOTTOM SECTION - "The Audit Trail"
Horizontal timeline showing:
- Event emitted: 2024-03-15 09:42:17 UTC
- Source agent: Trail Assessor
- Confidence at emission: 0.87
- User acknowledgment: 2024-03-15 09:45:33 UTC
- Action taken: "Closure order generated"

Small database icon labeled "Immutable Event Log"
Caption: "Every briefing is auditable. Every decision is traceable."

FOOTER
"Government-grade AI requires government-grade accountability. RANGER's Confidence Ledger makes every insight defensible."
```

### Prompt 6: The Legacy Bridge (TRACS & FSVeg Export)

**Purpose:** Shows how modern AI reasoning becomes legacy-compatible output formats that USFS systems actually accept.

**Why it's unique:** This is a key selling point for government adoption—we're not asking them to replace their systems, just to augment them.

```
Create a technical whiteboard diagram titled "The Legacy Bridge: From AI Insight to 1999-Era Systems"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White lines and handwritten-style labels. Visual contrast between "modern" (sleek, glowing) and "legacy" (chunky, retro) styling. The bridge metaphor should be literal—show an actual bridge connecting two eras.

Layout (left to right with bridge in center):

LEFT SIDE - "Modern RANGER" (sleek styling)
- Glowing panel showing AI briefing card
- Agent icon (e.g., Trail Assessor boot)
- Sample insight: "Bridge at Mile 47: Structural failure detected. Estimated repair: $45,000. Priority: Critical."
- Below: JSON snippet showing structured data:
  ```
  {
    "damage_type": "structural_failure",
    "location": { "mile_marker": 47, "trail": "PCT" },
    "repair_estimate_usd": 45000,
    "priority": "critical"
  }
  ```
- Caption: "Rich, structured, AI-generated"

CENTER - "The Bridge" (literal bridge graphic)
- Arched bridge connecting left and right sides
- Bridge labeled: "Schema Transformer"
- On the bridge deck, show transformation steps:
  1. "Validate against TRACS schema"
  2. "Map fields to legacy codes"
  3. "Generate compliant output"
- Small gears or cogs indicating processing
- Caption: "Zero data loss. Full compliance."

RIGHT SIDE - "Legacy Systems" (retro styling)
- Two chunky, old-school computer/database icons:

TOP RIGHT - "TRACS" (Trail Assessment)
- Retro terminal aesthetic
- CSV file icon with sample rows:
  ```
  TRAIL_ID,MILE,DAMAGE_CODE,EST_COST,PRIORITY
  PCT-OR-001,47,STR-FAIL,45000,1
  ```
- Label: "Trail Condition Assessment System (1999)"
- Green checkmark: "Import validated"

BOTTOM RIGHT - "FSVeg" (Timber Data)
- Retro terminal aesthetic
- XML file icon with sample tags:
  ```
  <Plot ID="12">
    <Species>PSME</Species>
    <DBH>24.5</DBH>
    <Mortality>HIGH</Mortality>
  </Plot>
  ```
- Label: "Field Sampled Vegetation (FSVeg)"
- Green checkmark: "Schema validated"

BOTTOM SECTION - "Why This Matters"
Three benefit boxes:

BOX 1 - "No Rip and Replace"
- Icon: Dollar sign with down arrow
- "USFS keeps existing systems. RANGER augments, doesn't replace."

BOX 2 - "Audit Compliance"
- Icon: Clipboard with checkmark
- "Exports meet federal data standards. Auditors see familiar formats."

BOX 3 - "Training Continuity"
- Icon: Person with graduation cap
- "Staff use same legacy interfaces. AI benefits without retraining."

FOOTER
"The fastest path to adoption isn't replacing legacy systems—it's making them smarter."
```

---

## Generating New Diagrams

When creating additional diagrams in this series, maintain:

1. **The chalk-on-slate aesthetic** with dark background
2. **Consistent agent iconography** (fire, boot, tree, document)
3. **RANGER's color palette** for severity/status indicators
4. **Clear narrative flow** (left-to-right or top-to-bottom)
5. **Explicit callouts** for key insights
6. **Practical grounding** (show real file names, real data structures)

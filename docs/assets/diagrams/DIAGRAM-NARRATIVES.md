# RANGER Diagram Narratives

Companion narratives for architectural diagrams. Use these as speaker notes, written accompaniment, or developer onboarding material.

---

## 0. Cedar Creek Fire 2022: The Context

**File:** `Cedar Creek Fire 2022.png`

**One-Sentence Summary:** A tactical briefing infographic establishing the scale, timeline, and complexity of the Cedar Creek Fire—the real-world scenario that demonstrates why RANGER's multi-domain coordination is essential.

### The Story This Diagram Tells

This is the opening slide—the "why we're here" moment. Before diving into architecture diagrams and technical flows, stakeholders need to understand the problem RANGER solves. This isn't an abstract use case; it's a real 127,311-acre wildfire that overwhelmed traditional response systems.

The **aerial perspective** immediately establishes scale. Waldo Lake's pristine blue oval serves as a geographic anchor, with mosaic burn patterns (green, amber, red patches) spreading westward toward Oakridge. The pyrocumulonimbus cloud tower rising from the burn zone isn't just dramatic—it's a visual reminder of the fire's intensity and the dangerous conditions that made traditional firefighting impossible.

The **header stats** hit hard: **127,311 ACRES • $58M • 2,000+ EVACUATED**. These aren't just numbers—they represent communities displaced, ecosystems damaged, and a recovery operation that will span years.

The **Oregon locator map** (top right) provides geographic context for non-local audiences, showing Portland and Eugene with the fire location glowing amber in the Cascade Range.

The **timeline strip** (bottom center) tells the explosive growth story that defines this fire:
- **AUG 1**: ¼ acre (lightning strike)
- **SEPT 8**: EAST WINDS (weather event)
- **SEPT 11**: 86,000 acres (**4 DAYS** of explosive growth)
- **NOV 22**: CONTAINED (nearly 4 months total)

This timeline answers the critical question: "Why couldn't they just put it out?" The answer: extreme terrain, dangerous winds, and a fire that grew faster than any response could contain.

The **four assessment domain icons** (bottom, above timeline) introduce RANGER's value proposition:
- 🔥 **BURN SEVERITY** — Understanding damage patterns
- 🥾 **TRAIL DAMAGE** — Assessing infrastructure loss
- 🌲 **TIMBER** — Evaluating salvage economics
- 📋 **NEPA** — Navigating regulatory compliance

These aren't separate projects—they're interconnected domains that must be coordinated for effective recovery.

The **tactical annotations** add critical context:
- **"Level 3 Evacuation - Sept 9"** near Oakridge shows the human impact
- **"Rappellers refused - terrain too hazardous"** near the fire origin explains why even elite firefighters couldn't safely access the area

The **USDA Forest Service shield** (bottom left) and **RANGER AGENTIC OS badge** (bottom right) establish institutional credibility and brand identity.

### Key Talking Points

- **Real-world complexity**: This isn't a hypothetical—it's a documented disaster
- **Scale demands coordination**: 127,000 acres across 4 assessment domains
- **Traditional response failed**: Even elite crews couldn't safely access the terrain
- **Multi-month operation**: 8 incident management teams rotated through
- **Recovery is the challenge**: The fire is contained, but the work is just beginning
- **Why RANGER matters**: "This fire was so complex that recovery requires coordinating 4 different specialist assessments across 127,000 acres of mosaic burn. That's why you need RANGER."

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| Executive briefings | Establishing the problem scale before showing the solution |
| Investor presentations | Demonstrating market need with real-world evidence |
| USFS stakeholders | Grounding the demo in a fire they know intimately |
| Grant applications | Showing the complexity that justifies AI coordination |
| Demo introductions | Setting context before diving into technical capabilities |
| Media/press | Providing visual context for the RANGER story |

---

## 1. [ARCHIVED] How the Pieces Fit Together

**File:** `How the pieces fit together.png`

> **NOTE:** This diagram depicts the Phase 1 vs Phase 2 transition. It is superseded by "ADK Data Flow & SSE Streaming" which depicts the Phase 4 ADK integration.

**One-Sentence Summary:** A developer-focused chalkboard diagram showing the architectural split between Phase 1 (browser-only static demo) and Phase 2 (AI integration), highlighting shared components and the upgrade path.

### The Story This Diagram Tells

This is the "big picture" diagram for developers joining the project. It answers the most common onboarding question: "Wait, so what's actually running where?" The chalkboard aesthetic reinforces that this is a working session, not a polished sales pitch.

The diagram is divided into three main sections that tell a clear evolution story:

**LEFT SECTION - "Phase 1: Static Demo"** shows the current reality. Everything runs in the browser. The `briefing-events.json` fixture file feeds into `mockBriefingService`, which loads and emits events exactly as the real service would. These events flow into the Zustand store via `addEvent`, which triggers React component re-renders. The four UI targets (Panel, Rail Pulse, Modal, Map) all render from the same store state. Three green checkmarks drive the point home: ✓ No server needed, ✓ No network calls, ✓ Just JSON → UI. This is the working demo you can run right now with `npm run dev`.

**CENTER SECTION - "The Bridge"** shows what stays constant between phases. Three shared elements span both sides: `AgentBriefingEvent` (the data contract that both mock and real services emit), Zustand Store (state management that doesn't care where events come from), and React UI Components (the same panels, modals, and maps render in both phases). This is the architectural payoff—we're not building a throwaway prototype. The UI and state management are production-ready.

**RIGHT SECTION - "Phase 2: AI Integration"** shows the future state. The browser now has a `ChatInput` where users ask questions like "What's the burn severity?" A POST to `/api/query` hits a Vercel Edge Function running the Recovery Coordinator. The Coordinator routes the query to Gemini API, which generates reasoning and returns an `AgentBriefingEvent`—the exact same structure Phase 1 uses. That event flows back to the browser, into the same Zustand store, triggering the same UI components. The user sees the same interface, but now it's powered by real AI instead of fixtures.

**BOTTOM SECTION - "Key Files"** provides a file tree showing where the code lives:
```
apps/command-console/
├── src/
│   ├── services/
│   │   ├── mockBriefingService.ts  ← Phase 1
│   │   └── aiBriefingService.ts    ← Phase 2
│   ├── stores/briefingStore.ts     ← Shared
│   └── components/                 ← Shared
└── api/query.ts                    ← Phase 2
```

**CORNER ANNOTATIONS** add informal chalk notes that answer common questions:
- "WebSocket = Phase 2+ only" (clarifies that Phase 1 doesn't need it)
- "Gemini = only external API" (no complex integrations)
- "Fixtures = simulated satellite/trail data" (explains what the JSON represents)
- "Same UI, different data source" (reinforces the architectural continuity)

### Key Talking Points

- **Phase 1 is real work, not a mockup:** The UI, state management, and rendering pipeline are production-ready
- **Shared data contract:** `AgentBriefingEvent` is the bridge—both phases emit the same structure
- **Clean separation of concerns:** Swap `mockBriefingService` for `aiBriefingService`, everything else stays the same
- **No wasted effort:** Every component built in Phase 1 ships in Phase 2
- **Developer-friendly:** The file tree shows exactly where to look for each piece
- **Vercel Edge Functions:** Phase 2 backend is serverless, not a complex deployment

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| New developers | First diagram in onboarding—establishes mental model |
| Technical reviewers | Shows architectural maturity and upgrade path |
| Project managers | Clarifies Phase 1 vs Phase 2 scope and deliverables |
| Stakeholders | Demonstrates that Phase 1 isn't throwaway work |
| Yourself (6 months later) | Reminds you why you architected it this way |

---

## 2. AgentBriefingEvent Rendering Pipeline


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

## 2. [ARCHIVED] Recovery Coordinator: Query Routing & Agent Cascade

**File:** `Coordinator Routing & Cross-Agent Cascade.png`

> **NOTE:** This diagram depicts microservice routing. Superseded by "The Coordinator's Skill Roster" which depicts Skills-First delegation.

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

## 3. [ARCHIVED] Phase 1 Architecture Boundaries

**File:** `Phase 1 Architecture Boundaries.png`

> **NOTE:** Superseded by "The MCP Abstraction Layer" which reframes the simulated vs. real boundary around the MCP standard.

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

## 4. The Cedar Creek Recovery Chain (Persona Cascade)

**File:** `The Cedar Creek Recovery Chain (Persona Cascade).png`

**One-Sentence Summary:** Shows how four real USFS personas—Sarah, Marcus, Elena, and Dr. Park—trigger each other through RANGER, demonstrating the human value of cross-agent coordination.

### The Story This Diagram Tells

This is the "why should I care?" diagram. While other diagrams explain technical architecture, this one puts human faces on the value proposition. It answers the question every USFS stakeholder will ask: "How does this help my people?"

The circular flow tells a story of **coordinated recovery**:

**Sarah Chen (Fire Management Officer)** starts the chain. Her question—"Where are the high-severity burn zones?"—triggers the Burn Analyst. When she identifies Sector 4 as high severity with erosion risk, that insight doesn't die in her inbox. It automatically triggers trail priority for Marcus.

**Marcus Rodriguez (Recreation Technician)** receives Sarah's insight in context. His question—"Which trails need closure?"—is now informed by burn severity data. When he discovers the bridge washout at PCT Mile 47, that information flows to Elena, informing access routes for her timber work.

**Elena Vasquez (Timber Cruiser)** asks "What's the salvage potential?" But she's not working blind—she knows which access routes are compromised. When she identifies Unit 12 near a historic trail, that triggers a compliance check with Dr. Park.

**Dr. James Park (Environmental Coordinator)** closes the loop. His question—"Are we compliant?"—synthesizes inputs from all three colleagues. When he identifies a Section 106 buffer requirement, that refinement feeds back into the overall recovery scope, informing Sarah's next iteration.

The **center correlation_id** (`cedar-creek-recovery-001`) ties it all together. This isn't four separate conversations—it's one coordinated recovery operation with shared context.

The **footer contrast** drives the point home: "Before RANGER: 4 silos, 4 separate workflows, information lost in email. With RANGER: 1 coordinated recovery, automatic handoffs, nothing falls through cracks."

### Key Talking Points

- **Human-first framing:** Real job titles (FMO, Rec Tech, Cruiser, NEPA) that USFS staff recognize
- **Circular, not linear:** Recovery is iterative—Dr. Park's findings feed back to Sarah
- **Automatic handoffs:** Insights flow without manual email forwarding
- **Shared context:** The correlation_id means everyone sees the same picture
- **Real work products:** Each persona has a visible output (map, damage list, plot data, EA checklist)

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| USFS leadership | Showing how their teams work better together |
| Field staff | Demonstrating relevance to their actual workflows |
| Partner organizations | Explaining the collaboration value |
| Non-technical stakeholders | Making orchestration tangible through people |

---

## 5. The Confidence Ledger (Trust Architecture)

**File:** `The Confidence Ledger (Trust Architecture).png`

**One-Sentence Summary:** Deep-dives into how RANGER builds trust through the "Three Pillars of Proof"—confidence scores, citation chains, and reasoning transparency—plus a complete audit trail.

### The Story This Diagram Tells

This is the "can we trust AI?" diagram. It directly confronts the biggest objection to AI in government: accountability. The visual contrast between "Black Box AI" (crossed out, captioned "Trust me, bro") and "RANGER Briefing" (green checkmark, captioned "Here's my evidence") sets the stakes immediately.

**The Trust Problem** at the top establishes the contrast. A generic chatbot says "The bridge is damaged" with no source, no confidence, no reasoning. RANGER's Trail Assessor says "Bridge at Mile 47 shows structural failure" backed by three visible proof elements.

**The Three Pillars of Proof** form the core of the diagram:

1. **Confidence Score** — Not a vague "high/medium/low" label, but an actual probability (0.87 / 87%). The gauge visualization with red-amber-green zones makes the score immediately interpretable. Below the gauge, we show what drives the score: source data quality (0.92), model certainty (0.84), and cross-validation (0.85). This isn't a black box—users can see *why* the system is confident.

2. **Citation Chain** — Every claim is traceable to source. The three citation chips (TRACS Report #4521, Mobile Video Frame 00:42, FSM 2353.03) each link to verifiable artifacts. "Click to verify" isn't a slogan—it's a feature. Auditors can follow the trail from AI insight back to original evidence.

3. **Reasoning Chain** — The numbered steps (1-4) show exactly how the AI reached its conclusion. From "Video frame shows visible crack" to "Recommend immediate closure," every logical step is visible. This is "step-by-step logic, not magic."

**The Audit Trail** at the bottom shows the complete lifecycle: event emitted with timestamp, source agent identified, confidence recorded, user acknowledgment logged, action taken documented. The "Immutable Event Log" database icon reinforces that this history cannot be altered after the fact.

**The footer** is the closer: "Government-grade AI requires government-grade accountability. RANGER's Confidence Ledger makes every insight defensible."

### Key Talking Points

- **Contrast is the message:** "Trust me, bro" vs. "Here's my evidence"
- **Quantified confidence:** Real probabilities, not fuzzy categories
- **Clickable citations:** Every claim traceable to source documents
- **Visible reasoning:** Step-by-step logic chain, not opaque inference
- **Complete audit trail:** Timestamped, immutable, legally defensible
- **Government-grade:** Designed for procurement scrutiny and compliance review

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| Procurement officers | Answering "how do we trust AI outputs?" |
| Legal/compliance teams | Demonstrating auditability and accountability |
| Risk managers | Showing how AI decisions become defensible |
| Technical evaluators | Understanding the anti-hallucination architecture |
| Skeptics | Converting "AI can't be trusted" to "this AI can" |

---

## 6. The Legacy Bridge (TRACS & FSVeg Export)

**File:** `The Legacy Bridge (TRACS & FSVeg Export).png`

**One-Sentence Summary:** Shows how modern AI insights transform into legacy-compatible formats (TRACS CSV, FSVeg XML) that existing USFS systems can import without modification.

### The Story This Diagram Tells

This is the "do we have to replace our systems?" diagram. It answers with a emphatic visual NO. The literal bridge connecting sleek modern RANGER to chunky retro terminals tells the story instantly: we're building a connection, not demanding a replacement.

**Modern RANGER (Left Side)** shows what the AI produces: a rich, structured briefing from the Trail Assessor Agent. The insight is human-readable ("Bridge at Mile 47: Structural failure detected. Estimated repair: $45,000. Priority: Critical.") but also machine-readable (JSON with damage_type, location, repair_estimate_usd, priority fields). This is "Rich, structured, AI-generated."

**The Bridge (Center)** is a literal architectural bridge graphic, labeled "Schema Transformer." On the bridge deck, three transformation steps are visible:
1. Validate against TRACS schema
2. Map fields to legacy codes
3. Generate compliant output

The gears indicate this is automated engineering, not manual transcription. The caption states the promise: "Zero data loss. Full compliance."

**Legacy Systems (Right Side)** shows two actual USFS systems with deliberately retro styling:

- **TRACS** (Trail Condition Assessment System, 1999) receives a CSV file with the exact column headers their system expects: TRAIL_ID, MILE, DAMAGE_CODE, EST_COST, PRIORITY. Green checkmark: "Import validated."

- **FSVeg** (Field Sampled Vegetation) receives an XML file with proper tags: Plot ID, Species (PSME for Douglas Fir), DBH, Mortality. Green checkmark: "Schema validated."

**Why This Matters (Bottom)** hits the three adoption objections:

1. **No Rip and Replace** — "USFS keeps existing systems. RANGER augments, doesn't replace." This addresses budget concerns—no multi-million dollar system replacement.

2. **Audit Compliance** — "Exports meet federal data standards. Auditors see familiar formats." This addresses regulatory concerns—the output looks exactly like what they've always produced.

3. **Training Continuity** — "Staff use same legacy interfaces. AI benefits without retraining." This addresses change management—nobody needs to learn a new system to get AI benefits.

**The footer** closes the sale: "The fastest path to adoption isn't replacing legacy systems—it's making them smarter."

### Key Talking Points

- **Visual contrast:** Sleek modern vs. retro chunky establishes the gap being bridged
- **Real formats:** Actual TRACS CSV and FSVeg XML structure, not abstractions
- **Automated transformation:** Schema Transformer handles the translation
- **Zero friction adoption:** Staff upload files to the same systems they always have
- **Augmentation, not replacement:** AI enhances existing workflows, doesn't disrupt them
- **The upgrade path message:** "Making them smarter" is more compelling than "replacing them"

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| IT decision-makers | Proving no system replacement is required |
| Budget approvers | Showing cost-effective augmentation strategy |
| Change management teams | Demonstrating minimal training requirements |
| Legacy system owners | Assuring them their systems remain relevant |
| Procurement officers | Answering "what's the integration story?" |

---

## 7. [ARCHIVED] Agentic AI Architecture: Body vs. Brain

**File:** `Agentic AI Architecture.png`

> **NOTE:** Depicts Python Agent Services. Superseded by "The Skills-First Architecture" using Google ADK.

**One-Sentence Summary:** Illustrates the "Body vs. Brain" development workflow, showing how local containers (Body) act as the interface for remote Gemini intelligence (Brain).

### The Story This Diagram Tells

This diagram resolves the primary confusion about "where the AI lives" in a local development environment. It clearly distinguishes the physical infrastructure (Body) from the cognitive processing (Brain), helping new developers understand why they don't need GPUs to run RANGER locally.

**The Body (Localhost)** represents the physical "muscle" of the system. The React app acts as the **Senses**, capturing user intent (clicks, questions). The API Gateway acts as the **Nerves**, routing these signals to the correct destination. The Python Agent Services are the **Muscles**, executing the code that structures inputs and formats outputs.

**The Brain (Cloud)** represents the remote intelligence. The Gemini API is where the actual "thinking" occurs. The diagram emphasizes that our local code is essentially a "prompt engineering engine" that packages context for the remote brain.

**The Flow (The Leap)** traces a single interaction:
1.  **Click:** User intent captured
2.  **Route:** Signal dispatched to specialist
3.  **Prompt:** Context packaged into natural language
4.  **Thought:** Remote reasoning (The Leap)
5.  **Insight:** Structured response returned

### Key Talking Points

-   **"Local code is the body; Cloud is the brain."**
-   **No local GPU required:** We are orchestrating text, not computing tensors.
-   **The "Leap":** Intelligence is a network call. Latency lives in the round trip.
-   **Security boundary:** We control exactly what context is sent to the brain (no sensitive PII unless explicitly passed).

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| New Developers | Explaining the local dev environment setup |
| Security/Compliance | Showing exactly where data leaves the local boundary |
| Architecture Reviews | Visualizing the dependency on external model inference |

---

---

## 8. [ARCHIVED] Local Developer Stack

**File:** `Local Developer Stack.png`

> **NOTE:** Depicts deprecated microservice ports (8001-8004). Superseded by "Phase 4 ADK Developer Stack".

**One-Sentence Summary:** A comprehensive developer reference showing all services, ports, fixture data, and production system mappings for the complete RANGER local development environment.

### The Story This Diagram Tells

This is the "what's running where" diagram—the first thing a new developer needs to understand before they can be productive. It answers the questions that arise when you're staring at five terminal windows wondering which service is on which port.

The diagram is organized into **three horizontal tiers** that mirror the actual architecture:

**USER INTERFACE LAYER (Top)**: The Command Console at `localhost:3000` is where users interact with RANGER. The browser shows the four workflow phases (Impact, Damage, Timber, Compliance), the 3D map with burn severity polygons, and the chat panel. Tech stack callouts (React + Vite + Tailwind + Zustand) help developers understand what they're working with.

**ORCHESTRATION LAYER (Middle)**: Two hexagons dominate this tier—the API Gateway at `localhost:8000` (FastAPI) and the Recovery Coordinator at `localhost:8005` (ADK Orchestrator). The Gateway routes queries and streams AgentBriefingEvents. The Coordinator parses intent, routes to specialists, and synthesizes cross-agent results.

**SPECIALIST AGENTS LAYER (Bottom)**: Four agent boxes show the domain specialists, each with their port, icon, folder path, and key tools:
- 🔥 Burn Analyst (`:8001`) - query_burn_severity(), calculate_severity_stats()
- 🥾 Trail Assessor (`:8002`) - query_trail_damage(), generate_work_order()
- 🌲 Cruising Assistant (`:8003`) - query_timber_plots(), calculate_board_feet()
- 📋 NEPA Advisor (`:8004`) - search_regulations(), identify_nepa_pathway()

**FIXTURE DATA LAYER (Left Sidebar)**: This is crucial for domain understanding. The `data/fixtures/cedar-creek/` folder contains the four fixture files with JSON samples showing actual data structures:
- `burn-severity.json` - 8 sectors with severity classes and dNBR values
- `trail-damage.json` - 16 damage points across 5 trails
- `timber-plots.json` - 6 cruise plots with tree-level data
- `briefing-events.json` - Pre-composed agent cascade

**PRODUCTION SYSTEM MAPPING (Bottom or Right)**: This connects fixtures to the real-world systems they simulate:
- burn-severity.json → **MTBS**, **RAVG**, **Sentinel-2**, **Landsat**
- trail-damage.json → **TRACS**, **Survey123**, **ArcGIS Field Maps**
- timber-plots.json → **FSVeg**, **FACTS**, **Common Stand Exam**

The **numbered flow arrows** (①-⑥) trace a complete request lifecycle, showing exactly how a user question becomes an AI-powered briefing.

### Key Talking Points

- **Port reference**: 3000 (UI), 8000 (Gateway), 8001-8004 (Specialists), 8005 (Coordinator)
- **Fixture data is real schemas**: JSON structures match federal data standards
- **Production system mapping**: Developers understand what real systems they're simulating
- **Single external dependency**: Only Gemini API leaves localhost
- **Phase-agnostic interfaces**: Same tool signatures for fixtures and real APIs

### When to Use This Diagram

| Audience | Purpose |
|----------|---------|
| New developers | First diagram during onboarding—answers "what's running where?" |
| Demo presenters | Explaining the technical architecture before showing the UI |
| Technical reviewers | Understanding the complete system topology |
| Yourself (debugging) | Quick reference for which port to check when something breaks |

---

## Visual Design Notes

All diagrams share a consistent aesthetic:

- **Chalk-on-slate style:** Dark background (#0F172A-ish) with hand-drawn white lines
- **Color coding:** Matches RANGER's severity palette (green=safe, orange=warning, red=critical)
- **Agent icons:** Fire (Burn Analyst), Boot (Trail Assessor), Tree (Cruising Assistant), Document (NEPA Advisor)
- **Flow direction:** Generally left-to-right or top-to-bottom for narrative clarity
- **Annotations:** Handwritten-style callouts for key insights

This "tactical whiteboard" aesthetic reinforces RANGER's identity as an operational tool, not a polished consumer app. It suggests active planning, real-time decision-making, and field-ready pragmatism.

---

## Generation Prompts

The prompts used to generate each diagram are preserved here for reproducibility and future iterations.

### Prompt 0: Cedar Creek Fire 2022

```
Tactical briefing infographic, dark slate chalkboard style, dramatic aerial
perspective of Oregon's Cascade Range wildfire scene.

Central composition: Bird's-eye view of Waldo Lake (distinctive pristine blue
oval) with mosaic burn severity patterns (patches of green, amber, red showing
varied damage) spreading westward toward Oakridge. Massive pyrocumulonimbus
cloud tower rising. Retardant planes and helicopter with water bucket.
Topographic contour lines visible.

Top header: "CEDAR CREEK FIRE • WILLAMETTE NATIONAL FOREST • 2022"

Key stats (top left): "127,311 ACRES • $58M • 2,000+ EVACUATED"

Oregon locator map (top right corner): State silhouette with Portland, Eugene
marked, fire location glowing amber.

CRITICAL ADDITION - Timeline strip (bottom center):
"AUG 1: ¼ acre → SEPT 8: EAST WINDS → SEPT 11: 86,000 acres (4 DAYS) → NOV 22:
CONTAINED"

CRITICAL ADDITION - Four assessment domain icons (bottom, above timeline):
🔥 BURN SEVERITY | 🥾 TRAIL DAMAGE | 🌲 TIMBER | 📋 NEPA

Bottom corners: USDA Forest Service shield (left), RANGER AGENTIC OS badge
(right)

Small annotation near Oakridge: "Level 3 Evacuation - Sept 9"
Small annotation near fire origin: "Rappellers refused - terrain too hazardous"

Style: Dark tactical military briefing aesthetic, chalk and graphite textures,
burnt orange and amber fire tones, cool blue lake contrast, cream annotations.
Emergency operations center mood. Illustrated tactical map, not photorealistic.

--ar 16:9

---
This version tells the story: "This fire was so complex and dangerous that even 
elite firefighters couldn't safely access it, 8 teams rotated through, and the 
recovery requires coordinating 4 different specialist assessments across 127,000
acres of mosaic burn. That's why you need RANGER."
```

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

### Prompt 7: Agentic AI Architecture

```text
A highly detailed, wide-format technical chalkboard diagram drawn on a deep textured slate wall. The diagram is titled "AGENTIC AI ARCHITECTURE: BODY vs BRAIN" in bold architectural lettering.
```

### Prompt 8: RANGER Local Development Stack

```text
Create a technical whiteboard diagram titled "RANGER Local Development Stack: The Complete Picture"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A). White chalk lines and handwritten-style labels. Use accent colors sparingly: emerald green (#10B981) for active/running, amber (#F59E0B) for data flow arrows, cyan (#06B6D4) for external services. Hand-drawn boxes with slight imperfection. Terminal/console aesthetic for port labels. Da Vinci engineering sketch feel.

Layout (three horizontal tiers with data callout):

=== TOP TIER - "User Interface Layer" ===

LEFT: Browser window mockup labeled "Command Console"
- URL bar showing: "localhost:5173" (Vite dev server)
- Inside browser: simplified UI showing sidebar with 4 phases (Impact, Damage, Timber, Compliance), map area with colored polygons, chat panel
- Port badge: glowing "5173" in green
- Tech stack note: "React + Vite + Tailwind + Zustand"
- Folder path: "apps/command-console/"
- Small note: "(Production build: :3000)"

RIGHT (smaller): Mobile device outline labeled "Field Companion"
- Note: "(PWA - Phase 2 • scaffold exists)"
- Grayed out slightly to show it's future

Arrow down from Command Console labeled "REST / WebSocket → AgentBriefingEvents"

=== MIDDLE TIER - "Orchestration Layer" ===

CENTER-LEFT: Large hexagon labeled "API Gateway"
- Port badge: "8000"
- Inside hexagon: "FastAPI Router"
- Folder path: "services/api-gateway/"
- Sub-notes: "• Routes queries", "• Streams events", "• CORS handling"

Arrow from API Gateway splitting into 5 paths going down

CENTER-RIGHT: Large hexagon labeled "Recovery Coordinator"
- Port badge: "8005"
- Brain/conductor icon
- "ADK Orchestrator"
- Folder path: "services/agents/recovery-coordinator/"
- Sub-notes: "• Intent parsing", "• Agent routing", "• Cross-agent synthesis"

Bidirectional arrows between API Gateway and Recovery Coordinator

=== BOTTOM TIER - "Specialist Agents Layer" ===

Four agent boxes arranged horizontally, each with consistent structure:

BOX 1 - "Burn Analyst" 🔥
- Port badge: "8001"
- Color tint: orange/red
- Folder: "services/agents/burn-analyst/"
- Tools listed:
  • query_burn_severity()
  • calculate_severity_stats()
- Data badge: "8 sectors, dNBR values"

BOX 2 - "Trail Assessor" 🥾
- Port badge: "8002"
- Color tint: blue
- Folder: "services/agents/trail-assessor/"
- Tools listed:
  • query_trail_damage()
  • generate_work_order()
- Data badge: "5 trails, 16 damage points"

BOX 3 - "Cruising Assistant" 🌲
- Port badge: "8003"
- Color tint: green
- Folder: "services/agents/cruising-assistant/"
- Tools listed:
  • query_timber_plots()
  • calculate_board_feet()
- Data badge: "6 plots, 32 trees"

BOX 4 - "NEPA Advisor" 📋
- Port badge: "8004"
- Color tint: purple
- Folder: "services/agents/nepa-advisor/"
- Tools listed:
  • search_regulations()
  • identify_nepa_pathway()
- Data badge: "File Search RAG (production-ready)"

=== LEFT SIDEBAR - "Fixture Data Layer (Cedar Creek Fire)" ===

Large folder icon: "data/fixtures/cedar-creek/"

Four file cards stacked vertically with sample data snippets:

FILE 1: "burn-severity.json"
- Icon: fire severity map
- Sample: { "sector": "SW-1", "severity": "HIGH", "acres": 21500, "dnbr_mean": 0.76 }
- Note: "8 burn sectors with GeoJSON polygons"

FILE 2: "trail-damage.json"
- Icon: trail marker
- Sample: { "damage_id": "WL-001", "type": "BRIDGE_FAILURE", "estimated_cost": 85000 }
- Note: "16 damage points across 5 trails"

FILE 3: "timber-plots.json"
- Icon: tree/sawlog
- Sample: { "plot_id": "52-FOXTROT", "species": "PSME", "dbh": 36.8, "salvage_value": 1045 }
- Note: "6 cruise plots, FSVeg format"

FILE 4: "briefing-events.json"
- Icon: message/event
- Sample: { "source_agent": "burn_analyst", "confidence": 0.92, "severity": "critical" }
- Note: "Pre-composed agent cascade"

Arrows from fixture files pointing to corresponding agent boxes
Label: "Phase 1: Static JSON Fixtures"

=== RIGHT SIDEBAR - "External Services" ===

Cloud icon labeled "Gemini API"
- "Vertex AI"
- "gemini-3-flash" (78% SWE-bench • 3x faster)
- Dashed line connecting to all agent boxes
- Label on line: "LLM Reasoning (only external call)"

Small badge: "FedRAMP High"

=== BOTTOM SECTION - "Production System Mapping" ===

Title: "Phase 1 Fixtures → Phase 2 Production Systems"

Four-row mapping with visual connectors:

┌─────────────────────────┬──────────────────────────────────────────────┐
│ FIXTURE FILE            │ PRODUCTION SYSTEM IT REPLICATES              │
├─────────────────────────┼──────────────────────────────────────────────┤
│ burn-severity.json      │ MTBS, RAVG, Sentinel-2, Landsat              │
├─────────────────────────┼──────────────────────────────────────────────┤
│ trail-damage.json       │ TRACS, Survey123, ArcGIS Field Maps          │
├─────────────────────────┼──────────────────────────────────────────────┤
│ timber-plots.json       │ FSVeg, FACTS, Common Stand Exam              │
├─────────────────────────┼──────────────────────────────────────────────┤
│ nepa-advisor (no file)  │ File Search Tool → Indexed FSM/FSH PDFs      │
└─────────────────────────┴──────────────────────────────────────────────┘

Annotation: "Fixture schemas align with federal data standards. Export to TRACS CSV and FSVeg XML already works."

=== BOTTOM BANNER - "Developer Quick Reference" ===

Terminal-style box with commands:

┌──────────────────────────────────────────────────────────────┐
│ # Start everything with Docker                                │
│ docker-compose up -d                                          │
│                                                               │
│ # Or run individually:                                        │
│ cd apps/command-console && pnpm dev          → localhost:5173 │
│ cd services/api-gateway && uvicorn app.main:app --reload      │
│                                              → localhost:8000 │
│ cd services/agents/burn-analyst && python -m burn_analyst.main│
│                                              → localhost:8001 │
└──────────────────────────────────────────────────────────────┘

=== FLOW ARROWS (numbered request lifecycle) ===

Show the complete request flow with numbered steps in amber/yellow:

① User asks: "What's the burn severity?" (Chat input at :5173)
② POST /api/query hits API Gateway (:8000)
③ Gateway forwards to Recovery Coordinator (:8005)
④ Coordinator routes to Burn Analyst (:8001)
⑤ Agent loads burn-severity.json + calls Gemini 3.0 Flash for reasoning
⑥ AgentBriefingEvent with confidence scores streams back to UI

=== CORNER ANNOTATIONS (handwritten chalk style) ===

Top-left: "Cedar Creek Fire: 127,341 acres • Willamette NF • 2022"
Top-right: "All AI reasoning is REAL • Only data is simulated"
Bottom-left: "Same tool interfaces for Phase 1 (fixtures) and Phase 2 (APIs)"
Bottom-right: "Pure Google ADK • FedRAMP compliant path"

=== KEY INSIGHT CALLOUT BOX ===

Positioned prominently, chalk-outlined box:
"🎯 THE ARCHITECTURE PRINCIPLE:
Agents call tools → Tools return ToolResult
Phase 1: Tools load JSON fixtures
Phase 2: Tools call real APIs
Agent code NEVER changes"

The diagram should answer: "What's running where, what data feeds it, and how do requests flow through the system?"

--ar 16:9
```

### Original Prompt 7: Agentic AI Architecture (continued)

The drawing is a software schematic divided into two clear zones:

1. Bottom-Left Zone labeled "THE BODY (Localhost)": Intricate white chalk schematics of a computer running Docker containers. Labeled components: a React UI icon labeled "Senses", a Router icon labeled "Nerves (Gateway)", and Python logo gears labeled "Muscles (Agents)".
2. Top-Right Zone labeled "THE BRAIN (Cloud)": A stylized, detailed neural network cloud drawing. Label: "Gemini 2.0 API".
3. Flow: A large, dramatic arched arrow connecting the two zones labeled "THE LEAP". Small chalk arrows show the cycle: "Click" → "Route" → "Prompt" → "Thought" → "Insight".

Style: Da Vinci engineering sketch, clean white chalk lines with yellow chalk accents for emphasis, precise technical drawing, photorealistic 8k, educational infographic. --ar 16:9 --v 6.0
```

---

## 9. The Skills-First Architecture

**File:** `The Skills-First Architecture.png` (Planned)

**One-Sentence Summary:** Visualizes the Phase 4 architecture where a single ADK Runtime acts as the "Brain," loaded with a library of portable Skills (Tools) and connecting to Data via MCP.

### The Story This Diagram Tells

This diagram represents the major architectural pivot to **Skills-First**. We are no longer building separate microservices for every agent. Instead, we have a unified **ADK Runtime** (powered by Gemini) that dynamically loads **Skills** from a shared library.

The **Command Console (React)** is the "Body" (UI/Input).
The **ADK Runtime** is the "Brain" (Orchestration/Reasoning).
The **MCP Servers** are the "Senses" (Data Access).

It emphasizes that "Agents" are just configurations of "Skills."

### Generation Prompt

```
Create a technical whiteboard diagram titled "The Skills-First Architecture: Modular Intelligence"

Style: Clean engineering whiteboard aesthetic. Dark slate blue background (#0F172A).

Layout: Central Hub and Spoke.

CENTER - "ADK Runtime (The Brain)"
Large Hexagon.
Label: "Google ADK Runtime"
Subtitle: "Gemini 2.0 Flash"
Contains small icons for: "Context Management", "Tool Execution", "Reasoning"

LEFT - "Skill Library (The Tools)"
A vertical stack of "Skill Cards" plugging into the Runtime.
Cards labeled:
- "Portfolio Triage"
- "Soil Burn Analysis"
- "NEPA Guidance"
- "Timber Cruising"
Arrow pointing INTO the Runtime: "Dynamic Skill Loading"

RIGHT - "MCP Data Layer (The Senses)"
Two boxes representing MCP Servers.
1. "MCP Fixtures" (connected to JSON files)
2. "MCP External" (connected to Cloud/APIs)
Double-sided arrows connecting Runtime to MCPs.

TOP - "Command Console (The Body)"
React/Browser UI frame.
Arrow pointing DOWN to Runtime: "User Intent (SSE)"
Arrow pointing UP from Runtime: "Streaming Briefing"

BOTTOM - "Agent Personas"
Small badges showing "Virtual" agents that emerge from skill combos:
- Coordinator
- Burn Analyst
- Trail Assessor
Caption: "Agents are just bundles of Skills"
```

---

## 10. Phase 4 ADK Developer Stack

**File:** `Phase 4 ADK Developer Stack.png` (Planned)

**One-Sentence Summary:** The correct, current map of the development environment, highlighting the simplified port structure and the role of the MCP Fixtures server.

### The Story This Diagram Tells

The "Local Developer Stack" diagram was cluttered with 5 different backend ports. Phase 4 simplifies this.
There are now only **three** key processes a developer cares about:
1.  **Port 3000**: The React UI.
2.  **Port 8000**: The ADK Orchestrator (The main Python process).
3.  **Port 8080**: The MCP Fixtures Server (Serving the data).

This diagram gives developers the mental map of "Where do I look?"

### Generation Prompt

```
Create a technical whiteboard diagram titled "Phase 4 Developer Environment"

Style: Tactical whiteboard. Dark background.

Layout: Three horizontal tiers.

TOP TIER - "Frontend (Client)"
Large Box: "Command Console"
URL: "http://localhost:3000"
Tech: React + Vite + useADKStream
Content: 3D Map, Chat, Sidebar

MIDDLE TIER - "Orchestration (Server)"
Large Box: "ADK Runtime"
URL: "http://localhost:8000"
Tech: Python + Google ADK + Gemini API
Note: "Single Entry Point for All Agents"

BOTTOM TIER - "Data Services (Sources)"
Box 1: "MCP Fixtures Server"
URL: "http://localhost:8080"
Content: Serves `burn-severity.json`, `trail-damage.json`
Box 2: "Session Store"
Tech: InMemory / Redis

ARROWS:
1. Frontend -> ADK (SSE Connection) "Stream Events"
2. ADK -> MCP Fixtures "Tool Calls"
3. ADK -> Internet "Gemini API"
```

---

## 11. ADK Data Flow & SSE Streaming

**File:** `ADK Data Flow & SSE Streaming.png` (Planned)

**One-Sentence Summary:** A detailed sequence flow showing how a user's question transforms into a streaming React update via Server-Sent Events (SSE).

### The Story This Diagram Tells

This replaces "How pieces fit together" by focusing on the **Streaming** mechanism. RANGER represents a move away from "Request/Response" to "Continuous Streaming."
The user asks a question -> The ADK thinks (generating reasoning events) -> The ADK acts (calling tools) -> The ADK speaks (final answer).
All of this happens over a single long-lived SSE connection.

### Generation Prompt

```
Create a detailed sequence flow diagram titled "The Pulse: ADK Event Streaming"

Style: Engineering flow chart. Dark background.

Swimlanes:
1. User (React)
2. ADK (Python)
3. Gemini (LLM)
4. MCP (Data)

Steps (Top to Bottom):
1. User: "Analyze Sector 4" -> ADK
2. ADK -> Gemini: "Prompt + Context"
3. Gemini -> ADK: "Reasoning: checking severity..."
4. ADK -> User (SSE): "Event: reasoning_trace" (UI shows thinking spinner)
5. Gemini -> ADK: "Call: get_burn_severity(4)"
6. ADK -> MCP: "get_burn_severity(4)"
7. MCP -> ADK: "Result: {severity: high}"
8. ADK -> Gemini: "Tool Result"
9. Gemini -> ADK: "Final Answer: Sector 4 is critical..."
10. ADK -> User (SSE): "Event: agent_briefing" (UI renders card)
```

---

## 12. The MCP Abstraction Layer

**File:** `The MCP Abstraction Layer.png` (Planned)

**One-Sentence Summary:** Explains how the Model Context Protocol (MCP) acts as the universal adapter, allowing RANGER to switch between "Simulation Mode" (Phase 1) and "Mission Mode" (Phase 2+) without changing agent code.

### The Story This Diagram Tells

This is the evolution of "Phase 1 Boundaries." It's not just about "Mock vs Real" anymore; it's about **Portability**.
The Agents utilize standard tools like `get_burn_severity`.
The **MCP Layer** decides how to fulfill that.
-   **Config A (Dev):** MCP Fixtures Server reads a local JSON file.
-   **Config B (Prod):** MCP Geo Server queries the Google Earth Engine API.
The Agent *doesn't know the difference*. This is the power of the architecture.

### Generation Prompt

```
Create a concept diagram titled "The Universal Adapter: MCP"

Style: System architecture. Dark background.

Left Side: "The Agents (Consumers)"
Icons for Burn Analyst, Trail Assessor.
Arrow output: `tool_call: get_burn_severity()`

Center: "MCP Router"
Visual: A switchboard or patch bay.
Label: "Model Context Protocol"

Right Side: "The Sources (Providers)"
Split into Top and Bottom.

Top (Active): "Fixtures (Dev)"
Icon: JSON File
Connection: Live wire to MCP

Bottom (Future): "Real World (Prod)"
Icon: Satellite/Cloud
Connection: Dotted wire (Switchable)

Bottom Caption: "Agents ask 'What'. MCP decides 'How'."
```

---

## 13. The Coordinator's Skill Roster

**File:** `The Coordinator's Skill Roster.png` (Planned)

**One-Sentence Summary:** A roster view showing the Coordinator Agent and its available skills, replacing the old microservice routing view.

### The Story This Diagram Tells

This replaces "Recovery Coordinator: Query Routing" to reflect the **Skills-First** approach.
The Coordinator doesn't just "route" blindly; complete delegation happens, but the *capabilities* are defined by the Skills attached to the agent.
This diagram helps developers understand the structure of the `agents/` and `skills/` directories visually.

### Generation Prompt

```
Create a roster diagram titled "The Coordinator's Skill Roster"

Style: Team roster / Card game style. Dark background.

Top Card: "Recovery Coordinator"
- Role: "Orchestrator"
- Key Skill: "Portfolio Triage", "Delegation"
- Icon: Conductor/Brain

Branching Down to 4 Specialist Cards (The Virtual Team):

1. "Burn Analyst"
   - Skill Bundle: Soil Burn Analysis, MTBS Classification, Boundary Mapping
   - Icon: Fire

2. "Trail Assessor"
   - Skill Bundle: Damage Classification, Closure Decision
   - Icon: Boot

3. "Cruising Assistant"
   - Skill Bundle: Volume Estimation, Salvage Assessment
   - Icon: Tree

4. "NEPA Advisor"
   - Skill Bundle: Pathway Decision, Compliance Timeline
   - Icon: Document

Visual: Thread connecting Coordinator to each Specialist, labeled "Delegation".
Caption: "Specialized Intelligence, Centralized Orchestration"
```


# Developer Diagram Prompts (v2.0)

> **Updated:** December 28, 2025  
> **Aligned With:** ADR-007.1 Three-Layer Tool Invocation Strategy  
> **Master Reference:** [_RANGER-DIAGRAM-PROMPTS-v2.md](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md)

**Purpose:** Technical documentation for the engineering team.  
**Audience:** Developers, Architects, Technical Reviewers.  
**Aesthetic:** Tactical Whiteboard (Dark slate blue #0F172A).

---

## 🆕 What's New in v2.0

| Change | Rationale |
|--------|-----------|
| Added **Three-Layer Enforcement** | Core ADR-007.1 architecture diagram |
| **ADK Runtime** shows validation wrapper | Accuracy with current implementation |
| **SSE Streaming** includes retry logic | Reflects actual event lifecycle |
| **Proof Layer** now has 4 components | Validation as trust pillar |
| Added **audit trail** annotations | Federal compliance visibility |

---

## Diagram Index

| # | Diagram | File | Priority | Status |
|---|---------|------|----------|--------|
| 0 | Three-Layer Enforcement | `three-layer-enforcement.png` | P0 | 🆕 NEW |
| 1 | ADK Runtime & Skills | `adk-runtime-skills.png` | P0 | ✏️ Updated |
| 2 | SSE Streaming Flow | `sse-streaming-flow.png` | P0 | ✏️ Updated |
| 3 | MCP Data Layer | `mcp-data-layer.png` | P0 | ✏️ Updated |
| 4 | Developer Port Map | `developer-port-map.png` | P0 | ✏️ Updated |
| 5 | AgentBriefingEvent Schema | `agent-briefing-event.png` | P1 | ✏️ Updated |
| 6 | Skill Anatomy | `skill-anatomy.png` | P1 | ✅ Unchanged |
| 7 | Proof Layer Rendering | `proof-layer-rendering.png` | P1 | ✏️ Updated |

---

## Quick Reference Prompts

For complete, detailed prompts, see the [master prompts file](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md#track-1-developer-diagrams).

Below are condensed versions for quick generation:

---

### 0. Three-Layer Enforcement (NEW - P0)

**File:** `three-layer-enforcement.png`  
**Question It Answers:** "How does RANGER guarantee tools are called? How is this auditable?"

```
Technical architecture diagram: "Three-Layer Enforcement: Defense-in-Depth for Federal AI"

Three horizontal tiers with query flowing down:

TIER 1: API Configuration
- mode="AUTO" (highlighted green)
- mode="ANY" crossed out with note "Causes infinite loops"
- "Enables: ✓"

TIER 2: ReAct Instruction Pattern
- THINK → CALL → REASON → RESPOND flow
- Decision tree mapping queries to tools
- "~90% first-pass"

TIER 3: ToolInvocationValidator (purple compliance color)
- Post-response validation
- Retry with enforcement if tool not called
- Escalation to human review after max retries
- "Combined: ~99%"

Right sidebar: Complete audit log JSON

Bottom: Three boxes
- "Why Three Layers? No single point of failure"
- "Auditor Question/Answer format"
- "Reliability Math breakdown"

Key insight: "Defense-in-Depth, not Single-Point enforcement"
FedRAMP badge visible.

--ar 16:9
```

---

### 1. ADK Runtime & Skills (P0) - Updated

**File:** `adk-runtime-skills.png`

```
Hub-and-spoke diagram: "ADK Runtime: Skills-First with Validation Layer"

CENTER: Hexagon "Recovery Coordinator Agent"
- Wrapped in dashed purple border labeled "ToolInvocationValidator"
- Inside: Google ADK → Session State → Gemini 2.0 Flash
- Badges: Context Window, Tool Execution, Reasoning Chains, Validation Layer (NEW)

LEFT: Skills Library (6 folder cards plugging in)
RIGHT: MCP Data Layer (Fixtures + External)
TOP: Command Console (SSE Connection)
BOTTOM: Output Stream with validation checkpoint
- Path A (green): Tools Invoked → Output
- Path B (amber): Retry → Loop back
- Path C (red): Escalate → Human Review

Corner annotations include: "ADR-007.1 Three-Layer Enforcement"

--ar 16:9
```

---

### 2. SSE Streaming Flow (P0) - Updated

**File:** `sse-streaming-flow.png`

```
Sequence diagram: "The Pulse: SSE Event Streaming with Validation"

5 swimlanes (added Validator):
1. User (React) - cyan
2. ADK Runtime (Python) - white
3. Validator (Tier 3) - purple (NEW)
4. Gemini API (Cloud) - amber
5. MCP Server (Data) - emerald

Steps 1-9: Normal query → tool call → response flow

NEW Steps 10-12: Validation checkpoint
- Step 10: Response ready for validation
- Step 11: Branch point "tools_invoked_this_turn?"
  - Path A (green): PASSED → continue
  - Path B (amber): RETRY → loop back to Step 2
  - Path C (red): ESCALATE → Human Review Queue
- Step 12: Final output with validation_outcome

Timeline shows ~2s total, +50ms for validation.
Audit log indicator at bottom.

--ar 16:9
```

---

### 3. MCP Data Layer (P0) - Updated

**File:** `mcp-data-layer.png`

```
Architecture diagram: "The Universal Adapter: MCP Data Layer"

LEFT: 4 Agent boxes with tool_call code snippets
- Each arrow labeled "📝 Logged" (NEW)

CENTER: MCP Router switchboard
- Environment toggle: [DEV] / PROD
- NEW: "Audit: All tool calls logged with timestamp, params, result"

RIGHT: Providers
- TOP (active): MCP Fixtures Server with JSON files
- BOTTOM (grayed): Sentinel-2, NIFC, GEE (Phase 2)

BOTTOM: Code comparison
- Agent code (never changes) with comment "Automatically logged by ToolInvocationValidator"
- MCP config (changes per env)

--ar 16:9
```

---

### 4. Developer Port Map (P0) - Updated

**File:** `developer-port-map.png`

```
Reference diagram: "RANGER Dev Environment: Port Map"

Three tiers:
- Frontend: localhost:3000 (React, Vite, Tailwind, Zustand)
- Orchestration: localhost:8000 (ADK Runtime + "ToolInvocationValidator" + "Tier 3 Validation" badge)
- Data: localhost:8080 (MCP Fixtures) + Session Store + Gemini API

NEW: Audit Log box at bottom

Service connection map shows "Tool Requests (Validated)"
Corner annotation: "ADR-007.1 compliant"

Reference table includes Validation column.

--ar 16:9
```

---

### 5. AgentBriefingEvent Schema (P1) - Updated

**File:** `agent-briefing-event.png`

```
Schema diagram: "AgentBriefingEvent: The UI Contract (with Validation)"

LEFT: JSON schema with NEW validation section (purple):
{
  "validation": {
    "outcome": "PASSED",
    "tools_invoked": ["assess_severity"],
    "attempts": 1,
    "audit_id": "audit-5678"
  }
}

CENTER: Routing matrix
- ui_binding.target decision tree
- NEW: validation.outcome affects styling (PASSED/RETRY/ESCALATED)

RIGHT: UI mockups
- Panel inject now shows "✓ Validated" badge

BOTTOM: Proof Layer rendering includes validation badge component

--ar 16:9
```

---

### 6. Skill Anatomy (P1) - Unchanged

**File:** `skill-anatomy.png`

```
Reference diagram: "Skill Anatomy: What's Inside a Skill?"

Exploded folder view:
burn-severity-analysis/
├── skill.md (brain icon)
├── scripts/ (gear icon)
├── resources/ (database icon)
├── examples/ (lightbulb icon)
└── tests/ (checkmark icon)

skill.md template with sections:
- Description, Triggers (cyan), Instructions (white)
- Inputs/Outputs (emerald), Resources/Scripts (amber)

Runtime flow: Coordinator → Scan Triggers → Load → Execute → Validate → Emit

Best practices: Do/Don't/Remember columns

--ar 16:9
```

---

### 7. Proof Layer Rendering (P1) - Updated

**File:** `proof-layer-rendering.png`

```
UI component diagram: "Proof Layer: The Four Pillars of Trust"

FOUR columns (expanded from three):

1. CONFIDENCE SCORE
- Gauge with color zones
- Score derivation breakdown

2. CITATION CHAIN
- Citation chips with hover/click actions
- Styling rules by source type

3. REASONING CHAIN
- Collapsible accordion with numbered steps
- Checkmarks on completed steps

4. VALIDATION STATUS (NEW)
- Three states: VALIDATED (green), RETRY SUCCEEDED (amber), PENDING REVIEW (red)
- Audit link with ID, timestamp, tools invoked

BOTTOM: Complete briefing card showing all four components
- "✓ Validated" badge in corner
- "📋 View Audit Trail" link

Key insight: "Four pillars: HOW SURE, WHERE FROM, HOW WE GOT THERE, IT WAS ENFORCED"

--ar 16:9
```

---

## Generation Tips

1. **Use Nano Banana Pro** in Google AI Studio
2. **Set aspect ratio to 16:9** before generating
3. **Edit, don't re-roll** - if 80% correct, ask for specific changes
4. **Purple (#7C3AED) for compliance elements** - validation, federal, audit
5. **Include shield icons (🛡️)** for validation layer components
6. **Reference ADR-007.1** in corner annotations

---

## Related Documents

- [Master Prompts File (v2)](../_prompts/_RANGER-DIAGRAM-PROMPTS-v2.md)
- [ADR-007.1: Three-Layer Enforcement](../../adr/ADR-007.1-tool-invocation-strategy.md)
- [PROTOCOL-AGENT-COMMUNICATION.md](../../specs/PROTOCOL-AGENT-COMMUNICATION.md)
- [PROOF-LAYER-DESIGN.md](../../specs/PROOF-LAYER-DESIGN.md)

---

**Last Updated:** December 28, 2025  
**Version:** 2.0

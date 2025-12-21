# The Crew: Agent Specifications

This directory contains detailed specifications for each AI agent in the RANGER platform, an **Agentic OS for Natural Resource Recovery**.

**Core Philosophy:** We are building a **Coordinated AI Crew** of digital colleagues. These agents don't just generate maps; they provide **Agentic Synthesis**—transforming complex geospatial data into actionable briefings for recovery leadership.

## Multi-Agent Hierarchy

RANGER uses the **Google ADK Coordinator/Dispatcher Pattern**. The **Recovery Coordinator** serves as the root LlmAgent, orchestrating four specialized sub-agents:

```
Command Console (UI) → Recovery Coordinator (Root LlmAgent)
                            ├── Burn Analyst (Sub-agent)
                            ├── Trail Assessor (Sub-agent)
                            ├── Cruising Assistant (Sub-agent)
                            └── NEPA Advisor (Sub-agent)
```

## The Five Agents

| Agent | Role Title | Spec Document | Service Directory | Priority |
|-------|------------|---------------|-------------------|----------|
| **Recovery Coordinator** | Recovery Coordinator | [RECOVERY-COORDINATOR-SPEC.md](./RECOVERY-COORDINATOR-SPEC.md) | `services/agents/recovery-coordinator/` | **Root Agent** (P0) |
| **Burn Analyst** | The Burn Analyst | [BURN-ANALYST-SPEC.md](./BURN-ANALYST-SPEC.md) | `services/agents/burn-analyst/` | Sub-agent (P1) |
| **Trail Assessor** | The Trail Assessor | [TRAIL-ASSESSOR-SPEC.md](./TRAIL-ASSESSOR-SPEC.md) | `services/agents/trail-assessor/` | Sub-agent (P1) |
| **Cruising Assistant** | The Cruising Assistant | [TIMBER-CRUISER-SPEC.md](./TIMBER-CRUISER-SPEC.md) | `services/agents/cruising-assistant/` | Sub-agent (P2) |
| **NEPA Advisor** | The NEPA Advisor | [COMPLIANCE-ADVISOR-SPEC.md](./COMPLIANCE-ADVISOR-SPEC.md) | `services/agents/nepa-advisor/` | Sub-agent (P2) |

## Agent Architecture

All agents share a common architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Structure                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   FastAPI   │───▶│   Agent     │───▶│   Gemini    │         │
│  │  Endpoints  │    │   Logic     │    │   API       │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                 │                   │                 │
│         │                 ▼                   │                 │
│         │         ┌─────────────┐             │                 │
│         │         │   Tools     │             │                 │
│         │         │  (Domain-   │             │                 │
│         │         │  Specific)  │             │                 │
│         │         └─────────────┘             │                 │
│         │                                     │                 │
│         ▼                                     ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Standard Response Format                    │   │
│  │  { answer, confidence, sources, suggestions, metadata }  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## AgentBriefingEvent Protocol

All agents communicate via the **AgentBriefingEvent** schema (see [AGENT-MESSAGING-PROTOCOL.md](../architecture/AGENT-MESSAGING-PROTOCOL.md)). This standardized event format enables:

- **Reasoning transparency**: Every insight includes a proof layer with citations and reasoning chains
- **Cross-agent coordination**: Events carry correlation IDs for multi-agent workflows
- **UI-driven rendering**: Events specify UI targets (`rail_pulse`, `panel_inject`, `map_highlight`, `modal_interrupt`)
- **Action tracking**: Suggested actions enable agent-to-agent handoffs through the Recovery Coordinator

**Key Event Types:**
- `insight` — Analytical findings
- `action_required` — User decision points
- `alert` — Critical notifications
- `status_update` — Progress tracking
- `data_received` — Input confirmation

For schema details and examples, see the [BRIEFING-UX-SPEC.md](../architecture/BRIEFING-UX-SPEC.md).

## Phase 1: Simulation Strategy

For Phase 1, RANGER focuses on **orchestration and synthesis**, not raw data processing. See [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md) for the complete strategy.

**Key Principle:** Sub-agents receive simulated data (static fixtures) but perform **real reasoning and synthesis** using Gemini. The Recovery Coordinator's orchestration logic is **fully implemented**.

### What's Real in Phase 1
- Recovery Coordinator routing, dispatch, and cross-agent synthesis
- AgentBriefingEvent emission and UI binding
- Gemini-powered reasoning chains and briefings
- Session state management (Redis)
- Correlation ID tracking for multi-agent workflows

### What's Simulated in Phase 1
- Burn severity data (static GeoJSON from MTBS)
- Trail damage inventories (static JSON fixtures)
- Timber plot data (static CSV/JSON)
- NEPA corpus (curated FSM/FSH excerpts)

**The data is simulated. The orchestration is real. The reasoning is real. The value is real.**

## Development Workflow

1. Read the agent spec in this directory
2. Understand the simulated input format from [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md)
3. Implement agent logic in `services/agents/{agent-name}/`
4. Use shared utilities from `packages/agent-common/`
5. Emit AgentBriefingEvents per [AGENT-MESSAGING-PROTOCOL.md](../architecture/AGENT-MESSAGING-PROTOCOL.md)
6. Test against Cedar Creek fixtures in `data/fixtures/cedar-creek/`
7. Expose via API gateway in `services/api-gateway/`

## Priority Tiers

| Priority | Agents | Rationale |
|----------|--------|-----------|
| **P0 (Critical)** | Recovery Coordinator | Root orchestration layer — this is the product |
| **P1 (Phase 1)** | Burn Analyst, Trail Assessor | Core demo agents for Cedar Creek cascade |
| **P2 (Phase 2)** | Cruising Assistant, NEPA Advisor | Extends the cascade, demonstrates full lifecycle |

## Success Criteria for Phase 1

Per [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md):

| Criterion | Measurement |
|-----------|-------------|
| Cross-agent cascade completes | All 4 agents triggered in sequence with correlation ID |
| Reasoning chains are visible | Every briefing shows expandable logic steps |
| Citations link to sources | FSM/FSH references are clickable and accurate |
| Legacy exports validate | TRACS CSV and FSVeg XML parse correctly |
| UI renders all event types | `rail_pulse`, `map_highlight`, `panel_inject`, `modal_interrupt` all work |

## Key References

- [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md) — Phase 1 scope and simulation boundaries
- [RECOVERY-COORDINATOR-SPEC.md](./RECOVERY-COORDINATOR-SPEC.md) — Root agent specification
- [AGENT-MESSAGING-PROTOCOL.md](../architecture/AGENT-MESSAGING-PROTOCOL.md) — AgentBriefingEvent schema
- [BRIEFING-UX-SPEC.md](../architecture/BRIEFING-UX-SPEC.md) — UI rendering strategy
- [PROJECT-BRIEF.md](../PROJECT-BRIEF.md) — Full project vision

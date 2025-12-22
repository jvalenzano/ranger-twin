# RANGER: Sprint Focus & Development Priorities

This document establishes development priorities for Phase 1 of RANGER, focused on proving orchestration value with simulated data inputs.

## Strategic Priorities

| Priority | Component | Status | Rationale |
|----------|-----------|--------|-----------|
| **P0** | **Command Console UI Shell** | ✅ Complete | Core rendering layer for AgentBriefingEvents, shared chrome, map integration. |
| **P0** | **Static Demo Experience** | ✅ Complete | Full Cedar Creek demo with guided tour, map layers, and phase transitions. |
| **P1** | **Recovery Coordinator** | 🚧 In Progress | Root agent orchestration engine (ADK-based routing, correlation IDs, cross-agent synthesis). |
| **P1** | **Agent Orchestration Demo** | 🚧 In Progress | Complete Cedar Creek cascade with all 4 agents using simulated fixture data. |
| **P2** | **Reasoning Transparency UX** | 📋 Planned | Expandable proof layers, citations, reasoning chain visualization in UI. |
| **P3** | **Legacy Export Validation** | 📋 Planned | TRACS CSV and FSVeg XML stubs that parse correctly for integration testing. |

## What We're Proving

1. **Multi-agent coordination works** — ADK can route queries across domains and maintain session state
2. **Reasoning transparency builds trust** — Every recommendation shows its logic and sources
3. **Cross-lifecycle synthesis creates value** — Burn → Trail → Timber → NEPA cascade demonstrates end-to-end recovery coordination
4. **Legacy export compatibility is achievable** — USFS systems can consume our outputs

## What We're NOT Building (Phase 1)

- Satellite imagery processing pipelines
- Computer vision models for trail damage detection
- Real-time field capture applications
- Species identification algorithms
- Offline-first mobile apps

See `/docs/DATA-SIMULATION-STRATEGY.md` for the complete simulation contract and fixture structure.

## The Moat

**RANGER's competitive advantage is ORCHESTRATION and REASONING TRANSPARENCY**, not perception models. We coordinate across recovery lifecycle phases, synthesize insights from disparate domains, and surface the reasoning behind every recommendation.

Future perception capabilities (CV, satellite analysis, audio transcription) can be built by us, partners, or the USFS itself. Phase 1 simulates their outputs to prove the orchestration layer's value.

## Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Cross-agent cascade completes | All 4 agents triggered in sequence with correlation ID |
| Reasoning chains are visible | Every briefing shows expandable logic steps |
| Citations link to sources | FSM/FSH references are clickable and accurate |
| Legacy exports validate | TRACS CSV and FSVeg XML parse correctly |
| UI renders all event types | `rail_pulse`, `map_highlight`, `panel_inject`, `modal_interrupt` all work |

## Key Principles

- **Simulate Inputs, Generate Real Insights:** Use static fixtures for data, real Gemini for reasoning
- **Orchestration First:** The Recovery Coordinator is the product; sub-agents are the proof
- **Reasoning Transparency:** Every decision must be explainable and traceable
- **Legacy Integration:** Must export to TRACS, FSVeg, and other USFS systems

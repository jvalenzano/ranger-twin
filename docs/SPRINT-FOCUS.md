# RANGER: Sprint Focus & Development Priorities

**Last Updated:** 2025-12-22 (Monday)

This document establishes development priorities for Phase 1 of RANGER, focused on proving orchestration value with simulated data inputs.

## Strategic Priorities

| Priority | Component | Status | Rationale |
|----------|-----------|--------|-----------|
| **P0** | **Command Console UI Shell** | ✅ Complete | Core rendering layer for AgentBriefingEvents, shared chrome, map integration. |
| **P0** | **Static Demo Experience** | ✅ Complete | Full Cedar Creek demo with guided tour, map layers, and phase transitions. |
| **P1** | **Recovery Coordinator** | 🚧 In Progress | Root agent orchestration engine (ADK-based routing, correlation IDs, cross-agent synthesis). |
| **P1** | **Agent Orchestration Demo** | 🚧 In Progress | Complete Cedar Creek cascade with all 4 agents using simulated fixture data. |
| **P1** | **Gemini 3 Flash Migration** | ✅ Complete | All agents updated to `gemini-3-flash` (see ADR-003). |
| **P1** | **NEPA Advisor RAG** | ✅ Complete | File Search Tools + FSM/FSH documents implemented (see ADR-003). |
| **P2** | **Reasoning Transparency UX** | 📋 Planned | Expandable proof layers, citations, reasoning chain visualization in UI. |
| **P3** | **Legacy Export Validation** | 📋 Planned | TRACS CSV and FSVeg XML stubs that parse correctly for integration testing. |

## AI Stack Decisions (ADR-003)

As of 2025-12-22, the following AI stack decisions have been finalized:

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **LLM Model** | Gemini 3 Flash | 3x faster than 2.5 Pro, 78% SWE-bench, FedRAMP High via Vertex AI |
| **RAG Strategy** | Gemini File Search Tool | Fully managed, built-in citations, PDF support, free queries |
| **Framework** | Pure Google ADK | No hybrid frameworks (LangChain rejected) |

**Implementation Status (Completed 2025-12-22):**
1. ✅ Downloaded 7 FSM/FSH documents to `services/agents/nepa-advisor/data/`
2. ✅ Created `setup_file_search.py` script for store indexing
3. ✅ Updated all agent configs to `gemini-3-flash` (7 files)
4. ✅ Implemented `search_regulations()`, `identify_nepa_pathway()`, `generate_compliance_checklist()` tools
5. ✅ Created File Search store and indexed 5 documents (Store ID: `rangernepafsmfshknowledgeba-2szad4tk1e2x`)
6. ✅ Verified RAG returns citations from FSH-1909.15-Ch30-Categorical-Exclusions.pdf

**Note:** File Search queries use `gemini-2.5-flash` until `gemini-3-flash` exits preview.

See [ADR-003](./adr/ADR-003-gemini-3-flash-file-search.md) for full implementation details.

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

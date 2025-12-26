# RANGER Implementation Roadmap

**Version:** 2.0
**Date:** December 25, 2025
**Status:** Active — Single Source of Truth
**Supersedes:** All previous sprint plans, phase documents, and feature backlogs

---

## Executive Summary

This document is the **north star** for RANGER implementation. It consolidates strategic decisions, architectural choices, and tactical execution into a single, actionable plan.

**The Goal:** Build RANGER as a production-ready AI nerve center for USDA Forest Service post-fire recovery, using a Skills-First architecture that can scale to other USDA agencies.

**The Stack:**
```
┌─────────────────────────────────────────────────────────────────┐
│  UI (Nerve Center)      → Mission Control + Chat Interface      │
│  Agent Pipeline         → Google ADK + Gemini Runtime           │
│  Skills Library         → Domain expertise packages             │
│  MCP Connectivity       → External data integration             │
└─────────────────────────────────────────────────────────────────┘
```

**Key Strategic Decisions:**
- ADR-005: Skills-First Multi-Agent Architecture (Accepted)
- Vertical specialization, not platform play
- Domain depth > platform breadth
- Test reusability empirically, don't assume

---

## Current State Assessment

### What's Built (✅)

| Component | Status | Notes |
|-----------|--------|-------|
| **Mission Control UI** | ✅ Complete | 4-phase model, triage scoring, portfolio view |
| **NIFC Integration** | ✅ Complete | Real fire data from NIFC API |
| **OpenRouter Integration** | ✅ Complete | LLM gateway for AI features |
| **Site Analysis Feature** | ✅ Complete | Feature-triggered AI analysis |
| **Fixture Data** | ✅ Complete | Cedar Creek, Bootleg fire fixtures |
| **Map Visualization** | ✅ Complete | MapLibre GL with fire markers |

### What's Missing (🔲)

| Component | Status | Blocking |
|-----------|--------|----------|
| **Agent Pipeline** | 🔲 Not started | Core intelligence layer |
| **Skills Library** | 🔲 Not started | Domain expertise |
| **Coordinator Agent** | 🔲 Not started | Orchestration |
| **Specialist Agents** | 🔲 Not started | Domain reasoning |
| **MCP Servers** | 🔲 Partial | NIFC exists, others needed |
| **Agent ↔ UI Integration** | 🔲 Not started | Chat to agent pipeline |

### Key Insight

The UI is ahead of the intelligence layer. Phase 1 built a compelling interface with mock/simulated AI. **MVP requires real agent orchestration behind the UI.**

---

## Target Architecture

### The Four Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LAYER 1: UI                                  │
│                      (Nerve Center)                                  │
├─────────────────────────────────────────────────────────────────────┤
│  apps/command-console/                                               │
│  ├── Mission Control      → Portfolio triage, map visualization     │
│  ├── Tactical View        → Single-fire deep dive                   │
│  ├── Chat Interface       → Natural language interaction            │
│  └── Briefing Panel       → Agent response rendering                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER 2: AGENT PIPELINE                         │
│                    (Orchestration Runtime)                           │
├─────────────────────────────────────────────────────────────────────┤
│  agents/                                                             │
│  ├── coordinator/         → Routes queries, synthesizes responses   │
│  ├── burn-analyst/        → Fire impact analysis                    │
│  ├── trail-assessor/      → Infrastructure damage                   │
│  ├── cruising-assistant/  → Timber salvage                          │
│  └── nepa-advisor/        → Compliance guidance                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LAYER 3: SKILLS LIBRARY                         │
│                    (Domain Expertise)                                │
├─────────────────────────────────────────────────────────────────────┤
│  skills/                                                             │
│  ├── foundation/          → Cross-agency (NEPA, geospatial, docs)   │
│  │   ├── nepa-compliance/                                           │
│  │   ├── geospatial-analysis/                                       │
│  │   └── document-generation/                                       │
│  └── forest-service/      → Agency-specific                         │
│      ├── baer-assessment/                                           │
│      ├── mtbs-classification/                                       │
│      └── trail-damage-assessment/                                   │
│                                                                      │
│  agents/[name]/skills/    → Agent-specific skills                   │
│      ├── delegation/      (coordinator)                             │
│      ├── soil-burn-severity/ (burn-analyst)                         │
│      └── ...                                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER 4: MCP CONNECTIVITY                        │
│                     (Data Integration)                               │
├─────────────────────────────────────────────────────────────────────┤
│  mcp/                                                                │
│  ├── nifc/                → Fire perimeters, incidents              │
│  ├── weather/             → Weather services (future)               │
│  ├── gis/                 → Geospatial services (future)            │
│  └── fixtures/            → Local fixture data server               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0: Foundation Setup
**Duration:** 1 week
**Goal:** Establish project structure, patterns, and developer infrastructure

#### Deliverables

| Task | Output | Owner |
|------|--------|-------|
| Create `agents/` directory structure | Skeleton folders for all agents | Dev |
| Create `skills/` directory structure | Foundation + agent-specific folders | Dev |
| Create `mcp/` directory structure | MCP server scaffolding | Dev |
| Write Skill Format Specification | `docs/specs/skill-format.md` | Dev |
| Write Agent Interface Specification | `docs/specs/agent-interface.md` | Dev |
| Set up Google ADK development environment | Working ADK hello-world | Dev |
| Archive/consolidate old planning docs | Clean docs/ structure | Dev |
| Update CLAUDE.md with new architecture | Accurate project guidance | Dev |

#### Success Criteria

- [ ] `agents/coordinator/` exists with `agent.py` template
- [ ] `skills/foundation/` has at least one example skill folder
- [ ] ADK hello-world agent runs locally
- [ ] All developers can run agents locally
- [ ] Old sprint plans archived, this roadmap is canonical

#### Directory Structure After Phase 0

```
ranger/
├── apps/command-console/      # Existing UI (no changes)
├── agents/
│   ├── coordinator/
│   │   ├── agent.py           # Template
│   │   ├── config.yaml        # Template
│   │   ├── skills/            # Empty, ready for Phase 1
│   │   └── tests/
│   ├── burn-analyst/          # Skeleton only
│   ├── trail-assessor/        # Skeleton only
│   ├── cruising-assistant/    # Skeleton only
│   └── nepa-advisor/          # Skeleton only
├── skills/
│   ├── foundation/
│   │   └── _template/         # Example skill structure
│   └── forest-service/
├── mcp/
│   ├── nifc/                  # Refactor from existing service
│   └── fixtures/              # Local fixture server
├── packages/
│   ├── skill-runtime/         # Skill loading utilities
│   └── types/                 # Shared types
└── docs/
    ├── adr/                   # Architecture decisions
    ├── specs/                 # Technical specifications
    └── IMPLEMENTATION-ROADMAP.md  # This document
```

---

### Phase 1: Coordinator Agent
**Duration:** 2 weeks
**Goal:** Build the orchestration layer that routes queries and synthesizes responses
**Branch:** `feature/coordinator-agent`

#### Why Coordinator First?

The Coordinator is the **entry point** for all intelligence. Even with no specialist agents, a working Coordinator:
- Proves the ADK runtime works
- Establishes the agent ↔ UI communication pattern
- Can provide basic responses while specialists are built
- Demonstrates the orchestration concept to stakeholders

#### Deliverables

| Task | Output | Priority |
|------|--------|----------|
| Implement Coordinator agent in ADK | `agents/coordinator/agent.py` | P0 |
| Build Delegation skill | Routes queries to appropriate specialists | P0 |
| Build Portfolio Triage skill | Prioritizes fires, generates summaries | P0 |
| Build User Interaction skill | Conversation patterns, response formatting | P1 |
| Create agent ↔ UI API endpoint | FastAPI route for chat messages | P0 |
| Integrate with existing chat interface | Chat sends to Coordinator | P0 |
| Write Coordinator tests | Unit + integration tests | P1 |

#### Skills to Build

**1. Delegation Skill**
```
agents/coordinator/skills/delegation/
├── skill.md              # When/how to route to specialists
├── routing-rules.json    # Decision tree for agent selection
└── tests/
```

**2. Portfolio Triage Skill**
```
agents/coordinator/skills/portfolio-triage/
├── skill.md              # How to prioritize across fires
├── scoring-model.md      # Triage score explanation
└── scripts/
    └── calculate_priority.py
```

**3. User Interaction Skill**
```
agents/coordinator/skills/user-interaction/
├── skill.md              # Conversation patterns
└── templates/
    ├── briefing.md
    └── summary.md
```

#### Success Criteria

- [ ] Coordinator agent runs in ADK
- [ ] User can send message via UI → Coordinator responds
- [ ] Coordinator can generate portfolio summary
- [ ] Coordinator correctly identifies which specialist should handle a query (even if specialist doesn't exist yet)
- [ ] Response times < 5 seconds for simple queries
- [ ] All Coordinator skills have passing tests

#### Integration Points

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Chat Interface │────▶│   FastAPI       │────▶│  Coordinator    │
│  (React)        │     │   /api/chat     │     │  Agent (ADK)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Skills:        │
                                               │  - Delegation   │
                                               │  - Triage       │
                                               │  - Interaction  │
                                               └─────────────────┘
```

---

### Phase 2: First Specialist — Burn Analyst
**Duration:** 2 weeks
**Goal:** Build the first domain expert agent with full skill set
**Branch:** `feature/burn-analyst-agent`

#### Why Burn Analyst First?

1. **Domain clarity**: Burn severity is well-defined with clear inputs/outputs
2. **Data availability**: MTBS, dNBR data is accessible
3. **Fixture support**: Cedar Creek fixtures include burn severity data
4. **Cross-agent value**: Burn analysis informs Trail, Cruising, and NEPA decisions
5. **Demo impact**: Visual burn severity maps are compelling

#### Deliverables

| Task | Output | Priority |
|------|--------|----------|
| Implement Burn Analyst agent | `agents/burn-analyst/agent.py` | P0 |
| Build MTBS Classification skill | Severity classification logic | P0 |
| Build Soil Burn Severity skill | Post-fire soil assessment | P0 |
| Build Boundary Mapping skill | Fire perimeter delineation | P1 |
| Wire Coordinator → Burn Analyst | Delegation routes fire queries | P0 |
| Test end-to-end flow | UI → Coordinator → Burn Analyst → Response | P0 |
| Write Burn Analyst tests | Unit + integration tests | P1 |

#### Skills to Build

**1. MTBS Classification Skill**
```
agents/burn-analyst/skills/mtbs-classification/
├── skill.md              # Classification protocol
├── thresholds.json       # dNBR classification values
├── scripts/
│   └── classify_severity.py
└── examples/
    └── cedar-creek-output.json
```

**2. Soil Burn Severity Skill**
```
agents/burn-analyst/skills/soil-burn-severity/
├── skill.md              # Field assessment protocol
├── indicators.md         # Visual indicators by severity
└── resources/
    └── soil-types.json
```

**3. Boundary Mapping Skill**
```
agents/burn-analyst/skills/boundary-mapping/
├── skill.md              # Perimeter delineation rules
└── scripts/
    └── validate_boundary.py
```

#### Success Criteria

- [ ] Burn Analyst agent runs in ADK
- [ ] Coordinator correctly delegates burn-related queries to Burn Analyst
- [ ] Burn Analyst can classify fire severity given coordinates
- [ ] Burn Analyst can explain soil burn severity for a fire
- [ ] End-to-end flow works: User asks "What's the burn severity for Cedar Creek?" → Gets classified response
- [ ] All Burn Analyst skills have passing tests

#### End-to-End Flow

```
User: "What's the burn severity for Cedar Creek Fire?"
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Coordinator Agent                                       │
│  ├── Delegation Skill: "This is a burn query"           │
│  └── Routes to: burn-analyst                            │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Burn Analyst Agent                                      │
│  ├── Invokes: MTBS Classification Skill                 │
│  ├── Fetches: Fire data from MCP/fixtures               │
│  └── Returns: Severity classification with reasoning    │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Response to User:                                       │
│  "Cedar Creek Fire shows 42% high-severity burn         │
│  (18,340 acres). Based on dNBR analysis..."             │
│  Confidence: 94%                                        │
│  Sources: MTBS 2022-09-15, Sentinel-2 2022-09-12       │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 3: Remaining Specialists
**Duration:** 4 weeks (1 week per agent)
**Goal:** Complete the agent roster
**Branches:** `feature/trail-assessor-agent`, `feature/cruising-assistant-agent`, `feature/nepa-advisor-agent`

#### 3A: Trail Assessor (Week 1)

| Skill | Purpose |
|-------|---------|
| Damage Classification | Type I-IV damage definitions |
| Closure Decision | Closure criteria, risk-based logic |
| Recreation Priority | Prioritization factors for repairs |

#### 3B: Cruising Assistant (Week 2)

| Skill | Purpose |
|-------|---------|
| Cruise Methodology | Standard cruise protocols |
| Volume Estimation | Board foot calculations |
| Salvage Assessment | Viability criteria, market factors |

#### 3C: NEPA Advisor (Week 3-4)

| Skill | Purpose |
|-------|---------|
| Pathway Decision | CE vs EA vs EIS logic |
| Documentation | Doc requirements, templates |
| NEPA Library | RAG over NEPA corpus |

#### Success Criteria for Phase 3

- [ ] All 4 specialist agents implemented and tested
- [ ] Coordinator correctly routes to all specialists
- [ ] Cross-agent queries work (e.g., "What NEPA pathway for this burn severity?")
- [ ] Each agent has 2-3 working skills
- [ ] Integration tests pass for all agent combinations

---

### Phase 4: Foundation Skills & MCP
**Duration:** 2 weeks
**Goal:** Build shared skills and data connectivity

#### Foundation Skills to Extract

| Skill | Source | Reuse Potential |
|-------|--------|-----------------|
| NEPA Compliance | NEPA Advisor | High — applies to all USDA |
| Geospatial Analysis | Burn Analyst | High — universal pattern |
| Document Generation | Multiple | High — standard outputs |
| Federal Reporting | New | High — congressional reporting |

#### MCP Servers to Build

| Server | Data Source | Priority |
|--------|-------------|----------|
| `mcp/nifc/` | Refactor existing nifcService | P0 |
| `mcp/fixtures/` | Local fixture data | P0 |
| `mcp/weather/` | Weather.gov API | P2 |
| `mcp/gis/` | Geospatial services | P2 |

#### Success Criteria

- [ ] At least 2 Foundation Skills extracted and working
- [ ] MCP NIFC server operational (refactored from current)
- [ ] MCP Fixtures server provides Cedar Creek/Bootleg data
- [ ] Agents can call MCP servers for data

---

### Phase 5: Integration & Production Readiness
**Duration:** 2 weeks
**Goal:** Polish, deploy, and prepare for pilot

#### Deliverables

| Task | Output | Priority |
|------|--------|----------|
| Cloud Run deployment | Terraform + Docker configs | P0 |
| Monitoring & logging | Cloud Logging integration | P0 |
| Error handling | Graceful failures, fallbacks | P0 |
| Performance optimization | < 5s response times | P1 |
| Security review | Auth, rate limiting, input validation | P0 |
| Pilot user documentation | User guide for Forest Service | P1 |
| Demo script | Structured walkthrough | P1 |

#### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Google Cloud Run                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  ranger-ui       │    │  ranger-orchestrator             │   │
│  │  (Vite SSR)      │───▶│  (FastAPI + ADK Agents)          │   │
│  │                  │    │                                  │   │
│  │  Scale: 0-10     │    │  • Coordinator + all specialists │   │
│  └──────────────────┘    │  • Skills bundled                │   │
│                          │  • Scale: 0-20                   │   │
│                          └──────────────────────────────────┘   │
│                                        │                        │
│                          ┌─────────────┴─────────────┐         │
│                          ▼                           ▼         │
│                   ┌────────────┐              ┌────────────┐   │
│                   │  mcp-nifc  │              │  mcp-fixtures│  │
│                   │  Scale: 0-5│              │  Scale: 0-3 │   │
│                   └────────────┘              └────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Success Criteria (MVP Complete)

- [ ] System deployed to Cloud Run
- [ ] End-to-end demo works reliably
- [ ] Response times < 5 seconds
- [ ] Error handling prevents crashes
- [ ] Monitoring shows system health
- [ ] 2+ Forest Service pilot users can test
- [ ] Demo script runs successfully 10/10 times

---

## Phase Summary & Timeline

| Phase | Duration | Focus | Key Deliverable |
|-------|----------|-------|-----------------|
| **0: Foundation** | 1 week | Project structure | ADK running, folders ready |
| **1: Coordinator** | 2 weeks | Orchestration | Working coordinator with skills |
| **2: Burn Analyst** | 2 weeks | First specialist | End-to-end agent flow |
| **3: Remaining** | 4 weeks | Complete roster | All 5 agents operational |
| **4: Foundation/MCP** | 2 weeks | Shared services | Reusable skills, data layer |
| **5: Production** | 2 weeks | Deploy & polish | MVP ready for pilot |
| **Total** | **13 weeks** | | |

---

## Feature Branch Strategy

```
main (production)
│
└── develop (integration)
    │
    ├── feature/phase-0-foundation        ← Week 1
    │   └── Directory structure, ADK setup, specs
    │
    ├── feature/coordinator-agent         ← Week 2-3
    │   └── Coordinator + delegation, triage, interaction skills
    │
    ├── feature/burn-analyst-agent        ← Week 4-5
    │   └── Burn Analyst + MTBS, soil, boundary skills
    │
    ├── feature/trail-assessor-agent      ← Week 6
    │   └── Trail Assessor + damage, closure, priority skills
    │
    ├── feature/cruising-assistant-agent  ← Week 7
    │   └── Cruising Assistant + cruise, volume, salvage skills
    │
    ├── feature/nepa-advisor-agent        ← Week 8-9
    │   └── NEPA Advisor + pathway, docs, library skills
    │
    ├── feature/foundation-skills         ← Week 10-11
    │   └── Extract shared skills, build MCP servers
    │
    └── feature/production-readiness      ← Week 12-13
        └── Deployment, monitoring, polish
```

### Branch Rules

1. **One agent per branch** — Complete agent + all skills before merge
2. **Tests required** — No merge without passing tests
3. **Code review** — PR review before merge to develop
4. **Integration test** — Full system test on develop before main
5. **Squash merge** — Clean commit history

---

## Success Metrics

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent response time | < 5 seconds | P95 latency |
| Skill invocation accuracy | > 95% | Correct skill for query |
| Test coverage | > 80% | Per agent and skill |
| Uptime | > 99% | Cloud Run metrics |
| Error rate | < 1% | Failed requests |

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Pilot user adoption | 2+ Forest Service users | MVP |
| Demo success rate | 100% | MVP |
| Stakeholder reaction | "This actually works" | MVP |
| BAER time reduction | 20% | 6 months post-MVP |
| FedRAMP readiness | Assessment started | 12 months |

### Reusability Metrics (Post-MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Foundation Skill reuse | > 50% | Skills used in 2+ agents |
| Code reuse for next vertical | > 40% | Measured in NRCS pilot |
| Time to new agent | < 1 week | After patterns established |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ADK learning curve | Medium | High | Start with hello-world, iterate |
| Skill reusability doesn't materialize | High | Medium | Test empirically, don't assume |
| Agent orchestration reliability | Medium | High | Extensive testing, fallbacks |
| Response time too slow | Medium | Medium | Optimize prompts, caching |
| Team capacity constraints | Medium | High | Prioritize ruthlessly, defer nice-to-haves |
| Scope creep | High | Medium | Stick to roadmap, parking lot for ideas |

---

## Parking Lot (Post-MVP)

Items explicitly deferred to maintain focus:

| Item | Why Deferred |
|------|--------------|
| Real satellite imagery processing | Out of Phase 1 scope |
| Mobile/offline support | Requires significant investment |
| Multi-user collaboration | Single-user MVP first |
| Real-time data ingestion | Fixtures sufficient for MVP |
| TRACS/FSVeg export | Nice-to-have, not core |
| Voice interface | Future enhancement |
| Automated BAER report generation | Requires more domain work |

---

## Reference Documents

| Document | Purpose | Location |
|----------|---------|----------|
| ADR-005: Skills-First Architecture | Strategic architecture decision | `docs/adr/ADR-005-skills-first-architecture.md` |
| Strategic Architecture Review | External evaluation | `docs/research/Strategic Architecture Review.md` |
| USDA GenAI Strategy Analysis | Alignment language | `docs/research/USDA-GenAI-Analysis.md` |
| Product Summary | Vision and positioning | `docs/_!_PRODUCT-SUMMARY.md` |
| Skill Format Specification | How to author skills | `docs/specs/skill-format.md` (to create) |
| Agent Interface Specification | Agent contracts | `docs/specs/agent-interface.md` (to create) |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-25 | Skills-First architecture adopted | ADR-005; aligns with USDA strategy |
| 2025-12-25 | Coordinator-first implementation | Proves pattern before specialists |
| 2025-12-25 | Burn Analyst as first specialist | Clear domain, data available, high impact |
| 2025-12-25 | 13-week timeline to MVP | Realistic given scope; allows iteration |
| 2025-12-25 | Feature branch per agent | Modularity, testing, clean merges |

---

## How to Use This Document

1. **Planning:** Use Phase breakdown for sprint planning
2. **Execution:** Check off deliverables as completed
3. **Decisions:** Record new decisions in Decision Log
4. **Scope:** If not in this document, it's not in MVP
5. **Updates:** This is a living document; update as we learn

---

**Document Owner:** TechTrend Federal - RANGER Team
**Last Updated:** December 25, 2025
**Next Review:** After Phase 1 completion

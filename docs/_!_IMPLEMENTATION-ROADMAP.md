# RANGER Implementation Roadmap

> **📍 CURRENT STATUS — December 30, 2025**
>
> **Phase 4: ADK Integration — ✅ COMPLETED**
> - Multi-agent orchestration deployed to Cloud Run
> - Vertex AI + ADC authentication working
> - 5 agents, 16+ tools, 645 tests passing
> - RAG infrastructure: 16 documents across 4 corpora
> - Stress testing: 89% pass rate (25/28 tests)
>
> **Phase 5: Production Hardening — 🔄 IN PROGRESS**
> - ✅ Fire ID normalization
> - ✅ Runtime architecture documentation
> - ✅ Prompt engineering runbook created
> - ✅ Stress test harness (`scripts/agent_stress_test.py`)
> - 🔲 Suggested Actions API endpoints ([BACKLOG](backlog/BACKLOG-suggested-actions-system.md))
> - 🔲 Demo preparation
>
> **Production URLs:**
> - Coordinator: https://ranger-coordinator-1058891520442.us-central1.run.app
> - Frontend: https://ranger-frontend-1058891520442.us-west1.run.app
> - MCP Fixtures: https://ranger-mcp-fixtures-1058891520442.us-central1.run.app
>
> **Known Issues:**
> - Suggested Actions buttons fail when backend unavailable ([BACKLOG](backlog/BACKLOG-suggested-actions-system.md))

**Version:** 2.3
**Date:** December 30, 2025
**Status:** Active — Technical Execution Guide
**Supersedes:** All previous sprint plans, phase documents, and feature backlogs

---

> [!IMPORTANT]
> **Strategic Context:** This document is the **technical execution guide** for RANGER implementation.
> For product strategy, feature prioritization, and the "why" behind our roadmap, see:
> **[STRATEGIC-ROADMAP.md](./STRATEGIC-ROADMAP.md)** — Single Source of Product Strategy Truth
>
> The relationship:
> - `STRATEGIC-ROADMAP.md` → What to build and why (PM/PO/Leadership)
> - `_!_IMPLEMENTATION-ROADMAP.md` → How to build it (Technical Leads/Developers)

---

## Executive Summary

This document is the **technical execution guide** for RANGER implementation. It consolidates architectural choices, implementation phases, and tactical execution into a single, actionable plan.

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

| **Site Analysis Feature** | ✅ Complete | Feature-triggered AI analysis |
| **Fixture Data** | ✅ Complete | Cedar Creek, Bootleg fire fixtures |
| **Map Visualization** | ✅ Complete | MapLibre GL with fire markers |

### What's Built (✅) - Agent Layer

| Component | Status | Notes |
|-----------|--------|-------|
| **Agent Pipeline** | ✅ Complete | Google ADK + Gemini 2.0/2.5 Flash |
| **Skills Library** | ✅ Complete | 14 skills across 5 agents |
| **Coordinator Agent** | ✅ Complete | Portfolio triage, delegation |
| **Burn Analyst** | ✅ Complete | MTBS, soil burn, boundary (gemini-2.0-flash) |
| **Trail Assessor** | ✅ Complete | Damage, closure, priority (gemini-2.0-flash) |
| **Cruising Assistant** | ✅ Complete | Volume, salvage, cruise, CSV (gemini-2.0-flash) |
| **NEPA Advisor** | ✅ Complete | Pathway, timeline, docs, PDF (gemini-2.5-flash) |

### What's Remaining (🔲)

| Component | Status | Priority |
|-----------|--------|----------|
| **IRWIN Integration** | 🟥 **CRITICAL** | Real-time fire incident hub |
| **MCP Servers** | 🔲 Partial | NIFC exists, fixtures needed |
| **Agent ↔ UI Integration** | 🔲 Not started | Chat to agent pipeline |
| **Cloud Run Deployment** | 🔲 Not started | Production infrastructure |

### Key Insight

**Phase 3 Complete:** All 5 agents are built, tested, and verified on GCP project `ranger-twin-dev`. Next steps are MCP data connectivity and production deployment.

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

### Phase 0: Foundation Setup ✅ COMPLETE
**Duration:** 1 week
**Completed:** December 25, 2025
**Branch:** `feature/phase-0-foundation`
**Goal:** Establish project structure, patterns, and developer infrastructure

#### Deliverables

| Task | Output | Status |
|------|--------|--------|
| Create `agents/` directory structure | 5 agents with full structure | ✅ Done |
| Create `skills/` directory structure | Foundation + forest-service folders | ✅ Done |
| Create `mcp/` directory structure | NIFC + Fixtures placeholders | ✅ Done |
| Write Skill Format Specification | `docs/specs/skill-format.md` (~300 lines) | ✅ Done |
| Write Agent Interface Specification | `docs/specs/agent-interface.md` (~380 lines) | ✅ Done |
| Set up Google ADK development environment | `pyproject.toml` + verify script | ✅ Done |
| Archive/consolidate old planning docs | Clean docs/ structure | ✅ Done |
| Update CLAUDE.md with new architecture | Skills-First section added | ✅ Done |

#### Success Criteria

- [x] `agents/coordinator/` exists with `agent.py` template
- [x] `skills/foundation/` has at least one example skill folder (greeting/)
- [x] ADK dependency added (run `pip install google-adk` to activate)
- [x] Verification script: `python scripts/verify-adk.py`
- [x] Old sprint plans archived, this roadmap is canonical

#### Key Commit
```
2d28559 feat: Phase 0 foundation setup - Skills-First architecture scaffolding
```

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

### Phase 1: Coordinator Agent ✅ COMPLETE
**Duration:** 2 weeks
**Completed:** December 25, 2025
**Branch:** `feature/burn-analyst-agent` (merged with Phase 2)
**Goal:** Build the orchestration layer that routes queries and synthesizes responses

#### Deliverables

| Task | Output | Status |
|------|--------|--------|
| Implement Coordinator agent in ADK | `agents/coordinator/agent.py` | ✅ Done |
| **Implement Tiered Fallback Logic** | `CoordinatorService` with 4-tier degradation | ✅ Done |
| **Implement Multi-Incident Fan-Out** | `asyncio.gather` for parallel fire assessment | ✅ Done |
| Build Delegation skill | Keyword routing + specialist identification | ✅ Done |
| Build Portfolio Triage skill | Triage scoring (severity * acres * phase) | ✅ Done |
| Create agent ↔ UI API endpoint | `services/api-gateway/app/routers/chat.py` | ✅ Done |
| Write Coordinator tests | 16 integration tests | ✅ Done |
| MCPMockProvider with explicit injection | `get_tool_context()` + handler support | ✅ Done |

#### Key Implementation Details

**CoordinatorService** (`agents/coordinator/implementation.py`):
- Tiered Fallback: Authoritative (0.95) → Derived (0.75) → Historical (0.40) → Failure (0.00)
- Fan-Out: Parallel fire assessment with partial failure handling
- Query Routing: Keyword-based routing to specialists (burn-analyst, trail-assessor, etc.)
- AgentBriefingEvent-compatible responses with proof_layer

**MCPMockProvider** (`packages/skill-runtime/skill_runtime/testing.py`):
- `get_tool_context()` for explicit injection per ADR-005
- `handler` parameter for dynamic lookups
- Call history tracking and assertions

#### Success Criteria

- [x] Coordinator agent runs in ADK
- [x] User can send message via UI → Coordinator responds
- [x] Coordinator can generate portfolio summary (4 fires: Cedar Creek, Bootleg, Mosquito, Double Creek)
- [x] Coordinator correctly identifies which specialist should handle a query
- [x] All Coordinator tests passing (16 integration + 43 skill-runtime)

#### Key Commits
```
0a48421 feat: Phase 1 Coordinator Service with Maestro pattern
d227fde feat: implement Hybrid Approach skill-runtime with MCPMockProvider
```

#### Verification
```bash
pytest agents/coordinator/tests/test_coordinator_service.py -v  # 16 passed
pytest packages/skill-runtime/tests/ -v                          # 43 passed
```

---

### Phase 2: First Specialist — Burn Analyst ✅ COMPLETE
**Duration:** 2 weeks
**Completed:** December 25, 2025
**Branch:** `feature/burn-analyst-agent`
**Goal:** Build the first domain expert agent with full skill set

#### Why Burn Analyst First?

1. **Domain clarity**: Burn severity is well-defined with clear inputs/outputs
2. **Data availability**: MTBS, dNBR data is accessible
3. **Fixture support**: Cedar Creek fixtures include burn severity data
4. **Cross-agent value**: Burn analysis informs Trail, Cruising, and NEPA decisions
5. **Demo impact**: Visual burn severity maps are compelling

#### Deliverables

| Task | Output | Status |
|------|--------|--------|
| Implement Burn Analyst agent | `agents/burn-analyst/agent.py` with 3 tools | ✅ Done |
| Build Soil Burn Severity skill | 41 tests, dNBR classification, erosion risk | ✅ Done |
| Build MTBS Classification skill | 34 tests, 4-class MTBS protocol | ✅ Done |
| Build Boundary Mapping skill | 34 tests, perimeter/area validation | ✅ Done |
| Wire Coordinator → Burn Analyst | Keyword routing for burn queries | ✅ Done |
| Total tests | 109 skill tests + agent tests | ✅ Done |

#### Key Commits
```
b991781 feat: complete Phase 2 with MTBS Classification and Boundary Mapping skills
1aa6e19 feat: Phase 2 Burn Analyst agent with Soil Burn Severity skill
```

#### Verification
```bash
pytest agents/burn-analyst/skills/soil-burn-severity/tests/ -v   # 41 passed
pytest agents/burn-analyst/skills/mtbs-classification/tests/ -v  # 34 passed
pytest agents/burn-analyst/skills/boundary-mapping/tests/ -v     # 34 passed
```

#### Skills Built

**1. Soil Burn Severity Skill** (41 tests)
```
agents/burn-analyst/skills/soil-burn-severity/
├── skill.md                     # Field assessment protocol
├── scripts/assess_severity.py   # dNBR classification, erosion risk
├── resources/soil-types.json    # Soil type definitions
└── tests/                       # 41 passing tests
```

**2. MTBS Classification Skill** (34 tests)
```
agents/burn-analyst/skills/mtbs-classification/
├── skill.md                    # 4-class MTBS protocol
├── scripts/classify_mtbs.py    # Severity classification
├── resources/thresholds.json   # dNBR thresholds
└── tests/                      # 34 passing tests
```

**3. Boundary Mapping Skill** (34 tests)
```
agents/burn-analyst/skills/boundary-mapping/
├── skill.md                      # Perimeter delineation rules
├── scripts/validate_boundary.py  # Geometry validation
└── tests/                        # 34 passing tests
```

#### Success Criteria

- [x] Burn Analyst agent runs in ADK
- [x] Coordinator correctly delegates burn-related queries to Burn Analyst
- [x] Burn Analyst can classify fire severity given coordinates
- [x] Burn Analyst can explain soil burn severity for a fire
- [x] All Burn Analyst skills have passing tests (109 total)

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

### Phase 3: Remaining Specialists ✅ COMPLETE
**Duration:** 1 week (consolidated build)
**Completed:** December 26, 2025
**Branch:** `develop`
**Goal:** Complete the agent roster

#### Deliverables

| Agent | Skills Built | Tests | Status |
|-------|-------------|-------|--------|
| **Trail Assessor** | damage-classification, closure-decision, recreation-priority | 107 | ✅ Verified |
| **Cruising Assistant** | volume-estimation, salvage-assessment, cruise-methodology, csv-insight | ~120 | ✅ Verified |
| **NEPA Advisor** | pathway-decision, compliance-timeline, documentation, pdf-extraction | ~90 | ✅ Verified |

#### Key Technical Fix Applied

All agents updated to use JSON string parameters for Gemini API compatibility:
```python
# Pattern applied to all agent tool functions
def tool_function(data_json: str = "[]") -> dict:
    data = json.loads(data_json) if data_json else []
    return execute({"data": data})
```

Agent directories renamed from hyphens to underscores (ADK requirement):
- `burn-analyst` → `burn_analyst`
- `trail-assessor` → `trail_assessor`
- `cruising-assistant` → `cruising_assistant`
- `nepa-advisor` → `nepa_advisor`

#### Verified Test Results (December 26, 2025)

**GCP Project:** `ranger-twin-dev` (Project Number: 1058891520442)

| Agent | Test Query | Tool Called | Result |
|-------|------------|-------------|--------|
| coordinator | "Which fires should we prioritize?" | — | ✅ Asks for fire data |
| burn_analyst | "What's the burn severity for Cedar Creek?" | `assess_severity` | ✅ 127,341 acres, 63.6% high severity |
| trail_assessor | "Which trails need to be closed?" | `evaluate_closure` | ✅ 3 closed, 2 open-caution |
| cruising_assistant | "What's the timber volume?" | — | ✅ Asks for plot/tree data |
| nepa_advisor | "What NEPA pathway for salvage?" | — | ✅ Asks clarifying questions |

#### Success Criteria

- [x] All 4 specialist agents implemented and tested
- [x] All agents respond correctly to domain queries
- [x] Tool calls work correctly (burn_analyst, trail_assessor verified)
- [x] Each agent has 3-4 working skills
- [x] JSON parameter pattern applied consistently

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
| **Theme Factory** | (Adopted) | High — enforces USDA branding |
| **Tapestry Skill** | (Adopted) | High — connects fire/trail/NEPA knowledge |

#### MCP Servers to Build

| Server | Data Source | Priority |
|--------|-------------|----------|
| `mcp/irwin/` | IRWIN Incident Hub | **P0 (Critical)** |
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

| Phase | Duration | Focus | Key Deliverable | Status |
|-------|----------|-------|-----------------|--------|
| **0: Foundation** | 1 week | Project structure | ADK running, folders ready | ✅ Complete |
| **1: Coordinator** | 2 weeks | Orchestration | Working coordinator with skills | ✅ Complete |
| **2: Burn Analyst** | 2 weeks | First specialist | End-to-end agent flow | ✅ Complete |
| **3: Remaining** | 1 week | Complete roster | All 5 agents operational | ✅ Complete |
| **4: Foundation/MCP** | 2 weeks | Shared services | Reusable skills, data layer | 🔲 Next |
| **5: Production** | 2 weeks | Deploy & polish | MVP ready for pilot | 🔲 Pending |
| **Total** | **10 weeks** | | | **60% Complete** |

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

**Document Owner:** jvalenzano - RANGER Team
**Last Updated:** December 25, 2025
**Next Review:** After Phase 1 completion

# RANGER Phase 2 Warm-Up Prompt: Burn Analyst Agent

> Use this to start a new Claude Code session for Phase 2 implementation.

---

## Context for Claude Code

You are the tech lead and senior software developer for RANGER, an AI-powered post-fire forest recovery platform for the USDA Forest Service. The project uses a Skills-First architecture (ADR-005) with Google ADK agents.

---

## Phase 1 Completed

**Commit:** `452d507 docs: add Phase 2 architectural specs from Strategic Advisor`
**Branch merged:** `feature/coordinator-agent` → `develop`

### What Was Built

1. **Coordinator Agent** (`agents/coordinator/`)
   - Full ADK agent implementation with `agent.py`
   - Two functional skills with 55 combined tests

2. **Portfolio Triage Skill** (`agents/coordinator/skills/portfolio-triage/`)
   - Fire prioritization: `severity × (acres/10000) × phase_multiplier`
   - Phase multipliers: active=2.0, baer_assessment=1.75, baer_implementation=1.25, in_restoration=1.0
   - 29 tests passing

3. **Delegation Skill** (`agents/coordinator/skills/delegation/`)
   - Query routing to specialists (burn-analyst, trail-assessor, cruising-assistant, nepa-advisor)
   - Keyword matching with confidence scoring
   - Multi-agent synthesis detection
   - 26 tests passing

4. **API Gateway** (`services/api-gateway/`)
   - `POST /api/v1/chat` endpoint integrated with Delegation skill
   - Returns AgentResponse with reasoning chain
   - 9 tests passing

5. **Frontend Integration** (`apps/command-console/src/services/aiBriefingService.ts`)
   - RANGER API as primary provider with fallback chain
   - Env vars: `VITE_RANGER_API_URL`, `VITE_USE_RANGER_API`

6. **Anti-Gravity Documentation** (Strategic Advisor specs)
   - `docs/specs/PROTOCOL-AGENT-COMMUNICATION.md` - AgentBriefingEvent schema
   - `docs/specs/PROOF-LAYER-DESIGN.md` - UI transparency specs
   - `docs/specs/SKILL-VERIFICATION-STANDARD.md` - Skill DoD
   - `docs/specs/SKILL-CATEGORY-DEFINITIONS.md` - Three-tier taxonomy
   - `docs/specs/MCP-IRWIN-SPEC.md` - IRWIN data wrapper
   - `docs/specs/MCP-REGISTRY-STANDARD.md` - mcp.json standard
   - `docs/architecture/AGENT-FLOWS.md` - Mermaid diagrams

### Test Summary
- Portfolio Triage: 29 tests
- Delegation: 26 tests
- Chat API: 9 tests
- Integration: 3 tests
- **Total: 67 tests passing**

---

## Phase 2 Objective: Burn Analyst Agent

**Branch:** `feature/burn-analyst-agent`
**Goal:** Build the first domain specialist agent with full skill set
**Reference:** `docs/_!_IMPLEMENTATION-ROADMAP.md` (Phase 2 section)

### Why Burn Analyst First?

1. **Domain clarity** — Burn severity is well-defined with clear inputs/outputs
2. **Data availability** — Cedar Creek fixtures include burn severity data
3. **Cross-agent value** — Burn analysis informs Trail, Cruising, and NEPA decisions
4. **Demo impact** — Visual burn severity assessments are compelling
5. **Established pattern** — Follow Coordinator's skill structure

---

## Tech Lead Decisions: Implementation Order

### Sprint 1: Agent Foundation (Priority)

| Task | Output | Rationale |
|------|--------|-----------|
| Create Burn Analyst agent skeleton | `agents/burn-analyst/agent.py` | Follow Coordinator pattern |
| Build Soil Burn Severity skill | `agents/burn-analyst/skills/soil-burn-severity/` | P0 in roadmap, clearest domain |
| Wire Coordinator → Burn Analyst | Update delegation routing | Proves end-to-end flow |
| Add burn-analyst to API Gateway | Route delegated queries | Complete the integration |

### Sprint 2: Additional Skills

| Task | Output | Rationale |
|------|--------|-----------|
| Build MTBS Classification skill | `agents/burn-analyst/skills/mtbs-classification/` | dNBR classification logic |
| Build Boundary Mapping skill | `agents/burn-analyst/skills/boundary-mapping/` | Fire perimeter validation |
| Integration tests | End-to-end query flow | Verify full pipeline |

---

## Existing Fixture Data

Cedar Creek burn severity data is available at:
```
data/fixtures/cedar-creek/burn-severity.json
```

This fixture includes:
- Fire metadata (name, discovery date, acres)
- Burn sectors with severity classifications (UNBURNED, LOW, MODERATE, HIGH)
- dNBR values and slope data
- GeoJSON geometries

---

## Agent Directory Structure (Follow This Pattern)

```
agents/burn-analyst/
├── agent.py              # ADK Agent definition (exports root_agent)
├── config.yaml           # Runtime configuration
├── __init__.py           # Package marker
├── .env.example          # Environment template
├── skills/
│   ├── soil-burn-severity/
│   │   ├── skill.md          # Instructions, triggers, decision logic
│   │   ├── scripts/
│   │   │   └── assess_severity.py
│   │   ├── resources/
│   │   │   └── severity-indicators.json
│   │   ├── examples/
│   │   │   └── cedar-creek-assessment.json
│   │   └── tests/
│   │       └── test_soil_burn_severity.py
│   ├── mtbs-classification/
│   │   └── ... (same structure)
│   └── boundary-mapping/
│       └── ... (same structure)
└── tests/
    ├── __init__.py
    └── test_agent.py
```

---

## Key Specifications to Reference

| Document | Purpose |
|----------|---------|
| `docs/adr/ADR-005-skills-first-architecture.md` | Core architecture decision |
| `docs/specs/skill-format.md` | How to author skills |
| `docs/specs/agent-interface.md` | Agent communication protocol |
| `docs/specs/PROTOCOL-AGENT-COMMUNICATION.md` | AgentBriefingEvent schema |
| `docs/specs/SKILL-VERIFICATION-STANDARD.md` | Skill Definition of Done |
| `docs/_!_IMPLEMENTATION-ROADMAP.md` | Phase 2 deliverables |

---

## Success Criteria (Phase 2 Complete When)

- [ ] Burn Analyst agent runs in ADK (`adk run burn-analyst`)
- [ ] Coordinator correctly delegates burn queries to Burn Analyst
- [ ] Burn Analyst can assess soil burn severity given fire ID
- [ ] Burn Analyst can classify severity using dNBR thresholds
- [ ] End-to-end flow works: "What's the burn severity for Cedar Creek?" → classified response
- [ ] All skills have passing tests (target: 80%+ coverage)
- [ ] Response includes confidence score and reasoning chain

---

## Commands to Verify Environment

```bash
# Activate virtual environment
source venv/bin/activate

# Run existing tests (should all pass)
python -m pytest agents/coordinator/ -v --override-ini="addopts="

# Start API Gateway (for integration testing)
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Run ADK agent (after building burn-analyst)
cd agents && adk run burn-analyst
```

---

## Current Branch Status

```
Branch: feature/burn-analyst-agent
Base: 452d507 (develop)
Tracking: origin/feature/burn-analyst-agent
```

---

## First Task

Begin with creating the Burn Analyst agent skeleton following the Coordinator pattern. Then implement the Soil Burn Severity skill as the first domain capability.

The Delegation skill already routes burn-related queries to `burn-analyst` — we just need to build the agent that receives them.

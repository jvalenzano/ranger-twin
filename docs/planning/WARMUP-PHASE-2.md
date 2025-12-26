# RANGER Phase 2 Warm-Up Prompt

> Use this to resume work with Claude Code after Phase 1 completion.

---

## Context for Claude Code

You are the tech lead and senior software developer for RANGER, an AI-powered post-fire forest recovery platform for the USDA Forest Service. The user also works with "Anti-Gravity" as a strategic advisor who handles documentation and planning.

## What Was Completed in Phase 1

### Skills-First Architecture Implementation

**Commit:** `19670a7 feat: Phase 1 Coordinator Agent with Skills-First architecture`

We implemented the Coordinator agent with two functional skills:

1. **Portfolio Triage Skill** (`agents/coordinator/skills/portfolio-triage/`)
   - Fire prioritization formula: `severity × (acres/10000) × phase_multiplier`
   - Phase multipliers: active=2.0, baer_assessment=1.75, baer_implementation=1.25, in_restoration=1.0
   - Severity weights: critical=4, high=3, moderate=2, low=1
   - 29 tests passing

2. **Delegation Skill** (`agents/coordinator/skills/delegation/`)
   - Query routing to specialist agents (burn-analyst, trail-assessor, cruising-assistant, nepa-advisor)
   - Keyword matching with confidence scoring
   - Smart multi-agent synthesis detection
   - 26 tests passing

3. **API Gateway Integration** (`services/api-gateway/`)
   - `POST /api/v1/chat` endpoint with Delegation skill
   - Returns AgentResponse format with reasoning chain
   - 9 tests passing

4. **Frontend Integration** (`apps/command-console/src/services/aiBriefingService.ts`)
   - Updated to call RANGER API as primary provider
   - Fallback chain: RANGER API → Google Direct → Simulation
   - New env vars: `VITE_RANGER_API_URL`, `VITE_USE_RANGER_API`

### Test Results (All Passing)
- Portfolio Triage: 29 tests
- Delegation: 26 tests
- Chat API: 9 tests
- Integration: 3 tests
- **Total: 67 tests**

### Verified Working
The full stack was tested end-to-end:
- API Gateway on http://localhost:8000
- Frontend on http://localhost:3005
- All query types route correctly to appropriate agents

---

## Pending Review: Anti-Gravity's Documentation Updates

Anti-Gravity (strategic advisor) updated documentation while Phase 1 was being built. These files need review before proceeding:

### Unstaged Documentation Changes
```
M docs/README.md
M docs/_!_PRODUCT-SUMMARY.md
M docs/architecture/DATA-INGESTION-ADAPTERS.md
M docs/architecture/README.md
```

### New Spec Documents (Untracked)
```
docs/architecture/AGENT-FLOWS.md
docs/specs/MCP-IRWIN-SPEC.md
docs/specs/MCP-REGISTRY-STANDARD.md
docs/specs/PROOF-LAYER-DESIGN.md
docs/specs/PROTOCOL-AGENT-COMMUNICATION.md
docs/specs/SKILL-CATEGORY-DEFINITIONS.md
docs/specs/SKILL-VERIFICATION-STANDARD.md
```

**Action Required:** Review these documents for alignment with the implemented architecture (ADR-005) and commit if appropriate.

---

## Key Architecture Documents

- `CLAUDE.md` - Project instructions and code style
- `docs/adr/ADR-005-skills-first-architecture.md` - Skills-First architecture decision
- `docs/specs/skill-format.md` - How to author skills
- `docs/specs/agent-interface.md` - Agent communication protocol
- `docs/_!_IMPLEMENTATION-ROADMAP.md` - Phase planning

---

## Current Branch & Status

```
Branch: feature/coordinator-agent
Last Commit: 19670a7 feat: Phase 1 Coordinator Agent with Skills-First architecture
```

---

## Suggested Next Steps (Phase 2)

Based on the implementation roadmap, Phase 2 priorities include:

1. **Build Specialist Agents** - Implement burn-analyst, trail-assessor with their own skills
2. **MCP Integration** - Connect to NIFC/IRWIN data via MCP servers
3. **Enhanced Coordinator** - Full LLM-powered responses (currently placeholder text)
4. **WebSocket Briefings** - Real-time agent event streaming

---

## How to Start

```bash
# Run all tests
source venv/bin/activate
python -m pytest agents/ services/api-gateway/tests/ -v --override-ini="addopts="

# Start the stack
cd services/api-gateway && uvicorn app.main:app --reload --port 8000
cd apps/command-console && npm run dev

# Integration test
python scripts/test-integration.py
```

---

## First Task for New Session

1. Read and review Anti-Gravity's documentation updates
2. Check alignment with ADR-005 and implemented code
3. Commit documentation if aligned, or flag discrepancies
4. Discuss Phase 2 priorities with user

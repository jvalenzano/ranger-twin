# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Directive
RANGER is an orchestration layer for post-fire forest recovery. **Phase 1 uses simulated data** to prove multi-agent coordination and reasoning transparency.

- **Scope:** Multi-agent orchestration, reasoning visibility, legacy system exports (TRACS, FSVeg)
- **Out of Scope:** Real satellite imagery, CV models, real-time data ingestion
- **Authoritative Document:** `docs/DATA-SIMULATION-STRATEGY.md` defines what is simulated vs. real
- **Naming Convention:** Use context-dependent names: Sidebar (Phases: IMPACT), Panel (Roles: IMPACT ANALYST), Tour (Friendly: Burn Analyst).

## Data Terminology

- **Fixtures** (`data/fixtures/cedar-creek/`): Hand-crafted JSON files simulating Phase 1 upstream data (ACTIVE)
- **Synthetic** (`data/synthetic/`): Reserved for future AI-generated test data (empty in Phase 1)
- **Layers** (`data/layers/`): Reserved for real GeoJSON in Phase 2+ (empty in Phase 1)
- **Mock services** (code only): Frontend service layer stubs (e.g., `mockBriefingService.ts`)

**Phase 1 reality:** Only `fixtures/` contains active data. Other directories are placeholders.

**Skills-First Architecture (Primary):**
- **Orchestration:** Google ADK + Gemini Runtime.
- **Skills Library:** Domain expertise packaged in `skills/`.
- **Agents:** Specialized agents in `agents/` using shared skills.
- **Data:** MCP servers in `mcp/` (NIFC, Fixtures, etc.).

**Legacy/Reference Architecture:**
- **Frontend-Led Demo:** `src/services/aiBriefingService.ts` handles log in the browser.
- **Microservices:** Old FastAPI agent services in `services/agents/` (REFERENCE ONLY).

**Key Contracts:**
- `docs/specs/skill-format.md` - Skill structure and metadata
- `docs/specs/agent-interface.md` - Agent communication protocol
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` - AgentBriefingEvent JSON schema
- `docs/architecture/BRIEFING-UX-SPEC.md` - UI rendering spec

## Commands

```bash
# Frontend development
cd apps/command-console && npm run dev

# TypeScript validation
cd apps/command-console && npm run typecheck

# Linting
cd apps/command-console && npm run lint

# Agent development (Google ADK)
pip install google-adk
export GOOGLE_API_KEY=your_key_here
cd agents && adk run coordinator       # CLI mode
cd agents && adk web --port 8000       # Web UI mode

# Backend development (legacy)
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Full stack (Docker)
docker-compose up -d

# Run tests
pytest agents/ -v                       # Agent tests
pytest skills/ -v                       # Skill tests
```

## Project Structure

```
apps/
  command-console/     # React + Vite + Tailwind (desktop UI)
agents/                # NEW: Skills-First agents (ADK)
skills/                # NEW: Domain expertise library
mcp/                   # NEW: Model Context Protocol servers
packages/
  skill-runtime/       # Skill loading/execution utilities
  twin-core/           # Shared Python models
services/
  agents/              # LEGACY: FastAPI agent services (for reference)
data/
  fixtures/            # Phase 1: Cedar Creek simulation data (ACTIVE)
docs/
  specs/               # NEW: Technical specifications
  architecture/        # System design specs
```

## State Management

Frontend uses Zustand stores in `apps/command-console/src/stores/`:
- `chatStore` - Messages, agent responses, reasoning chains
- `briefingStore` - AgentBriefingEvent display
- `mapStore` - Camera, layers, terrain
- `lifecycleStore` - Workflow steps
- `analysisHistoryStore` - Site Analysis reports & persistence
- `preferencesStore` - User settings (tooltips, etc.)
- `missionStore` - National fire portfolio, filters, selected fire (v2 with phase migration)

## Code Style

- **Design aesthetic:** "Tactical Futurism" - dark mode, glassmorphism, high contrast
- **Component Style:** Functional React components with hooks. Lucid React icons.
- **Agent responses:** Must include confidence scores, citations, and reasoning chains (proof layer)

## Domain Model: Fire Phases

Fire lifecycle follows a **4-phase model** aligned with practitioner terminology:

| Phase | Abbrev | Color | Multiplier | Description |
|-------|--------|-------|------------|-------------|
| `active` | ACT | Red (#ef4444) | 2.0 | Fire burning - highest priority |
| `baer_assessment` | ASM | Amber (#f59e0b) | 1.75 | 7-day BAER window - time-critical |
| `baer_implementation` | IMP | Yellow (#eab308) | 1.25 | BAER treatments underway |
| `in_restoration` | RST | Green (#10b981) | 1.0 | Long-term recovery baseline |

**Key types in `src/types/mission.ts`:**
- `FirePhase` - Union of 4 phase literals
- `PHASE_DISPLAY` - Labels, abbreviations, colors
- `PHASE_MULTIPLIERS` - Triage score weights
- `calculateTriageScore()` - Severity × Size × Phase
- `getDeltaDirection()` - 24h escalation tracking

## Skills-First Agent Architecture (ADR-005)

RANGER uses a Skills-First Multi-Agent Architecture where domain expertise is
packaged as portable Skills that enhance Agents running on Google ADK.

### Agent Roster

| Agent | Role | Location |
|-------|------|----------|
| **Coordinator** | Root orchestrator, delegation, synthesis | `agents/coordinator/` |
| **Burn Analyst** | Fire severity, MTBS, soil burn | `agents/burn-analyst/` |
| **Trail Assessor** | Infrastructure damage, closures | `agents/trail-assessor/` |
| **Cruising Assistant** | Timber inventory, salvage | `agents/cruising-assistant/` |
| **NEPA Advisor** | Compliance, CE/EA/EIS pathways | `agents/nepa-advisor/` |

### Skills Library

```
skills/
├── foundation/            # Cross-agency (NEPA, geospatial)
│   ├── greeting/          # Example skill
│   └── _template/         # Skill template
└── forest-service/        # Agency-specific (BAER, MTBS)

agents/[name]/skills/      # Agent-specific skills
```

### Agent Directory Structure

Each agent follows this pattern:
```
agent-name/
├── agent.py          # ADK Agent definition (exports root_agent)
├── config.yaml       # Runtime configuration
├── __init__.py       # Package marker
├── .env.example      # Environment template
├── skills/           # Agent-specific skills
└── tests/            # pytest test suite
```

### Key Specifications

- `docs/specs/skill-format.md` - How to author skills
- `docs/specs/agent-interface.md` - Agent contracts and lifecycle
- `docs/adr/ADR-005-skills-first-architecture.md` - Full architecture decision

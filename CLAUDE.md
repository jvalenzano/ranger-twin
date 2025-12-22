# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Directive
RANGER is an orchestration layer for post-fire forest recovery. **Phase 1 uses simulated data** to prove multi-agent coordination and reasoning transparency.

- **Scope:** Multi-agent orchestration, reasoning visibility, legacy system exports (TRACS, FSVeg)
- **Out of Scope:** Real satellite imagery, CV models, real-time data ingestion
- **Authoritative Document:** `docs/DATA-SIMULATION-STRATEGY.md` defines what is simulated vs. real
- **Naming Convention:** Use context-dependent names: Sidebar (Phases: IMPACT), Panel (Roles: IMPACT ANALYST), Tour (Friendly: Burn Analyst).

## Architecture

**Pattern:** Google ADK Coordinator/Dispatcher

```
Recovery Coordinator (Root Orchestrator, port 8005)
├── BurnAnalyst (port 8001) - Burn severity → Gemini briefing
├── TrailAssessor (port 8002) - Trail damage → Work orders
├── CruisingAssistant (port 8003) - Timber plots → FSVeg export
└── NEPAAdvisor (port 8004) - Regulatory context → Compliance guidance
```

**Data Flow:** Static JSON fixtures → Agents (real Gemini reasoning) → UI via AgentBriefingEvent

**Key Contracts:**
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` - AgentBriefingEvent JSON schema
- `docs/architecture/BRIEFING-UX-SPEC.md` - UI rendering spec (4 event types: map_highlight, rail_pulse, panel_inject, modal_interrupt)

**Data & Integration Docs:**
- `docs/architecture/FIXTURE-DATA-FORMATS.md` - Phase 1 fixture schemas (burn severity, trail damage, timber plots)
- `docs/architecture/DATA-INGESTION-ADAPTERS.md` - External data source adapter architecture
- `docs/research/PUBLIC-API-INVENTORY.md` - NIFC, NASA FIRMS, MTBS, InciWeb, IRWIN API research
- `docs/research/USFS-INTERVIEW-MATERIALS.md` - Stakeholder interview templates

**Integration Philosophy:** RANGER is the "nerve center, not the sensors." Field Companion is a demo tool; production data comes from existing USFS systems (Survey123, Collector, IRWIN) via adapters.

## Commands

```bash
# Full stack (Docker)
docker-compose up -d
# Frontend: http://localhost:5173 | API: http://localhost:8000/docs

# Frontend development
cd apps/command-console && pnpm dev

# Backend development
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Individual agent (example)
cd services/agents/burn-analyst && python -m burn_analyst.main

# TypeScript validation
cd apps/command-console && pnpm typecheck

# Find unused exports
cd apps/command-console && npx knip

# Python tests with coverage
pytest

# Python formatting/linting
black packages/ services/ && ruff check packages/ services/
```

## Project Structure

```
apps/
  command-console/     # React + Vite + Tailwind (desktop UI)
  field-companion/     # React PWA (mobile)
services/
  api-gateway/         # FastAPI router (port 8000)
  agents/              # 5 FastAPI agent services (ports 8001-8005)
packages/
  twin-core/           # Shared Python: models, geo utils, clients
  agent-common/        # Shared agent base classes, prompt loader, Gemini client
  ui-components/       # Shared React components
data/
  fixtures/            # Simulated input data (Cedar Creek fire) - see FIXTURE-DATA-FORMATS.md
  layers/              # GeoJSON (fire perimeter, severity, trails, plots)
docs/
  architecture/        # System design specs (agents, adapters, UX)
  research/            # API inventory, interview materials
```

## State Management

Frontend uses Zustand stores in `apps/command-console/src/stores/`:
- `chatStore` - Messages, agent responses, reasoning chains
- `briefingStore` - AgentBriefingEvent display
- `mapStore` - Camera, layers, terrain
- `lifecycleStore` - Workflow steps (Impact → Damage → Timber → Compliance)

## Code Style

- **Design aesthetic:** "Tactical Futurism" - dark mode, glassmorphism, high contrast, monospace fonts
- **Phase 1 fixtures:** Hardcode simulated data to unblock UI/orchestration work
- **Agent responses:** Must include confidence scores, citations, and reasoning chains (proof layer)

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

## Architecture

**Hybrid Architecture (Frontend-Led Demo):**
- **Orchestration:** `src/services/aiBriefingService.ts` handles logic in the browser.
- **Routing:**
    - **General Queries**: OpenRouter (`google/gemini-2.0-flash-exp:free` -> `google/gemma-2-9b-it:free`)
    - **NEPA RAG**: Direct Google API (`gemini-2.0-flash-exp`) for private RAG context.

**Backend Microservices (Reference Implementation):**
```
Recovery Coordinator (Root Orchestrator, port 8005)
├── BurnAnalyst (port 8001)
├── TrailAssessor (port 8002)
├── CruisingAssistant (port 8003)
└── NEPAAdvisor (port 8004)
```

**Key Contracts:**
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` - AgentBriefingEvent JSON schema
- `docs/architecture/BRIEFING-UX-SPEC.md` - UI rendering spec (4 event types)

**Data & Integration Docs:**
- `docs/architecture/FIXTURE-DATA-FORMATS.md` - Phase 1 fixture schemas
- `docs/research/APIs_AND_DATASETS.md` - API strategy for Phase 2

## Commands

```bash
# Frontend development
cd apps/command-console && npm run dev

# TypeScript validation
cd apps/command-console && npm run typecheck

# Linting
cd apps/command-console && npm run lint

# Backend development
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Full stack (Docker)
docker-compose up -d
```

## Project Structure

```
apps/
  command-console/     # React + Vite + Tailwind (desktop UI)
    scripts/           # Verification utilities (e.g., verify-openrouter.js)
  field-companion/     # React PWA (mobile - Planned)
services/
  api-gateway/         # FastAPI router
  agents/              # 5 FastAPI agent services
packages/
  twin-core/           # Shared Python models
data/
  fixtures/            # Phase 1: Cedar Creek simulation data (ACTIVE)
docs/
  architecture/        # System design specs
  features/            # Feature specifications & checklists
  research/            # API inventory
```

## State Management

Frontend uses Zustand stores in `apps/command-console/src/stores/`:
- `chatStore` - Messages, agent responses, reasoning chains
- `briefingStore` - AgentBriefingEvent display
- `mapStore` - Camera, layers, terrain
- `lifecycleStore` - Workflow steps
- `analysisHistoryStore` - Site Analysis reports & persistence
- `preferencesStore` - User settings (tooltips, etc.)

## Code Style

- **Design aesthetic:** "Tactical Futurism" - dark mode, glassmorphism, high contrast
- **Component Style:** Functional React components with hooks. Lucid React icons.
- **Agent responses:** Must include confidence scores, citations, and reasoning chains (proof layer)

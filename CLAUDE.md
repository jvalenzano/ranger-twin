# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

**RANGER** is an agent-first digital twin platform for post-fire forest recovery, built for the US Forest Service.

- **Philosophy**: 100% open source stack; 80% investment in AI agents, 20% in UI
- **Tagline**: "Recovery at the speed of insight."

### Vision Statement
> **RANGER is an Agentic OS for Natural Resource Recovery**, built on open-source infrastructure and Google ADK orchestration. It transforms siloed fire data into coordinated intelligence through a multi-agent crew.

- **Proof of Concept**: Cedar Creek Fire (Willamette NF, Oregon, 2022) — ~127,000 acres

For complete project vision, see `docs/PROJECT-BRIEF.md`.

## The Crew: One Root Coordinator, Four Specialists

RANGER uses the **Google ADK Coordinator/Dispatcher Pattern**. The **Recovery Coordinator** (Root) oversees four specialized sub-agents:

| Agent | Directory | Role |
|-------|-----------|------|
| **Recovery Coordinator** | `services/agents/recovery-coordinator/` | **Root Agent** (Orchestration & Dispatch) |
| **Burn Analyst** | `services/agents/burn-analyst/` | Sub-agent: Satellite burn severity |
| **Trail Assessor** | `services/agents/trail-assessor/` | Sub-agent: AI-powered trail damage |
| **Cruising Assistant** | `services/agents/cruising-assistant/` | Sub-agent: Multimodal timber inventory |
| **NEPA Advisor** | `services/agents/nepa-advisor/` | Sub-agent: Regulatory guidance (RAG) |

**Naming convention** (per ADR-002):
- Code: `BurnAnalyst`, `TrailAssessor`, `CruisingAssistant`, `NEPAAdvisor`
- UI: "Burn Analyst", "Trail Assessor", "Cruising Assistant", "NEPA Advisor"
- Docs: "The Burn Analyst", "The Trail Assessor", etc.

For agent specs, see `docs/agents/` and `docs/PROJECT-BRIEF.md` section 3.

## System Architecture

### Multi-Agent Hierarchy (Google ADK)
The **Command Console UI** renders the output; the **Recovery Coordinator** handled the logic.
- **Root**: `RecoveryCoordinator` (LlmAgent)
- **Leaves**: `BurnAnalyst`, `TrailAssessor`, `CruisingAssistant`, `NEPAAdvisor` (Sub-agents)

```
Console (UI) → Recovery Coordinator (Root)
                    ├── Burn Analyst (Sub-agent)
                    ├── Trail Assessor (Sub-agent)
                    ├── Cruising Assistant (Sub-agent)
                    └── NEPA Advisor (Sub-agent)
```

### Monorepo Structure

```
ranger/
├── apps/
│   ├── command-console/       # React desktop UI ("Tactical Futurism")
│   └── field-companion/       # Mobile PWA for field data capture
├── services/
│   ├── api-gateway/           # FastAPI main router
│   └── agents/                # AI agent implementations
├── packages/
│   ├── twin-core/             # Shared Python utilities
│   ├── ui-components/         # Shared React components
│   └── agent-common/          # Shared agent utilities
├── infrastructure/            # Terraform, Docker
├── data/                      # GeoJSON, GeoTIFF, PDFs (Git LFS)
└── docs/                      # All documentation
```

## Development Commands

```bash
# Frontend
cd apps/command-console && pnpm dev

# Backend API
cd services/api-gateway && uvicorn app.main:app --reload

# Run agent
cd services/agents/burn-analyst && python -m burn_analyst.main

# Tests
pytest services/
cd apps/command-console && pnpm test

# Code quality
black services/ packages/
ruff check services/ packages/
cd apps/command-console && pnpm lint && pnpm typecheck
```

## Tech Stack (Quick Reference)

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, TypeScript, Vite, Tailwind, MapLibre GL, deck.gl |
| Backend | FastAPI, PostgreSQL + PostGIS, Redis, Celery, pgvector |
| AI/ML | Gemini 2.0 Flash, LangChain, YOLOv8, SAM2, Whisper, geemap |
| Cloud | GCP (Cloud Run, Cloud SQL, Vertex AI) — FedRAMP High |

For detailed stack decisions, see `docs/adr/ADR-001-tech-stack.md`.

## Key Documentation

| Need | Document |
|------|----------|
| Full project vision | `docs/PROJECT-BRIEF.md` |
| Brand/naming rules | `docs/brand/BRAND-ARCHITECTURE.md` |
| UI design direction | `docs/architecture/UX-VISION.md` |
| GCP infrastructure | `docs/architecture/GCP-ARCHITECTURE.md` |
| Tool inventory | `docs/architecture/OPEN-SOURCE-INVENTORY.md` |
| Next steps | `docs/NEXT-SESSION.md` |

## Design System

**"Tactical Futurism"** — F-35 cockpit meets National Geographic.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-safe` | `#10B981` | Success, low severity |
| `--color-warning` | `#F59E0B` | Moderate, caution |
| `--color-severe` | `#EF4444` | High severity, critical |
| `--color-background` | `#0F172A` | Dark canvas |
| `--color-surface` | `#1E293B` | Panel backgrounds |

- Dark mode only
- Glassmorphism (translucent panels with backdrop blur)
- See `docs/architecture/UX-VISION.md` for mockups

## Agent API Pattern

All agents expose a consistent interface:

```python
response = await agent.query(
    question="What percentage is high severity?",
    context={"fire_id": "cedar-creek-2022"}
)
# Returns: answer, confidence, sources, suggestions
```

## Environment Variables

```bash
GCP_PROJECT_ID=ranger-twin
GCP_REGION=us-east4
DATABASE_URL=postgresql://...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

## Federal Compliance

- **FedRAMP High** services only
- **Region**: `us-east4` (Northern Virginia)
- **Encryption**: FIPS 140-2 at rest and in transit

## Git Workflow

- **Main branch**: `main` (protected)
- **Development**: `develop`
- **Features**: `feature/description`
- **Large files**: Git LFS (GeoJSON, GeoTIFF, PDF)

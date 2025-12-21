# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

**RANGER** is an Agentic OS for post-fire forest recovery—a nerve center that orchestrates AI agents to transform siloed data into coordinated intelligence.

- **Philosophy**: We are the brain, not the sensors. Orchestration over perception.
- **Tagline**: "Recovery at the speed of insight."
- **Proof of Concept**: Cedar Creek Fire (Willamette NF, Oregon, 2022)

### Critical Context

**Phase 1 uses simulated data.** We are proving that multi-agent orchestration creates value, not that we can process satellite imagery or detect trail damage from video. See `docs/DATA-SIMULATION-STRATEGY.md` for the authoritative scope.

## The Crew: One Coordinator, Four Specialists

RANGER uses the **Google ADK Coordinator/Dispatcher Pattern**:

```
Command Console (UI)
        │
        ▼
Recovery Coordinator (Root Agent)
        │
        ├── Burn Analyst (IMPACT)
        ├── Trail Assessor (DAMAGE)
        ├── Cruising Assistant (TIMBER)
        └── NEPA Advisor (COMPLIANCE)
```

The Coordinator routes queries, synthesizes cross-agent insights, and maintains session state. Sub-agents receive **simulated data** and produce **real reasoning** via Gemini.

**Naming convention** (per ADR-002):
- Code: `BurnAnalyst`, `TrailAssessor`, `CruisingAssistant`, `NEPAAdvisor`
- UI: "Burn Analyst", "Trail Assessor", "Cruising Assistant", "NEPA Advisor"

## Key Documents (Start Here)

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | `docs/DATA-SIMULATION-STRATEGY.md` | **Authoritative scope** — what's simulated vs. real |
| 2 | `docs/PROJECT-BRIEF.md` | Vision, agent roles, strategic context |
| 3 | `docs/assets/USER-JOURNEYS-AND-PERSONAS.md` | Sarah, Marcus, Elena, Dr. Park workflows |
| 4 | `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` | AgentBriefingEvent contract |
| 5 | `docs/agents/RECOVERY-COORDINATOR-SPEC.md` | Root agent implementation |

For documentation cleanup tasks, see `docs/audit/DOCUMENTATION-CLEANUP.md`.

## Monorepo Structure

```
ranger/
├── apps/
│   └── command-console/       # React desktop UI
├── services/
│   ├── api-gateway/           # FastAPI router
│   └── agents/                # Agent implementations
├── packages/
│   └── agent-common/          # Shared agent utilities
├── data/
│   └── fixtures/              # Simulated data for Cedar Creek
└── docs/                      # Documentation
```

## Development Commands

```bash
# Frontend
cd apps/command-console && pnpm dev

# Backend API
cd services/api-gateway && uvicorn app.main:app --reload

# Tests
pytest services/
cd apps/command-console && pnpm test
```

## Design System

**"Tactical Futurism"** — Dark mode, glassmorphism, emergency color palette.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-safe` | `#10B981` | Low severity |
| `--color-warning` | `#F59E0B` | Moderate |
| `--color-severe` | `#EF4444` | Critical |
| `--color-background` | `#0F172A` | Dark canvas |
| `--color-surface` | `#1E293B` | Panels |

## What We're Proving (Phase 1)

- Multi-agent coordination works
- Reasoning transparency builds trust
- Cross-lifecycle synthesis creates value
- Legacy export compatibility is achievable
- The "Nervous System" UX is compelling

## What We're NOT Building (Phase 1)

- Satellite imagery pipelines
- Computer vision models
- Field capture mobile apps
- Real-time data ingestion

These are future capabilities. Phase 1 proves the orchestration layer.

## Git Workflow

- **Main branch**: `main` (protected)
- **Development**: `develop`
- **Features**: `feature/description`

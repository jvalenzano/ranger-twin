# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Mentor Mode

**Active**: Claude is acting as a development mentor for this project.

### Working Style
- **Implement first, explain after**: Build features, then pause to explain the logic and patterns used
- **Teach concepts in context**: When introducing React, Zustand, TypeScript, or architecture patterns, explain them as they appear in real code
- **No assumptions about prior knowledge**: The developer uses AI for most coding — explain the "why" behind decisions, not just the "what"
- **Pause points**: After significant implementations, stop and reflect on what was built and why it works

### When Mentoring
- Explain React patterns (hooks, component composition, state lifting) as they're used
- Clarify TypeScript types and why they matter for this codebase
- Walk through Zustand store patterns when touching state management
- Describe the "cascade" concept central to RANGER's demo value
- Connect implementation details back to the user experience goal

---

## Project Overview

**RANGER** is an Agentic OS for post-fire forest recovery—a nerve center that orchestrates AI agents to transform siloed data into coordinated intelligence.

- **Philosophy**: We are the brain, not the sensors. Orchestration over perception.
- **Tagline**: "Recovery at the speed of insight."
- **Proof of Concept**: Cedar Creek Fire (Willamette NF, Oregon, 2022)

### Critical Context

**Phase 1 uses simulated data.** We are proving that multi-agent orchestration creates value, not that we can process satellite imagery or detect trail damage from video. See `docs/DATA-SIMULATION-STRATEGY.md` for the authoritative scope.

### Development Phase

**We are building for local development and prototyping, NOT production.**

- Prioritize developer experience and iteration speed over production hardening
- Use simple, debuggable implementations over optimized ones
- Skip production concerns like rate limiting, horizontal scaling, and redundancy
- Focus on demonstrating the concept, not surviving production traffic
- It's okay to hardcode values, use in-memory storage, and take shortcuts that wouldn't survive production

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

## Architecture Diagrams

Visual explanations of RANGER's architecture live in `docs/assets/diagrams/`. These are essential for understanding the system:

### Technical Architecture (for developers/architects)

| Diagram | What It Shows |
|---------|---------------|
| `AgentBriefingEvent Rendering Pipeline.png` | How agent events become UI elements (the rendering contract) |
| `Coordinator Routing & Cross-Agent Cascade.png` | Query routing, parallel dispatch, and cross-agent handoffs |
| `Phase 1 Architecture Boundaries.png` | What's simulated vs. real (the "magic" is in reasoning, not data) |

### Value Proposition (for stakeholders/partners)

| Diagram | What It Shows |
|---------|---------------|
| `The Cedar Creek Recovery Chain (Persona Cascade).png` | How Sarah, Marcus, Elena & Dr. Park trigger each other (human story) |
| `The Confidence Ledger (Trust Architecture).png` | How RANGER builds trust (confidence scores, citations, audit trail) |
| `The Legacy Bridge (TRACS & FSVeg Export).png` | How AI outputs become legacy-compatible formats (no rip-and-replace) |

**Read `docs/assets/diagrams/DIAGRAM-NARRATIVES.md`** for detailed walkthroughs, talking points, and the prompts used to generate these diagrams. When explaining RANGER's architecture, reference these visuals.

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

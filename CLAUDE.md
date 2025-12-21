# CLAUDE.md
**Context:** RANGER Agentic OS (Phase 1 Simulation)

## Core Directive: "The Nerve Center"
RANGER is an orchestration layer, not a perception engine. **Phase 1 uses simulated data.**
- **Scope:** Prove multi-agent coordination, reasoning transparency, and legacy compatibility.
- **Out of Scope:** Real satellite imagery, CV models, field apps, real-time ingestion.
- **Mode:** Build for local prototyping (debuggable, simple), not production hardening.

## Architecture & Naming
**Pattern:** Google ADK Coordinator/Dispatcher.
- **Root:** Recovery Coordinator (Orchestrator)
- **Specialists:**
  - `BurnAnalyst` (IMPACT)
  - `TrailAssessor` (DAMAGE)
  - `CruisingAssistant` (TIMBER)
  - `NEPAAdvisor` (COMPLIANCE)

**Tech Stack:**
- **Frontend:** React + Tailwind (`apps/command-console`)
- **Backend:** FastAPI Gateway + Agents (`services/`)
- **Map:** MapLibre GL JS (Cedar Creek, Oregon)

## Critical Documents
- `docs/DATA-SIMULATION-STRATEGY.md`: **Authoritative Scope** (What is simulated).
- `docs/PROJECT-BRIEF.md`: Strategic vision.
- `docs/agents/RECOVERY-COORDINATOR-SPEC.md`: Root agent logic.

## Commands
```bash
# Frontend
cd apps/command-console && pnpm dev

# Backend
cd services/api-gateway && uvicorn app.main:app --reload

# Code Audit
npx knip (in apps/command-console)
npx tsc --noEmit (in apps/command-console)
```

## Mentor Code Style
- **Teach in Context:** Explain patterns (Zustand, React hooks) as they are used.
- **Tactical Futurism:** Design for "Emergency OS" aesthetic (Dark mode, monospaced, high contrast).
- **Simulate Responsibly:** Hardcode fixtures where necessary to unblock UI/Orchestration work.

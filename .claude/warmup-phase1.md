# RANGER Phase 1 Warm-up Prompt

Copy and paste this to start your next Claude Code session:

---

## Context

I'm continuing work on RANGER, an AI platform for USDA Forest Service post-fire recovery. We just completed **Phase 0** which established the Skills-First architecture foundation.

## What Was Done (Phase 0)

- Created 5 agent directories in `agents/` (coordinator, burn-analyst, trail-assessor, cruising-assistant, nepa-advisor)
- Each agent has: agent.py, config.yaml, __init__.py, .env.example, skills/, tests/
- Created `skills/foundation/greeting/` as example skill
- Created comprehensive specs: `docs/specs/skill-format.md` and `docs/specs/agent-interface.md`
- Added google-adk>=1.0.0 to pyproject.toml
- Created verification script: `scripts/verify-adk.py`
- Branch: `feature/phase-0-foundation` (2 commits ahead of develop)

## What's Next (Phase 1: Coordinator Agent)

Per `docs/_!_IMPLEMENTATION-ROADMAP.md`, Phase 1 involves:

1. **Implement Coordinator agent in ADK** - Make it actually work with Google ADK
2. **Build Delegation skill** - Routes queries to appropriate specialists
3. **Build Portfolio Triage skill** - Prioritizes fires, generates summaries
4. **Build User Interaction skill** - Conversation patterns, response formatting
5. **Create agent ↔ UI API endpoint** - FastAPI route for chat messages
6. **Integrate with existing chat interface** - Connect UI to Coordinator

## Key Files to Review

- `docs/_!_IMPLEMENTATION-ROADMAP.md` - Full roadmap with Phase 1 details
- `docs/adr/ADR-005-skills-first-architecture.md` - Architecture decisions
- `agents/coordinator/agent.py` - Current coordinator template
- `docs/specs/skill-format.md` - How to author skills

## Prerequisites

Before starting Phase 1:
```bash
pip install google-adk
export GOOGLE_API_KEY=your_key_here
python scripts/verify-adk.py  # Should pass all checks
```

## Starting Point

Please review the implementation roadmap Phase 1 section and help me begin implementing the Coordinator agent with its first skill (Delegation or Portfolio Triage).

---

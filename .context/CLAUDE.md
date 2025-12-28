# CLAUDE.md - RANGER Agent Context

> **Token Budget:** ~1000 tokens | **Last Updated:** December 2025  
> **Note:** This is the streamlined reference. See [`../CLAUDE.md`](../CLAUDE.md) for extended context, examples, and troubleshooting.

## What Is RANGER

AI-powered coordination platform for post-fire forest recovery. Multi-agent system built on Google ADK + Gemini 2.0 Flash. Phase 1 uses simulated Cedar Creek Fire data.

## Architecture (ADR-005: Skills-First)

```
┌─────────────────────────────────────────┐
│  Recovery Coordinator (ADK Root Agent)  │
├─────────────────────────────────────────┤
│  Burn Analyst │ Trail Assessor │ NEPA   │  ← Specialist Agents
│  Cruising Assistant                     │
├─────────────────────────────────────────┤
│  Skills Library (agents/*/skills/)      │  ← Domain Expertise
├─────────────────────────────────────────┤
│  MCP Servers (data connectivity)        │  ← IRWIN, Fixtures
└─────────────────────────────────────────┘
```

**Key insight:** Value lives in Skills, not Agents. Skills are portable expertise packages.

## Critical Constraints

### ADK Naming (WILL BREAK IF VIOLATED)
- Agent directories: **underscores** (`cruising_assistant` ✓, `cruising-assistant` ✗)
- Tool parameters: **primitives only** (`str`, `int`, `bool`, `list[str]`)
- Complex data: Use JSON strings, not `dict` or `list[dict]`

### LLM Strategy (ADR-006)
- **Google Gemini only** - No OpenRouter, no fallbacks
- Single `GOOGLE_API_KEY` for all components

### Data (Phase 1)
- Fixtures only: `data/fixtures/cedar-creek/`
- Everything else is placeholder for Phase 2+

## Commands

```bash
# Frontend
cd apps/command-console && npm run dev

# ADK Agents (local)
source .venv/bin/activate && python main.py

# ADK Web UI
cd agents && adk web --port 8000

# Tests
pytest agents/ -v  # 606 tests
```

## Where to Find Things

| Need | Location |
|------|----------|
| Architecture decisions | `docs/adr/` |
| Current specs | `docs/specs/` |
| Agent implementation | `agents/<name>/agent.py` |
| Skills | `agents/<name>/skills/` |
| ADK patterns | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |
| Deployment | `docs/deployment/` |

## Don't Touch Without Reading

1. `docs/adr/ADR-005-skills-first-architecture.md` - Core paradigm
2. `docs/adr/ADR-007.1-tool-invocation-strategy.md` - Prevents infinite loops
3. `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` - Common pitfalls

## Out of Scope (Phase 1)

- Real satellite imagery
- CV/ML models
- Real-time data ingestion
- Production USFS integration

---

*For extended context, see `.context/architecture.md` and `docs/` tree*

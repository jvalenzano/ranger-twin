# RANGER Architecture - Current State

> **Token Budget:** ~500 tokens | **Last Updated:** December 2025

## System Components

### Frontend
- **Command Console:** React + Vite + Tailwind (`apps/command-console/`)
- **State:** Zustand stores (chat, briefing, map, mission, preferences)
- **Design:** "Tactical Futurism" - dark mode, glassmorphism, data-dense

### Backend
- **Orchestrator:** FastAPI + ADK (`main.py`)
- **Agents:** 5 ADK agents in `agents/` directory
- **MCP Servers:** Data connectivity in `mcp/`

### Agent Roster

| Agent | Model | Skills Count |
|-------|-------|--------------|
| Coordinator | gemini-2.0-flash | 2 (delegation, portfolio-triage) |
| Burn Analyst | gemini-2.0-flash | 3 |
| Trail Assessor | gemini-2.0-flash | 3 |
| Cruising Assistant | gemini-2.0-flash | 4 |
| NEPA Advisor | gemini-2.5-flash | 4 |

**Total:** 16 skills across 5 agents

### Data Flow

```
User Query → Coordinator → [Specialist Agent(s)] → Skills → MCP → Fixtures
                ↓
         AgentBriefingEvent (SSE)
                ↓
         Command Console UI
```

### Cloud Infrastructure (GCP)
- **Project:** `ranger-twin-dev`
- **Region:** `us-central1`
- **Compute:** Cloud Run (serverless)
- **Auth:** Application Default Credentials (dev), Service Account (prod)

## Key Decisions (ADRs)

| ADR | Decision | Status |
|-----|----------|--------|
| 005 | Skills-First Architecture | Active |
| 006 | Google-Only LLM | Active |
| 007.1 | Tool Invocation (mode=AUTO) | Active |
| 008 | AgentTool Pattern | Active |
| 009 | Fixture-First Development | Active |

## Fire Domain Model

| Phase | Abbrev | Multiplier |
|-------|--------|------------|
| Active | ACT | 2.0x |
| BAER Assessment | ASM | 1.75x |
| BAER Implementation | IMP | 1.25x |
| In Restoration | RST | 1.0x |

Triage Score = Severity × Size × Phase Multiplier

---

*For full architecture docs, see `docs/architecture/`*

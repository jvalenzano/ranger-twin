# CLAUDE.md — Quick Reference

## What Is RANGER
AI coordination platform for post-fire forest recovery. Google ADK + Gemini 2.0 Flash. Phase 1 = simulated Cedar Creek data.

## Architecture
```
Coordinator → [Burn Analyst | Trail Assessor | NEPA Advisor | Cruising Assistant]
     ↓                              ↓
Skills Library              Vertex AI RAG (4 corpora)
     ↓
MCP Servers (data)
```

## Critical Constraints (WILL BREAK)

| Rule | Example |
|------|---------|
| Agent dirs = underscores | `cruising_assistant` ✓ `cruising-assistant` ✗ |
| Tool params = primitives | `str`, `int`, `bool` ✓ `list[dict]` ✗ |
| Tool mode = AUTO | `mode="AUTO"` ✓ `mode="ANY"` ✗ (infinite loops) |
| RAG auth = ADC | `GenerativeModel()` ✓ `Client(api_key=)` ✗ |
| Docker = AMD64 | `--platform linux/amd64` (M-series Mac) |
| Console build = app dir | `cd apps/command-console && docker build` |

## Pre-Flight (ALWAYS RUN FIRST)
```bash
cd /Users/jvalenzano/Projects/ranger-twin && pwd
ls Dockerfile services/mcp-fixtures/Dockerfile apps/command-console/Dockerfile
docker info | /usr/bin/grep -q "Server Version" && echo "Docker OK"
```

## Commands
```bash
cd apps/command-console && npm run dev     # Frontend
source .venv/bin/activate && python main.py  # ADK local
cd agents && adk web --port 8000           # ADK web UI
pytest agents/ -v                          # Tests
```

## Where To Find Things

| Need | Location |
|------|----------|
| ADRs | `docs/adr/` |
| ADK patterns | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |
| Agents | `agents/<name>/agent.py` |
| Skills | `agents/<name>/skills/` |
| Fixtures | `data/fixtures/cedar-creek/` |
| Terraform | `infrastructure/terraform/` |

## Read Before Touching
1. `docs/adr/ADR-005-skills-first-architecture.md`
2. `docs/adr/ADR-007.1-tool-invocation-strategy.md`
3. `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md`

## GCP
- Project: `ranger-twin-dev`
- Deploy: `us-west1`
- RAG: `europe-west3`
- Registry: `us-west1-docker.pkg.dev/ranger-twin-dev/ranger-images`

## Shell Gotcha
`grep` → aliased to `rg`. Use `/usr/bin/grep` for standard behavior.

# CLAUDE.md

> **Token-optimized version:** See [`.context/CLAUDE.md`](.context/CLAUDE.md) for quick reference (~100 lines).

## What Is RANGER

RANGER is an AI-powered coordination platform for post-fire forest recovery. Multi-agent system built on Google ADK + Gemini 2.0 Flash. **Phase 1 uses simulated Cedar Creek Fire data** to prove multi-agent coordination and reasoning transparency.

**Out of scope (Phase 1):** Real satellite imagery, CV models, real-time data ingestion, production USFS integration.

## Architecture

```
┌─────────────────────────────────────────────────┐
│     Recovery Coordinator (ADK Root Agent)       │
├─────────────────────────────────────────────────┤
│  Burn Analyst │ Trail Assessor │ NEPA Advisor   │  ← Specialists
│  Cruising Assistant                             │
├─────────────────────────────────────────────────┤
│  Skills Library (agents/*/skills/)              │  ← Domain Expertise
├─────────────────────────────────────────────────┤
│  MCP Servers (data connectivity)                │  ← IRWIN, Fixtures
├─────────────────────────────────────────────────┤
│  Vertex AI RAG (4 corpora, europe-west3)        │  ← Knowledge Base
└─────────────────────────────────────────────────┘
```

**Key insight (ADR-005):** Value lives in Skills, not Agents. Skills are portable expertise packages.

## Critical Constraints (WILL BREAK IF VIOLATED)

### 1. ADK Directory Naming
Agent directories MUST use **underscores**: `cruising_assistant` ✓, `cruising-assistant` ✗

### 2. ADK Tool Parameter Types
Gemini rejects complex types. Use primitives only.
```python
# ❌ WRONG - causes 400 errors
def my_tool(items: list[dict]) -> dict: ...

# ✓ CORRECT - use JSON string
def my_tool(items_json: str = "[]") -> dict: ...
```

### 3. ADK Tool Invocation Mode (ADR-007.1)
Always use `mode="AUTO"`. Never use `mode="ANY"` (causes infinite loops).

### 4. RAG Authentication (ADR-011)
Use ADC (Application Default Credentials), not API keys.
```python
# ✓ CORRECT - Pattern A
from vertexai.generative_models import GenerativeModel
model = GenerativeModel("gemini-2.0-flash-001")
```

### 5. Docker Platform (M-series Mac)
Cloud Run requires AMD64. Always specify platform:
```bash
docker build --platform linux/amd64 ...
```

### 6. Console Build Context
Console Dockerfile requires nginx.conf in context. Build FROM app directory:
```bash
cd apps/command-console && docker build ...  # ✓ CORRECT
docker build -f apps/command-console/Dockerfile .  # ✗ WRONG
```

## Pre-Flight Checks (Run Before ANY Build/Deploy)

```bash
# 1. Verify working directory
cd /Users/jvalenzano/Projects/ranger-twin && pwd

# 2. Verify Dockerfiles exist
ls Dockerfile services/mcp-fixtures/Dockerfile apps/command-console/Dockerfile

# 3. Verify Docker running
docker info | /usr/bin/grep -q "Server Version" && echo "Docker OK"

# 4. Verify GCP auth
gcloud auth print-access-token > /dev/null && echo "GCP Auth OK"
```

**Do not proceed until all checks pass.**

## Essential Commands

```bash
# Frontend
cd apps/command-console && npm run dev

# ADK Agents (local)
source .venv/bin/activate && python main.py

# ADK Web UI
cd agents && adk web --port 8000

# Tests
pytest agents/ -v              # 606 agent tests
pytest tests/integration/ -v   # RAG integration tests
```

## Where To Find Things

| Need | Location |
|------|----------|
| Architecture decisions | `docs/adr/` |
| Deployment runbook | apps/command-console/DEPLOYMENT.md |
| ADK patterns & anti-patterns | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |
| Agent implementation | `agents/<name>/agent.py` |
| Skills | `agents/<name>/skills/` |
| RAG knowledge base | `knowledge/` |
| Fixtures (Phase 1 data) | `data/fixtures/cedar-creek/` |
| Frontend stores | `apps/command-console/src/stores/` |
| Terraform | `infrastructure/terraform/` |

## Don't Touch Without Reading

1. **`docs/adr/ADR-005-skills-first-architecture.md`** — Core paradigm
2. **`docs/adr/ADR-007.1-tool-invocation-strategy.md`** — Prevents infinite loops
3. **`docs/adr/ADR-011-rag-authentication-pattern.md`** — RAG auth pattern
4. **`docs/runbooks/ADK-OPERATIONS-RUNBOOK.md`** — Common pitfalls

## GCP Environment

| Resource | Value |
|----------|-------|
| Project ID | `ranger-twin-dev` |
| Deployment Region | `us-west1` |
| RAG Corpora Region | `europe-west3` |
| Artifact Registry | `us-west1-docker.pkg.dev/ranger-twin-dev/ranger-images` |
| Knowledge Bucket | `gs://ranger-knowledge-base/` |

## Agent Roster

| Agent | Directory | RAG Corpus |
|-------|-----------|------------|
| Coordinator | `agents/coordinator/` | — |
| Burn Analyst | `agents/burn_analyst/` | `ranger-burn-severity` |
| Trail Assessor | `agents/trail_assessor/` | `ranger-trail-infrastructure` |
| Cruising Assistant | `agents/cruising_assistant/` | `ranger-timber-salvage` |
| NEPA Advisor | `agents/nepa_advisor/` | `ranger-nepa-regulations` |

## Shell Gotcha

`grep` is aliased to `rg` (ripgrep) on this system. Use explicit path:
```bash
/usr/bin/grep 'pattern' file.txt
```

---

## Progressive Disclosure

For detailed guidance, read these files when relevant:

| Topic | File |
|-------|------|
| Deployment | `apps/command-console/DEPLOYMENT.md` |
| ADK Operations | `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` |
| RAG Setup | `knowledge/README.md` |
| Phase 4 Integration | `docs/archive/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` |
| Skill Authoring | `docs/specs/skill-format.md` |
| Data Simulation | `docs/DATA-SIMULATION-STRATEGY.md` |
| Proof Layer | `docs/specs/PROOF-LAYER-DESIGN.md` |

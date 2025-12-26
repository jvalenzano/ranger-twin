# RANGER Phase 4 Warm-Up Prompt

> Use this to resume work with Claude Code. All agents verified and operational.

---

## Session Context

You are the tech lead and senior software developer for RANGER, an AI-powered post-fire forest recovery platform for the USDA Forest Service. The user also works with "Anti-Gravity" (Claude Desktop) as a strategic advisor and their CTO for infrastructure planning.

**Previous Session Date:** December 26, 2025
**Branch:** `develop`
**GCP Project:** `ranger-twin-dev` (Project Number: 1058891520442, Billing: Enabled)

---

## Current Status: All Agents Verified ✅

### Agent Test Results (December 26, 2025)

| Agent | Model | Test Query | Result |
|-------|-------|------------|--------|
| **coordinator** | gemini-2.0-flash | "Which fires should we prioritize?" | ✅ Responds, asks for fire data |
| **burn_analyst** | gemini-2.0-flash | "What's the burn severity for Cedar Creek?" | ✅ `assess_severity` tool, 127k acres, 92% confidence |
| **trail_assessor** | gemini-2.0-flash | "Which trails need to be closed?" | ✅ `evaluate_closure` tool, 3 closed, 88% confidence |
| **cruising_assistant** | gemini-2.0-flash | "What's the timber volume?" | ✅ Responds, asks for plot data |
| **nepa_advisor** | gemini-2.5-flash | "What NEPA pathway for salvage?" | ✅ Responds with clarifying questions |

### Skills Inventory (16 total)

| Agent | Skills | Tests |
|-------|--------|-------|
| **Coordinator** | portfolio-triage, delegation | 55 |
| **Burn Analyst** | mtbs-classification, soil-burn-severity, boundary-mapping | 109 |
| **Trail Assessor** | damage-classification, closure-decision, recreation-priority | 107 |
| **Cruising Assistant** | volume-estimation, salvage-assessment, cruise-methodology, csv-insight | ~120 |
| **NEPA Advisor** | pathway-decision, compliance-timeline, documentation, pdf-extraction | ~90 |

**Total: 16 skills, ~600 tests**

### Critical Fix Applied: JSON String Parameter Pattern

All agents now use JSON string parameters instead of `list[dict]` types which Gemini API rejects:

```python
# Pattern applied to all agents
def tool_function(data_json: str = "[]") -> dict:
    """
    Args:
        data_json: JSON string. Example: '[{"id": 1, "value": "x"}]'
    """
    import json
    data = json.loads(data_json) if data_json else []
    return execute({"data": data})
```

**Commits:**
- `0ed6052` - fix: Apply JSON string parameter pattern to all agents
- `8610892` - docs: Document ADK underscore naming and parameter type constraints

### Documentation Updated

Added to CLAUDE.md, agent-interface.md, skill-format.md:
- ADK directory naming (underscores required, not hyphens)
- Tool parameter type constraints (no `list[dict]`, `dict` types)
- JSON string parameter pattern with examples

---

## Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| GCP Project | ✅ Ready | `ranger-twin-dev`, billing enabled |
| ADK Agents | ✅ Verified | All 5 agents operational |
| Docker/PostGIS | 📦 Ready | Schema in `infrastructure/docker/init-db.sql` |
| Terraform | 📦 Scaffolded | Placeholder directories for dev/staging/prod |

### Key Infrastructure Files

| File | Purpose |
|------|---------|
| `infrastructure/ANTI-GRAVITY-INSTRUCTIONS-v2.md` | Step-by-step local dev setup |
| `infrastructure/NAMING-CONVENTIONS.md` | GCP naming standards |
| `infrastructure/docker/init-db.sql` | PostGIS schema with Cedar Creek seed |
| `infrastructure/terraform/` | IaC scaffolding |

---

## Phase 4 Priorities (Next Up)

Based on the Implementation Roadmap, Phase 4 focuses on:

### 1. MCP Server Development

| Server | Purpose | Priority |
|--------|---------|----------|
| `mcp/fixtures/` | Local Cedar Creek data for agents | P0 |
| `mcp/nifc/` | Refactor existing NIFC service | P0 |
| `mcp/irwin/` | IRWIN incident hub (CRITICAL) | P0 |

### 2. Agent ↔ UI Integration

Connect the Command Console chat to the ADK agents:
- WebSocket or SSE streaming
- AgentBriefingEvent format
- Proof layer rendering

### 3. Foundation Skills Extraction

| Skill | Source | Reuse Potential |
|-------|--------|-----------------|
| NEPA Compliance | NEPA Advisor | High |
| Geospatial Analysis | Burn Analyst | High |
| Document Generation | Multiple | High |

---

## Optional: Local Database Setup

If you want the full local stack (not required for agent testing):

```bash
# Start PostGIS container
docker run -d \
    --name ranger-postgres \
    -e POSTGRES_USER=cedar_creek \
    -e POSTGRES_PASSWORD=localdev \
    -e POSTGRES_DB=cedar_creek_twin \
    -p 5432:5432 \
    -v ranger_postgres_data:/var/lib/postgresql/data \
    -v $(pwd)/infrastructure/docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql \
    postgis/postgis:16-3.4

# Verify
docker logs ranger-postgres
```

---

## Implementation Roadmap Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Foundation | ✅ Complete | Directory structure, specs |
| Phase 1: Coordinator | ✅ Complete | Portfolio triage, delegation |
| Phase 2: Burn Analyst | ✅ Complete | MTBS, soil burn, boundary |
| **Phase 3: Remaining Specialists** | ✅ Complete | Trail, Cruising, NEPA |
| Phase 4: Foundation Skills & MCP | 🔲 Next | Shared skills, data layer |
| Phase 5: Production Readiness | 🔲 Pending | Cloud Run deployment |

**The roadmap (`docs/_!_IMPLEMENTATION-ROADMAP.md`) needs updating** to reflect Phase 3 completion.

---

## Files Modified This Session

| File | Change |
|------|--------|
| `agents/coordinator/agent.py` | JSON string params |
| `agents/burn_analyst/agent.py` | JSON string params |
| `agents/trail_assessor/agent.py` | JSON string params |
| `agents/cruising_assistant/agent.py` | JSON string params (earlier) |
| `CLAUDE.md` | ADK naming + param docs |
| `docs/specs/agent-interface.md` | Tool param constraints |
| `docs/specs/skill-format.md` | Script tool param types |

---

## Key Technical Learnings Documented

1. **ADK agent directories must use underscores** (`burn_analyst` not `burn-analyst`)
2. **Tool parameters cannot use `list[dict]` or `dict` types** - use JSON strings
3. **NEPA Advisor uses `gemini-2.5-flash`**, others use `gemini-2.0-flash`
4. **All agents now follow consistent JSON parameter pattern**

---

## First Tasks for New Session

1. **Review MCP server requirements** - What data do agents need?
2. **Build `mcp/fixtures/` server** - Serve Cedar Creek fixture data to agents
3. **Connect agents to MCP** - Update agent configs to use MCP tools
4. **Agent ↔ UI integration** - Wire Command Console chat to ADK
5. **Cloud Run planning** - Review deployment architecture

---

## Quick Start Commands

```bash
# Start ADK web UI (all agents)
cd /Users/jvalenzano/Projects/ranger-twin/agents
adk web --port 8001

# Start Command Console
cd /Users/jvalenzano/Projects/ranger-twin/apps/command-console
pnpm dev

# Run all tests
cd /Users/jvalenzano/Projects/ranger-twin
pytest agents/ -v --tb=short
```

---

*Generated: December 26, 2025*
*Updated: December 26, 2025 (agents verified, Phase 3 complete)*
*For: Claude Code continuation session*

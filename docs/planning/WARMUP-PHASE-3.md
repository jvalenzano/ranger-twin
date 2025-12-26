# RANGER Phase 3 Warm-Up Prompt

> Use this to resume work with Claude Code after the December 26, 2025 session.

---

## Session Context

You are the tech lead and senior software developer for RANGER, an AI-powered post-fire forest recovery platform for the USDA Forest Service. The user also works with "Anti-Gravity" (Claude Desktop) as a strategic advisor and their CTO for infrastructure planning.

**Previous Session Date:** December 26, 2025
**Branch:** `develop`
**Last Commit:** `0ed6052` - fix: Apply JSON string parameter pattern to all agents

---

## What Was Completed

### All 5 Agents Built and Operational

| Agent | Skills | Tests | Status |
|-------|--------|-------|--------|
| **Coordinator** | portfolio-triage, delegation | 55 | ✅ Fixed |
| **Burn Analyst** | mtbs-classification, soil-burn-severity, boundary-mapping | 109 | ✅ Fixed |
| **Trail Assessor** | damage-classification, closure-decision, recreation-priority | 107 | ✅ Fixed |
| **Cruising Assistant** | volume-estimation, salvage-assessment, cruise-methodology, csv-insight | ~120 | ✅ Fixed |
| **NEPA Advisor** | pathway-decision, compliance-timeline, documentation, pdf-extraction | ~90 | ✅ Working |

**Total: 14 skills, ~600 tests passing**

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

## Why We Stopped

**API Rate Limit Hit:**
```
429 RESOURCE_EXHAUSTED
Quota exceeded for: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

The Gemini API free tier quota was exhausted during agent testing. All agents ARE working correctly - the issue is purely quota/billing.

---

## Infrastructure Ready for Setup

CTO and Anti-Gravity prepared GCP infrastructure documentation:

| File | Purpose |
|------|---------|
| `infrastructure/ANTI-GRAVITY-INSTRUCTIONS-v2.md` | Step-by-step local dev setup |
| `infrastructure/NAMING-CONVENTIONS.md` | GCP naming standards (projects, buckets, secrets, etc.) |
| `infrastructure/docker/init-db.sql` | PostGIS schema with Cedar Creek seed data |
| `infrastructure/terraform/` | Environment scaffolding (dev, staging, prod) |

**GCP Project:** `ranger-twin-dev` (created, needs billing)

---

## Immediate Next Steps

### 1. Enable GCP Billing (Required)

```bash
# List billing accounts
gcloud billing accounts list

# Link billing to project
gcloud billing projects link ranger-twin-dev --billing-account=BILLING_ACCOUNT_ID

# Or use Console UI:
open "https://console.cloud.google.com/billing/linkedaccount?project=ranger-twin-dev"
```

### 2. Create New API Key (Recommended)

Create a key tied to `ranger-twin-dev` for cleaner billing:
```bash
open "https://aistudio.google.com/app/apikey"
```

Then update:
- `agents/coordinator/.env` → `GOOGLE_API_KEY=...`
- (Copy to other agent .env files if needed)

### 3. Test All Agents

After billing is enabled:
```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
adk web --port 8001
```

Test each agent with domain questions:

| Agent | Test Question |
|-------|---------------|
| coordinator | "Which fires should we prioritize for BAER assessment?" |
| burn_analyst | "What's the burn severity for Cedar Creek?" |
| trail_assessor | "Which trails need to be closed after Cedar Creek?" |
| cruising_assistant | "What's the timber volume estimate for Cedar Creek?" |
| nepa_advisor | "What NEPA pathway should we use for Cedar Creek salvage?" |

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

1. **Enable billing** on `ranger-twin-dev` GCP project
2. **Create new API key** tied to the dev project
3. **Test all 5 agents** in ADK web UI
4. **Update roadmap** to mark Phase 3 complete
5. **Decide Phase 4 priorities**: Foundation skills vs MCP servers vs Cloud Run

---

*Generated: December 26, 2025*
*For: Claude Code continuation session*

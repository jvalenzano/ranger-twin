# RANGER Phase 4: MCP Integration Implementation Plan

> **✅ FULLY COMPLETED — December 27, 2025**
>
> All tasks in this plan have been executed. Keep for reference.
>
> **Deployment URLs:**
> - Coordinator: https://ranger-coordinator-1058891520442.us-central1.run.app
> - MCP Fixtures: https://ranger-mcp-fixtures-1058891520442.us-central1.run.app

**Version:** 1.1
**Date:** December 26, 2025 (Completed December 27, 2025)
**Author:** CTO, jvalenzano - Digital Twin Team
**Status:** ✅ COMPLETED
**Actual LOE:** ~8 hours

---

## Executive Summary

This plan details the integration of Model Context Protocol (MCP) into RANGER's agent infrastructure. Rather than deferring MCP to post-MVP, we are implementing it now to:

1. **Demonstrate the Skills-First architecture** properly (Skills + MCP, not Skills + bundled files)
2. **Enable the Proof Layer** to show real data provenance
3. **Avoid technical debt** that would require 20+ hours of rework in Phase 2
4. **Build federal credibility** through observable data flows

---

## Current State Analysis

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| MCP Fixtures Server | ✅ Complete | `services/mcp-fixtures/server.py` |
| MCP Server Dockerfile | ✅ Complete | `services/mcp-fixtures/Dockerfile` |
| Fixture Data (Cedar Creek) | ✅ Complete | `data/fixtures/cedar-creek/` |
| Coordinator Agent | ✅ Wired to sub-agents | `agents/coordinator/agent.py` |
| Skill Scripts | ✅ Load from disk | `agents/*/skills/*/scripts/` |
| ADK Orchestrator | ✅ Running | `main.py` |
| React Chat (ADK Mode) | ✅ SSE streaming | `apps/command-console/` |

### What Needs To Change

| Component | Current | Target |
|-----------|---------|--------|
| Skill data loading | `load_fixture_data()` from disk | MCP tool calls via `McpToolset` |
| Agent tool definitions | Local function tools | MCP-aware tools with provenance |
| Data provenance | None | Source citations in responses |
| Deployment | Single container | Orchestrator + MCP server |

---

## Architecture: Target State

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloud Run: ranger-orchestrator                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Recovery Coordinator (ADK)                                 ││
│  │  ├── Burn Analyst Agent                                     ││
│  │  │   └── McpToolset → SSE → ranger-mcp-fixtures             ││
│  │  ├── Trail Assessor Agent                                   ││
│  │  │   └── McpToolset → SSE → ranger-mcp-fixtures             ││
│  │  ├── Cruising Assistant Agent                               ││
│  │  │   └── McpToolset → SSE → ranger-mcp-fixtures             ││
│  │  └── NEPA Advisor Agent                                     ││
│  │      └── (File Search RAG - unchanged)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SSE Connection
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Cloud Run: ranger-mcp-fixtures                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  MCP Server (Starlette + SSE)                               ││
│  │  Tools:                                                     ││
│  │  - get_fire_context     → incident-metadata.json            ││
│  │  - mtbs_classify        → burn-severity.json                ││
│  │  - assess_trails        → trail-damage.json                 ││
│  │  - get_timber_plots     → timber-plots.json                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1: Deploy MCP Fixtures Server to Cloud Run

**Assignee:** Any agent with GCP access  
**Estimated Time:** 30 minutes  
**Dependencies:** None  
**Priority:** P0 - Blocking

#### Steps

1. **Verify local MCP server works:**
   ```bash
   cd /Users/jvalenzano/Projects/ranger-twin
   source .venv/bin/activate
   
   # Start MCP server locally
   cd services/mcp-fixtures
   uvicorn server:app --host 0.0.0.0 --port 8080
   
   # In another terminal, test health endpoint
   curl http://localhost:8080/health
   ```

2. **Deploy to Cloud Run:**
   ```bash
   cd /Users/jvalenzano/Projects/ranger-twin
   
   gcloud run deploy ranger-mcp-fixtures \
     --source . \
     --dockerfile services/mcp-fixtures/Dockerfile \
     --project ranger-twin-dev \
     --region us-central1 \
     --memory 512Mi \
     --cpu 1 \
     --allow-unauthenticated \
     --port 8080
   ```

3. **Capture the deployed URL:**
   ```
   Service URL: https://ranger-mcp-fixtures-XXXXXX-uc.a.run.app
   ```

4. **Verify deployment:**
   ```bash
   curl https://ranger-mcp-fixtures-XXXXXX-uc.a.run.app/health
   ```

#### Success Criteria
- [ ] `/health` returns `{"status": "healthy", ...}`
- [ ] `/sse` endpoint accessible (SSE connection)
- [ ] All 4 fixtures report `true` in health response

#### Output
- Cloud Run service URL (save to `.env` as `MCP_FIXTURES_URL`)

---

### Task 2: Create MCP Client Utility Module

**Assignee:** Backend-focused agent  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 1  
**Priority:** P0 - Blocking

#### Context

The Google ADK supports MCP through `McpToolset` with `SseConnectionParams`. We need a shared utility module that all agents can use.

#### Steps

1. **Create the MCP client module:**

   Create file: `agents/shared/mcp_client.py`

   ```python
   """
   RANGER MCP Client Utilities
   
   Provides shared MCP connectivity for all RANGER agents.
   Per ADR-005: Skills-First Architecture - MCP for Connectivity, Skills for Expertise.
   """
   
   import os
   from google.adk.tools.mcp_tool import McpToolset
   from google.adk.tools.mcp_tool.mcp_session_manager import SseConnectionParams
   
   # MCP Fixtures Server URL - from environment or default to local
   MCP_FIXTURES_URL = os.environ.get(
       "MCP_FIXTURES_URL",
       "http://localhost:8080/sse"
   )
   
   
   def get_fixtures_toolset(
       tool_filter: list[str] | None = None,
       tool_name_prefix: str = ""
   ) -> McpToolset:
       """
       Create an MCP toolset connected to the RANGER Fixtures server.
       
       Args:
           tool_filter: Optional list of tool names to expose (e.g., ['mtbs_classify'])
           tool_name_prefix: Optional prefix for tool names
           
       Returns:
           McpToolset configured for the fixtures server
           
       Example:
           toolset = get_fixtures_toolset(tool_filter=['mtbs_classify', 'get_fire_context'])
       """
       params = SseConnectionParams(
           url=MCP_FIXTURES_URL,
           sse_read_timeout=30  # 30 second timeout for SSE reads
       )
       
       kwargs = {"connection_params": params}
       
       if tool_filter:
           kwargs["tool_filter"] = tool_filter
       if tool_name_prefix:
           kwargs["tool_name_prefix"] = tool_name_prefix
           
       return McpToolset(**kwargs)
   
   
   # Pre-configured toolsets for each agent type
   def get_burn_analyst_toolset() -> McpToolset:
       """Toolset for Burn Analyst agent - fire context and MTBS classification."""
       return get_fixtures_toolset(
           tool_filter=["get_fire_context", "mtbs_classify"],
           tool_name_prefix="mcp_"
       )
   
   
   def get_trail_assessor_toolset() -> McpToolset:
       """Toolset for Trail Assessor agent - trail damage assessment."""
       return get_fixtures_toolset(
           tool_filter=["get_fire_context", "assess_trails"],
           tool_name_prefix="mcp_"
       )
   
   
   def get_cruising_assistant_toolset() -> McpToolset:
       """Toolset for Cruising Assistant agent - timber plots."""
       return get_fixtures_toolset(
           tool_filter=["get_fire_context", "get_timber_plots"],
           tool_name_prefix="mcp_"
       )
   ```

2. **Create `__init__.py` for shared module:**

   Create file: `agents/shared/__init__.py`

   ```python
   """Shared utilities for RANGER agents."""
   
   from .mcp_client import (
       get_fixtures_toolset,
       get_burn_analyst_toolset,
       get_trail_assessor_toolset,
       get_cruising_assistant_toolset,
       MCP_FIXTURES_URL,
   )
   
   __all__ = [
       "get_fixtures_toolset",
       "get_burn_analyst_toolset",
       "get_trail_assessor_toolset",
       "get_cruising_assistant_toolset",
       "MCP_FIXTURES_URL",
   ]
   ```

3. **Add test for MCP client:**

   Create file: `agents/shared/tests/test_mcp_client.py`

   ```python
   """Tests for MCP client utilities."""
   
   import pytest
   from unittest.mock import patch, MagicMock
   
   
   def test_get_fixtures_toolset_default():
       """Test toolset creation with defaults."""
       from agents.shared.mcp_client import get_fixtures_toolset
       
       toolset = get_fixtures_toolset()
       assert toolset is not None
   
   
   def test_get_fixtures_toolset_with_filter():
       """Test toolset creation with tool filter."""
       from agents.shared.mcp_client import get_fixtures_toolset
       
       toolset = get_fixtures_toolset(tool_filter=["mtbs_classify"])
       assert toolset is not None
   
   
   def test_burn_analyst_toolset():
       """Test pre-configured burn analyst toolset."""
       from agents.shared.mcp_client import get_burn_analyst_toolset
       
       toolset = get_burn_analyst_toolset()
       assert toolset is not None
   
   
   def test_env_override():
       """Test MCP URL can be overridden via environment."""
       import os
       
       with patch.dict(os.environ, {"MCP_FIXTURES_URL": "http://custom:9999/sse"}):
           # Re-import to pick up new env
           import importlib
           from agents.shared import mcp_client
           importlib.reload(mcp_client)
           
           assert mcp_client.MCP_FIXTURES_URL == "http://custom:9999/sse"
   ```

#### Success Criteria
- [ ] `agents/shared/mcp_client.py` created
- [ ] `agents/shared/__init__.py` created
- [ ] Tests pass: `pytest agents/shared/tests/ -v`
- [ ] Module imports correctly: `python -c "from agents.shared import get_burn_analyst_toolset"`

---

### Task 3: Update Burn Analyst Agent to Use MCP

**Assignee:** Backend-focused agent  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 2  
**Priority:** P1

#### Context

The Burn Analyst currently has 3 tools that load data from disk:
- `assess_severity` → loads `burn-severity.json`
- `classify_mtbs` → loads `burn-severity.json`
- `validate_boundary` → loads `burn-severity.json`

We need to:
1. Add MCP toolset for data fetching
2. Keep skill tools for domain logic
3. Update skill scripts to accept MCP data as input

#### Steps

1. **Update `agents/burn_analyst/agent.py`:**

   ```python
   """
   Burn Analyst Agent (Skills-First + MCP Edition)
   
   Specialist agent for fire severity analysis, MTBS classification,
   and soil burn severity assessment.
   
   Per ADR-005: Skills-First Multi-Agent Architecture
   - MCP for Connectivity (data fetching)
   - Skills for Expertise (domain logic)
   """
   
   import sys
   from pathlib import Path
   
   from google.adk.agents import Agent
   
   # Import MCP toolset
   from agents.shared.mcp_client import get_burn_analyst_toolset
   
   # Add skill scripts to path for dynamic loading
   SKILLS_DIR = Path(__file__).parent / "skills"
   
   # [Keep existing path setup for SEVERITY_PATH, MTBS_PATH, BOUNDARY_PATH]
   
   
   def assess_severity(fire_id: str, sectors_json: str = "[]", include_geometry: bool = False) -> dict:
       """
       Assess soil burn severity for a fire incident.
       
       NOTE: This tool now expects data to be fetched via MCP first.
       Use mcp_mtbs_classify to get sector data, then pass it here for analysis.
       
       [Keep existing docstring content]
       """
       import json
       from assess_severity import execute
       sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
       return execute({
           "fire_id": fire_id,
           "sectors": sectors,
           "include_geometry": include_geometry,
       })
   
   
   def classify_mtbs(fire_id: str, sectors_json: str = "[]", include_class_map: bool = False) -> dict:
       """[Keep existing implementation]"""
       import json
       from classify_mtbs import execute
       sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
       return execute({
           "fire_id": fire_id,
           "sectors": sectors,
           "include_class_map": include_class_map,
       })
   
   
   def validate_boundary(fire_id: str, sectors_json: str = "[]", tolerance: float = 5.0) -> dict:
       """[Keep existing implementation]"""
       import json
       from validate_boundary import execute
       sectors = json.loads(sectors_json) if sectors_json and sectors_json != "[]" else None
       return execute({
           "fire_id": fire_id,
           "sectors": sectors,
           "tolerance": tolerance,
       })
   
   
   # Initialize Burn Analyst Agent with MCP + Skills
   root_agent = Agent(
       name="burn_analyst",
       model="gemini-2.0-flash",
       description="Fire severity and burn analysis specialist for RANGER.",
       instruction="""
   You are the RANGER Burn Analyst, a specialist in post-fire severity assessment
   and burn impact analysis.
   
   ## Your Role
   You are the domain expert for all burn severity questions. When the Coordinator
   delegates a query to you, analyze it using your tools and domain knowledge.
   
   ## Tool Usage Pattern (IMPORTANT)
   
   You have two types of tools:
   
   ### 1. MCP Data Tools (prefixed with mcp_)
   These fetch raw data from federal data sources:
   - `mcp_get_fire_context` - Get fire metadata and summary
   - `mcp_mtbs_classify` - Get MTBS burn severity classification data
   
   ### 2. Skill Tools (domain analysis)
   These apply RANGER expertise to the data:
   - `assess_severity` - Analyze severity with BAER recommendations
   - `classify_mtbs` - Apply MTBS classification protocol
   - `validate_boundary` - Validate fire perimeter geometry
   
   ## Workflow
   
   1. **First**: Use MCP tools to fetch data (e.g., `mcp_mtbs_classify`)
   2. **Then**: Pass that data to skill tools for analysis (e.g., `assess_severity`)
   3. **Finally**: Synthesize results with confidence scores and citations
   
   Example workflow for "What's the burn severity for Cedar Creek?":
   1. Call `mcp_get_fire_context(fire_id="cedar-creek")` - get fire metadata
   2. Call `mcp_mtbs_classify(fire_id="cedar-creek")` - get MTBS data with sectors
   3. Call `assess_severity(fire_id="cedar-creek", sectors_json=<sectors from step 2>)`
   4. Present results with data source citations
   
   ## Response Format
   When presenting severity assessments:
   1. Start with fire identification and total acreage
   2. Present severity breakdown (acres and percentages by class)
   3. Highlight priority sectors with specific concerns
   4. Include key reasoning steps from the analysis
   5. Provide BAER team recommendations
   6. End with confidence level and data sources
   
   **Always cite your data sources** (e.g., "Source: MTBS, imagery date 2022-09-15")
   """,
       tools=[
           get_burn_analyst_toolset(),  # MCP tools: mcp_get_fire_context, mcp_mtbs_classify
           assess_severity,              # Skill tool
           classify_mtbs,                # Skill tool
           validate_boundary,            # Skill tool
       ],
   )
   
   # Alias for backward compatibility
   burn_analyst = root_agent
   
   if __name__ == "__main__":
       print(f"Burn Analyst Agent '{root_agent.name}' initialized.")
       print(f"Model: {root_agent.model}")
       print(f"Description: {root_agent.description}")
       print(f"Tools: MCP Toolset + {[assess_severity.__name__, classify_mtbs.__name__, validate_boundary.__name__]}")
   ```

2. **Update skill script to handle MCP data:**

   Edit `agents/burn_analyst/skills/soil-burn-severity/scripts/assess_severity.py`:
   
   Add a note at the top of `execute()`:
   
   ```python
   def execute(inputs: dict) -> dict:
       """
       Execute soil burn severity assessment.
       
       This is the main entry point called by the skill runtime.
       
       **MCP Integration Note**: 
       When called via the agent, sectors data should be provided from MCP.
       The fixture fallback is retained for testing and backward compatibility.
       
       [Rest of existing implementation - no changes needed]
       """
   ```

3. **Test the updated agent:**

   ```bash
   # Start MCP server
   cd services/mcp-fixtures && uvicorn server:app --port 8080 &
   
   # Set environment
   export MCP_FIXTURES_URL=http://localhost:8080/sse
   export GOOGLE_API_KEY=your_key_here
   
   # Test agent initialization
   cd /Users/jvalenzano/Projects/ranger-twin
   python -c "from agents.burn_analyst.agent import root_agent; print(f'Agent: {root_agent.name}, Tools: {len(root_agent.tools)}')"
   ```

#### Success Criteria
- [ ] Agent initializes without errors
- [ ] MCP toolset included in agent tools
- [ ] Existing tests still pass: `pytest agents/burn_analyst/ -v`
- [ ] Agent can respond to "What's the burn severity for Cedar Creek?" using MCP

---

### Task 4: Update Trail Assessor Agent to Use MCP

**Assignee:** Backend-focused agent  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 2  
**Priority:** P1

#### Steps

Follow the same pattern as Task 3:

1. Import `get_trail_assessor_toolset` from `agents.shared.mcp_client`
2. Add MCP toolset to agent's `tools` list
3. Update agent instruction to describe the MCP → Skill workflow
4. Test agent initialization and functionality

#### Key Changes to `agents/trail_assessor/agent.py`:

```python
from agents.shared.mcp_client import get_trail_assessor_toolset

# In agent definition:
tools=[
    get_trail_assessor_toolset(),  # MCP tools: mcp_get_fire_context, mcp_assess_trails
    classify_damage,                # Skill tool
    evaluate_closure,               # Skill tool
    prioritize_trails,              # Skill tool
],
```

#### Success Criteria
- [ ] Agent initializes with MCP toolset
- [ ] Tests pass: `pytest agents/trail_assessor/ -v`

---

### Task 5: Update Cruising Assistant Agent to Use MCP

**Assignee:** Backend-focused agent  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 2  
**Priority:** P1

#### Steps

Follow the same pattern as Tasks 3-4:

1. Import `get_cruising_assistant_toolset` from `agents.shared.mcp_client`
2. Add MCP toolset to agent's `tools` list
3. Update agent instruction
4. Test

#### Success Criteria
- [ ] Agent initializes with MCP toolset
- [ ] Tests pass: `pytest agents/cruising_assistant/ -v`

---

### Task 6: Update Environment Configuration

**Assignee:** Any agent  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1  
**Priority:** P1

#### Steps

1. **Update root `.env.example`:**

   ```bash
   # RANGER ADK Configuration
   
   # Required: Google Gemini API Key
   GOOGLE_API_KEY=your_gemini_api_key_here
   
   # MCP Fixtures Server URL
   # Local development: http://localhost:8080/sse
   # Production: https://ranger-mcp-fixtures-XXXXX-uc.a.run.app/sse
   MCP_FIXTURES_URL=http://localhost:8080/sse
   
   # Optional: Firestore session backend (production)
   # SESSION_SERVICE_URI=firestore://projects/ranger-twin-dev/databases/default
   
   # Optional: CORS origins (comma-separated)
   # ALLOW_ORIGINS=http://localhost:5173,https://ranger.example.com
   ```

2. **Update `main.py` to log MCP URL:**

   Add after existing logging:
   
   ```python
   MCP_FIXTURES_URL = os.environ.get("MCP_FIXTURES_URL", "http://localhost:8080/sse")
   logger.info(f"MCP Fixtures URL: {MCP_FIXTURES_URL}")
   ```

3. **Update Dockerfile to include MCP URL:**

   Add to environment section:
   
   ```dockerfile
   ENV MCP_FIXTURES_URL=${MCP_FIXTURES_URL:-http://localhost:8080/sse}
   ```

#### Success Criteria
- [ ] `.env.example` updated
- [ ] `main.py` logs MCP URL on startup
- [ ] Dockerfile accepts MCP URL as build arg or env var

---

### Task 7: End-to-End Integration Test

**Assignee:** Any agent  
**Estimated Time:** 2-3 hours  
**Dependencies:** Tasks 1-6  
**Priority:** P0 - Validation

#### Steps

1. **Start MCP Fixtures Server:**
   ```bash
   cd services/mcp-fixtures
   uvicorn server:app --host 0.0.0.0 --port 8080
   ```

2. **Start ADK Orchestrator:**
   ```bash
   cd /Users/jvalenzano/Projects/ranger-twin
   export GOOGLE_API_KEY=your_key
   export MCP_FIXTURES_URL=http://localhost:8080/sse
   python main.py
   ```

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:8000/run_sse \
     -H "Content-Type: application/json" \
     -d '{
       "app_name": "coordinator",
       "user_id": "test",
       "session_id": "e2e-test-001",
       "new_message": "What is the burn severity for Cedar Creek?"
     }'
   ```

4. **Verify response includes:**
   - Agent routing (Coordinator → Burn Analyst)
   - MCP tool calls visible in events
   - Data source citations in response
   - Confidence scores present

5. **Test with React frontend:**
   ```bash
   cd apps/command-console
   npm run dev
   ```
   - Open http://localhost:5173
   - Ensure ADK mode is enabled
   - Ask: "What is the burn severity for Cedar Creek?"
   - Verify streaming response with agent badges

#### Success Criteria
- [ ] MCP server responds to tool calls
- [ ] ADK orchestrator routes to Burn Analyst
- [ ] Burn Analyst uses MCP to fetch data
- [ ] Response includes data source citations
- [ ] End-to-end latency < 30 seconds
- [ ] No errors in any component logs

---

### Task 8: Documentation Update

**Assignee:** Any agent  
**Estimated Time:** 1 hour  
**Dependencies:** Tasks 1-7  
**Priority:** P2

#### Steps

1. **Update `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md`:**
   - Add MCP integration section
   - Update architecture diagrams
   - Add troubleshooting for MCP connectivity

2. **Update `PRODUCT-SUMMARY.md`:**
   - Note MCP integration in technical section
   - Update architecture diagram

3. **Create `docs/runbooks/MCP-TROUBLESHOOTING.md`:**
   - Common MCP connection errors
   - Health check procedures
   - Fallback to local fixtures

#### Success Criteria
- [ ] Implementation guide updated
- [ ] Troubleshooting runbook created

---

## Execution Order

```
Phase A: Infrastructure (Day 1 AM)
├── Task 1: Deploy MCP Fixtures Server ⬅️ START HERE
└── Task 2: Create MCP Client Module

Phase B: Agent Updates (Day 1 PM - Day 2 AM)
├── Task 3: Update Burn Analyst
├── Task 4: Update Trail Assessor
├── Task 5: Update Cruising Assistant
└── Task 6: Update Environment Config

Phase C: Validation (Day 2 PM)
├── Task 7: End-to-End Testing
└── Task 8: Documentation

Total: ~10-14 hours across team
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| MCP server fails | Skill scripts retain fixture fallback for testing |
| SSE connection timeout | Configure 30s timeout, add retry logic |
| Cloud Run cold start | Pre-warm MCP server, use min instances if needed |
| Agent prompt too long | MCP toolset adds ~200 tokens; within limits |

---

## Rollback Plan

If MCP integration causes demo instability:

1. **Quick rollback:** Set `MCP_FIXTURES_URL=""` to disable MCP
2. **Skill fallback:** Skills already load fixtures from disk as fallback
3. **Branch strategy:** All changes in `feature/mcp-integration` branch

---

## Success Metrics

| Metric | Target |
|--------|--------|
| MCP tool call success rate | >99% |
| End-to-end latency | <30 seconds |
| Agent test pass rate | 100% (645 tests) |
| Data provenance visibility | Citations in every response |

---

## Warmup Prompt for Agents

```
I'm implementing MCP integration for RANGER Phase 4. Here's the context:

## My Task
[PASTE SPECIFIC TASK FROM ABOVE]

## Current State
- MCP Fixtures Server exists at services/mcp-fixtures/server.py
- Agents currently load fixtures from disk
- ADK supports MCP via McpToolset with SseConnectionParams

## What I Need To Do
[PASTE STEPS FROM TASK]

## Commands I'll Use
- `uvicorn server:app --port 8080` - Start MCP server
- `python main.py` - Start ADK orchestrator  
- `pytest agents/ -v` - Run agent tests
- `gcloud run deploy` - Deploy to Cloud Run

## Key Files
- agents/shared/mcp_client.py - MCP client utilities (Task 2)
- agents/burn_analyst/agent.py - Burn Analyst with MCP (Task 3)
- services/mcp-fixtures/server.py - MCP server implementation
```

---

*Document Owner:* CTO, jvalenzano  
*Last Updated:* December 26, 2025  
*Status:* Ready for Execution

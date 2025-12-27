# RANGER Phase 4 Execution Warm-Up

> **Mode: Autonomous Execution**
> You have authority to make executive decisions. Do not wait for user input.
> Use subagents for parallel work where it makes sense.

---

## Session Context

You are the tech lead and senior developer for RANGER, an AI-powered post-fire forest recovery platform for USFS. You're executing Phase 4: ADK Integration.

**Branch:** `develop`
**GCP Project:** `ranger-twin-dev` (Project #1058891520442)
**Demo Deadline:** February 14, 2026 (USFS regional office)
**Implementation Guide:** `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md`

---

## Executive Summary

Phase 4 connects the working ADK agents to the React Command Console with real-time streaming and visible reasoning chains (the "proof layer"). This is a 3-week sprint.

### What We're Building

| Component | Purpose | Output |
|-----------|---------|--------|
| MCP Fixtures Server | Serve Cedar Creek data to agents | `services/mcp-fixtures/` |
| ADK Orchestrator | FastAPI wrapper for agents | `main.py` in root or `services/adk-orchestrator/` |
| SSE Client | Parse ADK events in React | `apps/command-console/src/lib/adkClient.ts` |
| Event Transformer | Convert ADK → AgentBriefingEvent | `apps/command-console/src/services/adkEventTransformer.ts` |
| Proof Layer UI | Display reasoning chains | Update `AgentBriefing.tsx` |

### What We're NOT Building

| Component | Status | Rationale |
|-----------|--------|-----------|
| WebSocket Bridge | Eliminated | ADK provides native SSE |
| Custom API Gateway | Eliminated | `get_fast_api_app()` handles routing |
| Foundation Skills | Deferred | Premature optimization |
| IRWIN Integration | Deferred | Federal API bureaucracy |
| Separate MTBS/NRCS MCP servers | Simplified | One fixtures server for Phase 1 |

---

## Current State (Phase 3 Complete)

### Verified Agents

| Agent | Model | Status |
|-------|-------|--------|
| coordinator | gemini-2.0-flash | ✅ Delegates to specialists |
| burn_analyst | gemini-2.0-flash | ✅ `assess_severity` tool works |
| trail_assessor | gemini-2.0-flash | ✅ `evaluate_closure` tool works |
| cruising_assistant | gemini-2.0-flash | ✅ Asks for plot data |
| nepa_advisor | gemini-2.5-flash | ✅ Asks clarifying questions |

### Test Results
- **606 tests passing** across agents and skills
- All agents use JSON string parameter pattern (Gemini API constraint)

---

## High-Level Plan (3 Weeks)

### Week 1: Foundation (Days 1-5)

**Day 1-2: Validation Spike**
1. Wire coordinator with sub_agents in a test configuration
2. Run `adk web --port 8000` and capture actual SSE event format
3. Verify `author` field format matches `ADKEventTransformer` expectations
4. Document any schema differences

**Day 2-3: MCP Fixtures Server**
1. Create `services/mcp-fixtures/` directory
2. Implement MCP server with tools: `mtbs_classify`, `assess_trails`, `get_fire_context`
3. Load data from `data/fixtures/cedar-creek/`
4. Test locally with `mcp dev`
5. Deploy to Cloud Run as `ranger-mcp-fixtures`

**Day 4-5: Firestore Session Backend**
1. Enable Firestore in `ranger-twin-dev` project
2. Configure ADK to use Firestore sessions
3. Test session persistence across requests
4. Verify cross-agent state sharing works

### Week 2: Integration (Days 6-10)

**Day 6-7: ADK Orchestrator**
1. Create `main.py` using `get_fast_api_app()`
2. Configure session backend: `firestore://projects/ranger-twin-dev/databases/default`
3. Wire agents with MCP fixtures server via `SseServerParams`
4. Test `/run_sse` endpoint locally

**Day 8-9: React SSE Client**
1. Implement `useADKStream` hook
2. Implement `ADKEventTransformer` class
3. Update `chatStore` to handle streamed events
4. Wire to existing `AgentBriefing` component

**Day 10: Error Handling**
1. Implement retry logic for retryable errors
2. Add graceful degradation UI states
3. Test with simulated failures

### Week 3: Deployment & Polish (Days 11-15)

**Day 11-12: Cloud Run Deployment**
1. Deploy MCP fixtures server
2. Deploy ADK orchestrator with config:
   - CPU: 2, Memory: 4GB
   - Concurrency: 20, Min instances: 1
   - Timeout: 600s
3. Configure secrets via Secret Manager

**Day 13-14: Integration Testing**
1. End-to-end test: Cedar Creek scenario
2. Load test: 10 concurrent SSE connections
3. Verify proof layer displays correctly
4. Test cold start behavior

**Day 15: Documentation & Demo Prep**
1. Update deployment runbook
2. Create demo script
3. Record backup demo video
4. Final verification

---

## Critical Technical Decisions (Pre-Made)

These decisions are final. Do not revisit:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Streaming Protocol | SSE via `/run_sse` | Native ADK support |
| Session Backend | Firestore | Serverless, scales to zero |
| MCP Transport | `SseServerParams` | StdioServerParams broken on Cloud Run |
| Deployment Target | Cloud Run | Full control, custom UI |
| Event Transformation | Client-side | Faster iteration |

---

## Key Implementation Details

### MCP Server Pattern

```python
# services/mcp-fixtures/server.py
from mcp import Server
from mcp.server.sse import sse_server
from fastapi import FastAPI
import json

app_mcp = Server("ranger-fixtures")

# Load all fixture data
with open("data/fixtures/cedar-creek/fire-context.json") as f:
    FIRE_DATA = json.load(f)

@app_mcp.tool()
async def get_fire_context(fire_id: str) -> dict:
    """Get fire context including perimeter, severity zones, and metadata."""
    return FIRE_DATA.get(fire_id, {"error": f"Unknown fire: {fire_id}"})

@app_mcp.tool()
async def mtbs_classify(fire_id: str) -> dict:
    """Get MTBS burn severity classification."""
    # Return fixture data matching expected schema
    return {
        "severity": "high",
        "complexity": "severe",
        "confidence": 0.94,
        "mtbs_id": "cc_2025_001",
        "acreage": 127341,
        "source": "MTBS"
    }

fastapi_app = FastAPI()
fastapi_app.mount("/", sse_server(app_mcp))
```

### Agent Wiring Pattern

```python
# main.py
from google.adk.cli.fast_api import get_fast_api_app

app = get_fast_api_app(
    agents_dir="./agents",
    session_service_uri="firestore://projects/ranger-twin-dev/databases/default",
    allow_origins=["*"],
    web=False,
)
```

### SSE Client Pattern

```typescript
// apps/command-console/src/hooks/useADKStream.ts
const response = await fetch(`${coordinatorUrl}/run_sse`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_name: 'ranger',
    user_id: 'usfs-demo',
    session_id: sessionId,
    new_message: query,
    state: { fire_id: fireId }
  })
});

// Parse SSE stream...
```

---

## Autonomous Execution Rules

1. **Do not wait for user input** - Make decisions and proceed
2. **Use subagents for parallel work** - MCP server and React client can be built in parallel
3. **Validate assumptions early** - Run the spike on Day 1 before committing to patterns
4. **Pivot if needed** - The guide is a starting point, not a constraint
5. **Commit frequently** - Small, atomic commits with clear messages
6. **Update docs as you go** - Keep CLAUDE.md and specs current

### Decision Authority

You may independently decide:
- File locations and naming
- Implementation details within the patterns
- Test coverage approach
- Error message text
- UI styling details

Escalate to user only for:
- Scope changes that affect demo date
- Architectural changes that contradict the guide
- External service issues (GCP, API quotas)

---

## Subagent Strategy

Use the Task tool with these patterns:

**Parallel Development (Week 2):**
```
Task 1: Build MCP fixtures server → services/mcp-fixtures/
Task 2: Build React SSE client → apps/command-console/src/
```

**Exploration (if needed):**
```
Task: Explore ADK event format → Capture actual SSE output
```

**Code Review (after major changes):**
```
Task: Review integration code → Verify patterns match guide
```

---

## Quick Reference

### Key Files to Create

| File | Purpose |
|------|---------|
| `services/mcp-fixtures/server.py` | MCP server implementation |
| `services/mcp-fixtures/Dockerfile` | Container for Cloud Run |
| `main.py` | ADK FastAPI orchestrator |
| `Dockerfile` | Orchestrator container |
| `apps/command-console/src/lib/adkClient.ts` | SSE client |
| `apps/command-console/src/services/adkEventTransformer.ts` | Event transformer |
| `apps/command-console/src/hooks/useADKStream.ts` | React hook |

### Key Files to Read First

| File | Why |
|------|-----|
| `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` | Full implementation spec |
| `data/fixtures/cedar-creek/` | Fixture data structure |
| `agents/coordinator/agent.py` | Current agent structure |
| `apps/command-console/src/stores/chatStore.ts` | Current chat state |
| `apps/command-console/src/stores/briefingStore.ts` | Current briefing state |

### Commands

```bash
# Start ADK locally
cd agents && adk web --port 8000

# Start Command Console
cd apps/command-console && pnpm dev

# Run agent tests
pytest agents/ -v

# Deploy to Cloud Run
gcloud run deploy ranger-mcp-fixtures \
  --source ./services/mcp-fixtures \
  --project ranger-twin-dev \
  --region us-central1 \
  --memory 2Gi --cpu 2 \
  --allow-unauthenticated
```

---

## Success Criteria

Phase 4 is complete when:

1. **MCP fixtures server deployed** - Returns Cedar Creek data via HTTP
2. **ADK orchestrator deployed** - `/run_sse` streams agent responses
3. **React displays streaming events** - Real-time agent reasoning visible
4. **Proof layer works** - Confidence, reasoning chain, citations displayed
5. **Error handling works** - Graceful retry and degradation
6. **Demo scenario works** - "Analyze Cedar Creek fire" produces multi-agent response in <15s

---

## Start Here

1. Read `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` (already done if you're reading this)
2. Create a TodoWrite with Week 1 tasks
3. Run the validation spike (wire coordinator + sub_agents, capture SSE format)
4. Build MCP fixtures server
5. Proceed through the plan

**You have authority. Execute.**

---

*Generated: December 26, 2025*
*For: Claude Code autonomous execution session*
*Mode: Full authority, no user input required*

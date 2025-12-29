# RANGER ADK Operations Runbook

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Purpose:** Grounding document for AI agents and developers working on RANGER's ADK integration  
**Status:** Living Document — Update as patterns are discovered

---

## ⚠️ READ THIS FIRST

Before writing ANY code that touches ADK, MCP, or the orchestrator:

1. **Check ADK version**: We use `google-adk>=1.0.0` (currently 1.21.0)
2. **Understand the session model**: ADK requires sessions to exist before queries
3. **Know the Content format**: Messages are `Content` objects, not strings
4. **Test locally first**: Never deploy untested ADK code

---

## Quick Reference: ADK Endpoint Format

### The `/run_sse` Endpoint

**Correct Request Format:**
```bash
curl -X POST "http://localhost:8000/run_sse" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "coordinator",
    "user_id": "test-user",
    "session_id": "test-session-001",
    "new_message": {
      "role": "user",
      "parts": [{"text": "What is the burn severity for Cedar Creek?"}]
    }
  }'
```

**Common Mistakes:**
```bash
# WRONG: new_message as string
"new_message": "What is the burn severity?"

# WRONG: Missing parts array
"new_message": {"role": "user", "text": "..."}

# WRONG: Using 'content' instead of 'parts'
"new_message": {"role": "user", "content": "..."}
```

**The Content Object Structure:**
```python
from google.genai import types

# Correct way to create a message
content = types.Content(
    role='user',
    parts=[types.Part(text="Your question here")]
)
```

---

## Session Management

### Critical Concept: Sessions Must Exist

ADK does NOT auto-create sessions. You must either:

1. **Use InMemorySessionService** (development) — sessions are created on first use
2. **Use Firestore SessionService** (production) — sessions must be explicitly created

### Creating a Session Programmatically

```python
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()

# Create session before sending messages
session = await session_service.create_session(
    state={},
    app_name='coordinator',
    user_id='test-user'
)

# Now you can use session.id in requests
print(f"Session ID: {session.id}")
```

### Session in the Request Flow

```
1. Client sends request with session_id
2. ADK looks up session in SessionService
3. If not found → "Session not found" error
4. If found → Message processed, state updated
```

### ⚠️ CRITICAL: Server Assigns Session IDs

**The ADK server ignores client-provided session IDs and generates its own.** You MUST:

1. Create session via POST to `/apps/{app}/users/{user}/sessions`
2. Capture the `id` field from the response
3. Use THAT ID for all subsequent `/run_sse` requests

```bash
# WRONG: Providing your own session ID (server ignores it)
curl -X POST ".../sessions" -d '{"id": "my-custom-id"}'
# Response: {"id": "server-generated-uuid", ...}  # Your ID was ignored!

# CORRECT: Let server assign ID, then capture it
curl -X POST ".../sessions" -d '{}'
# Response: {"id": "abc-123-def", ...}
# Use "abc-123-def" in all subsequent requests
```

**Frontend Pattern (TypeScript):**
```typescript
async createSession(): Promise<void> {
  const response = await fetch(`${ADK_URL}/apps/${APP}/users/${USER}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),  // Empty body - server assigns ID
  });

  const sessionData = await response.json();
  this.sessionId = sessionData.id;  // MUST capture server-assigned ID
}
```

### Our Implementation (main.py)

```python
# We use in-memory sessions by default (no SESSION_SERVICE_URI)
# This means sessions are created automatically on first request
# But the Content format must still be correct!
```

---

## MCP Integration Patterns

### ADK-Native McpToolset (PREFERRED)

```python
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import SseConnectionParams

# Create toolset that connects to MCP server via SSE
toolset = McpToolset(
    connection_params=SseConnectionParams(
        url="http://localhost:8080/sse",  # Note: /sse endpoint
        sse_read_timeout=30
    ),
    tool_filter=["get_fire_context", "mtbs_classify"],  # Optional: limit tools
    tool_name_prefix="mcp_"  # Optional: prefix tool names
)

# Add to agent
root_agent = Agent(
    name="burn_analyst",
    model="gemini-2.0-flash",
    tools=[toolset, other_tool_function],
    # ...
)
```

### DO NOT Use Direct HTTP Calls

```python
# WRONG - Don't do this
async def fetch_from_mcp(tool_name: str, args: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{MCP_URL}/tools/{tool_name}", json=args)
        return response.json()

# This bypasses ADK's tool management, lifecycle, and observability
```

### MCP Server Endpoint Structure

Our MCP Fixtures Server (`services/mcp-fixtures/server.py`) exposes:

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Health check (JSON) |
| `GET /health` | Health check (JSON) |
| `GET /sse` | SSE connection for MCP protocol |
| `POST /messages` | MCP message handling |

**The `/sse` endpoint is what McpToolset connects to.**

---

## Local Development Workflow

### Step 1: Start MCP Fixtures Server (if needed)

```bash
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate

# Terminal 1: MCP Server
cd services/mcp-fixtures
uvicorn server:app --host 0.0.0.0 --port 8080

# Verify it's running
curl http://localhost:8080/health
```

### Step 2: Start ADK Orchestrator

```bash
# Terminal 2: Orchestrator
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
export GOOGLE_API_KEY=your_key_here  # Local dev only
export MCP_FIXTURES_URL=http://localhost:8080/sse  # Note: /sse

python main.py

# Verify it's running
curl http://localhost:8000/health
```

> **Note:** For Cloud Run deployment, use Vertex AI with Application Default Credentials (ADC).
> No `GOOGLE_API_KEY` is needed—the service account authenticates automatically.
> See ADR-006 for details.

### Step 3: Test with Correct Format

```bash
# Simple health test
curl http://localhost:8000/health

# Agent query (correct format)
curl -X POST "http://localhost:8000/run_sse" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "coordinator",
    "user_id": "test",
    "session_id": "session-001",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Hello, what can you help me with?"}]
    }
  }'
```

### Step 4: Start React Frontend

```bash
# Terminal 3: Frontend
cd apps/command-console

# Ensure .env.local has:
# VITE_USE_ADK=true
# VITE_ADK_URL=http://localhost:8000

npm run dev
```

---

## Debugging Common Errors

### Error: "Session not found" (HTTP 404)

**Cause:** Session doesn't exist or wrong session ID used
**Solution:**
1. Ensure you're creating the session BEFORE sending messages
2. Capture the server-assigned session ID from the create response
3. Use THAT ID (not a client-generated one) in subsequent requests
4. Server hasn't restarted (in-memory sessions are lost on restart)

See "⚠️ CRITICAL: Server Assigns Session IDs" section above.

### Error: HTTP 422 "Input should be a valid dictionary"

**Cause:** Sending `new_message` as a string instead of Content object
**Solution:** Use the correct ADK Content format:
```json
{
  "new_message": {
    "role": "user",
    "parts": [{"text": "Your message here"}]
  }
}
```

**NOT:**
```json
{
  "new_message": "Your message here"
}
```

### Error: "new_message must be an object"

**Cause:** Sending string instead of Content object  
**Solution:** Use the correct format:
```json
{
  "new_message": {
    "role": "user",
    "parts": [{"text": "Your message"}]
  }
}
```

### Error: Pydantic validation errors with MCP

**Cause:** MCP library has strict type requirements  
**Solution:** Ensure MCP server is running and accessible at the configured URL. Check that `mcp>=1.25.0` is installed.

### Error: "Agent not found" or "App not found"

**Cause:** `app_name` doesn't match agent directory name  
**Solution:** Use exact directory name from `agents/` folder:
- `coordinator` ✓
- `burn_analyst` ✓
- `Coordinator` ✗ (case sensitive)

### Error: SSE connection drops

**Cause:** Timeout or network issue  
**Solution:** 
1. Increase timeout: `sse_read_timeout=60`
2. Check Cloud Run timeout settings
3. Verify no proxy/firewall blocking SSE

---

## Agent Testing Patterns

### Unit Test an Agent (No API Call)

```python
# Test agent initialization only
from agents.burn_analyst.agent import root_agent

def test_agent_initializes():
    assert root_agent.name == "burn_analyst"
    assert len(root_agent.tools) > 0
```

### Integration Test with Mock Session

```python
import pytest
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

@pytest.mark.asyncio
async def test_burn_analyst_responds():
    from agents.burn_analyst.agent import root_agent
    
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        state={}, app_name='burn_analyst', user_id='test'
    )
    
    runner = Runner(
        app_name='burn_analyst',
        agent=root_agent,
        session_service=session_service,
    )
    
    content = types.Content(role='user', parts=[types.Part(text="Hello")])
    
    events = []
    async for event in runner.run_async(
        session_id=session.id,
        user_id='test',
        new_message=content
    ):
        events.append(event)
    
    assert len(events) > 0
```

### E2E Test with Real API (Requires GOOGLE_API_KEY)

```bash
# Set API key
export GOOGLE_API_KEY=your_key

# Run specific test
pytest agents/burn_analyst/tests/test_agent.py -v -k "test_real_query"
```

---

## Documentation Links

### Official ADK Documentation

- **ADK Python Docs**: https://google.github.io/adk-docs/
- **ADK GitHub**: https://github.com/google/adk-python
- **MCP Tools Guide**: https://google.github.io/adk-docs/tools-custom/mcp-tools/

### RANGER-Specific Docs

| Document | Purpose | Location |
|----------|---------|----------|
| ADR-005 | Skills-First Architecture | `docs/adr/ADR-005-skills-first-architecture.md` |
| ADR-006 | Google-Only LLM Strategy | `docs/adr/ADR-006-google-only-llm-strategy.md` |
| MCP Integration Plan | Implementation tasks | `docs/archive/_!_PHASE4-MCP-INTEGRATION-PLAN.md` |
| Phase 4 Guide | Overall implementation | `docs/archive/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` |

### To Look Up ADK Patterns

Use Context7 to fetch current ADK documentation:
```
Context7:resolve-library-id with libraryName="google adk"
Context7:get-library-docs with topic="sessions" or "mcp tools" or "runner"
```

---

## Environment Variables Reference

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `GOOGLE_API_KEY` | Gemini API authentication | None | Yes |
| `MCP_FIXTURES_URL` | MCP server SSE endpoint | `http://localhost:8080/sse` | For MCP |
| `SESSION_SERVICE_URI` | Firestore for sessions | None (in-memory) | Production |
| `ALLOW_ORIGINS` | CORS allowed origins | `*` | No |
| `AGENTS_DIR` | Path to agents directory | `./agents` | No |

---

## Pre-Flight Checklist

Before starting any ADK development session:

- [ ] `GOOGLE_API_KEY` is set and valid
- [ ] Virtual environment activated: `source .venv/bin/activate`
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] MCP server running (if testing MCP): `curl http://localhost:8080/health`
- [ ] Orchestrator starts cleanly: `python main.py`
- [ ] Health check passes: `curl http://localhost:8000/health`
- [ ] Reviewed this runbook's "Quick Reference" section

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-26 | Added critical session ID capture pattern from validation | Claude Code |
| 2025-12-26 | Added HTTP 422 error documentation | Claude Code |
| 2025-12-27 | Initial version | CTO |

---

*This is a living document. Update it when you discover new patterns, errors, or solutions.*

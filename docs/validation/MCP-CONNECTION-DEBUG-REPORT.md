# MCP Connection Debugging Report

**Date:** December 27, 2025
**Issue:** MCP SSE connection fails with `httpcore.ReadError` preventing agent execution
**Status:** ✅ **RESOLVED** - stdio transport implemented and verified

---

## Resolution Summary

**Implementation:** MCP stdio transport (Option 1 from recommendations)
**Status:** ✅ Successfully deployed and tested
**Test Results:** Trail Assessor agent test PASSED
**Deployment:** All agents updated to use stdio transport

### What Was Fixed

1. **Server**: Replaced SSE/Starlette with stdio transport (`services/mcp-fixtures/server.py`)
2. **Client**: Updated `agents/shared/mcp_client.py` to use `StdioConnectionParams`
3. **Verification**: Created and passed standalone MCP connection test
4. **E2E Test**: Trail Assessor agent successfully executed with MCP tool calls

### Test Evidence

```
✅ MCP stdio connection established
✅ Agent loaded with MCP toolset
✅ Tool call executed: classify_damage
✅ Response generated: 1445 chars
✅ Status: PASS
```

**Trail Assessor Response Sample:**
- Analyzed 5 trails with 15 damage points
- Categorized TYPE I-IV severity
- Generated cost estimates ($10.8K - $298K)
- Identified critical reconstruction needs

---

## Original Problem Analysis (SSE Implementation)

The RANGER agents could not execute because the MCP Fixtures Server's SSE (Server-Sent Events) connection implementation had integration issues with Starlette's routing system. The server started successfully and responded to health checks, but failed when establishing the SSE connection needed for MCP protocol communication.

**Root Cause:** The MCP server implementation pattern was incompatible with Starlette's endpoint model. Three solution options were identified, with stdio transport chosen as the fastest path to working agents.

---

## Root Cause Analysis

### Issue #1: ASGI App vs Endpoint Function Mismatch

**Location:** `services/mcp-fixtures/server.py:235-261`

**Problem:**
The `handle_sse` function is neither a proper Starlette endpoint nor a standalone ASGI app:
- Starlette Route expects endpoints to return a `Response` object
- MCP's `connect_sse()` handles the response internally via background tasks
- The function returns `None`, causing `TypeError: 'NoneType' object is not callable`

**Evidence:**
```
TypeError: 'NoneType' object is not callable
File "starlette/routing.py", line 76, in app
    await response(scope, receive, send)
```

**Why This Happens:**
1. `connect_sse()` is an async context manager
2. It starts a background task (`response_wrapper`) to send SSE events
3. The calling function blocks on `mcp_server.run()`
4. When the function exits, it returns `None`
5. Starlette tries to call `None` as a Response object → crash

### Issue #2: Path Prefix Conflicts with Mount

**Problem:**
When using `Mount("/sse", app=handle_sse)`:
- Starlette strips `/sse` prefix before calling the mounted app
- But `SseServerTransport("/messages")` tells clients to POST to `/messages`
- Client actually POSTs to `/sse/messages` due to the mount
- This creates path routing conflicts

**Evidence:**
Server logs show: `POST /sse/sse?session_id=...` (double `/sse` path)

### Issue #3: MCP Client Timeout

**Problem:**
Even when SSE connection establishes, POST messages time out with `httpcore.ReadError`

**Evidence:**
```
Error in post_writer
httpcore.ReadError
File "mcp/client/sse.py", line 139, in post_writer
    response = await client.post(...)
```

**Analysis:**
The POST endpoint receives requests but doesn't respond properly, causing the client to time out waiting for acknowledgment.

---

## What We Tried

### Attempt 1: Direct Endpoint Function ❌
```python
async def handle_sse(request):
    async with sse_transport.connect_sse(...):
        await mcp_server.run(...)
```
**Result:** Returns `None`, Starlette crashes with TypeError

### Attempt 2: Mount with ASGI App ❌
```python
Mount("/sse", app=handle_sse)
```
**Result:** Path prefix issues, POST goes to `/sse/sse`

### Attempt 3: ASGI App Class ❌
```python
class SSEHandler:
    async def __call__(self, scope, receive, send):
        ...
```
**Result:** Same path prefix issues with Mount

### Attempt 4: Route with ASGI Signature ❌
```python
async def handle_sse(scope, receive, send):
    ...
Route("/sse", endpoint=handle_sse)
```
**Result:** Starlette Route expects `Request` parameter, not ASGI signature

---

## Recommended Solutions

### Option 1: Use MCP stdio Transport (RECOMMENDED)

**Pros:**
- Simpler, more reliable
- No HTTP/SSE complexity
- Official MCP recommendation for local development
- Already working in MCP examples

**Cons:**
- Can't be called over HTTP
- Requires running agents as separate processes
- Not suitable for Cloud Run deployment (without modifications)

**Implementation:**
Replace SSE server with stdio server:
```python
# server.py
import mcp.server.stdio

if __name__ == "__main__":
    mcp.server.stdio.run_server(mcp_server)
```

Then connect agents via:
```python
from mcp.client.stdio import StdioServerParameters, stdio_client

async with stdio_client(
    StdioServerParameters(
        command="python",
        args=["services/mcp-fixtures/server.py"]
    )
) as (read, write):
    async with ClientSession(read, write) as session:
        # Use session
```

### Option 2: Fix Starlette Integration (COMPLEX)

**Approach:**
Create proper ASGI middleware that wraps the MCP SSE handler:

```python
async def mcp_sse_asgi_app(scope, receive, send):
    """Standalone ASGI app for MCP SSE."""
    if scope["type"] == "http" and scope["path"] == "/sse":
        async with sse_transport.connect_sse(scope, receive, send) as streams:
            await mcp_server.run(streams[0], streams[1], ...)
    else:
        # Handle /messages POST
        await sse_transport.handle_post_message(scope, receive, send)

# Use directly without Starlette routing
from uvicorn import run
run(mcp_sse_asgi_app, host="0.0.0.0", port=8080)
```

**Pros:**
- Keeps HTTP/SSE transport for Cloud Run
- No process management needed

**Cons:**
- Complex to get right
- More debugging needed
- Non-standard pattern

### Option 3: Switch to FastAPI (MODERATE)

FastAPI has better ASGI app support via `app.mount()`:

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/sse")
async def sse_endpoint(request: Request):
    async def sse_generator():
        async with sse_transport.connect_sse(...) as streams:
            await mcp_server.run(...)
    return StreamingResponse(sse_generator(), media_type="text/event-stream")
```

---

## Impact Assessment

**Current State:**
- ❌ Cannot test agents end-to-end
- ❌ Cannot verify proof layer (audit bridge)
- ❌ Cannot demonstrate Cedar Creek demo
- ❌ Blocks Phase 4 completion

**Estimated Fix Time:**
- Option 1 (stdio): 2-4 hours (recommended for Phase 1)
- Option 2 (fix Starlette): 4-8 hours (uncertain)
- Option 3 (FastAPI): 3-5 hours

---

## Implementation Reference (stdio Transport)

### Server Implementation (`services/mcp-fixtures/server.py`)

```python
if __name__ == "__main__":
    import asyncio
    import logging
    from mcp.server.stdio import stdio_server

    # Configure logging to stderr (stdout reserved for MCP protocol)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stderr
    )
    logger = logging.getLogger("ranger.mcp-fixtures")

    logger.info("Starting RANGER MCP Fixtures Server (stdio transport)")
    logger.info(f"Tools: get_fire_context, mtbs_classify, assess_trails, get_timber_plots")

    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await mcp_server.run(
                read_stream,
                write_stream,
                mcp_server.create_initialization_options()
            )

    asyncio.run(main())
```

### Client Implementation (`agents/shared/mcp_client.py`)

```python
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp.client.stdio import StdioServerParameters

MCP_SERVER_PATH = PROJECT_ROOT / "services" / "mcp-fixtures" / "server.py"

def get_mcp_toolset(tool_filter=None, tool_name_prefix="mcp_"):
    return McpToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
                command="python",
                args=[str(MCP_SERVER_PATH)],
                env=None  # Inherit parent environment
            ),
            timeout=30.0  # Allow time for server startup
        ),
        tool_filter=tool_filter,
        tool_name_prefix=tool_name_prefix
    )
```

### Usage in Agents

```python
from agents.shared.mcp_client import get_trail_assessor_toolset

# Agent automatically spawns MCP server process and connects via stdio
MCP_TOOLSET = get_trail_assessor_toolset()

root_agent = Agent(
    name="trail_assessor",
    model=MODEL,
    tools=[*SKILLS, MCP_TOOLSET],  # MCP tools available alongside skills
    system_instruction=SYSTEM_INSTRUCTION,
)
```

---

## Future Considerations

For Phase 4 Cloud Run deployment, the stdio transport works well for local development but may need HTTP/SSE for production depending on deployment architecture. Options:

1. **Keep stdio for Cloud Run**: Each agent instance spawns its own MCP server process
2. **Shared HTTP MCP server**: Deploy MCP server separately, agents connect via HTTP/SSE
3. **Hybrid**: stdio for local dev, HTTP/SSE for production (dual transport support)

The current stdio implementation provides a solid foundation for Phase 1 demo and can be extended later if needed.

---

## Testing Checklist

After implementing fix:
- [x] MCP client can connect successfully ✅
- [x] MCP client can list tools ✅
- [x] MCP client can call tools and get responses ✅
- [x] Agent can load with MCP toolset ✅
- [x] Agent can execute queries using MCP tools ✅
- [x] No timeout errors or connection issues ✅

**Test Files:**
- `/tmp/test_stdio_mcp.py` - Standalone MCP connection test (PASSED)
- `/tmp/test_trail_assessor_stdio.py` - Trail Assessor agent E2E test (PASSED)

---

## References

- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Specification: https://spec.modelcontextprotocol.io/
- Starlette ASGI: https://www.starlette.io/applications/
- Issue logs: `/tmp/trail_assessor_e2e.log`
- Server logs: Background task outputs

---

**Conclusion:**

The MCP SSE server implementation has a fundamental architectural mismatch with Starlette's routing model. For Phase 1 (simulated data demo), **switching to stdio transport is the fastest path to working agents**. For Phase 4 (Cloud Run production), a proper HTTP/SSE implementation is needed but requires significant additional work to integrate correctly with ASGI.

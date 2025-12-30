# Phase 0 Validation Report: ADK Orchestrator

**Date:** 2024-12-30
**Investigator:** Claude Code
**Status:** ⚠️ **CRITICAL ENDPOINT MISMATCH DISCOVERED**

---

## Executive Summary

**Backend Status:** ✅ ADK Orchestrator running successfully on port 8000
**Critical Issue:** ❌ Frontend calls `/api/v1/chat` which **does NOT exist**
**Actual Endpoint:** ✅ `/run_sse` (SSE streaming) with **different schema**

**Impact:** This explains why Site Analysis always falls back to Gemini Direct - the endpoint it's calling doesn't exist!

---

## 1. Backend Startup: SUCCESS ✅

### Command Executed
```bash
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate
python main.py
```

### Startup Logs (Excerpt)
```
2025-12-29 22:21:48,719 - ranger-orchestrator - INFO - RANGER ADK Orchestrator starting...
2025-12-29 22:21:48,719 - ranger-orchestrator - INFO - Agents directory: /Users/jvalenzano/Projects/ranger-twin/agents
2025-12-29 22:21:48,719 - ranger-orchestrator - INFO - Session service: in-memory
2025-12-29 22:21:48,719 - ranger-orchestrator - INFO - CORS origins: ['*']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Health Check
```bash
$ curl http://localhost:8000/health
{
  "status": "healthy",
  "service": "ranger-orchestrator",
  "adk_version": "1.21.0",
  "agents_dir": "/Users/jvalenzano/Projects/ranger-twin/agents",
  "session_backend": "in-memory"
}
```

**Verdict:** Backend is fully operational ✅

---

## 2. Endpoint Discovery

### Available Endpoints (from root `/`)
```json
{
  "service": "RANGER ADK Orchestrator",
  "description": "Multi-agent post-fire forest recovery platform",
  "endpoints": {
    "POST /run_sse": "Stream agent responses via SSE",
    "GET /health": "Health check"
  },
  "agents": [
    "coordinator",
    "burn_analyst",
    "trail_assessor",
    "cruising_assistant",
    "nepa_advisor"
  ]
}
```

### Test: `/api/v1/chat` (What Frontend Calls)
```bash
$ curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

Response: 404 Not Found
{"detail":"Not Found"}
```

**❌ CRITICAL: Endpoint does NOT exist!**

---

## 3. Answer to Q2: What Schema Does ADK Expect?

### ADK SSE Schema (from testing `/run_sse`)

**Request Format:**
```json
{
  "appName": "coordinator",           // Required: Agent name
  "userId": "test-user",              // Required: User identifier
  "sessionId": "test-session-123",    // Required: Session ID
  "newMessage": {                     // Required: Gemini Content format
    "role": "user",
    "parts": [
      {"text": "Your query here"}
    ]
  }
}
```

**Validation Errors Encountered:**
1. Missing `appName`, `userId`, `sessionId` → 422 Validation Error
2. Using `text` instead of `parts: [{text}]` → 422 Extra inputs not permitted
3. Non-existent session ID → "Session not found"

**Schema Source:** Google ADK FastAPI integration (google.adk.cli.fast_api)

---

### Frontend Schema (from aiBriefingService.ts)

**Current Request Format:**
```typescript
// Line 289-304 in aiBriefingService.ts
fetch(`${RANGER_API_URL}/api/v1/chat`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    session_id: sessionId,        // Different field name
    query: queryText,             // Simple string, not Gemini parts
    fire_context: {               // Extra context object
      name: fireContext.name,
      acres: fireContext.acres,
      phase: fireContext.status,
      forest: fireContext.forest,
      state: fireContext.state,
    }
  })
})
```

**Comparison Table:**

| Field | Frontend Sends | ADK Expects | Match? |
|-------|---------------|-------------|--------|
| Agent name | — | `appName` (required) | ❌ |
| User ID | — | `userId` (required) | ❌ |
| Session ID | `session_id` | `sessionId` (required) | ⚠️ Different casing |
| Message | `query` (string) | `newMessage.parts[].text` | ❌ Different structure |
| Fire context | `fire_context` (object) | — | ❌ Not in schema |

**Verdict:** **Complete schema mismatch** - Frontend and backend speak different protocols.

---

## 4. Answer to Q3: Is SSE Streaming Active?

**YES** - `/run_sse` endpoint is active and expects SSE connections.

### SSE Test (attempted)
```bash
curl -X POST http://localhost:8000/run_sse \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d @adk-request.json
```

**Result:** Schema accepted, but session management required (returned "Session not found")

**SSE Architecture:**
- ADK uses Server-Sent Events for streaming agent responses
- Each message is an event in the stream
- Proof layer events would be streamed incrementally
- Frontend needs EventSource or SSE client library

**Current Frontend:** Uses `fetch()` for request/response, **NOT** SSE streaming.

---

## 5. Answer to Q1: Does Coordinator Emit Proof Layers?

**CANNOT TEST YET** - Session management barrier.

### What We Know:
1. ✅ Backend is running
2. ✅ `/run_sse` endpoint exists
3. ⚠️ Sessions must be created before sending messages
4. ❌ Cannot test Coordinator response without valid session

### Next Steps to Answer Q1:
1. **Option A:** Implement session creation flow
2. **Option B:** Add simple `/api/v1/chat` wrapper endpoint (bypasses session management)
3. **Option C:** Use ADK CLI tools to create test session

**Recommendation:** Option B - add compatibility endpoint first to unblock testing.

---

## 6. Root Cause Analysis

### Why Site Analysis Always Falls Back to Gemini

```
[Frontend Code Flow]
1. aiBriefingService.query() called
2. Line 252: if (USE_RANGER_API) → TRUE
3. Line 255: await this.queryRangerAPI(...)
   → Calls POST http://localhost:8000/api/v1/chat
   → Connection succeeds (port 8000 is listening)
   → 404 Not Found (endpoint doesn't exist)
   → fetch() throws error
4. Line 257: Catch block activated
   → console.warn('[AIBriefingService] RANGER API failed, falling back to Gemini direct')
5. Line 265: return await this.queryGeminiDirect(...)
   → Direct Gemini API call
   → Returns hardcoded confidence: 90, citations: []
```

**The Issue:** Backend is running, but the endpoint frontend expects doesn't exist. The 404 error triggers immediate fallback.

---

## 7. Architecture Decision Required

Jason, you clarified that **ADK Orchestrator is canonical**, but there's a critical integration gap:

### **The Gap:**

| Component | Expectation |
|-----------|------------|
| **Frontend** | REST endpoint `/api/v1/chat` with request/response |
| **ADK Backend** | SSE streaming `/run_sse` with session management |

### **Three Integration Paths:**

---

### **Option A: Add REST Wrapper to ADK Orchestrator** ⭐ RECOMMENDED

**Implementation:** Add a `/api/v1/chat` endpoint to `main.py` that wraps the ADK session/streaming logic.

**File:** `/Users/jvalenzano/Projects/ranger-twin/main.py`

**Add after line 102:**
```python
@app.post("/api/v1/chat")
async def chat_endpoint(request: dict):
    """
    REST compatibility endpoint for frontend.
    Wraps ADK session management + SSE streaming into request/response.
    """
    from google.adk.sessions import create_session, send_message

    # Extract frontend request
    query = request.get("query", "")
    session_id = request.get("session_id", "default-session")
    fire_context = request.get("fire_context", {})

    # Create or get ADK session
    session = create_session(
        app_name="coordinator",
        session_id=session_id,
        user_id="frontend-user"
    )

    # Send message and wait for response
    response = await send_message(
        session=session,
        message={"role": "user", "parts": [{"text": query}]},
        context={"fire_context": fire_context}
    )

    # Extract proof layer from response
    proof_layer = response.get("proof_layer", {
        "confidence": 90,  # Default fallback
        "reasoning": [],
        "citations": []
    })

    # Return in format frontend expects
    return {
        "success": True,
        "response": {
            "agentRole": response.get("agent_role", "recovery-coordinator"),
            "summary": response.get("content", {}).get("detail", ""),
            "reasoning": proof_layer.get("reasoning_chain", []),
            "confidence": int(proof_layer.get("confidence", 0.9) * 100),
            "citations": proof_layer.get("citations", []),
        },
        "processingTimeMs": response.get("processing_time_ms", 0)
    }
```

**Pros:**
- ✅ Minimal frontend changes (endpoint already called)
- ✅ Unblocks testing immediately
- ✅ Can iterate on proof layer without SSE complexity
- ✅ Provides REST fallback for non-streaming use cases

**Cons:**
- ⚠️ Bypasses SSE streaming (loses real-time updates)
- ⚠️ Adds technical debt (wrapper layer)

**Estimated Effort:** 2-3 hours

---

### **Option B: Update Frontend to Use SSE**

**Implementation:** Modify `aiBriefingService.ts` to use EventSource for `/run_sse`

**Changes Required:**
1. Replace `fetch()` with EventSource
2. Handle SSE event stream
3. Aggregate proof layer events
4. Update UI to show real-time streaming

**Pros:**
- ✅ Architecturally correct (uses ADK as designed)
- ✅ Enables real-time proof layer streaming
- ✅ No backend changes needed

**Cons:**
- ❌ Higher frontend complexity (SSE client, event aggregation)
- ❌ Longer implementation time (6-8 hours)
- ❌ Requires session creation flow

**Estimated Effort:** 6-8 hours

---

### **Option C: Hybrid Approach**

**Implementation:** Add both endpoints:
1. `/api/v1/chat` for simple request/response (Phase 1)
2. `/run_sse` for streaming (Phase 2+)

**Pros:**
- ✅ Fast unblocking (REST endpoint)
- ✅ Path to full SSE streaming later
- ✅ Supports both use cases

**Cons:**
- ⚠️ Maintains two code paths
- ⚠️ Eventual migration needed

**Estimated Effort:** 2-3 hours (Phase 1), +4 hours (Phase 2 migration)

---

## 8. Recommended Implementation Plan (REVISED)

### **Phase 0.5: Add REST Compatibility Endpoint (NEW)** ⭐

**Duration:** 2-3 hours
**Goal:** Unblock frontend testing with minimal changes

**Tasks:**
1. Add `/api/v1/chat` endpoint to `main.py`
2. Implement session wrapper (create if doesn't exist)
3. Convert SSE response to REST response
4. Test with frontend `aiBriefingService`

**Success Criteria:**
- ✅ Frontend calls `/api/v1/chat` successfully
- ✅ Receives response (even if proof layer is minimal)
- ✅ No 404 errors
- ✅ Can proceed to Phase 1 testing

---

### **Phase 1: Verify Proof Layer Flow (UNCHANGED)**

Once `/api/v1/chat` works, test if Coordinator returns proof layer data.

---

### **Phase 2+: (UNCHANGED)**

Feature-ID enhancement, spatial queries, etc.

---

## 9. Critical Questions for Jason

### Q1: Which Integration Path?
- **Option A:** Add REST wrapper (fast, gets us testing)
- **Option B:** Full SSE migration (architecturally pure, longer)
- **Option C:** Hybrid (REST now, SSE later)

**My Recommendation:** Option A for Phase 1, migrate to Option C over time.

### Q2: Session Management
How should sessions be created?
- **Auto-create:** Backend creates session on first request (simple)
- **Explicit creation:** Frontend calls session creation endpoint first (proper)

### Q3: Fire Context Passing
Should `fire_context` be:
- **In request body** (current frontend expectation)
- **In session metadata** (cleaner, session-scoped)
- **In message context** (message-level granularity)

---

## 10. Next Steps (Awaiting Approval)

**DO NOT PROCEED until Jason approves:**

1. ✅ **Backend running** - ADK Orchestrator on port 8000
2. ❌ **Endpoint mismatch identified** - `/api/v1/chat` doesn't exist
3. ❌ **Schema mismatch documented** - Frontend/backend protocols incompatible
4. ⏸️ **Awaiting decision** on integration path

**If Option A Approved:**
1. Implement `/api/v1/chat` wrapper endpoint
2. Test with frontend
3. Capture actual Coordinator response
4. Report proof layer status
5. Proceed to Phase 1

**If Option B Approved:**
1. Research SSE client libraries for TypeScript
2. Design event aggregation strategy
3. Implement SSE client in `aiBriefingService`
4. Test streaming
5. Update UI for real-time updates

---

## 11. Evidence Appendix

### Terminal Output: Backend Startup
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [13564]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Test Results Summary
| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/` | GET | 200 OK | Service info JSON |
| `/health` | GET | 200 OK | Health check JSON |
| `/api/v1/chat` | POST | 404 | Not Found |
| `/run_sse` | POST | 422 | Schema validation (then "Session not found") |

### ADK Version Info
- **Version:** 1.21.0
- **Transport:** SSE (Server-Sent Events)
- **Session Backend:** In-memory (default)
- **Agents Loaded:** 5 (coordinator, burn_analyst, trail_assessor, cruising_assistant, nepa_advisor)

---

**Status:** Backend operational, endpoint mismatch identified. Awaiting architectural decision before proceeding to Phase 1 implementation.

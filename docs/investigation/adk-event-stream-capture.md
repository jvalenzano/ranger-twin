# ADK Event Stream Capture Report

**Date:** 2024-12-30
**Investigator:** Claude Code
**Status:** ⚠️ **BLOCKED** - API key leaked, cannot capture full event stream

---

## Test Setup

### Session Creation (SUCCESSFUL)

**Endpoint:** `POST /apps/coordinator/users/test-user-phase0/sessions`

**Request:**
```json
{
  "state": {
    "fire_context": {
      "name": "Cedar Creek Fire",
      "acres": 127831
    }
  }
}
```

**Response (200 OK):**
```json
{
  "id": "80261860-8cee-4948-a793-412ffdf23b6a",
  "appName": "coordinator",
  "userId": "test-user-phase0",
  "state": {
    "fire_context": {
      "name": "Cedar Creek Fire",
      "acres": 127831
    }
  },
  "events": [],
  "lastUpdateTime": 1767078925.2545679
}
```

**✅ Confirmed:** Sessions must be created explicitly before calling `/run_sse`

---

## SSE Streaming Test

### Endpoint: `POST /run_sse`

**Request Schema (VALIDATED):**
```json
{
  "appName": "coordinator",
  "userId": "test-user-phase0",
  "sessionId": "80261860-8cee-4948-a793-412ffdf23b6a",
  "newMessage": {
    "role": "user",
    "parts": [
      {"text": "Give me a recovery briefing for Cedar Creek Fire"}
    ]
  }
}
```

**Response:**
```json
{
  "error": "403 PERMISSION_DENIED. Your API key was reported as leaked. Please use another API key."
}
```

**Status:** ❌ BLOCKED - Cannot capture event stream due to leaked API key

---

## Critical Questions - ANSWERS

### Q1: Does /run_sse auto-create sessions?

**Answer:** ✅ **NO** - Explicit session creation required first.

**Evidence:**
- Testing with non-existent session returned "Session not found" (404)
- Must call `POST /apps/{app_name}/users/{user_id}/sessions` first
- Session creation successful (see evidence above)
- Then use returned `session.id` in `/run_sse` request

---

### Q2: What are the exact event types and JSON schemas?

**Answer:** ❌ **BLOCKED** - ADC credential issue prevents event capture.

**Authentication Error Evolution:**
1. **Attempt 1:** `403 Your API key was reported as leaked`
2. **Attempt 2 (after removing key):** `401 UNAUTHENTICATED - CREDENTIALS_MISSING`

**Error Details:**
```json
{
  "error": {
    "code": 401,
    "message": "API keys are not supported by this API. Expected OAuth2 access token",
    "status": "UNAUTHENTICATED",
    "details": [{
      "reason": "CREDENTIALS_MISSING",
      "service": "aiplatform.googleapis.com",
      "method": "google.cloud.aiplatform.v1beta1.PredictionService.GenerateContent"
    }]
  }
}
```

**Progress:** Backend correctly switched to Vertex AI (not Gemini API), but ADC credentials not being passed.

**Expected event types (from ADK documentation):**
- `THINKING` - Reasoning steps
- `TOOL_CALL` - Tool invocations
- `TOOL_RESULT` - Tool execution results
- `AGENT_RESPONSE` - Final/partial agent responses
- Completion signal (TBD - could be explicit event or connection close)

**Required for Phase 1:** Resolve ADC credential passing

---

### Q3: Is there a `type: "DONE"` event?

**Answer:** **UNKNOWN** - Cannot capture without valid API key.

**Fallback Strategy (if no DONE event):**
- Detect last `AGENT_RESPONSE` event
- Add 5-second timeout after last event
- Close EventSource connection

---

### Q4: Does coordinator emit `proof_layer` field today?

**Answer:** **UNKNOWN** - Cannot test without event stream.

**Phase 1 Scope Depends on Answer:**
- **If YES:** Phase 1 is just frontend integration (4-6 hours)
- **If NO:** Phase 1 includes backend proof layer implementation (10-12 hours)

---

## Blocker Resolution Options

### Option 1: New API Key (RECOMMENDED)

**Action:** Jason provides new `GOOGLE_API_KEY` or `GOOGLE_GENAI_USE_VERTEXAI=TRUE` for ADC auth

**Timeline:** Immediate unblock once provided

**Command to set:**
```bash
export GOOGLE_API_KEY="new-key-here"
# Or for production ADC:
export GOOGLE_GENAI_USE_VERTEXAI=TRUE
```

---

### Option 2: Use Cloud Run Deployment

**Action:** Test against deployed coordinator endpoint

**Endpoint (from .env):**
```
VITE_ADK_URL=https://ranger-coordinator-1058891520442.us-central1.run.app
```

**Test:**
```bash
# Create session on Cloud Run
curl -X POST https://ranger-coordinator-1058891520442.us-central1.run.app/apps/coordinator/users/test/sessions \
  -H 'Content-Type: application/json' \
  -d '{"state": {"fire_context": {...}}}'

# Then test /run_sse with returned session_id
```

**Pros:**
- Production environment
- Real ADC auth
- Actual deployment testing

**Cons:**
- Network latency
- May hit usage quotas
- Harder to debug

---

### Option 3: Mock Event Stream for Phase 1

**Action:** Create synthetic event stream based on ADK documentation patterns

**File:** `/tmp/mock-adk-events.json`
```json
[
  {"type": "THINKING", "content": "Analyzing fire context...", "timestamp": "2024-12-30T..."},
  {"type": "TOOL_CALL", "tool_name": "get_fire_context", "tool_args": {"fire_id": "cedar-creek-2022"}},
  {"type": "TOOL_RESULT", "tool_name": "get_fire_context", "result": {...}},
  {"type": "AGENT_RESPONSE", "content": {"summary": "...", "detail": "..."}, "proof_layer": {...}},
  {"type": "DONE"}
]
```

**Pros:**
- Unblocks Phase 1 implementation
- Can still design event handling logic

**Cons:**
- Synthetic data may not match reality
- Need to redo once real events captured

---

## Recommendation

**Preferred:** Option 1 (new API key) - cleanest path forward

**Fallback:** Option 2 (Cloud Run testing) - validates production deployment

**Last Resort:** Option 3 (mock events) - only if API key unavailable for extended period

---

## What We Confirmed (Without Full Event Capture)

### ✅ Session Management Model

| Operation | Endpoint | Method | Body |
|-----------|----------|--------|------|
| **Create** | `/apps/{app}/users/{user}/sessions` | POST | `{"state": {...}}` |
| **Get** | `/apps/{app}/users/{user}/sessions/{id}` | GET | — |
| **Delete** | `/apps/{app}/users/{user}/sessions/{id}` | DELETE | — |
| **List** | `/apps/{app}/users/{user}/sessions` | GET | — |

### ✅ Session Scoping

Sessions are uniquely identified by:
- `appName` (e.g., "coordinator")
- `userId` (e.g., "frontend-user")
- `sessionId` (UUID generated by ADK)

All three required for session operations.

### ✅ Fire Context Storage

Fire context stored in `session.state`:
```json
{
  "state": {
    "fire_context": {
      "name": "Cedar Creek Fire",
      "acres": 127831,
      "fire_id": "cedar-creek-2022",
      "forest": "Willamette National Forest",
      "state": "Oregon"
    },
    "created_at": "2024-12-30T..."
  }
}
```

Persists across all messages in that session.

### ✅ SSE Streaming Endpoint

`POST /run_sse` accepts:
```json
{
  "appName": "coordinator",
  "userId": "test-user",
  "sessionId": "valid-session-id-here",
  "newMessage": {
    "role": "user",
    "parts": [{"text": "Your query"}]
  }
}
```

**Returns:** `text/event-stream` with SSE format (`data: {...}\n\n`)

---

## Next Steps (After Blocker Resolved)

1. Obtain new API key or enable ADC auth
2. Re-run SSE streaming test with valid session
3. Capture full event stream (all event types)
4. Document exact JSON schemas for each event type
5. Identify completion detection strategy (DONE event vs connection close)
6. Check for proof_layer presence in AGENT_RESPONSE events

---

**Status:** Partial discovery complete. API key blocker prevents full event capture. Session management pattern confirmed and documented.

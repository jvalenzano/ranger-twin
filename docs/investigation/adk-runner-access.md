# ADK Runner & SessionService Access Pattern

**Date:** 2024-12-30
**Investigator:** Claude Code
**Discovery:** Session management via ADK's built-in REST API

---

## Key Discovery: SessionService is Encapsulated ❗

### What We Learned

**Attempted Access Pattern:**
```python
from google.adk.cli.fast_api import get_fast_api_app

app = get_fast_api_app(agents_dir='./agents', ...)

# TESTED: app.state.runner - Does NOT exist
# TESTED: app.state.session_service - Does NOT exist
# TESTED: app.extra - Empty dict
```

**Finding:** `get_fast_api_app()` **encapsulates** the runner and session_service internally. They are not exposed as public attributes of the returned FastAPI app.

**Implication:** We cannot directly call `runner.session_service.create_session()` in our custom endpoints.

---

## The Correct Pattern: Use ADK's REST Session API

ADK provides **RESTful session management endpoints** out of the box:

### Session CRUD Endpoints (Discovered)

```
POST   /apps/{app_name}/users/{user_id}/sessions          Create session
GET    /apps/{app_name}/users/{user_id}/sessions          List sessions
GET    /apps/{app_name}/users/{user_id}/sessions/{id}     Get session
PATCH  /apps/{app_name}/users/{user_id}/sessions/{id}     Update session
DELETE /apps/{app_name}/users/{user_id}/sessions/{id}     Delete session
```

### Test: Session Creation

**Request:**
```bash
curl -X POST http://localhost:8000/apps/coordinator/users/test-user-phase0/sessions \
  -H 'Content-Type: application/json' \
  -d '{
    "state": {
      "fire_context": {
        "name": "Cedar Creek Fire",
        "acres": 127831
      }
    }
  }'
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

**✅ SESSION CREATION WORKS**

---

## Integration Pattern for RANGER

### Phase 1 Implementation Strategy

**DO NOT** try to access internal `runner.session_service`.

**DO** use ADK's built-in session REST API by adding thin wrappers that match frontend expectations:

```python
# File: main.py (additions)

@app.post("/api/v1/session/create")
async def create_session_wrapper(request: CreateSessionRequest):
    """
    Thin wrapper over ADK's session creation endpoint.
    Provides frontend-friendly interface.
    """
    # Delegate to ADK's built-in endpoint
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"http://localhost:8000/apps/coordinator/users/{request.user_id}/sessions",
            json={"state": {"fire_context": request.fire_context or {}}}
        )
        session_data = response.json()

    return {
        "session_id": session_data["id"],
        "user_id": session_data["userId"],
        "app_name": session_data["appName"],
        "status": "ready",
        "fire_context": session_data["state"].get("fire_context")
    }
```

**Rationale:**
- ADK already handles session persistence (in-memory or Firestore)
- ADK already validates app_name/user_id/session_id scoping
- We just provide URL mapping for frontend convenience

---

## Alternative: Direct Frontend Integration

**Even Better:** Frontend could call ADK's session endpoints directly without wrappers.

**Example:**
```typescript
// Frontend calls ADK endpoints directly
const response = await fetch(
  'http://localhost:8000/apps/coordinator/users/frontend-user/sessions',
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      state: {
        fire_context: {
          name: fireContext.name,
          acres: fireContext.acres
        }
      }
    })
  }
);

const session = await response.json();
// session.id is the session_id to use with /run_sse
```

**Pros:**
- Zero backend code needed
- Direct ADK integration
- No wrapper maintenance

**Cons:**
- Frontend tightly coupled to ADK URLs
- URL changes if app_name/user_id changes
- Less abstraction

---

## Recommendation

**Phase 1:** Use ADK endpoints directly from frontend (no backend wrappers)
**Phase 2:** Add convenience wrappers if URL structure becomes cumbersome

**Rationale:**
- Simpler (fewer moving parts)
- Idiomatic ADK usage
- Faster implementation
- Frontend already makes HTTP calls, URLs don't matter

---

## Critical File Paths

**Backend:**
- `/Users/jvalenzano/Projects/ranger-twin/main.py` (Lines 56-113: create_app function)
- ADK Session API: `/apps/{app_name}/users/{user_id}/sessions/*`

**Frontend (to be modified):**
- `/Users/jvalenzano/Projects/ranger-twin/apps/command-console/src/services/adkSessionService.ts` (NEW)

---

## Answer to Critical Question

**Q: How do we access runner.session_service?**

**A: We don't.** Use ADK's built-in REST session endpoints instead:
- `POST /apps/{app_name}/users/{user_id}/sessions` for creation
- `GET /apps/{app_name}/users/{user_id}/sessions/{session_id}` for status
- `DELETE /apps/{app_name}/users/{user_id}/sessions/{session_id}` for cleanup

This is the **idiomatic ADK pattern** for HTTP-based session management.

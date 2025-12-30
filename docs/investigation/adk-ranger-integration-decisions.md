# ADK-RANGER Integration Decisions

**Date:** 2024-12-30
**Based on:** Phase 0 discovery findings
**Status:** Ready for Phase 1 implementation (pending API key resolution)

---

## Decision 1: Session Management Pattern

### Choice: Use ADK's Built-In REST Session API

**Discovery:** ADK's `get_fast_api_app()` encapsulates `runner.session_service` internally and does not expose it as a public attribute.

**Solution:** Use ADK's provided REST endpoints instead of accessing session_service directly.

**Implementation:**

Frontend calls ADK session endpoints directly:
```typescript
// Create session
POST /apps/coordinator/users/frontend-user/sessions
Body: {"state": {"fire_context": {...}}}
Response: {"id": "session-uuid", "appName": "coordinator", "userId": "frontend-user", ...}

// Use session
POST /run_sse
Body: {"appName": "coordinator", "userId": "frontend-user", "sessionId": "session-uuid", "newMessage": {...}}

// Clean up session
DELETE /apps/coordinator/users/frontend-user/sessions/{session_id}
```

**Rationale:**
- ✅ Idiomatic ADK usage (uses framework as designed)
- ✅ No custom backend code needed
- ✅ Leverages ADK's session persistence (in-memory or Firestore)
- ✅ Proper scoping by app_name + user_id + session_id

**Alternative Considered:** Custom session wrapper endpoints (e.g., `/api/v1/session/create`)
**Rejected Because:** Adds unnecessary abstraction layer over ADK's already-RESTful API

---

## Decision 2: Session Lifecycle

### Choice: Create session on modal open, delete on modal close

**Workflow:**
```
User clicks "Analyze Site" button
  → VisualAuditOverlay opens (status: 'refining')
  → useEffect: createSession(activeFire)
  → Session created with fire_context in state
  → User selects chips, enters query
  → User clicks "Run Analysis"
  → queryStream(message) using existing session
  → [User can ask follow-up questions using same session]
  → User closes modal (status: 'idle')
  → useEffect cleanup: closeSession()
  → Session deleted from ADK
```

**Fire Context Storage:**
```json
{
  "state": {
    "fire_context": {
      "name": "Cedar Creek Fire",
      "acres": 127831,
      "fire_id": "cedar-creek-2022",
      "forest": "Willamette National Forest",
      "state": "Oregon",
      "year": 2022
    },
    "created_at": "2024-12-30T22:15:00Z",
    "feature_context": null  // Added when user clicks feature
  }
}
```

**Rationale:**
- Fire context persists for entire modal session
- Supports multi-turn conversations (ask follow-up questions)
- Clean lifecycle (no orphaned sessions)
- Modal close = explicit session termination

---

## Decision 3: User ID Strategy

### Choice: Placeholder "frontend-user" for Phase 1

**Phase 1:** All requests use `userId: "frontend-user"`

**Phase 3:** Replace with real authentication
- Cognito user pool integration
- JWT token extraction
- Actual user identifiers for audit trail

**Rationale:**
- Unblocks development immediately
- Sessions still work (just not multi-user yet)
- Clear technical debt marker for later

---

## Decision 4: Multi-Turn Support

### Choice: Design for multi-turn NOW, even if Phase 1 only tests single-turn

**Session Reuse Pattern:**
```typescript
// First query
await adkSessionService.queryStream("Analyze Hills Creek Trail", ...)

// Follow-up query (same session)
await adkSessionService.queryStream("What's the repair timeline?", ...)
// Coordinator has context from previous turn via session.events
```

**UI Design:**
- Phase 1: Single query, then modal closes (proves SSE works)
- Phase 2: Add "Ask Follow-Up" button that keeps session open
- Phase 3: Full chat interface within modal

**Rationale:**
- Architecture supports it from day one
- No rework needed when adding multi-turn
- Tests session persistence properly

---

## Decision 5: Event Handling Strategy

### Choice: Display TOOL_CALL events, sample THINKING events

**Event Display Rules (to be confirmed once events captured):**

| Event Type | UI Action | Rationale |
|------------|-----------|-----------|
| **THINKING** | Sample max 1 per 500ms | Debounce if frequent, avoid UI noise |
| **TOOL_CALL** | Show immediately | Proves data access, builds trust |
| **TOOL_RESULT** | Show tool name only | Full result may be verbose |
| **AGENT_RESPONSE** | Show full content | Final answer |
| **DONE** (if exists) | Trigger completion | Clear signal |

**Progressive Display Example:**
```
🧠 Analyzing fire context...
📊 Accessing MTBS burn severity data...
📊 Accessing trail damage assessments...
📋 Consulting NEPA regulations...
✅ Analysis complete
```

**Rationale:**
- Tool calls prove the AI is using real data (proof layer foundation)
- THINKING events add context without overwhelming
- Progressive updates build confidence during long operations

---

## Decision 6: Completion Detection Strategy

### Choice: Multi-strategy fallback (until we know which ADK uses)

**Priority Order:**
1. **Explicit DONE event** (if ADK sends `type: "DONE"`)
2. **Connection close + last event** (SSE connection terminates)
3. **Timeout after last event** (No events for 5 seconds)

**Implementation:**
```typescript
let completionTimer: number | null = null;

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'DONE') {
    // Strategy 1: Explicit signal
    handleCompletion();
  } else {
    // Strategy 3: Reset timeout on each event
    if (completionTimer) clearTimeout(completionTimer);
    completionTimer = setTimeout(() => handleCompletion(), 5000);
  }
};

eventSource.addEventListener('error', () => {
  // Strategy 2: Connection close
  handleCompletion();
});
```

**Rationale:**
- Handles all possible completion patterns
- No hanging connections
- Graceful handling of unexpected disconnects

---

## Decision 7: Message Length Handling

### Choice: Truncate at 500 characters for Phase 1

**EventSource URL Construction:**
```
GET /api/v1/chat/stream?session_id={id}&user_id={user}&message={text}
```

**URL Length Limit:** ~2KB (browser dependent)

**Solution:**
```typescript
let queryMessage = contextualQuery;
if (queryMessage.length > 500) {
  queryMessage = queryMessage.substring(0, 497) + '...';
  console.warn('[ADKSession] Message truncated to 500 chars');
}
```

**Phase 2 Alternative (if needed):**
- Add `POST /api/v1/chat/stream/init` that accepts message in body
- Returns stream token
- Use `GET /api/v1/chat/stream/{token}` for EventSource
- Avoids URL length limits

**Rationale:**
- Phase 1 queries are short (chip-based templates)
- 500 char limit unlikely to be hit
- Simpler than POST init + GET stream pattern

---

## Decision 8: Error Handling (Phase 1)

### Choice: Manual retry, no auto-reconnect

**Error Scenarios:**
1. **Session not found:** Show error, prompt to restart analysis
2. **Network disconnect:** Show "Connection lost. Please try again."
3. **SSE parse error:** Log to console, continue stream (don't break on one bad event)
4. **Timeout:** Show "Analysis timed out. Please try again."

**No Auto-Retry Because:**
- Simplicity for Phase 1
- User should see failures clearly
- Production resilience in Phase 3 (exponential backoff)

**Error UI:**
```markdown
## Analysis Error

Connection to RANGER coordinator lost.

[Retry Analysis Button]
```

**Rationale:**
- Clear failure visibility
- User maintains control
- Avoids infinite retry loops

---

## Decision 9: Proof Layer Aggregation Strategy

### Choice: Aggregate from event stream, fallback to AGENT_RESPONSE field

**Aggregation Logic:**
```typescript
const proofLayer = {
  reasoning: [],
  citations: [],
  confidence: 0,
};

// Aggregate from events
THINKING events → proofLayer.reasoning.push(content)
TOOL_CALL events → proofLayer.citations.push({source: tool_name, ...})

// Override with explicit proof_layer if present
AGENT_RESPONSE.proof_layer → Merge with aggregated data
```

**Priority:**
1. Use explicit `proof_layer` field if present in AGENT_RESPONSE
2. Fall back to aggregated event data if not
3. Return empty proof layer if neither exists

**Rationale:**
- Supports both explicit proof layer (if backend emits it) and event-based reconstruction
- Progressive discovery during Phase 1 testing
- Graceful degradation

---

## Decision 10: Feature Context Passing

### Choice: Feature-ID based (not lat/lon spatial search)

**Context Passing:**
```json
{
  "state": {
    "fire_context": {...},
    "feature_context": {
      "feature_id": "HC-004",
      "feature_type": "trail-damage-points",
      "feature_name": "Hills Creek Trail #3510",
      "properties": {
        "damage_id": "2dcca485-...",
        "trail_name": "Hills Creek Trail",
        "type": "DEBRIS_FLOW",
        "severity": 4
      }
    }
  }
}
```

**Coordinator receives feature_id**, looks up in fixture data, delegates to specialists.

**Rationale:**
- Matches current UI workflow (user clicks specific features)
- Simpler than lat/lon spatial calculations
- Direct lookup (fast, precise)
- Phase 2 can add free-form map click with lat/lon if needed

---

## Summary of Decisions

| Decision | Choice | Impact on Phase 1 |
|----------|--------|-------------------|
| Session API | Use ADK REST endpoints | No custom backend code |
| Session lifecycle | Modal open → close | Clean, scoped sessions |
| User ID | "frontend-user" placeholder | Simple, mark as tech debt |
| Multi-turn | Design for it, test single-turn | Future-proof architecture |
| Event display | TOOL_CALL immediate, THINKING sampled | Trust-building UX |
| Completion | Multi-strategy fallback | Robust handling |
| Message length | Truncate at 500 chars | Simple, sufficient |
| Error handling | Manual retry only | Clear failure visibility |
| Proof layer | Aggregate events + explicit field | Flexible, works either way |
| Feature context | Feature-ID based | Matches UI workflow |

---

**Next Gate:** Resolve API key blocker, capture real events, validate decisions against actual ADK behavior.

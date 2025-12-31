# Week 3 Implementation: ADK Integration & Live Agent Communication

**Status:** ✅ COMPLETE
**Branch:** `feature/adr-012-mission-control-ui`
**Prerequisite:** Week 2 Complete (AgentChat foundation)
**Completed:** 2024-12-31

---

## Objectives

1. Connect AgentChat to live Recovery Coordinator via ADK API
2. Implement SSE streaming for real-time responses
3. Wire incident selection to agent context
4. Display proof layer metadata (confidence, sources)

---

## Deliverables

### 1. ADK Chat Service

**File:** `src/services/agentChatService.ts` (new)

**Requirements:**
- Connect to ADK API server (`/run_sse` endpoint)
- Handle SSE streaming responses
- Parse agent events and extract:
  - `content.parts[].text` — Response text
  - `author` — Agent name (Recovery Coordinator, Burn Analyst, etc.)
  - `actions.state_delta` — State changes
  - Proof layer data from response metadata
- Session management (create/resume sessions)

**Interface:**
```typescript
interface AgentChatService {
  createSession(userId: string): Promise<string>;  // Returns sessionId
  sendMessage(
    sessionId: string,
    message: string,
    context?: { incidentId?: string }
  ): AsyncGenerator<AgentEvent>;
  getSessionHistory(sessionId: string): Promise<ChatMessage[]>;
}

interface AgentEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'complete';
  author: string;
  content?: string;
  partial?: boolean;
  proof_layer?: ProofLayer;
}
```

### 2. AgentChat Enhancement

**File:** `src/components/mission/AgentChat.tsx` (modify)

**Requirements:**
- Replace mock responses with live ADK integration
- Stream responses token-by-token (show typing indicator)
- Display agent name attribution from event `author` field
- Show confidence score badge when proof_layer present
- Handle multi-turn conversation context
- Error handling: connection failures, timeout, agent errors

**Streaming UX:**
```
┌─────────────────────────────────────────┐
│ Recovery Coordinator         [87% conf] │
│ ▌                                       │  ← Streaming cursor
│ Based on Burn Analyst assessment...     │
└─────────────────────────────────────────┘
```

### 3. Incident Context Integration

**File:** `src/components/mission/IncidentRail.tsx` (modify)

**Requirements:**
- Clicking incident card sets context in agent session
- Pass incident metadata to agent: `incidentId`, `name`, `phase`, `acres`
- Visual indicator showing which incident is "active" in chat context
- System message in chat: "Context set to Cedar Creek Fire"

**Flow:**
1. User clicks Cedar Creek in IncidentRail
2. System message appears in AgentChat
3. User asks "What's the burn severity?"
4. Agent already knows context is Cedar Creek

### 4. useAgentChat Hook

**File:** `src/hooks/useAgentChat.ts` (new)

**Requirements:**
- Manage chat state (messages, loading, error)
- Handle session lifecycle
- Expose methods: `sendMessage`, `clearHistory`, `setIncidentContext`
- Integrate with Zustand for persistence across component remounts

```typescript
interface UseAgentChat {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  setIncidentContext: (incident: Incident | null) => void;
  clearHistory: () => void;
  activeIncident: Incident | null;
}
```

---

## API Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_ADK_API_URL=http://localhost:8000
NEXT_PUBLIC_ADK_APP_NAME=ranger_coordinator
```

### ADK Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/apps/{app}/users/{user}/sessions/{session}` | POST | Create session |
| `/run_sse` | POST | Send message, stream response |
| `/apps/{app}/users/{user}/sessions/{session}` | GET | Get session history |

---

## Test Checklist

| Component | Test | Expected |
|-----------|------|----------|
| AgentChatService | Create session | Returns valid session ID |
| AgentChatService | Send message | Streams events via SSE |
| AgentChatService | Handle disconnect | Reconnects or shows error |
| AgentChat | Live response | Text streams token-by-token |
| AgentChat | Agent attribution | Shows correct agent name |
| AgentChat | Confidence badge | Displays when proof_layer present |
| AgentChat | Error state | Shows retry button on failure |
| IncidentRail | Context click | Sets incident in chat session |
| IncidentRail | Active indicator | Highlights selected incident |
| Integration | Multi-turn | Maintains conversation context |

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `services/agentChatService.ts` | ADK API integration with SSE |
| `hooks/useAgentChat.ts` | Chat state management |
| `types/agent.ts` | Agent event and message types |

### Modified Files

| File | Changes |
|------|---------|
| `components/mission/AgentChat.tsx` | Live ADK integration |
| `components/mission/IncidentRail.tsx` | Context selection |
| `stores/missionStore.ts` | Chat state slice |

---

## Claude Code Prompt

```
Week 3 Implementation - ADK Integration & Live Agent Communication

Branch: feature/adr-012-mission-control-ui (continue from Week 2)

Read first:
- docs/specs/components/WEEK-3-IMPLEMENTATION.md
- docs/adr/ADR-006-google-only-llm-strategy.md (LLM strategy)

Reference ADK docs (in project):
- api-server.md (ADK API endpoints)
- index.md (Events documentation)
- session.md (Session management)

Tasks:
1. Create services/agentChatService.ts:
   - Connect to ADK /run_sse endpoint
   - Parse SSE events (text, tool_call, tool_result, complete)
   - Extract author, content, proof_layer from events
   - Handle session create/resume

2. Create hooks/useAgentChat.ts:
   - Manage messages, loading, error state
   - Methods: sendMessage, setIncidentContext, clearHistory
   - Persist to Zustand store

3. Enhance AgentChat.tsx:
   - Replace mock with live agentChatService
   - Stream responses (show typing indicator)
   - Display confidence badge from proof_layer
   - Error handling with retry

4. Enhance IncidentRail.tsx:
   - Click card sets incident context in chat
   - Show "active" indicator on selected card
   - System message in chat confirms context

Environment:
- ADK API at http://localhost:8000
- App name: ranger_coordinator

Do NOT implement:
- Proof layer expansion (clickable reasoning chain) - Week 4
- Chat history persistence to backend
- Voice input
```

---

## Success Criteria

Week 3 is complete when:

- [ ] AgentChatService connects to ADK API
- [ ] SSE streaming works (responses appear incrementally)
- [ ] Agent name attribution shows correctly
- [ ] Confidence badge displays when present
- [ ] Clicking incident sets chat context
- [ ] System message confirms context change
- [ ] Error state shows with retry option
- [ ] Multi-turn conversation maintains context
- [ ] No new console errors

---

## Next: Week 4

Continue to [WEEK-4-IMPLEMENTATION.md](./WEEK-4-IMPLEMENTATION.md) for Proof Layer expansion and polish.

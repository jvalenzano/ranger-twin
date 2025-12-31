# Week 2 Implementation: IncidentRail Enhancement & AgentChat Foundation

**Status:** ✅ COMPLETE
**Branch:** `feature/adr-012-mission-control-ui`
**Prerequisite:** Week 1 ✅ Complete

---

## Objectives

1. Enhance IncidentRail with phase indicators and timestamps
2. Build AgentChat component foundation (mock interactions only)
3. Prepare chat interface for Week 3 ADK integration

---

## Deliverables

### 1. IncidentRail Enhancement

**File:** `src/components/mission/IncidentRail.tsx` (modify existing)

**Requirements:**
- Add visual phase indicator (colored left border or badge) to each incident card
- Phase colors from `field-mode.css`: `--phase-active`, `--phase-rehab`, `--phase-monitoring`, `--phase-closed`
- Add "last updated" timestamp to each card (use `useDataFreshness` hook)
- Ensure cards respond to PhaseFilterChips selection (filter logic already wired via Zustand)
- Add empty state: "No incidents match selected phases" when filters exclude all fires

**Card Layout:**
```
┌─────────────────────────────────┐
│ ● Cedar Creek Fire         [▸] │  ← Phase dot + expand chevron
│   Containment: 45% | 125K ac   │
│   Updated 2 min ago            │  ← Freshness timestamp
└─────────────────────────────────┘
```

### 2. AgentChat Component (Foundation)

**File:** `src/components/mission/AgentChat.tsx` (new)

**Requirements:**
- Chat container with message list and input area
- Message types: `user`, `agent`, `system`
- Agent messages display author name (e.g., "Recovery Coordinator", "Burn Analyst")
- Input with send button, disabled state while "thinking"
- **Mock only for Week 2** — No actual LLM integration yet
- Prepare interface for `proof_layer` display (confidence score placeholder)

**Message Interface:**
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  author?: string;  // Agent name when role === 'agent'
  content: string;
  timestamp: Date;
  proof_layer?: {
    confidence: number;
    sources: string[];
    reasoning_chain?: string[];
  };
}
```

**Mock Interaction:**
- User sends message → 1.5s delay → Mock agent response
- Include 2-3 hardcoded responses demonstrating multi-agent attribution
- Example: User asks "What's the status of Cedar Creek?" → Response from "Recovery Coordinator" that references "Burn Analyst"

### 3. Layout Integration

**File:** `src/components/mission/MissionControl.tsx` (modify)

**Requirements:**
- Add AgentChat to right panel (alongside or replacing current agent panel)
- Maintain responsive behavior: Chat collapses to bottom drawer on mobile
- AgentChat should take ~40% of right panel width on desktop

---

## Styling Guidelines

- Continue using `field-mode.css` variables
- Chat bubbles: User messages right-aligned (accent color), Agent messages left-aligned (surface color)
- Agent name badge above agent messages
- Monospace font for any code/data in messages
- Subtle animation on new message arrival

---

## Test Checklist

| Component | Test | Expected |
|-----------|------|----------|
| IncidentRail | Phase indicator visible | Colored dot/border matches phase |
| IncidentRail | Empty state | Shows message when no matches |
| IncidentRail | Timestamp | Shows relative time, updates |
| AgentChat | Render | Shows input, empty message area |
| AgentChat | Send message | User message appears, mock response after delay |
| AgentChat | Agent attribution | Response shows agent name |
| AgentChat | Disabled during response | Input disabled while "thinking" |

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `components/mission/AgentChat.tsx` | Chat interface with mock responses |
| `components/mission/AgentChat.css` | Chat-specific styles (optional) |

### Modified Files

| File | Changes |
|------|---------|
| `components/mission/IncidentRail.tsx` | Phase indicators, timestamps, empty state |
| `components/mission/MissionControl.tsx` | AgentChat integration |

---

## Claude Code Prompt

```
Week 2 Implementation - IncidentRail Enhancement & AgentChat Foundation

Branch: feature/adr-012-mission-control-ui (continue from Week 1)

Read first:
- docs/specs/components/WEEK-2-IMPLEMENTATION.md

Tasks:
1. Enhance IncidentRail.tsx:
   - Add phase indicator (colored dot/border) to each card
   - Add "Updated X ago" timestamp using useDataFreshness hook
   - Add empty state when filters exclude all incidents
   - Use phase colors from field-mode.css

2. Create AgentChat.tsx:
   - Chat container with message list and input
   - Message interface with role, author, content, timestamp, proof_layer
   - Mock responses only (no LLM integration)
   - Show agent name attribution on responses
   - Disable input while "thinking" (1.5s delay)

3. Integrate into MissionControl.tsx:
   - Add AgentChat to right panel
   - Responsive: collapses to bottom drawer on mobile

Reference patterns:
- existing IncidentRail.tsx for card structure
- field-mode.css for phase colors (--phase-active, --phase-rehab, etc.)

Do NOT implement:
- Actual ADK/LLM integration (Week 3)
- WebSocket/SSE streaming (Week 3)
- Proof layer expansion UI (Week 4)
- Chat history persistence
```

---

## Success Criteria

Week 2 is complete when:

- [x] IncidentRail shows phase indicators (colored dot/border)
- [x] IncidentRail shows "Updated X ago" timestamps
- [x] IncidentRail displays empty state when filters exclude all incidents
- [x] AgentChat renders with input and message area
- [x] AgentChat mock interaction works (send → delay → response)
- [x] AgentChat shows agent name attribution
- [x] AgentChat input disables during "thinking" state
- [x] Layout integrates without breaking Week 1 features
- [x] No new console errors

---

## Closeout Notes

### AgentChat UX Enhancements (Week 2.5)

**Completed:** 2024-12-31

All 8 UX enhancements from [AgentChat-UX-ENHANCEMENTS.md](./AgentChat-UX-ENHANCEMENTS.md) implemented:

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | Copy message button | Hover-reveal copy icon on agent messages with "Copied!" feedback |
| 2 | Suggested prompts | 4 clickable chips in empty state (Cedar Creek, watersheds, NEPA, trails) |
| 3 | Enhanced typing indicator | Agent name + 3 animated bouncing dots + "Analyzing..." text |
| 4 | Scroll-to-bottom button | Sticky button appears when scrolled >100px from bottom |
| 5 | Follow-up suggestions | 3 contextual chips after each agent response |
| 6 | Connection status indicator | Yellow "Mock" badge in header (prep for Week 3 live status) |
| 7 | Keyboard shortcuts | ↑↓ history navigation, Cmd+K focus, Cmd+L clear |
| 8 | Input history | Last 10 messages stored, arrow keys to recall |

**Files Modified:**
- `src/components/mission/AgentChat.tsx` — All UI enhancements
- `src/stores/mockChatStore.ts` — Added `inputHistory` state and `addToHistory` action

**Verification:**
- TypeScript build: Pass
- Browser testing: All features functional in docked and popped-out views

---

## Next: Week 3

Continue to [WEEK-3-IMPLEMENTATION.md](./WEEK-3-IMPLEMENTATION.md) for ADK integration and live agent communication.

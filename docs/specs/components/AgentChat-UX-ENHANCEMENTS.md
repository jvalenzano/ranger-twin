# AgentChat UX Enhancements

**Status:** Proposed
**Priority:** High/Medium (see individual items)
**Target:** Week 2.5 - Week 3
**Related:** ADR-012 Mission Control UI, WEEK-2-IMPLEMENTATION.md

---

## Overview

This document captures human-centered design improvements for the AgentChat component. These enhancements are informed by the needs of forest recovery coordinators working in field conditions with the RANGER platform.

### Design Principles

1. **Field-First Design** — Optimize for outdoor use, gloved hands, intermittent connectivity
2. **Reduce Cognitive Load** — Surface information progressively, minimize required input
3. **Trust Through Transparency** — Show AI reasoning, sources, and confidence clearly
4. **Graceful Degradation** — Handle errors and edge cases elegantly

---

## High-Impact Enhancements

### 1. Copy Message Button

**Priority:** High
**Effort:** Small (1-2 hours)
**User Story:** As a field coordinator, I need to copy agent responses to share with team members via radio/text or paste into incident reports.

**Current State:**
No copy functionality exists. Users must manually select text.

**Proposed Enhancement:**
- Add copy icon button to each agent message (appears on hover/focus)
- Click copies full message content to clipboard
- Show brief "Copied!" confirmation toast
- Include keyboard shortcut (Cmd/Ctrl+C when message focused)

**Implementation:**
```typescript
// Add to message bubble
<button
  onClick={() => copyToClipboard(msg.content)}
  className="opacity-0 group-hover:opacity-100 transition-opacity"
  title="Copy message"
>
  <Copy size={12} />
</button>
```

**Acceptance Criteria:**
- [ ] Copy button appears on hover for agent messages
- [ ] Clicking copies message content to clipboard
- [ ] Visual feedback confirms copy action
- [ ] Works in both docked and popped-out views

---

### 2. Suggested Prompts (Empty State)

**Priority:** High
**Effort:** Small (1-2 hours)
**User Story:** As a new user, I want to understand what I can ask the AI so I can quickly get relevant information.

**Current State:**
Single suggestion: "Try: What's the status of Cedar Creek?"

**Proposed Enhancement:**
Replace single suggestion with 3-4 clickable prompt chips:

```
┌─────────────────────────────────────┐
│           🤖 Recovery Coordinator   │
│                                     │
│     What would you like to know?    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ What's the status of        │    │
│  │ Cedar Creek?                │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Show high-priority          │    │
│  │ watersheds                  │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ NEPA timeline for emergency │    │
│  │ stabilization               │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Trail closure               │    │
│  │ recommendations             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
const SUGGESTED_PROMPTS = [
  "What's the status of Cedar Creek?",
  "Show high-priority watersheds",
  "NEPA timeline for emergency stabilization",
  "Trail closure recommendations",
];

// Render as clickable chips
{SUGGESTED_PROMPTS.map((prompt) => (
  <button
    key={prompt}
    onClick={() => handleSuggestedPrompt(prompt)}
    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 text-left transition-colors"
  >
    {prompt}
  </button>
))}
```

**Acceptance Criteria:**
- [ ] Empty state shows 4 suggested prompts
- [ ] Clicking a prompt populates input and sends immediately
- [ ] Prompts are contextually relevant to BAER operations
- [ ] Works on mobile (touch targets meet 44px minimum)

---

### 3. Enhanced Typing Indicator

**Priority:** High
**Effort:** Small (1-2 hours)
**User Story:** As a user, I want to see which agent is working on my request so I understand the multi-agent coordination.

**Current State:**
Generic "Thinking..." with spinner.

**Proposed Enhancement:**
Show agent-aware typing indicator with animated dots:

```
┌─────────────────────────────────────┐
│  Recovery Coordinator               │
│  ┌─────────────────────────────┐    │
│  │ ● ● ●  Analyzing request... │    │  ← Animated dots
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

For Week 3-4 when delegation is visible:
```
┌─────────────────────────────────────┐
│  Recovery Coordinator               │
│  ┌─────────────────────────────┐    │
│  │ Consulting Burn Analyst...  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
// Typing indicator with agent context
{isThinking && (
  <div className="flex items-start gap-2">
    <span className="text-[10px] text-amber-400">
      {thinkingAgent || 'Recovery Coordinator'}
    </span>
    <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5">
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span className="text-sm text-slate-400 ml-2">
        {thinkingMessage || 'Analyzing...'}
      </span>
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Typing indicator shows agent name
- [ ] Animated dots provide visual feedback
- [ ] Message text can be customized (for Week 3 delegation visibility)
- [ ] Matches existing message bubble styling

---

### 4. Scroll-to-Bottom Button

**Priority:** High
**Effort:** Small (1-2 hours)
**User Story:** As a user reviewing conversation history, I want to quickly return to the latest messages.

**Current State:**
Auto-scroll on new messages, but no way to jump back after scrolling up.

**Proposed Enhancement:**
Floating button appears when user scrolls up from bottom:

```
┌─────────────────────────────────────┐
│  [older messages...]                │
│                                     │
│                                     │
│                    ┌───────────┐    │
│                    │  ↓ New    │    │  ← Floating button
│                    └───────────┘    │
├─────────────────────────────────────┤
│ [Input field                ] [▶]  │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
const [showScrollButton, setShowScrollButton] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  setShowScrollButton(!isNearBottom);
};

// Floating button
{showScrollButton && (
  <button
    onClick={scrollToBottom}
    className="absolute bottom-20 right-4 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors shadow-lg"
  >
    ↓ Latest
  </button>
)}
```

**Acceptance Criteria:**
- [ ] Button appears when scrolled >100px from bottom
- [ ] Button hidden when at/near bottom
- [ ] Click smoothly scrolls to bottom
- [ ] Button shows unread count badge if new messages arrived while scrolled up

---

### 5. Follow-up Suggestions

**Priority:** High
**Effort:** Medium (2-3 hours)
**User Story:** As a user, after receiving an agent response, I want suggested follow-up questions to continue the conversation efficiently.

**Current State:**
No follow-up suggestions. Users must think of and type next question.

**Proposed Enhancement:**
After each agent response, show 2-3 contextual quick-reply chips:

```
┌─────────────────────────────────────┐
│  Recovery Coordinator               │
│  ┌─────────────────────────────┐    │
│  │ Cedar Creek Fire is at 45%  │    │
│  │ containment. The BAER team  │    │
│  │ identified 3 watersheds...  │    │
│  │                             │    │
│  │ Confidence: 87% • 2 sources │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │  ← Follow-up chips
│  │ Tell me more │ │ Erosion risk │  │
│  │ about Zone A3│ │ mitigation   │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Implementation:**
```typescript
// Add to mock responses
const MOCK_RESPONSES = [
  {
    author: 'Recovery Coordinator',
    content: '...',
    proof_layer: { ... },
    followUpSuggestions: [
      'Tell me more about Zone A3',
      'Erosion risk mitigation options',
      'Timeline for watershed stabilization',
    ],
  },
];

// Render below message
{msg.followUpSuggestions && (
  <div className="flex flex-wrap gap-2 mt-2">
    {msg.followUpSuggestions.slice(0, 3).map((suggestion) => (
      <button
        key={suggestion}
        onClick={() => handleSuggestedPrompt(suggestion)}
        className="px-2 py-1 text-[10px] rounded bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 transition-colors"
      >
        {suggestion}
      </button>
    ))}
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Follow-up suggestions appear after agent messages
- [ ] Clicking suggestion sends it as next message
- [ ] Suggestions disappear after user sends any message
- [ ] Max 3 suggestions per response (avoid clutter)

---

## Medium-Impact Enhancements

### 6. Connection Status Indicator

**Priority:** Medium
**Effort:** Small (1 hour)
**User Story:** As a user, I want to know if the AI is connected/available so I understand system status.

**Current State:**
No status indicator.

**Proposed Enhancement:**
Add subtle status badge in header:

```
┌─────────────────────────────────────┐
│ 🤖 Recovery Coordinator  [Mock] [×] │  ← Status badge
└─────────────────────────────────────┘
```

Status states:
- **Mock Mode** (Week 2): Yellow badge "Mock"
- **Connected** (Week 3+): Green dot
- **Reconnecting**: Yellow dot with pulse
- **Disconnected**: Red dot

**Acceptance Criteria:**
- [ ] Status badge visible in header
- [ ] Current state: shows "Mock" badge
- [ ] Prepared for Week 3 connection states

---

### 7. Keyboard Shortcuts

**Priority:** Medium
**Effort:** Small (1-2 hours)
**User Story:** As a power user, I want keyboard shortcuts to work efficiently without reaching for the mouse.

**Supported Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Enter` | Send message (already implemented) |
| `Escape` | Dock chat / close modal (already implemented) |
| `↑` | Recall previous message from history |
| `Cmd/Ctrl + K` | Focus chat input |
| `Cmd/Ctrl + L` | Clear chat |

**Implementation:**
```typescript
// Input history
const [inputHistory, setInputHistory] = useState<string[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowUp' && !input && inputHistory.length > 0) {
    e.preventDefault();
    const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
    setHistoryIndex(newIndex);
    setInput(inputHistory[newIndex]);
  }
  // ... other shortcuts
};
```

**Acceptance Criteria:**
- [ ] Arrow up recalls previous messages
- [ ] Global shortcut focuses chat input
- [ ] Clear shortcut with confirmation
- [ ] Help tooltip shows available shortcuts

---

### 8. Input History (Arrow Up)

**Priority:** Medium
**Effort:** Small (1-2 hours)
**User Story:** As a returning user, I want to recall previous questions without retyping them.

**Current State:**
No input history.

**Proposed Enhancement:**
- Store last 10 sent messages in session
- Arrow up cycles through history
- Arrow down returns toward current input
- Escape clears history navigation

**Acceptance Criteria:**
- [ ] Arrow up in empty input recalls last message
- [ ] Can cycle through up to 10 previous messages
- [ ] History persists in session (not across page refresh)
- [ ] Typing new content exits history mode

---

## Lower-Priority Enhancements (Future)

### 9. Message Timestamps on Hover

**Priority:** Low
**Effort:** Small
**Description:** Show full date/time on hover for messages older than today. Currently shows only HH:MM.

### 10. Message Grouping

**Priority:** Low
**Effort:** Medium
**Description:** Group sequential messages from same agent without repeating author attribution.

### 11. Sound/Haptic Feedback

**Priority:** Low
**Effort:** Small
**Description:** Optional notification sound when agent responds (useful when multitasking). Respect system notification preferences.

### 12. Thumbs Up/Down Feedback

**Priority:** Low (valuable for Week 4+)
**Effort:** Medium
**Description:** Allow users to rate responses for future training data collection. Store feedback with message ID for analysis.

### 13. Export Conversation

**Priority:** Low
**Effort:** Medium
**Description:** Export full conversation as markdown or PDF for incident documentation.

---

## Implementation Roadmap

### Week 2.5 (Immediate)
- [ ] Copy message button (#1)
- [ ] Suggested prompts in empty state (#2)
- [ ] Enhanced typing indicator (#3)

### Week 3
- [ ] Scroll-to-bottom button (#4)
- [ ] Follow-up suggestions (#5)
- [ ] Connection status indicator (#6)

### Week 3-4
- [ ] Keyboard shortcuts (#7)
- [ ] Input history (#8)

### Backlog
- Message timestamps on hover (#9)
- Message grouping (#10)
- Sound/haptic feedback (#11)
- Thumbs up/down feedback (#12)
- Export conversation (#13)

---

## Design Resources

### Color Palette (from field-mode.css)
- User message: `bg-cyan-500/20 text-cyan-100`
- Agent message: `bg-white/5 text-slate-200`
- Agent name: `text-amber-400`
- Muted text: `text-slate-500`
- Interactive hover: `hover:bg-white/10`

### Icon Library
Using Lucide React:
- `Copy` - Copy button
- `ChevronDown/Up` - Expand/collapse
- `ArrowDown` - Scroll to bottom
- `Circle` - Status indicator
- `Keyboard` - Shortcuts help

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to first question | ~15s (typing) | <5s (click suggestion) |
| Messages copied per session | 0 | Track usage |
| Scroll-to-bottom clicks | N/A | <3 per long conversation |
| Follow-up suggestion usage | 0% | >30% |

---

## References

- [ADR-012 Mission Control UI](../adr/ADR-012-mission-control-ui.md)
- [WEEK-2-IMPLEMENTATION.md](./WEEK-2-IMPLEMENTATION.md)
- [PROOF-LAYER-DESIGN.md](../PROOF-LAYER-DESIGN.md)
- [Field Mode CSS Variables](../../../apps/command-console/src/styles/field-mode.css)

# RANGER Punch List

> **Purpose:** Track bugs, UX issues, and improvements discovered during testing
> **Format:** Simple, scannable, actionable

---

## How to Log Issues

```
### [PL-XXX] Short Title
- **Type:** Bug | UX | Enhancement | Performance
- **Severity:** P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Low)
- **Location:** Where in the app
- **Description:** What's wrong
- **Expected:** What should happen
- **Screenshot:** (if applicable)
- **Status:** Open | In Progress | Fixed | Won't Fix
```

---

## Open Issues

### [PL-001] Profile Avatar Not Rendering
- **Type:** Bug
- **Severity:** P3 (Low)
- **Location:** Mission Control → Header (top right)
- **Description:** Profile picture shows broken/missing image icon instead of avatar
- **Expected:** Should show user avatar or default placeholder icon
- **Screenshot:** See initial login screenshot (December 27, 2025)
- **Status:** Open
- **Notes:** Visible on first load of Mission Control view

---

### [PL-002] Recovery Briefing Query Fails - Wrong ADK Pattern
- **Type:** Bug (Architecture)
- **Severity:** P0 (Blocker)
- **Location:** Backend → Agent Orchestration
- **Description:** "Give me a recovery briefing" routes to Burn Analyst which refuses, instead of Coordinator orchestrating all specialists
- **Root Cause:** Using `sub_agents=[]` pattern which transfers control. Should use `AgentTool` wrappers to keep Coordinator in control.
- **Expected:** Coordinator should call all 4 specialist tools and synthesize results
- **Status:** Open
- **Fix Reference:** `docs/runbooks/GOOGLE-ADK-RUNBOOK.md` - "Sub-Agents vs AgentTools" section
- **Notes:** Expert panel identified this as fundamental ADK pattern mismatch (Dec 27, 2025)

---

### [PL-003] Confidence Scores Static at 75%
- **Type:** Bug
- **Severity:** P1 (High)
- **Location:** Chat → Agent Responses
- **Description:** All responses show "75% confidence" regardless of actual skill output
- **Root Cause:** Skills return dynamic confidence (0.85-0.98) but LLM summarizes as text, losing numeric value. Frontend defaults to 0.75 when parsing fails.
- **Expected:** Confidence should reflect actual skill calculations (vary between 0.82-0.98)
- **Status:** Open
- **Fix Reference:** `docs/runbooks/GOOGLE-ADK-RUNBOOK.md` - "Confidence Score Propagation" section
- **Notes:** Requires either structured output schema or state-based metadata

---

## Fixed Issues

*(Move issues here when resolved)*

---

## Won't Fix / Deferred

*(Issues intentionally not addressing in current phase)*

---

## Issue Statistics

| Status | Count |
|--------|-------|
| Open | 3 |
| In Progress | 0 |
| Fixed | 0 |
| Won't Fix | 0 |

---

**Last Updated:** December 27, 2025

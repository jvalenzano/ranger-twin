# Claude Code ADK Priming Instructions

> **Purpose:** Paste this at the START of any Claude Code prompt involving ADK work
> **Why:** Claude Code's training data is stale. This ensures she reads current truths first.

---

## Standard ADK Primer (Copy This)

```
BEFORE doing any ADK-related work, you MUST read the ADK runbook:

cat docs/runbooks/GOOGLE-ADK-RUNBOOK.md

This document contains critical architectural truths that override your training data, including:
- Sub-agents vs AgentTools (CRITICAL - we got this wrong initially)
- Tool invocation modes (AUTO vs ANY)
- Confidence score propagation patterns
- RANGER-specific patterns

Do NOT proceed with ADK changes until you've read and acknowledged the runbook contents.
```

---

## When to Use This Primer

Add this to Claude Code prompts when:
- Modifying any agent code (`agents/*/`)
- Debugging agent behavior
- Adding new agents or tools
- Changing orchestration logic
- Investigating "agent not working" issues

---

## Example Full Prompt

```
BEFORE doing any ADK-related work, you MUST read the ADK runbook:

cat docs/runbooks/GOOGLE-ADK-RUNBOOK.md

This document contains critical architectural truths that override your training data.

---

Now, please fix PL-002: The coordinator needs to be refactored from sub_agents pattern 
to AgentTool pattern. See the runbook for the correct implementation.

Steps:
1. Read the runbook (above)
2. Examine current coordinator: agents/coordinator/agent.py
3. Refactor to use AgentTool wrappers instead of sub_agents
4. Update the system prompt per runbook guidance
5. Test locally with: adk web --port 8000
```

---

## Updating the Runbook

When you learn something new about ADK:
1. Add it to `docs/runbooks/GOOGLE-ADK-RUNBOOK.md`
2. Include the date and source
3. Add to the "Update Log" section at the bottom

This creates a feedback loop where learnings persist across sessions.

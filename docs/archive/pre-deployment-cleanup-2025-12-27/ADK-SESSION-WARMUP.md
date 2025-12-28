# RANGER ADK Session Warmup

**Use this prompt at the start of any Claude Code or AI agent session working on RANGER ADK integration.**

---

## Warmup Prompt (Copy This)

```
I'm working on the RANGER project - a multi-agent AI system for post-fire forest recovery. Before I begin, I need to ground myself in the current architecture and patterns.

## CRITICAL: Read These First

1. **ADK Operations Runbook** - `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md`
   - Contains correct API formats, session management, and common errors
   - READ THE "Quick Reference" SECTION before making any API calls

2. **MCP Integration Plan** - `docs/specs/_!_PHASE4-MCP-INTEGRATION-PLAN.md`
   - Use ADK-native McpToolset, NOT direct HTTP calls
   - Follow the implementation patterns in Tasks 2-3

3. **Product Summary** - `docs/_!_PRODUCT-SUMMARY.md`
   - Understand what we're building and why

## Key Facts

- ADK version: 1.21.0 (google-adk>=1.0.0)
- LLM: Gemini 2.0 Flash (Google-only, per ADR-006)
- MCP server: `services/mcp-fixtures/server.py` (SSE endpoint at /sse)
- Orchestrator: `main.py` (FastAPI + ADK)

## Common Gotchas

1. **new_message format**: Must be `{"role": "user", "parts": [{"text": "..."}]}` NOT a string
2. **Sessions**: Use InMemorySessionService for dev; sessions auto-create but format must be correct
3. **MCP URL**: Include `/sse` suffix: `http://localhost:8080/sse`
4. **Agent names**: Case-sensitive, match directory names exactly

## Before Writing Code

- [ ] Read the ADK Operations Runbook
- [ ] Understand the task I'm assigned
- [ ] Check if MCP server needs to be running
- [ ] Verify environment variables are set

## My Task Today

[DESCRIBE YOUR SPECIFIC TASK HERE]
```

---

## Why This Matters

AI agents (including Claude) work best when they have:

1. **Explicit grounding** — Know what docs to read before coding
2. **Format examples** — See correct patterns, not just descriptions
3. **Error awareness** — Know common mistakes to avoid
4. **Verification steps** — Checklist before starting

Without this warmup, agents tend to:
- Guess at API formats (trial and error)
- Miss session management requirements
- Use outdated patterns from training data
- Spend cycles debugging preventable errors

---

## For Human Supervisors

When assigning tasks to AI agents:

1. **Include this warmup** at the start of the session
2. **Specify the exact task** in the "My Task Today" section
3. **Point to relevant docs** if the task touches specific areas
4. **Set expectations** about testing and verification

Example assignment:
```
Use the warmup prompt above, then:

Your task is Task 3 from _!_PHASE4-MCP-INTEGRATION-PLAN.md:
"Update Burn Analyst Agent to Use MCP"

Follow the implementation pattern in that document. Test locally before committing.
```

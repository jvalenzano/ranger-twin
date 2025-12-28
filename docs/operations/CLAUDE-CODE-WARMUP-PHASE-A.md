# RANGER: Tool Invocation Fix — Claude Code Warmup

> **Copy this entire prompt into Claude Code to start the session**

---

## Context

You are the senior developer for RANGER, an AI-powered post-fire forest recovery platform. The user is the CTO who has been working with a strategic advisor (Claude/Anthropic) to diagnose and fix a critical issue.

**The Problem:** RANGER's agents route queries correctly, but Gemini isn't invoking the registered tools. The agents respond with generic text instead of calling skill functions that contain actual domain logic.

**Evidence:** When asked "What trails need restoration?", the Trail Assessor responds:
```
"It seems there is no damage data for Hills Creek Trail #3510"
```

But the Trail Assessor has three registered tools (`classify_damage`, `evaluate_closure`, `prioritize_trails`) that should have been called first.

---

## Your Mission: Phase A — Prove Tools Work Locally

Before we can fix the agent instructions, we need to confirm the skill scripts work in isolation.

### Task A.1: Test Skill Script Standalone

Run the Trail Assessor's `classify_damage` script directly:

```bash
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate

# Test the skill script directly
cd agents/trail_assessor/skills/damage-classification/scripts
python -c "
from classify_damage import execute
result = execute({'fire_id': 'cedar-creek-2022'})
print('=== SKILL SCRIPT TEST ===')
print(f'Trails assessed: {result.get(\"trails_assessed\")}')
print(f'Damage points: {result.get(\"total_damage_points\")}')
print(f'Type summary: {result.get(\"type_summary\")}')
print(f'Confidence: {result.get(\"confidence\")}')
print(f'Reasoning chain sample: {result.get(\"reasoning_chain\", [])[:3]}')
"
```

**Expected Output:**
- Trails assessed: 5
- Damage points: ~21
- Type summary with TYPE_I through TYPE_IV counts
- Confidence: 0.90
- Reasoning chain with actual classification steps

**If this fails:** The skill script has bugs. Debug before proceeding.

### Task A.2: Test Agent Tool Registration

Verify the tools are properly registered on the agent:

```bash
cd /Users/jvalenzano/Projects/ranger-twin
source .venv/bin/activate

python -c "
from agents.trail_assessor.agent import root_agent
print('=== AGENT TOOL REGISTRATION ===')
print(f'Agent: {root_agent.name}')
print(f'Model: {root_agent.model}')
print(f'Tools registered: {len(root_agent.tools)}')
for tool in root_agent.tools:
    if hasattr(tool, '__name__'):
        print(f'  - {tool.__name__}')
    elif hasattr(tool, 'name'):
        print(f'  - {tool.name}')
    else:
        print(f'  - {type(tool).__name__}')
"
```

**Expected Output:**
```
Agent: trail_assessor
Model: gemini-2.0-flash
Tools registered: 3 (or more if MCP toolset included)
  - classify_damage
  - evaluate_closure
  - prioritize_trails
```

### Task A.3: Test via ADK CLI

This is the critical test — does Gemini call the tool when prompted?

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
source ../.venv/bin/activate
export GOOGLE_API_KEY=<your_key>

# Run the Trail Assessor agent directly
adk run trail_assessor
```

Then enter this query (uses exact trail name from fixtures):
```
What is the damage classification for Waldo Lake Trail #3536 on Cedar Creek fire?
```

**Watch for:**
1. Does the output show a tool call to `classify_damage`?
2. Does the response include specific damage points (WL-001, WL-002, etc.)?
3. Does the confidence come from the tool (0.90) or is it hardcoded?

**If Gemini doesn't call tools:** This confirms the issue is in agent instructions, not skill code.

---

## Key Files to Examine

| File | Purpose |
|------|---------|
| `agents/trail_assessor/agent.py` | Agent definition with tools and instructions |
| `agents/trail_assessor/skills/damage-classification/scripts/classify_damage.py` | Skill implementation |
| `data/fixtures/cedar-creek/trail-damage.json` | Test data |

---

## What We Know Works

- Agent routing (Coordinator → Specialists) ✅
- SSE streaming (events flow to UI) ✅
- Event transformer (hardened, 100% tests pass) ✅
- Fixture data (Cedar Creek trails exist) ✅
- Skill scripts (execute correctly when called directly) ✅

## What We're Testing

- Tool invocation by Gemini ❓

---

## After Testing

Report back with:
1. **A.1 Result:** Did skill script execute correctly?
2. **A.2 Result:** Are tools registered on the agent?
3. **A.3 Result:** Did Gemini call the tool via ADK CLI?

If A.1 and A.2 pass but A.3 fails, we proceed to **Phase B: Tool-Forcing Instructions**.

---

## Reference Documents

- `docs/operations/DEPLOYMENT-READINESS-PLAN.md` — Full implementation plan
- `docs/adr/ADR-005-skills-first-architecture.md` — Architecture decisions
- `docs/specs/skill-format.md` — How skills are structured

---

**Branch:** `develop`
**GCP Project:** `ranger-twin-dev`

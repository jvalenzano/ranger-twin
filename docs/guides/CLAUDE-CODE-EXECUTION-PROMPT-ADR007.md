# Claude Code Execution Prompt: ADR-007 Three-Tier Tool Invocation

> **Copy this entire prompt into Claude Code**  
> **Recommended:** Use Plan Mode first (Shift+Tab twice) to review the implementation plan

---

## Mission

Implement ADR-007 Three-Tier Tool Invocation Strategy across all RANGER specialist agents.

## Context

RANGER agents have registered tools but Gemini isn't invoking them reliably. We've identified that instruction-level enforcement is probabilistic (~85% reliability). ADR-007 specifies API-level enforcement using `FunctionCallingConfig(mode="ANY")` for 99.5%+ reliability.

## Key Documents to Read First

Before making any changes, read these files to understand the architecture:

1. `docs/adr/ADR-007-tool-invocation-strategy.md` - The architecture decision
2. `docs/operations/trail_assessor_three_tier_reference.py` - Reference implementation template
3. `docs/operations/DEPLOYMENT-READINESS-PLAN.md` - Current execution plan

## Git Management Requirements

**CRITICAL: Follow proper Git workflow throughout this task.**

### Before Starting
```bash
# Ensure you're on a feature branch
git checkout -b feature/adr-007-tool-invocation

# Or if branch exists
git checkout feature/adr-007-tool-invocation
git pull origin develop
```

### During Implementation
```bash
# Commit after EACH successful agent update
git add agents/trail_assessor/agent.py
git commit -m "feat(trail-assessor): implement three-tier tool invocation (ADR-007)"

# Create checkpoint commits before risky changes
git commit -m "checkpoint: before updating burn_analyst"
```

### Commit Message Format
```
feat(agent-name): brief description

- Tier 1: Added FunctionCallingConfig with mode="ANY"
- Tier 2: Updated instructions to ReAct pattern
- Tier 3: Added audit callbacks
```

## Implementation Tasks

### Task 1: Update Trail Assessor Agent

**File:** `agents/trail_assessor/agent.py`

Apply the three-tier pattern from the reference implementation:

```python
from google.adk.agents import Agent
from google.genai import types

# Tier 1: API-Level Enforcement
TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="ANY",
        allowed_function_names=[
            "classify_damage",
            "evaluate_closure",
            "prioritize_trails",
        ]
    )
)

GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    tool_config=TOOL_CONFIG,
    temperature=0.1,
)

# Tier 2: Structured Reasoning Instructions (ReAct pattern)
INSTRUCTION = """
You are the RANGER Trail Assessor...

For domain questions, follow this reasoning process:
THINK: Identify what data you need
CALL: Execute the appropriate tool (system enforces this)
REASON: Interpret the response
RESPOND: Ground your answer in tool data
...
"""

# Tier 3: Audit Callbacks
def before_tool_audit(tool, args, tool_context):
    # Log invocation for compliance
    return None

def after_tool_audit(tool, args, tool_context, response):
    # Log response with confidence/sources
    return None

def on_tool_error_audit(tool, args, tool_context, error):
    # Graceful error handling
    return {"status": "error", "message": str(error)}

# Agent Definition
root_agent = Agent(
    name="trail_assessor",
    model="gemini-2.0-flash",
    instruction=INSTRUCTION,
    tools=[classify_damage, evaluate_closure, prioritize_trails],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_tool_audit,
    after_tool_callback=after_tool_audit,
    on_tool_error_callback=on_tool_error_audit,
)
```

**After completing, commit:**
```bash
git add agents/trail_assessor/agent.py
git commit -m "feat(trail-assessor): implement three-tier tool invocation (ADR-007)"
```

### Task 2: Update Burn Analyst Agent

**File:** `agents/burn_analyst/agent.py`

Same pattern with these tools:
- `assess_severity`
- `classify_mtbs`
- `validate_boundary`

**After completing, commit:**
```bash
git add agents/burn_analyst/agent.py
git commit -m "feat(burn-analyst): implement three-tier tool invocation (ADR-007)"
```

### Task 3: Update Cruising Assistant Agent

**File:** `agents/cruising_assistant/agent.py`

Same pattern with these tools:
- `estimate_volume`
- `assess_salvage`
- `recommend_methodology`
- `analyze_csv`

**After completing, commit:**
```bash
git add agents/cruising_assistant/agent.py
git commit -m "feat(cruising-assistant): implement three-tier tool invocation (ADR-007)"
```

### Task 4: Update NEPA Advisor Agent

**File:** `agents/nepa_advisor/agent.py`

Same pattern with these tools:
- `decide_pathway`
- `estimate_timeline`
- `generate_checklist`
- `search_regulatory_documents`

**After completing, commit:**
```bash
git add agents/nepa_advisor/agent.py
git commit -m "feat(nepa-advisor): implement three-tier tool invocation (ADR-007)"
```

### Task 5: Update Coordinator Agent

**File:** `agents/coordinator/agent.py`

**DIFFERENT PATTERN:** Coordinator uses `mode="AUTO"` for routing flexibility.

```python
TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="AUTO",  # Coordinator needs flexibility to route OR respond
    )
)
```

**After completing, commit:**
```bash
git add agents/coordinator/agent.py
git commit -m "feat(coordinator): configure mode=AUTO for routing flexibility (ADR-007)"
```

### Task 6: Verification Test

After all agents are updated:

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
source ../.venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY coordinator/.env | cut -d'=' -f2)

# Test Trail Assessor
adk run trail_assessor
# Query: "What is the damage classification for Cedar Creek fire?"
# Expected: Tool call visible, specific damage data returned
```

**Success Criteria:**
- [ ] Tool invocation appears in output (not generic text response)
- [ ] Response includes specific damage points (WL-001, BL-001)
- [ ] Confidence score from tool (90%), not hardcoded (75%)

### Task 7: Final Commit and Push

```bash
# Final commit for any remaining changes
git add .
git commit -m "docs: update deployment plan with ADR-007 completion status"

# Push feature branch
git push -u origin feature/adr-007-tool-invocation

# Create PR (manual step)
echo "Create PR: feature/adr-007-tool-invocation -> develop"
```

## Important Notes

1. **Use Plan Mode First:** Press Shift+Tab twice to review the plan before execution
2. **Commit After Each Agent:** Don't batch all changes - commit incrementally for safety
3. **Test Before Moving On:** Ideally test each agent after updating
4. **Check Tool Names:** Verify the actual function names in each agent file match what you whitelist
5. **Preserve Existing Logic:** Don't remove existing tool function definitions - only update the Agent instantiation

## Validation Checklist

After implementation, verify:

- [ ] Trail Assessor has `mode="ANY"` with 3 tools whitelisted
- [ ] Burn Analyst has `mode="ANY"` with 3 tools whitelisted
- [ ] Cruising Assistant has `mode="ANY"` with 4 tools whitelisted
- [ ] NEPA Advisor has `mode="ANY"` with 4 tools whitelisted
- [ ] Coordinator has `mode="AUTO"` (no whitelist needed)
- [ ] All agents have audit callbacks (before, after, error)
- [ ] All agents have ReAct-pattern instructions
- [ ] Git history shows incremental commits per agent
- [ ] At least one agent tested via ADK CLI

## If Something Goes Wrong

```bash
# Revert last commit (keep changes staged)
git reset --soft HEAD~1

# Revert last commit (discard changes)
git reset --hard HEAD~1

# Revert specific file to last commit
git checkout HEAD -- agents/trail_assessor/agent.py

# Stash current changes temporarily
git stash
# Later: git stash pop
```

---

**Execute this plan systematically. Good luck!**

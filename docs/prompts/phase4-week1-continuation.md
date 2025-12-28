# RANGER Phase 4 Continuation - Multi-Agent Wiring

> **Mode: Autonomous Execution**
> Execute without waiting for human intervention. Commit at key milestones.
> Use CLI tools and programmatic tests. Keep moving.

---

## Current State (December 26, 2025)

Phase 4 Week 1 is partially complete. The foundation is built:

### Completed Components

| Component | Location | Status |
|-----------|----------|--------|
| MCP Fixtures Server | `services/mcp-fixtures/server.py` | ✅ Tested, 4 tools working |
| ADK Orchestrator | `main.py` | ✅ FastAPI + ADK, ready for deployment |
| SSE Client | `apps/command-console/src/lib/adkClient.ts` | ✅ Parser implemented |
| Event Transformer | `apps/command-console/src/services/adkEventTransformer.ts` | ✅ ADK → AgentBriefingEvent |
| useADKStream Hook | `apps/command-console/src/hooks/useADKStream.ts` | ✅ React integration |
| Validation Spike | `agents/validation_spike/` | ✅ 2 sub_agents wired (burn_analyst, trail_assessor) |

### What's Next

**Primary Task: Wire coordinator with ALL 5 sub_agents**

Currently `agents/validation_spike/agent.py` only has 2 sub_agents. Need to:
1. Update to include all 5: burn_analyst, trail_assessor, cruising_assistant, nepa_advisor + coordinator itself as root
2. Create proper coordinator agent with sub_agents (not validation spike)
3. Test multi-agent delegation programmatically
4. Commit after verification

---

## Autonomous Execution Instructions

### Step 1: Wire All Sub-Agents

Create/update `agents/coordinator/agent.py` to include sub_agents:

```python
# Pattern to implement:
from google.adk.agents import Agent
from burn_analyst.agent import root_agent as burn_analyst
from trail_assessor.agent import root_agent as trail_assessor
from cruising_assistant.agent import root_agent as cruising_assistant
from nepa_advisor.agent import root_agent as nepa_advisor

root_agent = Agent(
    name="recovery_coordinator",
    model="gemini-2.0-flash",
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor],
    # ... rest of config
)
```

### Step 2: Verify Programmatically

```bash
# Test agent loading
source .venv/bin/activate
cd agents && python -c "
from coordinator.agent import root_agent
print(f'Coordinator: {root_agent.name}')
print(f'Sub-agents: {[a.name for a in root_agent.sub_agents]}')
print(f'Expected: burn_analyst, trail_assessor, cruising_assistant, nepa_advisor')
assert len(root_agent.sub_agents) == 4, 'Missing sub-agents!'
print('✅ All 4 sub-agents wired correctly')
"
```

### Step 3: Test with ADK CLI (if GOOGLE_API_KEY set)

```bash
# Check if API key is available
if [ -n "$GOOGLE_API_KEY" ]; then
    cd agents && adk run coordinator --message "List your available specialists"
else
    echo "GOOGLE_API_KEY not set - skipping live test"
fi
```

### Step 4: Commit Milestone

```bash
git add agents/coordinator/agent.py
git commit -m "feat: Wire coordinator with all 4 specialist sub_agents

- burn_analyst: MTBS classification, soil burn severity
- trail_assessor: Damage classification, closure decisions
- cruising_assistant: Timber volume, salvage assessment
- nepa_advisor: CE/EA/EIS pathway decisions

Phase 4 multi-agent orchestration complete.

🤖 Generated with Claude Code"
```

### Step 5: Continue to React Integration

After committing, proceed to:
1. Update Command Console to use `useADKStream` hook
2. Wire chat input to ADK orchestrator
3. Display streaming AgentBriefingEvents in UI
4. Test end-to-end flow

---

## Key Files to Read

| File | Purpose |
|------|---------|
| `agents/coordinator/agent.py` | Current coordinator (needs sub_agents) |
| `agents/burn_analyst/agent.py` | Example sub-agent pattern |
| `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` | Full spec |
| `CLAUDE.md` | Project context and conventions |

## Key Constraints

1. **ADK Naming**: Agent directories use underscores (`burn_analyst` not `burn-analyst`)
2. **JSON Parameters**: Tool functions use `str` for complex types, not `list[dict]`
3. **Imports**: Each agent exports `root_agent` per ADK convention
4. **No Waiting**: Execute programmatically, don't wait for user input

---

## Commit Strategy

Commit after each milestone:
1. ✅ Sub-agents wired → commit
2. React integration → commit
3. End-to-end test passing → commit
4. Documentation updated → commit

---

## Environment

```bash
# Activate environment
source .venv/bin/activate

# Check ADK version
adk --version  # Should be 1.21.0+

# Project root
cd /Users/jvalenzano/Projects/ranger-twin

# Branch
git branch  # Should be 'develop'
```

---

## Success Criteria

Phase 4 Week 1 is complete when:
- [ ] Coordinator has 4 sub_agents wired
- [ ] Programmatic test passes
- [ ] Changes committed to develop branch
- [ ] React integration started (bonus)

**Execute now. Don't stop.**

---

*Generated: December 26, 2025*
*Context: Phase 4 ADK Integration, Week 1*
*Mode: Autonomous*

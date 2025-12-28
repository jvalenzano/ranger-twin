# AgentTool Refactor - Critical Architectural Fix
Date: 2025-12-27
Status: ✅ **COMPLETED** - Refactor successful, pending deployment test

---

## Executive Summary

**Problem Identified:** Expert panel review revealed we were using the **WRONG** ADK multi-agent pattern.

**Root Cause:** Using `sub_agents=[]` transfers control to specialists, causing:
1. Coordinator loses control of conversation flow
2. Burn Analyst receives "recovery briefing" query directly and refuses (out of scope)
3. No orchestration happening - specialists "own" the conversation instead of coordinator

**Solution Implemented:** Converted from `sub_agents` to `AgentTool` wrappers.

**Pattern Change:**
```python
# ❌ BEFORE (Wrong - transfers control)
root_agent = Agent(
    sub_agents=[burn_analyst, trail_assessor, ...]
)

# ✅ AFTER (Correct - coordinator retains control)
burn_analyst_tool = AgentTool(agent=burn_analyst)
root_agent = Agent(
    tools=[burn_analyst_tool, trail_assessor_tool, ...]
)
```

---

## Changes Made

### File Modified: `agents/coordinator/agent.py`

#### 1. Import AgentTool ✅
```python
from google.adk.agents import Agent
from google.adk.tools import AgentTool  # ← Added
```

#### 2. Wrap Specialists as Tools ✅
```python
# Import specialists
from burn_analyst.agent import root_agent as burn_analyst
from trail_assessor.agent import root_agent as trail_assessor
from cruising_assistant.agent import root_agent as cruising_assistant
from nepa_advisor.agent import root_agent as nepa_advisor

# Wrap as AgentTools (coordinator retains control)
burn_analyst_tool = AgentTool(agent=burn_analyst)
trail_assessor_tool = AgentTool(agent=trail_assessor)
cruising_assistant_tool = AgentTool(agent=cruising_assistant)
nepa_advisor_tool = AgentTool(agent=nepa_advisor)
```

#### 3. Updated System Prompt ✅
**New prompt explicitly describes WHEN to use each specialist tool:**

```
## Query Handling Protocol

### Single-Domain Queries
- **burn_analyst**: Call for burn severity, fire impact, MTBS classification
- **trail_assessor**: Call for trail damage, infrastructure, closures
- **cruising_assistant**: Call for timber salvage, volume estimates
- **nepa_advisor**: Call for NEPA compliance, CE/EA/EIS pathways

### Multi-Domain Queries
For "recovery briefing" or "status update":
1. Call ALL FOUR specialist tools sequentially
2. Synthesize outputs into coherent briefing
3. Highlight cross-domain dependencies

## Critical Rules
1. NEVER answer domain questions from general knowledge - ALWAYS call specialist tool
2. For recovery briefings, call ALL FOUR specialists
3. Preserve exact confidence values (e.g., "Confidence: 0.92")
```

#### 4. Replaced sub_agents with tools ✅
```python
root_agent = Agent(
    name="coordinator",
    model="gemini-2.0-flash",
    instruction=UPDATED_PROMPT,
    tools=[
        burn_analyst_tool,      # ← Specialist as tool
        trail_assessor_tool,    # ← Specialist as tool
        cruising_assistant_tool,# ← Specialist as tool
        nepa_advisor_tool,      # ← Specialist as tool
        portfolio_triage,       # ← Portfolio management skill
    ],
    # NO sub_agents parameter
)
```

#### 5. Removed delegate_query() Function ✅
- Delegation routing skill is no longer needed
- Coordinator now calls specialist tools directly
- Gemini decides which tool to use based on query content

---

## Verification

### Local Initialization Test ✅
```bash
$ cd agents/coordinator && python agent.py
Coordinator Agent 'coordinator' initialized.
Model: gemini-2.0-flash
Description: Root orchestrator for RANGER post-fire recovery platform.
Tools: ['AgentTool', 'AgentTool', 'AgentTool', 'AgentTool', 'portfolio_triage']
```

**Result:** Agent initializes successfully with 4 AgentTools + 1 portfolio function.

---

## Expected Behavior After Deployment

### Test Case 1: Single-Domain Query
**Input:** "What is the soil burn severity at Cedar Creek?"

**Expected Flow:**
1. Coordinator receives query
2. Gemini recognizes burn severity domain
3. Coordinator calls `burn_analyst` tool
4. Burn Analyst calls `assess_severity(fire_id="cedar-creek-2022")`
5. Coordinator receives result with `confidence: 0.92`
6. Coordinator synthesizes response preserving confidence

**Success Indicators:**
- ✅ Burn Analyst tool is called
- ✅ Response includes "Confidence: 0.92" (not "75%")
- ✅ Coordinator stays in control (doesn't transfer to Burn Analyst)

---

### Test Case 2: Multi-Domain "Recovery Briefing"
**Input:** "Give me a recovery briefing for Cedar Creek"

**Expected Flow:**
1. Coordinator receives query
2. Recognizes multi-domain synthesis needed
3. Calls ALL FOUR specialists sequentially:
   - `burn_analyst(fire_id="cedar-creek-2022")`
   - `trail_assessor(fire_id="cedar-creek-2022")`
   - `cruising_assistant(fire_id="cedar-creek-2022")`
   - `nepa_advisor(fire_id="cedar-creek-2022")`
4. Coordinator synthesizes all outputs
5. Returns integrated briefing with:
   - Critical findings from all domains
   - Cross-domain dependencies
   - Specific numbers and confidence scores
   - Recommended actions

**Success Indicators:**
- ✅ All 4 specialists are called
- ✅ Response shows synthesis (not just repeated outputs)
- ✅ Confidence scores vary by domain (92%, 88%, 85%, 78%)
- ✅ No "I cannot help with that" refusals

---

### Test Case 3: Portfolio Query
**Input:** "Which fires need BAER assessments?"

**Expected Flow:**
1. Coordinator receives query
2. Recognizes portfolio management domain
3. Calls `portfolio_triage(fires_json="[...]")`
4. Returns ranked fire list with triage scores

**Success Indicators:**
- ✅ portfolio_triage tool is called
- ✅ Fires ranked by severity × acres × phase
- ✅ Confidence: 0.92 (portfolio triage confidence)

---

## Deployment Instructions

### Step 1: Commit Changes
```bash
git add agents/coordinator/agent.py
git commit -m "fix(coordinator): convert sub_agents to AgentTool pattern

- Replace sub_agents with AgentTool wrappers for all specialists
- Update system prompt with explicit tool usage guidance
- Remove delegate_query skill (no longer needed)
- Coordinator now retains control and calls specialists as functions

Fixes #[issue-number] - Multi-agent delegation not working"
```

### Step 2: Deploy to Cloud Run
```bash
# From project root
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1 \
  --update-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=ranger-twin-dev,GOOGLE_CLOUD_LOCATION=us-central1
```

### Step 3: Verify Deployment
```bash
# Check health
curl https://ranger-coordinator-1058891520442.us-central1.run.app/health

# Expected response:
{
  "status": "healthy",
  "service": "ranger-orchestrator",
  "adk_version": "1.21.0",
  "agents_dir": "/workspace/agents",
  "session_backend": "firestore"
}
```

### Step 4: Frontend Integration Test
```bash
# Test via frontend (manual in browser)
1. Open https://ranger-console-1058891520442.us-central1.run.app
2. Send query: "Give me a recovery briefing for Cedar Creek"
3. Observe response for:
   - Multiple specialist outputs
   - Varying confidence scores (not all 75%)
   - Synthesized actionable briefing
```

---

## Impact Analysis

### Before (sub_agents Pattern)
| Issue | Cause | User Impact |
|-------|-------|-------------|
| Burn Analyst refuses queries | Receives queries directly, sees them as out-of-scope | "I cannot help with that" errors |
| No orchestration | Control transferred to specialists | Single-domain responses only |
| Static confidence | Frontend defaults to 75% | Loss of transparency |

### After (AgentTool Pattern)
| Improvement | Mechanism | User Benefit |
|-------------|-----------|--------------|
| Specialists always respond | Coordinator calls them as functions | No refusals, always get answer |
| True orchestration | Coordinator retains control, synthesizes | Multi-domain recovery briefings work |
| Dynamic confidence | Tool results preserve skill confidence | See real confidence (85-98%) |

---

## Key Learnings

### 1. sub_agents vs AgentTools
**When to use sub_agents:**
- When you WANT to transfer control to a specialist
- Sequential workflows where each agent owns a step
- Example: Customer service routing (sales → support → billing)

**When to use AgentTools:**
- When coordinator should ORCHESTRATE specialists
- Need to call multiple specialists and synthesize
- Coordinator remains the "owner" of conversation
- Example: RANGER recovery briefings (burn + trail + timber + NEPA)

### 2. Why This Matters for RANGER
RANGER needs multi-domain synthesis. A "recovery briefing" requires:
- Fire severity analysis (Burn Analyst)
- Infrastructure damage (Trail Assessor)
- Timber salvage viability (Cruising Assistant)
- Regulatory pathways (NEPA Advisor)

With `sub_agents`, the Burn Analyst would "own" the conversation and couldn't call other specialists.
With `AgentTool`, the Coordinator calls all 4 and synthesizes their outputs.

### 3. Confidence Preservation
Skills already return confidence (0.85-0.98).
With AgentTools, tool results flow back to Coordinator.
Updated system prompt instructs: "Preserve exact confidence values"
This ensures confidence reaches the user.

---

## Documentation Updates Needed

- [ ] Update ADR-005 (Skills-First Architecture) with AgentTool pattern
- [ ] Add ADR-008: "Sub-Agents vs AgentTools Decision"
- [ ] Update `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` with new flow
- [ ] Update `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` with AgentTool pattern
- [ ] Add test case to `agents/coordinator/tests/` for multi-specialist synthesis

---

## Next Steps

1. **Test Locally with API Key** (if available):
   ```bash
   export GOOGLE_API_KEY="your-key-here"
   cd agents && echo "Give me a recovery briefing for Cedar Creek" | adk run coordinator
   ```

2. **Deploy to Cloud Run** (see Step 2 above)

3. **Frontend Integration Test** (see Step 4 above)

4. **Monitor Logs** for specialist tool invocations:
   ```bash
   gcloud run services logs read ranger-coordinator \
     --project ranger-twin-dev \
     --region us-central1 \
     --limit 50 | grep "burn_analyst\|trail_assessor\|cruising_assistant\|nepa_advisor"
   ```

5. **Update Previous Audit Report** (docs/reports/AGENT-ARCHITECTURE-AUDIT-2025-12-27.md)
   - Mark "Root Cause #1" as CORRECTED
   - Note that delegation instruction approach was wrong
   - Real issue was architectural pattern, not system prompt

---

## Questions for Expert Panel

1. **Confidence Extraction:** With AgentTool, do tool results automatically propagate confidence to the LLM context, or do we need additional configuration?

2. **Synthesis Pattern:** Is there a best practice for multi-tool synthesis responses? Should coordinator explicitly format outputs or let LLM synthesize naturally?

3. **Tool Calling Mode:** Should we use `mode="AUTO"` (LLM decides) or `mode="ANY"` (must call a tool) for coordinator?

4. **Session State:** How should coordinator maintain context across multi-tool calls in the same turn?

---

**Status:** ✅ Code refactored, initialization verified, ready for deployment testing

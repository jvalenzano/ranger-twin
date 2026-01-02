# RANGER CTO Session: Tool Invocation Fix — Phase B Execution

**Date:** December 27, 2025  
**Previous Session:** Documentation cleanup + root cause diagnosis  
**Branch:** `develop`  
**GCP Project:** `ranger-twin-dev`

---

## Session Context

You are the CTO advisor for RANGER, an AI-powered post-fire forest recovery platform for the USDA Forest Service. The user (Jason) is implementing a multi-agent system using Google ADK with Gemini 2.0 Flash.

### What Was Accomplished Last Session

1. **Documentation Cleanup**
   - Archived 8 stale warmup/handoff documents to `docs/archive/pre-deployment-cleanup-2025-12-27/`
   - Created new canonical document: `docs/operations/DEPLOYMENT-READINESS-PLAN.md`
   - Created cleanup summary: `docs/operations/CLEANUP-SUMMARY.md`

2. **Root Cause Diagnosis**
   - Claude Code executed Phase A tests
   - **A.1 PASSED:** Skill scripts work in isolation (5 trails, 15 damage points, 0.90 confidence)
   - **A.2 PASSED:** Tools are registered correctly on agents (4 tools including MCP)
   - **A.3 BLOCKED:** Needed API key, but pattern was clear

3. **Root Cause Identified**
   - Agent instructions use **suggestive language** ("Use this tool when...")
   - Gemini interprets this as optional and responds from general knowledge
   - Fix: **Mandatory tool invocation instructions** ("YOU MUST CALL A TOOL BEFORE RESPONDING")

4. **Reference Implementation Created**
   - Complete updated Trail Assessor agent: `docs/operations/trail_assessor_agent_reference.py`
   - Includes: mandatory tool usage section, decision tree, fire ID normalization, response format

---

## Current State

| Component | Status |
|-----------|--------|
| Agent routing | ✅ Works (Coordinator → Specialists) |
| SSE streaming | ✅ Works (events flow to UI) |
| Skill scripts | ✅ Work in isolation |
| Tool registration | ✅ Verified on all agents |
| **Tool invocation** | ❌ **Gemini not calling tools** |
| MCP connectivity | ⚠️ Server exists but not connected |

---

## What Needs to Happen Next

### Phase B: Implement Tool-Forcing Instructions

Claude Code should apply the reference pattern from `docs/operations/trail_assessor_agent_reference.py` to all 4 specialist agents:

1. `agents/trail_assessor/agent.py` — Replace with reference implementation
2. `agents/burn_analyst/agent.py` — Same pattern, different tools
3. `agents/cruising_assistant/agent.py` — Same pattern, different tools  
4. `agents/nepa_advisor/agent.py` — Same pattern, different tools

**Key elements in the pattern:**
- "⚠️ MANDATORY TOOL USAGE - CRITICAL" section
- Decision tree with `→` arrows mapping questions to tools
- Fire ID normalization table (Cedar Creek variants → `cedar-creek-2022`)
- "ONLY AFTER calling the tool" clause for empty results
- REQUIRED STRUCTURE response format with Confidence & Source
- Concrete example showing actual tool output formatting

### API Key Setup

The API key exists in agent directories but not exported to shell:
```bash
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)
```

### Testing After Implementation

```bash
cd /Users/jvalenzano/Projects/ranger-twin/agents
source ../.venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY coordinator/.env | cut -d'=' -f2)
adk run trail_assessor
```

Query: "What is the damage classification for Cedar Creek fire?"

**Success criteria:**
- Tool call visible in ADK output (`classify_damage` invoked)
- Response includes specific damage points (WL-001, BL-001, etc.)
- Response includes confidence from tool (90%), not hardcoded (75%)
- Response includes data source citation

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/operations/DEPLOYMENT-READINESS-PLAN.md` | Master plan (Phases A-E) |
| `docs/operations/trail_assessor_agent_reference.py` | Reference implementation |
| `agents/trail_assessor/agent.py` | First agent to update |
| `agents/burn_analyst/agent.py` | Second agent to update |
| `agents/cruising_assistant/agent.py` | Third agent to update |
| `agents/nepa_advisor/agent.py` | Fourth agent to update |
| `data/fixtures/cedar-creek/trail-damage.json` | Test data |

---

## Architecture Reminder

```
User Query
    ↓
Coordinator (routes correctly) ✅
    ↓
Trail Assessor (receives query) ✅
    ↓
Gemini: "I'll just respond with generic text" ← CURRENT PROBLEM
    ↓
User: Generic response, no real data

AFTER FIX:
    ↓
Gemini: "I MUST call classify_damage first" ← FIXED
    ↓
Tool executes → Returns damage classification
    ↓
Gemini: Synthesizes tool output into response
    ↓
User: Specific damage points, confidence, citations
```

---

## Session Goals

1. **Complete Phase B** — Update all 4 specialist agents with tool-forcing instructions
2. **Validate** — Test Trail Assessor via ADK CLI to confirm tool invocation
3. **If successful** — Proceed to Phase C (MCP connectivity) or Phase D (Cloud Run deployment)

---

## Prompt for Claude Code

If working with Claude Code, provide this task:

```
Apply the tool-forcing instruction pattern from docs/operations/trail_assessor_agent_reference.py to all 4 specialist agents.

Start with trail_assessor/agent.py (replace entirely with reference).
Then adapt the pattern for burn_analyst, cruising_assistant, and nepa_advisor.

Key elements:
1. "⚠️ MANDATORY TOOL USAGE" section at top of instructions
2. Decision tree mapping question types → specific tools
3. Fire ID normalization (Cedar Creek → cedar-creek-2022)
4. "ONLY AFTER calling tool" clause for empty results
5. REQUIRED response structure with Confidence & Source

After updating all 4, test:
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY agents/coordinator/.env | cut -d'=' -f2)
cd agents && adk run trail_assessor
Query: "What is the damage classification for Cedar Creek fire?"

Success = Tool call visible, specific damage points in response.
```

---

## Reference: The Problem We're Solving

From the chat export that revealed the issue:

```json
{
  "role": "assistant",
  "content": "It seems there is no damage data for Hills Creek Trail #3510",
  "agentRole": "trail-assessor",
  "confidence": 75
}
```

This response shows:
- No tool was called (would have returned actual data)
- Confidence is hardcoded (75%), not from tool execution
- Generic "no data" response instead of tool-driven intelligence

After the fix, the same query should trigger `classify_damage` tool and return actual damage classifications from the Cedar Creek fixtures.

---

*Generated: December 27, 2025*
*For: Next CTO advisory session*

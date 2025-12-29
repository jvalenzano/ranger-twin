# Google ADK Runbook (Living Document)

> **Purpose:** Current architectural truths for Google Agent Development Kit
> **Why This Exists:** ADK evolves faster than LLM training data. This document is the source of truth.
> **Last Validated:** December 27, 2025
> **ADK Version:** Latest (google-adk via pip)

---

## ⚠️ CRITICAL: Read This First

**Before making ANY ADK architectural decisions, Claude Code MUST read this document.**

This runbook contains hard-won lessons that contradict common assumptions and outdated training data.

---

## 🚨 Critical Pattern: Sub-Agents vs AgentTools

### The Most Important Distinction in ADK

| Pattern | Use Case | Control Flow |
|---------|----------|--------------|
| `sub_agents=[]` | Multi-turn stateful conversations | **Transfers control** - sub-agent owns the conversation |
| `AgentTool(agent=x)` | Discrete callable tasks | **Retains control** - parent orchestrates |

### WRONG (What We Did Initially)
```python
# ❌ WRONG: Sub-agents TRANSFER control to specialists
# The coordinator loses the conversation when a sub-agent is invoked
root_agent = Agent(
    name="coordinator",
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor],
)
```

**What happens:** When the coordinator routes to `burn_analyst`, the burn analyst "owns" the conversation. The coordinator is "out of the loop." If the user asks a multi-domain question, only one specialist handles it.

### CORRECT (AgentTools Pattern)
```python
# ✅ CORRECT: AgentTools keep coordinator in control
from google.adk.agents import Agent, AgentTool

# Wrap specialists as tools
burn_analyst_tool = AgentTool(agent=burn_analyst)
trail_assessor_tool = AgentTool(agent=trail_assessor)
cruising_assistant_tool = AgentTool(agent=cruising_assistant)
nepa_advisor_tool = AgentTool(agent=nepa_advisor)

root_agent = Agent(
    name="coordinator",
    tools=[burn_analyst_tool, trail_assessor_tool, cruising_assistant_tool, nepa_advisor_tool],
    # NO sub_agents parameter
)
```

**What happens:** Coordinator calls specialists as functions, gets their results, and can call multiple specialists for complex queries. Coordinator synthesizes all outputs.

### When to Use Each

| Scenario | Pattern |
|----------|---------|
| Orchestrator calling multiple specialists | **AgentTool** ✅ |
| Complex query requiring synthesis | **AgentTool** ✅ |
| Stateless domain-specific analysis | **AgentTool** ✅ |
| Multi-turn conversation with memory | `sub_agents` (rare) |
| Handing off entirely to another agent | `sub_agents` (rare) |

### Source
- https://cloud.google.com/blog/topics/developers-practitioners/where-to-use-sub-agents-versus-agents-as-tools
- https://google.github.io/adk-docs/agents/multi-agents/

---

## 🚨 Tool Invocation Modes

### The Three Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `AUTO` (default) | LLM decides whether to call tools | Most scenarios ✅ |
| `ANY` | Forces tool call every turn | **DANGER: Can cause infinite loops** |
| `NONE` | Disables tool calling | Text-only responses |

### RANGER Decision (ADR-007.1)
We use `AUTO` mode. We experienced infinite loops with `ANY` mode.

### If You Need Guaranteed Tool Use
Don't use `MODE.ANY`. Instead, use `tool_choice="required"` in ModelSettings:

```python
from google.adk.models.model_settings import ModelSettings

root_agent = Agent(
    name="coordinator",
    model_settings=ModelSettings(tool_choice="required"),
)
```

This forces tool use without the infinite loop risk.

---

## 🚨 Confidence Score Propagation

### The Problem
Skills return `{"confidence": 0.92}` but the LLM summarizes this as "high confidence" and the numeric value is lost.

### Solution 1: Structured Output (Recommended)
```python
from pydantic import BaseModel, Field

class AnalysisResult(BaseModel):
    summary: str
    confidence: float = Field(ge=0.0, le=1.0)
    citations: list[str] = []

agent = Agent(
    name="burn_analyst",
    output_schema=AnalysisResult,  # Forces structured output
    output_key="analysis_result",
)
```

### Solution 2: State-Based Metadata
Store confidence in agent state, which flows through SSE events:

```python
def analyze_burn_severity(fire_id: str, tool_context) -> dict:
    result = perform_analysis(fire_id)
    
    # Store in state (appears in SSE state_update events)
    tool_context.state["last_confidence"] = result["confidence"]
    
    return result
```

Frontend listens for `state_update` events in addition to text.

### Solution 3: Prompt Engineering (Least Reliable)
```
CRITICAL: When tool results include 'confidence', you MUST include 
the exact numeric value in your response. Format: "Confidence: 0.92"
```

This works ~70% of the time. Not recommended for production.

---

## 🚨 SSE Streaming Patterns

### Endpoint
ADK exposes `/run_sse` for Server-Sent Events streaming.

### Event Types to Handle
```typescript
// Frontend should handle these event types:
- "content": Text chunks from the LLM
- "tool_call": Agent is invoking a tool
- "tool_result": Tool returned a result  
- "state_update": Agent state changed (use for metadata)
- "end": Stream complete
```

### Session Management
- Sessions are required for `/run_sse`
- Session ID must be consistent across requests
- New sessions are created automatically if ID doesn't exist
- Sessions are in-memory by default (lost on restart)

---

## 🚨 RANGER-Specific Patterns

### The 5-Agent Architecture
```
Recovery Coordinator (orchestrator)
├── burn_analyst_tool      → Fire severity, MTBS, dNBR
├── trail_assessor_tool    → Infrastructure damage, TRACS
├── cruising_assistant_tool → Timber salvage, FSVeg
└── nepa_advisor_tool      → Regulatory compliance, CE/EA
```

All specialists are **AgentTools**, not sub-agents.

### Query Routing
The coordinator's system prompt must explicitly describe when to use each tool:

```
For burn analysis queries → use burn_analyst_tool
For trail damage queries → use trail_assessor_tool
For timber/salvage queries → use cruising_assistant_tool
For regulatory/NEPA queries → use nepa_advisor_tool
For "recovery briefing" → call ALL FOUR tools, then synthesize
```

### Parallel Execution (Future)
For "recovery briefing" queries, consider `ParallelAgent`:

```python
from google.adk.agents import ParallelAgent

parallel_specialists = ParallelAgent(
    name="parallel_analysis",
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor]
)
```

This runs all specialists concurrently for faster briefings.

---

## Common Gotchas

### 1. Import Paths Change
ADK import paths have changed between versions. Current correct imports:
```python
from google.adk.agents import Agent, AgentTool, ParallelAgent
from google.adk.models.model_settings import ModelSettings
```

### 2. State Isolation with AgentTools
When using AgentTool wrappers, each specialist runs in an **isolated session**. They don't share conversation history. Pass context explicitly:

```python
# In coordinator's system prompt:
"When calling burn_analyst_tool, include the fire_id and any relevant context from previous tool calls."
```

### 3. Model String Format
```python
# Correct
model="gemini-2.0-flash"

# Also valid (with version)
model="gemini-2.0-flash-001"
```

### 4. Tool Descriptions Matter
AgentTool inherits the wrapped agent's `description` field. Make these clear:

```python
burn_analyst = Agent(
    name="burn_analyst",
    description="Analyzes wildfire burn severity using MTBS satellite data. Call for fire impact questions.",
)
```

---

## Debugging Checklist

When agent behavior is wrong:

1. **Check pattern:** Are you using `sub_agents` when you should use `AgentTool`?
2. **Check mode:** Is `MODE.ANY` causing loops?
3. **Check prompt:** Does the system prompt tell the LLM WHEN to use each tool?
4. **Check logs:** Cloud Run logs show tool invocations
5. **Check session:** Is session ID consistent? Is session expiring?

---

## Reference Links

### Official Documentation
- [ADK Docs Home](https://google.github.io/adk-docs/)
- [Multi-Agent Systems](https://google.github.io/adk-docs/agents/multi-agents/)
- [Streaming Guide](https://google.github.io/adk-docs/streaming/dev-guide/part1/)
- [Agent Team Tutorial](https://google.github.io/adk-docs/tutorials/agent-team/)

### Key Blog Posts
- [Sub-Agents vs Tools](https://cloud.google.com/blog/topics/developers-practitioners/where-to-use-sub-agents-versus-agents-as-tools)
- [Building Multi-Agent Systems](https://cloud.google.com/blog/products/ai-machine-learning/build-multi-agentic-systems-using-google-adk)

### GitHub
- [google/adk-python](https://github.com/google/adk-python) - Core framework
- [google/adk-samples](https://github.com/google/adk-samples) - Examples

---

## Update Log

| Date | Change | Source |
|------|--------|--------|
| 2025-12-27 | Added sub-agents vs AgentTools critical pattern | Expert panel research |
| 2025-12-27 | Added tool invocation modes (AUTO/ANY/NONE) | ADR-007.1 experience |
| 2025-12-27 | Added confidence propagation patterns | Claude Code audit |
| 2025-12-27 | Initial document creation | - |

---

**⚠️ MAINTAINERS:** Update this document whenever you learn something new about ADK that contradicts assumptions or training data. This is the source of truth for RANGER's ADK implementation.

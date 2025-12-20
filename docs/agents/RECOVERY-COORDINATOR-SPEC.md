# Recovery Coordinator - Agent Specification

> *Root LlmAgent for the RANGER Command Console — Orchestrates lifecycle specialists*

**Status:** 🔵 Planning
**Priority:** 0 (Critical)
**Developer:** TBD
**Sprint Target:** 4 weeks

---

## The "Wow" Pitch

> "Give me an overview of the Cedar Creek recovery effort." The Recovery Coordinator doesn't just show a list of fires; it queries the Burn Analyst for severity metrics, the Trail Assessor for damage costs, and the NEPA Advisor for compliance status. It then synthesizes this into a single, cohesive brief: "Cedar Creek is 85% through the Impact phase; $340M in trail damage identified; Salvage logging units are 40% cruised; EA for road reconstruction is in draft."

---

## Core Purpose

The **Recovery Coordinator** is the central brain of the RANGER platform. It serves as the root `LlmAgent` in a multi-agent hierarchy, implementing the **Coordinator/Dispatcher Pattern** from the Google Agent Development Kit (ADK). Its role is to understand user intent, delegate specialized tasks to the appropriate lifecycle sub-agents, and synthesize their outputs into a unified command perspective.

**Problem Solved:** Fragmented post-fire data across multiple domains (forestry, recreation, hydrology, legal) creates cognitive load for decision-makers. Users shouldn't have to know which agent to ask; they should interact with one unified console.

**Value Proposition:** Unified orchestration across the entire recovery lifecycle—from "forest floor to Washington."

---

## Key Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Intelligent Dispatch** | Routes queries to the correct sub-agent based on intent and sub-agent descriptions | P0 (Core) |
| 2 | **Cross-Lifecycle Synthesis** | Aggregates data from multiple sub-agents into a single summary response | P0 (Core) |
| 3 | **Global State Management** | Maintains context across different lifecycle views (IMPACT → DAMAGE → etc.) | P1 (Important) |
| 4 | **Lifecycle Status Dashboard** | Directly handles "overall progress" queries by polling sub-agents | P1 (Important) |
| 5 | **Policy Enforcement** | Ensures agent responses align with high-level USFS recovery goals | P2 (Nice-to-Have) |

---

## ADK Implementation Pattern

The Recovery Coordinator is implemented as the parent agent using the `sub_agents` parameter in ADK.

### Agent Hierarchy

```mermaid
graph TD
    UI[Command Console UI] --> RC[Recovery Coordinator <br/><i>(Root LlmAgent)</i>]
    RC --> BA[Burn Analyst <br/><i>(sub_agent)</i>]
    RC --> TA[Trail Assessor <br/><i>(sub_agent)</i>]
    RC --> CA[Cruising Assistant <br/><i>(sub_agent)</i>]
    RC --> NA[NEPA Advisor <br/><i>(sub_agent)</i>]
```

### Delegation Logic

The Coordinator uses the LLM to decide when to:
1. **Route:** User query is specific to one domain (e.g., "Show me dNBR for this fire"). RC delegates to Burn Analyst.
2. **Synthesize:** User query spans domains (e.g., "How does burn severity affect our trail repair timeline?"). RC queries both Burn Analyst and Trail Assessor, then synthesizes the result.
3. **Handle Directly:** General platform queries (e.g., "What fires are currently tracked?").

---

## ADK Implementation Pattern (Code Structure)

```python
from google.adk.agents import Agent

# Sub-agents are defined first
# ... (see individual specs) ...

recovery_coordinator = Agent(
    name="recovery_coordinator",
    model="gemini-2.0-flash",
    description="Main coordinator for RANGER. Routes to lifecycle specialists.",
    instruction="""
    You are the RANGER Recovery Coordinator. Your job is to:
    1. Determine if a query should be handled by a specialist agent.
    2. Delegate specific tasks to the appropriate sub_agent:
       - Burn severity, satellite imagery, dNBR → burn_analyst
       - Trail damage, field capture, work orders → trail_assessor
       - Timber inventory, species ID, cruising → cruising_assistant
       - NEPA, compliance, regulations → nepa_advisor
    3. Synthesize responses when queries require information from multiple specialists.
    4. Provide high-level platform overviews and summaries.
    """,
    sub_agents=[burn_analyst, trail_assessor, cruising_assistant, nepa_advisor]
)
```

---

## Target Users

| Persona | Role | Need |
|---------|------|------|
| **Incident Commander** | Oversees recovery | Quick, high-level status of all recovery phases |
| **District Ranger** | Manages local forest | Coordination between maintenance and timber teams |
| **Regional Forester** | Resource allocation | Comparison of recovery needs across multiple fires |
| **Console User** | General Operator | Seamless navigation between specialized tools |

---

## Gemini Capabilities Used

| Capability | How It's Used |
|------------|---------------|
| **Agent Execution Core** | Orchestrates the `transfer_to_agent` mechanism in ADK |
| **Reasoning & Planning** | Decides which sub-agents are needed for complex multi-step queries |
| **Text Synthesis** | Combines structured data from sub-agents into narrative briefings |
| **Context Management** | Keeps track of the "active fire" and lifecycle phase |

---

## Technical Architecture

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Root Agent** | Gemini 2.0 Flash | Cost-effective, high-speed orchestration |
| **Framework** | Google ADK | Native multi-agent support |
| **State Store** | Redis | Per-session agent context and sub-agent output cache |
| **API Gateway** | FastAPI | Unified entry point for the Command Console |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Routing Accuracy** | >95% | Correct sub-agent selected for single-domain queries |
| **Synthesis Fidelity** | High | Subjective review of cross-lifecycle summaries |
| **Latency Overhead** | <2s | Additional time added by the coordinator layer |

---

## References

- [ADK Coordinator Pattern](https://cloud.google.com/blog/products/ai-machine-learning/introducing-agent-development-kit)
- [STRATEGIC-REFRAME.md](../STRATEGIC-REFRAME.md)
- [PROJECT-BRIEF.md](../PROJECT-BRIEF.md)

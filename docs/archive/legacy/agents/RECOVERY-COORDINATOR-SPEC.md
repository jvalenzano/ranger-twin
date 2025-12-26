# Recovery Coordinator - Agent Specification

> *Root LlmAgent for the RANGER Command Console — Orchestrates lifecycle specialists*

**Status:** Phase 1 (Core Implementation)
**Port:** 8005
**Priority:** P0 (Root Agent)
**Developer:** TBD
**Architecture:** [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md)

---

## ⚠️ PHASE 1 EMPHASIS: THIS IS THE PRODUCT

**The Recovery Coordinator is the core of Phase 1.** While sub-agents receive simulated data (see [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md)), the Coordinator's orchestration logic, routing decisions, synthesis capabilities, and AgentBriefingEvent handling are **fully implemented and production-grade**.

This is where the real work happens. This is what we're proving.

---

## Phase 1 Scope

| Aspect | Implementation Status |
|--------|----------------------|
| **Agent Logic** | ✅ FULLY IMPLEMENTED (not simulated) |
| **User Query Handling** | ✅ Real Gemini calls for intent parsing and routing |
| **Sub-Agent Dispatch** | ✅ Real ADK-based delegation to specialized agents |
| **Cross-Agent Synthesis** | ✅ Real multi-agent insight generation using Gemini |
| **Session State Management** | ✅ Real Redis session persistence |
| **AgentBriefingEvent Orchestration** | ✅ Real correlation ID minting, event routing, and UI binding |
| **Sub-Agent Data Sources** | ⚠️ Simulated (static fixtures) — but Coordinator doesn't care |

**What This Means:**
- The Coordinator receives real user queries via the Command Console
- It makes real routing decisions using Gemini reasoning
- It delegates to sub-agents using real ADK `transfer_to_agent` mechanisms
- Sub-agents return simulated results, but the Coordinator synthesizes them using real Gemini calls
- All AgentBriefingEvents are real, properly formatted, and drive the UI

The simulation boundary is **upstream** of the Coordinator. From the Coordinator's perspective, it's operating in production mode.

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
    model="gemini-3-flash",  # Updated per ADR-003
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

## Tools (ADK ToolCallingAgent)

All tools follow the standard interface pattern from [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md).

### route_to_specialist

Delegate a query to a specialist agent.

```python
from typing import TypedDict
from packages.twin_core.models import ToolResult

class RouteParams(TypedDict):
    agent: str  # "burn_analyst" | "trail_assessor" | "cruising_assistant" | "nepa_advisor"
    query: str

def route_to_specialist(params: RouteParams) -> ToolResult:
    """
    Delegate query to specialist agent via ADK transfer_to_agent.
    Returns specialist's response with confidence and reasoning.
    """
    return ToolResult(
        data=specialist_response,
        confidence=0.91,
        source=f"{params['agent']}",
        reasoning="Routed based on domain expertise match"
    )
```

### aggregate_briefings

Combine multiple specialist outputs into unified briefing.

```python
class AggregateBriefingsParams(TypedDict):
    briefings: list[dict]  # List of AgentBriefingEvents

def aggregate_briefings(params: AggregateBriefingsParams) -> ToolResult:
    """Synthesize multi-agent outputs into coherent summary."""
```

### generate_summary

Create executive summary from aggregated context.

```python
class SummaryParams(TypedDict):
    context: dict  # Combined agent outputs and session state

def generate_summary(params: SummaryParams) -> ToolResult:
    """Generate executive briefing for recovery leadership."""
```

---

## Technical Architecture

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Root Agent** | Gemini 3 Flash | Cost-effective, high-speed orchestration (Updated per ADR-003) |
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

- [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md) — **Phase 1 scope boundaries**
- [ADK Coordinator Pattern](https://cloud.google.com/blog/products/ai-machine-learning/introducing-agent-development-kit)
- [STRATEGIC-REFRAME.md](../STRATEGIC-REFRAME.md)
- [PROJECT-BRIEF.md](../PROJECT-BRIEF.md)
- [AGENT-MESSAGING-PROTOCOL.md](../architecture/AGENT-MESSAGING-PROTOCOL.md)

---

## Technical Appendix: Shared State Schema

The Recovery Coordinator manages the "Brain" of the operation via Redis. This ensures cross-agent context persists through a session.

### Redis Key Structure

| Key | Format | Description |
|-----|--------|-------------|
| `ranger:session:{id}:active_fire` | JSON | Fire details (ID, name, location, acres) |
| `ranger:session:{id}:briefings` | List [UUID] | Ordered history of `BriefingObject` IDs |
| `ranger:session:{id}:briefing:{uuid}` | JSON | Individual `BriefingObject` payloads |
| `ranger:session:{id}:priorities` | List [JSON] | Active `action_items` that haven't been resolved |
| `ranger:session:{id}:spatial_focus` | GeoJSON | The active bounding box or feature for UI sync |

### Coordination Logic (briefing_ingest)

Whenever a sub-agent submits a `BriefingObject`:
1. **Validation:** Check against `AGENT-MESSAGING-PROTOCOL.md`.
2. **Persistence:** Write to `ranger:session:{id}:briefing:{uuid}`.
3. **Intent Extraction:** LLM scans the briefing for `EMERGENT` priority or `action_items`.
4. **Broadcast:** If `action_items` exist, the Coordinator routes them to the `target_agent`.

---

## AgentBriefingEvent Strategy

The Recovery Coordinator is the **orchestration hub** for all `AgentBriefingEvent` emissions. It owns the cross-agent routing logic, mints correlation IDs, and synthesizes multi-agent insights into unified briefings.

### Event Trigger Conditions

| Condition | Event Type | Severity | UI Target |
|-----------|------------|----------|-----------|
| Cross-agent pattern detected (e.g., high burn + trail intersection) | `insight` | `warning` | `panel_inject` |
| Sub-agent requests handoff via `suggested_action` | `action_required` | `info` | `rail_pulse` |
| Critical threshold breached across lifecycle | `alert` | `critical` | `modal_interrupt` |
| Lifecycle phase transition (e.g., IMPACT → DAMAGE) | `status_update` | `info` | `panel_inject` |
| User query requires multi-agent synthesis | `insight` | `info` | `panel_inject` |
| Conflicting agent recommendations detected | `action_required` | `warning` | `rail_pulse` |

### Cross-Agent Handoff Matrix

The Recovery Coordinator **owns** all cross-agent routing decisions. Sub-agents never route directly to each other—all handoffs flow through the Coordinator.

| Source Agent | Trigger Condition | Target Agent | Handoff Rationale |
|--------------|-------------------|--------------|-------------------|
| Burn Analyst | High-severity burn intersects trail | Trail Assessor | Field verification of erosion risk |
| Burn Analyst | High-severity burn in timber stand | Cruising Assistant | Salvage inventory prioritization |
| Trail Assessor | Bridge failure detected | NEPA Advisor | Emergency closure documentation |
| Trail Assessor | Repair cost > $50K | NEPA Advisor | CE applicability review |
| Cruising Assistant | Salvage value > $1M | NEPA Advisor | Timber sale NEPA triggers |
| Cruising Assistant | Salvage route blocked | Trail Assessor | Access road assessment |
| NEPA Advisor | ESA species in project area | Burn Analyst | Refine severity mapping for habitat |

### Correlation ID Strategy

The Recovery Coordinator **mints** all `correlation_id` values:

- **Format:** `{fire-name}-recovery-{year}-{sequence}`
- **Example:** `cedar-creek-recovery-2024-001`
- **Lifecycle:** Persists for the entire recovery operation (months to years)
- **Storage:** `ranger:session:{id}:correlation_id` in Redis

**Minting Rules:**
1. New `correlation_id` when user initiates a new fire recovery project
2. Same `correlation_id` for all related agent activities within that recovery
3. All sub-agent events inherit the active `correlation_id` from session state

### Confidence Scoring Formula

```
confidence = (sub_agent_avg * 0.40) + (data_recency * 0.25) +
             (spatial_accuracy * 0.20) + (cross_validation * 0.15)
```

| Factor | Weight | Description |
|--------|--------|-------------|
| Sub-agent confidence average | 40% | Weighted average of source event confidence scores |
| Data recency | 25% | Degradation factor: -5% per week since last imagery/data |
| Spatial intersection accuracy | 20% | Buffer tolerance and overlay precision |
| Cross-validation | 15% | Agreement between 2+ data sources |

### JSON Example: Cross-Agent Synthesis Event

```json
{
  "schema_version": "1.0.0",
  "event_id": "coord-evt-001",
  "parent_event_id": null,
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T14:32:00Z",
  "type": "insight",
  "source_agent": "recovery_coordinator",
  "severity": "warning",
  "ui_binding": {
    "target": "panel_inject",
    "geo_reference": null
  },
  "content": {
    "summary": "High-severity burn area overlaps 3.2 miles of Waldo Lake Trail, creating combined erosion and visitor safety risk.",
    "detail": "The Burn Analyst identified 18,340 acres of high-severity burn in the NW quadrant. Cross-referencing with trail network data shows the Waldo Lake Trail (miles 4.2-7.4) passes through this zone. Trail Assessor field verification recommended before winter precipitation.",
    "suggested_actions": [
      {
        "action_id": "coord-act-001",
        "label": "Prioritize Waldo Lake Trail Assessment",
        "target_agent": "trail_assessor",
        "description": "Dispatch Trail Assessor to survey miles 4.2-7.4",
        "rationale": "High-severity burn + steep slope creates elevated debris flow risk"
      },
      {
        "action_id": "coord-act-002",
        "label": "Flag for NEPA Review",
        "target_agent": "nepa_advisor",
        "description": "Check if emergency trail closure requires CE documentation",
        "rationale": "Visitor safety closure may trigger 36 CFR 220.6"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.91,
    "citations": [
      {
        "source_type": "Sentinel-2",
        "id": "S2A_MSIL2A_20220915T185921",
        "uri": "gs://ranger-imagery/cedar-creek/post-fire/S2A_20220915.tif",
        "excerpt": "dNBR analysis showing 42% high-severity classification in NW quadrant"
      },
      {
        "source_type": "USFS-Trails",
        "id": "trail-3536-waldo",
        "uri": "https://data.fs.usda.gov/geodata/trails/willamette/waldo-lake.geojson",
        "excerpt": "Trail segment coordinates for miles 4.2-7.4 intersecting Sector NW-4"
      }
    ],
    "reasoning_chain": [
      "1. Received Burn Analyst event indicating 42% high-severity burn in NW quadrant",
      "2. Performed spatial intersection with trail network layer",
      "3. Identified 3.2-mile overlap with Waldo Lake Trail",
      "4. Calculated slope gradient from 3DEP DEM (average 38%)",
      "5. Applied BAER erosion risk model: HIGH risk classification",
      "6. Concluded: Trail assessment required before October precipitation"
    ]
  }
}
```

### JSON Example: Critical Escalation Event

```json
{
  "schema_version": "1.0.0",
  "event_id": "coord-evt-003",
  "parent_event_id": "trail-evt-007",
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T16:45:00Z",
  "type": "alert",
  "source_agent": "recovery_coordinator",
  "severity": "critical",
  "ui_binding": {
    "target": "modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.0823, 43.7456]
      },
      "properties": { "label": "Rebel Creek Bridge - FAILURE DETECTED" }
    }
  },
  "content": {
    "summary": "CRITICAL: Rebel Creek Bridge structural failure confirmed. Immediate trail closure required.",
    "detail": "Trail Assessor video analysis confirmed complete structural failure of the Rebel Creek Bridge at mile 2.3. The bridge is impassable and poses immediate visitor safety risk.",
    "suggested_actions": [
      {
        "action_id": "coord-act-005",
        "label": "Issue Emergency Closure",
        "target_agent": "nepa_advisor",
        "description": "Generate emergency closure documentation per FSM 2353.03",
        "rationale": "Imminent hazard requires documented closure within 24 hours"
      },
      {
        "action_id": "coord-act-006",
        "label": "Estimate Repair Cost",
        "target_agent": "trail_assessor",
        "description": "Generate detailed cost estimate for bridge replacement",
        "rationale": "Budget planning requires Class C estimate within 72 hours"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.96,
    "citations": [
      {
        "source_type": "AgentBriefingEvent",
        "id": "trail-evt-007",
        "uri": "ranger:events/trail-evt-007",
        "excerpt": "Trail Assessor: Bridge failure severity CRITICAL, visitor risk HIGH"
      },
      {
        "source_type": "FSM",
        "id": "FSM-2353.03",
        "uri": "https://www.fs.usda.gov/directives/fsm/2300/2353.03",
        "excerpt": "Emergency closure authority for imminent hazards"
      }
    ],
    "reasoning_chain": [
      "1. Received Trail Assessor alert with severity CRITICAL",
      "2. Validated bridge failure classification from video frame analysis",
      "3. Determined multi-agent impact: NEPA (closure docs), Trail (cost), Timber (access)",
      "4. Elevated to modal_interrupt per severity policy",
      "5. Generated coordinated action set for user decision"
    ]
  }
}
```

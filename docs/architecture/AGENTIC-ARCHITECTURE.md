# RANGER Agentic Architecture

**Status:** Active
**Created:** 2025-12-22
**Author:** RANGER Team
**Purpose:** Define the multi-agent orchestration architecture for RANGER's fire recovery platform

---

## Executive Summary

RANGER uses **Google ADK (Agent Development Kit)** with **ToolCallingAgents** to implement multi-agent orchestration for post-fire forest recovery. This architecture prioritizes:

- **Simplicity**: Pure ADK, no hybrid frameworks
- **Speed**: Sub-second tool calls vs. code generation latency
- **Compliance**: FedRAMP High authorized GCP services only
- **Trust**: Confidence scores, reasoning chains, and verification patterns

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Command Console (React)                                     │
│  localhost:3000                                              │
│  - AgentBriefingEvent display                               │
│  - Reasoning chain visualization                            │
│  - Confidence score badges                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ WebSocket / REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway (FastAPI)                                       │
│  localhost:8000                                              │
│  - Route queries to Recovery Coordinator                    │
│  - Stream AgentBriefingEvents to UI                        │
│  - Handle authentication (Phase 2)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Recovery Coordinator (ADK Orchestrator)                     │
│  localhost:8005                                              │
│  - Understand user intent                                   │
│  - Route to specialist agents                               │
│  - Aggregate results with reasoning                         │
│  - Generate unified briefings                               │
└───────┬─────────┬─────────┬─────────┬───────────────────────┘
        │         │         │         │
        ▼         ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │  Burn  │ │ Trail  │ │Cruising│ │  NEPA  │
   │Analyst │ │Assessor│ │  Asst  │ │Advisor │
   │ :8001  │ │ :8002  │ │ :8003  │ │ :8004  │
   │        │ │        │ │        │ │        │
   │ ADK    │ │ ADK    │ │ ADK    │ │ ADK    │
   │ Tool   │ │ Tool   │ │ Tool   │ │ Tool   │
   │ Calling│ │ Calling│ │ Calling│ │ Calling│
   └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
       │         │         │         │
       ▼         ▼         ▼         ▼
   ┌─────────────────────────────────────────┐
   │  Tools (Python functions)                │
   │                                          │
   │  Phase 1: Fixture data                   │
   │  - query_burn_severity(fire_id, bbox)   │
   │  - query_trail_damage(trail_id)         │
   │  - query_timber_plots(sector_id)        │
   │  - search_nepa_guidance(query)          │
   │                                          │
   │  Phase 2: Real APIs (same interface)     │
   │  - MTBS, RAVG, Sentinel-2               │
   │  - FACTS, ArcGIS Enterprise             │
   │  - Forest Service Manual RAG            │
   └─────────────────────────────────────────┘
```

---

## Design Decisions

### Why Pure ADK (Not Hybrid)

| Consideration | ADK ToolCallingAgents | Hybrid (ADK + SmolAgents) |
|---------------|----------------------|---------------------------|
| **Latency** | Sub-second tool calls | +2-4 seconds for code generation |
| **Debugging** | Single framework, structured events | Two frameworks, disconnected traces |
| **FedRAMP** | Vertex AI authorized | E2B not authorized |
| **Complexity** | One testing strategy | Two pipelines, two observability stacks |

**Decision**: Pure ADK. The expressivity benefits of code generation don't justify the complexity for RANGER's use cases.

### Why ToolCallingAgents (Not CodeAgents)

RANGER's agents perform:
- Spatial queries (read-only)
- Data aggregation (deterministic)
- Report generation (templated)

None of these require generating and executing arbitrary Python code. Tool calling with well-designed parameters is sufficient and 10x faster to debug.

### Why Five Specialized Agents (Not Three)

The expert panel suggested consolidating to 3 agents. We retain 5 because:

1. **Domain expertise**: Each agent has specialized system prompts, tools, and reasoning patterns
2. **Parallel execution**: Independent agents can run concurrently
3. **Clear responsibility**: Easier to attribute errors and improve specific capabilities
4. **USFS alignment**: Maps to actual Forest Service roles (burn specialist, trail crew, timber cruiser, NEPA planner)

---

## Agent Specifications

### Recovery Coordinator (Port 8005)

**Role**: Orchestrator - understands user intent, routes to specialists, aggregates results

**Capabilities**:
- Parse natural language queries
- Determine which specialists to invoke
- Aggregate multi-agent responses
- Generate unified briefings with reasoning chains

**Tools**:
- `route_to_specialist(agent, query)` - Delegate to specialist agent
- `aggregate_briefings(briefings[])` - Combine specialist outputs
- `generate_summary(context)` - Create executive summary

### Burn Analyst (Port 8001)

**Role**: Assess fire severity using remote sensing data

**Capabilities**:
- Query burn severity classifications (MTBS, dNBR, NDVI)
- Identify high-severity zones
- Calculate affected acreage by severity class
- Generate severity maps and statistics

**Tools**:
- `query_burn_severity(fire_id, bbox, source)` - Get severity data
- `calculate_severity_stats(polygon)` - Compute area by severity
- `identify_hot_spots(threshold)` - Find high-severity clusters

### Trail Assessor (Port 8002)

**Role**: Evaluate trail and infrastructure damage

**Capabilities**:
- Query trail damage assessments
- Prioritize repairs by severity and usage
- Estimate repair costs and timelines
- Generate work orders for trail crews

**Tools**:
- `query_trail_damage(trail_id)` - Get damage assessment
- `prioritize_repairs(criteria)` - Rank by severity/usage
- `estimate_repair_cost(damage_type)` - Cost estimation
- `generate_work_order(trail_id, damage)` - TRACS-compatible output

### Cruising Assistant (Port 8003)

**Role**: Support timber salvage assessment

**Capabilities**:
- Query timber plot data
- Calculate board feet and salvage value
- Prioritize harvest by decay timeline
- Generate FSVeg-compatible cruise reports

**Tools**:
- `query_timber_plots(sector_id)` - Get plot inventory
- `calculate_board_feet(plot_id, species)` - Volume calculation
- `estimate_salvage_value(volume, grade)` - Economic analysis
- `generate_cruise_report(plots[])` - FSVeg export format

### NEPA Advisor (Port 8004)

**Role**: Provide regulatory guidance for recovery actions

**Capabilities**:
- Search Forest Service Manual and regulations
- Identify applicable NEPA pathways (CE, EA, EIS)
- Generate compliance checklists
- Cite relevant authorities

**Tools**:
- `search_regulations(query)` - RAG over policy documents
- `identify_nepa_pathway(action_type)` - Categorical exclusion check
- `generate_compliance_checklist(pathway)` - Required documentation
- `cite_authority(regulation_id)` - Formatted citations

---

## Production System Mapping

Each agent's tools simulate data from real USFS production systems. In Phase 2, only the tool implementations change—agent code remains identical.

| Agent | Fixture Data | Production Systems (Phase 2) |
|-------|--------------|------------------------------|
| **Burn Analyst** | `burn-severity.json` | **MTBS** (Monitoring Trends in Burn Severity), **RAVG** (Rapid Assessment of Vegetation), **Sentinel-2** / **Landsat** satellite imagery |
| **Trail Assessor** | `trail-damage.json` | **TRACS** (Trail Condition Assessment System), **Survey123** / **ArcGIS Field Maps** field data collection |
| **Cruising Assistant** | `timber-plots.json` | **FSVeg** (Field Sampled Vegetation), **FACTS** (Forest Activity Tracking System), **Common Stand Exam** protocols |
| **NEPA Advisor** | Policy documents | **Forest Service Manual** RAG, **ePlanning** NEPA database |

### Export Compatibility

RANGER generates outputs compatible with existing USFS systems:

| Agent | Export Format | Target System |
|-------|---------------|---------------|
| Trail Assessor | TRACS CSV | Trail Condition Assessment System |
| Cruising Assistant | FSVeg XML | Field Sampled Vegetation database |
| NEPA Advisor | EA/CE templates | ePlanning / SOPA |

This "Legacy Bridge" approach means USFS staff can import RANGER outputs into their existing workflows without system changes.

---

## Tool Interface Standard

All tools follow a consistent interface pattern:

```python
from typing import TypedDict
from packages.twin_core.models import ToolResult

class BurnSeverityParams(TypedDict):
    fire_id: str
    bbox: tuple[float, float, float, float]  # (min_lng, min_lat, max_lng, max_lat)
    source: str  # "mtbs" | "dnbr" | "ndvi"

def query_burn_severity(params: BurnSeverityParams) -> ToolResult:
    """
    Query burn severity data for a fire.

    Phase 1: Returns fixture data from data/fixtures/
    Phase 2: Calls real MTBS/RAVG APIs (same interface)

    Returns:
        ToolResult with:
        - data: GeoJSON FeatureCollection of severity polygons
        - confidence: float (0-1) based on data quality
        - source: str attribution
        - reasoning: str explanation of methodology
    """
    # Phase 1: Load fixture
    fixture_path = f"data/fixtures/{params['fire_id']}/burn_severity.geojson"
    data = load_geojson(fixture_path)

    return ToolResult(
        data=data,
        confidence=0.85,
        source="MTBS (simulated)",
        reasoning="Burn severity derived from dNBR classification using Landsat imagery"
    )
```

**Key principles**:
1. **Typed parameters**: Use TypedDict for clear contracts
2. **Confidence scores**: Every result includes a confidence value
3. **Source attribution**: Cite data sources for transparency
4. **Reasoning traces**: Explain methodology for auditability
5. **Phase-agnostic interface**: Same signature for fixtures and real APIs

---

## Verification Patterns

### Confidence Scoring

Every tool output includes a confidence score (0-1):

```python
confidence_factors = {
    "data_freshness": 0.9,    # How recent is the source data
    "spatial_accuracy": 0.85,  # Resolution and alignment
    "methodology": 0.95,       # Established vs. experimental
    "completeness": 0.8,       # Coverage of requested area
}
confidence = sum(confidence_factors.values()) / len(confidence_factors)
```

### Best of N (Without Sandboxes)

For high-stakes decisions, run multiple approaches in parallel:

```python
async def assess_burn_severity_verified(fire_id: str):
    # Run multiple methodologies concurrently
    results = await asyncio.gather(
        burn_analyst.assess_via_mtbs(fire_id),
        burn_analyst.assess_via_dnbr(fire_id),
        burn_analyst.assess_via_ndvi(fire_id),
    )

    # Select highest confidence result
    best = max(results, key=lambda r: r.confidence)

    return AgentBriefingEvent(
        type="panel_inject",
        agent="burn-analyst",
        data={
            "selected": best,
            "alternatives": results,
            "reasoning": f"Selected {best.method} approach (confidence: {best.confidence:.0%})"
        }
    )
```

### Reasoning Chains

Agents emit reasoning steps for transparency:

```python
reasoning_chain = [
    {"step": 1, "action": "Query fire perimeter", "result": "Retrieved 15,234 acre boundary"},
    {"step": 2, "action": "Fetch MTBS severity raster", "result": "2024 classification available"},
    {"step": 3, "action": "Calculate zonal statistics", "result": "High: 4,521 ac, Mod: 6,892 ac, Low: 3,821 ac"},
    {"step": 4, "action": "Identify priority areas", "result": "3 high-severity clusters identified"},
]
```

Displayed in UI via `ReasoningChain` component.

---

## Production Deployment (Phase 2+)

### GCP Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Cloud Run Services                                          │
│  (FedRAMP High, us-east4)                                   │
├─────────────────────────────────────────────────────────────┤
│  api-gateway        │ recovery-coordinator                  │
│  burn-analyst       │ trail-assessor                        │
│  cruising-assistant │ nepa-advisor                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│  Vertex AI (Gemini 2.5 Flash)                               │
│  - Agent reasoning                                           │
│  - Tool selection                                            │
│  - Response synthesis                                        │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│  Data Sources                                                │
├─────────────────────────────────────────────────────────────┤
│  Cloud SQL PostGIS  │ BigQuery GIS      │ Cloud Storage     │
│  (vectors)          │ (analytics)       │ (rasters)         │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Strategy

- **Cloud Run**: Scale-to-zero for seasonal workloads (May-Oct active)
- **Vertex AI**: Batch mode for non-urgent queries (50% cost savings)
- **Caching**: Redis/Memorystore for repeated tool results

---

## Rejected Alternatives

### E2B Sandboxes

**Rejected because**:
- No FedRAMP authorization
- Adds code generation latency (2-4 seconds)
- Solves a problem RANGER doesn't have (tool calling, not code execution)

See `docs/archive/E2B-INTEGRATION-PLAN.md` for full analysis.

### SmolAgents/LangChain Hybrid

**Rejected because**:
- Two frameworks = two debugging strategies
- Impedance mismatch between ADK events and code execution logs
- Complexity not justified by Phase 1 requirements

### Consolidated 3-Agent Architecture

**Considered but rejected** in favor of 5 specialists:
- Domain expertise requires specialized prompts and tools
- Maps to USFS organizational structure
- Enables parallel execution

---

## References

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Vertex AI FedRAMP Authorization](https://cloud.google.com/blog/topics/public-sector/vertex-ai-search-and-generative-ai-with-gemini-achieve-fedramp-high)
- [RANGER GCP Architecture](./GCP-ARCHITECTURE.md)
- [Agent Messaging Protocol](./AGENT-MESSAGING-PROTOCOL.md)
- [Briefing UX Spec](./BRIEFING-UX-SPEC.md)

---

**Document Status:** Active
**Last Updated:** 2025-12-22
**Next Review:** After Phase 1 prototype validation

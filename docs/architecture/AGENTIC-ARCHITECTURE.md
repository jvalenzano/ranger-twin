# RANGER Agentic Architecture

**Status:** Active  
**Created:** 2025-12-22  
**Last Updated:** 2025-12-27  
**Author:** RANGER Team  
**Purpose:** Define the multi-agent orchestration architecture for RANGER's fire recovery platform

---

> [!IMPORTANT]
> **Current Architecture:** This document describes the **Skills-First Architecture** per [ADR-005](../adr/ADR-005-skills-first-architecture.md). RANGER uses a **single Cloud Run service** (`ranger-coordinator`) that hosts the Recovery Coordinator and all specialist agents via the **AgentTool pattern** per [ADR-008](../adr/ADR-008-agent-tool-pattern.md).

---

## 1. Executive Summary

RANGER uses **Google ADK (Agent Development Kit)** with the **AgentTool pattern** to implement multi-agent orchestration for post-fire forest recovery. This architecture prioritizes:

- **Simplicity**: Single Cloud Run service, AgentTool wrappers (not microservices)
- **Skills-First**: Domain expertise in portable skill packages, not monolithic prompts
- **Fixture-First**: Demo uses real federal data cached locally; production swaps to MCP
- **Compliance**: FedRAMP High authorized GCP services, Proof Layer for auditability

---

## 2. Architecture Overview

### Current State (Phase 0-1: Demo)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Cloud Run: ranger-console (React Frontend)                              │
│  https://ranger-console-xxx-uc.a.run.app                                │
│  - Mission Control UI                                                    │
│  - Chat interface for agent queries                                      │
│  - Proof Layer visualization (reasoning chains, citations)               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (SSE streaming)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Cloud Run: ranger-coordinator (ADK Backend)                             │
│  https://ranger-coordinator-xxx-uc.a.run.app                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Recovery Coordinator (root_agent)                                  │ │
│  │  - Understands user intent                                          │ │
│  │  - Calls specialists via AgentTool pattern                          │ │
│  │  - Synthesizes cross-domain insights                                │ │
│  │  - Generates unified briefings with Proof Layer                     │ │
│  └──────────────┬─────────────┬─────────────┬─────────────┬───────────┘ │
│                 │             │             │             │              │
│        AgentTool│    AgentTool│    AgentTool│    AgentTool│              │
│                 ▼             ▼             ▼             ▼              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Burn    │ │  Trail   │ │ Cruising │ │  NEPA    │                    │
│  │ Analyst  │ │ Assessor │ │ Assistant│ │ Advisor  │                    │
│  │          │ │          │ │          │ │          │                    │
│  │ Skills:  │ │ Skills:  │ │ Skills:  │ │ Skills:  │                    │
│  │ -Severity│ │ -Damage  │ │ -Volume  │ │ -Pathway │                    │
│  │ -MTBS    │ │ -Closure │ │ -Salvage │ │ -CE/EA   │                    │
│  │ -Boundary│ │ -Priority│ │ -Cruise  │ │ -RAG     │                    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘                    │
│       │            │            │            │                          │
│       └────────────┴────────────┴────────────┘                          │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  data/fixtures/ (Bundled in Docker image)                          │ │
│  │  ├── cedar-creek/                                                   │ │
│  │  │   ├── burn-severity.json    (Real MTBS data, Oct 2022)          │ │
│  │  │   ├── trail-damage.json     (Real TRACS format, Nov 2022)       │ │
│  │  │   ├── timber-plots.json     (Real FSVeg format, Nov 2022)       │ │
│  │  │   └── incident-metadata.json (Real IRWIN data, Aug 2022)        │ │
│  │  └── bootleg/                                                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API calls
                                    ▼
                           ┌────────────────────┐
                           │  Gemini 2.0 Flash  │
                           │  (via Vertex AI)   │
                           │  FedRAMP High      │
                           └────────────────────┘
```

### Key Architecture Decisions

| Decision | Choice | Rationale | Reference |
|----------|--------|-----------|-----------|
| Agent Framework | Google ADK | FedRAMP authorized, native Gemini integration | ADR-005 |
| Multi-Agent Pattern | AgentTool wrappers | Coordinator retains control, enables synthesis | ADR-008 |
| LLM Provider | Google Gemini only | Simplicity, ADK native, Vertex AI compliance | ADR-006 |
| Data Strategy | Fixture-First | Demo reliability, real data formats, MCP-ready | ADR-009 |
| Tool Invocation | mode="AUTO" | Prevents infinite loops, allows flexible routing | ADR-007.1 |

---

## 3. Agent Specifications

### Recovery Coordinator (Orchestrator)

**File:** `agents/coordinator/agent.py`  
**Role:** Central orchestrator that understands user intent and delegates to specialists

**Capabilities:**
- Parse natural language queries about fire recovery
- Route single-domain queries to appropriate specialist
- Execute multi-domain queries by calling ALL four specialists
- Synthesize cross-domain insights into unified briefings
- Calculate portfolio triage scores for incident prioritization

**Tools:**
- `burn_analyst_tool` (AgentTool) — Fire severity assessment
- `trail_assessor_tool` (AgentTool) — Infrastructure damage evaluation
- `cruising_assistant_tool` (AgentTool) — Timber salvage analysis
- `nepa_advisor_tool` (AgentTool) — Regulatory compliance guidance
- `portfolio_triage` (Function) — BAER prioritization scoring

### Burn Analyst (Specialist)

**File:** `agents/burn_analyst/agent.py`  
**Role:** Fire severity and burn impact analysis

**Skills:**
- `assess_severity` — dNBR-based soil burn severity classification
- `classify_mtbs` — MTBS protocol severity class assignment (1-4)
- `validate_boundary` — Fire perimeter geometry validation

**Data Sources (Demo):** `data/fixtures/cedar-creek/burn-severity.json`  
**Data Sources (Production):** MTBS API, Sentinel-2 via MCP

### Trail Assessor (Specialist)

**File:** `agents/trail_assessor/agent.py`  
**Role:** Trail and infrastructure damage evaluation

**Skills:**
- `assess_trail_damage` — Damage classification per TRACS codes (D1-D5)
- `recommend_closures` — Safety-based closure recommendations
- `prioritize_repairs` — Repair prioritization by severity and usage

**Data Sources (Demo):** `data/fixtures/cedar-creek/trail-damage.json`  
**Data Sources (Production):** TRACS API via MCP

### Cruising Assistant (Specialist)

**File:** `agents/cruising_assistant/agent.py`  
**Role:** Timber salvage assessment and inventory

**Skills:**
- `estimate_volume` — Board feet calculation by species
- `assess_salvage_viability` — Decay timeline and economic analysis
- `generate_cruise_report` — FSVeg-compatible export

**Data Sources (Demo):** `data/fixtures/cedar-creek/timber-plots.json`  
**Data Sources (Production):** FSVeg API via MCP

### NEPA Advisor (Specialist)

**File:** `agents/nepa_advisor/agent.py`  
**Role:** Environmental compliance and regulatory guidance

**Skills:**
- `determine_pathway` — CE/EA/EIS pathway recommendation
- `search_regulations` — RAG over FSM/FSH corpus
- `generate_compliance_checklist` — Documentation requirements

**Data Sources (Demo):** Google File Search (Managed RAG)  
**Data Sources (Production):** Same (Google File Search is production-ready)

---

## 4. Data Architecture

### Fixture-First Strategy (ADR-009)

For Phase 1, skills load data from bundled JSON fixtures derived from real federal sources:

```python
# Example: assess_severity.py
def load_fixture_data(fire_id: str) -> dict:
    fixture_path = Path("data/fixtures/cedar-creek/burn-severity.json")
    with open(fixture_path) as f:
        return json.load(f)
```

**Key Principle:** The skill code is identical between demo and production. Only the data source changes.

### Fixture Provenance

| Fixture File | Federal Source | Date | Authenticity |
|--------------|---------------|------|--------------|
| `burn-severity.json` | MTBS | Oct 2022 | Real dNBR values |
| `trail-damage.json` | TRACS format | Nov 2022 | Real damage codes |
| `timber-plots.json` | FSVeg format | Nov 2022 | Real plot structure |
| `incident-metadata.json` | IRWIN | Aug 2022 | Real fire attributes |

### Production Data Path (Phase 2+)

```
Skills ──► MCP Client ──► MCP Server (Cloud Run) ──► Federal APIs
                              │
                              ├── NIFC (fire perimeters)
                              ├── IRWIN (incident metadata)
                              ├── MTBS (burn severity)
                              └── TRACS (trail systems)
```

MCP servers use **HTTP/SSE transport** per Google Cloud Run requirements (stdio not supported).

---

## 5. Session & Memory

### Current State (Demo)

- **Session Storage:** In-memory (ADK default)
- **Persistence:** Lost on container restart
- **Multi-user:** Not supported (single demo user)

### Production State

- **Session Storage:** Firestore
- **Configuration:** `SESSION_SERVICE_URI=firestore://project/database/sessions`
- **Persistence:** Survives restarts, shared across instances

**Migration:** Environment variable change only—no code changes required.

---

## 6. Proof Layer

Every agent response includes transparency metadata:

```json
{
  "proof_layer": {
    "confidence": 0.92,
    "reasoning_chain": [
      "Loaded 8 sectors from MTBS dataset",
      "Applied dNBR thresholds: HIGH >= 0.66",
      "Sector NW-1: dNBR 0.72 -> HIGH severity"
    ],
    "citations": [
      {
        "source": "MTBS",
        "reference_id": "cedar-creek-2022",
        "imagery_date": "2022-10-15"
      }
    ]
  }
}
```

**UI Rendering:** `ReasoningAccordion` component displays expandable reasoning chains. Citation chips link to source data.

---

## 7. Deployment Architecture

### Cloud Run Services

| Service | Purpose | URL Pattern |
|---------|---------|-------------|
| `ranger-console` | React frontend | `ranger-console-xxx-uc.a.run.app` |
| `ranger-coordinator` | ADK backend (all agents) | `ranger-coordinator-xxx-uc.a.run.app` |

### Environment Variables (Coordinator)

```bash
GOOGLE_CLOUD_PROJECT=ranger-twin-dev
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=TRUE          # FedRAMP path
GOOGLE_API_KEY=<optional, for non-Vertex>
SESSION_SERVICE_URI=<firestore URI for production>
ALLOW_ORIGINS=https://ranger-console-xxx-uc.a.run.app
```

### NOT Deployed (Phase 1)

- ❌ Separate MCP fixture server (fixtures bundled in coordinator)
- ❌ Cloud SQL / pgvector (not needed for demo)
- ❌ Firestore sessions (in-memory sufficient for demo)

---

## 8. Rejected Alternatives

### Microservices Per Agent (Original Design)

**Rejected because:**
- Added network latency between coordinator and specialists
- Complex service mesh for what's a single-process concern
- AgentTool pattern achieves same modularity without network hops

### E2B Sandboxes / Code Execution

**Rejected because:**
- No FedRAMP authorization
- RANGER doesn't need dynamic code generation
- Tool calling with typed parameters is sufficient

### MCP Server for Demo

**Rejected because:**
- Adds deployment complexity without demo value
- Fixtures bundled in Docker work identically
- MCP is Phase 2 production infrastructure

---

## 9. References

| Document | Purpose |
|----------|---------|
| [ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md) | Core architectural paradigm |
| [ADR-006: Google-Only LLM](../adr/ADR-006-google-only-llm-strategy.md) | LLM provider decision |
| [ADR-007.1: Tool Invocation](../adr/ADR-007.1-tool-invocation-strategy.md) | mode="AUTO" infinite loop fix |
| [ADR-008: AgentTool Pattern](../adr/ADR-008-agent-tool-pattern.md) | Multi-agent orchestration pattern |
| [ADR-009: Fixture-First](../adr/ADR-009-fixture-first-development.md) | Demo data strategy |
| [Google ADK Docs](https://google.github.io/adk-docs/) | Framework documentation |
| [Cloud Run AI Agents](https://docs.cloud.google.com/run/docs/ai-agents) | GCP deployment guidance |

---

**Document Owner:** RANGER Architecture Team  
**Last Updated:** 2025-12-27  
**Status:** Active — aligned with deployed system

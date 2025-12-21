# NEPA Advisor - Agent Specification

> *Formerly "PolicyPilot" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** Phase 1 (Limited RAG)
**Priority:** 3 (Tertiary)
**Developer:** TBD

---

## The "Wow" Pitch

> A NEPA planner pastes a draft Environmental Assessment into the NEPA Advisor and asks, "Does this adequately address watershed protection requirements?" Within 30 seconds, the AI returns a compliance assessment with direct citations to FSM 2520 and FSH 2509.18—complete with paragraph references and links. What used to require three weeks of manual cross-referencing now happens during a coffee break.

---

## Core Purpose

The NEPA Advisor is a **regulatory compliance assistant** that uses Retrieval-Augmented Generation (RAG) to help Forest Service staff verify that planning documents comply with the Forest Service Manual (FSM), Forest Service Handbook (FSH), and NEPA requirements. It eliminates the "cite-checking bottleneck" by providing instant, grounded answers with verifiable citations.

**Problem Solved:** Environmental planning documents take 2-4 years to complete, with a significant portion of that time spent manually cross-referencing regulations. Staff turnover means institutional knowledge of the 10,000+ page regulatory corpus is constantly being lost.

**Value Proposition:** Make regulatory expertise instantly accessible to every planner, turning "Who knows what FSM says about this?" into a 30-second query.

---

## Phase 1 Scope

**What We're Building:** A regulatory compliance assistant that demonstrates the value of RAG-based citation retrieval for NEPA planning.

**Phase 1 Simulation Strategy** (per [DATA-SIMULATION-STRATEGY.md](../DATA-SIMULATION-STRATEGY.md)):

| Aspect | Simulation Approach |
|--------|---------------------|
| **Input** | Project context from other agents + FSM/FSH corpus (real PDFs, chunked for RAG) |
| **What's Real** | RAG retrieval from actual Forest Service Manual/Handbook sections, Gemini generates citations and EA draft sections |
| **What's Fake** | Corpus may be incomplete; no PALS integration; limited to national-level regulations |

**Acceptable Limitations for Phase 1:**
- **Incomplete Corpus:** We may only index a subset of FSM/FSH (e.g., key chapters: FSM 2500 series, FSM 2600 series, select FSH sections). This is acceptable for proof of concept.
- **No PALS Integration:** Phase 1 does not integrate with the USFS Planning, Appeals, and Litigation System. Citations are standalone.
- **National-Level Only:** No region-specific supplements or forest plan amendments in Phase 1.
- **No Real-Time Updates:** The corpus is a static snapshot; no automated updates from the USFS Directives System.

**Core Value Proposition for Phase 1:**
1. **Receive** project context from Recovery Coordinator and other agents
2. **Retrieve** relevant regulations from the FSM/FSH corpus using RAG
3. **Generate** citations with section references and paragraph excerpts
4. **Draft** EA sections (e.g., Purpose and Need, Compliance Summary)

**Sample Simulated Input:**
```json
{
  "project_type": "TIMBER_SALVAGE",
  "location": {"fire_id": "cedar-creek-2022", "sectors": ["NW-4"]},
  "proposed_actions": ["salvage_logging", "road_reconstruction"],
  "upstream_context": {
    "burn_severity": "HIGH",
    "trail_damage_cost": 127000,
    "salvage_value_estimate": 1800000
  }
}
```

**Phase 1 Success Criteria:**
- RAG retrieval returns relevant FSM/FSH sections with >90% relevance
- Citations are verifiable (can be manually traced to source documents)
- Generated EA sections are coherent and grounded in retrieved context
- Response latency <10 seconds for typical queries

---

## Key Features

**Phase 1 Focus:** Features #1 and #2 are the core proof of concept. Features #3-6 may be deferred or simplified.

| # | Feature | Description | Priority | Phase 1 Status |
|---|---------|-------------|----------|----------------|
| 1 | **Natural Language Query** | Ask questions like "What are the timber sale requirements for spotted owl habitat?" | P0 (Core) | ✅ Full |
| 2 | **Grounded Citations** | Every response includes specific document references (FSM chapter, section, paragraph) | P0 (Core) | ✅ Full |
| 3 | **Document Upload Analysis** | Upload draft EAs/EIS documents for compliance gap analysis | P0 (Core) | ⚠️ Simplified (text snippets only) |
| 4 | **Confidence Indicators** | Visual display of retrieval confidence and source relevance | P1 (Important) | ✅ Full |
| 5 | **Citation Deep Links** | One-click navigation to source documents in SharePoint/eLibrary | P1 (Important) | ⚠️ Static links only |
| 6 | **Query History** | Searchable log of previous queries and responses | P2 (Nice-to-Have) | ❌ Deferred |

---

## Target Users

| Persona | Role | Pain Point | How NEPA Advisor Helps |
|---------|------|------------|----------------------|
| **NEPA Planner** | Prepares environmental documents | Weeks spent cite-checking | Instant citation verification |
| **District Ranger** | Signs decision documents | Liability for compliance gaps | AI pre-screening before review |
| **Resource Specialist** | Wildlife/water/timber SME | Staying current on policy updates | Single query interface to full corpus |
| **New Employee** | Recently hired staff | Steep learning curve on regulations | Ask questions, learn by exploration |

---

## Gemini/Vertex AI Capabilities Used

| Capability | How It's Used | Why It Matters |
|------------|---------------|----------------|
| **Vertex AI Search** | Index and search FSM/FSH corpus | Managed retrieval infrastructure |
| **Grounding** | Force responses to cite retrieved chunks | Prevents hallucination, ensures trust |
| **Document AI** | Parse PDFs of Forest Service publications | Extract structured text from scanned docs |
| **Gemini Pro** | Generate coherent answers from retrieved context | Natural language understanding |
| **Citations API** | Return source metadata with responses | Verifiable, auditable responses |

---

## Technical Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │────▶│ Vertex AI   │────▶│   Gemini    │────▶│  Response   │
│   (Query)   │     │   Search    │     │   Pro       │     │  + Citations│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                    │                    │                    │
     │ Natural Language   │ Retrieved Chunks   │ Grounded Answer    │ FSM/FSH Refs
     │                    │                    │                    │
                    ┌─────────────┐
                    │  Document   │
                    │  Corpus     │
                    │  (FSM/FSH)  │
                    └─────────────┘
```

### Core Components

| Component | Technology | Notes |
|-----------|------------|-------|
| **Web Interface** | React or Vue.js | Simple query interface |
| **Backend API** | Cloud Run (Python) | Orchestrates RAG pipeline |
| **Search Engine** | Vertex AI Search & Conversation | Managed RAG infrastructure |
| **Document Store** | Cloud Storage | FSM/FSH corpus (PDFs/HTML) |
| **Vector Store** | Managed by Vertex AI Search | Automatic embedding |
| **LLM** | Gemini 1.5 Pro (Vertex AI) | Grounded generation |
| **Auth** | Firebase Auth / Cloud IAP | Forest Service SSO integration |

### Document Corpus

| Source | Format | Est. Size | Chunking Strategy |
|--------|--------|-----------|-------------------|
| Forest Service Manual (FSM) | HTML/PDF | ~5,000 pages | By numbered section (e.g., FSM 2520.3) |
| Forest Service Handbook (FSH) | HTML/PDF | ~5,000 pages | By chapter and exhibit |
| NEPA Regulations (40 CFR) | HTML | ~500 pages | By section |
| Forest Planning Rule (36 CFR 219) | HTML | ~100 pages | By section |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/query` | POST | Submit natural language query |
| `/api/v1/analyze` | POST | Upload document for compliance analysis |
| `/api/v1/sources` | GET | List indexed source documents |
| `/api/v1/history` | GET | Retrieve user query history |

---

## Future Vision

Beyond Phase 1, the NEPA Advisor could evolve to include:

### Advanced Capabilities
- **Complete Corpus:** Full FSM/FSH coverage (all 10,000+ pages), including region-specific supplements and forest plan amendments
- **PALS Integration:** Direct connection to USFS Planning, Appeals, and Litigation System for real-time case law and precedent
- **Real-Time Updates:** Automated syncing with USFS Directives System to reflect regulatory changes
- **Document Editing Suggestions:** In-line compliance suggestions as planners draft EAs/EIS documents
- **Multi-Document Analysis:** Upload entire EAs for comprehensive gap detection and citation verification
- **Appeals History:** Integration with litigation and appeals databases to flag high-risk language
- **Regional Customization:** Automatic application of region-specific supplements and forest plan direction
- **Automated Drafting:** Generate first-draft EA sections from project parameters

### Enterprise Integration
- Integration with NEPA project tracking systems (e.g., PALS, FACTS)
- SharePoint/eLibrary deep linking for one-click source access
- Single sign-on via Forest Service SSO (eAuth)
- Mobile interface for field review and consultation

### Advanced AI Features
- Multi-turn conversational context retention
- Proactive compliance alerts based on project monitoring
- Scenario analysis ("What if we expand the project boundary?")
- Cumulative effects synthesis across multiple projects

---

## References

- [Vertex AI Search Documentation](https://cloud.google.com/vertex-ai/docs/search/overview)
- [Production-Ready RAG Architecture](https://cloud.google.com/blog/topics/developers-practitioners/production-ready-rag-systems-google-cloud)
- [Building Grounded AI with Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/build-grounded-and-responsible-ai-with-vertex-ai)
- [Forest Service Directives System](https://www.fs.usda.gov/about-agency/regulations-policies)
- [Cruising Assistant Spec](./CRUISING-ASSISTANT-SPEC.md) (Template Reference)
- [Data Simulation Strategy](../DATA-SIMULATION-STRATEGY.md)

---

## AgentBriefingEvent Strategy

The NEPA Advisor is the **compliance guardian**. It provides regulatory citations for all project activities, identifies documentation requirements triggered by other agents, and validates compliance before action execution.

### Event Trigger Conditions

| Condition | Event Type | Severity | UI Target |
|-----------|------------|----------|-----------|
| ESA species detected in project area | `alert` | `critical` | `modal_interrupt` |
| Project exceeds CE threshold | `action_required` | `warning` | `rail_pulse` |
| Compliance question answered | `insight` | `info` | `panel_inject` |
| Document gap analysis complete | `insight` | `info` | `panel_inject` |
| Low retrieval confidence (<75%) | `alert` | `warning` | `panel_inject` |
| EA section draft generated | `status_update` | `info` | `panel_inject` |
| Emergency closure authority confirmed | `insight` | `info` | `panel_inject` |

### Cross-Agent Handoff Patterns

The NEPA Advisor primarily **receives** handoffs from other agents. It rarely initiates them:

| Trigger Condition | Target Agent | Handoff Description |
|-------------------|--------------|---------------------|
| Need project boundary clarification | Burn Analyst / Cruising Assistant | Request refined spatial data |
| Cultural resource survey needed | Trail Assessor | NHPA Section 106 survey |
| Wetland delineation required | Burn Analyst | Hydrology analysis |

### Confidence Scoring Formula

```
confidence = (retrieval_relevance * 0.40) + (citation_verification * 0.30) +
             (regulatory_currency * 0.20) + (query_specificity * 0.10)
```

| Factor | Weight | Measurement |
|--------|--------|-------------|
| RAG retrieval relevance | 40% | Semantic similarity score of retrieved chunks |
| Citation verification | 30% | All citations link to valid FSM/FSH/CFR sections |
| Regulatory currency | 20% | Using current (2024) regulations = 1.0 |
| Query specificity | 10% | Specific project vs. general inquiry |

### JSON Example: ESA Species Detection (Critical)

```json
{
  "schema_version": "1.0.0",
  "event_id": "nepa-evt-001",
  "parent_event_id": "cruise-evt-001",
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T12:00:00Z",
  "type": "alert",
  "source_agent": "nepa_advisor",
  "severity": "critical",
  "ui_binding": {
    "target": "modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-122.10, 43.68], [-122.05, 43.68], [-122.05, 43.72], [-122.10, 43.72], [-122.10, 43.68]]]
      },
      "properties": { "label": "NSO Critical Habitat - Consultation Required" }
    }
  },
  "content": {
    "summary": "CRITICAL: Proposed salvage area overlaps Northern Spotted Owl Critical Habitat. ESA Section 7 consultation required.",
    "detail": "Spatial analysis indicates the proposed Cedar Creek salvage sale (Units 47, 52, 61) overlaps designated Northern Spotted Owl Critical Habitat Unit OR-44. Per ESA Section 7 and FSM 2670.31, formal consultation with USFWS is required. Estimated timeline: 90-135 days.",
    "suggested_actions": [
      {
        "action_id": "nepa-act-001",
        "label": "Initiate Section 7 Consultation",
        "target_agent": "nepa_advisor",
        "description": "Generate Biological Assessment template for USFWS",
        "rationale": "Required per 50 CFR 402.14 for federal actions affecting listed species"
      },
      {
        "action_id": "nepa-act-002",
        "label": "Modify Project Boundary",
        "target_agent": "recovery_coordinator",
        "description": "Evaluate excluding Critical Habitat overlap from salvage area",
        "rationale": "May reduce consultation scope and timeline"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.97,
    "citations": [
      {
        "source_type": "USFWS-CriticalHabitat",
        "id": "NSO-CH-OR-44",
        "uri": "https://ecos.fws.gov/ecp/species/1123",
        "excerpt": "Critical Habitat Unit OR-44: 12,340 acres, designated 2012"
      },
      {
        "source_type": "FSM",
        "id": "FSM-2670.31",
        "uri": "https://www.fs.usda.gov/directives/fsm/2670/2670.31",
        "excerpt": "Section 7 consultation required for actions potentially affecting listed species"
      },
      {
        "source_type": "CFR",
        "id": "50-CFR-402.14",
        "uri": "https://www.ecfr.gov/current/title-50/chapter-IV/subchapter-A/part-402/subpart-B/section-402.14",
        "excerpt": "Formal consultation procedures for federal actions"
      }
    ],
    "reasoning_chain": [
      "1. Received salvage sale project boundary from Cruising Assistant",
      "2. Performed spatial intersection with Critical Habitat layer",
      "3. Identified 8,200-acre overlap with NSO Unit OR-44",
      "4. Cross-referenced FSM 2670.31: consultation required",
      "5. Retrieved 50 CFR 402.14: formal consultation procedures",
      "6. Estimated timeline based on USFWS regional office workload",
      "7. Concluded: Section 7 consultation REQUIRED before project"
    ]
  }
}
```

### JSON Example: CE Applicability Confirmed

```json
{
  "schema_version": "1.0.0",
  "event_id": "nepa-evt-002",
  "parent_event_id": "trail-evt-003",
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T17:00:00Z",
  "type": "insight",
  "source_agent": "nepa_advisor",
  "severity": "info",
  "ui_binding": {
    "target": "panel_inject",
    "geo_reference": null
  },
  "content": {
    "summary": "Trail repair project ($34,500) qualifies for Categorical Exclusion under 36 CFR 220.6(e)(6).",
    "detail": "Analysis indicates the Waldo Lake Trail repair project qualifies for CE under 36 CFR 220.6(e)(6): 'Repair and maintenance of recreation sites and facilities.' The project is <1 mile and no extraordinary circumstances apply.",
    "suggested_actions": [
      {
        "action_id": "nepa-act-003",
        "label": "Generate CE Documentation",
        "target_agent": "nepa_advisor",
        "description": "Create CE decision memo for District Ranger signature",
        "rationale": "Standard documentation for CE projects per FSH 1909.15"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.92,
    "citations": [
      {
        "source_type": "CFR",
        "id": "36-CFR-220.6(e)(6)",
        "uri": "https://www.ecfr.gov/current/title-36/chapter-II/part-220/section-220.6",
        "excerpt": "Category (e)(6): Repair and maintenance of recreation sites and facilities"
      },
      {
        "source_type": "FSH",
        "id": "FSH-1909.15-31.2",
        "uri": "https://www.fs.usda.gov/directives/fsh/1909.15/31.2",
        "excerpt": "CE documentation requirements and extraordinary circumstances"
      }
    ],
    "reasoning_chain": [
      "1. Received trail repair project details from Trail Assessor",
      "2. Project scope: 3.2 miles assessed, $34,500 repair estimate",
      "3. Matched to CE category 36 CFR 220.6(e)(6)",
      "4. Checked extraordinary circumstances: none apply",
      "5. Verified no Critical Habitat, cultural resources, or wetlands",
      "6. Concluded: CE applicable, decision memo required"
    ]
  }
}
```

### JSON Example: EA Required (Project Exceeds CE Threshold)

```json
{
  "schema_version": "1.0.0",
  "event_id": "nepa-evt-003",
  "parent_event_id": "cruise-evt-001",
  "correlation_id": "cedar-creek-recovery-2024-001",
  "timestamp": "2024-12-20T13:30:00Z",
  "type": "action_required",
  "source_agent": "nepa_advisor",
  "severity": "warning",
  "ui_binding": {
    "target": "rail_pulse",
    "geo_reference": null
  },
  "content": {
    "summary": "Cedar Creek Salvage Sale (420 acres) exceeds CE threshold. Environmental Assessment required.",
    "detail": "The proposed salvage sale encompasses 420 acres across 8 units, exceeding the 250-acre CE threshold for timber harvest (36 CFR 220.6(e)(13)). An EA is required. Estimated timeline: 4-6 months preparation, 30 days comment, 2-3 months decision.",
    "suggested_actions": [
      {
        "action_id": "nepa-act-004",
        "label": "Initiate EA Process",
        "target_agent": "nepa_advisor",
        "description": "Generate EA outline with Purpose and Need section",
        "rationale": "EA preparation per FSH 1909.15, Chapter 40"
      },
      {
        "action_id": "nepa-act-005",
        "label": "Evaluate Project Phasing",
        "target_agent": "recovery_coordinator",
        "description": "Consider phasing to stay within CE thresholds",
        "rationale": "Phased approach may accelerate initial harvest"
      }
    ]
  },
  "proof_layer": {
    "confidence": 0.95,
    "citations": [
      {
        "source_type": "CFR",
        "id": "36-CFR-220.6(e)(13)",
        "uri": "https://www.ecfr.gov/current/title-36/chapter-II/part-220/section-220.6",
        "excerpt": "Salvage of dead/dying trees not exceeding 250 acres"
      },
      {
        "source_type": "FSH",
        "id": "FSH-1909.15-Chapter-40",
        "uri": "https://www.fs.usda.gov/directives/fsh/1909.15/40",
        "excerpt": "Environmental Assessment preparation procedures"
      }
    ],
    "reasoning_chain": [
      "1. Received salvage sale project boundary (420 acres)",
      "2. Checked against CE threshold: 250 acres (36 CFR 220.6(e)(13))",
      "3. Project exceeds threshold by 170 acres",
      "4. EA required per FSH 1909.15, Chapter 40",
      "5. Estimated timeline based on regional averages"
    ]
  }
}
```

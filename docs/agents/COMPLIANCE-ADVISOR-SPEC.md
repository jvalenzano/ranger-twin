# NEPA Advisor - Agent Specification

> *Formerly "PolicyPilot" — see [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for naming rationale*

**Status:** 🔵 Planning
**Priority:** 3 (Tertiary)
**Developer:** TBD
**Sprint Target:** 6 weeks

---

## The "Wow" Pitch

> A NEPA planner pastes a draft Environmental Assessment into the NEPA Advisor and asks, "Does this adequately address watershed protection requirements?" Within 30 seconds, the AI returns a compliance assessment with direct citations to FSM 2520 and FSH 2509.18—complete with paragraph references and links. What used to require three weeks of manual cross-referencing now happens during a coffee break.

---

## Core Purpose

The NEPA Advisor is a **regulatory compliance assistant** that uses Retrieval-Augmented Generation (RAG) to help Forest Service staff verify that planning documents comply with the Forest Service Manual (FSM), Forest Service Handbook (FSH), and NEPA requirements. It eliminates the "cite-checking bottleneck" by providing instant, grounded answers with verifiable citations.

**Problem Solved:** Environmental planning documents take 2-4 years to complete, with a significant portion of that time spent manually cross-referencing regulations. Staff turnover means institutional knowledge of the 10,000+ page regulatory corpus is constantly being lost.

**Value Proposition:** Make regulatory expertise instantly accessible to every planner, turning "Who knows what FSM says about this?" into a 30-second query.

---

## Key Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Natural Language Query** | Ask questions like "What are the timber sale requirements for spotted owl habitat?" | P0 (Core) |
| 2 | **Grounded Citations** | Every response includes specific document references (FSM chapter, section, paragraph) | P0 (Core) |
| 3 | **Document Upload Analysis** | Upload draft EAs/EIS documents for compliance gap analysis | P0 (Core) |
| 4 | **Confidence Indicators** | Visual display of retrieval confidence and source relevance | P1 (Important) |
| 5 | **Citation Deep Links** | One-click navigation to source documents in SharePoint/eLibrary | P1 (Important) |
| 6 | **Query History** | Searchable log of previous queries and responses | P2 (Nice-to-Have) |

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

## Scope Constraints

### In Scope (MVP)
- ✅ FSM and FSH full corpus (all titles)
- ✅ NEPA regulations (40 CFR 1500-1508)
- ✅ Natural language query interface
- ✅ Citation-backed responses with confidence scores
- ✅ Basic document upload for analysis
- ✅ Web-based interface (no mobile)

### Out of Scope (Future)
- ❌ Real-time document editing suggestions
- ❌ Integration with NEPA project tracking systems
- ❌ Region-specific supplements (only national-level)
- ❌ Appeals and litigation history
- ❌ Automated document drafting

---

## 6-Week Development Plan

| Week | Focus | Key Deliverables | Success Criteria |
|------|-------|------------------|------------------|
| **1** | Corpus Prep | FSM/FSH collected, cleaned, chunked | Documents indexed in Vertex AI Search |
| **2** | RAG Pipeline | Basic query → retrieval → response | End-to-end flow returning grounded answers |
| **3** | Citation System | Source attribution, confidence scores | Every response has verifiable citations |
| **4** | Web Interface | Clean query UI, citation display | Non-technical user can query successfully |
| **5** | Document Analysis | Upload + compliance gap detection | Can analyze a draft EA for gaps |
| **6** | Demo Prep | Polish UI, prepare demo scenarios | 10-minute demo with real queries |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Corpus acquisition difficulty** | Medium | High | Start early; identify backup sources | Lead |
| **Chunking destroys context** | Medium | High | Custom chunking by FSM section numbers | Dev |
| **Hallucinated citations** | Low | Critical | Use Vertex AI grounding; validate citations | Dev |
| **Response latency** | Medium | Medium | Async UI; cache common queries | Dev |
| **Ambiguous queries** | High | Low | Prompt user for clarification; show confidence | Dev |

---

## Data Requirements

### Document Corpus Sources

| Source | URL/Location | Format | Status |
|--------|--------------|--------|--------|
| FSM (Directives) | fs.usda.gov/directives | HTML/PDF | 🔵 Available |
| FSH (Directives) | fs.usda.gov/directives | HTML/PDF | 🔵 Available |
| 40 CFR 1500-1508 | ecfr.gov | HTML | 🔵 Available |
| 36 CFR 219 | ecfr.gov | HTML | 🔵 Available |

### Chunking Strategy

**Approach:** Semantic chunking by regulatory section (not arbitrary character limits)

**Rationale:** FSM/FSH have clear hierarchical structure (Title → Chapter → Section → Paragraph). Preserving this structure enables precise citations.

**Example:**
- FSM 2520.3a → One chunk
- FSM 2520.3b → One chunk
- Maintains "FSM 2520.3" as citable reference

---

## Demo Script Outline

**Duration:** 8-10 minutes

1. **Setup** (1 min): Show NEPA Advisor interface, explain regulatory challenge
2. **The Problem** (1 min): "Checking a single EA against FSM takes 3 weeks..."
3. **Simple Query** (2 min): "What are the consultation requirements for threatened species?"
4. **Citation Deep Dive** (1 min): Click through to source FSM section
5. **Document Analysis** (2 min): Upload draft EA paragraph, show gap detection
6. **Procurement Hook** (1 min): "Imagine this for your regional supplement..."
7. **Q&A** (2 min): Address questions

**Key Demo Queries:**
- "What must a categorical exclusion document contain?"
- "What are the appeal rights for a timber sale decision?"
- "Does FSM require cumulative effects analysis for grazing permits?"

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Citation accuracy | 100% verifiable | Manual spot-check of responses |
| Response latency | <5 seconds | Instrumentation |
| Retrieval relevance | >90% relevant chunks | User feedback / eval set |
| Demo completion | Smooth 10-min flow | Demo day |

---

## Open Questions

- [ ] What's the best source for FSM/FSH corpus (HTML vs PDF)?
- [ ] Are there existing chunk boundaries we should respect?
- [ ] Should we include region-specific supplements?
- [ ] What authentication method will the demo use?

---

## References

- [Vertex AI Search Documentation](https://cloud.google.com/vertex-ai/docs/search/overview)
- [Production-Ready RAG Architecture](https://cloud.google.com/blog/topics/developers-practitioners/production-ready-rag-systems-google-cloud)
- [Building Grounded AI with Vertex AI](https://cloud.google.com/blog/products/ai-machine-learning/build-grounded-and-responsible-ai-with-vertex-ai)
- [Forest Service Directives System](https://www.fs.usda.gov/about-agency/regulations-policies)
- [Cruising Assistant Spec](./TIMBER-CRUISER-SPEC.md) (Template Reference)

# ADR-003: Gemini 3 Flash and File Search Tool for RAG

**Status:** ⚠️ SUPERSEDED by [ADR-010](../adr/ADR-010-vertex-rag-migration.md)
**Date:** 2025-12-22
**Decision Makers:** TechTrend Federal - Digital Twin Team
**Category:** AI/ML Architecture (Technical)

> [!WARNING]
> **This ADR is archived and superseded.** The File Search API approach was replaced by Vertex AI RAG Engine in ADR-010. The model has also been updated to Gemini 2.0 Flash (not 3 Flash). This document is retained for historical reference only.

---

## Context

RANGER uses Google's Gemini models for all agent reasoning and synthesis. Two recent developments require architectural decisions:

1. **Gemini 3 Flash released (Dec 17, 2025)** — Google's new frontier model offers Pro-grade reasoning at Flash-level speed, replacing 2.5 Flash as the default.

2. **Gemini File Search Tool released (Nov 6, 2025)** — A fully managed RAG system built directly into the Gemini API, eliminating the need for self-managed vector databases.

Additionally, the NEPA Advisor agent requires access to Forest Service Manual (FSM) and Forest Service Handbook (FSH) regulatory content. We needed to determine the RAG implementation strategy.

### Requirements

| Requirement | Priority | Rationale |
|-------------|----------|-----------|
| FedRAMP High compliance | Must have | Federal deployment requirement |
| Built-in citations | Must have | Regulatory compliance requires source attribution |
| PDF support | Must have | FSM/FSH documents are published as PDFs |
| Minimal infrastructure | Should have | Phase 1 focus on agent logic, not infra |
| Cost-effective | Should have | Startup budget constraints |
| Production-ready | Should have | Same implementation Phase 1 → Phase 2 |

---

## Decision

### 1. Migrate to Gemini 3 Flash

We will use **Gemini 3 Flash** (`gemini-3-flash`) as the primary model for all RANGER agents, replacing Gemini 2.5 Flash.

### 2. Use Gemini File Search Tool for NEPA RAG

We will use the **Gemini File Search Tool** for NEPA Advisor's regulatory knowledge base, replacing the originally planned pgvector/LangChain approach.

### 3. Pure Google ADK (No Hybrid Frameworks)

We confirm the pure ADK approach documented in `AGENTIC-ARCHITECTURE.md`. LangChain, SmolAgents, and other frameworks are explicitly rejected.

---

## Rationale

### Why Gemini 3 Flash

| Factor | Gemini 2.5 Flash | Gemini 3 Flash | Impact |
|--------|------------------|----------------|--------|
| **Performance** | Baseline | Outperforms 2.5 Pro on most benchmarks | Better agent reasoning |
| **Speed** | Baseline | 3x faster than 2.5 Pro | Lower latency UX |
| **Cost** | $0.075/1M input | $0.50/1M input | Higher but justified by quality |
| **Token efficiency** | Baseline | 30% fewer tokens for same tasks | Offsets price increase |
| **SWE-bench** | ~65% | 78% (better than 3 Pro) | Superior coding/agentic tasks |
| **Sunset status** | Being deprecated | Current default | Future-proof |

**Key benchmarks (Gemini 3 Flash):**
- GPQA Diamond: 90.4% (PhD-level reasoning)
- MMMU Pro: 81.2% (multimodal understanding)
- SWE-bench Verified: 78% (agentic coding)
- Humanity's Last Exam: 33.7% (frontier reasoning)

### Why Gemini File Search Tool

| Factor | pgvector + LangChain | Gemini File Search Tool |
|--------|---------------------|-------------------------|
| **Infrastructure** | Self-managed PostgreSQL + pgvector extension | Fully managed by Google |
| **Chunking** | Manual implementation | Automatic, optimized |
| **Embeddings** | Separate embedding calls | Automatic (gemini-embedding-001) |
| **Citations** | Manual extraction | Built-in grounding metadata |
| **PDF support** | Requires preprocessing | Native support |
| **Cost model** | Compute + storage + queries | $0.15/1M tokens (indexing only), storage FREE, queries FREE |
| **FedRAMP** | Requires Cloud SQL setup | Inherits Vertex AI authorization |

**File Search Tool capabilities:**
- Supports: PDF, DOCX, TXT, JSON, common code file types
- Automatic chunking with optimal strategies
- Powered by gemini-embedding-001 (state-of-art)
- Built-in citations with source attribution
- Works within existing `generateContent` API

### Why Pure ADK (Not Hybrid)

This decision was previously documented but is reaffirmed here:

| Consideration | Pure ADK | Hybrid (ADK + LangChain) |
|---------------|----------|--------------------------|
| **Latency** | Sub-second tool calls | +2-4 seconds for chain setup |
| **Debugging** | Single framework, structured events | Two frameworks, disconnected traces |
| **FedRAMP** | Vertex AI authorized | LangChain adds unvetted dependencies |
| **Complexity** | One testing strategy | Two observability stacks |
| **RAG** | File Search Tool (native) | LangChain RAG (redundant) |

With the File Search Tool, LangChain's primary value proposition (RAG orchestration) is eliminated. There is no remaining justification for hybrid frameworks.

---

## Implementation

### Gemini 3 Flash Integration

Update all agent configurations to use the new model:

```python
# Before
model = 'gemini-2.5-flash'

# After
model = 'gemini-3-flash'
```

**Files to update:**
- `services/agents/burn-analyst/config.py`
- `services/agents/trail-assessor/config.py`
- `services/agents/cruising-assistant/config.py`
- `services/agents/nepa-advisor/config.py`
- `services/agents/recovery-coordinator/config.py`
- `packages/agent-common/gemini_client.py`

### File Search Tool for NEPA Advisor

#### Directory Structure

```
services/
  agents/
    nepa-advisor/
      data/
        fsm/                      # Forest Service Manual PDFs
          FSM-1950.pdf            # Environmental Policy and Procedures
          FSM-2400.pdf            # Timber Management
        fsh/                      # Forest Service Handbook PDFs
          FSH-1909.15.pdf         # NEPA Handbook
          FSH-2409.18.pdf         # Timber Sale Preparation
        cfr/                      # Code of Federal Regulations
          36-CFR-220.pdf          # USFS NEPA Procedures
      nepa_knowledge_base.py      # File Search store management
      tools.py                    # search_regulations(), identify_nepa_pathway()
```

#### Knowledge Base Setup (One-Time)

```python
# nepa_knowledge_base.py
from google import genai
from google.genai import types
import time

client = genai.Client()

def create_nepa_knowledge_base() -> str:
    """
    Create and populate the NEPA File Search store.
    Run once during setup; store ID is persisted for runtime use.

    Returns:
        str: The store name/ID for use in agent tools
    """
    # Create the store
    store = client.file_search_stores.create(
        display_name="RANGER-NEPA-FSM-FSH-Knowledge-Base"
    )

    # Documents to index
    documents = [
        # Forest Service Manual
        "data/fsm/FSM-1950.pdf",   # Environmental Policy
        "data/fsm/FSM-2400.pdf",   # Timber Management
        # Forest Service Handbook
        "data/fsh/FSH-1909.15.pdf", # NEPA Handbook
        "data/fsh/FSH-2409.18.pdf", # Timber Sale Preparation
        # Code of Federal Regulations
        "data/cfr/36-CFR-220.pdf",  # USFS NEPA Procedures
    ]

    # Upload and index each document
    for doc_path in documents:
        print(f"Indexing {doc_path}...")
        upload_op = client.file_search_stores.upload_to_file_search_store(
            file_search_store_name=store.name,
            file=doc_path
        )

        # Wait for indexing to complete
        while not upload_op.done:
            time.sleep(5)
            upload_op = client.operations.get(upload_op)

        print(f"  Indexed: {doc_path}")

    print(f"\nStore created: {store.name}")
    return store.name
```

#### Runtime Tool Implementation

```python
# tools.py
from google import genai
from google.genai import types
from packages.twin_core.models import ToolResult

client = genai.Client()

# Store ID from setup (persisted in config or environment)
NEPA_STORE_NAME = "stores/ranger-nepa-fsm-fsh-xxxxx"

def search_regulations(query: str) -> ToolResult:
    """
    Search FSM/FSH/CFR for relevant regulatory guidance.

    Uses Gemini File Search Tool with indexed USFS documents.
    Implementation is production-ready from Phase 1.

    Args:
        query: Natural language query about NEPA requirements

    Returns:
        ToolResult with regulatory guidance and citations
    """
    response = client.models.generate_content(
        model='gemini-3-flash',
        contents=f"""Based on the Forest Service Manual and Handbook,
        answer this regulatory question: {query}

        Include specific section numbers and direct quotes where applicable.""",
        config=types.GenerateContentConfig(
            tools=[types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[NEPA_STORE_NAME]
                )
            )]
        )
    )

    # Extract grounding metadata for citations
    citations = []
    grounding = response.candidates[0].grounding_metadata
    if grounding:
        for chunk in grounding.grounding_chunks:
            citations.append({
                "source_type": "FSM/FSH",
                "title": chunk.retrieved_context.title,
                "uri": chunk.retrieved_context.uri,
                "excerpt": chunk.retrieved_context.text[:500]
            })

    return ToolResult(
        data=response.text,
        confidence=0.92,  # High confidence - authoritative source
        source="USFS Forest Service Manual/Handbook",
        citations=citations,
        reasoning="Retrieved from indexed FSM/FSH regulatory documents via Gemini File Search"
    )


def identify_nepa_pathway(action_type: str, project_context: dict) -> ToolResult:
    """
    Identify the appropriate NEPA pathway (CE, EA, or EIS) for a proposed action.

    Args:
        action_type: Type of action (e.g., "timber_salvage", "trail_repair")
        project_context: Dict with project details (acres, location, species, etc.)

    Returns:
        ToolResult with recommended NEPA pathway and requirements
    """
    query = f"""
    For a {action_type} project with the following context:
    {project_context}

    1. What is the appropriate NEPA pathway (Categorical Exclusion, EA, or EIS)?
    2. If CE, which specific category under 36 CFR 220.6 applies?
    3. What documentation is required?
    4. Are there any extraordinary circumstances that might require additional review?

    Cite specific FSM/FSH sections and 36 CFR 220 provisions.
    """

    response = client.models.generate_content(
        model='gemini-3-flash',
        contents=query,
        config=types.GenerateContentConfig(
            tools=[types.Tool(
                file_search=types.FileSearch(
                    file_search_store_names=[NEPA_STORE_NAME]
                )
            )]
        )
    )

    # Extract citations
    citations = []
    grounding = response.candidates[0].grounding_metadata
    if grounding:
        for chunk in grounding.grounding_chunks:
            citations.append({
                "source_type": "FSM/FSH/CFR",
                "title": chunk.retrieved_context.title,
                "uri": chunk.retrieved_context.uri,
                "excerpt": chunk.retrieved_context.text[:500]
            })

    return ToolResult(
        data=response.text,
        confidence=0.88,  # Slightly lower - involves interpretation
        source="USFS NEPA Procedures (36 CFR 220)",
        citations=citations,
        reasoning="NEPA pathway analysis based on FSM 1950, FSH 1909.15, and 36 CFR 220"
    )
```

### Required FSM/FSH Documents

| Document | Source | Content | Estimated Size |
|----------|--------|---------|----------------|
| FSM 1950 | [fs.usda.gov/im/directives](https://www.fs.usda.gov/im/directives/) | Environmental Policy and Procedures | ~50 pages |
| FSM 2400 | [fs.usda.gov/im/directives](https://www.fs.usda.gov/im/directives/) | Timber Management | ~100 pages |
| FSH 1909.15 | [fs.usda.gov/im/directives](https://www.fs.usda.gov/im/directives/) | NEPA Handbook | ~200 pages |
| FSH 2409.18 | [fs.usda.gov/im/directives](https://www.fs.usda.gov/im/directives/) | Timber Sale Preparation | ~150 pages |
| 36 CFR 220 | [ecfr.gov](https://www.ecfr.gov/) | USFS NEPA Procedures | ~30 pages |

**Estimated indexing cost:** ~500 pages × ~500 tokens/page = ~250K tokens × $0.15/1M = **~$0.04 one-time**

---

## Consequences

### Positive

1. **Production-ready from Phase 1** — Unlike other agents that swap fixtures for real APIs, NEPA Advisor uses production RAG from day one
2. **Built-in citations** — Automatic source attribution satisfies regulatory compliance requirements
3. **Zero infrastructure overhead** — No vector database to manage, monitor, or scale
4. **Cost-effective** — ~$0.04 one-time indexing cost; queries are free
5. **Better agent performance** — Gemini 3 Flash's improved reasoning benefits all agents
6. **Future-proof** — On the current model track, not a deprecated branch

### Negative

1. **Higher per-token cost** — Gemini 3 Flash is more expensive than 2.5 Flash ($0.50 vs $0.075/1M input)
2. **Google dependency** — File Search Tool is Gemini-specific; no easy migration path
3. **New API surface** — Team must learn File Search Tool API patterns
4. **Document maintenance** — Must re-index when FSM/FSH documents are updated (rare)

### Mitigations

| Risk | Mitigation |
|------|------------|
| Higher token cost | 30% token efficiency gain offsets price; better reasoning reduces retries |
| Google dependency | FedRAMP requirement already mandates GCP; this aligns with existing constraint |
| API learning curve | Well-documented; simple integration pattern; team already familiar with Gemini |
| Document updates | FSM/FSH updates are rare (~annually); re-indexing is cheap ($0.04) |

---

## Alternatives Considered

### RAG Alternatives

| Approach | Verdict | Rationale |
|----------|---------|-----------|
| **pgvector + LangChain** | Rejected | Self-managed infrastructure; no built-in citations; adds LangChain dependency |
| **ChromaDB (local)** | Rejected | Adds dependency; manual citation extraction; not production-grade |
| **Vertex AI Search** | Rejected | More complex setup; higher cost; overkill for ~500 pages |
| **Context stuffing** | Rejected | Burns tokens; implicit retrieval less precise; no citations |
| **Fixture JSON** | Rejected | Not real retrieval; limited to pre-selected content; no citations |
| **Gemini File Search Tool** | **Accepted** | Fully managed; built-in citations; PDF support; cost-effective |

### Model Alternatives

| Model | Verdict | Rationale |
|-------|---------|-----------|
| Gemini 2.5 Flash | Rejected | Being deprecated; inferior performance |
| Gemini 2.5 Pro | Rejected | Higher cost; slower; being deprecated |
| Gemini 3 Pro | Rejected | Overkill for most tasks; 3 Flash matches/exceeds on agentic benchmarks |
| GPT-4o | Rejected | No FedRAMP High authorization via Azure Gov for multimodal |
| Claude 3 | Rejected | No FedRAMP High path; no managed RAG equivalent |
| **Gemini 3 Flash** | **Accepted** | Best balance of speed, cost, and reasoning; FedRAMP High via Vertex AI |

---

## References

- [Gemini 3 Flash Announcement](https://blog.google/products/gemini/gemini-3-flash/) — Dec 17, 2025
- [File Search Tool Announcement](https://blog.google/technology/developers/file-search-gemini-api/) — Nov 6, 2025
- [File Search Tool Documentation](https://ai.google.dev/gemini-api/docs/file-search)
- [AGENTIC-ARCHITECTURE.md](../architecture/AGENTIC-ARCHITECTURE.md) — Pure ADK decision
- [FIXTURE-DATA-FORMATS.md](../architecture/FIXTURE-DATA-FORMATS.md) — Data schemas
- [ADR-001: Technology Stack](./ADR-001-tech-stack.md) — Overall stack decisions
- [USFS Directives](https://www.fs.usda.gov/im/directives/) — FSM/FSH source documents

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-22 | Accepted | Research confirmed Gemini 3 Flash and File Search Tool as optimal choices for RANGER's requirements |

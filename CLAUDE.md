# CLAUDE.md

> **Note:** For token-optimized AI agent context, see [`.context/CLAUDE.md`](.context/CLAUDE.md) (~1000 tokens, quick reference).

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Directive
RANGER is an orchestration layer for post-fire forest recovery. **Phase 1 uses simulated data** to prove multi-agent coordination and reasoning transparency.

- **Scope:** Multi-agent orchestration, reasoning visibility, legacy system exports (TRACS, FSVeg)
- **Out of Scope:** Real satellite imagery, CV models, real-time data ingestion
- **Authoritative Document:** `docs/DATA-SIMULATION-STRATEGY.md` defines what is simulated vs. real
- **Naming Convention:** Use context-dependent names: Sidebar (Phases: IMPACT), Panel (Roles: IMPACT ANALYST), Tour (Friendly: Burn Analyst).

## Data Terminology

- **Fixtures** (`data/fixtures/cedar-creek/`): Hand-crafted JSON files simulating Phase 1 upstream data (ACTIVE)
- **Synthetic** (`data/synthetic/`): Reserved for future AI-generated test data (empty in Phase 1)
- **Layers** (`data/layers/`): Reserved for real GeoJSON in Phase 2+ (empty in Phase 1)
- **Mock services** (code only): Frontend service layer stubs (e.g., `mockBriefingService.ts`)

**Phase 1 reality:** Only `fixtures/` contains active data. Other directories are placeholders.

**Skills-First Architecture (Primary):**
- **Orchestration:** Google ADK + Gemini Runtime.
- **Skills Library:** Domain expertise packaged in `skills/`.
- **Agents:** Specialized agents in `agents/` using shared skills.
- **Data:** MCP servers in `mcp/` (NIFC, Fixtures, etc.).

**Legacy/Reference Architecture:**
- **Frontend-Led Demo:** `src/services/aiBriefingService.ts` handles log in the browser.
- **Microservices:** Old FastAPI agent services in `services/agents/` (REFERENCE ONLY).

**Key Contracts:**
- `docs/specs/skill-format.md` - Skill structure and metadata
- `docs/specs/agent-interface.md` - Agent communication protocol
- `docs/architecture/AGENT-MESSAGING-PROTOCOL.md` - AgentBriefingEvent JSON schema
- `docs/architecture/BRIEFING-UX-SPEC.md` - UI rendering spec
- `docs/specs/SKILL-VERIFICATION-STANDARD.md` - Quality Gates (DoD, Evaluation 10)
- `docs/runbooks/ADK-OPERATIONS-RUNBOOK.md` - **CRITICAL:** ADK patterns & anti-patterns
- `docs/research/RANGER_doc_framework.md` - Document framework (31 docs, 4 corpora)
- `knowledge/manifest.yaml` - Knowledge base source of truth
- `knowledge/README.md` - Knowledge base usage guide

## Commands

```bash
# Frontend development
cd apps/command-console && npm run dev

# TypeScript validation
cd apps/command-console && npm run typecheck

# Linting
cd apps/command-console && npm run lint

# Agent development (Google ADK)
pip install google-adk
export GOOGLE_API_KEY=your_key_here
cd agents && adk run coordinator       # CLI mode
cd agents && adk web --port 8000       # Web UI mode

# Backend development (legacy)
cd services/api-gateway && uvicorn app.main:app --reload --port 8000

# Full stack (Docker)
docker-compose up -d

# Run tests
pytest agents/ -v                       # Agent + skill tests (606 tests)
pytest packages/ -v                     # Runtime package tests (43 tests)
pytest tests/integration/test_rag_integration.py -v  # RAG integration tests (20 tests)

# Knowledge base management
cd knowledge/scripts
python 1_download_documents.py         # Download documents (automated)
python 2_sync_to_gcs.py                # Sync to GCS bucket
python 3_create_corpora.py             # Create Vertex RAG corpora
python 4_import_documents.py           # Import docs to corpora
python 5_verify_corpora.py             # Health check all corpora
```

## Project Structure

```
apps/
  command-console/     # React + Vite + Tailwind (desktop UI)
agents/                # NEW: Skills-First agents (ADK)
  */data/              # Agent-specific data (configs gitignored)
  */rag_query.py       # RAG knowledge base tools (Burn/Cruising/Trail)
  nepa_advisor/file_search.py  # NEPA RAG (migrated from File Search)
skills/                # NEW: Domain expertise library
mcp/                   # NEW: Model Context Protocol servers
knowledge/             # NEW: Vertex AI RAG knowledge base
  manifest.yaml        # Document registry (31 docs, 4 corpora)
  local/               # Downloaded PDFs (gitignored)
  scripts/             # Document management automation
  templates/           # RAG tool templates
packages/
  skill-runtime/       # Skill loading/execution utilities
  twin-core/           # Shared Python models
  agent-common/        # Shared agent utilities
  types/               # TypeScript type definitions
  ui-components/       # Shared React components
services/
  agents/              # LEGACY: FastAPI agent services (for reference)
data/
  fixtures/            # Phase 1: Cedar Creek simulation data (ACTIVE)
tests/
  integration/         # Integration tests (includes RAG tests)
docs/
  specs/               # NEW: Technical specifications
  architecture/        # System design specs
  research/            # Document frameworks and research
```

## State Management

Frontend uses Zustand stores in `apps/command-console/src/stores/`:
- `chatStore` - Messages, agent responses, reasoning chains
- `briefingStore` - AgentBriefingEvent display
- `mapStore` - Camera, layers, terrain
- `lifecycleStore` - Workflow steps
- `analysisHistoryStore` - Site Analysis reports & persistence
- `preferencesStore` - User settings (tooltips, etc.)
- `missionStore` - National fire portfolio, filters, selected fire (v2 with phase migration)

## Code Style

- **Design aesthetic:** "Tactical Futurism" - dark mode, glassmorphism, high contrast
- **Component Style:** Functional React components with hooks. Lucid React icons.
- **Agent responses:** Must include confidence scores, citations, and reasoning chains (proof layer)

## Domain Model: Fire Phases

Fire lifecycle follows a **4-phase model** aligned with practitioner terminology:

| Phase | Abbrev | Color | Multiplier | Description |
|-------|--------|-------|------------|-------------|
| `active` | ACT | Red (#ef4444) | 2.0 | Fire burning - highest priority |
| `baer_assessment` | ASM | Amber (#f59e0b) | 1.75 | 7-day BAER window - time-critical |
| `baer_implementation` | IMP | Yellow (#eab308) | 1.25 | BAER treatments underway |
| `in_restoration` | RST | Green (#10b981) | 1.0 | Long-term recovery baseline |

**Key types in `src/types/mission.ts`:**
- `FirePhase` - Union of 4 phase literals
- `PHASE_DISPLAY` - Labels, abbreviations, colors
- `PHASE_MULTIPLIERS` - Triage score weights
- `calculateTriageScore()` - Severity × Size × Phase
- `getDeltaDirection()` - 24h escalation tracking

## Skills-First Agent Architecture (ADR-005)

RANGER uses a Skills-First Multi-Agent Architecture where domain expertise is
packaged as portable Skills that enhance Agents running on Google ADK.

### ADK Naming Requirements

**CRITICAL:** Google ADK requires directory names to be valid Python identifiers.
- Agent directories MUST use **underscores**, not hyphens: `cruising_assistant` ✓, `cruising-assistant` ✗
- Skill directories within agents can use hyphens (e.g., `skills/csv-insight/`)
- Agent `name` in `agent.py` should also use underscores: `name="cruising_assistant"`

This is enforced by Pydantic validation in the ADK App class.

### ADK Tool Parameter Types

**CRITICAL:** Gemini API rejects complex type hints in tool function parameters.

**Forbidden types** (cause `400 INVALID_ARGUMENT` errors):
- `list[dict]` - Use JSON string instead
- `dict` as parameter type - Use JSON string instead
- `list[CustomClass]` - Use JSON string instead

**Allowed types:**
- `str`, `int`, `float`, `bool` - Primitive types work
- `str | None` - Optional primitives work
- `list[str]`, `list[int]` - Simple lists work

**Pattern for complex data:**
```python
# ❌ WRONG - Will fail at runtime
def my_tool(items: list[dict] | None = None) -> dict:
    ...

# ✓ CORRECT - Use JSON string parameter
def my_tool(items_json: str = "[]") -> dict:
    """
    Args:
        items_json: JSON string of items. Example:
            '[{"name": "item1", "value": 42}]'
    """
    import json
    items = json.loads(items_json) if items_json else None
    ...
```

This limitation is in the Gemini API's function calling schema validation.

### Agent Roster (All Verified ✅ December 26, 2025)

| Agent | Role | Model | Skills |
|-------|------|-------|--------|
| **Coordinator** | Root orchestrator, delegation | gemini-2.0-flash | `portfolio-triage`, `delegation` |
| **Burn Analyst** | Fire severity, MTBS, soil burn | gemini-2.0-flash | `mtbs-classification`, `soil-burn-severity`, `boundary-mapping` |
| **Trail Assessor** | Infrastructure damage, closures | gemini-2.0-flash | `damage-classification`, `closure-decision`, `recreation-priority` |
| **Cruising Assistant** | Timber inventory, salvage | gemini-2.0-flash | `volume-estimation`, `salvage-assessment`, `cruise-methodology`, `csv-insight` |
| **NEPA Advisor** | Compliance, CE/EA/EIS pathways | gemini-2.5-flash | `pathway-decision`, `compliance-timeline`, `documentation`, `pdf-extraction` |

All agents located in `agents/<agent_name>/` with skills in `agents/<agent_name>/skills/`.

**GCP Development Environment:**
- Project ID: `ranger-twin-dev`
- Project Number: `1058891520442`
- Location: `europe-west3` (Vertex AI RAG), `us-central1` (ADK)
- Billing: Enabled

### Knowledge Base Infrastructure (Vertex AI RAG)

RANGER uses **Vertex AI RAG Engine** to provide domain-specific regulatory and technical knowledge to agents. Each agent has access to a specialized corpus of authoritative documents.

**Architecture:**
- **31 documents** across **4 domain-specific corpora** (16 Tier 1 Essential, 15 Tier 2 High Value)
- **Single GCS bucket**: `gs://ranger-knowledge-base/` with corpus subfolders
- **Embedding model**: `text-embedding-005`
- **Chunking**: 512 tokens per chunk, 100 token overlap
- **Answer generation**: Gemini 2.0 Flash synthesizes answers from retrieved contexts

#### Corpora and Agent Mapping

| Corpus | Agent | Display Name | Documents | GCS Path |
|--------|-------|--------------|-----------|----------|
| **nepa** | NEPA Advisor | ranger-nepa-regulations | 6 docs (3 T1, 3 T2) | `nepa/` |
| **burn_severity** | Burn Analyst | ranger-burn-severity | 11 docs (6 T1, 5 T2) | `burn_severity/` |
| **timber_salvage** | Cruising Assistant | ranger-timber-salvage | 7 docs (3 T1, 4 T2) | `timber_salvage/` |
| **trail_infrastructure** | Trail Assessor | ranger-trail-infrastructure | 7 docs (4 T1, 3 T2) | `trail_infrastructure/` |

#### RAG Tool Functions

Each agent has a RAG query function with **ADK-compatible signatures** (simple types only):

**NEPA Advisor** (agents/nepa_advisor/file_search.py):
```python
consult_mandatory_nepa_standards(
    topic: str,           # Regulatory query
    max_chunks: int = 5,  # Number of chunks to retrieve
    include_citations: bool = True
) -> dict  # Returns: query, answer, citations, chunks_retrieved, status
```

**Burn Analyst** (agents/burn_analyst/rag_query.py):
```python
query_burn_severity_knowledge(
    query: str,                # Burn severity query
    top_k: int = 5,           # Number of chunks
    include_answer: bool = True
) -> dict
```

**Cruising Assistant** (agents/cruising_assistant/rag_query.py):
```python
query_timber_salvage_knowledge(
    query: str,
    top_k: int = 5,
    include_answer: bool = True
) -> dict
```

**Trail Assessor** (agents/trail_assessor/rag_query.py):
```python
query_trail_infrastructure_knowledge(
    query: str,
    top_k: int = 5,
    include_answer: bool = True
) -> dict
```

**MIGRATION NOTE**: NEPA Advisor migrated from File Search API to Vertex RAG (December 2025). Function signature and return schema preserved for backward compatibility. Legacy `.file_search_store.json` kept for 1 release.

#### Knowledge Base Management

```bash
# Setup workflow (run once)
cd knowledge/scripts

# 1. Download documents (automated + manual flagging)
python 1_download_documents.py --tier 1
# Manually download flagged documents to knowledge/local/{corpus}/

# 2. Sync to GCS
python 2_sync_to_gcs.py

# 3. Create Vertex RAG corpora
python 3_create_corpora.py

# 4. Import documents to corpora
python 4_import_documents.py --tier 1
python 4_import_documents.py --tier 2

# 5. Verify corpus health
python 5_verify_corpora.py

# Maintenance commands
python 2_sync_to_gcs.py --corpus nepa --dry-run  # Preview sync
python 4_import_documents.py --corpus burn_severity  # Import single corpus
python 5_verify_corpora.py --corpus nepa --verbose  # Detailed health check
```

#### Testing RAG Integration

```bash
# Run all RAG integration tests (20 tests)
pytest tests/integration/test_rag_integration.py -v

# Test specific agent
pytest tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG -v
pytest tests/integration/test_rag_integration.py::TestBurnAnalystRAG -v

# Test NEPA migration
pytest tests/integration/test_rag_integration.py::TestNEPAAdvisorRAG::test_nepa_advisor_vertex_rag_migration -v

# Test cross-agent relevance
pytest tests/integration/test_rag_integration.py::TestRAGCrossAgent::test_relevance_scores -v
```

**Prerequisites for tests:**
- Corpora created and documents imported
- `GOOGLE_API_KEY` environment variable set
- All 4 corpora should show HEALTHY status in verification

#### Configuration Files

Each agent stores its corpus resource ID in `.vertex_rag_config.json` (gitignored):

```json
{
  "corpus_resource_id": "projects/ranger-twin-dev/locations/us-east4/ragCorpora/...",
  "created_at": "2025-01-15T10:30:00Z",
  "version": "1.0"
}
```

**Location**: `agents/{agent_name}/data/.vertex_rag_config.json`

**Note**: These files are auto-generated by `3_create_corpora.py` and excluded from version control.

#### Document Framework

Full document inventory and tier classifications available in:
- `docs/research/RANGER_doc_framework.md` - Practitioner-grounded document framework
- `knowledge/manifest.yaml` - Authoritative source of truth (31 documents)
- `knowledge/README.md` - Usage guide for maintainers

#### Troubleshooting

**Corpus not configured:**
```bash
# Error: FileNotFoundError: Vertex RAG corpus not configured
# Fix: Run corpus creation
python knowledge/scripts/3_create_corpora.py
```

**No contexts retrieved:**
```bash
# Error: Query returns no results
# Fix: Import documents
python knowledge/scripts/4_import_documents.py
# Verify: Check corpus health
python knowledge/scripts/5_verify_corpora.py
```

**Low relevance scores:**
```bash
# Check document count in GCS
gsutil ls gs://ranger-knowledge-base/nepa/

# Re-import corpus if needed
python knowledge/scripts/4_import_documents.py --corpus nepa
```

### Skills Library

**16 skills across 5 agents** (each skill has `skill.md`, `scripts/`, `resources/`, `tests/`):

```
agents/
├── coordinator/skills/
│   ├── portfolio-triage/      # Fire prioritization scoring
│   └── delegation/            # Query routing to specialists
├── burn_analyst/skills/
│   ├── mtbs-classification/   # MTBS severity classification
│   ├── soil-burn-severity/    # Soil burn analysis
│   └── boundary-mapping/      # Fire perimeter mapping
├── trail_assessor/skills/
│   ├── damage-classification/ # USFS Type I-IV damage
│   ├── closure-decision/      # Risk-based closure eval
│   └── recreation-priority/   # Usage-weighted prioritization
├── cruising_assistant/skills/
│   ├── volume-estimation/     # MBF/CCF timber volume
│   ├── salvage-assessment/    # Economic viability
│   ├── cruise-methodology/    # Sampling protocols
│   └── csv-insight/           # CSV data analysis
└── nepa_advisor/skills/
    ├── pathway-decision/      # CE/EA/EIS determination
    ├── compliance-timeline/   # Milestone scheduling
    ├── documentation/         # Checklist generation
    └── pdf-extraction/        # PDF document extraction

skills/                        # Shared/foundation skills (future)
├── foundation/
└── forest-service/
```

### Agent Directory Structure

Each agent follows this pattern (note: underscores required for ADK):
```
agent_name/              # MUST use underscores, not hyphens
├── agent.py             # ADK Agent definition (exports root_agent)
├── config.yaml          # Runtime configuration
├── __init__.py          # Package marker
├── .env.example         # Environment template
├── skills/              # Agent-specific skills (can use hyphens)
│   └── skill-name/      # Skill directories can use hyphens
└── tests/               # pytest test suite
```

### Key Specifications

- `docs/specs/skill-format.md` - How to author skills
- `docs/specs/agent-interface.md` - Agent contracts and lifecycle
- `docs/adr/ADR-005-skills-first-architecture.md` - Full architecture decision

## Phase 4: ADK Integration (In Progress)

Phase 4 connects ADK agents to the React Command Console via SSE streaming.

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| MCP Fixtures Server | `services/mcp-fixtures/` | Serve Cedar Creek data via MCP |
| ADK Orchestrator | `main.py` | FastAPI + ADK SSE endpoints |
| SSE Client | `apps/command-console/src/lib/adkClient.ts` | Parse ADK SSE events |
| Event Transformer | `apps/command-console/src/services/adkEventTransformer.ts` | Convert ADK → AgentBriefingEvent |
| useADKStream Hook | `apps/command-console/src/hooks/useADKStream.ts` | React hook for streaming |

### Phase 4 Commands

```bash
# Start ADK orchestrator locally
source .venv/bin/activate
python main.py

# Start MCP fixtures server
cd services/mcp-fixtures && uvicorn server:app --port 8080

# Test multi-agent wiring
cd agents && python -c "from validation_spike.agent import root_agent; print(root_agent.sub_agents)"

# Deploy to Cloud Run
gcloud run deploy ranger-coordinator --source . --project ranger-twin-dev --region us-central1
```

### Environment Variables

- `GOOGLE_API_KEY` - Required for ADK/Gemini
- `SESSION_SERVICE_URI` - Firestore session backend (production)
- `MCP_FIXTURES_URL` - MCP server URL (production)

### Implementation Guide

See `docs/specs/_!_RANGER-PHASE4-IMPLEMENTATION-GUIDE-v2.md` for complete specifications.

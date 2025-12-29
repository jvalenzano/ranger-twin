```text
    ____  ___    _   __________________ 
   / __ \/   |  / | / / ____/ ____/ __ \
  / /_/ / /| | /  |/ / / __/ __/ / /_/ /
 / _, _/ ___ |/ /|  / /_/ / /___/ _, _/ 
/_/ |_/_/  |_/_/ |_/\____/_____/_/ |_|  
```

# RANGER: AI-Powered Forest Recovery

> **Multi-agent coordination platform for post-fire forest recovery**
>
> *"Recovery at the speed of insight."*

[![GCP](https://img.shields.io/badge/cloud-GCP-4285F4.svg)]()
[![ADK](https://img.shields.io/badge/runtime-Google%20ADK-34A853.svg)]()
[![Gemini](https://img.shields.io/badge/model-Gemini%202.0%20Flash-4285F4.svg)]()
[![FedRAMP](https://img.shields.io/badge/compliance-FedRAMP%20High-green.svg)]()
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)

---

## 🚀 Launch the Demo

**See RANGER in action immediately:**

| Interface | URL | Description |
|-----------|-----|-------------|
| **Command Console** | [localhost:5173](http://localhost:5173) | Primary UI — Chat, Maps, Briefings |
| **ADK Web UI** | [localhost:8000](http://localhost:8000) | Agent orchestrator, tool inspection |
| **API Docs** | [localhost:8000/docs](http://localhost:8000/docs) | FastAPI Swagger documentation |

```bash
# Quick start (after setup)
cd apps/command-console && npm run dev    # → localhost:5173
python main.py                            # → localhost:8000
```

> **First time?** See [Quick Start](#quick-start) below for full setup instructions.

---

## What Is RANGER

RANGER is an **Agentic Operating System** for natural resource recovery. It coordinates specialized AI agents—each enhanced with domain-specific Skills—to transform disconnected forest management operations into unified intelligence.

**The Core Insight:** Value lives in the Skills, not the Agents. Skills are portable expertise packages that can be composed, tested, and reused across applications.

![RANGER Skills-First Architecture](docs/assets/diagrams/stakeholder/skills-first-architecture.png)

*User queries flow through the Recovery Coordinator to specialist agents, which leverage a shared Skills Library connected to federal data sources via MCP.*

## The Agent Roster

| Agent | Role | Skills | Model |
|-------|------|--------|-------|
| **Recovery Coordinator** | Mission orchestration, delegation | `portfolio-triage`, `delegation` | gemini-2.0-flash |
| **Burn Analyst** | Fire severity, MTBS classification | `mtbs-classification`, `soil-burn-severity`, `boundary-mapping` | gemini-2.0-flash |
| **Trail Assessor** | Infrastructure damage, closures | `damage-classification`, `closure-decision`, `recreation-priority` | gemini-2.0-flash |
| **Cruising Assistant** | Timber inventory, salvage | `volume-estimation`, `salvage-assessment`, `cruise-methodology`, `csv-insight` | gemini-2.0-flash |
| **NEPA Advisor** | Regulatory compliance, CE/EA/EIS | `pathway-decision`, `compliance-timeline`, `documentation`, `pdf-extraction` | gemini-2.0-flash |

**5 agents, 16 skills, 606 tests**

## Quick Start

### Prerequisites

- Node.js 20+ with npm
- Python 3.11+
- Google Cloud account with Vertex AI access
- `GOOGLE_API_KEY` environment variable

### Verify Your Setup

```bash
./scripts/verify-environment.sh
```

This checks Python, Node, dependencies, and GCP authentication.

### Run Locally

```bash
# Clone
git clone https://github.com/TechTrend/ranger-twin.git
cd ranger-twin

# Environment
cp .env.example .env
# Add your GOOGLE_API_KEY to .env

# Python setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend (Terminal 1)
cd apps/command-console && npm install && npm run dev
# → http://localhost:5173

# ADK Orchestrator (Terminal 2)
source .venv/bin/activate
python main.py
# → http://localhost:8000

# Or use ADK CLI directly
cd agents && adk web --port 8000
```

### Verify Installation

```bash
# Test agents load correctly
cd agents && python -c "from coordinator.agent import root_agent; print(f'Agents: {len(root_agent.tools)}')"
# Expected: Agents: 5

# Run test suite
pytest agents/ -v
# Expected: 606 passed
```

## 📦 Getting Large Assets

RANGER uses **Git LFS** for diagrams and excludes knowledge base documents from the repo to keep clones fast. Here's how to get these assets when you need them.

### Architecture Diagrams (~25MB)

The `docs/assets/diagrams/` directory contains 21 high-resolution PNG diagrams tracked by Git LFS. After cloning, you'll have pointer files instead of actual images.

```bash
# Check if you have Git LFS installed
git lfs version

# If not installed:
# macOS: brew install git-lfs
# Ubuntu: sudo apt install git-lfs
# Windows: Download from https://git-lfs.github.com/

# Initialize LFS in your local repo
git lfs install

# Pull all LFS assets (diagrams)
git lfs pull

# Verify diagrams are downloaded
ls -la docs/assets/diagrams/developer/
# Should show ~2-3MB PNG files, not 130-byte pointer files
```

**Selective pull** (if you only need specific diagrams):
```bash
# Pull only stakeholder diagrams
git lfs pull --include="docs/assets/diagrams/stakeholder/*"

# Pull only developer diagrams
git lfs pull --include="docs/assets/diagrams/developer/*"
```

### Knowledge Base Documents (~50MB)

The RAG knowledge base (16 federal PDFs) is **not** stored in the repo. To build the knowledge corpora:

```bash
cd knowledge/scripts

# 1. Download documents from authoritative sources
python 1_download_documents.py
# Some documents require manual download - check output

# 2. Sync to GCS (requires GCP auth)
python 2_sync_to_gcs.py

# 3-5. Create and verify corpora (requires Vertex AI access)
python 3_create_corpora.py
python 4_import_documents.py
python 5_verify_corpora.py
```

**Note:** Most developers don't need the knowledge base locally. The RAG corpora are already deployed in `europe-west3` and accessible via the agent tools.

See [knowledge/README.md](knowledge/README.md) for detailed instructions.

---

## Project Structure

```
ranger-twin/
├── agents/                    # ADK Agents (Skills-First)
│   ├── coordinator/           #   Root orchestrator
│   │   ├── agent.py           #     Agent definition
│   │   ├── skills/            #     Coordinator-specific skills
│   │   └── tests/             #     Agent tests
│   ├── burn_analyst/          #   Fire severity specialist
│   ├── trail_assessor/        #   Infrastructure specialist
│   ├── cruising_assistant/    #   Timber specialist
│   ├── nepa_advisor/          #   Compliance specialist
│   ├── shared/                #   Shared agent utilities
│   └── docs/                  #   Agent documentation
│
├── skills/                    # Shared Skills Library
│   ├── foundation/            #   Cross-agency skills
│   │   ├── _template/         #     Skill authoring template
│   │   └── greeting/          #     Example skill
│   └── forest-service/        #   USFS-specific skills (planned)
│
├── mcp/                       # MCP Server Definitions (placeholders)
│   ├── fixtures/              #   Local fixture server spec
│   └── nifc/                  #   NIFC data server spec
│
├── services/                  # Service Implementations
│   ├── agents/                #   Agent service containers
│   ├── api-gateway/           #   FastAPI gateway service
│   └── mcp-fixtures/          #   MCP fixtures server (implemented)
│
├── apps/
│   ├── command-console/       #   React + Vite + Tailwind UI
│   └── field-companion/       #   Mobile/field app (future)
│
├── packages/                  # Shared Libraries (monorepo)
│   ├── agent-common/          #   Common agent utilities
│   ├── skill-runtime/         #   Skill loading/execution
│   ├── twin-core/             #   Core types and interfaces
│   ├── types/                 #   TypeScript types
│   └── ui-components/         #   Shared React components
│
├── data/
│   ├── fixtures/              #   Phase 1 simulation data
│   │   ├── cedar-creek/       #     Primary test fire
│   │   └── bootleg/           #     Secondary test fire
│   ├── documents/             #   NEPA documents, regulations
│   ├── layers/                #   GIS vector layers
│   ├── rasters/               #   Satellite imagery/rasters
│   └── synthetic/             #   Generated test data
│
├── docs/                      #   Documentation
│   ├── adr/                   #     Architecture Decision Records
│   ├── specs/                 #     Technical specifications
│   ├── runbooks/              #     Operational guides
│   ├── architecture/          #     System architecture docs
│   └── ...                    #     (20+ topic directories)
│
├── infrastructure/
│   ├── docker/                #   Docker configurations
│   └── terraform/             #   Infrastructure as Code
│
├── scripts/                   #   Utility scripts
│   ├── deploy-frontend.sh     #     Frontend deployment
│   ├── test-integration.py    #     Integration tests
│   └── verify-adk.py          #     ADK verification
│
├── .context/                  #   AI agent context files
│   ├── CLAUDE.md              #     Streamlined agent instructions
│   ├── architecture.md        #     Current state summary
│   └── MANIFEST.md            #     Authoritative doc index
│
├── main.py                    #   ADK Orchestrator entry point
├── CLAUDE.md                  #   Extended agent context
└── README.md                  #   You are here
```

## Key Commands

```bash
# ─────────────────────────────────────────────────────────
# FRONTEND
# ─────────────────────────────────────────────────────────
cd apps/command-console && npm run dev      # Development server
cd apps/command-console && npm run build    # Production build
cd apps/command-console && npm run typecheck # TypeScript validation

# ─────────────────────────────────────────────────────────
# ADK AGENTS
# ─────────────────────────────────────────────────────────
python main.py                              # Start orchestrator (FastAPI + ADK)
cd agents && adk run coordinator            # CLI mode (single agent)
cd agents && adk web --port 8000            # Web UI mode (all agents)

# ─────────────────────────────────────────────────────────
# TESTING
# ─────────────────────────────────────────────────────────
pytest agents/ -v                           # Agent + skill tests (606)
pytest packages/ -v                         # Runtime package tests (43)
pytest agents/coordinator/ -v               # Single agent tests

# ─────────────────────────────────────────────────────────
# DEPLOYMENT (Cloud Run)
# ─────────────────────────────────────────────────────────
gcloud run deploy ranger-coordinator \
  --source . \
  --project ranger-twin-dev \
  --region us-central1
```

## Architecture Decisions

Key ADRs that govern this project:

| ADR | Decision | Impact |
|-----|----------|--------|
| [ADR-005](docs/adr/ADR-005-skills-first-architecture.md) | **Skills-First Architecture** | Skills are portable expertise; agents are orchestration |
| [ADR-006](docs/adr/ADR-006-google-only-llm-strategy.md) | **Google-Only LLM** | Single API key, no OpenRouter complexity |
| [ADR-007.1](docs/adr/ADR-007.1-tool-invocation-strategy.md) | **Tool Invocation (mode=AUTO)** | Prevents infinite loops in conversational agents |
| [ADR-008](docs/adr/ADR-008-agent-tool-pattern.md) | **AgentTool Pattern** | Coordinator retains control, calls specialists as tools |
| [ADR-009](docs/adr/ADR-009-fixture-first-development.md) | **Fixture-First Development** | Prove patterns with simulated data before live APIs |

## Tech Stack

### Core Runtime

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Agent Framework** | Google ADK | Multi-agent orchestration |
| **LLM** | Gemini 2.0 Flash | Reasoning and generation |
| **Data Protocol** | MCP (Model Context Protocol) | Standardized data connectivity |
| **Frontend** | React + Vite + Tailwind | Command Console UI |
| **Backend** | FastAPI + SSE | Agent orchestration API |

### Infrastructure (GCP)

| Service | Purpose |
|---------|---------|
| Cloud Run | Serverless agent hosting |
| Vertex AI | Gemini API (production) |
| Firestore | Session state (production) |
| Cloud Storage | Static assets, fixtures |

### Estimated Costs

| Period | Monthly Cost |
|--------|--------------|
| Active development | $200-400 |
| Fire season (May-Oct) | $800-1,200 |
| Off-season (Nov-Apr) | $100-200 |
| **Annual estimate** | **$6,000-9,000** |

## Phase 1 Scope

**Cedar Creek Fire** (Willamette NF, Oregon, 2022) serves as our proof-of-concept:

### What's IN Phase 1 ✅

- Multi-agent coordination via Recovery Coordinator
- 16 domain skills across 5 specialist agents
- Fixture-based simulation data (fire perimeters, trails, timber plots, NEPA docs)
- Proof Layer transparency (reasoning chains, citations, confidence scores)
- Command Console UI with chat and briefing views
- Cloud Run deployment with SSE streaming

### What's NOT in Phase 1 ❌

- Real satellite imagery processing
- Computer vision models (YOLOv8, SAM2)
- Live USFS system integration (IRWIN, TRACS)
- Field mobile app
- Production USDA authentication

See [DATA-SIMULATION-STRATEGY.md](docs/archive/phase1/DATA-SIMULATION-STRATEGY.md) for simulation boundaries.

## 🖼️ Visual Documentation

RANGER includes a comprehensive diagram library for onboarding, presentations, and architectural reference.

### Quick Links

| Purpose | Diagram | Preview |
|---------|---------|---------|
| **Understand the architecture** | [Skills-First Architecture](docs/assets/diagrams/stakeholder/skills-first-architecture.png) | How agents, skills, and MCP connect |
| **Developer environment** | [Developer Port Map](docs/assets/diagrams/developer/developer-port-map.png) | Which service runs where |
| **Event streaming** | [SSE Streaming Flow](docs/assets/diagrams/developer/sse-streaming-flow.png) | How data flows to the UI |
| **Knowledge retrieval** | [RAG Knowledge Pipeline](docs/assets/diagrams/developer/rag-knowledge-pipeline.png) | How agents access federal docs |
| **Trust & transparency** | [Confidence Ledger](docs/assets/diagrams/stakeholder/The%20Confidence%20Ledger%20(Trust%20Architecture).png) | How we prove AI decisions |

### Diagram Library

```
docs/assets/diagrams/
├── developer/           # 10 technical architecture diagrams
├── stakeholder/         # 11 value proposition diagrams  
├── legacy/              # 5 archived Phase 1-3 diagrams
├── README.md            # Full catalog with audience guide
└── DIAGRAM-NARRATIVES.md # Speaker notes for presentations
```

**Full catalog:** [docs/assets/diagrams/README.md](docs/assets/diagrams/README.md)

> **Note:** Diagrams are tracked with Git LFS. Run `git lfs pull` to download actual images. See [Getting Large Assets](#-getting-large-assets).

---

## Documentation

### Start Here

| Document | Purpose |
|----------|---------|
| [`.context/CLAUDE.md`](.context/CLAUDE.md) | **Streamlined agent context** (~1000 tokens) |
| [PRODUCT-SUMMARY.md](docs/PRODUCT-SUMMARY.md) | What RANGER is, who it's for |
| [ADR-005](docs/adr/ADR-005-skills-first-architecture.md) | Core architectural paradigm |
| **[Diagram Library](docs/assets/diagrams/README.md)** | **Visual architecture reference** |

### Architecture & Specs

| Document | Purpose |
|----------|---------|
| [ADK-OPERATIONS-RUNBOOK.md](docs/runbooks/ADK-OPERATIONS-RUNBOOK.md) | **Critical:** ADK patterns, debugging, deployment |
| [skill-format.md](docs/specs/skill-format.md) | How to author skills |
| [agent-interface.md](docs/specs/agent-interface.md) | Agent communication protocol |
| [PROOF-LAYER-DESIGN.md](docs/specs/PROOF-LAYER-DESIGN.md) | Reasoning transparency spec |
| **[knowledge/README.md](knowledge/README.md)** | **RAG knowledge base setup** |

### For AI Agents

| Document | Purpose |
|----------|---------|
| [`.context/`](.context/) | Active context directory for AI tools |
| [`CLAUDE.md`](CLAUDE.md) | Extended agent context (full reference) |
| [`.context/MANIFEST.md`](.context/MANIFEST.md) | Index of authoritative docs |

## Design Philosophy

### "Tactical Futurism"

The UI follows an "F-35 Cockpit meets National Geographic" aesthetic:

- **Dark mode default** — Command centers and field conditions
- **Glassmorphism** — Translucent panels, backdrop blur
- **Status colors** — Green (#10B981) / Amber (#F59E0B) / Red (#EF4444)
- **Data dense** — Information-rich displays for operators

### Investment Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              AI CAPABILITIES (80%)                      │   │
│   │  Skills Library • Agent Orchestration • Proof Layer     │   │
│   │  Domain Expertise • Reasoning Transparency              │   │
│   └─────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           APPLICATION SHELL (20%)                       │   │
│   │  React UI • FastAPI • MapLibre • Tailwind               │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Team

**TechTrend Federal** — Digital Twin Initiative

Building AI-powered decision support for federal natural resource management.

## License

Internal / USDA Forest Service Portfolio Demonstration

---

*Built with a Skills-First philosophy: the expertise is portable, the agents are orchestration, the application is plumbing.*

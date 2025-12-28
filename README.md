# RANGER: AI-Powered Forest Recovery

> **Multi-agent coordination platform for post-fire forest recovery**
>
> *"Recovery at the speed of insight."*

[![GCP](https://img.shields.io/badge/cloud-GCP-4285F4.svg)]()
[![ADK](https://img.shields.io/badge/runtime-Google%20ADK-34A853.svg)]()
[![Gemini](https://img.shields.io/badge/model-Gemini%202.0%20Flash-4285F4.svg)]()
[![FedRAMP](https://img.shields.io/badge/compliance-FedRAMP%20High-green.svg)]()

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
| **NEPA Advisor** | Regulatory compliance, CE/EA/EIS | `pathway-decision`, `compliance-timeline`, `documentation`, `pdf-extraction` | gemini-2.5-flash |

**5 agents, 16 skills, 606 tests**

## Quick Start

### Prerequisites

- Node.js 20+ with npm
- Python 3.11+
- Google Cloud account with Vertex AI access
- `GOOGLE_API_KEY` environment variable

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

## Project Structure

```
ranger-twin/
├── agents/                    # ADK Agents (Skills-First)
│   ├── coordinator/           #   Root orchestrator
│   │   ├── agent.py           #   Agent definition
│   │   └── skills/            #   Coordinator skills
│   ├── burn_analyst/          #   Fire severity specialist
│   ├── trail_assessor/        #   Infrastructure specialist
│   ├── cruising_assistant/    #   Timber specialist
│   └── nepa_advisor/          #   Compliance specialist
│
├── skills/                    # Shared Skills Library (future)
│   ├── foundation/            #   Cross-agency skills
│   └── forest-service/        #   USFS-specific skills
│
├── mcp/                       # Model Context Protocol Servers
│   └── fixtures/              #   Cedar Creek simulation data
│
├── apps/
│   └── command-console/       # React + Vite + Tailwind UI
│
├── data/
│   └── fixtures/              # Phase 1 simulation data
│       └── cedar-creek/       #   Fire perimeters, trails, timber, NEPA
│
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   ├── specs/                 # Technical specifications
│   └── runbooks/              # Operational guides
│
├── .context/                  # AI agent context files
│   ├── CLAUDE.md              #   Streamlined agent instructions
│   ├── architecture.md        #   Current state summary
│   └── MANIFEST.md            #   Authoritative doc index
│
├── main.py                    # ADK Orchestrator entry point
├── CLAUDE.md                  # Extended agent context
└── README.md                  # You are here
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

## Documentation

### Start Here

| Document | Purpose |
|----------|---------|
| [`.context/CLAUDE.md`](.context/CLAUDE.md) | **Streamlined agent context** (~1000 tokens) |
| [PRODUCT-SUMMARY.md](docs/PRODUCT-SUMMARY.md) | What RANGER is, who it's for |
| [ADR-005](docs/adr/ADR-005-skills-first-architecture.md) | Core architectural paradigm |

### Architecture & Specs

| Document | Purpose |
|----------|---------|
| [ADK-OPERATIONS-RUNBOOK.md](docs/runbooks/ADK-OPERATIONS-RUNBOOK.md) | **Critical:** ADK patterns, debugging, deployment |
| [skill-format.md](docs/specs/skill-format.md) | How to author skills |
| [agent-interface.md](docs/specs/agent-interface.md) | Agent communication protocol |
| [PROOF-LAYER-DESIGN.md](docs/specs/PROOF-LAYER-DESIGN.md) | Reasoning transparency spec |

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

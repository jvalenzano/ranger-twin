# RANGER: The USFS Digital Twin

> **Agent-first AI platform for post-fire forest recovery**
>
> *"Recovery at the speed of insight."*

[![License](https://img.shields.io/badge/license-Internal-blue.svg)]()
[![GCP](https://img.shields.io/badge/cloud-GCP-4285F4.svg)]()
[![FedRAMP](https://img.shields.io/badge/compliance-FedRAMP%20High-green.svg)]()

## Vision

RANGER transforms post-fire forest recovery from disconnected operations into coordinated AI intelligence. Built on 100% open source tooling, this platform invests in AI agent capabilities rather than application licensing.

**The Core Insight:** The value isn't in CRUD operations, dashboards, or reporting—those are solved problems. The value is in specialized AI agents that understand forest management.

## Brand Architecture

| Layer | Name | Purpose |
|-------|------|---------|
| **Initiative** | Project RANGER | Strategic modernization effort |
| **Platform** | RANGER | The unified digital twin operating system |
| **Agents** | Role-based titles | AI specialists ("The Crew") |

See [Brand Architecture](docs/brand/BRAND-ARCHITECTURE.md) for complete naming guidelines.

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVESTMENT PHILOSOPHY                        │
├─────────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              AI CAPABILITIES (80%)                      │   │
│   │  Gemini multimodal • Custom models • RAG pipelines      │   │
│   │  Agent orchestration • Domain-specific training         │   │
│   └─────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │           APPLICATION SHELL (20%)                       │   │
│   │  React + MapLibre (OSS) • FastAPI (OSS) • PostGIS (OSS) │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## The Crew: Five AI Agents

| Agent | Role Title | Purpose | Key Tech |
|-------|------------|---------|----------|
| **Burn Analyst** | The Burn Analyst | Satellite burn severity assessment | geemap, Gemini multimodal |
| **Trail Assessor** | The Trail Assessor | AI-powered trail damage detection | YOLOv8, SAM2, GPS correlation |
| **Cruising Assistant** | The Cruising Assistant | Multimodal timber inventory | Whisper, species ID models |
| **NEPA Advisor** | The NEPA Advisor | Regulatory guidance via RAG | LangChain, FSM/FSH corpus |
| **Recovery Coordinator** | Recovery Coordinator | Multi-agent orchestration | Cross-domain synthesis |

**Naming Principle:** Agent names are role titles, not product names. This frames AI as "digital colleagues" that assist human experts.

## Architecture

```
ranger/
├── apps/
│   ├── command-console/       # Desktop UI ("Tactical Futurism" aesthetic)
│   └── field-companion/       # Mobile PWA for field data capture
├── services/
│   ├── api-gateway/           # FastAPI main router
│   └── agents/                # AI agent implementations ("The Crew")
│       ├── burn-analyst/
│       ├── trail-assessor/
│       ├── cruising-assistant/
│       ├── nepa-advisor/
│       └── recovery-coordinator/
├── packages/
│   ├── twin-core/             # Shared Python utilities
│   ├── ui-components/         # Shared React components
│   └── agent-common/          # Agent utilities & prompts
├── infrastructure/
│   ├── terraform/             # GCP IaC
│   └── docker/                # Container definitions
├── data/
│   ├── fixtures/              # Phase 1: Cedar Creek simulation data (ACTIVE)
│   ├── layers/                # Phase 2+: Real GeoJSON (empty)
│   ├── rasters/               # Phase 2+: Satellite imagery (empty)
│   ├── synthetic/             # Phase 2+: AI-generated tests (empty)
│   └── documents/             # NEPA reference docs
└── docs/                      # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+ with pnpm
- Python 3.11+
- Docker & Docker Compose
- GCP account with Vertex AI access

### Setup

```bash
# Clone
git clone https://github.com/jvalenzano/ranger-twin.git
cd ranger-twin

# Environment
cp .env.example .env
# Edit .env with your GCP credentials

# Install dependencies
pnpm install
pip install -e packages/twin-core

# Start services
docker-compose up -d

# Frontend: http://localhost:5173
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs

> [!NOTE]
> For detailed setup, testing procedures, and verification workflows, see the **[Local Development & Testing Guide](docs/onboarding/LOCAL-DEVELOPMENT-GUIDE.md)**.
```

### Development

```bash
# Run frontend
cd apps/command-console && pnpm dev

# Run API gateway
cd services/api-gateway && uvicorn app.main:app --reload

# Run specific agent
cd services/agents/burn-analyst && python -m burn_analyst.main

# Tests
pytest services/
cd apps/command-console && pnpm test
```

## Tech Stack

### Open Source (Zero Licensing)

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Mapping** | MapLibre GL JS, deck.gl |
| **Backend** | FastAPI, Celery |
| **Database** | PostgreSQL + PostGIS + pgvector |
| **AI/ML** | LangChain, YOLOv8, Whisper, geemap |
| **Raster** | GDAL, rasterio, xarray |

### GCP Services (FedRAMP High)

| Service | Purpose |
|---------|---------|
| Cloud Run | Serverless API hosting |
| Cloud SQL | PostgreSQL + PostGIS |
| Cloud Storage | Imagery, assets |
| Vertex AI | Gemini API access |
| BigQuery | Large-scale geospatial |

### Estimated Costs

- **Active Season** (May-Oct): $800-1,200/month
- **Off-Season** (Nov-Apr): $100-200/month
- **Annual**: ~$6,000-9,000/year

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md) | Master document: vision, agents, 6-week sprint plan |
| [GLOSSARY.md](docs/GLOSSARY.md) | Comprehensive glossary of 100+ acronyms and technical terms |
| [BRAND-ARCHITECTURE.md](docs/brand/BRAND-ARCHITECTURE.md) | Naming conventions and brand hierarchy |
| [STAKEHOLDER-MESSAGING.md](docs/brand/STAKEHOLDER-MESSAGING.md) | Audience-specific messaging guide |
| [GCP-ARCHITECTURE.md](docs/architecture/GCP-ARCHITECTURE.md) | Infrastructure patterns, cost breakdown |
| [OPEN-SOURCE-INVENTORY.md](docs/architecture/OPEN-SOURCE-INVENTORY.md) | Complete tool inventory with links |
| [UX-VISION.md](docs/architecture/UX-VISION.md) | "Tactical Futurism" design philosophy |
| [MARKET-RESEARCH.md](docs/research/MARKET-RESEARCH.md) | Competitive landscape, go/no-go analysis |
| [ADK-OPERATIONS-RUNBOOK.md](docs/runbooks/ADK-OPERATIONS-RUNBOOK.md) | **Critical** developer guide for ADK/Agent integration |

## Design: "Tactical Futurism"

The UI follows an "F-35 Cockpit meets National Geographic" aesthetic:

- **Dark Mode**: Default for command centers and field conditions
- **Glassmorphism**: Translucent panels with backdrop blur
- **Status Colors**: Green (#10B981) / Amber (#F59E0B) / Red (#EF4444)
- **Data Dense**: Information-rich displays for operators

![Command Console Mockup](docs/assets/ranger_ai_mockup.png)

## Project Context

**Cedar Creek Fire** (Willamette National Forest, Oregon, 2022) serves as our "frozen-in-time" proof-of-concept:

- ~127,000 acres burned
- Well-documented with public data (MTBS, Sentinel-2, 3DEP)
- Representative of Pacific Northwest fire behavior
- Impacted trails, timber, and required NEPA compliance

## Team

**TechTrend Federal** - Digital Twin Initiative

- 3 developers
- 6-week timeline (January 6 - February 14, 2026)
- Target: USFS regional office demonstration

## License

Internal / USDA Forest Service Portfolio Demo

---

*Built with an AI-first philosophy: the agents are the product, the application is plumbing.*

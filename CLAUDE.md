# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RANGER** is an agent-first digital twin platform for post-fire forest recovery, built for the US Forest Service. The project uses a "zero licensing" philosophy—100% open source application stack with investment focused on AI agent capabilities.

### Brand Architecture

| Layer | Name | Purpose |
|-------|------|---------|
| **Initiative** | Project RANGER | Strategic modernization effort (budget docs, leadership comms) |
| **Platform** | RANGER | The unified digital twin operating system |
| **Descriptor** | "The USFS Digital Twin" | Technical positioning |
| **Agents** | Role-based titles | AI specialists that augment human expertise ("The Crew") |

**Tagline:** "Recovery at the speed of insight."

See `docs/brand/BRAND-ARCHITECTURE.md` for complete naming guidelines and `docs/adr/ADR-002-brand-naming-strategy.md` for decision rationale.

### Core Philosophy

- **Agent-First Architecture**: Five specialized AI agents are the product; the application is the interface
- **Open Source Default**: No commercial licensing; use OSS for all application components
- **AI Investment Focus**: 80% of effort on agent capabilities, 20% on UI shell
- **Federal-Ready**: FedRAMP-compatible patterns from day one

## The Crew: Five AI Agents

Agent names are **role titles**, not product names. This frames AI as "digital colleagues" that assist human experts.

| Agent | Role Title | Directory | Purpose |
|-------|------------|-----------|---------|
| **Burn Analyst** | The Burn Analyst | `burn-analyst/` | Satellite burn severity assessment |
| **Trail Assessor** | The Trail Assessor | `trail-assessor/` | AI-powered trail damage detection |
| **Cruising Assistant** | The Cruising Assistant | `cruising-assistant/` | Multimodal timber inventory (voice + video) |
| **NEPA Advisor** | The NEPA Advisor | `nepa-advisor/` | Regulatory guidance via RAG |
| **Recovery Coordinator** | Recovery Coordinator | `recovery-coordinator/` | Multi-agent orchestration |

### Agent Specifications

#### Burn Analyst
- **Input**: Sentinel-2/Landsat imagery, fire perimeter
- **Output**: dNBR maps, severity statistics, narrative analysis
- **Key Tech**: geemap, Gemini multimodal

#### Trail Assessor
- **Input**: Video + GPS from field, trail network
- **Output**: Georeferenced damage inventory, repair priorities
- **Key Tech**: YOLOv8/SAM2, Gemini classification

#### Cruising Assistant
- **Input**: Voice narration + video from field
- **Output**: FSVeg-compatible plot records, species ID
- **Key Tech**: Whisper, custom species model, Gemini
- **Voice Interaction**: "Hey Ranger, start a new plot."

#### NEPA Advisor
- **Input**: Project description, location
- **Output**: FSM/FSH citations, compliance checklist, EA drafts
- **Key Tech**: LangChain, pgvector, Gemini

#### Recovery Coordinator
- **Input**: Outputs from all agents, user priorities
- **Output**: Integrated recovery plans, resource allocation
- **Key Tech**: Agent orchestration framework, Gemini

## Monorepo Structure

```
ranger/
├── apps/                          # Frontend applications
│   ├── command-console/           # React + MapLibre (desktop "Tactical Futurism" UI)
│   └── field-companion/           # PWA for mobile field data capture
├── services/                      # Backend services
│   ├── api-gateway/               # FastAPI main API router
│   └── agents/                    # AI agent implementations ("The Crew")
│       ├── burn-analyst/
│       ├── trail-assessor/
│       ├── cruising-assistant/
│       ├── nepa-advisor/
│       └── recovery-coordinator/
├── packages/                      # Shared libraries
│   ├── twin-core/                 # Python utilities, data models
│   ├── ui-components/             # React component library
│   └── agent-common/              # Shared agent utilities, prompts
├── infrastructure/                # IaC and deployment
│   ├── terraform/                 # GCP infrastructure
│   └── docker/                    # Container definitions
├── data/                          # Digital twin data (Git LFS)
│   ├── documents/                 # PDFs (NEPA docs, FSM/FSH)
│   ├── layers/                    # GeoJSON vector data
│   ├── rasters/                   # GeoTIFF imagery
│   └── synthetic/                 # Generated test data
├── scripts/                       # Development utilities
└── docs/                          # Documentation
    ├── PROJECT-BRIEF.md           # Master project document
    ├── brand/                     # Brand architecture, messaging
    ├── architecture/              # Technical architecture
    ├── agents/                    # Agent specifications
    ├── research/                  # Market research, data sources
    └── adr/                       # Architecture Decision Records
```

## Development Commands

### Local Development

```bash
# Install all dependencies
pnpm install
pip install -e packages/twin-core

# Start all services
docker-compose up -d

# Start frontend only
cd apps/command-console && pnpm dev

# Start API gateway only
cd services/api-gateway && uvicorn app.main:app --reload

# Run specific agent
cd services/agents/burn-analyst && python -m burn_analyst.main
```

### Testing

```bash
# Backend tests
pytest services/

# Frontend tests
cd apps/command-console && pnpm test

# Agent tests
pytest services/agents/ -v
```

### Code Quality

```bash
# Python formatting
black services/ packages/
ruff check services/ packages/

# TypeScript/React
cd apps/command-console && pnpm lint && pnpm typecheck
```

## Technical Stack

### Frontend (apps/)
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS (dark mode, glassmorphism)
- **Mapping**: MapLibre GL JS + deck.gl
- **Charts**: Recharts
- **State**: Zustand or React Query

### Backend (services/)
- **Framework**: FastAPI
- **Database**: PostgreSQL + PostGIS
- **Cache**: Redis
- **Task Queue**: Celery
- **Vector Search**: pgvector

### AI/ML (agents/)
- **LLM**: Google Gemini 2.0 Flash (via Vertex AI)
- **RAG**: LangChain + pgvector
- **Vision**: YOLOv8 (Ultralytics), SAM2
- **Speech**: OpenAI Whisper
- **Geospatial**: geemap, rasterio, xarray

### Infrastructure
- **Cloud**: Google Cloud Platform (FedRAMP High)
- **Compute**: Cloud Run (serverless)
- **Database**: Cloud SQL (PostgreSQL)
- **Storage**: Cloud Storage
- **IaC**: Terraform

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/PROJECT-BRIEF.md` | Master document: vision, agents, sprint plan |
| `docs/brand/BRAND-ARCHITECTURE.md` | Naming conventions, brand hierarchy |
| `docs/brand/STAKEHOLDER-MESSAGING.md` | Audience-specific messaging |
| `docs/adr/ADR-002-brand-naming-strategy.md` | Brand naming decision rationale |
| `docs/architecture/GCP-ARCHITECTURE.md` | Infrastructure patterns, cost estimates |
| `docs/architecture/OPEN-SOURCE-INVENTORY.md` | Complete tool inventory |
| `docs/architecture/UX-VISION.md` | Design philosophy, mockups |
| `docs/research/MARKET-RESEARCH.md` | Competitive landscape |
| `docs/agents/*.md` | Individual agent specifications |

## Design System: "Tactical Futurism"

The UI follows a "F-35 Cockpit meets National Geographic" aesthetic:

```css
/* Color Tokens */
--color-safe: #10B981;        /* Green - low severity, success */
--color-warning: #F59E0B;     /* Amber - moderate, caution */
--color-severe: #EF4444;      /* Red - high severity, critical */
--color-background: #0F172A;  /* Dark background */
--color-surface: #1E293B;     /* Card/panel backgrounds */
--color-glass: rgba(30, 41, 59, 0.8);  /* Glassmorphic overlays */
```

- **Dark Mode**: Default for all interfaces
- **Glassmorphism**: Translucent panels with backdrop blur
- **Data Density**: Information-rich displays for operators

## Agent Interaction Pattern

All agents expose:
1. **Query endpoint**: Natural language questions
2. **Confidence scores**: 0-100% with explanation
3. **Citations**: Data sources and timestamps
4. **Suggested follow-ups**: Context-aware next questions

Example:
```python
response = await burn_analyst.query(
    question="What percentage is high severity?",
    context={"fire_id": "cedar-creek-2022"}
)
# Returns: answer, confidence, sources, suggestions
```

Voice interaction (Cruising Assistant):
```
User: "Hey Ranger, start a new plot."
Cruising Assistant: "Plot 47-Alpha started. GPS coordinates logged. What do you see?"
```

## Environment Variables

Required in `.env`:
```bash
# GCP
GCP_PROJECT_ID=ranger-twin
GCP_REGION=us-east4

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI Services
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4

# Feature Flags
ENABLE_BURN_ANALYST=true
ENABLE_TRAIL_ASSESSOR=true
ENABLE_CRUISING_ASSISTANT=false  # Phase 2
ENABLE_NEPA_ADVISOR=false  # Phase 3
```

## Git Workflow

- **Main branch**: `main` (protected)
- **Feature branches**: `feature/agent-name-description`
- **Releases**: Tagged `v0.1.0`, `v0.2.0`, etc.

Large files (GeoJSON, GeoTIFF, PDF) use Git LFS—see `.gitattributes`.

## Federal Compliance Notes

- **FedRAMP**: Use GCP FedRAMP High services only
- **Region**: `us-east4` (Northern Virginia) for data residency
- **Encryption**: FIPS 140-2 at rest and in transit
- **Audit Logs**: Cloud Logging → BigQuery (1-year retention)

## Working on Agents

When developing agents:
1. Start with the spec in `docs/agents/{AGENT}-SPEC.md`
2. Implement in `services/agents/{agent-name}/`
3. Use shared utilities from `packages/agent-common/`
4. Write tests that validate against known Cedar Creek data
5. Expose via API gateway in `services/api-gateway/`

**Naming in code:**
- Classes: `BurnAnalyst`, `TrailAssessor`, `CruisingAssistant`, `NEPAAdvisor`
- Directories: `burn-analyst/`, `trail-assessor/`, `cruising-assistant/`, `nepa-advisor/`
- UI labels: "Burn Analyst", "Trail Assessor", "Cruising Assistant", "NEPA Advisor"
- Documentation: "The Burn Analyst", "The Trail Assessor", etc.

## Working on UI

When developing frontend:
1. Reference `docs/architecture/UX-VISION.md` for design direction
2. Build components in `packages/ui-components/`
3. Use Tailwind dark mode classes
4. Test with MapLibre + deck.gl layers
5. Ensure offline capability for Field Companion

## Proof of Concept Context

**Cedar Creek Fire** (Willamette National Forest, Oregon, 2022) serves as the "frozen-in-time" proof-of-concept:
- ~127,000 acres burned
- Well-documented with public data (MTBS, Sentinel-2, 3DEP)
- Representative of Pacific Northwest fire behavior

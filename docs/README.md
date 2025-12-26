# RANGER Documentation

> **"Recovery at the speed of insight."**

## Start Here

| Document | Description |
|----------|-------------|
| [PRODUCT-SUMMARY.md](./PRODUCT-SUMMARY.md) | **Start here.** Single rallying document for the product team — vision, architecture, current focus, operational reality |
| [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) | **Implementation North Star.** 13-week phased plan to MVP ($704K) |
| [GLOSSARY.md](./GLOSSARY.md) | 100+ acronyms and domain terms (BAER, NEPA, FSM/FSH, etc.) |

## Quick Navigation

### Strategic Documents

| Document | Description |
|----------|-------------|
| [PRODUCT-SUMMARY.md](./PRODUCT-SUMMARY.md) | Comprehensive product overview — what, why, how, and current priorities |
| [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) | 13-week phased plan to MVP (Supersedes all previous sprint plans) |
| [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) | Original vision document with agent specifications and UX concepts |
| [STRATEGIC-REFRAME.md](./STRATEGIC-REFRAME.md) | Architectural clarity: "one console, multiple views" insight |
| [INTEGRATION-ROADMAP.md](./INTEGRATION-ROADMAP.md) | Phase 1→2 transition plan for external data sources (NIFC, FIRMS, MTBS) |

### Brand & Messaging

| Document | Description |
|----------|-------------|
| [brand/BRAND-ARCHITECTURE.md](./brand/BRAND-ARCHITECTURE.md) | Naming conventions, brand hierarchy, quick reference |
| [brand/STAKEHOLDER-MESSAGING.md](./brand/STAKEHOLDER-MESSAGING.md) | Tailored messaging for different audiences |
| [adr/ADR-002-brand-naming-strategy.md](./adr/ADR-002-brand-naming-strategy.md) | Decision rationale for naming strategy |

### Architecture

| Document | Description |
|----------|-------------|
| [architecture/AGENTIC-ARCHITECTURE.md](./architecture/AGENTIC-ARCHITECTURE.md) | Google ADK agent system design, Recovery Coordinator pattern |
| [architecture/GCP-ARCHITECTURE.md](./architecture/GCP-ARCHITECTURE.md) | GCP infrastructure patterns, serverless design, cost estimates |
| [architecture/OPEN-SOURCE-INVENTORY.md](./architecture/OPEN-SOURCE-INVENTORY.md) | Complete inventory of open source tools with GitHub links |
| [architecture/UX-VISION.md](./architecture/UX-VISION.md) | "Tactical Futurism" design philosophy, mockups, prototyping guide |
| [architecture/AGENT-MESSAGING-PROTOCOL.md](./architecture/AGENT-MESSAGING-PROTOCOL.md) | AgentBriefingEvent schema and messaging patterns |
| [architecture/BRIEFING-UX-SPEC.md](./architecture/BRIEFING-UX-SPEC.md) | UI rendering spec for AgentBriefingEvents and reasoning transparency |
| [architecture/LEGACY-INTEGRATION-SCHEMAS.md](./architecture/LEGACY-INTEGRATION-SCHEMAS.md) | TRACS, FSVeg export schemas for USFS legacy system integration |
| [architecture/FIXTURE-DATA-FORMATS.md](./architecture/FIXTURE-DATA-FORMATS.md) | Phase 1 fixture schemas (burn severity, trails, timber, briefings) |
| [architecture/DATA-INGESTION-ADAPTERS.md](./architecture/DATA-INGESTION-ADAPTERS.md) | External data source adapter pattern and specifications |

### Agent Specifications ("The Crew")

| Agent | Role Title | Document | Purpose |
|-------|------------|----------|---------|
| **Recovery Coordinator** | **Root Agent** | [agents/RECOVERY-COORDINATOR-SPEC.md](./agents/RECOVERY-COORDINATOR-SPEC.md) | **Orchestration layer — this is the product** |
| Burn Analyst | Specialist | [agents/BURN-ANALYST-SPEC.md](./agents/BURN-ANALYST-SPEC.md) | Satellite burn severity assessment |
| Trail Assessor | Specialist | [agents/TRAIL-ASSESSOR-SPEC.md](./agents/TRAIL-ASSESSOR-SPEC.md) | Trail damage detection |
| Cruising Assistant | Specialist | [agents/CRUISING-ASSISTANT-SPEC.md](./agents/CRUISING-ASSISTANT-SPEC.md) | Multimodal timber inventory |
| NEPA Advisor | Specialist | [agents/NEPA-ADVISOR-SPEC.md](./agents/NEPA-ADVISOR-SPEC.md) | NEPA regulatory guidance |

### Testing & QA

| Document | Description |
|----------|-------------|
| [QA-VALIDATION-MANUAL.md](./QA-VALIDATION-MANUAL.md) | Comprehensive manual testing procedures for all features |
| [VALIDATION-TEST-PLAN.md](./VALIDATION-TEST-PLAN.md) | Playwright browser automation test plan |
| [WORKFLOW-TEST-PLAN.md](./WORKFLOW-TEST-PLAN.md) | Manual UI testing checklist for 4 recovery workflows |

### Research & Integration

| Document | Description |
|----------|-------------|
| [INTEGRATION-ROADMAP.md](./INTEGRATION-ROADMAP.md) | Phase 1→2 transition plan for external data sources |
| [research/PUBLIC-API-INVENTORY.md](./research/PUBLIC-API-INVENTORY.md) | NIFC, NASA FIRMS, MTBS, InciWeb, IRWIN API research |
| [research/USFS-INTERVIEW-MATERIALS.md](./research/USFS-INTERVIEW-MATERIALS.md) | Stakeholder interview templates and guides |

### Features

| Document | Description |
|----------|-------------|
| [features/_MISSION-CONTROL.md](./features/_MISSION-CONTROL.md) | Mission Control portfolio view implementation plan |

### Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-tech-stack.md) | Technology Stack Selection | Accepted |
| [ADR-002](./adr/ADR-002-brand-naming-strategy.md) | Brand Naming Strategy | Accepted |
| [ADR-003](./adr/ADR-003-gemini-3-flash-file-search.md) | Gemini 3 Flash + File Search | Accepted |
| [ADR-004](./adr/ADR-004-site-analysis-openrouter.md) | Site Analysis + OpenRouter | Accepted |
| [ADR-005](./adr/ADR-005-skills-first-architecture.md) | Skills-First Multi-Agent Architecture | Accepted |

### Workshop (Production Vision)

Expert panel workshop outputs describing the full production vision.

| Document | Description |
|----------|-------------|
| [workshop/README.md](./workshop/README.md) | Workshop overview and navigation |
| [workshop/ranger_workshop.md](./workshop/ranger_workshop.md) | Full 4-phase expert discourse |
| [workshop/ranger_roadmap.md](./workshop/ranger_roadmap.md) | 26-week implementation blueprint ($704K) |
| [workshop/ranger_executive.md](./workshop/ranger_executive.md) | Executive summary and funding request |
| [workshop/WORKSHOP-DEMO-ALIGNMENT.md](./workshop/WORKSHOP-DEMO-ALIGNMENT.md) | How workshop vision maps to our demo |

### Archive

Historical documents from Phase 1 (demo development) are preserved in [archive/phase1/](./archive/phase1/):

| Document | Description |
|----------|-------------|
| [archive/phase1/RANGER-DEMO-MANIFESTO.md](./archive/phase1/RANGER-DEMO-MANIFESTO.md) | 8-milestone demo plan (all complete) |
| [archive/phase1/DATA-SIMULATION-STRATEGY.md](./archive/phase1/DATA-SIMULATION-STRATEGY.md) | Phase 1 simulation boundaries and fixture contract |
| [archive/phase1/SPRINT-FOCUS.md](./archive/phase1/SPRINT-FOCUS.md) | Phase 1 development priorities |
| [archive/session-logs/PROGRESS-2025.md](./archive/session-logs/PROGRESS-2025.md) | Historical session journal (archived) |

Additional archived materials from initial exploration and completed milestones are in [archive/](./archive/).

---

## Document Conventions

### Status Labels

- **Current** — Active, maintained document
- **Transitional** — Valid but being superseded
- **Archived** — Historical reference only

### File Naming

- `UPPERCASE-WORDS.md` — Primary documents
- `lowercase-words.md` — Supporting documents
- `ADR-NNN-title.md` — Architecture Decision Records
- `_FEATURE-NAME.md` — Feature specifications (underscore prefix)

---

## Current Focus

As of December 2025, the team is focused on:

1. **Skills Library Development** — Porting domain expertise to portable skill packages (ADR-005)
2. **Mission Control UX** — Portfolio triage interface for 30-50 fire incidents
3. **API Integration** — Transitioning from fixtures to live NIFC/FIRMS data

See [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) for the 13-week path to MVP and [PRODUCT-SUMMARY.md](./PRODUCT-SUMMARY.md) for current priorities and the "8-minute reality" that drives our UX decisions.

---

## Contributing

1. Create documents in appropriate directory
2. Add to this index
3. Use consistent formatting (see existing docs)
4. Include status and date in header

---

*Last updated: December 24, 2025*

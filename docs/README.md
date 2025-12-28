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
 | [adr/ADR-005-skills-first-architecture.md](./adr/ADR-005-skills-first-architecture.md) | **Core Standard:** Skills-First Multi-Agent Architecture |
 | [architecture/GCP-DEPLOYMENT.md](./architecture/GCP-DEPLOYMENT.md) | GCP deployment guide (Supersedes GCP-ARCHITECTURE.md) |
 | [architecture/OPEN-SOURCE-INVENTORY.md](./architecture/OPEN-SOURCE-INVENTORY.md) | Complete inventory of open source tools with GitHub links |
 | [architecture/UX-VISION.md](./architecture/UX-VISION.md) | "Tactical Futurism" design philosophy, mockups, prototyping guide |
 | [architecture/AGENT-MESSAGING-PROTOCOL.md](./architecture/AGENT-MESSAGING-PROTOCOL.md) | AgentBriefingEvent schema and messaging patterns |
 | [architecture/BRIEFING-UX-SPEC.md](./architecture/BRIEFING-UX-SPEC.md) | UI rendering spec for AgentBriefingEvents and reasoning transparency |
 | [architecture/FIXTURE-DATA-FORMATS.md](./architecture/FIXTURE-DATA-FORMATS.md) | Phase 1 fixture schemas (burn severity, trails, timber, briefings) |
 | [architecture/DATA-INGESTION-ADAPTERS.md](./architecture/DATA-INGESTION-ADAPTERS.md) | External data source adapter pattern and specifications |

### Agent Specifications ("The Crew")

| Agent | Role Title | Document | Purpose |
|-------|------------|----------|---------|
| **Recovery Coordinator** | **Root Agent** | [agents/RECOVERY-COORDINATOR-SPEC.md](./agents/RECOVERY-COORDINATOR-SPEC.md) | **Orchestration layer — this is the product** |
| Burn Analyst | Specialist | [archive/legacy/agents/BURN-ANALYST-SPEC.md](./archive/legacy/agents/BURN-ANALYST-SPEC.md) | Legacy satellite burn severity (reference only) |
| Trail Assessor | Specialist | [archive/legacy/agents/TRAIL-ASSESSOR-SPEC.md](./archive/legacy/agents/TRAIL-ASSESSOR-SPEC.md) | Legacy trail damage (reference only) |
| Cruising Assistant | Specialist | [archive/legacy/agents/CRUISING-ASSISTANT-SPEC.md](./archive/legacy/agents/CRUISING-ASSISTANT-SPEC.md) | Legacy timber inventory (reference only) |
| NEPA Advisor | Specialist | [archive/legacy/agents/NEPA-ADVISOR-SPEC.md](./archive/legacy/agents/NEPA-ADVISOR-SPEC.md) | Legacy NEPA regulatory (reference only) |

### Skills & Interface Specs

| Document | Description |
|----------|-------------|
| [specs/agent-interface.md](./specs/agent-interface.md) | Standard communication protocol between Coordinator and Skills |
| [specs/skill-format.md](./specs/skill-format.md) | Canonical format for Skills Library packages (instructions, tools, tests) |
| [specs/SKILLS-LIBRARY-INDEX.md](./specs/SKILLS-LIBRARY-INDEX.md) | Index of domain expertise packages available to agents |
| [specs/SKILL-VERIFICATION-STANDARD.md](./specs/SKILL-VERIFICATION-STANDARD.md) | "Definition of Done" and quality gates for agentic skills |
| [specs/SKILL-RUNTIME-SPEC.md](./specs/SKILL-RUNTIME-SPEC.md) | **[NEW]** Test harness and mocking engine for skills |

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
| [features/MISSION-CONTROL.md](./features/MISSION-CONTROL.md) | Mission Control portfolio view implementation plan |
| [features/SITE-ANALYSIS-SPEC.md](./features/SITE-ANALYSIS-SPEC.md) | AI-powered forensic analysis and Quick Queries |
| [features/MAP-LEGEND-SPEC.md](./features/MAP-LEGEND-SPEC.md) | Interactive, phase-aware map legend control |
| [features/IR-VIEW-SPEC.md](./features/IR-VIEW-SPEC.md) | Thermal situational awareness and satellite attribution |
| [features/TECHNICAL-TOOLTIPS.md](./features/TECHNICAL-TOOLTIPS.md) | DX/UX tooltip system and technical documentation |

### Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-tech-stack.md) | Technology Stack Selection | Accepted |
| [ADR-002](./adr/ADR-002-brand-naming-strategy.md) | Brand Naming Strategy | Accepted |
| [ADR-003](./adr/ADR-003-gemini-3-flash-file-search.md) | Gemini 3 Flash + File Search | Accepted |
| [ADR-004](./adr/ADR-004-site-analysis-openrouter.md) | Site Analysis + OpenRouter | Superseded by ADR-006 |
| [ADR-005](./adr/ADR-005-skills-first-architecture.md) | Skills-First Multi-Agent Architecture | **Core Standard** |
| [ADR-006](./adr/ADR-006-google-only-llm-strategy.md) | Google-Only LLM Strategy | Accepted |
| [ADR-007](./adr/ADR-007-tool-invocation-strategy.md) | Tool Invocation (mode="ANY") | Superseded by ADR-007.1 |
| [ADR-007.1](./adr/ADR-007.1-tool-invocation-strategy.md) | Three-Layer Tool Invocation (mode="AUTO") | Accepted |
| [ADR-008](./adr/ADR-008-agent-tool-pattern.md) | AgentTool Pattern for Multi-Agent | Accepted |
| [ADR-009](./adr/ADR-009-fixture-first-development.md) | Fixture-First Development Strategy | Accepted |

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
 
 Historical documents from Phase 1 (demo development) and legacy FastAPI architectural drafts:
 
 | Document | Description |
 |----------|-------------|
 | [archive/legacy/AGENT-STRUCTURE-STANDARD.md](./archive/legacy/AGENT-STRUCTURE-STANDARD.md) | Legacy FastAPI-based agent structure (Superseded by Skills) |
 | [archive/legacy/agent-interface.md](./archive/legacy/agent-interface.md) | Legacy agent messaging spec (Superseded by ADK) |
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

As of December 2025, the team is in **Phase 0-1 (Demo)** focused on:

1. **Cloud Run Deployment** — Two-service architecture (ranger-console + ranger-coordinator)
2. **Agent Orchestration** — AgentTool pattern for multi-agent coordination (ADR-008)
3. **Fixture-First Development** — Real federal data cached locally for demo reliability (ADR-009)
4. **Stakeholder Demos** — Proving agentic workflow value before infrastructure investment

### Key Architecture Documents

| Document | Why It Matters |
|----------|----------------|
| [ADR-005](./adr/ADR-005-skills-first-architecture.md) | Core paradigm: Skills as the value layer |
| [ADR-008](./adr/ADR-008-agent-tool-pattern.md) | How agents orchestrate (AgentTool, not microservices) |
| [ADR-009](./adr/ADR-009-fixture-first-development.md) | Demo vs. production data strategy |
| [DEMO-DATA-REFERENCE.md](./DEMO-DATA-REFERENCE.md) | Quick reference for stakeholder conversations |

See [_!_PRODUCT-SUMMARY.md](./_!_PRODUCT-SUMMARY.md) for full context and the "8-minute reality" that drives our UX decisions.

---

## Contributing

1. Create documents in appropriate directory
2. Add to this index
3. Use consistent formatting (see existing docs)
4. Include status and date in header

---

*Last updated: December 27, 2025*

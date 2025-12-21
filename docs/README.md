# RANGER Documentation

> **"Recovery at the speed of insight."**

## Quick Navigation

### Core Documents

| Document | Description |
|----------|-------------|
| [DATA-SIMULATION-STRATEGY.md](./DATA-SIMULATION-STRATEGY.md) | **Start here.** Authoritative scope document defining Phase 1 boundaries and simulation contract |
| [PHASED-BUILD-PLAN.md](./PHASED-BUILD-PLAN.md) | **Execution roadmap.** Three-phase plan from static demo to production-ready |
| [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) | Master vision document with agents and architecture |
| [STRATEGIC-REFRAME.md](./STRATEGIC-REFRAME.md) | Architectural clarity: unified console vs. separate apps |
| [SPRINT-FOCUS.md](./SPRINT-FOCUS.md) | Development priorities for Phase 1 (P0-P3) |
| [../README.md](../README.md) | Repository overview and quick start |
| [../CLAUDE.md](../CLAUDE.md) | AI development guidance for Claude Code |

### Brand & Messaging

| Document | Description |
|----------|-------------|
| [brand/BRAND-ARCHITECTURE.md](./brand/BRAND-ARCHITECTURE.md) | Naming conventions, brand hierarchy, quick reference |
| [brand/STAKEHOLDER-MESSAGING.md](./brand/STAKEHOLDER-MESSAGING.md) | Tailored messaging for different audiences |
| [adr/ADR-002-brand-naming-strategy.md](./adr/ADR-002-brand-naming-strategy.md) | Decision rationale for naming strategy |

### Architecture

| Document | Description |
|----------|-------------|
| [architecture/GCP-ARCHITECTURE.md](./architecture/GCP-ARCHITECTURE.md) | GCP infrastructure patterns, serverless design, cost estimates |
| [architecture/OPEN-SOURCE-INVENTORY.md](./architecture/OPEN-SOURCE-INVENTORY.md) | Complete inventory of open source tools with GitHub links |
| [architecture/UX-VISION.md](./architecture/UX-VISION.md) | "Tactical Futurism" design philosophy, mockups, prototyping guide |
| [architecture/AGENT-MESSAGING-PROTOCOL.md](./architecture/AGENT-MESSAGING-PROTOCOL.md) | AgentBriefingEvent schema and messaging patterns |
| [architecture/BRIEFING-UX-SPEC.md](./architecture/BRIEFING-UX-SPEC.md) | UI rendering spec for AgentBriefingEvents and reasoning transparency |
| [architecture/LEGACY-INTEGRATION-SCHEMAS.md](./architecture/LEGACY-INTEGRATION-SCHEMAS.md) | TRACS, FSVeg export schemas for USFS legacy system integration |

### Agent Specifications ("The Crew")

| Agent | Role Title | Document | Purpose |
|-------|------------|----------|---------|
| **Recovery Coordinator** | **Root Agent** | [agents/RECOVERY-COORDINATOR-SPEC.md](./agents/RECOVERY-COORDINATOR-SPEC.md) | **Orchestration layer — this is the product for Phase 1** |
| Burn Analyst | The Burn Analyst | [agents/BURN-ANALYST-SPEC.md](./agents/BURN-ANALYST-SPEC.md) | Satellite burn severity assessment |
| Trail Assessor | The Trail Assessor | [agents/TRAIL-ASSESSOR-SPEC.md](./agents/TRAIL-ASSESSOR-SPEC.md) | Trail damage detection |
| Cruising Assistant | The Cruising Assistant | [agents/TIMBER-CRUISER-SPEC.md](./agents/TIMBER-CRUISER-SPEC.md) | Multimodal timber inventory |
| NEPA Advisor | The NEPA Advisor | [agents/COMPLIANCE-ADVISOR-SPEC.md](./agents/COMPLIANCE-ADVISOR-SPEC.md) | NEPA regulatory guidance |

### Assets & Design

| Document | Description |
|----------|-------------|
| [assets/USER-JOURNEYS-AND-PERSONAS.md](./assets/USER-JOURNEYS-AND-PERSONAS.md) | User personas and journey maps for RANGER Command Console |
| [assets/SYSTEM-ARCHITECTURE-WIREFRAME.md](./assets/SYSTEM-ARCHITECTURE-WIREFRAME.md) | ASCII wireframes for system architecture |

### Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-tech-stack.md) | Technology Stack Selection | Accepted |
| [ADR-002](./adr/ADR-002-brand-naming-strategy.md) | Brand Naming Strategy | Accepted |

### Workshop (Production Vision)

Expert panel workshop outputs describing the full production vision. See [workshop/](./workshop/) for details.

| Document | Description |
|----------|-------------|
| [workshop/README.md](./workshop/README.md) | Workshop overview and navigation |
| [workshop/ranger_workshop.md](./workshop/ranger_workshop.md) | Full 4-phase expert discourse |
| [workshop/ranger_roadmap.md](./workshop/ranger_roadmap.md) | 26-week implementation blueprint ($704K) |
| [workshop/ranger_executive.md](./workshop/ranger_executive.md) | Executive summary and funding request |
| [workshop/WORKSHOP-DEMO-ALIGNMENT.md](./workshop/WORKSHOP-DEMO-ALIGNMENT.md) | **How workshop vision maps to our demo** |

### Audit

| Document | Description |
|----------|-------------|
| [audit/DOCUMENTATION-CLEANUP.md](./audit/DOCUMENTATION-CLEANUP.md) | Documentation cleanup prompts and checklist |

### Archive

Archived documents from the initial exploration phase are available in [archive/](./archive/). These contain ideation artifacts and research that have been superseded by current documents.

## Document Conventions

### Status Labels

- **Draft** - Work in progress
- **Review** - Ready for team review
- **Accepted** - Approved and final
- **Superseded** - Replaced by newer document

### File Naming

- `UPPERCASE-WORDS.md` - Primary documents
- `lowercase-words.md` - Supporting documents
- `ADR-NNN-title.md` - Architecture Decision Records

## Contributing

1. Create documents in appropriate directory
2. Add to this index
3. Use consistent formatting (see existing docs)
4. Include status and date in header

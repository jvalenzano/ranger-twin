# RANGER Documentation

> **"Recovery at the speed of insight."**

## Quick Navigation

### Core Documents

| Document | Description |
|----------|-------------|
| [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) | **Start here.** Master document with vision, agents, 6-week sprint plan |
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

### Agent Specifications ("The Crew")

| Agent | Role Title | Document | Purpose |
|-------|------------|----------|---------|
| Burn Analyst | The Burn Analyst | [agents/BURN-ANALYST-SPEC.md](./agents/BURN-ANALYST-SPEC.md) | Satellite burn severity assessment |
| Trail Assessor | The Trail Assessor | [agents/TRAIL-ASSESSOR-SPEC.md](./agents/TRAIL-ASSESSOR-SPEC.md) | Trail damage detection |
| Cruising Assistant | The Cruising Assistant | [agents/TIMBER-CRUISER-SPEC.md](./agents/TIMBER-CRUISER-SPEC.md) | Multimodal timber inventory |
| NEPA Advisor | The NEPA Advisor | [agents/COMPLIANCE-ADVISOR-SPEC.md](./agents/COMPLIANCE-ADVISOR-SPEC.md) | NEPA regulatory guidance |

### Research

| Document | Description |
|----------|-------------|
| [research/MARKET-RESEARCH.md](./research/MARKET-RESEARCH.md) | Competitive landscape, go/no-go analysis, risk assessment |
| [research/DATA-RESOURCES.md](./research/DATA-RESOURCES.md) | Public data sources, access methods |
| [research/DATA-STRATEGY.md](./research/DATA-STRATEGY.md) | Data curation and pipeline strategy |

### Assets & Mockup Generation

| Document | Description |
|----------|-------------|
| [assets/MOCKUP-SESSION-LOG.md](./assets/MOCKUP-SESSION-LOG.md) | **Active session.** Current progress, pending fixes, next steps |
| [assets/VIBE-CODING-GUIDE.md](./assets/VIBE-CODING-GUIDE.md) | Vibe coding workflow with Google AI Studio Build mode |
| [assets/DESIGN-SPEC-HANDOFF.md](./assets/DESIGN-SPEC-HANDOFF.md) | **Engineering handoff.** CSS, typography, map layer specs |
| [assets/AI-STUDIO-PROMPT.md](./assets/AI-STUDIO-PROMPT.md) | Full prompt with system instructions and iteration strategies |
| [assets/GOOGLE-AI-STUDIO-WORKFLOW.md](./assets/GOOGLE-AI-STUDIO-WORKFLOW.md) | Legacy Playground workflow (reference) |
| [assets/MOCKUP-GENERATION.md](./assets/MOCKUP-GENERATION.md) | Design brief, Midjourney/Figma alternatives |
| [assets/ranger-mockup.png](./assets/ranger-mockup.png) | Current Command Console mockup (placeholder) |

### Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-tech-stack.md) | Technology Stack Selection | Accepted |
| [ADR-002](./adr/ADR-002-brand-naming-strategy.md) | Brand Naming Strategy | Accepted |

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

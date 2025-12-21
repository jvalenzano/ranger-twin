# RANGER Brand Architecture

**Version:** 1.1
**Date:** December 20, 2025
**Status:** Accepted (see [ADR-002](../adr/ADR-002-brand-naming-strategy.md))

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RANGER BRAND HIERARCHY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INITIATIVE                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PROJECT RANGER                                                      │   │
│  │  "The strategic effort to modernize post-fire recovery"              │   │
│  │  Use for: Budget docs, Hill briefings, leadership comms              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  PLATFORM                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RANGER: The USFS Digital Twin                                       │   │
│  │  "Agentic OS for Natural Resource Recovery"                          │   │
│  │  Use for: Product references, technical architecture                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│           ┌────────────┬───────────┼───────────┬────────────┐              │
│           ▼            ▼           ▼           ▼            ▼              │
│  AGENTS (The Crew)                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  BURN    │  │  TRAIL   │  │ CRUISING │  │   NEPA   │  │ RECOVERY │     │
│  │ ANALYST  │  │ ASSESSOR │  │ ASSISTANT│  │  ADVISOR │  │COORDINATR│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│   Severity      Damage        Timber        Compliance    Orchestration     │
│   Mapping       Inventory     Inventory     Guidance      & Planning        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Vision Statement

> **RANGER is an Agentic OS for Natural Resource Recovery, built on open-source infrastructure and Google ADK orchestration. It transforms siloed data into coordinated intelligence, enabling "Forest Floor to Washington" oversight.**

RANGER is the **nerve center**, not the sensors. It orchestrates AI agents that coordinate across the post-fire recovery lifecycle, synthesizing insights from existing data sources rather than replacing them.

---

## The Three Tiers

### Tier 1: The Initiative

| Element | Value |
|---------|-------|
| **Name** | Project RANGER |
| **Type** | Strategic initiative name |
| **Purpose** | Frames the effort as a funded, mission-oriented modernization program |
| **Use Cases** | Budget justifications, Congressional briefings, executive summaries, press releases |
| **Never Use** | As a product name in technical documentation or code |

**Example Usage:**
> "Project RANGER is a strategic initiative to modernize post-fire forest recovery operations using AI-powered digital twin technology."

---

### Tier 2: The Platform

| Element | Value |
|---------|-------|
| **Name** | RANGER |
| **Full Name** | RANGER: The USFS Digital Twin |
| **Positioning** | Agentic OS for Natural Resource Recovery |
| **Type** | Platform / product name |
| **Purpose** | Nerve center that orchestrates AI agents coordinating across post-fire recovery |
| **Use Cases** | Product documentation, technical architecture, user interfaces, code references |
| **Voice Interaction** | "Hey Ranger, show me the burn severity analysis." |

**Example Usage:**
> "RANGER is built on a 100% open source application stack, with 80% of investment directed toward AI agent capabilities."

---

### Tier 3: The Agents (The Crew)

| Agent | Role Title | Function | Voice Address |
|-------|------------|----------|---------------|
| **Burn Analyst** | The Burn Analyst | Satellite-based burn severity assessment | "Ask the Burn Analyst..." |
| **Trail Assessor** | The Trail Assessor | AI-powered trail damage detection | "The Trail Assessor found..." |
| **Cruising Assistant** | The Cruising Assistant | Multimodal timber inventory capture | "Hey Ranger, start a cruise" |
| **NEPA Advisor** | The NEPA Advisor | RAG-powered regulatory guidance | "What does the NEPA Advisor say?" |
| **Recovery Coordinator** | Recovery Coordinator | Multi-agent orchestration | "Generate a recovery plan" |

**Design Principle:** Agent names are **role titles**, not product names. This frames AI as "digital colleagues" rather than replacement technology.

---

## Naming Conventions by Context

| Context | Format | Examples |
|---------|--------|----------|
| **Code (classes, modules)** | PascalCase | `BurnAnalyst`, `TrailAssessor`, `CruisingAssistant` |
| **Code (directories)** | kebab-case | `burn-analyst/`, `trail-assessor/`, `cruising-assistant/` |
| **API Endpoints** | kebab-case | `/api/agents/burn-analyst/query` |
| **UI Labels** | Title Case | "Burn Analyst", "Trail Assessor" |
| **Documentation** | "The" prefix | "The Burn Analyst provides...", "Ask the NEPA Advisor" |
| **Informal speech** | Shortened | "the analyst", "the assessor", "the advisor" |

---

## Taglines

### Primary Tagline
> **"Recovery at the speed of insight."**

### Alternate Taglines

| Audience | Tagline |
|----------|---------|
| **Leadership** | "AI-powered decisions for forest recovery." |
| **Field Staff** | "Your digital crew for post-fire recovery." |
| **Technical** | "Agent-first. Open source. Federal-ready." |
| **Budget** | "Zero licensing. Maximum intelligence." |

---

## Visual Identity

### Logo Usage

| Variant | Use Case |
|---------|----------|
| **RANGER** (wordmark) | Primary logo for platform |
| **Project RANGER** | Initiative documents, presentations |
| **RANGER: The USFS Digital Twin** | Technical documentation, architecture diagrams |

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-ranger-primary` | `#10B981` | Safe/success states, RANGER brand accent |
| `--color-ranger-warning` | `#F59E0B` | Moderate severity, caution |
| `--color-ranger-severe` | `#EF4444` | High severity, critical |
| `--color-ranger-dark` | `#0F172A` | Primary background |
| `--color-ranger-surface` | `#1E293B` | Card/panel backgrounds |

---

## Migration from Legacy Names

| Legacy Name | New Name | Notes |
|-------------|----------|-------|
| FireSight | Burn Analyst | Agent name only; no "FireSight" in final product |
| FireSight Lite | Burn Analyst | Same agent; "Lite" was development-phase reference |
| TrailScan AI | Trail Assessor | Drop "AI" suffix; role title is sufficient |
| TimberScribe | Cruising Assistant | "Assistant" emphasizes human-in-the-loop |
| PolicyPilot | NEPA Advisor | "Advisor" implies expertise, not autopilot |
| Cedar Creek Digital Twin | RANGER | Platform name; Cedar Creek is the demo context |
| Project RANGER AI | Project RANGER | Drop "AI" from initiative name |

---

## Do's and Don'ts

### Do

- Use "RANGER" as the primary platform name
- Refer to agents by their role titles ("the Burn Analyst")
- Include confidence levels and citations in all agent outputs
- Frame agents as "digital colleagues" that assist human experts
- Use "Project RANGER" for strategic/leadership communications

### Don't

- Put "AI" in the platform or agent names
- Use legacy product names (FireSight, TrailScan, etc.) in user-facing materials
- Imply that agents replace human judgment
- Use "RANGER AI" — the AI is implicit in the capability
- Mix initiative and platform names (e.g., "Project RANGER platform")

---

## Quick Copy

### For Presentations

```
INITIATIVE:  Project RANGER
PLATFORM:    RANGER: The USFS Digital Twin
POSITIONING: Agentic OS for Natural Resource Recovery
TAGLINE:     Recovery at the speed of insight.

THE CREW:
• Burn Analyst — Automates severity mapping
• Trail Assessor — Digitizes damage inventory
• Cruising Assistant — Transcribes field data
• NEPA Advisor — Accelerates compliance
• Recovery Coordinator — Orchestrates multi-agent coordination
```

### For Technical Documentation

```
Platform: RANGER
Version: 1.0
Architecture: Agent-first digital twin

Agents:
- BurnAnalyst (services/agents/burn-analyst/)
- TrailAssessor (services/agents/trail-assessor/)
- CruisingAssistant (services/agents/cruising-assistant/)
- NEPAAdvisor (services/agents/nepa-advisor/)
- RecoveryCoordinator (services/agents/recovery-coordinator/)
```

---

## References

- [ADR-002: Brand Naming Strategy](../adr/ADR-002-brand-naming-strategy.md) — Decision rationale
- [STAKEHOLDER-MESSAGING.md](./STAKEHOLDER-MESSAGING.md) — Audience-specific messaging
- [PROJECT-BRIEF.md](../PROJECT-BRIEF.md) — Master project document

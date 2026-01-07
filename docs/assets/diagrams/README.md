# RANGER Architecture Diagrams

Visual explanations of RANGER's architecture, value proposition, and technical contracts.

## Quick Links

- **[PLANNED-DIAGRAMS.md](developer/PLANNED-DIAGRAMS.md)** — Generation prompts for missing developer diagrams
- **[DIAGRAM-NARRATIVES.md](DIAGRAM-NARRATIVES.md)** — Speaker notes and detailed walkthroughs

---

## The Diagram Set

### Context & Introduction

| Diagram | Audience | Question It Answers | Status |
|---------|----------|---------------------|--------|
| [Cedar Creek Fire 2022](stakeholder/Cedar%20Creek%20Fire%202022.png) | All | "Why does this problem matter?" | ✅ Current |

### Technical Architecture (Skills-First ADK)

| Diagram | Audience | Question It Answers | Status |
|---------|----------|---------------------|--------|
| [Skills-First Architecture](stakeholder/skills-first-architecture.png) | All | "What's the high-level architecture?" | ✅ Current |
| [Phase 4 ADK Developer Stack](developer/) | Developers | "What ports are running? Where do I look?" | 📋 Planned |
| [ADK Data Flow & SSE Streaming](developer/) | Architects | "How do events stream to the UI?" | 📋 Planned |
| [The MCP Abstraction Layer](developer/) | Technical | "How do we switch between Fixtures and Real Data?" | 📋 Planned |
| [The Coordinator's Skill Roster](developer/) | Developers | "Which agent has which skills?" | 📋 Planned |
| [AgentBriefingEvent Rendering Pipeline](developer/AgentBriefingEvent%20Rendering%20Pipeline.png) | Developers | "How do events become UI?" | ✅ Current |
| [The Knowledge Pipeline (RAG Architecture)](developer/rag-knowledge-pipeline.png) | Developers | "How does the AI know that?" | 📋 Planned |

### Developer Deep-Dives

| Diagram | Audience | Question It Answers | Status |
|---------|----------|---------------------|--------|
| [ADK Runtime & Skills](developer/adk-runtime-skills.png) | Developers | "How does ADK load and execute skills?" | ✅ Current |
| [Agent Briefing Event](developer/agent-briefing-event.png) | Developers | "What's the event schema?" | ✅ Current |
| [Developer Port Map](developer/developer-port-map.png) | Developers | "Which service is on which port?" | ✅ Current |
| [MCP Data Layer](developer/mcp-data-layer.png) | Developers | "How does MCP connect to data?" | ✅ Current |
| [Proof Layer Rendering](developer/proof-layer-rendering.png) | Developers | "How does the UI show reasoning?" | ✅ Current |
| [Skill Anatomy](developer/skill-anatomy.png) | Developers | "What's inside a skill folder?" | ✅ Current |
| [SSE Streaming Flow](developer/sse-streaming-flow.png) | Developers | "How does SSE work?" | ✅ Current |
| [Three-Layer Enforcement](developer/three-layer-enforcement.png) | Developers | "How do we prevent infinite loops?" | ✅ Current |

### Stakeholder & Value Proposition

| Diagram | Audience | Question It Answers | Status |
|---------|----------|---------------------|--------|
| [The Cedar Creek Recovery Chain](stakeholder/The%20Cedar%20Creek%20Recovery%20Chain%20(Persona%20Cascade).png) | USFS | "Why should my team care?" | ✅ Current |
| [The Confidence Ledger](stakeholder/The%20Confidence%20Ledger%20(Trust%20Architecture).png) | Procurement | "Can we trust this AI?" | ✅ Current |
| [The Legacy Bridge](stakeholder/The%20Legacy%20Bridge%20(TRACS%20&%20FSVeg%20Export).png) | IT Leaders | "Do we have to replace our systems?" | ✅ Current |
| [Moving Up the Stack](stakeholder/moving-up-the-stack.png) | Executives | "Where does value live in AI?" | ✅ Current |
| [RANGER Value Loop](stakeholder/ranger-value-loop.png) | Executives | "What's the business model?" | ✅ Current |
| [Maria's Morning](stakeholder/marias-morning.png) | USFS | "What does a day look like?" | ✅ Current |
| [Federal Compliance Overview](stakeholder/federal-compliance-overview.png) | Compliance | "How do we meet federal requirements?" | ✅ Current |
| [The Federal Knowledge Base](stakeholder/federal-knowledge-base.png) | Stakeholder | "Can we trust this?" | 📋 Planned |

### [ARCHIVED] Legacy Diagrams

These diagrams depict superseded Phase 1-3 microservice architecture. Preserved for historical reference.

| Diagram | Superseded By | Notes |
|---------|---------------|-------|
| [Local Developer Stack](legacy/Local%20Developer%20Stack.png) | Phase 4 ADK Developer Stack | Showed ports 8001-8004 |
| [How the pieces fit together](legacy/How%20the%20pieces%20fit%20together.png) | ADK Data Flow & SSE Streaming | Phase 1 vs Phase 2 split |
| [Agentic AI Architecture](legacy/Agentic%20AI%20Architecture.png) | Skills-First Architecture | Python Agent Services |
| [Coordinator Routing](legacy/Coordinator%20Routing%20&%20Cross-Agent%20Cascade.png) | Coordinator's Skill Roster | sub_agents pattern |
| [Phase 1 Architecture Boundaries](legacy/Phase%201%20Architecture%20Boundaries.png) | MCP Abstraction Layer | Mock MCP Layer |

---

## Quick Reference by Audience

### For Developer Onboarding
1. [Cedar Creek Fire 2022](stakeholder/Cedar%20Creek%20Fire%202022.png) — Context
2. **Phase 4 ADK Developer Stack** — Ports (📋 Planned)
3. [Skills-First Architecture](stakeholder/skills-first-architecture.png) — High-level
4. [ADK Runtime & Skills](developer/adk-runtime-skills.png) — Runtime details

### For Investor/Partner Presentations
1. [Cedar Creek Fire 2022](stakeholder/Cedar%20Creek%20Fire%202022.png) — Problem
2. [Moving Up the Stack](stakeholder/moving-up-the-stack.png) — Strategy
3. [The Cedar Creek Recovery Chain](stakeholder/The%20Cedar%20Creek%20Recovery%20Chain%20(Persona%20Cascade).png) — Value

### For Government Procurement
1. [Cedar Creek Fire 2022](stakeholder/Cedar%20Creek%20Fire%202022.png) — Context
2. [The Confidence Ledger](stakeholder/The%20Confidence%20Ledger%20(Trust%20Architecture).png) — Trust
3. [The Legacy Bridge](stakeholder/The%20Legacy%20Bridge%20(TRACS%20&%20FSVeg%20Export).png) — Integration
4. [Federal Compliance Overview](stakeholder/federal-compliance-overview.png) — Compliance

### For USFS Field Staff
1. [Cedar Creek Fire 2022](stakeholder/Cedar%20Creek%20Fire%202022.png) — Their fire
2. [The Cedar Creek Recovery Chain](stakeholder/The%20Cedar%20Creek%20Recovery%20Chain%20(Persona%20Cascade).png) — Their workflow

---

## Visual Style Guide

All diagrams share a consistent "tactical whiteboard" aesthetic:

| Element | Specification |
|---------|--------------|
| **Background** | Dark slate (#0F172A) |
| **Lines** | Chalk-drawn white, slight imperfection |
| **Agent Icons** | 🔥 Burn, 🥾 Trail, 🌲 Timber, 📋 NEPA, 🧠 Coordinator |
| **Colors** | Emerald (#10B981), Amber (#F59E0B), Red (#EF4444) |
| **Typography** | Hand-lettered labels, monospace for code |
| **Flow** | Left-to-right or top-to-bottom |

This style reinforces RANGER's identity as an operational tool for real-world decision-making.

---

## Creating New Diagrams

See **[PLANNED-DIAGRAMS.md](developer/PLANNED-DIAGRAMS.md)** for:
- Production-ready generation prompts
- Actual skill inventory (verified from codebase)
- Post-generation checklist

When creating diagrams:
1. Follow the prompt structure in PLANNED-DIAGRAMS.md
2. Maintain the chalk-on-slate aesthetic
3. Use consistent agent iconography
4. Include ADR references where architectural claims are made
5. Save to appropriate subdirectory (developer/ or stakeholder/)

---

## File Organization

```
diagrams/
├── README.md                    # This file
├── DIAGRAM-NARRATIVES.md        # Speaker notes and walkthroughs
├── developer/                   # Technical diagrams
│   ├── PLANNED-DIAGRAMS.md      # Generation prompts for missing diagrams
│   ├── adk-runtime-skills.png
│   ├── agent-briefing-event.png
│   └── ...
├── stakeholder/                 # Executive/USFS diagrams
│   ├── skills-first-architecture.png
│   ├── Cedar Creek Fire 2022.png
│   └── ...
└── legacy/                      # Archived Phase 1-3 diagrams
    ├── Local Developer Stack.png
    └── ...
```

---

## Audit Status

Last audit: **December 28, 2025**

| Category | Count | Status |
|----------|-------|--------|
| Current (Phase 4) | 21 | ✅ Accurate |
| Planned | 4 | 📋 Prompts ready |
| Archived | 5 | ✅ Properly segregated |

Next audit recommended after Phase 4 deployment completion.

---

*Maintained by jvalenzano — Digital Twin Initiative*

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **MCP** | Model Context Protocol | Protocol for data connectivity |
| **NEPA** | National Environmental Policy Act | Federal environmental assessment law |
| **RAG** | Retrieval-Augmented Generation | AI pattern combining retrieval + LLM |
| **SSE** | Server-Sent Events | HTTP-based real-time streaming |

→ **[Full Glossary](../../GLOSSARY.md)**

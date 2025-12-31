# Architecture Decision Records

> **Quick Reference:** Read the relevant ADRs *before* making changes to avoid architectural debt.

## Decision Index

| ADR | Title | Status | The One Thing (Operational Consequence) |
|-----|-------|--------|-----------------------------------------|
| [001](./ADR-001-tech-stack.md) | Technology Stack | **Amended** | Core stack is React/Postgres, but **ADR-005** overrides the orchestration layer. |
| [002](./ADR-002-brand-naming-strategy.md) | Brand Naming | **Accepted** | Use "RANGER" and official USDA terminology; avoid "Twin" or "Chatbot". |
| [004](./ADR-004-site-analysis-openrouter.md) | Site Analysis & OpenRouter | **Superseded** | **DEAD**. Use ADR-006. Site analysis feature specs remain valid. |
| [005](./ADR-005-skills-first-architecture.md) | Skills-First Architecture | **Accepted** | **Skills** (portable `skill.md` folders) are the primary value unit, not Agents. |
| [006](./ADR-006-google-only-llm-strategy.md) | Google-Only LLM Strategy | **Accepted** | **NO API KEYS**. Use Application Default Credentials (ADC) for everything. |
| [007](./ADR-007-tool-invocation-strategy.md) | Tool Invocation (Old) | **Superseded** | **DO NOT USE** `mode="ANY"`. Read ADR-007.1. |
| [007.1](./ADR-007.1-tool-invocation-strategy.md) | Tool Invocation (fixed) | **Accepted** | Use `mode="AUTO"` + validation loop to prevent infinite tool loops. |
| [008](./ADR-008-agent-tool-pattern.md) | AgentTool Pattern | **Accepted** | Coordinator calls specialists as **Tools** (`AgentTool`), NOT `sub_agents`. |
| [009](./ADR-009-fixture-first-development.md) | Fixture-First Dev | **Accepted** | Build against **static fixtures** first to guarantee demo reliability. |
| [010](./ADR-010-vertex-rag-migration.md) | Vertex RAG Integration | **Accepted** | RAG infra is on Vertex AI RAG Engine (`us-central1` model / `europe-west3` corpus). |
| [011](./ADR-011-rag-authentication-pattern.md) | RAG Auth Pattern | **Accepted** | Use **Pattern A** (Manual Retrieval + Generation) with ADC. SDK auto-grounding is broken. |

---

## Which ADRs Apply to My Task?

### 🤖 Adding or Modifying Agents
- **[ADR-005](./ADR-005-skills-first-architecture.md)**: Understand the Skills-First directory structure and `skill.md` format.
- **[ADR-008](./ADR-008-agent-tool-pattern.md)**: **CRITICAL**. Use `AgentTool` wrappers for specialist orchestration.
- **[ADR-007.1](./ADR-007.1-tool-invocation-strategy.md)**: **CRITICAL**. Follow `mode="AUTO"` patterns to avoid infinite loops.

### 🧠 Working with RAG / Knowledge Base
- **[ADR-011](./ADR-011-rag-authentication-pattern.md)**: **CRITICAL**. Copy the authentication pattern exactly (Two-Step with ADC).
- **[ADR-010](./ADR-010-vertex-rag-migration.md)**: Context on why we use specific regions (`us-central1` vs `europe-west3`).

### 🚀 Deployment & Infrastructure
- **[ADR-006](./ADR-006-google-only-llm-strategy.md)**: Ensure NO API keys are in the environment variables workflow. Use ADC.

### 🧪 Building Demos & Tests
- **[ADR-009](./ADR-009-fixture-first-development.md)**: Always implement a fixture fallback for reliability.

---

## ADR Status Legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Active decision. You must follow this. |
| **Amended** | Partially active, but modified by a later ADR (check notes). |
| **Superseded** | **DO NOT USE**. Replaced by a newer decision. Kept for history. |
| **Proposed** | Under discussion. Not yet binding. |

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADC** | Application Default Credentials | GCP authentication mechanism |
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **MCP** | Model Context Protocol | Protocol for data connectivity |
| **RAG** | Retrieval-Augmented Generation | AI pattern combining retrieval + LLM |
| **SDK** | Software Development Kit | Tools for building software |

→ **[Full Glossary](../GLOSSARY.md)**

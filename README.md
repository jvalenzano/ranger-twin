# RANGER: AI-Powered Forest Recovery Coordination

> **Status**: Phase 0 Deployment (Basic Auth, Static Hosting)  
> **Version**: v0.1.0  
> **Architecture**: Skills-First Multi-Agent System (ADR-005)

## What Is RANGER?

RANGER is an **Agentic Operating System** for post-fire forest recovery that coordinates specialized AI agents to deliver integrated briefings in minutes instead of days.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     RANGER STACK                             │
├─────────────────────────────────────────────────────────────┤
│  UI (Command Console)  → React + Tactical Futurism Design    │
│  Agent Pipeline        → Google ADK + Gemini 2.0 Flash       │
│  Skills Library        → Portable expertise packages         │
│  MCP Connectivity      → Decentralized data bridge           │
└─────────────────────────────────────────────────────────────┘
```

## The 5 Production Agents

| Agent | Skills | Purpose |
|-------|--------|---------|
| **Recovery Coordinator** | Delegation, Portfolio Triage | Orchestrates multi-agent briefings |
| **Burn Analyst** | MTBS Classification, Severity Mapping | Fire impact assessment |
| **Trail Assessor** | Damage Classification, Closure Decisions | Infrastructure damage evaluation |
| **Cruising Assistant** | Volume Estimation, Salvage Assessment | Timber recovery planning |
| **NEPA Advisor** | Pathway Decision, Compliance Documentation | Environmental compliance |

## Key Principles

1. **Skills-First**: Expertise lives in portable, testable skill packages, not monolithic prompts
2. **MCP-First**: All data flows through Model Context Protocol for decentralized access
3. **Proof Layer**: Every AI insight includes reasoning chains, citations, confidence scores
4. **Federal-Ready**: Built for FedRAMP compliance, audit trails, and transparency

## Quick Start

```bash
# Clone repository
git clone https://github.com/TechTrend-Federal/ranger-twin.git
cd ranger-twin

# Development setup
python -m venv .venv
source .venv/bin/activate  # or `.venv/Scripts/activate` on Windows
pip install -r requirements.txt

# Run agents locally (ADK Web Interface)
cd agents
adk web --port 8000
# → http://localhost:8000
```

**Agent Documentation:** See [agents/README.md](agents/README.md) for the full agent roster and development guide.

## Documentation

| Document | Purpose |
|----------|---------|
| [ADR-005](docs/adr/ADR-005-skills-first-architecture.md) | Skills-First architecture decision |
| [ADR-006](docs/adr/ADR-006-google-only-llm-strategy.md) | Google-only LLM strategy |
| [PROOF-LAYER-DESIGN](docs/specs/PROOF-LAYER-DESIGN.md) | AI transparency specification |
| [PROTOCOL-AGENT-COMMUNICATION](docs/specs/PROTOCOL-AGENT-COMMUNICATION.md) | Agent messaging standard |
| [GLOSSARY](docs/GLOSSARY.md) | 100+ acronyms and domain terms |
| [CHANGELOG](CHANGELOG.md) | Release history |

## Production Endpoints

| Service | URL |
|---------|-----|
| Orchestrator | `https://ranger-orchestrator-1058891520442.us-west1.run.app` |
| Frontend | `https://ranger-frontend-1058891520442.us-west1.run.app` |

---

## Glossary

Key acronyms used in this document:

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **FedRAMP** | Federal Risk and Authorization Management Program | Cloud security authorization for federal agencies |
| **MCP** | Model Context Protocol | Protocol for data connectivity between agents |
| **MTBS** | Monitoring Trends in Burn Severity | USGS/USFS program mapping fire severity |
| **NEPA** | National Environmental Policy Act | Federal environmental impact assessment law |

→ **[Full Glossary](docs/GLOSSARY.md)** — Complete definitions for all RANGER terms and acronyms.

---

## License

[Your License Here]

## Contact

TechTrend Federal - Digital Twin Initiative  
[Your Contact Info]

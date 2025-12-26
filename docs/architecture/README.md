# RANGER Architecture Documentation

This directory contains the comprehensive architecture specifications for the RANGER fire recovery platform.

---

## Quick Reference

| Document | Purpose | Audience | Status |
|----------|---------|----------|--------|
| **[ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md)** | **Primary Architecture Decision.** Multi-agent + Skills hybrid model | All team members | **NORTH STAR** |
| **[AGENTIC-ARCHITECTURE.md](AGENTIC-ARCHITECTURE.md)** | Legacy microservice orchestration design (Superseded) | All team members | **[AMENDED]** |
| **[GCP-DEPLOYMENT.md](GCP-DEPLOYMENT.md)** | Deploy 7 Cloud Run services (agents, gateway, UI) | DevOps, Developers | Phase 2 Planning |
| **[DATA-INGESTION-ADAPTERS.md](DATA-INGESTION-ADAPTERS.md)** | Normalize external data (InciWeb, IRWIN, Survey123) via MCP | Backend Developers | **[AMENDED]** |
| **[FIXTURE-DATA-FORMATS.md](FIXTURE-DATA-FORMATS.md)** | Phase 1 fixture schemas and production mappings | All Developers | Active |
| **[AGENT-MESSAGING-PROTOCOL.md](AGENT-MESSAGING-PROTOCOL.md)** | AgentBriefingEvent schema and UI binding contracts | Frontend/Backend | Active |
| **[FIELD-AI-STRATEGY.md](FIELD-AI-STRATEGY.md)** | Field Companion PWA strategy (Phase 2+) | Product | Future Vision |

---

## Architecture Layers

## The Skills-First Four-Layer Stack

Aligned with **ADR-005** and the **IMPLEMENTATION-ROADMAP**, RANGER is built on a four-layer architecture:

### 1. **UI Layer** (Presentation)
- **Command Console** (React, Vite) - Single-incident/portfolio triage console
- **Field Companion PWA** (Phase 2) - Offline-first mobile field agent
- See: [UX-VISION.md](UX-VISION.md), [BRIEFING-UX-SPEC.md](BRIEFING-UX-SPEC.md)

### 2. **Agent Pipeline Layer** (Orchestration)
- **Recovery Coordinator** (Google ADK) - Orchestrates specialist agents
- **ADK Session State** - Global state managed by Google ADK (supersedes Redis)
- See: [AGENTIC-ARCHITECTURE.md](AGENTIC-ARCHITECTURE.md), [AGENT-MESSAGING-PROTOCOL.md](AGENT-MESSAGING-PROTOCOL.md)

### 3. **Skills Library Layer** (Domain Expertise)
- **Specialist Agents** (Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor)
- **Skill Packages** - Portable domain logic (FSM/FSH compliance, geospatial analysis)
- See: [ADR-005](../adr/ADR-005-skills-first-architecture.md)

### 4. **MCP Connectivity Layer** (Data Integration)
- **MCP Servers** - Standardized connectivity to external data (NIFC, FIRMS, Survey123)
- **Data Adapters** - Normalization to RANGER Common Data Schema (CDS)
- See: [DATA-INGESTION-ADAPTERS.md](DATA-INGESTION-ADAPTERS.md), [FIXTURE-DATA-FORMATS.md](FIXTURE-DATA-FORMATS.md)

---

## Deployment Architecture

### Local Development (Phase 1 - Current)
```
Docker Compose
  ├─ Command Console (localhost:5173)
  ├─ API Gateway (localhost:8000)
  ├─ Recovery Coordinator (localhost:8005)
  └─ 4 Specialist Agents (localhost:8001-8004)

Data: JSON fixtures in data/fixtures/cedar-creek/
AI: Vertex AI Gemini 3 Flash (remote)
```

**See:** Local Developer Stack diagram in `docs/assets/diagrams/`

### Cloud Production (Phase 2 - Planned)
```
Google Cloud Platform (us-east4, FedRAMP High)
  ├─ Cloud Run Services (7 services, auto-scaling)
  ├─ Cloud SQL PostGIS (vector data)
  ├─ Cloud Storage (rasters, fixtures)
  ├─ BigQuery GIS (analytics)
  ├─ Memorystore Redis (session state)
  └─ Vertex AI (Gemini 3 Flash)

Cost: ~$250-450/month (active season)
```

**See:** [GCP-DEPLOYMENT.md](GCP-DEPLOYMENT.md)

---

## Key Design Decisions

### 1. **Pure Google ADK** (Not Hybrid)
- **Decision:** Use only Google ADK ToolCallingAgents, not hybrid frameworks
- **Rationale:** Single framework, sub-second tool calls, FedRAMP compliance
- **Trade-offs:** No code generation capabilities (acceptable for RANGER's use cases)
- **See:** [AGENTIC-ARCHITECTURE.md § Why Pure ADK](AGENTIC-ARCHITECTURE.md#why-pure-adk-not-hybrid)

### 2. **Serverless-First Deployment** (Cloud Run)
- **Decision:** Deploy all services to Cloud Run with scale-to-zero
- **Rationale:** 80-96% cost reduction for seasonal workloads (May-Oct active)
- **Trade-offs:** Cold starts (1-2 seconds) for first request after idle
- **See:** [GCP-DEPLOYMENT.md § Architecture Diagram](GCP-DEPLOYMENT.md#architecture-diagram-gcp-production-stack)

### 3. **Fixture-First Development** (Phase 1)
- **Decision:** Phase 1 uses static JSON fixtures, Phase 2 uses real APIs
- **Rationale:** Prove agent orchestration value before data pipeline complexity
- **Trade-offs:** Fixture maintenance burden, but tool interfaces remain identical
- **See:** [FIXTURE-DATA-FORMATS.md](FIXTURE-DATA-FORMATS.md), `data/fixtures/cedar-creek/README.md`

### 4. **Five Specialized Agents** (Not Three)
- **Decision:** Maintain 4 specialist agents + 1 coordinator (5 total)
- **Rationale:** Domain expertise, parallel execution, USFS org alignment
- **Trade-offs:** More services to deploy, but clearer responsibilities
- **See:** [AGENTIC-ARCHITECTURE.md § Why Five Specialized Agents](AGENTIC-ARCHITECTURE.md#why-five-specialized-agents-not-three)

### 5. **Gemini 3 Flash** (Not Pro)
- **Decision:** Use Gemini 3 Flash as primary model (78% SWE-bench, 3x faster than 2.5 Pro)
- **Rationale:** 4x cheaper than Gemini 3 Pro, sufficient for RANGER's reasoning tasks
- **Trade-offs:** Slightly lower reasoning capability, but cost savings justify choice
- **See:** [AGENTIC-ARCHITECTURE.md § Production Deployment](AGENTIC-ARCHITECTURE.md#production-deployment-phase-2)

---

## Phase Roadmap

### Phase 1: Static Demo (CURRENT)
**Status:** In Development  
**Timeline:** December 2024 - January 2025  
**Goal:** Prove multi-agent orchestration with Cedar Creek Fire fixture data

**Completed:**
- ✅ Agent infrastructure (ADK ToolCallingAgents)
- ✅ Fixture data schemas (burn severity, trail damage, timber plots)
- ✅ Command Console UI (React + Leaflet)
- ✅ AgentBriefingEvent messaging protocol

**In Progress:**
- ⏳ Agent service implementations (4 specialists + coordinator)
- ⏳ WebSocket streaming for real-time briefings
- ⏳ Confidence score visualization

**See:** [PROGRESS-2025.md](../archive/session-logs/PROGRESS-2025.md), `CLAUDE.md`

### Phase 2: Real Data Integration
**Status:** Planning  
**Timeline:** Q1 2025  
**Goal:** Replace fixtures with real data sources (InciWeb, IRWIN, satellite imagery)

**Planned:**
- [ ] Deploy to GCP Cloud Run (7 services)
- [ ] Implement data ingestion adapters (InciWeb, IRWIN, Survey123)
- [ ] Set up geospatial processing pipeline (BigQuery GIS, PostGIS)
- [ ] Integrate Gemini File Search Tool for NEPA Advisor
- [ ] FedRAMP High compliance validation

**See:** [GCP-DEPLOYMENT.md § Migration Playbook](GCP-DEPLOYMENT.md#migration-playbook)

### Phase 3: Field Companion PWA
**Status:** Future  
**Timeline:** Q2-Q3 2025  
**Goal:** Offline-first mobile app for field crews

**See:** [FIELD-AI-STRATEGY.md](FIELD-AI-STRATEGY.md)

---

## Contributing to Architecture Docs

### When to Update
- **New agent added:** Update [AGENTIC-ARCHITECTURE.md](AGENTIC-ARCHITECTURE.md)
- **New fixture added:** Update [FIXTURE-DATA-FORMATS.md](FIXTURE-DATA-FORMATS.md)
- **New UI component:** Update [BRIEFING-UX-SPEC.md](BRIEFING-UX-SPEC.md)
- **New data source:** Update [DATA-INGESTION-ADAPTERS.md](DATA-INGESTION-ADAPTERS.md)
- **GCP service change:** Update [GCP-DEPLOYMENT.md](GCP-DEPLOYMENT.md) or [GCP-ARCHITECTURE.md](GCP-ARCHITECTURE.md)

### Style Guidelines
- Use present tense for current state, future tense for plans
- Include code examples for implementation specs
- Add cross-references to related documents
- Keep DRY: Reference other docs instead of duplicating content
- Update this README when adding new architecture documents

---

**Last Updated:** 2025-12-22  
**Maintained By:** RANGER Architecture Team  
**Questions?** See `CLAUDE.md` for development workflow guidance

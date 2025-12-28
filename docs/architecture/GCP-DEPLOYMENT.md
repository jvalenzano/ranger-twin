# RANGER Cloud Deployment Architecture

**Status:** Active  
**Created:** 2025-12-22  
**Last Updated:** 2025-12-27  
**Author:** RANGER Team  
**Purpose:** Document the actual deployed Cloud Run architecture

---

> [!IMPORTANT]
> **Current State:** RANGER is deployed as **2 Cloud Run services** (not 7). The Recovery Coordinator hosts all agents in a single process using the AgentTool pattern. This document reflects the actual deployed architecture.

---

## Executive Summary

RANGER uses a **simplified Cloud Run deployment** optimized for the Phase 0-1 demo:

| Service | Purpose | URL |
|---------|---------|-----|
| `ranger-console` | React frontend (Mission Control) | `https://ranger-console-xxx-uc.a.run.app` |
| `ranger-coordinator` | ADK backend (all agents) | `https://ranger-coordinator-xxx-uc.a.run.app` |

**Total Services:** 2 (not 7)  
**Monthly Cost:** ~$50-100 (demo scale)  
**Architecture:** Single-process multi-agent (AgentTool pattern)

---

## Architecture: Current Deployed State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYED ARCHITECTURE                            │
│                         (Phase 0-1: Demo)                               │
└─────────────────────────────────────────────────────────────────────────┘

                              Internet
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Cloud Run: ranger-console                                               │
│  Region: us-central1                                                     │
│  Auth: Basic Auth (ranger / RangerDemo2025!)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  React Application (Vite build)                                     │ │
│  │  - Mission Control UI                                               │ │
│  │  - Chat interface (Ask RANGER)                                      │ │
│  │  - MapTiler integration                                             │ │
│  │  - NIFC API direct calls (fire list)                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS (SSE streaming)
                                  │ VITE_ADK_URL environment variable
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Cloud Run: ranger-coordinator                                           │
│  Region: us-central1                                                     │
│  Auth: IAM (service-to-service)                                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Google ADK Runtime                                                 │ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │  Recovery Coordinator (root_agent)                           │   │ │
│  │  │  - Query understanding                                       │   │ │
│  │  │  - Multi-agent orchestration                                 │   │ │
│  │  │  - Response synthesis                                        │   │ │
│  │  └──────────────┬──────────────────────────────────────────────┘   │ │
│  │                 │                                                   │ │
│  │        ┌───────┴───────┬───────────────┬───────────────┐           │ │
│  │        ▼               ▼               ▼               ▼           │ │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │ │
│  │  │  Burn    │   │  Trail   │   │ Cruising │   │  NEPA    │        │ │
│  │  │ Analyst  │   │ Assessor │   │ Assistant│   │ Advisor  │        │ │
│  │  │(AgentTool│   │(AgentTool│   │(AgentTool│   │(AgentTool│        │ │
│  │  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘        │ │
│  │       │              │              │              │               │ │
│  │       └──────────────┴──────────────┴──────────────┘               │ │
│  │                              │                                      │ │
│  │                              ▼                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │  data/fixtures/ (Bundled in Docker image)                    │   │ │
│  │  │  ├── cedar-creek/burn-severity.json                          │   │ │
│  │  │  ├── cedar-creek/trail-damage.json                           │   │ │
│  │  │  ├── cedar-creek/timber-plots.json                           │   │ │
│  │  │  └── cedar-creek/incident-metadata.json                      │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Gemini API calls
                                  ▼
                        ┌────────────────────┐
                        │  Vertex AI         │
                        │  Gemini 2.0 Flash  │
                        │  (FedRAMP High)    │
                        └────────────────────┘
```

---

## What's NOT Deployed (Phase 1)

The following are documented for future phases but **not currently deployed**:

| Component | Status | When Needed |
|-----------|--------|-------------|
| Separate agent microservices | ❌ Not deployed | Never (AgentTool pattern is sufficient) |
| MCP fixture server | ❌ Not deployed | Phase 2 (live data integration) |
| Cloud SQL / PostGIS | ❌ Not deployed | Phase 2 (if self-hosted RAG needed) |
| Firestore sessions | ❌ Not deployed | Phase 2 (multi-user persistence) |
| Memorystore Redis | ❌ Not deployed | Phase 2 (caching layer) |
| Cloud Load Balancer | ❌ Not deployed | Phase 3 (production scale) |
| BigQuery analytics | ❌ Not deployed | Phase 3 (operational analytics) |

---

## Deployment Scripts

### Frontend Deployment

**Script:** `scripts/deploy-frontend.sh`  
**Method:** Cloud Build with `cloudbuild.yaml`

```bash
cd /Users/jvalenzano/Projects/ranger-twin
./scripts/deploy-frontend.sh
```

**Key Configuration:**
- Uses `cloudbuild.yaml` for proper `--build-arg` handling
- MapTiler API key passed as build arg (not runtime env)
- Basic Auth credentials set via `--set-env-vars`

### Backend Deployment

**Script:** Manual `gcloud run deploy` (no script yet)  
**Dockerfile:** `Dockerfile` (root directory)

```bash
cd /Users/jvalenzano/Projects/ranger-twin
gcloud run deploy ranger-coordinator \
  --source . \
  --region us-central1 \
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=TRUE,ALLOW_ORIGINS=https://ranger-console-xxx-uc.a.run.app"
```

---

## Environment Variables

### ranger-console (Frontend)

| Variable | Purpose | Build/Runtime |
|----------|---------|---------------|
| `VITE_MAPTILER_API_KEY` | Map tile rendering | Build-time (ARG) |
| `VITE_ADK_URL` | Backend coordinator URL | Build-time (ARG) |
| `BASIC_AUTH_USERNAME` | Demo access control | Runtime |
| `BASIC_AUTH_PASSWORD` | Demo access control | Runtime |

### ranger-coordinator (Backend)

| Variable | Purpose | Value |
|----------|---------|-------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | `ranger-twin-dev` |
| `GOOGLE_CLOUD_LOCATION` | Region | `us-central1` |
| `GOOGLE_GENAI_USE_VERTEXAI` | FedRAMP compliance path | `TRUE` |
| `ALLOW_ORIGINS` | CORS allowed origins | Frontend URL |
| `SESSION_SERVICE_URI` | Session storage | `None` (in-memory) |

---

## Data Flow

### Current (Demo): Fixtures Bundled in Docker

```
User Query
    │
    ▼
ranger-console (React)
    │
    │ POST /chat or SSE stream
    ▼
ranger-coordinator (ADK)
    │
    ├─► Recovery Coordinator parses intent
    │
    ├─► AgentTool calls to specialists
    │       │
    │       ▼
    │   Skill scripts load from data/fixtures/
    │       │
    │       ▼
    │   Return structured analysis
    │
    ├─► Gemini 2.0 Flash (reasoning, synthesis)
    │
    └─► Return briefing with Proof Layer
```

### Future (Production): MCP to Federal APIs

```
User Query
    │
    ▼
ranger-console
    │
    ▼
ranger-coordinator
    │
    ├─► AgentTool calls to specialists
    │       │
    │       ▼
    │   Skill scripts call MCP client
    │       │
    │       ▼
    │   MCP Server (Cloud Run, HTTP/SSE)
    │       │
    │       ▼
    │   Federal APIs (NIFC, IRWIN, MTBS)
    │
    └─► Return briefing with Proof Layer
```

---

## Cost Analysis (Actual)

### Current Demo Costs

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| `ranger-console` | 1 vCPU, 512MB, scale-to-zero | ~$5-10 |
| `ranger-coordinator` | 2 vCPU, 2GB, scale-to-zero | ~$20-40 |
| Vertex AI (Gemini) | ~1000 queries/month | ~$5-15 |
| **Total** | | **~$30-65/month** |

### Production Estimates (Phase 2+)

| Component | Monthly Cost |
|-----------|--------------|
| Cloud Run (2 services) | $50-100 |
| Firestore (sessions) | $10-20 |
| MCP servers (2-3 services) | $30-60 |
| Vertex AI (higher volume) | $50-100 |
| **Total** | **~$150-300/month** |

---

## Authentication

### Current (Demo): Basic Auth

- **Username:** `ranger`
- **Password:** `RangerDemo2025!`
- **Implementation:** Cloud Run environment variables + nginx/middleware

### Phase 1: Google Identity Platform

- OAuth 2.0 / OpenID Connect
- Google Workspace SSO for USFS pilot users
- IAM-based service-to-service auth

### Phase 2+: USDA eAuth

- FedRAMP-compliant identity provider
- PIV/CAC card support
- Integration via SAML 2.0

---

## Monitoring & Logs

### View Logs

```bash
# Frontend logs
gcloud run logs read ranger-console --region=us-central1 --limit=50

# Backend logs
gcloud run logs read ranger-coordinator --region=us-central1 --limit=50

# Filter for errors
gcloud run logs read ranger-coordinator --region=us-central1 \
  --filter="severity>=ERROR" --limit=20
```

### Health Checks

```bash
# Frontend health
curl -u ranger:RangerDemo2025! https://ranger-console-xxx-uc.a.run.app/health

# Backend health (if endpoint exists)
curl https://ranger-coordinator-xxx-uc.a.run.app/health
```

---

## Troubleshooting

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Map tiles 403 | MapTiler key not in build args | Redeploy with `cloudbuild.yaml` |
| NIFC fires not loading | Invalid API parameters | Check `nifcService.ts` query params |
| Agent "connection errors" | Fixtures not bundled | Check Dockerfile COPY statements |
| CORS errors | ALLOW_ORIGINS mismatch | Update coordinator env vars |
| Gemini errors | API key / Vertex AI config | Check GOOGLE_GENAI_USE_VERTEXAI |

### Diagnostic Commands

```bash
# Check service status
gcloud run services describe ranger-coordinator --region=us-central1

# Check environment variables
gcloud run services describe ranger-coordinator --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"

# Recent build logs
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

---

## Migration Path: Demo → Production

### Phase 0 → Phase 1 (Current → Pilot)

| Change | Effort | Impact |
|--------|--------|--------|
| Add Firestore sessions | Low (env var) | Persistent conversations |
| Google Identity Platform | Medium | Real user authentication |
| Custom domain | Low | Professional URL |

### Phase 1 → Phase 2 (Pilot → Production)

| Change | Effort | Impact |
|--------|--------|--------|
| MCP servers for live data | High | Real-time federal data |
| USDA eAuth integration | High | Federal compliance |
| FedRAMP ATO process | High | Production authorization |

---

## References

| Document | Purpose |
|----------|---------|
| [ADR-005: Skills-First Architecture](../adr/ADR-005-skills-first-architecture.md) | Core architectural paradigm |
| [ADR-008: AgentTool Pattern](../adr/ADR-008-agent-tool-pattern.md) | Why single-service multi-agent |
| [ADR-009: Fixture-First Development](../adr/ADR-009-fixture-first-development.md) | Demo data strategy |
| [AGENTIC-ARCHITECTURE.md](./AGENTIC-ARCHITECTURE.md) | Agent design details |
| [Cloud Run AI Agents](https://docs.cloud.google.com/run/docs/ai-agents) | GCP reference architecture |

---

## Archived: Original 7-Service Design

The original design (December 2025) proposed 7 separate Cloud Run services with individual ports. This was **superseded** by the AgentTool pattern which hosts all agents in a single process.

**Reasons for change:**
- Network latency between services added 200-500ms per agent call
- Service mesh complexity without corresponding benefit
- AgentTool pattern provides same modularity without network hops
- Simpler deployment and debugging

**Archive location:** `docs/archive/GCP-DEPLOYMENT-v1-microservices.md`

---

**Document Owner:** RANGER Architecture Team  
**Last Updated:** 2025-12-27  
**Status:** Active — reflects deployed system

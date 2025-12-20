# ADR-001: Technology Stack Selection

**Status:** Accepted
**Date:** 2025-12-19
**Decision Makers:** TechTrend Federal - Digital Twin Team

## Context

We are building an AI-first digital twin platform for post-fire forest recovery. The platform must:

1. Support five specialized AI agents (BurnAnalyst, TrailAssessor, TimberCruiser, ComplianceAdvisor, RecoveryCoordinator)
2. Provide a "Tactical Futurism" UI for desktop command centers
3. Support offline-capable mobile field data capture
4. Be FedRAMP High compliant for federal deployment
5. Minimize licensing costs—investment should go to AI capabilities, not application licensing

## Decision

We will adopt a **"Zero Licensing" open source stack** with strategic use of GCP managed services.

### Frontend

| Choice | Rationale | Alternatives Considered |
|--------|-----------|------------------------|
| **React 18 + TypeScript** | Industry standard, large ecosystem, team familiarity | Vue 3, Svelte |
| **Vite** | Fast dev server, ESM-native, simple config | Webpack, Parcel |
| **Tailwind CSS** | Utility-first, easy dark mode, glassmorphism support | Styled Components, CSS Modules |
| **MapLibre GL JS** | Open source Mapbox fork, no usage fees | Mapbox GL JS ($), Leaflet |
| **deck.gl** | WebGL-powered, handles millions of points, 3D terrain | Three.js, CesiumJS |
| **Recharts** | Simple React charts, sufficient for our needs | D3.js, Nivo |

### Backend

| Choice | Rationale | Alternatives Considered |
|--------|-----------|------------------------|
| **FastAPI** | Async Python, auto OpenAPI docs, Pydantic validation | Flask, Django REST |
| **PostgreSQL + PostGIS** | Industry standard spatial database, FedRAMP authorized | MongoDB, CockroachDB |
| **pgvector** | Native PostgreSQL vector search for RAG | Pinecone ($), Weaviate |
| **Redis** | Caching, task queue broker | Memcached |
| **Celery** | Async task queue for long-running agent jobs | RQ, Dramatiq |

### AI/ML

| Choice | Rationale | Alternatives Considered |
|--------|-----------|------------------------|
| **Google Gemini 2.0 Flash** | Multimodal, cost-effective, Vertex AI integration | GPT-4o, Claude 3 |
| **LangChain** | RAG framework, mature ecosystem, good docs | LlamaIndex, Haystack |
| **OpenAI Whisper** | Best open source ASR, self-hostable | Google Cloud Speech ($), AssemblyAI ($) |
| **YOLOv8 (Ultralytics)** | State-of-art object detection, easy fine-tuning | Detectron2, DETR |
| **SAM2** | Universal segmentation, zero-shot capability | Mask R-CNN |
| **geemap** | Google Earth Engine Python API, great for satellite analysis | rasterio only |

### Infrastructure

| Choice | Rationale | Alternatives Considered |
|--------|-----------|------------------------|
| **GCP** | FedRAMP High authorized, Vertex AI integration, public satellite data | AWS GovCloud, Azure Government |
| **Cloud Run** | Serverless containers, scale-to-zero, cost-effective for seasonal workloads | GKE, Cloud Functions |
| **Cloud SQL** | Managed PostgreSQL with PostGIS, FedRAMP High | Self-managed, AlloyDB |
| **Cloud Storage** | Public Sentinel-2/Landsat buckets, no egress for same-region processing | S3 |
| **Terraform** | Industry standard IaC, good GCP provider | Pulumi, CloudFormation |

## Consequences

### Positive

1. **Zero application licensing costs** - All application components are open source
2. **AI investment focus** - Budget goes to Gemini API, model training, agent development
3. **FedRAMP compliance** - GCP services are FedRAMP High authorized
4. **Serverless cost optimization** - Scale-to-zero during off-season (80%+ savings)
5. **No vendor lock-in** - Open source stack is portable; data in standard formats
6. **Strong ecosystem** - All choices have active communities and documentation

### Negative

1. **GCP dependency** - Vertex AI ties us to Google Cloud (mitigated by using standard APIs)
2. **Self-managed complexity** - Some components (GeoServer, Whisper) require operational expertise
3. **Integration work** - Open source tools require more integration than commercial suites
4. **Limited commercial support** - Rely on community support vs. vendor SLAs

### Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| MapLibre performance issues | Low | deck.gl handles heavy lifting; MapLibre for base maps only |
| Whisper accuracy insufficient | Medium | Can fall back to Gemini audio API; human review loop |
| pgvector scale limitations | Low | BigQuery + Vertex AI Vector Search as backup |
| Team learning curve | Medium | Strong documentation; pair programming; focused scope |

## Cost Estimate

### Monthly (Active Fire Season)

| Service | Cost |
|---------|------|
| Cloud Run (API + Agents) | $150-300 |
| Cloud SQL (PostgreSQL) | $100-200 |
| Cloud Storage | $30-50 |
| Vertex AI (Gemini API) | $100-300 |
| BigQuery | $25-75 |
| Other (CDN, Logging, etc.) | $50-100 |
| **Total** | **$455-1,025/month** |

### Annual Estimate

- Active season (6 months): $2,730-6,150
- Off-season (6 months): $600-1,200
- **Annual Total: $3,330-7,350**

Compare to commercial alternatives:
- Esri ArcGIS Enterprise: $100K+/year
- Palantir Foundry: $1M+/year
- Custom enterprise build: $500K+/year

## References

- [Open Source Resources Inventory](../architecture/OPEN-SOURCE-INVENTORY.md)
- [GCP Architecture Guide](../architecture/GCP-ARCHITECTURE.md)
- [Project Brief](../PROJECT-BRIEF.md)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-19 | Accepted | Team consensus; aligns with zero-licensing philosophy |

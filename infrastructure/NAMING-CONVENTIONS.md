# RANGER GCP Naming & Addressing Conventions

**Version:** 1.0  
**Date:** December 26, 2025  
**Purpose:** Establish consistent naming patterns for all GCP resources across RANGER environments

---

## 1. Project Naming

### Pattern
```
{product}-{workload-type}-{environment}
```

### Environments
| Environment | Code | Purpose | Billing |
|-------------|------|---------|---------|
| Development | `dev` | Active development, breaking changes OK | Personal/Team |
| Staging | `stg` | Integration testing, mirrors prod | Team |
| Production | `prd` | Live workload | Organization |
| Sandbox | `sbx` | Experimentation, disposable | Personal |

### RANGER Projects
| Project ID | Purpose | Assured Workload |
|------------|---------|------------------|
| `ranger-twin-sbx` | Prompt engineering, AI Studio experiments | No |
| `ranger-twin-dev` | Active development, ADK agents | No |
| `ranger-twin-stg` | Demo environment, stakeholder reviews | No |
| `ranger-gov-prd` | FedRAMP production workload | Yes (IL4/IL5) |

> **Note:** The `gen-lang-client-*` project from AI Studio should be treated as `ranger-twin-sbx` functionally—never deploy infrastructure there.

---

## 2. Service Account Naming

### Pattern
```
sa-{service}-{role}@{project-id}.iam.gserviceaccount.com
```

### Standard Service Accounts
| Name | Purpose | Key Permissions |
|------|---------|-----------------|
| `sa-ranger-orchestrator` | ADK agent runtime | Vertex AI User, Secret Accessor |
| `sa-ranger-mcp-nifc` | NIFC MCP server | Cloud Run Invoker |
| `sa-ranger-mcp-gis` | GIS MCP server | Storage Object Viewer |
| `sa-ranger-cloudbuild` | CI/CD pipeline | Cloud Build Editor, Run Admin |
| `sa-ranger-scheduler` | Cron jobs | Cloud Scheduler Admin |

### Workload Identity (for GKE/Cloud Run)
```
{service-account}@{project-id}.iam.gserviceaccount.com
```

---

## 3. Cloud Run Services

### Pattern
```
{product}-{component}-{qualifier}
```

### RANGER Services
| Service Name | Description | Min/Max Instances |
|--------------|-------------|-------------------|
| `ranger-orchestrator` | Recovery Coordinator + all specialist agents | 0/3 |
| `ranger-mcp-nifc` | NIFC fire data connector | 0/2 |
| `ranger-mcp-gis` | GIS/spatial data connector | 0/2 |
| `ranger-mcp-weather` | Weather data connector | 0/1 |
| `ranger-console` | Command Console frontend | 0/3 |

### Revisions
Cloud Run auto-generates revision names:
```
{service-name}-{revision-suffix}
```
Example: `ranger-orchestrator-00042-abc`

---

## 4. Cloud Storage Buckets

### Pattern
```
{project-id}-{purpose}-{region}
```

### RANGER Buckets
| Bucket Name | Purpose | Lifecycle |
|-------------|---------|-----------|
| `ranger-twin-dev-skills-us-central1` | Skills library (skill.md, scripts) | Versioned, 90d retention |
| `ranger-twin-dev-fixtures-us-central1` | Test fixtures for simulation | 30d retention |
| `ranger-twin-dev-artifacts-us-central1` | Build artifacts, container images | 14d retention |
| `ranger-twin-dev-ragcorpus-us-central1` | NEPA documents for Managed RAG | Versioned, indefinite |

> **FedRAMP Note:** Production buckets must use `us` multi-region or specific US regions only.

---

## 5. Secret Manager

### Pattern
```
{service}-{secret-type}
```

### RANGER Secrets
| Secret Name | Description | Rotation |
|-------------|-------------|----------|
| `ranger-gemini-api-key` | Google AI API key | 90 days |
| `ranger-db-password` | PostGIS connection string | 90 days |
| `ranger-maptiler-key` | MapTiler API key | Annual |
| `ranger-jwt-signing-key` | Auth token signing | 180 days |

### Access Pattern
```python
# In code, reference by name:
client.access_secret_version(name="projects/{project}/secrets/ranger-gemini-api-key/versions/latest")
```

---

## 6. VPC & Networking

### VPC Naming
```
vpc-{product}-{environment}
```

### Subnet Naming
```
subnet-{product}-{purpose}-{region}
```

### RANGER Network Topology
| Resource | Name | CIDR |
|----------|------|------|
| VPC | `vpc-ranger-dev` | — |
| Subnet (services) | `subnet-ranger-services-us-central1` | `10.0.0.0/20` |
| Subnet (data) | `subnet-ranger-data-us-central1` | `10.0.16.0/20` |
| Serverless VPC Connector | `connector-ranger-us-central1` | `10.8.0.0/28` |

### IP Address Allocation
| Range | Purpose |
|-------|---------|
| `10.0.0.0/20` | Cloud Run services (via connector) |
| `10.0.16.0/20` | Cloud SQL, Memorystore |
| `10.8.0.0/28` | Serverless VPC Access connector |
| `10.100.0.0/16` | Reserved for Assured Workloads expansion |

---

## 7. Cloud SQL

### Instance Naming
```
{product}-{purpose}-{environment}
```

### RANGER Databases
| Instance | Database | Purpose |
|----------|----------|---------|
| `ranger-postgis-dev` | `ranger_db` | Spatial data, incidents, assessments |
| `ranger-postgis-dev` | `ranger_rag` | pgvector embeddings for local RAG |

### Connection String Pattern
```
postgresql://{user}:{password}@/{database}?host=/cloudsql/{project}:{region}:{instance}
```

---

## 8. Pub/Sub & Event-Driven

### Topic Naming
```
{product}-{event-type}-{version}
```

### Subscription Naming
```
{topic-name}-{consumer}-sub
```

### RANGER Topics (Future)
| Topic | Purpose |
|-------|---------|
| `ranger-incident-updates-v1` | Real-time incident changes |
| `ranger-agent-events-v1` | AgentBriefingEvent stream |
| `ranger-alerts-v1` | Critical alerts for supervisors |

---

## 9. Container Images

### Artifact Registry Repository
```
{region}-docker.pkg.dev/{project-id}/{repository}
```

### Image Naming
```
{region}-docker.pkg.dev/{project-id}/ranger/{service}:{tag}
```

### RANGER Images
| Image | Tags |
|-------|------|
| `us-central1-docker.pkg.dev/ranger-twin-dev/ranger/orchestrator` | `latest`, `v1.0.0`, `sha-abc123` |
| `us-central1-docker.pkg.dev/ranger-twin-dev/ranger/console` | `latest`, `v1.0.0` |
| `us-central1-docker.pkg.dev/ranger-twin-dev/ranger/mcp-nifc` | `latest`, `v1.0.0` |

---

## 10. Labeling Strategy

### Required Labels (All Resources)
| Label | Values | Purpose |
|-------|--------|---------|
| `product` | `ranger` | Cost allocation |
| `environment` | `dev`, `stg`, `prd` | Environment filtering |
| `team` | `digital-twin` | Ownership |
| `cost-center` | `tt-ranger-001` | Finance tracking |

### Optional Labels
| Label | Example | Purpose |
|-------|---------|---------|
| `agent` | `burn-analyst`, `coordinator` | Agent-specific resources |
| `data-classification` | `public`, `cui`, `pii` | Data sensitivity |
| `ttl` | `7d`, `30d`, `permanent` | Cleanup automation |

---

## 11. Terraform/IaC Conventions

### Module Naming
```
modules/{provider}-{resource-type}
```

### State Backend
```
gs://{project-id}-terraform-state/{environment}/terraform.tfstate
```

### Variable Naming
```hcl
variable "ranger_environment" {
  description = "Deployment environment (dev, stg, prd)"
  type        = string
}

variable "ranger_region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}
```

---

## 12. Assured Workloads (FedRAMP Path)

When transitioning to production:

### Folder Structure
```
Organization (techtrend.com)
├── folder-commercial/
│   └── ranger-twin-dev
│   └── ranger-twin-stg
└── folder-fedramp-moderate/          # Assured Workload
    └── ranger-gov-prd                # IL4 compliant
```

### Naming Changes for Assured Workloads
| Dev Resource | Production Equivalent |
|--------------|----------------------|
| `ranger-twin-dev` | `ranger-gov-prd` |
| `vpc-ranger-dev` | `vpc-ranger-gov` |
| `ranger-postgis-dev` | `ranger-postgis-gov` |

### Compliance Labels (Production Only)
| Label | Value |
|-------|-------|
| `compliance-framework` | `fedramp-moderate` |
| `data-residency` | `us-only` |
| `encryption` | `cmek` |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    RANGER NAMING QUICK REFERENCE                │
├─────────────────────────────────────────────────────────────────┤
│ Project:     ranger-twin-{env}          (dev, stg, prd)         │
│ Service:     ranger-{component}         (orchestrator, mcp-*)   │
│ Bucket:      ranger-twin-{env}-{purpose}-{region}               │
│ Secret:      ranger-{service}-{type}                            │
│ VPC:         vpc-ranger-{env}                                   │
│ Subnet:      subnet-ranger-{purpose}-{region}                   │
│ SA:          sa-ranger-{service}@{project}.iam...               │
│ Image:       {region}-docker.pkg.dev/{project}/ranger/{svc}     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-26 | CTO | Initial conventions established |


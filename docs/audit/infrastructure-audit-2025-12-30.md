# RANGER Infrastructure Audit

**Project:** `ranger-twin-dev`  
**Project Number:** `1058891520442`  
**Audit Date:** 2025-12-30T10:40 PST

---

## Cloud Run Services (5 total)

| Service | Region | Image | URL |
|---------|--------|-------|-----|
| `ranger-console` | **us-west1** | `us-west1-docker.pkg.dev/.../ranger-console:latest` | https://ranger-console-fqd6rb7jba-uw.a.run.app |
| `ranger-coordinator` | **us-west1** | `us-west1-docker.pkg.dev/.../ranger-coordinator:latest` | https://ranger-coordinator-fqd6rb7jba-uw.a.run.app |
| `ranger-mcp-fixtures` | **us-west1** | `us-west1-docker.pkg.dev/.../ranger-mcp-fixtures:latest` | https://ranger-mcp-fixtures-fqd6rb7jba-uw.a.run.app |
| `ranger-console` | us-central1 | `gcr.io/ranger-twin-dev/ranger-console:4bfe9c93...` | https://ranger-console-fqd6rb7jba-uc.a.run.app |
| `ranger-coordinator` | us-central1 | `us-central1-docker.pkg.dev/.../ranger-coordinator@sha256:...` | https://ranger-coordinator-fqd6rb7jba-uc.a.run.app |

> [!IMPORTANT]
> **Primary deployment is us-west1.** The us-central1 services appear to be legacy deployments from before the RAG migration.

---

## Storage Buckets (5 total)

| Bucket | Location | Purpose |
|--------|----------|---------|
| `ranger-knowledge-ranger-twin-dev-us-west1` | **US-WEST1** | Knowledge base (primary) |
| `ranger-knowledge-base` | US-CENTRAL1 | Knowledge base (legacy) |
| `ranger-tf-state-ranger-twin-dev` | US-WEST1 | Terraform state |
| `ranger-twin-dev_cloudbuild` | US | Cloud Build artifacts |
| `run-sources-ranger-twin-dev-us-central1` | US-CENTRAL1 | Cloud Run source deploy |

---

## Secrets (3 total)

| Secret Name | Created |
|-------------|---------|
| `ranger-demo-password-dev` | 2025-12-29 |
| `ranger-google-api-key-dev` | 2025-12-29 |
| `ranger-maptiler-api-key-dev` | 2025-12-29 |

---

## Artifact Registry Repositories (3 total)

| Repository | Location | Format |
|------------|----------|--------|
| `ranger-images` | - | DOCKER |
| `cloud-run-source-deploy` | - | DOCKER |
| `gcr.io` | - | DOCKER |

---

## Service Accounts (5 total)

| Email | Display Name |
|-------|--------------|
| `ranger-coordinator-dev@...iam.gserviceaccount.com` | RANGER Recovery Coordinator (dev) |
| `ranger-console-dev@...iam.gserviceaccount.com` | RANGER Command Console (dev) |
| `ranger-rag-dev@...iam.gserviceaccount.com` | RANGER RAG Engine (dev) |
| `ranger-mcp-fixtures-dev@...iam.gserviceaccount.com` | RANGER MCP Fixtures Server (dev) |
| `1058891520442-compute@developer.gserviceaccount.com` | Default compute service account |

---

## Vertex AI RAG Corpora (europe-west3)

| Corpus | ID | Status | Files | Avg Relevance |
|--------|-----|--------|-------|---------------|
| `ranger-nepa-regulations` | `2305843009213693952` | ✅ ACTIVE | 3 | 0.68 |
| `ranger-burn-severity` | `4611686018427387904` | ✅ ACTIVE | 6 | 0.74 |
| `ranger-timber-salvage` | `1152921504606846976` | ✅ ACTIVE | 3 | 0.60 |
| `ranger-trail-infrastructure` | `8070450532247928832` | ✅ ACTIVE | 4 | N/A |

> [!NOTE]
> **RAG corpora are in europe-west3** (Frankfurt) per ADR-010, not us-west1 where Cloud Run services are deployed. Cross-region access works correctly. Total: 16 Tier 1 documents indexed.

---

## Enabled APIs (29+ key services)

| Category | Services |
|----------|----------|
| **AI/ML** | `aiplatform.googleapis.com`, `generativelanguage.googleapis.com` |
| **Compute** | `run.googleapis.com`, `compute.googleapis.com`, `cloudbuild.googleapis.com` |
| **Storage** | `storage.googleapis.com`, `artifactregistry.googleapis.com`, `containerregistry.googleapis.com` |
| **Data** | `bigquery.googleapis.com`, `firestore.googleapis.com`, `datastore.googleapis.com` |
| **Security** | `secretmanager.googleapis.com`, `iam.googleapis.com`, `iamcredentials.googleapis.com` |
| **Monitoring** | `logging.googleapis.com`, `monitoring.googleapis.com`, `cloudtrace.googleapis.com` |

---

## Summary & Recommendations

### ✅ What's Working
- **us-west1** is the primary deployment region with all 3 core services running
- Secrets are properly configured and recently created (Dec 29)
- Service accounts are properly scoped per component

### ⚠️ Cleanup Opportunities
1. **Legacy us-central1 services**: Consider deleting `ranger-console` and `ranger-coordinator` in us-central1 if no longer needed
2. **Legacy bucket**: `ranger-knowledge-base` in US-CENTRAL1 may be obsolete

### ✅ RAG Status
All 4 Vertex AI RAG corpora verified healthy in europe-west3. Smoke test passed: NEPA advisor returned 5 chunks for "categorical exclusion timber salvage" query.

# GCP Resource Audit Report: `ranger-twin-dev`

**Date:** 2025-12-28
**Scope:** Reviewing regional resources for migration to `us-west1`.

## Executive Summary
The project is currently heavily centered in `us-central1`. Several key APIs (Compute, Functions, SQL) are disabled, confirming no resources exist for those services.

## Resource Inventory

### 1. Storage (GCS Buckets)
| Bucket Name | Location | Notes |
| :--- | :--- | :--- |
| `gs://ranger-knowledge-base/` | **US-CENTRAL1** | Primary KB |
| `gs://run-sources-ranger-twin-dev-us-central1/` | **US-CENTRAL1** | Cloud Run build artifacts |
| `gs://ranger-twin-dev_cloudbuild/` | **US** | Multi-region |
| `gs://ranger-knowledge-base-eu/` | **EUROPE-WEST3** | EU specific data? |

### 2. Compute (Cloud Run)
All services are currently in `us-central1`.
| Service | Region | Last Deployed |
| :--- | :--- | :--- |
| `ranger-console` | **us-central1** | 2025-12-28 |
| `ranger-coordinator` | **us-central1** | 2025-12-28 |
| `ranger-mcp-fixtures` | **us-central1** | 2025-12-27 |

### 3. AI & Data (Vertex AI)
- **API Enabled:** `aiplatform.googleapis.com`
- **Resources:** None found in `us-central1`, `us-east4`, `us-west1`, `europe-west3`, `europe-west4`.

### 4. Artifacts & Secrets
- **Artifact Registry:**
  - `gcr.io` (Container Registry)
  - `cloud-run-source-deploy`
- **Secrets:** None found.

### 5. Disabled Services (Confirmed 0 Resources)
The following APIs are **disabled**, confirming no resources exist:
- **Cloud Functions** (`cloudfunctions.googleapis.com`)
- **Compute Engine** (`compute.googleapis.com`)
- **Cloud SQL** (`sqladmin.googleapis.com`)
- **Cloud Asset Inventory** (`cloudasset.googleapis.com`)

## Migration Analysis
To move to `us-west1`:
1.  **Cloud Run:** Redeploy all 3 services to `us-west1`.
2.  **GCS:** Migrate data from `ranger-knowledge-base` (us-central1) to a new `us-west1` bucket. The `run-sources` bucket will be auto-created in the new region upon deployment.
3.  **Vertex AI:** Verify if any hidden resources exist, but likely clean.

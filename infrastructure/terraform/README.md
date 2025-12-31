# RANGER Infrastructure-as-Code

> **Terraform modules for deploying RANGER to any GCP project/region.**

[![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.9-purple)](https://www.terraform.io/)
[![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-blue)](https://cloud.google.com/run)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

## Overview

This repository contains Infrastructure-as-Code (IaC) for the RANGER project—an AI-powered forest recovery system for the U.S. Forest Service. It enables one-command deployment to any GCP project and region.

### Architecture Alignment

- **ADR-005**: Skills-First Architecture (Agents + Skills + MCP)
- **ADR-006**: Google-Only LLM Strategy (Gemini via Vertex AI)

### Components Deployed

| Component | Resource | Purpose |
|-----------|----------|---------|
| **Coordinator** | Cloud Run | Recovery Coordinator agent (ADK) |
| **Console** | Cloud Run | Command Console UI (React) |
| **MCP Fixtures** | Cloud Run | Data connectivity layer |
| **Knowledge Base** | GCS | RAG document storage |
| **RAG Corpora** | Vertex AI | 4 domain-specific knowledge bases |
| **Secrets** | Secret Manager | API keys, credentials |
| **Images** | Artifact Registry | Container image repository |

## Quick Start

### Prerequisites

```bash
# Install dependencies
brew install terraform  # or your package manager
brew install --cask google-cloud-sdk

# Authenticate
gcloud auth login
gcloud auth application-default login
```

### One-Command Deployment

```bash
# Clone this repo
cd ranger-iac

# Set your secrets (choose one method)
export TF_VAR_google_api_key="your-gemini-api-key"
export TF_VAR_maptiler_api_key="your-maptiler-key"
export TF_VAR_demo_password="your-demo-password"

# Deploy to dev
./scripts/deploy.sh --project=ranger-twin-dev --region=us-west1 --env=dev

# Deploy to prod (different project)
./scripts/deploy.sh --project=techtrend-ranger-prod --region=us-west1 --env=prod
```

### Migration from Current State

If migrating from the existing `us-central1` + `europe-west3` deployment:

```bash
# Dry run first
./scripts/migrate-to-us-west1.sh --project=ranger-twin-dev --dry-run

# Execute migration
./scripts/migrate-to-us-west1.sh --project=ranger-twin-dev

# Then deploy with Terraform
./scripts/deploy.sh --project=ranger-twin-dev --region=us-west1 --env=dev
```

## Directory Structure

```
ranger-iac/
├── main.tf                     # Root module (orchestration)
├── variables.tf                # Input variables
├── outputs.tf                  # Deployment outputs
├── modules/
│   ├── cloud-run-service/      # Reusable Cloud Run module
│   ├── rag-infra/              # GCS + IAM for RAG Engine
│   ├── iam-baseline/           # Service accounts + bindings
│   ├── artifact-registry/      # Container image repository
│   └── secrets/                # Secret Manager resources
├── environments/
│   ├── dev.tfvars              # Development configuration
│   └── prod.tfvars             # Production configuration
└── scripts/
    ├── deploy.sh               # One-command deployment
    ├── migrate-to-us-west1.sh  # Migration helper
    └── setup-rag-corpora.py    # RAG corpus setup (Python SDK)
```

## Configuration

### Environment Variables (Secrets)

| Variable | Description | Required |
|----------|-------------|----------|
| `TF_VAR_google_api_key` | Gemini API key for ADK agents | Yes |
| `TF_VAR_maptiler_api_key` | Map tiles for Command Console | Yes |
| `TF_VAR_demo_password` | Basic Auth for Phase 0 demo | Optional |

### tfvars Configuration

See `environments/dev.tfvars` for all available options. Key settings:

```hcl
project_id  = "your-project-id"
region      = "us-west1"  # FedRAMP-compliant region
environment = "dev"

# Cost control
min_instances = 0  # Scale to zero
max_instances = 5

# Access control
allow_public_access = true  # Set false for prod
```

## RAG Corpus Management

Vertex AI RAG Engine corpora are managed via Python SDK (hybrid approach) because they lack Terraform resources.

### Initial Setup

```bash
# After Terraform creates GCS bucket
python3 scripts/setup-rag-corpora.py \
  --project=ranger-twin-dev \
  --region=us-west1 \
  --knowledge-bucket=ranger-knowledge-ranger-twin-dev-us-west1

# Copy corpus IDs to tfvars
cat rag-corpus-ids.json
```

### Adding Documents

```bash
# Upload documents to knowledge bucket
gsutil cp docs/fsm/*.pdf gs://ranger-knowledge-ranger-twin-dev-us-west1/nepa/
gsutil cp docs/mtbs/*.pdf gs://ranger-knowledge-ranger-twin-dev-us-west1/burn/

# Re-run setup to trigger ingestion
python3 scripts/setup-rag-corpora.py --project=ranger-twin-dev ...
```

## Terraform State

State is stored in GCS with the following structure:

```
gs://ranger-tf-state-{project}/
└── terraform/state/{environment}/default.tfstate
```

### Importing Existing Resources

If resources already exist outside Terraform:

```bash
# Import Cloud Run service
terraform import 'module.cloud_run_coordinator.google_cloud_run_v2_service.service' \
  projects/ranger-twin-dev/locations/us-west1/services/ranger-coordinator

# Import GCS bucket
terraform import 'module.rag_infra.google_storage_bucket.knowledge_base' \
  ranger-knowledge-ranger-twin-dev-us-west1
```

## CI/CD Integration

### Cloud Build Trigger

```yaml
# cloudbuild.yaml
steps:
  - name: 'hashicorp/terraform:1.9'
    entrypoint: 'sh'
    args:
      - '-c'
      - |
        terraform init -backend-config="bucket=${_TF_STATE_BUCKET}"
        terraform apply -auto-approve -var-file=environments/${_ENVIRONMENT}.tfvars

substitutions:
  _TF_STATE_BUCKET: 'ranger-tf-state-${PROJECT_ID}'
  _ENVIRONMENT: 'dev'
```

## Troubleshooting

### Common Issues

**"Permission denied" on Cloud Run deployment**
```bash
# Ensure Cloud Build SA has required roles
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${PROJECT_ID}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.developer"
```

**"Quota exceeded" for Vertex AI RAG**
```bash
# RAG Engine is Preview - request quota increase
# Contact: vertex-ai-rag-engine-support@google.com
```

**"Backend configuration changed"**
```bash
# Re-initialize with new backend
terraform init -reconfigure
```

## FedRAMP Compliance Notes

For FedRAMP-compliant deployments:

1. **Regions**: Use only US regions (`us-west1`, `us-central1`, `us-east4`)
2. **CMEK**: Enable Customer-Managed Encryption Keys for GCS and Secrets
3. **Audit Logging**: Enable Data Access logs for all APIs
4. **VPC**: Consider VPC Service Controls for data exfiltration prevention
5. **IAM**: Enforce least-privilege with Workload Identity Federation

## License

Proprietary - TechTrend Federal

## References

- [ADR-005: Skills-First Architecture](../docs/adr/ADR-005-skills-first-architecture.md)
- [ADR-006: Google-Only LLM Strategy](../docs/adr/ADR-006-google-only-llm-strategy.md)
- [PRODUCT-SUMMARY.md](../docs/___PRODUCT-SUMMARY.md)
- [Google ADK Documentation](https://google.github.io/adk-docs/)

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **ADK** | Agent Development Kit | Google's framework for multi-agent AI systems |
| **ADR** | Architecture Decision Record | Documented technical decisions with rationale |
| **CMEK** | Customer-Managed Encryption Key | User-controlled encryption keys |
| **FedRAMP** | Federal Risk and Authorization Management | Federal cloud security authorization |
| **GCP** | Google Cloud Platform | Google's cloud computing services |
| **GCS** | Google Cloud Storage | Cloud object storage service |
| **IAM** | Identity and Access Management | Access control system |
| **IaC** | Infrastructure as Code | Managing infrastructure via code |
| **RAG** | Retrieval-Augmented Generation | AI pattern combining retrieval + LLM |
| **SA** | Service Account | Identity for automated processes |
| **VPC** | Virtual Private Cloud | Isolated cloud network |

→ **[Full Glossary](../../docs/GLOSSARY.md)**

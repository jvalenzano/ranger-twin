# Infrastructure

Infrastructure as Code (IaC) for RANGER deployment.

## Overview

This directory contains infrastructure definitions for deploying RANGER to Google Cloud Platform (GCP). All infrastructure is managed as code using Terraform.

## Directory Structure

```
infrastructure/
├── docker/                # Docker configurations
│   └── init-db.sql        #   Database initialization
│
├── terraform/             # Terraform IaC definitions
│   ├── environments/      #   Environment-specific configs
│   │   ├── dev/           #     Development environment
│   │   ├── staging/       #     Staging environment
│   │   └── prod/          #     Production environment
│   └── modules/           #   Reusable Terraform modules
│
├── ANTI-GRAVITY-INSTRUCTIONS-v2.md   # Deployment guide
└── NAMING-CONVENTIONS.md             # Resource naming standards
```

## GCP Services Used

| Service | Purpose |
|---------|---------|
| Cloud Run | Serverless agent hosting |
| Vertex AI | Gemini API (production auth) |
| Firestore | Session state storage |
| Cloud Storage | Static assets, fixtures |
| Secret Manager | API keys, credentials |
| Cloud Build | CI/CD pipelines |

## Deployment Phases

### Phase 0: Static Demo

- Cloud Run hosting for frontend
- Basic Auth for access control
- Minimal infrastructure

### Phase 1: GCP-Native

- Google Identity Platform
- Vertex AI integration
- Firestore session state

### Phase 2: Federal Production

- FedRAMP High compliance
- USDA eAuth integration
- Full audit logging

## Usage

### Development

```bash
cd infrastructure/terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### Staging/Production

```bash
cd infrastructure/terraform/environments/staging
terraform init
terraform plan
terraform apply
```

## Naming Conventions

See `NAMING-CONVENTIONS.md` for resource naming standards.

## References

- **Deployment Runbook:** `docs/deployment/`
- [ADR-005](../docs/adr/ADR-005-skills-first-architecture.md) — Skills-First Architecture
- **Security:** `docs/specs/SECURITY-BASELINE.md`

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **CI/CD** | Continuous Integration/Deployment | Automated build and deploy pipeline |
| **FedRAMP** | Federal Risk and Authorization Management | Federal cloud security authorization |
| **GCP** | Google Cloud Platform | Google's cloud computing services |
| **IaC** | Infrastructure as Code | Managing infrastructure via code |
| **USDA** | United States Department of Agriculture | Federal department overseeing USFS |

→ **[Full Glossary](../docs/GLOSSARY.md)**

# =============================================================================
# RANGER Infrastructure-as-Code: Root Module
# =============================================================================
# This is the entry point for deploying RANGER to any GCP project/region.
# 
# Usage:
#   terraform init -backend-config="bucket=${TF_STATE_BUCKET}"
#   terraform apply -var-file=environments/dev.tfvars
#
# Architecture: Skills-First (ADR-005) + Google-Only LLM (ADR-006)
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Backend configured via -backend-config flags
  backend "gcs" {}
}

# -----------------------------------------------------------------------------
# Provider Configuration
# -----------------------------------------------------------------------------
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# Local Values
# -----------------------------------------------------------------------------
locals {
  # Service naming convention: ranger-{service}-{env}
  service_prefix = "ranger"
  
  # Common labels for all resources
  common_labels = {
    project     = "ranger"
    environment = var.environment
    managed_by  = "terraform"
    cost_center = "techtrend-federal"
  }
  
  # Cloud Run service URLs (computed after deployment)
  coordinator_url   = module.cloud_run_coordinator.service_url
  console_url       = module.cloud_run_console.service_url
  mcp_fixtures_url  = module.cloud_run_mcp_fixtures.service_url
}

# -----------------------------------------------------------------------------
# Enable Required APIs
# -----------------------------------------------------------------------------
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "aiplatform.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
  ])
  
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# IAM Baseline (Service Accounts)
# -----------------------------------------------------------------------------
module "iam_baseline" {
  source = "./modules/iam-baseline"
  
  project_id     = var.project_id
  service_prefix = local.service_prefix
  environment    = var.environment
  
  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# Artifact Registry
# -----------------------------------------------------------------------------
module "artifact_registry" {
  source = "./modules/artifact-registry"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  labels      = local.common_labels
  
  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# RAG Infrastructure (GCS + IAM for Vertex AI RAG Engine)
# -----------------------------------------------------------------------------
module "rag_infra" {
  source = "./modules/rag-infra"
  
  project_id           = var.project_id
  region               = var.region
  environment          = var.environment
  labels               = local.common_labels
  rag_service_account  = module.iam_baseline.service_accounts["rag"].email
  
  depends_on = [google_project_service.required_apis, module.iam_baseline]
}

# -----------------------------------------------------------------------------
# Cloud Run Services
# -----------------------------------------------------------------------------

# MCP Fixtures Server (Data Layer - deploys first)
module "cloud_run_mcp_fixtures" {
  source = "./modules/cloud-run-service"
  
  project_id       = var.project_id
  region           = var.region
  service_name     = "${local.service_prefix}-mcp-fixtures"
  image            = "${module.artifact_registry.repository_url}/${local.service_prefix}-mcp-fixtures:${var.image_tag}"
  service_account  = module.iam_baseline.service_accounts["mcp_fixtures"].email
  labels           = local.common_labels
  
  environment_variables = {
    ENVIRONMENT = var.environment
    LOG_LEVEL   = var.log_level
  }

  # Allow unauthenticated access for demo (restrict in prod via IAP)
  allow_unauthenticated = var.allow_public_access

  # Scale to zero for cost efficiency
  min_instances = 0
  max_instances = 5

  depends_on = [module.artifact_registry, module.iam_baseline]
}

# Recovery Coordinator (Agent Orchestration Layer)
module "cloud_run_coordinator" {
  source = "./modules/cloud-run-service"
  
  project_id       = var.project_id
  region           = var.region
  service_name     = "${local.service_prefix}-coordinator"
  image            = "${module.artifact_registry.repository_url}/${local.service_prefix}-coordinator:${var.image_tag}"
  service_account  = module.iam_baseline.service_accounts["coordinator"].email
  labels           = local.common_labels
  
  environment_variables = {
    ENVIRONMENT         = var.environment
    LOG_LEVEL           = var.log_level
    MCP_FIXTURES_URL    = module.cloud_run_mcp_fixtures.service_url
    RAG_CORPUS_NEPA     = var.rag_corpus_ids.nepa
    RAG_CORPUS_BURN     = var.rag_corpus_ids.burn
    RAG_CORPUS_TIMBER   = var.rag_corpus_ids.timber
    RAG_CORPUS_TRAIL    = var.rag_corpus_ids.trail
    GOOGLE_CLOUD_PROJECT = var.project_id
    GOOGLE_CLOUD_REGION  = var.region
  }
  
  secret_environment_variables = {
    GOOGLE_API_KEY = module.secrets.secret_versions["google_api_key"]
  }

  # Allow unauthenticated access for demo (restrict in prod via IAP)
  allow_unauthenticated = var.allow_public_access

  min_instances = 0
  max_instances = 10

  depends_on = [module.cloud_run_mcp_fixtures, module.rag_infra]
}

# Command Console (UI Layer)
module "cloud_run_console" {
  source = "./modules/cloud-run-service"
  
  project_id       = var.project_id
  region           = var.region
  service_name     = "${local.service_prefix}-console"
  image            = "${module.artifact_registry.repository_url}/${local.service_prefix}-console:${var.image_tag}"
  service_account  = module.iam_baseline.service_accounts["console"].email
  labels           = local.common_labels
  
  environment_variables = {
    ENVIRONMENT        = var.environment
    COORDINATOR_URL    = module.cloud_run_coordinator.service_url
  }
  
  secret_environment_variables = {
    MAPTILER_API_KEY = module.secrets.secret_versions["maptiler_api_key"]
    DEMO_PASSWORD    = module.secrets.secret_versions["demo_password"]
  }
  
  # Allow unauthenticated access for demo (restrict in prod via IAP)
  allow_unauthenticated = var.allow_public_access
  
  min_instances = 0
  max_instances = 5
  
  depends_on = [module.cloud_run_coordinator]
}

# -----------------------------------------------------------------------------
# Secrets Manager
# -----------------------------------------------------------------------------
module "secrets" {
  source = "./modules/secrets"
  
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  google_api_key   = var.google_api_key
  maptiler_api_key = var.maptiler_api_key
  demo_password    = var.demo_password
  
  depends_on = [google_project_service.required_apis]
}

# -----------------------------------------------------------------------------
# RAG Corpus Ingestion (Hybrid: Terraform triggers Python SDK)
# -----------------------------------------------------------------------------
resource "null_resource" "rag_corpus_setup" {
  count = var.enable_rag_setup ? 1 : 0
  
  triggers = {
    # Re-run if knowledge base bucket changes
    knowledge_bucket = module.rag_infra.knowledge_bucket_name
    # Re-run if ingestion script changes
    script_hash = filemd5("${path.module}/scripts/setup-rag-corpora.py")
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      python3 ${path.module}/scripts/setup-rag-corpora.py \
        --project=${var.project_id} \
        --region=${var.region} \
        --knowledge-bucket=${module.rag_infra.knowledge_bucket_name}
    EOT
    
    environment = {
      GOOGLE_APPLICATION_CREDENTIALS = var.gcp_credentials_path
    }
  }
  
  depends_on = [module.rag_infra]
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "service_urls" {
  description = "URLs for all deployed Cloud Run services"
  value = {
    coordinator   = module.cloud_run_coordinator.service_url
    console       = module.cloud_run_console.service_url
    mcp_fixtures  = module.cloud_run_mcp_fixtures.service_url
  }
}

output "artifact_registry_url" {
  description = "Artifact Registry URL for container images"
  value       = module.artifact_registry.repository_url
}

output "knowledge_bucket" {
  description = "GCS bucket for RAG knowledge base"
  value       = module.rag_infra.knowledge_bucket_name
}

output "service_accounts" {
  description = "Service account emails for each service"
  value       = module.iam_baseline.service_accounts
}

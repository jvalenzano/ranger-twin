# =============================================================================
# Module: IAM Baseline
# =============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" { type = string }
variable "service_prefix" { type = string }
variable "environment" { type = string }

resource "google_service_account" "coordinator" {
  project      = var.project_id
  account_id   = "${var.service_prefix}-coordinator-${var.environment}"
  display_name = "RANGER Recovery Coordinator (${var.environment})"
}

resource "google_service_account" "console" {
  project      = var.project_id
  account_id   = "${var.service_prefix}-console-${var.environment}"
  display_name = "RANGER Command Console (${var.environment})"
}

resource "google_service_account" "mcp_fixtures" {
  project      = var.project_id
  account_id   = "${var.service_prefix}-mcp-fixtures-${var.environment}"
  display_name = "RANGER MCP Fixtures Server (${var.environment})"
}

resource "google_service_account" "rag" {
  project      = var.project_id
  account_id   = "${var.service_prefix}-rag-${var.environment}"
  display_name = "RANGER RAG Engine (${var.environment})"
}

# Coordinator IAM
resource "google_project_iam_member" "coordinator_vertex" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.coordinator.email}"
}

resource "google_project_iam_member" "coordinator_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.coordinator.email}"
}

resource "google_project_iam_member" "coordinator_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.coordinator.email}"
}

# Console IAM
resource "google_project_iam_member" "console_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.console.email}"
}

# MCP Fixtures IAM
resource "google_project_iam_member" "mcp_storage_reader" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.mcp_fixtures.email}"
}

# RAG IAM
resource "google_project_iam_member" "rag_vertex_admin" {
  project = var.project_id
  role    = "roles/aiplatform.admin"
  member  = "serviceAccount:${google_service_account.rag.email}"
}

resource "google_project_iam_member" "rag_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.rag.email}"
}

output "service_accounts" {
  value = {
    coordinator  = google_service_account.coordinator
    console      = google_service_account.console
    mcp_fixtures = google_service_account.mcp_fixtures
    rag          = google_service_account.rag
  }
}

# =============================================================================
# Module: Artifact Registry
# =============================================================================

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "environment" {
  type = string
}

variable "labels" {
  type    = map(string)
  default = {}
}

resource "google_artifact_registry_repository" "ranger" {
  project       = var.project_id
  location      = var.region
  repository_id = "ranger-images"
  description   = "Container images for RANGER services"
  format        = "DOCKER"
  labels        = var.labels
  
  cleanup_policies {
    id     = "keep-recent-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
  
  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s"
    }
  }
}

# Temporarily commented out - Cloud Build service account doesn't exist yet
# Will be added manually after deployment
# resource "google_artifact_registry_repository_iam_member" "cloudbuild_writer" {
#   project    = var.project_id
#   location   = var.region
#   repository = google_artifact_registry_repository.ranger.name
#   role       = "roles/artifactregistry.writer"
#   member     = "serviceAccount:${var.project_id}@cloudbuild.gserviceaccount.com"
# }

output "repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.ranger.name}"
}

output "repository_name" {
  value = google_artifact_registry_repository.ranger.name
}

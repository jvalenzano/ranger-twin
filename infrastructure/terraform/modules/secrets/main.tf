# =============================================================================
# Module: Secrets Manager
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

variable "google_api_key" {
  type      = string
  sensitive = true
}

variable "maptiler_api_key" {
  type      = string
  sensitive = true
}

variable "demo_password" {
  type      = string
  sensitive = true
  default   = ""
}

# Google API Key Secret
resource "google_secret_manager_secret" "google_api_key" {
  project   = var.project_id
  secret_id = "ranger-google-api-key-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
  
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "google_api_key" {
  secret      = google_secret_manager_secret.google_api_key.id
  secret_data = var.google_api_key
}

# MapTiler API Key Secret
resource "google_secret_manager_secret" "maptiler_api_key" {
  project   = var.project_id
  secret_id = "ranger-maptiler-api-key-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
  
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "maptiler_api_key" {
  secret      = google_secret_manager_secret.maptiler_api_key.id
  secret_data = var.maptiler_api_key
}

# Demo Password Secret
resource "google_secret_manager_secret" "demo_password" {
  project   = var.project_id
  secret_id = "ranger-demo-password-${var.environment}"
  
  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
  
  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }
}

resource "google_secret_manager_secret_version" "demo_password" {
  secret      = google_secret_manager_secret.demo_password.id
  secret_data = var.demo_password
}

output "secret_ids" {
  value = {
    google_api_key   = google_secret_manager_secret.google_api_key.secret_id
    maptiler_api_key = google_secret_manager_secret.maptiler_api_key.secret_id
    demo_password    = google_secret_manager_secret.demo_password.secret_id
  }
}

output "secret_versions" {
  value = {
    google_api_key   = google_secret_manager_secret.google_api_key.secret_id
    maptiler_api_key = google_secret_manager_secret.maptiler_api_key.secret_id
    demo_password    = google_secret_manager_secret.demo_password.secret_id
  }
}

# =============================================================================
# Module: RAG Infrastructure
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

variable "rag_service_account" {
  type = string
}

resource "google_storage_bucket" "knowledge_base" {
  project       = var.project_id
  name          = "ranger-knowledge-${var.project_id}-${var.region}"
  location      = upper(var.region)
  storage_class = "STANDARD"
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age        = 90
      with_state = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }
  
  lifecycle_rule {
    condition {
      num_newer_versions = 3
    }
    action {
      type = "Delete"
    }
  }
  
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  
  labels = merge(var.labels, { purpose = "rag-knowledge-base" })
}

resource "google_storage_bucket_object" "nepa_folder" {
  bucket  = google_storage_bucket.knowledge_base.name
  name    = "nepa/"
  content = " "
}

resource "google_storage_bucket_object" "burn_folder" {
  bucket  = google_storage_bucket.knowledge_base.name
  name    = "burn/"
  content = " "
}

resource "google_storage_bucket_object" "timber_folder" {
  bucket  = google_storage_bucket.knowledge_base.name
  name    = "timber/"
  content = " "
}

resource "google_storage_bucket_object" "trail_folder" {
  bucket  = google_storage_bucket.knowledge_base.name
  name    = "trail/"
  content = " "
}

resource "google_storage_bucket_iam_member" "rag_reader" {
  bucket = google_storage_bucket.knowledge_base.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${var.rag_service_account}"
}

resource "google_storage_bucket_iam_member" "rag_writer" {
  bucket = google_storage_bucket.knowledge_base.name
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${var.rag_service_account}"
}

output "knowledge_bucket_name" {
  value = google_storage_bucket.knowledge_base.name
}

output "knowledge_bucket_url" {
  value = "gs://${google_storage_bucket.knowledge_base.name}"
}

output "corpus_folders" {
  value = {
    nepa   = "gs://${google_storage_bucket.knowledge_base.name}/nepa/"
    burn   = "gs://${google_storage_bucket.knowledge_base.name}/burn/"
    timber = "gs://${google_storage_bucket.knowledge_base.name}/timber/"
    trail  = "gs://${google_storage_bucket.knowledge_base.name}/trail/"
  }
}

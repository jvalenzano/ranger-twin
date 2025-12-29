# =============================================================================
# RANGER Infrastructure: Input Variables
# =============================================================================

variable "project_id" {
  description = "GCP Project ID where RANGER will be deployed"
  type        = string
  
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.project_id))
    error_message = "Project ID must be 6-30 characters, lowercase, numbers, and hyphens."
  }
}

variable "region" {
  description = "GCP region for all resources (FedRAMP-compliant US regions recommended)"
  type        = string
  default     = "us-west1"
  
  validation {
    condition     = can(regex("^us-", var.region))
    error_message = "For FedRAMP compliance, only US regions are supported."
  }
}

variable "environment" {
  description = "Deployment environment: dev, staging, prod"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "image_tag" {
  description = "Docker image tag for all services"
  type        = string
  default     = "latest"
}

variable "log_level" {
  description = "Logging verbosity: DEBUG, INFO, WARNING, ERROR"
  type        = string
  default     = "INFO"
}

variable "google_api_key" {
  description = "Google Gemini API key for ADK agents and frontend"
  type        = string
  sensitive   = true
}

variable "maptiler_api_key" {
  description = "MapTiler API key for Command Console maps"
  type        = string
  sensitive   = true
}

variable "demo_password" {
  description = "Basic Auth password for demo access (Phase 0)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "gcp_credentials_path" {
  description = "Path to GCP service account JSON for local execution"
  type        = string
  default     = ""
}

variable "rag_corpus_ids" {
  description = "Vertex AI RAG Engine corpus IDs"
  type = object({
    nepa   = string
    burn   = string
    timber = string
    trail  = string
  })
  default = {
    nepa   = ""
    burn   = ""
    timber = ""
    trail  = ""
  }
}

variable "enable_rag_setup" {
  description = "Run RAG corpus creation script"
  type        = bool
  default     = false
}

variable "allow_public_access" {
  description = "Allow unauthenticated access to Console"
  type        = bool
  default     = false
}

variable "authorized_users" {
  description = "List of user emails authorized to invoke services"
  type        = list(string)
  default     = []
}

variable "min_instances" {
  description = "Minimum Cloud Run instances (0 for scale-to-zero)"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum Cloud Run instances per service"
  type        = number
  default     = 10
}

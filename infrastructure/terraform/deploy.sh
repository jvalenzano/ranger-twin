#!/bin/bash
# =============================================================================
# RANGER One-Command Deployment Script
# =============================================================================
# Deploys RANGER to any GCP project/region with a single command.
#
# Usage:
#   ./deploy.sh --project=ranger-twin-dev --region=us-west1 --env=dev
#   ./deploy.sh --project=techtrend-ranger-prod --region=us-west1 --env=prod
#
# Prerequisites:
#   - gcloud CLI authenticated with appropriate permissions
#   - Terraform >= 1.9.0 installed
#   - Python 3.9+ with google-cloud-aiplatform package
#   - Environment variables or secrets.tfvars for sensitive values
#
# What this script does:
#   1. Validates prerequisites
#   2. Creates GCS bucket for Terraform state (if needed)
#   3. Initializes Terraform with remote backend
#   4. Builds and pushes container images
#   5. Applies Terraform configuration
#   6. Runs RAG corpus setup (if enabled)
#   7. Outputs service URLs
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy RANGER infrastructure to GCP.

Required Options:
    --project=PROJECT_ID    GCP project ID
    --region=REGION         GCP region (default: us-west1)
    --env=ENVIRONMENT       Environment: dev, staging, prod

Optional:
    --skip-build            Skip container image builds
    --skip-rag              Skip RAG corpus setup
    --destroy               Destroy infrastructure instead of apply
    --plan-only             Run terraform plan without applying
    --auto-approve          Skip interactive approval
    -h, --help              Show this help message

Examples:
    $0 --project=ranger-twin-dev --region=us-west1 --env=dev
    $0 --project=ranger-twin-dev --env=dev --skip-build --auto-approve
    $0 --project=ranger-twin-dev --env=dev --destroy
EOF
    exit 0
}

# =============================================================================
# Parse Arguments
# =============================================================================
PROJECT_ID=""
REGION="us-west1"
ENVIRONMENT=""
SKIP_BUILD=false
SKIP_RAG=false
DESTROY=false
PLAN_ONLY=false
AUTO_APPROVE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --project=*)
            PROJECT_ID="${1#*=}"
            shift
            ;;
        --region=*)
            REGION="${1#*=}"
            shift
            ;;
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-rag)
            SKIP_RAG=true
            shift
            ;;
        --destroy)
            DESTROY=true
            shift
            ;;
        --plan-only)
            PLAN_ONLY=true
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE="-auto-approve"
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            ;;
    esac
done

# Validate required arguments
[[ -z "$PROJECT_ID" ]] && log_error "Missing required argument: --project"
[[ -z "$ENVIRONMENT" ]] && log_error "Missing required argument: --env"

# =============================================================================
# Prerequisites Check
# =============================================================================
log_info "Checking prerequisites..."

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
fi

# Check terraform
if ! command -v terraform &> /dev/null; then
    log_error "Terraform not found. Install from: https://www.terraform.io/downloads"
fi

TF_VERSION=$(terraform version -json | jq -r '.terraform_version')
log_info "Terraform version: $TF_VERSION"

# Verify gcloud authentication
if ! gcloud auth print-identity-token &> /dev/null; then
    log_warn "gcloud not authenticated. Running: gcloud auth login"
    gcloud auth login
fi

# Set project
gcloud config set project "$PROJECT_ID"
log_info "GCP Project: $PROJECT_ID"
log_info "Region: $REGION"
log_info "Environment: $ENVIRONMENT"

# =============================================================================
# Terraform State Bucket
# =============================================================================
TF_STATE_BUCKET="ranger-tf-state-${PROJECT_ID}"

log_info "Checking Terraform state bucket: $TF_STATE_BUCKET"

if ! gsutil ls "gs://${TF_STATE_BUCKET}" &> /dev/null; then
    log_info "Creating Terraform state bucket..."
    gsutil mb -l "$REGION" -p "$PROJECT_ID" "gs://${TF_STATE_BUCKET}"
    gsutil versioning set on "gs://${TF_STATE_BUCKET}"
    log_success "State bucket created: $TF_STATE_BUCKET"
else
    log_info "State bucket exists: $TF_STATE_BUCKET"
fi

# =============================================================================
# Build Container Images (if not skipped)
# =============================================================================
if [[ "$SKIP_BUILD" == false && "$DESTROY" == false ]]; then
    log_info "Building and pushing container images..."
    
    # Configure Docker for Artifact Registry
    gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
    
    # Image registry path
    REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/ranger-images"
    
    # Check if Artifact Registry exists (created by Terraform on first run)
    # For initial deployment, skip builds - Terraform creates registry first
    if gcloud artifacts repositories describe ranger-images \
        --location="$REGION" --project="$PROJECT_ID" &> /dev/null; then
        
        log_info "Building images... (this may take a few minutes)"
        
        # Build coordinator
        if [[ -d "$ROOT_DIR/../agents/coordinator" ]]; then
            docker build -t "${REGISTRY}/ranger-coordinator:latest" \
                "$ROOT_DIR/../agents/coordinator"
            docker push "${REGISTRY}/ranger-coordinator:latest"
            log_success "Pushed: ranger-coordinator"
        fi
        
        # Build console
        if [[ -d "$ROOT_DIR/../apps/command-console" ]]; then
            docker build -t "${REGISTRY}/ranger-console:latest" \
                "$ROOT_DIR/../apps/command-console"
            docker push "${REGISTRY}/ranger-console:latest"
            log_success "Pushed: ranger-console"
        fi
        
        # Build MCP fixtures
        if [[ -d "$ROOT_DIR/../mcp/fixtures" ]]; then
            docker build -t "${REGISTRY}/ranger-mcp-fixtures:latest" \
                "$ROOT_DIR/../mcp/fixtures"
            docker push "${REGISTRY}/ranger-mcp-fixtures:latest"
            log_success "Pushed: ranger-mcp-fixtures"
        fi
    else
        log_warn "Artifact Registry not found. Will be created by Terraform."
        log_warn "Re-run with --skip-build=false after initial Terraform apply."
    fi
fi

# =============================================================================
# Terraform Deployment
# =============================================================================
cd "$ROOT_DIR"

log_info "Initializing Terraform..."
terraform init \
    -backend-config="bucket=${TF_STATE_BUCKET}" \
    -backend-config="prefix=terraform/state/${ENVIRONMENT}" \
    -reconfigure

# Select or create workspace
WORKSPACE="${REGION}-${ENVIRONMENT}"
if terraform workspace list | grep -q "$WORKSPACE"; then
    terraform workspace select "$WORKSPACE"
else
    terraform workspace new "$WORKSPACE"
fi
log_info "Terraform workspace: $WORKSPACE"

# Check for secrets
TFVARS_FILE="environments/${ENVIRONMENT}.tfvars"
SECRETS_FILE="environments/secrets.tfvars"

TFVARS_ARGS="-var-file=${TFVARS_FILE}"
if [[ -f "$SECRETS_FILE" ]]; then
    TFVARS_ARGS="${TFVARS_ARGS} -var-file=${SECRETS_FILE}"
    log_info "Using secrets from: $SECRETS_FILE"
else
    log_warn "No secrets.tfvars found. Ensure TF_VAR_* environment variables are set."
fi

# Plan or Apply
if [[ "$DESTROY" == true ]]; then
    log_warn "DESTROYING infrastructure..."
    terraform destroy $TFVARS_ARGS $AUTO_APPROVE
    log_success "Infrastructure destroyed."
    exit 0
fi

if [[ "$PLAN_ONLY" == true ]]; then
    log_info "Running terraform plan..."
    terraform plan $TFVARS_ARGS
    exit 0
fi

log_info "Applying Terraform configuration..."
terraform apply $TFVARS_ARGS $AUTO_APPROVE

# =============================================================================
# RAG Corpus Setup (Hybrid)
# =============================================================================
if [[ "$SKIP_RAG" == false ]]; then
    log_info "Running RAG corpus setup..."
    
    # Get knowledge bucket from Terraform output
    KNOWLEDGE_BUCKET=$(terraform output -raw knowledge_bucket 2>/dev/null || echo "")
    
    if [[ -n "$KNOWLEDGE_BUCKET" ]]; then
        python3 "$SCRIPT_DIR/setup-rag-corpora.py" \
            --project="$PROJECT_ID" \
            --region="$REGION" \
            --knowledge-bucket="$KNOWLEDGE_BUCKET" \
            --output-file="$ROOT_DIR/rag-corpus-ids.json"
        
        log_success "RAG corpora configured. Update your tfvars with corpus IDs from rag-corpus-ids.json"
    else
        log_warn "Could not determine knowledge bucket. Run RAG setup manually."
    fi
fi

# =============================================================================
# Output Results
# =============================================================================
echo ""
echo "============================================================"
echo "RANGER Deployment Complete"
echo "============================================================"
terraform output -json | jq -r '.service_urls.value | to_entries[] | "  \(.key): \(.value)"'
echo ""
echo "Artifact Registry: $(terraform output -raw artifact_registry_url)"
echo "Knowledge Bucket: $(terraform output -raw knowledge_bucket)"
echo "============================================================"

log_success "Deployment complete!"

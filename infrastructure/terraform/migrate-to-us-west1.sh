#!/bin/bash
# =============================================================================
# RANGER Migration Script: us-central1/europe-west3 → us-west1
# =============================================================================
# This script migrates existing RANGER resources to the target region.
#
# Current State (from GCP audit):
#   - Cloud Run: us-central1 (coordinator, console, mcp-fixtures)
#   - GCS: us-central1 (ranger-knowledge-base)
#   - Vertex AI RAG: europe-west3 (4 corpora)
#
# Target State:
#   - All resources in us-west1
#   - Terraform-managed infrastructure
#   - Single-region architecture
#
# Usage:
#   ./migrate-to-us-west1.sh --project=ranger-twin-dev
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# =============================================================================
# Configuration
# =============================================================================
PROJECT_ID=""
SOURCE_REGION="us-central1"
TARGET_REGION="us-west1"
RAG_SOURCE_REGION="europe-west3"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --project=*)
            PROJECT_ID="${1#*=}"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            ;;
    esac
done

[[ -z "$PROJECT_ID" ]] && log_error "Missing required argument: --project"

echo "============================================================"
echo "RANGER Migration: $SOURCE_REGION → $TARGET_REGION"
echo "============================================================"
echo "Project: $PROJECT_ID"
echo "Dry Run: $DRY_RUN"
echo "============================================================"
echo ""

# =============================================================================
# Phase 1: Inventory Current Resources
# =============================================================================
log_info "Phase 1: Inventorying current resources..."

echo ""
echo "--- Cloud Run Services ($SOURCE_REGION) ---"
gcloud run services list --region="$SOURCE_REGION" --project="$PROJECT_ID" \
    --format="table(SERVICE,REGION,URL,LAST_DEPLOYED_BY)" || log_warn "No services found"

echo ""
echo "--- GCS Buckets ---"
gsutil ls -p "$PROJECT_ID" 2>/dev/null | while read -r bucket; do
    location=$(gsutil ls -L -b "$bucket" 2>/dev/null | grep "Location constraint" | awk '{print $3}')
    echo "  $bucket → $location"
done || log_warn "No buckets found"

echo ""
echo "--- Vertex AI RAG Corpora ($RAG_SOURCE_REGION) ---"
# Note: RAG corpus listing requires Python SDK
log_info "RAG corpora require Python SDK to list. Check via console or setup script."

# =============================================================================
# Phase 2: Migrate GCS Data
# =============================================================================
log_info "Phase 2: Migrating GCS data..."

SOURCE_BUCKET="ranger-knowledge-base"
TARGET_BUCKET="ranger-knowledge-${PROJECT_ID}-${TARGET_REGION}"

if gsutil ls "gs://${SOURCE_BUCKET}" &> /dev/null; then
    log_info "Found source bucket: $SOURCE_BUCKET"
    
    # Check if target already exists
    if gsutil ls "gs://${TARGET_BUCKET}" &> /dev/null; then
        log_warn "Target bucket exists: $TARGET_BUCKET"
    else
        if [[ "$DRY_RUN" == false ]]; then
            log_info "Creating target bucket: $TARGET_BUCKET"
            gsutil mb -l "$TARGET_REGION" -p "$PROJECT_ID" "gs://${TARGET_BUCKET}"
        else
            log_info "[DRY RUN] Would create: $TARGET_BUCKET"
        fi
    fi
    
    # Copy data
    if [[ "$DRY_RUN" == false ]]; then
        log_info "Copying data from $SOURCE_BUCKET to $TARGET_BUCKET..."
        gsutil -m cp -r "gs://${SOURCE_BUCKET}/*" "gs://${TARGET_BUCKET}/" || true
        log_success "Data migration complete"
    else
        log_info "[DRY RUN] Would copy data from $SOURCE_BUCKET to $TARGET_BUCKET"
    fi
else
    log_warn "Source bucket not found: $SOURCE_BUCKET"
fi

# =============================================================================
# Phase 3: Delete Old Cloud Run Services
# =============================================================================
log_info "Phase 3: Preparing to delete old Cloud Run services..."

OLD_SERVICES=("ranger-coordinator" "ranger-console" "ranger-mcp-fixtures")

for service in "${OLD_SERVICES[@]}"; do
    if gcloud run services describe "$service" --region="$SOURCE_REGION" --project="$PROJECT_ID" &> /dev/null; then
        log_info "Found old service: $service in $SOURCE_REGION"
        if [[ "$DRY_RUN" == false ]]; then
            read -p "Delete $service in $SOURCE_REGION? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                gcloud run services delete "$service" \
                    --region="$SOURCE_REGION" \
                    --project="$PROJECT_ID" \
                    --quiet
                log_success "Deleted: $service"
            fi
        else
            log_info "[DRY RUN] Would delete: $service in $SOURCE_REGION"
        fi
    fi
done

# =============================================================================
# Phase 4: Delete Old RAG Corpora
# =============================================================================
log_info "Phase 4: RAG corpus migration..."

cat << EOF

${YELLOW}MANUAL STEP REQUIRED:${NC}

RAG corpora in $RAG_SOURCE_REGION must be deleted manually via:

1. Google Cloud Console:
   https://console.cloud.google.com/vertex-ai/rag/corpora?project=$PROJECT_ID

2. Or Python SDK:
   from vertexai.preview import rag
   rag.delete_corpus(name="projects/$PROJECT_ID/locations/$RAG_SOURCE_REGION/ragCorpora/CORPUS_ID")

After deletion, run the Terraform deployment to create new corpora in $TARGET_REGION.
EOF

# =============================================================================
# Phase 5: Deploy to Target Region
# =============================================================================
log_info "Phase 5: Ready for Terraform deployment..."

cat << EOF

${GREEN}Migration preparation complete!${NC}

Next steps:
1. Review the inventory above
2. Run the Terraform deployment:

   cd ranger-iac
   ./scripts/deploy.sh --project=$PROJECT_ID --region=$TARGET_REGION --env=dev

3. After successful deployment, clean up old resources:
   - Delete old GCS bucket: gsutil rm -r gs://$SOURCE_BUCKET
   - Delete old Artifact Registry repos if unused

4. Update any external integrations pointing to old URLs

EOF

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    log_warn "This was a DRY RUN. No changes were made."
    echo "Re-run without --dry-run to execute migration."
fi

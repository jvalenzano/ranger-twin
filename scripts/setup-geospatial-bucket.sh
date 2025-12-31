#!/bin/bash
# setup-geospatial-bucket.sh
# Creates GCS bucket for geospatial assets, configures CORS
#
# Prerequisites:
#   - Google Cloud SDK installed and authenticated
#   - Project configured: gcloud config set project ranger-usfs-dev
#
# Usage:
#   ./scripts/setup-geospatial-bucket.sh [bucket-name]
#
# Default bucket: gs://ranger-geospatial-dev

set -euo pipefail

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-ranger-usfs-dev}"
BUCKET_NAME="${1:-ranger-geospatial-dev}"
BUCKET_URI="gs://${BUCKET_NAME}"
REGION="us-central1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_step() { echo -e "${GREEN}[STEP]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    echo_step "Checking prerequisites..."

    if ! command -v gcloud &> /dev/null; then
        echo_error "gcloud CLI not found. Install Google Cloud SDK first."
        exit 1
    fi

    if ! command -v gsutil &> /dev/null; then
        echo_error "gsutil not found. Install Google Cloud SDK first."
        exit 1
    fi

    # Check authentication
    if ! gcloud auth print-access-token &> /dev/null; then
        echo_error "Not authenticated. Run: gcloud auth login"
        exit 1
    fi

    echo "  Project: ${PROJECT_ID}"
    echo "  Bucket: ${BUCKET_NAME}"
    echo_step "Prerequisites OK"
}

# Create bucket if not exists
create_bucket() {
    echo_step "Creating bucket ${BUCKET_URI}..."

    if gsutil ls -b "${BUCKET_URI}" &> /dev/null; then
        echo_warn "Bucket already exists, skipping creation"
    else
        gsutil mb -l "${REGION}" -p "${PROJECT_ID}" "${BUCKET_URI}"
        echo_step "Bucket created"
    fi
}

# Configure CORS for browser access
configure_cors() {
    echo_step "Configuring CORS for browser access..."

    CORS_CONFIG=$(mktemp)
    cat > "${CORS_CONFIG}" << 'EOF'
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://*.run.app",
      "https://ranger-console-*.run.app"
    ],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Range",
      "Content-Range",
      "Accept-Ranges",
      "Content-Length"
    ],
    "maxAgeSeconds": 3600
  }
]
EOF

    gsutil cors set "${CORS_CONFIG}" "${BUCKET_URI}"
    rm "${CORS_CONFIG}"

    echo_step "CORS configured"

    # Verify CORS
    echo "  Current CORS configuration:"
    gsutil cors get "${BUCKET_URI}"
}

# Create folder structure
create_folders() {
    echo_step "Creating folder structure..."

    # Create placeholder files to establish folders
    echo "# MTBS Burn Severity Data" | gsutil -q cp - "${BUCKET_URI}/mtbs/.gitkeep" || true
    echo "# Trail Damage Data" | gsutil -q cp - "${BUCKET_URI}/trails/.gitkeep" || true
    echo "# Treatment Unit Polygons" | gsutil -q cp - "${BUCKET_URI}/treatments/.gitkeep" || true

    echo "  Created: mtbs/, trails/, treatments/"
}

# Document signed URL approach (for production)
document_signed_urls() {
    echo_step "Documenting signed URL approach..."

    cat << 'EOF'

============================================
PRODUCTION ACCESS PATTERN: Signed URLs
============================================

For FedRAMP compliance, use signed URLs instead of public access.

Python Implementation:
----------------------
from google.cloud import storage
from datetime import timedelta

def get_signed_cog_url(bucket_name: str, blob_name: str, expiration_hours: int = 1) -> str:
    """Generate a signed URL for secure COG access."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.generate_signed_url(
        expiration=timedelta(hours=expiration_hours),
        method='GET'
    )

# Usage
url = get_signed_cog_url('ranger-geospatial-dev', 'mtbs/cedar_creek_severity_cog.tif')

TypeScript/Frontend:
--------------------
Request signed URLs from backend API:

  GET /api/geospatial/signed-url?asset=mtbs/cedar_creek_severity_cog.tif

Then use the signed URL in TiTiler requests:

  const signedUrl = await fetchSignedUrl(assetPath);
  const tileUrl = `${TITILER_URL}/cog/tiles/{z}/{x}/{y}?url=${encodeURIComponent(signedUrl)}`;

============================================

EOF

}

# Upload helper function documentation
document_upload() {
    echo_step "Upload instructions..."

    cat << EOF

============================================
UPLOAD COG TO GCS
============================================

After running process-mtbs-cog.sh, upload the COG:

  gsutil -h "Content-Type:image/tiff" \\
    cp ~/ranger-geo/mtbs/cedar_creek_severity_cog.tif \\
    ${BUCKET_URI}/mtbs/cedar_creek_severity_cog.tif

Verify upload:

  gsutil ls -l ${BUCKET_URI}/mtbs/

Test HTTP access (for TiTiler):

  curl -I "https://storage.googleapis.com/${BUCKET_NAME}/mtbs/cedar_creek_severity_cog.tif"

Expected response: 200 OK with Accept-Ranges: bytes

============================================

EOF

}

# Print summary
print_summary() {
    echo ""
    echo "=============================================="
    echo_step "GCS Bucket Setup Complete!"
    echo "=============================================="
    echo ""
    echo "  Bucket: ${BUCKET_URI}"
    echo "  Region: ${REGION}"
    echo "  CORS: Configured for localhost and *.run.app"
    echo ""
    echo "  Folder Structure:"
    echo "    ${BUCKET_URI}/mtbs/        - Burn severity COGs"
    echo "    ${BUCKET_URI}/trails/      - Trail damage vectors"
    echo "    ${BUCKET_URI}/treatments/  - Treatment unit polygons"
    echo ""
    echo "  Next steps:"
    echo "    1. Run: ./scripts/process-mtbs-cog.sh"
    echo "    2. Upload COG: gsutil cp ~/ranger-geo/mtbs/*.tif ${BUCKET_URI}/mtbs/"
    echo "    3. Deploy TiTiler (see services/titiler/README.md)"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    create_bucket
    configure_cors
    create_folders
    document_signed_urls
    document_upload
    print_summary
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

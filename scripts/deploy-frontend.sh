#!/bin/bash
# ============================================
# RANGER Phase 0: Deploy Frontend to Cloud Run
# ============================================
#
# This script deploys the Command Console to Cloud Run
# with Basic Auth enabled for demo access control.
#
# IMPORTANT: Uses cloudbuild.yaml to properly pass build arguments.
# The `--set-build-env-vars` flag does NOT work with Docker ARGs,
# so we must use explicit Cloud Build configuration.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Access to ranger-twin-dev GCP project
#
# Usage:
#   ./scripts/deploy-frontend.sh
#   ./scripts/deploy-frontend.sh --password "YourSecurePassword"
#
# ============================================

set -e

# ============================================
# Configuration
# ============================================
PROJECT_ID="${GCP_PROJECT_ID:-ranger-twin-dev}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="ranger-console"

# Backend URL (already deployed)
BACKEND_URL="${VITE_ADK_URL:-https://ranger-coordinator-1058891520442.us-central1.run.app}"

# MapTiler API key (for maps)
MAPTILER_KEY="${VITE_MAPTILER_API_KEY:-lxfnA21IbZC0utlR0bj3}"

# Demo password - CHANGE THIS for your deployment!
DEFAULT_PASSWORD="RangerDemo2025!"
DEMO_PASSWORD="${DEMO_PASSWORD:-$DEFAULT_PASSWORD}"

# ============================================
# Parse command line arguments
# ============================================
while [[ $# -gt 0 ]]; do
    case $1 in
        --password)
            DEMO_PASSWORD="$2"
            shift 2
            ;;
        --project)
            PROJECT_ID="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --backend)
            BACKEND_URL="$2"
            shift 2
            ;;
        --maptiler-key)
            MAPTILER_KEY="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --password PASSWORD     Set the demo access password"
            echo "  --project PROJECT       GCP project ID (default: ranger-twin-dev)"
            echo "  --region REGION         GCP region (default: us-central1)"
            echo "  --backend URL           Backend API URL"
            echo "  --maptiler-key KEY      MapTiler API key (required for maps)"
            echo "  --dry-run              Show what would be deployed without deploying"
            echo "  --help                 Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ============================================
# Validation
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌲 RANGER Frontend Deployment (Phase 0)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Configuration:"
echo "    Project:      $PROJECT_ID"
echo "    Region:       $REGION"
echo "    Service:      $SERVICE_NAME"
echo "    Backend:      $BACKEND_URL"
echo "    MapTiler:     ${MAPTILER_KEY:0:8}*** (first 8 chars shown)"
echo "    Password:     ${DEMO_PASSWORD:0:3}*** (first 3 chars shown)"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN MODE - No changes will be made]"
    echo ""
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if we're in the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONSOLE_DIR="$PROJECT_ROOT/apps/command-console"

if [ ! -f "$CONSOLE_DIR/package.json" ]; then
    echo "❌ Error: Cannot find apps/command-console/package.json"
    echo "   Run this script from the project root"
    exit 1
fi

if [ ! -f "$CONSOLE_DIR/cloudbuild.yaml" ]; then
    echo "❌ Error: Cannot find apps/command-console/cloudbuild.yaml"
    echo "   This file is required for proper build arg handling"
    exit 1
fi

# Validate MapTiler key
if [ "$MAPTILER_KEY" = "get_your_own_key" ] || [ -z "$MAPTILER_KEY" ]; then
    echo "❌ Error: MapTiler API key is not configured"
    echo "   Set VITE_MAPTILER_API_KEY environment variable or use --maptiler-key flag"
    echo "   Get a free key at: https://cloud.maptiler.com/"
    exit 1
fi

# ============================================
# Deploy using Cloud Build
# ============================================
cd "$CONSOLE_DIR"

if [ "$DRY_RUN" = true ]; then
    echo "Would run:"
    echo "  gcloud builds submit \\"
    echo "    --project $PROJECT_ID \\"
    echo "    --config cloudbuild.yaml \\"
    echo "    --substitutions _VITE_ADK_URL=$BACKEND_URL,_VITE_MAPTILER_API_KEY=***,_DEMO_PASSWORD=***,_REGION=$REGION"
    exit 0
fi

echo "🚀 Starting deployment via Cloud Build..."
echo ""
echo "   Using cloudbuild.yaml for proper --build-arg handling"
echo ""

gcloud builds submit \
    --project "$PROJECT_ID" \
    --config cloudbuild.yaml \
    --substitutions "_VITE_ADK_URL=$BACKEND_URL,_VITE_MAPTILER_API_KEY=$MAPTILER_KEY,_DEMO_PASSWORD=$DEMO_PASSWORD,_REGION=$REGION"

# ============================================
# Get deployed URL
# ============================================
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME \
    --project $PROJECT_ID \
    --region $REGION \
    --format 'value(status.url)')

# ============================================
# Update backend CORS (if needed)
# ============================================
echo ""
echo "📝 Checking backend CORS configuration..."

# Get current CORS config
CURRENT_CORS=$(gcloud run services describe ranger-coordinator \
    --project $PROJECT_ID \
    --region $REGION \
    --format 'value(spec.template.spec.containers[0].env)' 2>/dev/null | grep ALLOW_ORIGINS || echo "")

if [[ "$CURRENT_CORS" != *"$FRONTEND_URL"* ]]; then
    echo "   Adding $FRONTEND_URL to backend CORS..."

    # Build new CORS string
    NEW_CORS="$FRONTEND_URL,http://localhost:5173,http://localhost:3000"

    gcloud run services update ranger-coordinator \
        --project $PROJECT_ID \
        --region $REGION \
        --update-env-vars "ALLOW_ORIGINS=$NEW_CORS" \
        --quiet

    echo "   ✅ Backend CORS updated"
else
    echo "   ✅ Backend CORS already includes frontend URL"
fi

# ============================================
# Success output
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ RANGER Demo Deployed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Demo URL:  $FRONTEND_URL"
echo ""
echo "  🔐 Access Credentials:"
echo "     Username: ranger"
echo "     Password: $DEMO_PASSWORD"
echo ""
echo "  📋 Share with your team:"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  RANGER Demo Access                                     │"
echo "  │                                                         │"
echo "  │  URL: $FRONTEND_URL"
echo "  │  User: ranger                                           │"
echo "  │  Pass: $DEMO_PASSWORD"
echo "  │                                                         │"
echo "  │  Try: \"Give me a recovery briefing for Cedar Creek\"    │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""
echo "  🔧 Backend: $BACKEND_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================
# Health check
# ============================================
echo ""
echo "🏥 Running health check..."
sleep 5  # Give Cloud Run a moment to start

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/health")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "   ✅ Health check passed (HTTP $HEALTH_STATUS)"
else
    echo "   ⚠️  Health check returned HTTP $HEALTH_STATUS"
    echo "   This may be normal - Cloud Run might still be starting"
fi

echo ""
echo "🎉 Deployment complete! Open $FRONTEND_URL in your browser."

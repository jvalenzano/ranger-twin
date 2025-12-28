#!/bin/bash
# ============================================
# RANGER Phase 0: Deploy Frontend to Cloud Run
# ============================================
# 
# This script deploys the Command Console to Cloud Run
# with Basic Auth enabled for demo access control.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Docker installed (for local testing)
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
# Can be overridden via --password flag or DEMO_PASSWORD env var
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
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --password PASSWORD  Set the demo access password"
            echo "  --project PROJECT    GCP project ID (default: ranger-twin-dev)"
            echo "  --region REGION      GCP region (default: us-central1)"
            echo "  --backend URL        Backend API URL"
            echo "  --dry-run           Show what would be deployed without deploying"
            echo "  --help              Show this help message"
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
echo "    Project:    $PROJECT_ID"
echo "    Region:     $REGION"
echo "    Service:    $SERVICE_NAME"
echo "    Backend:    $BACKEND_URL"
echo "    Password:   ${DEMO_PASSWORD:0:3}*** (first 3 chars shown)"
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

if [ ! -f "$CONSOLE_DIR/Dockerfile" ]; then
    echo "❌ Error: Cannot find apps/command-console/Dockerfile"
    echo "   Make sure the Dockerfile exists"
    exit 1
fi

# ============================================
# Deploy
# ============================================
cd "$CONSOLE_DIR"

if [ "$DRY_RUN" = true ]; then
    echo "Would run:"
    echo "  gcloud run deploy $SERVICE_NAME \\"
    echo "    --project $PROJECT_ID \\"
    echo "    --region $REGION \\"
    echo "    --source . \\"
    echo "    --set-build-env-vars VITE_ADK_URL=$BACKEND_URL,VITE_MAPTILER_API_KEY=$MAPTILER_KEY,DEMO_PASSWORD=*** \\"
    echo "    --allow-unauthenticated \\"
    echo "    --port 8080 \\"
    echo "    --memory 256Mi \\"
    echo "    --cpu 1 \\"
    echo "    --min-instances 0 \\"
    echo "    --max-instances 3"
    exit 0
fi

echo "🚀 Starting deployment..."
echo ""

gcloud run deploy $SERVICE_NAME \
    --project $PROJECT_ID \
    --region $REGION \
    --source . \
    --set-build-env-vars VITE_ADK_URL=$BACKEND_URL,VITE_MAPTILER_API_KEY=$MAPTILER_KEY,DEMO_PASSWORD=$DEMO_PASSWORD \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --timeout 60

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
echo "📝 Updating backend CORS configuration..."

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

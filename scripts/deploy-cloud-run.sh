#!/bin/bash
# RANGER Cloud Run Deployment Script
# Deploys backend ADK Orchestrator to Cloud Run
#
# Usage: ./scripts/deploy-cloud-run.sh
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - Application Default Credentials configured
# - Docker running

set -e

PROJECT_ID="ranger-twin-dev"
REGION="us-central1"
SERVICE_NAME="ranger-coordinator"

echo "=== RANGER Cloud Run Deployment ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Verify gcloud auth
echo ">>> Verifying GCP authentication..."
if ! gcloud auth print-access-token > /dev/null 2>&1; then
    echo "ERROR: GCP authentication failed. Run: gcloud auth login"
    exit 1
fi
echo "GCP Auth OK"

# Verify ADC
echo ">>> Verifying Application Default Credentials..."
if ! gcloud auth application-default print-access-token > /dev/null 2>&1; then
    echo "ERROR: ADC not configured. Run: gcloud auth application-default login"
    exit 1
fi
echo "ADC OK"

# Deploy Backend
echo ""
echo ">>> Deploying Backend to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION,GOOGLE_GENAI_USE_VERTEXAI=TRUE" \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300

echo ""
echo ">>> Backend deployed!"

# Get the service URL
CLOUD_RUN_URL=$(gcloud run services describe $SERVICE_NAME --project $PROJECT_ID --region $REGION --format='value(status.url)')

echo ""
echo "=== Deployment Complete ==="
echo "Backend URL: $CLOUD_RUN_URL"
echo ""
echo "Testing health endpoint..."
curl -s "$CLOUD_RUN_URL/health" | python3 -m json.tool || echo "Health check pending (service may be starting)"

echo ""
echo "To test agent listing:"
echo "  curl -s \"$CLOUD_RUN_URL/list-apps\" | jq ."
echo ""
echo "To update frontend .env.production with this URL:"
echo "  sed -i '' \"s|VITE_ADK_URL=.*|VITE_ADK_URL=$CLOUD_RUN_URL|\" apps/command-console/.env.production"

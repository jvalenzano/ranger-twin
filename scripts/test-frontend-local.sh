#!/bin/bash
# ============================================
# Test the Docker build locally before deploying
# ============================================
#
# Usage:
#   ./scripts/test-frontend-local.sh
#
# This builds and runs the container locally so you can
# verify everything works before deploying to Cloud Run.
#
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONSOLE_DIR="$PROJECT_ROOT/apps/command-console"

cd "$CONSOLE_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🐳 Building RANGER Frontend Container Locally"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build the image
docker build \
    --build-arg VITE_ADK_URL=https://ranger-coordinator-1058891520442.us-central1.run.app \
    --build-arg VITE_MAPTILER_API_KEY=lxfnA21IbZC0utlR0bj3 \
    --build-arg DEMO_PASSWORD=TestLocal123 \
    -t ranger-console:local \
    .

echo ""
echo "✅ Build successful!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting local container on port 8080"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Access at: http://localhost:8080"
echo "  Username:  ranger"
echo "  Password:  TestLocal123"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Run the container
docker run --rm -p 8080:8080 ranger-console:local

# RANGER ADK Orchestrator
# Multi-agent post-fire forest recovery platform
#
# Architecture: Single Cloud Run service hosting Recovery Coordinator + all specialists
# Pattern: AgentTool (ADR-008), not microservices
# Data: Fixture-First (ADR-009) - real federal data bundled in image
#
# Build locally:
#   docker build -t ranger-orchestrator .
#
# Run locally:
#   docker run -p 8000:8080 -e GOOGLE_API_KEY=xxx ranger-orchestrator
#
# Deploy to Cloud Run (recommended):
#   gcloud run deploy ranger-coordinator \
#     --source . \
#     --project ranger-twin-dev \
#     --region us-central1 \
#     --cpu 2 --memory 4Gi \
#     --concurrency 20 --min-instances 0 \
#     --timeout 600 \
#     --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=ranger-twin-dev,GOOGLE_CLOUD_LOCATION=us-central1,ALLOW_ORIGINS=https://ranger-console-fqd6rb7jba-uc.a.run.app" \
#     --allow-unauthenticated
#
# Note: Fixtures are bundled in this image. MCP servers are Phase 2.
# See docs/adr/ADR-009-fixture-first-development.md for data strategy.

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agents directory (all agents in single service per ADR-008)
COPY agents/ ./agents/

# Create skills directory (shared skills, if any exist)
RUN mkdir -p ./skills

# Copy main application
COPY main.py .

# Copy fixture data (bundled for demo per ADR-009)
# Production replaces this with MCP calls to federal APIs
COPY data/fixtures/ ./data/fixtures/

# Verify fixture data was copied (fails build immediately if missing)
RUN echo "Verifying fixture data..." && \
    test -d data/fixtures/cedar-creek || \
    (echo "ERROR: Cedar Creek fixture directory missing! Check .gcloudignore" && exit 1) && \
    test -f data/fixtures/cedar-creek/timber-plots.json || \
    (echo "ERROR: timber-plots.json missing! Check .gcloudignore" && exit 1) && \
    echo "Fixture data verified successfully"

# Environment configuration
ENV AGENTS_DIR=/app/agents
ENV PORT=8080
ENV PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE 8080

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

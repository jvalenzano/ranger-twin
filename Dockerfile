# RANGER ADK Orchestrator
# Multi-agent post-fire forest recovery platform
#
# Build:
#   docker build -t ranger-orchestrator .
#
# Run locally:
#   docker run -p 8000:8080 -e GOOGLE_API_KEY=xxx ranger-orchestrator
#
# Deploy to Cloud Run (Vertex AI with ADC):
#   gcloud run deploy ranger-coordinator \
#     --source . \
#     --project ranger-twin-dev \
#     --region us-central1 \
#     --cpu 2 --memory 4Gi \
#     --concurrency 20 --min-instances 1 \
#     --timeout 600 \
#     --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=ranger-twin-dev,GOOGLE_CLOUD_LOCATION=us-central1,MCP_FIXTURES_URL=https://ranger-mcp-fixtures-1058891520442.us-central1.run.app/sse \
#     --allow-unauthenticated

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agents directory
COPY agents/ ./agents/

# Create skills directory (shared skills, if any exist)
RUN mkdir -p ./skills

# Copy main application
COPY main.py .

# Copy fixture data (for local testing - MCP server serves this in production)
COPY data/fixtures/ ./data/fixtures/

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

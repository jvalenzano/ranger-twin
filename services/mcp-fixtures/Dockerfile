# RANGER MCP Fixtures Server
# Serves Cedar Creek fixture data to ADK agents
#
# Build from project root:
#   docker build -f services/mcp-fixtures/Dockerfile -t ranger-mcp-fixtures .
#
# Or deploy to Cloud Run:
#   gcloud run deploy ranger-mcp-fixtures --source . \
#     --dockerfile services/mcp-fixtures/Dockerfile \
#     --project ranger-twin-dev --region us-central1

FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY services/mcp-fixtures/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy fixture data (relative to project root build context)
COPY data/fixtures/cedar-creek ./data/fixtures/cedar-creek

# Copy server
COPY services/mcp-fixtures/server.py .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]

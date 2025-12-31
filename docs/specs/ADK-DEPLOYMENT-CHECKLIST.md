# ADK Deployment Checklist

> **Status:** Draft for Review  
> **Purpose:** Ensure Recovery Coordinator is deployed and callable before Week 3-4 UI integration  
> **Audience:** DevOps, Backend developers, Claude Code

---

## Overview

This checklist ensures the ADK-based Recovery Coordinator agent is deployed to Cloud Run and accessible from the Command Console frontend. Week 3-4 of ADR-012 depends on a working `/run_sse` endpoint.

---

## Pre-Deployment Checklist

### 1. Agent Code Validation

```bash
# Navigate to agent directory
cd services/agents/recovery_coordinator

# Verify structure
ls -la
# Expected:
# ├── __init__.py
# ├── agent.py          # Contains root_agent
# ├── requirements.txt
# └── skills/           # Specialist agent skills
```

**Verification:**
- [ ] `agent.py` exports `root_agent` variable
- [ ] `__init__.py` contains `from . import agent`
- [ ] `requirements.txt` includes `google-adk>=0.1.0`
- [ ] All specialist agents (burn_analyst, trail_assessor, etc.) are importable

### 2. Local Testing

```bash
# Start ADK API server locally
cd services/agents
adk api_server

# Expected output:
# INFO: Uvicorn running on http://localhost:8000

# In another terminal, verify endpoints
curl http://localhost:8000/list-apps
# Expected: ["recovery_coordinator"]
```

**Verification:**
- [ ] `adk api_server` starts without errors
- [ ] `/list-apps` returns agent name
- [ ] No import errors in console

### 3. Test Session Creation

```bash
# Create test session
curl -X POST http://localhost:8000/apps/recovery_coordinator/users/test_user/sessions/test_session \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: Session JSON with id, appName, userId
```

**Verification:**
- [ ] Session creates successfully
- [ ] Response includes session ID

### 4. Test Agent Invocation

```bash
# Send test message
curl -X POST http://localhost:8000/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "recovery_coordinator",
    "userId": "test_user",
    "sessionId": "test_session",
    "newMessage": {
      "role": "user",
      "parts": [{"text": "What is the status of Cedar Creek Fire?"}]
    },
    "streaming": false
  }'

# Expected: SSE events with agent responses
```

**Verification:**
- [ ] Agent responds (even if with mock/limited data)
- [ ] Response includes `author` field with agent name
- [ ] No timeout or connection errors

---

## Cloud Run Deployment

### 5. Environment Variables

Create `.env.production` (do not commit):

```bash
# Required for Vertex AI
GOOGLE_CLOUD_PROJECT=ranger-usfs-dev
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true

# Optional: Session persistence
# SESSION_DB_URL=postgresql+asyncpg://user:pass@host:5432/ranger_sessions

# Optional: If using API key instead of ADC
# GOOGLE_API_KEY=your-api-key
```

### 6. Dockerfile Validation

**File:** `services/agents/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY . .

# ADK API server listens on PORT env var (Cloud Run sets this)
ENV PORT=8080

# Start ADK API server
CMD ["python", "-m", "google.adk.cli", "api_server", "--host", "0.0.0.0", "--port", "8080"]
```

**Verification:**
- [ ] Dockerfile exists and is valid
- [ ] Base image is Python 3.11+
- [ ] PORT defaults to 8080 (Cloud Run standard)

### 7. Deploy to Cloud Run

```bash
# Set project
gcloud config set project ranger-usfs-dev

# Deploy using ADK CLI (recommended)
cd services/agents
adk deploy cloud_run \
  --project=ranger-usfs-dev \
  --region=us-central1 \
  --service_name=ranger-api \
  recovery_coordinator

# OR deploy manually with gcloud
gcloud run deploy ranger-api \
  --source . \
  --region us-central1 \
  --timeout=600 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=ranger-usfs-dev,GOOGLE_CLOUD_LOCATION=us-central1,GOOGLE_GENAI_USE_VERTEXAI=true"
```

**Verification:**
- [ ] Deployment completes without errors
- [ ] Service URL provided (e.g., `https://ranger-api-xxxxx.run.app`)

### 8. Post-Deployment Verification

```bash
# Set service URL
export API_URL="https://ranger-api-xxxxx.run.app"

# Test health
curl $API_URL/list-apps
# Expected: ["recovery_coordinator"]

# Test session creation
curl -X POST $API_URL/apps/recovery_coordinator/users/test/sessions/deploy_test \
  -H "Content-Type: application/json" \
  -d '{}'

# Test agent
curl -X POST $API_URL/run_sse \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "recovery_coordinator",
    "userId": "test",
    "sessionId": "deploy_test",
    "newMessage": {
      "role": "user",
      "parts": [{"text": "Hello, are you operational?"}]
    },
    "streaming": false
  }'
```

**Verification:**
- [ ] `/list-apps` returns agent list
- [ ] Session creation works
- [ ] Agent responds to messages
- [ ] Response time < 60 seconds (cold start) / < 15 seconds (warm)
- [ ] **Note:** First request after deploy may take 60-90s due to model loading

### 8.5 Add Health Check Endpoint

ADK doesn't provide a health endpoint by default. Add to your FastAPI app:

```python
from datetime import datetime

@app.get('/health')
async def health_check():
    return {
        'status': 'healthy',
        'agent': 'recovery_coordinator',
        'timestamp': datetime.utcnow().isoformat()
    }
```

---

## CORS Configuration

### 9. Allow Frontend Origins

The ADK API server needs to accept requests from the Command Console frontend.

**For local development:**
```python
# In main.py or wherever FastAPI app is configured
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ranger-console-xxxxx.run.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**For ADK CLI deployment:**
The `adk api_server` command should handle CORS automatically. If issues arise:

```bash
# Check if CORS headers are present
curl -I -X OPTIONS $API_URL/run_sse \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"

# Should include:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: POST
```

**Verification:**
- [ ] OPTIONS request returns CORS headers
- [ ] Frontend can reach API without CORS errors

---

## Session Persistence (Required for Production)

### 10. Recommended: VertexAI Session Service

For federal deployment, use the managed VertexAI Session Service:

```python
from google.adk.sessions import VertexAiSessionService

session_service = VertexAiSessionService(
    project=os.environ['GOOGLE_CLOUD_PROJECT'],
    location=os.environ['GOOGLE_CLOUD_LOCATION']
)
```

**Why not alternatives:**
- ❌ SQLite: No persistence across instances, no audit trail
- ⚠️ PostgreSQL: Requires Cloud SQL with FedRAMP configuration (additional complexity)
- ✅ VertexAI: Managed, auditable, FedRAMP-aligned

**Verification:**
- [ ] Session persists after API restart
- [ ] Multi-turn conversations maintain context

---

## Frontend Configuration

### 11. API URL Configuration

**File:** `apps/command-console/.env`

```bash
# Development
VITE_ADK_API_URL=http://localhost:8000

# Production (set in Cloud Run or CI/CD)
VITE_ADK_API_URL=https://ranger-api-xxxxx.run.app
```

**File:** `apps/command-console/src/config/api.ts`

```typescript
export const API_CONFIG = {
  ADK_BASE_URL: import.meta.env.VITE_ADK_API_URL || 'http://localhost:8000',
  APP_NAME: 'recovery_coordinator',
  // Generate unique user ID (or use auth)
  getUserId: () => localStorage.getItem('ranger_user_id') || generateUserId(),
};
```

**Verification:**
- [ ] Environment variable set correctly
- [ ] Frontend can construct valid API URLs

---

## Troubleshooting

### Agent not responding
```bash
# Check Cloud Run logs
gcloud run logs read ranger-api --limit=50

# Common issues:
# - Missing GOOGLE_CLOUD_PROJECT env var
# - Vertex AI API not enabled
# - Service account lacks permissions
```

### CORS errors
```bash
# Verify CORS middleware is active
# Check browser Network tab for preflight (OPTIONS) request
# Ensure allow_origins includes exact frontend URL
```

### Cold start timeout
```bash
# Cloud Run has 300s default timeout
# If agent takes too long to initialize:
gcloud run services update ranger-api \
  --timeout=600 \
  --cpu=2 \
  --memory=2Gi
```

### Session not persisting
```bash
# InMemorySessionService doesn't persist across restarts
# Switch to DatabaseSessionService or VertexAiSessionService
# Check database connectivity if using external DB
```

---

## Security Checklist

- [ ] API keys stored in Secret Manager, not env vars
- [ ] Service account has minimal required permissions
- [ ] HTTPS enforced (Cloud Run default)
- [ ] Rate limiting configured (if public)
- [ ] No PII logged to Cloud Logging

---

## 12. Post-Deployment Verification Script

Save as `scripts/verify-deployment.sh`:

```bash
#!/bin/bash
set -e
API_URL=${1:-"http://localhost:8000"}

echo "Testing /list-apps..."
curl -f "$API_URL/list-apps" || exit 1

echo "Testing session creation..."
curl -f -X POST "$API_URL/apps/recovery_coordinator/users/test/sessions/verify" \
  -H "Content-Type: application/json" -d '{}' || exit 1

echo "Testing agent invocation (60s timeout)..."
curl -f -X POST "$API_URL/run_sse" \
  -H "Content-Type: application/json" \
  -d '{"appName":"recovery_coordinator","userId":"test","sessionId":"verify","newMessage":{"role":"user","parts":[{"text":"health check"}]},"streaming":false}' \
  --max-time 60 || exit 1

echo "✅ All checks passed"
```

Run after every deployment:

```bash
./scripts/verify-deployment.sh https://ranger-api-xxxxx.run.app
```

---

## Go/No-Go Checklist

Before starting ADR-012 Week 3 integration:

| Check | Status |
|-------|--------|
| `adk api_server` runs locally | ⬜ |
| `/list-apps` returns recovery_coordinator | ⬜ |
| Session creation works | ⬜ |
| `/run_sse` returns agent response | ⬜ |
| Cloud Run deployment successful | ⬜ |
| CORS allows frontend origin | ⬜ |
| Frontend env vars configured | ⬜ |

**All checks must pass before Claude Code begins Week 3 ADK integration.**

---

**Document Owner:** RANGER CTO  
**Last Updated:** 2024-12-31  
**Status:** Draft for Review

# API Gateway

> FastAPI main router for Cedar Creek Digital Twin

## Overview

The API Gateway is the central entry point for all client requests. It routes queries to the appropriate agents and handles authentication, rate limiting, and response aggregation.

## Tech Stack

- **Framework**: FastAPI
- **Validation**: Pydantic v2
- **Auth**: OAuth2 / JWT (stubbed for demo)
- **Docs**: OpenAPI (Swagger UI)

## Structure

```
app/
├── main.py                  # FastAPI app initialization
├── config.py                # Settings from environment
├── routers/
│   ├── agents.py            # /api/agents/* routes
│   ├── data.py              # /api/data/* routes (GeoJSON, exports)
│   ├── health.py            # /health, /ready endpoints
│   └── auth.py              # Authentication (stubbed)
├── models/
│   ├── requests.py          # Request schemas
│   └── responses.py         # Response schemas
├── services/
│   ├── agent_client.py      # Internal agent communication
│   └── cache.py             # Redis caching
└── middleware/
    ├── logging.py           # Request logging
    └── cors.py              # CORS configuration
```

## API Routes

### Agent Queries

```
POST /api/agents/{agent_name}/query
  - agent_name: burn-analyst | trail-assessor | timber-cruiser | compliance-advisor | recovery-coordinator
  - body: { "question": "...", "context": {...} }
  - returns: { "answer": "...", "confidence": 0.94, "sources": [...], "suggestions": [...] }
```

### Data Access

```
GET  /api/data/layers/{layer_name}     # GeoJSON layers
GET  /api/data/rasters/{raster_name}   # Raster metadata
POST /api/data/export                  # Export to PDF, GeoJSON
```

### Health

```
GET /health   # Liveness probe
GET /ready    # Readiness probe (includes agent status)
```

## Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Format code
black app/
ruff check app/
```

## Environment Variables

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BURN_ANALYST_URL=http://burn-analyst:8001
TRAIL_ASSESSOR_URL=http://trail-assessor:8002
TIMBER_CRUISER_URL=http://timber-cruiser:8003
COMPLIANCE_ADVISOR_URL=http://compliance-advisor:8004
RECOVERY_COORDINATOR_URL=http://recovery-coordinator:8005
```

## Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

# BurnAnalyst Agent

> See [Full Specification](../../../docs/agents/BURN-ANALYST-SPEC.md) for capabilities and architecture.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python -m burn_analyst.main

# Run tests
pytest tests/
```

## API

```
POST /query
  body: {
    "question": "What percentage is high severity?",
    "context": { "fire_id": "cedar-creek-2022" }
  }
  returns: {
    "answer": "Based on my analysis...",
    "confidence": 0.94,
    "sources": [{ "type": "sentinel-2", "date": "2022-09-15" }],
    "suggestions": ["Compare to Holiday Farm Fire", "Show erosion risk"]
  }

GET /severity/{fire_id}
  returns: GeoJSON with severity polygons

GET /statistics/{fire_id}
  returns: { "high": 42.1, "moderate": 31.2, "low": 26.7 }
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-central1
GCP_PROJECT_ID=ranger-twin
CEDAR_CREEK_FIRE_ID=cedar-creek-2022
```

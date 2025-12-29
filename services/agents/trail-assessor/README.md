# TrailAssessor Agent

> See [Full Specification](../../../docs/agents/TRAIL-ASSESSOR-SPEC.md) for capabilities and architecture.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Download YOLOv8 weights
python scripts/download_weights.py

# Run the service
python -m trail_assessor.main

# Run tests
pytest tests/
```

## API

```
POST /query
  body: {
    "question": "What are the most critical damage points?",
    "context": { "trail_ids": ["rebel-creek", "french-pete"] }
  }
  returns: {
    "answer": "I've identified 23 damage points...",
    "confidence": 0.87,
    "sources": [...],
    "suggestions": [...]
  }

POST /analyze
  body: multipart/form-data with video file + GPS track
  returns: { "damage_points": [...], "job_id": "..." }

GET /damage/{trail_id}
  returns: GeoJSON with damage points

GET /priorities
  returns: Ordered list of repair priorities
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-central1
MODEL_WEIGHTS_PATH=./weights/trail_damage_v1.pt
```

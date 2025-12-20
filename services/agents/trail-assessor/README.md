# TrailAssessor Agent

> AI-powered trail damage detection and repair prioritization

## Overview

TrailAssessor analyzes video footage and GPS data to identify trail damage caused by wildfire, erosion, and related events. It uses computer vision (YOLOv8/SAM2) for damage detection and Gemini for classification and prioritization.

## Capabilities

- Identify damage types (washout, debris flow, bridge failure, tread erosion)
- Classify severity (Minor, Moderate, Severe, Critical)
- Estimate repair costs based on damage type and extent
- Prioritize repairs based on visitor safety, ecological impact, and cost
- Generate repair work orders with specifications

## Tech Stack

- **Vision**: YOLOv8 (Ultralytics), SAM2 (Segment Anything)
- **Geospatial**: GeoPandas, Shapely
- **LLM**: Google Gemini 2.0 Flash
- **API**: FastAPI

## Structure

```
trail_assessor/
├── main.py                  # FastAPI service
├── agent.py                 # TrailAssessor agent class
├── prompts/
│   └── system.md            # System prompt
├── tools/
│   ├── detection.py         # YOLOv8 damage detection
│   ├── segmentation.py      # SAM2 segmentation
│   ├── georef.py            # GPS correlation
│   └── prioritization.py    # Repair prioritization
├── models/
│   ├── damage.py            # Damage data models
│   └── repair.py            # Repair estimate models
└── weights/
    └── trail_damage_v1.pt   # Fine-tuned YOLOv8 weights
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

## System Prompt

```
You are TrailAssessor, a specialized AI agent for trail damage identification
and repair prioritization. You analyze video footage and GPS data to identify
trail damage caused by wildfire, erosion, and related events.

When responding:
- Reference specific trail names and mile markers
- Provide GPS coordinates for damage points
- Include cost estimates with confidence ranges
- Consider TRACS methodology standards
- Suggest repair sequencing based on dependencies
```

## Development

```bash
# Install
pip install -r requirements.txt

# Download YOLOv8 weights
python scripts/download_weights.py

# Run
python -m trail_assessor.main

# Test
pytest tests/
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4
MODEL_WEIGHTS_PATH=./weights/trail_damage_v1.pt
```

# BurnAnalyst Agent

> Satellite-based burn severity assessment using dNBR and Gemini multimodal

## Overview

BurnAnalyst processes Sentinel-2 and Landsat imagery to calculate burn severity using the differenced Normalized Burn Ratio (dNBR). It combines quantitative raster analysis with Gemini's multimodal capabilities for natural language interpretation.

## Capabilities

- Calculate and interpret dNBR values
- Classify severity (Unburned, Low, Moderate, High)
- Explain spatial patterns in burn severity
- Compare current fire to historical events
- Identify priority areas (erosion risk, etc.)

## Tech Stack

- **Satellite Processing**: geemap, Google Earth Engine
- **Raster I/O**: rasterio, xarray
- **LLM**: Google Gemini 2.0 Flash (multimodal)
- **API**: FastAPI

## Structure

```
burn_analyst/
├── main.py                  # FastAPI service
├── agent.py                 # BurnAnalyst agent class
├── prompts/
│   └── system.md            # System prompt
├── tools/
│   ├── dnbr.py              # dNBR calculation
│   ├── severity.py          # Severity classification
│   └── comparison.py        # Historical fire comparison
├── models/
│   ├── query.py             # Request/response schemas
│   └── severity.py          # Severity data models
└── data/
    └── cedar_creek/         # Pre-processed Cedar Creek data
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

## System Prompt

```
You are BurnAnalyst, a specialized AI agent for wildfire burn severity assessment.
You analyze satellite imagery (Sentinel-2, Landsat) to determine burn severity
using the differenced Normalized Burn Ratio (dNBR) methodology.

When responding:
- Always cite your data source and date
- Provide confidence levels for assessments
- Use precise acreage and percentage figures
- Explain your reasoning for classifications
- Suggest follow-up questions the user might ask
```

## Development

```bash
# Install
pip install -r requirements.txt

# Run
python -m burn_analyst.main

# Test
pytest tests/
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4
GCP_PROJECT_ID=ranger-twin
CEDAR_CREEK_FIRE_ID=cedar-creek-2022
```

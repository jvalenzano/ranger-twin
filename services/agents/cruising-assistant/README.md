# Cruising Assistant Agent

> 🚧 **Status: Scaffold Only** - This agent has a FastAPI skeleton but implementation is pending.
> See the planned capabilities below.

> Multimodal timber inventory with voice transcription and species ID

## Overview

Cruising Assistant processes voice narration and video from field timber cruisers to generate FSVeg-compatible plot records. It uses Whisper for transcription, custom models for species identification, and Gemini for data structuring.

## Capabilities

- Voice-first data capture (hands-free field operation)
- Real-time species identification from video
- Automatic plot data structuring
- FSVeg-compatible output format
- Volume and value estimation

## Tech Stack

- **Speech**: OpenAI Whisper (self-hosted)
- **Vision**: Custom species ID model (transfer learning)
- **LLM**: Google Gemini 2.0 Flash
- **API**: FastAPI

## Structure

```
cruising_assistant/
├── main.py                  # FastAPI service
├── agent.py                 # Cruising Assistant agent class
├── prompts/
│   └── system.md            # System prompt
├── tools/
│   ├── transcription.py     # Whisper transcription
│   ├── species_id.py        # Species identification
│   ├── plot_builder.py      # Plot data structuring
│   └── fsveg_export.py      # FSVeg XML generation
├── models/
│   ├── plot.py              # Plot data models
│   ├── tree.py              # Tree measurement models
│   └── species.py           # Species classification
└── weights/
    ├── whisper-medium.pt    # Whisper model
    └── species_pnw_v1.pt    # PNW species classifier
```

## API

```
POST /query
  body: {
    "question": "What's the estimated volume for plot 47-Alpha?",
    "context": { "plot_id": "47-alpha" }
  }
  returns: { "answer": "...", "confidence": 0.91, ... }

POST /transcribe
  body: multipart/form-data with audio file
  returns: { "text": "Plot 47-Alpha. Entering from the north..." }

POST /identify
  body: multipart/form-data with image
  returns: { "species": "Pseudotsuga menziesii", "confidence": 0.94 }

POST /process-recording
  body: multipart/form-data with video + audio
  returns: { "plot": {...}, "trees": [...] }

GET /plot/{plot_id}/fsveg
  returns: FSVeg-compatible XML
```

## System Prompt

```
You are Cruising Assistant, a specialized AI agent for multimodal timber inventory.
You process voice narration and video from field timber cruisers to generate
accurate plot records compatible with USFS FSVeg data standards.

When responding:
- Use correct forestry terminology
- Reference FSVeg field names and codes
- Provide species ID with confidence levels
- Include volume estimates with methodology
- Flag any data quality concerns
```

## Development

```bash
# Install
pip install -r requirements.txt

# Download model weights
python scripts/download_weights.py

# Run
python -m cruising_assistant.main

# Test
pytest tests/
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4
WHISPER_MODEL_PATH=./weights/whisper-medium.pt
SPECIES_MODEL_PATH=./weights/species_pnw_v1.pt
```

## Species Supported (PNW Model)

- Douglas Fir (Pseudotsuga menziesii)
- Western Red Cedar (Thuja plicata)
- Western Hemlock (Tsuga heterophylla)
- Sitka Spruce (Picea sitchensis)
- Big Leaf Maple (Acer macrophyllum)
- Red Alder (Alnus rubra)
- Pacific Silver Fir (Abies amabilis)

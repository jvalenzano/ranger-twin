# NEPA Advisor Agent

> AI-powered NEPA compliance guidance via Gemini File Search RAG

## Overview

NEPA Advisor provides AI-assisted regulatory guidance for NEPA compliance, Environmental Assessments, and Forest Service policy. It uses Gemini 3 Flash with File Search for RAG over the Forest Service Manual (FSM) and Forest Service Handbook (FSH) to provide accurate, citation-backed guidance.

**Updated per [ADR-003](../../docs/adr/ADR-003-gemini-3-flash-file-search.md)**: Uses pure Google ADK with Gemini File Search (no LangChain or external vector stores).

## Capabilities

- **Pathway Identification**: Determine appropriate NEPA pathway (CE, EA, EIS)
- **Regulatory Search**: RAG over FSM/FSH with source citations
- **Compliance Checklists**: Generate documentation requirements by project type
- **Extraordinary Circumstances**: Flag potential triggers for elevated review
- **Briefing Events**: Emit structured events for UI integration

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| LLM | Gemini 3 Flash | Updated per ADR-003 |
| RAG | Gemini File Search | Fully managed, no vector store needed |
| Framework | Google ADK | Pure ADK, no hybrid frameworks |
| API | FastAPI | Port 8004 |

## Structure

```
nepa-advisor/
├── app/
│   ├── __init__.py          # Package exports
│   ├── agent.py             # NEPAAdvisorService + Agent definition
│   ├── main.py              # FastAPI service (port 8004)
│   └── tools.py             # File Search tools with fallback
├── scripts/
│   ├── download_documents.py # Download FSM/FSH from USFS
│   └── setup_file_search.py  # Create Gemini File Search store
├── data/
│   ├── fsm/                  # Forest Service Manual PDFs
│   └── fsh/                  # Forest Service Handbook docs
├── pyproject.toml
└── README.md
```

## Setup

### 1. Download Regulatory Documents

```bash
python scripts/download_documents.py
```

Downloads FSM/FSH documents to `data/`:
- FSM 1950 - Environmental Policy and Procedures
- FSH 1909.15 Chapters 10, 20, 30, 40 - NEPA Procedures
- FSH 2409.18 Chapter 80 - Special Forest Products

### 2. Create File Search Store (Optional)

```bash
export GOOGLE_API_KEY=your-api-key
python scripts/setup_file_search.py
```

Creates a Gemini File Search store and indexes documents. Store config saved to `.nepa_store_config.json`. If not configured, the agent falls back to embedded regulatory knowledge.

### 3. Run the Service

```bash
uvicorn app.main:app --port 8004
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check with File Search status |
| `/analyze` | POST | Full NEPA compliance analysis |
| `/search` | POST | Regulatory guidance search |
| `/docs` | GET | OpenAPI documentation |

### Example: Analyze Compliance

```bash
curl -X POST http://localhost:8004/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "timber_salvage",
    "project_context": {
      "acres": 500,
      "location": "Cedar Creek Fire perimeter",
      "sensitive_species": false
    }
  }'
```

**Response:**
```json
{
  "status": "complete",
  "pathway": "CE",
  "confidence": 0.89,
  "synthesis": "Based on FSM 1950 and FSH 1909.15...",
  "checklist": "1. Document CE applicability...",
  "citations": [
    {"source_type": "FSM", "id": "1950.3", "excerpt": "..."}
  ]
}
```

### Example: Search Guidance

```bash
curl -X POST http://localhost:8004/search \
  -H "Content-Type: application/json" \
  -d '{"query": "categorical exclusion requirements for hazard tree removal"}'
```

## Tools

The agent uses three specialized tools:

| Tool | Description |
|------|-------------|
| `search_regulations()` | File Search RAG over FSM/FSH with citations |
| `identify_nepa_pathway()` | Determines CE/EA/EIS based on project attributes |
| `generate_compliance_checklist()` | Creates documentation requirements |

All tools include confidence scores and fall back to embedded knowledge when File Search is not configured.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Gemini API key | Yes |
| `PORT` | Service port | No (default: 8004) |

## Data Sources

| Document | File | Description |
|----------|------|-------------|
| FSM 1950 | `FSM-1950-Environmental-Policy.pdf` | Environmental Policy |
| FSH 1909.15 Ch 10 | `FSH-1909.15-Ch10-Environmental-Analysis.docx` | Environmental Analysis |
| FSH 1909.15 Ch 20 | `FSH-1909.15-Ch20-EIS-Documents.doc` | EIS Procedures |
| FSH 1909.15 Ch 30 | `FSH-1909.15-Ch30-Categorical-Exclusions.pdf` | CE Categories |
| FSH 1909.15 Ch 40 | `FSH-1909.15-Ch40-Environmental-Assessments.doc` | EA Procedures |
| FSH 2409.18 Ch 80 | `FSH-2409.18-Ch80-Special-Forest-Products.pdf` | Special Products |

## Related Documents

- [ADR-003: Gemini 3 Flash and File Search](../../docs/adr/ADR-003-gemini-3-flash-file-search.md)
- [Agent Messaging Protocol](../../docs/architecture/AGENT-MESSAGING-PROTOCOL.md)
- [Agentic Architecture](../../docs/architecture/AGENTIC-ARCHITECTURE.md)

## Legal Disclaimer

This agent provides AI-assisted guidance only. All outputs must be reviewed by qualified NEPA planners and/or legal counsel before use in official documents. The Forest Service retains full responsibility for compliance decisions.

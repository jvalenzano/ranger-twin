# ComplianceAdvisor Agent

> NEPA regulatory guidance via RAG over FSM/FSH corpus

## Overview

ComplianceAdvisor provides AI-assisted regulatory guidance for NEPA compliance, Environmental Assessments, and Forest Service policy. It uses RAG (Retrieval-Augmented Generation) over the Forest Service Manual (FSM) and Forest Service Handbook (FSH) to provide accurate, citation-backed guidance.

## Capabilities

- Retrieve relevant FSM/FSH sections for project context
- Generate compliance checklists based on project type
- Draft EA sections with proper citations
- Identify consultation requirements (ESA, NHPA)
- Flag potential compliance gaps

## Tech Stack

- **RAG Framework**: LangChain
- **Vector Store**: pgvector (PostgreSQL)
- **Embeddings**: text-embedding-004 (Vertex AI)
- **LLM**: Google Gemini 2.0 Flash
- **API**: FastAPI

## Structure

```
compliance_advisor/
├── main.py                  # FastAPI service
├── agent.py                 # ComplianceAdvisor agent class
├── prompts/
│   ├── system.md            # System prompt
│   └── ea_templates/        # EA section templates
├── tools/
│   ├── retrieval.py         # RAG retrieval
│   ├── citation.py          # Citation formatting
│   ├── checklist.py         # Compliance checklist generator
│   └── ea_drafter.py        # EA section drafting
├── models/
│   ├── regulation.py        # Regulation data models
│   └── compliance.py        # Compliance status models
└── corpus/
    ├── fsm/                 # Forest Service Manual chunks
    ├── fsh/                 # Forest Service Handbook chunks
    └── embeddings/          # Pre-computed embeddings
```

## API

```
POST /query
  body: {
    "question": "What NEPA pathway applies to this salvage sale?",
    "context": { "project_type": "timber-salvage", "acres": 500 }
  }
  returns: {
    "answer": "Based on FSH 1909.15...",
    "confidence": 0.89,
    "citations": [
      { "source": "FSH 1909.15", "section": "31.2", "text": "..." }
    ],
    "suggestions": [...]
  }

POST /checklist
  body: { "project_type": "timber-salvage", "location": {...} }
  returns: { "items": [...], "required_consultations": [...] }

POST /draft-section
  body: { "section": "purpose-and-need", "project_description": "..." }
  returns: { "draft": "...", "citations": [...] }

GET /regulations/{topic}
  returns: Relevant FSM/FSH sections for topic
```

## System Prompt

```
You are ComplianceAdvisor, a specialized AI agent for NEPA and Forest Service
regulatory guidance. You use retrieval-augmented generation over the Forest
Service Manual (FSM) and Forest Service Handbook (FSH) to provide accurate,
citation-backed guidance.

CRITICAL: You are an assistant tool, not a legal authority. All outputs
require human review by qualified NEPA planners. Always include this disclaimer.

When responding:
- Always cite specific FSM/FSH sections
- Provide confidence levels for interpretations
- Flag areas requiring legal review
- Suggest consultation requirements
- Use plain language while maintaining accuracy
```

## RAG Pipeline

1. **Chunking**: FSM/FSH documents split into ~500 token chunks with overlap
2. **Embedding**: text-embedding-004 via Vertex AI
3. **Storage**: pgvector in PostgreSQL
4. **Retrieval**: Cosine similarity search, top-k=10
5. **Generation**: Gemini with retrieved context + system prompt

## Development

```bash
# Install
pip install -r requirements.txt

# Initialize corpus (one-time)
python scripts/ingest_corpus.py

# Run
python -m compliance_advisor.main

# Test
pytest tests/
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4
DATABASE_URL=postgresql://...
CORPUS_PATH=./corpus
```

## Legal Disclaimer

This agent provides AI-assisted guidance only. All outputs must be reviewed
by qualified NEPA planners and/or legal counsel before use in official
documents. The Forest Service retains full responsibility for compliance
decisions.

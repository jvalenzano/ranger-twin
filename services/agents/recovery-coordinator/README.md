# RecoveryCoordinator Agent

> See [Full Specification](../../../docs/agents/RECOVERY-COORDINATOR-SPEC.md) for capabilities and architecture.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service (requires other agents running)
python -m recovery_coordinator.main

# Run tests
pytest tests/
```

## API

```
POST /query
  body: {
    "question": "Create a 12-month recovery plan",
    "context": { "fire_id": "cedar-creek-2022", "priorities": ["visitor-access", "timber-value"] }
  }
  returns: {
    "answer": "CEDAR CREEK INTEGRATED RECOVERY PLAN...",
    "confidence": 0.85,
    "plan": { "phases": [...] },
    "budget": { "total": 1200000, "breakdown": {...} }
  }

POST /plan
  body: {
    "fire_id": "cedar-creek-2022",
    "priorities": ["visitor-access", "timber-value"],
    "constraints": { "budget": 1500000, "timeline_months": 12 }
  }
  returns: {
    "plan": { "phases": [...] },
    "timeline": { "start": "2026-01", "end": "2026-12" },
    "budget": {...},
    "dependencies": [...]
  }

GET /status/{fire_id}
  returns: Current status from all agents
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-central1
BURN_ANALYST_URL=http://burn-analyst:8001
TRAIL_ASSESSOR_URL=http://trail-assessor:8002
CRUISING_ASSISTANT_URL=http://cruising-assistant:8003
NEPA_ADVISOR_URL=http://nepa-advisor:8004
```

# RecoveryCoordinator Agent

> Multi-agent orchestration for integrated recovery planning

## Overview

RecoveryCoordinator synthesizes outputs from all specialist agents (BurnAnalyst, TrailAssessor, TimberCruiser, ComplianceAdvisor) to create unified recovery plans. It handles cross-domain reasoning, resource allocation, and timeline optimization.

## Capabilities

- Aggregate insights from all specialist agents
- Generate integrated recovery plans
- Optimize resource allocation across activities
- Identify dependencies and sequencing
- Produce executive summaries for stakeholders

## Tech Stack

- **Orchestration**: Custom agent framework (or LangGraph)
- **LLM**: Google Gemini 2.0 Flash
- **API**: FastAPI

## Structure

```
recovery_coordinator/
├── main.py                  # FastAPI service
├── agent.py                 # RecoveryCoordinator agent class
├── prompts/
│   ├── system.md            # System prompt
│   └── plan_templates/      # Recovery plan templates
├── tools/
│   ├── aggregator.py        # Multi-agent output aggregation
│   ├── planner.py           # Recovery plan generation
│   ├── scheduler.py         # Activity sequencing
│   └── budget.py            # Budget estimation
├── models/
│   ├── plan.py              # Recovery plan models
│   └── phase.py             # Phase/activity models
└── clients/
    ├── burn_analyst.py      # BurnAnalyst client
    ├── trail_assessor.py    # TrailAssessor client
    ├── timber_cruiser.py    # TimberCruiser client
    └── compliance_advisor.py # ComplianceAdvisor client
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

## System Prompt

```
You are RecoveryCoordinator, the orchestration agent for Project RANGER.
You synthesize outputs from specialist agents to create unified recovery plans.

Specialist agents you coordinate:
- BurnAnalyst: Burn severity assessment
- TrailAssessor: Trail damage and repair priorities
- TimberCruiser: Timber inventory and salvage planning
- ComplianceAdvisor: NEPA and regulatory guidance

When creating plans:
- Consider dependencies between activities
- Optimize for stated priorities (safety, value, speed)
- Include realistic budget estimates
- Flag risks and contingencies
- Provide executive summaries for non-technical stakeholders
```

## Orchestration Pattern

```
User Query
    │
    ▼
┌─────────────────┐
│ RecoveryCoord.  │
│  (Orchestrator) │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Burn  │ │ Trail │ │Timber │ │Compli.│
│Analyst│ │Assess.│ │Cruiser│ │Advisor│
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │        │        │
    └────┬────┴────────┴────────┘
         │
         ▼
┌─────────────────┐
│   Synthesis &   │
│ Plan Generation │
└─────────────────┘
         │
         ▼
    Unified Plan
```

## Development

```bash
# Install
pip install -r requirements.txt

# Run (requires other agents running)
python -m recovery_coordinator.main

# Test
pytest tests/
```

## Environment Variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
VERTEX_AI_LOCATION=us-east4
BURN_ANALYST_URL=http://burn-analyst:8001
TRAIL_ASSESSOR_URL=http://trail-assessor:8002
TIMBER_CRUISER_URL=http://timber-cruiser:8003
COMPLIANCE_ADVISOR_URL=http://compliance-advisor:8004
```

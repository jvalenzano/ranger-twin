# The Crew: Agent Specifications

This directory contains detailed specifications for each AI agent in the RANGER platform, an **Agentic OS for Natural Resource Recovery**.

**Core Philosophy:** We are building a **Coordinated AI Crew** of digital colleagues. These agents don't just generate maps; they provide **Agentic Synthesis**—transforming complex geospatial data into actionable briefings for recovery leadership.

## The Five Agents

| Agent | Role Title | Spec Document | Service Directory | Priority |
|-------|------------|---------------|-------------------|----------|
| **Recovery Coordinator** | Recovery Coordinator | [RECOVERY-COORDINATOR-SPEC.md](./RECOVERY-COORDINATOR-SPEC.md) | `services/agents/recovery-coordinator/` | **Root Agent** |
| **Burn Analyst** | The Burn Analyst | [BURN-ANALYST-SPEC.md](./BURN-ANALYST-SPEC.md) | `services/agents/burn-analyst/` | Sub-agent |
| **Trail Assessor** | The Trail Assessor | [TRAIL-ASSESSOR-SPEC.md](./TRAIL-ASSESSOR-SPEC.md) | `services/agents/trail-assessor/` | Sub-agent |
| **Cruising Assistant** | The Cruising Assistant | [TIMBER-CRUISER-SPEC.md](./TIMBER-CRUISER-SPEC.md) | `services/agents/cruising-assistant/` | Sub-agent |
| **NEPA Advisor** | The NEPA Advisor | [COMPLIANCE-ADVISOR-SPEC.md](./COMPLIANCE-ADVISOR-SPEC.md) | `services/agents/nepa-advisor/` | Sub-agent |

## Agent Architecture

All agents share a common architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Structure                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   FastAPI   │───▶│   Agent     │───▶│   Gemini    │         │
│  │  Endpoints  │    │   Logic     │    │   API       │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                 │                   │                 │
│         │                 ▼                   │                 │
│         │         ┌─────────────┐             │                 │
│         │         │   Tools     │             │                 │
│         │         │  (Domain-   │             │                 │
│         │         │  Specific)  │             │                 │
│         │         └─────────────┘             │                 │
│         │                                     │                 │
│         ▼                                     ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Standard Response Format                    │   │
│  │  { answer, confidence, sources, suggestions, metadata }  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Standard Response Format

All agents return responses in this format:

```json
{
  "answer": "Natural language response to the query",
  "confidence": 0.94,
  "sources": [
    {
      "type": "sentinel-2",
      "date": "2022-09-15",
      "url": "gs://..."
    }
  ],
  "suggestions": [
    {
      "text": "Compare to Holiday Farm Fire",
      "query": "compare holiday-farm"
    }
  ],
  "metadata": {
    "agent": "BurnAnalyst",
    "version": "1.0.0",
    "processing_time_ms": 1234
  }
}
```

## Development Workflow

1. Start with the spec document in this directory
2. Implement in `services/agents/{agent-name}/`
3. Use shared utilities from `packages/agent-common/`
4. Write tests that validate against known Cedar Creek data
5. Expose via API gateway in `services/api-gateway/`

## Phase Priorities

### Phase 1 (Weeks 1-4)
- BurnAnalyst: Core dNBR calculation + Gemini integration
- TrailAssessor: YOLOv8 damage detection + georeferencing

### Phase 2 (Weeks 4-6)
- TimberCruiser: Whisper transcription + basic species ID
- RecoveryCoordinator: Multi-agent orchestration

### Phase 3 (Post-Demo)
- ComplianceAdvisor: FSM/FSH RAG pipeline
- All agents: Production hardening

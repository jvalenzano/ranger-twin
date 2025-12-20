# The Crew: Agent Specifications

This directory contains detailed specifications for each AI agent in the RANGER platform.

**Naming Principle:** Agent names are **role titles**, not product names. This frames AI as "digital colleagues" that assist human experts, not replacement technology. See [ADR-002](../adr/ADR-002-brand-naming-strategy.md) for decision rationale.

## The Five Agents

| Agent | Role Title | Spec Document | Service Directory | Priority |
|-------|------------|---------------|-------------------|----------|
| **Burn Analyst** | The Burn Analyst | [BURN-ANALYST-SPEC.md](./BURN-ANALYST-SPEC.md) | `services/agents/burn-analyst/` | Phase 1 |
| **Trail Assessor** | The Trail Assessor | [TRAIL-ASSESSOR-SPEC.md](./TRAIL-ASSESSOR-SPEC.md) | `services/agents/trail-assessor/` | Phase 1 |
| **Cruising Assistant** | The Cruising Assistant | [TIMBER-CRUISER-SPEC.md](./TIMBER-CRUISER-SPEC.md) | `services/agents/cruising-assistant/` | Phase 2 |
| **NEPA Advisor** | The NEPA Advisor | [COMPLIANCE-ADVISOR-SPEC.md](./COMPLIANCE-ADVISOR-SPEC.md) | `services/agents/nepa-advisor/` | Phase 3 |
| **Recovery Coordinator** | Recovery Coordinator | (See PROJECT-BRIEF.md) | `services/agents/recovery-coordinator/` | Phase 2 |

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

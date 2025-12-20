# RANGER Agent Messaging Protocol

This document defines the standard for inter-agent communication and the "Agentic Interface" contract, enabling "Agentic Synthesis" across the RANGER crew.

## 1. The Agent Briefing Event

The `AgentBriefingEvent` (formerly `BriefingObject`) is the keystone contract between the RANGER AI crew and the Command Console. It ensures that agentic intelligence is not "muffled" but is instead human-actionable through specific UI bindings.

### JSON Schema

```json
{
  "schema_version": "1.0.0",
  "event_id": "string (UUID)",
  "parent_event_id": "string (UUID) | null",
  "correlation_id": "string (UUID)",
  "timestamp": "string (ISO-8601)",
  "type": "alert | insight | action_required | status_update",
  "source_agent": "burn_analyst | trail_assessor | cruising_assistant | nepa_advisor | recovery_coordinator",
  "severity": "info | warning | critical",
  
  "ui_binding": {
    "target": "map_highlight | rail_pulse | panel_inject | modal_interrupt",
    "geo_reference": {
      "type": "Feature",
      "geometry": "GeoJSON Geometry",
      "properties": { "label": "string" }
    }
  },

  "content": {
    "summary": "string (High-level narrative)",
    "detail": "string (Detailed technical breakdown)",
    "suggested_actions": [
      {
        "action_id": "string",
        "label": "string",
        "target_agent": "string",
        "description": "string",
        "rationale": "string"
      }
    ]
  },

  "proof_layer": {
    "confidence": "number (0-1)",
    "citations": [
      {
        "source_type": "string (Sentinel-2 | FSM | TRACS | etc)",
        "id": "string",
        "uri": "string",
        "excerpt": "string"
      }
    ],
    "reasoning_chain": [
      "string (Step-by-step logic of the agent)"
    ]
  }
}
```

## 2. Event Types & UI Targets

| Type | UI Target | Description |
|------|-----------|-------------|
| **alert** | `modal_interrupt` or `rail_pulse` | Immediate notification of critical data (e.g., bridge failure). |
| **insight** | `panel_inject` | Contextual info added to the active agent panel. |
| **action_required** | `rail_pulse` (yellow) | Proactive request for user decision or cross-agent handoff. |
| **status_update** | `panel_inject` | Periodic updates on background processing (e.g., "Cruising 40% complete"). |

## 3. The "Proof Layer" (Anti-Hallucination)

Federal deployment requires absolute transparency. Every `AgentBriefingEvent` must provide its "work":
- **Citations:** Direct links to satellite metadata, forest service manual (FSM) chapters, or legacy database IDs.
- **Reasoning Chain:** A human-readable trace of *why* the agent reached this conclusion.

## 4. Propagation Flow

1.  **Specialist Analysis:** The `Burn Analyst` identifies a high-severity burn intersecting a recreation trail.
2.  **Event Generation:** The Analyst emits an `AgentBriefingEvent` with `type: action_required` and `ui_binding: { target: rail_pulse, geo_reference: ... }`.
3.  **Coordination:** The `RecoveryCoordinator` receives the event via the `api-gateway`.
    - It updates the **Shared Session State** (Redis).
    - It suggests a `suggested_action` for the `Trail Assessor` to prioritize that specific trail segment.
4.  **UI Rendering:** The Command Console observes the event:
    - The "Damage" rail item pulses yellow.
    - The map highlights the intersection point.
    - The "Damage" panel shows the Burn Analyst's insight "injected" as context.

## 5. Shared Session State (Redis)

The Coordinator maintains the following keys:
- `ranger:session:{id}:active_fire`: Fire metadata.
- `ranger:session:{id}:events`: List of recent `AgentBriefingEvent` IDs.
- `ranger:session:{id}:priorities`: Active actions pending user approval.
- `ranger:session:{id}:spatial_focus`: The active GeoJSON bounding box current agents are looking at.

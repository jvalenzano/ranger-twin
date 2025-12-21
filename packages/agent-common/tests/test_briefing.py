"""
Unit tests for RANGER Agent Messaging
"""

import pytest
from uuid import uuid4
from datetime import datetime
from agent_common.types.briefing import (
    AgentBriefingEvent, 
    EventType, 
    Severity, 
    SourceAgent, 
    UITarget
)

def test_briefing_event_validation():
    """Test that AgentBriefingEvent validates correctly with required fields."""
    event_id = uuid4()
    correlation_id = uuid4()
    
    event = AgentBriefingEvent(
        correlation_id=correlation_id,
        type=EventType.INSIGHT,
        source_agent=SourceAgent.BURN_ANALYST,
        severity=Severity.INFO,
        ui_binding={"target": UITarget.PANEL_INJECT},
        content={
            "summary": "Test Summary",
            "detail": "Test Detail",
            "suggested_actions": []
        },
        proof_layer={
            "confidence": 0.95,
            "citations": [],
            "reasoning_chain": ["Step 1", "Step 2"]
        }
    )
    
    assert event.correlation_id == correlation_id
    assert event.source_agent == SourceAgent.BURN_ANALYST
    assert len(event.proof_layer.reasoning_chain) == 2

def test_briefing_event_json_serialization():
    """Test that event serializes to JSON and back."""
    event = AgentBriefingEvent(
        correlation_id=uuid4(),
        type=EventType.ALERT,
        source_agent=SourceAgent.RECOVERY_COORDINATOR,
        severity=Severity.CRITICAL,
        ui_binding={"target": UITarget.MODAL_INTERRUPT},
        content={"summary": "Alert!", "detail": "Something happened", "suggested_actions": []},
        proof_layer={"confidence": 0.99, "citations": [], "reasoning_chain": ["Analysis complete"]}
    )
    
    json_data = event.model_dump_json()
    parsed_event = AgentBriefingEvent.model_validate_json(json_data)
    
    assert parsed_event.event_id == event.event_id
    assert parsed_event.type == event.type

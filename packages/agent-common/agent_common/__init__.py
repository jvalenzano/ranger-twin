"""
RANGER Agent Common - Shared utilities and types for RANGER agents.
"""

from agent_common.types.briefing import (
    AgentBriefingEvent,
    EventType,
    Severity,
    UITarget,
    SourceAgent,
)
from agent_common.messaging import AgentEventPublisher

__all__ = [
    "AgentBriefingEvent",
    "EventType",
    "Severity",
    "UITarget",
    "SourceAgent",
    "AgentEventPublisher",
]

__version__ = "0.1.0"

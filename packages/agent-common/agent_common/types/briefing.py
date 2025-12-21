"""
RANGER AgentBriefingEvent Schema v1.0.0

This module defines the core event contract between RANGER agents and the Command Console.
The AgentBriefingEvent is the keystone for "Agentic Synthesis" - ensuring AI intelligence
is not "muffled" but is human-actionable through specific UI bindings.

Reference: docs/architecture/AGENT-MESSAGING-PROTOCOL.md
"""

from datetime import datetime
from enum import Enum
from typing import Any, Literal, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Type of briefing event."""

    ALERT = "alert"
    INSIGHT = "insight"
    ACTION_REQUIRED = "action_required"
    STATUS_UPDATE = "status_update"


class Severity(str, Enum):
    """Severity level of the event."""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class UITarget(str, Enum):
    """
    UI binding target for the event.

    Defines where and how the event should be rendered in the Command Console.
    """

    MAP_HIGHLIGHT = "map_highlight"  # Highlight a geographic feature on the map
    RAIL_PULSE = "rail_pulse"  # Pulse the lifecycle rail for an agent
    PANEL_INJECT = "panel_inject"  # Inject insight into an agent panel
    MODAL_INTERRUPT = "modal_interrupt"  # Show a critical alert modal


class SourceAgent(str, Enum):
    """
    Agent that generated the event.

    Matches the RANGER agent crew hierarchy.
    """

    RECOVERY_COORDINATOR = "recovery_coordinator"
    BURN_ANALYST = "burn_analyst"
    TRAIL_ASSESSOR = "trail_assessor"
    CRUISING_ASSISTANT = "cruising_assistant"
    NEPA_ADVISOR = "nepa_advisor"


class GeoReference(BaseModel):
    """
    GeoJSON Feature for spatial context.

    Used to bind events to geographic locations on the map.
    """

    type: Literal["Feature"] = "Feature"
    geometry: dict[str, Any] = Field(
        description="GeoJSON Geometry object (Point, Polygon, LineString, etc.)"
    )
    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Feature properties including label",
    )


class UIBinding(BaseModel):
    """
    Binding between an event and a UI rendering target.

    Tells the Command Console HOW to display this event.
    """

    target: UITarget = Field(description="The UI component to target")
    geo_reference: Optional[GeoReference] = Field(
        default=None,
        description="Optional GeoJSON feature for map-based targets",
    )


class SuggestedAction(BaseModel):
    """
    An action suggested by the agent for user or cross-agent execution.

    Enables the "handoff" pattern where one agent suggests work for another.
    """

    action_id: str = Field(description="Unique identifier for this action")
    label: str = Field(description="Human-readable action label")
    target_agent: SourceAgent = Field(
        description="Agent that should handle this action"
    )
    description: str = Field(description="Detailed description of what to do")
    rationale: str = Field(description="Why this action is being suggested")


class EventContent(BaseModel):
    """
    The substantive content of a briefing event.

    Contains the "what" and "what to do about it".
    """

    summary: str = Field(
        description="High-level narrative summary (1-2 sentences)",
        min_length=1,
    )
    detail: str = Field(
        description="Detailed technical breakdown",
        min_length=1,
    )
    suggested_actions: list[SuggestedAction] = Field(
        default_factory=list,
        description="Actions the user can take or route to other agents",
    )


class Citation(BaseModel):
    """
    A citation to an authoritative source.

    Part of the "Proof Layer" for anti-hallucination and federal compliance.
    """

    source_type: str = Field(
        description="Type of source (Sentinel-2, FSM, TRACS, AgentBriefingEvent, etc.)"
    )
    id: str = Field(description="Unique identifier for the source")
    uri: str = Field(description="URI to the source (gs://, https://, ranger:, etc.)")
    excerpt: str = Field(description="Relevant excerpt from the source")


class DataTier(int, Enum):
    """
    Data confidence tier classification.

    From workshop Confidence Ledger pattern:
    - Tier 1 (90%+): Direct use, no hedging
    - Tier 2 (70-85%): Caution-flagged, human decision pending
    - Tier 3 (<70%): Demo only, synthetic
    """

    TIER_1 = 1  # High confidence (90%+), direct use
    TIER_2 = 2  # Medium confidence (70-85%), caution-flagged
    TIER_3 = 3  # Low confidence (<70%), demo/synthetic only


class InputConfidence(BaseModel):
    """
    Confidence metadata for a single input data source.

    Part of the Confidence Ledger pattern for granular transparency.
    """

    source: str = Field(description="Name of the data source")
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score (0-1) for this input",
    )
    tier: DataTier = Field(description="Data tier classification (1, 2, or 3)")
    notes: Optional[str] = Field(
        default=None,
        description="Optional context about this input's reliability",
    )


class ConfidenceLedger(BaseModel):
    """
    The Confidence Ledger - Per-input confidence tracking.

    Provides granular transparency about data quality across all inputs
    that contributed to an agent's analysis and recommendation.

    From workshop: "Sarah can see this breakdown. Not magic. Not 'AI said do this.'
    But 'Here's what we know, here's what we're inferring, here's what you decide.'"
    """

    inputs: list[InputConfidence] = Field(
        default_factory=list,
        description="Confidence scores for each input data source",
    )
    analysis_confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence in the analysis performed on inputs",
    )
    recommendation_confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence in the final recommendation",
    )


class ProofLayer(BaseModel):
    """
    The "Proof Layer" - Anti-hallucination contract.

    Federal deployment requires absolute transparency. Every AgentBriefingEvent
    must provide its "work" through citations, reasoning chain, and confidence ledger.
    """

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Overall confidence score (0-1) based on agent-specific formula",
    )
    confidence_ledger: Optional[ConfidenceLedger] = Field(
        default=None,
        description="Granular per-input confidence tracking (workshop pattern)",
    )
    citations: list[Citation] = Field(
        default_factory=list,
        description="Direct links to authoritative sources",
    )
    reasoning_chain: list[str] = Field(
        default_factory=list,
        description="Step-by-step logic of how the agent reached this conclusion",
    )


class AgentBriefingEvent(BaseModel):
    """
    The AgentBriefingEvent - Keystone contract for RANGER agentic interface.

    This is the primary data structure for communication between RANGER agents
    and the Command Console UI. It ensures that AI intelligence is:
    - Human-actionable (via ui_binding)
    - Transparent (via proof_layer)
    - Traceable (via correlation_id and parent_event_id)

    Schema Version: 1.0.0
    Reference: docs/architecture/AGENT-MESSAGING-PROTOCOL.md
    """

    schema_version: str = Field(
        default="1.0.0",
        description="Schema version for forward compatibility",
    )
    event_id: UUID = Field(
        default_factory=uuid4,
        description="Unique identifier for this event",
    )
    parent_event_id: Optional[UUID] = Field(
        default=None,
        description="ID of parent event for causal tracing",
    )
    correlation_id: UUID = Field(
        description="ID linking related events across agents (minted by Recovery Coordinator)"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this event was generated (ISO-8601)",
    )
    type: EventType = Field(description="Type of briefing event")
    source_agent: SourceAgent = Field(description="Agent that generated this event")
    severity: Severity = Field(description="Severity level for UI prioritization")
    ui_binding: UIBinding = Field(
        description="How this event should be rendered in the UI"
    )
    content: EventContent = Field(description="The substantive content of the event")
    proof_layer: ProofLayer = Field(
        description="Anti-hallucination layer with citations and reasoning"
    )

    class Config:
        """Pydantic configuration."""

        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
        json_schema_extra = {
            "example": {
                "schema_version": "1.0.0",
                "event_id": "burn-evt-001",
                "parent_event_id": None,
                "correlation_id": "cedar-creek-recovery-2024-001",
                "timestamp": "2024-12-20T10:30:00Z",
                "type": "insight",
                "source_agent": "burn_analyst",
                "severity": "info",
                "ui_binding": {
                    "target": "panel_inject",
                    "geo_reference": None,
                },
                "content": {
                    "summary": "Sector NW-4 burn severity analysis complete.",
                    "detail": "42% high severity (18,340 acres), 31% moderate, 27% low/unburned.",
                    "suggested_actions": [],
                },
                "proof_layer": {
                    "confidence": 0.94,
                    "citations": [
                        {
                            "source_type": "Sentinel-2",
                            "id": "S2A_MSIL2A_20220915T185921",
                            "uri": "gs://ranger-imagery/cedar-creek/post-fire/S2A.tif",
                            "excerpt": "dNBR analysis: 42% pixels exceed 0.66 threshold",
                        }
                    ],
                    "reasoning_chain": [
                        "1. Retrieved post-fire Sentinel-2 imagery",
                        "2. Calculated dNBR for sector NW-4",
                        "3. Applied MTBS classification thresholds",
                        "4. Computed acreage per severity class",
                    ],
                },
            }
        }

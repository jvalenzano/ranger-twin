"""
RANGER Audit Event Bridge - Session-scoped audit trail for Proof Layer SSE streaming.

This module implements the AuditEventBridge pattern designed in the SSE Proof Layer
technical spike (docs/architecture/SSE-PROOF-LAYER-SPIKE.md).

The bridge captures tool invocation audit events from ADK agent callbacks and buffers
them in memory keyed by invocationId, enabling SSE middleware to inject structured
audit metadata into the event stream for federal compliance transparency.

Architecture:
    Agent callbacks → AuditEventBridge → SSE /run_sse_enhanced → Frontend

Key Features:
    - Session-scoped in-memory event buffering
    - Thread-safe event recording and retrieval
    - Explicit cleanup to prevent memory leaks
    - Support for tool_invocation, tool_response, and tool_error event types

Reference: docs/architecture/SSE-PROOF-LAYER-SPIKE.md § 2.2.A
"""

from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Optional
from collections import defaultdict


@dataclass
class ToolInvocationEvent:
    """
    Audit event for tool invocation (before execution).

    Captured by before_tool_audit callback and published to the bridge.
    Maps to proof_layer tracking in AgentBriefingEvent.

    Reference: SSE-PROOF-LAYER-SPIKE.md § 3.1
    """

    event_type: str = "tool_invocation"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent: str = ""
    tool: str = ""
    parameters: dict[str, Any] = field(default_factory=dict)
    invocation_id: Optional[str] = None
    session_id: str = "unknown"
    enforcement: str = "API-level mode=ANY"  # ADR-007 Tier 1

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


@dataclass
class ToolResponseEvent:
    """
    Audit event for successful tool execution (after completion).

    Captured by after_tool_audit callback with proof layer data extracted
    from skill response. Maps to:
        - proof_layer.confidence
        - proof_layer.reasoning_chain
        - proof_layer.citations (via data_sources)
        - confidence_ledger.analysis_confidence

    Reference: SSE-PROOF-LAYER-SPIKE.md § 3.2
    """

    event_type: str = "tool_response"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent: str = ""
    tool: str = ""
    status: str = "success"
    confidence: float = 0.0
    data_sources: list[str] = field(default_factory=list)
    reasoning_chain: list[str] = field(default_factory=list)
    invocation_id: Optional[str] = None
    execution_time_ms: Optional[int] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


@dataclass
class ToolErrorEvent:
    """
    Audit event for tool execution failure.

    Captured by on_tool_error_audit callback. Maps to:
        - proof_layer.confidence = 0.0
        - severity = "critical" in AgentBriefingEvent

    Reference: SSE-PROOF-LAYER-SPIKE.md § 3.1
    """

    event_type: str = "tool_error"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent: str = ""
    tool: str = ""
    parameters: dict[str, Any] = field(default_factory=dict)
    error_type: str = "UnknownError"
    error_message: str = ""
    invocation_id: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


class AuditEventBridge:
    """
    Session-scoped bridge between agent callbacks and SSE streaming.

    Maintains an in-memory buffer of audit events keyed by invocation_id,
    allowing the SSE stream to inject audit metadata into ADK events.

    This is the core component of the Proof Layer streaming architecture,
    enabling real-time transparency into agent reasoning, data sources,
    and confidence calculations for federal compliance.

    Thread Safety:
        All public methods are thread-safe using a threading.Lock.

    Memory Management:
        Events are buffered until explicitly cleared via clear_invocation().
        SSE middleware should call clear_invocation() after injecting events
        into the final (partial=False) ADK event to prevent memory leaks.

    Usage Example:
        >>> bridge = get_audit_bridge()
        >>>
        >>> # In before_tool_audit callback
        >>> event = ToolInvocationEvent(
        ...     agent="trail_assessor",
        ...     tool="classify_damage",
        ...     invocation_id="abc-123"
        ... )
        >>> bridge.record_tool_invocation(event)
        >>>
        >>> # In after_tool_audit callback
        >>> event = ToolResponseEvent(
        ...     agent="trail_assessor",
        ...     tool="classify_damage",
        ...     confidence=0.90,
        ...     invocation_id="abc-123"
        ... )
        >>> bridge.record_tool_response(event)
        >>>
        >>> # In SSE middleware
        >>> audit_trail = bridge.get_audit_trail("abc-123")
        >>> # Inject into ADK event as _audit_metadata
        >>> bridge.clear_invocation("abc-123")  # Cleanup

    Reference: docs/architecture/SSE-PROOF-LAYER-SPIKE.md § 2.2.A
    """

    def __init__(self, max_events_per_invocation: int = 100):
        """
        Initialize the audit event bridge.

        Args:
            max_events_per_invocation: Maximum number of events to buffer per
                invocation ID before dropping oldest events. Prevents unbounded
                memory growth for long-running tool executions. Default: 100.
        """
        self._store: dict[str, list[dict[str, Any]]] = defaultdict(list)
        self._lock = Lock()
        self._max_events_per_invocation = max_events_per_invocation

    def record_tool_invocation(self, event: ToolInvocationEvent) -> None:
        """
        Record a tool invocation event.

        Called by before_tool_audit callback when a tool is about to execute.

        Args:
            event: The tool invocation event with agent, tool, parameters, and
                invocation_id metadata.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> event = ToolInvocationEvent(
            ...     agent="burn_analyst",
            ...     tool="assess_severity",
            ...     parameters={"fire_id": "cedar-creek-2022"},
            ...     invocation_id="uuid-123",
            ...     session_id="session-456"
            ... )
            >>> bridge.record_tool_invocation(event)
        """
        with self._lock:
            key = event.invocation_id or "default"
            self._store[key].append(event.to_dict())

            # Enforce max events per invocation to prevent unbounded growth
            if len(self._store[key]) > self._max_events_per_invocation:
                self._store[key].pop(0)  # Remove oldest event (FIFO)

    def record_tool_response(self, event: ToolResponseEvent) -> None:
        """
        Record a tool response event.

        Called by after_tool_audit callback when a tool completes successfully.
        This event contains the critical proof layer data: confidence, reasoning
        chain, and data sources.

        Args:
            event: The tool response event with confidence, reasoning_chain,
                data_sources, and invocation_id metadata.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> event = ToolResponseEvent(
            ...     agent="burn_analyst",
            ...     tool="assess_severity",
            ...     status="success",
            ...     confidence=0.92,
            ...     data_sources=["MTBS burn severity map"],
            ...     reasoning_chain=[
            ...         "Loaded 8 sectors for Cedar Creek",
            ...         "High severity dominant at 63.6%"
            ...     ],
            ...     invocation_id="uuid-123"
            ... )
            >>> bridge.record_tool_response(event)
        """
        with self._lock:
            key = event.invocation_id or "default"
            self._store[key].append(event.to_dict())

            # Enforce max events per invocation
            if len(self._store[key]) > self._max_events_per_invocation:
                self._store[key].pop(0)

    def record_tool_error(self, event: ToolErrorEvent) -> None:
        """
        Record a tool error event.

        Called by on_tool_error_audit callback when a tool execution fails.
        Results in confidence=0.0 and critical severity in AgentBriefingEvent.

        Args:
            event: The tool error event with error details and invocation_id.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> event = ToolErrorEvent(
            ...     agent="burn_analyst",
            ...     tool="assess_severity",
            ...     error_type="FileNotFoundError",
            ...     error_message="Fixture file not found",
            ...     invocation_id="uuid-123"
            ... )
            >>> bridge.record_tool_error(event)
        """
        with self._lock:
            key = event.invocation_id or "default"
            self._store[key].append(event.to_dict())

            # Enforce max events per invocation
            if len(self._store[key]) > self._max_events_per_invocation:
                self._store[key].pop(0)

    def get_audit_trail(self, invocation_id: str) -> list[dict[str, Any]]:
        """
        Retrieve all audit events for an invocation.

        Called by SSE middleware to inject audit metadata into ADK events
        before streaming to the frontend.

        Args:
            invocation_id: The invocation ID to retrieve audit events for.

        Returns:
            A copy of all audit events for the invocation, in chronological order.
            Returns empty list if invocation_id not found.

        Thread Safety:
            This method is thread-safe. Returns a copy to prevent external
            modification of internal state.

        Example:
            >>> audit_trail = bridge.get_audit_trail("uuid-123")
            >>> # [
            >>> #   {"event_type": "tool_invocation", ...},
            >>> #   {"event_type": "tool_response", "confidence": 0.92, ...}
            >>> # ]
        """
        with self._lock:
            return self._store.get(invocation_id, []).copy()

    def clear_invocation(self, invocation_id: str) -> None:
        """
        Clear audit events for a completed invocation.

        CRITICAL: This method MUST be called by SSE middleware after injecting
        audit metadata into the final (partial=False) ADK event to prevent
        memory leaks.

        Args:
            invocation_id: The invocation ID to clear audit events for.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> # In SSE middleware after final event
            >>> if event.partial == False:
            ...     audit_trail = bridge.get_audit_trail(invocation_id)
            ...     event._audit_metadata = audit_trail
            ...     bridge.clear_invocation(invocation_id)  # Cleanup
        """
        with self._lock:
            self._store.pop(invocation_id, None)

    def get_latest_tool_response(
        self, invocation_id: str
    ) -> Optional[dict[str, Any]]:
        """
        Get the most recent tool response event for an invocation.

        Utility method for extracting proof layer data from the audit trail.

        Args:
            invocation_id: The invocation ID to retrieve the latest response for.

        Returns:
            The most recent tool_response event dict, or None if no response
            events exist for this invocation.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> response = bridge.get_latest_tool_response("uuid-123")
            >>> if response:
            ...     confidence = response["confidence"]
            ...     reasoning = response["reasoning_chain"]
        """
        events = self.get_audit_trail(invocation_id)
        responses = [e for e in events if e.get("event_type") == "tool_response"]
        return responses[-1] if responses else None

    def get_invocation_count(self) -> int:
        """
        Get the number of active invocations in the buffer.

        Utility method for monitoring memory usage and detecting leaks.

        Returns:
            The number of distinct invocation IDs currently buffered.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> count = bridge.get_invocation_count()
            >>> if count > 100:
            ...     logger.warning(f"High invocation count: {count}")
        """
        with self._lock:
            return len(self._store)

    def clear_all(self) -> None:
        """
        Clear all audit events from the buffer.

        WARNING: This is a destructive operation intended for testing and
        cleanup scenarios. In production, use clear_invocation() for
        targeted cleanup.

        Thread Safety:
            This method is thread-safe.

        Example:
            >>> # In test teardown
            >>> bridge.clear_all()
        """
        with self._lock:
            self._store.clear()


# Global singleton instance
_audit_bridge: Optional[AuditEventBridge] = None
_bridge_lock = Lock()


def get_audit_bridge() -> AuditEventBridge:
    """
    Get the global audit bridge instance (singleton pattern).

    Creates the bridge on first access. All agent callbacks and SSE middleware
    should use this function to access the shared bridge instance.

    Returns:
        The global AuditEventBridge singleton.

    Thread Safety:
        This function is thread-safe and ensures only one instance is created.

    Example:
        >>> # In agent callback
        >>> bridge = get_audit_bridge()
        >>> bridge.record_tool_invocation(event)
        >>>
        >>> # In SSE middleware
        >>> bridge = get_audit_bridge()
        >>> audit_trail = bridge.get_audit_trail(invocation_id)
    """
    global _audit_bridge

    if _audit_bridge is None:
        with _bridge_lock:
            # Double-check locking pattern
            if _audit_bridge is None:
                _audit_bridge = AuditEventBridge()

    return _audit_bridge

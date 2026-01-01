"""
Callback factories for ADR-007.1 audit trail integration.

This module provides factory functions to create standardized audit callbacks
that integrate with the AuditEventBridge for federal compliance transparency.

All callbacks record events to the shared audit_bridge singleton while also
logging to the Python logger for operational visibility.

Reference: docs/adr/ADR-007.1-tool-invocation-strategy.md § Tier 3
Reference: docs/architecture/SSE-PROOF-LAYER-SPIKE.md § 2.2.A
"""

import logging
from datetime import datetime, timezone
from typing import Any, Callable, Tuple

from agents._shared.audit_bridge import (
    get_audit_bridge,
    ToolInvocationEvent,
    ToolResponseEvent,
    ToolErrorEvent,
)


def create_audit_callbacks(
    agent_name: str,
) -> Tuple[Callable, Callable, Callable]:
    """
    Create standardized audit callbacks for an agent.

    Factory function that generates three callback functions wired to the
    global AuditEventBridge for proof layer streaming and audit compliance.

    Args:
        agent_name: Name of the agent (e.g., "trail_assessor", "burn_analyst")

    Returns:
        Tuple of (before_tool_audit, after_tool_audit, on_tool_error_audit)
        callbacks ready for use in Agent initialization.

    Example:
        >>> before_cb, after_cb, error_cb = create_audit_callbacks("trail_assessor")
        >>> agent = LlmAgent(
        ...     name="trail_assessor",
        ...     tools=[...],
        ...     before_tool_callback=before_cb,
        ...     after_tool_callback=after_cb,
        ...     on_tool_error_callback=error_cb
        ... )

    Callback Signatures (verified against Google ADK):
        - before_tool_audit(tool, args, tool_context) -> None
        - after_tool_audit(tool, args, tool_context, tool_response) -> None
        - on_tool_error_audit(tool, args, tool_context, error) -> dict
    """
    bridge = get_audit_bridge()
    logger = logging.getLogger(f"ranger.{agent_name}")

    def before_tool_audit(tool, args, tool_context):
        """
        Record tool invocation before execution.

        Captures ToolInvocationEvent with agent, tool, parameters, and
        session_id for audit trail, SSE streaming, and validator correlation.

        Args:
            tool: Tool object being invoked
            args: Tool arguments (dict)
            tool_context: ADK tool context with invocation_id, session_id

        Returns:
            None (continue with tool execution)

        Note:
            Uses session_id as the correlation key for ToolInvocationValidator.
            The validator passes session_id to InMemoryRunner, which sets it
            on tool_context. This enables audit event correlation.
        """
        tool_name = tool.name if hasattr(tool, "name") else str(tool)
        session_id = getattr(tool_context, "session_id", "unknown")
        adk_invocation_id = getattr(tool_context, "invocation_id", None)

        # Use session_id as the storage key for validator correlation
        # (validator queries by session_id, audit bridge stores by invocation_id)
        correlation_id = session_id if session_id != "unknown" else adk_invocation_id

        # Record to audit bridge for SSE streaming
        event = ToolInvocationEvent(
            agent=agent_name,
            tool=tool_name,
            parameters=args,
            invocation_id=correlation_id,  # Use session_id for validator correlation
            session_id=session_id,
            enforcement="API-level mode=AUTO",  # ADR-007.1 Tier 1
        )
        bridge.record_tool_invocation(event)

        # Log for operational visibility
        logger.info(
            "TOOL_INVOCATION",
            extra={
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent": agent_name,
                "tool": tool_name,
                "parameters": args,
                "session_id": session_id,
                "correlation_id": correlation_id,
            },
        )

        return None  # Continue with tool execution

    def after_tool_audit(tool, args, tool_context, tool_response):
        """
        Record tool response after successful execution.

        Captures ToolResponseEvent with proof layer data: confidence,
        reasoning_chain, and data_sources from skill response.

        Args:
            tool: Tool object that was invoked
            args: Tool arguments (dict)
            tool_context: ADK tool context with session_id
            tool_response: Tool return value (typically dict with proof layer)

        Returns:
            None (use original response)
        """
        tool_name = tool.name if hasattr(tool, "name") else str(tool)
        session_id = getattr(tool_context, "session_id", "unknown")
        adk_invocation_id = getattr(tool_context, "invocation_id", None)

        # Use session_id as the storage key for validator correlation
        correlation_id = session_id if session_id != "unknown" else adk_invocation_id

        # Extract proof layer data defensively
        # All RANGER skills return these fields, but defensive extraction
        # handles edge cases and non-standard responses
        confidence = (
            tool_response.get("confidence", 0.0)
            if isinstance(tool_response, dict)
            else 0.0
        )
        data_sources = (
            tool_response.get("data_sources", [])
            if isinstance(tool_response, dict)
            else []
        )
        reasoning_chain = (
            tool_response.get("reasoning_chain", [])
            if isinstance(tool_response, dict)
            else []
        )
        status = (
            tool_response.get("status", "success")
            if isinstance(tool_response, dict)
            else "success"
        )

        # Record to audit bridge for SSE streaming
        event = ToolResponseEvent(
            agent=agent_name,
            tool=tool_name,
            status=status,
            confidence=confidence,
            data_sources=data_sources,
            reasoning_chain=reasoning_chain,
            invocation_id=correlation_id,  # Use session_id for validator correlation
        )
        bridge.record_tool_response(event)

        # Log for operational visibility
        logger.info(
            "TOOL_RESPONSE",
            extra={
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent": agent_name,
                "tool": tool_name,
                "status": status,
                "confidence": confidence,
                "data_sources": data_sources,
                "correlation_id": correlation_id,
            },
        )

        return None  # Use original response

    def on_tool_error_audit(tool, args, tool_context, error):
        """
        Record tool error and return graceful error response.

        Captures ToolErrorEvent with error details for audit trail.
        Returns structured error response to maintain agent contract.

        Args:
            tool: Tool object that failed
            args: Tool arguments (dict)
            tool_context: ADK tool context with session_id
            error: Exception that occurred

        Returns:
            dict: Graceful error response with status="error", confidence=0.0
        """
        tool_name = tool.name if hasattr(tool, "name") else str(tool)
        session_id = getattr(tool_context, "session_id", "unknown")
        adk_invocation_id = getattr(tool_context, "invocation_id", None)

        # Use session_id as the storage key for validator correlation
        correlation_id = session_id if session_id != "unknown" else adk_invocation_id

        # Record to audit bridge for SSE streaming
        event = ToolErrorEvent(
            agent=agent_name,
            tool=tool_name,
            parameters=args,
            error_type=type(error).__name__,
            error_message=str(error),
            invocation_id=correlation_id,  # Use session_id for validator correlation
        )
        bridge.record_tool_error(event)

        # Log for operational visibility
        logger.error(
            "TOOL_ERROR",
            extra={
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent": agent_name,
                "tool": tool_name,
                "parameters": args,
                "error_type": type(error).__name__,
                "error_message": str(error),
                "correlation_id": correlation_id,
            },
        )

        # Return graceful error response matching skill contract
        return {
            "status": "error",
            "error_message": f"Tool execution failed: {str(error)}",
            "confidence": 0.0,
            "data_sources": [],
            "reasoning_chain": [f"ERROR: {type(error).__name__} - {str(error)}"],
            "recommendations": ["Please try again or contact support."],
        }

    return before_tool_audit, after_tool_audit, on_tool_error_audit


# Exported factory function
__all__ = ["create_audit_callbacks"]

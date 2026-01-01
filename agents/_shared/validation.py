"""
Tier 3 validation layer for ADR-007.1 Three-Layer Tool Invocation Strategy.

This module implements post-response validation to ensure tool invocation compliance,
achieving 99% reliability when combined with Tier 2 instructions (~90% first-pass).

The validator reads from AuditEventBridge to verify tools were invoked, retries with
enforcement prompts if tools were skipped, and escalates to human review after max retries.

Reference: docs/adr/ADR-007.1-tool-invocation-strategy.md § Tier 3
"""

import uuid
import logging
from typing import Any, Optional
from datetime import datetime, timezone

from agents._shared.audit_bridge import get_audit_bridge


logger = logging.getLogger("ranger.validation")


class ToolInvocationValidator:
    """
    Post-response validation ensuring tool invocation compliance.

    Achieves 99% reliability when combined with Tier 2 instructions by:
    1. Checking audit_bridge for tool invocations after agent response
    2. Retrying with enforcement reminder if tools were skipped
    3. Escalating to human review after max_retries

    This is the Tier 3 enforcement layer in ADR-007.1's defense-in-depth pattern.

    Usage:
        >>> validator = ToolInvocationValidator(agent, max_retries=2)
        >>> result = await validator.invoke_with_enforcement(
        ...     query="What's the damage severity for Cedar Creek?",
        ...     required_tools=["classify_damage"]
        ... )
        >>> print(result["validation_outcome"])  # "PASSED" | "RETRY_SUCCEEDED" | "ESCALATED"

    Thread Safety:
        This class is not thread-safe. Create separate instances per request/session.
    """

    def __init__(self, agent, max_retries: int = 2):
        """
        Initialize the validator.

        Args:
            agent: The agent to wrap with validation enforcement
            max_retries: Maximum retry attempts if tool invocation is skipped (default: 2)
        """
        self.agent = agent
        self.max_retries = max_retries
        self.bridge = get_audit_bridge()

    async def invoke_with_enforcement(
        self,
        query: str,
        required_tools: Optional[list[str]] = None,
        session_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Invoke agent with guaranteed tool invocation or explicit escalation.

        Validates that required tools were invoked by checking audit_bridge.
        Retries with enforcement reminder if tools were skipped.
        Returns escalation response after max_retries instead of raising exception.

        Args:
            query: User query to send to agent
            required_tools: List of tool names that must be invoked. If None,
                validates that ANY tool was invoked for domain queries.
            session_id: Session ID for tracking (optional, generates UUID if not provided)

        Returns:
            Dictionary with:
                - success (bool): Whether query was answered successfully
                - response (str): Agent response text
                - tools_invoked (list[str]): Tools that were actually invoked
                - attempts (int): Number of attempts before success/escalation
                - validation_outcome (str): "PASSED" | "RETRY_SUCCEEDED" | "ESCALATED"
                - audit_trail (list[dict]): Audit events from bridge
                - escalation_reason (str | None): Why escalation occurred (if escalated)

        Example:
            >>> result = await validator.invoke_with_enforcement(
            ...     query="Assess trail damage for Cedar Creek",
            ...     required_tools=["classify_damage"]
            ... )
            >>> if result["validation_outcome"] == "ESCALATED":
            ...     notify_human_reviewer(result["escalation_reason"])
        """
        # Generate a unique correlation_id for audit trail
        correlation_id = session_id or str(uuid.uuid4())

        # Note: ADK InMemoryRunner does NOT propagate session_id to tool_context,
        # so callbacks store events under "unknown". We clear before each attempt
        # and query "unknown" after to get events from this invocation only.
        audit_key = "unknown"

        for attempt in range(1, self.max_retries + 2):  # +1 for initial attempt
            # Clear stale events before each attempt
            self.bridge.clear_invocation(audit_key)
            # Construct query with enforcement reminder for retries
            if attempt == 1:
                effective_query = query
            else:
                effective_query = (
                    f"{query}\n\n"
                    f"[ENFORCEMENT REMINDER: You MUST call a tool before responding. "
                    f"This is attempt {attempt}/{self.max_retries + 1}.]"
                )

            # Invoke agent via InMemoryRunner
            try:
                response = await self._invoke_agent(effective_query, correlation_id)
            except Exception as e:
                logger.error(f"Agent invocation failed: {e}")
                return {
                    "success": False,
                    "response": f"Agent invocation error: {str(e)}",
                    "tools_invoked": [],
                    "attempts": attempt,
                    "validation_outcome": "ESCALATED",
                    "audit_trail": [],
                    "escalation_reason": f"Agent invocation exception: {type(e).__name__}",
                }

            # Validate tool invocation via audit_bridge
            # ADK stores under "unknown" since it doesn't propagate session_id
            audit_trail = self.bridge.get_audit_trail(audit_key)
            tools_invoked = [
                event["tool"]
                for event in audit_trail
                if event.get("event_type") == "tool_invocation"
            ]

            # Check if validation passed
            validation_passed = self._validate_tools(tools_invoked, required_tools)

            if validation_passed:
                # Success!
                outcome = "PASSED" if attempt == 1 else "RETRY_SUCCEEDED"
                logger.info(
                    f"Validation {outcome} after {attempt} attempt(s). "
                    f"Tools invoked: {tools_invoked}"
                )

                # Cleanup audit events
                self.bridge.clear_invocation(audit_key)

                return {
                    "success": True,
                    "response": response,
                    "tools_invoked": tools_invoked,
                    "attempts": attempt,
                    "validation_outcome": outcome,
                    "audit_trail": audit_trail,
                    "escalation_reason": None,
                }

            # Log validation failure
            logger.warning(
                f"Validation failed on attempt {attempt}/{self.max_retries + 1}. "
                f"Required: {required_tools}, Invoked: {tools_invoked}"
            )

            # Continue to next retry if not at max
            if attempt <= self.max_retries:
                continue

        # Max retries exceeded - escalate
        escalation_reason = (
            f"Tool invocation validation failed after {self.max_retries + 1} attempts. "
            f"Required tools: {required_tools}, "
            f"Tools invoked: {tools_invoked}"
        )

        logger.error(f"ESCALATION: {escalation_reason}")

        # Cleanup audit events
        self.bridge.clear_invocation(audit_key)

        return {
            "success": False,
            "response": (
                "Unable to retrieve required data after multiple attempts. "
                "This query requires human verification. "
                "Please contact support for assistance."
            ),
            "tools_invoked": tools_invoked,
            "attempts": self.max_retries + 1,
            "validation_outcome": "ESCALATED",
            "audit_trail": audit_trail,
            "escalation_reason": escalation_reason,
        }

    def _validate_tools(
        self, tools_invoked: list[str], required_tools: Optional[list[str]]
    ) -> bool:
        """
        Check if tool invocation requirement was met.

        Args:
            tools_invoked: List of tool names that were actually invoked
            required_tools: List of tool names that must be invoked, or None

        Returns:
            True if validation passed, False otherwise

        Validation Rules:
            - If required_tools is None: At least one tool must be invoked
            - If required_tools is list: All required tools must be invoked
        """
        if required_tools is None:
            # General validation: any tool invocation counts
            return len(tools_invoked) > 0
        else:
            # Specific validation: all required tools must be invoked
            return all(tool in tools_invoked for tool in required_tools)

    async def _invoke_agent(self, query: str, correlation_id: str) -> str:
        """
        Invoke the wrapped agent using ADK InMemoryRunner.

        Uses Google ADK's InMemoryRunner pattern for programmatic agent invocation.
        The session_id (derived from correlation_id) is used by callbacks to key
        audit events, enabling the validator to correlate events after completion.

        Args:
            query: Query to send to agent
            correlation_id: Correlation ID for audit trail (used in session_id)

        Returns:
            Agent response text

        Reference:
            https://google.github.io/adk-docs/get-started/python/
        """
        from google.adk.runners import InMemoryRunner
        from google.genai import types

        # Create runner wrapping the agent
        runner = InMemoryRunner(agent=self.agent)

        # Create a session before running (required by InMemoryRunner)
        # The session_id becomes tool_context.session_id in callbacks,
        # which is used as the key for audit event storage/retrieval
        user_id = "validation_layer"
        session_id = f"validation-{correlation_id}"
        await runner.session_service.create_session(
            app_name=runner.app_name,
            user_id=user_id,
            session_id=session_id,
        )

        # Collect response text from the event stream
        response_text = ""

        try:
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=types.Content(
                    role="user",
                    parts=[types.Part(text=query)]
                ),
            ):
                # Extract text from content events
                if hasattr(event, "content") and event.content:
                    for part in event.content.parts:
                        if hasattr(part, "text") and part.text:
                            response_text = part.text
        finally:
            # Clean up runner resources
            await runner.close()

        return response_text


class ValidatedAgentWrapper:
    """
    Wrapper that invokes an agent with Tier 3 validation enforcement.

    Provides a clean API for invoking agents with guaranteed tool invocation
    or explicit escalation. Uses composition pattern to wrap any ADK Agent.

    Usage:
        >>> from agents.trail_assessor.agent import root_agent
        >>> validated = ValidatedAgentWrapper(
        ...     agent=root_agent,
        ...     required_tools=["classify_damage"],
        ...     max_retries=2
        ... )
        >>> result = await validated.invoke("What's the trail damage?")
        >>> print(result["validation_outcome"])  # "PASSED" | "RETRY_SUCCEEDED" | "ESCALATED"

    Attributes:
        validator: The underlying ToolInvocationValidator
        required_tools: List of tool names that must be invoked, or None for any tool

    Note:
        This is a composition wrapper, not a subclass. The wrapped agent's
        structure is not modified.
    """

    def __init__(
        self,
        agent,
        required_tools: Optional[list[str]] = None,
        max_retries: int = 2,
    ):
        """
        Initialize the validated agent wrapper.

        Args:
            agent: The ADK Agent to wrap with validation
            required_tools: List of tool names that must be invoked, or None to
                require any tool invocation
            max_retries: Maximum retry attempts if tool invocation is skipped (default: 2)
        """
        self.validator = ToolInvocationValidator(agent, max_retries)
        self.required_tools = required_tools

    async def invoke(
        self,
        query: str,
        session_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Invoke the agent with validation enforcement.

        Args:
            query: User query to send to agent
            session_id: Session ID for tracking (optional, generates UUID if not provided)

        Returns:
            Dictionary with validation result (see ToolInvocationValidator.invoke_with_enforcement)
        """
        return await self.validator.invoke_with_enforcement(
            query=query,
            required_tools=self.required_tools,
            session_id=session_id,
        )


def create_validated_agent(
    agent,
    required_tools: Optional[list[str]] = None,
    max_retries: int = 2,
) -> ValidatedAgentWrapper:
    """
    Factory function for creating validated agent wrappers.

    Convenience function that wraps an agent with Tier 3 validation enforcement.

    Args:
        agent: The ADK Agent to wrap with validation
        required_tools: List of tool names that must be invoked, or None to
            require any tool invocation
        max_retries: Maximum retry attempts if tool invocation is skipped (default: 2)

    Returns:
        ValidatedAgentWrapper instance

    Example:
        >>> from agents.trail_assessor.agent import root_agent
        >>> from agents._shared.config import AGENT_TOOL_REQUIREMENTS
        >>>
        >>> validated = create_validated_agent(
        ...     agent=root_agent,
        ...     required_tools=AGENT_TOOL_REQUIREMENTS.get("trail_assessor")
        ... )
        >>> result = await validated.invoke("Assess trail damage for Cedar Creek")
    """
    return ValidatedAgentWrapper(agent, required_tools, max_retries)


# Exported classes and functions
__all__ = [
    "ToolInvocationValidator",
    "ValidatedAgentWrapper",
    "create_validated_agent",
]

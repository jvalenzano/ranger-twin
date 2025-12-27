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

from agents.shared.audit_bridge import get_audit_bridge


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
        session_id = session_id or str(uuid.uuid4())
        invocation_id = str(uuid.uuid4())

        for attempt in range(1, self.max_retries + 2):  # +1 for initial attempt
            # Construct query with enforcement reminder for retries
            if attempt == 1:
                effective_query = query
            else:
                effective_query = (
                    f"{query}\n\n"
                    f"[ENFORCEMENT REMINDER: You MUST call a tool before responding. "
                    f"This is attempt {attempt}/{self.max_retries + 1}.]"
                )

            # Invoke agent
            try:
                # Note: Actual invocation depends on ADK agent API
                # This is a placeholder for the async agent.run() or agent.send_message()
                # Implementation will vary based on specific agent type
                response = await self._invoke_agent(effective_query, invocation_id)
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
            audit_trail = self.bridge.get_audit_trail(invocation_id)
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
                self.bridge.clear_invocation(invocation_id)

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
        self.bridge.clear_invocation(invocation_id)

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

    async def _invoke_agent(self, query: str, invocation_id: str) -> str:
        """
        Invoke the wrapped agent and return response text.

        This is a placeholder for actual agent invocation. Implementation depends
        on the specific agent API (LlmAgent.run(), Agent.send_message(), etc.)

        Args:
            query: Query to send to agent
            invocation_id: Invocation ID for tracking

        Returns:
            Agent response text

        Note:
            This method should be overridden or enhanced based on the actual
            agent type and API. The current implementation assumes a simple
            send_message() interface.
        """
        # Placeholder - actual implementation depends on agent API
        # Example for LlmAgent:
        # response = await self.agent.run_async(query)
        # return response.text

        # For now, return a placeholder
        raise NotImplementedError(
            "Agent invocation not yet implemented. "
            "Override _invoke_agent() with agent-specific invocation logic."
        )


# Exported class
__all__ = ["ToolInvocationValidator"]

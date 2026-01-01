"""
Shared utilities for RANGER agents.

Provides common configuration, callbacks, and validation infrastructure
for the three-tier tool invocation enforcement pattern (ADR-007.1).
"""

# Tier 1: API-level configuration
from agents._shared.config import (
    TOOL_CONFIG,
    GENERATE_CONTENT_CONFIG,
    AGENT_TOOL_REQUIREMENTS,
)

# Tier 3: Audit callbacks
from agents._shared.callbacks import create_audit_callbacks

# Tier 3: Validation layer
from agents._shared.validation import (
    ToolInvocationValidator,
    ValidatedAgentWrapper,
    create_validated_agent,
)

# Audit bridge (for advanced use)
from agents._shared.audit_bridge import get_audit_bridge

__all__ = [
    # Configuration
    "TOOL_CONFIG",
    "GENERATE_CONTENT_CONFIG",
    "AGENT_TOOL_REQUIREMENTS",
    # Callbacks
    "create_audit_callbacks",
    # Validation
    "ToolInvocationValidator",
    "ValidatedAgentWrapper",
    "create_validated_agent",
    # Audit bridge
    "get_audit_bridge",
]

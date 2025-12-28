"""
Shared configuration for ADR-007.1 Three-Layer Tool Invocation Strategy.

This module provides the Tier 1 API-level configuration that eliminates infinite
loops caused by mode="ANY" while maintaining tool invocation enforcement through
mode="AUTO" + instruction layer (Tier 2) + validation layer (Tier 3).

Reference: docs/adr/ADR-007.1-tool-invocation-strategy.md § Tier 1
"""

from google.genai import types


# Tier 1: API-level tool invocation control
# mode="AUTO" allows both tool calls AND text synthesis (eliminates infinite loop)
# mode="ANY" forces every response to contain a tool call (causes infinite loop)
TOOL_CONFIG = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="AUTO"  # NOT "ANY" - allows synthesis after tool calls
        # Note: allowed_function_names only valid with mode="ANY"
    )
)

# Complete generation configuration with low temperature for deterministic tool selection
GENERATE_CONTENT_CONFIG = types.GenerateContentConfig(
    tool_config=TOOL_CONFIG,
    temperature=0.1,  # Low temperature ensures consistent tool selection decisions
)


# Exported configurations
__all__ = ["TOOL_CONFIG", "GENERATE_CONTENT_CONFIG"]

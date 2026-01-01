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


# =============================================================================
# AGENT TOOL REQUIREMENTS (Tier 3 Validation)
# =============================================================================
#
# Maps agent names to the tools that must be invoked for domain queries.
# Used by ToolInvocationValidator to verify tool invocation compliance.
#
# COUPLING NOTE: Tool names here must match the function names defined in each
# agent's tools. If tool function names change, update this configuration.
# Consider deriving tool names programmatically from agent definitions in Phase 2.
#
# Reference: docs/adr/ADR-007.1-tool-invocation-strategy.md § Tier 3
# =============================================================================

AGENT_TOOL_REQUIREMENTS: dict[str, list[str] | None] = {
    # Trail Assessor: damage classification, closure decisions, prioritization
    "trail_assessor": ["classify_damage", "evaluate_closure", "prioritize_trails"],

    # Burn Analyst: severity assessment, MTBS classification, boundary validation
    "burn_analyst": ["assess_severity", "classify_mtbs", "validate_boundary"],

    # Cruising Assistant: methodology, volume estimation, salvage assessment
    "cruising_assistant": ["recommend_methodology", "estimate_volume", "assess_salvage"],

    # NEPA Advisor: regulatory consultation, pathway decisions
    "nepa_advisor": ["consult_mandatory_nepa_standards", "decide_pathway"],

    # Coordinator: routing flexibility, no tool invocation requirement
    # (Coordinator routes to specialists, doesn't require specific tools)
    "coordinator": None,
}


# Exported configurations
__all__ = ["TOOL_CONFIG", "GENERATE_CONTENT_CONFIG", "AGENT_TOOL_REQUIREMENTS"]

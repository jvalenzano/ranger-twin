"""
RANGER MCP Client Utilities

Provides ADK-native McpToolset factories for connecting agents to the
MCP Fixtures Server. Uses HTTP transport in Cloud Run, stdio for local development.

Per ADR-005: Skills-First Architecture - MCP for Connectivity, Skills for Expertise
Reference: docs/specs/_!_PHASE4-MCP-INTEGRATION-PLAN.md

Environment Variables:
    MCP_FIXTURES_URL: URL of deployed MCP fixtures server (Cloud Run)
                      If set, uses HTTP transport. If not set, uses stdio (local dev).
"""

import os
from pathlib import Path
from typing import Optional


# Path to MCP Fixtures Server script (for local stdio)
PROJECT_ROOT = Path(__file__).parent.parent.parent
MCP_SERVER_PATH = PROJECT_ROOT / "services" / "mcp-fixtures" / "server.py"

# Cloud Run MCP server URL (if deployed)
MCP_FIXTURES_URL = os.environ.get("MCP_FIXTURES_URL")


def get_mcp_toolset(
    tool_filter: Optional[list[str]] = None,
    tool_name_prefix: str = "mcp_"
):
    """
    Create an ADK-native McpToolset connected to the MCP Fixtures Server.

    Uses HTTP transport when MCP_FIXTURES_URL is set (Cloud Run deployment),
    otherwise uses stdio for local development.

    This is the recommended way to connect agents to MCP data sources.
    ADK handles connection lifecycle, retries, and tool schema management.

    Args:
        tool_filter: List of MCP tool names to expose (None = all tools)
        tool_name_prefix: Prefix for tool names in agent's tool list

    Returns:
        McpToolset instance configured for appropriate transport

    Example:
        toolset = get_mcp_toolset(
            tool_filter=["get_fire_context", "mtbs_classify"],
            tool_name_prefix="mcp_"
        )
        # Adds mcp_get_fire_context, mcp_mtbs_classify to agent
    """
    from google.adk.tools.mcp_tool import McpToolset

    # Use HTTP transport if MCP_FIXTURES_URL is set (Cloud Run)
    if MCP_FIXTURES_URL:
        from google.adk.tools.mcp_tool.mcp_session_manager import HttpConnectionParams

        return McpToolset(
            connection_params=HttpConnectionParams(
                url=MCP_FIXTURES_URL,
                timeout=30.0
            ),
            tool_filter=tool_filter,
            tool_name_prefix=tool_name_prefix
        )

    # Otherwise use stdio for local development
    else:
        from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
        from mcp.client.stdio import StdioServerParameters

        return McpToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command="python",
                    args=[str(MCP_SERVER_PATH)],
                    env=None  # Inherit parent environment
                ),
                timeout=30.0  # Allow time for server startup
            ),
            tool_filter=tool_filter,
            tool_name_prefix=tool_name_prefix
        )


def get_burn_analyst_toolset():
    """
    McpToolset for Burn Analyst agent.

    Exposes:
    - mcp_get_fire_context: Fire metadata and summary
    - mcp_mtbs_classify: MTBS burn severity data
    """
    return get_mcp_toolset(
        tool_filter=["get_fire_context", "mtbs_classify"],
        tool_name_prefix="mcp_"
    )


def get_trail_assessor_toolset():
    """
    McpToolset for Trail Assessor agent.

    Exposes:
    - mcp_assess_trails: Trail damage assessment data
    """
    return get_mcp_toolset(
        tool_filter=["assess_trails"],
        tool_name_prefix="mcp_"
    )


def get_cruising_assistant_toolset():
    """
    McpToolset for Cruising Assistant agent.

    Exposes:
    - mcp_get_timber_plots: Timber cruise plot data
    """
    return get_mcp_toolset(
        tool_filter=["get_timber_plots"],
        tool_name_prefix="mcp_"
    )


def get_coordinator_toolset():
    """
    McpToolset for Coordinator agent (full access).

    Exposes all MCP tools for routing and overview queries:
    - mcp_get_fire_context
    - mcp_mtbs_classify
    - mcp_assess_trails
    - mcp_get_timber_plots
    """
    return get_mcp_toolset(
        tool_filter=None,  # All tools
        tool_name_prefix="mcp_"
    )

"""
RANGER MCP Fixtures Server

Provides fixture data for Cedar Creek fire to ADK agents via MCP tools.
This server is Phase 1's data source - simulated data for multi-agent demo.

Tools:
- get_fire_context: Fire metadata and summary
- mtbs_classify: MTBS burn severity classification
- assess_trails: Trail damage assessment data

Run locally: uvicorn server:app --host 0.0.0.0 --port 8080
"""

import json
from pathlib import Path
from typing import Any

from mcp.server import Server
from mcp.server.sse import SseServerTransport
from mcp.types import Tool, TextContent
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import Response

# Path to fixture data
FIXTURES_DIR = Path(__file__).parent.parent.parent / "data" / "fixtures" / "cedar-creek"


def load_fixture(filename: str) -> dict[str, Any]:
    """Load a fixture JSON file."""
    filepath = FIXTURES_DIR / filename
    if filepath.exists():
        with open(filepath) as f:
            return json.load(f)
    return {"error": f"Fixture not found: {filename}"}


# Pre-load fixture data for performance
INCIDENT_DATA = load_fixture("incident-metadata.json")
BURN_SEVERITY_DATA = load_fixture("burn-severity.json")
TRAIL_DAMAGE_DATA = load_fixture("trail-damage.json")
TIMBER_PLOTS_DATA = load_fixture("timber-plots.json")


# Initialize MCP Server
mcp_server = Server("ranger-fixtures")


@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    """Return available MCP tools."""
    return [
        Tool(
            name="get_fire_context",
            description="Get fire context including metadata, location, and summary statistics for a fire incident.",
            inputSchema={
                "type": "object",
                "properties": {
                    "fire_id": {
                        "type": "string",
                        "description": "Fire identifier (e.g., 'cedar-creek' or 'cedar-creek-2022')"
                    }
                },
                "required": ["fire_id"]
            }
        ),
        Tool(
            name="mtbs_classify",
            description="Get MTBS (Monitoring Trends in Burn Severity) classification data for a fire, including severity zones and dNBR values.",
            inputSchema={
                "type": "object",
                "properties": {
                    "fire_id": {
                        "type": "string",
                        "description": "Fire identifier"
                    },
                    "include_sectors": {
                        "type": "boolean",
                        "description": "Include detailed sector-level data (default: true)"
                    }
                },
                "required": ["fire_id"]
            }
        ),
        Tool(
            name="assess_trails",
            description="Get trail damage assessment data for a fire, including damage points, costs, and priorities.",
            inputSchema={
                "type": "object",
                "properties": {
                    "fire_id": {
                        "type": "string",
                        "description": "Fire identifier"
                    },
                    "trail_id": {
                        "type": "string",
                        "description": "Specific trail to assess (optional, returns all if not specified)"
                    }
                },
                "required": ["fire_id"]
            }
        ),
        Tool(
            name="get_timber_plots",
            description="Get timber cruise plot data for salvage assessment.",
            inputSchema={
                "type": "object",
                "properties": {
                    "fire_id": {
                        "type": "string",
                        "description": "Fire identifier"
                    }
                },
                "required": ["fire_id"]
            }
        )
    ]


@mcp_server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle MCP tool calls."""
    fire_id = arguments.get("fire_id", "").lower()

    # Normalize fire_id - accept variations
    if fire_id in ["cedar-creek", "cedar-creek-2022", "cc-2022", "cedar_creek"]:
        fire_id = "cedar-creek"

    if name == "get_fire_context":
        if fire_id == "cedar-creek":
            result = {
                "fire_id": INCIDENT_DATA.get("fire_id"),
                "name": INCIDENT_DATA.get("name"),
                "discovery_date": INCIDENT_DATA.get("discovery_date"),
                "containment_date": INCIDENT_DATA.get("containment_date"),
                "acres": INCIDENT_DATA.get("acres"),
                "severity": INCIDENT_DATA.get("severity"),
                "phase": INCIDENT_DATA.get("phase"),
                "forest": INCIDENT_DATA.get("forest"),
                "state": INCIDENT_DATA.get("state"),
                "coordinates": INCIDENT_DATA.get("coordinates"),
                "summary": INCIDENT_DATA.get("summary"),
                "baer_status": INCIDENT_DATA.get("baer_status"),
                "source": "RANGER-Fixtures",
                "confidence": 0.95
            }
        else:
            result = {"error": f"Unknown fire: {fire_id}", "available_fires": ["cedar-creek"]}

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    elif name == "mtbs_classify":
        if fire_id == "cedar-creek":
            include_sectors = arguments.get("include_sectors", True)

            result = {
                "fire_id": BURN_SEVERITY_DATA.get("fire_id"),
                "fire_name": BURN_SEVERITY_DATA.get("fire_name"),
                "total_acres": BURN_SEVERITY_DATA.get("total_acres"),
                "imagery_date": BURN_SEVERITY_DATA.get("imagery_date"),
                "source": "MTBS",
                "summary": BURN_SEVERITY_DATA.get("summary"),
                "confidence": 0.94,
                "mtbs_id": "cc_2025_001"
            }

            if include_sectors:
                # Include simplified sector data (without geometry for brevity)
                sectors = []
                for sector in BURN_SEVERITY_DATA.get("sectors", []):
                    sectors.append({
                        "id": sector.get("id"),
                        "name": sector.get("name"),
                        "severity": sector.get("severity"),
                        "severity_class": sector.get("severity_class"),
                        "acres": sector.get("acres"),
                        "dnbr_mean": sector.get("dnbr_mean"),
                        "priority_notes": sector.get("priority_notes")
                    })
                result["sectors"] = sectors
        else:
            result = {"error": f"Unknown fire: {fire_id}", "available_fires": ["cedar-creek"]}

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    elif name == "assess_trails":
        if fire_id == "cedar-creek":
            trail_id = arguments.get("trail_id")

            trails = TRAIL_DAMAGE_DATA.get("trails", [])

            if trail_id:
                # Filter to specific trail
                trails = [t for t in trails if t.get("trail_id") == trail_id or t.get("trail_name") == trail_id]
                if not trails:
                    result = {"error": f"Trail not found: {trail_id}", "available_trails": [t.get("trail_id") for t in TRAIL_DAMAGE_DATA.get("trails", [])]}
                    return [TextContent(type="text", text=json.dumps(result, indent=2))]

            result = {
                "fire_id": TRAIL_DAMAGE_DATA.get("fire_id"),
                "assessment_date": TRAIL_DAMAGE_DATA.get("assessment_date"),
                "source": "RANGER-Fixtures",
                "summary": TRAIL_DAMAGE_DATA.get("summary"),
                "confidence": 0.92,
                "trails": trails
            }
        else:
            result = {"error": f"Unknown fire: {fire_id}", "available_fires": ["cedar-creek"]}

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    elif name == "get_timber_plots":
        if fire_id == "cedar-creek":
            result = {
                "fire_id": fire_id,
                "source": "RANGER-Fixtures",
                "confidence": 0.88,
                "plots": TIMBER_PLOTS_DATA if isinstance(TIMBER_PLOTS_DATA, list) else TIMBER_PLOTS_DATA.get("plots", [])
            }
        else:
            result = {"error": f"Unknown fire: {fire_id}", "available_fires": ["cedar-creek"]}

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    else:
        return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]


# Create SSE transport for HTTP-based MCP
sse_transport = SseServerTransport("/sse")


async def handle_sse(request):
    """Handle SSE connection for MCP."""
    async with sse_transport.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await mcp_server.run(
            streams[0], streams[1], mcp_server.create_initialization_options()
        )


async def handle_messages(request):
    """Handle MCP message endpoint."""
    await sse_transport.handle_post_message(request.scope, request.receive, request._send)


async def health_check(request):
    """Health check endpoint for Cloud Run."""
    return Response(
        content=json.dumps({
            "status": "healthy",
            "service": "ranger-mcp-fixtures",
            "fixtures_loaded": {
                "incident": bool(INCIDENT_DATA and "fire_id" in INCIDENT_DATA),
                "burn_severity": bool(BURN_SEVERITY_DATA and "sectors" in BURN_SEVERITY_DATA),
                "trail_damage": bool(TRAIL_DAMAGE_DATA and "trails" in TRAIL_DAMAGE_DATA),
                "timber_plots": bool(TIMBER_PLOTS_DATA)
            }
        }),
        media_type="application/json"
    )


# Starlette app with routes
app = Starlette(
    debug=True,
    routes=[
        Route("/sse", endpoint=handle_sse),
        Route("/messages", endpoint=handle_messages, methods=["POST"]),
        Route("/health", endpoint=health_check),
        Route("/", endpoint=health_check),  # Root health check
    ]
)


if __name__ == "__main__":
    import uvicorn
    print("Starting RANGER MCP Fixtures Server...")
    print(f"Fixtures directory: {FIXTURES_DIR}")
    print(f"Loaded fires: cedar-creek")
    print(f"Tools: get_fire_context, mtbs_classify, assess_trails, get_timber_plots")
    uvicorn.run(app, host="0.0.0.0", port=8080)

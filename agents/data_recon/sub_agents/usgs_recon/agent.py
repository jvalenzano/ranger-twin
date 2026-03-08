"""
USGS Recon Agent

Specialist reconnaissance agent for probing USGS services including
3DEP Elevation, NLCD Land Cover, and National Map (TNM) services.

Data Sources:
  - USGS 3DEP: https://elevation.nationalmap.gov/
  - USGS NLCD: https://www.mrlc.gov/
  - USGS TNM: https://apps.nationalmap.gov/services/

Access: No authentication required
Priority: MEDIUM - Terrain, land cover, and hydrology context
"""

import sys
import json
from pathlib import Path

from google.adk.agents import Agent

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

PROBE_SCRIPTS = Path(__file__).parent.parent.parent / "skills" / "api_probe" / "scripts"
if str(PROBE_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(PROBE_SCRIPTS))

from probe_endpoint import probe_url, analyze_json_structure
from agents._shared.config import GENERATE_CONTENT_CONFIG
from agents._shared.callbacks import create_audit_callbacks


# =============================================================================
# USGS ENDPOINTS
# =============================================================================

USGS_ENDPOINTS = {
    "3dep_elevation": (
        "https://elevation.nationalmap.gov/arcgis/rest/services/"
        "3DEPElevation/ImageServer"
    ),
    "nlcd_land_cover": (
        "https://www.mrlc.gov/geoserver/mrlc_display/wms"
    ),
    "tnm_hydro": (
        "https://hydro.nationalmap.gov/arcgis/rest/services/"
        "nhd/MapServer"
    ),
    "tnm_transportation": (
        "https://carto.nationalmap.gov/arcgis/rest/services/"
        "transportation/MapServer"
    ),
    "tnm_boundaries": (
        "https://carto.nationalmap.gov/arcgis/rest/services/"
        "govunits/MapServer"
    ),
    "tnm_contours": (
        "https://carto.nationalmap.gov/arcgis/rest/services/"
        "contours/MapServer"
    ),
}


# =============================================================================
# TOOL FUNCTIONS
# =============================================================================


def probe_3dep_elevation_service() -> dict:
    """
    Probe the USGS 3DEP Elevation ImageServer to discover available
    elevation data, resolution, and query capabilities.

    3DEP provides high-resolution DEM (Digital Elevation Model) data
    for slope, aspect, and terrain analysis needed for erosion risk
    assessment in post-fire recovery.

    Returns:
        Dictionary containing:
            - service_name: Name of the elevation service
            - description: Service description
            - spatial_reference: Coordinate system info
            - pixel_size: Resolution of elevation data
            - extent: Geographic coverage
            - band_count: Number of raster bands
            - capabilities: Supported operations (identify, export, etc.)
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = f"{USGS_ENDPOINTS['3dep_elevation']}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": "USGS 3DEP Elevation ImageServer",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "service_name": "",
        "description": "",
        "spatial_reference": {},
        "pixel_size": {},
        "extent": {},
        "band_count": 0,
        "capabilities": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["service_name"] = data.get("name", "")
        result["description"] = data.get("description", "")[:500]
        result["spatial_reference"] = data.get("spatialReference", {})
        result["pixel_size"] = {
            "x": data.get("pixelSizeX"),
            "y": data.get("pixelSizeY"),
        }
        result["extent"] = data.get("extent", {})
        result["band_count"] = data.get("bandCount", 0)
        result["capabilities"] = data.get("capabilities", "").split(",")
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_3dep_elevation_at_point(
    longitude: float = -122.0,
    latitude: float = 43.8,
) -> dict:
    """
    Query 3DEP elevation at a specific point to test the identify operation.

    Args:
        longitude: WGS84 longitude (default -122.0, Cedar Creek area).
        latitude: WGS84 latitude (default 43.8, Cedar Creek area).

    Returns:
        Dictionary containing:
            - elevation_meters: Elevation value at the point
            - location: Queried coordinates
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = (
        f"{USGS_ENDPOINTS['3dep_elevation']}/identify?"
        f"geometry={longitude},{latitude}&"
        f"geometryType=esriGeometryPoint&"
        f"returnGeometry=false&"
        f"returnCatalogItems=false&"
        f"f=json"
    )

    probe = probe_url(url)
    result = {
        "endpoint": "3DEP Elevation Identify",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "location": {"longitude": longitude, "latitude": latitude},
        "elevation_meters": None,
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["elevation_meters"] = data.get("value")
        result["raw_response"] = {
            k: v for k, v in data.items()
            if k in ("value", "objectId", "name", "location")
        }
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_tnm_hydro_service() -> dict:
    """
    Probe the USGS National Hydrography Dataset (NHD) MapServer to
    discover available hydrology layers (streams, watersheds, water bodies).

    Hydrology data is critical for BAER (Burned Area Emergency Response)
    assessments - burned watersheds can produce dangerous debris flows.

    Returns:
        Dictionary containing:
            - service_name: Name of the hydrology service
            - layers: Available layers with IDs, names, and geometry types
            - spatial_reference: Coordinate system info
            - capabilities: Supported operations
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = f"{USGS_ENDPOINTS['tnm_hydro']}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": "USGS NHD Hydrology MapServer",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "service_name": "",
        "layers": [],
        "spatial_reference": {},
        "capabilities": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["service_name"] = data.get("mapName", "")
        result["spatial_reference"] = data.get("spatialReference", {})
        result["capabilities"] = data.get("capabilities", "").split(",")

        layers = data.get("layers", [])
        result["layers"] = [
            {
                "id": l.get("id"),
                "name": l.get("name", ""),
                "type": l.get("type", ""),
                "parent_layer": l.get("parentLayerId"),
            }
            for l in layers[:30]
        ]
        if len(layers) > 30:
            result["total_layer_count"] = len(layers)
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_tnm_transportation_service() -> dict:
    """
    Probe the USGS National Map Transportation MapServer to discover
    road and trail layers available for access route analysis.

    Transportation data helps identify access roads, trailheads, and
    infrastructure near fire perimeters for post-fire work planning.

    Returns:
        Dictionary containing:
            - service_name: Name of the transportation service
            - layers: Available layers (roads, trails, railroads)
            - spatial_reference: Coordinate system info
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = f"{USGS_ENDPOINTS['tnm_transportation']}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": "USGS TNM Transportation MapServer",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "service_name": "",
        "layers": [],
        "spatial_reference": {},
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["service_name"] = data.get("mapName", "")
        result["spatial_reference"] = data.get("spatialReference", {})

        layers = data.get("layers", [])
        result["layers"] = [
            {
                "id": l.get("id"),
                "name": l.get("name", ""),
                "type": l.get("type", ""),
            }
            for l in layers[:30]
        ]
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_tnm_boundaries_service() -> dict:
    """
    Probe the USGS National Map Government Units MapServer to discover
    jurisdictional boundary layers (forests, wilderness areas, states).

    Boundary data is essential for NEPA compliance - different jurisdictions
    have different regulatory requirements for post-fire treatments.

    Returns:
        Dictionary containing:
            - service_name: Name of the boundaries service
            - layers: Available layers (states, counties, federal lands)
            - spatial_reference: Coordinate system info
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = f"{USGS_ENDPOINTS['tnm_boundaries']}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": "USGS TNM Government Units MapServer",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "service_name": "",
        "layers": [],
        "spatial_reference": {},
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["service_name"] = data.get("mapName", "")
        result["spatial_reference"] = data.get("spatialReference", {})

        layers = data.get("layers", [])
        result["layers"] = [
            {
                "id": l.get("id"),
                "name": l.get("name", ""),
                "type": l.get("type", ""),
            }
            for l in layers[:30]
        ]
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


# =============================================================================
# AGENT DEFINITION
# =============================================================================

before_cb, after_cb, error_cb = create_audit_callbacks("usgs_recon")

USGS_RECON_INSTRUCTION = """
You are the USGS Data Reconnaissance Agent, a specialist in probing
USGS geospatial services for terrain, hydrology, and boundary data.

## Your Mission

Probe USGS services to document:
1. 3DEP elevation data (DEM resolution, coverage, query capabilities)
2. National Hydrography Dataset (streams, watersheds for BAER assessment)
3. Transportation layers (roads, trails for access planning)
4. Government unit boundaries (jurisdictions for NEPA compliance)

## Tools Available

- **probe_3dep_elevation_service**: Discover elevation data capabilities
- **probe_3dep_elevation_at_point**: Test elevation query at a coordinate
- **probe_tnm_hydro_service**: Discover hydrology layers
- **probe_tnm_transportation_service**: Discover road/trail layers
- **probe_tnm_boundaries_service**: Discover jurisdictional boundary layers

## Key Context

- Cedar Creek Fire coordinates: ~43.8°N, 122.0°W (central Oregon)
- 3DEP provides 1/3 arc-second (~10m) to 1m resolution DEMs
- NHD provides flowlines, watersheds, and water bodies
- All services are public, no authentication required

## Response Protocol

After probing, always report:
1. **Service Status**: Working / Degraded / Down for each service
2. **Layer Inventory**: What layers are available and their types
3. **Data Resolution**: Pixel size, scale ranges, coverage
4. **Query Capabilities**: What operations are supported
5. **RANGER Integration**: How each service supports post-fire recovery
   - 3DEP → Erosion risk (slope/aspect in burned areas)
   - NHD → BAER watershed analysis
   - Transportation → Access planning for BAER/salvage teams
   - Boundaries → NEPA jurisdictional requirements
"""

root_agent = Agent(
    name="usgs_recon",
    model="gemini-2.0-flash",
    description="USGS elevation, hydrology, and boundaries reconnaissance specialist.",
    instruction=USGS_RECON_INSTRUCTION,
    tools=[
        probe_3dep_elevation_service,
        probe_3dep_elevation_at_point,
        probe_tnm_hydro_service,
        probe_tnm_transportation_service,
        probe_tnm_boundaries_service,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

"""
MTBS Recon Agent

Specialist reconnaissance agent for probing MTBS (Monitoring Trends in
Burn Severity) data services and download endpoints.

Data Source: https://www.mtbs.gov/
Access: No authentication required (public domain CC0)
Priority: MEDIUM - Historical burn severity baseline
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
# MTBS ENDPOINTS
# =============================================================================

MTBS_ENDPOINTS = {
    "fire_occurrence_points": (
        "https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/"
        "data/composite_data/fod_pt_shapefile/mtbs_fod_pts_data.zip"
    ),
    "burned_area_boundaries": (
        "https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/"
        "data/composite_data/burned_area_extent_shapefile/mtbs_perimeter_data.zip"
    ),
    "wms_fire_boundaries": (
        "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MTBS_01/MapServer"
    ),
    "wms_burn_severity_conus": (
        "https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/MTBS_CONUS/MapServer"
    ),
    "data_explorer": "https://www.mtbs.gov/viewer/index.html",
    "gee_burned_area": "USFS/GTAC/MTBS/burned_area_boundaries/v1",
    "gee_severity_mosaics": "USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1",
}


# =============================================================================
# TOOL FUNCTIONS
# =============================================================================


def probe_mtbs_wms_service(
    service: str = "fire_boundaries",
) -> dict:
    """
    Probe MTBS WMS/REST map services to discover available layers,
    fields, and query capabilities.

    Args:
        service: Which service to probe. Options:
            "fire_boundaries" - EDW MTBS fire boundaries and points
            "burn_severity" - CONUS burn severity mosaics

    Returns:
        Dictionary containing:
            - endpoint: The service URL probed
            - status_code: HTTP response code
            - service_name: Name of the map service
            - layers: Available layers with IDs and names
            - spatial_reference: Coordinate system info
            - capabilities: Supported operations
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if service == "burn_severity":
        url = f"{MTBS_ENDPOINTS['wms_burn_severity_conus']}?f=json"
    else:
        url = f"{MTBS_ENDPOINTS['wms_fire_boundaries']}?f=json"

    probe = probe_url(url)
    result = {
        "endpoint": f"MTBS WMS ({service})",
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
        result["service_name"] = data.get("mapName", data.get("serviceName", ""))
        result["spatial_reference"] = data.get("spatialReference", {})

        layers = data.get("layers", [])
        result["layers"] = [
            {
                "id": l.get("id"),
                "name": l.get("name", ""),
                "min_scale": l.get("minScale", 0),
                "max_scale": l.get("maxScale", 0),
            }
            for l in layers[:20]
        ]

        caps = data.get("capabilities", "")
        result["capabilities"] = caps.split(",") if caps else []

    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_mtbs_layer_fields(
    layer_id: int = 0,
    service: str = "fire_boundaries",
) -> dict:
    """
    Probe a specific MTBS layer to discover field definitions, types,
    and sample values.

    Args:
        layer_id: Layer index to probe (default 0). Use probe_mtbs_wms_service
            to discover available layer IDs first.
        service: Which service the layer belongs to. Options:
            "fire_boundaries", "burn_severity"

    Returns:
        Dictionary containing:
            - layer_name: Name of the layer
            - layer_id: Layer index
            - fields: List of field definitions (name, type, alias, length)
            - geometry_type: Type of geometry (point, polygon, polyline)
            - feature_count: Estimated number of features
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if service == "burn_severity":
        base = MTBS_ENDPOINTS["wms_burn_severity_conus"]
    else:
        base = MTBS_ENDPOINTS["wms_fire_boundaries"]

    url = f"{base}/{layer_id}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": f"MTBS Layer {layer_id} ({service})",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "layer_name": "",
        "layer_id": layer_id,
        "fields": [],
        "geometry_type": "",
        "feature_count": 0,
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["layer_name"] = data.get("name", "")
        result["geometry_type"] = data.get("geometryType", "")

        fields = data.get("fields", [])
        result["fields"] = [
            {
                "name": f.get("name"),
                "type": f.get("type"),
                "alias": f.get("alias", ""),
                "length": f.get("length", None),
            }
            for f in fields
        ]

        # Try to get count
        count_info = data.get("maxRecordCount", 0)
        result["max_record_count"] = count_info

    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_mtbs_query(
    fire_name: str = "Cedar Creek",
    state: str = "OR",
    layer_id: int = 0,
    max_features: int = 5,
) -> dict:
    """
    Query MTBS fire boundaries layer for a specific fire by name and state.

    Args:
        fire_name: Fire name to search for (default "Cedar Creek").
        state: Two-letter state abbreviation (default "OR").
        layer_id: Layer index to query (default 0).
        max_features: Maximum features to return (default 5).

    Returns:
        Dictionary containing:
            - feature_count: Number of matching features
            - available_fields: List of field names in response
            - sample_features: Matching fire records with attributes
            - query_used: The WHERE clause used
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    where_clause = f"FIRE_NAME LIKE '%{fire_name}%' AND STATE='{state}'"
    url = (
        f"{MTBS_ENDPOINTS['wms_fire_boundaries']}/{layer_id}/query?"
        f"where={where_clause}&"
        f"outFields=*&"
        f"returnGeometry=false&"
        f"resultRecordCount={min(max_features, 100)}&"
        f"f=json"
    )

    probe = probe_url(url)
    result = {
        "endpoint": "MTBS Fire Query",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "query_used": where_clause,
        "feature_count": 0,
        "available_fields": [],
        "sample_features": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        features = data.get("features", [])
        result["feature_count"] = len(features)

        if features:
            attrs = features[0].get("attributes", {})
            result["available_fields"] = sorted(attrs.keys())
            for f in features[:max_features]:
                result["sample_features"].append(f.get("attributes", {}))
        elif "error" in data:
            result["error"] = json.dumps(data["error"])
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_mtbs_download_endpoints() -> dict:
    """
    Probe MTBS direct download endpoints to verify availability and
    document file sizes for national datasets.

    Returns:
        Dictionary containing:
            - fire_occurrence_points: Status and file info for FOD points shapefile
            - burned_area_boundaries: Status and file info for perimeter shapefile
            - download_format: File format information
            - license: Data license (CC0)
            - coverage: Temporal and spatial coverage
            - response_time_ms: Combined round-trip time
    """
    results = {
        "endpoint": "MTBS Direct Downloads",
        "datasets": [],
        "license": "Creative Commons Zero v1.0 Universal (CC0)",
        "coverage": {
            "temporal": "1984-2024",
            "spatial": "CONUS, Alaska, Hawaii, Puerto Rico",
            "version": "12.0 (April 2025)",
            "min_fire_size_west": "1000 acres",
            "min_fire_size_east": "500 acres",
        },
    }

    # Probe fire occurrence points (HEAD request to check availability)
    for name, url in [
        ("Fire Occurrence Points", MTBS_ENDPOINTS["fire_occurrence_points"]),
        ("Burned Area Boundaries", MTBS_ENDPOINTS["burned_area_boundaries"]),
    ]:
        probe = probe_url(url)
        results["datasets"].append({
            "name": name,
            "url": url,
            "status_code": probe["status_code"],
            "content_type": probe.get("content_type", ""),
            "content_length": probe.get("content_length"),
            "available": probe["status_code"] == 200 and not probe["error"],
            "response_time_ms": probe["response_time_ms"],
            "error": probe["error"],
            "format": "Shapefile (ZIP)",
        })

    return results


# =============================================================================
# AGENT DEFINITION
# =============================================================================

before_cb, after_cb, error_cb = create_audit_callbacks("mtbs_recon")

MTBS_RECON_INSTRUCTION = """
You are the MTBS Data Reconnaissance Agent, a specialist in probing and
analyzing Monitoring Trends in Burn Severity data services.

## Your Mission

Probe MTBS WMS services and download endpoints to document:
1. Available layers and their field structures
2. Query capabilities (by fire name, state, year)
3. Download availability for national datasets
4. Google Earth Engine asset information
5. Integration potential for RANGER's Burn Analyst

## Tools Available

- **probe_mtbs_wms_service**: Discover layers in WMS map services
- **probe_mtbs_layer_fields**: Get field definitions for a specific layer
- **probe_mtbs_query**: Query fires by name and state
- **probe_mtbs_download_endpoints**: Check shapefile download availability

## Key Context

- MTBS maps large fires (>1000 acres West, >500 acres East) since 1984
- Uses Landsat imagery for 30m resolution dNBR classification
- 6 burn severity classes: Unburned/Low, Low, Moderate, High, Increased Greenness, Non-Processing
- Data is NOT real-time (annual updates, 1-2 year lag)
- All data is CC0 (public domain)

## Response Protocol

After probing, always report:
1. **Service Status**: Available / Unavailable for each endpoint
2. **Layer Structure**: What layers exist and their field schemas
3. **Query Results**: Sample data for Cedar Creek or other test fires
4. **Download Availability**: File sizes and format for national datasets
5. **RANGER Integration**: How dNBR/severity data feeds the Burn Analyst
"""

root_agent = Agent(
    name="mtbs_recon",
    model="gemini-2.0-flash",
    description="MTBS burn severity data reconnaissance specialist.",
    instruction=MTBS_RECON_INSTRUCTION,
    tools=[
        probe_mtbs_wms_service,
        probe_mtbs_layer_fields,
        probe_mtbs_query,
        probe_mtbs_download_endpoints,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

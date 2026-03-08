"""
NASA FIRMS Recon Agent

Specialist reconnaissance agent for probing NASA FIRMS (Fire Information
for Resource Management System) endpoints.

Data Source: https://firms.modaps.eosdis.nasa.gov/
Access: Free API key required for data endpoints; metadata endpoints are open
Priority: HIGH - Active fire detection (near real-time)
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

from probe_endpoint import probe_url, analyze_json_structure, analyze_csv_structure
from agents._shared.config import GENERATE_CONTENT_CONFIG
from agents._shared.callbacks import create_audit_callbacks


# =============================================================================
# FIRMS ENDPOINTS
# =============================================================================

FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov"

FIRMS_ENDPOINTS = {
    "data_availability": f"{FIRMS_BASE}/api/data_availability/csv",
    "area_csv": f"{FIRMS_BASE}/api/area/csv",
    "area_json": f"{FIRMS_BASE}/api/area",
    "map_key_info": f"{FIRMS_BASE}/api/map_key/",
    "kml_footprints": f"{FIRMS_BASE}/api/kml_fire_footprints",
}


# =============================================================================
# TOOL FUNCTIONS
# =============================================================================


def probe_firms_data_availability(api_key: str = "") -> dict:
    """
    Probe FIRMS Data Availability endpoint to discover available satellite
    sensors and date ranges.

    The data availability endpoint returns which sensors have data and
    their coverage periods. If no API key is provided, probes the endpoint
    structure without data.

    Args:
        api_key: NASA FIRMS MAP_KEY. If empty, probes endpoint structure only.

    Returns:
        Dictionary containing:
            - endpoint: The URL probed
            - status_code: HTTP response code
            - sensors_available: List of satellite sensor names
            - date_ranges: Start/end dates for each sensor
            - api_key_required: Whether a key is needed
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if api_key:
        url = f"{FIRMS_ENDPOINTS['data_availability']}/{api_key}/all"
    else:
        # Probe without key to document the error/redirect behavior
        url = f"{FIRMS_ENDPOINTS['data_availability']}/DEMO_KEY/all"

    probe = probe_url(url)
    result = {
        "endpoint": "FIRMS Data Availability",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "api_key_required": True,
        "api_key_provided": bool(api_key),
        "sensors_available": [],
        "date_ranges": [],
    }

    if probe["error"]:
        return result

    body = probe["body_preview"]
    if body and "source" in body.lower():
        csv_analysis = analyze_csv_structure(body)
        result["csv_structure"] = csv_analysis

        # Parse sensor data from CSV
        lines = body.strip().split("\n")
        for line in lines[1:]:
            parts = line.split(",")
            if len(parts) >= 3:
                result["sensors_available"].append(parts[0].strip())
                result["date_ranges"].append({
                    "sensor": parts[0].strip(),
                    "start_date": parts[1].strip(),
                    "end_date": parts[2].strip(),
                })
    else:
        result["error"] = f"Unexpected response format: {body[:200]}"

    return result


def probe_firms_area_endpoint(
    api_key: str = "",
    bbox: str = "-122.5,43.5,-121.5,44.5",
    days: int = 1,
    source: str = "VIIRS_SNPP_NRT",
) -> dict:
    """
    Probe FIRMS Area API to fetch active fire detections for a bounding box.

    The Area endpoint returns fire hotspot detections from satellite sensors
    for a specified geographic area and time range.

    Args:
        api_key: NASA FIRMS MAP_KEY. If empty, probes endpoint structure only.
        bbox: Bounding box as "west,south,east,north" in WGS84 coordinates.
            Default covers Cedar Creek Fire area in Oregon.
        days: Number of days of data (1-10, default 1).
        source: Satellite source identifier. Options:
            "VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT",
            "MODIS_NRT", "LANDSAT_NRT"

    Returns:
        Dictionary containing:
            - endpoint: The URL probed
            - status_code: HTTP response code
            - hotspot_count: Number of fire detections
            - columns: CSV column headers
            - sample_detections: Sample fire detection records
            - sensor_info: Which satellite sensor was queried
            - bbox_queried: The bounding box used
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    key = api_key if api_key else "DEMO_KEY"
    url = f"{FIRMS_ENDPOINTS['area_csv']}/{key}/{source}/{bbox}/{days}"

    probe = probe_url(url)
    result = {
        "endpoint": "FIRMS Area (CSV)",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "api_key_provided": bool(api_key),
        "sensor_info": source,
        "bbox_queried": bbox,
        "days_queried": days,
        "hotspot_count": 0,
        "columns": [],
        "sample_detections": [],
    }

    if probe["error"]:
        return result

    body = probe["body_preview"]
    if body and ("latitude" in body.lower() or "," in body):
        csv_analysis = analyze_csv_structure(body)
        result["csv_structure"] = csv_analysis
        result["columns"] = csv_analysis.get("columns", [])
        result["hotspot_count"] = csv_analysis.get("row_count", 0)
        result["sample_detections"] = csv_analysis.get("sample_rows", [])
    else:
        result["response_preview"] = body[:500]

    return result


def probe_firms_api_capabilities() -> dict:
    """
    Probe FIRMS API documentation and capabilities without requiring
    an API key. Documents available endpoints, rate limits, and
    supported formats.

    Returns:
        Dictionary containing:
            - available_endpoints: List of API endpoints and their purposes
            - supported_sensors: List of satellite sensors
            - supported_formats: Output format options
            - rate_limits: API rate limit information
            - api_key_info: How to obtain a free API key
            - response_time_ms: Round-trip time for capability probe
    """
    # Probe the API documentation page
    probe = probe_url(f"{FIRMS_BASE}/api/area/")
    result = {
        "endpoint": "FIRMS API Capabilities",
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "available_endpoints": [
            {
                "name": "Area (CSV)",
                "url_pattern": "/api/area/csv/{MAP_KEY}/{SOURCE}/{BBOX}/{DAYS}",
                "description": "Fire hotspots by bounding box, CSV format",
            },
            {
                "name": "Area (JSON)",
                "url_pattern": "/api/area/json/{MAP_KEY}/{SOURCE}/{BBOX}/{DAYS}",
                "description": "Fire hotspots by bounding box, JSON format",
            },
            {
                "name": "Data Availability",
                "url_pattern": "/api/data_availability/csv/{MAP_KEY}/all",
                "description": "Available sensors and date ranges",
            },
            {
                "name": "KML Fire Footprints",
                "url_pattern": "/api/kml_fire_footprints/{MAP_KEY}/{SOURCE}/{AREA}/{DAYS}",
                "description": "Fire polygons in KML format",
            },
        ],
        "supported_sensors": [
            {"id": "VIIRS_SNPP_NRT", "satellite": "Suomi NPP", "resolution": "375m"},
            {"id": "VIIRS_NOAA20_NRT", "satellite": "NOAA-20", "resolution": "375m"},
            {"id": "VIIRS_NOAA21_NRT", "satellite": "NOAA-21", "resolution": "375m"},
            {"id": "MODIS_NRT", "satellite": "Terra + Aqua", "resolution": "1km"},
            {"id": "LANDSAT_NRT", "satellite": "Landsat", "resolution": "30m", "note": "US/Canada only"},
        ],
        "supported_formats": ["CSV", "JSON", "KML", "SHP"],
        "rate_limits": {
            "requests_per_10min": 5000,
            "max_days_per_request": 10,
            "max_bbox_area": "world (-180,-90,180,90)",
        },
        "api_key_info": {
            "cost": "Free",
            "registration_url": "https://firms.modaps.eosdis.nasa.gov/api/map_key/",
            "delivery": "Instant via email",
            "format": "32 alphanumeric characters",
        },
        "csv_columns": [
            "latitude", "longitude", "brightness", "scan", "track",
            "acq_date", "acq_time", "satellite", "confidence", "version",
            "bright_t31", "frp", "daynight",
        ],
    }

    return result


# =============================================================================
# AGENT DEFINITION
# =============================================================================

before_cb, after_cb, error_cb = create_audit_callbacks("firms_recon")

FIRMS_RECON_INSTRUCTION = """
You are the NASA FIRMS Data Reconnaissance Agent, a specialist in probing
and analyzing NASA's Fire Information for Resource Management System.

## Your Mission

Probe FIRMS API endpoints to document:
1. What satellite fire detection data is available
2. Data formats and field structures (CSV columns, JSON schema)
3. Sensor coverage periods and update frequencies
4. Integration potential for RANGER (active fire overlay, spread analysis)

## Tools Available

- **probe_firms_data_availability**: Check which sensors have data and date ranges
- **probe_firms_area_endpoint**: Fetch fire hotspot detections for a bounding box
- **probe_firms_api_capabilities**: Document all API endpoints and capabilities

## Key Context

- FIRMS requires a free API key (MAP_KEY) for data endpoints
- Without a key, some probes will return auth errors - document the error pattern
- Cedar Creek Fire bbox: -122.5,43.5,-121.5,44.5 (central Oregon)
- VIIRS has 375m resolution, MODIS has 1km, Landsat has 30m
- Data updates every 3 hours globally, <1 minute for US/Canada

## Response Protocol

After probing, always report:
1. **API Status**: Accessible / Auth Required / Down
2. **Data Format**: CSV columns, JSON schema, sample values
3. **Sensor Coverage**: Which sensors, date ranges, resolutions
4. **Rate Limits**: Requests per period, data volume limits
5. **RANGER Integration**: How this maps to burn analysis and fire detection
"""

root_agent = Agent(
    name="firms_recon",
    model="gemini-2.0-flash",
    description="NASA FIRMS active fire detection reconnaissance specialist.",
    instruction=FIRMS_RECON_INSTRUCTION,
    tools=[
        probe_firms_data_availability,
        probe_firms_area_endpoint,
        probe_firms_api_capabilities,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

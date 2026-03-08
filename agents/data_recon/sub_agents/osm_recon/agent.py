"""
OSM/Overpass Recon Agent

Specialist reconnaissance agent for probing OpenStreetMap data via the
Overpass API for trail, road, and infrastructure data.

Data Source: https://overpass-api.de/
Access: No authentication required (rate-limited)
Priority: MEDIUM - Trail and infrastructure baseline for Trail Assessor
"""

import sys
import json
import urllib.parse
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
# OVERPASS ENDPOINTS
# =============================================================================

OVERPASS_ENDPOINTS = {
    "main": "https://overpass-api.de/api/interpreter",
    "status": "https://overpass-api.de/api/status",
}

# Cedar Creek Fire bounding box (approximate)
CEDAR_CREEK_BBOX = "43.6,-122.3,44.0,-121.7"


# =============================================================================
# TOOL FUNCTIONS
# =============================================================================


def probe_overpass_status() -> dict:
    """
    Probe the Overpass API server status to check availability,
    current load, and rate limit information.

    Returns:
        Dictionary containing:
            - endpoint: The status URL probed
            - status_code: HTTP response code
            - server_status: Current server state
            - available_slots: Number of available query slots
            - rate_limit_info: Rate limiting details
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    probe = probe_url(OVERPASS_ENDPOINTS["status"])
    result = {
        "endpoint": "Overpass API Status",
        "url": OVERPASS_ENDPOINTS["status"],
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "server_status": "",
        "rate_limit_info": "2 concurrent requests, 10000 elements per query recommended",
    }

    if not probe["error"]:
        result["server_status"] = probe["body_preview"][:500]

    return result


def probe_overpass_trails(
    bbox: str = "",
    max_elements: int = 50,
) -> dict:
    """
    Query Overpass API for hiking trails and paths within a bounding box.

    Fetches trail data from OpenStreetMap including trail names, surface
    types, difficulty ratings, and geometry for the Trail Assessor agent.

    Args:
        bbox: Bounding box as "south,west,north,east" (Overpass format).
            Default uses Cedar Creek Fire area.
        max_elements: Maximum elements to return (default 50).

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - trail_count: Number of trails found
            - trail_tags: Common OSM tags found on trails
            - sample_trails: Sample trail features with properties
            - available_attributes: OSM tags present in the data
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if not bbox:
        bbox = CEDAR_CREEK_BBOX

    query = f"""
[out:json][timeout:25];
(
  way["highway"="path"]["name"](({bbox}));
  way["highway"="track"]["name"](({bbox}));
  way["highway"="footway"]["name"](({bbox}));
  relation["route"="hiking"](({bbox}));
);
out tags {max_elements};
"""
    encoded_query = urllib.parse.urlencode({"data": query.strip()})
    url = f"{OVERPASS_ENDPOINTS['main']}?{encoded_query}"

    probe = probe_url(url, timeout=30)
    result = {
        "endpoint": "Overpass Trails Query",
        "bbox": bbox,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "trail_count": 0,
        "sample_trails": [],
        "available_attributes": set(),
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        elements = data.get("elements", [])
        result["trail_count"] = len(elements)

        all_tags = set()
        for elem in elements[:max_elements]:
            tags = elem.get("tags", {})
            all_tags.update(tags.keys())
            result["sample_trails"].append({
                "id": elem.get("id"),
                "type": elem.get("type"),
                "tags": tags,
            })

        result["available_attributes"] = sorted(all_tags)
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_overpass_roads(
    bbox: str = "",
    max_elements: int = 50,
) -> dict:
    """
    Query Overpass API for roads and access routes within a bounding box.

    Fetches road data including forest service roads, highways, and
    access roads for post-fire operations planning.

    Args:
        bbox: Bounding box as "south,west,north,east" (Overpass format).
            Default uses Cedar Creek Fire area.
        max_elements: Maximum elements to return (default 50).

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - road_count: Number of roads found
            - road_types: Breakdown of road types found
            - sample_roads: Sample road features with properties
            - available_attributes: OSM tags present in the data
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if not bbox:
        bbox = CEDAR_CREEK_BBOX

    query = f"""
[out:json][timeout:25];
(
  way["highway"~"tertiary|unclassified|service|track"](({bbox}));
);
out tags {max_elements};
"""
    encoded_query = urllib.parse.urlencode({"data": query.strip()})
    url = f"{OVERPASS_ENDPOINTS['main']}?{encoded_query}"

    probe = probe_url(url, timeout=30)
    result = {
        "endpoint": "Overpass Roads Query",
        "bbox": bbox,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "road_count": 0,
        "road_types": {},
        "sample_roads": [],
        "available_attributes": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        elements = data.get("elements", [])
        result["road_count"] = len(elements)

        all_tags = set()
        road_types = {}
        for elem in elements[:max_elements]:
            tags = elem.get("tags", {})
            all_tags.update(tags.keys())

            highway_type = tags.get("highway", "unknown")
            road_types[highway_type] = road_types.get(highway_type, 0) + 1

            if len(result["sample_roads"]) < 10:
                result["sample_roads"].append({
                    "id": elem.get("id"),
                    "type": elem.get("type"),
                    "tags": tags,
                })

        result["road_types"] = road_types
        result["available_attributes"] = sorted(all_tags)
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_overpass_infrastructure(
    bbox: str = "",
    max_elements: int = 50,
) -> dict:
    """
    Query Overpass API for infrastructure near a fire area: bridges,
    trailheads, campgrounds, water sources, and facilities.

    Args:
        bbox: Bounding box as "south,west,north,east" (Overpass format).
            Default uses Cedar Creek Fire area.
        max_elements: Maximum elements to return (default 50).

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - feature_count: Total infrastructure features found
            - feature_types: Breakdown by type (bridge, campground, etc.)
            - sample_features: Sample infrastructure with properties
            - available_attributes: OSM tags present
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    if not bbox:
        bbox = CEDAR_CREEK_BBOX

    query = f"""
[out:json][timeout:25];
(
  node["tourism"~"camp_site|trailhead|information"](({bbox}));
  node["amenity"~"shelter|drinking_water|toilets"](({bbox}));
  way["bridge"="yes"](({bbox}));
  node["highway"="trailhead"](({bbox}));
  way["man_made"="bridge"](({bbox}));
);
out tags {max_elements};
"""
    encoded_query = urllib.parse.urlencode({"data": query.strip()})
    url = f"{OVERPASS_ENDPOINTS['main']}?{encoded_query}"

    probe = probe_url(url, timeout=30)
    result = {
        "endpoint": "Overpass Infrastructure Query",
        "bbox": bbox,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "feature_count": 0,
        "feature_types": {},
        "sample_features": [],
        "available_attributes": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        elements = data.get("elements", [])
        result["feature_count"] = len(elements)

        all_tags = set()
        feature_types = {}
        for elem in elements[:max_elements]:
            tags = elem.get("tags", {})
            all_tags.update(tags.keys())

            # Classify feature type
            ftype = (
                tags.get("tourism")
                or tags.get("amenity")
                or tags.get("highway")
                or ("bridge" if tags.get("bridge") or tags.get("man_made") == "bridge" else "other")
            )
            feature_types[ftype] = feature_types.get(ftype, 0) + 1

            if len(result["sample_features"]) < 10:
                result["sample_features"].append({
                    "id": elem.get("id"),
                    "type": elem.get("type"),
                    "tags": tags,
                    "lat": elem.get("lat"),
                    "lon": elem.get("lon"),
                })

        result["feature_types"] = feature_types
        result["available_attributes"] = sorted(all_tags)
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


# =============================================================================
# AGENT DEFINITION
# =============================================================================

before_cb, after_cb, error_cb = create_audit_callbacks("osm_recon")

OSM_RECON_INSTRUCTION = """
You are the OSM/Overpass Data Reconnaissance Agent, a specialist in
probing OpenStreetMap data via the Overpass API for trail and
infrastructure information.

## Your Mission

Probe Overpass API endpoints to document:
1. Trail data availability (hiking paths, forest trails, trail names)
2. Road network (forest service roads, access routes)
3. Infrastructure features (bridges, trailheads, campgrounds)
4. Data quality and OSM tag coverage for the Cedar Creek area

## Tools Available

- **probe_overpass_status**: Check API server availability and load
- **probe_overpass_trails**: Query hiking trails and paths
- **probe_overpass_roads**: Query roads and access routes
- **probe_overpass_infrastructure**: Query bridges, trailheads, campgrounds

## Key Context

- Cedar Creek Fire bbox (Overpass format): 43.6,-122.3,44.0,-121.7
- Overpass queries use south,west,north,east ordering (not west,south,east,north)
- Rate limit: 2 concurrent requests, be respectful of shared infrastructure
- OSM data is community-contributed - quality varies by region
- Forest Service roads may be tagged as highway=track or highway=service

## Response Protocol

After probing, always report:
1. **API Status**: Server load and availability
2. **Trail Coverage**: Number of named trails, common tags, data quality
3. **Road Network**: Types of roads, forest access routes
4. **Infrastructure**: Bridges, trailheads, campgrounds, water sources
5. **RANGER Integration**: How this feeds the Trail Assessor agent
   - Trail names for damage inventory matching
   - Bridge locations for structural assessment
   - Access routes for BAER team routing
"""

root_agent = Agent(
    name="osm_recon",
    model="gemini-2.0-flash",
    description="OpenStreetMap trail and infrastructure reconnaissance specialist.",
    instruction=OSM_RECON_INSTRUCTION,
    tools=[
        probe_overpass_status,
        probe_overpass_trails,
        probe_overpass_roads,
        probe_overpass_infrastructure,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

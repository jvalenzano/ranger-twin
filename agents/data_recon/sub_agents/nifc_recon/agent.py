"""
NIFC Recon Agent

Specialist reconnaissance agent for probing NIFC Open Data (National
Interagency Fire Center) ArcGIS REST services and Open Data Hub APIs.

Data Source: https://data-nifc.opendata.arcgis.com/
Access: No authentication required
Priority: HIGH - Primary fire perimeter source
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
# NIFC ENDPOINTS
# =============================================================================

NIFC_ENDPOINTS = {
    "current_perimeters": (
        "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
        "WFIGS_Interagency_Perimeters/FeatureServer/0/query"
    ),
    "ytd_perimeters": (
        "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
        "WFIGS_Interagency_Perimeters_YearToDate/FeatureServer/0/query"
    ),
    "historical_perimeters": (
        "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
        "InterAgencyFirePerimeterHistory_All_Years_View/FeatureServer/0/query"
    ),
    "open_data_hub": (
        "https://data-nifc.opendata.arcgis.com/api/v3/datasets"
    ),
    "service_info": (
        "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
        "WFIGS_Interagency_Perimeters/FeatureServer/0"
    ),
}


# =============================================================================
# TOOL FUNCTIONS (ADK-compatible: primitive parameters only)
# =============================================================================


def probe_nifc_current_fires(
    state_filter: str = "",
    max_features: int = 5,
    return_geometry: bool = False,
) -> dict:
    """
    Probe NIFC WFIGS Current Interagency Fire Perimeters endpoint.

    Queries currently active fires from the authoritative WFIGS source.
    Updates every 5-15 minutes. No authentication required.

    Args:
        state_filter: Two-letter state code to filter by (e.g., "CA", "OR").
            Empty string returns all states.
        max_features: Maximum number of features to return (default 5, max 100).
        return_geometry: Whether to include polygon geometry (default False).

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - feature_count: Number of features returned
            - available_fields: List of field names in the response
            - sample_features: Sample feature properties (up to max_features)
            - response_time_ms: Round-trip time in milliseconds
            - data_quality: Assessment of field completeness
            - error: Error message if probe failed
    """
    where_clause = f"POOState='{state_filter}'" if state_filter else "1=1"
    url = (
        f"{NIFC_ENDPOINTS['current_perimeters']}?"
        f"where={where_clause}&"
        f"outFields=*&"
        f"returnGeometry={'true' if return_geometry else 'false'}&"
        f"resultRecordCount={min(max_features, 100)}&"
        f"f=json"
    )

    probe = probe_url(url)
    result = {
        "endpoint": "NIFC WFIGS Current Perimeters",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "feature_count": 0,
        "available_fields": [],
        "sample_features": [],
        "data_quality": {},
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

            # Assess data quality
            non_null = sum(1 for v in attrs.values() if v is not None)
            result["data_quality"] = {
                "total_fields": len(attrs),
                "populated_fields": non_null,
                "completeness_pct": round(non_null / max(len(attrs), 1) * 100, 1),
            }
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_nifc_historical(
    fire_name: str = "Cedar Creek",
    fire_year: int = 2022,
    max_features: int = 5,
) -> dict:
    """
    Probe NIFC Historical Fire Perimeters for a specific fire.

    Queries the InterAgencyFirePerimeterHistory dataset for historical
    fire records by name and year.

    Args:
        fire_name: Fire incident name to search for (default "Cedar Creek").
        fire_year: Year of the fire (default 2022).
        max_features: Maximum features to return (default 5).

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - feature_count: Number of matching features
            - available_fields: List of field names
            - sample_features: Matching fire records
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    where_clause = (
        f"poly_IncidentName LIKE '%{fire_name}%' AND "
        f"irwin_FireDiscoveryDateTime >= '{fire_year}-01-01' AND "
        f"irwin_FireDiscoveryDateTime <= '{fire_year}-12-31'"
    )
    url = (
        f"{NIFC_ENDPOINTS['historical_perimeters']}?"
        f"where={where_clause}&"
        f"outFields=*&"
        f"returnGeometry=false&"
        f"resultRecordCount={min(max_features, 100)}&"
        f"f=json"
    )

    probe = probe_url(url)
    result = {
        "endpoint": "NIFC Historical Fire Perimeters",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
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
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_nifc_service_metadata() -> dict:
    """
    Probe NIFC Feature Service metadata to discover layer info, field
    definitions, and service capabilities.

    No parameters required. Returns the service definition including
    field names, types, aliases, and supported query operations.

    Returns:
        Dictionary containing:
            - service_name: Name of the feature service
            - description: Service description
            - fields: List of field definitions (name, type, alias)
            - supported_operations: Available query capabilities
            - max_record_count: Maximum features per query
            - geometry_type: Type of geometry (point, polygon, etc.)
            - spatial_reference: Coordinate system info
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = f"{NIFC_ENDPOINTS['service_info']}?f=json"
    probe = probe_url(url)

    result = {
        "endpoint": "NIFC Feature Service Metadata",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "service_name": "",
        "description": "",
        "fields": [],
        "supported_operations": [],
        "max_record_count": 0,
        "geometry_type": "",
        "spatial_reference": {},
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        result["service_name"] = data.get("name", "")
        result["description"] = data.get("description", "")[:500]
        result["max_record_count"] = data.get("maxRecordCount", 0)
        result["geometry_type"] = data.get("geometryType", "")
        result["spatial_reference"] = data.get("extent", {}).get(
            "spatialReference", {}
        )

        fields = data.get("fields", [])
        result["fields"] = [
            {
                "name": f.get("name"),
                "type": f.get("type"),
                "alias": f.get("alias", ""),
            }
            for f in fields[:50]
        ]
        if len(fields) > 50:
            result["total_field_count"] = len(fields)
            result["fields_truncated"] = True

        caps = data.get("advancedQueryCapabilities", {})
        if caps:
            result["supported_operations"] = [
                k for k, v in caps.items() if v is True
            ]
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


def probe_nifc_open_data_hub(search_term: str = "fire perimeter") -> dict:
    """
    Probe the NIFC Open Data Hub API to discover available datasets.

    Searches the ArcGIS Hub catalog for datasets matching the search term.

    Args:
        search_term: Search query for the data catalog (default "fire perimeter").

    Returns:
        Dictionary containing:
            - endpoint: The URL queried
            - status_code: HTTP response code
            - dataset_count: Number of datasets found
            - datasets: List of dataset summaries (name, id, type, modified date)
            - response_time_ms: Round-trip time
            - error: Error message if probe failed
    """
    url = (
        f"{NIFC_ENDPOINTS['open_data_hub']}"
        f"?filter[keyword]={search_term.replace(' ', '+')}"
        f"&page[size]=10"
    )

    probe = probe_url(url)
    result = {
        "endpoint": "NIFC Open Data Hub Catalog",
        "url": url,
        "status_code": probe["status_code"],
        "response_time_ms": probe["response_time_ms"],
        "error": probe["error"],
        "dataset_count": 0,
        "datasets": [],
    }

    if probe["error"]:
        return result

    try:
        data = json.loads(probe["body_preview"])
        items = data.get("data", [])
        result["dataset_count"] = len(items)

        for item in items[:10]:
            attrs = item.get("attributes", {})
            result["datasets"].append({
                "id": item.get("id", ""),
                "name": attrs.get("name", ""),
                "type": attrs.get("type", ""),
                "modified": attrs.get("modified", ""),
                "source": attrs.get("source", ""),
            })
    except (json.JSONDecodeError, KeyError) as e:
        result["error"] = f"Parse error: {str(e)}"

    return result


# =============================================================================
# AGENT DEFINITION
# =============================================================================

before_cb, after_cb, error_cb = create_audit_callbacks("nifc_recon")

NIFC_RECON_INSTRUCTION = """
You are the NIFC Data Reconnaissance Agent, a specialist in probing and
analyzing the National Interagency Fire Center (NIFC) Open Data services.

## Your Mission

Probe NIFC ArcGIS REST endpoints and Open Data Hub to document:
1. What data is available (datasets, layers, fields)
2. How to access it (endpoints, query patterns, formats)
3. Data quality (field completeness, update frequency, coverage)
4. Integration potential for RANGER (field mapping, refresh strategy)

## Tools Available

- **probe_nifc_current_fires**: Query active fire perimeters (WFIGS)
- **probe_nifc_historical**: Search historical fire records by name/year
- **probe_nifc_service_metadata**: Get field definitions and service capabilities
- **probe_nifc_open_data_hub**: Search the data catalog for datasets

## Response Protocol

After probing, always report:
1. **Endpoint Status**: Working / Degraded / Down
2. **Data Available**: What fields and features returned
3. **Field Mapping**: Which fields map to RANGER's data model
4. **Access Pattern**: How to query (no auth needed)
5. **Recommendations**: Integration priority and approach

Focus on fields relevant to RANGER: fire name, acreage, containment,
cause, coordinates, severity, and perimeter geometry.
"""

root_agent = Agent(
    name="nifc_recon",
    model="gemini-2.0-flash",
    description="NIFC Open Data reconnaissance specialist for RANGER.",
    instruction=NIFC_RECON_INSTRUCTION,
    tools=[
        probe_nifc_current_fires,
        probe_nifc_historical,
        probe_nifc_service_metadata,
        probe_nifc_open_data_hub,
    ],
    generate_content_config=GENERATE_CONTENT_CONFIG,
    before_tool_callback=before_cb,
    after_tool_callback=after_cb,
    on_tool_error_callback=error_cb,
)

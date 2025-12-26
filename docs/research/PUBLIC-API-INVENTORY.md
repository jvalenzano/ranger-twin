# Public Wildfire API Inventory

**Last Updated:** December 21, 2025
**Purpose:** Document publicly accessible wildfire/USFS data APIs for RANGER integration

## Executive Summary

This inventory documents 5 major wildfire data sources and their API accessibility. **NASA FIRMS** and **NIFC Open Data** offer the most robust public API access without authentication, while **IRWIN** requires credentials and **InciWeb** lacks a formal REST API.

### Quick Reference Table

| API Source | Public Access | Authentication | Real-time Data | Best For | Priority |
|------------|---------------|----------------|----------------|----------|----------|
| **NIFC Open Data** | ✅ Full | None | Yes (5-15 min) | Fire perimeters, boundaries | **HIGH** |
| **NASA FIRMS** | ✅ Full | Free API key | Yes (3 hrs) | Active fire detection | **HIGH** |
| **MTBS** | ✅ Partial | None | No (annual) | Historical burn severity | **MEDIUM** |
| **InciWeb** | ⚠️ RSS only | None | Yes (manual) | Incident narratives | **LOW** |
| **IRWIN** | ❌ Limited | Required | Yes | Internal integration only | **LOW** |

---

## 1. NIFC Open Data (National Interagency Fire Center)

**Status:** ✅ **FULLY ACCESSIBLE** - No authentication required
**Official Portal:** https://data-nifc.opendata.arcgis.com/
**Data Owner:** National Interagency Fire Center (multi-agency partnership)

### Overview

NIFC provides authoritative wildfire perimeters, fire locations, and boundaries through ArcGIS Hub. This replaced GeoMAC (shut down April 30, 2020) as the primary public source for wildfire geospatial data.

### Key Datasets

#### Current Fires
- **WFIGS Current Interagency Fire Perimeters**
  - Updates: Every 5-15 minutes
  - Includes: Active fires meeting WFIGS criteria (WF/RX/CX)

#### Year-to-Date Fires
- **WFIGS 2025 Interagency Fire Perimeters to Date**
  - All reported wildland fires in 2025
  - No "fall-off" rules (comprehensive)
  - Dataset ID: `f72ebe741e3b4f0db376b4e765728339_0`

#### Historical Data
- **InterAgencyFirePerimeterHistory All Years View**
  - Historical fire perimeters
  - Searchable by year, state, incident name

### API Access Methods

#### 1. Open Data Download API (Recommended)

**GeoJSON Download:**
```
https://data-nifc.opendata.arcgis.com/api/v3/datasets/{DATASET_ID}/downloads/data?format=geojson&spatialRefId=4326
```

**CSV Download:**
```
https://data-nifc.opendata.arcgis.com/api/v3/datasets/{DATASET_ID}/downloads/data?format=csv
```

**Formats Available:** GeoJSON, CSV, KML, Shapefile, GeoTIFF, PNG

**Tested Example (2025 Perimeters):**
```bash
curl "https://data-nifc.opendata.arcgis.com/api/v3/datasets/f72ebe741e3b4f0db376b4e765728339_0/downloads/data?format=geojson&spatialRefId=4326"
```

**Response Structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "poly_IncidentName": "Morrow Rd",
        "poly_GISAcres": 58.9,
        "poly_DateCurrent": "2024-01-12T19:13:21Z",
        "attr_FireCause": "Human",
        "attr_IncidentSize": 59.0,
        "attr_PercentContained": 100,
        // ... 150+ fields
      },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```

#### 2. ArcGIS REST API (Direct Feature Service)

**Base Endpoint:**
```
https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/{SERVICE_NAME}/FeatureServer/0
```

**Query Parameters:**
- `where`: SQL WHERE clause (e.g., `1=1` for all, `IncidentName='Cedar'`)
- `outFields`: Comma-separated field list or `*` for all
- `returnGeometry`: `true` or `false`
- `f`: Output format (`json`, `geojson`, `pjson`)
- `resultRecordCount`: Limit results (default 1000 max)

**Example Query:**
```
https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_YearToDate/FeatureServer/0/query?where=POOState='CA'&outFields=IncidentName,GISAcres&f=geojson
```

**Note:** Some endpoints require token authentication. Use Open Data API for public access.

#### 3. WMS/WFS Services

**Map Services:**
```
https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/MapServer
```

### Key Attributes

**Geometry Fields:**
- `poly_GISAcres`: GIS-calculated acreage
- `poly_PolygonDateTime`: Perimeter capture timestamp
- `poly_MapMethod`: Mapping method (GPS, IR, etc.)

**Incident Fields:**
- `attr_IncidentName`: Fire name
- `attr_FireCause`: Human, Natural, Undetermined
- `attr_PercentContained`: 0-100
- `attr_IncidentSize`: Reported size
- `attr_DiscoveryAcres`: Initial size
- `attr_EstimatedCostToDate`: Cost ($)

**Administrative:**
- `POOState`: State code
- `POOCounty`: County name
- `POODispatchCenterID`: Dispatch center
- `DispatchCenterID`: NCNCC, etc.

### Data Categories

1. **2025 Wildland Fires** - Current year incidents
2. **Historical Wildland Fires** - Pre-2025 data
3. **Weather** - RAWS stations
4. **Boundaries** - GACC, dispatch zones
5. **Fire Progression** - Daily perimeter updates

### Sources & Documentation

- [NIFC Open Data Portal](https://data-nifc.opendata.arcgis.com/)
- [WFIGS Current Perimeters](https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-current-wildland-fire-perimeters/about)
- [WFIGS 2025 Perimeters](https://wildfire-risk-assessments-nifc.hub.arcgis.com/datasets/nifc::wfigs-2025-interagency-fire-perimeters-to-date/explore)
- [ArcGIS REST API Reference](https://developers.arcgis.com/rest/services-reference/query-feature-service-layer-.htm)

---

## 2. NASA FIRMS (Fire Information for Resource Management System)

**Status:** ✅ **FULLY ACCESSIBLE** - Free API key required
**Official Portal:** https://firms.modaps.eosdis.nasa.gov/
**Data Owner:** NASA LANCE (Land, Atmosphere Near real-time Capability for EOS)

### Overview

FIRMS provides near real-time active fire detection from MODIS and VIIRS satellite sensors. Data is available within 3 hours of satellite observation (some US/Canada data in real-time < 1 minute).

### Data Sources

**Satellites:**
- **MODIS:** Terra & Aqua (375m & 1km resolution)
- **VIIRS:** SNPP, NOAA-20, NOAA-21 (375m resolution)
- **Landsat:** US/Canada only (30m resolution, near real-time)

**Data Types:**
- NRT (Near Real-Time): 3-hour latency
- SP (Standard Processing): Refined data, higher quality

### API Access

#### Getting Started

**1. Request Free MAP_KEY:**
```
https://firms.modaps.eosdis.nasa.gov/api/map_key/
```

- Enter your email
- Key sent instantly (32 alphanumeric characters)
- Valid indefinitely
- **Rate Limit:** 5000 transactions per 10-minute window

#### 2. Available Endpoints

| Endpoint | Description | URL Pattern |
|----------|-------------|-------------|
| **area** | Fire hotspots by bounding box | `/api/area/csv/[MAP_KEY]/[SOURCE]/[AREA]/[DAYS]` |
| **country** | Hotspots by country code | `/api/country/csv/[MAP_KEY]/[SOURCE]/[COUNTRY]/[DAYS]` |
| **data_availability** | Date ranges available | `/api/data_availability/csv/[MAP_KEY]/all` |
| **kml_fire_footprints** | KML fire polygons | `/api/kml_fire_footprints/[MAP_KEY]/[SOURCE]/[AREA]/[DAYS]` |

**Note:** `country` endpoint currently unavailable (as of Dec 2025).

#### 3. Area API (Primary Endpoint)

**URL Format:**
```
https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/[SOURCE]/[AREA]/[DAYS]/[DATE]
```

**Parameters:**

- **MAP_KEY:** Your API key
- **SOURCE:** Satellite sensor
  - `VIIRS_SNPP_NRT` (Suomi NPP)
  - `VIIRS_NOAA20_NRT` (NOAA-20)
  - `VIIRS_NOAA21_NRT` (NOAA-21)
  - `MODIS_NRT` (Terra + Aqua)
  - `LANDSAT_NRT` (US/Canada only)
- **AREA:** Bounding box `west,south,east,north` or `world`
  - Example: `-124,32,-114,42` (California)
  - World: `-180,-90,180,90`
- **DAYS:** 1-10 days
- **DATE:** Optional `YYYY-MM-DD` (omit for most recent)

**Example - California fires, last 7 days:**
```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_MAP_KEY/VIIRS_SNPP_NRT/-124,32,-114,42/7"
```

**CSV Response Format:**
```csv
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
38.5,-120.3,330.2,0.4,0.4,2025-12-21,0345,N,h,2.0NRT,295.1,12.5,N
```

**Key Fields:**
- `latitude`, `longitude`: WGS84 coordinates
- `brightness`: Kelvin (channel I-4)
- `confidence`: `l` (low), `n` (nominal), `h` (high)
- `frp`: Fire Radiative Power (MW)
- `acq_date`, `acq_time`: Detection time (UTC)

#### 4. Data Availability API

**Check date ranges:**
```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/data_availability/csv/YOUR_MAP_KEY/all"
```

**Response:**
```csv
source,start_date,end_date
VIIRS_SNPP_NRT,2012-01-20,2025-12-21
MODIS_NRT,2000-11-01,2025-12-21
```

### Map Visualization

- **Global Map:** https://firms.modaps.eosdis.nasa.gov/map/
- **US/Canada Map:** https://firms.modaps.eosdis.nasa.gov/usfs/map/
- Updates every 5 minutes
- Historical playback available

### Data Download (Archive)

**Direct Download:** https://firms.modaps.eosdis.nasa.gov/download/

- Requires NASA Earthdata Login
- Bulk downloads available
- Historical data since 2000 (MODIS) / 2012 (VIIRS)

### Update Frequency

- **Fire Maps:** Every 5 minutes
- **SHP/KML/CSV files:** Every 60 minutes (24h, 48h, 7-day)
- **Text files:** Near real-time
- **Global data:** 3-hour latency
- **US/Canada:** < 1 minute (real-time VIIRS)

### Use Cases for RANGER

1. **Active Fire Detection:** Overlay hotspots on incident areas
2. **Pre-Fire Analysis:** Historical fire activity in region
3. **Fire Spread Monitoring:** Track active fire perimeter expansion
4. **Smoke/Air Quality:** High FRP values indicate smoke production

### Sources & Documentation

- [FIRMS API Documentation](https://firms.modaps.eosdis.nasa.gov/api/)
- [API Usage Tutorial](https://firms.modaps.eosdis.nasa.gov/content/academy/data_api/firms_api_use.html)
- [FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)
- [NASA Earthdata](https://www.earthdata.nasa.gov/data/tools/firms)

---

## 3. MTBS (Monitoring Trends in Burn Severity)

**Status:** ⚠️ **PARTIALLY ACCESSIBLE** - Public data, no API authentication
**Official Portal:** https://www.mtbs.gov/
**Data Owner:** USGS & USDA Forest Service

### Overview

MTBS provides consistent burn severity mapping for large fires (>1000 acres West, >500 acres East) from 1984-2024 using Landsat imagery. **Not real-time** - data released annually with 1-2 year lag.

### Latest Version

**Version 12.0** (April 2025)
- Coverage: 1984-2024
- CONUS, Alaska, Hawaii, Puerto Rico
- Fire size thresholds enforced
- Landsat-based (30m resolution)

### Data Access Methods

#### 1. Direct Download (Shapefiles)

**National Datasets:**

**Fire Occurrence Points (1984-2024):**
```
https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/data/composite_data/fod_pt_shapefile/mtbs_fod_pts_data.zip
```

**Burned Area Boundaries (1984-2024):**
```
https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/data/composite_data/burned_area_extent_shapefile/mtbs_perimeter_data.zip
```

**State/Regional Downloads:**
- Filter by state and year range
- Individual fire bundles available
- Annual burn severity mosaics (GeoTIFF)

**Portal:** https://www.mtbs.gov/direct-download

#### 2. WMS Services (Map Visualization)

**MTBS provides OGC-compliant WMS for visualization:**

**Fire Boundaries & Points:**
```
WMS: https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MTBS_01/MapServer/WMSServer/
GetCapabilities: https://apps.fs.usda.gov/arcx/services/EDW/EDW_MTBS_01/MapServer/WMSServer?request=GetCapabilities&service=WMS
KML: https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_MTBS_01/MapServer/generateKML
```

**Burn Severity Mosaics:**

**CONUS:**
```
WMS: https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/MTBS_CONUS/MapServer/WMSServer/
GetCapabilities: https://apps.fs.usda.gov/arcx/services/RDW_Wildfire/MTBS_CONUS/MapServer/WMSServer?request=GetCapabilities&service=WMS
```

**Alaska:**
```
WMS: https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/MTBS_Alaska/MapServer/WMSServer/
```

**Hawaii:**
```
WMS: https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/MTBS_Hawaii/MapServer/WMSServer/
```

**Puerto Rico:**
```
WMS: https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/MTBS_PuertoRico/MapServer/WMSServer/
```

**Note:** WMS tested but returned invalid URL errors. May require specific projection/layer parameters.

#### 3. Google Earth Engine

**MTBS Data Explorer:**
```
https://apps.fs.usda.gov/lcms-viewer/mtbs.html
```

**Features:**
- Dynamic burn severity visualization
- Chart generation
- Trend analysis
- Tabular summaries

**GEE Assets:**
- Burned area boundaries
- Annual burn severity mosaics
- ~2 week lag after MTBS data release

**Earth Engine Catalog:**
- `USFS/GTAC/MTBS/burned_area_boundaries/v1`
- `USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1`

#### 4. Data.gov & ScienceBase

**Data.gov Catalog:**
```
https://catalog.data.gov/dataset/monitoring-trends-in-burn-severity-ver-12-0-april-2025
```

**USGS ScienceBase:**
```
https://www.sciencebase.gov/catalog/item/5e91dee782ce172707f02cdd
```

### Data Products

**Per-Fire Datasets:**
1. Burn severity GeoTIFF (6 classes)
2. dNBR (differenced Normalized Burn Ratio)
3. RdNBR (Relativized dNBR)
4. Fire perimeter shapefile
5. Metadata (PDF/XML)

**Burn Severity Classes:**
- Unburned to Low
- Low
- Moderate
- High
- Increased Greenness
- Non-Processing Area Mask

**National Mosaics:**
- Annual state-level burn severity
- CONUS-wide composites
- Multi-temporal analysis products

### Licensing

**Creative Commons Zero v1.0 Universal** - Fully public domain

### Use Cases for RANGER

1. **Historical Burn Severity:** Cedar Creek fire context
2. **Re-burn Risk Analysis:** Areas burned in past 10 years
3. **Vegetation Recovery Modeling:** Post-fire trajectories
4. **NEPA Baseline:** Historical fire regime documentation

### Limitations

- **Not real-time:** 1-2 year data lag
- **Size threshold:** Misses smaller fires
- **Annual updates:** No intra-season data
- **WMS issues:** May require ESRI clients

### Sources & Documentation

- [MTBS Home](https://www.mtbs.gov/)
- [Direct Download](https://www.mtbs.gov/direct-download)
- [USGS Data Release](https://www.usgs.gov/data/monitoring-trends-burn-severity-ver-120-april-2025)
- [FAQ](https://mtbs.gov/faqs)

---

## 4. InciWeb (Incident Information System)

**Status:** ⚠️ **LIMITED ACCESS** - RSS feeds only, no REST API
**Official Portal:** https://inciweb.wildfire.gov/
**Data Owner:** USDA Forest Service (interagency system)

### Overview

InciWeb is the official incident information system for narrative updates, photos, and maps. Developed in 2004 for wildfires, now used for all-hazard incidents. **No formal REST API exists.**

### Available Data Sources

#### 1. RSS Feeds

**Main Feeds Page:**
```
https://inciweb.wildfire.gov/feeds
```

**RSS Help:**
```
https://inciweb.wildfire.gov/feeds/rss
```

**Feed Types:**
- Incident summary information
- News and announcements
- Per-incident feeds (custom URLs)

**How to Access:**
1. Navigate to incident page
2. Click RSS subscription link
3. Copy URL from browser address bar
4. Add to RSS reader

**Tested Feed URL:**
```
https://inciweb.wildfire.gov/feeds/rss/incidents/
```
**Result:** 404 error - feed structure may have changed.

#### 2. Manual Data Extraction

**Third-Party Tools:**

**GitHub: palewire/inciweb-wildfires**
```
https://github.com/palewire/inciweb-wildfires
```
- Python CLI for scraping InciWeb
- Outputs GeoJSON from RSS feeds
- Not officially supported

**GitHub: datadesk/inciweb-wildfires**
```
https://github.com/datadesk/inciweb-wildfires
```
- Downloads wildfire incident data
- Parses RSS to structured format

**Approach:** Screen scraping + RSS parsing (fragile)

### Data Content

**Incident Updates:**
- Situation summaries
- Evacuation notices
- Road closures
- Containment progress
- Personnel/resource counts

**Media:**
- Photos (manual upload by PIOs)
- Maps (PDFs, static images)
- Press releases

**Update Frequency:** Manual (variable by incident)

### Limitations

- **No REST API:** Must parse HTML/RSS
- **Unstructured data:** Free-text narratives
- **Manual updates:** Delayed, inconsistent
- **No GeoJSON:** Coordinate extraction required
- **RSS feeds fragile:** URLs change, no documentation

### Historical Context

InciWeb was a data source for the now-defunct **GeoMAC** system. Third-party developers created GeoJSON points from RSS feeds and combined with GeoMAC perimeters for visualizations (see [Mapbox blog](https://www.mapbox.com/blog/mapping-u-s-wildfire-data-from-public-feeds)).

### Use Cases for RANGER

1. **Incident Narratives:** Human-readable summaries for briefings
2. **Media Assets:** Photos for context/documentation
3. **Public Information:** Evacuation/closure data

**Recommendation:** Use NIFC for structured geospatial data; InciWeb for narrative context only.

### Sources & Documentation

- [InciWeb Home](https://inciweb.wildfire.gov/)
- [RSS Feeds](https://inciweb.wildfire.gov/feeds)
- [NIFC InciWeb Info](https://www.nifc.gov/fire-information/pio-bulletin-board/inciweb)
- [Wikipedia: InciWeb](https://en.wikipedia.org/wiki/InciWeb)

---

## 5. IRWIN (Integrated Reporting of Wildland Fire Information)

**Status:** ❌ **RESTRICTED ACCESS** - Authentication & authorization required
**Official Portal:** https://www.wildfire.gov/application/irwin-integrated-reporting-wildfire-information
**Data Owner:** Wildland Fire Information & Technology (WFIT)

### Overview

IRWIN is the **authoritative incident reporting system** used internally by wildland fire agencies. It provides incident creation, resource tracking, and data exchange between systems (WFDSS, ROSS, etc.). **Not designed for public API access.**

### API Versions

- **Current:** v11 (as of March 2025)
- **Previous:** v10 (Sept 2024), v9 (May 2024), v8 (Sept 2023)

### Authentication

**Token-based authentication:**

1. Acquire token via `GenerateToken` operation
2. Use `referer` client parameter (recommended)
3. Include token in all subsequent API calls
4. **Token lifetime:** Max 60 minutes
5. **Best practice:** Request once per hour (max 2x/hour)

**Authorization Roles:**
- Initial Attack Dispatch
- Resource Management
- Read-only access
- Others defined during system discovery

### Access Requirements

**GeoPlatform Account Required:**
```
https://geoplatform.maps.arcgis.com/
```

**Steps:**
1. Sign in with username/password + MFA
2. Join ArcGIS Online Group (agency-specific)
3. Request IRWIN access from project manager
4. Credentials tied to agency affiliation

### Available APIs

**Integration Specifications (PDF):**

- **Resources API v10** (Sept 2024):
  ```
  https://wildfireweb-prod-media-bucket.s3.us-gov-west-1.amazonaws.com/s3fs-public/2024-09/IRWIN Integration Specification Resources API v10.pdf
  ```

- **Frequencies API v8** (Sept 2023):
  ```
  https://wildfireweb-prod-media-bucket.s3.us-gov-west-1.amazonaws.com/s3fs-public/2023-09/IRWIN Integration Specification Frequencies API v8.pdf
  ```

**API Capabilities:**
- Create/update incidents
- Resource capability tracking
- Capability requests
- Resource status updates
- Incident data queries

### IRWIN Observer Tool

**Purpose:** Discover incidents, resources, and data exchange transactions

**Access:** GeoPlatform account required
**Environments:** Production, Test, Development
**API versions:** Root and Next (v11)

### Public Data Alternative

**NIFC Open Data Site:**
```
https://data-nifc.opendata.arcgis.com/
```

IRWIN data is **published to NIFC** after internal processing. Access public incident data through NIFC instead of IRWIN directly.

### Data Services Guide

**IRWIN Data Service Users Guide** (Feb 2024):
```
https://wildfireweb-prod-media-bucket.s3.us-gov-west-1.amazonaws.com/s3fs-public/2024-02/IRWINDataServiceUsersGuide_20240201.pdf
```

**Access Method:**
1. ArcGIS Online Group membership
2. Navigate to GeoPlatform
3. Query REST endpoint with ArcGIS-generated token

### Use Cases (If Credentials Available)

1. **Internal Agency Integration:** Connect RANGER to IRWIN for incident creation
2. **Resource Tracking:** Real-time personnel/equipment status
3. **Data Exchange:** Bi-directional sync with WFDSS, ROSS
4. **Authoritative IDs:** IRWIN ID as primary key

### Limitations for RANGER

- **Authentication barrier:** Requires agency credentials
- **Not public:** Cannot distribute RANGER with IRWIN access
- **Alternative exists:** NIFC provides public subset
- **Overhead:** Token management, role configuration

**Recommendation:** **Do not prioritize IRWIN integration.** Use NIFC Open Data for public wildfire data. Reserve IRWIN for future agency partnerships if RANGER is adopted by USFS/DOI.

### Sources & Documentation

- [IRWIN Portal](https://www.wildfire.gov/application/irwin-integrated-reporting-wildfire-information)
- [Data Management](https://www.wildfire.gov/data-management)
- [WFDSS IRWIN Data Exchange](https://wfdss.usgs.gov/wfdss_help/WFDSSHelp_abt_IRWIN_data_exchange.html)
- [Integration Specs](https://www.wildfire.gov/application/irwin-integrated-reporting-wildfire-information) (PDF links)

---

## Integration Recommendations

### Priority 1: NIFC Open Data (Immediate Integration)

**Why:**
- ✅ No authentication required
- ✅ Real-time data (5-15 min updates)
- ✅ GeoJSON/CSV download APIs
- ✅ Rich attribute data (150+ fields)
- ✅ Official WFIGS source

**Implementation:**
1. Create `packages/twin-core/src/clients/nifc_client.py`
2. Fetch GeoJSON from Open Data download API
3. Parse fire perimeters into RANGER data model
4. Store in `data/layers/` as fixtures (Phase 1)
5. Build live ingestion pipeline (Phase 2)

**Sample Code:**
```python
import requests

NIFC_2025_PERIMETERS = "https://data-nifc.opendata.arcgis.com/api/v3/datasets/f72ebe741e3b4f0db376b4e765728339_0/downloads/data?format=geojson&spatialRefId=4326"

def fetch_nifc_perimeters():
    response = requests.get(NIFC_2025_PERIMETERS)
    response.raise_for_status()
    return response.json()

geojson = fetch_nifc_perimeters()
print(f"Fetched {len(geojson['features'])} fire perimeters")
```

### Priority 2: NASA FIRMS (High Value)

**Why:**
- ✅ Active fire detection (real-time)
- ✅ Free API key (instant)
- ✅ CSV/GeoJSON formats
- ✅ Historical data available

**Implementation:**
1. User requests MAP_KEY at signup
2. Store in `.env` as `FIRMS_API_KEY`
3. Fetch hotspots for incident bounding box
4. Overlay on map as active fire layer
5. Use for fire spread analysis

**Sample Code:**
```python
import os
import requests

FIRMS_API = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

def fetch_firms_hotspots(bbox, days=7):
    """
    bbox: (west, south, east, north) in WGS84
    """
    map_key = os.getenv("FIRMS_API_KEY")
    area = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    url = f"{FIRMS_API}/{map_key}/VIIRS_SNPP_NRT/{area}/{days}"

    response = requests.get(url)
    response.raise_for_status()
    return response.text  # CSV data

csv_data = fetch_firms_hotspots((-120, 38, -119, 39))
# Parse CSV and convert to GeoJSON points
```

### Priority 3: MTBS (Historical Context)

**Why:**
- ✅ Burn severity baseline
- ✅ Free shapefiles (no auth)
- ✅ Google Earth Engine integration
- ⚠️ Not real-time (annual updates)

**Implementation:**
1. Download national shapefiles (one-time)
2. Filter by region (e.g., California)
3. Store in `data/layers/mtbs_burn_severity.geojson`
4. Use for historical fire analysis in NEPA briefings
5. Show "fires in this area since 1984"

**Sample Code:**
```python
import geopandas as gpd

MTBS_BOUNDARIES = "https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/data/composite_data/burned_area_extent_shapefile/mtbs_perimeter_data.zip"

def download_mtbs_data(output_path):
    gdf = gpd.read_file(MTBS_BOUNDARIES)
    gdf.to_file(output_path, driver="GeoJSON")
    print(f"Downloaded {len(gdf)} MTBS fire perimeters")

download_mtbs_data("data/layers/mtbs_historical.geojson")
```

### Priority 4: InciWeb (Low Priority)

**Why:**
- ⚠️ No REST API
- ⚠️ Manual RSS scraping
- ⚠️ Unstructured narratives
- ✅ Useful for public info context

**Implementation:**
- **Do not build automated ingestion**
- Use manually for incident research
- Copy/paste situation summaries into agent context
- Link to InciWeb pages in UI (external reference)

### Priority 5: IRWIN (Future Partnership Only)

**Why:**
- ❌ Requires agency credentials
- ❌ Not public-facing
- ✅ Authoritative incident IDs
- ✅ Resource tracking

**Implementation:**
- Skip for Phase 1
- Revisit if RANGER adopted by USFS/DOI
- Use NIFC as IRWIN's public data outlet

---

## Technical Implementation Notes

### Data Refresh Strategy

**Real-time Sources (NIFC, FIRMS):**
- Poll every 15 minutes in production
- Cache responses (5 min TTL)
- Use ETags/Last-Modified headers
- Implement exponential backoff on errors

**Static Sources (MTBS):**
- Check for updates monthly
- Download full dataset on release
- Version control in Git LFS (`docs/data/`)

### Error Handling

**Rate Limiting:**
- FIRMS: 5000 requests / 10 min
- NIFC: No documented limit (use 1 req/min max)

**Retry Logic:**
```python
import time
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def create_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    return session
```

### GeoJSON Processing

**Simplification (for web display):**
```python
import geopandas as gpd
from shapely.geometry import shape

def simplify_geometry(geojson, tolerance=0.001):
    """Reduce coordinate count for large perimeters"""
    gdf = gpd.GeoDataFrame.from_features(geojson["features"])
    gdf["geometry"] = gdf["geometry"].simplify(tolerance)
    return gdf.__geo_interface__
```

**Attribute Mapping:**
```python
# Map NIFC fields to RANGER schema
NIFC_FIELD_MAP = {
    "poly_IncidentName": "fire_name",
    "poly_GISAcres": "acres",
    "attr_FireCause": "cause",
    "attr_PercentContained": "containment",
    "poly_DateCurrent": "last_update"
}
```

### Storage Architecture

**Phase 1 (Simulated):**
```
data/
  fixtures/
    nifc_cedar_creek.json          # Static snapshot
    firms_hotspots_2024.csv        # Historical detections
  layers/
    mtbs_burn_severity.geojson     # Historical perimeters
```

**Phase 2 (Live):**
```
services/
  data-ingest/
    clients/
      nifc_client.py               # NIFC API wrapper
      firms_client.py              # FIRMS API wrapper
    tasks/
      poll_nifc.py                 # Celery task (15 min)
      poll_firms.py                # Celery task (15 min)
    storage/
      timescale_db.py              # Time-series fire data
```

### Security & Credentials

**Environment Variables:**
```bash
# .env
FIRMS_API_KEY=YOUR_32_CHAR_KEY_HERE
NIFC_CACHE_TTL=300  # seconds
DATA_REFRESH_INTERVAL=900  # 15 minutes
```

**Never commit:**
- API keys
- Downloaded shapefiles (use Git LFS)
- Large GeoJSON files (>10MB)

---

## Appendix: Tested API Calls

### NIFC Open Data (Successful)

**GeoJSON Download:**
```bash
curl -o nifc_2025.geojson "https://data-nifc.opendata.arcgis.com/api/v3/datasets/f72ebe741e3b4f0db376b4e765728339_0/downloads/data?format=geojson&spatialRefId=4326"
```

**Result:** ✅ 23,651 features (Dec 2025)

**Sample Feature:**
```json
{
  "type": "Feature",
  "properties": {
    "poly_IncidentName": "Palisades",
    "poly_GISAcres": 23448,
    "attr_PercentContained": 100,
    "attr_EstimatedCostToDate": 208900000,
    "attr_FireCause": "Human",
    "POOState": "CA"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[-118.5, 34.1], ...]]
  }
}
```

### NASA FIRMS (Not Tested - Requires API Key)

**Get MAP_KEY:**
```
https://firms.modaps.eosdis.nasa.gov/api/map_key/
```

**Example Query (with key):**
```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_KEY/VIIRS_SNPP_NRT/-120,38,-119,39/7"
```

**Expected CSV:**
```
latitude,longitude,brightness,confidence,acq_date,acq_time,frp
38.5,-120.3,330.2,h,2025-12-21,0345,12.5
```

### MTBS (Successful)

**Shapefile Download:**
```bash
curl -o mtbs_boundaries.zip "https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/data/composite_data/burned_area_extent_shapefile/mtbs_perimeter_data.zip"
```

**Result:** ✅ 35MB ZIP file (1984-2024 fires)

### InciWeb (Failed)

**RSS Feed Test:**
```bash
curl "https://inciweb.wildfire.gov/feeds/rss/incidents/"
```

**Result:** ❌ 404 Not Found

### IRWIN (Not Tested - Requires Auth)

**Access Denied (as expected):**
```bash
curl "https://geoplatform.maps.arcgis.com/sharing/rest/info"
```

**Result:** Requires login

---

## Change Log

- **Dec 21, 2025:** Initial inventory created
  - Tested NIFC Open Data API (successful)
  - Tested MTBS downloads (successful)
  - Documented FIRMS API structure
  - Confirmed IRWIN access restrictions
  - Noted InciWeb RSS feed issues

---

## References

### NIFC
- [NIFC Open Data Portal](https://data-nifc.opendata.arcgis.com/)
- [WFIGS Current Perimeters](https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-current-wildland-fire-perimeters/about)
- [WFIGS 2025 Perimeters](https://wildfire-risk-assessments-nifc.hub.arcgis.com/datasets/nifc::wfigs-2025-interagency-fire-perimeters-to-date/explore)
- [Unlocking NIFC's ArcGIS Organization](https://www.esri.com/en-us/industries/blog/articles/unlocking-the-nifc-arcgis-online-organization-data-and-tools-for-every-wildland-firefighter)
- [USGS: Where to Find Wildfire Perimeter Data](https://www.usgs.gov/faqs/where-can-i-find-wildfire-perimeter-data)

### NASA FIRMS
- [FIRMS API Home](https://firms.modaps.eosdis.nasa.gov/api/)
- [API Map Key Request](https://firms.modaps.eosdis.nasa.gov/api/map_key/)
- [API Area Endpoint](https://firms.modaps.eosdis.nasa.gov/api/area/)
- [FIRMS FAQ](https://www.earthdata.nasa.gov/data/tools/firms/faq)
- [NASA Earthdata](https://www.earthdata.nasa.gov/data/tools/firms)

### MTBS
- [MTBS Home](https://www.mtbs.gov/)
- [Direct Download](https://www.mtbs.gov/direct-download)
- [USGS Data Release v12.0](https://www.usgs.gov/data/monitoring-trends-burn-severity-ver-120-april-2025)
- [Data.gov MTBS Catalog](https://catalog.data.gov/dataset/monitoring-trends-in-burn-severity-ver-12-0-april-2025)
- [ScienceBase Repository](https://www.sciencebase.gov/catalog/item/5e91dee782ce172707f02cdd)

### InciWeb
- [InciWeb Home](https://inciweb.wildfire.gov/)
- [RSS Feeds](https://inciweb.wildfire.gov/feeds)
- [NIFC InciWeb Info](https://www.nifc.gov/fire-information/pio-bulletin-board/inciweb)
- [Mapbox Wildfire Demo](https://www.mapbox.com/blog/mapping-u-s-wildfire-data-from-public-feeds)
- [GitHub: palewire/inciweb-wildfires](https://github.com/palewire/inciweb-wildfires)

### IRWIN
- [IRWIN Portal](https://www.wildfire.gov/application/irwin-integrated-reporting-wildfire-information)
- [Data Management](https://www.wildfire.gov/data-management)
- [WFDSS IRWIN Data Exchange](https://wfdss.usgs.gov/wfdss_help/WFDSSHelp_abt_IRWIN_data_exchange.html)
- [GeoPlatform](https://geoplatform.maps.arcgis.com/)

### ArcGIS REST API
- [Query Feature Service](https://developers.arcgis.com/rest/services-reference/query-feature-service-layer-.htm)
- [Query Reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-support-Query.html)

---

**Next Steps:**
1. Request NASA FIRMS MAP_KEY
2. Implement NIFC client in `packages/twin-core/`
3. Download MTBS California fires (2014-2024)
4. Build data refresh pipeline (Celery/cron)
5. Document data schema mapping in `docs/architecture/`

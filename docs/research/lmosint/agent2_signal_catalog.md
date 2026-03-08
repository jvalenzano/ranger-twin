# LMOSINT Agent 2: Federal Data Signal Catalog

> **Compiled:** 2026-03-08 | **Agent:** Federal Data Signal Mapper | **Sources Cataloged:** 30

## Executive Summary

This catalog maps 30 publicly accessible, machine-readable data sources across 9 domains relevant to land management intelligence. Each source has been evaluated for API accessibility, update frequency, authentication requirements, FedRAMP classification, MCP server wrapper feasibility, and operational value for Forest Service decision-making.

**Key findings:**
- **22 of 30 sources** have documented REST/STAC APIs or ArcGIS REST services suitable for programmatic access
- **7 sources** qualify as Tier 1 priority for immediate MCP server integration
- **7 signal fusion opportunities** identified where combining sources creates intelligence unavailable from any single source
- **All Tier 1 sources** are publicly classified with free or no-cost access

---

## Table of Contents

1. [Active Fire / Thermal](#1-active-fire--thermal)
2. [Weather / Climate](#2-weather--climate)
3. [Satellite / Raster](#3-satellite--raster)
4. [Air Quality](#4-air-quality)
5. [Hydrology / Debris Flow](#5-hydrology--debris-flow)
6. [Ecology / Vegetation](#6-ecology--vegetation)
7. [Incident Management](#7-incident-management)
8. [Regulatory / Compliance](#8-regulatory--compliance)
9. [Citizen Science](#9-citizen-science)
10. [Tier 1 Priority Sources](#tier-1-priority-sources)
11. [Signal Fusion Opportunities](#signal-fusion-opportunities)

---

## 1. Active Fire / Thermal

### 1.1 NASA FIRMS (MODIS + VIIRS)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NASA |
| **API Endpoint** | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/{bbox}/{days}` |
| **Update Frequency** | Near real-time: URT <60 seconds (US/Canada), standard <60 minutes |
| **Format** | CSV, JSON, KML, SHP |
| **Auth Required** | Yes - free MAP_KEY (5,000 requests / 10 min) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Covers MODIS (1km), VIIRS S-NPP/NOAA-20/NOAA-21 (375m), and Landsat sensors. US/Canada-specific endpoint at `firms.modaps.eosdis.nasa.gov/usfs/`. Area, country, and data availability endpoints all documented. Python tutorials available.

**Sources:** [FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/) | [NASA Earthdata](https://www.earthdata.nasa.gov/data/tools/firms)

---

### 1.2 NIFC Open Data (GeoMAC Replacement)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NIFC |
| **API Endpoint** | `https://data-nifc.opendata.arcgis.com/` (ArcGIS REST services) |
| **Update Frequency** | Near real-time (perimeters updated as reported by field teams) |
| **Format** | ArcGIS REST, GeoJSON, Shapefile, KML, CSV, FGDB |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Replaced GeoMAC (decommissioned April 2020). WFIGS (Wildland Fire Interagency Geospatial Service) provides authoritative current-year perimeters plus historic data (2000-present). Cloud-hosted ArcGIS, scales to load. No login required.

**Sources:** [NIFC Open Data](https://data-nifc.opendata.arcgis.com/) | [USGS FAQ](https://www.usgs.gov/faqs/where-can-i-find-wildfire-perimeter-data)

---

### 1.3 IRWIN (Integrated Reporting of Wildland Fire Information)

| Attribute | Detail |
|-----------|--------|
| **Agency** | DOI / USDA (interagency) |
| **API Endpoint** | Public view: `https://data-nifc.opendata.arcgis.com/`; Full API: ArcGIS REST (connected systems) |
| **Update Frequency** | Near real-time (production replica every 60 seconds) |
| **Format** | ArcGIS REST, GeoJSON, Shapefile, CSV, KML |
| **Auth Required** | Public view: No. Full API: Yes (GeoPlatform token, 60-min max lifetime) |
| **FedRAMP Classification** | Public (public view) |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Authoritative wildfire incident data since May 2014. v11 API specification published September 2025. Public view provides location, size, conditions, containment. Full connected-system access via ArcGIS REST AddFeatures/UpdateFeatures operations requires NWCG affiliation. Observer tool available for incident discovery.

**Sources:** [IRWIN Portal](https://www.wildfire.gov/application/irwin-integrated-reporting-wildfire-information) | [IRWIN Incidents API v11](https://wildfireweb-prod-media-bucket.s3.us-gov-west-1.amazonaws.com/s3fs-public/2025-09/IRWIN%20Integration%20Specification%20Incidents%20API%20v11.docx.pdf)

---

## 2. Weather / Climate

### 2.1 Synoptic Data / MesoWest (RAWS Network)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NOAA / University of Utah (Synoptic Data PBC) |
| **API Endpoint** | `https://api.synopticdata.com/v2/stations/timeseries` |
| **Update Frequency** | Real-time (continuous station reporting) |
| **Format** | JSON, CSV |
| **Auth Required** | Yes - free API token |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Access to 170,000+ stations across 320+ networks including all RAWS (Remote Automatic Weather Stations). Key endpoints: `/stations/timeseries`, `/stations/latest`, `/stations/precipitation`, `/stations/metadata`. SynopticPy Python client available. Legacy endpoint at `api.mesowest.net/v2/` still operational.

**Sources:** [Synoptic Weather API](https://synopticdata.com/weatherapi/) | [SynopticPy](https://github.com/blaylockbk/SynopticPy)

---

### 2.2 NOAA HRRR (High-Resolution Rapid Refresh)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NOAA / NWS / NCEP |
| **API Endpoint** | `s3://noaa-hrrr-pds` (rolling 1-week); `s3://noaa-hrrr-bdp-pds` (archive); `s3://hrrrzarr/` (Zarr) |
| **Update Frequency** | Hourly (3km resolution model runs) |
| **Format** | GRIB2, Zarr, Cloud-Optimized Icechunk Zarr |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** (large raster data requires processing) |
| **Operational Value** | **High** |

**Notes:** 3km convection-allowing atmospheric model. Forecasts to 48h at 00/06/12/19 UTC, 18h otherwise. Available on AWS, Google, Azure. SNS notification ARN: `arn:aws:sns:us-east-1:104891172899:noaa-hrrr-pds`. HRRR-B Python package available. dynamical.org provides cloud-optimized Icechunk Zarr format.

**Sources:** [AWS Registry](https://registry.opendata.aws/noaa-hrrr-pds/) | [HRRR Archive](https://mesowest.utah.edu/html/hrrr/)

---

### 2.3 NOAA NDFD (National Digital Forecast Database)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NOAA / NWS |
| **API Endpoint** | `https://digital.weather.gov/xml/sample_products/browser_interface/ndfdXMLclient.php` |
| **Update Frequency** | Day 1-3: every 30 min; Day 4-7: every 6 hours |
| **Format** | DWML/XML, WMS |
| **Auth Required** | No (rate limit: 1 request/point/hour) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** (XML parsing required) |
| **Operational Value** | **Medium** |

**Notes:** Gridded forecast data from WFOs and NCEP. REST and SOAP services. Supports zip code, lat/lon, and bounding box queries. WMS endpoints for CONUS, Alaska, Hawaii, PR, Guam. Also on AWS Open Data from April 2020-present.

**Sources:** [NDFD REST Service](https://graphical.weather.gov/xml/rest.php) | [AWS Registry](https://registry.opendata.aws/noaa-ndfd/)

---

### 2.4 NWS Alerts API (Red Flag Warnings)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NOAA / NWS |
| **API Endpoint** | `https://api.weather.gov/alerts/active` |
| **Update Frequency** | Real-time (<45 seconds from creation via NOAAPORT) |
| **Format** | JSON-LD, CAP v1.2, ATOM |
| **Auth Required** | No (User-Agent header recommended) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** All NWS watches, warnings, advisories. Filter Red Flag Warnings: `?event=Red%20Flag%20Warning`. Filter by state: `?area=CA`. Fire weather event codes: FWW (warning), FWA (watch), RFD (rangeland fire danger). 7-day historical via `/alerts`. ATOM feeds for push-style integration.

**Sources:** [NWS Alerts Documentation](https://www.weather.gov/documentation/services-web-alerts) | [NWS API Documentation](https://www.weather.gov/documentation/services-web-api)

---

## 3. Satellite / Raster

### 3.1 USGS Landsat Collection 2 (STAC API)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS |
| **API Endpoint** | `https://landsatlook.usgs.gov/stac-server` |
| **Update Frequency** | 16-day revisit per satellite (8-day combined Landsat 8+9) |
| **Format** | STAC/JSON metadata, Cloud-Optimized GeoTIFF (COG) imagery |
| **Auth Required** | No (STAC search public; imagery on public AWS S3) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** (raster processing needed) |
| **Operational Value** | **High** |

**Notes:** 30m multispectral imagery, 1972-present. STAC metadata with direct S3 links. Also via Element 84 Earth Search (`earth-search.aws.element84.com/v1`). PySTAC client. Supports spatial/temporal filtering, GeoJSON AOI queries.

**Sources:** [USGS STAC](https://www.usgs.gov/landsat-missions/spatiotemporal-asset-catalog-stac) | [LandsatLook API Docs](https://landsatlook.usgs.gov/stac-server/api.html)

---

### 3.2 ESA Sentinel-2 (Copernicus Data Space STAC)

| Attribute | Detail |
|-----------|--------|
| **Agency** | ESA / Copernicus |
| **API Endpoint** | `https://stac.dataspace.copernicus.eu/v1` |
| **Update Frequency** | 5-day revisit (Sentinel-2A + 2B combined) |
| **Format** | STAC/JSON, COG, SAFE format |
| **Auth Required** | STAC search: No. Download: Copernicus account (free) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** 10m/20m/60m multispectral. L2A (surface reflectance) and L1C. CQL2 filter extension. Old endpoint (`catalogue.dataspace.copernicus.eu/stac`) deprecated November 2025. Also on Element 84 Earth Search. STAC Browser at `browser.stac.dataspace.copernicus.eu`.

**Sources:** [CDSE STAC Documentation](https://documentation.dataspace.copernicus.eu/APIs/STAC.html) | [Endpoint Consolidation Notice](https://dataspace.copernicus.eu/news/2025-11-3-stac-catalogue-api-endpoints-consolidation)

---

### 3.3 MTBS (Monitoring Trends in Burn Severity)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS / USFS |
| **API Endpoint** | `https://www.mtbs.gov/direct-download`; Google Earth Engine; Planetary Computer STAC |
| **Update Frequency** | Annual (rapid assessments for >40k acre fires since 2020) |
| **Format** | GeoTIFF, Shapefile, GEE ImageCollection, STAC |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** 30m Landsat-derived burn severity mapping, 1984-present. Thematic classes: unburned/low, low, moderate, high, increased greenness. Available on GEE (`USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1`), Microsoft Planetary Computer, USFS ArcGIS Hub. Critical for post-fire recovery planning in RANGER.

**Sources:** [MTBS Direct Download](https://www.mtbs.gov/direct-download) | [Planetary Computer](https://planetarycomputer.microsoft.com/dataset/mtbs) | [GEE Catalog](https://developers.google.com/earth-engine/datasets/catalog/USFS_GTAC_MTBS_annual_burn_severity_mosaics_v1)

---

### 3.4 LANDFIRE Product Service (LFPS)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS / USFS |
| **API Endpoint** | `https://lfps.usgs.gov/arcgis/rest/services/LandfireProductService/GPServer` |
| **Update Frequency** | Periodic releases (multi-year update cycles) |
| **Format** | Multi-band GeoTIFF, WMS, WCS |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** Vegetation type, fuel models, fire regime, disturbance, and topographic data. RESTful API with custom AOI extraction, resampling, reprojection. R package (`rlandfire`) available. WMS/WCS for direct layer consumption. Critical for fuel modeling and fire behavior prediction.

**Sources:** [LANDFIRE Data](https://landfire.gov/data) | [LFPS REST](https://lfps.usgs.gov/arcgis/rest/services/LandfireProductService/GPServer)

---

### 3.5 Google Earth Engine

| Attribute | Detail |
|-----------|--------|
| **Agency** | Google |
| **API Endpoint** | `https://earthengine.googleapis.com/` |
| **Update Frequency** | Varies by dataset (real-time to annual) |
| **Format** | REST/JSON, GeoTIFF export |
| **Auth Required** | Yes (Google Cloud project + service account) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Low** (cloud computation platform, not simple data API) |
| **Operational Value** | **High** |

**Notes:** 80+ petabytes catalog including Landsat, MODIS, Sentinel, MTBS, LANDFIRE. Server-side computation engine. REST API available but designed for cloud-side processing, not direct data download. Best used for derived products (change detection, composites). JavaScript/Python client libraries.

**Sources:** [GEE REST API](https://developers.google.com/earth-engine/reference/rest) | [GEE Access Guide](https://developers.google.com/earth-engine/guides/access)

---

## 4. Air Quality

### 4.1 AirNow API

| Attribute | Detail |
|-----------|--------|
| **Agency** | EPA |
| **API Endpoint** | `https://www.airnowapi.org/aq/observation/zipCode/current/` |
| **Update Frequency** | Hourly |
| **Format** | JSON, XML, CSV |
| **Auth Required** | Yes - free API key |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Real-time AQI data and forecasts. Query by zip code or lat/lon. Covers PM2.5, PM10, Ozone, NO2, CO, SO2. Critical for smoke impact assessment during wildfires. Simple REST interface. R package (`airnow`) available.

**Sources:** [AirNow API Docs](https://docs.airnowapi.org/webservices) | [Data.gov Listing](https://catalog.data.gov/dataset/airnow-real-time-air-quality-rest-api)

---

### 4.2 EPA AQS (Air Quality System) API

| Attribute | Detail |
|-----------|--------|
| **Agency** | EPA |
| **API Endpoint** | `https://aqs.epa.gov/data/api/` |
| **Update Frequency** | Historical (6+ month lag from collection to database) |
| **Format** | JSON |
| **Auth Required** | Yes - free email registration |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **Medium** |

**Notes:** 3.4 billion rows of historical ambient air monitoring data. Sync and async query modes. By site, county, state, CBSA, or bounding box. Rate limit: 10 requests/min with 5-second pause. Python (`pyaqsapi`) and R (`RAQSAPI`) client libraries. Weekly maintenance Sundays 1800-2359 EST. Not real-time.

**Sources:** [AQS API Documentation](https://aqs.epa.gov/aqsweb/documents/data_api.html) | [EPA AQS](https://www.epa.gov/aqs)

---

### 4.3 PurpleAir API

| Attribute | Detail |
|-----------|--------|
| **Agency** | PurpleAir (private) |
| **API Endpoint** | `https://api.purpleair.com/v1/sensors` |
| **Update Frequency** | Real-time (2-minute sensor intervals) |
| **Format** | JSON |
| **Auth Required** | Yes - free API key (points-based system, 1M points on signup) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Dense network of low-cost PM2.5 sensors with dual laser counters. Historical data available. Extremely valuable for hyperlocal smoke monitoring during wildfires -- often higher spatial density than AirNow. Sensor data includes PM2.5, PM1.0, PM10.0, temperature, humidity, pressure. R (`PurpleAirAPI`) and Python clients available.

**Sources:** [PurpleAir API](https://api.purpleair.com/) | [PurpleAir Community](https://community.purpleair.com/t/about-the-purpleair-api/7145)

---

## 5. Hydrology / Debris Flow

### 5.1 USGS Water Services (Instantaneous Values)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS |
| **API Endpoint** | `https://waterservices.usgs.gov/nwis/iv/` (legacy); `https://api.waterdata.usgs.gov/` (modernized) |
| **Update Frequency** | Real-time (15-minute intervals, hourly transmission; more frequent during floods) |
| **Format** | JSON, WaterML, RDB (tab-delimited) |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** 8,500+ continuous streamgages in National Streamflow Network. Streamflow, gage height, and hundreds of parameters. RTFI (Real-Time Flood Impact) API at `api.waterdata.usgs.gov/rtfi-api/docs` maps flood-vulnerable infrastructure near gages. Critical for post-fire flood risk monitoring.

**Sources:** [USGS Water Services](https://waterservices.usgs.gov/) | [Modernized Water Data APIs](https://api.waterdata.usgs.gov/)

---

### 5.2 USGS StreamStats

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS |
| **API Endpoint** | `https://streamstats.usgs.gov/docs/streamstatsservices/` (legacy, decommissioned Jan 2026) |
| **Update Frequency** | On-demand computation (static basin characteristics) |
| **Format** | JSON, GeoJSON |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **Medium** |

**Notes:** **WARNING: Legacy services decommissioned January 30, 2026.** Replaced by SS-Delineate and SS-Hydro. Provides watershed delineation, basin characteristics, peak flow estimates, runoff modeling (Rational Method, TR55 Curve Number). NSS and Gage Statistics services remain active.

**Sources:** [StreamStats Web Services](https://www.usgs.gov/streamstats/web-services)

---

### 5.3 NOAA National Water Prediction Service API

| Attribute | Detail |
|-----------|--------|
| **Agency** | NOAA / NWS |
| **API Endpoint** | `https://water.noaa.gov/about/api` |
| **Update Frequency** | Real-time (forecasts and observations) |
| **Format** | JSON |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** Official NWS streamflow forecasts, observations, National Water Model output, crest history, flood impacts, flood category levels. HEFS ensemble forecasts for 3,000+ locations. Not supported 24/7; may be modified without notice. Complements USGS raw streamflow data.

**Sources:** [NWPS API Info](https://water.noaa.gov/about/api)

---

### 5.4 USGS Post-Fire Debris Flow Hazard Assessments

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS |
| **API Endpoint** | `https://earthquake.usgs.gov/arcgis/rest/services/ls/pwfdf_{YEAR}/MapServer` |
| **Update Frequency** | Per-fire event (published after BAER assessments) |
| **Format** | ArcGIS REST (supports GeoJSON, Shapefile query output) |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** Probability and volume estimates for post-fire debris flows by watershed segment for design rainstorms. Dashboard at `arcgis.com/apps/dashboards/c09fa874362e48a9afe79432f2efe6fe`. Landslides portal at `landslides.usgs.gov/hazards/postfire_debrisflow/`. Wildcat CLI tool available. Critical for post-fire safety planning.

**Sources:** [USGS Post-Fire Debris Flow](https://www.usgs.gov/tools/emergency-assessment-post-fire-debris-flow-hazards) | [ArcGIS Dashboard](https://www.arcgis.com/apps/dashboards/c09fa874362e48a9afe79432f2efe6fe)

---

### 5.5 USGS Landslide Inventory

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS |
| **API Endpoint** | GeoPackage download from USGS ScienceBase (no REST API) |
| **Update Frequency** | Periodic (v3.0 released February 2025) |
| **Format** | GeoPackage, interactive web map |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Low** (file download, no real-time API) |
| **Operational Value** | **Medium** |

**Notes:** National landslide inventory and susceptibility map using 3DEP elevation data. Hundreds of thousands of mapped landslide locations. No dedicated REST API; distributed via web maps and GIS file downloads. Less real-time utility than debris flow assessments.

**Sources:** [Landslide Hazards Data](https://www.usgs.gov/programs/landslide-hazards/data)

---

## 6. Ecology / Vegetation

### 6.1 FIA (Forest Inventory and Analysis) API / EVALIDator

| Attribute | Detail |
|-----------|--------|
| **Agency** | USDA Forest Service |
| **API Endpoint** | `https://apps.fs.usda.gov/fiadb-api/fullreport` |
| **Update Frequency** | Annual (rolling state-level panel inventory) |
| **Format** | JSON, CSV |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **High** |

**Notes:** 130,000+ permanent forest inventory plots nationwide. Population estimates for timber volume, species composition, growth, mortality, biomass, carbon. Query by state or circular AOI around geographic point. Parameter dictionary at `/fullreport/parameters/{param}`. FIA DataMart for raw SQLite/CSV downloads. R and Python integration documented.

**Sources:** [FIADB-API Documentation](https://apps.fs.usda.gov/fiadb-api/) | [FIA DataMart](https://research.fs.usda.gov/products/dataandtools/fia-datamart)

---

### 6.2 NLCD (National Land Cover Database)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USGS / MRLC Consortium |
| **API Endpoint** | MRLC Viewer/WMS; AWS S3 (us-west-2); Planetary Computer STAC |
| **Update Frequency** | Annual (1985-2024 in Collection 1.1) |
| **Format** | Cloud-Optimized GeoTIFF, WMS |
| **Auth Required** | No (Planetary Computer provides SAS tokens for download) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** 30m land cover classification for CONUS (1985-2024). Six products: land cover, change, confidence, impervious surface, descriptor, spectral change. Available on EarthExplorer, MRLC Viewer, ScienceBase, AWS S3, Planetary Computer. Includes Tree Canopy Cover dataset.

**Sources:** [USGS Annual NLCD](https://www.usgs.gov/centers/eros/science/annual-nlcd-data-access) | [MRLC Data Portal](https://www.mrlc.gov/data)

---

### 6.3 MODIS NDVI Products (via AppEEARS)

| Attribute | Detail |
|-----------|--------|
| **Agency** | NASA |
| **API Endpoint** | `https://appeears.earthdatacloud.nasa.gov/api/` |
| **Update Frequency** | 16-day composites; NRT via LANCE within 24 hours |
| **Format** | GeoTIFF, HDF, NetCDF, JSON |
| **Auth Required** | Yes - free NASA Earthdata account |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **High** |

**Notes:** MOD13Q1 (250m), MOD13A1 (500m), MYD13A2 (1km) NDVI/EVI products. AppEEARS provides area/point extraction with quality layer decoding. LANCE NRT NDVI for CONUS available within 24h of observation. Continuity with 40+ year AVHRR NDVI time series. Critical for vegetation recovery tracking.

**Sources:** [AppEEARS](https://appeears.earthdatacloud.nasa.gov/) | [MODIS VI Products](https://modis.gsfc.nasa.gov/data/dataprod/mod13.php)

---

## 7. Incident Management

### 7.1 InciWeb

| Attribute | Detail |
|-----------|--------|
| **Agency** | USFS (interagency) |
| **API Endpoint** | `https://inciweb.wildfire.gov/feeds` (RSS 2.0, KML) |
| **Update Frequency** | Near real-time (updated by PIOs as incidents evolve) |
| **Format** | RSS 2.0, KML |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** (RSS parsing, no REST API) |
| **Operational Value** | **Medium** |

**Notes:** Public-facing incident information: personnel, cost, acres, containment, structures. Drupal CMS since October 2022. No formal REST API; RSS feeds and KML are primary machine-readable options. Third-party scraper at `github.com/datadesk/inciweb-wildfires`. For authoritative data, prefer IRWIN.

**Sources:** [InciWeb Feeds](https://inciweb.wildfire.gov/feeds) | [InciWeb GitHub Tool](https://github.com/datadesk/inciweb-wildfires)

---

### 7.2 IRWIN

See [Section 1.3](#13-irwin-integrated-reporting-of-wildland-fire-information) above. IRWIN serves both fire detection and incident management roles as the authoritative source for wildland fire incident data.

---

## 8. Regulatory / Compliance

### 8.1 Federal Register API

| Attribute | Detail |
|-----------|--------|
| **Agency** | NARA / GPO |
| **API Endpoint** | `https://www.federalregister.gov/api/v1/documents.json` |
| **Update Frequency** | Daily (federal business days) |
| **Format** | JSON, CSV |
| **Auth Required** | No (CORS enabled, JSONP supported) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **Medium** |

**Notes:** All Federal Register content since 1994. Search by agency, document type, keyword, date range. Includes rules, proposed rules, notices, Executive Orders. Endpoints for single doc, multi-get, search, public inspection. HTML/PDF/text versions available. R client library. Postman collection available.

**Sources:** [Federal Register API v1](https://www.federalregister.gov/developers/documentation/api/v1) | [Developer Resources](https://www.federalregister.gov/reader-aids/developer-resources/rest-api)

---

### 8.2 USFS SOPA (Schedule of Proposed Actions)

| Attribute | Detail |
|-----------|--------|
| **Agency** | USDA Forest Service |
| **API Endpoint** | `https://www.fs.usda.gov/sopa/` (web portal); `https://data.fs2c.usda.gov/nepaweb/current-sopa.php` |
| **Update Frequency** | Quarterly (January, April, July, October) |
| **Format** | HTML, PDF (no documented REST API) |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Low** (would require scraping) |
| **Operational Value** | **Medium** |

**Notes:** Lists all NEPA projects by national forest. No documented REST API for programmatic access. Data available through web portal and PDF reports. Quarterly publication cycle limits real-time utility. Reports no longer always available post-USFS website transitions.

**Sources:** [USFS SOPA](https://www.fs.usda.gov/sopa/)

---

### 8.3 BLM ePlanning / NEPA Register

| Attribute | Detail |
|-----------|--------|
| **Agency** | BLM |
| **API Endpoint** | `https://gis.blm.gov/arcgis/rest/services/ePlanning/BLM_Natl_Epl_Comment/FeatureServer` |
| **Update Frequency** | Continuous (updated as NEPA documents are published) |
| **Format** | ArcGIS REST, GeoJSON |
| **Auth Required** | No (public ArcGIS FeatureServer) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **Medium** |

**Notes:** Redesigned NEPA Register launched January 2026. ArcGIS REST services for geospatial project data. Supports polygon, query, and statistics operations. BLM-specific (not USFS); complementary to SOPA for interagency land management context.

**Sources:** [BLM ePlanning](https://eplanning.blm.gov/) | [BLM NEPA Register Announcement](https://www.blm.gov/blog/2026-01-20/blm-unveils-redesigned-nepa-register-easier-public-access)

---

## 9. Citizen Science

### 9.1 CoCoRaHS (Community Collaborative Rain, Hail & Snow Network)

| Attribute | Detail |
|-----------|--------|
| **Agency** | CoCoRaHS / NOAA |
| **API Endpoint** | `https://data.cocorahs.org/cocorahs/export/` |
| **Update Frequency** | Daily (volunteer morning reports) |
| **Format** | CSV, JSON (via web API) |
| **Auth Required** | No |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Medium** |
| **Operational Value** | **Medium** |

**Notes:** 27,500+ active observers using NWS-approved rain gauges across US, Canada, Bahamas. High-density precipitation measurements. Data Explorer (DEx) for browsing and long-term comparison. Interactive maps at `maps.cocorahs.org`. Valuable for post-fire precipitation monitoring in burn scars.

**Sources:** [CoCoRaHS Data](https://www.cocorahs.org/viewdata/) | [CoCoRaHS Maps](https://maps.cocorahs.org/)

---

### 9.2 iNaturalist API

| Attribute | Detail |
|-----------|--------|
| **Agency** | California Academy of Sciences / National Geographic |
| **API Endpoint** | `https://api.inaturalist.org/v1/observations` |
| **Update Frequency** | Real-time (user-submitted observations) |
| **Format** | JSON |
| **Auth Required** | Read: No. Write: OAuth required. |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **High** |
| **Operational Value** | **Medium** |

**Notes:** Biodiversity observations with AI-assisted species identification. v1 API (Node-based) recommended; v2 in development. Filter by taxon, location, date, quality grade. Pagination limit: 10k results (use `id_above` for bulk access). `pyinaturalist` Python client available. Useful for post-fire ecological recovery monitoring -- species recolonization, invasive species tracking.

**Sources:** [iNaturalist API v1](https://api.inaturalist.org/v1/docs/) | [API Recommended Practices](https://www.inaturalist.org/pages/api+recommended+practices)

---

### 9.3 ALERTWildfire Camera Network

| Attribute | Detail |
|-----------|--------|
| **Agency** | University of Nevada Reno / UCSD / University of Oregon |
| **API Endpoint** | `https://www.alertwildfire.org/` (web feeds only; no documented REST API) |
| **Update Frequency** | Real-time (live video, AI panoramic scan every 2 minutes) |
| **Format** | Video streams (MJPEG/RTSP) |
| **Auth Required** | Public view: No. PTZ control, historical, alerts: Yes (credentialed access) |
| **FedRAMP Classification** | Public |
| **MCP Feasibility** | **Low** (no API; video streams require CV processing) |
| **Operational Value** | **Medium** |

**Notes:** 1,600+ cameras in western US. ALERTCalifornia (1,200+), Oregon (70+), Nevada (expanding). AI/ML fire detection every 2 minutes with near-IR night vision. Public live feeds at `alertwildfire.org` and `alertwest.live`. No public API; programmatic access would require partnership. Credentials for advanced features via `wildfirehelp@uoregon.edu`.

**Sources:** [ALERTWildfire](https://www.alertwildfire.org/) | [ALERTCalifornia](https://alertcalifornia.org/)

---

## Tier 1 Priority Sources

These 7 sources should be integrated first based on: (1) API maturity, (2) real-time or near-real-time data, (3) direct relevance to Forest Service wildfire and recovery operations, and (4) feasibility of MCP server wrapper.

| Priority | Source | Why First |
|----------|--------|-----------|
| **1** | NASA FIRMS | Real-time fire detection, simple REST API, free key, <60s latency for US |
| **2** | NIFC Open Data / IRWIN | Authoritative perimeters and incident data, ArcGIS REST, public |
| **3** | NWS Alerts API | Real-time Red Flag Warnings, zero auth, JSON-LD, immediate operational value |
| **4** | USGS Water Services | Real-time streamflow for post-fire flood monitoring, 8,500+ gages, no auth |
| **5** | USGS Post-Fire Debris Flow | Direct post-fire safety relevance, ArcGIS REST, public, per-fire assessments |
| **6** | AirNow + PurpleAir | Complementary AQI (official + hyperlocal), simple REST, smoke monitoring |
| **7** | Synoptic/MesoWest (RAWS) | Fire weather stations, 170k+ stations, JSON API, free token |

---

## Signal Fusion Opportunities

These combinations create intelligence products unavailable from any single source:

### Fusion 1: Fire-Weather Correlation Engine
**Sources:** NASA FIRMS + Synoptic/RAWS + NWS Red Flag Warnings + NOAA HRRR

Combine active fire detections with real-time weather station data, Red Flag Warning alerts, and HRRR wind forecasts to predict fire spread direction and rate of spread. Neither fire detection nor weather data alone provides spread prediction capability.

### Fusion 2: Post-Fire Cascade Risk Assessment
**Sources:** MTBS Burn Severity + USGS Debris Flow + USGS Water Services + NOAA NWPS + CoCoRaHS

Overlay burn severity maps with debris flow probability models and real-time stream gauge data to create dynamic post-fire flood/debris cascade risk maps. Individual sources show static risk or current conditions; fusion creates predictive situational awareness for the 2-5 year post-fire window.

### Fusion 3: Smoke Impact & Evacuation Intelligence
**Sources:** NASA FIRMS + AirNow + PurpleAir + NWS Alerts + NOAA HRRR

Combine fire locations with official AQI monitoring, hyperlocal PurpleAir PM2.5 networks, wind forecasts, and NWS air quality alerts to create real-time smoke dispersion and health impact maps with evacuation priority zones. No single source provides this combined spatial and temporal resolution.

### Fusion 4: Recovery Vegetation Monitoring
**Sources:** MODIS NDVI + Landsat + Sentinel-2 + MTBS + FIA + NLCD

Track vegetation recovery trajectories in burn scars by fusing pre/post-fire NDVI time series with burn severity maps, land cover classification, and forest inventory data. Creates quantitative recovery benchmarks against which individual fire recovery can be compared.

### Fusion 5: Fuel Condition & Fire Risk Prediction
**Sources:** LANDFIRE + MODIS NDVI + Synoptic/RAWS + NOAA HRRR + NLCD

Combine static fuel models with live vegetation moisture indices (NDVI), current weather, and land cover to generate dynamic fire risk surfaces. LANDFIRE provides the structural fuel loading; adding live moisture and weather transforms it from static to dynamic risk assessment.

### Fusion 6: NEPA & Regulatory Signal Correlation
**Sources:** Federal Register API + USFS SOPA + BLM ePlanning + NIFC Open Data + MTBS

Link proposed land management actions (timber sales, prescribed burns, restoration projects) with historic fire activity and burn severity to provide evidence-based context for NEPA review and public comment. Enables regulatory analysis grounded in spatial data.

### Fusion 7: Citizen Science Ground Truth Network
**Sources:** iNaturalist + CoCoRaHS + PurpleAir + ALERTWildfire

Augment federal monitoring networks with dense citizen observations: species recovery tracking (iNaturalist), hyperlocal precipitation in burn scars (CoCoRaHS), granular air quality (PurpleAir), and visual fire confirmation (ALERTWildfire). Fills spatial gaps in official networks at near-zero marginal cost.

---

## Appendix: API Authentication Summary

| Auth Level | Sources | Count |
|------------|---------|-------|
| **No auth** | NIFC Open Data, NWS Alerts, USGS Water Services, USGS Debris Flow, USGS StreamStats, NOAA NWPS, NLCD, FIA, Federal Register, SOPA, BLM ePlanning, InciWeb, CoCoRaHS, NOAA HRRR, USGS Landslide, MTBS, LANDFIRE, iNaturalist (read) | 18 |
| **Free API key** | NASA FIRMS, Synoptic/MesoWest, AirNow, PurpleAir, EPA AQS, MODIS/AppEEARS | 6 |
| **Account required** | Sentinel-2 (download), Google Earth Engine | 2 |
| **Federal credential** | IRWIN (full API) | 1 |
| **No API** | ALERTWildfire, USFS SOPA (web/PDF only) | 2 |

---

*Machine-readable version: [`signal_catalog.json`](./signal_catalog.json)*

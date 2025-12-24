Here’s a curated list of free/open APIs & datasets that map cleanly onto RANGER’s use cases. Each bullet is “what it is” + “how you’d actually use it in the app.”  

## Core fire geometry & history

- **USFS National Fire Perimeter (ArcGIS REST / WFS)**  
  - **What it is:** National layer of daily and final wildland fire perimeters on National Forest System lands, maintained under the National GIS Data Dictionary.[1][2]
  - **Use in RANGER:**  
    - Mission Control fire list & detail views (authoritative polygons, acres, dates).  
    - Centering the modal viewport on the correct historical perimeter.  
    - Joining to internal incident IDs and stitching multi-day growth perimeters into area‑over‑time charts.

- **NIFC / WFIGS Interagency Fire Perimeter History (ArcGIS REST)**  
  - **What it is:** All‑years interagency perimeters across US jurisdictions, hosted by NIFC as a feature service.[3]
  - **Use in RANGER:**  
    - Filling gaps where USFS perimeter coverage is incomplete.  
    - Cross‑boundary fires that span Forest Service, BLM, state, and tribal lands.  
    - Regional risk layers (e.g., historic fire density for a forest or ranger district).

- **USFS Final Fire Perimeter (subset) (ArcGIS REST / downloads)**  
  - **What it is:** “Final” fire perimeter layer emphasizing the completed incident footprint, available via ArcGIS item + shapefile/geodatabase downloads.[4]
  - **Use in RANGER:**  
    - Stable geometry for post‑fire planning (BAER, NEPA, treatments) versus daily ops.  
    - Reference boundary for downstream rasters (burn severity, treatments, regrowth).

## Active fire detections & thermal signal

- **NASA LANCE / FIRMS Active Fire API (CSV / JSON / WFS / WMS)**  
  - **What it is:** Global MODIS & VIIRS active fire detections and thermal anomalies in near‑real time, exposed via REST endpoints and OGC services with a free API key (“MAP_KEY”).[5][6][7][8]
  - **Use in RANGER:**  
    - Showing where and when the fire was most active (time‑filtered points over a historical perimeter).  
    - Animating hot‑spot progression in the timeline view for Mission Control.  
    - Feeding the Burn Analyst agent with pixel‑level heat signatures during an incident.

- **FIRMS Modeled / Near‑Real‑Time Fire Perimeters (VIIRS) (OGC API / WMS)**  
  - **What it is:** Model‑derived perimeters built from VIIRS detections, served via FIRMS as tiles and OGC API resources.[9][10]
  - **Use in RANGER:**  
    - Early‑stage incidents before authoritative perimeters are published.  
    - Comparing modeled versus final perimeters as a QA/comms artifact.  
    - Training data for agents that reason about growth prediction and model bias.

## Burn severity & post‑fire condition

- **MTBS (Monitoring Trends in Burn Severity) – Fire‑Level Downloads & Web Map Services**  
  - **What it is:** Interagency program mapping burned area boundary + continuous and classified burn severity for large fires since 1984; fire‑level archives, WMS, and a Direct Download interface.[11][12][13]
  - **Use in RANGER:**  
    - Burn Analyst agent input: dNBR / severity classes clipped to your perimeter.  
    - Generating the “severity thumbnail” in the modal (low/mod/high mosaic).  
    - Statistical summaries (e.g., % high severity within each watershed or management unit).

- **MTBS Burn Severity Portal / CBI Plot Database**  
  - **What it is:** Portal aggregating Composite Burn Index field plots tied to MTBS fires, plus KMZ/PDF visual products.[14][13]
  - **Use in RANGER:**  
    - Ground‑truth context for model calibration and NEPA documentation.  
    - Linking from an incident in Mission Control to official severity products the silviculturist is already familiar with.

## Optical imagery & background basemaps

- **NASA FIRMS Landsat Fire & Thermal Anomaly Tiles (WMS / WMTS)**  
  - **What it is:** Landsat‑derived fire/thermal anomaly imagery already integrated into FIRMS as standard map layers.[15][16]
  - **Use in RANGER:**  
    - Pre/post‑fire tiles under your perimeter overlay in the modal viewport.  
    - Generating before/after snapshots for reports or slide decks without touching raw Landsat scenes.

- **NASA & USGS Landsat Collection (via Earthdata + STAC‑compatible endpoints)**  
  - **What it is:** Long‑term Landsat archive accessible programmatically via Earthdata and cloud‑hosted catalogs.[17][18]
  - **Use in RANGER:**  
    - Time‑series regrowth analysis for older fires (e.g., NDVI recovery curves).  
    - Higher‑resolution context imagery for Trail Assessor and Cruising Assistant agents.

- **ESA Sentinel‑2 Surface Reflectance (various open STAC / tile services)**  
  - **What it is:** 10–20 m multispectral imagery, often exposed through public STAC APIs; heavily used in fire studies.  
  - **Use in RANGER:**  
    - Higher‑frequency, higher‑res burn‑scar visualization for recent incidents.  
    - Training and inference input for spectral‑based vegetation and soil‑exposure models.

- **OpenStreetMap / OpenMapTiles / OpenTopo (raster & vector tiles)**  
  - **What it is:** Open basemaps and terrain used with MapLibre, available via free/open tile servers or self‑hosted stacks.  
  - **Use in RANGER:**  
    - Operational basemap in Mission Control and Field Companion.  
    - Terrain and trail context underlying severity and treatment layers.

## Trails, access, and infrastructure

- **OpenStreetMap Overpass API**  
  - **What it is:** Queryable open database of trails, roads, structures, and landuse, accessible via Overpass queries.  
  - **Use in RANGER:**  
    - Trail Assessor agent baseline trail network before crossing with damage detections.  
    - Identifying access roads, trailheads, and nearby infrastructure for post‑fire work planning.

- **USGS National Map (TNM) Services – Transportation, Hydro, Boundaries**  
  - **What it is:** OGC/WMS services for roads, hydrology, boundaries, and elevation derivatives.  
  - **Use in RANGER:**  
    - Hydrologic units and streams for BAER hydrology and debris‑flow risk context.  
    - Jurisdictional overlays (wilderness, ownership, admin boundaries) in NEPA‑related workflows.

## Elevation, slope, and terrain risk

- **USGS 3DEP Elevation Services (WMS / tiles)**  
  - **What it is:** High‑resolution DEM and derived services for much of the US (1/3–1 m in many areas).[18]
  - **Use in RANGER:**  
    - Slope/aspect rasters for erosion risk and access planning.  
    - Terrain‑aware line‑of‑sight and slope‑limited equipment routing agents.

- **USGS National Land Cover Database (NLCD) Web Services**  
  - **What it is:** Land‑cover classifications for the US updated periodically.  
  - **Use in RANGER:**  
    - Pre‑fire vegetation types for fuel and habitat impact assessments.  
    - Intersection with severity classes to estimate impacted forest types and priority areas.

## Regulatory & document context

- **GovInfo / Federal Register APIs**  
  - **What they are:** Open APIs for federal regulations, notices, and EIS/EAs.  
  - **Use in RANGER:**  
    - NEPA Advisor agent RAG corpus seeding for national‑level statutes and rules.  
    - Cross‑linking incident treatments with relevant CFR/FR citations.

- **Data.gov & agency document repositories (no single API, but JSON catalogs)**  
  - **What they are:** JSON‑based CKAN catalogs exposing metadata and download URLs for many USFS/USGS datasets and documents (e.g., BAER reports, GIS layers).[4][1]
  - **Use in RANGER:**  
    - Automated discovery of new layers (e.g., a BAER shapefile) by forest/region.  
    - Background ingestion for the Recovery Coordinator agent’s cross‑dataset synthesis.

## How this maps to your agents

- **Burn Analyst:** USFS/NIFC perimeters, FIRMS active fire + Landsat tiles, MTBS severity, 3DEP elevation, NLCD land cover.[8][2][12][16]
- **Trail Assessor:** OSM/Overpass trails and roads, USGS TNM transportation and hydro, Sentinel/Landsat imagery for damage detection.  
- **Cruising Assistant:** Landsat/Sentinel imagery plus any open canopy‑height or biomass layers derived from 3DEP/LiDAR where available.  
- **NEPA Advisor:** GovInfo/Federal Register APIs, Data.gov/USFS document catalogs for RAG over NEPA EAs/EISs and handbooks.[4]
- **Recovery Coordinator:** Pulls from all of the above to synthesize treatments, risk, and progress views at the “digital twin” level.

If helpful, the next step can be a short mapping table: “Frontend component → API(s) it depends on → caching/tiling strategy,” so your team can plug this directly into the RANGER architecture.

[1](https://data.fs.usda.gov/geodata/edw/datasets.php?xmlKeyword=fire+perimeter)
[2](https://data-usfs.hub.arcgis.com/datasets/national-usfs-fire-perimeter-feature-layer/about)
[3](https://data-nifc.opendata.arcgis.com/datasets/nifc::interagencyfireperimeterhistory-all-years-view/about)
[4](https://christopher-catalog-dev.app.cloud.gov/dataset/national-usfs-final-fire-perimeter-feature-layer)
[5](https://firms.modaps.eosdis.nasa.gov/api/)
[6](https://firms.modaps.eosdis.nasa.gov/content/academy/data_api/firms_api_use.html)
[7](https://firms.modaps.eosdis.nasa.gov/active_fire/)
[8](https://firms.modaps.eosdis.nasa.gov)
[9](https://earth-information-system.github.io/fireatlas/docs/nrt.html)
[10](https://firms.modaps.eosdis.nasa.gov/descriptions/FEDS_VIIRS_SNPP.html)
[11](https://www.mtbs.gov/direct-download)
[12](https://www.mtbs.gov)
[13](https://burnseverity.cr.usgs.gov/products/mtbs)
[14](https://mtbs.gov/faqs)
[15](https://www.earthdata.nasa.gov/data/tools/firms)
[16](https://www.earthdata.nasa.gov/news/feature-articles/landsat-fire-thermal-anomaly-data-added-firms)
[17](https://science.nasa.gov/mission/landsat/benefits/wildfires/)
[18](https://www.usgs.gov/news/featured-story/fifty-years-landsat-watchman-wildfires)
[19](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/21316841/f85392e4-60fb-44cf-bd50-5c154624dbd5/image.jpg)
[20](https://api.nasa.gov)
[21](https://www.youtube.com/watch?v=c7cAPBYaqck)
[22](https://www.mtbs.gov/data-explorer)
[23](https://learn.microsoft.com/en-us/connectors/nasafirms/)
[24](https://catalog.data.gov/dataset/national-usfs-fire-perimeter-feature-layer-bb7cd)
[25](https://usfs-test-dcdev.hub.arcgis.com/datasets/92c87016044546c78167ccae71efc7bc_11/api)
[26](https://firms.modaps.eosdis.nasa.gov/api/area/)
# RANGER Glossary of Terms

**Purpose:** Comprehensive glossary of acronyms and domain-specific terms used throughout the RANGER repository.

**Last Updated:** 2025-12-25

---

## Skills-First Architecture (ADR-005)

| Term | Definition |
|------|------------|
| **Skill** | Organized folder containing domain expertise (skill.md + scripts + resources) |
| **Skill Package** | A complete, versioned skill ready for deployment |
| **Skills Library** | Collection of all skills, organized by tier |
| **Foundation Skills** | Cross-agency reusable skills (NEPA, geospatial, docs) |
| **Agency Skills** | Agency-specific shared skills (USFS fire terminology) |
| **Application Skills** | Single-application skills (BAER assessment) |
| **Progressive Disclosure** | Only skill metadata loaded until invoked |
| **Agent Pipeline** | Google ADK orchestration layer (Coordinator + Specialists) |
| **MCP Server** | Model Context Protocol server for data connectivity |
| **MCP Connectivity** | Data integration layer separate from expertise layer |
| **skill.md** | Core instruction file in every skill folder |

---

## Federal Systems & Organizations

### ADK
**Official Name:** Agent Development Kit (Google)

**Description:** Google's orchestration framework for building multi-agent AI systems with coordinator/dispatcher patterns, shared session state management, and cross-agent synthesis capabilities.

**URL:** Part of Google Gemini ecosystem

---

### BAER
**Official Name:** Burned Area Emergency Response

**Description:** USFS program that conducts emergency assessments and develops rehabilitation plans immediately following wildfires, focusing on soil burn severity mapping and erosion risk.

**URL:** https://fsapps.nwcg.gov/baer/

---

### CFR
**Official Name:** Code of Federal Regulations

**Description:** Codification of general and permanent rules published in the Federal Register by executive departments and agencies of the US government. Title 36 covers USFS regulations.

**URL:** https://www.ecfr.gov/

---

### EA
**Official Name:** Environmental Assessment

**Description:** NEPA document prepared to determine whether proposed federal actions might significantly affect the environment. Required for timber salvage sales over 250 acres.

**URL:** See NEPA

---

### ESA
**Official Name:** Endangered Species Act

**Description:** Federal law (1973) protecting threatened and endangered species and their habitats. Section 7 requires consultation for federal actions that may affect listed species.

**URL:** https://www.fws.gov/law/endangered-species-act

---

### FACTS
**Official Name:** Forest Activity Tracking System

**Description:** USFS database system for tracking forest management activities including timber sales, vegetation treatments, and other project work.

**URL:** Internal USFS system

---

### FedRAMP
**Official Name:** Federal Risk and Authorization Management Program

**Description:** Government-wide program providing standardized security assessment, authorization, and continuous monitoring for cloud products and services. FedRAMP High is required for USFS production systems.

**URL:** https://www.fedramp.gov/

---

### FIA
**Official Name:** Forest Inventory and Analysis

**Description:** USFS program conducting continuous forest census across all US forests. Maintains database of 300K+ plots with tree species, DBH, height, growth, mortality data.

**URL:** https://www.fia.fs.usda.gov/

---

### FSH
**Official Name:** Forest Service Handbook

**Description:** USFS directive system providing detailed instructions and procedures for implementing policy set forth in the Forest Service Manual (FSM).

**URL:** https://www.fs.usda.gov/im/directives

---

### FSM
**Official Name:** Forest Service Manual

**Description:** USFS directive system containing agency-wide policy, with numbered chapters (e.g., FSM 2400 Timber, FSM 1950 NEPA).

**URL:** https://www.fs.usda.gov/im/directives

---

### FSVeg
**Official Name:** Forest Service Vegetation (Database)

**Description:** USFS standardized system for vegetation inventory data collection, storage, and reporting. XML export format used for timber cruise data.

**URL:** https://www.fs.usda.gov/foresthealth/technology/fsveg.shtml

---

### IRWIN
**Official Name:** Integrated Reporting of Wildland-Fire Information

**Description:** Federal system providing authoritative wildfire incident data, integrating information from multiple agencies for real-time fire reporting.

**URL:** https://irwin.doi.gov/

---

### MTBS
**Official Name:** Monitoring Trends in Burn Severity

**Description:** Interagency program (USGS/USFS partnership) using Landsat imagery to map burn severity and perimeters of fires >1,000 acres across the US from 1984-present.

**URL:** https://www.mtbs.gov/

---

### NEPA
**Official Name:** National Environmental Policy Act

**Description:** Federal law (1970) requiring environmental impact assessment for major federal actions. USFS compliance includes Categorical Exclusions, Environmental Assessments, and Environmental Impact Statements.

**URL:** https://ceq.doe.gov/

---

### NHPA
**Official Name:** National Historic Preservation Act

**Description:** Federal law (1966) requiring Section 106 consultation when federal projects may affect historic properties or archaeological sites.

**URL:** https://www.achp.gov/nhpa

---

### PALS
**Official Name:** Planning, Appeals and Litigation System

**Description:** USFS system for tracking environmental planning projects, appeals, and litigation related to forest management decisions.

**URL:** Internal USFS system

---

### RAVG
**Official Name:** Rapid Assessment of Vegetation Condition after wildfire

**Description:** USFS Remote Sensing Applications Center program delivering burn severity products from satellite imagery within 45 days of fire containment. Complements MTBS program.

**URL:** https://burnseverity.cr.usgs.gov/ravg/

---

### TRACS
**Official Name:** Trail Assessment and Condition Survey

**Description:** USFS methodology and database system for assessing trail conditions, damage inventory, and maintenance prioritization. Legacy system from 1999 using paper-based surveys.

**URL:** Internal USFS system

---

### USDA
**Official Name:** United States Department of Agriculture

**Description:** Federal executive department responsible for farming, forestry, rural development, and food policy. Parent department of USFS.

**URL:** https://www.usda.gov/

---

### USFS
**Official Name:** United States Forest Service

**Description:** Federal agency within USDA managing 193 million acres of national forests and grasslands. Target user of RANGER platform.

**URL:** https://www.fs.usda.gov/

---

## Geospatial & Satellite Technology

### COG
**Official Name:** Cloud Optimized GeoTIFF

**Description:** GeoTIFF file format optimized for cloud storage and HTTP range requests, enabling partial reads without downloading entire files.

**URL:** https://www.cogeo.org/

---

### DBH
**Official Name:** Diameter at Breast Height

**Description:** Standard forestry measurement of tree trunk diameter taken at 4.5 feet above ground level, measured in inches or centimeters.

**URL:** Standard forestry practice

---

### dNBR
**Official Name:** Differenced Normalized Burn Ratio

**Description:** Remote sensing index calculated by subtracting post-fire NBR from pre-fire NBR. Primary method for mapping burn severity from satellite imagery. Values range from -2 to +2, with higher values indicating more severe burns.

**URL:** https://www.un-spider.org/advisory-support/recommended-practices/recommended-practice-burn-severity

---

### EOSDIS
**Official Name:** Earth Observing System Data and Information System

**Description:** NASA system providing distribution and archive of Earth science data from multiple satellite missions.

**URL:** https://www.earthdata.nasa.gov/eosdis

---

### EPSG
**Official Name:** European Petroleum Survey Group (now OGP Geomatics Committee)

**Description:** Registry of geodetic coordinate systems and transformations. EPSG:4326 is the identifier for WGS84 coordinate reference system.

**URL:** https://epsg.org/

---

### GDAL
**Official Name:** Geospatial Data Abstraction Library

**Description:** Open source translator library for raster and vector geospatial data formats, foundational for geospatial processing.

**URL:** https://gdal.org/

---

### GEE
**Official Name:** Google Earth Engine

**Description:** Cloud-based platform for planetary-scale geospatial analysis using satellite imagery catalogs (Landsat, Sentinel-2, MODIS). Not FedRAMP certified.

**URL:** https://earthengine.google.com/

---

### GeoJSON
**Official Name:** Geographic JavaScript Object Notation

**Description:** Open standard JSON-based format for encoding geographic data structures (points, lines, polygons) with coordinate reference systems.

**URL:** https://geojson.org/

---

### GIS
**Official Name:** Geographic Information System

**Description:** Framework for gathering, managing, analyzing, and visualizing spatial and geographic data.

**URL:** General technology category

---

### GPS
**Official Name:** Global Positioning System

**Description:** US satellite-based radionavigation system providing geolocation and time information to GPS receivers anywhere on Earth.

**URL:** https://www.gps.gov/

---

### LiDAR
**Official Name:** Light Detection and Ranging

**Description:** Remote sensing method using laser pulses to measure distance and create high-resolution elevation models and 3D point clouds.

**URL:** https://oceanservice.noaa.gov/facts/lidar.html

---

### MODIS
**Official Name:** Moderate Resolution Imaging Spectroradiometer

**Description:** NASA satellite instrument aboard Terra and Aqua satellites, providing daily imagery for fire detection, land cover, and vegetation monitoring.

**URL:** https://modis.gsfc.nasa.gov/

---

### NBR
**Official Name:** Normalized Burn Ratio

**Description:** Spectral index highlighting burned areas using near-infrared and shortwave-infrared bands: NBR = (NIR - SWIR) / (NIR + SWIR).

**URL:** See dNBR

---

### NDVI
**Official Name:** Normalized Difference Vegetation Index

**Description:** Remote sensing index measuring vegetation health and density: NDVI = (NIR - Red) / (NIR + Red). Values range from -1 to +1.

**URL:** https://www.usgs.gov/landsat-missions/landsat-normalized-difference-vegetation-index

---

### PostGIS
**Official Name:** PostGIS

**Description:** Spatial database extension for PostgreSQL, adding support for geographic objects and spatial queries (ST_* functions).

**URL:** https://postgis.net/

---

### SAM
**Official Name:** Segment Anything Model

**Description:** Meta AI's universal image/video segmentation model with promptable segmentation and zero-shot transfer learning. SAM2 includes video object tracking.

**URL:** https://github.com/facebookresearch/sam2

---

### Sentinel-2
**Official Name:** Sentinel-2

**Description:** European Space Agency (ESA) Earth observation satellites providing high-resolution (10m) multispectral imagery every 5 days for land monitoring.

**URL:** https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2

---

### WGS84
**Official Name:** World Geodetic System 1984

**Description:** Standard coordinate reference system used by GPS, defined as EPSG:4326. Uses latitude/longitude in decimal degrees.

**URL:** https://epsg.io/4326

---

### WFS
**Official Name:** Web Feature Service

**Description:** OGC standard web service for querying and retrieving vector geographic features (GeoJSON, GML).

**URL:** https://www.ogc.org/standard/wfs/

---

### WMS
**Official Name:** Web Map Service

**Description:** OGC standard web service for serving georeferenced map images (PNG, JPEG) generated from spatial databases.

**URL:** https://www.ogc.org/standard/wms/

---

### WMTS
**Official Name:** Web Map Tile Service

**Description:** OGC standard for serving pre-rendered or dynamically-generated georeferenced map tiles at multiple zoom levels.

**URL:** https://www.ogc.org/standard/wmts/

---

## Cloud & Software Technologies

### API
**Official Name:** Application Programming Interface

**Description:** Set of protocols, routines, and tools for building software applications, specifying how software components should interact.

**URL:** General software concept

---

### ASR
**Official Name:** Automatic Speech Recognition

**Description:** Technology converting spoken language into text, used in timber cruising voice transcription (e.g., Whisper).

**URL:** General technology category

---

### CRUD
**Official Name:** Create, Read, Update, Delete

**Description:** Four basic operations of persistent storage in software development.

**URL:** General software concept

---

### FastAPI
**Official Name:** FastAPI

**Description:** Modern Python web framework for building APIs with automatic OpenAPI documentation, type hints, and high performance.

**URL:** https://fastapi.tiangolo.com/

---

### GCP
**Official Name:** Google Cloud Platform

**Description:** Cloud computing services from Google including Cloud Run, Cloud SQL, Vertex AI, BigQuery. Provides FedRAMP High compliant infrastructure.

**URL:** https://cloud.google.com/

---

### OAuth
**Official Name:** Open Authorization

**Description:** Open standard for token-based authentication and authorization, used for secure API access (e.g., ArcGIS Online integration).

**URL:** https://oauth.net/

---

### OSS
**Official Name:** Open Source Software

**Description:** Software with source code available for modification and enhancement, distributed under licenses permitting free use.

**URL:** https://opensource.org/

---

### PWA
**Official Name:** Progressive Web App

**Description:** Web applications using modern APIs to deliver app-like experiences with offline capability and installability. Used for RANGER Field Companion.

**URL:** https://web.dev/progressive-web-apps/

---

### RAG
**Official Name:** Retrieval-Augmented Generation

**Description:** AI architecture pattern combining information retrieval from knowledge bases with LLM generation, used by NEPA Advisor for FSM/FSH compliance queries.

**URL:** https://www.pinecone.io/learn/retrieval-augmented-generation/

---

### REST
**Official Name:** Representational State Transfer

**Description:** Architectural style for distributed hypermedia systems, using HTTP methods (GET, POST, PUT, DELETE) for web services.

**URL:** General architectural pattern

---

### SQL
**Official Name:** Structured Query Language

**Description:** Domain-specific language for managing and querying relational databases.

**URL:** General database language

---

## Machine Learning & AI

### LLM
**Official Name:** Large Language Model

**Description:** AI neural networks trained on massive text datasets to generate human-like text, used for agent reasoning and synthesis (e.g., Gemini 2.0 Flash).

**URL:** General AI technology

---

### ONNX
**Official Name:** Open Neural Network Exchange

**Description:** Open format for representing machine learning models, enabling interoperability across frameworks and deployment platforms.

**URL:** https://onnx.ai/

---

### YOLO
**Official Name:** You Only Look Once

**Description:** Real-time object detection architecture. YOLOv8 is used for trail damage detection in RANGER, providing instance segmentation and pose estimation.

**URL:** https://github.com/ultralytics/ultralytics

---

## RANGER-Specific Terms

### Agent Briefing Event
**Official Name:** Agent Briefing Event (formerly Briefing Object)

**Description:** Standardized JSON message format for inter-agent communication in RANGER, including UI bindings, proof layers, confidence ledgers, and citations. Schema version 1.1.0.

**URL:** See [AGENT-MESSAGING-PROTOCOL.md](file:///Users/jvalenzano/Projects/ranger-twin/docs/architecture/AGENT-MESSAGING-PROTOCOL.md)

---

### Cedar Creek Fire
**Official Name:** Cedar Creek Fire (2022)

**Description:** ~127,000-acre wildfire in Willamette National Forest, Oregon (Aug-Oct 2022). Serves as RANGER's "frozen-in-time" proof-of-concept scenario with publicly available MTBS, Sentinel-2, and 3DEP data.

**URL:** https://inciweb.nwcg.gov/incident/8307/

---

### CDS
**Official Name:** Common Data Schema

**Description:** RANGER's normalized internal data models (RangerSpatialFeature, RangerObservation, RangerMediaReference, RangerTemporalEvent) for ingesting external data sources.

**URL:** See [DATA-INGESTION-ADAPTERS.md](file:///Users/jvalenzano/Projects/ranger-twin/docs/architecture/DATA-INGESTION-ADAPTERS.md)

---

### Confidence Ledger
**Official Name:** Confidence Ledger

**Description:** Per-input confidence tracking system in Agent Briefing Events, classifying data sources into 3 tiers: Tier 1 (90%+), Tier 2 (70-85%), Tier 3 (<70%).

**URL:** See [AGENT-MESSAGING-PROTOCOL.md](file:///Users/jvalenzano/Projects/ranger-twin/docs/architecture/AGENT-MESSAGING-PROTOCOL.md)

---

### Data Tier
**Official Name:** Data Tier

**Description:** Quality classification for ingested data: Tier 1 (direct use, 90%+ confidence), Tier 2 (caution-flagged, 70-85%), Tier 3 (demo/synthetic, <70%).

**URL:** See Confidence Ledger

---

### Tactical Futurism
**Official Name:** Tactical Futurism

**Description:** RANGER's design aesthetic philosophy: "F-35 Cockpit meets National Geographic" - dark mode, glassmorphism, data-dense displays for mission-critical federal operations.

**URL:** See [UX-VISION.md](file:///Users/jvalenzano/Projects/ranger-twin/docs/architecture/UX-VISION.md)

---

### The Crew
**Official Name:** The Crew

**Description:** Collective term for RANGER's five AI agents: Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor, and Recovery Coordinator.

**URL:** See [PROJECT-BRIEF.md](file:///Users/jvalenzano/Projects/ranger-twin/docs/PROJECT-BRIEF.md)

---

## Software Tools & Libraries

### deck.gl
**Official Name:** deck.gl

**Description:** Uber's WebGL-powered framework for visualizing large-scale datasets (millions of points) with 50+ layer types. Used for RANGER's forest inventory visualization.

**URL:** https://deck.gl/

---

### geemap
**Official Name:** geemap

**Description:** Python package for interactive geospatial analysis with Google Earth Engine, used for dNBR calculation and burn severity mapping.

**URL:** https://geemap.org/

---

### GeoServer
**Official Name:** GeoServer

**Description:** Java-based open source server for sharing geospatial data via OGC standards (WMS, WFS, WCS). Used to serve RANGER's burn severity and trail layers.

**URL:** https://geoserver.org/

---

### LangChain
**Official Name:** LangChain

**Description:** Framework for building LLM applications with document loaders, text splitters, vector store integrations, and retrieval chains. Used for NEPA Advisor's RAG pipeline.

**URL:** https://www.langchain.com/

---

### LlamaIndex
**Official Name:** LlamaIndex (formerly GPT Index)

**Description:** Data framework for LLM applications with 100+ data loaders and advanced indexing for complex queries across FSM/FSH/CFR documents.

**URL:** https://www.llamaindex.ai/

---

### MapLibre GL JS
**Official Name:** MapLibre GL JS

**Description:** Open source fork of Mapbox GL JS for rendering vector tiles with WebGL at 60 FPS, supporting 3D terrain and extrusions.

**URL:** https://maplibre.org/

---

### React
**Official Name:** React

**Description:** JavaScript library for building user interfaces with component-based architecture. Foundation of RANGER Command Console.

**URL:** https://react.dev/

---

### rasterio
**Official Name:** rasterio

**Description:** Python library for reading and writing GeoTIFF and other raster formats, providing GDAL bindings with NumPy integration.

**URL:** https://rasterio.readthedocs.io/

---

### Vite
**Official Name:** Vite

**Description:** Next-generation frontend build tool providing fast Hot Module Replacement (HMR) and optimized production builds. Used by RANGER Command Console.

**URL:** https://vitejs.dev/

---

### Whisper
**Official Name:** Whisper

**Description:** OpenAI's state-of-the-art automatic speech recognition model supporting 99 languages. Used for transcribing timber cruiser field voice notes.

**URL:** https://github.com/openai/whisper

---

### xarray
**Official Name:** xarray

**Description:** Python library for multi-dimensional labeled arrays, used for NetCDF, HDF5, and time-series raster data processing.

**URL:** https://xarray.dev/

---

## Esri Technologies

### ArcGIS Collector
**Official Name:** ArcGIS Collector (now ArcGIS Field Maps)

**Description:** Esri's mobile GIS app for field data collection with GPS-verified spatial features.

**URL:** https://www.esri.com/en-us/arcgis/products/arcgis-field-maps/overview

---

### ArcGIS Online
**Official Name:** ArcGIS Online

**Description:** Esri's cloud-based mapping platform with Feature Services for Survey123 and Collector data storage.

**URL:** https://www.arcgis.com/

---

### Survey123
**Official Name:** Survey123 for ArcGIS

**Description:** Esri's form-centric field data collection platform, used for RANGER trail damage assessments and field observations.

**URL:** https://www.esri.com/en-us/arcgis/products/arcgis-survey123/overview

---

## Data Standards & Formats

### HDF5
**Official Name:** Hierarchical Data Format version 5

**Description:** File format for storing large amounts of numerical data with hierarchical structure, commonly used for scientific datasets.

**URL:** https://www.hdfgroup.org/solutions/hdf5/

---

### JSON
**Official Name:** JavaScript Object Notation

**Description:** Lightweight data-interchange format that is easy for humans to read and write and for machines to parse and generate.

**URL:** https://www.json.org/

---

### NetCDF
**Official Name:** Network Common Data Form

**Description:** Self-describing, machine-independent data format for array-oriented scientific data, commonly used for climate and forecast model output.

**URL:** https://www.unidata.ucar.edu/software/netcdf/

---

### XML
**Official Name:** Extensible Markup Language

**Description:** Markup language for encoding documents in human-readable and machine-readable format. Used for FSVeg export format.

**URL:** https://www.w3.org/XML/

---

## Development & Operations

### CI/CD
**Official Name:** Continuous Integration / Continuous Deployment

**Description:** Software development practice combining continuous integration of code changes with automated deployment to production.

**URL:** General DevOps practice

---

### Docker
**Official Name:** Docker

**Description:** Platform for developing, shipping, and running applications in isolated containers. Used for RANGER's local development environment.

**URL:** https://www.docker.com/

---

### Redis
**Official Name:** Redis

**Description:** In-memory data structure store used as database, cache, and message broker. Used for RANGER's Shared Session State.

**URL:** https://redis.io/

---

## Additional Terms

### 3DEP
**Official Name:** 3D Elevation Program

**Description:** USGS program providing nationwide high-resolution topographic data (LiDAR and IfSAR) at 1-10m resolution.

**URL:** https://www.usgs.gov/3d-elevation-program

---

### InciWeb
**Official Name:** Incident Information System

**Description:** Interagency all-hazards incident web information management system providing public fire information and incident updates.

**URL:** https://inciweb.nwcg.gov/

---

### NWCG
**Official Name:** National Wildfire Coordinating Group

**Description:** Interagency group providing coordination, standards, and training for wildland fire management.

**URL:** https://www.nwcg.gov/

---

**Total Terms:** 100+

**Categories:** 
- Federal Systems & Organizations (19)
- Geospatial & Satellite Technology (17)
- Cloud & Software Technologies (10)
- Machine Learning & AI (3)
- RANGER-Specific Terms (7)
- Software Tools & Libraries (13)
- Esri Technologies (3)
- Data Standards & Formats (4)
- Development & Operations (3)
- Additional Terms (3)

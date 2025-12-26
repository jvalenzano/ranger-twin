# Open Source Resources Inventory for Post-Fire Forest Recovery Digital Twin

This document provides a comprehensive inventory of open source tools, public data sources, and cost-effective GCP services for building the post-fire forest recovery digital twin system.

**Last Updated:** 2025-12-19
**Target Platform:** GCP (with FedRAMP High compliance considerations)
**Budget Context:** Public data sources and open source solutions prioritized

---

## 1. BURN SEVERITY ASSESSMENT

### Open Source Satellite Imagery Processing

#### Google Earth Engine (GEE)
- **GitHub:** https://github.com/gee-community/geemap (3,827+ stars)
- **Description:** Python package for interactive geospatial analysis with Google Earth Engine
- **Key Features:**
  - Access to Landsat 5/7/8, Sentinel-2, MODIS imagery
  - Built-in functions for dNBR calculation
  - Jupyter notebook integration
  - Interactive mapping with ipyleaflet
- **License:** MIT
- **Integration:** Python API, works with GCP via Earth Engine API
- **FedRAMP Note:** GEE itself is not FedRAMP certified; use for R&D, migrate to on-prem processing for production

**Supporting Libraries:**
- **earthengine-py-notebooks** (1,502 stars): 360+ Jupyter examples
  - https://github.com/giswqs/earthengine-py-notebooks
- **geetools** (556 stars): Collection of tools for GEE Python API
  - https://github.com/gee-community/geetools
- **eemont** (442 stars): Extended GEE functionality with spectral indices
  - https://github.com/davemlz/eemont

#### Python Geospatial Stack

**rasterio** (Core library for geospatial raster data)
- **GitHub:** Part of MapBox/rasterio ecosystem
- **Purpose:** Read/write GeoTIFF, process satellite imagery
- **Integration:** NumPy, GDAL bindings
- **License:** BSD-3-Clause

**xarray** (For multi-dimensional arrays)
- **Purpose:** Handle NetCDF, HDF5, and time-series raster data
- **Integration:** Dask for parallel processing
- **License:** Apache 2.0

**geopandas** (For vector data)
- **Purpose:** Geospatial operations on vector data
- **Integration:** Pandas, Shapely, Fiona
- **License:** BSD-3-Clause

**geowombat** (195 stars)
- **GitHub:** https://github.com/jgrss/geowombat
- **Purpose:** Utilities for geospatial data using Dask, rasterio, xarray
- **License:** MIT

### dNBR Calculation Tools

**UN-SPIDER Burn Severity Mapping**
- **GitHub:** https://github.com/UN-SPIDER/burn-severity-mapping-EO
- **Description:** Official UN-SPIDER recommended practice for burn severity
- **Features:** Python code for Sentinel-2 dNBR calculation
- **Tutorial:** https://www.un-spider.org/advisory-support/recommended-practices/recommended-practice-burn-severity/Step-by-Step/python-sentinel2
- **License:** Open source

**Open Source Workflow for Burn Severity**
- **Research Paper:** "An open-source workflow for scaling burn severity metrics from drone to satellite" (2024)
- **Description:** Guides users through UAS burn severity classification and scaling to satellite
- **Technologies:** Python, Sentinel-2, Landsat

### Public Burn Severity Data Sources

#### MTBS (Monitoring Trends in Burn Severity)
- **URL:** https://www.mtbs.gov/
- **Coverage:** US wildfires 1984-present, 1,000+ acres
- **Data Format:** Shapefile, GeoTIFF (dNBR, burn severity classes)
- **Access:** Free download, USGS/USFS partnership
- **Update Frequency:** Annual
- **API:** WMS/WFS services available

#### BAER (Burned Area Emergency Response)
- **URL:** https://fsapps.nwcg.gov/baer/
- **Coverage:** USFS emergency assessments post-fire
- **Data Format:** PDF reports, shapefiles
- **Access:** Public, no registration required
- **Content:** Soil burn severity maps, treatment recommendations

#### Copernicus EMS (Emergency Management Service)
- **URL:** https://emergency.copernicus.eu/
- **Coverage:** Global wildfire mapping
- **Data:** Sentinel-2 derived burn severity
- **Format:** GeoJSON, Shapefile, KML
- **License:** Free and open

### GCP-Native Services for Satellite Imagery

**Earth Engine on GCP**
- **Service:** Google Earth Engine via Vertex AI integration
- **Cost:** Free tier: 250 asset reads/month, $0.10/asset read after
- **FedRAMP:** Not certified; suitable for R&D phase only
- **Alternative:** Process imagery using GCP Dataflow + Cloud Storage

**Cloud Storage for Landsat/Sentinel**
- **Public Datasets:**
  - Landsat Collection 2 Level-2: `gs://gcp-public-data-landsat/`
  - Sentinel-2 L1C/L2A: `gs://gcp-public-data-sentinel-2/`
- **Cost:** Free egress within GCP, standard storage pricing
- **Access:** Public buckets, requester pays

---

## 2. TRAIL DAMAGE ASSESSMENT

### Open Source Computer Vision Models

#### YOLO (You Only Look Once) - Object Detection

**YOLOv8 (Ultralytics)**
- **GitHub:** https://github.com/ultralytics/ultralytics (Official implementation)
- **Stars:** Widely adopted (see ecosystem below)
- **Features:**
  - Real-time object detection
  - Instance segmentation
  - Pose estimation
  - Pre-trained COCO weights
- **License:** AGPL-3.0 (commercial license available)
- **Performance:** 50+ FPS on GPU, optimized for edge deployment
- **Fine-tuning:** Transfer learning on custom trail damage datasets

**YOLO Ecosystem Projects:**
- **awesome-yolo-object-detection** (1,655 stars)
  - https://github.com/coderonion/awesome-yolo-object-detection
  - Curated list of YOLO projects and datasets
- **ONNX-YOLOv8-Object-Detection** (472 stars)
  - https://github.com/ibaiGorordo/ONNX-YOLOv8-Object-Detection
  - ONNX format for cross-platform deployment
- **YOLO-Patch-Based-Inference** (515 stars)
  - https://github.com/Koldim2001/YOLO-Patch-Based-Inference
  - Small object detection with patch-based processing

#### Detectron2 (Facebook AI Research)
- **GitHub:** https://github.com/facebookresearch/detectron2 (Official)
- **Description:** Next-gen library for object detection and segmentation
- **Features:**
  - Faster R-CNN, Mask R-CNN, RetinaNet
  - Keypoint detection
  - Panoptic segmentation
- **License:** Apache 2.0
- **Use Cases:** Infrastructure damage detection (roads, buildings)
- **Research:** Road damage detection with Faster R-CNN on Detectron2

**Detectron2 Applications:**
- Road damage classification (cracks, potholes, erosion)
- Infrastructure assessment
- Medical image segmentation (adaptable to trail/vegetation)

#### Segment Anything Model (SAM) - Meta AI

**SAM 2 (Latest)**
- **GitHub:** https://github.com/facebookresearch/sam2 (18,066 stars)
- **Description:** Universal image/video segmentation
- **Features:**
  - Promptable segmentation (point, box, mask)
  - Zero-shot transfer learning
  - Video object tracking
- **License:** Apache 2.0
- **Model Checkpoints:** Multiple sizes (base, large, huge)
- **HuggingFace:** Pre-trained models available

**SAM 3 (Cutting Edge)**
- **GitHub:** https://github.com/facebookresearch/sam3 (6,189 stars)
- **Features:** Fine-tuning capabilities, improved performance
- **Released:** July 2025

**SAM Integration Tools:**
- **segment-lidar** (362 stars): SAM for LiDAR data segmentation
  - https://github.com/Yarroudh/segment-lidar
- **napari-sam** (243 stars): Napari plugin for SAM
  - https://github.com/MIC-DKFZ/napari-sam

### Pre-trained Models on HuggingFace

**Segment Anything Models:**
- **qualcomm/Segment-Anything-Model** (3.1K downloads)
  - Optimized for mobile/edge (TFLite, ONNX)
  - Android-ready
- **qualcomm/Segment-Anything-Model-2** (153 downloads)
  - SAM2 mobile optimization

**Infrastructure Damage Detection (Research):**
- Papers on road damage detection with YOLO/Detectron2
- Adapt to trail infrastructure (bridges, retaining walls, signage)

### Open Datasets for Training

**General Infrastructure Damage:**
- **RoadDamageDataset** (Public): 7,099 images, 13 defect types
  - Used in research: "End-to-end computer vision for infrastructure"
- **COCO (Common Objects in Context):** 330K images, 80 categories
  - Transfer learning baseline

**Trail-Specific (To Create):**
- Leverage SAM for semi-automated annotation
- Use USFS trail assessment photos (if available via FOIA)

### GCP Services for Computer Vision

**Vertex AI Vision**
- **Service:** AutoML Vision, Custom training
- **Cost:**
  - Training: $3.15/node hour
  - Prediction: $1.50/1000 predictions (online), $1.20/1000 (batch)
- **FedRAMP:** Vertex AI is FedRAMP Moderate; High in progress
- **Features:** Pre-trained models, transfer learning, edge deployment

**Cloud TPU/GPU for Training**
- **TPU v3:** $8.00/hour (preemptible $2.40)
- **NVIDIA T4 GPU:** $0.35/hour (preemptible $0.11)
- **Use Case:** Fine-tune YOLOv8 or SAM on trail damage imagery

---

## 3. TIMBER CRUISING / FOREST INVENTORY

### Open Source Species Identification Models

**iNaturalist Models (Limited Direct Access)**
- **Research Note:** iNaturalist computer vision models are proprietary, but datasets are public
- **Dataset:** iNaturalist 2021 (2.7M images, 10K species)
- **Access:** https://github.com/visipedia/inat_comp (competition datasets)
- **Alternative:** Train custom models on iNaturalist data

**HuggingFace Plant Identification (Limited Results)**
- Search returned limited pre-trained forest/tree models
- **Strategy:** Fine-tune general image classification models (ResNet, EfficientNet) on USFS tree datasets

### Voice Transcription Open Source

**OpenAI Whisper**
- **GitHub:** https://github.com/openai/whisper (Official)
- **Stars:** 60K+ (one of most popular ASR projects)
- **Description:** State-of-the-art automatic speech recognition
- **Features:**
  - Multilingual (99 languages)
  - Multiple model sizes (tiny, base, small, medium, large)
  - Transcription and translation
- **License:** MIT
- **Performance:**
  - Large model: near human-level accuracy
  - Base model: Real-time on CPU
- **Use Case:** Transcribe field cruiser voice notes

**Whisper Ecosystem:**
- **awesome-whisper** (1,954 stars): Curated Whisper resources
  - https://github.com/sindresorhus/awesome-whisper
- **whisper_android** (588 stars): Offline ASR for Android
  - https://github.com/vilassn/whisper_android
  - TensorFlow Lite integration

**HuggingFace Whisper Models:**
- **firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3** (23.3K downloads)
  - Emotion recognition (adaptable to timber cruising: urgency, notes)
- **hap20/whisper-small-medical-speech-recognition** (11 downloads)
  - Domain-specific fine-tuning example

**Alternative: Vosk**
- **GitHub:** https://github.com/alphacep/vosk-api
- **Description:** Offline speech recognition
- **License:** Apache 2.0
- **Features:** Lightweight, 20+ languages, mobile-ready
- **Use Case:** Embedded devices, low-latency transcription

### Open Forest Inventory Datasets

**FIA (Forest Inventory and Analysis) - USFS**
- **URL:** https://www.fia.fs.usda.gov/
- **Coverage:** US forests, 300K+ plots
- **Data:**
  - Tree species, DBH, height
  - Plot locations (fuzzed for privacy)
  - Growth, mortality, harvest data
- **Format:** CSV, SQL Server dumps
- **Access:** FIA DataMart (web interface), FIADB (SQL)
- **API:** EVALIDator (web service for queries)
- **License:** Public domain

**USFS GeoData Clearinghouse**
- **URL:** https://data.fs.usda.gov/geodata/
- **Content:** Spatial datasets (boundaries, roads, trails, vegetation)
- **Format:** Shapefile, GeoDatabase, GeoTIFF
- **Access:** Free download

**TreeMap 2016 (EPA/USFS)**
- **URL:** https://www.fs.usda.gov/rds/archive/catalog/RDS-2016-0005
- **Coverage:** Tree canopy coverage, 48 contiguous states
- **Resolution:** 30m
- **Format:** GeoTIFF

### GCP Services for ML Training

**Vertex AI Custom Training**
- **Use Case:** Fine-tune plant.id alternatives on FIA + iNaturalist data
- **Cost:** See Section 2 (GPU/TPU pricing)

**Speech-to-Text API**
- **Service:** Google Cloud Speech-to-Text
- **Cost:** $0.006/15 seconds (standard), $0.009/15 seconds (enhanced)
- **FedRAMP:** Speech-to-Text is FedRAMP Moderate
- **Features:** 120+ languages, speaker diarization, profanity filter
- **Alternative to Whisper:** Managed service, less control

---

## 4. NEPA/REGULATORY COMPLIANCE

### Open Source RAG Frameworks

#### LangChain
- **GitHub:** https://github.com/langchain-ai/langchain (90K+ stars)
- **Description:** Framework for building LLM applications
- **Features:**
  - Document loaders (PDF, Word, HTML, Markdown)
  - Text splitters (recursive, semantic)
  - Vector store integrations (30+ databases)
  - Retrieval chains, agents, tools
- **License:** MIT
- **Use Case:** RAG pipeline for FSM/FSH policy documents

**LangChain RAG Examples:**
- **Retrieval-Augmented-Generation-Engine-with-LangChain-and-Streamlit** (126 stars)
  - https://github.com/mirabdullahyaser/Retrieval-Augmented-Generation-Engine-with-LangChain-and-Streamlit
  - Uses Pinecone, OpenAI GPT-3
- **akcio** (258 stars): RAG demo with LangChain + Milvus
  - https://github.com/zilliztech/akcio
- **rag-conversational-agent** (42 stars): Local RAG with Ollama
  - https://github.com/enricollen/rag-conversational-agent

#### LlamaIndex (formerly GPT Index)
- **GitHub:** https://github.com/run-llama/llama_index (35K+ stars)
- **Description:** Data framework for LLM applications
- **Features:**
  - 100+ data loaders (PDF, Notion, SQL, APIs)
  - Advanced indexing (vector, tree, keyword)
  - Query engines with multi-step reasoning
  - Sub-question decomposition
- **License:** MIT
- **Use Case:** Complex regulatory queries across FSM/FSH/CFR

**LlamaIndex RAG Examples:**
- **ingest-anything** (89 stars): Automated ingestion pipeline
  - https://github.com/AstraBert/ingest-anything
  - PDF → Qdrant vector DB
- **flexible-graphrag** (80 stars): GraphRAG with multiple DBs
  - https://github.com/stevereiner/flexible-graphrag
  - 8 graph DBs, 10 vector DBs, Docling parser

#### Haystack (Deepset AI)
- **GitHub:** https://github.com/deepset-ai/haystack (15K+ stars)
- **Description:** LLM orchestration framework
- **Features:**
  - Modular pipelines
  - Hybrid search (dense + sparse)
  - Multi-modal RAG
- **License:** Apache 2.0
- **Use Case:** Production-grade RAG for compliance

### Public Regulatory Document Sources

**USFS Directives (FSM/FSH)**
- **URL:** https://www.fs.usda.gov/im/directives
- **Content:** Forest Service Manual (policy), Handbook (instructions)
- **Format:** PDF, HTML
- **Access:** Free download, no registration
- **Update Frequency:** Continuous (track amendments)

**Regulations.gov**
- **URL:** https://www.regulations.gov/
- **Content:** Federal regulations, notices, public comments
- **API:** https://open.gsa.gov/api/regulationsgov/ (free, rate limited)
- **Format:** JSON, XML, PDF
- **Use Case:** NEPA documents, public comment periods

**Code of Federal Regulations (CFR)**
- **URL:** https://www.ecfr.gov/
- **Content:** Title 36 (USFS), Title 40 (EPA environmental)
- **Format:** HTML, XML, PDF
- **API:** eCFR API (free)
- **License:** Public domain

**NEPA Documents (DOE NEPA.gov)**
- **URL:** https://ceq.doe.gov/ (Council on Environmental Quality)
- **Content:** Environmental Impact Statements, Assessments
- **Format:** PDF
- **Use Case:** Historical NEPA analysis examples

### Open Source LLMs for RAG

**Gemma 2 (Google)**
- **HuggingFace:** https://huggingface.co/google/gemma-2-9b-it
- **Sizes:** 2B, 9B, 27B parameters
- **License:** Gemma Terms of Use (free for research/commercial)
- **Performance:** Competitive with Llama 3 8B
- **GCP Integration:** Native Vertex AI support

**Llama 3 / Llama 3.1 (Meta)**
- **HuggingFace:** https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- **Sizes:** 8B, 70B, 405B parameters
- **License:** Llama 3 Community License (permissive)
- **Performance:** State-of-the-art open source
- **Instruct Models:** Fine-tuned for Q&A

**Mistral 7B / Mixtral 8x7B**
- **HuggingFace:** https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- **Description:** Efficient 7B model, Mixtral MoE (8 experts)
- **License:** Apache 2.0
- **Performance:** Excellent quality-to-size ratio
- **Use Case:** Cost-effective RAG for regulatory compliance

**Qwen 2.5 (Alibaba Cloud)**
- **HuggingFace:** https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- **Sizes:** 0.5B to 72B parameters
- **License:** Apache 2.0
- **Features:** Long context (128K tokens), multilingual

### GCP Services for LLM Deployment

**Vertex AI Model Garden**
- **Models:** Gemini 1.5 Pro/Flash, Llama 3, Mistral, Claude (Anthropic)
- **Cost:**
  - Gemini 1.5 Flash: $0.075/1M input tokens, $0.30/1M output
  - Gemini 1.5 Pro: $1.25/1M input, $5.00/1M output
- **FedRAMP:** Vertex AI Model Garden is FedRAMP Moderate
- **RAG:** Built-in grounding with Google Search or Enterprise Search

**Vertex AI Vector Search**
- **Description:** Managed vector database (built on ScaNN)
- **Cost:** $0.35/million queries + storage ($0.30/GB/month)
- **Features:** Billion-scale, low-latency similarity search
- **Integration:** LangChain, LlamaIndex connectors

**Document AI**
- **Service:** OCR and document parsing
- **Cost:** $0.60/page (general), $0.20/page (OCR only)
- **Use Case:** Extract text from scanned FSM/FSH PDFs

---

## 5. AGENTIC AI & ORCHESTRATION

### Multi-Agent Frameworks

#### Google ADK (Agent Development Kit)
- **Status:** Primary orchestration layer for RANGER
- **Features:** 
  - ToolCallingAgents for deterministic task execution
  - Orchestrator/Specialist communication patterns
  - Native integration with Gemini 3 Flash
- **FedRAMP:** Uses Vertex AI backend (FedRAMP High)

#### Model Context Protocol (MCP)
- **Status:** Standard for data connectivity
- **Implementations:** 
  - `mcp-nifc`: Fire incident data
  - `mcp-postgres`: Spatial query interface
  - `mcp-filesystem`: Fixture data access
- **Benefits:** Decouples data retrieval from agent logic

### Skills Library Management
Current implementation follows **ADR-005** using a tiered structure:
- **Foundation Skills:** Generic USFS/USDA logic
- **Agency Skills:** Specific forest service protocols
- **Application Skills:** Workflow-specific expertise

---

## 6. MAPPING & VISUALIZATION

### Free Mapping Libraries

#### Leaflet
- **GitHub:** https://github.com/Leaflet/Leaflet (41K+ stars)
- **Description:** Leading open source JavaScript library for mobile-friendly interactive maps
- **License:** BSD-2-Clause
- **Features:**
  - Lightweight (42KB gzipped)
  - Layer control, popups, markers
  - GeoJSON support
  - 100+ plugins
- **Use Case:** 2D base maps, trail overlays, burn severity visualization

**Leaflet Plugins Ecosystem:**
- **Leaflet.draw:** Drawing and editing layers
- **Leaflet.markercluster:** Cluster markers for performance
- **Leaflet.heat:** Heatmap visualization
- **Leaflet.timeline:** Temporal data animation

**Notable Integrations:**
- **iClient-JavaScript** (878 stars): SuperMap GIS integration
  - https://github.com/SuperMap/iClient-JavaScript
  - Supports Leaflet, OpenLayers, MapboxGL
- **mapwidget** (247 stars): Jupyter widgets for Leaflet/Cesium
  - https://github.com/opengeos/mapwidget

#### MapLibre GL JS
- **GitHub:** https://github.com/maplibre/maplibre-gl-js (5K+ stars)
- **Description:** Open source fork of Mapbox GL JS
- **License:** BSD-3-Clause
- **Features:**
  - Vector tiles rendering
  - WebGL-based, 60 FPS
  - 3D terrain, extrusions
  - Client-side data-driven styling
- **Use Case:** High-performance vector maps, 3D visualizations

**MapLibre Ecosystem:**
- **maptiler-geocoding-control** (63 stars): Geocoding plugin
  - https://github.com/maptiler/maptiler-geocoding-control
  - Works with MapLibre, Leaflet, OpenLayers

#### deck.gl (Uber)
- **GitHub:** https://github.com/visgl/deck.gl (12K+ stars)
- **Description:** WebGL-powered framework for large-scale data visualization
- **License:** MIT
- **Features:**
  - Handles millions of data points
  - 50+ layer types (hexagon, heatmap, arc)
  - GeoJSON, CSV, database connectors
  - 3D, time-series animations
- **Use Case:** Visualize forest inventory (100K+ trees), fire perimeters over time

**deck.gl Examples:**
- **path-finding** (20 stars): React + deck.gl + MapLibre pathfinding
  - https://github.com/trinhminhtriet/path-finding

### Free Tile Services

**OpenStreetMap (OSM)**
- **URL:** https://www.openstreetmap.org/
- **Tile Server:** https://tile.openstreetmap.org/{z}/{x}/{y}.png
- **License:** ODbL (Open Database License)
- **Rate Limit:** Fair use policy, max 2 requests/sec
- **Use Case:** Base map tiles, hiking trails, roads

**Stadia Maps (Free Tier)**
- **URL:** https://stadiamaps.com/
- **Free Tier:** 20,000 tile requests/month
- **Features:** Multiple map styles (Alidade, Stamen Terrain)
- **License:** Commercial-friendly
- **API:** REST API, MapLibre/Leaflet plugins

**MapTiler (Free Tier)**
- **URL:** https://www.maptiler.com/
- **Free Tier:** 100,000 tile loads/month
- **Features:** Satellite, terrain, streets, custom styles
- **License:** Commercial use allowed (free tier)
- **API:** Vector tiles, raster tiles, geocoding

**USGS National Map**
- **URL:** https://basemap.nationalmap.gov/
- **Tiles:** Imagery, topographic, hydrography
- **License:** Public domain (US government)
- **Format:** WMTS, WMS
- **Use Case:** Federal-friendly base maps

### Open Source Spatial Servers

**GeoServer**
- **GitHub:** https://github.com/geoserver/geoserver (3.8K+ stars)
- **Description:** Java-based server for sharing geospatial data
- **License:** GPL 2.0
- **Features:**
  - WMS, WFS, WCS, WPS services
  - Vector and raster support
  - Styling (SLD), security (GeoFence)
  - PostGIS, Oracle Spatial, Shapefile connectors
- **Use Case:** Serve forest inventory, burn severity layers

**MapServer**
- **GitHub:** https://github.com/MapServer/MapServer (1K+ stars)
- **Description:** CGI-based platform for publishing spatial data
- **License:** MIT
- **Features:** OGC-compliant (WMS, WFS, WCS)
- **Use Case:** Lightweight alternative to GeoServer

**TileServer GL**
- **GitHub:** https://github.com/maptiler/tileserver-gl (2K+ stars)
- **Description:** Vector and raster maps with GL styles
- **License:** BSD-2-Clause
- **Features:** MBTiles, GeoJSON, static maps API
- **Use Case:** Self-hosted vector tile server

### GCP Services for Geospatial

**Google Maps Platform (with free tier)**
- **Maps JavaScript API:** $7/1000 loads (free $200/month credit)
- **Static Maps API:** $2/1000 requests
- **FedRAMP:** Not certified; use OSS alternatives for production

**Cloud Storage + Cloud CDN**
- **Use Case:** Host custom map tiles (GeoTIFF → XYZ tiles)
- **Cost:** Storage $0.020/GB/month, CDN $0.085/GB egress
- **Strategy:** Pre-render tiles, serve via CDN for <$50/month

**BigQuery GIS**
- **Description:** Spatial SQL analytics
- **Cost:** $5/TB scanned (first 1TB/month free)
- **Features:** ST_* functions, GeoJSON export
- **Use Case:** Analyze forest inventory spatial queries at scale

---

## INTEGRATION PATTERNS

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  React + MapLibre GL JS + deck.gl (3D visualizations)       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   API LAYER (FastAPI)                       │
│  - Burn severity queries                                    │
│  - Trail damage detection API                               │
│  - Timber inventory search                                  │
│  - NEPA RAG Q&A                                             │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ BURN SEVERITY  │  │ TRAIL DAMAGE    │  │  TIMBER CRUISE  │
│                │  │                 │  │                 │
│ - GEE Python   │  │ - YOLOv8/SAM2  │  │ - Whisper ASR  │
│ - rasterio     │  │ - Vertex AI    │  │ - Custom ML    │
│ - MTBS data    │  │ - GCS storage  │  │ - FIA data     │
└────────────────┘  └─────────────────┘  └─────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              NEPA COMPLIANCE RAG SYSTEM                     │
│  LangChain/LlamaIndex + Vertex AI Vector Search            │
│  Gemma 2 9B (or Gemini 1.5 Flash) + FSM/FSH docs          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  DATA STORAGE LAYER                         │
│  - Cloud Storage (imagery, models)                         │
│  - BigQuery (structured forest inventory)                  │
│  - Vertex AI Vector Search (document embeddings)           │
│  - PostgreSQL + PostGIS (geospatial relational)            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 MAPPING SERVICES                            │
│  - GeoServer (WMS/WFS for layers)                          │
│  - TileServer GL (vector tiles)                            │
│  - OSM/Stadia Maps (base maps)                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Pipeline Pattern

1. **Satellite Imagery Ingestion:**
   - Use Google Earth Engine API to query Sentinel-2/Landsat
   - Store raw imagery in Cloud Storage buckets
   - Process dNBR with geemap/rasterio on Cloud Run jobs
   - Publish burn severity as Cloud Optimized GeoTIFF (COG)

2. **Trail Damage Detection:**
   - Ingest drone/trail camera imagery to GCS
   - Run YOLOv8 inference on Vertex AI Prediction (GPU)
   - Store detections in BigQuery with geometry
   - Serve via FastAPI + PostGIS for map visualization

3. **Timber Inventory:**
   - Record field cruiser audio in mobile app
   - Transcribe with Whisper (Cloud Run or local)
   - Parse structured data (species, DBH, health)
   - Store in BigQuery, link to plot geometries in PostGIS

4. **NEPA Compliance:**
   - Ingest FSM/FSH PDFs with Document AI OCR
   - Chunk documents with LangChain RecursiveTextSplitter
   - Generate embeddings with Vertex AI Embeddings API
   - Index in Vertex AI Vector Search
   - Query with LlamaIndex RetrieverQueryEngine + Gemma 2 9B

### Cost Optimization Strategies

**Free/Low-Cost Tier Maximization:**
- Use OpenStreetMap + Stadia Maps (20K tiles/month free)
- Self-host GeoServer on GCE e2-micro (always free tier)
- Use Vertex AI free trial credits ($300) for initial ML training
- Store imagery as COG to enable partial reads (reduce egress)

**Hybrid Cloud/Local:**
- Run Whisper ASR on local workstation (avoid Speech-to-Text API costs)
- Use Google Earth Engine for R&D, export final dNBR to GCS
- Self-host LLM (Gemma 2 9B) on GCE spot instance ($0.10/hour)

**Open Source First:**
- Prioritize Leaflet/MapLibre over Google Maps Platform
- Use LangChain + local LLM instead of Vertex AI Gemini for development
- Deploy YOLOv8 ONNX models to Cloud Run (serverless, pay-per-use)

---

## FEDRAMP COMPLIANCE NOTES

### FedRAMP High Compatible Services (GCP)
- Cloud Storage (FedRAMP High)
- Compute Engine (FedRAMP High)
- BigQuery (FedRAMP High)
- Cloud SQL (FedRAMP High)
- Vertex AI (FedRAMP Moderate; High in progress)

### Non-Compliant Services (Use OSS Alternatives)
- Google Earth Engine (not FedRAMP certified)
  - **Alternative:** Self-hosted rasterio + xarray on GCE
- Google Maps Platform (not FedRAMP High)
  - **Alternative:** Leaflet + MapLibre + OSM/USGS tiles

### Data Residency
All GCP resources must be provisioned in:
- **Region:** us-east4 (Northern Virginia) or us-central1 (Iowa)
- **Encryption:** FIPS 140-2 validated keys (Cloud KMS)
- **Audit:** Cloud Audit Logs enabled (1-year retention)

---

## SUMMARY TABLE

| Component | Open Source Tools | Public Data Sources | GCP Services (Cost-Effective) |
|-----------|------------------|---------------------|-------------------------------|
| **Burn Severity** | geemap, rasterio, xarray, UN-SPIDER scripts | MTBS, BAER, Copernicus, Landsat/Sentinel buckets | Cloud Storage (COG), Cloud Run (dNBR processing) |
| **Trail Damage** | YOLOv8, Detectron2, SAM2 | RoadDamageDataset, COCO | Vertex AI Prediction (GPU), Cloud Storage |
| **Timber Cruise** | Whisper (OpenAI), Vosk | FIA, USFS GeoData, iNaturalist datasets | Speech-to-Text API (optional), Vertex AI Custom Training |
| **NEPA Compliance** | LangChain, LlamaIndex, Haystack, Gemma 2, Llama 3, Mistral | FSM/FSH, Regulations.gov, eCFR | Vertex AI Vector Search, Document AI, Gemini Flash |
| **Mapping** | Leaflet, MapLibre GL JS, deck.gl, GeoServer | OSM, Stadia Maps, MapTiler, USGS National Map | Cloud CDN (tile serving), BigQuery GIS |

---

## NEXT STEPS

1. **Prototype Phase (Weeks 1-4):**
   - Set up geemap + Google Earth Engine for burn severity R&D
   - Train YOLOv8 on COCO, fine-tune on 100 sample trail images
   - Deploy Whisper base model locally for audio transcription tests
   - Ingest sample FSM documents into LangChain + Gemma 2 RAG

2. **Data Acquisition (Weeks 5-8):**
   - Download MTBS burn severity for target region (Dixie Fire, CA as case study)
   - Request USFS trail photos via FOIA or public datasets
   - Export FIA data for CA Region 5 from FIA DataMart
   - Scrape FSM/FSH directives (Chapters 2400 Timber, 1950 NEPA)

3. **Integration Testing (Weeks 9-12):**
   - Deploy GeoServer with burn severity + trail layers
   - Build Leaflet + deck.gl frontend with layer toggles
   - Connect Vertex AI Vector Search to NEPA RAG backend
   - End-to-end test: query "What are timber salvage requirements post-fire?" → retrieve FSM 2430

4. **FedRAMP Remediation (Weeks 13-16):**
   - Migrate Earth Engine workflows to self-hosted rasterio + Cloud Run
   - Replace any Google Maps API calls with MapLibre + OSM tiles
   - Enable Cloud Audit Logs, configure FIPS 140-2 encryption
   - Document NIST 800-53 controls for ATO package

---

## REFERENCES

### Key GitHub Repositories
1. **geemap:** https://github.com/gee-community/geemap
2. **UN-SPIDER Burn Severity:** https://github.com/UN-SPIDER/burn-severity-mapping-EO
3. **YOLOv8 (Ultralytics):** https://github.com/ultralytics/ultralytics
4. **Detectron2:** https://github.com/facebookresearch/detectron2
5. **Segment Anything (SAM2):** https://github.com/facebookresearch/sam2
6. **Whisper (OpenAI):** https://github.com/openai/whisper
7. **LangChain:** https://github.com/langchain-ai/langchain
8. **LlamaIndex:** https://github.com/run-llama/llama_index
9. **Leaflet:** https://github.com/Leaflet/Leaflet
10. **MapLibre GL JS:** https://github.com/maplibre/maplibre-gl-js
11. **deck.gl:** https://github.com/visgl/deck.gl
12. **GeoServer:** https://github.com/geoserver/geoserver

### Public Data Sources
- **MTBS:** https://www.mtbs.gov/
- **BAER:** https://fsapps.nwcg.gov/baer/
- **FIA:** https://www.fia.fs.usda.gov/
- **USFS Directives:** https://www.fs.usda.gov/im/directives
- **Regulations.gov:** https://www.regulations.gov/
- **eCFR:** https://www.ecfr.gov/
- **GCP Public Datasets:** https://cloud.google.com/storage/docs/public-datasets

### Research Papers
- "An open-source workflow for scaling burn severity metrics from drone to satellite" (2024)
- "Automating container damage detection with YOLO-NAS" (2024)
- UN-SPIDER Recommended Practice on Burn Severity Mapping (2024)

---

**Document Version:** 1.0
**Prepared For:** USFS Portfolio - Digital Twin Project
**Budget Context:** Open source maximization, GCP cost optimization
**Compliance Target:** FedRAMP High (DoD IL5 equivalent)

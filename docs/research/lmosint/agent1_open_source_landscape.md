# LMOSINT Open Source Landscape Analysis

**Agent 1: Open Source Landscape Analyst**
**Date:** 2026-03-08
**Scope:** Wildfire management, land management, environmental monitoring, and OSINT intelligence platforms

---

## Executive Summary

The open source ecosystem for wildfire and land management tooling is broad but deeply fragmented. Hundreds of repositories exist across GitHub, spanning fire spread simulation (ForeFire, ELMFIRE, Cell2Fire), ML-based detection (Pyronear, MITRE SimFire), operational decision support (BC Wildfire Predictive Services), hydrology data retrieval (HyRiver), and geospatial AI foundations (GeoAI, TerraTorch). Government agencies (USDA Forest Service, USGS) publish domain-specific tools -- WindNinja for wind modeling, FIESTA for forest inventory, dataRetrieval/EGRET for water quality -- but these operate as isolated, single-domain utilities. The closest analog to multi-source intelligence synthesis is koala73/worldmonitor (33.5k stars), a geopolitical OSINT dashboard that aggregates 435+ feeds with cross-stream correlation and anomaly detection, but it has zero environmental domain coverage and no reasoning layer.

The critical finding is a structural white space: **no existing project performs cross-domain intelligence synthesis across fire, weather, hydrology, ecology, and regulatory data with on-demand reasoning**. Every project identified falls into one of three categories: (1) single-domain monitoring dashboards, (2) simulation/modeling engines, or (3) data retrieval libraries. None combines multi-source signal fusion with domain-expert reasoning to answer complex, contextual questions like "Given current burn severity in Unit 7, downstream watershed conditions, and NEPA constraints, what is the optimal salvage timber sequencing?" This is precisely the LMOSINT value proposition.

The ecosystem does provide high-quality building blocks. HyRiver offers battle-tested APIs for USGS/NOAA hydrology data. WindNinja provides operational wind modeling used on every large US fire. Pyronear's alert management architecture (FastAPI + PostgreSQL) demonstrates a clean pattern for event-driven intelligence pipelines. The worldmonitor project's signal aggregation architecture -- multi-source fusion with z-score anomaly detection and regional convergence scoring -- is directly instructive for LMOSINT's cross-domain correlation engine. The recommendation is to build the intelligence synthesis and reasoning layers from scratch while composing data ingestion from existing libraries where possible.

---

## Top 10 Architecturally Relevant Projects

### 1. koala73/worldmonitor

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/koala73/worldmonitor](https://github.com/koala73/worldmonitor) |
| **Stars** | 33,500 |
| **Last Commit** | Active (March 2026) |
| **Tech Stack** | Vanilla TypeScript, Vercel Edge Functions (60+), Redis (3-tier caching), globe.gl + Three.js, deck.gl, Protocol Buffers, Tauri (desktop) |
| **Data Sources** | 435+ RSS feeds, ADS-B flight tracking, AIS vessel data, Telegram OSINT (26 channels), Polymarket prediction markets, earthquake/fire/protest feeds, 92 stock exchanges, OREF rocket alerts |
| **What It Solves** | Real-time geopolitical OSINT dashboard with multi-source signal fusion, cross-stream correlation across 14 signal types, and Country Instability Index scoring |
| **Gap** | Zero environmental/land management domain coverage. No reasoning layer -- correlation is statistical (z-scores), not causal or domain-aware. No ability to answer complex questions; it is a monitoring dashboard, not an intelligence synthesis platform. No regulatory knowledge integration. |
| **LMOSINT Relevance** | **HIGH** -- The signal aggregation architecture (Welford's algorithm for temporal baselines, regional convergence scoring, multi-source fusion with severity escalation) is the closest existing analog to what LMOSINT needs for cross-domain environmental signal correlation. The 22 typed service domains via proto-first API design is a strong pattern for multi-agent data access. |

### 2. bcgov/wps (BC Wildfire Predictive Services)

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/bcgov/wps](https://github.com/bcgov/wps) |
| **Stars** | 64 |
| **Last Commit** | January 2025 |
| **Tech Stack** | Python/FastAPI (57%), React/TypeScript (39%), PostgreSQL/PostGIS, Redis, Docker, pg_tileserv for vector tiles |
| **Data Sources** | Canadian Forest Fire Weather Index (CFFDRS), BC Wildfire Service data, weather station observations, fuel type layers |
| **What It Solves** | Operational wildfire decision support for BC -- fire weather forecasting, predictive services, prevention/preparedness/response/recovery workflows |
| **Gap** | Canada-specific (CFFDRS, not US NFDRS). Single-domain (fire weather only). No hydrology, ecology, or regulatory integration. No reasoning or question-answering capability. Dashboard-oriented, not intelligence-oriented. |
| **LMOSINT Relevance** | **MEDIUM-HIGH** -- The full-stack architecture (FastAPI + PostGIS + React + vector tiles) is a mature pattern for geospatial decision support. The separation of research (wps-research) from operational code is a good organizational pattern. Their integration of weather station data with fire weather indices demonstrates domain-specific data fusion. |

### 3. Pyronear Ecosystem

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/pyronear](https://github.com/pyronear) |
| **Stars** | pyro-api: 25, pyro-engine: 13, pyro-vision: ~200 (estimated), pyro-platform: ~15 |
| **Last Commit** | January 2025 (pyro-engine active on develop branch) |
| **Tech Stack** | Python (FastAPI, ONNX Runtime, PyTorch), PostgreSQL, Docker Compose, Hugging Face model hosting, edge inference on Raspberry Pi |
| **Data Sources** | Camera feeds (Reolink, Hikvision, RTSP, HTTP snapshot), custom-trained wildfire detection models |
| **What It Solves** | End-to-end wildfire early detection: edge device CV inference -> alert management API -> monitoring platform. Camera adapter pattern supports multiple hardware types. |
| **Gap** | Detection-only -- no post-fire analysis, no recovery planning, no data fusion beyond camera feeds. Alert management is simple CRUD, not intelligence synthesis. No integration with satellite data, weather, hydrology, or regulatory frameworks. No reasoning capability. |
| **LMOSINT Relevance** | **MEDIUM** -- The alert management API pattern (FastAPI + PostgreSQL with event-driven architecture) is a clean model for LMOSINT's intelligence pipeline. The camera adapter pattern (unified interface across hardware via adapters) is instructive for LMOSINT's data source abstraction layer. The edge-to-cloud architecture demonstrates a viable deployment pattern for field-connected intelligence. |

### 4. firelab/windninja (USDA Forest Service)

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/firelab/windninja](https://github.com/firelab/windninja) |
| **Stars** | 155 |
| **Last Commit** | June 2025 (v3.12.1) |
| **Tech Stack** | C++ (68%), JavaScript (18%), CMake, Boost, NetCDF, GDAL, Qt, OpenFOAM |
| **Data Sources** | NWS mesoscale weather models (HRRR, RAP, NBM), surface wind measurements, DEM/terrain data |
| **What It Solves** | High-resolution diagnostic wind modeling for wildland fire. Used on nearly every large fire incident in the US. 3,000+ users in 70 countries, 7M runs/year. Embedded in WFDSS, IFTDSS, FlamMap, FSPro. |
| **Gap** | Single-domain tool (wind only). No fire behavior modeling itself -- it feeds into other tools. C++ codebase with heavy dependencies makes integration difficult. No API-first design. No intelligence or reasoning layer. |
| **LMOSINT Relevance** | **MEDIUM** -- WindNinja is an essential upstream data source for fire behavior analysis. LMOSINT would consume WindNinja outputs rather than integrate the codebase. The key insight is that WindNinja demonstrates the value of high-fidelity domain-specific models that feed into broader decision systems -- LMOSINT should integrate with such tools rather than replace them. |

### 5. lautenberger/elmfire

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/lautenberger/elmfire](https://github.com/lautenberger/elmfire) |
| **Stars** | 55 |
| **Last Commit** | May 2025 |
| **Tech Stack** | Fortran (54%), Shell (37%), Python (9%), MPI-parallelized |
| **Data Sources** | Fuel/vegetation rasters, weather data, DEM, Rothermel fire behavior models |
| **What It Solves** | Operational wildfire spread forecasting. Used by Pyrecast to forecast spread of most large fires in CONUS. Can run 100M+ simulations at 30m resolution across CONUS in ~5 days. Monte Carlo burn probability estimation. |
| **Gap** | Pure simulation engine -- no data ingestion, no decision support, no intelligence layer. Fortran codebase limits integration options. No post-fire recovery analysis. Input preparation is complex and manual. |
| **LMOSINT Relevance** | **MEDIUM** -- ELMFIRE represents the gold standard for operational fire spread modeling. LMOSINT should treat it as an external oracle: query ELMFIRE/Pyrecast outputs for fire spread forecasts rather than building competing simulation. The REST API integration via Firemap demonstrates how simulation engines can be wrapped for consumption. |

### 6. HyRiver / pygeohydro (USGS Hydrology Stack)

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/hyriver/pygeohydro](https://github.com/hyriver/pygeohydro) |
| **Stars** | 87 |
| **Last Commit** | January 2025 |
| **Tech Stack** | Python, async HTTP with persistent caching (AsyncRetriever), pandas/xarray |
| **Data Sources** | NWIS (USGS streamflow), CAMELS, Water Quality Portal (1.5M+ sites), NID (dams), NLCD (land cover), SSEBop (evapotranspiration), WBD (watershed boundaries), gNATSGO/SoilGrids (soils), FEMA NFHL (flood hazard), eHydro (USACE bathymetry), SensorThings API (real-time USGS sensors) |
| **What It Solves** | Unified Python API for retrieving hydroclimate data from 12+ US government web services. Handles chunking, caching, and format normalization automatically. |
| **Gap** | Data retrieval only -- no analysis, no fusion, no reasoning. US-only coverage. No fire, ecology, or regulatory data. No intelligence or decision support. Library, not platform. |
| **LMOSINT Relevance** | **HIGH** -- This is a direct composable building block. HyRiver solves the hard problem of accessing fragmented US government hydrology data through a clean Python API. LMOSINT's hydrology data connector should wrap or directly use HyRiver rather than reimplementing USGS/NOAA API integrations. The async retrieval with persistent caching pattern is exactly right for an intelligence platform. |

### 7. forefireAPI/forefire

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/forefireAPI/forefire](https://github.com/forefireAPI/forefire) |
| **Stars** | 77 |
| **Last Commit** | November 2025 |
| **Tech Stack** | C++ (59%), Python (29%), CMake, MPI, Docker, NetCDF |
| **Data Sources** | Terrain/fuel rasters (NetCDF), MesoNH atmospheric model coupling |
| **What It Solves** | Open-source wildfire simulation engine with coupled fire-atmosphere modeling. ROS fire behavior models, Python bindings, HTTP interface, multiple output formats (KML, GeoJSON, NetCDF). |
| **Gap** | Simulation-only. European-focused (Corsican fire data). No intelligence, decision support, or data fusion. Complex coupled atmospheric simulation is niche. No post-fire analysis capability. |
| **LMOSINT Relevance** | **LOW-MEDIUM** -- ForeFire's Python bindings and HTTP interface make it more integrable than most simulation engines. The coupled fire-atmosphere approach is scientifically important but operationally niche. The multi-output format support (KML, GeoJSON, NetCDF) demonstrates good interoperability practices. |

### 8. fire2a (Fire Management & Advanced Analytics)

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/fire2a](https://github.com/fire2a) |
| **Stars** | Varies by repo (C2FK, C2FSB, Fire-Analytics-ToolBox) |
| **Last Commit** | Active (2024-2025) |
| **Tech Stack** | C++ (simulator core), Python (analytics/optimization), QGIS plugin integration |
| **Data Sources** | Landscape rasters, fuel models (KITRAL for Chile, Scott & Burgan for US), weather inputs |
| **What It Solves** | Stochastic wildfire simulation for landscape-scale risk assessment. Monte Carlo burn probability mapping. QGIS Processing Toolbox integration for accessibility. Optimization for fire-resilient landscape planning. |
| **Gap** | Simulation and optimization only. No data ingestion from live sources. No intelligence or reasoning. Chilean focus (KITRAL) limits US applicability though Scott & Burgan variant exists. No post-fire recovery, regulatory, or ecological integration. |
| **LMOSINT Relevance** | **MEDIUM** -- The optimization approach (creating fire-resilient landscapes through mathematical optimization) is conceptually aligned with LMOSINT's need to synthesize information for recovery planning. The QGIS plugin architecture demonstrates how analytical tools can be wrapped in accessible interfaces. The fire2a-lib Python package provides reusable GIS algorithms. |

### 9. mitrefireline/simfire

| Attribute | Detail |
|-----------|--------|
| **URL** | [github.com/mitrefireline/simfire](https://github.com/mitrefireline/simfire) |
| **Stars** | 51 |
| **Last Commit** | November 2024 |
| **Tech Stack** | Python (100%), PyGame, YAML config, pip-installable |
| **Data Sources** | BurnMD historical fire data, Rothermel model parameters, configurable landscape grids |
| **What It Solves** | RL training environment for wildfire suppression agents. Multi-agent simulation where AI agents learn optimal fire mitigation strategies (fireline, wetline, scratchline placement). |
| **Gap** | Training environment only -- not operational. No real data ingestion. No decision support for human operators. No post-fire analysis. No cross-domain integration. |
| **LMOSINT Relevance** | **LOW-MEDIUM** -- The multi-agent RL approach to fire management decision-making is conceptually interesting for LMOSINT's multi-agent architecture. The SimHarness companion project demonstrates how to build training harnesses around simulation environments. However, the operational gap between RL training and real-world intelligence synthesis is large. |

### 10. Open Foris (FAO) / SEPAL

| Attribute | Detail |
|-----------|--------|
| **URL** | [openforis.org](https://www.openforis.org/), [github.com/openforis](https://github.com/openforis) |
| **Stars** | Varies by tool |
| **Last Commit** | Active (FAO-maintained) |
| **Tech Stack** | Java (Collect/Arena), Python (SEPAL), Google Earth Engine integration, cloud-based processing |
| **Data Sources** | Satellite imagery (Google Earth, Sentinel, Landsat), field survey data, land cover databases |
| **What It Solves** | Forest and land monitoring for national-scale MRV (Measurement, Reporting, Verification). Used by 65 countries for UNFCCC forest submissions. SEPAL provides cloud-based satellite imagery analysis without coding. Whisp supports deforestation regulation compliance. |
| **Gap** | Monitoring and reporting focused, not intelligence synthesis. No fire-specific analysis. No real-time data fusion. No reasoning or question-answering. Designed for periodic national reporting, not operational decision support. Heavy institutional/governmental orientation. |
| **LMOSINT Relevance** | **MEDIUM** -- Open Foris demonstrates how to build accessible tools for complex environmental analysis at scale. SEPAL's approach to democratizing satellite imagery analysis (no-code cloud processing) is instructive for LMOSINT's UX. The MRV framework shows how to structure evidence chains for regulatory compliance -- directly relevant to LMOSINT's NEPA/regulatory intelligence needs. The 91% adoption rate across 65 countries proves that accessible tooling drives adoption. |

---

## Government Agency Repository Analysis

### USDA Forest Service ([github.com/USDAForestService](https://github.com/USDAForestService))

Key repositories:
- **fs-open-forest-platform**: Online permitting platform (Angular/Node.js). Not relevant to intelligence.
- **FIESTA**: Forest Inventory ESTimation and Analysis -- R-based statistical tool for FIA data. Useful for timber volume/growth estimates.
- **ForestVegetationSimulator**: Growth and yield modeling. Potential input for recovery planning.
- **WindNinja** (under firelab org): Covered above as a top-10 project.
- **gdalraster**: R bindings for GDAL. Utility library.

**Assessment**: USFS repos are domain-specific tools, not platforms. The most LMOSINT-relevant are WindNinja (fire weather) and FIESTA (forest inventory). Neither provides intelligence synthesis. The permitting platform (fs-open-forest) shows USFS's direction toward digital service delivery but is operationally separate from land management intelligence.

### USGS ([github.com/usgs](https://github.com/usgs), [github.com/DOI-USGS](https://github.com/DOI-USGS))

Key repositories and tools:
- **dataRetrieval**: R package for USGS/EPA water quality and streamflow data. Production-grade.
- **EGRET**: Long-term water quality trend analysis (WRTDS method).
- **river-dl**: Deep learning for river system environmental variable prediction.
- **ModFlow**: Groundwater flow modeling. Industry standard.
- **ShakeMap/PAGER**: Earthquake impact assessment tools.
- **Py3DEP**: Python access to 3D Elevation Program lidar data (part of HyRiver stack).
- **geoknife**: Gridded data subsetting by irregular features (watersheds, etc.).

**Assessment**: USGS repos are the most data-rich of any government org. The Python ecosystem (HyRiver stack) is particularly well-designed for programmatic access. For LMOSINT, the hydrology tools (dataRetrieval, HyRiver, river-dl) are directly composable. The earthquake tools (ShakeMap) demonstrate how USGS approaches rapid impact assessment -- a pattern transferable to fire impact assessment.

---

## Pyronear Deep Dive: Alert Management Patterns

The Pyronear ecosystem ([github.com/pyronear](https://github.com/pyronear)) consists of six coordinated repositories forming an end-to-end pipeline:

```
Camera Hardware -> pyro-engine (edge inference) -> pyro-api (alert management) -> pyro-platform (monitoring UI)
                   pyro-vision (model training)    pyro-storage (data curation)
                   pyro-risks (risk forecasting)
```

**Alert Management Architecture (pyro-api)**:
- FastAPI REST backend with PostgreSQL persistence
- Docker Compose orchestration for local and production deployment
- PyClient Python library for programmatic alert submission
- Swagger/OpenAPI documentation auto-generated
- Apache 2.0 licensing enables commercial reuse

**What LMOSINT can learn from Pyronear**:
1. **Adapter pattern for data sources**: pyro-engine's camera adapter pattern (Reolink, Hikvision, RTSP, HTTP, Mock) provides a clean abstraction for heterogeneous data sources. LMOSINT needs equivalent adapters for FIRMS, NOAA, USGS, IRWIN, etc.
2. **Edge-to-cloud pipeline**: The detection-on-edge -> alert-via-API -> display-on-platform pipeline is a proven pattern for field-connected intelligence systems.
3. **Separation of concerns**: Model training (pyro-vision), inference (pyro-engine), alert management (pyro-api), and visualization (pyro-platform) are cleanly separated repositories. This modularity enables independent evolution.

**What Pyronear does NOT do (and LMOSINT must)**:
- No cross-domain data fusion (fire + weather + hydrology + ecology)
- No reasoning or question-answering capability
- No regulatory knowledge integration
- No temporal analysis beyond immediate detection
- No recovery planning or post-fire assessment
- Alerts are binary events, not intelligence products

---

## worldmonitor Deep Dive: Signal Aggregation Architecture

The [koala73/worldmonitor](https://github.com/koala73/worldmonitor) project (33.5k stars) is the most architecturally instructive project for LMOSINT, despite having zero environmental domain coverage. Key architectural patterns:

**Multi-Source Signal Fusion**:
- 14 signal types (news, military flights, naval vessels, protests, AIS disruptions, satellite fires, keyword spikes, etc.)
- Temporal baseline anomaly detection using Welford's algorithm (online mean/variance calculation)
- Z-score thresholds (1.5 / 2.0 / 3.0) flag deviations from baseline
- Regional convergence scoring: severity escalates when multiple signal types spike in the same geographic area

**Cross-Stream Correlation**:
- Detects patterns across news, markets, military, and prediction market signals
- Country Instability Index (CII) blends weighted multi-signal inputs into stability scores
- 4-tier LLM provider chain (Ollama -> Groq -> OpenRouter -> browser T5) for AI-synthesized briefs

**Architecture Decisions Relevant to LMOSINT**:
- Proto-first API design with 22 typed service domains and auto-generated clients
- 60+ Vercel Edge Functions split into per-domain thin entry points (~85% cold-start reduction)
- 3-tier Redis caching strategy for feed aggregation
- Vanilla TypeScript without framework overhead -- suggests performance-critical OSINT systems benefit from minimal abstraction
- 5 variant deployments from single codebase (Geopolitics, Tech, Finance, Commodities, Positive News) -- demonstrates multi-persona deployment from shared infrastructure

**What worldmonitor does NOT do (and LMOSINT must)**:
- No domain-specific reasoning (statistical correlation only, no causal or expert reasoning)
- No question-answering (it presents signals, does not answer questions)
- No environmental/land management data sources
- No regulatory or compliance knowledge
- No multi-agent reasoning architecture
- No structured evidence chains or citations ("proof layer")
- Dashboard paradigm, not intelligence synthesis paradigm

---

## White Space Analysis

### What No Existing Project Does

After surveying 50+ repositories across wildfire, land management, hydrology, environmental monitoring, geospatial AI, and OSINT domains, the following capabilities exist **nowhere in the open source ecosystem**:

#### 1. Cross-Domain Intelligence Synthesis
No project fuses fire data (FIRMS, IRWIN, burn severity) with weather data (NOAA, HRRR) with hydrology data (USGS streamflow, watershed health) with ecology data (vegetation recovery, species impact) with regulatory data (NEPA, ESA, NFMA) into a unified reasoning context. Every project operates within a single domain.

#### 2. On-Demand Reasoning Over Fused Data
No project answers complex, contextual questions that require synthesizing information across domains. The closest is worldmonitor's AI-synthesized briefs, but these are LLM summaries of news feeds, not domain-expert reasoning over structured environmental data.

#### 3. Regulatory Intelligence Integration
No wildfire/land management tool integrates regulatory knowledge (NEPA procedures, ESA species protections, NFMA timber sale requirements, Clean Water Act watershed protections) into its analysis. Regulatory compliance is treated as an external process, not an integrated intelligence function.

#### 4. Recovery Planning Intelligence
Post-fire recovery planning -- sequencing timber salvage, watershed rehabilitation, trail restoration, habitat recovery -- requires synthesizing burn severity, access logistics, market conditions, regulatory constraints, and ecological priorities. No existing tool addresses this synthesis.

#### 5. Evidence Chains / Proof Layer
No project maintains structured provenance for its intelligence outputs -- linking conclusions to specific data sources, methodologies, and confidence levels. worldmonitor flags source credibility (4-tier system) but does not construct evidence chains. LMOSINT's "proof layer" concept is novel in this space.

#### 6. Multi-Agent Domain Expert Architecture
While multi-agent systems exist for fire suppression RL (MITRE SimFire) and swarm robotics (DIAMANTS), no project uses multi-agent architecture for domain expert reasoning -- where specialized agents (burn analyst, trail assessor, NEPA advisor) collaborate on complex questions. This is LMOSINT's core architectural innovation.

### The Structural Gap Visualized

```
                    EXISTING ECOSYSTEM                    LMOSINT WHITE SPACE

    [Fire Data] ─── [Fire Dashboard]                [Fire Data] ──┐
    [Weather]  ─── [Weather Dashboard]              [Weather]  ──┤
    [Hydrology] ── [Hydrology Dashboard]            [Hydrology] ──┼── [Intelligence    ── [Reasoned
    [Ecology]  ─── [Ecology Dashboard]              [Ecology]  ──┤    Synthesis Engine]    Answers]
    [Regulatory] ── [Regulatory Portal]             [Regulatory] ─┘        ↑
                                                                    [Domain Expert
         Single-domain, monitoring-oriented               Agents + Proof Layer]

                                                    Cross-domain, reasoning-oriented
```

---

## Build vs. Compose Recommendation

### BUILD FROM SCRATCH (Core LMOSINT Value)

These components represent LMOSINT's unique value and have no viable open source alternatives:

| Component | Rationale |
|-----------|-----------|
| **Intelligence Synthesis Engine** | The cross-domain fusion + reasoning layer is the core innovation. No existing project does this. |
| **Multi-Agent Domain Expert Architecture** | Specialized agents (burn analyst, trail assessor, NEPA advisor, cruising assistant) with structured collaboration protocols. Existing multi-agent fire systems (SimFire) are RL-based, not reasoning-based. |
| **Proof Layer / Evidence Chain System** | Structured provenance linking intelligence outputs to data sources, methodologies, and confidence levels. Novel in this space. |
| **Regulatory Knowledge Integration** | NEPA, ESA, NFMA, CWA knowledge encoded as retrievable expertise for agent reasoning. No existing tool does this. |
| **Recovery Planning Coordinator** | Orchestration of multi-domain intelligence for post-fire recovery sequencing. No existing tool addresses this. |
| **Question-Answering Interface** | The shift from dashboard (monitoring) to intelligence platform (answering questions) is architectural, not incremental. |

### COMPOSE / REUSE FROM EXISTING PROJECTS

These components have mature open source implementations that should be leveraged:

| Component | Source | Rationale |
|-----------|--------|-----------|
| **Hydrology Data Connectors** | [HyRiver](https://github.com/hyriver) (pygeohydro, pygeoogc) | Battle-tested Python APIs for USGS/NOAA/FEMA data. Async retrieval with persistent caching. |
| **NASA FIRMS Data Access** | [datadesk/nasa-wildfires](https://github.com/datadesk/nasa-wildfires) | Simple, proven Python library for FIRMS hotspot data. MIT licensed. |
| **Signal Aggregation Patterns** | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) architecture | Adopt Welford's algorithm for temporal baselines, z-score anomaly detection, and regional convergence scoring. AGPL-3.0 requires studying patterns rather than copying code. |
| **Alert Management API Patterns** | [pyronear/pyro-api](https://github.com/pyronear/pyro-api) | FastAPI + PostgreSQL alert pipeline pattern. Adapter pattern for heterogeneous data sources. Apache 2.0 licensed. |
| **Geospatial Database** | PostgreSQL/PostGIS (as used by bcgov/wps) | Industry standard for geospatial data. Well-proven in wildfire applications. |
| **Vector Tile Serving** | pg_tileserv (as used by bcgov/wps-vector-tileserver) | Proven pattern for serving geospatial data to web frontends. |
| **Wind Modeling Outputs** | [WindNinja](https://github.com/firelab/windninja) API | Consume WindNinja outputs rather than building wind modeling. 7M runs/year proves reliability. |
| **Fire Spread Forecasts** | [ELMFIRE](https://github.com/lautenberger/elmfire) / Pyrecast | Consume operational fire spread forecasts rather than building simulation. |
| **Forest Inventory Statistics** | [FIESTA](https://github.com/USDAForestService/FIESTA) (R package) | USFS-maintained tool for FIA data analysis. Useful for timber volume estimation. |
| **Satellite Imagery Analysis** | [Open Foris SEPAL](https://www.openforis.org/) | Cloud-based satellite analysis platform. Reference for UX accessibility. |

### STUDY FOR ARCHITECTURAL PATTERNS (Do Not Directly Reuse)

| Pattern | Source | What to Learn |
|---------|--------|---------------|
| Multi-source signal fusion with anomaly detection | worldmonitor | Welford's algorithm, z-score thresholds, convergence scoring |
| Edge-to-cloud detection pipeline | Pyronear | Adapter pattern, event-driven architecture, model versioning via HuggingFace |
| Proto-first API design with typed service domains | worldmonitor | 22 service domains with auto-generated clients, servers, and OpenAPI docs |
| Full-stack geospatial decision support | bcgov/wps | FastAPI + PostGIS + React + vector tiles architecture |
| Operational domain model integration | WindNinja in WFDSS | How specialized models feed into broader decision support systems |
| National-scale MRV evidence chains | Open Foris | How to structure evidence for regulatory compliance reporting |

---

## Key Observations

1. **The market values monitoring, not intelligence.** Every funded project in this space builds dashboards. The insight that land managers need *answers* to specific questions (not more dashboards to watch) is underserved.

2. **Government tools are excellent but isolated.** USGS, USDA FS, NOAA all publish high-quality tools. But they operate in silos. The integration burden falls entirely on the end user (typically a GIS analyst manually combining outputs).

3. **The ML/AI wildfire community focuses on detection and prediction, not reasoning.** Hundreds of repos apply CNNs/transformers to fire detection or spread prediction. Almost none apply AI to the harder problem of reasoning across domains to support complex decisions.

4. **worldmonitor proves multi-source OSINT at scale is viable as open source.** 33.5k stars and 2M+ users across 190 countries demonstrates demand for intelligence synthesis. The environmental/land management domain is an untapped vertical for this paradigm.

5. **Licensing landscape is favorable.** Most relevant projects use Apache 2.0 or MIT licenses. The notable exception is worldmonitor (AGPL-3.0), which constrains code reuse but not pattern adoption.

6. **The Pyronear ecosystem demonstrates that small, focused NGOs can build production-quality environmental intelligence infrastructure.** This validates the feasibility of building LMOSINT as a focused, high-quality system rather than requiring enterprise-scale resources.

---

## Sources

- [GitHub: wildfire-management topic](https://github.com/topics/wildfire-management)
- [GitHub: wildfire-detection topic](https://github.com/topics/wildfire-detection)
- [GitHub: environmental-monitoring topic](https://github.com/topics/environmental-monitoring)
- [koala73/worldmonitor](https://github.com/koala73/worldmonitor)
- [Pyronear Organization](https://github.com/pyronear)
- [pyronear/pyro-api](https://github.com/pyronear/pyro-api)
- [pyronear/pyro-engine](https://github.com/pyronear/pyro-engine)
- [pyronear/pyro-vision](https://github.com/pyronear/pyro-vision)
- [pyronear/pyro-platform](https://github.com/pyronear/pyro-platform)
- [pyronear/pyro-risks](https://github.com/pyronear/pyro-risks)
- [bcgov/wps](https://github.com/bcgov/wps)
- [bcgov/wps-vector-tileserver](https://github.com/bcgov/wps-vector-tileserver)
- [bcgov/wps-research](https://github.com/bcgov/wps-research)
- [firelab/windninja](https://github.com/firelab/windninja)
- [lautenberger/elmfire](https://github.com/lautenberger/elmfire)
- [forefireAPI/forefire](https://github.com/forefireAPI/forefire)
- [fire2a Organization](https://github.com/fire2a)
- [fire2a/C2FK](https://github.com/fire2a/C2FK)
- [fire2a/C2FSB](https://github.com/fire2a/C2FSB)
- [mitrefireline/simfire](https://github.com/mitrefireline/simfire)
- [mitrefireline/simharness](https://github.com/mitrefireline/simharness)
- [hyriver/pygeohydro](https://github.com/hyriver/pygeohydro)
- [hyriver Organization](https://github.com/hyriver)
- [datadesk/nasa-wildfires](https://github.com/datadesk/nasa-wildfires)
- [santiagxf/prometheus](https://github.com/santiagxf/prometheus)
- [USDAForestService Organization](https://github.com/USDAForestService)
- [USDAForestService/FIESTA](https://github.com/USDAForestService/FIESTA)
- [USDAForestService/ForestVegetationSimulator](https://github.com/USDAForestService/ForestVegetationSimulator)
- [USDAForestService/fs-open-forest-platform](https://github.com/USDAForestService/fs-open-forest-platform)
- [USGS Organization](https://github.com/usgs)
- [DOI-USGS Organization](https://github.com/DOI-USGS)
- [USGS-R Organization](https://github.com/usgs-r)
- [Open Foris](https://www.openforis.org/)
- [Open-Earth-Monitor](https://github.com/Open-Earth-Monitor)
- [opengeos/geoai](https://github.com/opengeos/geoai)
- [ELMFIRE Documentation](https://elmfire.io/)
- [WindNinja Website](https://ninjastorm.firelab.org/windninja/)
- [Pyronear Website](https://pyronear.org/en/)
- [Open Foris Portfolio](https://www.openforis.org/openforis_portfolio/)
- [BC Wildfire Predictive Services](https://psu.nrs.gov.bc.ca/)

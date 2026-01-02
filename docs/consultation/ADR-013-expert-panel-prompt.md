# Expert Panel Consultation: ADR-013 Geospatial Intelligence Layer

**Date:** December 31, 2024  
**Requestor:** Jason Valenzano, CTO - RANGER Project  
**Purpose:** Architectural review and technology selection for geospatial visualization layer

---

## Context: What Is RANGER?

RANGER is an **Agentic Operating System for Natural Resource Recovery**—a multi-agent AI platform coordinating post-wildfire recovery for the U.S. Forest Service. Think of it as an "AI nerve center" where specialized agents (Burn Analyst, Trail Assessor, Cruising Assistant, NEPA Advisor) synthesize intelligence and present actionable briefings to Forest Supervisors within their "8-minute reality" of decision windows.

**Current Stack:**
- **Agent Runtime:** Google ADK (Agent Development Kit) with Gemini 2.0 Flash
- **Frontend:** React + Tailwind + MapLibre GL JS (existing)
- **Backend:** Cloud Run on GCP, Vertex AI RAG Engine
- **Data Connectivity:** MCP (Model Context Protocol) for federal system integration

**Architectural Principle (ADR-005):** Skills-First Architecture—domain expertise lives in portable, versioned skill packages, not monolithic prompts. Agents are the "operating system," Skills are the "applications."

---

## The Problem

We're currently implementing **ADR-012: Mission Control UI**, which focuses on:
- ✅ Week 1: BriefingStrip (portfolio metrics), PhaseFilterChips (incident filtering)
- 🔄 Week 2: IncidentRail enhancement, AgentChat foundation (mock)
- ⏳ Week 3: Live ADK integration, SSE streaming
- ⏳ Week 4: Proof Layer transparency, polish

**What's missing:** The map itself. Our mockup shows significant geospatial overlays that aren't in the 4-week plan:

| Feature | Current State | Mockup Shows |
|---------|---------------|--------------|
| Satellite basemap | ✅ Exists (MapLibre) | ✅ Same |
| Fire perimeters (NIFC) | ✅ Exists | ✅ Same |
| FIRMS hotspots | ✅ Exists | ✅ Same |
| **Burn severity overlay** | ❌ Not implemented | 🔴 MTBS raster (dNBR) |
| **Trail damage markers** | ❌ Not implemented | 🟡 Point features |
| **Treatment unit polygons** | ❌ Not implemented | 🟢 BAER treatment areas |
| **Layer control panel** | Partial | Full toggle panel |

We've decided to create **ADR-013: Geospatial Intelligence Layer** as a separate track.

---

## Technical Research Summary

### Option A: Server-Side Tile Generation (TiTiler)

**TiTiler** is a FastAPI-based dynamic tile server built on Rasterio/GDAL:
- Serves Cloud Optimized GeoTIFFs (COGs) as XYZ tiles on-demand
- Supports STAC (SpatioTemporal Asset Catalog) and MosaicJSON
- Can apply colormaps, band math, and custom algorithms per-request
- Deployable to Cloud Run (same as our ADK backend)

**Pros:**
- Battle-tested (Development Seed, NASA Earthdata use it)
- Handles reprojection, resampling server-side
- Works with any mapping library (MapLibre, Leaflet, deck.gl)
- Can cache tiles at CDN layer

**Cons:**
- Adds another service to manage
- Latency for first tile render (cold start on Cloud Run)
- Cost scales with tile requests

### Option B: Client-Side COG Rendering (maplibre-cog-protocol)

**maplibre-cog-protocol** by Geomatico loads COGs directly in the browser:
- Uses HTTP range requests to fetch only needed tiles
- No server-side preprocessing required
- Supports dynamic colormaps, NDVI calculation in browser
- Released 2024, actively maintained

**Pros:**
- Zero backend infrastructure for raster serving
- Works with COGs hosted on any static file server (GCS, S3)
- Lower operational cost (just storage + CDN)
- Good for smaller datasets (tested with 12GB DEM)

**Cons:**
- COGs must be in EPSG:3857 (Web Mercator)—no reprojection
- CPU-based rendering (not GPU)—may struggle with very large rasters
- Less mature than TiTiler ecosystem
- Limited colormap/symbolization options

### Option C: Hybrid (deck.gl + MapLibre)

**deck.gl** provides WebGL-accelerated layers for large-scale visualization:
- GPU-accelerated rendering of millions of points
- TileLayer supports custom indexing (H3, S2)
- Integrates with MapLibre via `MapboxOverlay`
- Used by Uber, Airbnb, Kepler.gl

**Pros:**
- Best performance for vector data (trails, treatment units)
- Can handle massive point clouds (FIRMS hotspots at scale)
- 3D visualization potential (terrain, burn severity as elevation)
- React-friendly via `@deck.gl/react`

**Cons:**
- Complexity of managing two rendering systems
- Raster support less mature than vector
- Learning curve for deck.gl layer system

---

## Our Constraints

1. **FedRAMP Compliance:** All services must run on GCP or use FedRAMP-authorized endpoints
2. **Cost Sensitivity:** RANGER is a demo/pilot—$6-9K/year budget, not enterprise scale
3. **Operational Simplicity:** Small team, can't manage complex infrastructure
4. **Data Sources:**
   - MTBS burn severity: COGs available from USGS (~500MB-2GB per fire)
   - NIFC perimeters: GeoJSON via API (already integrated)
   - FIRMS hotspots: CSV/GeoJSON (already integrated)
   - Trail damage: Will be point features from field assessment
   - Treatment units: Polygons from BAER planning

5. **Existing MapLibre Investment:** We already have MapLibre rendering fire perimeters and hotspots

---

## Questions for the Expert Panel

### 1. Architecture Decision
Given our constraints (small team, GCP-only, cost-sensitive, already using MapLibre), what's the recommended approach?

- **A) TiTiler on Cloud Run** + MapLibre for everything
- **B) maplibre-cog-protocol** for rasters + MapLibre for vectors
- **C) deck.gl + MapLibre hybrid** for performance
- **D) Something else entirely?

### 2. COG Strategy
MTBS burn severity rasters can be large (multi-GB for regional fires). Should we:

- Pre-process into COGs and host on GCS (static)
- Use TiTiler to serve dynamically with styling
- Pre-tile into PMTiles for even simpler hosting
- Some combination?

### 3. Real-Time vs. Static
Some data changes frequently (FIRMS hotspots—hourly), some rarely (MTBS—annual). Should we have different strategies for:

- **Real-time layers:** FIRMS, active fire perimeters
- **Static analysis layers:** MTBS severity, treatment units
- **Agent-generated layers:** AI-computed risk zones, recommendations

### 4. Integration with Agent Skills
RANGER's Burn Analyst skill needs to query burn severity data. Should:

- The skill call a dedicated geospatial API (TiTiler endpoint)?
- The skill use MCP to connect to a geospatial data service?
- The frontend handle visualization while the skill handles analysis separately?

### 5. Risk Assessment
What are the biggest risks we should watch for?

- Performance cliffs with large rasters?
- Browser compatibility issues with client-side COG?
- Cold start latency killing UX?
- Cost surprises at scale?

---

## What We're Leaning Toward

**Hybrid approach:**
1. **maplibre-cog-protocol** for burn severity COGs (static, hosted on GCS)
2. **Native MapLibre** for vectors (perimeters, treatment units, trail damage)
3. **deck.gl ScatterplotLayer** for high-density hotspots (if MapLibre struggles)
4. **No TiTiler initially**—add later if we need dynamic styling

**Rationale:**
- Minimizes infrastructure (just GCS + existing Cloud Run)
- Leverages existing MapLibre investment
- Can add TiTiler later if we need dynamic band math or styling
- deck.gl is opt-in for performance-critical layers only

**Does this make sense? What are we missing?**

---

## Deliverable Requested

Please provide:
1. **Recommendation** with rationale
2. **Risk matrix** for the recommended approach
3. **Alternative consideration** if our lean is wrong
4. **Implementation sequence** (what to build first)
5. **Cost estimate** for recommended architecture

---

## Reference Materials

- [TiTiler Documentation](https://developmentseed.org/titiler/)
- [maplibre-cog-protocol](https://github.com/geomatico/maplibre-cog-protocol)
- [deck.gl + MapLibre Integration](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre)
- [Cloud Optimized GeoTIFF Spec](https://cogeo.org/)
- [NASA Earthdata COG Standard](https://www.earthdata.nasa.gov/about/esdis/esco/standards-practices/cloud-optimized-geotiff)
- [MTBS Data Access](https://www.mtbs.gov/direct-download)

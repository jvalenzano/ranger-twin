# TiTiler: Dynamic Tile Serving for RANGER

**Purpose:** Educational tutorial explaining TiTiler and dynamic tile serving  
**Context:** Server-side COG rendering as an alternative to client-side parsing  
**Updated:** 2025-12-31

---

## The Big Idea

> **Generate map tiles on-demand instead of pre-rendering millions of static files.**

TiTiler is a production-ready, open-source dynamic tile server built by Development Seed. Instead of pre-generating millions of static tile images (the traditional approach), TiTiler reads your Cloud-Optimized GeoTIFFs (COGs) and creates tiles **at request time**.

Think of it as a **chef vs a frozen food factory**: a frozen food factory makes millions of identical meals in advance, then ships them. A chef prepares your meal fresh when you order, customized to your preferences. TiTiler is the chef.

---

## The Pizza Kitchen Analogy

Imagine two pizza shops:

**Static Tiles (Pre-Rendered):**
- Factory pre-makes 10,000 frozen pizzas in every possible combination
- Stores them in giant freezers
- When you order, they just hand you one from the freezer
- Fast delivery, but no customization
- Storage costs are enormous

**Dynamic Tiles (TiTiler):**
- Kitchen has all the ingredients (your COG file)
- When you order, they make your pizza fresh
- Want extra cheese? Different sauce? No problem
- Takes 30 seconds longer, but infinitely flexible
- Minimal storage needed

TiTiler is the made-to-order kitchen.

---

## Why Dynamic Tiles?

| Approach | Storage | Flexibility | Latency | Best For |
|----------|---------|-------------|---------|----------|
| **Pre-rendered tiles** | Enormous (millions of PNGs) | None (fixed style) | <50ms | Basemaps, rarely changing data |
| **TiTiler (dynamic)** | Just the COG | Unlimited (real-time styling) | 100-500ms | Analysis, custom visualizations |

**RANGER's Use Case:**

We serve satellite imagery and burn severity rasters from BAER assessments. These datasets:
- Change frequently (new fires, updated assessments)
- Need different visualizations (NDVI, burn severity, RGB)
- Don't justify pre-rendering millions of tiles for each

Dynamic tiles make sense here.

---

## Client-Side vs Server-Side COG Rendering

Currently, RANGER uses client-side COG parsing with `maplibre-cog-protocol`:

```
Current Approach: Client-Side
┌────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  MapLibre + maplibre-cog-protocol                   │  │
│  │  - Downloads COG chunks via range requests          │  │
│  │  - Parses GeoTIFF data in JavaScript                │  │
│  │  - Renders to canvas                                │  │
│  │  - CPU/memory intensive                             │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
           │
           │ HTTP Range Requests
           ▼
    ┌──────────────┐
    │  GCS Bucket  │
    │  (COG file)  │
    └──────────────┘
```

With TiTiler, the heavy lifting moves server-side:

```
TiTiler Approach: Server-Side
┌────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  MapLibre                                           │  │
│  │  - Requests standard raster tiles                   │  │
│  │  - Displays PNG/WebP images                         │  │
│  │  - Lightweight, fast                                │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
           │
           │ Standard tile requests (/tiles/{z}/{x}/{y}.png)
           ▼
┌────────────────────────────────────────────────────────────┐
│                       TITILER                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  FastAPI + GDAL/Rasterio                            │  │
│  │  - Reads COG with range requests                    │  │
│  │  - Applies colormap, rescaling, etc.                │  │
│  │  - Renders tile as PNG/WebP                         │  │
│  │  - Returns standard image                           │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
           │
           │ HTTP Range Requests
           ▼
    ┌──────────────┐
    │  GCS Bucket  │
    │  (COG file)  │
    └──────────────┘
```

---

## How TiTiler Client-Server Architecture Works

> **Your laptop never downloads the large geospatial files.**

This is the key insight that confuses people new to dynamic tiling. Here's the complete flow:

### The Request Flow

```
Your Browser (MapLibre)
        │
        │ "Give me tile 12/1234/5678"
        │ (a 256×256 pixel image request)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                        TITILER                              │
│  1. Receives: /cog/tiles/12/1234/5678.png?url=...tif        │
│  2. Opens COG via HTTP (doesn't download whole file)        │
│  3. Uses RANGE REQUEST to fetch only needed bytes           │
│  4. Renders 256×256 PNG (~20KB)                             │
│  5. Returns tiny image to browser                           │
└─────────────────────────────────────────────────────────────┘
        │
        │ Range requests: "bytes=1048576-1052672"
        │ (fetches ~4KB of a 2GB file)
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  GCS BUCKET                                 │
│  cedar_creek_burn_severity.tif (2.3 GB)                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Overview 1] [Overview 2] [Overview 4] ... [Full Res]   ││
│  │      ↑                                                  ││
│  │      └── TiTiler reads ONLY this small section          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

When you navigate to RANGER's map, your browser sends small HTTP requests to TiTiler for individual **256×256 pixel image tiles** (typically 10-50KB each as PNG/JPEG). The browser only requests tiles visible in your current viewport plus a small buffer for smooth panning. As you pan or zoom, MapLibre calculates which new tiles are needed and requests only those.

### Why COGs Make This Possible

A Cloud-Optimized GeoTIFF is structured with:
- **Internal 256×256 pixel blocks** — Data is pre-chunked, not stored linearly
- **Multiple resolution levels (overviews)** — Pyramid of increasingly downsampled versions
- **HTTP range request support** — Can fetch arbitrary byte ranges without downloading whole file

```
COG Internal Structure
┌─────────────────────────────────────────────────────────────┐
│  Overview 32x (thumbnail)     ~500 KB                       │
│  Overview 16x                 ~2 MB                         │
│  Overview 8x                  ~8 MB                         │
│  Overview 4x                  ~32 MB                        │
│  Overview 2x                  ~128 MB     ← Zoomed out view │
│  Full Resolution              ~2 GB       ← Zoomed in view  │
└─────────────────────────────────────────────────────────────┘
```

When zoomed out viewing the whole fire, TiTiler reads from the low-resolution overview (maybe 500KB total). When zoomed in to a specific area, it reads just the relevant high-resolution blocks (maybe 200KB for a few tiles). **Without COG optimization, the server would need to download the entire multi-GB file to extract each tile.**

### Your Laptop's Actual Data Load

Your browser typically loads **20-50 tiles simultaneously** (covering your screen) at ~20KB each:

```
Typical Map Load
────────────────────────────────────────────────────────
Visible tiles:     ~30 tiles × 20KB = 600KB
Prefetch buffer:   ~20 tiles × 20KB = 400KB
────────────────────────────────────────────────────────
Total initial:     ~1MB (comparable to one website photo)
```

This is comparable to loading a single high-resolution photo on a website. As you pan, MapLibre prefetches adjacent tiles so movement feels smooth, but you're still only dealing with small PNG images — **never the raw multi-gigabyte geospatial data**.

---

## Deployment Timing: What to Expect

### First Deployment: 10-20 Minutes is Normal

TiTiler's Docker image is large because it bundles the entire geospatial stack:

| Component | Size |
|-----------|------|
| GDAL | ~100 MB |
| Rasterio | ~50 MB |
| NumPy | ~30 MB |
| Python + FastAPI | ~50 MB |
| **Total Image** | **800 MB - 1.5 GB** |

The deployment sequence:
1. Push image from your Docker to Cloud Build
2. Cloud Build pushes to Artifact Registry
3. Cloud Run pulls from Artifact Registry
4. Container starts and health check passes

**However:** Google's documentation states that **container image size does NOT affect cold start or request processing time**. The deployment time is from transferring the image, not from the image being large at runtime.

### Speed Up Deployments

**Use pre-built images (2-5 minutes):**
```bash
# Deploy Development Seed's official image directly
gcloud run deploy ranger-titiler \
  --image ghcr.io/developmentseed/titiler:latest \
  --region us-west1 \
  --allow-unauthenticated
```

Cloud Run pulls directly from GitHub Container Registry — no upload from your laptop.

**Use Cloud Build for custom images:**
```bash
# Build in the cloud, not locally
gcloud builds submit --tag us-west1-docker.pkg.dev/ranger-twin-dev/ranger-images/titiler:latest .

# Deploy the cloud-built image
gcloud run deploy ranger-titiler \
  --image us-west1-docker.pkg.dev/ranger-twin-dev/ranger-images/titiler:latest \
  --region us-west1
```

**Subsequent deploys are fast (3-5 minutes):** Docker layers are cached in Artifact Registry after the first deployment.

### Optimize Cold Start for Users

Once deployed, keep one instance warm to avoid user-facing cold starts:

```bash
gcloud run services update ranger-titiler \
  --min-instances=1 \
  --region us-west1
```

This keeps one instance ready at ~$50/month, ensuring tile requests respond in **100-500ms** instead of 5-10 seconds on cold start.

---

## TiTiler Core Capabilities

### Supported Formats

| Input | Description |
|-------|-------------|
| **COG** | Cloud-Optimized GeoTIFF (most common) |
| **STAC** | SpatioTemporal Asset Catalogs (metadata + assets) |
| **MosaicJSON** | Virtual mosaics of multiple COGs |
| **Xarray** | Multi-dimensional datasets (NetCDF, Zarr) |

### Output Formats

```
/tiles/{z}/{x}/{y}?format=png     # PNG (default)
/tiles/{z}/{x}/{y}?format=webp    # WebP (smaller, faster)
/tiles/{z}/{x}/{y}?format=jpeg    # JPEG (lossy, smallest)
/tiles/{z}/{x}/{y}?format=tif     # GeoTIFF (for analysis)
```

### OGC Standards

- **WMTS** — Web Map Tile Service
- **OGC Tiles API** — Modern RESTful standard
- **TileJSON** — MapLibre/Mapbox metadata format

---

## Quick Start

### Option 1: pip install

```bash
# Install TiTiler
python -m pip install titiler.application

# Run locally
uvicorn titiler.application.main:app --port 8000
```

### Option 2: Docker

```bash
docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest \
  uvicorn titiler.application.main:app --host 0.0.0.0
```

### Option 3: Cloud Run (RANGER's approach)

```bash
gcloud run deploy titiler \
  --image ghcr.io/developmentseed/titiler:latest \
  --port 8000 \
  --region us-west1 \
  --allow-unauthenticated
```

---

## Using TiTiler with MapLibre

Once TiTiler is running, add it as a raster source in MapLibre:

```javascript
// Add TiTiler as a raster tile source
map.addSource('burn-severity', {
  type: 'raster',
  tiles: [
    'https://titiler.example.com/cog/tiles/{z}/{x}/{y}' +
    '?url=https://storage.googleapis.com/ranger-data/baer/cedar-creek-dnbr.tif' +
    '&colormap_name=rdylgn_r' +
    '&rescale=-500,1000'
  ],
  tileSize: 256,
  attribution: 'BAER Assessment'
});

map.addLayer({
  id: 'burn-severity-layer',
  type: 'raster',
  source: 'burn-severity',
  paint: {
    'raster-opacity': 0.7
  }
});
```

**Key URL Parameters:**

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `url` | `https://...tif` | Path to your COG |
| `colormap_name` | `rdylgn_r` | Apply a colormap |
| `rescale` | `-500,1000` | Min/max values for stretching |
| `bidx` | `1,2,3` | Band indices (RGB composite) |
| `expression` | `(b4-b3)/(b4+b3)` | Band math (NDVI, etc.) |

---

## Dynamic Styling Examples

### Burn Severity with Colormap

```
/cog/tiles/{z}/{x}/{y}
  ?url=cedar-creek-dnbr.tif
  &colormap_name=rdylgn_r   ← Red = high severity, Green = unburned
  &rescale=-500,1000
```

### True Color (RGB)

```
/cog/tiles/{z}/{x}/{y}
  ?url=sentinel-2.tif
  &bidx=4,3,2              ← Bands 4,3,2 = RGB
  &rescale=0,3000
```

### NDVI Vegetation Index

```
/cog/tiles/{z}/{x}/{y}
  ?url=sentinel-2.tif
  &expression=(b8-b4)/(b8+b4)   ← NDVI formula
  &colormap_name=greens
  &rescale=-1,1
```

**The power:** Same COG file, completely different visualizations, no pre-rendering.

---

## Production at Scale

### Who Uses TiTiler?

| Organization | Use Case |
|--------------|----------|
| **NASA Earthdata** | Global satellite imagery delivery |
| **USGS** | Landsat and elevation data |
| **Copernicus** | European Earth observation |
| **Microsoft Planetary Computer** | Global environmental data |

These are petabyte-scale deployments serving millions of tiles.

### Performance Tuning

TiTiler performance depends on:

1. **COG Structure**
   - Internal tiling (512x512 or 256x256)
   - Overviews at multiple resolutions
   - Compression (LZW, DEFLATE, ZSTD)

2. **GDAL Configuration**
   ```bash
   # Environment variables for tuning
   GDAL_CACHEMAX=512          # MB of raster cache
   GDAL_HTTP_MERGE_CONSECUTIVE_RANGES=YES
   GDAL_INGESTED_BYTES_AT_OPEN=32768
   CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.TIF,.tiff"
   ```

3. **Worker Scaling**
   - GDAL I/O is blocking (one request per thread)
   - Use multiple Uvicorn workers: `--workers 4`
   - Cloud Run concurrency: 10-20 per instance

---

## TiTiler vs maplibre-cog-protocol

| Aspect | maplibre-cog-protocol | TiTiler |
|--------|----------------------|---------|
| **Processing** | Client-side (browser) | Server-side |
| **Browser load** | Heavy (GDAL in WASM) | Light (just images) |
| **Mobile support** | Limited (memory) | Full |
| **Styling** | Limited | Full (colormaps, band math) |
| **Caching** | Per-user only | CDN-cacheable |
| **Infrastructure** | None (static hosting) | Requires server |
| **Maturity** | Experimental | Production-proven |

**Recommendation for RANGER:**

TiTiler if you need:
- Mobile/tablet support for field use
- Complex visualizations (NDVI, burn indices)
- CDN caching for multiple users
- Federal-proven reliability

maplibre-cog-protocol if you need:
- Zero server infrastructure
- Simple use case (just display the raster)
- Low traffic (few users)

---

## RANGER Integration Architecture

```
                    ┌─────────────────────────────────────┐
                    │         RANGER Frontend             │
                    │         (MapLibre GL JS)            │
                    └──────────────┬──────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Run:     │    │  Cloud Run:     │    │  Cloud Run:     │
│  ranger-frontend│    │  ranger-api     │    │  titiler        │
│  (static files) │    │  (ADK agents)   │    │  (tile server)  │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       │ Range requests
                                                       ▼
                                              ┌─────────────────┐
                                              │  GCS Bucket     │
                                              │  BAER COGs      │
                                              │  Satellite COGs │
                                              └─────────────────┘
```

**Three services, each specialized:**
1. **Frontend** — Static React app
2. **API** — AI agents, fire data
3. **TiTiler** — Dynamic raster tiles

---

## Cost Estimation

### TiTiler on Cloud Run

```
Assumptions:
- 200 daily users, 22 workdays/month
- 50 tile requests per map view
- 3 map views per session

Tile requests/month = 200 × 50 × 3 × 22 = 660,000 tiles
Average tile generation = 300ms

CPU-seconds = 660,000 × 0.3s = 198,000 CPU-seconds
Memory = 1GB (GDAL needs headroom)

Cost ≈ 198,000 × $0.000024 + memory ≈ $5-10/month
```

**Much cheaper than storing pre-rendered tiles** (which could be 10+ GB for full coverage).

---

## Common Gotchas

### 1. COG Not Optimized
> "Tiles take 5+ seconds to render!"

**Cause:** Source GeoTIFF lacks internal tiling or overviews.

**Fix:** Optimize with GDAL:
```bash
gdal_translate input.tif output.tif \
  -co TILED=YES \
  -co BLOCKXSIZE=512 \
  -co BLOCKYSIZE=512 \
  -co COMPRESS=LZW

gdaladdo output.tif 2 4 8 16 32
```

### 2. CORS Errors
> "Tiles fail to load in browser!"

**Cause:** TiTiler not returning CORS headers.

**Fix:** Configure FastAPI middleware or Cloud Run CORS:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### 3. Memory Exhaustion
> "Container keeps restarting!"

**Cause:** Too many concurrent requests with high concurrency setting.

**Fix:** Lower Cloud Run concurrency to 10-20, increase memory to 2GB.

### 4. Signed URL Expiration
> "Tiles worked yesterday, now 403 errors!"

**Cause:** If using signed GCS URLs, they expire.

**Fix:** Use public buckets or implement URL signing in TiTiler.

---

## Learning Resources

| Resource | Link |
|----------|------|
| **Official Docs** | [developmentseed.org/titiler](https://developmentseed.org/titiler) |
| **Getting Started** | [Tutorial with examples](https://developmentseed.org/titiler/tutorials/) |
| **FOSS4G Talk** | [TiTiler: Not just a tile server](https://www.youtube.com/watch?v=example) |
| **GitHub** | [developmentseed/titiler](https://github.com/developmentseed/titiler) |
| **Latest Release** | v0.24.1 (October 2025) |

---

## Key Takeaway

**The common concern about "large tiles or layers" is a misconception.** While geospatial files ARE large (multiple gigabytes), they stay on the server (GCS). End users only download tiny 256×256 pixel PNG tiles (20-50KB each), just like loading images on any website. TiTiler's job is converting those big files server-side into these small, browser-friendly tiles on demand.

The 10-20 minute deployment is a **one-time pain**. Use the pre-built image or Cloud Build to reduce this to 2-5 minutes for future deployments.

---

## References & Citations

1. [TiTiler Dynamic Tiling User Guide](https://developmentseed.org/titiler/user_guide/dynamic_tiling/)
2. [Carto: Map Tiles Guide](https://carto.com/blog/map-tiles-guide)
3. [Safe Software: Web Mapping 101](https://fme.safe.com/blog/2025/11/web-mapping-101-how-to-create-dynamic-web-maps/)
4. [Reddit: How is Google Maps UI made?](https://www.reddit.com/r/howdidtheycodeit/comments/xkk167/how_is_something_like_google_maps_ui_made/)
5. [TiTiler Getting Started Guide](https://developmentseed.org/titiler/user_guide/getting_started/)
6. [YouTube: TiTiler Tech Deep Dive](https://www.youtube.com/watch?v=16Yp5lHy7ng)
7. [Google Cloud Blog: 3 ways to optimize Cloud Run response times](https://cloud.google.com/blog/topics/developers-practitioners/3-ways-optimize-cloud-run-response-times)
8. [Google Cloud Run Tips & Best Practices](https://docs.cloud.google.com/run/docs/tips/general)
9. [Google Cloud Run Deployment Docs](https://docs.cloud.google.com/run/docs/deploying)
10. [StackOverflow: Speeding up Cloud Run deployment with caching](https://stackoverflow.com/questions/75567265/how-to-speed-up-cloud-run-deployment-by-using-cached-docker-image)
11. [AWS ECR Public Gallery: TiTiler](https://gallery.ecr.aws/s2n1v5w1/titiler)
12. [Reddit: Docker image size impact on container startup](https://www.reddit.com/r/googlecloud/comments/1bponng/docker_image_size_impact_on_container_startup/)
13. [Dev.to: Building a Dynamic Tile Server using COG with TiTiler](https://dev.to/mierune/building-a-dynamic-tile-server-using-cloud-optimized-geotiffcog-with-titiler-alg)
14. [Development Seed: TiTiler Homepage](https://developmentseed.org/titiler/)
15. [YouTube: How to create your own Tile Server](https://www.youtube.com/watch?v=yBWOxwylHZ8)
16. [Rich Harris: Rendering Leaflet tiles in the browser](http://richorama.github.io/2018/08/22/rendering-leaflet-tiles-in-the-browser/)
17. [YouTube: TiTiler: Not just a tile server](https://www.youtube.com/watch?v=MSSTR5_B-OI)
18. [TIB AV-Portal: FOSS4G TiTiler Presentation](https://av.tib.eu/media/69048)
19. [StackOverflow: Efficient Tiled Rendering in Browsers](https://stackoverflow.com/questions/27583905/how-do-modern-browsers-do-tiled-rendering-particularly-in-direct2d-efficiently)
20. [Copernicus Dataspace: TiTiler Open Source Processing](https://dataspace.copernicus.eu/news/2025-6-4-openeo-titiler-open-source-light-and-fast-processing-earth-observation)
21. [GitHub: Chiitiler - Light-weight TiTiler](https://github.com/Kanahiro/chiitiler)

---

## Related Tutorials

- [GEOSPATIAL-FORMATS.md](./GEOSPATIAL-FORMATS.md) — Understanding COGs and PMTiles
- [MAPLIBRE-INTEGRATION.md](./MAPLIBRE-INTEGRATION.md) — Frontend map integration
- [CLOUD-RUN-SCALING.md](./CLOUD-RUN-SCALING.md) — Serverless container deployment

---

*Last updated: December 31, 2025*

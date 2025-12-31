# ADR-013 Phase 1: Geospatial Pipeline Implementation

> **Status:** Draft for Review  
> **Sprint:** Post ADR-012 completion  
> **Estimated Effort:** 4-6 hours  
> **Dependencies:** GCS bucket access, GDAL installed locally

---

## Overview

This spec implements Phase 1 of ADR-013 (Geospatial Intelligence Layer): the COG data pipeline and MapLibre integration for MTBS burn severity visualization.

**End State:** Cedar Creek Fire burn severity renders as a color-mapped raster overlay in NationalMap, served via TiTiler from GCS.

---

## Architecture Decision: TiTiler vs Client-Side COG

Based on expert review, we're adopting a **TiTiler-first architecture**:

| Approach | Use Case | Status |
|----------|----------|--------|
| **TiTiler on Cloud Run** | Primary raster serving | ✅ Recommended |
| maplibre-cog-protocol | Fallback/offline | ⚠️ Backup only |

**Rationale:**
- TiTiler is production-proven at NASA, USGS, and federal agencies
- Server-side rendering eliminates client-side COG parsing fragility
- OGC Tiles API compliance supports federal interoperability requirements
- maplibre-cog-protocol has limited community support and broke with MapLibre v4

**Trade-off:** One additional Cloud Run service (~$20/month)

---

## Prerequisites

### Local Environment
```bash
# GDAL for COG conversion
brew install gdal  # macOS
# or: apt-get install gdal-bin  # Ubuntu

# Verify installation
gdalinfo --version  # Should be 3.x+

# Google Cloud CLI authenticated
gcloud auth application-default login
gcloud config set project ranger-usfs-dev
```

### GCS Bucket Setup
```bash
# Create bucket for geospatial assets (if not exists)
gsutil mb -l us-central1 gs://ranger-geospatial-dev

# Set CORS for browser access
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "http://localhost:5173", "https://*.run.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Range", "Content-Range"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://ranger-geospatial-dev
```

---

## Phase 1A: Data Acquisition

### Step 1: Download MTBS Data for Cedar Creek Fire

The Cedar Creek Fire (2022) MTBS data is our reference dataset.

```bash
# Create working directory
mkdir -p ~/ranger-geo/mtbs && cd ~/ranger-geo/mtbs

# Option A: Direct download from MTBS (if fire ID known)
# Fire ID: OR4367412204320220729 (example format)
curl -O https://edcintl.cr.usgs.gov/downloads/sciweb1/shared/MTBS_Fire/data/composite_data/burned_area_extent_shapefile/mtbs_perimeter_data.zip

# Option B: Use MTBS Direct Download interface
# https://www.mtbs.gov/direct-download
# Filter: State=Oregon, Year=2022, Fire Name=Cedar Creek
# Download: Burn Severity Mosaic (GeoTIFF)
```

**Expected Files:**
- `or4367412204320220729_20220729_20230708_dnbr6.tif` — DNBR6 severity classification
- `or4367412204320220729_20220729_20230708_dnbr.tif` — Raw dNBR values

### Step 2: Inspect Source Data

```bash
# Check projection and structure
gdalinfo or4367412204320220729_*_dnbr6.tif

# Expected output should show:
# - CRS: EPSG:5070 (Albers Equal Area) — needs reprojection
# - Band 1: Byte (severity classes 1-6)
# - No overviews — needs optimization
```

**MTBS Severity Classes:**
| Value | Class | Color (suggested) |
|-------|-------|-------------------|
| 1 | Unburned to Low | #1a9850 (green) |
| 2 | Low | #91cf60 (light green) |
| 3 | Moderate | #fee08b (yellow) |
| 4 | High | #fc8d59 (orange) |
| 5 | Very High | #d73027 (red) |
| 6 | Increased Greenness | #4575b4 (blue) |

---

## Phase 1B: COG Conversion

### Step 3: Reproject to Web Mercator

MapLibre requires EPSG:3857 (Web Mercator) for raster layers.

```bash
# Reproject from Albers to Web Mercator
gdalwarp \
  -t_srs EPSG:3857 \
  -r near \
  -co COMPRESS=LZW \
  or4367412204320220729_*_dnbr6.tif \
  cedar_creek_severity_3857.tif
```

### Step 4: Convert to Cloud-Optimized GeoTIFF

```bash
# Create COG with internal tiling and overviews
gdal_translate \
  -of COG \
  -co TILING_SCHEME=GoogleMapsCompatible \
  -co COMPRESS=LZW \
  -co OVERVIEW_RESAMPLING=NEAREST \
  -co BLOCKSIZE=256 \
  -co NUM_THREADS=ALL_CPUS \
  -co BIGTIFF=IF_SAFER \
  cedar_creek_severity_3857.tif \
  cedar_creek_severity_cog.tif

# Validate with strict mode
pip install rio-cogeo
rio cogeo validate --strict cedar_creek_severity_cog.tif
```

### Step 5: Verify COG Structure

```bash
gdalinfo cedar_creek_severity_cog.tif

# Should show:
# - Driver: GTiff/GeoTIFF
# - LAYOUT=COG in metadata
# - Multiple overviews (IFD entries)
# - BLOCKSIZE=256x256
# - COMPRESS=LZW
```

---

## Phase 1C: GCS Upload

### Step 6: Upload to GCS

```bash
# Upload COG to GCS
gsutil -h "Content-Type:image/tiff" \
  cp cedar_creek_severity_cog.tif \
  gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif

# Verify URL works
curl -I "https://storage.googleapis.com/ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif"
# Should return 200 OK with Accept-Ranges: bytes
```

### Secure Access Configuration

For FedRAMP compliance, use signed URLs instead of public access:

```python
from google.cloud import storage
from datetime import timedelta

def get_signed_cog_url(bucket_name: str, blob_name: str) -> str:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    return blob.generate_signed_url(
        expiration=timedelta(hours=1),
        method='GET'
    )
```

For development/demo, public access is acceptable. For production, implement signed URL generation in the API layer.

### Step 7: Test with External Validator

```bash
# Test COG is readable via HTTP range requests
# Use titiler demo or QGIS with /vsicurl/
qgis --project /vsicurl/https://storage.googleapis.com/ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif
```

---

## Phase 1D: MapLibre Integration

### Step 8: Install maplibre-cog-protocol

```bash
cd apps/command-console
npm install @geomatico/maplibre-cog-protocol
```

### Step 9: Create BurnSeverityLayer Component

**File:** `src/components/map/BurnSeverityLayer.tsx`

```typescript
import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { cogProtocol } from '@geomatico/maplibre-cog-protocol';

// MTBS Severity colormap
const SEVERITY_COLORMAP: [number, string][] = [
  [1, '#1a9850'],  // Unburned to Low - green
  [2, '#91cf60'],  // Low - light green
  [3, '#fee08b'],  // Moderate - yellow
  [4, '#fc8d59'],  // High - orange
  [5, '#d73027'],  // High - red
  [6, '#4575b4'],  // Increased Greenness - blue
];

interface BurnSeverityLayerProps {
  cogUrl: string;
  visible?: boolean;
  opacity?: number;
  beforeId?: string;
}

export function BurnSeverityLayer({
  cogUrl,
  visible = true,
  opacity = 0.7,
  beforeId,
}: BurnSeverityLayerProps) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    // Register COG protocol if not already registered
    const mapInstance = map.getMap();
    if (!mapInstance._cogProtocolAdded) {
      mapInstance.addProtocol('cog', cogProtocol);
      mapInstance._cogProtocolAdded = true;
    }

    const sourceId = 'burn-severity-source';
    const layerId = 'burn-severity-layer';

    // Add source
    if (!mapInstance.getSource(sourceId)) {
      mapInstance.addSource(sourceId, {
        type: 'raster',
        url: `cog://${cogUrl}`,
        tileSize: 256,
      });
    }

    // Add layer
    if (!mapInstance.getLayer(layerId)) {
      mapInstance.addLayer(
        {
          id: layerId,
          type: 'raster',
          source: sourceId,
          paint: {
            'raster-opacity': opacity,
            'raster-resampling': 'nearest', // Preserve class boundaries
          },
          layout: {
            visibility: visible ? 'visible' : 'none',
          },
        },
        beforeId
      );
    }

    // Cleanup
    return () => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    };
  }, [map, cogUrl, visible, opacity, beforeId]);

  // Update visibility
  useEffect(() => {
    if (!map) return;
    const mapInstance = map.getMap();
    const layerId = 'burn-severity-layer';
    
    if (mapInstance.getLayer(layerId)) {
      mapInstance.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  }, [map, visible]);

  // Update opacity
  useEffect(() => {
    if (!map) return;
    const mapInstance = map.getMap();
    const layerId = 'burn-severity-layer';
    
    if (mapInstance.getLayer(layerId)) {
      mapInstance.setPaintProperty(layerId, 'raster-opacity', opacity);
    }
  }, [map, opacity]);

  return null; // This is a map layer, not a DOM element
}
```

### Step 10: Integrate with NationalMap

**File:** `src/components/map/NationalMap.tsx` (modify)

```typescript
import { BurnSeverityLayer } from './BurnSeverityLayer';

// Inside NationalMap component, add:
const [showBurnSeverity, setShowBurnSeverity] = useState(true);

// In the Map component's children:
<BurnSeverityLayer
  cogUrl="https://storage.googleapis.com/ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif"
  visible={showBurnSeverity}
  opacity={0.7}
  beforeId="fire-perimeters" // Render below perimeter outlines
/>
```

### Step 11: Add Layer Toggle

**File:** `src/components/map/LayerControlPanel.tsx` (create or modify)

```typescript
interface LayerControlPanelProps {
  layers: {
    id: string;
    name: string;
    visible: boolean;
    onToggle: (visible: boolean) => void;
  }[];
}

export function LayerControlPanel({ layers }: LayerControlPanelProps) {
  return (
    <div className="layer-control-panel">
      <h4>Map Layers</h4>
      {layers.map((layer) => (
        <label key={layer.id} className="layer-toggle">
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={(e) => layer.onToggle(e.target.checked)}
          />
          {layer.name}
        </label>
      ))}
    </div>
  );
}
```

---

## Phase 1E: Validation

### Test Checklist

| Test | Command/Action | Expected Result |
|------|----------------|-----------------|
| COG validity | `rio cogeo validate *.tif` | Valid COG structure |
| GCS accessibility | `curl -I <gcs-url>` | 200 OK, Accept-Ranges: bytes |
| MapLibre rendering | Load NationalMap | Severity overlay visible |
| Zoom performance | Zoom in/out rapidly | No lag, tiles load progressively |
| Color accuracy | Compare to MTBS viewer | Classes match expected colors |
| Layer toggle | Click toggle | Layer shows/hides |
| Mobile rendering | Test on phone | Renders without crash |

### Performance Benchmarks

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Initial load | < 3 seconds | Chrome DevTools Network |
| Tile fetch | < 500ms per tile | Network waterfall |
| Memory usage | < 100MB for layer | Chrome Task Manager |
| FPS during pan | > 30 fps | Chrome Performance tab |

---

## Phase 1F: TiTiler Deployment (Recommended)

### Step 12: Deploy TiTiler to Cloud Run

```bash
# Pull official TiTiler image
docker pull ghcr.io/developmentseed/titiler:latest

# Tag for Artifact Registry
docker tag ghcr.io/developmentseed/titiler:latest \
  us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest

# Deploy to Cloud Run
gcloud run deploy ranger-titiler \
  --image us-central1-docker.pkg.dev/ranger-usfs-dev/ranger-images/titiler:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars="CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,GDAL_DISABLE_READDIR_ON_OPEN=EMPTY_DIR,GDAL_HTTP_MERGE_CONSECUTIVE_RANGES=YES"
```

### Step 13: Update BurnSeverityLayer for TiTiler

Replace the maplibre-cog-protocol approach with TiTiler tiles:

```typescript
// BurnSeverityLayer.tsx - TiTiler version
const TITILER_URL = import.meta.env.VITE_TITILER_URL;
const COG_URL = 'gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif';

// TiTiler tile URL pattern
const tileUrl = `${TITILER_URL}/cog/tiles/{z}/{x}/{y}?url=${encodeURIComponent(COG_URL)}&colormap_name=rdylgn_r`;

// In MapLibre source configuration
mapInstance.addSource('burn-severity-source', {
  type: 'raster',
  tiles: [tileUrl],
  tileSize: 256,
});
```

---

## Troubleshooting

### COG not loading
```bash
# Check CORS
curl -I -H "Origin: http://localhost:3000" <gcs-url>
# Should include Access-Control-Allow-Origin

# Check byte-range support
curl -r 0-1000 <gcs-url> -o /dev/null -w "%{http_code}"
# Should return 206 Partial Content
```

### Colors incorrect
- Verify source data uses integer severity classes (1-6), not continuous values
- Check that `raster-resampling: 'nearest'` is set (prevents interpolation)
- Ensure colormap values match MTBS classification

### Performance issues
- Verify COG has overviews: `gdalinfo <file> | grep Overview`
- Check tile size is 256 or 512
- Consider reducing max zoom level for raster layer

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/map/BurnSeverityLayer.tsx` | COG raster layer component |
| `src/components/map/LayerControlPanel.tsx` | Layer visibility toggles |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/map/NationalMap.tsx` | BurnSeverityLayer integration |
| `package.json` | Add @geomatico/maplibre-cog-protocol |

### GCS Assets
| Path | Description |
|------|-------------|
| `gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif` | Production COG |

---

## Claude Code Handoff Prompt

```
## ADR-013 Phase 1: Burn Severity COG Integration

Branch: feature/adr-013-geospatial-layer (create new)

Prerequisites completed by team:
- COG file uploaded to: gs://ranger-geospatial-dev/mtbs/cedar_creek_severity_cog.tif
- GCS CORS configured for localhost and *.run.app

Your tasks:
1. Install @geomatico/maplibre-cog-protocol
2. Create BurnSeverityLayer.tsx per spec
3. Create LayerControlPanel.tsx
4. Integrate with NationalMap.tsx
5. Test rendering at multiple zoom levels

Read first:
- docs/specs/ADR-013-PHASE-1-IMPLEMENTATION.md
- docs/adr/ADR-013-geospatial-intelligence-layer.md

Success criteria:
- Burn severity renders over Cedar Creek area
- Layer toggle shows/hides overlay
- Performance: < 3s initial load, > 30fps pan
- No console errors related to COG loading
```

---

## Next Phase Preview

**Phase 2: Vector Overlays**
- Trail damage points (GeoJSON → PMTiles)
- Treatment unit polygons
- Phase-aware styling

**Phase 3: MCP Integration**
- `get_burn_severity_at_point(lat, lon)` tool
- Agent can query "What's the severity at coordinates X, Y?"

---

**Document Owner:** RANGER CTO  
**Last Updated:** 2024-12-31  
**Status:** Draft for Review

# Milestone 1: The Living Map

**For:** Anti-Gravity (coding agent)
**From:** Claude (senior AI dev)
**Objective:** Replace the SVG terrain placeholder with real, interactive GIS centered on Cedar Creek.

---

## Prerequisites

### MapTiler Account Setup

1. Go to https://cloud.maptiler.com/
2. Sign up for free account
3. Get your API key from the dashboard
4. Create `.env.local` in `apps/command-console/`:
   ```
   VITE_MAPTILER_API_KEY=your_api_key_here
   ```

---

## Task 1.1: Install Dependencies

```bash
cd apps/command-console
npm install maplibre-gl
npm install -D @types/maplibre-gl
```

---

## Task 1.2: Create Map Component

**File:** `src/components/map/CedarCreekMap.tsx`

```typescript
import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Cedar Creek Fire center coordinates (Willamette NF, Oregon)
const CEDAR_CREEK_CENTER: [number, number] = [-122.1, 43.7];
const INITIAL_ZOOM = 11;
const INITIAL_PITCH = 45; // Slight 3D tilt for terrain visibility
const INITIAL_BEARING = -15; // Slight rotation for visual interest

export type MapLayer = 'satellite' | 'terrain' | 'ir';

interface CedarCreekMapProps {
  activeLayer: MapLayer;
  onMapReady?: (map: maplibregl.Map) => void;
}

const CedarCreekMap: React.FC<CedarCreekMapProps> = ({
  activeLayer,
  onMapReady,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  // Map style URLs from MapTiler
  const styles: Record<MapLayer, string> = {
    satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`,
    terrain: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${apiKey}`,
    ir: `https://api.maptiler.com/maps/toner-v2/style.json?key=${apiKey}`, // Dark style as IR base
  };

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styles[activeLayer],
      center: CEDAR_CREEK_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: INITIAL_PITCH,
      bearing: INITIAL_BEARING,
      maxPitch: 85,
      antialias: true,
    });

    // Add terrain (3D elevation)
    map.current.on('load', () => {
      if (!map.current) return;

      // Add terrain source
      map.current.addSource('terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
        tileSize: 256,
      });

      // Enable 3D terrain
      map.current.setTerrain({
        source: 'terrain',
        exaggeration: 1.5, // Exaggerate elevation for visual impact
      });

      // Add sky layer for atmosphere
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      setIsLoaded(true);
      onMapReady?.(map.current);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [apiKey]); // Only reinitialize if API key changes

  // Handle layer changes without full reinit
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    map.current.setStyle(styles[activeLayer]);

    // Re-add terrain after style change
    map.current.once('style.load', () => {
      if (!map.current) return;

      map.current.addSource('terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${apiKey}`,
        tileSize: 256,
      });

      map.current.setTerrain({
        source: 'terrain',
        exaggeration: 1.5,
      });
    });
  }, [activeLayer, isLoaded, apiKey]);

  if (!apiKey) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-severe text-sm">
          MapTiler API key not configured. Add VITE_MAPTILER_API_KEY to .env.local
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default CedarCreekMap;
```

---

## Task 1.3: Create Map Store

**File:** `src/stores/mapStore.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type maplibregl from 'maplibre-gl';

export type MapLayer = 'satellite' | 'terrain' | 'ir';

interface MapState {
  // Map instance reference
  map: maplibregl.Map | null;
  setMap: (map: maplibregl.Map | null) => void;

  // Active layer
  activeLayer: MapLayer;
  setActiveLayer: (layer: MapLayer) => void;

  // Map view state
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;

  // Actions
  flyTo: (options: { center?: [number, number]; zoom?: number; pitch?: number; bearing?: number }) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetBearing: () => void;
}

// Cedar Creek defaults
const CEDAR_CREEK_CENTER: [number, number] = [-122.1, 43.7];
const DEFAULT_ZOOM = 11;
const DEFAULT_PITCH = 45;
const DEFAULT_BEARING = -15;

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      map: null,
      setMap: (map) => set({ map }),

      activeLayer: 'satellite',
      setActiveLayer: (layer) => set({ activeLayer: layer }),

      center: CEDAR_CREEK_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,

      flyTo: (options) => {
        const { map } = get();
        if (!map) return;

        map.flyTo({
          center: options.center,
          zoom: options.zoom,
          pitch: options.pitch,
          bearing: options.bearing,
          duration: 2000,
          essential: true,
        });

        set({
          center: options.center ?? get().center,
          zoom: options.zoom ?? get().zoom,
          pitch: options.pitch ?? get().pitch,
          bearing: options.bearing ?? get().bearing,
        });
      },

      resetView: () => {
        const { map } = get();
        if (!map) return;

        map.flyTo({
          center: CEDAR_CREEK_CENTER,
          zoom: DEFAULT_ZOOM,
          pitch: DEFAULT_PITCH,
          bearing: DEFAULT_BEARING,
          duration: 1500,
        });

        set({
          center: CEDAR_CREEK_CENTER,
          zoom: DEFAULT_ZOOM,
          pitch: DEFAULT_PITCH,
          bearing: DEFAULT_BEARING,
        });
      },

      zoomIn: () => {
        const { map, zoom } = get();
        if (!map) return;
        const newZoom = Math.min(zoom + 1, 18);
        map.zoomTo(newZoom, { duration: 300 });
        set({ zoom: newZoom });
      },

      zoomOut: () => {
        const { map, zoom } = get();
        if (!map) return;
        const newZoom = Math.max(zoom - 1, 5);
        map.zoomTo(newZoom, { duration: 300 });
        set({ zoom: newZoom });
      },

      resetBearing: () => {
        const { map } = get();
        if (!map) return;
        map.rotateTo(0, { duration: 500 });
        set({ bearing: 0 });
      },
    }),
    { name: 'map-store' }
  )
);

// Selector hooks
export const useActiveLayer = () => useMapStore((state) => state.activeLayer);
export const useMapActions = () =>
  useMapStore((state) => ({
    flyTo: state.flyTo,
    resetView: state.resetView,
    zoomIn: state.zoomIn,
    zoomOut: state.zoomOut,
    resetBearing: state.resetBearing,
    setActiveLayer: state.setActiveLayer,
  }));
```

---

## Task 1.4: Update MapControls

**File:** `src/components/map/MapControls.tsx`

Replace the existing file:

```typescript
import React from 'react';
import { Plus, Minus, Compass, RotateCcw } from 'lucide-react';
import { useMapStore, useMapActions, type MapLayer } from '@/stores/mapStore';

const LAYERS: { id: MapLayer; label: string }[] = [
  { id: 'satellite', label: 'SAT' },
  { id: 'terrain', label: 'TER' },
  { id: 'ir', label: 'IR' },
];

const MapControls: React.FC = () => {
  const activeLayer = useMapStore((state) => state.activeLayer);
  const { setActiveLayer, zoomIn, zoomOut, resetBearing, resetView } = useMapActions();

  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
      {/* Layer Toggle Pill */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 shadow-2xl border border-white/10">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`
              w-10 h-10 rounded-full text-[10px] font-bold tracking-tighter transition-all duration-200
              ${
                activeLayer === layer.id
                  ? 'bg-safe text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }
            `}
            title={`Switch to ${layer.label} view`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 border border-white/10">
        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Zoom in"
        >
          <Plus size={18} />
        </button>
        <div className="h-[1px] w-6 mx-auto bg-white/10" />
        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Zoom out"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Compass / Reset */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 border border-white/10">
        <button
          onClick={resetBearing}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Reset bearing to north"
        >
          <Compass size={22} strokeWidth={1.5} />
        </button>
        <div className="h-[1px] w-6 mx-auto bg-white/10" />
        <button
          onClick={resetView}
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          title="Reset to Cedar Creek view"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default MapControls;
```

---

## Task 1.5: Update App.tsx

Replace `Terrain3D` with `CedarCreekMap`:

```typescript
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import Attribution from '@/components/map/Attribution';
import CedarCreekMap from '@/components/map/CedarCreekMap';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import { useMapStore } from '@/stores/mapStore';
import BriefingObserver from '@/components/briefing/BriefingObserver';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const addEvent = useBriefingStore((state) => state.addEvent);
  const activeLayer = useMapStore((state) => state.activeLayer);
  const setMap = useMapStore((state) => state.setMap);

  useEffect(() => {
    mockBriefingService.loadFixtures()
      .then(() => {
        setIsReady(true);
        console.log('[App] Fixtures loaded');
      })
      .catch((err) => {
        console.error('[App] Failed to load fixtures:', err);
      });

    const unsubscribe = mockBriefingService.subscribe((event) => {
      console.log('[App] Received event:', event.event_id);
      addEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [addEvent]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm mono">Loading RANGER...</div>
      </div>
    );
  }

  return (
    <BriefingObserver autoConnect={false}>
      <div className="relative w-screen h-screen overflow-hidden bg-background flex text-text-primary">
        {/* Real Map Layer */}
        <CedarCreekMap
          activeLayer={activeLayer}
          onMapReady={(map) => setMap(map)}
        />

        {/* Lifecycle Navigation Rail */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <Header />
          </div>

          <main className="flex-1 relative p-6">
            <div className="pointer-events-auto contents">
              {/* Insight Panel - Top Right */}
              <InsightPanel />

              {/* Map Controls - Bottom Right */}
              <MapControls />

              {/* Attribution - Bottom Left */}
              <Attribution />
            </div>
          </main>
        </div>
      </div>
    </BriefingObserver>
  );
};

export default App;
```

---

## Task 1.6: Update Attribution

**File:** `src/components/map/Attribution.tsx`

```typescript
import React from 'react';

const Attribution: React.FC = () => {
  return (
    <div className="absolute bottom-6 left-6 z-20">
      <div className="glass px-3 py-1.5 rounded text-[10px] text-text-muted border border-white/10">
        <a
          href="https://www.maptiler.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-primary transition-colors"
        >
          © MapTiler
        </a>
        {' · '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-primary transition-colors"
        >
          © OpenStreetMap
        </a>
        {' · '}
        <span className="text-accent-cyan">Cedar Creek Fire, OR</span>
      </div>
    </div>
  );
};

export default Attribution;
```

---

## Task 1.7: Add MapLibre CSS Import

**File:** `src/index.css` or `src/main.tsx`

Add to the top of your main CSS file:

```css
@import 'maplibre-gl/dist/maplibre-gl.css';
```

Or in `main.tsx`:

```typescript
import 'maplibre-gl/dist/maplibre-gl.css';
```

---

## Task 1.8: Delete Old Terrain3D

The `Terrain3D.tsx` file can be deleted or archived. It's no longer needed.

---

## Environment Variables

Create `apps/command-console/.env.local`:

```
VITE_MAPTILER_API_KEY=your_maptiler_api_key_here
```

Add to `.gitignore` if not already:
```
.env.local
```

---

## Testing Checklist

- [ ] MapTiler account created and API key obtained
- [ ] `.env.local` configured with API key
- [ ] Map loads with satellite imagery
- [ ] Map centers on Cedar Creek area
- [ ] 3D terrain visible (hills have depth)
- [ ] SAT button shows satellite imagery
- [ ] TER button shows terrain/outdoor map
- [ ] IR button shows dark style (placeholder for now)
- [ ] Zoom +/- buttons work
- [ ] Compass button resets bearing to north
- [ ] Reset button flies back to Cedar Creek
- [ ] Map is pannable and zoomable with mouse/touch
- [ ] No console errors

---

## Success Criteria

When complete, you should see:
1. Real satellite imagery of the Oregon Cascades
2. 3D terrain with visible elevation
3. Cedar Creek fire area centered in view
4. Working layer toggles
5. Working zoom and compass controls

---

## Notes

- The "IR" layer is a placeholder dark style for now. Milestone 6 will add real thermal visualization.
- Geographic markers (Lookout Peak, Mill Creek) from the old SVG are removed. Milestone 2 will add real GeoJSON markers.
- Keep `mockBriefingService` working — we still need fixture events until Milestone 4.

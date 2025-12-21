/**
 * CedarCreekMap - Real MapLibre GL JS map centered on Cedar Creek Fire
 *
 * Features:
 * - MapTiler satellite, terrain, and outdoor tiles
 * - 3D terrain with hillshade
 * - Layer switching (SAT/TER/IR)
 * - Smooth camera controls via mapStore
 * - GeoJSON overlays: fire perimeter, burn severity, trail damage, timber plots
 *
 * Cedar Creek Fire (2022): 43.7°N, 122.1°W, Willamette National Forest, Oregon
 */

import React, { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, useActiveLayer, useMapCamera, useTerrainSettings, useDataLayers } from '@/stores/mapStore';

// MapTiler tile URLs
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

const TILE_SOURCES = {
  SAT: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
  TER: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
  IR: `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`,
};

const TERRAIN_SOURCE = `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${MAPTILER_KEY}`;

// Severity color palette
const SEVERITY_COLORS = {
  HIGH: '#EF4444',    // Red
  MODERATE: '#F59E0B', // Amber
  LOW: '#10B981',      // Green
};

// Trail damage type colors
const DAMAGE_COLORS = {
  BRIDGE_FAILURE: '#EF4444',
  DEBRIS_FLOW: '#F97316',
  HAZARD_TREES: '#EAB308',
  TREAD_EROSION: '#84CC16',
  SIGNAGE: '#22C55E',
};

// Timber priority colors
const PRIORITY_COLORS = {
  HIGHEST: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#22C55E',
};

const CedarCreekMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isInitialized = useRef(false);
  const dataLoaded = useRef(false);

  const activeLayer = useActiveLayer();
  const camera = useMapCamera();
  const dataLayers = useDataLayers();
  const { exaggeration, enabled: terrainEnabled } = useTerrainSettings();
  const setCamera = useMapStore((state) => state.setCamera);

  // Load GeoJSON data and add layers
  const loadDataLayers = useCallback(async (mapInstance: maplibregl.Map) => {
    if (dataLoaded.current) return;

    try {
      const response = await fetch('/fixtures/cedar-creek-geojson.json');
      const data = await response.json();

      // Add fire perimeter source and layer
      mapInstance.addSource('fire-perimeter', {
        type: 'geojson',
        data: data.firePerimeter,
      });

      mapInstance.addLayer({
        id: 'fire-perimeter-line',
        type: 'line',
        source: 'fire-perimeter',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 3,
          'line-dasharray': [4, 4],
          'line-opacity': 0.9,
        },
      });

      // Add burn severity source and layers
      mapInstance.addSource('burn-severity', {
        type: 'geojson',
        data: data.burnSeverity,
      });

      mapInstance.addLayer({
        id: 'burn-severity-fill',
        type: 'fill',
        source: 'burn-severity',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'HIGH', SEVERITY_COLORS.HIGH,
            'MODERATE', SEVERITY_COLORS.MODERATE,
            'LOW', SEVERITY_COLORS.LOW,
            '#888888',
          ],
          'fill-opacity': 0.35,
        },
      });

      mapInstance.addLayer({
        id: 'burn-severity-outline',
        type: 'line',
        source: 'burn-severity',
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'HIGH', SEVERITY_COLORS.HIGH,
            'MODERATE', SEVERITY_COLORS.MODERATE,
            'LOW', SEVERITY_COLORS.LOW,
            '#888888',
          ],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // Add trail damage source and layer
      mapInstance.addSource('trail-damage', {
        type: 'geojson',
        data: data.trailDamage,
      });

      mapInstance.addLayer({
        id: 'trail-damage-points',
        type: 'circle',
        source: 'trail-damage',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'severity'],
            1, 6,
            5, 12,
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            'BRIDGE_FAILURE', DAMAGE_COLORS.BRIDGE_FAILURE,
            'DEBRIS_FLOW', DAMAGE_COLORS.DEBRIS_FLOW,
            'HAZARD_TREES', DAMAGE_COLORS.HAZARD_TREES,
            'TREAD_EROSION', DAMAGE_COLORS.TREAD_EROSION,
            'SIGNAGE', DAMAGE_COLORS.SIGNAGE,
            '#888888',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9,
        },
      });

      // Add timber plots source and layer
      mapInstance.addSource('timber-plots', {
        type: 'geojson',
        data: data.timberPlots,
      });

      mapInstance.addLayer({
        id: 'timber-plots-points',
        type: 'circle',
        source: 'timber-plots',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'match',
            ['get', 'priority'],
            'HIGHEST', PRIORITY_COLORS.HIGHEST,
            'HIGH', PRIORITY_COLORS.HIGH,
            'MEDIUM', PRIORITY_COLORS.MEDIUM,
            'LOW', PRIORITY_COLORS.LOW,
            '#888888',
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#1E293B',
          'circle-opacity': 0.9,
        },
      });

      // Add timber plot labels
      mapInstance.addLayer({
        id: 'timber-plots-labels',
        type: 'symbol',
        source: 'timber-plots',
        layout: {
          'text-field': ['get', 'plot_id'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#0F172A',
          'text-halo-width': 1,
        },
      });

      dataLoaded.current = true;
      console.log('[CedarCreekMap] GeoJSON data layers loaded');
    } catch (error) {
      console.error('[CedarCreekMap] Failed to load GeoJSON data:', error);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;
    if (!MAPTILER_KEY) {
      console.error('[CedarCreekMap] Missing VITE_MAPTILER_API_KEY');
      return;
    }

    isInitialized.current = true;

    // Create map with satellite base layer
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [TILE_SOURCES.SAT],
            tileSize: 512,
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
          },
          'terrain-dem': {
            type: 'raster-dem',
            tiles: [TERRAIN_SOURCE],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            paint: {
              'raster-opacity': 1,
            },
          },
        ],
        terrain: {
          source: 'terrain-dem',
          exaggeration: 1.5,
        },
        sky: {
          'sky-color': '#0f172a',
          'sky-horizon-blend': 0.5,
          'horizon-color': '#1e293b',
          'horizon-fog-blend': 0.8,
          'fog-color': '#0f172a',
          'fog-ground-blend': 0.9,
        },
      },
      center: camera.center,
      zoom: camera.zoom,
      bearing: camera.bearing,
      pitch: camera.pitch,
      maxPitch: 85,
    });

    // Load GeoJSON data once map is ready
    map.current.on('load', () => {
      if (map.current) {
        loadDataLayers(map.current);
      }
    });

    // Sync camera state on move
    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      setCamera({
        center: [center.lng, center.lat],
        zoom: map.current.getZoom(),
        bearing: map.current.getBearing(),
        pitch: map.current.getPitch(),
      });
    });

    // Add popup on click for data layers
    map.current.on('click', 'trail-damage-points', (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      if (!props) return;

      new maplibregl.Popup({ className: 'ranger-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2">
            <div class="font-bold text-sm">${props.trail_name}</div>
            <div class="text-xs text-amber-400">${props.type.replace('_', ' ')}</div>
            <div class="text-xs mt-1">${props.description}</div>
            <div class="text-xs mt-1 text-red-400">Severity: ${props.severity}/5</div>
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('click', 'timber-plots-points', (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      if (!props) return;

      new maplibregl.Popup({ className: 'ranger-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2">
            <div class="font-bold text-sm">Plot ${props.plot_id}</div>
            <div class="text-xs text-cyan-400">${props.stand_type}</div>
            <div class="text-xs mt-1">MBF/acre: ${props.mbf_per_acre}</div>
            <div class="text-xs">Value/acre: $${props.salvage_value_per_acre?.toLocaleString()}</div>
            <div class="text-xs mt-1 font-medium" style="color: ${
              props.priority === 'HIGHEST' ? PRIORITY_COLORS.HIGHEST :
              props.priority === 'HIGH' ? PRIORITY_COLORS.HIGH :
              props.priority === 'MEDIUM' ? PRIORITY_COLORS.MEDIUM :
              PRIORITY_COLORS.LOW
            }">Priority: ${props.priority}</div>
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('click', 'burn-severity-fill', (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      if (!props) return;

      new maplibregl.Popup({ className: 'ranger-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2">
            <div class="font-bold text-sm">${props.name}</div>
            <div class="text-xs" style="color: ${
              props.severity === 'HIGH' ? SEVERITY_COLORS.HIGH :
              props.severity === 'MODERATE' ? SEVERITY_COLORS.MODERATE :
              SEVERITY_COLORS.LOW
            }">${props.severity} Severity</div>
            <div class="text-xs mt-1">${props.acres?.toLocaleString()} acres</div>
            <div class="text-xs">dNBR: ${props.dnbr_mean}</div>
          </div>
        `)
        .addTo(map.current!);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'trail-damage-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'trail-damage-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'timber-plots-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'timber-plots-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'burn-severity-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'burn-severity-fill', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    console.log('[CedarCreekMap] Initialized at Cedar Creek Fire location');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitialized.current = false;
        dataLoaded.current = false;
      }
    };
  }, [loadDataLayers]);

  // Handle base layer changes
  const updateLayer = useCallback(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    if (activeLayer === 'SAT') {
      if (!mapInstance.getSource('satellite')) {
        mapInstance.addSource('satellite', {
          type: 'raster',
          tiles: [TILE_SOURCES.SAT],
          tileSize: 512,
        });
      }

      if (mapInstance.getLayer('satellite-layer')) {
        mapInstance.setLayoutProperty('satellite-layer', 'visibility', 'visible');
        mapInstance.setPaintProperty('satellite-layer', 'raster-saturation', 0);
        mapInstance.setPaintProperty('satellite-layer', 'raster-contrast', 0);
        mapInstance.setPaintProperty('satellite-layer', 'raster-brightness-min', 0);
      }
    }

    if (activeLayer === 'TER') {
      if (mapInstance.getLayer('satellite-layer')) {
        mapInstance.setLayoutProperty('satellite-layer', 'visibility', 'visible');
        mapInstance.setPaintProperty('satellite-layer', 'raster-saturation', -0.3);
        mapInstance.setPaintProperty('satellite-layer', 'raster-contrast', 0.2);
        mapInstance.setPaintProperty('satellite-layer', 'raster-brightness-min', 0);
      }
    }

    if (activeLayer === 'IR') {
      if (mapInstance.getLayer('satellite-layer')) {
        mapInstance.setLayoutProperty('satellite-layer', 'visibility', 'visible');
        mapInstance.setPaintProperty('satellite-layer', 'raster-saturation', -0.9);
        mapInstance.setPaintProperty('satellite-layer', 'raster-contrast', 0.5);
        mapInstance.setPaintProperty('satellite-layer', 'raster-brightness-min', 0.1);
      }
    }

    console.log(`[CedarCreekMap] Layer switched to: ${activeLayer}`);
  }, [activeLayer]);

  useEffect(() => {
    if (!map.current) return;

    if (map.current.isStyleLoaded()) {
      updateLayer();
    } else {
      map.current.once('load', updateLayer);
    }
  }, [activeLayer, updateLayer]);

  // Handle data layer visibility changes
  useEffect(() => {
    if (!map.current || !dataLoaded.current) return;

    const mapInstance = map.current;

    // Fire perimeter
    if (mapInstance.getLayer('fire-perimeter-line')) {
      mapInstance.setLayoutProperty(
        'fire-perimeter-line',
        'visibility',
        dataLayers.firePerimeter.visible ? 'visible' : 'none'
      );
    }

    // Burn severity
    ['burn-severity-fill', 'burn-severity-outline'].forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          dataLayers.burnSeverity.visible ? 'visible' : 'none'
        );
      }
    });

    // Trail damage
    if (mapInstance.getLayer('trail-damage-points')) {
      mapInstance.setLayoutProperty(
        'trail-damage-points',
        'visibility',
        dataLayers.trailDamage.visible ? 'visible' : 'none'
      );
    }

    // Timber plots
    ['timber-plots-points', 'timber-plots-labels'].forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          dataLayers.timberPlots.visible ? 'visible' : 'none'
        );
      }
    });
  }, [dataLayers]);

  // Handle terrain exaggeration changes
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    const applyTerrain = () => {
      if (terrainEnabled) {
        mapInstance.setTerrain({
          source: 'terrain-dem',
          exaggeration: exaggeration,
        });
      } else {
        mapInstance.setTerrain(null);
      }
    };

    if (mapInstance.isStyleLoaded()) {
      applyTerrain();
    } else {
      mapInstance.once('load', applyTerrain);
    }
  }, [exaggeration, terrainEnabled]);

  // Handle external camera changes (from controls)
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    const currentCenter = mapInstance.getCenter();
    const currentZoom = mapInstance.getZoom();

    const centerDiff =
      Math.abs(currentCenter.lng - camera.center[0]) > 0.001 ||
      Math.abs(currentCenter.lat - camera.center[1]) > 0.001;
    const zoomDiff = Math.abs(currentZoom - camera.zoom) > 0.1;

    if (centerDiff || zoomDiff) {
      mapInstance.flyTo({
        center: camera.center,
        zoom: camera.zoom,
        bearing: camera.bearing,
        pitch: camera.pitch,
        duration: 1000,
      });
    }
  }, [camera.center[0], camera.center[1], camera.zoom]);

  return (
    <div
      ref={mapContainer}
      className="absolute inset-0 w-full h-full"
      style={{
        background: '#0f172a',
      }}
    />
  );
};

export default CedarCreekMap;

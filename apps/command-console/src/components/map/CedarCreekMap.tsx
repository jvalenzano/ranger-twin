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

import React, { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, useActiveLayer, useMapCamera, useTerrainExaggeration, useTerrainEnabled, useDataLayers, type MapFeatureId } from '@/stores/mapStore';
import { useMeasureMode } from '@/stores/measureStore';
import { useActiveFire, useActiveFireId } from '@/stores/fireContextStore';
import MeasureTool from './MeasureTool';

// MapTiler tile URLs
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

const TILE_SOURCES = {
  SAT: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
  TER: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`,
  IR: `https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`,
};

const TERRAIN_SOURCE = `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${MAPTILER_KEY}`;

// Severity color palette (normal view)
const SEVERITY_COLORS = {
  HIGH: '#EF4444',    // Red
  MODERATE: '#F59E0B', // Amber
  LOW: '#10B981',      // Green
};

// IR/Thermal color palette (heat signature style)
const IR_SEVERITY_COLORS = {
  HIGH: '#EF4444',     // Red (Consistent)
  MODERATE: '#F59E0B', // Amber (Consistent)
  LOW: '#10B981',      // Green (Consistent)
};

// Trail damage type colors
const DAMAGE_COLORS = {
  BRIDGE_FAILURE: '#EF4444',
  DEBRIS_FLOW: '#F97316',
  HAZARD_TREES: '#EAB308',
  TREAD_EROSION: '#F59E0B', // Amber
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
  const isInternalMove = useRef(false);
  const dataLoaded = useRef(false);
  const activePopup = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const prevFireIdRef = useRef<string | null>(null);

  const activeLayer = useActiveLayer();
  const measureMode = useMeasureMode();
  const camera = useMapCamera();
  const dataLayers = useDataLayers();
  const exaggeration = useTerrainExaggeration();
  const terrainEnabled = useTerrainEnabled();
  const setCamera = useMapStore((state) => state.setCamera);
  const resetBearing = useMapStore((state) => state.resetBearing);
  const zoomIn = useMapStore((state) => state.zoomIn);

  // Fire context for dynamic positioning
  const activeFire = useActiveFire();
  const activeFireId = useActiveFireId();
  const zoomOut = useMapStore((state) => state.zoomOut);
  const setActiveLayer = useMapStore((state) => state.setActiveLayer);
  const setHoveredFeature = useMapStore((state) => state.setHoveredFeature);

  // Track hover state for visual effects
  const hoveredFeatureRef = useRef<{ source: string; id: string | number } | null>(null);

  // Keyboard shortcuts for map controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          resetBearing();
          break;
        case 's':
          e.preventDefault();
          setActiveLayer('SAT');
          break;
        case 't':
          e.preventDefault();
          setActiveLayer('TER');
          break;
        case 'i':
          e.preventDefault();
          setActiveLayer('IR');
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetBearing, setActiveLayer, zoomIn, zoomOut]);

  // Load GeoJSON data and add layers
  const loadDataLayers = useCallback(async (mapInstance: maplibregl.Map) => {
    if (dataLoaded.current) return;

    // Use dynamic path based on active fire's fixtures path
    const fixturesPath = activeFire.fixturesPath || 'cedar-creek';
    const geojsonUrl = `/fixtures/${fixturesPath}-geojson.json`;

    try {
      console.log(`[CedarCreekMap] Loading GeoJSON from: ${geojsonUrl}`);
      const response = await fetch(geojsonUrl);
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
          // Thicker line on hover for visual feedback
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4, // hovered
            2, // default
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1, // hovered
            0.8, // default
          ],
        },
      });

      // IR/Thermal mode layers - hidden by default
      // These use thermal imaging colors (blue=cold, yellow=warm, white=hot)
      mapInstance.addLayer({
        id: 'burn-severity-ir-fill',
        type: 'fill',
        source: 'burn-severity',
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'HIGH', IR_SEVERITY_COLORS.HIGH,
            'MODERATE', IR_SEVERITY_COLORS.MODERATE,
            'LOW', IR_SEVERITY_COLORS.LOW,
            '#1a1a2e',
          ],
          'fill-opacity': 0.6,
        },
      });

      // IR glow effect layer for high severity (heat signature)
      mapInstance.addLayer({
        id: 'burn-severity-ir-glow',
        type: 'fill',
        source: 'burn-severity',
        layout: {
          visibility: 'none',
        },
        filter: ['==', ['get', 'severity'], 'HIGH'],
        paint: {
          'fill-color': '#FF6B00',
          'fill-opacity': 0.3,
        },
      });

      mapInstance.addLayer({
        id: 'burn-severity-ir-outline',
        type: 'line',
        source: 'burn-severity',
        layout: {
          visibility: 'none',
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'HIGH', '#EF4444',
            'MODERATE', '#F59E0B',
            'LOW', '#10B981',
            '#333344',
          ],
          'line-width': 3,
          'line-opacity': 0.9,
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
          // Scale based on severity, with additional hover boost
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            // Hovered: +2 to base radius
            ['+', 2, ['interpolate', ['linear'], ['get', 'severity'], 1, 6, 5, 12]],
            // Default
            ['interpolate', ['linear'], ['get', 'severity'], 1, 6, 5, 12],
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
          // Thicker stroke on hover
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3, // hovered
            2, // default
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#00D9FF', // cyan stroke on hover for contrast
            '#FFFFFF', // default white stroke
          ],
          'circle-opacity': 0.9,
        },
      });

      mapInstance.addLayer({
        id: 'trail-damage-labels',
        type: 'symbol',
        source: 'trail-damage',
        layout: {
          'text-field': ['get', 'damage_id'],
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
          // Scale up on hover (1.2x effect)
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            12, // hovered
            10, // default
          ],
          'circle-color': [
            'match',
            ['get', 'priority'],
            'HIGHEST', PRIORITY_COLORS.HIGHEST,
            'HIGH', PRIORITY_COLORS.HIGH,
            'MEDIUM', PRIORITY_COLORS.MEDIUM,
            'LOW', PRIORITY_COLORS.LOW,
            '#888888',
          ],
          // Thicker stroke on hover
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4, // hovered
            3, // default
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#FFFFFF', // white stroke on hover
            '#1E293B', // default dark stroke
          ],
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
      console.log('[CedarCreekMap] GeoJSON data layers loaded for:', activeFire.fire_id);
    } catch (error) {
      console.error('[CedarCreekMap] Failed to load GeoJSON data:', error);
    }
  }, [activeFire.fixturesPath, activeFire.fire_id]);

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
            id: 'satellite-layer-sat',
            type: 'raster',
            source: 'satellite',
            layout: {
              visibility: activeLayer === 'SAT' ? 'visible' : 'none',
            },
            paint: {
              'raster-opacity': 1,
              'raster-saturation': 0,
              'raster-contrast': 0,
              'raster-brightness-min': 0,
              'raster-brightness-max': 1,
              'raster-hue-rotate': 0,
            },
          },
          {
            id: 'satellite-layer-ter',
            type: 'raster',
            source: 'satellite',
            layout: {
              visibility: activeLayer === 'TER' ? 'visible' : 'none',
            },
            paint: {
              'raster-opacity': 1,
              'raster-saturation': -0.7,
              'raster-contrast': 0.4,
              'raster-brightness-min': 0.1,
              'raster-brightness-max': 0.85,
              'raster-hue-rotate': 30,
            },
          },
          {
            id: 'satellite-layer-ir',
            type: 'raster',
            source: 'satellite',
            layout: {
              visibility: activeLayer === 'IR' ? 'visible' : 'none',
            },
            paint: {
              'raster-opacity': 1,
              'raster-saturation': -1,
              'raster-contrast': 0.3,
              'raster-brightness-min': 0.05,
              'raster-brightness-max': 0.4,
              'raster-hue-rotate': 0,
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
      attributionControl: false,
      preserveDrawingBuffer: true,
    });

    // Add compact attribution control to bottom-left
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    // Load GeoJSON data once map is ready
    map.current.on('load', () => {
      if (map.current) {
        useMapStore.getState().setMapInstance(map.current);
        loadDataLayers(map.current);
        setMapReady(true);
      }
    });

    // Sync camera state on user-initiated moves (not from store)
    map.current.on('moveend', () => {
      if (!map.current) return;

      // Skip syncing back to store if this was an internal move (from controls)
      if (isInternalMove.current) {
        return;
      }

      const center = map.current.getCenter();
      setCamera({
        center: [center.lng, center.lat],
        zoom: map.current.getZoom(),
        bearing: map.current.getBearing(),
        pitch: map.current.getPitch(),
      });
    });

    // Unified click handler for prioritizing point features over areas
    map.current.on('click', (e) => {
      if (!map.current) return;

      const layers = ['timber-plots-points', 'trail-damage-points', 'burn-severity-fill'];
      const features = map.current.queryRenderedFeatures(e.point, { layers });

      if (!features.length) return;

      // queryRenderedFeatures returns features in visual Z-order (topmost first)
      const feature = features[0];
      if (!feature || !feature.properties) return;

      const props = feature.properties;
      const layerId = feature.layer.id as 'trail-damage-points' | 'timber-plots-points' | 'burn-severity-fill';

      // Close existing popup (Singleton)
      if (activePopup.current) {
        activePopup.current.remove();
      }

      // Create popup content as DOM element for event handling
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2';

      // Build content based on feature type
      let headerHtml = '';
      let detailsHtml = '';
      let featureName = '';

      if (layerId === 'trail-damage-points') {
        featureName = props.trail_name || 'Unknown Trail';
        headerHtml = `
          <div class="font-bold text-sm">${props.trail_name}</div>
          <div class="text-xs text-amber-400">${(props.type || '').replace('_', ' ')}</div>
        `;
        detailsHtml = `
          <div class="text-xs mt-1">${props.description || ''}</div>
          <div class="text-xs mt-1 text-red-400">Severity: ${props.severity}/5</div>
        `;
      } else if (layerId === 'timber-plots-points') {
        featureName = `Plot ${props.plot_id}`;
        const priorityColor = props.priority === 'HIGHEST' ? PRIORITY_COLORS.HIGHEST :
          props.priority === 'HIGH' ? PRIORITY_COLORS.HIGH :
            props.priority === 'MEDIUM' ? PRIORITY_COLORS.MEDIUM :
              PRIORITY_COLORS.LOW;
        headerHtml = `
          <div class="font-bold text-sm">Plot ${props.plot_id}</div>
          <div class="text-xs text-cyan-400">${props.stand_type}</div>
        `;
        detailsHtml = `
          <div class="text-xs mt-1">MBF/acre: ${props.mbf_per_acre}</div>
          <div class="text-xs">Value/acre: $${props.salvage_value_per_acre?.toLocaleString()}</div>
          <div class="text-xs mt-1 font-medium" style="color: ${priorityColor}">Priority: ${props.priority}</div>
        `;
      } else if (layerId === 'burn-severity-fill') {
        featureName = props.name || 'Burn Zone';
        const severityColor = props.severity === 'HIGH' ? SEVERITY_COLORS.HIGH :
          props.severity === 'MODERATE' ? SEVERITY_COLORS.MODERATE :
            SEVERITY_COLORS.LOW;
        headerHtml = `
          <div class="font-bold text-sm">${props.name}</div>
          <div class="text-xs" style="color: ${severityColor}">${props.severity} Severity</div>
        `;
        detailsHtml = `
          <div class="text-xs mt-1">${props.acres?.toLocaleString()} acres</div>
          <div class="text-xs">dNBR: ${props.dnbr_mean}</div>
        `;
      }

      // Assemble popup HTML with Site Analysis button
      popupContent.innerHTML = `
        ${headerHtml}
        ${detailsHtml}
        <button class="site-analysis-btn mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan/40 hover:border-accent-cyan/60 text-accent-cyan rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Analyze Site
        </button>
        <div class="text-[9px] text-center text-text-muted mt-1">Cross-reference with USFS records</div>
      `;

      // Attach click handler to button
      const analyzeBtn = popupContent.querySelector('.site-analysis-btn');
      analyzeBtn?.addEventListener('click', (evt) => {
        evt.stopPropagation();

        // Get coordinates from feature geometry
        const coords = feature.geometry.type === 'Point'
          ? feature.geometry.coordinates as [number, number]
          : e.lngLat.toArray() as [number, number];

        // Import store action dynamically to avoid hook issues
        import('@/stores/visualAuditStore').then(({ useVisualAuditStore }) => {
          useVisualAuditStore.getState().startFeatureAnalysis({
            featureId: props.damage_id || props.plot_id || props.zone_id || String(feature.id),
            featureType: layerId,
            featureName,
            properties: { ...props },
            coordinates: coords,
          });
        });

        // Close popup
        if (activePopup.current) {
          activePopup.current.remove();
          activePopup.current = null;
        }
      });

      // Create and show popup using setDOMContent
      const popup = new maplibregl.Popup({ className: 'ranger-popup' })
        .setLngLat(e.lngLat)
        .setDOMContent(popupContent)
        .addTo(map.current!);

      activePopup.current = popup;
      popup.on('close', () => {
        if (activePopup.current === popup) {
          activePopup.current = null;
        }
      });
    });


    // Enhanced hover handler with visual feedback
    map.current.on('mousemove', (e) => {
      if (!map.current) return;
      const mapInstance = map.current;
      const layers = ['timber-plots-points', 'trail-damage-points', 'burn-severity-fill'];
      const features = mapInstance.queryRenderedFeatures(e.point, { layers });

      // Update cursor
      mapInstance.getCanvas().style.cursor = features.length ? 'pointer' : '';

      // Clear previous hover state
      if (hoveredFeatureRef.current) {
        mapInstance.setFeatureState(
          { source: hoveredFeatureRef.current.source, id: hoveredFeatureRef.current.id },
          { hover: false }
        );
        hoveredFeatureRef.current = null;
        setHoveredFeature(null);
      }

      // Set new hover state
      const feature = features[0];
      if (feature) {
        const featureId = feature.id ?? feature.properties?.['id'] ?? feature.properties?.['plot_id'];

        if (featureId !== undefined) {
          const source = feature.source;
          hoveredFeatureRef.current = { source, id: featureId };

          // Set MapLibre feature state for hover styling
          mapInstance.setFeatureState(
            { source, id: featureId },
            { hover: true }
          );

          // Update store for cross-component access
          const mapFeature: MapFeatureId = {
            layer: feature.layer.id,
            id: featureId,
            properties: feature.properties as Record<string, unknown>,
          };
          setHoveredFeature(mapFeature);
        }
      }
    });

    // Clear hover on mouse leave
    map.current.on('mouseleave', () => {
      if (!map.current) return;
      if (hoveredFeatureRef.current) {
        map.current.setFeatureState(
          { source: hoveredFeatureRef.current.source, id: hoveredFeatureRef.current.id },
          { hover: false }
        );
        hoveredFeatureRef.current = null;
        setHoveredFeature(null);
      }
    });

    console.log('[CedarCreekMap] Initialized at Cedar Creek Fire location');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitialized.current = false;
        dataLoaded.current = false;
        setMapReady(false);
      }
    };
  }, [loadDataLayers]);

  // Handle fire context changes - reload GeoJSON when fire switches
  const previousFireIdRef = useRef(activeFireId);
  useEffect(() => {
    if (!map.current || !mapReady) return;
    if (previousFireIdRef.current === activeFireId) return;

    console.log(`[CedarCreekMap] Fire context changed: ${previousFireIdRef.current} -> ${activeFireId}`);
    previousFireIdRef.current = activeFireId;

    const mapInstance = map.current;

    // Remove existing GeoJSON sources and layers
    const sourcesToRemove = ['fire-perimeter', 'burn-severity', 'trail-damage', 'timber-plots', 'trails'];
    const layersToRemove = [
      'fire-perimeter-line',
      'burn-severity-fill', 'burn-severity-outline',
      'burn-severity-ir-fill', 'burn-severity-ir-outline',
      'trail-damage-points', 'trail-damage-labels',
      'timber-plots-circles', 'timber-plot-labels',
      'trails-line',
    ];

    // Remove layers first (before sources)
    layersToRemove.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
    });

    // Then remove sources
    sourcesToRemove.forEach((sourceId) => {
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    });

    // Reset data loaded flag and reload
    dataLoaded.current = false;
    loadDataLayers(mapInstance);

    // Fly to new fire's centroid
    if (activeFire.centroid) {
      mapInstance.flyTo({
        center: activeFire.centroid,
        zoom: 10,
        duration: 2000,
      });
    }
  }, [activeFireId, mapReady, loadDataLayers, activeFire.centroid]);

  // Handle base layer changes
  const updateLayer = useCallback(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    const isIR = activeLayer === 'IR';

    // Toggle normal burn severity layers
    const normalSeverityLayers = ['burn-severity-fill', 'burn-severity-outline'];
    normalSeverityLayers.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          isIR ? 'none' : (dataLayers.burnSeverity.visible ? 'visible' : 'none')
        );
      }
    });

    // Toggle IR thermal layers
    const irSeverityLayers = ['burn-severity-ir-fill', 'burn-severity-ir-outline'];
    irSeverityLayers.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          isIR && dataLayers.burnSeverity.visible ? 'visible' : 'none'
        );
      }
    });

    if (activeLayer === 'SAT') {
      // Reset terrain exaggeration for SAT mode
      if (mapInstance.getTerrain()) {
        mapInstance.setTerrain({
          source: 'terrain-dem',
          exaggeration: 1.5,
        });
      }
    }

    if (activeLayer === 'TER') {
      // Increase terrain exaggeration for TER mode
      if (mapInstance.getTerrain()) {
        mapInstance.setTerrain({
          source: 'terrain-dem',
          exaggeration: 2.5,
        });
      }
    }

    if (activeLayer === 'IR') {
      // Reset terrain exaggeration for IR mode
      if (mapInstance.getTerrain()) {
        mapInstance.setTerrain({
          source: 'terrain-dem',
          exaggeration: 1.5,
        });
      }
    }

    console.log(`[CedarCreekMap] Layer visibility updated for: ${activeLayer}`);
  }, [activeLayer, dataLayers.burnSeverity.visible]);



  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    const applyStyles = () => {
      // 1. Update general layout visibility
      updateLayer();

      // 2. Toggle specific style layers
      const baseLayers: Record<string, string> = {
        SAT: 'satellite-layer-sat',
        TER: 'satellite-layer-ter',
        IR: 'satellite-layer-ir',
      };

      Object.entries(baseLayers).forEach(([key, layerId]) => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.setLayoutProperty(
            layerId,
            'visibility',
            activeLayer === key ? 'visible' : 'none'
          );
        }
      });

      // 3. Trigger immediate repaint
      mapInstance.triggerRepaint();
    };

    if (mapInstance.isStyleLoaded()) {
      applyStyles();
    } else {
      mapInstance.once('load', applyStyles);
    }
  }, [activeLayer, updateLayer]);

  // Handle data layer visibility changes
  useEffect(() => {
    if (!map.current || !dataLoaded.current) return;

    const mapInstance = map.current;
    const isIR = activeLayer === 'IR';

    // Fire perimeter (use cyan glow in IR mode)
    if (mapInstance.getLayer('fire-perimeter-line')) {
      mapInstance.setLayoutProperty(
        'fire-perimeter-line',
        'visibility',
        dataLayers.firePerimeter.visible ? 'visible' : 'none'
      );
      // Style perimeter for IR mode
      if (isIR) {
        mapInstance.setPaintProperty('fire-perimeter-line', 'line-color', '#00FFFF');
        mapInstance.setPaintProperty('fire-perimeter-line', 'line-width', 4);
      } else {
        mapInstance.setPaintProperty('fire-perimeter-line', 'line-color', '#FFFFFF');
        mapInstance.setPaintProperty('fire-perimeter-line', 'line-width', 3);
      }
    }

    // Burn severity - toggle between normal and IR layers
    const normalLayers = ['burn-severity-fill', 'burn-severity-outline'];
    const irLayers = ['burn-severity-ir-fill', 'burn-severity-ir-glow', 'burn-severity-ir-outline'];

    normalLayers.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          (!isIR && dataLayers.burnSeverity.visible) ? 'visible' : 'none'
        );
      }
    });

    irLayers.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          (isIR && dataLayers.burnSeverity.visible) ? 'visible' : 'none'
        );
      }
    });

    // Trail damage - use brighter colors in IR mode
    if (mapInstance.getLayer('trail-damage-points')) {
      mapInstance.setLayoutProperty(
        'trail-damage-points',
        'visibility',
        dataLayers.trailDamage.visible ? 'visible' : 'none'
      );
      if (mapInstance.getLayer('trail-damage-labels')) {
        mapInstance.setLayoutProperty(
          'trail-damage-labels',
          'visibility',
          dataLayers.trailDamage.visible ? 'visible' : 'none'
        );
      }
      if (isIR) {
        mapInstance.setPaintProperty('trail-damage-points', 'circle-stroke-color', '#00FFFF');
        mapInstance.setPaintProperty('trail-damage-points', 'circle-stroke-width', 3);
      } else {
        mapInstance.setPaintProperty('trail-damage-points', 'circle-stroke-color', '#FFFFFF');
        mapInstance.setPaintProperty('trail-damage-points', 'circle-stroke-width', 2);
      }
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
  }, [dataLayers, activeLayer]);

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
    const currentBearing = mapInstance.getBearing();
    const currentPitch = mapInstance.getPitch();

    const centerDiff =
      Math.abs(currentCenter.lng - camera.center[0]) > 0.001 ||
      Math.abs(currentCenter.lat - camera.center[1]) > 0.001;
    const zoomDiff = Math.abs(currentZoom - camera.zoom) > 0.1;

    // Normalize bearing difference (handle wraparound at 360)
    let bearingDelta = camera.bearing - currentBearing;
    if (bearingDelta > 180) bearingDelta -= 360;
    if (bearingDelta < -180) bearingDelta += 360;
    const bearingDiff = Math.abs(bearingDelta) > 1;

    const pitchDiff = Math.abs(currentPitch - camera.pitch) > 1;

    if (centerDiff || zoomDiff || bearingDiff || pitchDiff) {
      // Mark as internal move and set a timeout to reset it
      // This prevents the moveend listener from syncing back to store during animation
      isInternalMove.current = true;

      // Safety timeout to reset the flag in case moveend doesn't fire
      const safetyTimeout = setTimeout(() => {
        isInternalMove.current = false;
      }, 2500); // Slightly longer than animation duration

      // Use 'once' to properly handle the end of this specific animation
      const handleMoveEnd = () => {
        clearTimeout(safetyTimeout);
        isInternalMove.current = false;
      };
      mapInstance.once('moveend', handleMoveEnd);

      mapInstance.flyTo({
        center: camera.center,
        zoom: camera.zoom,
        bearing: camera.bearing,
        pitch: camera.pitch,
        duration: 1000, // Faster animation for better responsiveness
        essential: true,
      });
    }
  }, [camera.center[0], camera.center[1], camera.zoom, camera.bearing, camera.pitch]);

  // Handle fire context changes - fly to new fire location
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Skip initial render - only respond to actual fire switches
    if (prevFireIdRef.current === null) {
      prevFireIdRef.current = activeFireId;
      return;
    }

    // Only fly if fire actually changed
    if (prevFireIdRef.current !== activeFireId) {
      prevFireIdRef.current = activeFireId;

      console.log(`[CedarCreekMap] Fire context changed to: ${activeFire.name}`);

      // Fly to the new fire's centroid
      isInternalMove.current = true;
      map.current.flyTo({
        center: activeFire.centroid,
        zoom: 10,
        duration: 2000,
        essential: true,
      });

      // Update the map store camera
      setCamera({
        center: activeFire.centroid,
        zoom: 10,
      });

      // Reset flag after animation
      setTimeout(() => {
        isInternalMove.current = false;
      }, 2500);
    }
  }, [activeFireId, activeFire.centroid, activeFire.name, mapReady, setCamera]);

  // Determine if measuring is active for cursor styling
  const isMeasuring = measureMode !== null;

  return (
    <>
      <div
        ref={mapContainer}
        className={`absolute inset-0 w-full h-full ${isMeasuring ? 'measuring-active' : ''}`}
        style={{
          background: '#0f172a',
          cursor: isMeasuring ? 'crosshair' : undefined,
        }}
      />
      {/* Measurement tool - handles map interactions when active */}
      {mapReady && <MeasureTool map={map.current} />}
    </>
  );
};

export default CedarCreekMap;

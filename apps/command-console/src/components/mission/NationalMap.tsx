/**
 * NationalMap - MapLibre map showing all fires across the US
 *
 * ARCHITECTURE: Uses native MapLibre GeoJSON layers (WebGL) instead of HTML markers
 * for guaranteed geographic consistency at all zoom levels.
 *
 * Features:
 * - Constrained to continental US bounds
 * - Fire markers as circle layers (WebGL rendered)
 * - "New in 24h" visual indicator for recently discovered fires
 * - Click to select fire → opens FireInfoPopup
 * - Hover to highlight → shows FireTooltip after 300ms delay
 * - Pulsing animation on selected marker
 * - Synced with IncidentRail selection
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  useMissionStore,
  useSelectedFireId,
  useHoveredFireId,
  useMissionFilters,
  useStackView,
  useWatchlist,
  useNationalCamera,
  useShowHotspots,
  useHotspotConfidence,
  useHotspotDayRange,
  useShowBurnSeverity,
  useBurnSeverityOpacity,
} from '@/stores/missionStore';
import { nationalFireService } from '@/services/nationalFireService';
import { fetchFireDetections, type FirmsDetection } from '@/services/firmsService';
import { PHASE_COLORS, PHASE_DISPLAY, type NationalFire } from '@/types/mission';
import { hotspotsToGeoJSON, confidenceToNumeric } from '@/utils/hotspotFilter';
import { FireInfoPopup } from './FireInfoPopup';
import { getFireTooltipHTML } from './FireTooltip';
import { HotspotLayerControl } from './HotspotLayerControl';

// MapTiler API key from environment
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'get_your_own_key';

// Default center (continental US)
const US_CENTER: [number, number] = [-98.5795, 39.8283];

// Tooltip delay in milliseconds
const TOOLTIP_DELAY = 300;

// Layer IDs - Managed fires
const FIRES_SOURCE = 'fires-source';
const FIRES_LAYER = 'fires-layer';
const FIRES_SELECTED_LAYER = 'fires-selected-layer';
const FIRES_HOVER_LAYER = 'fires-hover-layer';
const FIRES_NEW_GLOW_LAYER = 'fires-new-glow-layer';
const FIRES_LABELS_LAYER = 'fires-labels-layer';

// Layer IDs - VIIRS Hotspots
const HOTSPOTS_SOURCE = 'hotspots-source';
const HOTSPOTS_LAYER = 'hotspots-layer';

// Layer IDs - Burn Severity (ADR-013)
const BURN_SEVERITY_SOURCE = 'burn-severity-source';
const BURN_SEVERITY_LAYER = 'burn-severity-layer';

// TiTiler configuration
const TITILER_URL = import.meta.env.VITE_TITILER_URL || 'http://localhost:8080';
const GEOSPATIAL_BUCKET = import.meta.env.VITE_GEOSPATIAL_BUCKET || 'ranger-geospatial-dev';
const DEFAULT_COG_PATH = 'mtbs/cedar_creek_severity_cog.tif';

/**
 * Check if a fire started within the last 24 hours
 */
function isNewFire(startDate: string): boolean {
  const fireStart = new Date(startDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - fireStart.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

/**
 * Convert fires to GeoJSON FeatureCollection
 */
function firesToGeoJSON(fires: NationalFire[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fires.map((fire) => ({
      type: 'Feature',
      id: fire.id,
      geometry: {
        type: 'Point',
        coordinates: fire.coordinates,
      },
      properties: {
        id: fire.id,
        name: fire.name,
        state: fire.state,
        severity: fire.severity,
        phase: fire.phase,
        acres: fire.acres,
        containment: fire.containment,
        triageScore: fire.triageScore,
        hasFixtures: fire.hasFixtures,
        isNew: isNewFire(fire.startDate),
        // Pre-compute size based on acres (log scale)
        markerSize: Math.max(8, Math.min(24, Math.log10(fire.acres) * 5)),
      },
    })),
  };
}

export function NationalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);

  const filters = useMissionFilters();
  const stackView = useStackView();
  const watchlist = useWatchlist();
  const selectedFireId = useSelectedFireId();
  const hoveredFireId = useHoveredFireId();
  const nationalCamera = useNationalCamera();
  const showHotspots = useShowHotspots();
  const hotspotConfidence = useHotspotConfidence();
  const hotspotDayRange = useHotspotDayRange();
  const showBurnSeverity = useShowBurnSeverity();
  const burnSeverityOpacity = useBurnSeverityOpacity();

  const { selectFire, hoverFire, enterTacticalView, setNationalCamera, toggleBurnSeverity } = useMissionStore();

  const [fires, setFires] = useState<NationalFire[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [newFireCount, setNewFireCount] = useState(0);

  // Hotspot state
  const [hotspots, setHotspots] = useState<FirmsDetection[]>([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const [filteredHotspotCount, setFilteredHotspotCount] = useState(0);

  // Initialize fires
  useEffect(() => {
    async function loadFires() {
      await nationalFireService.initialize();
      const allFires = nationalFireService.getAllFires();
      setFires(allFires);
      // Count new fires
      setNewFireCount(allFires.filter(f => isNewFire(f.startDate)).length);
    }
    loadFires();
  }, []);

  // Close the info popup
  const closePopup = useCallback(() => {
    if (popupRootRef.current) {
      popupRootRef.current.unmount();
      popupRootRef.current = null;
    }
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  // Close the hover tooltip
  const closeTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }
  }, []);

  // Open fire info popup for a fire
  const openPopup = useCallback((fire: NationalFire) => {
    if (!map.current) return;

    // Close existing popup
    closePopup();
    closeTooltip();

    // Create popup container
    const popupContainer = document.createElement('div');

    // Create MapLibre popup
    const popup = new maplibregl.Popup({
      className: 'fire-info-popup',
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px',
      anchor: 'bottom',
      offset: 15,
    })
      .setLngLat(fire.coordinates)
      .setDOMContent(popupContainer)
      .addTo(map.current);

    // Render React component into popup
    const root = createRoot(popupContainer);
    root.render(
      <FireInfoPopup
        fire={fire}
        onClose={() => {
          closePopup();
          selectFire(null);
        }}
      />
    );

    // Store references
    popupRef.current = popup;
    popupRootRef.current = root;

    // Handle popup close
    popup.on('close', () => {
      closePopup();
    });
  }, [closePopup, closeTooltip, selectFire]);

  // Show tooltip for a fire (with delay)
  const showTooltip = useCallback((fire: NationalFire, coordinates: [number, number]) => {
    if (!map.current) return;

    // Don't show tooltip if popup is open
    if (popupRef.current) return;

    // Clear any pending tooltip
    closeTooltip();

    // Set up delayed tooltip
    tooltipTimeoutRef.current = window.setTimeout(() => {
      if (!map.current) return;

      const tooltip = new maplibregl.Popup({
        className: 'fire-tooltip',
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: 10,
      })
        .setLngLat(coordinates)
        .setHTML(getFireTooltipHTML(fire))
        .addTo(map.current);

      tooltipRef.current = tooltip;
    }, TOOLTIP_DELAY);
  }, [closeTooltip]);

  // Filter fires based on current state
  const getFilteredFires = useCallback((): NationalFire[] => {
    let result = nationalFireService.getFilteredFires(filters);

    if (stackView === 'watchlist') {
      result = result.filter((fire) => watchlist.includes(fire.id));
    }

    return result;
  }, [filters, stackView, watchlist]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
      center: nationalCamera.center,
      zoom: nationalCamera.zoom,
      minZoom: 3,
      maxZoom: 12,
      // Constrain to US bounds
      maxBounds: [
        [-135, 20], // Southwest
        [-55, 55],  // Northeast (with padding)
      ],
      // Move attribution to bottom-right (away from legend)
      attributionControl: false,
    });

    // Add compact attribution to top-left
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'top-left'
    );

    map.current.on('load', () => {
      if (!map.current) return;

      // =========================================================================
      // Managed Fires Layers
      // =========================================================================
      map.current.addSource(FIRES_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Glow layer for NEW fires (pulsing cyan ring)
      map.current.addLayer({
        id: FIRES_NEW_GLOW_LAYER,
        type: 'circle',
        source: FIRES_SOURCE,
        paint: {
          'circle-radius': ['*', ['get', 'markerSize'], 1.8] as maplibregl.ExpressionSpecification,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#22d3ee',
          'circle-stroke-opacity': 0.6,
        },
        filter: ['==', ['get', 'isNew'], true] as maplibregl.ExpressionSpecification,
      });

      // Base fire circles layer - colored by PHASE to match sidebar filter
      map.current.addLayer({
        id: FIRES_LAYER,
        type: 'circle',
        source: FIRES_SOURCE,
        paint: {
          'circle-radius': ['get', 'markerSize'] as maplibregl.ExpressionSpecification,
          'circle-color': [
            'match',
            ['get', 'phase'],
            'active', PHASE_COLORS.active,
            'baer_assessment', PHASE_COLORS.baer_assessment,
            'baer_implementation', PHASE_COLORS.baer_implementation,
            'in_restoration', PHASE_COLORS.in_restoration,
            '#888888', // default
          ] as maplibregl.ExpressionSpecification,
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.5,
        },
      });

      // Hover highlight layer
      map.current.addLayer({
        id: FIRES_HOVER_LAYER,
        type: 'circle',
        source: FIRES_SOURCE,
        paint: {
          'circle-radius': ['*', ['get', 'markerSize'], 1.2] as maplibregl.ExpressionSpecification,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.8,
        },
        filter: ['==', ['get', 'id'], ''] as maplibregl.ExpressionSpecification,
      });

      // Selected fire layer
      map.current.addLayer({
        id: FIRES_SELECTED_LAYER,
        type: 'circle',
        source: FIRES_SOURCE,
        paint: {
          'circle-radius': ['*', ['get', 'markerSize'], 1.5] as maplibregl.ExpressionSpecification,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#22d3ee',
          'circle-stroke-opacity': 1,
        },
        filter: ['==', ['get', 'id'], ''] as maplibregl.ExpressionSpecification,
      });

      // Fire name labels - visible when zoomed in (>= zoom 5)
      map.current.addLayer({
        id: FIRES_LABELS_LAYER,
        type: 'symbol',
        source: FIRES_SOURCE,
        minzoom: 5,
        layout: {
          'text-field': ['get', 'name'] as maplibregl.ExpressionSpecification,
          'text-size': 11,
          'text-offset': [0, 1.8] as unknown as maplibregl.ExpressionSpecification,
          'text-anchor': 'top',
          'text-max-width': 10,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5,
          'text-opacity': 0.9,
        },
      });

      // =========================================================================
      // Burn Severity Layer (ADR-013) - at bottom of layer stack
      // =========================================================================
      const cogUrl = `https://storage.googleapis.com/${GEOSPATIAL_BUCKET}/${DEFAULT_COG_PATH}`;
      const tileUrl = `${TITILER_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(cogUrl)}&colormap_name=rdylgn_r`;

      map.current.addSource(BURN_SEVERITY_SOURCE, {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '© <a href="https://www.mtbs.gov/">MTBS</a>',
      });

      map.current.addLayer({
        id: BURN_SEVERITY_LAYER,
        type: 'raster',
        source: BURN_SEVERITY_SOURCE,
        paint: {
          'raster-opacity': 0.7,
          'raster-resampling': 'nearest',
        },
        layout: {
          visibility: 'none', // Initially hidden
        },
      });

      // =========================================================================
      // VIIRS Hotspot Layer (below fire markers)
      // =========================================================================
      map.current.addSource(HOTSPOTS_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Hotspot circles - small, colored by confidence
      // Added before FIRES_NEW_GLOW_LAYER so hotspots appear below fire markers
      map.current.addLayer(
        {
          id: HOTSPOTS_LAYER,
          type: 'circle',
          source: HOTSPOTS_SOURCE,
          paint: {
            // Circles sized by FRP (fire radiative power) - larger for better click detection
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'frp'],
              0, 5,
              50, 8,
              200, 12,
            ] as maplibregl.ExpressionSpecification,
            // Color by confidence: red (high) → orange (nominal) → yellow (low)
            'circle-color': [
              'match',
              ['get', 'confidenceCategory'],
              'h', '#ef4444', // Red - high confidence
              'n', '#f97316', // Orange - nominal
              'l', '#fbbf24', // Yellow - low confidence
              '#f97316', // default
            ] as maplibregl.ExpressionSpecification,
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.3,
          },
          // Initially hidden - shown when toggle is enabled
          layout: {
            visibility: 'none',
          },
        },
        FIRES_NEW_GLOW_LAYER // Insert before this layer (so hotspots are below fires)
      );

      setIsMapReady(true);
    });

    // Track camera changes
    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      setNationalCamera({
        center: [center.lng, center.lat],
        zoom,
      });
    });

    // Click on managed fire marker
    map.current.on('click', FIRES_LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const fireId = feature.properties?.id as string | undefined;

      if (fireId) {
        // Look up fire from service directly (not from stale closure)
        const allFires = nationalFireService.getAllFires();
        const fire = allFires.find((f) => f.id === fireId);
        if (fire) {
          selectFire(fireId);
          openPopup(fire);
        }
      }
    });

    // Double-click to enter tactical view
    map.current.on('dblclick', FIRES_LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const fireId = feature.properties?.id as string | undefined;

      if (fireId) {
        // Look up fire from service directly (not from stale closure)
        const allFires = nationalFireService.getAllFires();
        const fire = allFires.find((f) => f.id === fireId);
        if (fire?.hasFixtures && fire?.fixtureFireId) {
          enterTacticalView(fire.fixtureFireId);
        }
      }

      e.preventDefault();
    });

    // Hover effects for managed fires
    map.current.on('mouseenter', FIRES_LAYER, (e) => {
      if (!map.current) return;

      const feature = e.features?.[0];
      if (!feature) return;

      map.current.getCanvas().style.cursor = 'pointer';

      const fireId = feature.properties?.id as string | undefined;

      if (fireId) {
        hoverFire(fireId);
        // Look up fire from service directly (not from stale closure)
        const allFires = nationalFireService.getAllFires();
        const fire = allFires.find((f) => f.id === fireId);
        if (fire && feature.geometry.type === 'Point') {
          showTooltip(fire, feature.geometry.coordinates as [number, number]);
        }
      }
    });

    map.current.on('mouseleave', FIRES_LAYER, () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
      hoverFire(null);
      closeTooltip();
    });

    // Click on hotspot marker - show detection details popup
    map.current.on('click', HOTSPOTS_LAYER, (e) => {
      if (!map.current) return;

      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') return;

      const props = feature.properties;
      const coords = feature.geometry.coordinates as [number, number];

      // Close any existing popups
      closePopup();
      closeTooltip();

      // Create popup with hotspot details
      const popup = new maplibregl.Popup({
        className: 'hotspot-popup',
        closeButton: true,
        closeOnClick: true,
        maxWidth: '280px',
        anchor: 'bottom',
        offset: 10,
      })
        .setLngLat(coords)
        .setHTML(`
          <div class="p-2 text-xs">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full ${
                props.confidenceCategory === 'h' ? 'bg-red-500' :
                props.confidenceCategory === 'n' ? 'bg-orange-500' : 'bg-yellow-500'
              }"></span>
              <span class="font-semibold text-white">Thermal Detection</span>
            </div>
            <div class="space-y-1 text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-500">Time:</span>
                <span>${props.acq_datetime || 'Unknown'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Confidence:</span>
                <span class="${
                  props.confidenceCategory === 'h' ? 'text-red-400' :
                  props.confidenceCategory === 'n' ? 'text-orange-400' : 'text-yellow-400'
                }">${
                  props.confidenceCategory === 'h' ? 'High' :
                  props.confidenceCategory === 'n' ? 'Nominal' : 'Low'
                } (${props.confidenceNumeric}%)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">FRP:</span>
                <span>${props.frp?.toFixed(1) || '0'} MW</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Detection:</span>
                <span>${props.daynight || 'Day'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Satellite:</span>
                <span>${props.satellite || 'VIIRS'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Location:</span>
                <span>${coords[1].toFixed(4)}°, ${coords[0].toFixed(4)}°</span>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-600 text-[10px] text-slate-500">
              Source: NASA FIRMS VIIRS
            </div>
          </div>
        `)
        .addTo(map.current);

      popupRef.current = popup;

      // Prevent event from propagating to the map click handler
      e.originalEvent.stopPropagation();
    });

    // Hover cursor for hotspots
    map.current.on('mouseenter', HOTSPOTS_LAYER, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', HOTSPOTS_LAYER, () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    // Click on empty map area (deselect)
    map.current.on('click', (e) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [FIRES_LAYER, HOTSPOTS_LAYER],
      });

      if (features.length === 0) {
        selectFire(null);
        closePopup();
      }
    });

    return () => {
      closePopup();
      closeTooltip();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update GeoJSON source when fires or filters change
  useEffect(() => {
    if (!isMapReady || !map.current) return;
    if (!nationalFireService.isReady()) return;

    const filteredFires = getFilteredFires();
    const geojson = firesToGeoJSON(filteredFires);

    const source = map.current.getSource(FIRES_SOURCE) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }

    // Update new fire count based on filtered fires
    setNewFireCount(filteredFires.filter(f => isNewFire(f.startDate)).length);
  }, [fires, filters, stackView, watchlist, isMapReady, getFilteredFires]);

  // Update hover layer filter
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    map.current.setFilter(
      FIRES_HOVER_LAYER,
      hoveredFireId ? ['==', ['get', 'id'], hoveredFireId] : ['==', ['get', 'id'], '']
    );
  }, [hoveredFireId, isMapReady]);

  // Update selected layer filter
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    map.current.setFilter(
      FIRES_SELECTED_LAYER,
      selectedFireId ? ['==', ['get', 'id'], selectedFireId] : ['==', ['get', 'id'], '']
    );
  }, [selectedFireId, isMapReady]);

  // Fly to selected fire when selection changes from external source
  useEffect(() => {
    if (!map.current || !selectedFireId) {
      closePopup();
      return;
    }

    const fire = fires.find((f) => f.id === selectedFireId);
    if (fire) {
      map.current.flyTo({
        center: fire.coordinates,
        zoom: Math.max(map.current.getZoom(), 6),
        duration: 1000,
      });

      setTimeout(() => {
        openPopup(fire);
      }, 200);
    }
  }, [selectedFireId, fires, openPopup, closePopup]);

  // Fetch hotspots when toggle is enabled or day range changes
  useEffect(() => {
    if (!showHotspots) {
      // When hotspots are disabled, clear the data
      setHotspots([]);
      setFilteredHotspotCount(0);
      return;
    }

    async function loadHotspots() {
      setIsLoadingHotspots(true);
      try {
        const detections = await fetchFireDetections({ dayRange: hotspotDayRange });
        setHotspots(detections);
        console.log(`[NationalMap] Fetched ${detections.length} hotspots for ${hotspotDayRange} day(s)`);
      } catch (error) {
        console.error('[NationalMap] Error fetching hotspots:', error);
        setHotspots([]);
      } finally {
        setIsLoadingHotspots(false);
      }
    }

    loadHotspots();
  }, [showHotspots, hotspotDayRange]);

  // Update hotspot layer visibility and data
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Toggle layer visibility
    map.current.setLayoutProperty(
      HOTSPOTS_LAYER,
      'visibility',
      showHotspots ? 'visible' : 'none'
    );

    if (!showHotspots) return;

    // Filter hotspots by confidence and update source
    const filteredHotspots = hotspots.filter((h) => {
      const numericConfidence = confidenceToNumeric(h.confidence);
      return numericConfidence >= hotspotConfidence;
    });

    const geojson = hotspotsToGeoJSON(filteredHotspots);
    const source = map.current.getSource(HOTSPOTS_SOURCE) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }

    setFilteredHotspotCount(filteredHotspots.length);
    console.log(
      `[NationalFireService] Displaying ${filteredHotspots.length} hotspots (confidence >= ${hotspotConfidence})`
    );
  }, [showHotspots, hotspots, hotspotConfidence, isMapReady]);

  // Update burn severity layer visibility and opacity (ADR-013)
  useEffect(() => {
    if (!isMapReady || !map.current) return;

    // Toggle layer visibility
    map.current.setLayoutProperty(
      BURN_SEVERITY_LAYER,
      'visibility',
      showBurnSeverity ? 'visible' : 'none'
    );

    // Update opacity
    if (showBurnSeverity) {
      map.current.setPaintProperty(BURN_SEVERITY_LAYER, 'raster-opacity', burnSeverityOpacity);
    }
  }, [showBurnSeverity, burnSeverityOpacity, isMapReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePopup();
      closeTooltip();
    };
  }, [closePopup, closeTooltip]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map controls overlay - positioned to left of IncidentRail (320px + padding) */}
      <div className="absolute bottom-4 right-[336px] flex flex-col gap-2 z-10">
        {/* Burn Severity layer toggle (ADR-013) */}
        <button
          onClick={toggleBurnSeverity}
          className={`px-3 py-1.5 rounded backdrop-blur-sm text-xs transition-colors border ${
            showBurnSeverity
              ? 'bg-amber-600/80 text-white border-amber-500/50 hover:bg-amber-500/80'
              : 'bg-slate-800/80 text-slate-300 border-white/10 hover:text-white hover:bg-slate-700/80'
          }`}
          title="Toggle burn severity overlay"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            Burn Severity {showBurnSeverity ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Hotspot layer control */}
        <HotspotLayerControl
          hotspotCount={filteredHotspotCount}
          isLoading={isLoadingHotspots}
        />

        {/* Reset view */}
        <button
          onClick={() => {
            map.current?.flyTo({
              center: US_CENTER,
              zoom: 4,
              duration: 1000,
            });
            selectFire(null);
            closePopup();
          }}
          className="px-3 py-1.5 rounded bg-slate-800/80 backdrop-blur-sm text-xs text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors border border-white/10"
        >
          Reset View
        </button>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 z-10">
        <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Fire Phase</h4>
        <div className="space-y-1">
          {(['active', 'baer_assessment', 'baer_implementation', 'in_restoration'] as const).map((phase) => (
            <div key={phase} className="flex items-center gap-2 text-[11px]">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PHASE_COLORS[phase] }}
              />
              <span className="text-slate-400">{PHASE_DISPLAY[phase].label}</span>
            </div>
          ))}
        </div>

        {/* New fires indicator */}
        {newFireCount > 0 && (
          <>
            <div className="border-t border-white/10 my-2" />
            <div className="flex items-center gap-2 text-[11px]">
              <div className="w-3 h-3 rounded-full border-2 border-cyan-400 bg-transparent" />
              <div>
                <span className="text-cyan-400 font-medium">New (24h)</span>
                <span className="text-slate-500 ml-1">• {newFireCount}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NationalMap;

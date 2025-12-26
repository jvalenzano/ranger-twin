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
} from '@/stores/missionStore';
import { nationalFireService } from '@/services/nationalFireService';
import { PHASE_COLORS, PHASE_DISPLAY, type NationalFire } from '@/types/mission';
import { FireInfoPopup } from './FireInfoPopup';
import { getFireTooltipHTML } from './FireTooltip';

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

  const { selectFire, hoverFire, enterTacticalView, setNationalCamera } = useMissionStore();

  const [fires, setFires] = useState<NationalFire[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [newFireCount, setNewFireCount] = useState(0);

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

    // Click on empty map area (deselect)
    map.current.on('click', (e) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [FIRES_LAYER],
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

      {/* Map controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
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
      <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10">
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

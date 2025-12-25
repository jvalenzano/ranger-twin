/**
 * NationalMap - MapLibre map showing all fires across the US
 *
 * ARCHITECTURE: Uses native MapLibre GeoJSON layers (WebGL) instead of HTML markers
 * for guaranteed geographic consistency at all zoom levels.
 *
 * Features:
 * - Constrained to continental US bounds
 * - Fire markers as circle layers (WebGL rendered)
 * - NASA FIRMS satellite hotspot overlay (real-time fire detections)
 * - Click to select fire → opens FireInfoPopup
 * - Hover to highlight → shows FireTooltip after 300ms delay
 * - Pulsing animation on selected marker
 * - Synced with IncidentRail selection
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Satellite } from 'lucide-react';

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
import { SEVERITY_DISPLAY, type NationalFire } from '@/types/mission';
import { FireInfoPopup } from './FireInfoPopup';
import { getFireTooltipHTML } from './FireTooltip';
import firmsService from '@/services/firmsService';

// MapTiler API key from environment
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'get_your_own_key';

// Default center (continental US)
const US_CENTER: [number, number] = [-98.5795, 39.8283];

// Tooltip delay in milliseconds
const TOOLTIP_DELAY = 300;

// Layer IDs - Managed fires (from mockNationalService)
const FIRES_SOURCE = 'fires-source';
const FIRES_LAYER = 'fires-layer';
const FIRES_SELECTED_LAYER = 'fires-selected-layer';
const FIRES_HOVER_LAYER = 'fires-hover-layer';

// Layer IDs - NASA FIRMS satellite hotspots
const FIRMS_SOURCE = 'firms-source';
const FIRMS_LAYER = 'firms-layer';
const FIRMS_GLOW_LAYER = 'firms-glow-layer';

// Severity colors for MapLibre expressions
const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

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

  // FIRMS state
  const [showFirms, setShowFirms] = useState(true);
  const [firmsCount, setFirmsCount] = useState(0);
  const [firmsLoading, setFirmsLoading] = useState(false);
  const [firmsLastUpdate, setFirmsLastUpdate] = useState<Date | null>(null);

  // Initialize fires
  useEffect(() => {
    async function loadFires() {
      await nationalFireService.initialize();
      setFires(nationalFireService.getAllFires());
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

  // Show tooltip for FIRMS hotspot
  const showFirmsTooltip = useCallback((properties: Record<string, unknown>, coordinates: [number, number]) => {
    if (!map.current) return;
    if (popupRef.current) return;

    closeTooltip();

    tooltipTimeoutRef.current = window.setTimeout(() => {
      if (!map.current) return;

      const frp = properties.frp as number;
      const confidence = properties.confidence as string;
      const datetime = properties.acq_datetime as string;
      const satellite = properties.satellite as string;

      const confidenceLabel = confidence === 'h' ? 'High' : confidence === 'n' ? 'Nominal' : 'Low';
      const confidenceColor = confidence === 'h' ? '#22c55e' : confidence === 'n' ? '#eab308' : '#ef4444';

      const html = `
        <div style="padding: 8px; min-width: 160px;">
          <div style="font-weight: 600; color: #f97316; font-size: 12px; margin-bottom: 4px;">
            NASA FIRMS Detection
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
            ${satellite} • ${datetime}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
            <div>
              <div style="color: #64748b;">Fire Power</div>
              <div style="color: white; font-weight: 500;">${frp.toFixed(1)} MW</div>
            </div>
            <div>
              <div style="color: #64748b;">Confidence</div>
              <div style="color: ${confidenceColor}; font-weight: 500;">${confidenceLabel}</div>
            </div>
          </div>
        </div>
      `;

      const tooltip = new maplibregl.Popup({
        className: 'fire-tooltip',
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: 10,
      })
        .setLngLat(coordinates)
        .setHTML(html)
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

  // Load FIRMS data
  const loadFirmsData = useCallback(async () => {
    if (!map.current || !isMapReady) return;

    setFirmsLoading(true);

    try {
      const geojson = await firmsService.getFireHotspotsGeoJSON();
      setFirmsCount(geojson.features.length);
      setFirmsLastUpdate(new Date());

      const source = map.current.getSource(FIRMS_SOURCE) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geojson);
      }
    } catch (error) {
      console.error('[NationalMap] Error loading FIRMS data:', error);
    } finally {
      setFirmsLoading(false);
    }
  }, [isMapReady]);

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
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // =========================================================================
      // NASA FIRMS Hotspots Layer (rendered first, underneath managed fires)
      // =========================================================================
      map.current.addSource(FIRMS_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Glow effect layer (larger, more transparent)
      map.current.addLayer({
        id: FIRMS_GLOW_LAYER,
        type: 'circle',
        source: FIRMS_SOURCE,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'frp'],
            0, 6,
            10, 10,
            50, 16,
          ] as maplibregl.ExpressionSpecification,
          'circle-color': '#ff6b35',
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      });

      // Core hotspot dots
      map.current.addLayer({
        id: FIRMS_LAYER,
        type: 'circle',
        source: FIRMS_SOURCE,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'frp'],
            0, 3,
            10, 5,
            50, 8,
          ] as maplibregl.ExpressionSpecification,
          'circle-color': [
            'match',
            ['get', 'confidence'],
            'h', '#ff4500',  // High confidence - bright orange-red
            'n', '#ff8c00',  // Nominal - orange
            '#ffaa00',       // Low - yellow-orange
          ] as maplibregl.ExpressionSpecification,
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.5,
        },
      });

      // =========================================================================
      // Managed Fires Layers (from mockNationalService - rendered on top)
      // =========================================================================
      map.current.addSource(FIRES_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Base fire circles layer
      map.current.addLayer({
        id: FIRES_LAYER,
        type: 'circle',
        source: FIRES_SOURCE,
        paint: {
          'circle-radius': ['get', 'markerSize'] as maplibregl.ExpressionSpecification,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'critical', SEVERITY_COLORS.critical,
            'high', SEVERITY_COLORS.high,
            'moderate', SEVERITY_COLORS.moderate,
            'low', SEVERITY_COLORS.low,
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
        const fire = fires.find((f) => f.id === fireId);
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
      const hasFixtures = feature.properties?.hasFixtures as boolean | undefined;

      if (fireId && hasFixtures) {
        enterTacticalView(fireId);
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
        const fire = fires.find((f) => f.id === fireId);
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

    // Hover effects for FIRMS hotspots
    map.current.on('mouseenter', FIRMS_LAYER, (e) => {
      if (!map.current) return;
      const feature = e.features?.[0];
      if (!feature) return;

      map.current.getCanvas().style.cursor = 'pointer';

      if (feature.geometry.type === 'Point') {
        showFirmsTooltip(
          feature.properties as Record<string, unknown>,
          feature.geometry.coordinates as [number, number]
        );
      }
    });

    map.current.on('mouseleave', FIRMS_LAYER, () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = '';
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

  // Load FIRMS data when map is ready
  useEffect(() => {
    if (isMapReady && firmsService.isConfigured()) {
      loadFirmsData();
    }
  }, [isMapReady, loadFirmsData]);

  // Toggle FIRMS layer visibility
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    const visibility = showFirms ? 'visible' : 'none';
    map.current.setLayoutProperty(FIRMS_LAYER, 'visibility', visibility);
    map.current.setLayoutProperty(FIRMS_GLOW_LAYER, 'visibility', visibility);
  }, [showFirms, isMapReady]);

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
        {/* FIRMS toggle */}
        <button
          onClick={() => setShowFirms(!showFirms)}
          className={`px-3 py-1.5 rounded backdrop-blur-sm text-xs transition-colors border flex items-center gap-2 ${
            showFirms
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
              : 'bg-slate-800/80 text-slate-400 border-white/10 hover:text-white hover:bg-slate-700/80'
          }`}
          title={showFirms ? 'Hide satellite hotspots' : 'Show satellite hotspots'}
        >
          <Satellite size={14} />
          <span>FIRMS {firmsCount > 0 ? `(${firmsCount})` : ''}</span>
          {firmsLoading && (
            <span className="animate-pulse">...</span>
          )}
        </button>

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

        {/* Refresh FIRMS */}
        {firmsService.isConfigured() && (
          <button
            onClick={() => {
              firmsService.clearCache();
              loadFirmsData();
            }}
            disabled={firmsLoading}
            className="px-3 py-1.5 rounded bg-slate-800/80 backdrop-blur-sm text-xs text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors border border-white/10 disabled:opacity-50"
            title={firmsLastUpdate ? `Last updated: ${firmsLastUpdate.toLocaleTimeString()}` : 'Refresh hotspots'}
          >
            {firmsLoading ? 'Loading...' : 'Refresh Hotspots'}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10">
        <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Managed Fires</h4>
        <div className="space-y-1 mb-3">
          {(['critical', 'high', 'moderate', 'low'] as const).map((severity) => (
            <div key={severity} className="flex items-center gap-2 text-[11px]">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SEVERITY_DISPLAY[severity].color }}
              />
              <span className="text-slate-400">{SEVERITY_DISPLAY[severity].label}</span>
            </div>
          ))}
        </div>

        {/* FIRMS Legend */}
        {showFirms && firmsCount > 0 && (
          <>
            <div className="border-t border-white/10 my-2" />
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Satellite size={10} />
              NASA FIRMS
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff4500' }} />
                <span className="text-slate-400">High Confidence</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff8c00' }} />
                <span className="text-slate-400">Nominal</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffaa00' }} />
                <span className="text-slate-400">Low Confidence</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-500 mt-2">
              {firmsCount} detections (24h)
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NationalMap;

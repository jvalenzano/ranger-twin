/**
 * BurnSeverityLayer.tsx
 *
 * Renders MTBS burn severity data as a raster overlay using TiTiler.
 * Part of ADR-013: Geospatial Intelligence Layer.
 *
 * Architecture:
 * - TiTiler serves COG tiles from GCS
 * - MapLibre renders tiles as raster layer
 * - Color mapping done server-side by TiTiler
 *
 * @see docs/specs/ADR-013-PHASE-1-IMPLEMENTATION.md
 */

import { useEffect, useCallback } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

// Environment configuration
const TITILER_URL = import.meta.env.VITE_TITILER_URL || 'http://localhost:8080';
const GEOSPATIAL_BUCKET = import.meta.env.VITE_GEOSPATIAL_BUCKET || 'ranger-geospatial-dev';

// MTBS Severity colormap (for reference - applied server-side by TiTiler)
// Value 1: Unburned to Low (green)
// Value 2: Low (light green)
// Value 3: Moderate (yellow)
// Value 4: High (orange)
// Value 5: Very High (red)
// Value 6: Increased Greenness (blue)
const SEVERITY_COLORMAP = 'rdylgn_r'; // Red-Yellow-Green reversed

export interface BurnSeverityLayerProps {
  /** MapLibre map instance */
  map: MapLibreMap | null;
  /** GCS path to the COG file (relative to bucket) */
  cogPath?: string;
  /** Whether the layer is visible */
  visible?: boolean;
  /** Layer opacity (0-1) */
  opacity?: number;
  /** Layer to render before (for z-ordering) */
  beforeId?: string;
  /** Fire ID for dynamic COG selection */
  fireId?: string;
  /** Callback when layer loads successfully */
  onLoad?: () => void;
  /** Callback when layer fails to load */
  onError?: (error: Error) => void;
}

// Default COG path for Cedar Creek Fire
const DEFAULT_COG_PATH = 'mtbs/cedar_creek_severity_cog.tif';

/**
 * Constructs the TiTiler tile URL for a COG asset.
 *
 * @param cogPath - Path to COG within the GCS bucket
 * @returns TiTiler tile URL template
 */
function buildTileUrl(cogPath: string): string {
  // Full GCS URL for the COG (use https for public bucket access)
  const cogUrl = `https://storage.googleapis.com/${GEOSPATIAL_BUCKET}/${cogPath}`;

  // TiTiler tile endpoint with colormap
  // Using rdylgn_r (reversed red-yellow-green) for severity visualization
  return `${TITILER_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(cogUrl)}&colormap_name=${SEVERITY_COLORMAP}`;
}

/**
 * BurnSeverityLayer Component
 *
 * Renders burn severity data from a Cloud-Optimized GeoTIFF via TiTiler.
 * The layer automatically updates when visibility or opacity changes.
 */
export function BurnSeverityLayer({
  map,
  cogPath = DEFAULT_COG_PATH,
  visible = true,
  opacity = 0.7,
  beforeId,
  fireId,
  onLoad,
  onError,
}: BurnSeverityLayerProps) {
  // Derive COG path from fireId if provided
  const effectiveCogPath = fireId
    ? `mtbs/${fireId}_severity_cog.tif`
    : cogPath;

  const sourceId = 'burn-severity-source';
  const layerId = 'burn-severity-layer';

  // Add source and layer to map
  const addLayer = useCallback((map: MapLibreMap) => {
    try {
      // Remove existing layer/source if present
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }

      // Add TiTiler raster source
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [buildTileUrl(effectiveCogPath)],
        tileSize: 256,
        // Attribution for MTBS data
        attribution: '© <a href="https://www.mtbs.gov/">MTBS</a>',
      });

      // Add raster layer
      map.addLayer(
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

      // Notify success
      onLoad?.();
    } catch (error) {
      console.error('[BurnSeverityLayer] Failed to add layer:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [effectiveCogPath, opacity, visible, beforeId, onLoad, onError]);

  // Initialize layer when map is ready
  useEffect(() => {
    if (!map) return;

    // Add layer when style is loaded
    if (map.isStyleLoaded()) {
      addLayer(map);
    } else {
      map.once('style.load', () => addLayer(map));
    }

    // Cleanup on unmount
    return () => {
      try {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch {
        // Map may already be destroyed
      }
    };
  }, [map, addLayer]);

  // Update visibility when prop changes
  useEffect(() => {
    if (!map) return;

    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  }, [map, visible]);

  // Update opacity when prop changes
  useEffect(() => {
    if (!map) return;

    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'raster-opacity', opacity);
    }
  }, [map, opacity]);

  // This is a map layer, not a DOM element
  return null;
}

/**
 * Hook to check TiTiler availability
 *
 * @returns Object with loading state, error, and availability status
 */
export function useTiTilerStatus() {
  // TODO: Implement health check on mount
  // GET ${TITILER_URL}/healthz
  return {
    isAvailable: true,
    isLoading: false,
    error: null,
    url: TITILER_URL,
  };
}

/**
 * Legend component for burn severity classes
 */
export function BurnSeverityLegend() {
  const classes = [
    { value: 1, label: 'Unburned/Low', color: '#1a9850' },
    { value: 2, label: 'Low', color: '#91cf60' },
    { value: 3, label: 'Moderate', color: '#fee08b' },
    { value: 4, label: 'High', color: '#fc8d59' },
    { value: 5, label: 'Very High', color: '#d73027' },
    { value: 6, label: 'Increased Greenness', color: '#4575b4' },
  ];

  return (
    <div className="burn-severity-legend">
      <h4 className="text-sm font-medium mb-2">Burn Severity</h4>
      <div className="space-y-1">
        {classes.map((cls) => (
          <div key={cls.value} className="flex items-center gap-2 text-xs">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: cls.color }}
            />
            <span>{cls.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Source: MTBS
      </p>
    </div>
  );
}

export default BurnSeverityLayer;

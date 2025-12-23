/**
 * Map Store - Manages map state for the Cedar Creek visualization
 *
 * Controls:
 * - Layer visibility (SAT/TER/IR)
 * - Camera position (center, zoom, bearing, pitch)
 * - 3D terrain exaggeration
 *
 * Cedar Creek Fire (2022) coordinates:
 * - Center: 43.726°N, 122.167°W (Willamette National Forest, Oregon)
 * - Source: Wikipedia (43°43′34″N 122°10′01″W)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type MapLayerType = 'SAT' | 'TER' | 'IR';

// Data overlay layers
export type DataLayerType = 'firePerimeter' | 'burnSeverity' | 'trailDamage' | 'timberPlots';

// Legend display mode
export type LegendMode = 'docked' | 'floating';

// Position for floating legend
export interface LegendPosition {
  x: number;
  y: number;
}

interface MapCamera {
  center: [number, number]; // [lng, lat]
  zoom: number;
  bearing: number;
  pitch: number;
}

interface DataLayerState {
  visible: boolean;
  highlighted: boolean; // For agent event highlights
}

// Feature identification for hover/selection
export interface MapFeatureId {
  layer: string;
  id: string | number;
  properties?: Record<string, unknown>;
}

interface MapState {
  // Base layer state
  activeLayer: MapLayerType;

  // Data overlay layers
  dataLayers: Record<DataLayerType, DataLayerState>;

  // Camera state
  camera: MapCamera;

  // 3D terrain
  terrainExaggeration: number;
  terrainEnabled: boolean;

  // UI State
  legendExpanded: boolean;
  legendMode: LegendMode;
  legendPosition: LegendPosition;
  legendCompact: boolean; // Summary mode (color dots only)

  // Hover/Selection state for map features
  hoveredFeature: MapFeatureId | null;
  selectedFeature: MapFeatureId | null;

  // Actions
  setActiveLayer: (layer: MapLayerType) => void;
  toggleDataLayer: (layer: DataLayerType) => void;
  highlightDataLayer: (layer: DataLayerType, highlight: boolean) => void;
  setCamera: (camera: Partial<MapCamera>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetBearing: () => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  setVisibleLayers: (layers: DataLayerType[]) => void;
  setTerrainExaggeration: (value: number) => void;
  toggleTerrain: () => void;
  setLegendExpanded: (expanded: boolean) => void;
  setLegendMode: (mode: LegendMode) => void;
  setLegendPosition: (position: LegendPosition) => void;
  setLegendCompact: (compact: boolean) => void;
  detachLegend: () => void;
  dockLegend: () => void;
  setHoveredFeature: (feature: MapFeatureId | null) => void;
  setSelectedFeature: (feature: MapFeatureId | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

// Cedar Creek Fire location (Willamette NF, Oregon)
// Verified from Wikipedia: 43°43′34″N 122°10′01″W
const CEDAR_CREEK_CENTER: [number, number] = [-122.167, 43.726];
const DEFAULT_ZOOM = 10;
const DEFAULT_BEARING = 0;
const DEFAULT_PITCH = 45; // 3D view for terrain

const initialCamera: MapCamera = {
  center: CEDAR_CREEK_CENTER,
  zoom: DEFAULT_ZOOM,
  bearing: DEFAULT_BEARING,
  pitch: DEFAULT_PITCH,
};

const initialDataLayers: Record<DataLayerType, DataLayerState> = {
  firePerimeter: { visible: true, highlighted: false },
  burnSeverity: { visible: true, highlighted: false },
  trailDamage: { visible: true, highlighted: false },
  timberPlots: { visible: true, highlighted: false },
};

// Default floating legend position (bottom-left of map area)
const DEFAULT_LEGEND_POSITION: LegendPosition = { x: 20, y: 100 };

// Load persisted legend state from localStorage
const loadLegendState = (): { mode: LegendMode; position: LegendPosition; compact: boolean } => {
  try {
    const stored = localStorage.getItem('ranger-legend-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || 'docked',
        position: parsed.position || DEFAULT_LEGEND_POSITION,
        compact: parsed.compact || false,
      };
    }
  } catch {
    // Ignore localStorage errors
  }
  return { mode: 'docked', position: DEFAULT_LEGEND_POSITION, compact: false };
};

const persistedLegendState = loadLegendState();

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      activeLayer: 'SAT',
      dataLayers: { ...initialDataLayers },
      camera: { ...initialCamera },
      terrainExaggeration: 1.5,
      terrainEnabled: true,
      legendExpanded: false,
      legendMode: persistedLegendState.mode,
      legendPosition: persistedLegendState.position,
      legendCompact: persistedLegendState.compact,
      hoveredFeature: null,
      selectedFeature: null,

      setActiveLayer: (layer) => {
        set({ activeLayer: layer });
      },

      toggleDataLayer: (layer) => {
        set((state) => ({
          dataLayers: {
            ...state.dataLayers,
            [layer]: {
              ...state.dataLayers[layer],
              visible: !state.dataLayers[layer].visible,
            },
          },
        }));
      },

      highlightDataLayer: (layer, highlight) => {
        set((state) => ({
          dataLayers: {
            ...state.dataLayers,
            [layer]: {
              ...state.dataLayers[layer],
              highlighted: highlight,
            },
          },
        }));
      },

      setCamera: (camera) => {
        set((state) => ({
          camera: { ...state.camera, ...camera },
        }));
      },

      zoomIn: () => {
        set((state) => ({
          camera: {
            ...state.camera,
            zoom: Math.min(state.camera.zoom + 1, 18),
          },
        }));
      },

      zoomOut: () => {
        set((state) => ({
          camera: {
            ...state.camera,
            zoom: Math.max(state.camera.zoom - 1, 5),
          },
        }));
      },

      resetBearing: () => {
        set((state) => ({
          camera: {
            ...state.camera,
            bearing: 0,
            pitch: DEFAULT_PITCH,
          },
        }));
      },

      flyTo: (center, zoom) => {
        set((state) => ({
          camera: {
            ...state.camera,
            center,
            zoom: zoom ?? state.camera.zoom,
          },
        }));
      },

      setVisibleLayers: (layers) => {
        set((state) => {
          const newDataLayers = { ...state.dataLayers };
          // Set all to false first, then enable requested ones
          (Object.keys(newDataLayers) as DataLayerType[]).forEach((key) => {
            newDataLayers[key] = { ...newDataLayers[key], visible: layers.includes(key) };
          });
          return { dataLayers: newDataLayers };
        });
      },

      setTerrainExaggeration: (value) => {
        set({ terrainExaggeration: value });
      },

      toggleTerrain: () => {
        set((state) => ({ terrainEnabled: !state.terrainEnabled }));
      },

      setLegendExpanded: (expanded) => {
        set({ legendExpanded: expanded });
      },

      setLegendMode: (mode) => {
        set({ legendMode: mode });
        // Persist to localStorage
        try {
          const current = localStorage.getItem('ranger-legend-state');
          const state = current ? JSON.parse(current) : {};
          localStorage.setItem('ranger-legend-state', JSON.stringify({ ...state, mode }));
        } catch {
          // Ignore localStorage errors
        }
      },

      setLegendPosition: (position) => {
        set({ legendPosition: position });
        // Persist to localStorage
        try {
          const current = localStorage.getItem('ranger-legend-state');
          const state = current ? JSON.parse(current) : {};
          localStorage.setItem('ranger-legend-state', JSON.stringify({ ...state, position }));
        } catch {
          // Ignore localStorage errors
        }
      },

      setLegendCompact: (compact) => {
        set({ legendCompact: compact });
        // Persist to localStorage
        try {
          const current = localStorage.getItem('ranger-legend-state');
          const state = current ? JSON.parse(current) : {};
          localStorage.setItem('ranger-legend-state', JSON.stringify({ ...state, compact }));
        } catch {
          // Ignore localStorage errors
        }
      },

      detachLegend: () => {
        set({ legendMode: 'floating', legendExpanded: true });
        try {
          const current = localStorage.getItem('ranger-legend-state');
          const state = current ? JSON.parse(current) : {};
          localStorage.setItem('ranger-legend-state', JSON.stringify({ ...state, mode: 'floating' }));
        } catch {
          // Ignore localStorage errors
        }
      },

      dockLegend: () => {
        set({ legendMode: 'docked' });
        try {
          const current = localStorage.getItem('ranger-legend-state');
          const state = current ? JSON.parse(current) : {};
          localStorage.setItem('ranger-legend-state', JSON.stringify({ ...state, mode: 'docked' }));
        } catch {
          // Ignore localStorage errors
        }
      },

      setHoveredFeature: (feature) => {
        set({ hoveredFeature: feature });
      },

      setSelectedFeature: (feature) => {
        set({ selectedFeature: feature });
      },

      clearSelection: () => {
        set({ selectedFeature: null });
      },

      reset: () => {
        set({
          activeLayer: 'SAT',
          dataLayers: { ...initialDataLayers },
          camera: { ...initialCamera },
          terrainExaggeration: 1.5,
          terrainEnabled: true,
          legendExpanded: false,
          legendMode: 'docked',
          legendPosition: DEFAULT_LEGEND_POSITION,
          legendCompact: false,
          hoveredFeature: null,
          selectedFeature: null,
        });
        // Clear persisted legend state
        try {
          localStorage.removeItem('ranger-legend-state');
        } catch {
          // Ignore localStorage errors
        }
      },
    }),
    { name: 'map-store' }
  )
);

// Selector hooks for optimized re-renders
export const useActiveLayer = () => useMapStore((state) => state.activeLayer);
export const useMapCamera = () => useMapStore((state) => state.camera);
export const useDataLayers = () => useMapStore((state) => state.dataLayers);
export const useDataLayer = (layer: DataLayerType) =>
  useMapStore((state) => state.dataLayers[layer]);
export const useTerrainExaggeration = () => useMapStore((state) => state.terrainExaggeration);
export const useTerrainEnabled = () => useMapStore((state) => state.terrainEnabled);
export const useLegendExpanded = () => useMapStore((state) => state.legendExpanded);
export const useLegendMode = () => useMapStore((state) => state.legendMode);
export const useLegendPosition = () => useMapStore((state) => state.legendPosition);
export const useLegendCompact = () => useMapStore((state) => state.legendCompact);
export const useHoveredFeature = () => useMapStore((state) => state.hoveredFeature);
export const useSelectedFeature = () => useMapStore((state) => state.selectedFeature);

// Export constants for use elsewhere
export const CEDAR_CREEK = {
  center: CEDAR_CREEK_CENTER,
  defaultZoom: DEFAULT_ZOOM,
  bounds: {
    // Bounds adjusted to center around verified coordinates
    north: 43.876,  // ~16km north of center
    south: 43.576,  // ~16km south of center
    east: -121.967, // ~16km east of center
    west: -122.367, // ~16km west of center
  },
};

/**
 * Map Store - Manages map state for the Cedar Creek visualization
 *
 * Controls:
 * - Layer visibility (SAT/TER/IR)
 * - Camera position (center, zoom, bearing, pitch)
 * - 3D terrain exaggeration
 *
 * Cedar Creek Fire (2022) coordinates:
 * - Center: 43.7°N, 122.1°W (Willamette National Forest, Oregon)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type MapLayerType = 'SAT' | 'TER' | 'IR';

// Data overlay layers
export type DataLayerType = 'firePerimeter' | 'burnSeverity' | 'trailDamage' | 'timberPlots';

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

  // Actions
  setActiveLayer: (layer: MapLayerType) => void;
  toggleDataLayer: (layer: DataLayerType) => void;
  highlightDataLayer: (layer: DataLayerType, highlight: boolean) => void;
  setCamera: (camera: Partial<MapCamera>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetBearing: () => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  setTerrainExaggeration: (value: number) => void;
  toggleTerrain: () => void;
  reset: () => void;
}

// Cedar Creek Fire location (Willamette NF, Oregon)
const CEDAR_CREEK_CENTER: [number, number] = [-122.1, 43.7];
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

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      activeLayer: 'SAT',
      dataLayers: { ...initialDataLayers },
      camera: { ...initialCamera },
      terrainExaggeration: 1.5,
      terrainEnabled: true,

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

      setTerrainExaggeration: (value) => {
        set({ terrainExaggeration: value });
      },

      toggleTerrain: () => {
        set((state) => ({ terrainEnabled: !state.terrainEnabled }));
      },

      reset: () => {
        set({
          activeLayer: 'SAT',
          dataLayers: { ...initialDataLayers },
          camera: { ...initialCamera },
          terrainExaggeration: 1.5,
          terrainEnabled: true,
        });
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
export const useTerrainSettings = () =>
  useMapStore((state) => ({
    exaggeration: state.terrainExaggeration,
    enabled: state.terrainEnabled,
  }));

// Export constants for use elsewhere
export const CEDAR_CREEK = {
  center: CEDAR_CREEK_CENTER,
  defaultZoom: DEFAULT_ZOOM,
  bounds: {
    north: 43.85,
    south: 43.55,
    east: -121.9,
    west: -122.3,
  },
};

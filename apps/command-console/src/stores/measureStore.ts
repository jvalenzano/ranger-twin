/**
 * Measure Store - Manages measurement tool state
 *
 * Modes:
 * - null: No measurement active
 * - 'distance': Point-to-point/path distance measurement
 * - 'area': Polygon area measurement
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type MeasureMode = 'distance' | 'area' | null;

export interface MeasurePoint {
  lng: number;
  lat: number;
}

interface MeasureState {
  mode: MeasureMode;
  points: MeasurePoint[];
  isComplete: boolean;

  // Computed values (updated by the tool)
  totalDistance: number | null; // in miles
  totalArea: number | null; // in acres

  // Actions
  setMode: (mode: MeasureMode) => void;
  addPoint: (point: MeasurePoint) => void;
  removeLastPoint: () => void;
  setMeasurements: (distance: number | null, area: number | null) => void;
  complete: () => void;
  clear: () => void;
}

export const useMeasureStore = create<MeasureState>()(
  devtools(
    (set) => ({
      mode: null,
      points: [],
      isComplete: false,
      totalDistance: null,
      totalArea: null,

      setMode: (mode) => {
        set({
          mode,
          points: [],
          isComplete: false,
          totalDistance: null,
          totalArea: null,
        });
      },

      addPoint: (point) => {
        set((state) => ({
          points: [...state.points, point],
        }));
      },

      removeLastPoint: () => {
        set((state) => ({
          points: state.points.slice(0, -1),
        }));
      },

      setMeasurements: (distance, area) => {
        set({
          totalDistance: distance,
          totalArea: area,
        });
      },

      complete: () => {
        set({ isComplete: true });
      },

      clear: () => {
        set({
          mode: null,
          points: [],
          isComplete: false,
          totalDistance: null,
          totalArea: null,
        });
      },
    }),
    { name: 'measure-store' }
  )
);

// Selector hooks
export const useMeasureMode = () => useMeasureStore((state) => state.mode);
export const useMeasurePoints = () => useMeasureStore((state) => state.points);
export const useMeasureComplete = () => useMeasureStore((state) => state.isComplete);
export const useMeasureDistance = () => useMeasureStore((state) => state.totalDistance);
export const useMeasureArea = () => useMeasureStore((state) => state.totalArea);

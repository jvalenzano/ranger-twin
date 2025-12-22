/**
 * MapControls - Measurement Display Overlay
 *
 * Shows active measurement information when user is measuring.
 * Control buttons have been moved to Sidebar.tsx for cleaner layout.
 */

import React from 'react';
import { Ruler, PenTool, X } from 'lucide-react';
import {
  useMeasureStore,
  useMeasureMode,
  useMeasureDistance,
  useMeasureArea,
  useMeasurePoints,
} from '@/stores/measureStore';

const MapControls: React.FC = () => {
  const measureMode = useMeasureMode();
  const measureDistance = useMeasureDistance();
  const measureArea = useMeasureArea();
  const measurePoints = useMeasurePoints();
  const clearMeasure = useMeasureStore((state) => state.clear);

  const isMeasuring = measureMode !== null;

  // Format distance for display
  const formatDistance = (miles: number): string => {
    if (miles < 0.1) {
      const feet = miles * 5280;
      return `${Math.round(feet).toLocaleString()} ft`;
    }
    return `${miles.toFixed(2)} mi`;
  };

  // Format area for display
  const formatArea = (acres: number): string => {
    if (acres >= 1000) {
      return `${(acres / 1000).toFixed(2)}k acres`;
    }
    return `${acres.toFixed(1)} acres`;
  };

  // Only show when actively measuring
  if (!isMeasuring) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      {/* Measurement Display */}
      <div className="glass rounded-lg px-4 py-2 border border-accent-cyan/40 shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center gap-4">
        <div className="flex items-center gap-2">
          {measureMode === 'distance' ? (
            <Ruler size={14} className="text-accent-cyan" />
          ) : (
            <PenTool size={14} className="text-accent-cyan" />
          )}
          <span className="text-[10px] uppercase tracking-wider text-accent-cyan font-bold">
            {measureMode === 'distance' ? 'Distance' : 'Area'}
          </span>
        </div>

        {/* Measurements */}
        <div className="flex items-center gap-3">
          {measureDistance !== null && (
            <div className="text-white font-mono text-sm font-bold">
              {formatDistance(measureDistance)}
            </div>
          )}
          {measureArea !== null && (
            <div className="text-white font-mono text-sm font-bold">
              {formatArea(measureArea)}
            </div>
          )}
          {measurePoints.length === 0 && (
            <span className="text-[10px] text-accent-cyan animate-pulse">
              Click on the map
            </span>
          )}
          {measurePoints.length === 1 && (
            <span className="text-[10px] text-text-muted">Click next point on map</span>
          )}
          {measurePoints.length >= 2 && measureMode === 'distance' && (
            <span className="text-[10px] text-text-muted">Double-click to finish</span>
          )}
          {measurePoints.length >= 2 && measureMode === 'area' && measurePoints.length < 3 && (
            <span className="text-[10px] text-text-muted">Need 3+ points</span>
          )}
          {measurePoints.length >= 3 && measureMode === 'area' && (
            <span className="text-[10px] text-text-muted">Double-click to close shape</span>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={clearMeasure}
          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
          title="Clear measurement (ESC)"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default MapControls;

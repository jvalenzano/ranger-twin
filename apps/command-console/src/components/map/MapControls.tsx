/**
 * MapControls - Layer toggles, zoom, compass, and measurement tools
 *
 * Wired to mapStore for real map control:
 * - SAT: Satellite imagery
 * - TER: Terrain/hillshade view
 * - IR: Infrared/thermal simulation
 * - Zoom +/-: Controlled zoom levels
 * - Compass: Reset bearing to north
 * - Ruler: Distance measurement
 * - Area: Polygon area measurement
 */

import React from 'react';
import { Plus, Minus, Compass, Ruler, PenTool, X } from 'lucide-react';
import { useMapStore, useActiveLayer, type MapLayerType } from '@/stores/mapStore';
import {
  useMeasureStore,
  useMeasureMode,
  useMeasureDistance,
  useMeasureArea,
  useMeasurePoints,
} from '@/stores/measureStore';

const MapControls: React.FC = () => {
  const activeLayer = useActiveLayer();
  const setActiveLayer = useMapStore((state) => state.setActiveLayer);
  const zoomIn = useMapStore((state) => state.zoomIn);
  const zoomOut = useMapStore((state) => state.zoomOut);
  const resetBearing = useMapStore((state) => state.resetBearing);

  const measureMode = useMeasureMode();
  const measureDistance = useMeasureDistance();
  const measureArea = useMeasureArea();
  const measurePoints = useMeasurePoints();
  const setMeasureMode = useMeasureStore((state) => state.setMode);
  const clearMeasure = useMeasureStore((state) => state.clear);

  const layers: MapLayerType[] = ['SAT', 'TER', 'IR'];

  const layerLabels: Record<MapLayerType, string> = {
    SAT: 'Satellite imagery',
    TER: 'Terrain with hillshade',
    IR: 'Thermal/Infrared view',
  };

  const isIRMode = activeLayer === 'IR';
  const isMeasuring = measureMode !== null;

  const handleDistanceClick = () => {
    if (measureMode === 'distance') {
      clearMeasure();
    } else {
      setMeasureMode('distance');
    }
  };

  const handleAreaClick = () => {
    if (measureMode === 'area') {
      clearMeasure();
    } else {
      setMeasureMode('area');
    }
  };

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

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
      {/* Measurement Display - Shows when measuring */}
      {isMeasuring && (
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
                👆 Click on the map
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
      )}

      {/* Distance Measure */}
      <button
        onClick={handleDistanceClick}
        title="Measure distance"
        className={`glass w-10 h-10 rounded-full flex items-center justify-center border transition-colors active:scale-95 ${
          measureMode === 'distance'
            ? 'border-accent-cyan/50 text-accent-cyan bg-accent-cyan/10 shadow-[0_0_12px_rgba(0,212,255,0.4)]'
            : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
        }`}
      >
        <Ruler size={18} />
      </button>

      {/* Area Measure */}
      <button
        onClick={handleAreaClick}
        title="Measure area"
        className={`glass w-10 h-10 rounded-full flex items-center justify-center border transition-colors active:scale-95 ${
          measureMode === 'area'
            ? 'border-accent-cyan/50 text-accent-cyan bg-accent-cyan/10 shadow-[0_0_12px_rgba(0,212,255,0.4)]'
            : 'border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5'
        }`}
      >
        <PenTool size={18} />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Zoom Out */}
      <button
        onClick={zoomOut}
        title="Zoom Out"
        className="glass w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
      >
        <Minus size={18} />
      </button>

      {/* Layer Toggle Pill - Horizontal */}
      <div className={`glass px-1.5 py-1 rounded-full flex items-center gap-1 shadow-2xl border ${isIRMode ? 'border-orange-500/50' : 'border-white/10'}`}>
        {layers.map((layer) => {
          const isActive = activeLayer === layer;
          const isIR = layer === 'IR';

          // Special styling for IR mode
          let buttonClasses = 'w-10 h-10 rounded-full text-[10px] font-bold tracking-tighter transition-all duration-200 ';

          if (isActive && isIR) {
            // Active IR button - orange glow
            buttonClasses += 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-[0_0_16px_rgba(249,115,22,0.7)] animate-pulse';
          } else if (isActive) {
            // Active non-IR button - green
            buttonClasses += 'bg-safe text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]';
          } else if (isIR && isIRMode) {
            // IR button when in IR mode but not active
            buttonClasses += 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10';
          } else {
            // Inactive button
            buttonClasses += 'text-text-secondary hover:text-text-primary hover:bg-white/5';
          }

          return (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              title={layerLabels[layer]}
              className={buttonClasses}
            >
              {layer}
            </button>
          );
        })}
      </div>

      {/* Zoom In */}
      <button
        onClick={zoomIn}
        title="Zoom In"
        className="glass w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
      >
        <Plus size={18} />
      </button>

      {/* Compass */}
      <button
        onClick={resetBearing}
        title="Reset North"
        className="glass w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
      >
        <Compass size={20} strokeWidth={1.5} />
      </button>

    </div>
  );
};

export default MapControls;

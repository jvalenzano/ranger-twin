/**
 * MapControls - Layer toggles, zoom, and compass controls
 *
 * Wired to mapStore for real map control:
 * - SAT: Satellite imagery
 * - TER: Terrain/hillshade view
 * - IR: Infrared/thermal simulation
 * - Zoom +/-: Controlled zoom levels
 * - Compass: Reset bearing to north
 */

import React from 'react';
import { Plus, Minus, Compass } from 'lucide-react';
import { useMapStore, useActiveLayer, type MapLayerType } from '@/stores/mapStore';

const MapControls: React.FC = () => {
  const activeLayer = useActiveLayer();
  const setActiveLayer = useMapStore((state) => state.setActiveLayer);
  const zoomIn = useMapStore((state) => state.zoomIn);
  const zoomOut = useMapStore((state) => state.zoomOut);
  const resetBearing = useMapStore((state) => state.resetBearing);

  const layers: MapLayerType[] = ['SAT', 'TER', 'IR'];

  const layerLabels: Record<MapLayerType, string> = {
    SAT: 'Satellite imagery',
    TER: 'Terrain with hillshade',
    IR: 'Thermal/Infrared view',
  };

  const isIRMode = activeLayer === 'IR';

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
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

      {/* IR Mode Legend - Positioned to the right of controls */}
      {isIRMode && (
        <div className="glass rounded-lg px-3 py-2 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)] animate-fadeIn flex items-center gap-4">
          <div className="text-[9px] font-bold uppercase tracking-wider text-orange-400">
            Thermal
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="text-[9px] text-slate-300">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
              <span className="text-[9px] text-slate-300">Med</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
              <span className="text-[9px] text-slate-300">Low</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;

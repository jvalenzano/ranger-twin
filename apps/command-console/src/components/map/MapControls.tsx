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
    SAT: 'Satellite',
    TER: 'Terrain',
    IR: 'Infrared',
  };

  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
      {/* Layer Toggle Pill */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 shadow-2xl border border-white/10">
        {layers.map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            title={layerLabels[layer]}
            className={`
              w-10 h-10 rounded-full text-[10px] font-bold tracking-tighter transition-all duration-200
              ${
                activeLayer === layer
                  ? 'bg-safe text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }
            `}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 border border-white/10">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
        >
          <Plus size={18} />
        </button>
        <div className="h-[1px] w-6 mx-auto bg-white/10" />
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Compass */}
      <button
        onClick={resetBearing}
        title="Reset North"
        className="glass w-12 h-12 rounded-full flex items-center justify-center border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors active:scale-95"
      >
        <Compass size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default MapControls;

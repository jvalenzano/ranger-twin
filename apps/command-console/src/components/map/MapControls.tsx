import React, { useState } from 'react';
import { Plus, Minus, Compass } from 'lucide-react';

type LayerType = 'SAT' | 'TER' | 'IR';

const MapControls: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<LayerType>('SAT');

  const layers: LayerType[] = ['SAT', 'TER', 'IR'];

  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-20">
      {/* Layer Toggle Pill */}
      <div className="glass p-1 rounded-full flex flex-col gap-1 shadow-2xl border border-white/10">
        {layers.map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
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
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
          <Plus size={18} />
        </button>
        <div className="h-[1px] w-6 mx-auto bg-white/10" />
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
          <Minus size={18} />
        </button>
      </div>

      {/* Compass */}
      <div className="glass w-12 h-12 rounded-full flex items-center justify-center border border-white/10 text-text-secondary">
        <Compass size={24} strokeWidth={1.5} className="rotate-[15deg]" />
      </div>
    </div>
  );
};

export default MapControls;

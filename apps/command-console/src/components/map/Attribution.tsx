/**
 * Attribution - Dynamic contextual info based on active map layer
 *
 * Shows relevant data for each mode:
 * - SAT: Imagery source and date
 * - TER: Elevation and terrain info
 * - IR: Thermal signature legend
 */

import React from 'react';
import { useActiveLayer } from '@/stores/mapStore';

const Attribution: React.FC = () => {
  const activeLayer = useActiveLayer();

  return (
    <div className="absolute bottom-6 left-6 z-20">
      {activeLayer === 'SAT' && (
        <div className="glass rounded-lg px-3 py-2 border border-white/20 animate-fadeIn flex items-center gap-4">
          <div className="text-[9px] font-bold uppercase tracking-wider text-accent-cyan">
            Satellite
          </div>
          <div className="flex items-center gap-3 text-[9px] text-slate-300">
            <span>Sentinel-2 L2A</span>
            <span className="text-white/30">•</span>
            <span>10m resolution</span>
            <span className="text-white/30">•</span>
            <span>Oct 2024</span>
          </div>
        </div>
      )}

      {activeLayer === 'TER' && (
        <div className="glass rounded-lg px-3 py-2 border border-emerald-500/30 animate-fadeIn flex items-center gap-4">
          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            Terrain
          </div>
          <div className="flex items-center gap-3 text-[9px] text-slate-300">
            <span>3DEP 10m DEM</span>
            <span className="text-white/30">•</span>
            <span>2,100 - 6,800 ft</span>
            <span className="text-white/30">•</span>
            <span>2.5× exaggeration</span>
          </div>
        </div>
      )}

      {activeLayer === 'IR' && (
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

export default Attribution;

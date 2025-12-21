/**
 * MapLoadingSkeleton - Loading placeholder for map component
 *
 * Displays while MapLibre initializes with:
 * - Animated gradient background
 * - Pulsing grid overlay
 * - Loading spinner
 */

import React from 'react';
import { Loader2, Map } from 'lucide-react';

const MapLoadingSkeleton: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Contour lines animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-accent-cyan/10 rounded-full animate-ping"
            style={{
              left: '50%',
              top: '50%',
              width: `${(i + 1) * 200}px`,
              height: `${(i + 1) * 200}px`,
              marginLeft: `-${(i + 1) * 100}px`,
              marginTop: `-${(i + 1) * 100}px`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Center loading content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center border border-accent-cyan/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <Map size={28} className="text-accent-cyan" />
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin text-accent-cyan" />
          <span className="text-sm font-medium">Loading terrain data...</span>
        </div>
        <p className="text-xs text-slate-500 mono">
          Cedar Creek Fire • Willamette NF
        </p>
      </div>
    </div>
  );
};

export default MapLoadingSkeleton;

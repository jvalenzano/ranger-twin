import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InsightPanel from './components/InsightPanel';
import MapControls from './components/MapControls';
import Attribution from './components/Attribution';

const Terrain3D = () => {
  /**
   * Generates organic topographic paths.
   * Uses non-linear scaling and directional offsets to simulate 
   * a peak in the upper-left with a ridge extending to the lower-right.
   */
  const generateOrganicContour = (h: number, total: number) => {
    const t = h / total;
    const points = [];
    const totalPoints = 90; // Higher resolution for professional aesthetic
    
    // The "Peak" is centered around 450, 450 on the 1200x1200px plane
    const peakX = 450;
    const peakY = 450;
    
    // Base radius shrinks as we go higher
    const baseRadius = 550 * (1 - Math.pow(t, 0.65));
    
    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;
      
      // Multilayer noise for craggy terrain edges
      const noise = Math.sin(angle * 5) * 12 + Math.cos(angle * 3) * 8 + Math.sin(angle * 12) * 4;
      
      // Ridge influence: Extend the radius in the direction of the bottom-right (45 deg)
      const ridgeAngle = Math.PI / 4; 
      const ridgeStrength = Math.max(0, Math.cos(angle - ridgeAngle)) * 240 * (1 - t);
      
      // Steep vs Gentle slope logic
      const cliffStrength = Math.max(0, Math.cos(angle - (ridgeAngle + Math.PI))) * 45 * t;
      
      const r = Math.max(0, baseRadius + noise + ridgeStrength - cliffStrength);
      const x = peakX + r * Math.cos(angle);
      const y = peakY + r * Math.sin(angle);
      
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ') + ' Z';
  };

  // 25 layers for high-density topographic detail
  const layers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#020617] overflow-hidden">
      <div className="terrain-container w-full h-full flex items-center justify-center">
        <div className="terrain-plane">
          {/* HUD Dot Grid (Global Plane) */}
          <div className="absolute inset-0 dot-grid-bg opacity-10" />
          
          {/* Coordinate Grid (Dotted Lines) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="coordGrid" width="200" height="200" patternUnits="userSpaceOnUse">
                  <path d="M 200 0 L 0 0 0 200" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4,8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coordGrid)" />
            </svg>
          </div>
          
          {/* Tactical Crosshair Base */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 w-px h-full bg-cyan-500" />
            <div className="absolute left-0 top-1/2 w-full h-px bg-cyan-500" />
            <div className="absolute inset-0 border border-cyan-500/20 rounded-full" />
          </div>

          {/* Isometric Elevation Layers (Organic Contours) */}
          {layers.map((i) => {
            const glowColor = i > 20 ? '#06B6D4' : '#10B981';
            const elevation = i * 16; 
            
            // Depth Gradient: Top (peak) 50% opacity, Base 100% opacity
            const opacity = 1.0 - (i / 24) * 0.5;
            
            return (
              <div 
                key={i}
                className="contour-layer"
                style={{
                  transform: `translateZ(${elevation}px)`,
                  filter: `drop-shadow(0 0 4px #10B981)`
                }}
              >
                <svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
                  <path 
                    d={generateOrganicContour(i, 25)} 
                    stroke={glowColor} 
                    strokeWidth={i % 5 === 0 ? 1.8 : 0.6} 
                    strokeOpacity={opacity}
                    fill={i === 0 ? "rgba(16, 185, 129, 0.05)" : "transparent"}
                    className={i % 4 === 0 ? "animate-[contour-pulse_10s_infinite_ease-in-out]" : ""}
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                </svg>
              </div>
            );
          })}

          {/* Fire Overlay Stack */}
          <div className="absolute inset-0 fire-glow-anim" style={{ transform: 'translateZ(410px)', mixBlendMode: 'screen' }}>
            <svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" className="opacity-80">
              <defs>
                <radialGradient id="fireFillGradient" cx="620" cy="650" r="250" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              <g opacity="0.2">
                {layers.filter(i => i % 3 === 0).map(i => (
                  <path 
                    key={`persistence-${i}`}
                    d={generateOrganicContour(i, 25)} 
                    stroke="#10B981" 
                    strokeWidth="0.6" 
                    fill="none"
                  />
                ))}
              </g>

              {/* Fire Perimeter Path - Fixed coordinates to fully surround burn area without clipping right side */}
              <path 
                d="M 460 620 L 520 480 L 720 420 L 900 550 L 850 820 L 700 940 L 500 910 L 420 780 Z" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeDasharray="8 8" 
                fill="url(#fireFillGradient)"
                filter="drop-shadow(0 0 12px white)"
              />
            </svg>
          </div>

          {/* Thermal Intensity Hotspots */}
          <div 
            className="absolute fire-valley rounded-full"
            style={{
              width: '440px',
              height: '340px',
              left: '420px',
              top: '480px',
              transform: 'translateZ(405px)',
              background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.5) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)',
              filter: 'blur(55px)',
              mixBlendMode: 'screen'
            }}
          />

          {/* Active Ignition Core */}
          <div 
            className="absolute animate-[fire-pulse-intense_3s_infinite] rounded-full"
            style={{
              width: '210px',
              height: '130px',
              left: '540px',
              top: '560px',
              transform: 'translateZ(420px)',
              background: 'radial-gradient(circle, #FFF9C4 0%, #EF4444 65%, transparent 100%)',
              filter: 'blur(35px)',
              mixBlendMode: 'plus-lighter',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020617] flex text-[#F8FAFC]">
      <Terrain3D />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 relative p-6 pointer-events-none">
          <div className="pointer-events-auto contents">
            <InsightPanel />
            <MapControls />
            <Attribution />
          </div>

          {/* Geographic Markers Re-added */}
          <div className="absolute top-[28%] left-[32%] flex flex-col items-center gap-1 pointer-events-none opacity-80">
            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_14px_cyan]" />
            <span className="text-[11px] mono uppercase tracking-[0.3em] font-bold text-cyan-400 shadow-sm">Lookout Peak</span>
            <div className="bg-cyan-950/50 px-1.5 py-0.5 border border-cyan-400/30 text-[9px] mono text-cyan-400/80 rounded-[2px] backdrop-blur-sm">4,821 FT</div>
          </div>

          <div className="absolute top-[68%] left-[58%] flex flex-col items-center gap-1 pointer-events-none opacity-80">
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_14px_#10B981]" />
            <span className="text-[11px] mono uppercase tracking-[0.3em] font-bold text-emerald-400 shadow-sm">Mill Creek</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
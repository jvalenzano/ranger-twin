import React from 'react';

/**
 * Terrain3D - 3D Isometric Topographic Visualization
 *
 * Renders an animated 3D terrain map with:
 * - Organic contour lines with elevation layers
 * - Fire perimeter overlay with thermal effects
 * - HUD grid and crosshair elements
 */
const Terrain3D: React.FC = () => {
  /**
   * Generates organic topographic paths.
   * Uses non-linear scaling and directional offsets to simulate
   * a peak in the upper-left with a ridge extending to the lower-right.
   */
  const generateOrganicContour = (h: number, total: number): string => {
    const t = h / total;
    const points: string[] = [];
    const totalPoints = 90; // Higher resolution for professional aesthetic

    // The "Peak" is centered around 450, 450 on the 1200x1200px plane
    const peakX = 450;
    const peakY = 450;

    // Base radius shrinks as we go higher
    const baseRadius = 550 * (1 - Math.pow(t, 0.65));

    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;

      // Multilayer noise for craggy terrain edges
      const noise =
        Math.sin(angle * 5) * 12 +
        Math.cos(angle * 3) * 8 +
        Math.sin(angle * 12) * 4;

      // Ridge influence: Extend the radius in the direction of the bottom-right (45 deg)
      const ridgeAngle = Math.PI / 4;
      const ridgeStrength = Math.max(0, Math.cos(angle - ridgeAngle)) * 240 * (1 - t);

      // Steep vs Gentle slope logic
      const cliffStrength =
        Math.max(0, Math.cos(angle - (ridgeAngle + Math.PI))) * 45 * t;

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
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background overflow-hidden">
      <div className="terrain-container w-full h-full flex items-center justify-center">
        <div className="terrain-plane">
          {/* HUD Dot Grid (Global Plane) */}
          <div className="absolute inset-0 dot-grid-bg opacity-10" />

          {/* Coordinate Grid (Dotted Lines) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="coordGrid"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 200 0 L 0 0 0 200"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeDasharray="4,8"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#coordGrid)" />
            </svg>
          </div>

          {/* Tactical Crosshair Base */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 w-px h-full bg-accent-cyan" />
            <div className="absolute left-0 top-1/2 w-full h-px bg-accent-cyan" />
            <div className="absolute inset-0 border border-accent-cyan/20 rounded-full" />
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
                  filter: `drop-shadow(0 0 4px #10B981)`,
                }}
              >
                <svg
                  width="1200"
                  height="1200"
                  viewBox="0 0 1200 1200"
                  fill="none"
                >
                  <path
                    d={generateOrganicContour(i, 25)}
                    stroke={glowColor}
                    strokeWidth={i % 5 === 0 ? 1.8 : 0.6}
                    strokeOpacity={opacity}
                    fill={i === 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent'}
                    className={
                      i % 4 === 0
                        ? 'animate-[contour-pulse_10s_infinite_ease-in-out]'
                        : ''
                    }
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                </svg>
              </div>
            );
          })}

          {/* Fire Overlay Stack */}
          <div
            className="absolute inset-0 fire-glow-anim"
            style={{
              transform: 'translateZ(410px)',
              mixBlendMode: 'screen',
            }}
          >
            <svg
              width="1200"
              height="1200"
              viewBox="0 0 1200 1200"
              fill="none"
              className="opacity-80"
            >
              <defs>
                <radialGradient
                  id="fireFillGradient"
                  cx="620"
                  cy="650"
                  r="250"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                  <stop offset="65%" stopColor="#F59E0B" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g opacity="0.2">
                {layers
                  .filter((i) => i % 3 === 0)
                  .map((i) => (
                    <path
                      key={`persistence-${i}`}
                      d={generateOrganicContour(i, 25)}
                      stroke="#10B981"
                      strokeWidth="0.6"
                      fill="none"
                    />
                  ))}
              </g>

              {/* Fire Perimeter Path */}
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
              background:
                'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.5) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)',
              filter: 'blur(55px)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Active Ignition Core */}
          <div
            className="absolute animate-fire-pulse rounded-full"
            style={{
              width: '210px',
              height: '130px',
              left: '540px',
              top: '560px',
              transform: 'translateZ(420px)',
              background:
                'radial-gradient(circle, #FFF9C4 0%, #EF4444 65%, transparent 100%)',
              filter: 'blur(35px)',
              mixBlendMode: 'plus-lighter',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Terrain3D;

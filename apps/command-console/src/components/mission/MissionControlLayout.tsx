/**
 * MissionControlLayout - CSS Grid layout for the National Dashboard
 *
 * Layout structure:
 * ┌──────────────────────────────────────────────────────────────┐
 * │                    MissionHeader (top bar)                   │
 * ├────────┬─────────────────────────────────────┬───────────────┤
 * │        │                                     │               │
 * │Mission │          NationalMap                │ IncidentRail  │
 * │Stack   │          (center)                   │ (right)       │
 * │(left)  │                                     │               │
 * │        │                                     │               │
 * ├────────┴─────────────────────────────────────┴───────────────┤
 * │                    SeasonSlider (bottom)                     │
 * └──────────────────────────────────────────────────────────────┘
 */

import React from 'react';

interface MissionControlLayoutProps {
  header: React.ReactNode;
  stack: React.ReactNode;
  map: React.ReactNode;
  rail: React.ReactNode;
  slider: React.ReactNode;
}

export function MissionControlLayout({
  header,
  stack,
  map,
  rail,
  slider,
}: MissionControlLayoutProps) {
  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-hidden">
      {/* CSS Grid Layout */}
      <div
        className="h-full w-full grid"
        style={{
          gridTemplateRows: '48px 1fr 64px',
          gridTemplateColumns: '72px 1fr 320px',
          gridTemplateAreas: `
            "header header header"
            "stack  map    rail"
            "slider slider slider"
          `,
        }}
      >
        {/* Header - spans full width */}
        <div
          style={{ gridArea: 'header' }}
          className="z-30 border-b border-white/10"
        >
          {header}
        </div>

        {/* Mission Stack - left nav */}
        <div
          style={{ gridArea: 'stack' }}
          className="z-20 border-r border-white/10 bg-slate-900/50"
        >
          {stack}
        </div>

        {/* National Map - center */}
        <div
          style={{ gridArea: 'map' }}
          className="relative z-10"
        >
          {map}
        </div>

        {/* Incident Rail - right sidebar */}
        <div
          style={{ gridArea: 'rail' }}
          className="z-20 border-l border-white/10 bg-slate-900/80 backdrop-blur-sm overflow-hidden"
        >
          {rail}
        </div>

        {/* Season Slider - bottom */}
        <div
          style={{ gridArea: 'slider' }}
          className="z-20 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm"
        >
          {slider}
        </div>
      </div>
    </div>
  );
}

export default MissionControlLayout;

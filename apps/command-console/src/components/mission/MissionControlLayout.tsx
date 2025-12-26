/**
 * MissionControlLayout - Overlay layout for the National Command Dashboard
 *
 * Uses the same overlay pattern as TacticalView for consistent glassmorphism:
 * - Map is full-screen background
 * - Header overlays top
 * - Rail overlays right side
 *
 * Desktop (>1024px):
 * ┌──────────────────────────────────────────────────────────────┐
 * │                    Header (overlay, top)                     │
 * ├──────────────────────────────────────────────┬───────────────┤
 * │                                              │               │
 * │               NationalMap                    │ IncidentRail  │
 * │               (full screen)                  │ (overlay)     │
 * │                                              │               │
 * └──────────────────────────────────────────────┴───────────────┘
 *
 * Mobile/Tablet: Rail moves to bottom sheet style
 */

import React from 'react';

interface MissionControlLayoutProps {
  header: React.ReactNode;
  map: React.ReactNode;
  rail: React.ReactNode;
}

export function MissionControlLayout({
  header,
  map,
  rail,
}: MissionControlLayoutProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-white">
      {/* National Map - Full screen background */}
      <div className="absolute inset-0 z-0">
        {map}
      </div>

      {/* Header - Overlay at top (matches Tactical) */}
      <header className="absolute top-0 left-0 right-0 h-[48px] glass-header z-30">
        {header}
      </header>

      {/* Incident Rail - Overlay on right (desktop) or bottom (tablet/mobile) */}
      <aside className="absolute z-20 bg-[#0a0f1a]/65 backdrop-blur-2xl overflow-hidden top-auto bottom-0 left-0 right-0 w-full h-[40vh] max-h-[400px] border-t border-white/[0.1] lg:top-[48px] lg:bottom-0 lg:left-auto lg:right-0 lg:w-[320px] lg:h-auto lg:max-h-none lg:border-t-0 lg:border-l">
        {rail}
      </aside>
    </div>
  );
}

export default MissionControlLayout;

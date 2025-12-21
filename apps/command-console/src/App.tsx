import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import Attribution from '@/components/map/Attribution';
import Terrain3D from '@/components/map/Terrain3D';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background flex text-text-primary">
      {/* 3D Terrain Visualization Layer */}
      <Terrain3D />

      {/* Lifecycle Navigation Rail */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        <Header />

        <main className="flex-1 relative p-6 pointer-events-none">
          <div className="pointer-events-auto contents">
            {/* Insight Panel - Top Right */}
            <InsightPanel />

            {/* Map Controls - Bottom Right */}
            <MapControls />

            {/* Attribution - Bottom Left */}
            <Attribution />
          </div>

          {/* Geographic Markers */}
          <div className="absolute top-[28%] left-[32%] flex flex-col items-center gap-1 pointer-events-none opacity-80">
            <div className="w-2 h-2 bg-accent-cyan rounded-full shadow-[0_0_14px_cyan]" />
            <span className="text-[11px] mono uppercase tracking-[0.3em] font-bold text-accent-cyan text-shadow-sm">
              Lookout Peak
            </span>
            <div className="bg-cyan-950/50 px-1.5 py-0.5 border border-accent-cyan/30 text-[9px] mono text-accent-cyan/80 rounded-[2px] backdrop-blur-sm">
              4,821 FT
            </div>
          </div>

          <div className="absolute top-[68%] left-[58%] flex flex-col items-center gap-1 pointer-events-none opacity-80">
            <div className="w-2 h-2 bg-safe rounded-full shadow-[0_0_14px_#10B981]" />
            <span className="text-[11px] mono uppercase tracking-[0.3em] font-bold text-safe text-shadow-sm">
              Mill Creek
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

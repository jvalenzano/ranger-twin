import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import Attribution from '@/components/map/Attribution';
import CedarCreekMap from '@/components/map/CedarCreekMap';
import DemoTourOverlay from '@/components/tour/DemoTourOverlay';
import ChatPanel from '@/components/chat/ChatPanel';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import BriefingObserver from '@/components/briefing/BriefingObserver';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const addEvent = useBriefingStore((state) => state.addEvent);

  // Connect to gateway on mount
  useEffect(() => {
    // Load fixture data
    mockBriefingService.loadFixtures()
      .then(() => {
        setIsReady(true);
        console.log('[App] Fixtures loaded');
      })
      .catch((err) => {
        console.error('[App] Failed to load fixtures:', err);
        // Still set ready to true so we can see the UI even if fixtures fail
        // or maybe just log it for now.
      });

    // Subscribe to incoming events
    const unsubscribe = mockBriefingService.subscribe((event) => {
      console.log('[App] Received event:', event.event_id);
      addEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [addEvent]);

  // Show loading state while fixtures load
  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm mono">Loading RANGER...</div>
      </div>
    );
  }

  return (
    <BriefingObserver autoConnect={false}>
      <div className="relative w-screen h-screen overflow-hidden bg-background flex text-text-primary">
        {/* MapLibre GL Map - Cedar Creek Fire (Willamette NF, Oregon) */}
        <CedarCreekMap />

        {/* Demo Tour Overlay - Guided Experience */}
        <DemoTourOverlay />

        {/* Lifecycle Navigation Rail */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          <Header onChatToggle={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />

          <main className="flex-1 relative p-6 pointer-events-none">
            <div className="pointer-events-auto contents">
              {/* Insight Panel - Top Right */}
              <InsightPanel />

              {/* Map Controls - Bottom Right */}
              <MapControls />

              {/* Attribution - Bottom Left */}
              <Attribution />

              {/* Chat Panel - Bottom Right (toggleable) */}
              {isChatOpen && <ChatPanel />}
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
    </BriefingObserver>
  );
};

export default App;

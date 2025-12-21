import React, { useEffect, useState, Suspense, lazy } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import Attribution from '@/components/map/Attribution';
import DemoTourOverlay from '@/components/tour/DemoTourOverlay';
import ChatPanel from '@/components/chat/ChatPanel';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MapLoadingSkeleton from '@/components/common/MapLoadingSkeleton';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import BriefingObserver from '@/components/briefing/BriefingObserver';

// Lazy load the heavy map component
const CedarCreekMap = lazy(() => import('@/components/map/CedarCreekMap'));

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(200); // Start expanded
  const addEvent = useBriefingStore((state) => state.addEvent);

  // Connect to gateway on mount
  useEffect(() => {
    // Load fixture data
    mockBriefingService.loadFixtures()
      .then(() => {
        setIsReady(true);
      })
      .catch(() => {
        // Still set ready to true so we can see the UI even if fixtures fail
      });

    // Subscribe to incoming events
    const unsubscribe = mockBriefingService.subscribe((event) => {
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
    <ErrorBoundary>
      <BriefingObserver autoConnect={false}>
        <div className="relative w-screen h-screen overflow-hidden bg-background text-text-primary">
          {/* MapLibre GL Map - Cedar Creek Fire (Willamette NF, Oregon) */}
          <Suspense fallback={<MapLoadingSkeleton />}>
            <CedarCreekMap />
          </Suspense>

          {/* Demo Tour Overlay - Guided Experience */}
          <DemoTourOverlay />

          {/* Header - Full width at top */}
          <Header onChatToggle={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />

          {/* Lifecycle Navigation - Left side (expandable) */}
          <Sidebar onWidthChange={setSidebarWidth} />

          {/* Main Content Area - offset for dynamic sidebar width */}
          <main
            className="absolute top-[48px] right-0 bottom-0 p-6 pointer-events-none transition-all duration-300"
            style={{ left: sidebarWidth }}
          >
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

          </main>
        </div>
      </BriefingObserver>
    </ErrorBoundary>
  );
};

export default App;

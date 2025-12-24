import React, { useEffect, useState, Suspense, lazy } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import MapControls from '@/components/map/MapControls';
import FloatingLegend from '@/components/map/FloatingLegend';
// Attribution info moved to Header breadcrumb
import DemoTourOverlay from '@/components/tour/DemoTourOverlay';
import ChatPanel from '@/components/chat/ChatPanel';
import ChatFAB from '@/components/chat/ChatFAB';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MapLoadingSkeleton from '@/components/common/MapLoadingSkeleton';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import BriefingObserver from '@/components/briefing/BriefingObserver';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { VisualAuditOverlay } from '@/components/map/VisualAuditOverlay';
import { ForensicReportModal } from '@/components/modals/ForensicReportModal';
import { AnalysisHistoryPanel } from '@/components/map/AnalysisHistoryPanel';
import { useAnalysisHistoryStore } from '@/stores/analysisHistoryStore';

// Chat mode: 'closed' | 'open' | 'minimized'
type ChatMode = 'closed' | 'open' | 'minimized';

// Lazy load the heavy map component
const CedarCreekMap = lazy(() => import('@/components/map/CedarCreekMap'));

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('closed');
  const [sidebarWidth, setSidebarWidth] = useState(200); // Start expanded
  const [historyOpen, setHistoryOpen] = useState(false);
  const addEvent = useBriefingStore((state) => state.addEvent);
  const analysisCount = useAnalysisHistoryStore((state) => state.analyses.length);

  // Chat mode handlers
  const handleOpenChat = () => setChatMode('open');
  const handleCloseChat = () => setChatMode('closed');
  const handleMinimizeChat = () => setChatMode('minimized');
  const handleToggleChat = () => setChatMode(chatMode === 'open' ? 'closed' : 'open');

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

  // Simple URL-based routing for experiments
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Show loading state while fixtures load
  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm mono">Loading RANGER...</div>
      </div>
    );
  }

  // Lab Route (isolated)
  if (currentPath === '/lab/forensic-insight') {
    const ForensicInsightLab = lazy(() => import('@/prototypes/ForensicInsightLab'));
    return (
      <Suspense fallback={<div className="p-10 mono text-xs">Initializing Lab...</div>}>
        <ForensicInsightLab />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <BriefingObserver autoConnect={false}>
        <div className="relative w-screen h-screen overflow-hidden bg-background text-text-primary">
          <ToastContainer />
          {/* MapLibre GL Map - Cedar Creek Fire (Willamette NF, Oregon) */}
          <Suspense fallback={<MapLoadingSkeleton />}>
            <CedarCreekMap />
          </Suspense>

          {/* Demo Tour Overlay - Guided Experience */}
          <DemoTourOverlay />

          {/* Floating Legend - Draggable over map */}
          <FloatingLegend />

          {/* Header - Full width at top */}
          <Header onChatToggle={handleToggleChat} isChatOpen={chatMode === 'open'} />

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
            </div>
          </main>

          {/* Chat Panel - Full height right side (toggleable) */}
          {chatMode === 'open' && (
            <ChatPanel onClose={handleCloseChat} onMinimize={handleMinimizeChat} />
          )}

          {/* Chat FAB - When minimized */}
          {chatMode === 'minimized' && <ChatFAB onClick={handleOpenChat} />}

          {/* Forensic Engine - Integrated Overlays */}
          <VisualAuditOverlay />
          <ForensicReportModal />
          <AnalysisHistoryPanel isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

          {/* Analysis History FAB - Shows when there are saved analyses */}
          {analysisCount > 0 && !historyOpen && (
            <button
              onClick={() => setHistoryOpen(true)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#0f111a]/90 backdrop-blur-sm border border-white/10 rounded-full shadow-xl hover:bg-white/10 transition-all flex items-center gap-2 group"
              title="View saved analyses"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">
                {analysisCount} Saved {analysisCount === 1 ? 'Analysis' : 'Analyses'}
              </span>
            </button>
          )}
        </div>
      </BriefingObserver>
    </ErrorBoundary>
  );
};

export default App;

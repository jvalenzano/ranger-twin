/**
 * TacticalView - Single-fire tactical analysis view
 *
 * This is the original "Command Console" view, extracted from App.tsx.
 * Shows detailed analysis for a single fire with:
 * - MapLibre map with fire data layers
 * - Sidebar with lifecycle phases
 * - Insight panels from agents
 * - Chat interface
 */

import { useState, Suspense, lazy } from 'react';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import InsightPanel from '@/components/panels/InsightPanel';
import FloatingLegend from '@/components/map/FloatingLegend';
import DemoTourOverlay from '@/components/tour/DemoTourOverlay';
import ChatPanel from '@/components/chat/ChatPanel';
import ChatFAB from '@/components/chat/ChatFAB';
import MapLoadingSkeleton from '@/components/common/MapLoadingSkeleton';
import BriefingObserver from '@/components/briefing/BriefingObserver';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { VisualAuditOverlay } from '@/components/map/VisualAuditOverlay';
import { ForensicReportModal } from '@/components/modals/ForensicReportModal';
import { AnalysisHistoryPanel } from '@/components/map/AnalysisHistoryPanel';
import { useAnalysisHistoryStore } from '@/stores/analysisHistoryStore';
import { FireOnboardingWizard } from '@/components/fire';

// Chat mode: 'closed' | 'open' | 'minimized'
type ChatMode = 'closed' | 'open' | 'minimized';

// Lazy load the heavy map component
const CedarCreekMap = lazy(() => import('@/components/map/CedarCreekMap'));

export function TacticalView() {
  const [chatMode, setChatMode] = useState<ChatMode>('closed');
  const [sidebarWidth, setSidebarWidth] = useState(200); // Start expanded
  const [historyOpen, setHistoryOpen] = useState(false);
  const analysisCount = useAnalysisHistoryStore((state) => state.analyses.length);

  // Chat mode handlers
  const handleOpenChat = () => setChatMode('open');
  const handleCloseChat = () => setChatMode('closed');
  const handleMinimizeChat = () => setChatMode('minimized');
  const handleToggleChat = () => setChatMode(chatMode === 'open' ? 'closed' : 'open');

  return (
    <BriefingObserver autoConnect={false}>
      <div className="relative w-screen h-screen overflow-hidden bg-background text-text-primary">
        <ToastContainer />

        {/* MapLibre GL Map - Fire Analysis */}
        <Suspense fallback={<MapLoadingSkeleton />}>
          <CedarCreekMap />
        </Suspense>

        {/* Demo Tour Overlay - Guided Experience */}
        <DemoTourOverlay />

        {/* Fire Onboarding Wizard - Add new fires */}
        <FireOnboardingWizard />

        {/* Floating Legend - Draggable over map */}
        <FloatingLegend />

        {/* Header - Full width at top */}
        <Header
          onChatToggle={handleToggleChat}
          isChatOpen={chatMode === 'open'}
          sidebarWidth={sidebarWidth}
        />

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
  );
}

export default TacticalView;

/**
 * SplashView - Main splash screen orchestrator
 *
 * Public landing page displayed at root `/` before authentication.
 * Features:
 * - Left panel: Briefing cards with boot sequence
 * - Right panel: Auto-rotating carousel
 * - CTA button: Navigate to /console (triggers HTTP Basic Auth)
 */

import React from 'react';
import {
  SplashHeader,
  SplashFooter,
  BriefingPanel,
  PreviewCarousel,
} from '@/components/splash';

const SplashView: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col tactical-grid relative overflow-hidden bg-slate-950">
      <SplashHeader />

      <main className="flex-grow w-full flex flex-row gap-4 px-8 py-10 items-stretch z-10">
        {/* Left Panel - Briefing Cards (60% width) */}
        <div className="w-[60%] flex-shrink-0">
          <BriefingPanel />
        </div>

        {/* Right Panel - Carousel (40% width) */}
        <div className="w-[40%] flex-shrink-0">
          <PreviewCarousel />
        </div>
      </main>

      <SplashFooter />
    </div>
  );
};

export default SplashView;

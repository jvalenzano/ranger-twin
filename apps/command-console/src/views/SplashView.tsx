/**
 * SplashView - Main splash screen orchestrator
 *
 * Public landing page displayed at root `/` before authentication.
 * Features:
 * - Left panel: Briefing cards with boot sequence
 * - Right panel: Auto-rotating carousel
 * - CTA button: Navigate to /console (triggers HTTP Basic Auth)
 * - Responsive: Stacks panels on mobile, side-by-side on desktop
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
    <div className="min-h-screen w-full flex flex-col tactical-grid relative overflow-y-auto overflow-x-hidden bg-slate-950">
      <SplashHeader />

      <main className="flex-grow w-full flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-8 py-6 lg:py-10 items-stretch z-10">
        {/* Left Panel - Briefing Cards (full width on mobile, 60% on desktop) */}
        <div className="w-full lg:w-[60%] lg:flex-shrink-0">
          <BriefingPanel />
        </div>

        {/* Right Panel - Carousel (full width on mobile, 40% on desktop) */}
        <div className="w-full lg:w-[40%] lg:flex-shrink-0 mt-4 lg:mt-0">
          <PreviewCarousel />
        </div>
      </main>

      <SplashFooter />
    </div>
  );
};

export default SplashView;


import React from 'react';
import { Bell, ChevronRight, Play, Sparkles } from 'lucide-react';

import { useDemoTourStore, useTourActive } from '@/stores/demoTourStore';

const Header: React.FC = () => {
  const startTour = useDemoTourStore((state) => state.startTour);
  const endTour = useDemoTourStore((state) => state.endTour);
  const isTourActive = useTourActive();

  const handleDemoClick = () => {
    if (isTourActive) {
      endTour();
    } else {
      startTour();
    }
  };

  return (
    <header className="h-[48px] w-full glass-header z-30 flex items-center justify-between px-8">
      {/* Left side Wordmark */}
      <div className="flex items-center pl-12">
        <span className="text-[18px] font-bold tracking-[0.05em] text-text-primary">
          RANGER
        </span>
      </div>

      {/* Center Breadcrumb */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-text-secondary text-[12px] font-medium tracking-wide">
        <span>Willamette NF</span>
        <ChevronRight size={14} className="opacity-40" />
        <span>Cedar Creek Fire</span>
        <ChevronRight size={14} className="opacity-40" />
        <span className="text-text-primary">Impact Analysis</span>
      </div>

      {/* Right side status/user/actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={handleDemoClick}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all group ${
            isTourActive
              ? 'bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan'
              : 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan/50'
          }`}
        >
          {isTourActive ? (
            <>
              <Sparkles size={10} className="text-accent-cyan animate-pulse" />
              Tour Active
            </>
          ) : (
            <>
              <Play size={10} className="fill-accent-cyan group-hover:scale-110 transition-transform" />
              Run Demo
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe live-dot shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-safe uppercase text-[10px] font-bold tracking-widest">
            Live
          </span>
        </div>
        <button className="text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
          <img
            src="https://picsum.photos/seed/ranger/32/32"
            alt="Avatar"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, Play, MessageSquare, X } from 'lucide-react';

import { useDemoTourStore, useTourActive } from '@/stores/demoTourStore';
import { useLifecycleStore, type LifecyclePhase } from '@/stores/lifecycleStore';

// Format timestamp as HH:MM:SS UTC
const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(11, 19) + ' UTC';
};

// Map phase IDs to user-friendly labels (consistent naming)
const PHASE_LABELS: Record<LifecyclePhase, string> = {
  IMPACT: 'Impact Analysis',
  DAMAGE: 'Damage Assessment',
  TIMBER: 'Timber Salvage',
  COMPLIANCE: 'Compliance Review',
};

// Phase-specific colors for breadcrumb indicator
const PHASE_TEXT_COLORS: Record<LifecyclePhase, string> = {
  IMPACT: 'text-phase-impact',
  DAMAGE: 'text-phase-damage',
  TIMBER: 'text-phase-timber',
  COMPLIANCE: 'text-phase-compliance',
};

interface HeaderProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onChatToggle, isChatOpen = false }) => {
  const startTour = useDemoTourStore((state) => state.startTour);
  const endTour = useDemoTourStore((state) => state.endTour);
  const isTourActive = useTourActive();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const [timestamp, setTimestamp] = useState(formatTimestamp());

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoClick = () => {
    if (isTourActive) {
      endTour();
    } else {
      startTour();
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-[48px] glass-header z-30 flex items-center justify-between px-4 md:px-8">
      {/* Left side - Breadcrumb (responsive positioning) */}
      <div className="flex items-center gap-2 text-text-secondary text-[11px] md:text-[12px] font-medium tracking-wide ml-12 md:ml-16">
        <span className="hidden sm:inline">Willamette NF</span>
        <ChevronRight size={14} className="opacity-40 hidden sm:inline" />
        <span>Cedar Creek Fire</span>
        <ChevronRight size={14} className="opacity-40" />
        <span className={`${PHASE_TEXT_COLORS[activePhase]} font-semibold transition-all duration-300`}>
          {PHASE_LABELS[activePhase]}
        </span>
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
              <X size={10} />
              Stop
            </>
          ) : (
            <>
              <Play size={10} className="fill-accent-cyan group-hover:scale-110 transition-transform" />
              Demo
            </>
          )}
        </button>

        <button
          onClick={onChatToggle}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold mono uppercase tracking-wider rounded transition-all ${
            isChatOpen
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
              : 'bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
          }`}
        >
          {isChatOpen ? (
            <>
              <X size={10} />
              Close
            </>
          ) : (
            <>
              <MessageSquare size={10} />
              Chat
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-safe live-dot shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-safe uppercase text-[10px] font-bold tracking-wider">
              Online
            </span>
          </div>
          <span className="text-text-muted text-[10px] mono hidden sm:inline">
            {timestamp}
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

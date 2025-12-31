/**
 * CommandSidebar - Left sidebar for Command/National view
 *
 * Matches the visual style of the Tactical Sidebar for consistency:
 * - Same RANGER branding
 * - Same glassmorphism styling
 * - Same expand/collapse behavior
 *
 * Content is adapted for national portfolio view:
 * - View selector (National/Watchlist)
 * - Region quick filters
 */

import { useState, useEffect } from 'react';
import {
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

import { useMissionStore, useStackView, useWatchlistCount } from '@/stores/missionStore';
import { PhaseFilterChips } from './PhaseFilterChips';
import { type MissionStackView } from '@/types/mission';

// Width constants - match Tactical Sidebar
const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 64;

interface CommandSidebarProps {
  onWidthChange?: (width: number) => void;
}

const VIEW_OPTIONS: { view: MissionStackView; icon: typeof Globe; label: string; description: string }[] = [
  { view: 'national', icon: Globe, label: 'National', description: 'All fires' },
  { view: 'watchlist', icon: Star, label: 'Watchlist', description: 'Starred fires' },
];

export function CommandSidebar({ onWidthChange }: CommandSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const stackView = useStackView();
  const watchlistCount = useWatchlistCount();
  const { setStackView } = useMissionStore();

  // Notify parent of width changes
  useEffect(() => {
    onWidthChange?.(isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  }, [isExpanded, onWidthChange]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <aside
      className="absolute top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-out bg-[#0a0f1a]/65 backdrop-blur-2xl border-r border-white/[0.1] overflow-visible"
      style={{ width: sidebarWidth }}
    >
      {/* RANGER Brand Header - matches tactical Sidebar exactly */}
      <div className="h-[48px] flex items-center justify-between px-2 border-b border-white/10">
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all group cursor-pointer"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {/* Single Tree Circular Badge Logo with Chrome Silver Gradient */}
          <div className="flex items-center justify-center flex-shrink-0 relative">
            <svg
              width="36"
              height="36"
              viewBox="0 0 512 512"
              fill="none"
              className="drop-shadow-[0_0_6px_rgba(148,163,184,0.4)] group-hover:drop-shadow-[0_0_10px_rgba(148,163,184,0.6)] transition-all"
            >
              <defs>
                <linearGradient id="chromeGradientCmd" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="25%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="75%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <radialGradient id="innerGlowCmd" cx="50%" cy="50%" r="50%">
                  <stop offset="85%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </radialGradient>
              </defs>
              <circle cx="256" cy="256" r="248" fill="none" stroke="url(#chromeGradientCmd)" strokeWidth="16" opacity="0.95" />
              <circle cx="256" cy="256" r="232" fill="url(#innerGlowCmd)" />
              <circle cx="256" cy="256" r="232" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d="M 56 280 L 100 220 L 150 250 L 220 180 L 256 210 L 300 160 L 360 220 L 420 190 L 456 280" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 56 320 L 120 270 L 180 295 L 240 240 L 300 275 L 360 230 L 420 280 L 456 320" stroke="rgba(255,255,255,0.4)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <g transform="translate(256, 100)">
                <path d="M0 0 L-60 70 L-35 70 L-75 130 L-45 130 L-85 195 L-50 195 L-95 265 L95 265 L50 195 L85 195 L45 130 L75 130 L35 70 L60 70 Z" fill="rgba(255,255,255,0.9)" />
                <rect x="-22" y="265" width="44" height="70" fill="rgba(255,255,255,0.9)" />
              </g>
            </svg>
          </div>
          {isExpanded && (
            <>
              <div className="flex flex-col">
                <span className="text-[20px] font-semibold tracking-[0.2em] text-white/90 group-hover:text-white transition-colors">
                  RANGER
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 -mt-1">
                  Mission Control
                </span>
              </div>
              <ChevronLeft size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
            </>
          )}
        </button>
      </div>

      {/* View Selection */}
      <div className="flex-1 pt-4 pb-4 px-2 space-y-1 overflow-hidden">
        {VIEW_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = stackView === option.view;
          const showBadge = option.view === 'watchlist' && watchlistCount > 0;

          return (
            <button
              key={option.view}
              onClick={() => setStackView(option.view)}
              className={`
                group relative w-full flex items-center rounded-r-lg transition-all duration-200
                ${isExpanded ? 'py-3 px-3 gap-3' : 'py-2 px-2 gap-0.5 justify-center flex-col'}
                ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
              `}
              style={{
                borderLeft: `3px solid ${isActive ? '#22d3ee' : 'transparent'}`,
              }}
            >
              <div className="relative flex-shrink-0">
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={`transition-all ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`}
                />
                {/* Badge for watchlist count */}
                {showBadge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-amber-500 text-[9px] font-bold text-slate-900">
                    {watchlistCount}
                  </div>
                )}
              </div>

              {isExpanded ? (
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-[12px] font-semibold transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {option.label}
                  </span>
                  <span className="text-[10px] text-text-muted block truncate">
                    {option.description}
                  </span>
                </div>
              ) : (
                <span className={`text-[8px] font-bold tracking-wider uppercase transition-all ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {option.view === 'national' ? 'NAT' : 'LIST'}
                </span>
              )}

              {isExpanded && (
                <ChevronRight
                  size={14}
                  className={`text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${isActive ? 'text-cyan-400 opacity-60' : ''}`}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="mx-1 my-3 border-t border-white/10" />

        {/* Phase Filters - Enhanced with counts and toast warnings */}
        <PhaseFilterChips collapsed={!isExpanded} />
      </div>

      {/* Footer - Command label */}
      <div className="px-3 py-3 border-t border-white/10">
        {isExpanded ? (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <MapPin size={12} />
            <span className="uppercase tracking-wider font-medium">Command Center</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <MapPin size={14} className="text-slate-500" />
          </div>
        )}
      </div>
    </aside>
  );
}

export default CommandSidebar;

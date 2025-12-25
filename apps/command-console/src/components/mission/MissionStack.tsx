/**
 * MissionStack - Left navigation rail for Mission Control
 *
 * Views:
 * - National View: Show all fires
 * - My Watchlist: Filter to watched fires only
 * - Incident: (disabled) Deep-dive into selected fire
 */

import { Globe, Star, Target } from 'lucide-react';

import { useMissionStore, useStackView, useWatchlistCount } from '@/stores/missionStore';
import type { MissionStackView } from '@/types/mission';

/**
 * RANGER Logo - Chrome silver tree/mountain badge
 * Matches the logo in the tactical Sidebar
 */
function RangerLogo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 512 512"
      fill="none"
      className="drop-shadow-[0_0_6px_rgba(148,163,184,0.4)]"
    >
      {/* Gradient definitions for chrome/silver effect */}
      <defs>
        {/* Chrome gradient ring - silver metallic */}
        <linearGradient id="chromeGradientMission" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        {/* Subtle inner glow */}
        <radialGradient id="innerGlowMission" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>

      {/* Outer gradient ring - chrome silver */}
      <circle
        cx="256"
        cy="256"
        r="248"
        fill="none"
        stroke="url(#chromeGradientMission)"
        strokeWidth="16"
        opacity="0.95"
      />

      {/* Dark inner circle background */}
      <circle cx="256" cy="256" r="232" fill="url(#innerGlowMission)" />

      {/* Subtle inner border */}
      <circle
        cx="256"
        cy="256"
        r="232"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* Back mountain ridge - subtle */}
      <path
        d="M 56 280 L 100 220 L 150 250 L 220 180 L 256 210 L 300 160 L 360 220 L 420 190 L 456 280"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front mountain ridge */}
      <path
        d="M 56 320 L 120 270 L 180 295 L 240 240 L 300 275 L 360 230 L 420 280 L 456 320"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Evergreen tree - white/light for contrast on dark bg */}
      <g transform="translate(256, 100)">
        <path
          d="M0 0 L-60 70 L-35 70 L-75 130 L-45 130 L-85 195 L-50 195 L-95 265 L95 265 L50 195 L85 195 L45 130 L75 130 L35 70 L60 70 Z"
          fill="rgba(255,255,255,0.9)"
        />
        <rect x="-22" y="265" width="44" height="70" fill="rgba(255,255,255,0.9)" />
      </g>
    </svg>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: MissionStackView;
  activeView: MissionStackView;
  badge?: number;
  disabled?: boolean;
  onClick: () => void;
}

function NavItem({
  icon,
  label,
  view,
  activeView,
  badge,
  disabled,
  onClick,
}: NavItemProps) {
  const isActive = view === activeView;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex flex-col items-center justify-center gap-1 py-3 px-2
        transition-all duration-200 relative group
        ${isActive
          ? 'bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-400'
          : disabled
            ? 'text-slate-600 cursor-not-allowed'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }
      `}
      title={label}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-amber-500 text-slate-900 rounded-full px-1">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">
        {label}
      </span>

      {/* Tooltip on hover */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    </button>
  );
}

export function MissionStack() {
  const stackView = useStackView();
  const watchlistCount = useWatchlistCount();
  const { setStackView } = useMissionStore();

  return (
    <nav className="h-full flex flex-col pt-2">
      {/* RANGER Logo - Chrome silver tree badge */}
      <div className="flex items-center justify-center py-2 mb-1">
        <RangerLogo />
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-white/10 mb-2" />

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col">
        <NavItem
          icon={<Globe size={20} />}
          label="National"
          view="national"
          activeView={stackView}
          onClick={() => setStackView('national')}
        />

        <NavItem
          icon={<Star size={20} />}
          label="Watchlist"
          view="watchlist"
          activeView={stackView}
          badge={watchlistCount}
          onClick={() => setStackView('watchlist')}
        />

        <NavItem
          icon={<Target size={20} />}
          label="Incident"
          view="incident"
          activeView={stackView}
          disabled
          onClick={() => {}}
        />
      </div>

      {/* Version badge at bottom */}
      <div className="p-2 text-center">
        <span className="text-[9px] text-slate-600 font-mono">
          v0.1.0
        </span>
      </div>
    </nav>
  );
}

export default MissionStack;

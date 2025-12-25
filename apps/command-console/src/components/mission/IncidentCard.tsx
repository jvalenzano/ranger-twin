/**
 * IncidentCard - Individual fire card in the IncidentRail
 *
 * Shows fire summary with:
 * - Name and state
 * - Phase badge
 * - Acres and containment
 * - Severity bar
 * - Watchlist star
 */

import { Star, MapPin, Flame, ArrowRight, AlertCircle } from 'lucide-react';

import { useMissionStore, useIsFireWatched } from '@/stores/missionStore';
import { SeverityBar, SeverityBadge } from './SeverityBar';
import { PHASE_DISPLAY, REGION_DISPLAY, type NationalFire } from '@/types/mission';

interface IncidentCardProps {
  fire: NationalFire;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
  onEnterTactical: () => void;
}

export function IncidentCard({
  fire,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onEnterTactical,
}: IncidentCardProps) {
  const { toggleWatchlist } = useMissionStore();
  const isWatched = useIsFireWatched(fire.id);
  const phaseDisplay = PHASE_DISPLAY[fire.phase];
  const regionDisplay = REGION_DISPLAY[fire.region];

  const formatAcres = (acres: number) => {
    if (acres >= 1000000) {
      return `${(acres / 1000000).toFixed(1)}M`;
    }
    if (acres >= 1000) {
      return `${(acres / 1000).toFixed(0)}K`;
    }
    return acres.toLocaleString();
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg cursor-pointer
        transition-all duration-200 group
        ${isSelected
          ? 'bg-cyan-500/20 border border-cyan-500/50'
          : isHovered
            ? 'bg-white/10 border border-white/20'
            : 'bg-white/5 border border-transparent hover:bg-white/10'
        }
      `}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Top row - Name, Phase badge, Watchlist star */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {fire.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <MapPin size={10} />
            <span>{fire.state}</span>
            <span className="text-slate-600">•</span>
            <span>Region {fire.region} ({regionDisplay.name})</span>
          </div>
        </div>

        {/* Watchlist star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(fire.id);
          }}
          className={`
            p-1 rounded transition-colors
            ${isWatched
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-600 hover:text-slate-400'
            }
          `}
          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Phase and Severity badges */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{
            backgroundColor: phaseDisplay.bgColor,
            color: phaseDisplay.color,
          }}
        >
          {phaseDisplay.label}
        </span>
        <SeverityBadge severity={fire.severity} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px] mb-2">
        <div className="flex items-center gap-1 text-slate-300">
          <Flame size={12} className="text-orange-400" />
          <span>{formatAcres(fire.acres)} acres</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-slate-500">Containment:</span>
          <span className="font-medium">{fire.containment}%</span>
        </div>
      </div>

      {/* Severity bar */}
      <SeverityBar severity={fire.severity} className="mb-2" />

      {/* Triage score and enter button */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-slate-500">
          Triage: <span className="text-cyan-400 font-mono">{fire.triageScore.toFixed(1)}</span>
        </div>

        {/* Enter tactical button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEnterTactical();
          }}
          className={`
            flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium
            transition-all duration-200
            ${fire.hasFixtures
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }
          `}
          disabled={!fire.hasFixtures}
          title={fire.hasFixtures ? 'Enter tactical view' : 'Data pending'}
        >
          {fire.hasFixtures ? (
            <>
              Enter <ArrowRight size={12} />
            </>
          ) : (
            <>
              <AlertCircle size={12} />
              Data Pending
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default IncidentCard;

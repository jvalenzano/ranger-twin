/**
 * IncidentCard - Individual fire card in the IncidentRail
 *
 * Redesigned hierarchy (triage-first):
 * - Row 1: Triage score (hero) + severity bar + fire name + watchlist star
 * - Row 2: Severity badge + Phase badge
 * - Row 3: Compressed metadata (acres, containment, state, region)
 * - Row 4: Enter button (right-aligned)
 */

import { useState, useRef } from 'react';
import { Star, ArrowRight, AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

import { useMissionStore, useIsFireWatched } from '@/stores/missionStore';
import { TechnicalTooltip } from '@/components/common/TechnicalTooltip';
import { TriageTooltip } from './TriageTooltip';
import {
  PHASE_COLORS,
  PHASE_DISPLAY,
  PHASE_MULTIPLIERS,
  SEVERITY_DISPLAY,
  getDeltaDirection,
  type NationalFire,
} from '@/types/mission';

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
  const severityDisplay = SEVERITY_DISPLAY[fire.severity];
  const deltaDirection = getDeltaDirection(fire.triageScore, fire.previousTriageScore);

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate mini breakdown bar percentages (for stacked bar)
  const maxSeverity = 4;
  const maxAcres = 50;
  const maxPhase = 2.0;
  const severityContrib = (severityDisplay.weight / maxSeverity) * 33;
  const acresNormalized = Math.min(fire.acres / 10000, 50);
  const sizeContrib = (acresNormalized / maxAcres) * 33;
  const phaseMultiplier = PHASE_MULTIPLIERS[fire.phase];
  const phaseContrib = (phaseMultiplier / maxPhase) * 34;

  const formatAcres = (acres: number) => {
    if (acres >= 1000000) {
      return `${(acres / 1000000).toFixed(1)}M`;
    }
    if (acres >= 1000) {
      return `${(acres / 1000).toFixed(0)}K`;
    }
    return acres.toLocaleString();
  };

  const handleScoreMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  };

  const handleScoreMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg cursor-pointer
        transition-all duration-200 group overflow-hidden
        ${isSelected
          ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
          : isHovered
            ? 'bg-white/10 border border-white/20'
            : 'bg-white/5 border border-transparent hover:bg-white/10'
        }
      `}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Phase color indicator - left edge bar (matches map dot color) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: PHASE_COLORS[fire.phase] }}
      />
      {/* Row 1: Triage Score (hero) + Fire Name + Watchlist Star */}
      <div className="flex items-center gap-3 mb-2">
        {/* Triage Score Block */}
        <TechnicalTooltip tooltipId="ui-triage-score">
          <div
            className="relative flex-shrink-0"
            onMouseEnter={handleScoreMouseEnter}
            onMouseLeave={handleScoreMouseLeave}
          >
            <div className="flex items-center gap-2">
              {/* Delta indicator */}
              {deltaDirection === 'up' && (
                <ArrowUp size={14} className="text-red-400 flex-shrink-0" />
              )}
              {deltaDirection === 'down' && (
                <ArrowDown size={14} className="text-green-400 flex-shrink-0" />
              )}
              {/* Score number */}
              <span className={`text-xl font-bold font-mono tabular-nums ${
                deltaDirection === 'up' ? 'text-red-400' :
                deltaDirection === 'down' ? 'text-green-400' : 'text-white'
              }`}>
                {fire.triageScore.toFixed(1)}
              </span>
              {/* Mini stacked breakdown bar */}
              <div className="w-14 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full"
                  style={{ width: `${severityContrib}%`, backgroundColor: '#ef4444' }}
                  title="Severity"
                />
                <div
                  className="h-full"
                  style={{ width: `${sizeContrib}%`, backgroundColor: '#f97316' }}
                  title="Size"
                />
                <div
                  className="h-full"
                  style={{ width: `${phaseContrib}%`, backgroundColor: '#f59e0b' }}
                  title="Phase"
                />
              </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <TriageTooltip fire={fire} />
              </div>
            )}
          </div>
        </TechnicalTooltip>

        {/* Fire Name */}
        <h3 className="flex-1 min-w-0 text-sm font-semibold text-white truncate">
          {fire.name}
        </h3>

        {/* Watchlist Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(fire.id);
          }}
          className={`
            flex-shrink-0 p-1 rounded transition-colors
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

      {/* Row 2: Severity + Phase Badges */}
      <div className="flex items-center gap-2 mb-2">
        {/* Severity badge with icon */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{
            backgroundColor: `${severityDisplay.color}20`,
            color: severityDisplay.color,
          }}
        >
          <AlertTriangle size={10} />
          {severityDisplay.label}
        </div>

        <span className="text-slate-600">·</span>

        {/* Phase badge */}
        <span
          className="px-2 py-0.5 rounded text-[10px] font-medium uppercase"
          style={{
            backgroundColor: phaseDisplay.bgColor,
            color: phaseDisplay.color,
          }}
        >
          {phaseDisplay.label}
        </span>
      </div>

      {/* Row 3: Compressed metadata + Enter button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>{formatAcres(fire.acres)} acres</span>
          <span className="text-slate-600">·</span>
          <span>{fire.containment}% contained</span>
          <span className="text-slate-600">·</span>
          <span>{fire.state}</span>
          <span className="text-slate-600">·</span>
          <span>R{fire.region}</span>
        </div>

        {/* Enter tactical button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEnterTactical();
          }}
          className={`
            flex items-center justify-center p-1.5 rounded-lg
            transition-all duration-200 group-enter
            ${fire.hasFixtures
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-900 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/20'
              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-transparent'
            }
          `}
          disabled={!fire.hasFixtures}
          title={fire.hasFixtures ? 'Enter tactical view' : 'Data pending'}
        >
          {fire.hasFixtures ? (
            <ArrowRight size={16} className="transition-transform group-hover/enter:translate-x-0.5" />
          ) : (
            <div className="flex items-center gap-1.5 px-1">
              <AlertCircle size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Pending</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default IncidentCard;

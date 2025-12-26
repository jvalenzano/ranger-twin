/**
 * TopEscalations - Widget showing fires with rising priority scores
 *
 * Surfaces fires that need immediate attention based on 24h delta.
 * Collapsible panel, hidden when no escalations exist.
 */

import { useState, useMemo } from 'react';
import { TrendingUp, ChevronUp, ChevronDown, ArrowUp } from 'lucide-react';

import { useMissionStore } from '@/stores/missionStore';
import {
  getDeltaDirection,
  getTriageDelta,
  type NationalFire,
} from '@/types/mission';

interface TopEscalationsProps {
  /** All fires to check for escalations */
  fires: NationalFire[];
  /** Maximum items to show */
  maxItems?: number;
}

export function TopEscalations({ fires, maxItems = 5 }: TopEscalationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectFire, hoverFire } = useMissionStore();

  // Find escalated fires (delta direction = 'up')
  const escalatedFires = useMemo(() => {
    return fires
      .filter((fire) => getDeltaDirection(fire.triageScore, fire.previousTriageScore) === 'up')
      .sort((a, b) => {
        // Sort by delta magnitude (biggest increase first)
        const deltaA = getTriageDelta(a.triageScore, a.previousTriageScore);
        const deltaB = getTriageDelta(b.triageScore, b.previousTriageScore);
        return deltaB - deltaA;
      })
      .slice(0, maxItems);
  }, [fires, maxItems]);

  // Don't render if no escalations
  if (escalatedFires.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-white/10">
      {/* Header - clickable to toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-red-500/5 hover:bg-red-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-red-400" />
          <span className="text-xs font-medium text-red-400">
            ESCALATIONS
          </span>
          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">
            {escalatedFires.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={14} className="text-slate-500" />
        ) : (
          <ChevronDown size={14} className="text-slate-500" />
        )}
      </button>

      {/* Escalation list */}
      {isExpanded && (
        <div className="p-2 space-y-1">
          {escalatedFires.map((fire) => {
            const delta = getTriageDelta(fire.triageScore, fire.previousTriageScore);

            return (
              <button
                key={fire.id}
                onClick={() => selectFire(fire.id)}
                onMouseEnter={() => hoverFire(fire.id)}
                onMouseLeave={() => hoverFire(null)}
                className="w-full p-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Delta and fire name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-red-400 flex-shrink-0">
                      <ArrowUp size={12} />
                      <span className="text-[11px] font-mono font-medium">
                        +{delta.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-300 truncate group-hover:text-white">
                      {fire.name}
                    </span>
                  </div>

                  {/* Current score */}
                  <span className="text-sm font-bold text-red-400 font-mono tabular-nums flex-shrink-0">
                    {fire.triageScore.toFixed(1)}
                  </span>
                </div>

                {/* Location info */}
                <div className="mt-1 text-[10px] text-slate-500">
                  {fire.state} · R{fire.region}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TopEscalations;

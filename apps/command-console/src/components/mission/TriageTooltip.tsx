/**
 * TriageTooltip - Explains triage score breakdown
 *
 * Shows how the triage score is calculated from:
 * - Severity weight (1-4)
 * - Size impact (acres normalized)
 * - Phase urgency multiplier
 *
 * Also displays:
 * - Percentile rank in portfolio
 * - Delta from previous score (24h change)
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  SEVERITY_DISPLAY,
  PHASE_DISPLAY,
  PHASE_MULTIPLIERS,
  getDeltaDirection,
  getTriageDelta,
  type NationalFire,
} from '@/types/mission';

interface TriageTooltipProps {
  fire: NationalFire;
}

/**
 * Calculate component contributions to triage score
 * Returns percentages for display
 */
function calculateTriageBreakdown(fire: NationalFire) {
  const severityWeight = SEVERITY_DISPLAY[fire.severity].weight;
  const acresNormalized = Math.min(fire.acres / 10000, 50);
  const phaseMultiplier = PHASE_MULTIPLIERS[fire.phase];

  // Max possible values
  const maxSeverity = 4; // critical
  const maxAcres = 50; // 500k acres cap
  const maxPhase = 2.0; // active

  return {
    severity: {
      value: severityWeight,
      max: maxSeverity,
      percent: Math.round((severityWeight / maxSeverity) * 100),
      label: SEVERITY_DISPLAY[fire.severity].label,
    },
    size: {
      value: acresNormalized,
      max: maxAcres,
      percent: Math.round((acresNormalized / maxAcres) * 100),
      label: fire.acres >= 1000
        ? `${(fire.acres / 1000).toFixed(0)}K acres`
        : `${fire.acres.toLocaleString()} acres`,
    },
    phase: {
      value: phaseMultiplier,
      max: maxPhase,
      percent: Math.round((phaseMultiplier / maxPhase) * 100),
      label: PHASE_DISPLAY[fire.phase].label,
    },
  };
}

export function TriageTooltip({ fire }: TriageTooltipProps) {
  const breakdown = calculateTriageBreakdown(fire);
  const deltaDirection = getDeltaDirection(fire.triageScore, fire.previousTriageScore);
  const deltaValue = getTriageDelta(fire.triageScore, fire.previousTriageScore);

  return (
    <div className="w-64 p-3 bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl">
      {/* Header with Score and Percentile */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Triage Score</span>
          {fire.percentileRank !== undefined && (
            <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-medium rounded">
              Top {100 - fire.percentileRank + 1}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Delta indicator */}
          {deltaDirection === 'up' && (
            <div className="flex items-center text-red-400">
              <ArrowUp size={12} />
              <span className="text-[10px] font-mono">+{Math.abs(deltaValue).toFixed(1)}</span>
            </div>
          )}
          {deltaDirection === 'down' && (
            <div className="flex items-center text-green-400">
              <ArrowDown size={12} />
              <span className="text-[10px] font-mono">-{Math.abs(deltaValue).toFixed(1)}</span>
            </div>
          )}
          {deltaDirection === 'stable' && fire.previousTriageScore !== undefined && (
            <div className="flex items-center text-slate-500">
              <Minus size={12} />
            </div>
          )}
          <span className="text-lg font-bold text-cyan-400 font-mono">
            {fire.triageScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Delta context message */}
      {deltaDirection === 'up' && (
        <div className="mb-3 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-300">
          Escalated in last 24h - needs attention
        </div>
      )}
      {deltaDirection === 'down' && (
        <div className="mb-3 px-2 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-300">
          De-escalated in last 24h
        </div>
      )}

      {/* Breakdown bars */}
      <div className="space-y-2.5">
        {/* Severity */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400">Severity</span>
            <span className="text-slate-300">{breakdown.severity.label}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${breakdown.severity.percent}%` }}
            />
          </div>
        </div>

        {/* Size */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400">Size Impact</span>
            <span className="text-slate-300">{breakdown.size.label}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${breakdown.size.percent}%` }}
            />
          </div>
        </div>

        {/* Phase */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-400">Phase Urgency</span>
            <span className="text-slate-300">{breakdown.phase.label}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${breakdown.phase.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-2 border-t border-white/10">
        <p className="text-[9px] text-slate-500 text-center">
          Higher score = needs attention first
        </p>
      </div>
    </div>
  );
}

export default TriageTooltip;

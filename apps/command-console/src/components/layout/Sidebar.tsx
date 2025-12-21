/**
 * Sidebar - Expandable Lifecycle Navigation
 *
 * Two states:
 * - Expanded (default): Shows icon + label + description (200px)
 * - Collapsed: Icon only with label below (64px)
 *
 * Automatically collapses after first workflow selection for more map space.
 */

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Map,
  TreePine,
  FileCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

import {
  useLifecycleStore,
  useAllPhases,
  type LifecyclePhase,
} from '@/stores/lifecycleStore';
import mockBriefingService, {
  type LifecyclePhase as MockPhase,
} from '@/services/mockBriefingService';

interface LifecycleStep {
  id: LifecyclePhase;
  icon: LucideIcon;
  label: string;
  description: string;
}

// Consistent naming: Workflow → Agent
// Impact Analysis → Impact Analyst
// Damage Assessment → Damage Assessor
// Timber Salvage → Timber Analyst
// Compliance Review → Compliance Advisor
const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    id: 'IMPACT',
    icon: Flame,
    label: 'Impact',
    description: 'Burn severity analysis',
  },
  {
    id: 'DAMAGE',
    icon: Map,
    label: 'Damage',
    description: 'Trail & infrastructure',
  },
  {
    id: 'TIMBER',
    icon: TreePine,
    label: 'Timber',
    description: 'Salvage prioritization',
  },
  {
    id: 'COMPLIANCE',
    icon: FileCheck,
    label: 'Compliance',
    description: 'Regulatory review',
  },
];

// Width constants
const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onWidthChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const phases = useAllPhases();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const setActivePhase = useLifecycleStore((state) => state.setActivePhase);
  const clearPulse = useLifecycleStore((state) => state.clearPulse);

  // Notify parent of width changes
  useEffect(() => {
    onWidthChange?.(isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  }, [isExpanded, onWidthChange]);

  const handlePhaseClick = (phase: LifecyclePhase) => {
    setActivePhase(phase);
    clearPulse(phase);

    // Fire the event for this phase from fixtures
    mockBriefingService.triggerPhase(phase as MockPhase);

    // Auto-collapse after first interaction to maximize map space
    if (!hasInteracted) {
      setHasInteracted(true);
      // Delay collapse slightly so user sees the selection
      setTimeout(() => setIsExpanded(false), 800);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setHasInteracted(true);
  };

  const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <aside
      className="absolute top-0 left-0 bottom-0 glass border-r border-white/10 z-40 flex flex-col transition-all duration-300 ease-out"
      style={{ width: sidebarWidth }}
    >
      {/* RANGER Brand Header */}
      <div className="h-[48px] flex items-center gap-2 px-3 border-b border-white/10">
        {/* Shield Badge */}
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-safe/20 to-safe/5 border border-safe/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)] flex-shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-safe"
          >
            <path
              d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="rgba(16,185,129,0.15)"
            />
            <path
              d="M12 7l3 4h-2v3h-2v-3H9l3-4z"
              fill="currentColor"
            />
            <rect x="11" y="14" width="2" height="2" fill="currentColor" />
          </svg>
        </div>
        {isExpanded && (
          <span className="text-[16px] font-bold tracking-[0.05em] text-text-primary">
            RANGER
          </span>
        )}
      </div>

      {/* Workflows Header with collapse toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        {isExpanded && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Workflows
          </span>
        )}
        <button
          onClick={toggleExpanded}
          className={`p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors ${!isExpanded ? 'mx-auto' : 'ml-auto'}`}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Workflow steps */}
      <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
        {LIFECYCLE_STEPS.map((step, index) => {
          const Icon = step.icon;
          const phaseState = phases[step.id];
          const isActive = activePhase === step.id;
          const isComplete = phaseState.status === 'complete';
          const hasPulse = phaseState.hasNewInsight;
          const isFirst = index === 0 && !hasInteracted;

          return (
            <button
              key={step.id}
              onClick={() => handlePhaseClick(step.id)}
              className={`
                relative w-full flex items-center gap-3 rounded-lg border transition-all duration-200
                ${isExpanded ? 'p-3' : 'p-2 justify-center flex-col'}
                ${isActive
                  ? 'bg-safe/10 border-safe/40 text-safe shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : hasPulse
                    ? 'bg-warning/10 border-warning/40 text-warning'
                    : isFirst
                      ? 'bg-accent-cyan/5 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10'
                      : 'bg-slate-900/30 border-white/5 text-text-muted hover:bg-slate-800/50 hover:border-white/10 hover:text-text-secondary'
                }
              `}
              aria-label={`${step.label}: ${step.description}`}
              aria-pressed={isActive}
            >
              {/* Icon */}
              <div
                className={`
                  relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-md
                  ${isActive
                    ? 'bg-safe/20'
                    : hasPulse
                      ? 'bg-warning/20'
                      : isFirst
                        ? 'bg-accent-cyan/10'
                        : 'bg-slate-800/50'
                  }
                `}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />

                {/* Completion badge */}
                {isComplete && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-safe rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                    <Check size={10} strokeWidth={3} className="text-background" />
                  </div>
                )}

                {/* Pulse animation */}
                {(hasPulse || isFirst) && (
                  <div
                    className={`absolute inset-0 rounded-md border-2 animate-ping opacity-50 ${hasPulse ? 'border-warning' : 'border-accent-cyan'}`}
                  />
                )}
              </div>

              {/* Label and description (expanded mode) */}
              {isExpanded && (
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] font-semibold ${isActive ? 'text-safe' : hasPulse ? 'text-warning' : isFirst ? 'text-accent-cyan' : 'text-text-primary'}`}
                    >
                      {step.label}
                    </span>
                    {isFirst && (
                      <span className="text-[9px] bg-accent-cyan/20 text-accent-cyan px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                        Start
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted block truncate">
                    {step.description}
                  </span>
                </div>
              )}

              {/* Label (collapsed mode) */}
              {!isExpanded && (
                <span
                  className={`text-[8px] font-bold tracking-wider uppercase mt-1 ${isActive ? 'text-safe' : hasPulse ? 'text-warning' : 'text-text-muted'}`}
                >
                  {step.id.slice(0, 3)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded mode: helper text at bottom */}
      {isExpanded && !hasInteracted && (
        <div className="px-3 py-3 border-t border-white/5">
          <p className="text-[10px] text-text-muted text-center">
            Select a workflow to begin analysis
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

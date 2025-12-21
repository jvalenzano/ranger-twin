/**
 * Sidebar - Lifecycle Navigation Rail
 */

import React from 'react';
import {
  Flame,
  Map,
  TreePine,
  FileCheck,
  Check,
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
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  { id: 'IMPACT', icon: Flame, label: 'IMPACT' },
  { id: 'DAMAGE', icon: Map, label: 'DAMAGE' },
  { id: 'TIMBER', icon: TreePine, label: 'TIMBER' },
  { id: 'COMPLIANCE', icon: FileCheck, label: 'COMPLIANCE' },
];

const Sidebar: React.FC = () => {
  const phases = useAllPhases();
  const activePhase = useLifecycleStore((state) => state.activePhase);
  const setActivePhase = useLifecycleStore((state) => state.setActivePhase);
  const clearPulse = useLifecycleStore((state) => state.clearPulse);

  const handlePhaseClick = (phase: LifecyclePhase) => {
    setActivePhase(phase);
    clearPulse(phase);

    // Fire the event for this phase from fixtures
    mockBriefingService.triggerPhase(phase as MockPhase);
  };

  return (
    <aside className="absolute top-[48px] left-0 bottom-0 w-[64px] glass border-r border-white/10 z-40 flex flex-col items-center py-6">
      <div className="relative flex flex-col items-center gap-12 w-full h-full">
        <div className="absolute top-6 bottom-6 w-[1px] bg-white/5 left-1/2 -translate-x-1/2 z-0" />

        {LIFECYCLE_STEPS.map((step) => {
          const Icon = step.icon;
          const phaseState = phases[step.id];
          const isActive = activePhase === step.id;
          const isComplete = phaseState.status === 'complete';
          const hasPulse = phaseState.hasNewInsight;

          return (
            <button
              key={step.id}
              onClick={() => handlePhaseClick(step.id)}
              className="relative z-10 group flex flex-col items-center bg-transparent border-none cursor-pointer"
              aria-label={`View ${step.label} phase`}
              aria-pressed={isActive}
            >
              <div
                className={`
                  relative w-10 h-10 flex items-center justify-center rounded-md border transition-all duration-300
                  ${isActive
                    ? 'bg-safe/15 border-safe text-safe shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : hasPulse
                      ? 'bg-warning/15 border-warning text-warning animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-900/40 border-white/10 text-text-muted hover:border-white/30 hover:text-slate-300'
                  }
                `}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />

                {isComplete && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-safe rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                    <Check size={10} strokeWidth={3} className="text-background" />
                  </div>
                )}

                {hasPulse && (
                  <div className="absolute inset-0 rounded-md border-2 border-warning animate-ping opacity-75" />
                )}
              </div>

              <span
                className={`
                  mt-2 text-[8px] font-bold tracking-[0.1em] transition-colors uppercase
                  ${isActive
                    ? 'text-safe'
                    : hasPulse
                      ? 'text-warning'
                      : 'text-text-muted group-hover:text-slate-300'
                  }
                `}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;

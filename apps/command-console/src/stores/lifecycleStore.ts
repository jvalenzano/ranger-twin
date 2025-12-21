/**
 * Lifecycle Store - Manages the active lifecycle phase
 *
 * The lifecycle rail (Sidebar) shows the post-fire recovery phases:
 * IMPACT → DAMAGE → TIMBER → COMPLIANCE
 *
 * Each phase maps to an agent:
 * - IMPACT → Burn Analyst
 * - DAMAGE → Trail Assessor
 * - TIMBER → Cruising Assistant
 * - COMPLIANCE → NEPA Advisor
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type LifecyclePhase = 'IMPACT' | 'DAMAGE' | 'TIMBER' | 'COMPLIANCE';

export type PhaseStatus = 'pending' | 'active' | 'complete';

interface PhaseState {
  status: PhaseStatus;
  hasNewInsight: boolean; // For rail_pulse effect
}

interface LifecycleState {
  // Current active phase
  activePhase: LifecyclePhase;

  // Status of each phase
  phases: Record<LifecyclePhase, PhaseState>;

  // Actions
  setActivePhase: (phase: LifecyclePhase) => void;
  completePhase: (phase: LifecyclePhase) => void;
  pulsePhase: (phase: LifecyclePhase) => void;
  clearPulse: (phase: LifecyclePhase) => void;
  reset: () => void;
}

const initialPhases: Record<LifecyclePhase, PhaseState> = {
  IMPACT: { status: 'active', hasNewInsight: false },
  DAMAGE: { status: 'pending', hasNewInsight: false },
  TIMBER: { status: 'pending', hasNewInsight: false },
  COMPLIANCE: { status: 'pending', hasNewInsight: false },
};

export const useLifecycleStore = create<LifecycleState>()(
  devtools(
    (set) => ({
      activePhase: 'IMPACT',
      phases: { ...initialPhases },

      setActivePhase: (phase) => {
        set((state) => ({
          activePhase: phase,
          phases: {
            ...state.phases,
            [phase]: { ...state.phases[phase], status: 'active' },
          },
        }));
      },

      completePhase: (phase) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [phase]: { ...state.phases[phase], status: 'complete', hasNewInsight: false },
          },
        }));
      },

      pulsePhase: (phase) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [phase]: { ...state.phases[phase], hasNewInsight: true },
          },
        }));
      },

      clearPulse: (phase) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [phase]: { ...state.phases[phase], hasNewInsight: false },
          },
        }));
      },

      reset: () => {
        set({
          activePhase: 'IMPACT',
          phases: { ...initialPhases },
        });
      },
    }),
    { name: 'lifecycle-store' }
  )
);

// Selector hooks
export const useActivePhase = () => useLifecycleStore((state) => state.activePhase);

export const usePhaseState = (phase: LifecyclePhase) =>
  useLifecycleStore((state) => state.phases[phase]);

export const useAllPhases = () => useLifecycleStore((state) => state.phases);

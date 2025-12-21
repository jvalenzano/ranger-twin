/**
 * RailPulseManager - Manages sidebar rail pulse states
 *
 * Provides context and hooks for the Sidebar to know which
 * lifecycle phases have pending events that need attention.
 *
 * rail_pulse events cause the corresponding agent's lifecycle
 * rail item to glow/pulse to draw user attention.
 */

import React, { createContext, useContext, useMemo } from 'react';

import { useRailPulseEvents } from '@/hooks/useBriefingEvents';
import type { SourceAgent, Severity } from '@/types/briefing';

// Map agents to their lifecycle phases
const AGENT_TO_PHASE: Record<SourceAgent, string> = {
  recovery_coordinator: 'IMPACT', // Coordinator owns high-level orchestration
  burn_analyst: 'IMPACT',
  trail_assessor: 'DAMAGE',
  cruising_assistant: 'TIMBER',
  nepa_advisor: 'COMPLIANCE',
};

interface RailPulseState {
  /**
   * Map of lifecycle phase to highest severity of pending events.
   */
  phaseSeverity: Record<string, Severity | null>;

  /**
   * Check if a phase has any pending events.
   */
  hasPendingEvents: (phase: string) => boolean;

  /**
   * Get the severity class for a phase (for styling).
   */
  getSeverityClass: (phase: string) => string;

  /**
   * Get pending event count for a phase.
   */
  getEventCount: (phase: string) => number;
}

const RailPulseContext = createContext<RailPulseState | null>(null);

export const RailPulseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const railEvents = useRailPulseEvents();

  const state = useMemo<RailPulseState>(() => {
    // Group events by phase and find highest severity
    const phaseEvents: Record<string, { count: number; maxSeverity: Severity | null }> = {
      IMPACT: { count: 0, maxSeverity: null },
      DAMAGE: { count: 0, maxSeverity: null },
      TIMBER: { count: 0, maxSeverity: null },
      COMPLIANCE: { count: 0, maxSeverity: null },
    };

    const severityOrder: Record<Severity, number> = {
      info: 0,
      warning: 1,
      critical: 2,
    };

    for (const event of railEvents) {
      const phase = AGENT_TO_PHASE[event.source_agent];
      if (phase && phaseEvents[phase]) {
        const current = phaseEvents[phase];
        if (current) {
          current.count++;
          if (
            current.maxSeverity === null ||
            severityOrder[event.severity] > severityOrder[current.maxSeverity]
          ) {
            current.maxSeverity = event.severity;
          }
        }
      }
    }

    return {
      phaseSeverity: Object.fromEntries(
        Object.entries(phaseEvents).map(([phase, data]) => [phase, data.maxSeverity])
      ),

      hasPendingEvents: (phase: string) => {
        return (phaseEvents[phase]?.count ?? 0) > 0;
      },

      getSeverityClass: (phase: string) => {
        const severity = phaseEvents[phase]?.maxSeverity;
        if (!severity) return '';

        const classes: Record<Severity, string> = {
          info: 'ring-2 ring-safe/50',
          warning: 'ring-2 ring-warning/50 animate-pulse',
          critical: 'ring-2 ring-severe/50 animate-pulse',
        };

        return classes[severity];
      },

      getEventCount: (phase: string) => {
        return phaseEvents[phase]?.count ?? 0;
      },
    };
  }, [railEvents]);

  return (
    <RailPulseContext.Provider value={state}>
      {children}
    </RailPulseContext.Provider>
  );
};

export const useRailPulse = (): RailPulseState => {
  const context = useContext(RailPulseContext);
  if (!context) {
    throw new Error('useRailPulse must be used within a RailPulseProvider');
  }
  return context;
};

export default RailPulseProvider;

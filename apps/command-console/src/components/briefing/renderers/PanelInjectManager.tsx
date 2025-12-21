/**
 * PanelInjectManager - Injects insights into agent panels
 *
 * Provides hooks for agent panels to access their pending
 * panel_inject events and render InsightCards.
 */

import React from 'react';

import { usePanelInjectEvents } from '@/hooks/useBriefingEvents';
import { useBriefingStore } from '@/stores/briefingStore';
import type { SourceAgent, AgentBriefingEvent } from '@/types/briefing';
import { InsightCard } from '../InsightCard';

interface PanelInjectorProps {
  /**
   * The agent whose events should be displayed.
   */
  agent: SourceAgent;

  /**
   * Maximum number of events to display.
   * @default 5
   */
  maxEvents?: number;

  /**
   * Whether to show events in compact mode.
   * @default false
   */
  compact?: boolean;
}

/**
 * Hook to get injected events for a specific agent.
 */
export const usePanelInjectedEvents = (agent: SourceAgent): AgentBriefingEvent[] => {
  return usePanelInjectEvents(agent);
};

/**
 * Component that renders injected insights for an agent panel.
 */
export const PanelInjector: React.FC<PanelInjectorProps> = ({
  agent,
  maxEvents = 5,
  compact = false,
}) => {
  const events = usePanelInjectEvents(agent);
  const dismissEvent = useBriefingStore((state) => state.dismissEvent);

  const visibleEvents = events.slice(0, maxEvents);

  if (visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleEvents.map((event) => (
        <InsightCard
          key={event.event_id}
          event={event}
          compact={compact}
          onDismiss={() => dismissEvent(event.event_id)}
        />
      ))}
      {events.length > maxEvents && (
        <p className="text-[11px] text-text-muted text-center">
          +{events.length - maxEvents} more insights
        </p>
      )}
    </div>
  );
};

export default PanelInjector;

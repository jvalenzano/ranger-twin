/**
 * Briefing Store - Zustand state management for AgentBriefingEvents
 *
 * Manages:
 * - Event storage and retrieval
 * - Connection status
 * - Active modal state (for critical alerts)
 * - Filter/query helpers
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type {
  AgentBriefingEvent,
  EventType,
  SourceAgent,
  UITarget,
} from '@/types/briefing';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface BriefingState {
  // Event storage
  events: AgentBriefingEvent[];
  maxEvents: number;

  // Connection state
  connectionStatus: ConnectionStatus;
  sessionId: string | null;

  // UI state
  activeModal: AgentBriefingEvent | null;

  // Actions
  addEvent: (event: AgentBriefingEvent) => void;
  dismissEvent: (eventId: string) => void;
  clearEvents: () => void;

  // Connection actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSessionId: (sessionId: string | null) => void;

  // Modal actions
  showModal: (event: AgentBriefingEvent) => void;
  dismissModal: () => void;

  // Query helpers
  getEventsByAgent: (agent: SourceAgent) => AgentBriefingEvent[];
  getEventsByTarget: (target: UITarget) => AgentBriefingEvent[];
  getEventsByType: (type: EventType) => AgentBriefingEvent[];
  getLatestEventByAgent: (agent: SourceAgent) => AgentBriefingEvent | null;
}

export const useBriefingStore = create<BriefingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      events: [],
      maxEvents: 100, // Limit to prevent memory issues
      connectionStatus: 'disconnected',
      sessionId: null,
      activeModal: null,

      // Add a new event
      addEvent: (event) => {
        set((state) => {
          // If this is a modal_interrupt, auto-show the modal
          if (event.ui_binding.target === 'modal_interrupt') {
            return {
              events: [event, ...state.events].slice(0, state.maxEvents),
              activeModal: event,
            };
          }

          return {
            events: [event, ...state.events].slice(0, state.maxEvents),
          };
        });
      },

      // Dismiss (mark as acknowledged) an event
      dismissEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter((e) => e.event_id !== eventId),
          activeModal:
            state.activeModal?.event_id === eventId ? null : state.activeModal,
        }));
      },

      // Clear all events
      clearEvents: () => {
        set({ events: [], activeModal: null });
      },

      // Connection status
      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setSessionId: (sessionId) => {
        set({ sessionId });
      },

      // Modal actions
      showModal: (event) => {
        set({ activeModal: event });
      },

      dismissModal: () => {
        set({ activeModal: null });
      },

      // Query helpers
      getEventsByAgent: (agent) => {
        return get().events.filter((e) => e.source_agent === agent);
      },

      getEventsByTarget: (target) => {
        return get().events.filter((e) => e.ui_binding.target === target);
      },

      getEventsByType: (type) => {
        return get().events.filter((e) => e.type === type);
      },

      getLatestEventByAgent: (agent) => {
        const agentEvents = get().events.filter((e) => e.source_agent === agent);
        return agentEvents[0] ?? null;
      },
    }),
    { name: 'briefing-store' }
  )
);

/**
 * Selector hooks for common queries
 */
export const useBriefingEvents = () => useBriefingStore((state) => state.events);

export const useConnectionStatus = () =>
  useBriefingStore((state) => state.connectionStatus);

export const useActiveModal = () =>
  useBriefingStore((state) => state.activeModal);

export const useAgentEvents = (agent: SourceAgent) =>
  useBriefingStore((state) => state.events.filter((e) => e.source_agent === agent));

export const useRailPulseEvents = () =>
  useBriefingStore((state) =>
    state.events.filter((e) => e.ui_binding.target === 'rail_pulse')
  );

export const usePanelInjectEvents = (agent?: SourceAgent) =>
  useBriefingStore((state) =>
    state.events.filter(
      (e) =>
        e.ui_binding.target === 'panel_inject' &&
        (agent ? e.source_agent === agent : true)
    )
  );

export const useMapHighlightEvents = () =>
  useBriefingStore((state) =>
    state.events.filter((e) => e.ui_binding.target === 'map_highlight')
  );

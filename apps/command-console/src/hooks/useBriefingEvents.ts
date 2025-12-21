/**
 * useBriefingEvents Hook
 *
 * Manages WebSocket connection for real-time AgentBriefingEvent streaming.
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Heartbeat handling
 * - Event filtering subscription
 * - Connection status tracking
 */

import { useCallback, useEffect, useRef } from 'react';

import { useBriefingStore } from '@/stores/briefingStore';
import type { AgentBriefingEvent, EventType, SourceAgent } from '@/types/briefing';
import { isAgentBriefingEvent } from '@/types/briefing';

interface UseBriefingEventsOptions {
  /**
   * Session ID for the WebSocket connection.
   * If not provided, a random ID will be generated.
   */
  sessionId?: string;

  /**
   * WebSocket server URL.
   * Defaults to ws://localhost:8000/ws/briefings
   */
  wsUrl?: string;

  /**
   * Auto-connect on mount.
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Filter events by source agent.
   */
  agents?: SourceAgent[];

  /**
   * Filter events by event type.
   */
  eventTypes?: EventType[];

  /**
   * Callback when an event is received.
   */
  onEvent?: (event: AgentBriefingEvent) => void;

  /**
   * Callback when connection status changes.
   */
  onConnectionChange?: (connected: boolean) => void;
}

interface UseBriefingEventsReturn {
  /**
   * Current connection status.
   */
  isConnected: boolean;

  /**
   * Manually connect to the WebSocket.
   */
  connect: () => void;

  /**
   * Manually disconnect from the WebSocket.
   */
  disconnect: () => void;

  /**
   * Update event filters.
   */
  setFilters: (agents?: SourceAgent[], eventTypes?: EventType[]) => void;
}

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/briefings';
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

export function useBriefingEventsConnection(
  options: UseBriefingEventsOptions = {}
): UseBriefingEventsReturn {
  const {
    sessionId: providedSessionId,
    wsUrl = DEFAULT_WS_URL,
    autoConnect = true,
    agents,
    eventTypes,
    onEvent,
    onConnectionChange,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);

  const {
    setConnectionStatus,
    setSessionId,
    addEvent,
    connectionStatus,
    sessionId,
  } = useBriefingStore();

  // Generate or use provided session ID
  const effectiveSessionId =
    providedSessionId ?? sessionId ?? generateSessionId();

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const url = `${wsUrl}/${effectiveSessionId}`;
    console.log(`[Briefings] Connecting to ${url}`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Briefings] Connected');
      setConnectionStatus('connected');
      setSessionId(effectiveSessionId);
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      onConnectionChange?.(true);

      // Send subscription filters if provided
      if (agents?.length || eventTypes?.length) {
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            agents: agents ?? [],
            event_types: eventTypes ?? [],
          })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>;

        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'connected' || data.type === 'subscribed') {
          console.log('[Briefings]', data.type, data);
          return;
        }

        // Check if it's a briefing event
        if (isAgentBriefingEvent(data)) {
          console.log('[Briefings] Event received:', data.type, data.source_agent);
          addEvent(data);
          onEvent?.(data);
        }
      } catch (err) {
        console.error('[Briefings] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('[Briefings] Disconnected:', event.code, event.reason);
      setConnectionStatus('disconnected');
      onConnectionChange?.(false);

      // Auto-reconnect with exponential backoff
      if (!event.wasClean) {
        setConnectionStatus('reconnecting');
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            reconnectDelayRef.current * 2,
            MAX_RECONNECT_DELAY
          );
          connect();
        }, reconnectDelayRef.current);
      }
    };

    ws.onerror = (error) => {
      console.error('[Briefings] WebSocket error:', error);
    };
  }, [
    wsUrl,
    effectiveSessionId,
    agents,
    eventTypes,
    setConnectionStatus,
    setSessionId,
    addEvent,
    onEvent,
    onConnectionChange,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  const setFilters = useCallback(
    (newAgents?: SourceAgent[], newEventTypes?: EventType[]) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            agents: newAgents ?? [],
            event_types: newEventTypes ?? [],
          })
        );
      }
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    setFilters,
  };
}

/**
 * Generate a random session ID.
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Re-export the store hooks for convenience
 */
export {
  useBriefingEvents,
  useConnectionStatus,
  useActiveModal,
  useAgentEvents,
  useRailPulseEvents,
  usePanelInjectEvents,
  useMapHighlightEvents,
} from '@/stores/briefingStore';

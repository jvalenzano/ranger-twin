/**
 * useADKStream - React hook for streaming ADK agent responses
 *
 * Provides a clean interface for connecting to the RANGER ADK orchestrator
 * and receiving real-time agent briefing events.
 *
 * Based on: Implementation Guide Section 3 (React Hook: useADKStream)
 */

import { useState, useCallback, useRef } from 'react';
import { streamADK, type ADKEvent, isRetryableError } from '@/utils/adkClient';
import { ADKEventTransformer } from '@/services/adkEventTransformer';
import type { AgentBriefingEvent } from '@/types/briefing';

/**
 * ADK stream state
 */
export interface ADKStreamState {
  events: AgentBriefingEvent[];
  rawEvents: ADKEvent[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
}

/**
 * ADK stream options
 */
export interface ADKStreamOptions {
  coordinatorUrl?: string;
  userId?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<ADKStreamOptions> = {
  coordinatorUrl: import.meta.env.VITE_ADK_URL || 'http://localhost:8000',
  userId: 'usfs-demo',
  maxRetries: 3,
  retryDelayMs: 1000,
};

/**
 * Hook for streaming ADK agent responses
 *
 * @example
 * ```tsx
 * const { events, isLoading, error, startStream, stopStream } = useADKStream();
 *
 * // Start streaming
 * await startStream("What's the burn severity for Cedar Creek?", "cedar-creek");
 *
 * // Events are populated as they arrive
 * events.forEach(event => console.log(event.source_agent, event.content.summary));
 * ```
 */
export function useADKStream(options?: ADKStreamOptions) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<ADKStreamState>({
    events: [],
    rawEvents: [],
    isLoading: false,
    error: null,
    sessionId: crypto.randomUUID(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const transformerRef = useRef(new ADKEventTransformer());
  const retryCountRef = useRef(0);

  /**
   * Start a new streaming session
   */
  const startStream = useCallback(
    async (query: string, fireId?: string, customSessionId?: string) => {
      // Cancel any existing stream
      abortControllerRef.current?.abort();

      const sessionId = customSessionId || state.sessionId;

      // Reset state
      setState((prev) => ({
        ...prev,
        events: [],
        rawEvents: [],
        isLoading: true,
        error: null,
        sessionId,
      }));

      // Reset transformer
      transformerRef.current.reset(sessionId);
      retryCountRef.current = 0;

      const executeStream = async () => {
        try {
          const controller = await streamADK(
            {
              baseUrl: opts.coordinatorUrl,
              userId: opts.userId,
              onEvent: (adkEvent: ADKEvent) => {
                // Check for errors
                if (adkEvent.error_code) {
                  if (isRetryableError(adkEvent) && retryCountRef.current < opts.maxRetries) {
                    retryCountRef.current++;
                    const delay = opts.retryDelayMs * Math.pow(2, retryCountRef.current - 1);
                    console.warn(`Retrying in ${delay}ms... (attempt ${retryCountRef.current})`);
                    setTimeout(executeStream, delay);
                    return;
                  }

                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: adkEvent.error_message || `Error: ${adkEvent.error_code}`,
                  }));
                  return;
                }

                // Transform and add event
                const briefingEvent = transformerRef.current.transformEvent(adkEvent);

                // Skip null transformations (non-transformable events like heartbeats)
                if (!briefingEvent) {
                  return;
                }

                setState((prev) => ({
                  ...prev,
                  events: [...prev.events, briefingEvent],
                  rawEvents: [...prev.rawEvents, adkEvent],
                }));
              },
              onError: (error: Error) => {
                console.error('Stream error:', error);

                // Retry on network errors
                if (retryCountRef.current < opts.maxRetries) {
                  retryCountRef.current++;
                  const delay = opts.retryDelayMs * Math.pow(2, retryCountRef.current - 1);
                  console.warn(`Retrying in ${delay}ms... (attempt ${retryCountRef.current})`);
                  setTimeout(executeStream, delay);
                  return;
                }

                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                  error: error.message,
                }));
              },
              onComplete: () => {
                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                }));
              },
            },
            {
              session_id: sessionId,
              new_message: query,
              state: fireId ? { fire_id: fireId } : undefined,
            }
          );

          abortControllerRef.current = controller;
        } catch (error) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }));
        }
      };

      await executeStream();
    },
    [opts.coordinatorUrl, opts.userId, opts.maxRetries, opts.retryDelayMs, state.sessionId]
  );

  /**
   * Stop the current stream
   */
  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  /**
   * Clear all events and reset state
   */
  const clearEvents = useCallback(() => {
    setState((prev) => ({
      ...prev,
      events: [],
      rawEvents: [],
      error: null,
    }));
    transformerRef.current.reset();
  }, []);

  /**
   * Start a new session with a fresh ID
   */
  const newSession = useCallback(() => {
    const newSessionId = crypto.randomUUID();
    setState((prev) => ({
      ...prev,
      events: [],
      rawEvents: [],
      error: null,
      sessionId: newSessionId,
    }));
    transformerRef.current.reset(newSessionId);
    return newSessionId;
  }, []);

  return {
    // State
    events: state.events,
    rawEvents: state.rawEvents,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,

    // Actions
    startStream,
    stopStream,
    clearEvents,
    newSession,
  };
}

/**
 * Selector hooks for specific event types
 */
export function useADKEventsByAgent(events: AgentBriefingEvent[], agent: string) {
  return events.filter((e) => e.source_agent === agent);
}

export function useADKLatestEvent(events: AgentBriefingEvent[]) {
  return events[events.length - 1] || null;
}

export function useADKInsights(events: AgentBriefingEvent[]) {
  return events.filter((e) => e.type === 'insight');
}

export function useADKAlerts(events: AgentBriefingEvent[]) {
  return events.filter((e) => e.type === 'alert');
}

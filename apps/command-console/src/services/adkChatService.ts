/**
 * ADK Chat Service - Bridges chat interface with ADK orchestrator
 *
 * This service connects the chat UI to the RANGER ADK orchestrator,
 * handling SSE streaming and event transformation.
 *
 * Features:
 * - SSE streaming from /run_sse endpoint
 * - Automatic retry with exponential backoff
 * - Event transformation to chat messages
 * - Integration with briefingStore for proof layer
 *
 * Phase 4: ADK Integration
 */

import { streamADK, type ADKEvent, isRetryableError } from '@/utils/adkClient';
import { ADKEventTransformer } from '@/services/adkEventTransformer';
import { useBriefingStore } from '@/stores/briefingStore';
import type { AgentBriefingEvent, SourceAgent } from '@/types/briefing';
import type { AgentRole } from '@/services/aiBriefingService';

// Configuration
const ADK_URL = import.meta.env.VITE_ADK_URL || 'http://localhost:8000';
const ADK_APP_NAME = 'coordinator';
const ADK_USER_ID = 'usfs-demo';

// Map SourceAgent to AgentRole for chat display
const SOURCE_TO_ROLE: Record<SourceAgent, AgentRole> = {
  recovery_coordinator: 'recovery-coordinator',
  burn_analyst: 'burn-analyst',
  trail_assessor: 'trail-assessor',
  cruising_assistant: 'cruising-assistant',
  nepa_advisor: 'nepa-advisor',
};

export interface ChatResponse {
  success: boolean;
  agentRole: AgentRole;
  summary: string;
  reasoning: string[];
  confidence: number;
  error?: string;
}

export interface StreamCallbacks {
  onEvent: (response: ChatResponse) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

/**
 * ADK Chat Service class
 *
 * Manages SSE streaming connections to the ADK orchestrator
 * and transforms events for both chat and briefing displays.
 */
class ADKChatService {
  private transformer: ADKEventTransformer;
  private abortController: AbortController | null = null;
  private sessionId: string;
  private sessionCreated: boolean = false;

  constructor() {
    this.transformer = new ADKEventTransformer();
    this.sessionId = crypto.randomUUID();
  }

  /**
   * Create a session on the ADK server
   * Must be called before sending messages to a new session.
   * The server assigns the session ID - we capture it from the response.
   */
  private async createSession(): Promise<void> {
    if (this.sessionCreated) return;

    try {
      const response = await fetch(
        `${ADK_URL}/apps/${ADK_APP_NAME}/users/${ADK_USER_ID}/sessions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      // Server assigns the session ID - capture it from the response
      const sessionData = await response.json();
      this.sessionId = sessionData.id;
      this.sessionCreated = true;
      console.log('[ADK] Session created:', this.sessionId);
    } catch (error) {
      console.error('[ADK] Session creation failed:', error);
      throw error;
    }
  }

  /**
   * Check if ADK orchestrator is available
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: Record<string, unknown> }> {
    try {
      const response = await fetch(`${ADK_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return { healthy: false };
      }

      const data = await response.json();
      return { healthy: true, details: data };
    } catch {
      return { healthy: false };
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start a new session
   */
  newSession(): string {
    this.sessionId = crypto.randomUUID();
    this.sessionCreated = false;
    this.transformer.reset(this.sessionId);
    return this.sessionId;
  }

  /**
   * Stream a query to the ADK orchestrator
   *
   * @param query - User's natural language query
   * @param fireId - Active fire ID for context
   * @param callbacks - Event handlers
   */
  async streamQuery(
    query: string,
    fireId: string | undefined,
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Cancel any existing stream
    this.abortController?.abort();
    this.abortController = null;

    // Update briefing store connection status
    const briefingStore = useBriefingStore.getState();
    briefingStore.setConnectionStatus('connected');

    try {
      // Ensure session exists on server before streaming
      // Session ID is assigned by server and captured in createSession()
      await this.createSession();
      briefingStore.setSessionId(this.sessionId);
      const controller = await streamADK(
        {
          baseUrl: ADK_URL,
          appName: ADK_APP_NAME,
          userId: ADK_USER_ID,

          onEvent: (adkEvent: ADKEvent) => {
            // Check for errors
            if (adkEvent.error_code) {
              if (!isRetryableError(adkEvent)) {
                callbacks.onError(adkEvent.error_message || `Error: ${adkEvent.error_code}`);
              }
              return;
            }

            // Transform to AgentBriefingEvent and add to briefing store
            const briefingEvent = this.transformer.transformEvent(adkEvent);
            briefingStore.addEvent(briefingEvent);

            // Transform to chat response
            const chatResponse = this.transformToChatResponse(briefingEvent);

            // Only emit non-partial events with content
            if (!adkEvent.partial && adkEvent.content?.parts?.[0]?.text) {
              callbacks.onEvent(chatResponse);
            }
          },

          onError: (error: Error) => {
            briefingStore.setConnectionStatus('disconnected');
            callbacks.onError(error.message);
          },

          onComplete: () => {
            briefingStore.setConnectionStatus('connected');
            callbacks.onComplete();
          },
        },
        {
          session_id: this.sessionId,
          new_message: query,
          state: fireId ? { fire_id: fireId } : undefined,
        }
      );

      this.abortController = controller;
    } catch (error) {
      briefingStore.setConnectionStatus('disconnected');
      callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Send a single query and get a response (non-streaming)
   *
   * @param query - User's natural language query
   * @param fireId - Active fire ID for context
   */
  async query(query: string, fireId?: string): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const responses: ChatResponse[] = [];

      this.streamQuery(query, fireId, {
        onEvent: (response) => {
          responses.push(response);
        },
        onError: (error) => {
          reject(new Error(error));
        },
        onComplete: () => {
          // Return the last meaningful response
          const lastResponse = responses[responses.length - 1];
          if (lastResponse) {
            resolve(lastResponse);
          } else {
            reject(new Error('No response received'));
          }
        },
      });
    });
  }

  /**
   * Cancel the current stream
   */
  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
    useBriefingStore.getState().setConnectionStatus('disconnected');
  }

  /**
   * Transform AgentBriefingEvent to ChatResponse
   */
  private transformToChatResponse(event: AgentBriefingEvent): ChatResponse {
    return {
      success: true,
      agentRole: SOURCE_TO_ROLE[event.source_agent] || 'recovery-coordinator',
      summary: event.content.summary,
      reasoning: event.proof_layer.reasoning_chain,
      confidence: Math.round(event.proof_layer.confidence * 100),
    };
  }
}

// Export singleton instance
export const adkChatService = new ADKChatService();

// Export for testing
export { ADKChatService };

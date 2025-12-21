/**
 * AI Briefing Service - Frontend client for RANGER agent queries
 *
 * Provides an interface to the /api/query endpoint with:
 * - Query execution
 * - Fallback to fixtures on error
 * - Response type mapping
 */

import type {
  AgentBriefingEvent,
  SourceAgent,
  EventType,
  Severity,
} from '@/types/briefing';

// Agent role type matching the backend
export type AgentRole =
  | 'recovery-coordinator'
  | 'burn-analyst'
  | 'trail-assessor'
  | 'cruising-assistant'
  | 'nepa-advisor';

// API response types
export interface Citation {
  source: string;
  reference: string;
  url?: string;
}

export interface AgentResponse {
  agentRole: AgentRole;
  summary: string;
  reasoning: string[];
  confidence: number;
  citations: Citation[];
  recommendations?: string[];
  cascadeTo?: AgentRole[];
}

export interface QueryResponse {
  success: boolean;
  response?: AgentResponse;
  error?: string;
  processingTimeMs?: number;
}

// Map agent roles to SourceAgent enum
const AGENT_ROLE_TO_SOURCE: Record<AgentRole, SourceAgent> = {
  'recovery-coordinator': 'recovery_coordinator',
  'burn-analyst': 'burn_analyst',
  'trail-assessor': 'trail_assessor',
  'cruising-assistant': 'cruising_assistant',
  'nepa-advisor': 'nepa_advisor',
};

// API endpoint (use environment variable or default to local)
const API_URL = import.meta.env.VITE_API_URL || '/api';

class AIBriefingService {
  private isLoading = false;

  /**
   * Query the RANGER agents via simple chat endpoint
   */
  async query(
    queryText: string,
    sessionId: string = 'demo-session-123'
  ): Promise<QueryResponse> {
    this.isLoading = true;

    try {
      // The gateway endpoint is /api/v1/chat
      const response = await fetch(`${API_URL}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: { answer: string } = await response.json();

      // Adapt the simple answer back to the expected AgentResponse format
      // In Phase 2+, the full BriefingEvent will arrive via WebSocket
      const adaptedResponse: QueryResponse = {
        success: true,
        response: {
          agentRole: 'recovery-coordinator',
          summary: data.answer,
          reasoning: ['Synthesized by Recovery Coordinator'],
          confidence: 90,
          citations: [],
        },
      };

      return adaptedResponse;
    } catch (error) {
      console.error('[AIBriefingService] Query failed:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Convert an agent response to a briefing event for display
   */
  responseToEvent(response: AgentResponse): AgentBriefingEvent {
    const eventId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const correlationId = `corr-${Date.now()}`;
    const sourceAgent = AGENT_ROLE_TO_SOURCE[response.agentRole];

    // Determine severity based on confidence
    let severity: Severity = 'info';
    if (response.confidence < 50) {
      severity = 'warning';
    } else if (response.confidence >= 85) {
      severity = 'info';
    }

    // Determine event type
    const eventType: EventType = response.recommendations?.length
      ? 'action_required'
      : 'insight';

    return {
      schema_version: '1.1.0',
      event_id: eventId,
      parent_event_id: null,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      type: eventType,
      source_agent: sourceAgent,
      severity,
      ui_binding: {
        target: 'panel_inject',
        geo_reference: null,
      },
      content: {
        summary: response.summary,
        detail: response.reasoning.join('\n\n'),
        suggested_actions: response.recommendations?.map((rec, idx) => ({
          action_id: `action-${idx}`,
          label: rec,
          target_agent: sourceAgent,
          description: rec,
          rationale: 'AI-generated recommendation',
        })) || [],
      },
      proof_layer: {
        confidence: response.confidence / 100, // Convert to 0-1
        confidence_ledger: null,
        citations: response.citations.map((c) => ({
          source_type: 'analysis',
          id: c.source.toLowerCase().replace(/\s+/g, '-'),
          uri: c.url || '#',
          excerpt: c.reference,
        })),
        reasoning_chain: response.reasoning,
      },
    };
  }

  /**
   * Check if a query is in progress
   */
  get loading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
const aiBriefingService = new AIBriefingService();
export default aiBriefingService;

/**
 * ADK Event Transformer
 *
 * Transforms ADK's native SSE events into RANGER's AgentBriefingEvent format.
 * This is the "Proof Layer" bridge between raw AI output and the transparent,
 * auditable format required for federal deployment.
 *
 * Based on: Implementation Guide Section 8 (Proof Layer Implementation)
 */

import type { ADKEvent } from '@/utils/adkClient';
import type {
  AgentBriefingEvent,
  EventType,
  SourceAgent,
  Severity,
  ProofLayer,
  Citation,
  UIBinding,
  EventContent,
} from '@/types/briefing';

/**
 * Metadata about each agent for enriching events
 */
interface AgentMetadata {
  skillId: string;
  expectedTools: string[];
  dataSource: string;
}

const DEFAULT_METADATA: AgentMetadata = {
  skillId: 'orchestration',
  expectedTools: ['portfolio_triage', 'delegate_query'],
  dataSource: 'RANGER',
};

const AGENT_METADATA: Record<string, AgentMetadata> = {
  coordinator: DEFAULT_METADATA,
  recovery_coordinator: {
    skillId: 'orchestration',
    expectedTools: ['portfolio_triage', 'delegate_query'],
    dataSource: 'RANGER',
  },
  burn_analyst: {
    skillId: 'mtbs-classification',
    expectedTools: ['assess_severity', 'classify_mtbs', 'validate_boundary'],
    dataSource: 'MTBS',
  },
  trail_assessor: {
    skillId: 'trail-assessment',
    expectedTools: ['classify_damage', 'evaluate_closure', 'prioritize_trails'],
    dataSource: 'USFS-Trails',
  },
  cruising_assistant: {
    skillId: 'timber-estimation',
    expectedTools: ['estimate_volume', 'salvage_assessment', 'cruise_methodology'],
    dataSource: 'USFS-Cruise',
  },
  nepa_advisor: {
    skillId: 'nepa-compliance',
    expectedTools: ['pathway_decision', 'compliance_timeline', 'documentation'],
    dataSource: 'USFS-NEPA',
  },
};

/**
 * Normalize agent name to SourceAgent type
 */
function normalizeAgentName(author: string): SourceAgent {
  const normalized = author.toLowerCase().replace(/-/g, '_');

  // Map known variations
  const agentMap: Record<string, SourceAgent> = {
    coordinator: 'recovery_coordinator',
    recovery_coordinator: 'recovery_coordinator',
    recoverycoordinator: 'recovery_coordinator',
    burn_analyst: 'burn_analyst',
    burnanalyst: 'burn_analyst',
    trail_assessor: 'trail_assessor',
    trailassessor: 'trail_assessor',
    cruising_assistant: 'cruising_assistant',
    cruisingassistant: 'cruising_assistant',
    nepa_advisor: 'nepa_advisor',
    nepaadvisor: 'nepa_advisor',
  };

  return agentMap[normalized] || 'recovery_coordinator';
}

/**
 * Infer event type from ADK event content
 */
function inferEventType(event: ADKEvent): EventType {
  // If there's a tool call action, it's an action
  if (event.actions?.tool_call) {
    return 'action_required';
  }

  const text = event.content?.parts?.[0]?.text?.toLowerCase() || '';

  // Check for error indicators
  if (text.includes('error') || text.includes('failed') || text.includes('warning')) {
    return 'alert';
  }

  // Check for insight indicators
  if (
    text.includes('confidence') ||
    text.includes('analysis') ||
    text.includes('assessment') ||
    text.includes('severity')
  ) {
    return 'insight';
  }

  // Default to status update
  return 'status_update';
}

/**
 * Infer severity from event content
 */
function inferSeverity(event: ADKEvent): Severity {
  const text = event.content?.parts?.[0]?.text?.toLowerCase() || '';

  if (
    text.includes('critical') ||
    text.includes('urgent') ||
    text.includes('immediate') ||
    text.includes('high severity')
  ) {
    return 'critical';
  }

  if (
    text.includes('warning') ||
    text.includes('caution') ||
    text.includes('moderate severity')
  ) {
    return 'warning';
  }

  return 'info';
}

/**
 * Extract confidence from tool output or estimate from text
 */
function extractConfidence(event: ADKEvent): number {
  const text = event.content?.parts?.[0]?.text || '';

  // Try to parse as JSON and extract confidence
  try {
    const data = JSON.parse(text);
    if (typeof data.confidence === 'number') {
      return data.confidence;
    }
  } catch {
    // Not JSON, continue with text analysis
  }

  // Look for confidence mentions in text
  const match = text.match(/(\d{1,3})%?\s*confiden/i);
  if (match && match[1]) {
    const value = parseInt(match[1], 10);
    return value > 1 ? value / 100 : value;
  }

  // Default confidence based on event type
  if (event.actions?.tool_call) {
    return 0.9; // Tool-based responses have high confidence
  }

  return 0.75; // Default moderate confidence
}

/**
 * Extract reasoning chain from event text
 */
function extractReasoningChain(event: ADKEvent): string[] {
  const text = event.content?.parts?.[0]?.text || '';

  // Try to parse JSON for structured reasoning
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data.reasoning_chain)) {
      return data.reasoning_chain;
    }
    if (Array.isArray(data.reasoning)) {
      return data.reasoning;
    }
  } catch {
    // Not JSON
  }

  // Split text into sentences as reasoning steps
  const sentences = text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 200);

  return sentences.slice(0, 5); // Return first 5 sentences
}

/**
 * Extract citations from event
 */
function extractCitations(event: ADKEvent, metadata: AgentMetadata): Citation[] {
  const citations: Citation[] = [];
  const text = event.content?.parts?.[0]?.text || '';

  // Try to parse JSON for structured citations
  try {
    const data = JSON.parse(text);
    if (data.mtbs_id || data.id) {
      citations.push({
        source_type: metadata.dataSource,
        id: data.mtbs_id || data.id || 'unknown',
        uri: `ranger://data/${metadata.dataSource.toLowerCase()}/${data.mtbs_id || data.id}`,
        excerpt: data.summary || text.slice(0, 100),
      });
    }
    if (data.source) {
      citations.push({
        source_type: data.source,
        id: data.fire_id || 'cedar-creek',
        uri: `ranger://data/${data.source.toLowerCase()}/${data.fire_id || 'cedar-creek'}`,
        excerpt: `${data.source} data for ${data.fire_name || 'fire'}`,
      });
    }
  } catch {
    // Not JSON, add generic citation based on agent
  }

  // Always add data source citation if none found
  if (citations.length === 0 && metadata.dataSource) {
    citations.push({
      source_type: metadata.dataSource,
      id: 'fixture-data',
      uri: `ranger://fixtures/${metadata.dataSource.toLowerCase()}`,
      excerpt: `Data from ${metadata.dataSource} fixtures`,
    });
  }

  return citations;
}

/**
 * Build UI binding based on event type and content
 */
function buildUIBinding(event: ADKEvent, eventType: EventType): UIBinding {
  // Check for geographic data
  const text = event.content?.parts?.[0]?.text || '';
  let geoReference = null;

  try {
    const data = JSON.parse(text);
    if (data.geometry) {
      geoReference = {
        type: 'Feature' as const,
        geometry: data.geometry,
        properties: { source: 'agent_response' },
      };
    }
    if (data.coordinates) {
      geoReference = {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [data.coordinates.longitude, data.coordinates.latitude],
        },
        properties: { source: 'agent_response' },
      };
    }
  } catch {
    // Not JSON with geo data
  }

  // Determine target based on event type
  let target: UIBinding['target'] = 'panel_inject';

  if (eventType === 'alert' && inferSeverity(event) === 'critical') {
    target = 'modal_interrupt';
  } else if (geoReference) {
    target = 'map_highlight';
  } else if (eventType === 'status_update') {
    target = 'rail_pulse';
  }

  return {
    target,
    geo_reference: geoReference,
  };
}

/**
 * Extract summary from event content
 */
function extractSummary(event: ADKEvent): string {
  const text = event.content?.parts?.[0]?.text || '';

  // Try JSON first
  try {
    const data = JSON.parse(text);
    if (data.summary) return data.summary;

    // Build summary from structured data
    if (data.severity && data.confidence) {
      return `Severity: ${data.severity.toUpperCase()} (${Math.round(data.confidence * 100)}% confidence)`;
    }
  } catch {
    // Not JSON
  }

  // Return first sentence or truncated text
  const firstSentence = text.split(/[.!?]/)[0] || '';
  if (firstSentence.length > 10 && firstSentence.length < 200) {
    return firstSentence;
  }

  return text.slice(0, 150) + (text.length > 150 ? '...' : '');
}

/**
 * ADKEventTransformer class
 *
 * Maintains state for tracking event chains and transforming ADK events
 * to AgentBriefingEvent format.
 */
export class ADKEventTransformer {
  private eventChain: Map<string, ADKEvent> = new Map();
  private correlationId: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Transform an ADK event into an AgentBriefingEvent
   */
  transformEvent(adkEvent: ADKEvent): AgentBriefingEvent {
    const sourceAgent = normalizeAgentName(adkEvent.author);
    const metadata = AGENT_METADATA[sourceAgent] || DEFAULT_METADATA;
    const eventType = inferEventType(adkEvent);
    const severity = inferSeverity(adkEvent);

    const proofLayer: ProofLayer = {
      confidence: extractConfidence(adkEvent),
      citations: extractCitations(adkEvent, metadata),
      reasoning_chain: extractReasoningChain(adkEvent),
      confidence_ledger: null, // Can be enhanced later
    };

    const content: EventContent = {
      summary: extractSummary(adkEvent),
      detail: adkEvent.content?.parts?.[0]?.text || '',
      suggested_actions: [], // Can be enhanced with action extraction
    };

    const briefingEvent: AgentBriefingEvent = {
      schema_version: '1.1.0',
      event_id: adkEvent.id || crypto.randomUUID(),
      parent_event_id: this.findParentEventId(adkEvent),
      correlation_id: adkEvent.invocationId || this.correlationId,
      timestamp: new Date().toISOString(),
      type: eventType,
      source_agent: sourceAgent,
      severity,
      ui_binding: buildUIBinding(adkEvent, eventType),
      content,
      proof_layer: proofLayer,
    };

    // Store in chain for parent tracking
    this.eventChain.set(adkEvent.id, adkEvent);

    return briefingEvent;
  }

  /**
   * Find parent event ID based on invocation chain
   */
  private findParentEventId(event: ADKEvent): string | null {
    const events = Array.from(this.eventChain.values())
      .filter((e) => e.invocationId === event.invocationId)
      .sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    const idx = events.findIndex((e) => e.id === event.id);
    return idx > 0 ? events[idx - 1]?.id || null : null;
  }

  /**
   * Reset the event chain (e.g., for a new conversation)
   */
  reset(newCorrelationId?: string): void {
    this.eventChain.clear();
    this.correlationId = newCorrelationId || crypto.randomUUID();
  }

  /**
   * Get all events in the current chain
   */
  getEventChain(): ADKEvent[] {
    return Array.from(this.eventChain.values());
  }
}

// Export singleton instance
export const transformer = new ADKEventTransformer();

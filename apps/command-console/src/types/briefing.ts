/**
 * RANGER AgentBriefingEvent TypeScript Types
 *
 * TypeScript equivalent of the Python Pydantic models in:
 * packages/agent-common/agent_common/types/briefing.py
 *
 * Schema Version: 1.1.0
 * Reference: docs/architecture/AGENT-MESSAGING-PROTOCOL.md
 */

/**
 * Type of briefing event.
 */
export type EventType = 'alert' | 'insight' | 'action_required' | 'status_update';

/**
 * Severity level of the event.
 */
export type Severity = 'info' | 'warning' | 'critical';

/**
 * UI binding target for the event.
 * Defines where and how the event should be rendered in the Command Console.
 */
export type UITarget = 'map_highlight' | 'rail_pulse' | 'panel_inject' | 'modal_interrupt';

/**
 * Agent that generated the event.
 * Matches the RANGER agent crew hierarchy.
 */
export type SourceAgent =
  | 'recovery_coordinator'
  | 'burn_analyst'
  | 'trail_assessor'
  | 'cruising_assistant'
  | 'nepa_advisor';

/**
 * GeoJSON Geometry types supported.
 */
export type GeoJSONGeometryType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';

/**
 * GeoJSON Geometry object.
 */
export interface GeoJSONGeometry {
  type: GeoJSONGeometryType;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

/**
 * GeoJSON Feature for spatial context.
 * Used to bind events to geographic locations on the map.
 */
export interface GeoReference {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

/**
 * Binding between an event and a UI rendering target.
 * Tells the Command Console HOW to display this event.
 */
export interface UIBinding {
  target: UITarget;
  geo_reference?: GeoReference | null;
}

/**
 * An action suggested by the agent for user or cross-agent execution.
 * Enables the "handoff" pattern where one agent suggests work for another.
 */
export interface SuggestedAction {
  action_id: string;
  label: string;
  target_agent: SourceAgent;
  description: string;
  rationale: string;
}

/**
 * The substantive content of a briefing event.
 * Contains the "what" and "what to do about it".
 */
export interface EventContent {
  summary: string;
  detail: string;
  suggested_actions: SuggestedAction[];
}

/**
 * A citation to an authoritative source.
 * Part of the "Proof Layer" for anti-hallucination and federal compliance.
 */
export interface Citation {
  source_type: string;
  id: string;
  uri: string;
  excerpt: string;
}

/**
 * Data confidence tier classification.
 * From workshop Confidence Ledger pattern:
 * - Tier 1 (90%+): Direct use, no hedging
 * - Tier 2 (70-85%): Caution-flagged, human decision pending
 * - Tier 3 (<70%): Demo only, synthetic
 */
export type DataTier = 1 | 2 | 3;

/**
 * Confidence metadata for a single input data source.
 * Part of the Confidence Ledger pattern for granular transparency.
 */
export interface InputConfidence {
  source: string;
  confidence: number; // 0-1
  tier: DataTier;
  notes?: string;
}

/**
 * The Confidence Ledger - Per-input confidence tracking.
 * Provides granular transparency about data quality across all inputs.
 *
 * From workshop: "Sarah can see this breakdown. Not magic. Not 'AI said do this.'
 * But 'Here's what we know, here's what we're inferring, here's what you decide.'"
 */
export interface ConfidenceLedger {
  inputs: InputConfidence[];
  analysis_confidence: number; // 0-1
  recommendation_confidence: number; // 0-1
}

/**
 * The "Proof Layer" - Anti-hallucination contract.
 * Federal deployment requires absolute transparency.
 */
export interface ProofLayer {
  confidence: number; // 0-1 (overall)
  confidence_ledger?: ConfidenceLedger | null; // Granular per-input tracking
  citations: Citation[];
  reasoning_chain: string[];
}

/**
 * Helper to get tier label for display.
 */
export const DATA_TIER_LABELS: Record<DataTier, string> = {
  1: 'High Confidence',
  2: 'Medium Confidence',
  3: 'Low Confidence',
};

/**
 * Helper to get tier CSS class for styling.
 */
export const DATA_TIER_COLORS: Record<DataTier, string> = {
  1: 'text-safe',
  2: 'text-warning',
  3: 'text-severe',
};

/**
 * The AgentBriefingEvent - Keystone contract for RANGER agentic interface.
 *
 * This is the primary data structure for communication between RANGER agents
 * and the Command Console UI. It ensures that AI intelligence is:
 * - Human-actionable (via ui_binding)
 * - Transparent (via proof_layer)
 * - Traceable (via correlation_id and parent_event_id)
 *
 * Schema Version: 1.1.0
 */
export interface AgentBriefingEvent {
  schema_version: string;
  event_id: string; // UUID
  parent_event_id: string | null; // UUID
  correlation_id: string; // UUID
  timestamp: string; // ISO-8601
  type: EventType;
  source_agent: SourceAgent;
  severity: Severity;
  ui_binding: UIBinding;
  content: EventContent;
  proof_layer: ProofLayer;
}

/**
 * Helper to create a type guard for AgentBriefingEvent.
 */
export function isAgentBriefingEvent(obj: unknown): obj is AgentBriefingEvent {
  if (typeof obj !== 'object' || obj === null) return false;

  const event = obj as Partial<AgentBriefingEvent>;

  return (
    typeof event.event_id === 'string' &&
    typeof event.correlation_id === 'string' &&
    typeof event.timestamp === 'string' &&
    typeof event.type === 'string' &&
    typeof event.source_agent === 'string' &&
    typeof event.severity === 'string' &&
    typeof event.ui_binding === 'object' &&
    typeof event.content === 'object' &&
    typeof event.proof_layer === 'object'
  );
}

/**
 * Helper to map SourceAgent to display name.
 */
export const AGENT_DISPLAY_NAMES: Record<SourceAgent, string> = {
  recovery_coordinator: 'Recovery Coordinator',
  burn_analyst: 'Burn Analyst',
  trail_assessor: 'Trail Assessor',
  cruising_assistant: 'Cruising Assistant',
  nepa_advisor: 'NEPA Advisor',
};

/**
 * Helper to map Severity to CSS color class.
 */
export const SEVERITY_COLORS: Record<Severity, string> = {
  info: 'text-safe',
  warning: 'text-warning',
  critical: 'text-severe',
};

/**
 * Helper to map EventType to icon and style.
 */
export const EVENT_TYPE_STYLES: Record<EventType, { icon: string; className: string }> = {
  alert: { icon: 'AlertTriangle', className: 'text-severe' },
  insight: { icon: 'Lightbulb', className: 'text-safe' },
  action_required: { icon: 'AlertCircle', className: 'text-warning' },
  status_update: { icon: 'Info', className: 'text-text-secondary' },
};

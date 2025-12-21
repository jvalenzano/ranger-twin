/**
 * RANGER Command Console - Type Definitions
 *
 * Core types for the Command Console UI.
 * AgentBriefingEvent types will be added in Track B2.
 */

// Lifecycle phases for the Recovery Coordinator
export type LifecyclePhase = 'IMPACT' | 'DAMAGE' | 'TIMBER' | 'COMPLIANCE';

// Agent identifiers matching the backend
export type AgentId =
  | 'recovery_coordinator'
  | 'burn_analyst'
  | 'trail_assessor'
  | 'cruising_assistant'
  | 'nepa_advisor';

// Severity levels for events and UI states
export type Severity = 'info' | 'warning' | 'critical';

// Map layer types
export type MapLayerType = 'SAT' | 'TER' | 'IR';

// Connection status for WebSocket
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

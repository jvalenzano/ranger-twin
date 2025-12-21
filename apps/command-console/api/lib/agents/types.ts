/**
 * Agent Types - Core type definitions for RANGER agents
 */

export type AgentRole =
  | 'recovery-coordinator'
  | 'burn-analyst'
  | 'trail-assessor'
  | 'cruising-assistant'
  | 'nepa-advisor';

export interface AgentContext {
  // Cedar Creek Fire context
  fireName: string;
  fireLocation: string;
  fireDate: string;
  totalAcres: number;

  // Relevant data based on query
  burnSeverityData?: BurnSeverityZone[];
  trailDamageData?: TrailDamagePoint[];
  timberPlotData?: TimberPlot[];
}

export interface BurnSeverityZone {
  id: string;
  name: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  acres: number;
  dnbrMean: number;
}

export interface TrailDamagePoint {
  id: string;
  trailName: string;
  type: 'BRIDGE_FAILURE' | 'DEBRIS_FLOW' | 'HAZARD_TREES' | 'TREAD_EROSION' | 'SIGNAGE';
  severity: number; // 1-5
  description: string;
  coordinates: [number, number];
}

export interface TimberPlot {
  id: string;
  plotId: string;
  standType: string;
  mbfPerAcre: number;
  salvageValuePerAcre: number;
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW';
  coordinates: [number, number];
}

export interface AgentResponse {
  agentRole: AgentRole;
  summary: string;
  reasoning: string[];
  confidence: number; // 0-100
  citations: Citation[];
  recommendations?: string[];
  cascadeTo?: AgentRole[]; // Other agents to involve
}

export interface Citation {
  source: string;
  reference: string;
  url?: string;
}

export interface QueryRequest {
  query: string;
  context?: Partial<AgentContext>;
  targetAgent?: AgentRole; // If specified, route directly to this agent
}

export interface QueryResponse {
  success: boolean;
  response?: AgentResponse;
  error?: string;
  processingTimeMs?: number;
}

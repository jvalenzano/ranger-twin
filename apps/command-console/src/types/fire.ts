/**
 * Fire Context Types
 *
 * Types for fire selection, context management, and onboarding workflow.
 * Supports both demo mode (pre-composed fixtures) and future live API integration.
 */

/**
 * Data source availability status
 */
export interface DataSourceStatus {
  available: boolean;
  source: string;
  coverage?: number; // 0-1 for partial data
  updated?: string; // ISO date string
  error?: string;
}

/**
 * Fire context - all metadata about a fire event
 */
export interface FireContext {
  /** Unique identifier (e.g., "cedar-creek-2022", "bootleg-2021") */
  fire_id: string;

  /** Display name (e.g., "Cedar Creek Fire") */
  name: string;

  /** Year the fire occurred */
  year: number;

  /** National Forest name */
  forest: string;

  /** Ranger District (optional) */
  district?: string;

  /** State abbreviation */
  state: string;

  /** Total burned acres */
  acres: number;

  /** Map center coordinates [longitude, latitude] */
  centroid: [number, number];

  /** Map bounds [[sw_lng, sw_lat], [ne_lng, ne_lat]] */
  bounds?: [[number, number], [number, number]];

  /** Fire status */
  status: 'active' | 'contained' | 'archived';

  /** Data availability by source */
  data_status: {
    perimeter: DataSourceStatus;
    burn_severity: DataSourceStatus;
    trail_damage: DataSourceStatus;
    timber_plots: DataSourceStatus;
  };

  /** Whether this is a demo/mock fire or from live data */
  isDemo: boolean;

  /** Path to fixtures directory (for demo fires) */
  fixturesPath?: string;
}

/**
 * Agent types in the RANGER system
 */
export type AgentType =
  | 'burn_analyst'
  | 'trail_assessor'
  | 'cruising_assistant'
  | 'nepa_advisor'
  | 'recovery_coordinator';

/**
 * Agent progress state during onboarding
 */
export interface AgentProgressState {
  status: 'pending' | 'working' | 'complete' | 'error';
  message: string;
  progress?: number; // 0-100
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

/**
 * Onboarding wizard state
 */
export interface OnboardingState {
  /** Whether the wizard is open */
  isOpen: boolean;

  /** Current step (0-indexed) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** User input for new fire */
  fireInput: Partial<FireContext>;

  /** Progress of each agent during initialization */
  agentProgress: Record<AgentType, AgentProgressState>;

  /** Overall onboarding error */
  error?: string;

  /** Whether onboarding is complete */
  isComplete: boolean;
}

/**
 * Wizard step definition
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

/**
 * Pre-configured demo fires
 */
export const DEMO_FIRES: FireContext[] = [
  {
    fire_id: 'cedar-creek-2022',
    name: 'Cedar Creek Fire',
    year: 2022,
    forest: 'Willamette National Forest',
    state: 'OR',
    acres: 127000,
    centroid: [-122.167, 43.726],
    bounds: [
      [-122.35, 43.55],
      [-121.95, 43.85],
    ],
    status: 'contained',
    data_status: {
      perimeter: { available: true, source: 'NIFC', updated: '2022-10-15' },
      burn_severity: { available: true, source: 'MTBS', updated: '2023-03-01' },
      trail_damage: { available: true, source: 'TRACS', coverage: 1.0 },
      timber_plots: { available: true, source: 'FSVeg', coverage: 1.0 },
    },
    isDemo: true,
    fixturesPath: 'cedar-creek',
  },
  {
    fire_id: 'bootleg-2021',
    name: 'Bootleg Fire',
    year: 2021,
    forest: 'Fremont-Winema National Forest',
    state: 'OR',
    acres: 413765,
    centroid: [-121.35, 42.45],
    bounds: [
      [-121.7, 42.1],
      [-121.0, 42.8],
    ],
    status: 'contained',
    data_status: {
      perimeter: { available: true, source: 'NIFC', updated: '2021-11-01' },
      burn_severity: { available: true, source: 'MTBS', updated: '2022-04-15' },
      trail_damage: { available: true, source: 'TRACS', coverage: 0.8 },
      timber_plots: { available: true, source: 'FSVeg', coverage: 0.7 },
    },
    isDemo: true,
    fixturesPath: 'bootleg',
  },
];

/**
 * Default fire context (Cedar Creek)
 * Using non-null assertion since DEMO_FIRES is a compile-time constant array
 */
export const DEFAULT_FIRE: FireContext = DEMO_FIRES[0]!;

/**
 * Initial agent progress state (all pending)
 */
export const INITIAL_AGENT_PROGRESS: Record<AgentType, AgentProgressState> = {
  burn_analyst: { status: 'pending', message: 'Waiting to start...' },
  trail_assessor: { status: 'pending', message: 'Waiting for burn analysis...' },
  cruising_assistant: { status: 'pending', message: 'Waiting for damage assessment...' },
  nepa_advisor: { status: 'pending', message: 'Ready (FSM/FSH indexed)' },
  recovery_coordinator: { status: 'pending', message: 'Waiting for all agents...' },
};

/**
 * Onboarding wizard steps
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'identification',
    title: 'Fire Identification',
    description: 'Enter fire details or search IRWIN database',
  },
  {
    id: 'data-check',
    title: 'Data Availability',
    description: 'Checking available data sources',
  },
  {
    id: 'agent-progress',
    title: 'Agent Analysis',
    description: 'Agents are analyzing the fire',
  },
  {
    id: 'completion',
    title: 'Analysis Complete',
    description: 'Your fire dashboard is ready',
  },
];

/**
 * Agent display metadata
 */
export const AGENT_DISPLAY: Record<
  AgentType,
  { name: string; icon: string; color: string; description: string }
> = {
  burn_analyst: {
    name: 'Burn Analyst',
    icon: '🔥',
    color: '#ef4444',
    description: 'Analyzing burn severity from MTBS satellite data',
  },
  trail_assessor: {
    name: 'Trail Assessor',
    icon: '🥾',
    color: '#f59e0b',
    description: 'Correlating trail network with burn patterns',
  },
  cruising_assistant: {
    name: 'Cruising Assistant',
    icon: '🌲',
    color: '#10b981',
    description: 'Identifying timber salvage priorities',
  },
  nepa_advisor: {
    name: 'NEPA Advisor',
    icon: '📋',
    color: '#a855f7',
    description: 'Generating compliance requirements',
  },
  recovery_coordinator: {
    name: 'Recovery Coordinator',
    icon: '🎯',
    color: '#06b6d4',
    description: 'Synthesizing recovery plan',
  },
};

/**
 * Mission Control Types
 *
 * Types for the National Mission Control dashboard - portfolio view
 * of multiple fires across USFS regions.
 */

/**
 * Fire phase in the recovery lifecycle
 */
export type FirePhase = 'active' | 'in_baer' | 'in_recovery';

/**
 * Fire severity classification
 */
export type FireSeverity = 'low' | 'moderate' | 'high' | 'critical';

/**
 * USFS Region numbers (1-6 plus others)
 */
export type USFSRegion = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * View mode for the application
 */
export type ViewMode = 'NATIONAL' | 'TACTICAL';

/**
 * Mission Stack navigation view
 */
export type MissionStackView = 'national' | 'watchlist' | 'incident';

/**
 * National fire data for portfolio view
 */
export interface NationalFire {
  /** Unique identifier */
  id: string;

  /** Display name (e.g., "Cedar Creek Fire") */
  name: string;

  /** USFS Region (1-6) */
  region: USFSRegion;

  /** State abbreviation */
  state: string;

  /** Fire phase in recovery lifecycle */
  phase: FirePhase;

  /** Overall severity classification */
  severity: FireSeverity;

  /** Total burned acres */
  acres: number;

  /** Containment percentage (0-100) */
  containment: number;

  /** Map center coordinates [longitude, latitude] */
  coordinates: [number, number];

  /** Map bounds [[sw_lng, sw_lat], [ne_lng, ne_lat]] */
  bounds: [[number, number], [number, number]];

  /** Computed triage priority score */
  triageScore: number;

  /** Fire start date (ISO string) */
  startDate: string;

  /** Last data update (ISO string) */
  lastUpdated: string;

  /** Whether full fixture data is available for tactical view */
  hasFixtures: boolean;

  /** Matching fire_id in fireContextStore (for fires with fixtures) */
  fixtureFireId?: string;
}

/**
 * Filter state for the incident list
 */
export interface MissionFilters {
  /** Filter by fire phases */
  phases: FirePhase[];

  /** Filter by USFS regions */
  regions: USFSRegion[];

  /** Search query for fire name */
  searchQuery: string;
}

/**
 * National camera state (separate from tactical mapStore)
 */
export interface NationalCamera {
  /** Map center [longitude, latitude] */
  center: [number, number];

  /** Zoom level */
  zoom: number;
}

/**
 * Camera transition state during view switches
 */
export type TransitionState = 'idle' | 'swooping_in' | 'swooping_out';

/**
 * Default filter state (show all)
 */
export const DEFAULT_MISSION_FILTERS: MissionFilters = {
  phases: ['active', 'in_baer', 'in_recovery'],
  regions: [1, 2, 3, 4, 5, 6],
  searchQuery: '',
};

/**
 * Default national camera (continental US view)
 */
export const DEFAULT_NATIONAL_CAMERA: NationalCamera = {
  center: [-98.5795, 39.8283], // Geographic center of contiguous US
  zoom: 3.5,
};

/**
 * Phase display metadata
 */
export const PHASE_DISPLAY: Record<
  FirePhase,
  { label: string; color: string; bgColor: string }
> = {
  active: {
    label: 'Active',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
  in_baer: {
    label: 'In BAER',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  in_recovery: {
    label: 'In Recovery',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
};

/**
 * Severity display metadata
 */
export const SEVERITY_DISPLAY: Record<
  FireSeverity,
  { label: string; color: string; weight: number }
> = {
  critical: { label: 'Critical', color: '#dc2626', weight: 4 },
  high: { label: 'High', color: '#ef4444', weight: 3 },
  moderate: { label: 'Moderate', color: '#f59e0b', weight: 2 },
  low: { label: 'Low', color: '#10b981', weight: 1 },
};

/**
 * USFS Region display metadata
 */
export const REGION_DISPLAY: Record<
  USFSRegion,
  { name: string; states: string[] }
> = {
  1: { name: 'Northern', states: ['MT', 'ND', 'ID'] },
  2: { name: 'Rocky Mountain', states: ['CO', 'WY', 'SD', 'NE', 'KS'] },
  3: { name: 'Southwestern', states: ['AZ', 'NM'] },
  4: { name: 'Intermountain', states: ['UT', 'NV', 'ID', 'WY'] },
  5: { name: 'Pacific Southwest', states: ['CA', 'HI'] },
  6: { name: 'Pacific Northwest', states: ['OR', 'WA'] },
};

/**
 * Calculate triage score for a fire
 *
 * Formula: severityWeight × (acres/10000) × phaseMultiplier
 * Higher scores = higher priority
 */
export function calculateTriageScore(
  severity: FireSeverity,
  acres: number,
  phase: FirePhase
): number {
  const severityWeight = SEVERITY_DISPLAY[severity].weight;
  const acresNormalized = Math.min(acres / 10000, 50); // Cap at 500k acres
  const phaseMultiplier =
    phase === 'active' ? 2.0 : phase === 'in_baer' ? 1.5 : 1.0;

  return Math.round(severityWeight * acresNormalized * phaseMultiplier * 10) / 10;
}

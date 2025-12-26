/**
 * Command View Types
 *
 * Types for the National Command dashboard - portfolio view
 * of multiple fires across USFS regions.
 */

/**
 * Fire phase in the recovery lifecycle
 * 4-phase model based on practitioner feedback:
 * - active: Fire is burning
 * - baer_assessment: 7-day BAER team assessment window
 * - baer_implementation: BAER treatments being implemented
 * - in_restoration: Long-term restoration/rehabilitation
 */
export type FirePhase = 'active' | 'baer_assessment' | 'baer_implementation' | 'in_restoration';

/**
 * Delta direction for triage score changes (24h comparison)
 */
export type DeltaDirection = 'up' | 'down' | 'stable';

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
 * Sort options for incident list
 */
export type SortOption = 'priority' | 'newest' | 'largest' | 'name';

/**
 * Sort display metadata
 */
export const SORT_DISPLAY: Record<SortOption, { label: string; icon: string }> = {
  priority: { label: 'Priority', icon: 'TrendingUp' },
  newest: { label: 'Newest', icon: 'Clock' },
  largest: { label: 'Largest', icon: 'Maximize' },
  name: { label: 'Name A-Z', icon: 'ArrowDownAZ' },
};

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

  /** Whether full fixture data is available for Tactical view */
  hasFixtures: boolean;

  /** Matching fire_id in fireContextStore (for fires with fixtures) */
  fixtureFireId?: string;

  /** Previous triage score (24h ago) for delta tracking */
  previousTriageScore?: number;

  /** Percentile rank in current portfolio (0-100, higher = more priority) */
  percentileRank?: number;
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

  /** Sort order for results */
  sortBy: SortOption;
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
  phases: ['active', 'baer_assessment', 'baer_implementation', 'in_restoration'],
  regions: [1, 2, 3, 4, 5, 6],
  searchQuery: '',
  sortBy: 'priority',
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
 * Includes abbreviations for compact UI (e.g., sidebar collapsed mode)
 */
export const PHASE_DISPLAY: Record<
  FirePhase,
  { label: string; abbrev: string; color: string; bgColor: string }
> = {
  active: {
    label: 'Active',
    abbrev: 'ACT',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
  baer_assessment: {
    label: 'BAER Assessment',
    abbrev: 'ASM',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  baer_implementation: {
    label: 'BAER Implementation',
    abbrev: 'IMP',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.2)',
  },
  in_restoration: {
    label: 'In Restoration',
    abbrev: 'RST',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
};

/**
 * Phase colors for map dots and card indicators
 * Single source of truth - use these to ensure dot/card colors match
 * Progression: Red → Amber → Yellow → Green (urgency decreasing)
 */
export const PHASE_COLORS: Record<FirePhase, string> = {
  active: '#ef4444',            // Red - fire is burning
  baer_assessment: '#f59e0b',   // Amber - 7-day assessment window
  baer_implementation: '#eab308', // Yellow - treatments underway
  in_restoration: '#10b981',    // Green - long-term restoration
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
 * Phase multipliers for triage score calculation
 * Based on time-criticality:
 * - active: Fire burning, highest urgency
 * - baer_assessment: 7-day window, very time-critical
 * - baer_implementation: Work underway, moderate urgency
 * - in_restoration: Long-term, baseline priority
 */
export const PHASE_MULTIPLIERS: Record<FirePhase, number> = {
  active: 2.0,
  baer_assessment: 1.75,
  baer_implementation: 1.25,
  in_restoration: 1.0,
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
  const phaseMultiplier = PHASE_MULTIPLIERS[phase];

  return Math.round(severityWeight * acresNormalized * phaseMultiplier * 10) / 10;
}

/**
 * Get delta direction from current vs previous triage score
 * Threshold of 0.5 to avoid noise from minor fluctuations
 */
export function getDeltaDirection(current: number, previous?: number): DeltaDirection {
  if (previous === undefined) return 'stable';
  const delta = current - previous;
  if (delta > 0.5) return 'up';
  if (delta < -0.5) return 'down';
  return 'stable';
}

/**
 * Calculate the delta value between current and previous score
 */
export function getTriageDelta(current: number, previous?: number): number {
  if (previous === undefined) return 0;
  return Math.round((current - previous) * 10) / 10;
}

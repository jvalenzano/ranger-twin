/**
 * Fire Data Provider Interface
 *
 * Defines the contract for fire data sources. Implementations include:
 * - MockFireProvider: Phase 1 simulated data
 * - NIFCFireProvider: Real NIFC fire perimeter data
 *
 * This abstraction enables feature-flag-based switching between data sources
 * and provides a consistent API for consumers.
 */

import type {
  NationalFire,
  FirePhase,
  USFSRegion,
  MissionFilters,
  SortOption,
} from '@/types/mission';

// =============================================================================
// Types
// =============================================================================

/**
 * Data source identifier
 */
export type DataSource = 'mock' | 'nifc' | 'cached';

/**
 * Provider health/status information
 */
export interface ProviderStatus {
  /** Is the provider ready to serve data? */
  isReady: boolean;
  /** Current data source */
  dataSource: DataSource;
  /** When was data last fetched/updated? */
  lastUpdated: Date | null;
  /** Number of fires available */
  fireCount: number;
  /** Any error messages */
  error?: string;
}

/**
 * Summary statistics for the fire portfolio
 */
export interface FireStatistics {
  total: number;
  byPhase: Record<FirePhase, number>;
  byRegion: Record<USFSRegion, number>;
  totalAcres: number;
  avgContainment: number;
}

// =============================================================================
// Interface
// =============================================================================

/**
 * Fire Data Provider Interface
 *
 * All fire data sources must implement this interface to be used
 * by the nationalFireService factory.
 */
export interface FireDataProvider {
  /**
   * Initialize the provider (fetch initial data)
   * Should be called once before using other methods.
   */
  initialize(): Promise<void>;

  /**
   * Get all fires
   */
  getAllFires(): NationalFire[];

  /**
   * Get fires filtered by criteria
   */
  getFilteredFires(filters: MissionFilters): NationalFire[];

  /**
   * Get a specific fire by ID
   */
  getFireById(id: string): NationalFire | undefined;

  /**
   * Get fires by phase
   */
  getFiresByPhase(phase: FirePhase): NationalFire[];

  /**
   * Get fires by USFS region
   */
  getFiresByRegion(region: USFSRegion): NationalFire[];

  /**
   * Get fires that have fixture data (can enter tactical view)
   */
  getFiresWithFixtures(): NationalFire[];

  /**
   * Get summary statistics
   */
  getStatistics(): FireStatistics;

  /**
   * Check if provider is ready
   */
  isReady(): boolean;

  /**
   * Get current data source
   */
  getDataSource(): DataSource;

  /**
   * Get last update timestamp
   */
  getLastUpdated(): Date | null;

  /**
   * Get detailed provider status
   */
  getStatus(): ProviderStatus;

  /**
   * Force refresh data from source
   */
  refresh(): Promise<void>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate statistics from a list of fires
 */
export function calculateStatistics(fires: NationalFire[]): FireStatistics {
  const byPhase: Record<FirePhase, number> = {
    active: 0,
    baer_assessment: 0,
    baer_implementation: 0,
    in_restoration: 0,
  };

  const byRegion: Record<USFSRegion, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  let totalAcres = 0;
  let totalContainment = 0;

  for (const fire of fires) {
    byPhase[fire.phase]++;
    byRegion[fire.region]++;
    totalAcres += fire.acres;
    totalContainment += fire.containment;
  }

  return {
    total: fires.length,
    byPhase,
    byRegion,
    totalAcres,
    avgContainment: fires.length > 0 ? Math.round(totalContainment / fires.length) : 0,
  };
}

/**
 * Sort fires by the specified sort option
 */
export function sortFires(fires: NationalFire[], sortBy: SortOption): NationalFire[] {
  const sorted = [...fires];

  switch (sortBy) {
    case 'priority':
      // Higher triage score = higher priority (descending)
      return sorted.sort((a, b) => b.triageScore - a.triageScore);
    case 'newest':
      // Most recent start date first (descending)
      return sorted.sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    case 'largest':
      // Largest acres first (descending)
      return sorted.sort((a, b) => b.acres - a.acres);
    case 'name':
      // Alphabetical by name (ascending)
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

/**
 * Apply filters and sorting to a list of fires
 */
export function applyFilters(
  fires: NationalFire[],
  filters: MissionFilters
): NationalFire[] {
  // First filter
  const filtered = fires.filter((fire) => {
    // Phase filter (if phases array is not empty or not all 4 phases)
    if (filters.phases.length > 0 && filters.phases.length < 4) {
      if (!filters.phases.includes(fire.phase)) {
        return false;
      }
    }

    // Region filter (if regions array is not empty or not all regions)
    if (filters.regions.length > 0 && filters.regions.length < 6) {
      if (!filters.regions.includes(fire.region)) {
        return false;
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = fire.name.toLowerCase().includes(query);
      const matchesState = fire.state.toLowerCase().includes(query);
      if (!matchesName && !matchesState) {
        return false;
      }
    }

    return true;
  });

  // Then sort
  return sortFires(filtered, filters.sortBy);
}

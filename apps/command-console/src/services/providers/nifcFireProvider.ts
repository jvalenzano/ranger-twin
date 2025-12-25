/**
 * NIFC Fire Provider
 *
 * Implements FireDataProvider using real NIFC fire perimeter data.
 * Falls back to cached data on API errors, then to mock data as last resort.
 *
 * Philosophy: "Nerve Center, Not Sensors"
 * We consume authoritative NIFC data rather than building our own fire tracking.
 */

import type { NationalFire, FirePhase, USFSRegion, MissionFilters } from '@/types/mission';
import { calculateTriageScore } from '@/types/mission';
import type {
  FireDataProvider,
  DataSource,
  ProviderStatus,
  FireStatistics,
} from './fireDataProvider';
import { calculateStatistics, applyFilters } from './fireDataProvider';
import { getNationalFires, clearCache as clearNifcCache, getCacheStatus } from '../nifcService';

// =============================================================================
// Demo Fires with Fixtures
// =============================================================================

/**
 * These fires have full tactical data (fixtures) and can enter tactical view.
 * They are merged with NIFC data to ensure demo functionality works.
 */
const DEMO_FIRES: NationalFire[] = [
  {
    id: 'fire-cedar-creek',
    name: 'Cedar Creek Fire',
    region: 6,
    state: 'OR',
    phase: 'in_recovery',
    severity: 'high',
    acres: 127000,
    containment: 100,
    coordinates: [-122.167, 43.726],
    bounds: [
      [-122.35, 43.55],
      [-121.95, 43.85],
    ],
    triageScore: calculateTriageScore('high', 127000, 'in_recovery'),
    startDate: '2022-08-01',
    lastUpdated: new Date().toISOString(),
    hasFixtures: true,
    fixtureFireId: 'cedar-creek-2022',
  },
  {
    id: 'fire-bootleg',
    name: 'Bootleg Fire',
    region: 6,
    state: 'OR',
    phase: 'in_recovery',
    severity: 'critical',
    acres: 413765,
    containment: 100,
    coordinates: [-121.35, 42.45],
    bounds: [
      [-121.7, 42.1],
      [-121.0, 42.8],
    ],
    triageScore: calculateTriageScore('critical', 413765, 'in_recovery'),
    startDate: '2021-07-06',
    lastUpdated: new Date().toISOString(),
    hasFixtures: true,
    fixtureFireId: 'bootleg-2021',
  },
];

// =============================================================================
// NIFC Fire Provider Class
// =============================================================================

export class NIFCFireProvider implements FireDataProvider {
  private fires: NationalFire[] = [];
  private isLoaded = false;
  private lastUpdated: Date | null = null;
  private dataSource: DataSource = 'nifc';
  private error: string | undefined;

  /**
   * Initialize provider - fetch NIFC data
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    console.log('[NIFCFireProvider] Initializing...');

    try {
      // Fetch from NIFC API
      const nifcFires = await getNationalFires();

      // Merge with demo fires (ensuring demo fires are available)
      this.fires = this.mergeWithDemoFires(nifcFires);

      // Sort by triage score
      this.fires.sort((a, b) => b.triageScore - a.triageScore);

      this.dataSource = 'nifc';
      this.lastUpdated = new Date();
      this.isLoaded = true;
      this.error = undefined;

      console.log(`[NIFCFireProvider] Loaded ${this.fires.length} fires from NIFC`);
    } catch (error) {
      console.error('[NIFCFireProvider] Failed to fetch NIFC data:', error);

      // Check if we have cached data
      const cacheStatus = getCacheStatus();
      if (cacheStatus.hasCache) {
        console.log('[NIFCFireProvider] Using cached data');
        this.dataSource = 'cached';
        // Re-attempt with potentially stale cache
        try {
          const cachedFires = await getNationalFires();
          this.fires = this.mergeWithDemoFires(cachedFires);
          this.fires.sort((a, b) => b.triageScore - a.triageScore);
          this.isLoaded = true;
          this.error = 'Using cached data (API unavailable)';
        } catch {
          this.fallbackToMock(error);
        }
      } else {
        this.fallbackToMock(error);
      }
    }
  }

  /**
   * Fall back to mock data when NIFC is unavailable
   */
  private fallbackToMock(error: unknown): void {
    console.warn('[NIFCFireProvider] Falling back to demo fires only');
    this.fires = [...DEMO_FIRES];
    this.fires.sort((a, b) => b.triageScore - a.triageScore);
    this.dataSource = 'mock';
    this.isLoaded = true;
    this.error = `NIFC unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  /**
   * Merge NIFC fires with demo fires
   * Ensures demo fires are always present and prioritized
   */
  private mergeWithDemoFires(nifcFires: NationalFire[]): NationalFire[] {
    // Remove any NIFC fires that match demo fire names (avoid duplicates)
    const demoNames = new Set(DEMO_FIRES.map((f) => f.name.toLowerCase()));
    const filteredNifc = nifcFires.filter(
      (f) => !demoNames.has(f.name.toLowerCase())
    );

    // Merge: demo fires first (they have fixtures), then NIFC fires
    return [...DEMO_FIRES, ...filteredNifc];
  }

  /**
   * Get all fires
   */
  getAllFires(): NationalFire[] {
    return [...this.fires];
  }

  /**
   * Get filtered fires
   */
  getFilteredFires(filters: MissionFilters): NationalFire[] {
    return applyFilters(this.fires, filters);
  }

  /**
   * Get fire by ID
   */
  getFireById(id: string): NationalFire | undefined {
    return this.fires.find((f) => f.id === id);
  }

  /**
   * Get fires by phase
   */
  getFiresByPhase(phase: FirePhase): NationalFire[] {
    return this.fires.filter((f) => f.phase === phase);
  }

  /**
   * Get fires by region
   */
  getFiresByRegion(region: USFSRegion): NationalFire[] {
    return this.fires.filter((f) => f.region === region);
  }

  /**
   * Get fires with fixtures (demo fires only)
   */
  getFiresWithFixtures(): NationalFire[] {
    return this.fires.filter((f) => f.hasFixtures);
  }

  /**
   * Get statistics
   */
  getStatistics(): FireStatistics {
    return calculateStatistics(this.fires);
  }

  /**
   * Check if ready
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Get data source
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Get last update time
   */
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  /**
   * Get detailed status
   */
  getStatus(): ProviderStatus {
    return {
      isReady: this.isLoaded,
      dataSource: this.dataSource,
      lastUpdated: this.lastUpdated,
      fireCount: this.fires.length,
      error: this.error,
    };
  }

  /**
   * Force refresh data
   */
  async refresh(): Promise<void> {
    clearNifcCache();
    this.isLoaded = false;
    await this.initialize();
  }
}

export default NIFCFireProvider;

/**
 * Mock Fire Provider
 *
 * Implements FireDataProvider using procedurally-generated mock data.
 * Used as a fallback when NIFC is unavailable, or for development/testing.
 *
 * Refactored from mockNationalService.ts to implement the provider interface.
 */

import type { NationalFire, FirePhase, FireSeverity, USFSRegion, MissionFilters } from '@/types/mission';
import { calculateTriageScore } from '@/types/mission';
import type {
  FireDataProvider,
  DataSource,
  ProviderStatus,
  FireStatistics,
} from './fireDataProvider';
import { calculateStatistics, applyFilters } from './fireDataProvider';

// =============================================================================
// Fire Name Generation
// =============================================================================

const FIRE_NAME_PREFIXES = [
  'Cedar', 'Pine', 'Oak', 'Maple', 'Aspen', 'Juniper', 'Spruce', 'Fir',
  'Bear', 'Eagle', 'Wolf', 'Elk', 'Deer', 'Cougar', 'Hawk', 'Raven',
  'Thunder', 'Lightning', 'Storm', 'Wind', 'Cloud', 'Sky', 'Sun', 'Moon',
  'Blue', 'Red', 'Black', 'White', 'Silver', 'Gold', 'Copper', 'Iron',
  'North', 'South', 'East', 'West', 'High', 'Low', 'Deep', 'Tall',
];

const FIRE_NAME_SUFFIXES = [
  'Creek', 'Ridge', 'Peak', 'Mountain', 'Valley', 'Canyon', 'Gulch', 'Basin',
  'Lake', 'River', 'Spring', 'Falls', 'Meadow', 'Forest', 'Grove', 'Hollow',
];

// =============================================================================
// State Coordinates
// =============================================================================

const STATE_COORDINATES: Record<string, { center: [number, number]; variance: number }> = {
  CA: { center: [-120.5, 38.5], variance: 3.0 },
  OR: { center: [-121.5, 43.5], variance: 2.0 },
  WA: { center: [-121.0, 47.5], variance: 1.5 },
  MT: { center: [-110.5, 46.5], variance: 2.0 },
  ID: { center: [-114.5, 44.5], variance: 2.0 },
  CO: { center: [-105.5, 39.0], variance: 1.5 },
  WY: { center: [-107.5, 43.0], variance: 1.5 },
  AZ: { center: [-111.5, 34.5], variance: 2.0 },
  NM: { center: [-106.0, 34.5], variance: 1.5 },
  UT: { center: [-111.5, 39.5], variance: 1.5 },
  NV: { center: [-117.0, 39.5], variance: 2.0 },
};

// =============================================================================
// Helper Functions
// =============================================================================

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function generateFireName(random: () => number): string {
  const prefix = FIRE_NAME_PREFIXES[Math.floor(random() * FIRE_NAME_PREFIXES.length)];
  const suffix = FIRE_NAME_SUFFIXES[Math.floor(random() * FIRE_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

function generateCoordinates(state: string, random: () => number): [number, number] {
  const config = STATE_COORDINATES[state] || { center: [-110, 40], variance: 2 };
  const lng = config.center[0] + (random() - 0.5) * config.variance * 2;
  const lat = config.center[1] + (random() - 0.5) * config.variance * 2;
  return [lng, lat];
}

function generateBounds(
  centroid: [number, number],
  acres: number
): [[number, number], [number, number]] {
  const sqMiles = acres * 0.0015625;
  const sideMiles = Math.sqrt(sqMiles);
  const sideDegrees = sideMiles / 69;
  const padding = sideDegrees / 2 + 0.05;

  return [
    [centroid[0] - padding, centroid[1] - padding],
    [centroid[0] + padding, centroid[1] + padding],
  ];
}

function generateStartDate(random: () => number): string {
  const month = 5 + Math.floor(random() * 6);
  const day = 1 + Math.floor(random() * 28);
  return `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// =============================================================================
// Mock Fire Generator
// =============================================================================

function generateMockFires(): NationalFire[] {
  const random = seededRandom(42);
  const fires: NationalFire[] = [];

  const distribution: Array<{ state: string; region: USFSRegion; count: number }> = [
    { state: 'CA', region: 5, count: 8 },
    { state: 'OR', region: 6, count: 6 },
    { state: 'WA', region: 6, count: 4 },
    { state: 'AZ', region: 3, count: 4 },
    { state: 'CO', region: 2, count: 4 },
    { state: 'MT', region: 1, count: 2 },
    { state: 'ID', region: 1, count: 2 },
    { state: 'UT', region: 4, count: 2 },
    { state: 'NV', region: 4, count: 2 },
    { state: 'NM', region: 3, count: 2 },
    { state: 'WY', region: 2, count: 2 },
  ];

  let fireIndex = 0;

  for (const { state, region, count } of distribution) {
    for (let i = 0; i < count; i++) {
      const name = generateFireName(random);
      const coordinates = generateCoordinates(state, random);

      const phaseRoll = random();
      const phase: FirePhase =
        phaseRoll < 0.3 ? 'active' : phaseRoll < 0.7 ? 'in_baer' : 'in_recovery';

      const severityRoll = random();
      const severity: FireSeverity =
        severityRoll < 0.1
          ? 'critical'
          : severityRoll < 0.35
            ? 'high'
            : severityRoll < 0.75
              ? 'moderate'
              : 'low';

      const acresBase = Math.pow(10, 3 + random() * 2.7);
      const acres = Math.round(acresBase);

      const baseContainment =
        phase === 'active'
          ? random() * 40
          : phase === 'in_baer'
            ? 40 + random() * 40
            : 80 + random() * 20;
      const containment = Math.round(baseContainment);

      const startDate = generateStartDate(random);

      const fire: NationalFire = {
        id: `mock-${fireIndex.toString().padStart(3, '0')}`,
        name: `${name} Fire`,
        region,
        state,
        phase,
        severity,
        acres,
        containment,
        coordinates,
        bounds: generateBounds(coordinates, acres),
        triageScore: calculateTriageScore(severity, acres, phase),
        startDate,
        lastUpdated: new Date().toISOString(),
        hasFixtures: false,
      };

      fires.push(fire);
      fireIndex++;
    }
  }

  // Add demo fires with fixtures
  fires.push({
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
  });

  fires.push({
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
  });

  // Sort by triage score
  fires.sort((a, b) => b.triageScore - a.triageScore);

  return fires;
}

// =============================================================================
// Mock Fire Provider Class
// =============================================================================

export class MockFireProvider implements FireDataProvider {
  private fires: NationalFire[] = [];
  private isLoaded = false;
  private lastUpdated: Date | null = null;

  /**
   * Initialize provider - generate mock data
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.fires = generateMockFires();
    this.lastUpdated = new Date();
    this.isLoaded = true;

    console.log(`[MockFireProvider] Loaded ${this.fires.length} mock fires`);
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
   * Get fires with fixtures
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
    return 'mock';
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
      dataSource: 'mock',
      lastUpdated: this.lastUpdated,
      fireCount: this.fires.length,
    };
  }

  /**
   * Refresh data (regenerates mock data)
   */
  async refresh(): Promise<void> {
    this.isLoaded = false;
    await this.initialize();
  }
}

export default MockFireProvider;

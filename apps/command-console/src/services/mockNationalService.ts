/**
 * Mock National Service
 *
 * For Phase 1, this service generates mock fire data for the National
 * Mission Control dashboard. Simulates 30+ fires across USFS regions.
 *
 * In Phase 2+, this will be replaced by real API calls to IRWIN/NIFC.
 */

import type {
  NationalFire,
  FirePhase,
  FireSeverity,
  USFSRegion,
  MissionFilters,
} from '@/types/mission';
import { calculateTriageScore } from '@/types/mission';

/**
 * Fire name components for generation
 */
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

/**
 * State coordinates for fire placement
 */
const STATE_COORDINATES: Record<string, { center: [number, number]; variance: number }> = {
  // Region 5 - Pacific Southwest
  CA: { center: [-120.5, 38.5], variance: 3.0 },
  // Region 6 - Pacific Northwest
  OR: { center: [-121.5, 43.5], variance: 2.0 },
  WA: { center: [-121.0, 47.5], variance: 1.5 },
  // Region 1 - Northern
  MT: { center: [-110.5, 46.5], variance: 2.0 },
  ID: { center: [-114.5, 44.5], variance: 2.0 },
  // Region 2 - Rocky Mountain
  CO: { center: [-105.5, 39.0], variance: 1.5 },
  WY: { center: [-107.5, 43.0], variance: 1.5 },
  // Region 3 - Southwestern
  AZ: { center: [-111.5, 34.5], variance: 2.0 },
  NM: { center: [-106.0, 34.5], variance: 1.5 },
  // Region 4 - Intermountain
  UT: { center: [-111.5, 39.5], variance: 1.5 },
  NV: { center: [-117.0, 39.5], variance: 2.0 },
};


/**
 * Seeded random number generator for deterministic data
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Generate a random fire name
 */
function generateFireName(random: () => number): string {
  const prefix = FIRE_NAME_PREFIXES[Math.floor(random() * FIRE_NAME_PREFIXES.length)];
  const suffix = FIRE_NAME_SUFFIXES[Math.floor(random() * FIRE_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

/**
 * Generate coordinates within a state
 */
function generateCoordinates(
  state: string,
  random: () => number
): [number, number] {
  const config = STATE_COORDINATES[state] || { center: [-110, 40], variance: 2 };
  const lng = config.center[0] + (random() - 0.5) * config.variance * 2;
  const lat = config.center[1] + (random() - 0.5) * config.variance * 2;
  return [lng, lat];
}

/**
 * Generate bounds from centroid
 */
function generateBounds(
  centroid: [number, number],
  acres: number
): [[number, number], [number, number]] {
  // Rough calculation: 1 degree ≈ 69 miles, 1 acre = 0.0015625 sq miles
  const sqMiles = acres * 0.0015625;
  const sideMiles = Math.sqrt(sqMiles);
  const sideDegrees = sideMiles / 69;
  const padding = sideDegrees / 2 + 0.05; // Add some padding

  return [
    [centroid[0] - padding, centroid[1] - padding],
    [centroid[0] + padding, centroid[1] + padding],
  ];
}

/**
 * Generate a random date within the 2024 fire season
 */
function generateStartDate(random: () => number): string {
  // Fire season: May through October 2024
  const month = 5 + Math.floor(random() * 6); // 5-10
  const day = 1 + Math.floor(random() * 28);
  return `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Generate the mock fire portfolio
 */
function generateMockFires(): NationalFire[] {
  const random = seededRandom(42); // Deterministic seed
  const fires: NationalFire[] = [];

  // Distribution: ~8 CA, ~6 OR, ~4 WA, ~4 AZ, ~4 CO, ~2 MT, ~2 ID, ~2 UT, ~2 NV, ~2 NM, ~2 WY
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

      // Random phase distribution: 30% active, 40% in_baer, 30% in_recovery
      const phaseRoll = random();
      const phase: FirePhase =
        phaseRoll < 0.3 ? 'active' : phaseRoll < 0.7 ? 'in_baer' : 'in_recovery';

      // Random severity: 10% critical, 25% high, 40% moderate, 25% low
      const severityRoll = random();
      const severity: FireSeverity =
        severityRoll < 0.1 ? 'critical' :
        severityRoll < 0.35 ? 'high' :
        severityRoll < 0.75 ? 'moderate' : 'low';

      // Acres: 1,000 - 500,000 with log distribution (more small fires)
      const acresBase = Math.pow(10, 3 + random() * 2.7); // 1,000 to ~500,000
      const acres = Math.round(acresBase);

      // Containment: correlates with phase
      const baseContainment =
        phase === 'active' ? random() * 40 :
        phase === 'in_baer' ? 40 + random() * 40 : 80 + random() * 20;
      const containment = Math.round(baseContainment);

      const startDate = generateStartDate(random);

      const fire: NationalFire = {
        id: `fire-${fireIndex.toString().padStart(3, '0')}`,
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

  // Add our demo fires with fixtures (Cedar Creek and Bootleg)
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

  // Sort by triage score descending
  fires.sort((a, b) => b.triageScore - a.triageScore);

  return fires;
}

/**
 * Mock National Service class
 */
class MockNationalService {
  private fires: NationalFire[] = [];
  private isLoaded: boolean = false;

  /**
   * Initialize the service with mock data
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.fires = generateMockFires();
    this.isLoaded = true;

    console.log(`[MockNationalService] Loaded ${this.fires.length} fires`);
  }

  /**
   * Get all fires
   */
  getAllFires(): NationalFire[] {
    return [...this.fires];
  }

  /**
   * Get fires filtered by criteria
   */
  getFilteredFires(filters: MissionFilters): NationalFire[] {
    return this.fires.filter((fire) => {
      // Phase filter
      if (filters.phases.length > 0 && !filters.phases.includes(fire.phase)) {
        return false;
      }

      // Region filter
      if (filters.regions.length > 0 && !filters.regions.includes(fire.region)) {
        return false;
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
  }

  /**
   * Get a specific fire by ID
   */
  getFireById(id: string): NationalFire | undefined {
    return this.fires.find((fire) => fire.id === id);
  }

  /**
   * Get fires by phase
   */
  getFiresByPhase(phase: FirePhase): NationalFire[] {
    return this.fires.filter((fire) => fire.phase === phase);
  }

  /**
   * Get fires by region
   */
  getFiresByRegion(region: USFSRegion): NationalFire[] {
    return this.fires.filter((fire) => fire.region === region);
  }

  /**
   * Get fires with fixtures (can enter tactical view)
   */
  getFiresWithFixtures(): NationalFire[] {
    return this.fires.filter((fire) => fire.hasFixtures);
  }

  /**
   * Get summary statistics
   */
  getStatistics(): {
    total: number;
    byPhase: Record<FirePhase, number>;
    byRegion: Record<USFSRegion, number>;
    totalAcres: number;
    avgContainment: number;
  } {
    const byPhase: Record<FirePhase, number> = {
      active: 0,
      in_baer: 0,
      in_recovery: 0,
    };

    const byRegion: Record<USFSRegion, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
    };

    let totalAcres = 0;
    let totalContainment = 0;

    for (const fire of this.fires) {
      byPhase[fire.phase]++;
      byRegion[fire.region]++;
      totalAcres += fire.acres;
      totalContainment += fire.containment;
    }

    return {
      total: this.fires.length,
      byPhase,
      byRegion,
      totalAcres,
      avgContainment: Math.round(totalContainment / this.fires.length),
    };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isLoaded;
  }
}

// Export singleton instance
export const mockNationalService = new MockNationalService();

export default mockNationalService;

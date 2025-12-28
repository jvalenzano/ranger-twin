/**
 * NIFC (National Interagency Fire Center) Service
 *
 * Fetches real fire perimeter data from the WFIGS (Wildland Fire
 * Interagency Geospatial Services) ArcGIS Feature Server.
 *
 * API Documentation:
 * - Current perimeters: https://data-nifc.opendata.arcgis.com/
 * - Feature Server: services3.arcgis.com/T4QMspbfLg3qTGWY
 *
 * No authentication required - public API.
 *
 * Philosophy: "Nerve Center, Not Sensors"
 * We consume authoritative NIFC data rather than building our own fire tracking.
 */

import { DataCache, CACHE_DURATIONS } from '@/utils/dataCache';
import type { NationalFire } from '@/types/mission';

// =============================================================================
// Types
// =============================================================================

/**
 * Raw NIFC feature from ArcGIS REST API
 */
export interface NIFCFeature {
  attributes: {
    // Core identifiers
    OBJECTID: number;
    poly_IRWINID?: string;
    poly_UniqueFireIdentifier?: string;
    poly_IncidentName: string;

    // Location
    POOState?: string;
    POOCounty?: string;
    poly_POOLatitude?: number;
    poly_POOLongitude?: number;

    // Size and containment
    poly_GISAcres?: number;
    attr_PercentContained?: number;

    // Dates
    attr_FireDiscoveryDateTime?: number; // Unix timestamp
    poly_DateCurrent?: number; // Unix timestamp
    attr_ContainmentDateTime?: number;
    poly_CreateDate?: number;

    // Status
    attr_IncidentTypeCategory?: string;
    attr_FireBehaviorGeneral?: string;
    poly_MapMethod?: string;

    // Agency
    attr_POOProtectingAgency?: string;
    attr_POOProtectingUnit?: string;
  };
  geometry: {
    rings?: number[][][];
    x?: number;
    y?: number;
  };
}

/**
 * Request configuration
 */
export interface NIFCRequestConfig {
  /** Filter by state (e.g., 'OR', 'CA') */
  state?: string;
  /** Only fires larger than this acreage */
  minAcres?: number;
  /** Maximum number of results */
  limit?: number;
  /** Fire year (defaults to current year) */
  year?: number;
}

// =============================================================================
// Constants
// =============================================================================

// WFIGS Interagency Perimeters - Current Year
const NIFC_CURRENT_URL =
  'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query';

// Fields to request (reduces payload size)
const NIFC_FIELDS = [
  'OBJECTID',
  'poly_IRWINID',
  'poly_UniqueFireIdentifier',
  'poly_IncidentName',
  'POOState',
  'POOCounty',
  'poly_POOLatitude',
  'poly_POOLongitude',
  'poly_GISAcres',
  'attr_PercentContained',
  'attr_FireDiscoveryDateTime',
  'poly_DateCurrent',
  'attr_ContainmentDateTime',
  'attr_IncidentTypeCategory',
  'attr_FireBehaviorGeneral',
].join(',');

// Cache for perimeter data
const perimeterCache = new DataCache<NIFCFeature[]>({
  key: 'nifc-perimeters',
  duration: CACHE_DURATIONS.NIFC_PERIMETERS,
  storage: 'localStorage',
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build where clause for ArcGIS query
 */
function buildWhereClause(config?: NIFCRequestConfig): string {
  const conditions: string[] = ['1=1']; // Base condition

  if (config?.state) {
    conditions.push(`POOState = '${config.state}'`);
  }

  if (config?.minAcres) {
    conditions.push(`poly_GISAcres >= ${config.minAcres}`);
  }

  // Filter to current year by default
  const year = config?.year ?? new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1).getTime();
  const endOfYear = new Date(year + 1, 0, 1).getTime();
  conditions.push(
    `attr_FireDiscoveryDateTime >= ${startOfYear} AND attr_FireDiscoveryDateTime < ${endOfYear}`
  );

  return conditions.join(' AND ');
}

/**
 * Calculate bounds from geometry rings
 */
function calculateBoundsFromRings(
  rings: number[][][]
): [[number, number], [number, number]] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const ring of rings) {
    for (const coord of ring) {
      const lng = coord[0];
      const lat = coord[1];
      if (lng !== undefined && lat !== undefined) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

/**
 * Calculate centroid from geometry
 */
function calculateCentroid(
  geometry: NIFCFeature['geometry']
): [number, number] {
  if (geometry.x !== undefined && geometry.y !== undefined) {
    return [geometry.x, geometry.y];
  }

  if (geometry.rings && geometry.rings.length > 0) {
    const bounds = calculateBoundsFromRings(geometry.rings);
    return [
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
    ];
  }

  return [0, 0];
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch fire perimeters from NIFC
 */
export async function fetchNIFCPerimeters(
  config?: NIFCRequestConfig
): Promise<NIFCFeature[]> {
  // Check cache first
  const cached = perimeterCache.get() as NIFCFeature[] | null;
  if (cached && cached.length > 0) {
    console.log('[NIFC] Returning cached perimeters', { count: cached.length });
    return cached;
  }

  // Build query parameters
  // NOTE: Do NOT include geometryType without a geometry parameter -
  // newer ArcGIS servers reject this as "Invalid query parameters"
  const params = new URLSearchParams({
    where: buildWhereClause(config),
    outFields: NIFC_FIELDS,
    returnGeometry: 'true',
    f: 'json',
    resultRecordCount: String(config?.limit ?? 500),
    orderByFields: 'poly_GISAcres DESC',
  });

  const url = `${NIFC_CURRENT_URL}?${params.toString()}`;
  console.log('[NIFC] Fetching fire perimeters', { config });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NIFC API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle ArcGIS error response
    if (data.error) {
      throw new Error(`NIFC API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const features: NIFCFeature[] = (data.features || []).map(
      (f: { attributes: NIFCFeature['attributes']; geometry: NIFCFeature['geometry'] }) => ({
        attributes: f.attributes,
        geometry: f.geometry,
      })
    );

    // Update cache
    perimeterCache.set(features);

    console.log('[NIFC] Fetched fire perimeters', { count: features.length });
    return features;
  } catch (error) {
    console.error('[NIFC] Error fetching perimeters:', error);

    // Return cached data if available
    if (cached) {
      console.log('[NIFC] Returning stale cache after error');
      return cached;
    }

    throw error;
  }
}

/**
 * Transform NIFC feature to NationalFire format
 */
export function transformToNationalFire(feature: NIFCFeature): NationalFire {
  const { attributes, geometry } = feature;

  // Extract coordinates
  const coordinates = calculateCentroid(geometry);

  // Calculate bounds
  const bounds: [[number, number], [number, number]] =
    geometry.rings && geometry.rings.length > 0
      ? calculateBoundsFromRings(geometry.rings)
      : [
          [coordinates[0] - 0.5, coordinates[1] - 0.5],
          [coordinates[0] + 0.5, coordinates[1] + 0.5],
        ];

  // Parse dates
  const startDate = attributes.attr_FireDiscoveryDateTime
    ? new Date(attributes.attr_FireDiscoveryDateTime).toISOString()
    : new Date().toISOString();

  const lastUpdated = attributes.poly_DateCurrent
    ? new Date(attributes.poly_DateCurrent).toISOString()
    : new Date().toISOString();

  // Derive phase from containment (4-phase model)
  const containment = attributes.attr_PercentContained ?? 0;
  const phase =
    containment >= 100
      ? 'in_restoration'
      : containment >= 75
        ? 'baer_implementation'
        : containment >= 50
          ? 'baer_assessment'
          : 'active';

  // Derive severity from acres (simple heuristic)
  const acres = attributes.poly_GISAcres ?? 0;
  const severity =
    acres >= 100000
      ? 'critical'
      : acres >= 50000
        ? 'high'
        : acres >= 10000
          ? 'moderate'
          : 'low';

  // Map state to USFS region
  const regionMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
    MT: 1, ND: 1, ID: 1,
    CO: 2, WY: 2, SD: 2, NE: 2, KS: 2,
    AZ: 3, NM: 3,
    UT: 4, NV: 4,
    CA: 5, HI: 5,
    OR: 6, WA: 6,
  };
  const state = attributes.POOState ?? 'CA';
  const region = regionMap[state] ?? 5;

  // Calculate triage score with 4-phase multipliers
  const severityWeight = { critical: 4, high: 3, moderate: 2, low: 1 }[severity];
  const phaseMultipliers: Record<string, number> = {
    active: 2.0,
    baer_assessment: 1.75,
    baer_implementation: 1.25,
    in_restoration: 1.0,
  };
  const phaseMultiplier = phaseMultipliers[phase] ?? 1.0;
  const triageScore =
    Math.round(severityWeight * Math.min(acres / 10000, 50) * phaseMultiplier * 10) / 10;

  // Generate stable ID from IRWIN ID or name
  const id = attributes.poly_IRWINID
    ? `nifc-${attributes.poly_IRWINID}`
    : `nifc-${attributes.poly_IncidentName?.replace(/\s+/g, '-').toLowerCase() ?? attributes.OBJECTID}`;

  return {
    id,
    name: attributes.poly_IncidentName || 'Unknown Fire',
    region,
    state,
    phase,
    severity,
    acres: Math.round(acres),
    containment: Math.round(containment),
    coordinates,
    bounds,
    triageScore,
    startDate,
    lastUpdated,
    hasFixtures: false, // Real NIFC fires don't have our demo fixtures
  };
}

/**
 * Fetch and transform perimeters to NationalFire format
 */
export async function getNationalFires(
  config?: NIFCRequestConfig
): Promise<NationalFire[]> {
  const features = await fetchNIFCPerimeters(config);
  return features.map(transformToNationalFire);
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  perimeterCache.clear();
  console.log('[NIFC] Cache cleared');
}

/**
 * Check cache status
 */
export function getCacheStatus(): {
  hasCache: boolean;
  ageMs: number | null;
  count: number;
} {
  const cached = perimeterCache.get() as NIFCFeature[] | null;
  return {
    hasCache: cached !== null,
    ageMs: perimeterCache.getAge(),
    count: cached?.length ?? 0,
  };
}

// =============================================================================
// Exports
// =============================================================================

export default {
  fetchNIFCPerimeters,
  transformToNationalFire,
  getNationalFires,
  clearCache,
  getCacheStatus,
};

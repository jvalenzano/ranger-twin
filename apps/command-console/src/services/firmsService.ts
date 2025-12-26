/**
 * NASA FIRMS (Fire Information for Resource Management System) Service
 *
 * Fetches real-time and historical fire detection hotspots from NASA satellites.
 *
 * Data Sources:
 * - VIIRS (Visible Infrared Imaging Radiometer Suite) - 375m resolution
 * - MODIS (Moderate Resolution Imaging Spectroradiometer) - 1km resolution
 *
 * API Documentation: https://firms.modaps.eosdis.nasa.gov/api/
 *
 * Rate Limits:
 * - 5000 transactions per 10-minute interval
 * - Larger requests (7+ days) count as multiple transactions
 *
 * Note: MAP_KEY is valid for both FIRMS Global and FIRMS US/Canada sites.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Raw fire detection from FIRMS API
 */
export interface FirmsDetection {
  latitude: number;
  longitude: number;
  bright_ti4: number;      // Brightness temperature in Kelvin (VIIRS band I4)
  bright_ti5: number;      // Brightness temperature in Kelvin (VIIRS band I5)
  scan: number;            // Scan pixel size
  track: number;           // Track pixel size
  acq_date: string;        // Acquisition date (YYYY-MM-DD)
  acq_time: string;        // Acquisition time (HHMM)
  satellite: string;       // Satellite (N=Suomi NPP, 1=NOAA-20)
  instrument: string;      // Instrument (VIIRS/MODIS)
  confidence: 'h' | 'n' | 'l'; // high, nominal, low
  version: string;         // Algorithm version
  frp: number;             // Fire Radiative Power in MW (fire intensity)
  daynight: 'D' | 'N';     // Day or Night detection
}

/**
 * GeoJSON Feature for a fire detection
 */
export interface FirmsFeature extends GeoJSON.Feature<GeoJSON.Point> {
  properties: {
    brightness: number;
    confidence: string;
    frp: number;
    acq_datetime: string;
    daynight: string;
    satellite: string;
  };
}

/**
 * Configuration for FIRMS API requests
 */
export interface FirmsRequestConfig {
  /** Bounding box [west, south, east, north] */
  bounds: [number, number, number, number];
  /** Number of days of data (1-10) */
  dayRange?: number;
  /** Specific date (YYYY-MM-DD) - if provided, returns data from date to date+dayRange */
  date?: string;
  /** Data source */
  source?: 'VIIRS_SNPP_NRT' | 'VIIRS_NOAA20_NRT' | 'MODIS_NRT' | 'VIIRS_SNPP_SP' | 'MODIS_SP';
}

// =============================================================================
// Constants
// =============================================================================

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

// Continental US bounds
const US_BOUNDS: [number, number, number, number] = [-125, 24, -66, 50];

// Default source (VIIRS on Suomi NPP - best resolution, near real-time)
const DEFAULT_SOURCE = 'VIIRS_SNPP_NRT';

// Cache duration in milliseconds (5 minutes - fires update every ~12 hours but we want fresh data)
const CACHE_DURATION = 5 * 60 * 1000;

// =============================================================================
// Service State
// =============================================================================

interface CacheEntry {
  data: FirmsDetection[];
  timestamp: number;
  bounds: string;
}

let cache: CacheEntry | null = null;

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get the FIRMS API key from environment
 */
function getApiKey(): string | null {
  const key = import.meta.env.VITE_NASA_FIRMS_KEY;
  if (!key) {
    console.warn('[FIRMS] VITE_NASA_FIRMS_KEY not set in environment');
    return null;
  }
  return key;
}

/**
 * Parse CSV response from FIRMS API
 */
function parseCSV(csv: string): FirmsDetection[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  if (!headerLine) return [];

  const headers = headerLine.split(',');
  const detections: FirmsDetection[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      const value = values[idx];
      if (header && value !== undefined) {
        row[header] = value;
      }
    });

    // Skip if required fields are missing
    if (!row.latitude || !row.longitude) continue;

    detections.push({
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      bright_ti4: parseFloat(row.bright_ti4 ?? '0'),
      bright_ti5: parseFloat(row.bright_ti5 ?? '0'),
      scan: parseFloat(row.scan ?? '0'),
      track: parseFloat(row.track ?? '0'),
      acq_date: row.acq_date ?? '',
      acq_time: row.acq_time ?? '',
      satellite: row.satellite ?? '',
      instrument: row.instrument ?? '',
      confidence: (row.confidence as 'h' | 'n' | 'l') ?? 'n',
      version: row.version ?? '',
      frp: parseFloat(row.frp ?? '0'),
      daynight: (row.daynight as 'D' | 'N') ?? 'D',
    });
  }

  return detections;
}

/**
 * Fetch fire detections from FIRMS API
 */
export async function fetchFireDetections(config?: Partial<FirmsRequestConfig>): Promise<FirmsDetection[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('[FIRMS] No API key available');
    return [];
  }

  const bounds = config?.bounds ?? US_BOUNDS;
  const dayRange = config?.dayRange ?? 1;
  const source = config?.source ?? DEFAULT_SOURCE;
  const boundsKey = bounds.join(',');

  // Check cache
  if (cache &&
      cache.bounds === boundsKey &&
      Date.now() - cache.timestamp < CACHE_DURATION) {
    console.log('[FIRMS] Returning cached data', { count: cache.data.length });
    return cache.data;
  }

  // Build URL
  // Format: /api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]
  // or: /api/area/csv/[MAP_KEY]/[SOURCE]/[AREA_COORDINATES]/[DAY_RANGE]/[DATE]
  const areaCoords = `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`;
  let url = `${FIRMS_BASE_URL}/${apiKey}/${source}/${areaCoords}/${dayRange}`;

  if (config?.date) {
    url += `/${config.date}`;
  }

  console.log('[FIRMS] Fetching fire detections', { source, dayRange, bounds });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FIRMS API error: ${response.status} ${response.statusText}`);
    }

    const csv = await response.text();
    const detections = parseCSV(csv);

    // Update cache
    cache = {
      data: detections,
      timestamp: Date.now(),
      bounds: boundsKey,
    };

    console.log('[FIRMS] Fetched fire detections', { count: detections.length });
    return detections;

  } catch (error) {
    console.error('[FIRMS] Error fetching fire detections:', error);
    return cache?.data ?? [];
  }
}

/**
 * Convert FIRMS detections to GeoJSON FeatureCollection
 */
export function detectionsToGeoJSON(detections: FirmsDetection[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: detections.map((d, idx) => ({
      type: 'Feature' as const,
      id: `firms-${idx}-${d.acq_date}-${d.acq_time}`,
      geometry: {
        type: 'Point' as const,
        coordinates: [d.longitude, d.latitude],
      },
      properties: {
        brightness: d.bright_ti4,
        confidence: d.confidence,
        frp: d.frp,
        acq_datetime: `${d.acq_date} ${d.acq_time.padStart(4, '0').slice(0, 2)}:${d.acq_time.padStart(4, '0').slice(2)}`,
        daynight: d.daynight === 'D' ? 'Day' : 'Night',
        satellite: d.satellite === 'N' ? 'Suomi NPP' : d.satellite === '1' ? 'NOAA-20' : d.satellite,
      },
    })),
  };
}

/**
 * Get fire detections as GeoJSON (convenience function)
 */
export async function getFireHotspotsGeoJSON(config?: Partial<FirmsRequestConfig>): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {
  const detections = await fetchFireDetections(config);
  return detectionsToGeoJSON(detections);
}

/**
 * Get fire detections for a specific fire's bounding box and date range
 */
export async function getFireIncidentHotspots(
  bounds: [number, number, number, number],
  startDate: Date,
  endDate?: Date
): Promise<FirmsDetection[]> {
  const dayRange = endDate
    ? Math.min(10, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 7;

  return fetchFireDetections({
    bounds,
    dayRange,
    date: startDate.toISOString().split('T')[0],
  });
}

/**
 * Clear the cache (useful when forcing a refresh)
 */
export function clearCache(): void {
  cache = null;
  console.log('[FIRMS] Cache cleared');
}

/**
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!getApiKey();
}

// =============================================================================
// Exports
// =============================================================================

export default {
  fetchFireDetections,
  detectionsToGeoJSON,
  getFireHotspotsGeoJSON,
  getFireIncidentHotspots,
  clearCache,
  isConfigured,
};

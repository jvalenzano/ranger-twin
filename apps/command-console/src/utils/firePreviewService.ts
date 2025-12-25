/**
 * Fire Context Tile Service
 *
 * Generates "fire at a glance" preview images using free public geospatial APIs.
 * Following consultant recommendations for robust, deterministic viewport generation.
 *
 * Data Sources (in order of preference):
 * 1. ESRI World Imagery - Free satellite basemap (no key required)
 * 2. NASA GIBS - Global Imagery Browse Services for Landsat/MODIS
 * 3. NASA FIRMS - Fire detection hotspots overlay (future enhancement)
 *
 * Future Enhancements:
 * - USFS/NIFC WFIGS fire perimeter overlays
 * - BAER burn severity rasters
 * - Pre/post fire comparison tiles
 * - Growth timeline sparklines
 */

import type { NationalFire } from '@/types/mission';

/**
 * Tile service configurations
 */
const TILE_SERVICES = {
  /**
   * ESRI World Imagery - Free satellite basemap
   * No API key required for reasonable usage
   * https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer
   */
  esriWorldImagery: {
    name: 'ESRI World Imagery',
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export',
    type: 'arcgis-export' as const,
  },

  /**
   * NASA GIBS - Landsat/MODIS imagery
   * Free, excellent for fire context
   * https://gibs.earthdata.nasa.gov/
   */
  nasaGibs: {
    name: 'NASA GIBS',
    urlTemplate: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/250m/{z}/{y}/{x}.jpg',
    type: 'wmts' as const,
  },

  /**
   * OpenStreetMap Carto - Fallback basemap
   */
  osmCarto: {
    name: 'OpenStreetMap',
    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    type: 'xyz' as const,
  },
} as const;

/**
 * Calculate bounding box from center point and zoom level
 */
function calculateBbox(
  lng: number,
  lat: number,
  zoom: number,
  widthPx: number,
  heightPx: number
): { minLng: number; minLat: number; maxLng: number; maxLat: number } {
  // Approximate degrees per pixel at given zoom level
  // At zoom 0, the world is 256px wide = 360 degrees
  const degreesPerPixel = 360 / (256 * Math.pow(2, zoom));

  const halfWidthDeg = (widthPx / 2) * degreesPerPixel;
  const halfHeightDeg = (heightPx / 2) * degreesPerPixel;

  return {
    minLng: lng - halfWidthDeg,
    minLat: lat - halfHeightDeg,
    maxLng: lng + halfWidthDeg,
    maxLat: lat + halfHeightDeg,
  };
}

/**
 * Generate ESRI ArcGIS export URL for satellite imagery
 * This is the primary method - free and reliable
 */
export function getEsriSatelliteUrl(
  fire: NationalFire,
  options?: {
    zoom?: number;
    width?: number;
    height?: number;
  }
): string {
  const [lng, lat] = fire.coordinates;
  const zoom = options?.zoom ?? getZoomForAcreage(fire.acres);
  const width = options?.width ?? 400;
  const height = options?.height ?? 240;

  const bbox = calculateBbox(lng, lat, zoom, width, height);

  // ESRI export format
  const params = new URLSearchParams({
    bbox: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`,
    bboxSR: '4326',
    imageSR: '4326',
    size: `${width},${height}`,
    format: 'png',
    f: 'image',
  });

  return `${TILE_SERVICES.esriWorldImagery.urlTemplate}?${params.toString()}`;
}

/**
 * Generate NASA GIBS WMTS URL for Landsat/MODIS imagery
 * Provides excellent pre/post fire imagery when dated appropriately
 */
export function getNasaGibsUrl(
  fire: NationalFire,
  options?: {
    date?: string; // Format: YYYY-MM-DD
    layer?: 'modis' | 'landsat';
  }
): string {
  const [lng, lat] = fire.coordinates;

  // Use fire start date or fallback to a default recent date
  const fireDate = fire.startDate ?? new Date();
  const date = options?.date ?? formatDateForGibs(fireDate);

  // Calculate tile coordinates for the fire location
  const zoom = 6; // Good for regional context
  const { x, y } = lngLatToTileXY(lng, lat, zoom);

  // MODIS True Color is most reliable for fire context
  return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/250m/${zoom}/${y}/${x}.jpg`;
}

/**
 * Format date for NASA GIBS API
 */
function formatDateForGibs(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const isoDate = d.toISOString().split('T')[0];
  return isoDate ?? d.toISOString().slice(0, 10);
}

/**
 * Convert lng/lat to tile coordinates
 */
function lngLatToTileXY(lng: number, lat: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

/**
 * Calculate appropriate zoom level based on fire acreage
 * Larger fires need a wider view
 */
export function getZoomForAcreage(acres: number): number {
  if (acres > 200000) return 8;
  if (acres > 100000) return 9;
  if (acres > 50000) return 10;
  if (acres > 10000) return 11;
  return 12;
}

/**
 * Primary function: Get fire preview URL with automatic fallback
 *
 * Fallback ladder:
 * 1. ESRI World Imagery (always available, free)
 * 2. NASA GIBS for specific date context (when available)
 */
export function getFirePreviewUrl(
  fire: NationalFire,
  options?: {
    zoom?: number;
    width?: number;
    height?: number;
    preferNasa?: boolean;
  }
): string {
  // Primary: ESRI World Imagery (most reliable)
  return getEsriSatelliteUrl(fire, options);
}

/**
 * Get adaptive fire preview URL based on fire size
 */
export function getAdaptiveFirePreviewUrl(fire: NationalFire): string {
  const zoom = getZoomForAcreage(fire.acres);
  return getFirePreviewUrl(fire, { zoom });
}

/**
 * Preload fire preview image
 */
const imageCache = new Map<string, HTMLImageElement>();

export function preloadFirePreview(fire: NationalFire): Promise<void> {
  const url = getFirePreviewUrl(fire);
  if (!url || imageCache.has(url)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Check if image is cached
 */
export function isImageCached(fire: NationalFire): boolean {
  const url = getFirePreviewUrl(fire);
  return imageCache.has(url);
}

// =============================================================================
// FUTURE ENHANCEMENTS (Phase 2+)
// =============================================================================

/**
 * TODO: Fetch fire perimeter from WFIGS/USFS
 * https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-interagency-fire-perimeters
 *
 * export async function fetchFirePerimeter(incidentId: string): Promise<GeoJSON.Feature | null>
 */

/**
 * TODO: Get NASA FIRMS active fire hotspots for date range
 * https://firms.modaps.eosdis.nasa.gov/api/
 *
 * export async function fetchFirmsHotspots(bbox: BBox, startDate: Date, endDate: Date): Promise<GeoJSON.FeatureCollection>
 */

/**
 * TODO: Generate composite context tile with:
 * - Satellite basemap
 * - Fire perimeter overlay
 * - FIRMS hotspots
 * - Key annotations
 *
 * export async function generateFireContextTile(fire: NationalFire): Promise<string>
 */

export default {
  getFirePreviewUrl,
  getAdaptiveFirePreviewUrl,
  getEsriSatelliteUrl,
  getNasaGibsUrl,
  getZoomForAcreage,
  preloadFirePreview,
  isImageCached,
};

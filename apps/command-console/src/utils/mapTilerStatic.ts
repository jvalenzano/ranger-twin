/**
 * MapTiler Static Maps Utility
 *
 * Generates static map image URLs for fire preview thumbnails.
 * Uses MapTiler's Static Maps API with satellite imagery.
 */

import type { NationalFire } from '@/types/mission';

/**
 * Configuration for static map images
 */
const STATIC_MAP_CONFIG = {
  /** Base URL for MapTiler static maps */
  baseUrl: 'https://api.maptiler.com/maps/satellite/static',
  /** Default zoom level (good for fire extent) */
  defaultZoom: 10,
  /** Image dimensions (2x for retina) */
  width: 400,
  height: 240,
  /** Use retina (@2x) images */
  retina: true,
} as const;

/**
 * Simple in-memory cache for preloaded images
 */
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Generate a MapTiler static satellite image URL for a fire location
 *
 * @param fire - The fire to generate preview for
 * @param options - Optional overrides for zoom, width, height
 * @returns Static map image URL
 */
export function getFirePreviewUrl(
  fire: NationalFire,
  options?: {
    zoom?: number;
    width?: number;
    height?: number;
  }
): string {
  const [lng, lat] = fire.coordinates;
  const zoom = options?.zoom ?? STATIC_MAP_CONFIG.defaultZoom;
  const width = options?.width ?? STATIC_MAP_CONFIG.width;
  const height = options?.height ?? STATIC_MAP_CONFIG.height;
  const key = import.meta.env.VITE_MAPTILER_API_KEY;

  if (!key) {
    console.warn('[mapTilerStatic] VITE_MAPTILER_API_KEY not set');
    return '';
  }

  const retinaStr = STATIC_MAP_CONFIG.retina ? '@2x' : '';
  return `${STATIC_MAP_CONFIG.baseUrl}/${lng},${lat},${zoom}/${width}x${height}${retinaStr}.png?key=${key}`;
}

/**
 * Generate a terrain/hybrid static map URL (alternative to satellite)
 */
export function getFireTerrainUrl(
  fire: NationalFire,
  options?: {
    zoom?: number;
    width?: number;
    height?: number;
  }
): string {
  const [lng, lat] = fire.coordinates;
  const zoom = options?.zoom ?? STATIC_MAP_CONFIG.defaultZoom;
  const width = options?.width ?? STATIC_MAP_CONFIG.width;
  const height = options?.height ?? STATIC_MAP_CONFIG.height;
  const key = import.meta.env.VITE_MAPTILER_API_KEY;

  if (!key) {
    return '';
  }

  const retinaStr = STATIC_MAP_CONFIG.retina ? '@2x' : '';
  return `https://api.maptiler.com/maps/hybrid/static/${lng},${lat},${zoom}/${width}x${height}${retinaStr}.png?key=${key}`;
}

/**
 * Preload a fire preview image into browser cache
 */
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
 * Check if an image is already cached
 */
export function isImageCached(fire: NationalFire): boolean {
  const url = getFirePreviewUrl(fire);
  return imageCache.has(url);
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
 * Get preview URL with adaptive zoom based on fire size
 */
export function getAdaptiveFirePreviewUrl(fire: NationalFire): string {
  const zoom = getZoomForAcreage(fire.acres);
  return getFirePreviewUrl(fire, { zoom });
}

export default {
  getFirePreviewUrl,
  getFireTerrainUrl,
  getAdaptiveFirePreviewUrl,
  preloadFirePreview,
  isImageCached,
  getZoomForAcreage,
};

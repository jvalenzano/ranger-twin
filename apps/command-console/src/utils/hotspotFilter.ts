/**
 * Hotspot Filter Utilities
 *
 * Utilities for filtering VIIRS thermal detections by confidence level.
 *
 * VIIRS confidence values:
 * - 'h' (high): >= 80% confidence, strongly likely to be fire
 * - 'n' (nominal): 30-80% confidence, possible fire
 * - 'l' (low): < 30% confidence, weak signal or false positive
 *
 * Default threshold of 80 (high confidence) filters out ~70% of false positives.
 */

import type { FirmsDetection } from '@/services/firmsService';

/**
 * Confidence level thresholds
 * Maps VIIRS categorical confidence to numeric values
 */
export const CONFIDENCE_THRESHOLDS = {
  h: 90,  // High confidence → 90
  n: 50,  // Nominal confidence → 50
  l: 20,  // Low confidence → 20
} as const;

/**
 * Convert VIIRS categorical confidence to numeric value (0-100)
 */
export function confidenceToNumeric(confidence: 'h' | 'n' | 'l'): number {
  return CONFIDENCE_THRESHOLDS[confidence] ?? 50;
}

/**
 * Filter hotspots by minimum confidence threshold
 *
 * @param hotspots - Array of FIRMS detections
 * @param minConfidence - Minimum confidence threshold (0-100)
 * @returns Filtered hotspots meeting the confidence threshold
 */
export function filterHotspotsByConfidence(
  hotspots: FirmsDetection[],
  minConfidence: number = 80
): FirmsDetection[] {
  return hotspots.filter((h) => {
    const numericConfidence = confidenceToNumeric(h.confidence);
    return numericConfidence >= minConfidence;
  });
}

/**
 * Get display label for confidence level
 */
export function getConfidenceLabel(confidence: 'h' | 'n' | 'l'): string {
  switch (confidence) {
    case 'h':
      return 'High';
    case 'n':
      return 'Nominal';
    case 'l':
      return 'Low';
    default:
      return 'Unknown';
  }
}

/**
 * Get color for hotspot based on confidence
 * Higher confidence = more red, lower = more yellow
 */
export function getHotspotColor(confidence: 'h' | 'n' | 'l'): string {
  switch (confidence) {
    case 'h':
      return '#ef4444'; // Red - high confidence
    case 'n':
      return '#f97316'; // Orange - nominal
    case 'l':
      return '#fbbf24'; // Yellow - low confidence
    default:
      return '#f97316';
  }
}

/**
 * Get confidence level from slider value
 * Maps 0-100 slider to categorical display
 */
export function getConfidenceLevelFromThreshold(threshold: number): string {
  if (threshold >= 80) return 'High only';
  if (threshold >= 50) return 'Nominal+';
  return 'All';
}

/**
 * Convert hotspots to GeoJSON with numeric confidence for filtering
 */
export function hotspotsToGeoJSON(
  hotspots: FirmsDetection[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: hotspots.map((h, idx) => ({
      type: 'Feature' as const,
      id: `hotspot-${idx}-${h.acq_date}-${h.acq_time}`,
      geometry: {
        type: 'Point' as const,
        coordinates: [h.longitude, h.latitude],
      },
      properties: {
        brightness: h.bright_ti4,
        confidenceCategory: h.confidence,
        confidenceNumeric: confidenceToNumeric(h.confidence),
        frp: h.frp,
        acq_datetime: `${h.acq_date} ${h.acq_time.padStart(4, '0').slice(0, 2)}:${h.acq_time.padStart(4, '0').slice(2)}`,
        daynight: h.daynight === 'D' ? 'Day' : 'Night',
        satellite: h.satellite === 'N' ? 'Suomi NPP' : h.satellite === '1' ? 'NOAA-20' : h.satellite,
      },
    })),
  };
}

export default {
  confidenceToNumeric,
  filterHotspotsByConfidence,
  getConfidenceLabel,
  getHotspotColor,
  getConfidenceLevelFromThreshold,
  hotspotsToGeoJSON,
};

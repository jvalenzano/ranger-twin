/**
 * Shared color constants for map markers and legends.
 * Single source of truth to prevent color drift between components.
 */

// Burn severity color palette (normal view)
export const SEVERITY_COLORS = {
  HIGH: '#EF4444',     // Red
  MODERATE: '#F59E0B', // Amber
  LOW: '#10B981',      // Green
} as const;

// IR/Thermal color palette (heat signature style)
export const IR_SEVERITY_COLORS = {
  HIGH: '#EF4444',     // Red
  MODERATE: '#F59E0B', // Amber
  LOW: '#10B981',      // Green
} as const;

// Trail damage type colors (warm palette)
export const DAMAGE_COLORS = {
  BRIDGE_FAILURE: '#EF4444',  // Red
  DEBRIS_FLOW: '#F97316',     // Orange
  HAZARD_TREES: '#EAB308',    // Yellow
  TREAD_EROSION: '#F59E0B',   // Amber
  SIGNAGE: '#22C55E',         // Green
} as const;

// Timber priority colors (warm palette - to be updated to cool in Phase 2)
export const PRIORITY_COLORS = {
  HIGHEST: '#EF4444',  // Red
  HIGH: '#F97316',     // Orange
  MEDIUM: '#EAB308',   // Yellow
  LOW: '#22C55E',      // Green
} as const;

// Type exports for type safety
export type SeverityLevel = keyof typeof SEVERITY_COLORS;
export type DamageType = keyof typeof DAMAGE_COLORS;
export type PriorityLevel = keyof typeof PRIORITY_COLORS;

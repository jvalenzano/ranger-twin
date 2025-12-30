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

// Timber priority colors (cool palette - distinct from trail damage warm colors)
export const PRIORITY_COLORS = {
  HIGHEST: '#0EA5E9',  // Sky blue (Tailwind sky-500)
  HIGH: '#06B6D4',     // Cyan (Tailwind cyan-500)
  MEDIUM: '#14B8A6',   // Teal (Tailwind teal-500)
  LOW: '#10B981',      // Emerald (Tailwind emerald-500)
} as const;

// Type exports for type safety
export type SeverityLevel = keyof typeof SEVERITY_COLORS;
export type DamageType = keyof typeof DAMAGE_COLORS;
export type PriorityLevel = keyof typeof PRIORITY_COLORS;

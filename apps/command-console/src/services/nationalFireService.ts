/**
 * National Fire Service Factory
 *
 * Unified entry point for fire data access. Switches between real NIFC data
 * and mock data based on environment configuration.
 *
 * Philosophy: "Nerve Center, Not Sensors"
 * We consume authoritative NIFC data rather than building our own fire tracking.
 *
 * Usage:
 *   import { nationalFireService } from '@/services/nationalFireService';
 *   await nationalFireService.initialize();
 *   const fires = nationalFireService.getAllFires();
 */

import type { FireDataProvider, ProviderStatus } from './providers/fireDataProvider';
import { NIFCFireProvider } from './providers/nifcFireProvider';
import { MockFireProvider } from './providers/mockFireProvider';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Determine which data source to use
 * - Set VITE_USE_REAL_FIRE_DATA=true for real NIFC data
 * - Default is 'true' to prefer real data when available
 */
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_FIRE_DATA !== 'false';

// =============================================================================
// Factory
// =============================================================================

/**
 * Create the appropriate fire data provider based on configuration
 */
function createFireProvider(): FireDataProvider {
  if (USE_REAL_DATA) {
    console.log('[NationalFireService] Using NIFC provider (real data)');
    return new NIFCFireProvider();
  } else {
    console.log('[NationalFireService] Using Mock provider (simulated data)');
    return new MockFireProvider();
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * The global fire data provider instance
 * Use this throughout the application for consistent fire data access.
 */
export const nationalFireService: FireDataProvider = createFireProvider();

// =============================================================================
// Convenience Exports
// =============================================================================

// Re-export types for consumers
export type { FireDataProvider, ProviderStatus } from './providers/fireDataProvider';
export type { DataSource, FireStatistics } from './providers/fireDataProvider';

// Re-export providers for testing/advanced use cases
export { NIFCFireProvider } from './providers/nifcFireProvider';
export { MockFireProvider } from './providers/mockFireProvider';

/**
 * Get the current service status
 * Useful for UI indicators showing data source and freshness.
 */
export function getServiceStatus(): ProviderStatus {
  return nationalFireService.getStatus();
}

/**
 * Check if using real NIFC data (for UI indicators)
 */
export function isUsingRealData(): boolean {
  return USE_REAL_DATA && nationalFireService.getDataSource() === 'nifc';
}

export default nationalFireService;

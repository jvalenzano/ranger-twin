/**
 * Custom Hooks Index
 *
 * Re-exports all custom hooks for convenient importing.
 *
 * @example
 * import { useFireStatistics, useDataFreshness } from '@/hooks';
 */

export {
  useFireStatistics,
  useFireCountByPhase,
  useTotalFireCount,
  useTotalAcres,
  useAvgContainment,
} from './useFireStatistics';

export { useDataFreshness, type DataFreshnessResult } from './useDataFreshness';

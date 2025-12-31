/**
 * useFireStatistics - Fire portfolio statistics hook
 *
 * Provides cached access to fire statistics from nationalFireService.
 * Uses the same initialization pattern as IncidentRail.
 *
 * @example
 * const { data, isLoading } = useFireStatistics();
 * const phaseCounts = useFireCountByPhase();
 */

import { useState, useEffect, useMemo } from 'react';
import { nationalFireService } from '@/services/nationalFireService';
import type { FireStatistics } from '@/services/providers/fireDataProvider';
import type { FirePhase } from '@/types/mission';

// Default empty statistics for loading state
const EMPTY_STATISTICS: FireStatistics = {
  total: 0,
  byPhase: {
    active: 0,
    baer_assessment: 0,
    baer_implementation: 0,
    in_restoration: 0,
  },
  byRegion: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
  totalAcres: 0,
  avgContainment: 0,
};

/**
 * Hook to get fire statistics with loading state
 */
export function useFireStatistics() {
  const [data, setData] = useState<FireStatistics>(EMPTY_STATISTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatistics() {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize service if needed
        if (!nationalFireService.isReady()) {
          await nationalFireService.initialize();
        }

        if (!cancelled) {
          const stats = nationalFireService.getStatistics();
          setData(stats);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load statistics');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}

/**
 * Selector hook for fire counts by phase
 * Returns Record<FirePhase, number>
 */
export function useFireCountByPhase(): Record<FirePhase, number> {
  const { data } = useFireStatistics();
  return useMemo(() => data.byPhase, [data.byPhase]);
}

/**
 * Selector hook for total fire count
 */
export function useTotalFireCount(): number {
  const { data } = useFireStatistics();
  return data.total;
}

/**
 * Selector hook for total acres burned
 */
export function useTotalAcres(): number {
  const { data } = useFireStatistics();
  return data.totalAcres;
}

/**
 * Selector hook for average containment percentage
 */
export function useAvgContainment(): number {
  const { data } = useFireStatistics();
  return data.avgContainment;
}

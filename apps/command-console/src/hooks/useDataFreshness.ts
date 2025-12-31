/**
 * useDataFreshness - Data timestamp formatting hook
 *
 * Provides the last update timestamp from nationalFireService
 * with formatted display strings.
 *
 * @example
 * const { lastUpdated, formattedTime } = useDataFreshness();
 * // formattedTime = "0615 UTC"
 */

import { useState, useEffect, useMemo } from 'react';
import { nationalFireService } from '@/services/nationalFireService';

/**
 * Format a Date to "HHmm UTC" string (e.g., "0615 UTC")
 */
function formatTimeUTC(date: Date | null): string {
  if (!date) return '--:--';

  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}${minutes} UTC`;
}

/**
 * Format a Date to relative time string (e.g., "5m ago", "2h ago")
 */
function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Unknown';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export interface DataFreshnessResult {
  /** Raw timestamp or null if not available */
  lastUpdated: Date | null;
  /** Formatted as "HHmm UTC" */
  formattedTime: string;
  /** Formatted as relative time ("5m ago") */
  relativeTime: string;
  /** Whether data is stale (>15 minutes old) */
  isStale: boolean;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook to get data freshness information
 */
export function useDataFreshness(): DataFreshnessResult {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFreshness() {
      try {
        setIsLoading(true);

        // Initialize service if needed
        if (!nationalFireService.isReady()) {
          await nationalFireService.initialize();
        }

        if (!cancelled) {
          const timestamp = nationalFireService.getLastUpdated();
          setLastUpdated(timestamp);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFreshness();

    return () => {
      cancelled = true;
    };
  }, []);

  // Recalculate relative time periodically
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => formatTimeUTC(lastUpdated), [lastUpdated]);
  const relativeTime = useMemo(() => formatRelativeTime(lastUpdated), [lastUpdated]);

  const isStale = useMemo(() => {
    if (!lastUpdated) return false;
    const diffMs = Date.now() - lastUpdated.getTime();
    return diffMs > 15 * 60 * 1000; // 15 minutes
  }, [lastUpdated]);

  return {
    lastUpdated,
    formattedTime,
    relativeTime,
    isStale,
    isLoading,
  };
}

/**
 * Data Cache Utility
 *
 * Provides localStorage-backed caching for API responses with TTL.
 * Follows the pattern established in firmsService.ts but adds persistence.
 */

// =============================================================================
// Types
// =============================================================================

export interface CacheConfig {
  /** Storage key prefix */
  key: string;
  /** Cache duration in milliseconds */
  duration: number;
  /** Storage type */
  storage: 'localStorage' | 'memory';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

// Cache version - increment to invalidate all caches
const CACHE_VERSION = 1;

// In-memory cache fallback
const memoryCache: Map<string, CacheEntry<unknown>> = new Map();

// =============================================================================
// Cache Durations (constants for common use cases)
// =============================================================================

export const CACHE_DURATIONS = {
  /** NIFC fire perimeters - 30 minutes (perimeters change slowly) */
  NIFC_PERIMETERS: 30 * 60 * 1000,
  /** NASA FIRMS hotspots - 5 minutes (already in firmsService) */
  FIRMS_HOTSPOTS: 5 * 60 * 1000,
  /** OSM trail data - 24 hours (trail networks rarely change) */
  OSM_TRAILS: 24 * 60 * 60 * 1000,
  /** MTBS burn severity - 7 days (historical data) */
  MTBS_SEVERITY: 7 * 24 * 60 * 60 * 1000,
} as const;

// =============================================================================
// DataCache Class
// =============================================================================

export class DataCache<T> {
  private readonly fullKey: string;

  constructor(private config: CacheConfig) {
    this.fullKey = `ranger-cache-${config.key}`;
  }

  /**
   * Get cached data if valid
   */
  get(): T | null {
    try {
      let entry: CacheEntry<T> | null = null;

      if (this.config.storage === 'localStorage') {
        const stored = localStorage.getItem(this.fullKey);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
        }
      } else {
        entry = memoryCache.get(this.fullKey) as CacheEntry<T> | null;
      }

      if (!entry) return null;

      // Check version
      if (entry.version !== CACHE_VERSION) {
        this.clear();
        return null;
      }

      // Check TTL
      if (Date.now() - entry.timestamp > this.config.duration) {
        this.clear();
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`[DataCache] Error reading cache ${this.fullKey}:`, error);
      this.clear();
      return null;
    }
  }

  /**
   * Set cached data
   */
  set(data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    try {
      if (this.config.storage === 'localStorage') {
        localStorage.setItem(this.fullKey, JSON.stringify(entry));
      } else {
        memoryCache.set(this.fullKey, entry);
      }
    } catch (error) {
      console.warn(`[DataCache] Error writing cache ${this.fullKey}:`, error);
      // If localStorage is full, clear old caches and retry
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearAllRangerCaches();
        try {
          localStorage.setItem(this.fullKey, JSON.stringify(entry));
        } catch {
          // Fall back to memory cache
          memoryCache.set(this.fullKey, entry);
        }
      }
    }
  }

  /**
   * Clear this cache
   */
  clear(): void {
    if (this.config.storage === 'localStorage') {
      localStorage.removeItem(this.fullKey);
    } else {
      memoryCache.delete(this.fullKey);
    }
  }

  /**
   * Check if cache has valid data
   */
  isValid(): boolean {
    return this.get() !== null;
  }

  /**
   * Get cache age in milliseconds (or null if no cache)
   */
  getAge(): number | null {
    try {
      let entry: CacheEntry<T> | null = null;

      if (this.config.storage === 'localStorage') {
        const stored = localStorage.getItem(this.fullKey);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
        }
      } else {
        entry = memoryCache.get(this.fullKey) as CacheEntry<T> | null;
      }

      if (!entry) return null;
      return Date.now() - entry.timestamp;
    } catch {
      return null;
    }
  }

  /**
   * Clear all RANGER caches (for quota management)
   */
  private clearAllRangerCaches(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ranger-cache-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    memoryCache.clear();
    console.log(`[DataCache] Cleared ${keysToRemove.length} RANGER caches`);
  }
}

// =============================================================================
// Pre-configured Caches
// =============================================================================

/** Cache for NIFC fire perimeters */
export const nifcCache = new DataCache<unknown>({
  key: 'nifc-perimeters',
  duration: CACHE_DURATIONS.NIFC_PERIMETERS,
  storage: 'localStorage',
});

/** Cache for OSM trail data (per-fire) */
export function createOsmTrailCache(fireId: string): DataCache<unknown> {
  return new DataCache({
    key: `osm-trails-${fireId}`,
    duration: CACHE_DURATIONS.OSM_TRAILS,
    storage: 'localStorage',
  });
}

/** Cache for MTBS severity data (per-fire) */
export function createMtbsCache(fireId: string): DataCache<unknown> {
  return new DataCache({
    key: `mtbs-severity-${fireId}`,
    duration: CACHE_DURATIONS.MTBS_SEVERITY,
    storage: 'localStorage',
  });
}

export default DataCache;

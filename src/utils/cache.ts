import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const CACHE_PREFIX = '@crypto_cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cache = {
  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    try {
      const cached = storage.getString(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > entry.ttl;

      if (isExpired) {
        storage.delete(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      storage.set(CACHE_PREFIX + key, JSON.stringify(entry));
      return true;
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
      return false;
    }
  },

  /**
   * Remove specific cache entry
   */
  remove(key: string): void {
    storage.delete(CACHE_PREFIX + key);
  },

  /**
   * Clear all cache entries
   */
  clear(): void {
    const keys = storage.getAllKeys();
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        storage.delete(key);
      }
    });
  },

  /**
   * Get cache info (debug)
   */
  info(): { size: number; entries: number } {
    const keys = storage.getAllKeys().filter((k) => k.startsWith(CACHE_PREFIX));
    return {
      size: keys.length,
      entries: keys.length,
    };
  },
};

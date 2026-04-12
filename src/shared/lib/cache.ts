/**
 * Shared cache utility for data persistence
 * KISS: Simple TTL-based cache using MMKV
 */
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

const CACHE_PREFIX = '@crypto_cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cache = {
  get<T>(key: string): T | null {
    try {
      const cached = storage.getString(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > entry.ttl;

      if (isExpired) {
        storage.remove(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      return null;
    }
  },

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

  remove(key: string): boolean {
    try {
      storage.remove(CACHE_PREFIX + key);
      return true;
    } catch (error) {
      console.error(`Cache remove error for ${key}:`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      storage.clearAll();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },
};

/**
 * Advanced Query Optimization Utilities
 * Cache strategies, memory management, and performance tuning
 */

import { QueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

/**
 * Cache Strategy Types
 */
export type CacheStrategy = 'aggressive' | 'moderate' | 'conservative';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  strategy: CacheStrategy;
}

/**
 * Predefined cache strategies for different use cases
 */
export const CACHE_STRATEGIES: Record<CacheStrategy, CacheConfig> = {
  // Aggressive: Keep data in memory, frequent refetches
  aggressive: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    strategy: 'aggressive',
  },
  // Moderate: Balanced cache / freshness
  moderate: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    strategy: 'moderate',
  },
  // Conservative: Long cache, low memory usage
  conservative: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    strategy: 'conservative',
  },
};

/**
 * Memory usage estimation
 * Helps monitor and optimize cache size
 */
export function estimateCacheSize(queryClient: QueryClient): number {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  let totalSize = 0;
  queries.forEach((query) => {
    if (query.state.data) {
      // Rough estimation: convert to JSON and measure bytes
      const jsonString = JSON.stringify(query.state.data);
      totalSize += new Blob([jsonString]).size;
    }
  });

  return totalSize;
}

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Aggressive garbage collection
 * Removes unused data when cache grows too large
 */
export function aggressiveGC(
  queryClient: QueryClient,
  maxSizeMB: number = 50
) {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  const maxBytes = maxSizeMB * 1024 * 1024;

  let currentSize = estimateCacheSize(queryClient);

  if (currentSize > maxBytes) {
    // Sort by last used time, remove oldest first
    const sortedQueries = [...queries].sort((a, b) => {
      const aTime = a.state.dataUpdatedAt || 0;
      const bTime = b.state.dataUpdatedAt || 0;
      return aTime - bTime;
    });

    for (const query of sortedQueries) {
      if (currentSize <= maxBytes * 0.8) break; // Stop when below 80% threshold

      queryClient.removeQueries({
        queryKey: query.queryKey,
      });

      currentSize = estimateCacheSize(queryClient);
    }
  }
}

/**
 * Smart invalidation strategy
 * Invalidate related queries intelligently to avoid cascade refreshes
 */
export function smartInvalidate(
  queryClient: QueryClient,
  pattern: (key: any[]) => boolean
) {
  const mutationCache = queryClient.getMutationCache();
  const mutations = mutationCache.getAll();

  // Batch invalidations to avoid multiple refetches
  const keysToInvalidate: any[][] = [];
  
  queryClient.getQueryCache().getAll().forEach((query) => {
    if (pattern(query.queryKey)) {
      keysToInvalidate.push(query.queryKey);
    }
  });

  if (keysToInvalidate.length > 0) {
    return Promise.all(
      keysToInvalidate.map((key) =>
        queryClient.invalidateQueries({ queryKey: key, refetchType: 'stale' })
      )
    );
  }

  return Promise.resolve();
}

/**
 * Request deduplication
 * Prevents duplicate requests when multiple components request same data
 */
export function enableRequestDeduplication(queryClient: QueryClient) {
  const originalFetch = fetch;
  const requestMap = new Map<string, Promise<any>>();

  (global as any).fetch = async (...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (requestMap.has(key)) {
      return requestMap.get(key);
    }

    const promise = originalFetch(...args);
    requestMap.set(key, promise);

    setTimeout(() => {
      requestMap.delete(key);
    }, 100); // Keep dedup for 100ms

    return promise;
  };
}

/**
 * Network-aware caching
 * Adjust cache strategy based on network conditions
 */
export interface NetworkState {
  isOnline: boolean;
  type?: 'wifi' | '4g' | '3g' | 'unknown';
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

export function getNetworkAdjustedConfig(
  baseConfig: CacheConfig,
  network: NetworkState
): CacheConfig {
  if (!network.isOnline) {
    // Offline: Keep data longer
    return {
      ...baseConfig,
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      staleTime: 60 * 60 * 1000, // 1 hour
    };
  }

  if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    // Slow network: More aggressive caching
    return {
      ...baseConfig,
      staleTime: 10 * 60 * 1000,
      gcTime: 20 * 60 * 1000,
    };
  }

  return baseConfig;
}

/**
 * Selective data hydration
 * Only load essential fields to reduce payload
 */
export function createSelectiveQueryFn<T>(
  fullQueryFn: () => Promise<T>,
  selector?: (data: T) => Partial<T>
) {
  return async (): Promise<T> => {
    const data = await fullQueryFn();
    return selector ? (selector(data) as T) : data;
  };
}

/**
 * Pagination cursor helper
 * Efficient pagination without offset limits
 */
export function createCursorPaginationHelper(pageSize: number) {
  return {
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      // Check if there are more results
      if (lastPage.length < pageSize) {
        return undefined; // No more pages
      }
      // Use cursor if available, otherwise use page number
      return lastPage[lastPage.length - 1]?.id || allPages.length;
    },
    getPreviousPageParam: (firstPage: any, allPages: any[]) => {
      // Return previous cursor if available
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
  };
}

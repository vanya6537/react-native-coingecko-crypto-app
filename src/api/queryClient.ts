/**
 * React Query Setup & Configuration
 * Optimized data fetching, caching, and synchronization
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Query Client Configuration - Production ready with optimizations
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - consider data "fresh"
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory after unmount
      retry: 2, // Retry failed requests 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      networkMode: 'online', // Only refetch on online
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: 'stale', // Refetch if data is stale on mount
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
  },
};

/**
 * Create Query Client instance
 * Memory efficient - caches results, auto-cleanup after gcTime
 */
export const createQueryClient = () => {
  return new QueryClient(queryClientConfig);
};

/**
 * Query Keys Factory - Organized cache keys for type-safety
 * https://tanstack.com/query/latest/docs/guides/important-defaults#using-the-query-key-factory-pattern
 */
export const queryKeys = {
  // Tokens List
  tokens: {
    all: ['tokens'] as const,
    lists: () => [...queryKeys.tokens.all, 'list'] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.tokens.lists(), { page, limit }] as const,
    infinite: () => [...queryKeys.tokens.all, 'infinite'] as const,
    search: (query: string) => [...queryKeys.tokens.all, 'search', query] as const,
  },
  // Token Details
  tokenDetail: {
    all: ['tokenDetail'] as const,
    lists: () => [...queryKeys.tokenDetail.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tokenDetail.lists(), id] as const,
  },
  // Price History
  priceHistory: {
    all: ['priceHistory'] as const,
    lists: () => [...queryKeys.priceHistory.all, 'list'] as const,
    list: (tokenId: string, days: number) =>
      [...queryKeys.priceHistory.lists(), { tokenId, days }] as const,
  },
  // Market Data
  market: {
    all: ['market'] as const,
    global: () => [...queryKeys.market.all, 'global'] as const,
  },
} as const;

export const queryClient = createQueryClient();

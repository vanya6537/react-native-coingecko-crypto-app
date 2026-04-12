/**
 * React Query Hooks
 * Custom hooks for data fetching with caching, pagination, and optimization
 */

import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from '@tanstack/react-query';
import type { Token, TokenDetail, PriceHistory } from '../types/index';
import { coingecko } from './coingecko';
import { queryKeys } from './queryClient';

/**
 * useTokensList - Fetch paginated tokens list with caching
 * 
 * Benefits:
 * - Automatic caching for 5 minutes
 * - Retry on failure (2 times with exponential backoff)
 * - Refetch when window regains focus
 * - Automatic garbage collection after 10 minutes
 */
export const useTokensList = (
  page: number = 1,
  limit: number = 50,
  options?: Partial<UseQueryOptions<Token[]>>
) => {
  return useQuery({
    queryKey: queryKeys.tokens.list(page, limit),
    queryFn: async () => {
      const offset = (page - 1) * limit;
      return coingecko.getTokensList(limit, offset);
    },
    ...options,
  });
};

/**
 * useTokensInfinite - Infinite scroll tokens with automatic pagination
 * 
 * Usage:
 * const {
 *   data,              // pages array with tokens
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useTokensInfinite(50);
 * 
 * Benefits:
 * - Loads pages on demand
 * - Prevents duplicate API calls
 * - Automatically caches each page
 * - Smart refetching strategy
 */
export const useTokensInfinite = (
  pageSize: number = 50,
  options?: Partial<UseInfiniteQueryOptions<Token[], unknown, InfiniteData<Token[]>>
> ) => {
  return useInfiniteQuery({
    queryKey: queryKeys.tokens.infinite(),
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * pageSize;
      return coingecko.getTokensList(pageSize, offset);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    ...options,
  });
};

/**
 * useTokenDetail - Fetch detailed information for single token
 * 
 * Features:
 * - Caches for 10 minutes
 * - Auto-refetches on window focus
 * - Handles stale data intelligently
 */
export const useTokenDetail = (
  tokenId: string,
  options?: Partial<UseQueryOptions<TokenDetail>>
) => {
  return useQuery({
    queryKey: queryKeys.tokenDetail.detail(tokenId),
    queryFn: () => coingecko.getTokenDetail(tokenId),
    enabled: !!tokenId, // Only run if tokenId exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
    ...options,
  });
};

/**
 * usePriceHistory - Fetch price history with caching
 * 
 * Usage:
 * const { data, isLoading } = usePriceHistory('bitcoin', 7);
 */
export const usePriceHistory = (
  tokenId: string,
  days: number = 7,
  options?: Partial<UseQueryOptions<PriceHistory>>
) => {
  return useQuery({
    queryKey: queryKeys.priceHistory.list(tokenId, days),
    queryFn: () => coingecko.getPriceHistory(tokenId, days),
    enabled: !!tokenId,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour - price history stable
    gcTime: 2 * 60 * 60 * 1000, // 2 hours in cache
    ...options,
  });
};

/**
 * useSearchTokens - Search tokens by query string
 * 
 * Usage:
 * const { data, isLoading } = useSearchTokens('bitcoin');
 */
export const useSearchTokens = (
  query: string,
  options?: Partial<UseQueryOptions<Token[]>>
) => {
  return useQuery({
    queryKey: queryKeys.tokens.search(query),
    queryFn: async () => {
      if (!query) return [];
      // Filter tokens by query string
      const tokens = await coingecko.getTokensList(250, 0);
      return tokens.filter(
        (token) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: query.length > 0, // Only search if query exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * usePrefetchTokenDetail - Prefetch token details for upcoming navigation
 * 
 * Usage:
 * const prefetch = usePrefetchTokenDetail();
 * <Text onPress={() => prefetch('bitcoin')}>Bitcoin</Text>
 * 
 * Benefits:
 * - Data loads in background
 * - Instant display when navigated
 */
export const usePrefetchTokenDetail = () => {
  const { queryClient } = require('./queryClient');
  
  return (tokenId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tokenDetail.detail(tokenId),
      queryFn: () => coingecko.getTokenDetail(tokenId),
      staleTime: 10 * 60 * 1000,
    });
  };
};

/**
 * useRefreshTokens - Force refetch tokens data
 * Useful for pull-to-refresh
 */
export const useRefreshTokens = () => {
  const { queryClient } = require('./queryClient');
  
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.tokens.all,
    });
  };
};

/**
 * Query Hook Options Helper - Common options for tokens queries
 */
export const queryOptions = {
  // Data never changes during session - cache aggressively
  stableData: {
    staleTime: Infinity,
    gcTime: Infinity,
  },
  
  // Real-time data - check frequently
  realtimeData: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000,
  },
  
  // Standard caching
  standardData: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
} as const;

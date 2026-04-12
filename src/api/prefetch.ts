/**
 * React Query Prefetching & Optimization
 * Smart data loading with memory optimization
 */

import { QueryClient } from '@tanstack/react-query';
import type { Token, TokenDetail, PriceHistory } from '../types/index';
import { coingeckoAPI } from './coingecko';
import { queryKeys } from './queryClient';

export async function prefetchTokensList(
  queryClient: QueryClient,
  page: number = 1,
  limit: number = 50
) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.tokens.list(page, limit),
    queryFn: async () => {
      const offset = (page - 1) * limit;
      return coingeckoAPI.getTokensList(limit, offset);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export async function prefetchTokenDetail(
  queryClient: QueryClient,
  tokenId: string
) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.tokenDetail.detail(tokenId),
    queryFn: () => coingeckoAPI.getTokenDetail(tokenId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export async function prefetchPriceHistory(
  queryClient: QueryClient,
  tokenId: string,
  days: number = 30
) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.priceHistory.list(tokenId, days),
    queryFn: () => coingeckoAPI.getPriceHistory(tokenId, days),
    staleTime: 30 * 60 * 1000, // 30 minutes for history
  });
}

/**
 * Batch prefetch multiple tokens for performance
 * Reduces individual API calls by loading in parallel
 */
export async function prefetchTokensInBatch(
  queryClient: QueryClient,
  tokenIds: string[],
  batchSize: number = 5
) {
  const batches = [];
  for (let i = 0; i < tokenIds.length; i += batchSize) {
    const batch = tokenIds.slice(i, i + batchSize);
    batches.push(
      Promise.all(batch.map((id) => prefetchTokenDetail(queryClient, id)))
    );
  }
  return Promise.all(batches);
}

/**
 * Intelligent prefetch strategy based on user context
 * Prefetches next page and related data
 */
export async function smartPrefetch(
  queryClient: QueryClient,
  currentPage: number,
  limit: number = 50
) {
  // Prefetch next page
  await prefetchTokensList(queryClient, currentPage + 1, limit);
  
  // Optionally prefetch page after that
  if (currentPage < 5) {
    await prefetchTokensList(queryClient, currentPage + 2, limit);
  }
}

/**
 * Prefetch top trending tokens for quick access
 */
export async function prefetchTrendingTokens(
  queryClient: QueryClient,
  topN: number = 10
) {
  const trendingTokens = await queryClient.fetchQuery({
    queryKey: queryKeys.tokens.lists(),
    queryFn: async () => {
      const tokens = await coingecko.getTokensList(topN, 0);
      return tokens;
    },
  });

  // Prefetch details for trending tokens
  if (trendingTokens) {
    await prefetchTokensInBatch(
      queryClient,
      trendingTokens.slice(0, topN).map((t) => t.id),
      3
    );
  }

  return trendingTokens;
}

/**
 * Memory-efficient cleanup strategy
 * Remove stale data to optimize memory usage
 */
export function optimizeQueryCache(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  // Remove queries that haven't been used for 30 minutes
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  queries.forEach((query) => {
    if (query.observersCount === 0 && query.getObserversCount() === 0) {
      // Query has no active observers
      if (query.state.dataUpdatedAt < thirtyMinutesAgo) {
        queryClient.removeQueries({
          queryKey: query.queryKey,
        });
      }
    }
  });
}

/**
 * Periodic cache optimization
 * Run every 5 minutes in background
 */
export function startCacheOptimization(queryClient: QueryClient) {
  const intervalId = setInterval(() => {
    optimizeQueryCache(queryClient);
  }, 5 * 60 * 1000);

  return () => clearInterval(intervalId);
}

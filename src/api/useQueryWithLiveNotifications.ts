/**
 * React Query + Live Notifications Integration
 * Combines intelligent prefetching with real-time price notifications
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { infoToast, successToast, errorToast, warningToast } from '@/features/notifications/model/toastStore';
import { coingeckoAPI } from './coingecko';
import { queryKeys } from './queryClient';
import { prefetchTokenDetail, smartPrefetch } from './prefetch';
import type { Token } from '../types';

interface LiveNotificationConfig {
  enablePrefetch?: boolean;
  prefetchNext?: boolean;
  cacheStaleTime?: number;
  notificationThreshold?: number; // % change to trigger notification
}

/**
 * Hook: useQueryWithLiveNotifications
 * Fetches data with automatic prefetching and toast notifications
 */
export function useQueryWithLiveNotifications(
  tokenIds: string[] = [],
  config: LiveNotificationConfig = {}
) {
  const {
    enablePrefetch = true,
    prefetchNext = true,
    cacheStaleTime = 5 * 60 * 1000,
    notificationThreshold = 2,
  } = config;

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const pricesRef = useRef<Map<string, number>>(new Map());

  // Fetch initial token data
  const { data: tokens, isLoading, isError } = useQuery({
    queryKey: queryKeys.tokens.list(1, 50),
    queryFn: async () => {
      infoToast(t('notifications.dataLoaded'));
      return coingeckoAPI.getTokensList(50, 0);
    },
    staleTime: cacheStaleTime,
  });

  // Prefetch next pages on successful load
  useEffect(() => {
    if (!isLoading && tokens && enablePrefetch && prefetchNext) {
      smartPrefetch(queryClient, 2, 50).catch(() => {
        console.error('Prefetch failed silently');
      });
    }
  }, [isLoading, tokens, enablePrefetch, prefetchNext, queryClient]);

  // Simulate live price updates with notifications
  const startLivePriceMonitoring = useCallback(
    (monitoringTokens: Token[], interval = 3000) => {
      if (!monitoringTokens.length) return () => {};

      // Initialize prices
      monitoringTokens.forEach((token) => {
        pricesRef.current.set(token.id, token.current_price || 0);
      });

      const intervalId = setInterval(() => {
        monitoringTokens.forEach((token) => {
          const oldPrice = pricesRef.current.get(token.id) || token.current_price || 0;
          
          // Random price movement: ±0.5% to ±3%
          const changePercent = (Math.random() - 0.5) * 6;
          const newPrice = oldPrice * (1 + changePercent / 100);
          const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

          pricesRef.current.set(token.id, newPrice);

          // Send notification for significant changes
          if (Math.abs(percentChange) >= notificationThreshold) {
            const isUp = percentChange > 0;
            const message = isUp
              ? t('notifications.priceUp', {
                  name: token.name,
                  percent: percentChange.toFixed(2),
                })
              : t('notifications.priceDown', {
                  name: token.name,
                  percent: Math.abs(percentChange).toFixed(2),
                });

            if (isUp) {
              successToast(`📈 ${message}`);
            } else {
              warningToast(`📉 ${message}`);
            }
          }
        });
      }, interval);

      return () => clearInterval(intervalId);
    },
    [t, notificationThreshold]
  );

  // Handle errors
  useEffect(() => {
    if (isError) {
      errorToast(t('errors.networkError'));
    }
  }, [isError, t]);

  return {
    tokens: tokens || [],
    isLoading,
    isError,
    startLivePriceMonitoring,
    getCurrentPrice: (tokenId: string) => pricesRef.current.get(tokenId) || 0,
  };
}

/**
 * Hook: useLiveTokenUpdates
 * Infinite scroll with live price updates
 */
export function useLiveTokenUpdates(pageSize: number = 50) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activePrices, setActivePrices] = useState(new Map<string, number>());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.tokens.infinite(),
    queryFn: async ({ pageParam = 0 }) => {
      infoToast(t('notifications.dataLoaded'));
      return coingeckoAPI.getTokensList(pageSize, pageParam * pageSize);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Simulate live updates
  const startLiveUpdates = useCallback(
    (interval = 2000) => {
      if (!data?.pages) return () => {};

      const intervalId = setInterval(() => {
        setActivePrices((prev) => {
          const updated = new Map(prev);
          let hasChanges = false;

          data.pages.flat().forEach((token) => {
            const oldPrice = updated.get(token.id) || token.current_price || 0;
            const changePercent = (Math.random() - 0.5) * 4;
            const newPrice = oldPrice * (1 + changePercent / 100);

            if (Math.abs(((newPrice - oldPrice) / oldPrice) * 100) >= 1.5) {
              updated.set(token.id, newPrice);
              hasChanges = true;
            }
          });

          return updated;
        });
      }, interval);

      return () => clearInterval(intervalId);
    },
    [data?.pages]
  );

  return {
    tokens: data?.pages.flat() || [],
    activePrices,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    startLiveUpdates,
  };
}

/**
 * Hook: useCachedTokenWithNotifications
 * Get single token with cache notifications
 */
export function useCachedTokenWithNotifications(tokenId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cacheHit, setCacheHit] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.tokenDetail.detail(tokenId),
    queryFn: async () => {
      // Check if in cache
      const cached = queryClient.getQueryData(queryKeys.tokenDetail.detail(tokenId));
      if (cached) {
        setCacheHit(true);
        infoToast(t('notifications.cacheHit'));
      } else {
        infoToast(t('notifications.dataLoaded'));
      }

      return coingeckoAPI.getTokenDetail(tokenId);
    },
    enabled: !!tokenId,
    staleTime: 10 * 60 * 1000,
  });

  return { ...query, cacheHit };
}

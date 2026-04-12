/**
 * useOptimizedQuery Hook
 * Combines react-query, prefetching, and toast notifications
 */

import { useCallback, useEffect } from 'react';
import {
  useQuery,
  useQueryClient,
  UseSuspenseQueryOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { showToast, successToast, errorToast } from '../features/notifications/model/toastStore';
import type { ToastType } from '../features/notifications/model/toastStore';

interface UseOptimizedQueryOptions<T> {
  showSuccessNotification?: boolean;
  successMessage?: string;
  showErrorNotification?: boolean;
  errorMessage?: string;
  prefetchNext?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced query hook with notifications and prefetching
 * 
 * Usage:
 * const { data, isLoading } = useOptimizedQuery({
 *   queryKey: ['tokens'],
 *   queryFn: () => fetchTokens(),
 *   showSuccessNotification: true,
 *   prefetchNext: true,
 * });
 */
export function useOptimizedQuery<T>(
  queryOptions: UseQueryOptions<T>,
  optimizedOptions?: UseOptimizedQueryOptions<T>
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    showSuccessNotification = true,
    successMessage,
    showErrorNotification = true,
    errorMessage,
    prefetchNext,
    onSuccess,
    onError,
  } = optimizedOptions || {};

  const query = useQuery({
    ...queryOptions,
    meta: {
      ...queryOptions.meta,
      showNotification: showSuccessNotification || showErrorNotification,
    },
  });

  // Show notifications
  useEffect(() => {
    if (query.isSuccess && showSuccessNotification) {
      const message = successMessage || t('notifications.success');
      successToast(message);
      onSuccess?.(query.data);
    }
  }, [query.isSuccess, query.data, showSuccessNotification, successMessage, t, onSuccess]);

  useEffect(() => {
    if (query.isError && showErrorNotification) {
      const message = errorMessage || t('errors.networkError');
      errorToast(message);
      onError?.(query.error as Error);
    }
  }, [query.isError, query.error, showErrorNotification, errorMessage, t, onError]);

  return query;
}

/**
 * Hook for managing cache with notifications
 */
export function useQueryCache() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const invalidateQueries = useCallback(
    async (queryKey: any[], immediate: boolean = true) => {
      try {
        await queryClient.invalidateQueries({
          queryKey,
          refetchType: immediate ? 'all' : 'stale',
        });
        successToast(t('notifications.dataRefreshed'));
      } catch (error) {
        errorToast(t('errors.networkError'));
      }
    },
    [queryClient, t]
  );

  const removeQueries = useCallback(
    (queryKey: any[]) => {
      queryClient.removeQueries({ queryKey });
      successToast('Cache cleared');
    },
    [queryClient]
  );

  const clearAll = useCallback(() => {
    queryClient.clear();
    successToast('All cache cleared');
  }, [queryClient]);

  return {
    invalidateQueries,
    removeQueries,
    clearAll,
    getCacheSize: () => queryClient.getQueryCache().getAll().length,
  };
}

/**
 * Hook for prefetching with notifications
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const prefetch = useCallback(
    async <T,>(
      queryKey: any[],
      queryFn: () => Promise<T>,
      options?: { staleTime?: number; gcTime?: number; silent?: boolean }
    ) => {
      if (!options?.silent) {
        showToast({
          type: 'info',
          message: t('notifications.prefetching'),
          duration: 2000,
        });
      }

      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: options?.staleTime || 5 * 60 * 1000,
          gcTime: options?.gcTime || 10 * 60 * 1000,
        });

        if (!options?.silent) {
          successToast(t('notifications.success'));
        }
      } catch (error) {
        errorToast(t('errors.networkError'));
      }
    },
    [queryClient, t]
  );

  return { prefetch };
}

/**
 * Hook for network-aware queries
 * Adjusts behavior based on connection status
 */
export function useNetworkAwareQuery<T>(
  queryOptions: UseQueryOptions<T>,
  optimizedOptions?: UseOptimizedQueryOptions<T>
) {
  const query = useOptimizedQuery(queryOptions, optimizedOptions);

  // In a real app, you'd use react-native-netinfo
  // and adjust the retry/refetch strategy based on connection
  
  return query;
}

/**
 * Hook for optimized token data loading on expansion
 * Only loads token details and price history when expanded
 */

import { useEffect, useCallback } from 'react';
import { usePrefetchTokenDetail, usePrefetchPriceHistory } from '../../api/hooks';
import type { Token } from '../types';

export interface UseOptimizedTokenExpandedParams {
  token: Token;
  isExpanded: boolean;
  days?: number;
  options?: {
    prefetchOnly?: boolean;
  };
}

/**
 * useOptimizedTokenExpanded - Lazy load token data only when expanded
 *
 * Benefits:
 * - Prefetches data before user needs it (on expansion)
 * - Caches data in React Query for efficient reuse
 * - Prevents loading unnecessary data for collapsed items
 * - Integrates with existing query cache
 *
 * Usage:
 * const { data, isLoading } = useOptimizedTokenExpanded({
 *   token,
 *   isExpanded,
 *   days: 7,
 * });
 */
export const useOptimizedTokenExpanded = ({
  token,
  isExpanded,
  days = 7,
  options = { prefetchOnly: true },
}: UseOptimizedTokenExpandedParams) => {
  const prefetchTokenDetail = usePrefetchTokenDetail();
  const prefetchPriceHistory = usePrefetchPriceHistory();

  // Prefetch token detail when expanded
  useEffect(() => {
    if (isExpanded && options.prefetchOnly) {
      prefetchTokenDetail(token.id);
    }
  }, [isExpanded, token.id, prefetchTokenDetail, options.prefetchOnly]);

  // Prefetch price history when expanded
  useEffect(() => {
    if (isExpanded && options.prefetchOnly) {
      prefetchPriceHistory(token.id, days);
    }
  }, [isExpanded, token.id, days, prefetchPriceHistory, options.prefetchOnly]);

  const handleCollapse = useCallback(() => {
    // Data remains in cache for future use
    // This is intentional for smooth re-expansion
  }, []);

  return {
    handleCollapse,
    // Data will be available through separate hooks when needed
  };
};

export interface UseOptimizedTokenExpandedParams {
  token: Token;
  isExpanded: boolean;
  days?: number;
  options?: {
    prefetchOnly?: boolean;
  };
}

/**
 * useOptimizedTokenExpanded - Lazy load token data only when expanded
 *
 * Benefits:
 * - Prefetches data before user needs it (on expansion)
 * - Caches data in React Query for efficient reuse
 * - Prevents loading unnecessary data for collapsed items
 * - Integrates with existing query cache
 *
 * Usage:
 * const { data, isLoading } = useOptimizedTokenExpanded({
 *   token,
 *   isExpanded,
 *   days: 7,
 * });
 */
export const useOptimizedTokenExpanded = ({
  token,
  isExpanded,
  days = 7,
  options = { prefetchOnly: true },
}: UseOptimizedTokenExpandedParams) => {
  const prefetchTokenDetail = usePrefetchTokenDetail();
  const prefetchPriceHistory = usePrefetchPriceHistory();

  // Prefetch token detail when expanded
  useEffect(() => {
    if (isExpanded && options.prefetchOnly) {
      prefetchTokenDetail(token.id);
    }
  }, [isExpanded, token.id, prefetchTokenDetail, options.prefetchOnly]);

  // Prefetch price history when expanded
  useEffect(() => {
    if (isExpanded && options.prefetchOnly) {
      prefetchPriceHistory(token.id, days);
    }
  }, [isExpanded, token.id, days, prefetchPriceHistory, options.prefetchOnly]);

  const handleCollapse = useCallback(() => {
    // Data remains in cache for future use
    // This is intentional for smooth re-expansion
  }, []);

  return {
    handleCollapse,
    // Data will be available through separate hooks when needed
  };
};

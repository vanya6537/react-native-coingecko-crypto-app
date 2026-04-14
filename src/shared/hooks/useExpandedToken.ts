/**
 * Custom hook for managing expanded token state efficiently
 * Stores which token is expanded to avoid multiple re-renders
 */

import { useState, useCallback, useMemo } from 'react';

export interface ExpandedTokenState {
  expandedTokenId: string | null;
  isExpanded: (tokenId: string) => boolean;
  toggleExpanded: (tokenId: string) => void;
  collapse: () => void;
}

/**
 * useExpandedToken - Manages which token is expanded
 * 
 * Benefits:
 * - Only one token expanded at a time (memory efficient)
 * - Memoized comparison functions
 * - Prevents unnecessary re-renders of unexpanded items
 * 
 * Usage:
 * const { expandedTokenId, isExpanded, toggleExpanded, collapse } = useExpandedToken();
 */
export const useExpandedToken = (): ExpandedTokenState => {
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null);

  const isExpanded = useCallback(
    (tokenId: string) => expandedTokenId === tokenId,
    [expandedTokenId]
  );

  const toggleExpanded = useCallback((tokenId: string) => {
    setExpandedTokenId((prev) => (prev === tokenId ? null : tokenId));
  }, []);

  const collapse = useCallback(() => {
    setExpandedTokenId(null);
  }, []);

  return useMemo(
    () => ({
      expandedTokenId,
      isExpanded,
      toggleExpanded,
      collapse,
    }),
    [expandedTokenId, isExpanded, toggleExpanded, collapse]
  );
};

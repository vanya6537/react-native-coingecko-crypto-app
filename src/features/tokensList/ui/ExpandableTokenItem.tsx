/**
 * Expandable Token Item Container
 * Orchestrates TokenItem with expansion state and data loading
 */

import React, { memo } from 'react';
import {
  useExpandedToken,
  useOptimizedTokenExpanded,
  type ExpandedTokenState,
} from '../../../shared/hooks';
import { TokenItem, ExpandedTokenInfo } from '../../../shared/ui';
import { useTokenDetail, usePriceHistory } from '../../../api/hooks';
import type { Token } from '../../../shared/types';

interface ExpandableTokenItemProps {
  token: Token;
  expandedState: ExpandedTokenState;
  priceHistoryDays?: number;
}

const ExpandableTokenItemComponent: React.FC<ExpandableTokenItemProps> = ({
  token,
  expandedState,
  priceHistoryDays = 7,
}) => {
  const isExpanded = expandedState.isExpanded(token.id);

  // Optimize data loading only when expanded
  useOptimizedTokenExpanded({
    token,
    isExpanded,
    days: priceHistoryDays,
  });

  // Load token details (will use cache if available)
  const { data: tokenDetail, isLoading: isLoadingDetail } = useTokenDetail(
    token.id,
    {
      enabled: isExpanded,
    }
  );

  // Load price history (will use cache if available)
  const { data: priceHistory, isLoading: isLoadingHistory } = usePriceHistory(
    token.id,
    priceHistoryDays,
    {
      enabled: isExpanded,
    }
  ) as any; // Type assertion needed due to API return type mismatch

  const handleToggleExpand = (tokenId: string) => {
    expandedState.toggleExpanded(tokenId);
  };

  const expandedContent = isExpanded ? (
    <ExpandedTokenInfo
      token={tokenDetail || token}
      priceHistory={priceHistory}
      isLoadingHistory={isLoadingHistory}
    />
  ) : null;

  return (
    <TokenItem
      token={token}
      isExpanded={isExpanded}
      onToggleExpand={handleToggleExpand}
      expandedContent={expandedContent}
      isLoadingExpanded={isLoadingDetail || isLoadingHistory}
    />
  );
};

export const ExpandableTokenItem = memo(
  ExpandableTokenItemComponent,
  (prevProps, nextProps) => {
    // Re-render only if token or expansion state changes
    return (
      prevProps.token.id === nextProps.token.id &&
      prevProps.expandedState.expandedTokenId ===
        nextProps.expandedState.expandedTokenId &&
      prevProps.priceHistoryDays === nextProps.priceHistoryDays
    );
  }
);

ExpandableTokenItem.displayName = 'ExpandableTokenItem';

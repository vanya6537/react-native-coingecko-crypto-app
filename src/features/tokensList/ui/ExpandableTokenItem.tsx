/**
 * Expandable Token Item Container
 * Orchestrates TokenItem with expansion state and data loading
 * Integrated with Effector state for time range selection
 */

import React, { memo, useEffect } from 'react';
import { useUnit } from 'effector-react';
import {
  useExpandedToken,
  useOptimizedTokenExpanded,
  type ExpandedTokenState,
} from '../../../shared/hooks';
import { TokenItem, ExpandedTokenInfo } from '../../../shared/ui';
import { useTokenDetail, usePriceHistory } from '../../../api/hooks';
import {
  $selectedTimeRange,
  $priceHistory,
  $historyLoading,
  fetchPriceHistoryByTimeRange,
  setSelectedTimeRange,
} from '../../../state/tokenDetail';
import type { Token } from '../../../shared/types';

interface ExpandableTokenItemProps {
  token: Token;
  expandedState: ExpandedTokenState;
  priceHistoryDays?: number;
  isFetchingNextPage?: boolean;
}

const ExpandableTokenItemComponent: React.FC<ExpandableTokenItemProps> = ({
  token,
  expandedState,
  priceHistoryDays = 7,
  isFetchingNextPage = false,
}) => {
  const isExpanded = expandedState.isExpanded(token.id);

  // Connect to Effector state for time range selection
  const selectedTimeRange = useUnit($selectedTimeRange);
  const priceHistory = useUnit($priceHistory);
  const historyLoading = useUnit($historyLoading);

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

  // Load price history on expansion or time range change
  useEffect(() => {
    if (isExpanded) {
      fetchPriceHistoryByTimeRange({
        tokenId: token.id,
        timeRange: selectedTimeRange,
      });
    }
  }, [isExpanded, token.id, selectedTimeRange]);

  // Legacy price history fetching for backwards compatibility
  const { data: legacyPriceHistory, isLoading: isLoadingLegacyHistory } =
    usePriceHistory(
      token.id,
      priceHistoryDays,
      {
        enabled: isExpanded && selectedTimeRange === '7d',
      }
    ) as any; // Type assertion needed due to API return type mismatch

  const handleToggleExpand = (tokenId: string) => {
    expandedState.toggleExpanded(tokenId);
  };

  const handleTimeRangeChange = (range: typeof selectedTimeRange) => {
    setSelectedTimeRange(range);
  };

  const expandedContent = isExpanded ? (
    <ExpandedTokenInfo
      token={tokenDetail || token}
      priceHistory={priceHistory.length > 0 ? priceHistory : legacyPriceHistory}
      isLoadingHistory={historyLoading || isLoadingLegacyHistory}
      selectedTimeRange={selectedTimeRange}
      onTimeRangeChange={handleTimeRangeChange}
      showTimeRangeSelector={true}
    />
  ) : null;

  return (
    <TokenItem
      token={token}
      isExpanded={isExpanded}
      onToggleExpand={handleToggleExpand}
      expandedContent={expandedContent}
      isLoadingExpanded={isLoadingDetail || historyLoading || isLoadingLegacyHistory}
      isFetchingNextPage={isFetchingNextPage}
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
      prevProps.priceHistoryDays === nextProps.priceHistoryDays &&
      prevProps.isFetchingNextPage === nextProps.isFetchingNextPage
    );
  }
);

ExpandableTokenItem.displayName = 'ExpandableTokenItem';

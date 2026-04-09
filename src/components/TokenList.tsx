import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import type { Token, ListFilters } from '../types/index';
import { TokenItem } from './TokenItem';
import { ErrorState, EmptyState } from './StateComponents';
import { TokenListLoadingSkeleton } from './SkeletonLoader';
import { filterTokens } from '../utils/formatters';

interface TokenListProps {
  tokens: Token[];
  filters: ListFilters;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onTokenPress?: (token: Token) => void;
  onRetry?: () => void;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  filters,
  isLoading,
  error,
  isEmpty,
  onTokenPress,
  onRetry,
}: TokenListProps) => {
  const filteredTokens = filterTokens(
    tokens,
    filters.search,
    filters.sortBy,
    filters.sortOrder
  );

  if (isLoading && tokens.length === 0) {
    return <TokenListLoadingSkeleton />;
  }

  if (error && tokens.length === 0) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isEmpty || filteredTokens.length === 0) {
    return <EmptyState message="No tokens found" />;
  }

  return (
    <FlatList
      data={filteredTokens}
      keyExtractor={(item: Token) => item.id}
      renderItem={({ item }: { item: Token }) => (
        <TokenItem token={item} onPress={onTokenPress} />
      )}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
});

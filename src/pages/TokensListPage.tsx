/**
 * Pages - Tokens List Page
 * Composes TokensList feature
 */
import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useUnit } from 'effector-react';
import type { Token } from '../shared/types';
import {
  fetchInitialTokens,
  refreshTokens,
  fetchNextPage,
  setFilters,
  $tokens,
  $filters,
  $uiState,
  $isLoadingInitial,
  $isRefreshing,
  $isFetchingNextPage,
  $hasMore,
} from '../features/tokensList';
import { TokenItem, FilterBar } from '../components';
import { ErrorState, EmptyState } from '../components/StateComponents';
import { TokenListLoadingSkeleton } from '../components/SkeletonLoader';
import { filterTokens } from '../shared/utils/formatters';

interface TokensListPageProps {
  navigation: any;
}

export const TokensListPage: React.FC<TokensListPageProps> = ({ navigation }: TokensListPageProps) => {
  const [tokens, filters, uiState, isLoadingInitial, isRefreshing, isFetchingNextPage, hasMore] = useUnit([
    $tokens,
    $filters,
    $uiState,
    $isLoadingInitial,
    $isRefreshing,
    $isFetchingNextPage,
    $hasMore,
  ]);

  // Initial load on mount
  useEffect(() => {
    fetchInitialTokens();
  }, []);

  // Memoize filtered tokens
  const filteredTokens = useMemo(() => {
    return filterTokens(tokens, filters.search, filters.sortBy, filters.sortOrder);
  }, [tokens, filters]);

  const handleRetry = useCallback(() => {
    fetchInitialTokens();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshTokens();
  }, []);

  const handleEndReached = useCallback(() => {
    // Only fetch if:
    // - not already fetching next page
    // - more data available
    // - not still loading initial data
    // - tokens exist (avoid fetching on empty list)
    if (
      !isFetchingNextPage && 
      hasMore && 
      !isLoadingInitial && 
      tokens.length > 0
    ) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, isLoadingInitial, tokens.length]);

  const handleTokenPress = useCallback((token: Token) => {
    navigation.navigate('TokenDetail', { tokenId: token.id });
  }, [navigation]);

  if (isLoadingInitial && tokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TokenListLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (uiState.error && tokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={uiState.error} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  if (uiState.isEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <EmptyState message="No tokens found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTokens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TokenItem token={item} onPress={handleTokenPress} />
        )}
        ListHeaderComponent={() => (
          <FilterBar filters={filters} onFilterChange={setFilters} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListFooterComponent={() =>
          isFetchingNextPage && hasMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#1976D2" />
            </View>
          ) : null
        }
        // Performance optimizations
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

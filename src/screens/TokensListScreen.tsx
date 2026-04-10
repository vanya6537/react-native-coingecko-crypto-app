import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { useStore } from 'effector-react';
import type { Token } from '../types/index';
import {
  fetchInitialTokens,
  fetchNextPage,
  setFilters,
  $tokens,
  $filters,
  $uiState,
  $isLoadingInitial,
  $isFetchingNextPage,
  $hasMore,
} from '../state/index';
import { TokenItem, FilterBar } from '../components/index';
import { ErrorState, EmptyState } from '../components/StateComponents';
import { TokenListLoadingSkeleton } from '../components/SkeletonLoader';
import { filterTokens } from '../utils/formatters';

export const TokensListScreen: React.FC<{ navigation: any }> = ({ navigation }: { navigation: any }) => {
  const tokens = useStore($tokens);
  const filters = useStore($filters);
  const uiState = useStore($uiState);
  const isLoadingInitial = useStore($isLoadingInitial);
  const isFetchingNextPage = useStore($isFetchingNextPage);
  const hasMore = useStore($hasMore);

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

  // Handle infinite scroll with debounce to prevent multiple rapid calls
  const handleEndReached = useCallback(() => {
    if (!isFetchingNextPage && hasMore && tokens.length > 0) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, tokens.length]);

  // Handle token press - navigate to detail screen
  const handleTokenPress = useCallback((token: Token) => {
    navigation.navigate('TokenDetail', { tokenId: token.id });
  }, [navigation]);

  // Render empty/error states
  if (isLoadingInitial && tokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <TokenListLoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (uiState.error && tokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <ErrorState error={uiState.error} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  if (uiState.isEmpty && filteredTokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <FilterBar filters={filters} onFilterChange={setFilters} />
        <EmptyState message="No tokens found" />
      </SafeAreaView>
    );
  }

  // Render token item with memo optimization
  const renderTokenItem: ListRenderItem<Token> = ({ item }) => (
    <TokenItem
      token={item}
      onPress={handleTokenPress}
    />
  );

  // Render footer for loading on next page
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1976D2" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  // Render header with title and counter
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Crypto Tokens</Text>
      <Text style={styles.subtitle}>
        {filteredTokens.length} of {tokens.length} tokens
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTokens}
        keyExtractor={(item: Token) => item.id}
        renderItem={renderTokenItem}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.listHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />
      <FilterBar filters={filters} onFilterChange={setFilters} />
    </SafeAreaView>
  );
};

const ITEM_HEIGHT = 100; // Approximate height of TokenItem, adjust as needed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listHeader: {
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

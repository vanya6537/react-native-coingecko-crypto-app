import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
import { TokenItem } from '../components/index';
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

  const handleSearch = useCallback((text: string) => {
    setFilters({ search: text });
  }, []);

  const handleSortChange = useCallback((sortBy: string) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({ sortBy: sortBy as any, sortOrder: newOrder as any });
  }, [filters.sortBy, filters.sortOrder]);

  const handleRetry = useCallback(() => {
    fetchInitialTokens();
  }, []);

  // Handle infinite scroll
  const handleEndReached = useCallback(() => {
    if (!isFetchingNextPage && hasMore && tokens.length > 0) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, tokens.length]);

  // Render empty/error states
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

  if (uiState.isEmpty && filteredTokens.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState message="No tokens found" />
      </SafeAreaView>
    );
  }

  // Render token item
  const renderTokenItem: ListRenderItem<Token> = ({ item }) => (
    <TokenItem
      token={item}
      onPress={(token: Token) => {
        navigation.navigate('TokenDetail', { tokenId: token.id });
      }}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Crypto Tokens</Text>
        <Text style={styles.subtitle}>{tokens.length} tokens loaded</Text>
      </View>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tokens..."
          value={filters.search}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Sort filters */}
      <View style={styles.filterScroll}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.sortBy === 'market_cap' && styles.filterButtonActive,
          ]}
          onPress={() => handleSortChange('market_cap')}
        >
          <Text
            style={[
              styles.filterText,
              filters.sortBy === 'market_cap' && styles.filterTextActive,
            ]}
          >
            Market Cap
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.sortBy === 'price' && styles.filterButtonActive,
          ]}
          onPress={() => handleSortChange('price')}
        >
          <Text
            style={[
              styles.filterText,
              filters.sortBy === 'price' && styles.filterTextActive,
            ]}
          >
            Price
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filters.sortBy === 'change24h' && styles.filterButtonActive,
          ]}
          onPress={() => handleSortChange('change24h')}
        >
          <Text
            style={[
              styles.filterText,
              filters.sortBy === 'change24h' && styles.filterTextActive,
            ]}
          >
            24h Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Token FlatList with infinite scroll */}
      <FlatList
        data={filteredTokens}
        keyExtractor={(item: Token) => item.id}
        renderItem={renderTokenItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#1976D2',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
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

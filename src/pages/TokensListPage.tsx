/**
 * Pages - Tokens List Page
 * Composes TokensList feature with scroll animations
 */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Activity } from 'lucide-react-native';
import { useUnit } from 'effector-react';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import type { Token } from '../shared/types';
import { useExpandedToken } from '../shared/hooks';
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
  ExpandableTokenItem,
} from '../features/tokensList';
import { FilterBar } from '../components';
import { ErrorState, EmptyState } from '../components/StateComponents';
import { TokenListLoadingSkeleton } from '../components/SkeletonLoader';
import { LanguageToggler } from '../shared/ui/LanguageToggler';
import { filterTokens, sortTokens } from '../shared/utils/formatters';

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

  const [isSorted, setIsSorted] = useState(false);
  const expandedState = useExpandedToken();

  // Initial load on mount
  useEffect(() => {
    fetchInitialTokens();
  }, []);

  // Apply only search filter (NO reordering)
  const searchFilteredTokens = useMemo(() => {
    return filterTokens(tokens, filters.search);
  }, [tokens, filters.search]);

  // Apply sort only if explicitly enabled
  const displayTokens = useMemo(() => {
    if (isSorted) {
      return sortTokens(searchFilteredTokens, filters.sortBy, filters.sortOrder);
    }
    return searchFilteredTokens;
  }, [searchFilteredTokens, isSorted, filters.sortBy, filters.sortOrder]);

  const handleRetry = useCallback(() => {
    fetchInitialTokens();
  }, []);

  const handleRefresh = useCallback(() => {
    refreshTokens();
  }, []);

  const handleEndReached = useCallback(() => {
    if (
      !isFetchingNextPage && 
      hasMore && 
      !isLoadingInitial && 
      tokens.length > 0 &&
      !isSorted // Don't infinite scroll when sorted
    ) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, isLoadingInitial, tokens.length, isSorted]);


  const handleSortToggle = useCallback(() => {
    setIsSorted(!isSorted);
  }, [isSorted]);

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
        <FilterBar 
          filters={filters} 
          onFilterChange={setFilters}
          isSorted={isSorted}
          onSortToggle={handleSortToggle}
        />
        <EmptyState message="No tokens found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayTokens}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(400).delay(index * 50)}
            layout={Layout.springify()}
          >
            <ExpandableTokenItem
              token={item}
              expandedState={expandedState}
              priceHistoryDays={7}
            />
          </Animated.View>
        )}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Tokens</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('NotificationsDemo')}
                style={styles.notificationButton}
              >
                <Activity size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <FilterBar 
              filters={filters} 
              onFilterChange={setFilters}
              isSorted={isSorted}
              onSortToggle={handleSortToggle}
            />
          </>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        ListFooterComponent={() =>
          isFetchingNextPage && hasMore && !isSorted ? (
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  notificationButton: {
    padding: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

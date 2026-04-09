import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Token, ListFilters } from '@types/index';
import { TokenItem } from './TokenItem';
import { filterTokens } from '@utils/formatters';

interface TokenListProps {
  tokens: Token[];
  filters: ListFilters;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onTokenPress?: (token: Token) => void;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  filters,
  isLoading,
  error,
  isEmpty,
  onTokenPress,
}) => {
  const filteredTokens = filterTokens(
    tokens,
    filters.search,
    filters.sortBy,
    filters.sortOrder
  );

  if (isLoading && tokens.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading tokens...</Text>
      </View>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  if (isEmpty || filteredTokens.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>📭 No tokens found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your search filters</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredTokens}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TokenItem token={item} onPress={onTokenPress} />
      )}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
});

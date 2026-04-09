import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { useStore } from 'effector-react';
import type { Token } from '../types/index';
import { fetchTokens, setFilters, $tokens, $filters, $uiState, resetTokens } from '../state/index';
import { TokenList } from '../components/index';

export const TokensListScreen: React.FC<{ navigation: any }> = ({ navigation }: { navigation: any }) => {
  const tokens = useStore($tokens);
  const filters = useStore($filters);
  const uiState = useStore($uiState);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTokens({ page });
  }, [page]);

  const handleSearch = (text: string) => {
    setFilters({ search: text });
  };

  const handleSortChange = (sortBy: string) => {
    const newOrder =
      filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({ sortBy: sortBy as any, sortOrder: newOrder as any });
  };

  const handleRetry = () => {
    setPage(1);
    resetTokens();
    setTimeout(() => fetchTokens({ page: 1 }), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crypto Tokens</Text>
        <Text style={styles.subtitle}>{tokens.length} tokens</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tokens..."
          value={filters.search}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
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
      </ScrollView>

      <ScrollView style={styles.listContainer} contentContainerStyle={{ flexGrow: 1 }}>
        <TokenList
          tokens={tokens}
          filters={filters}
          isLoading={uiState.isLoading}
          error={uiState.error}
          isEmpty={uiState.isEmpty}
          onTokenPress={(token: Token) => {
            navigation.navigate('TokenDetail', { tokenId: token.id });
          }}
          onRetry={handleRetry}
        />
      </ScrollView>

      {tokens.length >= 50 && !uiState.isLoading && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={() => setPage(page + 1)}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
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
    paddingHorizontal: 16,
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 8,
    marginBottom: 8,
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
  listContainer: {
    flex: 1,
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

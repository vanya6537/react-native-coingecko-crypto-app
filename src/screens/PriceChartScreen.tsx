import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useUnit } from 'effector-react';
import {
  $tokenDetail,
  $priceHistory,
  $detailLoading,
  $historyLoading,
  $historyError,
  fetchTokenDetail,
  fetchPriceHistory,
} from '../state/index';
import { ExpandedPriceChart } from '../components/ExpandedPriceChart';
import { formatPrice, formatChange, formatMarketCap } from '../utils/formatters';

export const PriceChartScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { tokenId, tokenName } = route.params;
  const [tokenDetail, priceHistory, detailLoading, historyLoading, historyError] = useUnit([
    $tokenDetail,
    $priceHistory,
    $detailLoading,
    $historyLoading,
    $historyError,
  ]);

  useEffect(() => {
    fetchTokenDetail(tokenId);
    fetchPriceHistory(tokenId);
  }, [tokenId]);

  if (detailLoading || historyLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </SafeAreaView>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{historyError || 'No price data available'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const changeColor =
    typeof tokenDetail?.price_change_percentage_24h === 'number'
      ? tokenDetail.price_change_percentage_24h >= 0
        ? '#00C853'
        : '#D32F2F'
      : '#666';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with token info */}
        {tokenDetail && (
          <View style={styles.header}>
            <Text style={styles.tokenName}>{tokenDetail.name}</Text>
            <Text style={styles.currentPrice}>{formatPrice(tokenDetail.current_price)}</Text>
            <Text style={[styles.priceChange, { color: changeColor }]}>
              {formatChange(tokenDetail.price_change_percentage_24h)}
            </Text>
          </View>
        )}

        {/* Interactive expanded chart */}
        {priceHistory.length > 0 && (
          <ExpandedPriceChart data={priceHistory} tokenName={tokenName || tokenId} />
        )}

        {/* Additional stats */}
        {tokenDetail && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Market Statistics</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Market Rank</Text>
                <Text style={styles.detailValue}>#{tokenDetail.market_cap_rank || 'N/A'}</Text>
              </View>

              {tokenDetail.market_cap && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Market Cap</Text>
                  <Text style={styles.detailValue}>
                    {formatMarketCap(tokenDetail.market_cap)}
                  </Text>
                </View>
              )}

              {tokenDetail.total_volume && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>24h Volume</Text>
                  <Text style={styles.detailValue}>
                    {formatMarketCap(tokenDetail.total_volume)}
                  </Text>
                </View>
              )}

              {tokenDetail.ath && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>All-Time High</Text>
                  <Text style={styles.detailValue}>{formatPrice(tokenDetail.ath)}</Text>
                </View>
              )}

              {tokenDetail.atl && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>All-Time Low</Text>
                  <Text style={styles.detailValue}>{formatPrice(tokenDetail.atl)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
});
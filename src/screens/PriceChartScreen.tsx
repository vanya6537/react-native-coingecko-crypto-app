import React, { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  RefreshControl,
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
import {
  ErrorState,
  FullscreenChartLoadingSkeleton,
  StatsSection,
  TokenPriceSummary,
} from '../components';
import { ExpandedPriceChart } from '../components/ExpandedPriceChart';
import { formatPrice, formatChange, formatMarketCap } from '../utils/formatters';

export const PriceChartScreen: React.FC<{ route: any; navigation: any }> = ({ route }) => {
  const { tokenId, tokenName } = route.params;
  const [tokenDetail, priceHistory, detailLoading, historyLoading, historyError] = useUnit([
    $tokenDetail,
    $priceHistory,
    $detailLoading,
    $historyLoading,
    $historyError,
  ]);

  const handleRefresh = useCallback(() => {
    fetchTokenDetail(tokenId);
    fetchPriceHistory(tokenId);
  }, [tokenId]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleRetry = () => {
    handleRefresh();
  };

  if (detailLoading || historyLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FullscreenChartLoadingSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={historyError || 'No price data available'} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  const changeColor =
    typeof tokenDetail?.price_change_percentage_24h === 'number'
      ? tokenDetail.price_change_percentage_24h >= 0
        ? '#00C853'
        : '#D32F2F'
      : '#666';
  const isRefreshing = (detailLoading || historyLoading) && (!!tokenDetail || priceHistory.length > 0);
  const marketStats = tokenDetail
    ? [
        {
          label: 'Market Rank',
          value: `#${tokenDetail.market_cap_rank || 'N/A'}`,
        },
        ...(tokenDetail.market_cap
          ? [{ label: 'Market Cap', value: formatMarketCap(tokenDetail.market_cap) }]
          : []),
        ...(tokenDetail.total_volume
          ? [{ label: '24h Volume', value: formatMarketCap(tokenDetail.total_volume) }]
          : []),
        ...(tokenDetail.ath
          ? [{ label: 'All-Time High', value: formatPrice(tokenDetail.ath) }]
          : []),
        ...(tokenDetail.atl
          ? [{ label: 'All-Time Low', value: formatPrice(tokenDetail.atl) }]
          : []),
      ]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1976D2" />
        }
      >
        {tokenDetail && (
          <View style={styles.header}>
            <Text style={styles.tokenName}>{tokenDetail.name}</Text>
            <TokenPriceSummary
              price={formatPrice(tokenDetail.current_price)}
              change={formatChange(tokenDetail.price_change_percentage_24h)}
              changeColor={changeColor}
              containerStyle={styles.headerPriceSummary}
            />
          </View>
        )}

        {priceHistory.length > 0 && (
          <ExpandedPriceChart data={priceHistory} tokenName={tokenName || tokenId} />
        )}

        {tokenDetail && (
          <StatsSection
            title="Market Statistics"
            items={marketStats}
            containerStyle={styles.detailsSection}
          />
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
  headerPriceSummary: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
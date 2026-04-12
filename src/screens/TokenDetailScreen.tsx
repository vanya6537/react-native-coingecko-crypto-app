import React, { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { useUnit } from 'effector-react';
import {
  $tokenDetail,
  $priceHistory,
  $detailLoading,
  $historyLoading,
  $detailError,
  fetchTokenDetail,
  fetchPriceHistory,
} from '../state/index';
import {
  ChartLoadingSkeleton,
  ChartSectionHeader,
  DescriptionSection,
  ErrorState,
  PriceChart,
  StatsSection,
  TokenDetailLoadingSkeleton,
  TokenIdentityHeader,
  TokenPriceSummary,
} from '../components/index';
import { formatPrice, formatChange, formatMarketCap } from '../utils/formatters';

const PHI = 1.618;
const ENTRANCE_BASE_DURATION = 420;
const ENTRANCE_BASE_DISTANCE = 18;

const luxuryEnter = (delay: number, distanceMultiplier: number = 1) =>
  FadeIn
    .duration(ENTRANCE_BASE_DURATION)
    .delay(delay)
    .easing(Easing.bezier(0.22, 1, 0.36, 1))
    .withInitialValues({
      opacity: 0,
      transform: [
        { translateY: ENTRANCE_BASE_DISTANCE * distanceMultiplier },
        { scale: 0.985 },
      ],
    });

const luxuryLayout = Layout
  .springify()
  .damping(18 * PHI)
  .stiffness(140 / PHI)
  .mass(0.95);

export const TokenDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { tokenId } = route.params;
  const [tokenDetail, priceHistory, detailLoading, historyLoading, detailError] = useUnit([
    $tokenDetail,
    $priceHistory,
    $detailLoading,
    $historyLoading,
    $detailError,
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

  if (detailLoading && !tokenDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TokenDetailLoadingSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!tokenDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={detailError || 'Failed to load token'} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  const changeColor =
    typeof tokenDetail.price_change_percentage_24h === 'number'
      ? tokenDetail.price_change_percentage_24h >= 0
        ? '#00C853'
        : '#D32F2F'
      : '#666';
  const isRefreshing = (detailLoading || historyLoading) && (!!tokenDetail || priceHistory.length > 0);
  const detailStats = [
    {
      label: 'Market Cap Rank',
      value: `#${tokenDetail.market_cap_rank || 'N/A'}`,
    },
    ...(tokenDetail.market_cap
      ? [{ label: 'Market Cap', value: formatMarketCap(tokenDetail.market_cap) }]
      : []),
    ...(tokenDetail.ath
      ? [{ label: 'All-Time High', value: formatPrice(tokenDetail.ath) }]
      : []),
    ...(tokenDetail.atl
      ? [{ label: 'All-Time Low', value: formatPrice(tokenDetail.atl) }]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#1976D2" />
        }
      >
        <Animated.View
          entering={luxuryEnter(0, 0.55)}
          layout={luxuryLayout}
        >
          <TokenIdentityHeader
            image={tokenDetail.image}
            name={tokenDetail.name}
            symbol={tokenDetail.symbol}
          />
        </Animated.View>

        <Animated.View
          entering={luxuryEnter(Math.round(ENTRANCE_BASE_DURATION / PHI), 0.8)}
          layout={luxuryLayout}
        >
          <TokenPriceSummary
            price={formatPrice(tokenDetail.current_price)}
            change={formatChange(tokenDetail.price_change_percentage_24h)}
            changeColor={changeColor}
          />
        </Animated.View>

        <Animated.View
          style={styles.statsSection}
          entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * PHI), 1)}
          layout={luxuryLayout}
        >
          <StatsSection items={detailStats} />
        </Animated.View>

        {historyLoading && priceHistory.length === 0 ? (
          <View style={styles.chartContainer}>
            <ChartSectionHeader
              title="7-Day Price History"
              actionLabel="📈 Fullscreen"
              disabled={true}
            />
            <ChartLoadingSkeleton height={180} compact={true} />
          </View>
        ) : priceHistory.length > 0 ? (
          <Animated.View
            style={styles.chartContainer}
            entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * (PHI + 0.45)), 1.1)}
            layout={luxuryLayout}
          >
            <ChartSectionHeader
              title="7-Day Price History"
              actionLabel="📈 Fullscreen"
              onPress={() =>
                navigation.navigate('PriceChart', {
                  tokenId,
                  tokenName: tokenDetail.name,
                })
              }
            />
            <PriceChart data={priceHistory} height={280} />
            <Text style={styles.chartHint}>👆 Tap & drag to explore prices</Text>
          </Animated.View>
        ) : null}

        {tokenDetail.description && (
          <Animated.View
            entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * (PHI + 1)), 0.9)}
            layout={luxuryLayout}
          >
            <DescriptionSection description={tokenDetail.description} />
          </Animated.View>
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
  statsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  chartContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  chartHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

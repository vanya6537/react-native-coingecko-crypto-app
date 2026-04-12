/**
 * Pages - Token Detail Page
 * Composes TokenDetail feature
 */
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
} from '../features/tokenDetail';
import {
  TokenDetailLoadingSkeleton,
  TokenIdentityHeader,
  TokenPriceSummary,
  ChartSectionHeader,
  DescriptionSection,
  StatsSection,
  PriceChart,
} from '../components';
import { ErrorState } from '../components/StateComponents';
import { formatPrice, formatChange, formatMarketCap } from '../shared/utils/formatters';
import { LanguageToggler } from '../shared/ui/LanguageToggler';

interface TokenDetailPageProps {
  route: any;
  navigation: any;
}

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

export const TokenDetailPage: React.FC<TokenDetailPageProps> = ({
  route,
  navigation,
}: TokenDetailPageProps) => {
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

  const handleExpandChart = () => {
    if (tokenDetail) {
      navigation.navigate('PriceChart', {
        tokenId,
        tokenName: tokenDetail.name,
      });
    }
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
        <ErrorState
          error={detailError || 'Token not found'}
          onRetry={handleRetry}
          showRetry={!!handleRetry}
        />
      </SafeAreaView>
    );
  }

  const changeColor = (tokenDetail.price_change_percentage_24h ?? 0) >= 0 ? '#00C853' : '#D32F2F';
  const statsItems = [
    { label: 'Market Cap Rank', value: `#${tokenDetail.market_cap_rank ?? 'N/A'}` },
    { label: 'Current Price', value: formatPrice(tokenDetail.current_price) },
    { label: 'Market Cap', value: formatMarketCap(tokenDetail.market_cap) },
    { label: '24h Volume', value: formatMarketCap(tokenDetail.total_volume) },
    { label: 'ATH', value: formatPrice(tokenDetail.ath) },
    { label: 'ATL', value: formatPrice(tokenDetail.atl) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.languageContainer}>
        <LanguageToggler compact={true} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={detailLoading && !!tokenDetail} onRefresh={handleRefresh} />
        }
      >
        {/* Token Identity Header */}
        <Animated.View entering={luxuryEnter(0, 1)} layout={luxuryLayout}>
          <TokenIdentityHeader
            image={tokenDetail.image}
            name={tokenDetail.name}
            symbol={tokenDetail.symbol}
          />
        </Animated.View>

        {/* Price Summary */}
        <Animated.View entering={luxuryEnter(60, 1.2)} layout={luxuryLayout}>
          <TokenPriceSummary
            price={formatPrice(tokenDetail.current_price)}
            change={formatChange(tokenDetail.price_change_percentage_24h)}
            changeColor={changeColor}
            containerStyle={styles.priceSectionStyle}
          />
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={luxuryEnter(120, 1.4)} layout={luxuryLayout}>
          <StatsSection items={statsItems} containerStyle={styles.statsSectionStyle} />
        </Animated.View>

        {/* Price Chart */}
        {priceHistory.length > 0 && (
          <Animated.View entering={luxuryEnter(180, 1.6)} layout={luxuryLayout}>
            <View style={styles.chartContainer}>
              <ChartSectionHeader
                title="7-Day Price History"
                actionLabel="Expand"
                onPress={handleExpandChart}
              />
              {historyLoading ? (
                <Text style={styles.loadingText}>Loading chart...</Text>
              ) : (
                <PriceChart data={priceHistory} height={300} />
              )}
            </View>
          </Animated.View>
        )}

        {/* Description */}
        {tokenDetail.description && (
          <Animated.View entering={luxuryEnter(240, 1.8)} layout={luxuryLayout}>
            <DescriptionSection description={tokenDetail.description} />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  priceSectionStyle: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statsSectionStyle: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 40,
  },
});

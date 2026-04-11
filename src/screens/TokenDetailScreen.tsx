import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
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
  ErrorState,
  PriceChart,
  TokenDetailLoadingSkeleton,
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

  useEffect(() => {
    fetchTokenDetail(tokenId);
    fetchPriceHistory(tokenId);
  }, [tokenId]);

  const handleRetry = () => {
    fetchTokenDetail(tokenId);
    fetchPriceHistory(tokenId);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={styles.header}
          entering={luxuryEnter(0, 0.55)}
          layout={luxuryLayout}
        >
          <Image source={{ uri: tokenDetail.image }} style={styles.tokenImage} />
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>{tokenDetail.name}</Text>
            <Text style={styles.tokenSymbol}>{tokenDetail.symbol.toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Price Section */}
        <Animated.View
          style={styles.priceSection}
          entering={luxuryEnter(Math.round(ENTRANCE_BASE_DURATION / PHI), 0.8)}
          layout={luxuryLayout}
        >
          <Text style={styles.currentPrice}>{formatPrice(tokenDetail.current_price)}</Text>
          <Text style={[styles.change24h, { color: changeColor }]}>
            {formatChange(tokenDetail.price_change_percentage_24h)}
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={styles.statsGrid}
          entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * PHI), 1)}
          layout={luxuryLayout}
        >
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Market Cap Rank</Text>
            <Text style={styles.statValue}>#{tokenDetail.market_cap_rank || 'N/A'}</Text>
          </View>

          {tokenDetail.market_cap && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Market Cap</Text>
              <Text style={styles.statValue}>{formatMarketCap(tokenDetail.market_cap)}</Text>
            </View>
          )}

          {tokenDetail.ath && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>All-Time High</Text>
              <Text style={styles.statValue}>{formatPrice(tokenDetail.ath)}</Text>
            </View>
          )}

          {tokenDetail.atl && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>All-Time Low</Text>
              <Text style={styles.statValue}>{formatPrice(tokenDetail.atl)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Price Chart */}
        {historyLoading && priceHistory.length === 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>7-Day Price History</Text>
              <TouchableOpacity style={styles.expandButton} disabled={true} activeOpacity={1}>
                <Text style={styles.expandButtonText}>📈 Fullscreen</Text>
              </TouchableOpacity>
            </View>
            <ChartLoadingSkeleton height={180} compact={true} />
          </View>
        ) : priceHistory.length > 0 ? (
          <Animated.View
            style={styles.chartContainer}
            entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * (PHI + 0.45)), 1.1)}
            layout={luxuryLayout}
          >
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>7-Day Price History</Text>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() =>
                  navigation.navigate('PriceChart', {
                    tokenId,
                    tokenName: tokenDetail.name,
                  })
                }
              >
                <Text style={styles.expandButtonText}>📈 Fullscreen</Text>
              </TouchableOpacity>
            </View>
            <PriceChart data={priceHistory} height={230} />
            <Text style={styles.chartHint}>👆 Tap & drag to explore prices</Text>
          </Animated.View>
        ) : null}

        {/* Description */}
        {tokenDetail.description && (
          <Animated.View
            style={styles.descriptionContainer}
            entering={luxuryEnter(Math.round((ENTRANCE_BASE_DURATION / PHI) * (PHI + 1)), 0.9)}
            layout={luxuryLayout}
          >
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{tokenDetail.description}</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tokenImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: 'flex-start',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
  },
  change24h: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  chartContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  expandButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  chartHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
});

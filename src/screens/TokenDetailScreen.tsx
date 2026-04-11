import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { useUnit } from 'effector-react';
import {
  $tokenDetail,
  $priceHistory,
  $detailLoading,
  $historyLoading,
  fetchTokenDetail,
  fetchPriceHistory,
} from '../state/index';
import { PriceChart } from '../components/index';
import { formatPrice, formatChange, formatMarketCap } from '../utils/formatters';

export const TokenDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { tokenId } = route.params;
  const [tokenDetail, priceHistory, detailLoading, historyLoading] = useUnit([
    $tokenDetail,
    $priceHistory,
    $detailLoading,
    $historyLoading,
  ]);

  useEffect(() => {
    fetchTokenDetail(tokenId);
    fetchPriceHistory(tokenId);
  }, [tokenId]);

  if (detailLoading && !tokenDetail) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!tokenDetail) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load token</Text>
      </View>
    );
  }

  const changeColor = tokenDetail.price_change_percentage_24h >= 0 ? '#00C853' : '#D32F2F';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={styles.header}
          entering={FadeIn.duration(300)}
          layout={Layout.springify()}
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
          entering={FadeIn.duration(400).delay(100)}
          layout={Layout.springify()}
        >
          <Text style={styles.currentPrice}>{formatPrice(tokenDetail.current_price)}</Text>
          <Text style={[styles.change24h, { color: changeColor }]}>
            {formatChange(tokenDetail.price_change_percentage_24h)}
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={styles.statsGrid}
          entering={SlideInUp.duration(400).delay(150)}
          layout={Layout.springify()}
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
          <View style={styles.chartLoader}>
            <ActivityIndicator size="small" color="#1976D2" />
            <Text style={styles.chartLoaderText}>Loading chart...</Text>
          </View>
        ) : priceHistory.length > 0 ? (
          <Animated.View
            style={styles.chartContainer}
            entering={SlideInUp.duration(500).delay(200)}
            layout={Layout.springify()}
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
            <PriceChart data={priceHistory} height={180} />
            <Text style={styles.chartHint}>👆 Tap & drag to explore prices</Text>
          </Animated.View>
        ) : null}

        {/* Description */}
        {tokenDetail.description && (
          <Animated.View
            style={styles.descriptionContainer}
            entering={FadeIn.duration(400).delay(250)}
            layout={Layout.springify()}
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
  chartLoader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  chartLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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

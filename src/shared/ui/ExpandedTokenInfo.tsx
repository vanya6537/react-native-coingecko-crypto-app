/**
 * Expanded token information display with fancy animations
 * Shows additional token details, price chart, and statistics with staggered animations
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  BounceInUp,
  ZoomIn,
  Layout,
  staggeredWith,
} from 'react-native-reanimated';
import type { Token, PriceHistory } from '../types';
import { formatPrice } from '../utils/formatters';
import { PriceChart } from './PriceChart';

interface StatItem {
  label: string;
  value: string;
}

interface ExpandedTokenInfoProps {
  token: Token;
  priceHistory?: PriceHistory[];
  isLoadingHistory?: boolean;
  stats?: StatItem[];
}

const AnimatedView = Animated.createAnimatedComponent(View);

const ExpandedTokenInfoComponent: React.FC<ExpandedTokenInfoProps> = ({
  token,
  priceHistory,
  isLoadingHistory = false,
  stats,
}) => {
  const defaultStats: StatItem[] =
    stats ||
    [
      {
        label: 'Market Cap',
        value: token.market_cap ? formatPrice(token.market_cap) : 'N/A',
      },
      {
        label: 'Volume',
        value: token.total_volume ? formatPrice(token.total_volume) : 'N/A',
      },
      {
        label: 'ATH',
        value: token.ath ? formatPrice(token.ath) : 'N/A',
      },
      {
        label: 'ATL',
        value: token.atl ? formatPrice(token.atl) : 'N/A',
      },
      {
        label: 'Market Cap Rank',
        value: token.market_cap_rank ? `#${token.market_cap_rank}` : 'N/A',
      },
    ];

  return (
    <Animated.ScrollView
      style={styles.container}
      scrollEventThrottle={16}
      layout={Layout.springify()}
    >
      {/* Price Chart Section with animation */}
      <Animated.View
        style={styles.chartSection}
        entering={FadeInDown.duration(600).delay(100).springify()}
        exiting={FadeOutUp.duration(300)}
        layout={Layout.springify()}
      >
        <Animated.Text
          style={styles.sectionTitle}
          entering={FadeInDown.duration(500).delay(50)}
        >
          Цена за последние 7 дней
        </Animated.Text>
        {isLoadingHistory ? (
          <Animated.View
            style={styles.chartLoading}
            entering={ZoomIn.duration(300)}
          >
            <ActivityIndicator size="large" color="#1976D2" />
            <Animated.Text
              style={styles.loadingText}
              entering={FadeInDown.duration(400).delay(100)}
            >
              Загрузка данных...
            </Animated.Text>
          </Animated.View>
        ) : priceHistory && priceHistory.length > 0 ? (
          <Animated.View
            style={styles.chartWrapper}
            entering={FadeInDown.duration(700).delay(200).springify()}
            layout={Layout.springify()}
          >
            <PriceChart data={priceHistory} height={320} />
          </Animated.View>
        ) : (
          <Animated.View
            style={styles.noDataContainer}
            entering={FadeInDown.duration(500).delay(150)}
          >
            <Text style={styles.noDataText}>Нет данных о цене</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Stats Section with staggered animations */}
      <Animated.View
        style={styles.statsSection}
        entering={FadeInDown.duration(600).delay(300).springify()}
        layout={Layout.springify()}
      >
        <Animated.Text
          style={styles.sectionTitle}
          entering={FadeInDown.duration(500).delay(250)}
        >
          Статистика
        </Animated.Text>
        <View style={styles.statsGrid}>
          {defaultStats.map((stat, index) => (
            <AnimatedView
              key={`${stat.label}-${index}`}
              style={[
                styles.statItem,
                index % 2 === 1 && styles.statItemRight,
              ]}
              entering={staggeredWith(
                150,
                BounceInUp.duration(600).delay(350),
                index
              )}
              layout={Layout.springify()}
            >
              <Animated.Text
                style={styles.statLabel}
                entering={FadeInDown.duration(400).delay(360 + index * 150)}
              >
                {stat.label}
              </Animated.Text>
              <Animated.Text
                style={styles.statValue}
                entering={FadeInDown.duration(500).delay(380 + index * 150)}
              >
                {stat.value}
              </Animated.Text>
            </AnimatedView>
          ))}
        </View>
      </Animated.View>

      {/* Description Section with animation */}
      {token.description && (
        <Animated.View
          style={styles.descriptionSection}
          entering={FadeInDown.duration(600).delay(500).springify()}
          layout={Layout.springify()}
        >
          <Animated.Text
            style={styles.sectionTitle}
            entering={FadeInDown.duration(500).delay(450)}
          >
            О токене
          </Animated.Text>
          <Animated.Text
            style={styles.descriptionText}
            entering={FadeInDown.duration(600).delay(500)}
          >
            {token.description}
          </Animated.Text>
        </Animated.View>
      )}
    </Animated.ScrollView>
  );
};

export const ExpandedTokenInfo = memo(
  ExpandedTokenInfoComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.token.id === nextProps.token.id &&
      prevProps.isLoadingHistory === nextProps.isLoadingHistory &&
      prevProps.priceHistory?.length === nextProps.priceHistory?.length
    );
  }
);

ExpandedTokenInfo.displayName = 'ExpandedTokenInfo';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chartSection: {
    marginBottom: 28,
  },
  chartWrapper: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartLoading: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginTop: 12,
  },
  loadingText: {
    color: '#757575',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginTop: 12,
  },
  noDataText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
  },
  statItemRight: {
    marginLeft: 'auto',
    borderLeftColor: '#FF6B6B',
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  descriptionSection: {
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00C853',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontSize: 13,
    color: '#424242',
    marginTop: 10,
    lineHeight: 20,
    fontWeight: '400',
  },
});

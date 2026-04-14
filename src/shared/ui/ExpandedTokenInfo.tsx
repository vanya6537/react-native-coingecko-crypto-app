/**
 * Expanded token information display with fancy animations
 * Shows additional token details, price chart, and statistics with staggered animations
 * Integrated with time range selector for flexible chart periods
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
} from 'react-native-reanimated';
import type { Token, PriceHistory } from '../types';
import { formatPrice } from '../utils/formatters';
import { PriceChart } from './PriceChart';
import { AnimatedStatCard } from './AnimatedStatCard';
import { TimeRangeSelector, type TimeRange } from '../../components/TimeRangeSelector';

interface StatItem {
  label: string;
  value: string;
}

interface ExpandedTokenInfoProps {
  token: Token;
  priceHistory?: PriceHistory[];
  isLoadingHistory?: boolean;
  stats?: StatItem[];
  selectedTimeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeRangeSelector?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// Color mapping for stat cards
const getColorForStat = (label: string): string => {
  const colorMap: Record<string, string> = {
    'Market Cap': '#1976D2',
    'Volume': '#FF6B6B',
    'ATH': '#00C853',
    'ATL': '#FFA500',
    'Market Cap Rank': '#7C3AED',
  };
  return colorMap[label] || '#1976D2';
};

const getChartTitleByTimeRange = (timeRange: TimeRange): string => {
  const titleMap: Record<TimeRange, string> = {
    '7d': 'Цена за последние 7 дней',
    '30d': 'Цена за последние 30 дней',
    '90d': 'Цена за последние 90 дней',
    '1y': 'Цена за последний год',
    'all': 'Вся история цены',
  };
  return titleMap[timeRange] || 'Цена за последние 7 дней';
};

const ExpandedTokenInfoComponent: React.FC<ExpandedTokenInfoProps> = ({
  token,
  priceHistory,
  isLoadingHistory = false,
  stats,
  selectedTimeRange = '7d',
  onTimeRangeChange,
  showTimeRangeSelector = false,
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

  const chartTitle = getChartTitleByTimeRange(selectedTimeRange);

  return (
    <Animated.ScrollView
      style={styles.container}
      scrollEventThrottle={16}
      layout={Layout.springify()}
    >
      {/* Time Range Selector - conditionally rendered */}
      {showTimeRangeSelector && onTimeRangeChange && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(50).springify()}
          exiting={FadeOutUp.duration(300)}
          layout={Layout.springify()}
        >
          <TimeRangeSelector
            selectedRange={selectedTimeRange}
            onRangeChange={onTimeRangeChange}
          />
        </Animated.View>
      )}

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
          {chartTitle}
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
            <View
              key={`${stat.label}-${index}`}
              style={styles.statCardWrapper}
            >
              <AnimatedStatCard
                label={stat.label}
                value={stat.value}
                color={getColorForStat(stat.label)}
                delay={320 + index * 80}
              />
            </View>
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
      prevProps.priceHistory?.length === nextProps.priceHistory?.length &&
      prevProps.selectedTimeRange === nextProps.selectedTimeRange &&
      prevProps.showTimeRangeSelector === nextProps.showTimeRangeSelector
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
  statCardWrapper: {
    flex: 1,
    minWidth: '45%',
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

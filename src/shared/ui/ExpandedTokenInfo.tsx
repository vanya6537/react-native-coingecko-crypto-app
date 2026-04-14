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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import type { Token, PriceHistory } from '../types';
import { formatPrice, formatCompactNumber } from '../utils/formatters';
import { PriceChart } from './PriceChart';
import { TimeRangeSelector, type TimeRange } from '../../components/TimeRangeSelector';
import { LoaderComponent } from './Loader';
import { ChartLoadingSkeleton, SkeletonLoader } from '../../components/SkeletonLoader';

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
  const { t, i18n } = useTranslation();
  const currency = i18n.language === 'ru' ? '₽' : '$';

  const defaultStats: StatItem[] =
    stats ||
    [
      {
        label: t('stats.marketCap'),
        value: token.market_cap ? formatCompactNumber(token.market_cap, currency) : 'N/A',
      },
      {
        label: t('stats.volume'),
        value: token.total_volume ? formatCompactNumber(token.total_volume, currency) : 'N/A',
      },
      {
        label: t('stats.ath'),
        value: token.ath ? formatPrice(token.ath) : 'N/A',
      },
      {
        label: t('stats.atl'),
        value: token.atl ? formatPrice(token.atl) : 'N/A',
      },
      {
        label: t('stats.marketCapRank'),
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
            entering={FadeInDown.duration(300)}
          >
            <ChartLoadingSkeleton height={240} compact={true} />
          </Animated.View>
        ) : priceHistory && priceHistory.length > 0 ? (
          <Animated.View
            style={styles.chartWrapper}
            entering={FadeInDown.duration(700).delay(200).springify()}
            layout={Layout.springify()}
          >
            <PriceChart data={priceHistory} height={450} selectedTimeRange={selectedTimeRange} />
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

      {/* Stats Section - minimal plain text with loading indicator */}
      <Animated.View
        style={styles.statsSection}
        entering={FadeInDown.duration(400).delay(300).springify()}
        layout={Layout.springify()}
      >
        {isLoadingHistory ? (
          <View style={styles.statsLoadingContainer}>
            <View style={styles.statsSkeletonGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.statsSkeletonItem}>
                  <SkeletonLoader width="60%" height={12} borderRadius={6} />
                  <SkeletonLoader width="85%" height={16} borderRadius={8} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {defaultStats.map((stat, index) => (
              <Animated.View
                key={`${stat.label}-${index}`}
                style={styles.statItem}
                entering={FadeInDown.duration(300).delay(150 + index * 50).springify()}
              >
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </Animated.View>
            ))}
          </View>
        )}
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
          {isLoadingHistory ? (
            <View style={styles.descriptionLoadingContainer}>
              <SkeletonLoader width="100%" height={14} borderRadius={6} />
              <SkeletonLoader width="96%" height={14} borderRadius={6} />
              <SkeletonLoader width="88%" height={14} borderRadius={6} />
              <SkeletonLoader width="72%" height={14} borderRadius={6} />
            </View>
          ) : (
            <Animated.Text
              style={styles.descriptionText}
              entering={FadeInDown.duration(600).delay(500)}
            >
              {token.description}
            </Animated.Text>
          )}
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
    paddingHorizontal: 12,
  },
  chartSection: {
    marginBottom: 16,
  },
  chartWrapper: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartLoading: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginTop: 8,
  },
  loadingText: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginTop: 8,
  },
  noDataText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 16,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  statsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  statsLoadingText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#999',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    letterSpacing: 0.2,
    paddingTop: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: '#555',
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '400',
  },
  descriptionLoadingContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  statsSkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsSkeletonItem: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
  },
});

/**
 * Expanded token information display
 * Shows additional token details and price chart
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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
    <View style={styles.container}>
      {/* Price Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Цена за последние 7 дней</Text>
        {isLoadingHistory ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator size="large" color="#1976D2" />
          </View>
        ) : priceHistory && priceHistory.length > 0 ? (
          <View style={styles.chartWrapper}>
            <PriceChart data={priceHistory} height={220} />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Нет данных о цене</Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsGrid}>
          {defaultStats.map((stat, index) => (
            <View
              key={`${stat.label}-${index}`}
              style={[
                styles.statItem,
                index % 2 === 1 && styles.statItemRight,
              ]}
            >
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Description Section */}
      {token.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>О токене</Text>
          <Text style={styles.descriptionText}>{token.description}</Text>
        </View>
      )}
    </View>
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
  },
  chartSection: {
    marginBottom: 24,
  },
  chartWrapper: {
    marginTop: 12,
  },
  chartLoading: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginTop: 12,
  },
  noDataContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginTop: 12,
  },
  noDataText: {
    color: '#757575',
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
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
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statItemRight: {
    marginLeft: 'auto',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  descriptionSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  descriptionText: {
    fontSize: 13,
    color: '#424242',
    marginTop: 8,
    lineHeight: 20,
  },
});

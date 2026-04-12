import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface TokenIdentityHeaderProps {
  image: string;
  name: string;
  symbol: string;
}

interface TokenPriceSummaryProps {
  price: string;
  change: string;
  changeColor: string;
  containerStyle?: StyleProp<ViewStyle>;
}

interface ChartSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export interface StatItem {
  label: string;
  value: string;
}

interface StatsSectionProps {
  title?: string;
  items: StatItem[];
  containerStyle?: StyleProp<ViewStyle>;
}

interface DescriptionSectionProps {
  title?: string;
  description: string;
}

export const TokenIdentityHeader: React.FC<TokenIdentityHeaderProps> = ({
  image,
  name,
  symbol,
}) => (
  <View style={styles.identityHeader}>
    <Image source={{ uri: image }} style={styles.tokenImage} />
    <View style={styles.tokenInfo}>
      <Text style={styles.tokenName}>{name}</Text>
      <Text style={styles.tokenSymbol}>{symbol.toUpperCase()}</Text>
    </View>
  </View>
);

export const TokenPriceSummary: React.FC<TokenPriceSummaryProps> = ({
  price,
  change,
  changeColor,
  containerStyle,
}) => (
  <View style={[styles.priceSection, containerStyle]}>
    <Text style={styles.currentPrice}>{price}</Text>
    <Text style={[styles.change24h, { color: changeColor }]}>{change}</Text>
  </View>
);

export const ChartSectionHeader: React.FC<ChartSectionHeaderProps> = ({
  title,
  actionLabel,
  onPress,
  disabled = false,
}) => (
  <View style={styles.chartHeader}>
    <Text style={styles.chartTitle}>{title}</Text>
    {actionLabel ? (
      <TouchableOpacity
        style={[styles.expandButton, disabled && styles.expandButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={[styles.expandButtonText, disabled && styles.expandButtonTextDisabled]}>
          {actionLabel}
        </Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  items,
  containerStyle,
}) => (
  <View style={containerStyle}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.statsGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.statBox}>
          <Text style={styles.statLabel}>{item.label}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  title = 'About',
  description,
}) => (
  <View style={styles.descriptionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.descriptionText}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  identityHeader: {
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
  expandButtonDisabled: {
    opacity: 0.7,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  expandButtonTextDisabled: {
    color: '#7BA8D8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  descriptionContainer: {
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
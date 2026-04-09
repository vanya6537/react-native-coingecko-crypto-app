import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import type { Token } from '../types/index';
import { formatPrice, formatChange } from '../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TokenItemProps {
  token: Token;
  onPress?: (token: Token) => void;
  isExpanded?: boolean;
}

export const TokenItem: React.FC<TokenItemProps> = ({ token, onPress, isExpanded }: TokenItemProps) => {
  const [expanded, setExpanded] = useState(isExpanded || false);

  const handlePress = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    onPress?.(token);
  }, [expanded, token, onPress]);

  const changeColor = token.price_change_percentage_24h >= 0 ? '#00C853' : '#D32F2F';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={handlePress} activeOpacity={0.7}>
        <Image source={{ uri: token.image }} style={styles.icon} />
        <View style={styles.info}>
          <Text style={styles.name}>{token.name}</Text>
          <Text style={styles.symbol}>{token.symbol.toUpperCase()}</Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(token.current_price)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {formatChange(token.price_change_percentage_24h)}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Market Rank</Text>
            <Text style={styles.value}>#{token.market_cap_rank || 'N/A'}</Text>
          </View>
          {token.market_cap && (
            <View style={styles.row}>
              <Text style={styles.label}>Market Cap</Text>
              <Text style={styles.value}>${(token.market_cap / 1e9).toFixed(2)}B</Text>
            </View>
          )}
          {token.total_volume && (
            <View style={styles.row}>
              <Text style={styles.label}>24h Volume</Text>
              <Text style={styles.value}>${(token.total_volume / 1e9).toFixed(2)}B</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  symbol: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  expandedContent: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
});

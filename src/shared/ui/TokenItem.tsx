/**
 * Shared UI component: TokenItem
 */
import React, { useCallback, memo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import type { Token } from '../types';
import { formatPrice, formatChange } from '../utils/formatters';

interface TokenItemProps {
  token: Token;
  onPress?: (token: Token) => void;
}

const TokenItemComponent: React.FC<TokenItemProps> = ({ token, onPress }) => {
  const handlePress = useCallback(() => {
    onPress?.(token);
  }, [token, onPress]);

  const changeColor =
    typeof token.price_change_percentage_24h === 'number'
      ? token.price_change_percentage_24h >= 0
        ? '#00C853'
        : '#D32F2F'
      : '#757575';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress} 
      activeOpacity={0.7}
    >
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
  );
};

// Memoize to prevent unnecessary re-renders
export const TokenItem = memo(TokenItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.token.id === nextProps.token.id &&
    prevProps.token.current_price === nextProps.token.current_price &&
    prevProps.token.price_change_percentage_24h === nextProps.token.price_change_percentage_24h
  );
});

TokenItem.displayName = 'TokenItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
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
});

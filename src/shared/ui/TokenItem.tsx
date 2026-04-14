/**
 * Shared UI component: TokenItem
 * Expandable token list item with collapsible details
 */
import React, { useCallback, memo, ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  Layout,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { Token } from '../types';
import { formatPrice, formatChange } from '../utils/formatters';

interface TokenItemProps {
  token: Token;
  isExpanded?: boolean;
  onPress?: (token: Token) => void;
  onToggleExpand?: (tokenId: string) => void;
  expandedContent?: ReactNode;
  isLoadingExpanded?: boolean;
}

const TokenItemComponent: React.FC<TokenItemProps> = ({
  token,
  isExpanded = false,
  onPress,
  onToggleExpand,
  expandedContent,
  isLoadingExpanded = false,
}) => {
  const changeColor =
    typeof token.price_change_percentage_24h === 'number'
      ? token.price_change_percentage_24h >= 0
        ? '#00C853'
        : '#D32F2F'
      : '#757575';

  const handleHeaderPress = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand(token.id);
    } else {
      onPress?.(token);
    }
  }, [token, onPress, onToggleExpand]);

  return (
    <Animated.View
      style={styles.wrapper}
      layout={Layout.springify()}
      entering={FadeIn.duration(150)}
    >
      <TouchableOpacity
        style={[styles.container, isExpanded && styles.containerExpanded]}
        onPress={handleHeaderPress}
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
        <View style={styles.expandIcon}>
          <Text style={styles.expandIconText}>{isExpanded ? '▼' : '▶'}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          layout={Layout.springify()}
        >
          {isLoadingExpanded ? (
            <View style={styles.expandedContentContainer}>
              <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
          ) : expandedContent ? (
            <View style={styles.expandedContentContainer}>
              {expandedContent}
            </View>
          ) : null}
        </Animated.View>
      )}
    </Animated.View>
  );
};

// Memoize to prevent unnecessary re-renders
export const TokenItem = memo(TokenItemComponent, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.token.id === nextProps.token.id &&
    prevProps.token.current_price === nextProps.token.current_price &&
    prevProps.token.price_change_percentage_24h ===
      nextProps.token.price_change_percentage_24h &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.isLoadingExpanded === nextProps.isLoadingExpanded
  );
});

TokenItem.displayName = 'TokenItem';

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  containerExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    marginRight: 8,
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
  expandIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  expandedContentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

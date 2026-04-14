/**
 * Shared UI component: TokenItem
 * Expandable token list item with WOW animations
 */
import React, { useCallback, memo, ReactNode, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  BounceInUp,
  FadeInDown,
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
  // Animation values
  const expandProgress = useSharedValue(isExpanded ? 1 : 0);
  const containerScale = useSharedValue(1);
  const arrowRotate = useSharedValue(isExpanded ? 1 : 0);
  const pulseScale = useSharedValue(1);

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
      onPress[styles.wrapper, containerAnimatedStyle]}
      layout={Layout.springify()}
      entering={FadeInDown.duration(300).delay(50)}
    >
      <TouchableOpacity
        style={[styles.container, isExpanded && styles.containerExpanded]}
        onPress={handleHeaderPress}
        activeOpacity={0.6}
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
        <Animated.View style={[styles.expandIcon, arrowAnimatedStyle]}>
          <Text style={styles.expandIconText}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(100).springify()}
          exiting={FadeOut.duration(200)}
          layout={Layout.springify()}
          style={expandedContentAnimatedStyle}
        >
          {isLoadingExpanded ? (
            <View style={styles.expandedContentContainer}>
              <Animated.Text
                style={styles.loadingText}
                entering={FadeIn.duration(400).delay(150)}
              >
                ⏳ Загрузка...
              </Animated.
    shadowOpacity: interpolate(
      expandProgress.value,
      [0, 1],
      [0.1, 0.3],
      Extrapolate.CLAMP
    ),
    elevation: interpolate(
      expandProgress.value,
      [0, 1],
      [2, 8],
      Extrapolate.CLAMP
    ),
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          arrowRotate.value,
          [0, 1],
          [0, 180],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const expandedContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

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
    borderRadius: 14,
    overflow: 'visible',
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
  },
  containerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  symbol: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  change: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  expandIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  expandIconText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '700',
  },
  expandedContentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  loadingText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

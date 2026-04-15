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
  BounceInUp,
  FadeInDown,
} from 'react-native-reanimated';
import type { Token } from '../types';
import { formatPrice, formatChange } from '../utils/formatters';
import { LoaderComponent } from './Loader';
import { ChartLoadingSkeleton, SkeletonLoader } from '../../components/SkeletonLoader';

interface TokenItemProps {
  token: Token;
  isExpanded?: boolean;
  onPress?: (token: Token) => void;
  onToggleExpand?: (tokenId: string) => void;
  expandedContent?: ReactNode;
  isLoadingExpanded?: boolean;
  isFetchingNextPage?: boolean;
}

const TokenItemComponent: React.FC<TokenItemProps> = ({
  token,
  isExpanded = false,
  onPress,
  onToggleExpand,
  expandedContent,
  isLoadingExpanded = false,
  isFetchingNextPage = false,
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
    } else if (onPress) {
      onPress(token);
    }
  }, [onToggleExpand, onPress, token]);

  return (
    <Animated.View
      style={[styles.wrapper, isLoadingExpanded && { opacity: 0.7 }]}
      layout={Layout.springify()}
      entering={FadeIn.duration(150)}
    >
      <Animated.View
        style={[
          styles.container,
          isExpanded && styles.containerExpanded,
          isFetchingNextPage && styles.containerLoading,
        ]}
      >
        <TouchableOpacity
          onPress={handleHeaderPress}
          activeOpacity={0.7}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          {isFetchingNextPage && (
            <View style={styles.paginationLoaderOverlay}>
              <LoaderComponent size={40} />
            </View>
          )}
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
            <Animated.View style={[styles.expandIconInner, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
              <Text style={styles.expandIconText}>{isExpanded ? '▼' : '▶'}</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          layout={Layout.springify()}
          style={styles.expandedWrapper}
        >
          {isLoadingExpanded ? (
            <View style={styles.expandedContentContainer}>
              {/* Chart Skeleton */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(0).damping(1.2)}
                layout={Layout.springify()}
              >
                <ChartLoadingSkeleton height={240} compact={true} />
              </Animated.View>
              
              {/* Stats Skeleton Grid */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100).damping(1.2)}
                layout={Layout.springify()}
              >
                <View style={styles.statsSkeletonGrid}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Animated.View
                      key={item}
                      entering={FadeInDown.duration(400).delay(150 + item * 50).damping(1.2)}
                      layout={Layout.springify()}
                      style={styles.statsSkeletonItem}
                    >
                      <SkeletonLoader width="60%" height={12} />
                      <SkeletonLoader width="85%" height={16} />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
              
              {/* Description Skeleton */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(500).damping(1.2)}
                layout={Layout.springify()}
                style={styles.descriptionLoadingContainer}
              >
                {[0, 1, 2, 3].map((lineIndex) => (
                  <Animated.View
                    key={lineIndex}
                    entering={FadeInDown.duration(300).delay(550 + lineIndex * 60).damping(1.2)}
                  >
                    <SkeletonLoader
                      width={['100%', '96%', '88%', '72%'][lineIndex]}
                      height={12}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
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
    prevProps.isLoadingExpanded === nextProps.isLoadingExpanded &&
    prevProps.isFetchingNextPage === nextProps.isFetchingNextPage
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
  expandIconInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '700',
  },
  containerLoading: {
    opacity: 0.6,
  },
  paginationLoaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  expandedWrapper: {
    position: 'relative',
  },
  expandedLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 20,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  statsSkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  statsSkeletonItem: {
    width: '48%',
    paddingVertical: 8,
    gap: 6,
  },
  descriptionLoadingContainer: {
    marginTop: 12,
    gap: 8,
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

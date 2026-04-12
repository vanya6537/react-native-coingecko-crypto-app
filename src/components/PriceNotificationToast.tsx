/**
 * Price Change Notification Toast
 * Displays random price alerts with animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUnit } from 'effector-react';
import { $themeConfig } from '@/features/theme';

interface PriceNotification {
  id: string;
  tokenName: string;
  symbol: string;
  priceChange: number;
  newPrice: number;
  isUp: boolean;
}

export interface PriceNotificationToastRef {
  show: (notification: PriceNotification) => void;
}

/**
 * Notification Toast Component - Shows at bottom with animation
 */
export const PriceNotificationToast: React.ForwardRefRenderFunction<
  PriceNotificationToastRef,
  {}
> = (_, ref) => {
  const [themeConfig] = useUnit([$themeConfig]);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const [notification, setNotification] = React.useState<PriceNotification | null>(null);

  React.useImperativeHandle(ref, () => ({
    show: (notif: PriceNotification) => {
      setNotification(notif);

      // Animate in
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        // Stay for 3 seconds
        Animated.delay(3000),
        // Animate out
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotification(null);
      });
    },
  }));

  if (!notification) return null;

  const bgColor = notification.isUp
    ? 'rgba(0, 200, 83, 0.95)'
    : 'rgba(255, 82, 82, 0.95)';
  const icon = notification.isUp ? 'trending-up' : 'trending-down';
  const emoji = notification.isUp ? '📈' : '📉';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: bgColor,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color="#fff" />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {emoji} {notification.tokenName}
            </Text>
            <Text style={styles.symbol}>{notification.symbol}</Text>
          </View>
          <Text style={styles.change}>
            {notification.isUp ? '+' : ''}
            {notification.priceChange.toFixed(2)}% • ${notification.newPrice.toFixed(2)}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {Math.abs(notification.priceChange).toFixed(1)}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default React.forwardRef(PriceNotificationToast);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 999,
  },

  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  symbol: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  change: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '500',
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

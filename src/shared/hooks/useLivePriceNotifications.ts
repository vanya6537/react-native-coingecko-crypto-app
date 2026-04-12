/**
 * Hook for real-time live price notifications
 * Integrates with notifications feature
 */

import { useEffect, useCallback, useRef } from 'react';
import { useUnit } from 'effector-react';
import { $priceAlertConfig, addPriceAlert, checkPrices } from '@/features/notifications';
import { useTranslation } from 'react-i18next';
import notifee from '@notifee/react-native';

interface CryptoToken {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange: number;
}

/**
 * useLivePriceNotifications - Monitor crypto prices and send real-time notifications
 */
export const useLivePriceNotifications = (
  tokens: CryptoToken[] = [],
  checkInterval = 5000
) => {
  const [priceAlertConfig] = useUnit([$priceAlertConfig]);
  const { t } = useTranslation();
  const pricesRef = useRef<Map<string, number>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize prices
  useEffect(() => {
    tokens.forEach((token) => {
      pricesRef.current.set(token.id, token.currentPrice);
    });
  }, [tokens]);

  // Simulate real-time price changes and send notifications
  const startMonitoring = useCallback(() => {
    intervalRef.current = setInterval(async () => {
      tokens.forEach(async (token) => {
        const oldPrice = pricesRef.current.get(token.id) || token.currentPrice;

        // Simulate random price movement: ±0.5% to ±3%
        const changePercent = (Math.random() - 0.5) * 6;
        const newPrice = oldPrice * (1 + changePercent / 100);
        const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

        pricesRef.current.set(token.id, newPrice);

        // Send notification for significant changes (> 1%)
        if (Math.abs(percentChange) > 1) {
          const isUp = percentChange > 0;
          const emoji = isUp ? '📈' : '📉';
          const color = isUp ? '#00C853' : '#FF5252';

          // Create notification channel
          const channelId = await notifee.createChannel({
            id: 'price-alerts',
            name: 'Price Alerts',
            importance: 4,
            lightColor: color,
            vibration: true,
            sound: 'default',
          });

          // Send notification
          await notifee.displayNotification({
            title: `${emoji} ${token.name} ${isUp ? 'Surge' : 'Drop'}!`,
            body: `${token.symbol.toUpperCase()} ${isUp ? '+' : ''}${percentChange.toFixed(2)}% ($ ${newPrice.toFixed(2)})`,
            data: {
              tokenId: token.id,
              tokenName: token.name,
              newPrice: newPrice.toString(),
              changePercent: percentChange.toString(),
            },
            android: {
              channelId,
              pressAction: {
                id: 'default',
              },
              smallIcon: 'ic_launcher',
              color,
              colorized: true,
              progress: {
                max: 100,
                current: Math.min(Math.abs(percentChange) * 20, 100),
                indeterminate: false,
              },
            },
            ios: {
              sound: 'default',
              badgeCount: Math.floor(Math.abs(percentChange)),
            },
          });
        }
      });
    }, checkInterval);
  }, [tokens, checkInterval]);

  // Cleanup
  useEffect(() => {
    startMonitoring();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startMonitoring]);

  return {
    getCurrentPrice: (tokenId: string) => pricesRef.current.get(tokenId),
    getAllPrices: () => Object.fromEntries(pricesRef.current),
    stopMonitoring: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
  };
};

/**
 * usePriceAlertSubscriptions - Subscribe to specific tokens for alerts
 */
export const usePriceAlertSubscriptions = (tokens: CryptoToken[]) => {
  const setupAlerts = useCallback(async () => {
    tokens.forEach((token) => {
      addPriceAlert({
        tokenId: token.id,
        tokenName: token.name,
        threshold: 2, // Alert on 2% change
        enabled: true,
      });
    });
  }, [tokens]);

  useEffect(() => {
    setupAlerts();
  }, [setupAlerts]);

  return { setupAlerts };
};

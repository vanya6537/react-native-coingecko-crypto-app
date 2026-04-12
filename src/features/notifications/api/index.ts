/**
 * Notifications Feature - API (using react-native-notifee)
 */

import notifee from 'react-native-notifee';
import type { NotificationPayload, PriceAlert } from '../types';

export const notificationsAPI = {
  /**
   * Initialize notifications
   */
  async initialize(): Promise<void> {
    try {
      // Request notification permissions (iOS 1   3+)
      await notifee.requestPermission();

      // Create notification channel (Android)
      const channelId = await notifee.createChannel({
        id: 'price-alerts',
        name: 'Price Alerts',
        lightColor: '#1976D2',
        importance: 4, // high
      });

      console.log('Notifications initialized, channel:', channelId);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  },

  /**
   * Send price alert notification
   */
  async sendPriceAlert(alert: {
    tokenName: string;
    oldPrice: number;
    newPrice: number;
    change: number;
  }): Promise<void> {
    try {
      const direction = alert.change >= 0 ? '📈 вверх' : '📉 вниз';
      const changeAbs = Math.abs(alert.change).toFixed(2);

      await notifee.displayNotification({
        title: `${alert.tokenName} изменился`,
        body: `Цена: $${alert.newPrice.toFixed(2)} (${direction} на ${changeAbs}%)`,
        android: {
          channelId: 'price-alerts',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (error) {
      console.error('Failed to send price alert:', error);
    }
  },

  /**
   * Send generic notification
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      await notifee.displayNotification({
        title: payload.title,
        body: payload.body,
        data: payload.data,
        android: {
          channelId: 'price-alerts',
          smallIcon: 'ic_launcher',
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  },

  /**
   * Set notification handler
   */
  async onNotificationTap(callback: (notification: any) => void): Promise<void> {
    try {
      notifee.onNotificationTap((notification) => {
        callback(notification);
      });
    } catch (error) {
      console.error('Failed to set notification tap handler:', error);
    }
  },
};

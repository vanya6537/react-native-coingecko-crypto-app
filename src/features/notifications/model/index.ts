/**
 * Notifications Feature - Model (State Management)
 */

import { createStore, createEvent, createEffect, sample } from 'effector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsAPI } from '../api';
import type { PriceAlert, PriceAlertConfig } from '../types';

const ALERTS_KEY = '@crypto_tokens_app/price_alerts';

// Events
export const initializeNotifications = createEffect(async () => {
  await notificationsAPI.initialize();
});

export const addPriceAlert = createEvent<Omit<PriceAlert, 'lastNotifiedPrice'>>();
export const removePriceAlert = createEvent<string>();
export const updatePriceAlert = createEvent<PriceAlert>();
export const enableNotifications = createEvent();
export const disableNotifications = createEvent();
export const setGlobalThreshold = createEvent<number>();
export const checkPrices = createEvent<Array<{ tokenId: string; tokenName: string; price: number }>>();

// Effects
const loadAlertsFx = createEffect(async () => {
  try {
    const data = await AsyncStorage.getItem(ALERTS_KEY);
    if (!data) return { alerts: new Map(), enabled: true, globalThreshold: 5 };
    const config = JSON.parse(data);
    return {
      ...config,
      alerts: new Map(Object.entries(config.alerts || {})),
    };
  } catch (error) {
    console.error('Failed to load alerts:', error);
    return { alerts: new Map(), enabled: true, globalThreshold: 5 };
  }
});

const saveAlertsFx = createEffect(async (config: PriceAlertConfig) => {
  try {
    const data = {
      ...config,
      alerts: Object.fromEntries(config.alerts),
    };
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save alerts:', error);
  }
});

// Stores
export const $priceAlertConfig = createStore<PriceAlertConfig>({
  alerts: new Map(),
  enabled: true,
  globalThreshold: 5,
})
  .on(loadAlertsFx.doneData, (_, config) => config)
  .on(addPriceAlert, (state, alert) => {
    const alerts = new Map(state.alerts);
    alerts.set(alert.tokenId, { ...alert, lastNotifiedPrice: undefined });
    return { ...state, alerts };
  })
  .on(removePriceAlert, (state, tokenId) => {
    const alerts = new Map(state.alerts);
    alerts.delete(tokenId);
    return { ...state, alerts };
  })
  .on(updatePriceAlert, (state, alert) => {
    const alerts = new Map(state.alerts);
    alerts.set(alert.tokenId, alert);
    return { ...state, alerts };
  })
  .on(enableNotifications, (state) => ({ ...state, enabled: true }))
  .on(disableNotifications, (state) => ({ ...state, enabled: false }))
  .on(setGlobalThreshold, (state, threshold) => ({ ...state, globalThreshold: threshold }));

// Save alerts when changed
sample({
  clock: [$priceAlertConfig],
  source: $priceAlertConfig,
  target: saveAlertsFx,
});

// Check prices and send notifications
sample({
  clock: checkPrices,
  source: $priceAlertConfig,
  fn: (config, prices) => {
    if (!config.enabled) return null;

    const notifications: Array<{
      tokenName: string;
      oldPrice: number;
      newPrice: number;
      change: number;
    }> = [];

    for (const price of prices) {
      const alert = config.alerts.get(price.tokenId);
      if (!alert || !alert.enabled) continue;

      const lastPrice = alert.lastNotifiedPrice || price.price;
      const change = ((price.price - lastPrice) / lastPrice) * 100;

      if (Math.abs(change) >= alert.threshold) {
        notifications.push({
          tokenName: price.tokenName,
          oldPrice: lastPrice,
          newPrice: price.price,
          change,
        });

        // Update last notified price
        const updated = { ...alert, lastNotifiedPrice: price.price };
        updatePriceAlert(updated);
      }
    }

    return notifications;
  },
  target: createEffect(async (notifications) => {
    if (!notifications) return;
    for (const notif of notifications) {
      await notificationsAPI.sendPriceAlert(notif);
    }
  }),
});

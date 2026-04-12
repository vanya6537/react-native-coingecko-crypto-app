/**
 * Notifications Feature - Public API
 */

export {
  initializeNotifications,
  addPriceAlert,
  removePriceAlert,
  updatePriceAlert,
  enableNotifications,
  disableNotifications,
  setGlobalThreshold,
  checkPrices,
  $priceAlertConfig,
} from './model';

export type { PriceAlert, PriceAlertConfig, NotificationPayload } from './types';

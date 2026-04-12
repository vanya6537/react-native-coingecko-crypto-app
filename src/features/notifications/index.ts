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

export {
  showToast,
  removeToast,
  clearToasts,
  successToast,
  errorToast,
  infoToast,
  warningToast,
  $toasts,
} from './model/toastStore';

export { ToastContainer } from './ui/ToastContainer';

export type { PriceAlert, PriceAlertConfig, NotificationPayload } from './types';
export type { Toast, ToastType } from './model/toastStore';

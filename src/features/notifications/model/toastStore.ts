/**
 * Toast Notifications Store - UI State
 * Visual feedback system
 */

import { createEvent, createStore, sample, merge } from 'effector';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Events
export const showToast = createEvent<Omit<Toast, 'id'>>();
export const removeToast = createEvent<string>();
export const clearToasts = createEvent();

// Generate ID
let toastId = 0;
const generateToastId = () => `toast-${++toastId}-${Date.now()}`;

// Stores
export const $toasts = createStore<Toast[]>([])
  .on(showToast, (state, data) => [
    ...state,
    {
      ...data,
      id: generateToastId(),
    },
  ])
  .on(removeToast, (state, id) => state.filter((t) => t.id !== id))
  .on(clearToasts, () => []);

// Auto-remove toasts
sample({
  clock: showToast,
  source: $toasts,
  fn: (toasts) => toasts[toasts.length - 1],
  target: createEvent<Toast>(),
}).watch((toast) => {
  const timeout = setTimeout(() => {
    removeToast(toast.id);
  }, toast.duration || 3000);

  return () => clearTimeout(timeout);
});

// Convenience events
export const successToast = createEvent<string>();
export const errorToast = createEvent<string>();
export const infoToast = createEvent<string>();
export const warningToast = createEvent<string>();

sample({
  clock: successToast,
  fn: (message) => ({ type: 'success' as ToastType, message, duration: 2000 }),
  target: showToast,
});

sample({
  clock: errorToast,
  fn: (message) => ({ type: 'error' as ToastType, message, duration: 4000 }),
  target: showToast,
});

sample({
  clock: infoToast,
  fn: (message) => ({ type: 'info' as ToastType, message, duration: 3000 }),
  target: showToast,
});

sample({
  clock: warningToast,
  fn: (message) => ({ type: 'warning' as ToastType, message, duration: 3500 }),
  target: showToast,
});

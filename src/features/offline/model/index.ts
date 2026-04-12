/**
 * Offline Mode Feature - Model (State Management)
 */

import { createStore, createEvent, createEffect, sample } from 'effector';
import { offlineAPI } from '../api';

// Events
export const initializeOfflineMode = createEffect(async () => {
  return offlineAPI.checkNetworkState();
});

export const updateNetworkState = createEvent<{
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}>();

export const enableOfflineMode = createEvent();
export const disableOfflineMode = createEvent();
export const syncOfflineData = createEvent();

// Effects
const syncFx = createEffect(async () => {
  // TODO: Implement sync logic for queued requests
  console.log('Syncing offline data...');
  return { success: true };
});

// Stores
export const $networkState = createStore({
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
})
  .on(initializeOfflineMode.doneData, (_, state) => state)
  .on(updateNetworkState, (_, state) => state);

export const $offlineModeEnabled = createStore(false)
  .on(enableOfflineMode, () => true)
  .on(disableOfflineMode, () => false)
  .on(updateNetworkState, (_, state) => !state.isConnected);

export const $isSyncing = createStore(false)
  .on(syncOfflineData, () => true)
  .on(syncFx.finally, () => false);

// Auto-disable offline mode when connection is restored
sample({
  source: $networkState,
  clock: updateNetworkState,
  fn: (_, newState) => newState.isConnected,
  target: createEvent<boolean>().watch((isConnected) => {
    if (isConnected) {
      disableOfflineMode();
    }
  }),
});

// Sync data when connection is restored
sample({
  source: $offlineModeEnabled,
  clock: updateNetworkState,
  filter: (enabled, newState) => enabled && newState.isConnected,
  target: syncFx,
});

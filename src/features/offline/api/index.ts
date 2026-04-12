/**
 * Offline Mode Feature - Network API
 */

import NetInfo from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';

const offlineStorage = new MMKV({ id: 'offline_cache' });

export const offlineAPI = {
  /**
   * Check current network state
   */
  async checkNetworkState() {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
    } catch (error) {
      console.error('Failed to check network state:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
      };
    }
  },

  /**
   * Subscribe to network state changes
   */
  subscribeToNetworkState(
    callback: (isConnected: boolean) => void
  ): (() => void) | undefined {
    try {
      return NetInfo.addEventListener((state) => {
        callback(state.isConnected ?? false);
      });
    } catch (error) {
      console.error('Failed to subscribe to network state:', error);
      return undefined;
    }
  },

  /**
   * Cache data for offline use
   */
  cacheForOffline(key: string, data: any, ttl: number = 3600000): void {
    try {
      const cached = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      offlineStorage.set(key, JSON.stringify(cached));
    } catch (error) {
      console.error('Failed to cache offline data:', error);
    }
  },

  /**
   * Get cached offline data
   */
  getCacheForOffline(key: string): any {
    try {
      const cached = offlineStorage.getString(key);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      // Check if cache is still valid
      if (age > parsed.ttl) {
        offlineStorage.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to get offline cache:', error);
      return null;
    }
  },

  /**
   * Clear all offline cache
   */
  clearOfflineCache(): void {
    try {
      offlineStorage.clearAll();
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
    }
  },

  /**
   * Log network event for debugging
   */
  logNetworkEvent(event: string): void {
    try {
      const key = `network_log_${Date.now()}`;
      offlineStorage.set(key, JSON.stringify({ event, timestamp: Date.now() }));
    } catch (error) {
      console.error('Failed to log network event:', error);
    }
  },
};

/**
 * Notifications & Performance Demo Page
 * Showcases notification system, prefetching, and cache optimization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUnit } from 'effector-react';
import {
  showToast,
  successToast,
  errorToast,
  infoToast,
  warningToast,
} from '../features/notifications/model/toastStore';
import {
  prefetchTokensList,
  smartPrefetch,
} from '../api/prefetch';
import {
  estimateCacheSize,
  formatCacheSize,
  aggressiveGC,
} from '../api/optimization';
import { coingeckoAPI } from '../api/coingecko';
import { queryKeys } from '../api/queryClient';
import { useQueryWithLiveNotifications } from '../api/useQueryWithLiveNotifications';
import {
  Activity,
  RefreshCw,
  DownloadCloud,
  Trash2,
  BarChart3,
  Zap,
  TrendingUp,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const notificationMessages = [
  {
    type: 'success' as const,
    message: 'Data prefetched successfully!',
  },
  {
    type: 'info' as const,
    message: 'Cache optimization complete',
  },
  {
    type: 'warning' as const,
    message: 'High memory usage detected',
  },
  {
    type: 'error' as const,
    message: 'Failed to fetch data',
  },
];

export function NotificationsShowcasePage(): React.JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cacheSize, setCacheSize] = useState(0);
  const [queryCount, setQueryCount] = useState(0);
  const [liveMonitoringActive, setLiveMonitoringActive] = useState(false);
  const liveMonitoringCleanupRef = React.useRef<(() => void) | null>(null);

  // Fetch first page of tokens
  const { data: tokens, isLoading } = useQuery({
    queryKey: queryKeys.tokens.list(1, 20),
    queryFn: async () => {
      infoToast(t('notifications.dataLoaded'));
      return coingeckoAPI.getTokensList(20, 0);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Live notifications integration
  const {
    tokens: liveTokens,
    startLivePriceMonitoring,
  } = useQueryWithLiveNotifications([], {
    enablePrefetch: true,
    prefetchNext: true,
    notificationThreshold: 1.5,
  });

  // Update cache stats
  useEffect(() => {
    const updateStats = () => {
      setCacheSize(estimateCacheSize(queryClient));
      setQueryCount(queryClient.getQueryCache().getAll().length);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Random notification demo
  const showRandomNotification = useCallback(() => {
    const random = Math.floor(Math.random() * notificationMessages.length);
    const notif = notificationMessages[random];

    switch (notif.type) {
      case 'success':
        successToast(notif.message);
        break;
      case 'error':
        errorToast(notif.message);
        break;
      case 'warning':
        warningToast(notif.message);
        break;
      case 'info':
        infoToast(notif.message);
        break;
    }
  }, []);

  // Prefetch next page
  const handlePrefetchNext = useCallback(async () => {
    try {
      infoToast(t('notifications.prefetching'));
      await smartPrefetch(queryClient, 2, 20);
      successToast(t('notifications.success'));
    } catch (error) {
      errorToast(t('errors.networkError'));
    }
  }, [queryClient, t]);

  // Optimize cache
  const handleOptimizeCache = useCallback(() => {
    aggressiveGC(queryClient, 50);
    infoToast(t('notifications.cacheHit'));
  }, [queryClient, t]);

  // Clear cache
  const handleClearCache = useCallback(() => {
    queryClient.clear();
    successToast('Cache cleared');
    setCacheSize(0);
    setQueryCount(0);
  }, [queryClient]);

  // Batch prefetch tokens
  const handleBatchPrefetch = useCallback(async () => {
    if (!tokens || tokens.length === 0) {
      errorToast('No tokens to prefetch');
      return;
    }

    try {
      infoToast(t('notifications.prefetching'));
      const tokenIds = tokens.slice(0, 5).map((t) => t.id);
      await Promise.all(
        tokenIds.map((id) => prefetchTokensList(queryClient, 1, 20))
      );
      successToast(`Prefetched ${tokenIds.length} tokens`);
    } catch (error) {
      errorToast(t('errors.networkError'));
    }
  }, [tokens, queryClient, t]);

  // Start/Stop live price monitoring
  const handleStartLiveMonitoring = useCallback(() => {
    if (liveMonitoringActive) {
      // Stop monitoring
      if (liveMonitoringCleanupRef.current) {
        liveMonitoringCleanupRef.current();
      }
      setLiveMonitoringActive(false);
      infoToast('Live monitoring stopped');
      return;
    }

    if (tokens && tokens.length > 0) {
      // Start monitoring
      const cleanup = startLivePriceMonitoring(tokens.slice(0, 5), 2000);
      liveMonitoringCleanupRef.current = cleanup;
      setLiveMonitoringActive(true);
      successToast('Live price monitoring started 🚀');
    } else {
      errorToast('No tokens available for monitoring');
    }
  }, [tokens, startLivePriceMonitoring, liveMonitoringActive, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveMonitoringCleanupRef.current) {
        liveMonitoringCleanupRef.current();
      }
    };
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Activity size={24} color="#3b82f6" />
        <Text style={styles.title}>{t('notifications.title')}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatsCard
          icon={<BarChart3 size={20} color="#3b82f6" />}
          label="Queries Cached"
          value={queryCount}
          bgColor="#eff6ff"
        />
        <StatsCard
          icon={<Zap size={20} color="#10b981" />}
          label="Cache Size"
          value={formatCacheSize(cacheSize)}
          bgColor="#ecfdf5"
        />
      </View>

      {/* Demo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Visual Notifications</Text>
        <Text style={styles.sectionSubtitle}>
          Click "Random Notification" to see different toast types
        </Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label="Random Notification"
          onPress={showRandomNotification}
          bgColor="#3b82f6"
        />
      </View>

      {/* Live Price Monitoring Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>📊 Live Price Alerts</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Monitor top 5 tokens with real-time notifications
        </Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={liveMonitoringActive ? '⏸ Stop Live Monitoring' : '▶ Start Live Monitoring'}
          onPress={handleStartLiveMonitoring}
          bgColor={liveMonitoringActive ? '#ef4444' : '#10b981'}
        />

        {liveMonitoringActive && tokens && tokens.length > 0 && (
          <View style={styles.liveTokensContainer}>
            <Text style={styles.liveTokensTitle}>Monitoring Tokens:</Text>
            {tokens.slice(0, 5).map((token) => (
              <View key={token.id} style={styles.liveTokenItem}>
                <Text style={styles.liveTokenName}>{token.name}</Text>
                <Text style={styles.liveTokenPrice}>
                  ${token.current_price?.toFixed(2)}
                </Text>
              </View>
            ))}
            <Text style={styles.liveTokensNote}>
              💡 Prices will update every 2 seconds with toast notifications
            </Text>
          </View>
        )}
      </View>

      {/* All Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 Send Notifications</Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label="Success Notification"
          onPress={() => successToast('✅ Success! Operation completed')}
          bgColor="#10b981"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label="Info Notification"
          onPress={() => infoToast('ℹ️ Information: Data loaded')}
          bgColor="#3b82f6"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label="Warning Notification"
          onPress={() => warningToast('⚠️ Warning: Low memory')}
          bgColor="#f59e0b"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label="Error Notification"
          onPress={() => errorToast('❌ Error: Failed to load')}
          bgColor="#ef4444"
        />
      </View>

      {/* Optimization Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Cache Optimization</Text>

        <DemoButton
          icon={<DownloadCloud size={18} color="#fff" />}
          label="Prefetch Next Page"
          onPress={handlePrefetchNext}
          bgColor="#8b5cf6"
        />
        <DemoButton
          icon={<DownloadCloud size={18} color="#fff" />}
          label="Batch Prefetch Tokens"
          onPress={handleBatchPrefetch}
          bgColor="#6366f1"
        />
        <DemoButton
          icon={<RefreshCw size={18} color="#fff" />}
          label="Optimize Cache"
          onPress={handleOptimizeCache}
          bgColor="#06b6d4"
        />
        <DemoButton
          icon={<Trash2 size={18} color="#fff" />}
          label="Clear All Cache"
          onPress={handleClearCache}
          bgColor="#ec4899"
        />
      </View>

      {/* Tokens List Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Tokens Data Preview</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : tokens && tokens.length > 0 ? (
          <View>
            {tokens.slice(0, 5).map((token) => (
              <View key={token.id} style={styles.tokenItem}>
                <Text style={styles.tokenName}>{token.name}</Text>
                <Text style={styles.tokenPrice}>
                  ${token.current_price?.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noData}>{t('tokensList.noTokens')}</Text>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📖 About This Demo</Text>
        <Text style={styles.infoText}>
          • Uses react-query for smart caching and prefetching{'\n'}
          • Displays toast notifications with lucide icons{'\n'}
          • Demonstrates cache optimization strategies{'\n'}
          • Memory-efficient with automatic GC{'\n'}
          • Full i18n support for multi-language
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

interface StatsCardProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  bgColor: string;
}

function StatsCard({
  icon,
  label,
  value,
  bgColor,
}: StatsCardProps): React.JSX.Element {
  return (
    <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
      {icon}
      <Text style={styles.statsLabel}>{label}</Text>
      <Text style={styles.statsValue}>{value}</Text>
    </View>
  );
}

interface DemoButtonProps {
  icon: React.ReactElement;
  label: string;
  onPress: () => void;
  bgColor: string;
}

function DemoButton({
  icon,
  label,
  onPress,
  bgColor,
}: DemoButtonProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.demoButton, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={styles.demoButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  liveTokensContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
  },
  liveTokensTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  liveTokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  liveTokenName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  liveTokenPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  liveTokensNote: {
    fontSize: 11,
    color: '#16a34a',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tokenName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  tokenPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  noData: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 20,
  },
  spacer: {
    height: 32,
  },
});

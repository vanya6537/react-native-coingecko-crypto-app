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
import { LanguageToggler } from '../shared/ui/LanguageToggler';
import { csvExportAPI, imageExportAPI } from '../features/export';
import {
  Activity,
  RefreshCw,
  DownloadCloud,
  Trash2,
  BarChart3,
  Zap,
  TrendingUp,
  FileDown,
  Image as ImageIcon,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const notificationMessages = [
  {
    type: 'success' as const,
    message: 'notifications.toastSuccess',
  },
  {
    type: 'info' as const,
    message: 'notifications.toastInfo',
  },
  {
    type: 'warning' as const,
    message: 'notifications.toastWarning',
  },
  {
    type: 'error' as const,
    message: 'notifications.toastError',
  },
];

// Mock token data - prevents API rate limiting
const MOCK_TOKENS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', current_price: 45280.50 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', current_price: 2580.75 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', current_price: 1.05 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 180.25 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', current_price: 7.85 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', current_price: 2.15 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', current_price: 640.50 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', current_price: 0.32 },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', current_price: 18.50 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', current_price: 28.75 },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', current_price: 95.20 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', current_price: 0.95 },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', current_price: 11.50 },
  { id: 'vechain', name: 'VeChain', symbol: 'VET', current_price: 0.045 },
  { id: 'iota', name: 'IOTA', symbol: 'IOTA', current_price: 0.38 },
  { id: 'eos', name: 'EOS', symbol: 'EOS', current_price: 2.05 },
  { id: 'monero', name: 'Monero', symbol: 'XMR', current_price: 185.50 },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', current_price: 82.25 },
  { id: 'tezos', name: 'Tezos', symbol: 'XTZ', current_price: 1.85 },
  { id: 'neo', name: 'NEO', symbol: 'NEO', current_price: 22.50 },
];

export function NotificationsShowcasePage(): React.JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cacheSize, setCacheSize] = useState(0);
  const [queryCount, setQueryCount] = useState(0);
  const [liveMonitoringActive, setLiveMonitoringActive] = useState(false);
  const liveMonitoringCleanupRef = React.useRef<(() => void) | null>(null);

  // Use mock data instead of API calls to avoid 429 rate limits
  const { data: tokens, isLoading } = useQuery({
    queryKey: queryKeys.tokens.list(1, 20),
    queryFn: async () => {
      infoToast(t('notifications.dataLoaded'));
      // Return mock data instead of calling coingeckoAPI
      return MOCK_TOKENS.slice(0, 20);
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
        successToast(t(notif.message));
        break;
      case 'error':
        errorToast(t(notif.message));
        break;
      case 'warning':
        warningToast(t(notif.message));
        break;
      case 'info':
        infoToast(t(notif.message));
        break;
    }
  }, [t]);

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
    successToast(t('notifications.cacheHit'));
    setCacheSize(0);
    setQueryCount(0);
  }, [queryClient, t]);

  // Batch prefetch tokens
  const handleBatchPrefetch = useCallback(async () => {
    if (!tokens || tokens.length === 0) {
      errorToast(t('notifications.noTokensToExport'));
      return;
    }

    try {
      infoToast(t('notifications.prefetching'));
      const tokenIds = tokens.slice(0, 5).map((t) => t.id);
      await Promise.all(
        tokenIds.map((id) => prefetchTokensList(queryClient, 1, 20))
      );
      successToast(t('notifications.success'));
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
      successToast(t('notifications.monitoringStopped'));
      return;
    }

    if (tokens && tokens.length > 0) {
      // Start mock price monitoring (no real API calls)
      let intervalId: number | null = null;
      
      const mockPriceUpdate = () => {
        const randomToken = tokens[Math.floor(Math.random() * Math.min(tokens.length, 5))];
        if (randomToken) {
          const changePercent = (Math.random() - 0.5) * 4; // ±2%
          const changeType = changePercent > 0 ? 'up' : 'down';
          successToast(
            changeType === 'up'
              ? t('notifications.priceUp', { name: randomToken.name, percent: Math.abs(changePercent).toFixed(2) })
              : t('notifications.priceDown', { name: randomToken.name, percent: Math.abs(changePercent).toFixed(2) })
          );
        }
      };

      // Update prices every 2 seconds with mock data
      intervalId = setInterval(mockPriceUpdate, 2000) as unknown as number;
      liveMonitoringCleanupRef.current = () => {
        if (intervalId !== null) clearInterval(intervalId);
      };
      
      setLiveMonitoringActive(true);
      successToast(t('notifications.monitoringStarted'));
    } else {
      errorToast(t('notifications.noTokensMonitoring'));
    }
  }, [tokens, liveMonitoringActive, t]);

  // Export tokens as CSV
  const handleExportTokensCSV = useCallback(async () => {
    if (!tokens || tokens.length === 0) {
      errorToast(t('notifications.noTokensToExport'));
      return;
    }

    try {
      infoToast(t('notifications.exportingCsv'));
      await csvExportAPI.exportTokensAsCSV(tokens.slice(0, 20));
      successToast(t('notifications.exportSuccess'));
    } catch (error) {
      errorToast(t('notifications.exportFailed'));
      console.error('CSV export error:', error);
    }
  }, [tokens, t]);

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

      {/* Language Toggler */}
      <View style={styles.languageContainer}>
        <LanguageToggler compact={false} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatsCard
          icon={<BarChart3 size={20} color="#3b82f6" />}
          label={t('demoButtons.queriesCached')}
          value={queryCount}
          bgColor="#eff6ff"
        />
        <StatsCard
          icon={<Zap size={20} color="#10b981" />}
          label={t('demoButtons.cacheSize')}
          value={formatCacheSize(cacheSize)}
          bgColor="#ecfdf5"
        />
      </View>

      {/* Demo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 {t('notifications.demoVisualNotifications')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('notifications.demoVisualDesc')}
        </Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={t('notifications.randomNotification')}
          onPress={showRandomNotification}
          bgColor="#3b82f6"
        />
      </View>

      {/* Live Price Monitoring Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>📊 {t('notifications.demoPriceAlerts')}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {t('notifications.demoPriceAlertsDesc')}
        </Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={liveMonitoringActive ? `⏸ ${t('notifications.stopLiveMonitoring')}` : `▶ ${t('notifications.startLiveMonitoring')}`}
          onPress={handleStartLiveMonitoring}
          bgColor={liveMonitoringActive ? '#ef4444' : '#10b981'}
        />

        {liveMonitoringActive && tokens && tokens.length > 0 && (
          <View style={styles.liveTokensContainer}>
            <Text style={styles.liveTokensTitle}>{t('notifications.monitoringTokens')}:</Text>
            {tokens.slice(0, 5).map((token) => (
              <View key={token.id} style={styles.liveTokenItem}>
                <Text style={styles.liveTokenName}>{token.name}</Text>
                <Text style={styles.liveTokenPrice}>
                  ${token.current_price?.toFixed(2)}
                </Text>
              </View>
            ))}
            <Text style={styles.liveTokensNote}>
              {t('notifications.monitoringNote')}
            </Text>
          </View>
        )}
      </View>

      {/* All Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notifications.sendNotifications')}</Text>

        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={t('notifications.successNotificationButtonLabel')}
          onPress={() => successToast(t('notifications.toastSuccess'))}
          bgColor="#10b981"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={t('notifications.infoNotificationButtonLabel')}
          onPress={() => infoToast(t('notifications.toastInfo'))}
          bgColor="#3b82f6"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={t('notifications.warningNotificationButtonLabel')}
          onPress={() => warningToast(t('notifications.toastWarning'))}
          bgColor="#f59e0b"
        />
        <DemoButton
          icon={<Activity size={18} color="#fff" />}
          label={t('notifications.errorNotificationButtonLabel')}
          onPress={() => errorToast(t('notifications.toastError'))}
          bgColor="#ef4444"
        />
      </View>

      {/* Optimization Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ {t('notifications.demoCacheOpt')}</Text>

        <DemoButton
          icon={<DownloadCloud size={18} color="#fff" />}
          label={t('notifications.prefetchNext')}
          onPress={handlePrefetchNext}
          bgColor="#8b5cf6"
        />
        <DemoButton
          icon={<DownloadCloud size={18} color="#fff" />}
          label={t('notifications.batchPrefetch')}
          onPress={handleBatchPrefetch}
          bgColor="#6366f1"
        />
        <DemoButton
          icon={<RefreshCw size={18} color="#fff" />}
          label={t('notifications.optimizeCache')}
          onPress={handleOptimizeCache}
          bgColor="#06b6d4"
        />
        <DemoButton
          icon={<Trash2 size={18} color="#fff" />}
          label={t('notifications.clearCache')}
          onPress={handleClearCache}
          bgColor="#ec4899"
        />
      </View>

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📥 {t('notifications.demoExport')}</Text>

        <DemoButton
          icon={<FileDown size={18} color="#fff" />}
          label={t('notifications.exportCsv')}
          onPress={handleExportTokensCSV}
          bgColor="#14b8a6"
        />
      </View>

      {/* Tokens List Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 {t('notifications.demoTokensPreview')}</Text>

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
        <Text style={styles.infoTitle}>📖 {t('notifications.demoAbout')}</Text>
        <Text style={styles.infoText}>
          {t('notifications.demoAboutText')}
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
  languageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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

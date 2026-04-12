/**
 * Shared UI component: StateComponents
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  showRetry = true,
}: ErrorBoundaryProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>{t('errors.oops')}</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const EmptyState: React.FC<{ message?: string }> = ({
  message = 'No tokens found',
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>{message || t('tokensList.noTokens')}</Text>
      <Text style={styles.emptySubtext}>{t('tokensList.tryAdjusting')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
});

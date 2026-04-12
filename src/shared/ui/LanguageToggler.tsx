/**
 * Language Toggler Component
 * Switch between EN and RU
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react-native';

interface LanguageTogglerProps {
  style?: ViewStyle;
  compact?: boolean;
}

export function LanguageToggler({
  style,
  compact = false,
}: LanguageTogglerProps): React.JSX.Element {
  const { i18n } = useTranslation();
  const isRussian = i18n.language === 'ru';

  const handleToggle = () => {
    i18n.changeLanguage(isRussian ? 'en' : 'ru');
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Globe size={18} color="#3b82f6" />
        <Text style={styles.compactText}>{isRussian ? 'EN' : 'RU'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Globe size={20} color="#3b82f6" />
        <View style={styles.textContainer}>
          <Text style={styles.label}>
            {isRussian ? 'English' : 'Русский'}
          </Text>
          <Text style={styles.description}>
            {isRussian ? 'Switch to English' : 'Переключиться на русский'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isRussian ? '#ef4444' : '#10b981',
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isRussian ? 'EN' : 'RU'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#64748b',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    gap: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
  },
});

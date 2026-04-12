/**
 * Toast Notification Component
 * Visual notification UI with animations & lucide icons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useUnit } from 'effector-react';
import { MotiView } from 'moti';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { $toasts, removeToast, type ToastType, type Toast } from '../model/toastStore';

const { width } = Dimensions.get('window');

const TOAST_ICONS: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const TOAST_COLORS: Record<ToastType, { bg: string; icon: string; text: string }> = {
  success: {
    bg: '#10b981',
    icon: '#ecfdf5',
    text: '#ecfdf5',
  },
  error: {
    bg: '#ef4444',
    icon: '#fef2f2',
    text: '#fef2f2',
  },
  info: {
    bg: '#3b82f6',
    icon: '#eff6ff',
    text: '#eff6ff',
  },
  warning: {
    bg: '#f59e0b',
    icon: '#fffbeb',
    text: '#fffbeb',
  },
};

export function ToastContainer(): React.JSX.Element {
  const toasts = useUnit($toasts);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

interface ToastProps {
  toast: Toast;
}

function Toast({ toast }: ToastProps): React.JSX.Element {
  const colors = TOAST_COLORS[toast.type];
  const IconComponent = TOAST_ICONS[toast.type];

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[styles.toastWrapper]}
    >
      <View style={[styles.toast, { backgroundColor: colors.bg }]}>
        <View style={styles.toastContent}>
          <IconComponent
            size={20}
            color={colors.icon}
            style={styles.toastIcon}
          />
          <Text
            style={[styles.toastMessage, { color: colors.text }]}
            numberOfLines={2}
          >
            {toast.message}
          </Text>
        </View>

        {toast.action && (
          <TouchableOpacity
            onPress={() => {
              toast.action?.onPress();
              removeToast(toast.id);
            }}
            style={styles.toastAction}
          >
            <Text style={[styles.toastActionText, { color: colors.text }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => removeToast(toast.id)}
          style={styles.toastClose}
        >
          <X size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastWrapper: {
    marginBottom: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    maxWidth: width - 32,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  toastMessage: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  toastAction: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toastActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toastClose: {
    marginLeft: 8,
    padding: 4,
  },
});

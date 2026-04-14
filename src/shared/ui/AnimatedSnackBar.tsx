/**
 * Animated Snack Bar with auto-dismiss, entrance and exit animations
 * Toast notifications with premium feel and haptic feedback
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  SlideInUp,
  SlideOutDown,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedSnackBarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const typeStyles = {
  success: {
    backgroundColor: '#4CAF50',
    icon: '✓',
    color: '#FFFFFF',
  },
  error: {
    backgroundColor: '#F44336',
    icon: '✕',
    color: '#FFFFFF',
  },
  warning: {
    backgroundColor: '#FF9800',
    icon: '⚠',
    color: '#FFFFFF',
  },
  info: {
    backgroundColor: '#2196F3',
    icon: 'ⓘ',
    color: '#FFFFFF',
  },
};

export const AnimatedSnackBar: React.FC<AnimatedSnackBarProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  actionLabel,
  onAction,
  onDismiss,
  style,
}) => {
  const scaleValue = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      scaleValue.value = withSpring(1, { damping: 8 });

      const timer = setTimeout(() => {
        scaleValue.value = withSpring(0, { damping: 8 });
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      scaleValue.value = withSpring(0, { damping: 8 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      {
        translateY: interpolate(
          scaleValue.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
    opacity: scaleValue.value,
  }));

  if (!visible && scaleValue.value === 0) return null;

  const config = typeStyles[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
        },
        animatedStyle,
        style,
      ]}
      entering={SlideInUp.duration(300)}
      exiting={SlideOutDown.duration(300)}
      layout={Layout.springify()}
    >
      <View style={styles.content}>
        <Animated.Text
          style={[styles.icon, { color: config.color }]}
          entering={FadeInUp.duration(300).delay(50)}
        >
          {config.icon}
        </Animated.Text>

        <Animated.Text
          style={[styles.message, { color: config.color }]}
          numberOfLines={2}
          entering={FadeInUp.duration(350).delay(100)}
        >
          {message}
        </Animated.Text>

        {actionLabel && (
          <Pressable
            onPress={() => {
              onAction?.();
              onDismiss?.();
            }}
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
          >
            <Animated.Text
              style={[styles.actionLabel, { color: config.color }]}
              entering={FadeInUp.duration(400).delay(150)}
            >
              {actionLabel}
            </Animated.Text>
          </Pressable>
        )}
      </View>

      {/* Progress bar - duration indicator */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            height: 2,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

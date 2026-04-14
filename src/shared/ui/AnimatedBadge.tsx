/**
 * Animated Badge with pulse and entrance animations
 * Reusable badge for notifications, labels, and status indicators
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  Layout,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedBadgeProps {
  label: string | number;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'pulse' | 'dot';
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  label,
  color = '#FFFFFF',
  backgroundColor = '#FF4081',
  size = 'medium',
  variant = 'default',
  style,
  delay = 0,
}) => {
  const pulseValue = useSharedValue(0);

  const sizeMap = {
    small: { padding: 4, fontSize: 10, minWidth: 20 },
    medium: { padding: 6, fontSize: 12, minWidth: 24 },
    large: { padding: 8, fontSize: 14, minWidth: 32 },
  };

  const sizeConfig = sizeMap[size];

  React.useEffect(() => {
    if (variant === 'pulse') {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [variant]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: variant === 'pulse'
      ? interpolate(pulseValue.value, [0, 1], [0.5, 1], Extrapolate.CLAMP)
      : 1,
    transform: [
      {
        scale: variant === 'pulse'
          ? interpolate(pulseValue.value, [0, 1], [0.9, 1.1], Extrapolate.CLAMP)
          : 1,
      },
    ],
  }));

  if (variant === 'dot') {
    return (
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor,
            width: sizeConfig.minWidth * 0.6,
            height: sizeConfig.minWidth * 0.6,
            borderRadius: (sizeConfig.minWidth * 0.6) / 2,
          },
          pulseStyle,
          style,
        ]}
        entering={ZoomIn.duration(300).delay(delay)}
        layout={Layout.springify()}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingHorizontal: sizeConfig.padding * 1.5,
          paddingVertical: sizeConfig.padding,
          borderRadius: sizeConfig.minWidth / 2,
          minWidth: sizeConfig.minWidth,
        },
        pulseStyle,
        style,
      ]}
      entering={FadeInDown.duration(300).delay(delay).springify()}
      layout={Layout.springify()}
    >
      <Animated.Text
        style={[
          styles.text,
          {
            color,
            fontSize: sizeConfig.fontSize,
            fontWeight: '700',
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

interface AnimatedDividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  delay?: number;
}

export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({
  style,
  color = '#E0E0E0',
  thickness = 1,
  delay = 0,
}) => {
  return (
    <Animated.View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
        },
        style,
      ]}
      entering={FadeInDown.duration(400).delay(delay)}
      layout={Layout.springify()}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    width: '100%',
  },
});

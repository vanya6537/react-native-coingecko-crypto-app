/**
 * Animated Progress Bar with smooth animations and color transitions
 * Reusable progress indicator with premium feel
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

interface AnimatedProgressBarProps {
  value: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  color = '#1976D2',
  backgroundColor = '#E0E0E0',
  height = 4,
  showLabel = false,
  animated = true,
  style,
  delay = 0,
}) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(Math.min(Math.max(value, 0), 100) / 100, {
        duration: 800,
      });
    } else {
      progressValue.value = Math.min(Math.max(value, 0), 100) / 100;
    }
  }, [value]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        style,
      ]}
      entering={FadeInDown.duration(400).delay(delay)}
      layout={Layout.springify()}
    >
      {/* Label */}
      {showLabel && (
        <Animated.Text
          style={[styles.label, { color }]}
          entering={FadeInDown.duration(300).delay(delay + 50)}
        >
          {Math.round(value)}%
        </Animated.Text>
      )}

      {/* Progress Bar */}
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor,
            height,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: color,
              borderRadius: height / 2,
            },
            progressStyle,
          ]}
        />

        {/* Shine effect */}
        {animated && (
          <Animated.View
            style={[
              styles.shine,
              {
                height,
                borderRadius: height / 2,
              },
            ]}
          />
        )}
      </View>

      {/* Min/Max indicators */}
      <View style={styles.indicators}>
        <Animated.Text style={styles.indicator}>0%</Animated.Text>
        <Animated.Text style={styles.indicator}>100%</Animated.Text>
      </View>
    </Animated.View>
  );
};

interface AnimatedCircularProgressProps {
  value: number; // 0-100
  size?: number;
  color?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  value,
  size = 80,
  color = '#1976D2',
  backgroundColor = '#E0E0E0',
  strokeWidth = 4,
  showLabel = false,
  animated = true,
  style,
  delay = 0,
}) => {
  const progressValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(Math.min(Math.max(value, 0), 100), {
        duration: 800,
      });
    } else {
      progressValue.value = Math.min(Math.max(value, 0), 100);
    }
  }, [value]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progressValue.value * 3.6}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.circularContainer,
        {
          width: size,
          height: size,
        },
        style,
      ]}
      entering={FadeInDown.duration(400).delay(delay)}
      layout={Layout.springify()}
    >
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />

      {/* Progress arc */}
      <Animated.View
        style={[
          styles.circleProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          },
          rotateStyle,
        ]}
      />

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Animated.Text
            style={[styles.labelText, { color }]}
            entering={FadeInDown.duration(400).delay(delay + 100)}
          >
            {Math.round(value)}%
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Linear progress
  container: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  barContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    flex: 1,
    width: '100%',
  },
  shine: {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.3,
    backgroundColor: '#FFFFFF',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicator: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '500',
  },

  // Circular progress
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

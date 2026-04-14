/**
 * Animated Loader with rotating segments and pulsing effects
 * Premium loading indicator with multiple animation layers
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  ZoomIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

interface AnimatedLoaderProps {
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  visible = true,
  size = 'medium',
  color = '#1976D2',
  message,
  style,
}) => {
  const rotateValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const actualSize = sizeMap[size];

  useEffect(() => {
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 1500 }),
      -1,
      false
    );

    pulseValue.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const rotatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: 1 / pulseValue.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, style]}
      entering={ZoomIn.duration(300)}
      layout={Layout.springify()}
    >
      {/* Pulsing outer ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: actualSize * 1.5,
            height: actualSize * 1.5,
            borderRadius: (actualSize * 1.5) / 2,
            borderWidth: 1,
            borderColor: color,
            opacity: 0.2,
          },
          pulseStyle,
        ]}
      />

      {/* Main rotating circle */}
      <Animated.View
        style={[
          styles.loaderContainer,
          {
            width: actualSize,
            height: actualSize,
          },
          rotatedStyle,
        ]}
      >
        {/* Segment 1 */}
        <View
          style={[
            styles.segment,
            {
              borderTopColor: color,
              borderTopWidth: 3,
              width: actualSize,
              height: actualSize,
              borderRadius: actualSize / 2,
              opacity: 1,
            },
          ]}
        />
      </Animated.View>

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            width: actualSize * 0.3,
            height: actualSize * 0.3,
            borderRadius: (actualSize * 0.3) / 2,
            backgroundColor: color,
          },
        ]}
      />

      {/* Loading message */}
      {message && (
        <Animated.Text
          style={[styles.message, { color }]}
          entering={FadeInDown.duration(400).delay(100)}
        >
          {message}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pulseRing: {
    position: 'absolute',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segment: {
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerDot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  message: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

/**
 * Animated stat card with entrance and hover animations
 * Provides premium feel with scale, shadow, and color animations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedStatCardProps {
  label: string;
  value: string;
  color?: string;
  delay?: number;
  onPress?: () => void;
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  label,
  value,
  color = '#1976D2',
  delay = 0,
  onPress,
}) => {
  const scaleValue = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95, { damping: 8 });
    setIsPressed(true);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 8 });
    setIsPressed(false);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: interpolate(
      scaleValue.value,
      [0.95, 1],
      [0.1, 0.15],
      Extrapolate.CLAMP
    ),
    elevation: interpolate(
      scaleValue.value,
      [0.95, 1],
      [4, 6],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <Animated.View
      entering={FadeInUp.springify().delay(delay)}
      exiting={FadeOutDown.springify()}
      style={[styles.card, animatedStyle]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressedState,
        ]}
      >
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <Animated.Text
          style={[styles.label, { color }]}
          entering={FadeInUp.duration(400).delay(delay + 50)}
        >
          {label.toUpperCase()}
        </Animated.Text>
        <Animated.Text
          style={[styles.value, { color: '#1A1A1A' }]}
          entering={FadeInUp.duration(500).delay(delay + 100)}
        >
          {value}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pressable: {
    padding: 14,
  },
  pressedState: {
    backgroundColor: '#F0F2F5',
  },
  colorBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 8,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

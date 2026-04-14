/**
 * Animated Card with interactive elevation, scale, and shadow animations
 * Reusable card component for all content displays with WOW effects
 */

import React, { useState } from 'react';
import {
  View,
  ViewStyle,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  FadeInUp,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  delay?: number;
  enableHover?: boolean;
  index?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  backgroundColor = '#FFFFFF',
  borderRadius = 12,
  padding = 16,
  delay = 0,
  enableHover = true,
  index = 0,
}) => {
  const scaleValue = useSharedValue(1);
  const elevationValue = useSharedValue(2);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (enableHover) {
      scaleValue.value = withSpring(0.97, { damping: 8 });
      elevationValue.value = withSpring(8, { damping: 8 });
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 8 });
    elevationValue.value = withSpring(2, { damping: 8 });
    setIsPressed(false);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: interpolate(
      elevationValue.value,
      [2, 8],
      [0.08, 0.2],
      Extrapolate.CLAMP
    ),
    elevation: elevationValue.value,
    shadowRadius: interpolate(
      elevationValue.value,
      [2, 8],
      [3, 12],
      Extrapolate.CLAMP
    ),
  }));

  const content = (
    <View
      style={[
        styles.cardContent,
        {
          backgroundColor,
          borderRadius,
          padding,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        style,
      ]}
      entering={FadeInUp.duration(400).delay(delay + index * 50)}
      layout={Layout.springify()}
    >
      {onPress || onLongPress ? (
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          style={({ pressed }) => [
            styles.pressable,
            pressed && enableHover && styles.pressedState,
          ]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: 'transparent',
  },
  pressable: {
    flex: 1,
  },
  pressedState: {
    opacity: 0.95,
  },
  cardContent: {
    flex: 1,
  },
});

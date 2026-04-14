/**
 * Animated price badge with pulse effect on price changes
 * Provides visual feedback when price updates
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface PricePulseBadgeProps {
  price: number | null;
  color: string;
  fontSize?: number;
  fontWeight?: string;
}

export const PricePulseBadge: React.FC<PricePulseBadgeProps> = ({
  price,
  color,
  fontSize = 14,
  fontWeight = '700',
}) => {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  // Trigger pulse animation when price changes
  useEffect(() => {
    // First pulse - big scale
    scaleValue.value = withSequence(
      withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );

    // Add color flash
    opacityValue.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
  }, [price, scaleValue, opacityValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          color,
          fontSize,
          fontWeight: fontWeight as any,
        },
        animatedStyle,
      ]}
    >
      {price !== null ? `$${price.toFixed(2)}` : 'N/A'}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  // Styles if needed
});

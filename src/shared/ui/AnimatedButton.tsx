/**
 * Animated Button with ripple effect and premium interactions
 * Material Design inspired pressable button with WOW animations
 */

import React, { useRef, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  FadeInUp,
  Layout,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  ZoomIn,
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  variant?: 'solid' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  delay?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onPress,
  color = '#1976D2',
  variant = 'solid',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  style,
  delay = 0,
}) => {
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);

  const sizeMap = {
    small: { padding: 8, fontSize: 12, minHeight: 32 },
    medium: { padding: 12, fontSize: 14, minHeight: 40 },
    large: { padding: 16, fontSize: 16, minHeight: 48 },
  };

  const sizeConfig = sizeMap[size];

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scaleValue.value = withSpring(0.95, { damping: 8 });
      if (icon) {
        rotateValue.value = withSequence(
          withTiming(10, { duration: 100 }),
          withTiming(-5, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
      }
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 8 });
    setIsPressed(false);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { rotate: `${rotateValue.value}deg` },
    ],
    opacity: disabled ? 0.6 : 1,
  }));

  const getBackgroundColor = () => {
    if (variant === 'solid') return color;
    if (variant === 'outlined') return 'transparent';
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'solid') return '#FFFFFF';
    return color;
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return color;
    return 'transparent';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        style,
      ]}
      entering={FadeInUp.duration(400).delay(delay)}
      layout={Layout.springify()}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            paddingHorizontal: sizeConfig.padding,
            paddingVertical: sizeConfig.padding * 0.66,
            minHeight: sizeConfig.minHeight,
            borderWidth: variant === 'outlined' ? 2 : 0,
          },
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Animated.View
          style={[
            styles.content,
            icon ? { gap: 8 } : { gap: 0 },
          ]}
          entering={ZoomIn.duration(300).delay(delay + 50)}
        >
          {loading && (
            <Animated.Text style={styles.icon}>◌</Animated.Text>
          )}
          {icon && !loading && (
            <Animated.Text
              style={[
                styles.icon,
                {
                  color: getTextColor(),
                  fontSize: sizeConfig.fontSize,
                },
              ]}
            >
              {icon}
            </Animated.Text>
          )}
          <Animated.Text
            style={[
              styles.label,
              {
                color: getTextColor(),
                fontSize: sizeConfig.fontSize,
                fontWeight: '600',
              },
            ]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  icon: {
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});

/**
 * Animated Floating Action Button with pulse and wobble animations
 * Premium FAB with entrance, hover, and press animations
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  BounceInUp,
  FadeInUp,
  FadeOutDown,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';

interface AnimatedFABProps {
  icon: string | React.ReactNode;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  label?: string;
}

export const AnimatedFloatingActionButton: React.FC<AnimatedFABProps> = ({
  icon,
  onPress,
  color = '#1976D2',
  size = 'large',
  position = 'bottom-right',
  label,
}) => {
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);

  const sizeMap = {
    small: 48,
    medium: 56,
    large: 64,
  };

  const iconSizeMap = {
    small: 24,
    medium: 28,
    large: 32,
  };

  const actualSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.9, { damping: 8 });
    rotateValue.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    setIsPressed(true);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 8 });
    onPress();
    setIsPressed(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      {
        rotate: `${rotateValue.value}deg`,
      },
    ],
  }));

  const positionStyle = {
    'bottom-right': styles.positionBottomRight,
    'bottom-center': styles.positionBottomCenter,
    'bottom-left': styles.positionBottomLeft,
  };

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        positionStyle[position],
        { width: actualSize, height: actualSize },
      ]}
      entering={BounceInUp.duration(500).delay(200)}
      exiting={FadeOutDown.duration(300)}
      layout={Layout.springify()}
    >
      {/* Pulse background effect */}
      <Animated.View
        style={[
          styles.pulseBackground,
          {
            width: actualSize,
            height: actualSize,
            backgroundColor: color,
            opacity: 0.15,
          },
        ]}
        entering={ZoomIn.duration(400).delay(200)}
      />

      {/* Main button */}
      <Animated.View
        style={[
          styles.fabButton,
          {
            width: actualSize,
            height: actualSize,
            borderRadius: actualSize / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.pressable,
            {
              width: actualSize,
              height: actualSize,
              borderRadius: actualSize / 2,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.icon,
              {
                fontSize: iconSize,
                color: '#FFFFFF',
              },
            ]}
            entering={ZoomIn.duration(400).delay(300)}
          >
            {typeof icon === 'string' ? icon : icon}
          </Animated.Text>
        </Pressable>
      </Animated.View>

      {/* Label - shows on hover */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              backgroundColor: color,
              color: '#FFFFFF',
              opacity: isPressed ? 0 : 1,
            },
          ]}
          entering={FadeInUp.duration(300).delay(250)}
          exiting={FadeOutDown.duration(200)}
        >
          {label}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionBottomRight: {
    bottom: 24,
    right: 24,
  },
  positionBottomCenter: {
    bottom: 24,
    left: '50%',
    marginLeft: -32,
  },
  positionBottomLeft: {
    bottom: 24,
    left: 24,
  },
  pulseBackground: {
    position: 'absolute',
    borderRadius: 999,
  },
  fabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontWeight: '600',
  },
  label: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    top: -40,
    fontSize: 12,
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 6,
  },
});

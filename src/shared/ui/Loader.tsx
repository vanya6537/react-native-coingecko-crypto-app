import React, { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface LoaderProps {
  size?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const LoaderComponent: React.FC<LoaderProps> = ({ size = 64 }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Strict Monochrome Palette
  const color = isDark ? '#FFFFFF' : '#000000';
  const backgroundColor = isDark ? '#000000' : '#FFFFFF';

  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    // Elegant, slightly weighted rotation
    rotation.value = withRepeat(
      withTiming(1, { 
        duration: 1800, 
        easing: Easing.bezier(0.4, 0, 0.2, 1) 
      }),
      -1,
      false
    );

    // Breathing glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const breatheStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        
        {/* THE GLOW: Layered blurs for a high-end bloom effect */}
        <AnimatedView
          style={[
            styles.glow,
            {
              width: size * 0.8,
              height: size * 0.8,
              borderRadius: size,
              backgroundColor: color,
              // RN 0.84+ native blur filter
              filter: [{ blur: 15 }], 
            },
            breatheStyle,
          ]}
        />

        {/* THE CORE: The sharp rotating element */}
        <AnimatedView
          style={[
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size,
              borderWidth: 2,
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: color, // Semi-circle for a sleek "tail"
              opacity: 0.9,
            },
            spinStyle,
          ]}
        />
        
        {/* OPTIONAL: Center point for visual balance */}
        <View style={[styles.dot, { backgroundColor: color, width: 2, height: 2, borderRadius: 1 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    zIndex: 1,
  },
  dot: {
    position: 'absolute',
    opacity: 0.3,
  }
});
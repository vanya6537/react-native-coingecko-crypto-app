import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface LoaderProps {
  size?: number;
  text?: string;
}

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

// Stylish animated spinner with orbiting dots
function StylishSpinner({ size, dark }: { size: number; dark: boolean }) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [rotation, pulse]);

  const rotatingStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0.5, 1], [0.8, 1]);
    const opacity = interpolate(pulse.value, [0.5, 1], [0.3, 0.8]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const primaryColor = dark ? '#3b82f6' : '#60a5fa';
  const accentColor = dark ? '#1e40af' : '#0284c7';
  const dotColor = dark ? '#06b6d4' : '#38bdf8';

  const dotRadius = size * 0.25;
  const dotSize = size * 0.08;

  const dots = Array.from({ length: 3 }, (_, i) => {
    const angle = (i * 120 * Math.PI) / 180;
    const x = Math.cos(angle) * dotRadius;
    const y = Math.sin(angle) * dotRadius;
    return { x, y };
  });

  return (
    <View
      style={[
        styles.spinnerContainer,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {/* Central pulsing circle */}
      <AnimatedView
        style={[
          styles.centerPulse,
          {
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: size * 0.06,
            backgroundColor: primaryColor,
          },
          pulseStyle,
        ]}
      />

      {/* Rotating outer ring */}
      <AnimatedView
        style={[
          styles.outerRing,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            borderWidth: 2,
            borderColor: primaryColor,
            borderTopColor: accentColor,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
          },
          rotatingStyle,
        ]}
      />

      {/* Rotating container for orbiting dots */}
      <AnimatedView
        style={[
          styles.orbitContainer,
          {
            width: size * 0.55,
            height: size * 0.55,
          },
          rotatingStyle,
        ]}
      >
        {dots.map((dot, idx) => (
          <View
            key={idx}
            style={[
              styles.orbitDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: idx === 0 ? dotColor : primaryColor,
                opacity: 1 - idx * 0.15,
                left: size * 0.275 + dot.x - dotSize / 2,
                top: size * 0.275 + dot.y - dotSize / 2,
              },
            ]}
          />
        ))}
      </AnimatedView>

      {/* Inner decorative circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: size * 0.175,
            borderWidth: 1,
            borderColor: accentColor,
            opacity: 0.4,
          },
        ]}
      />
    </View>
  );
}

// Floating animated text
function FloatingLabel({ text, dark }: { text: string; dark: boolean }) {
  const letters = text.split('');

  return (
    <View style={styles.labelContainer}>
      {letters.map((char, index) => {
        const letterProgress = useSharedValue(0);

        useEffect(() => {
          letterProgress.value = withDelay(
            index * 80,
            withRepeat(
              withSequence(
                withTiming(1, {
                  duration: 400,
                  easing: Easing.out(Easing.cubic),
                }),
                withTiming(0, {
                  duration: 1200,
                  easing: Easing.inOut(Easing.cubic),
                })
              ),
              -1,
              false
            )
          );
        }, [index]);

        const letterStyle = useAnimatedStyle(() => {
          const opacity = interpolate(letterProgress.value, [0, 0.3, 1], [0.5, 1, 0.5], Extrapolation.CLAMP);
          const scale = interpolate(letterProgress.value, [0, 0.3, 1], [0.9, 1.1, 0.9], Extrapolation.CLAMP);
          const translateY = interpolate(letterProgress.value, [0, 0.15, 1], [4, -3, 4], Extrapolation.CLAMP);

          return {
            opacity,
            transform: [{ scale }, { translateY }],
          };
        });

        return (
          <AnimatedText
            key={`${char}-${index}`}
            style={[
              styles.labelText,
              {
                color: dark ? '#1f2937' : '#e0f2fe',
              },
              letterStyle,
            ]}
          >
            {char}
          </AnimatedText>
        );
      })}
    </View>
  );
}

export const LoaderComponent: React.FC<LoaderProps> = ({
  size = 180,
  text = 'Generating',
}) => {
  const scheme = useColorScheme();
  const dark = scheme === 'light';

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#f3f4f6' : '#1a3379' }]}>
      <View style={styles.loaderContent}>
        <StylishSpinner size={size} dark={dark} />
        {text && <FloatingLabel text={text} dark={dark} />}
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
  loaderContent: {
    alignItems: 'center',
    gap: 24,
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerPulse: {
    position: 'absolute',
    zIndex: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  outerRing: {
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  orbitContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  orbitDot: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  innerCircle: {
    position: 'absolute',
    zIndex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
    minHeight: 20,
  },
  labelText: {
    fontWeight: '600',
    fontSize: 11,
    includeFontPadding: false,
    letterSpacing: 0.5,
  },
});
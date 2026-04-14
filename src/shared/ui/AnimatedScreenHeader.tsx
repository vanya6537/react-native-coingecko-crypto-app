/**
 * Animated screen header with collapsible/expandable animation
 * Provides premium header experience with backdrop blur simulation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  color?: string;
}

export const AnimatedScreenHeader: React.FC<AnimatedScreenHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightAction,
  color = '#1976D2',
}) => {
  const expandValue = useSharedValue(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandPress = () => {
    const newValue = isExpanded ? 0 : 1;
    expandValue.value = withSpring(newValue, { damping: 8 });
    setIsExpanded(!isExpanded);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(expandValue.value, [0, 1], [64, 140], Extrapolate.CLAMP),
    opacity: interpolate(expandValue.value, [0, 1], [0.8, 1], Extrapolate.CLAMP),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      expandValue.value,
      [0, 1],
      [16, 28],
      Extrapolate.CLAMP
    ),
    fontWeight: interpolate(
      expandValue.value,
      [0, 1],
      [600, 800],
      Extrapolate.CLAMP
    ) as any,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandValue.value, [0, 0.8, 1], [0, 0, 1], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(
          expandValue.value,
          [0, 1],
          [10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: color }]}
      entering={FadeInDown.duration(400).springify()}
      layout={Layout.springify()}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          {/* Left Action */}
          {onBackPress && (
            <Animated.View
              entering={ZoomIn.duration(300).delay(50)}
              style={styles.actionButton}
            >
              <Pressable onPress={onBackPress} style={styles.pressable}>
                <Text style={styles.backText}>←</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Title Section - Expands on tap */}
          <Pressable
            onPress={handleExpandPress}
            style={styles.titleSection}
            hitSlop={12}
          >
            <Animated.View
              style={[styles.titleWrapper, animatedStyle]}
              layout={Layout.springify()}
            >
              <Animated.Text
                style={[styles.title, { color: '#FFFFFF' }, titleStyle]}
                numberOfLines={isExpanded ? 2 : 1}
                entering={FadeInDown.duration(500).delay(100)}
              >
                {title}
              </Animated.Text>

              {subtitle && (
                <Animated.Text
                  style={[
                    styles.subtitle,
                    { color: 'rgba(255, 255, 255, 0.85)' },
                    subtitleStyle,
                  ]}
                  numberOfLines={2}
                  entering={FadeInDown.duration(600).delay(150)}
                >
                  {subtitle}
                </Animated.Text>
              )}
            </Animated.View>
          </Pressable>

          {/* Right Action */}
          {rightAction && (
            <Animated.View
              entering={ZoomIn.duration(300).delay(50)}
              style={styles.actionButton}
            >
              <Pressable onPress={rightAction.onPress} style={styles.pressable}>
                <Text style={styles.actionText}>{rightAction.icon}</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Gradient bar indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: isExpanded
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleSection: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  titleWrapper: {
    overflow: 'hidden',
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  indicator: {
    height: 2,
    alignSelf: 'center',
    width: '20%',
    borderRadius: 1,
    marginBottom: 8,
  },
});

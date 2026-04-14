/**
 * Animated List Item with swipe actions and entrance animations
 * Reusable list item with drag indicator and premium feel
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  FadeInLeft,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedListItemAction {
  label: string;
  icon?: string;
  color?: string;
  onPress: () => void;
}

interface AnimatedListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  actions?: AnimatedListItemAction[];
  index?: number;
  style?: ViewStyle;
  isDragging?: boolean;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  onLongPress,
  actions = [],
  index = 0,
  style,
  isDragging = false,
}) => {
  const scaleValue = useSharedValue(1);
  const elevationValue = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98, { damping: 8 });
    elevationValue.value = withSpring(6, { damping: 8 });
    setIsPressed(true);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 8 });
    elevationValue.value = withSpring(1, { damping: 8 });
    setIsPressed(false);
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: interpolate(
      elevationValue.value,
      [1, 6],
      [0.05, 0.15],
      Extrapolate.CLAMP
    ),
    elevation: elevationValue.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        style,
      ]}
      entering={FadeInLeft.duration(400).delay(index * 50)}
      layout={Layout.springify()}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.content}>
          {/* Drag indicator */}
          {isDragging && (
            <Animated.View
              style={[styles.dragHandle, styles.dragIndicator]}
            >
              <View style={styles.dragDot} />
              <View style={styles.dragDot} />
              <View style={styles.dragDot} />
            </Animated.View>
          )}

          {/* Icon */}
          {icon && (
            <Animated.Text
              style={[
                styles.icon,
                {
                  fontSize: 24,
                  marginRight: isDragging ? 8 : 12,
                },
              ]}
            >
              {icon}
            </Animated.Text>
          )}

          {/* Text Content */}
          <View style={styles.textContent}>
            <Animated.Text
              style={styles.title}
              numberOfLines={1}
            >
              {title}
            </Animated.Text>
            {subtitle && (
              <Animated.Text
                style={styles.subtitle}
                numberOfLines={1}
              >
                {subtitle}
              </Animated.Text>
            )}
          </View>

          {/* Action chevron */}
          {(onPress || onLongPress) && !actions.length && (
            <Animated.Text style={styles.chevron}>
              ›
            </Animated.Text>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <View style={styles.actions}>
              {actions.map((action, idx) => (
                <Pressable
                  key={idx}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.action,
                    {
                      backgroundColor: action.color || '#757575',
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Animated.Text style={styles.actionText}>
                    {action.icon || '•'}
                  </Animated.Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Pressable>

      {/* Bottom divider */}
      <View style={styles.divider} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pressable: {
    flex: 1,
  },
  pressed: {
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  dragHandle: {
    width: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight: 4,
  },
  dragIndicator: {
    height: 24,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9E9E9E',
  },
  icon: {
    fontWeight: '600',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 18,
    color: '#BDBDBD',
    fontWeight: '300',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  action: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
});

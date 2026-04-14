/**
 * Animated Bottom Sheet with swipe and entrance animations
 * Premium sheet component with drag handle and smooth gestures
 */

import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  FlatList,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInUp,
  SlideInUp,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  snapPoints?: number[];
  style?: ViewStyle;
}

export const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
  visible,
  onDismiss,
  children,
  backgroundColor = '#FFFFFF',
  snapPoints = [100, 300, 500],
  style,
}) => {
  const translateY = useSharedValue(visible ? snapPoints[0] : snapPoints[snapPoints.length - 1]);
  const [isFullHeight, setIsFullHeight] = useState(false);

  const handleSnap = (point: number) => {
    translateY.value = withSpring(point, { damping: 8 });
    setIsFullHeight(point === snapPoints[snapPoints.length - 1]);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleDragDismiss = () => {
    translateY.value = withSpring(snapPoints[snapPoints.length - 1], { damping: 8 });
    setTimeout(() => onDismiss(), 300);
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: visible ? 1 : 0,
        },
      ]}
      entering={FadeInUp.duration(300)}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          animatedStyle,
          style,
        ]}
        entering={SlideInUp.duration(400)}
        layout={Layout.springify()}
      >
        {/* Drag Handle */}
        <Animated.View
          style={styles.handleContainer}
          entering={FadeInUp.duration(300).delay(50)}
        >
          <View style={styles.handle} />
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={styles.content}
          entering={FadeInUp.duration(400).delay(100)}
        >
          {children}
        </Animated.View>

        {/* Snap Indicators */}
        <View style={styles.snapIndicators}>
          {snapPoints.map((point, index) => (
            <Pressable
              key={`snap-${index}`}
              onPress={() => handleSnap(point)}
              style={({ pressed }) => [
                styles.snapDot,
                pressed && styles.snapDotPressed,
              ]}
            >
              <Animated.View style={styles.snapDotInner} />
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: 200,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  content: {
    paddingHorizontal: 16,
    flex: 1,
  },
  snapIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  snapDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  snapDotPressed: {
    opacity: 1,
  },
  snapDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976D2',
  },
});

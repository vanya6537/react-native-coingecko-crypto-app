import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
}) => {
  const fadeInOut = new Animated.Value(0.3);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeInOut, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInOut, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [fadeInOut]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: fadeInOut,
        },
      ]}
    />
  );
};

export const TokenItemSkeleton: React.FC = () => (
  <View style={styles.skeletonItem}>
    <SkeletonLoader width={40} height={40} borderRadius={20} />
    <View style={styles.skeletonContent}>
      <SkeletonLoader width="60%" height={14} />
      <SkeletonLoader width="40%" height={12} />
    </View>
    <View style={styles.skeletonRight}>
      <SkeletonLoader width={60} height={14} />
      <SkeletonLoader width={50} height={12} />
    </View>
  </View>
);

export const TokenListLoadingSkeleton: React.FC = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.itemWrapper}>
        <TokenItemSkeleton />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  skeletonRight: {
    gap: 8,
    alignItems: 'flex-end',
  },
  container: {
    paddingVertical: 8,
  },
  itemWrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
});

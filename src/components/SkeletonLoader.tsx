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
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        } as any,
      ]}
    >
      <Animated.View
        style={{
          opacity: fadeInOut,
          flex: 1,
        }}
      />
    </View>
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
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <View key={i}>
        <View style={styles.itemWrapper}>
          <TokenItemSkeleton />
        </View>
        {i < 8 && <View style={styles.divider} />}
      </View>
    ))}
  </View>
);

export const TokenDetailLoadingSkeleton: React.FC = () => (
  <View style={styles.detailContainer}>
    {/* Header */}
    <View style={styles.detailHeader}>
      <SkeletonLoader width={64} height={64} borderRadius={32} />
      <View style={styles.detailHeaderText}>
        <SkeletonLoader width="62%" height={26} borderRadius={8} />
        <SkeletonLoader width="32%" height={14} borderRadius={6} />
      </View>
    </View>
    <View style={styles.sectionDivider} />

    {/* Price Summary */}
    <View style={styles.priceSection}>
      <SkeletonLoader width="48%" height={36} borderRadius={10} />
      <SkeletonLoader width="30%" height={20} borderRadius={8} />
    </View>
    <View style={styles.sectionDivider} />

    {/* Stats Grid */}
    <View style={styles.statsGrid}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={styles.statCard}>
          <SkeletonLoader width="54%" height={12} borderRadius={6} />
          <SkeletonLoader width="78%" height={20} borderRadius={8} />
        </View>
      ))}
    </View>
    <View style={styles.sectionDivider} />

    {/* Chart Card */}
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <SkeletonLoader width="46%" height={18} borderRadius={8} />
        <SkeletonLoader width={80} height={28} borderRadius={6} />
      </View>
      <ChartLoadingSkeleton height={240} compact={true} />
    </View>
    <View style={styles.sectionDivider} />

    {/* Description Card */}
    <View style={styles.descriptionCard}>
      <SkeletonLoader width="24%" height={18} borderRadius={8} />
      <SkeletonLoader width="100%" height={14} borderRadius={6} />
      <SkeletonLoader width="96%" height={14} borderRadius={6} />
      <SkeletonLoader width="88%" height={14} borderRadius={6} />
      <SkeletonLoader width="72%" height={14} borderRadius={6} />
    </View>
  </View>
);

interface ChartLoadingSkeletonProps {
  height?: number;
  compact?: boolean;
}

export const ChartLoadingSkeleton: React.FC<ChartLoadingSkeletonProps> = ({
  height = 220,
  compact = false,
}) => (
  <View style={[styles.chartSkeletonCard, compact && styles.chartSkeletonCardCompact]}>
    <View style={styles.chartSkeletonTopRow}>
      <View style={styles.chartSkeletonPriceBlock}>
        <SkeletonLoader width={compact ? '54%' : '50%'} height={compact ? 26 : 32} borderRadius={10} />
        <SkeletonLoader width={compact ? '38%' : '32%'} height={12} borderRadius={6} />
      </View>
      <SkeletonLoader width={compact ? 80 : 100} height={compact ? 26 : 32} borderRadius={14} />
    </View>
    <View style={[styles.chartSkeletonCanvas, { height }]}>
      <SkeletonLoader width="100%" height={height} borderRadius={12} />
    </View>
    <View style={styles.chartSkeletonLegend}>
      <SkeletonLoader width="32%" height={12} borderRadius={6} />
      <SkeletonLoader width="32%" height={12} borderRadius={6} />
      <SkeletonLoader width="28%" height={12} borderRadius={6} />
    </View>
  </View>
);

export const FullscreenChartLoadingSkeleton: React.FC = () => (
  <View style={styles.fullscreenChartContainer}>
    <View style={styles.fullscreenHeaderSkeleton}>
      <SkeletonLoader width="36%" height={18} borderRadius={8} />
      <SkeletonLoader width="48%" height={36} borderRadius={10} />
      <SkeletonLoader width="28%" height={18} borderRadius={8} />
    </View>

    <ChartLoadingSkeleton height={320} />

    <View style={styles.fullscreenStatsPanel}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={styles.fullscreenStatItem}>
          <SkeletonLoader width="72%" height={12} borderRadius={6} />
          <SkeletonLoader width="58%" height={18} borderRadius={8} />
        </View>
      ))}
    </View>

    <View style={styles.fullscreenInstructions}>
      <SkeletonLoader width="18%" height={16} borderRadius={7} />
      <SkeletonLoader width="100%" height={12} borderRadius={6} />
      <SkeletonLoader width="92%" height={12} borderRadius={6} />
      <SkeletonLoader width="76%" height={12} borderRadius={6} />
    </View>
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
  detailContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailHeaderText: {
    flex: 1,
    marginLeft: 16,
    gap: 10,
  },
  priceSection: {
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  chartCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descriptionCard: {
    gap: 12,
  },
  chartSkeletonCard: {
    gap: 12,
  },
  chartSkeletonCardCompact: {
    gap: 10,
  },
  chartSkeletonTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartSkeletonPriceBlock: {
    flex: 1,
    gap: 8,
  },
  chartSkeletonCanvas: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartSkeletonLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fullscreenChartContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 20,
  },
  fullscreenHeaderSkeleton: {
    gap: 10,
  },
  fullscreenStatsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fullscreenStatItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  fullscreenInstructions: {
    gap: 10,
  },
});

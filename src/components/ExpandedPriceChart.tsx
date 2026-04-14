import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
} from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  FadeIn,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import type { PriceHistory } from '../types/index';
import { TimeRangeSelector, type TimeRange } from './TimeRangeSelector';
import { formatPrice } from '../utils/formatters';

interface ChartPoint {
  x: number;
  y: number;
  price: number;
  timestamp: number;
  index: number;
  dayLabel: string;
}

interface ExpandedPriceChartProps {
  data: PriceHistory[];
  tokenName: string;
  selectedTimeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeRangeSelector?: boolean;
}

export const ExpandedPriceChart: React.FC<ExpandedPriceChartProps> = ({
  data,
  tokenName,
  selectedTimeRange = '7d',
  onTimeRangeChange,
  showTimeRangeSelector = false,
}) => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth - 12; // Minimal padding
  const chartHeight = Math.min(450, screenWidth); // Responsive height for small screens
  const chartPadding = { top: 20, right: 12, bottom: 60, left: 40 }; // Reduced left padding for better fit
  const plotWidth = width - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedOpacity = useSharedValue(0);
  const selectedScale = useSharedValue(1);
  const touchX = useSharedValue(0);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('expandedChart.noHistory')}</Text>
      </View>
    );
  }

  const prices = data.map((d: PriceHistory) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceRange = maxPrice - minPrice || 1;
  const pointCountDivisor = Math.max(data.length - 1, 1);
  const minIndex = prices.indexOf(minPrice);
  const maxIndex = prices.indexOf(maxPrice);

  // Generate day labels
  const generateDayLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const points: ChartPoint[] = data.map((d, i) => ({
    x: chartPadding.left + (i / pointCountDivisor) * plotWidth,
    y: chartPadding.top + ((maxPrice - d.price) / priceRange) * plotHeight,
    price: d.price,
    timestamp: d.timestamp,
    index: i,
    dayLabel: generateDayLabel(d.timestamp),
  }));

  // Determine visible day labels with more spacing for larger datasets
  const labelInterval = Math.max(1, Math.floor(data.length / 10)); // Show ~10 labels for better readability
  const visibleLabelIndices = points
    .map((_, i) => i)
    .filter((i) => i % labelInterval === 0 || i === data.length - 1);

  const updateSelectedPoint = useCallback(
    (pageX: number) => {
      const relativeX = Math.max(0, Math.min(pageX - 20 - chartPadding.left, plotWidth));
      const index = Math.round((relativeX / Math.max(plotWidth, 1)) * pointCountDivisor);
      setSelectedIndex(Math.min(Math.max(index, 0), data.length - 1));
    },
    [chartPadding.left, plotWidth, pointCountDivisor, data.length]
  );

  // Gesture handler
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      touchX.value = event.x;
      updateSelectedPoint(event.absoluteX);
    })
    .onEnd(() => {
      // Keep selection
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: selectedOpacity.value,
      transform: [{ scale: selectedScale.value }],
    };
  });

  // Update animations based on selection
  React.useEffect(() => {
    if (selectedIndex !== null) {
      selectedOpacity.value = withSpring(1, { damping: 8 });
      selectedScale.value = withSpring(1.1, { damping: 8 });
    } else {
      selectedOpacity.value = withSpring(0, { damping: 8 });
      selectedScale.value = withSpring(1, { damping: 8 });
    }
  }, [selectedIndex, selectedOpacity, selectedScale]);

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const priceChange = lastPrice - firstPrice;
  const percentChange = (priceChange / firstPrice) * 100;
  const isUp = priceChange >= 0;

  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null;
  const displayPrice = selectedPoint?.price ?? lastPrice;
  const minPoint = points[minIndex];
  const maxPoint = points[maxIndex];
  const displayDate = selectedPoint
    ? selectedPoint.dayLabel
    : new Date(data[data.length - 1].timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

  const renderChart = () => {
    const fillPoints = [
      `${chartPadding.left},${chartPadding.top + plotHeight}`,
      ...points.map((p) => `${p.x},${p.y}`),
      `${width - chartPadding.right},${chartPadding.top + plotHeight}`,
    ].join(' ');

    return (
      <Svg
        width={width}
        height={chartHeight}
        style={styles.svg}
        viewBox={`0 0 ${width} ${chartHeight}`}
      >
        {/* Grid background */}
        <Rect width={width} height={chartHeight} fill="#FAFAFA" />

        {/* Horizontal grid lines with labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gridY = chartPadding.top + ratio * plotHeight;
          const gridPrice = maxPrice - priceRange * ratio;
          return (
            <G key={`grid-${ratio}`}>
              <Line
                x1={chartPadding.left}
                y1={gridY}
                x2={width - chartPadding.right}
                y2={gridY}
                stroke="#E0E0E0"
                strokeWidth="0.4"
              />
              <SvgText
                x={chartPadding.left - 8}
                y={gridY + 5}
                fontSize="11"
                fill="#888"
                fontFamily="system-ui"
                textAnchor="end"
              >
                {formatPrice(gridPrice)}
              </SvgText>
            </G>
          );
        })}

        {/* Min/Max indicator lines */}
        <Line
          x1={chartPadding.left}
          y1={maxPoint.y}
          x2={width - chartPadding.right}
          y2={maxPoint.y}
          stroke="#B0BEC5"
          strokeWidth="0.8"
          strokeDasharray="3,2"
          opacity="0.6"
        />
        <Line
          x1={chartPadding.left}
          y1={minPoint.y}
          x2={width - chartPadding.right}
          y2={minPoint.y}
          stroke="#CFD8DC"
          strokeWidth="0.8"
          strokeDasharray="3,2"
          opacity="0.6"
        />

        {/* Area fill under curve */}
        <Polygon
          points={fillPoints}
          fill={isUp ? '#C8E6C9' : '#FFCDD2'}
          opacity="0.2"
        />

        {/* Main price curve */}
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={isUp ? '#00C853' : '#D32F2F'}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Min/Max circles */}
        <Circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#00C853" stroke="#FFF" strokeWidth="2" />
        <Circle cx={minPoint.x} cy={minPoint.y} r="5" fill="#D32F2F" stroke="#FFF" strokeWidth="2" />

        {/* High badge */}
        <Rect
          x={Math.max(chartPadding.left, Math.min(maxPoint.x - 40, width - chartPadding.right - 80))}
          y={Math.max(4, maxPoint.y - 32)}
          width="80"
          height="24"
          rx="12"
          fill="#E8F5E9"
        />
        <SvgText
          x={Math.max(chartPadding.left, Math.min(maxPoint.x - 40, width - chartPadding.right - 80)) + 40}
          y={Math.max(4, maxPoint.y - 32) + 16}
          fontSize="11"
          fill="#1B5E20"
          fontWeight="700"
          fontFamily="system-ui"
          textAnchor="middle"
        >
          {t('expandedChart.high')}
        </SvgText>

        {/* Low badge */}
        <Rect
          x={Math.max(chartPadding.left, Math.min(minPoint.x - 38, width - chartPadding.right - 76))}
          y={Math.min(chartHeight - 28, minPoint.y + 12)}
          width="76"
          height="24"
          rx="12"
          fill="#FFEBEE"
        />
        <SvgText
          x={Math.max(chartPadding.left, Math.min(minPoint.x - 38, width - chartPadding.right - 76)) + 38}
          y={Math.min(chartHeight - 28, minPoint.y + 12) + 16}
          fontSize="11"
          fill="#B71C1C"
          fontWeight="700"
          fontFamily="system-ui"
          textAnchor="middle"
        >
          {t('expandedChart.low')}
        </SvgText>

        {/* Day labels on X axis */}
        {visibleLabelIndices.map((idx) => {
          const point = points[idx];
          return (
            <G key={`day-label-${idx}`}>
              <Line
                x1={point.x}
                y1={chartPadding.top + plotHeight}
                x2={point.x}
                y2={chartPadding.top + plotHeight + 8}
                stroke="#D0D0D0"
                strokeWidth="0.8"
              />
              <SvgText
                x={point.x}
                y={chartPadding.top + plotHeight + 26}
                fontSize="12"
                fill="#444"
                fontWeight="600"
                fontFamily="system-ui"
                textAnchor="middle"
              >
                {point.dayLabel}
              </SvgText>
            </G>
          );
        })}

        {/* Selected point indicator */}
        {selectedIndex !== null && selectedIndex >= 0 && selectedIndex < points.length && (
          <>
            {/* Vertical line */}
            <Line
              x1={points[selectedIndex].x}
              y1={chartPadding.top}
              x2={points[selectedIndex].x}
              y2={chartPadding.top + plotHeight}
              stroke="#1976D2"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.5"
            />
            {/* Selection circle */}
            <Circle
              cx={points[selectedIndex].x}
              cy={points[selectedIndex].y}
              r="6"
              fill={isUp ? '#00C853' : '#D32F2F'}
              stroke="#FFF"
              strokeWidth="2.5"
            />
            {/* Tooltip background */}
            <Rect
              x={Math.max(5, points[selectedIndex].x - 40)}
              y={Math.max(5, points[selectedIndex].y - 28)}
              width="80"
              height="24"
              rx="6"
              fill="#1976D2"
              opacity="0.95"
            />
            {/* Tooltip text */}
            <SvgText
              x={Math.max(20, points[selectedIndex].x - 20)}
              y={Math.max(22, points[selectedIndex].y - 8)}
              fontSize="12"
              fill="#FFF"
              fontWeight="700"
              fontFamily="system-ui"
              textAnchor="middle"
            >
              {formatPrice(points[selectedIndex].price)}
            </SvgText>
          </>
        )}
      </Svg>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showTimeRangeSelector && onTimeRangeChange && (
        <TimeRangeSelector
          selectedRange={selectedTimeRange}
          onRangeChange={onTimeRangeChange}
        />
      )}
      <Text style={styles.title}>{tokenName} {t('expandedChart.title')}</Text>

      {/* Price Display */}
      <View style={styles.priceCard}>
        <View>
          <Text style={styles.currentLabel}>{t('expandedChart.currentPrice')}</Text>
          <Text
            style={[
              styles.currentPrice,
              { color: isUp ? '#00C853' : '#D32F2F' },
            ]}
          >
            {formatPrice(displayPrice)}
          </Text>
          <Text style={styles.dateLabel}>{displayDate}</Text>
        </View>

        <View style={styles.statsColumn}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('expandedChart.change')}</Text>
            <Text
              style={[
                styles.statValue,
                { color: isUp ? '#00C853' : '#D32F2F' },
              ]}
            >
              {isUp ? '+' : ''}{percentChange.toFixed(2)}%
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>{t('expandedChart.position')}</Text>
            <Text style={styles.statValue}>
              {selectedIndex !== null ? selectedIndex + 1 : data.length}/{data.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Interactive Chart */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={{
            height: chartHeight,
            marginVertical: 20,
            backgroundColor: '#FFF',
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#EEF2F5',
          }}
          entering={FadeIn.duration(300).delay(100)}
        >
          {renderChart()}
        </Animated.View>
      </GestureDetector>

      {/* Stats Panel */}
      <View style={styles.statsPanel}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('expandedChart.highLabel')}</Text>
          <Text style={styles.statHighValue}>{formatPrice(maxPrice)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('expandedChart.lowLabel')}</Text>
          <Text style={styles.statLowValue}>{formatPrice(minPrice)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('expandedChart.avgLabel')}</Text>
          <Text style={styles.statValue}>{formatPrice(avgPrice)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Points</Text>
          <Text style={styles.statValue}>{data.length}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionLabel}>{t('expandedChart.tip')}</Text>
        <Text style={styles.instructionText}>
          {t('expandedChart.dragTip')}
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 18,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  currentLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 13,
    color: '#999',
  },
  statsColumn: {
    gap: 14,
  },
  stat: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  statHighValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C853',
  },
  statLowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
  },
  svg: {
    flex: 1,
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    paddingVertical: 20,
    marginVertical: 18,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  instructionsBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 14,
    marginVertical: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
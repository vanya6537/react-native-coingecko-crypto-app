import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import Svg, { Circle, G, Line, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import Animated, {
  FadeIn,
  ZoomIn,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import type { PriceHistory } from '../types/index';
import { TimeRangeSelector, type TimeRange } from './TimeRangeSelector';
import { formatPrice } from '../utils/formatters';

interface PriceChartProps {
  data: PriceHistory[];
  height?: number;
  selectedTimeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeRangeSelector?: boolean;
}

interface Point {
  x: number;
  y: number;
  price: number;
  timestamp: number;
  dayLabel: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  height = 360,
  selectedTimeRange = '7d',
  onTimeRangeChange,
  showTimeRangeSelector = false,
}) => {
  const width = Dimensions.get('window').width - 20;
  const svgHeight = height - 20;
  const chartPadding = { top: 20, right: 12, bottom: 70, left: 12 };
  const plotWidth = width - chartPadding.left - chartPadding.right;
  const plotHeight = svgHeight - chartPadding.top - chartPadding.bottom;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const touchX = useSharedValue(0);

  const selectedOpacity = useSharedValue(0);
  const selectedScale = useSharedValue(1);

  useEffect(() => {
    if (selectedIndex !== null) {
      selectedOpacity.value = withSpring(1, { damping: 8 });
      selectedScale.value = withSpring(1.2, { damping: 8 });
    } else {
      selectedOpacity.value = withSpring(0, { damping: 8 });
      selectedScale.value = withSpring(1, { damping: 8 });
    }
  }, [selectedIndex, selectedOpacity, selectedScale]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const prices = data.map((entry: PriceHistory) => entry.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const pointCountDivisor = Math.max(data.length - 1, 1);
  const minIndex = prices.indexOf(minPrice);
  const maxIndex = prices.indexOf(maxPrice);

  // Generate day labels - more visible and spaced
  const generateDayLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const points: Point[] = data.map((entry: PriceHistory, index: number) => ({
    x: chartPadding.left + (index / pointCountDivisor) * plotWidth,
    y: chartPadding.top + ((maxPrice - entry.price) / priceRange) * plotHeight,
    price: entry.price,
    timestamp: entry.timestamp,
    dayLabel: generateDayLabel(entry.timestamp),
  }));

  // Determine which day labels to show (every Nth point to avoid crowding)
  const labelInterval = Math.max(1, Math.floor(data.length / 8)); // Show ~8 labels max for better spacing
  const visibleLabelIndices = points
    .map((_, i) => i)
    .filter((i) => i % labelInterval === 0 || i === data.length - 1);

  const updateSelectedPoint = useCallback(
    (pageX: number) => {
      const relativeX = pageX - 16 - chartPadding.left;
      const normalizedX = Math.max(0, Math.min(relativeX, plotWidth));
      const index = Math.round((normalizedX / Math.max(plotWidth, 1)) * pointCountDivisor);

      if (index >= 0 && index < data.length) {
        setSelectedIndex(index);
        setSelectedPoint(points[index]);
      }
    },
    [chartPadding.left, plotWidth, pointCountDivisor, data.length, points]
  );

  // Gesture handler for pan/touch
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      touchX.value = event.x;
      updateSelectedPoint(event.absoluteX);
    })
    .onEnd(() => {
      // Keep selection visible
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: selectedOpacity.value,
      transform: [{ scale: selectedScale.value }],
    };
  });

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const isUp = lastPrice >= firstPrice;
  const displayPrice = selectedPoint?.price ?? lastPrice;
  const displayDate = selectedPoint
    ? selectedPoint.dayLabel
    : new Date(data[data.length - 1].timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

  const renderChart = () => {
    const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
    const fillPoints = [
      `${chartPadding.left},${chartPadding.top + plotHeight}`,
      ...points.map((point) => `${point.x},${point.y}`),
      `${width - chartPadding.right},${chartPadding.top + plotHeight}`,
    ].join(' ');
    const minPoint = points[minIndex];
    const maxPoint = points[maxIndex];

    const renderExtremeBadge = (
      point: Point,
      label: 'HIGH' | 'LOW',
      tone: string,
      position: 'top' | 'bottom'
    ) => {
      const badgeWidth = 48;
      const badgeHeight = 24;
      const x = Math.max(
        chartPadding.left,
        Math.min(point.x - badgeWidth / 2, width - chartPadding.right - badgeWidth)
      );
      const y = position === 'top' ? 4 : svgHeight - badgeHeight - 4;

      return (
        <G key={`${label}-badge`}>
          <Rect x={x} y={y} width={badgeWidth} height={badgeHeight} rx={10} fill={tone} opacity={0.12} />
          <SvgText
            x={x + badgeWidth / 2}
            y={y + 16}
            fontSize="10"
            fill={tone}
            fontWeight="700"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        </G>
      );
    };

    return (
      <Svg width={width} height={svgHeight} style={styles.svg} viewBox={`0 0 ${width} ${svgHeight}`}>
        {/* Grid background */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <Line
            key={`grid-${ratio}`}
            x1={chartPadding.left}
            y1={Math.round(chartPadding.top + ratio * plotHeight)}
            x2={width - chartPadding.right}
            y2={Math.round(chartPadding.top + ratio * plotHeight)}
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
        ))}

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

        {/* Area fill */}
        <Polygon
          points={fillPoints}
          fill={isUp ? '#C8E6C9' : '#FFCDD2'}
          opacity="0.3"
        />

        {/* Main line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={isUp ? '#00C853' : '#D32F2F'}
          strokeWidth="2.2"
          strokeLinejoin="miter"
          strokeLinecap="round"
        />

        {/* Min/Max circles */}
        <Circle cx={maxPoint.x} cy={maxPoint.y} r="4" fill="#00C853" stroke="#FFF" strokeWidth="2" />
        <Circle cx={minPoint.x} cy={minPoint.y} r="4" fill="#D32F2F" stroke="#FFF" strokeWidth="2" />

        {/* Min/Max badges */}
        {renderExtremeBadge(maxPoint, 'HIGH', '#00A152', 'top')}
        {renderExtremeBadge(minPoint, 'LOW', '#C62828', 'bottom')}

        {/* Day labels on X axis */}
        {visibleLabelIndices.map((idx) => {
          const point = points[idx];
          return (
            <G key={`day-label-${idx}`}>
              <Line
                x1={point.x}
                y1={chartPadding.top + plotHeight}
                x2={point.x}
                y2={chartPadding.top + plotHeight + 6}
                stroke="#D0D0D0"
                strokeWidth="0.8"
              />
              <SvgText
                x={point.x}
                y={chartPadding.top + plotHeight + 22}
                fontSize="12"
                fill="#555"
                fontWeight="600"
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
            <Line
              x1={points[selectedIndex].x}
              y1={chartPadding.top}
              x2={points[selectedIndex].x}
              y2={chartPadding.top + plotHeight}
              stroke="#1976D2"
              strokeWidth="1.2"
              strokeDasharray="3,3"
              opacity="0.7"
            />
            <Circle
              cx={points[selectedIndex].x}
              cy={points[selectedIndex].y}
              r="5"
              fill="#1976D2"
              stroke="#FFF"
              strokeWidth="2.5"
            />
          </>
        )}
      </Svg>
    );
  };

  return (
    <Animated.View
      style={[styles.container, { height }]}
      entering={FadeIn.duration(400).delay(100)}
      layout={Layout.springify()}
    >
      {showTimeRangeSelector && onTimeRangeChange && (
        <TimeRangeSelector
          selectedRange={selectedTimeRange}
          onRangeChange={onTimeRangeChange}
        />
      )}
      <View style={styles.header}>
        <View>
          <Text style={[styles.priceDisplay, { color: isUp ? '#00C853' : '#D32F2F' }]}>
            {formatPrice(displayPrice)}
          </Text>
          <Text style={styles.dateDisplay}>{displayDate}</Text>
        </View>
        {selectedIndex !== null && (
          <Animated.View style={animatedStyle} entering={ZoomIn.springify()}>
            <Text style={styles.tooltipLabel}>
              {selectedIndex + 1}/{data.length}
            </Text>
          </Animated.View>
        )}
      </View>

      <GestureDetector gesture={pan}>
        <View style={[styles.chart, { height: height - 120 }]}>
          {renderChart()}
        </View>
      </GestureDetector>

      <View style={styles.legend}>
        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>Low</Text>
          <Text
            style={[
              styles.legendValue,
              { color: minPrice === maxPrice ? '#757575' : '#C62828' },
            ]}
          >
            {formatPrice(minPrice)}
          </Text>
        </View>
        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>High</Text>
          <Text
            style={[
              styles.legendValue,
              { color: minPrice === maxPrice ? '#757575' : '#00A152' },
            ]}
          >
            {formatPrice(maxPrice)}
          </Text>
        </View>
        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>Points</Text>
          <Text style={styles.legendValue}>{data.length}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  priceDisplay: {
    fontSize: 28,
    fontWeight: '700',
  },
  dateDisplay: {
    fontSize: 13,
    color: '#999',
    marginTop: 5,
  },
  tooltipLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  chart: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF2F5',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F5',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 14,
  },
  legendLabel: {
    fontSize: 12,
    color: '#7A8691',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 7,
  },
  legendValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

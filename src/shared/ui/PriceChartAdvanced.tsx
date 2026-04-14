import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import Svg, {
  Circle,
  G,
  Line,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  ZoomIn,
  Layout,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import type { PriceHistory } from '../types/index';
import { formatPrice } from '../utils/formatters';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface PriceChartProps {
  data: PriceHistory[];
  height?: number;
  selectedTimeRange?: TimeRange;
}

interface Point {
  x: number;
  y: number;
  price: number;
  timestamp: number;
}

const HEADER_HEIGHT = 72;
const LEGEND_HEIGHT = 64;
const MIN_CHART_HEIGHT = 220;

const getTimeRangeLabel = (timeRange?: TimeRange): string => {
  const labels: Record<TimeRange, string> = {
    '7d': '7D',
    '30d': '30D',
    '90d': '90D',
    '1y': '1Y',
    'all': 'ALL',
  };
  return labels[timeRange || '7d'];
};

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  height = 280,
  selectedTimeRange = '7d',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth - 16;

  const chartPadding = { top: 24, right: 12, bottom: 36, left: 12 };
  const chartHeight = Math.max(height - HEADER_HEIGHT - LEGEND_HEIGHT, MIN_CHART_HEIGHT);
  const svgHeight = chartHeight;

  const plotWidth = Math.max(width - chartPadding.left - chartPadding.right, 1);
  const plotHeight = Math.max(svgHeight - chartPadding.top - chartPadding.bottom, 1);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const panResponderRef = useRef<any>(null);

  const selectedOpacity = useSharedValue(0);
  const tooltipScale = useSharedValue(0.92);

  useEffect(() => {
    if (selectedIndex !== null) {
      selectedOpacity.value = withSpring(1, { damping: 8, mass: 0.8 });
      tooltipScale.value = withSpring(1, { damping: 8, mass: 0.8 });
    } else {
      selectedOpacity.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.ease),
      });
      tooltipScale.value = withTiming(0.92, {
        duration: 180,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [selectedIndex, selectedOpacity, tooltipScale]);

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tooltipScale.value }],
    opacity: selectedOpacity.value,
  }));

  if (!data || data.length === 0) {
    return (
      <Animated.View style={[styles.container, { height }]} entering={FadeIn.duration(300)}>
        <Text style={styles.emptyText}>No data available</Text>
      </Animated.View>
    );
  }

  const prices = data.map((entry: PriceHistory) => entry.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const pointCountDivisor = Math.max(data.length - 1, 1);
  const minIndex = prices.indexOf(minPrice);
  const maxIndex = prices.indexOf(maxPrice);

  const points: Point[] = useMemo(
    () =>
      data.map((entry: PriceHistory, index: number) => ({
        x: chartPadding.left + (index / pointCountDivisor) * plotWidth,
        y: chartPadding.top + ((maxPrice - entry.price) / priceRange) * plotHeight,
        price: entry.price,
        timestamp: entry.timestamp,
      })),
    [data, pointCountDivisor, plotWidth, plotHeight, chartPadding.left, chartPadding.top, maxPrice, priceRange]
  );

  const updateSelectedPoint = useCallback(
    (pageX: number) => {
      const relativeX = pageX - 16 - chartPadding.left;
      const normalizedX = Math.max(0, Math.min(relativeX, plotWidth));
      const index = Math.round((normalizedX / plotWidth) * pointCountDivisor);

      if (index >= 0 && index < data.length) {
        setSelectedIndex(index);
        setSelectedPoint(points[index]);
        setHoveredIndex(index);
      }
    },
    [chartPadding.left, plotWidth, pointCountDivisor, data.length, points]
  );

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event: any) => {
        updateSelectedPoint(event.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        // keep selection
      },
      onPanResponderTerminate: () => {
        setSelectedIndex(null);
        setSelectedPoint(null);
        setHoveredIndex(null);
      },
    });
  }

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const isUp = lastPrice >= firstPrice;
  const displayPrice = selectedPoint?.price ?? lastPrice;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  const displayDate = selectedPoint
    ? new Date(selectedPoint.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
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
      const badgeWidth = 56;
      const badgeHeight = 24;

      const x = Math.max(
        chartPadding.left,
        Math.min(point.x - badgeWidth / 2, width - chartPadding.right - badgeWidth)
      );

      const y =
        position === 'top'
          ? Math.max(4, Math.min(point.y - badgeHeight - 10, svgHeight - badgeHeight - 4))
          : Math.max(4, Math.min(point.y + 10, svgHeight - badgeHeight - 4));

      return (
        <G key={`${label}-badge`}>
          <Rect
            x={x}
            y={y}
            width={badgeWidth}
            height={badgeHeight}
            rx={10}
            fill={tone}
            opacity={0.15}
          />
          <Rect
            x={x}
            y={y}
            width={badgeWidth}
            height={badgeHeight}
            rx={10}
            fill="none"
            stroke={tone}
            strokeWidth="1.5"
            opacity={0.5}
          />
          <SvgText
            x={x + badgeWidth / 2}
            y={y + 16}
            fontSize="11"
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
      <Svg
        width={width}
        height={svgHeight}
        style={styles.svg}
        viewBox={`0 0 ${width+78} ${svgHeight}`}
      >
        <Defs>
          <LinearGradient id="priceGradientUp" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4CAF50" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0.02" />
          </LinearGradient>
          <LinearGradient id="priceGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#F44336" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#F44336" stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <Line
            key={`grid-${ratio}`}
            x1={chartPadding.left}
            y1={Math.round(chartPadding.top + ratio * plotHeight)}
            x2={width - chartPadding.right}
            y2={Math.round(chartPadding.top + ratio * plotHeight)}
            stroke="#E0E0E0"
            strokeWidth="1"
            opacity={0.4}
          />
        ))}

        <Line
          x1={chartPadding.left}
          y1={maxPoint.y}
          x2={width - chartPadding.right}
          y2={maxPoint.y}
          stroke="#4CAF50"
          strokeWidth="1.5"
          strokeDasharray="6,3"
          opacity="0.3"
        />
        <Line
          x1={chartPadding.left}
          y1={minPoint.y}
          x2={width - chartPadding.right}
          y2={minPoint.y}
          stroke="#F44336"
          strokeWidth="1.5"
          strokeDasharray="6,3"
          opacity="0.3"
        />

        <Polygon
          points={fillPoints}
          fill={isUp ? 'url(#priceGradientUp)' : 'url(#priceGradientDown)'}
        />

        <Polyline
          points={linePoints}
          fill="none"
          stroke={isUp ? '#4CAF50' : '#F44336'}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.3"
        />

        <Polyline
          points={linePoints}
          fill="none"
          stroke={isUp ? '#00C853' : '#D32F2F'}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, index) => (
          <G key={`point-${index}`}>
            {hoveredIndex === index && (
              <Circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill={isUp ? '#4CAF50' : '#F44336'}
                opacity="0.15"
              />
            )}

            <Circle
              cx={point.x}
              cy={point.y}
              r={index === minIndex || index === maxIndex ? 5 : 2.5}
              fill={
                index === minIndex
                  ? '#F44336'
                  : index === maxIndex
                    ? '#4CAF50'
                    : isUp
                      ? '#00C853'
                      : '#D32F2F'
              }
              opacity={index === minIndex || index === maxIndex ? 1 : hoveredIndex === index ? 0.8 : 0.5}
            />
          </G>
        ))}

        <Circle cx={maxPoint.x} cy={maxPoint.y} r="5.5" fill="none" stroke="#4CAF50" strokeWidth="2" opacity="0.8" />
        <Circle cx={minPoint.x} cy={minPoint.y} r="5.5" fill="none" stroke="#F44336" strokeWidth="2" opacity="0.8" />

        {renderExtremeBadge(maxPoint, 'HIGH', '#4CAF50', 'top')}
        {renderExtremeBadge(minPoint, 'LOW', '#F44336', 'bottom')}

        {selectedIndex !== null && selectedIndex >= 0 && selectedIndex < points.length && (
          <G opacity={0.7}>
            <Line
              x1={points[selectedIndex].x}
              y1={chartPadding.top}
              x2={points[selectedIndex].x}
              y2={chartPadding.top + plotHeight}
              stroke="#1976D2"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            <Line
              x1={chartPadding.left}
              y1={points[selectedIndex].y}
              x2={width - chartPadding.right}
              y2={points[selectedIndex].y}
              stroke="#1976D2"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.4"
            />
            <G>
              <Circle
                cx={points[selectedIndex].x}
                cy={points[selectedIndex].y}
                r="6.5"
                fill="#FFF"
                stroke="#1976D2"
                strokeWidth="2.5"
              />
              <Circle
                cx={points[selectedIndex].x}
                cy={points[selectedIndex].y}
                r="12"
                fill="none"
                stroke="#1976D2"
                strokeWidth="1"
                opacity="0.3"
              />
            </G>
          </G>
        )}
      </Svg>
    );
  };

  return (
    <Animated.View
      style={[styles.container, { height }]}
      entering={FadeInDown.duration(500).delay(100)}
      layout={Layout.springify()}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.priceDisplay, { color: isUp ? '#00C853' : '#D32F2F' }]}>
            {formatPrice(displayPrice)}
          </Text>
          <Text style={styles.dateDisplay}>{displayDate}</Text>
        </View>

        {selectedIndex !== null && (
          <Animated.View
            entering={ZoomIn.springify()}
            exiting={FadeOut.duration(200)}
            style={[styles.tooltipBadge, tooltipAnimatedStyle]}
          >
            <Text style={styles.tooltipLabel}>
              Day {selectedIndex + 1} / {data.length}
            </Text>
            <Text style={[styles.tooltipChange, { color: priceChange >= 0 ? '#4CAF50' : '#F44336' }]}>
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}%
            </Text>
          </Animated.View>
        )}
      </View>

      <View
        style={[styles.chart, { height: chartHeight }]}
        {...panResponderRef.current.panHandlers}
      >
        {renderChart()}
      </View>

      <View style={styles.legendSection}>
        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>{getTimeRangeLabel(selectedTimeRange)} Low</Text>
          <Text style={[styles.legendValue, { color: '#F44336' }]}>
            {formatPrice(minPrice)}
          </Text>
        </View>

        <View style={styles.legendDivider} />

        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>{getTimeRangeLabel(selectedTimeRange)} High</Text>
          <Text style={[styles.legendValue, { color: '#4CAF50' }]}>
            {formatPrice(maxPrice)}
          </Text>
        </View>

        <View style={styles.legendDivider} />

        <View style={styles.legendCard}>
          <Text style={styles.legendLabel}>Range</Text>
          <Text style={styles.legendValue}>
            {formatPrice(maxPrice - minPrice)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 0,
  },
  header: {
    minHeight: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  priceDisplay: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateDisplay: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  tooltipBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipChange: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  chart: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#757575',
    fontSize: 14,
  },
  legendSection: {
    minHeight: LEGEND_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendCard: {
    flex: 1,
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginBottom: 4,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
  },
  legendDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E0E0E0',
    opacity: 0.4,
  },
});
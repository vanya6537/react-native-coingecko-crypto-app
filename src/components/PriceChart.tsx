import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  PanResponder,
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
} from 'react-native-reanimated';
import type { PriceHistory } from '../types/index';
import { formatPrice } from '../utils/formatters';

interface PriceChartProps {
  data: PriceHistory[];
  height?: number;
}

interface Point {
  x: number;
  y: number;
  price: number;
  timestamp: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  height = 220,
}) => {
  const width = Dimensions.get('window').width - 32;
  const svgHeight = height - 50;
  const chartPadding = { top: 34, right: 14, bottom: 36, left: 14 };
  const plotWidth = width - chartPadding.left - chartPadding.right;
  const plotHeight = svgHeight - chartPadding.top - chartPadding.bottom;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const panResponderRef = useRef<any>(null);
  
  // Reanimated shared values for animated selection
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

  const prices = data.map((d: PriceHistory) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const pointCountDivisor = Math.max(data.length - 1, 1);
  const minIndex = prices.indexOf(minPrice);
  const maxIndex = prices.indexOf(maxPrice);

  const points: Point[] = data.map((d: PriceHistory, i: number) => ({
    x: chartPadding.left + (i / pointCountDivisor) * plotWidth,
    y: chartPadding.top + ((maxPrice - d.price) / priceRange) * plotHeight,
    price: d.price,
    timestamp: d.timestamp,
  }));

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

  // Gesture handler
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: any) => {
        updateSelectedPoint(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        // Keep selection visible
      },
      onPanResponderTerminate: () => {
        setSelectedIndex(null);
        setSelectedPoint(null);
      },
    });
  }

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const isUp = lastPrice >= firstPrice;
  const displayPrice = selectedPoint?.price ?? lastPrice;
  const displayDate = selectedPoint
    ? new Date(selectedPoint.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : new Date(data[data.length - 1].timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

  // Render SVG
  const renderChart = () => {
    const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
    const fillPoints = [
      `${chartPadding.left},${chartPadding.top + plotHeight}`,
      ...points.map((p) => `${p.x},${p.y}`),
      `${width - chartPadding.right},${chartPadding.top + plotHeight}`,
    ].join(' ');
    const minPoint = points[minIndex];
    const maxPoint = points[maxIndex];

    const renderExtremeBadge = (point: Point, label: 'HIGH' | 'LOW', tone: string, position: 'top' | 'bottom') => {
      const badgeWidth = 48;
      const badgeHeight = 20;
      const x = Math.max(chartPadding.left, Math.min(point.x - badgeWidth / 2, width - chartPadding.right - badgeWidth));
      const y = position === 'top' ? 8 : svgHeight - badgeHeight - 8;

      return (
        <G>
          <Rect x={x} y={y} width={badgeWidth} height={badgeHeight} rx={9} fill={tone} opacity={0.12} />
          <SvgText
            x={x + badgeWidth / 2}
            y={y + 13}
            fontSize="9"
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
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <Line
            key={`grid-${ratio}`}
            x1={chartPadding.left}
            y1={Math.round(chartPadding.top + ratio * plotHeight)}
            x2={width - chartPadding.right}
            y2={Math.round(chartPadding.top + ratio * plotHeight)}
            stroke="#E0E0E0"
            strokeWidth="1"
          />
        ))}

        <Line
          x1={chartPadding.left}
          y1={maxPoint.y}
          x2={width - chartPadding.right}
          y2={maxPoint.y}
          stroke="#B0BEC5"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.8"
        />
        <Line
          x1={chartPadding.left}
          y1={minPoint.y}
          x2={width - chartPadding.right}
          y2={minPoint.y}
          stroke="#CFD8DC"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.8"
        />

        {/* Fill under curve */}
        <Polygon
          points={fillPoints}
          fill={isUp ? '#C8E6C9' : '#FFCDD2'}
          opacity="0.3"
        />

        {/* Price curve */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={isUp ? '#00C853' : '#D32F2F'}
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />

        <Circle cx={maxPoint.x} cy={maxPoint.y} r="4.5" fill="#00C853" stroke="#FFF" strokeWidth="2" />
        <Circle cx={minPoint.x} cy={minPoint.y} r="4.5" fill="#D32F2F" stroke="#FFF" strokeWidth="2" />
        {renderExtremeBadge(maxPoint, 'HIGH', '#00A152', 'top')}
        {renderExtremeBadge(minPoint, 'LOW', '#C62828', 'bottom')}

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
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Circle at point */}
            <Circle
              cx={points[selectedIndex].x}
              cy={points[selectedIndex].y}
              r="4"
              fill="#1976D2"
              stroke="#FFF"
              strokeWidth="2"
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
          >
            <Text style={styles.tooltipLabel}>
              Day {selectedIndex + 1}/{data.length}
            </Text>
          </Animated.View>
        )}
      </View>

      <View
        style={[styles.chart, { height: height - 70 }]}
        {...panResponderRef.current.panHandlers}
      >
        {renderChart()}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: minPrice === maxPrice ? '#999' : '#00C853' },
            ]}
          />
          <Text style={styles.legendText}>Low: {formatPrice(minPrice)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: minPrice === maxPrice ? '#999' : '#D32F2F' },
            ]}
          />
          <Text style={styles.legendText}>High: {formatPrice(maxPrice)}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priceDisplay: {
    fontSize: 24,
    fontWeight: '700',
  },
  dateDisplay: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  tooltipLabel: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chart: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F5',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  legend: {
    flexDirection: 'column',
    gap: 10,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});

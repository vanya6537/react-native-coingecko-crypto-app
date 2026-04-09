import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Text,
  GestureResponderEvent,
} from 'react-native';
import { PriceHistory } from '@types/index';
import { formatPrice } from '@utils/formatters';

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const panResponderRef = useRef<any>(null);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points: Point[] = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - 50 - ((d.price - minPrice) / priceRange) * (height - 100),
    price: d.price,
    timestamp: d.timestamp,
  }));

  const updateSelectedPoint = useCallback(
    (pageX: number) => {
      const relativeX = pageX - 16; // Account for padding
      const normalizedX = Math.max(0, Math.min(relativeX, width));
      const index = Math.round((normalizedX / width) * (data.length - 1));
      
      if (index >= 0 && index < data.length) {
        setSelectedIndex(index);
        setSelectedPoint(points[index]);
      }
    },
    [width, data.length, points]
  );

  // Gesture handler
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
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
      `0,${height - 50}`,
      ...points.map((p) => `${p.x},${p.y}`),
      `${width},${height - 50}`,
    ].join(' ');

    return (
      <svg width={width} height={height - 50} style={styles.svg} viewBox={`0 0 ${width} ${height - 50}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={`grid-${ratio}`}
            x1={0}
            y1={Math.round((1 - ratio) * (height - 50))}
            x2={width}
            y2={Math.round((1 - ratio) * (height - 50))}
            stroke="#E0E0E0"
            strokeWidth="1"
          />
        ))}

        {/* Fill under curve */}
        <polygon
          points={fillPoints}
          fill={isUp ? '#C8E6C9' : '#FFCDD2'}
          opacity="0.3"
        />

        {/* Price curve */}
        <polyline
          points={linePoints}
          fill="none"
          stroke={isUp ? '#00C853' : '#D32F2F'}
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />

        {/* Selected point indicator */}
        {selectedIndex !== null && selectedIndex >= 0 && selectedIndex < points.length && (
          <>
            {/* Vertical line */}
            <line
              x1={points[selectedIndex].x}
              y1={0}
              x2={points[selectedIndex].x}
              y2={height - 50}
              stroke="#1976D2"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Circle at point */}
            <circle
              cx={points[selectedIndex].x}
              cy={points[selectedIndex].y}
              r="4"
              fill="#1976D2"
              stroke="#FFF"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.priceDisplay, { color: isUp ? '#00C853' : '#D32F2F' }]}>
            {formatPrice(displayPrice)}
          </Text>
          <Text style={styles.dateDisplay}>{displayDate}</Text>
        </View>
        {selectedIndex !== null && (
          <Text style={styles.tooltipLabel}>
            Day {selectedIndex + 1}/{data.length}
          </Text>
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
    </View>
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
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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

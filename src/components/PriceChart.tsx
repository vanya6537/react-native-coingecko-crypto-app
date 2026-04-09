import React, { useState, useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { PriceHistory } from '@types/index';
import { formatPrice } from '@utils/formatters';

interface PriceChartProps {
  data: PriceHistory[];
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  height = 220,
}) => {
  const width = Dimensions.get('window').width - 32;
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.price - minPrice) / priceRange) * (height - 40),
    price: d.price,
    timestamp: d.timestamp,
  }));

  const drawLine = () => {
    if (points.length < 2) return '';

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return pathData;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const index = Math.max(
          0,
          Math.min(
            Math.round((x / width) * (data.length - 1)),
            data.length - 1
          )
        );
        setSelectedPrice(data[index].price);
        const date = new Date(data[index].timestamp).toLocaleDateString();
        setSelectedDate(date);
      },
      onPanResponderRelease: () => {
        setSelectedPrice(null);
        setSelectedDate(null);
      },
    })
  ).current;

  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= prices[0];

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.header}>
        <Text style={[styles.priceDisplay, { color: isUp ? '#00C853' : '#D32F2F' }]}>
          {selectedPrice ? formatPrice(selectedPrice) : formatPrice(lastPrice)}
        </Text>
        {selectedDate && (
          <Text style={styles.dateDisplay}>{selectedDate}</Text>
        )}
      </View>

      <View
        style={[styles.chart, { height: height - 50 }]}
        {...panResponder.panHandlers}
      >
        <svg width={width} height={height - 50} style={styles.svg}>
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

          {/* Price line */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={isUp ? '#00C853' : '#D32F2F'}
            strokeWidth="2"
            strokeLinejoin="miter"
          />

          {/* Fill under line */}
          <polygon
            points={[`0,${height - 50}`, ...points.map((p) => `${p.x},${p.y}`), `${width},${height - 50}`].join(' ')}
            fill={isUp ? '#C8E6C9' : '#FFCDD2'}
            opacity="0.3"
          />
        </svg>
      </View>

      <View style={styles.priceRange}>
        <Text style={styles.rangeText}>${minPrice.toFixed(2)}</Text>
        <Text style={styles.rangeText}>${maxPrice.toFixed(2)}</Text>
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
  chart: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 11,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});

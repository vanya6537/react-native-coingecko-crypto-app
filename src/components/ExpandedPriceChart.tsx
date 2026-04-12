import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  PanResponder,
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
import { useTranslation } from 'react-i18next';
import type { PriceHistory } from '../types/index';
import { formatPrice } from '../utils/formatters';

interface ChartPoint {
  x: number;
  y: number;
  price: number;
  timestamp: number;
  index: number;
}

interface ExpandedPriceChartProps {
  data: PriceHistory[];
  tokenName: string;
}

export const ExpandedPriceChart: React.FC<ExpandedPriceChartProps> = ({
  data,
  tokenName,
}) => {
  const { t } = useTranslation();
  const width = Dimensions.get('window').width - 40;
  const chartHeight = 300;
  const chartPadding = { top: 30, right: 16, bottom: 44, left: 56 };
  const plotWidth = width - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const panResponderRef = useRef<any>(null);

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

  const points: ChartPoint[] = data.map((d, i) => ({
    x: chartPadding.left + (i / pointCountDivisor) * plotWidth,
    y: chartPadding.top + ((maxPrice - d.price) / priceRange) * plotHeight,
    price: d.price,
    timestamp: d.timestamp,
    index: i,
  }));

  const updateSelectedPoint = useCallback(
    (pageX: number) => {
      const relativeX = Math.max(0, Math.min(pageX - 20 - chartPadding.left, plotWidth));
      const index = Math.round((relativeX / Math.max(plotWidth, 1)) * pointCountDivisor);
      setSelectedIndex(Math.min(Math.max(index, 0), data.length - 1));
    },
    [chartPadding.left, plotWidth, pointCountDivisor, data.length]
  );

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        updateSelectedPoint(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        // Keep selection
      },
    });
  }

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
    ? new Date(selectedPoint.timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : new Date(data[data.length - 1].timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
      <View
        style={{
          height: chartHeight,
          marginVertical: 20,
          backgroundColor: '#FFF',
          borderRadius: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#EEF2F5',
        }}
        {...panResponderRef.current.panHandlers}
      >
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
                  strokeWidth="0.5"
                />
                <SvgText
                  x={chartPadding.left - 8}
                  y={gridY + 4}
                  fontSize="10"
                  fill="#999"
                  fontFamily="system-ui"
                  textAnchor="end"
                >
                  {formatPrice(gridPrice)}
                </SvgText>
              </G>
            );
          })}

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

          {/* Area fill under curve */}
          <Polygon
            points={[
              `${chartPadding.left},${chartPadding.top + plotHeight}`,
              ...points.map((p) => `${p.x},${p.y}`),
              `${width - chartPadding.right},${chartPadding.top + plotHeight}`,
            ].join(' ')}
            fill={isUp ? '#C8E6C9' : '#FFCDD2'}
            opacity="0.2"
          />

          {/* Main price curve */}
          <Polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={isUp ? '#00C853' : '#D32F2F'}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          <Circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#00C853" stroke="#FFF" strokeWidth="2" />
          <Circle cx={minPoint.x} cy={minPoint.y} r="5" fill="#D32F2F" stroke="#FFF" strokeWidth="2" />

          <Rect
            x={Math.max(chartPadding.left, Math.min(maxPoint.x - 36, width - chartPadding.right - 72))}
            y={Math.max(6, maxPoint.y - 30)}
            width="72"
            height="22"
            rx="11"
            fill="#E8F5E9"
          />
          <SvgText
            x={Math.max(chartPadding.left, Math.min(maxPoint.x - 36, width - chartPadding.right - 72)) + 36}
            y={Math.max(6, maxPoint.y - 30) + 14}
            fontSize="10"
            fill="#1B5E20"
            fontWeight="700"
            textAnchor="middle"
          >
            {t('expandedChart.high')}
          </SvgText>
          <Rect
            x={Math.max(chartPadding.left, Math.min(minPoint.x - 34, width - chartPadding.right - 68))}
            y={Math.min(chartHeight - 28, minPoint.y + 10)}
            width="68"
            height="22"
            rx="11"
            fill="#FFEBEE"
          />
          <SvgText
            x={Math.max(chartPadding.left, Math.min(minPoint.x - 34, width - chartPadding.right - 68)) + 34}
            y={Math.min(chartHeight - 28, minPoint.y + 10) + 14}
            fontSize="10"
            fill="#B71C1C"
            fontWeight="700"
            textAnchor="middle"
          >
            {t('expandedChart.low')}
          </SvgText>

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
                r="5"
                fill={isUp ? '#00C853' : '#D32F2F'}
                stroke="#FFF"
                strokeWidth="2"
              />
              {/* Tooltip background */}
              <Rect
                x={Math.max(5, points[selectedIndex].x - 35)}
                y={Math.max(5, points[selectedIndex].y - 25)}
                width="70"
                height="20"
                rx="4"
                fill="#1976D2"
                opacity="0.9"
              />
              {/* Tooltip text */}
              <SvgText
                x={Math.max(10, points[selectedIndex].x - 30)}
                y={Math.max(18, points[selectedIndex].y - 10)}
                fontSize="11"
                fill="#FFF"
                fontWeight="600"
                fontFamily="system-ui"
              >
                {formatPrice(points[selectedIndex].price)}
              </SvgText>
            </>
          )}
        </Svg>
      </View>

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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
  },
  statsColumn: {
    gap: 12,
  },
  stat: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  statHighValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C853',
  },
  statLowValue: {
    fontSize: 14,
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
    borderRadius: 12,
    paddingVertical: 18,
    marginVertical: 16,
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
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  instructionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16,
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
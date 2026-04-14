import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TIME_RANGES: Array<{ label: string; value: TimeRange; days: number | null }> = [
  { label: '7D', value: '7d', days: 7 },
  { label: '30D', value: '30d', days: 30 },
  { label: '90D', value: '90d', days: 90 },
  { label: '1Y', value: '1y', days: 365 },
  { label: 'ALL', value: 'all', days: null },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      layout={Layout.springify()}
      style={styles.container}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TIME_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            onPress={() => onRangeChange(range.value)}
            activeOpacity={0.7}
            style={[
              styles.button,
              selectedRange === range.value && styles.buttonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                selectedRange === range.value && styles.buttonTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    // borderBottomWidth: 1,
    // borderBottomColor: '#e9ecef',
  },
  scrollContent: {
    // paddingHorizontal: 8,
    gap: 5,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  buttonTextActive: {
    color: '#fff',
  },
});

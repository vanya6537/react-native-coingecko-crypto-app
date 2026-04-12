/**
 * Pages - Price Chart Page
 * Full-screen price chart
 */
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useUnit } from 'effector-react';
import { $priceHistory, fetchPriceHistory } from '../features/tokenDetail';
import { ExpandedPriceChart } from '../components/ExpandedPriceChart';
import { FullscreenChartLoadingSkeleton } from '../components/SkeletonLoader';

interface PriceChartPageProps {
  route: any;
}

export const PriceChartPage: React.FC<PriceChartPageProps> = ({ route }) => {
  const { tokenId, tokenName } = route.params;
  const priceHistory = useUnit($priceHistory);

  useEffect(() => {
    fetchPriceHistory(tokenId);
  }, [tokenId]);

  if (priceHistory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <FullscreenChartLoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpandedPriceChart data={priceHistory} tokenName={tokenName} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

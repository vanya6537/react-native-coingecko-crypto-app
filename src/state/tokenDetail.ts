import { createStore, createEvent, createEffect } from 'effector';
import { coingeckoAPI } from '../api/coingecko';
import type { TokenDetail, PriceHistory } from '../types/index';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export const fetchTokenDetail = createEffect(async (tokenId: string) => {
  return coingeckoAPI.getTokenDetail(tokenId);
});

export const fetchPriceHistory = createEffect(async (tokenId: string) => {
  // Get price history for last 30 days (more data points for better visualization)
  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - 30); // 30 days ago
  
  return coingeckoAPI.getPriceHistoryRange(tokenId, fromDate, toDate);
});

export const fetchPriceHistoryByTimeRange = createEffect(
  async ({ tokenId, timeRange }: { tokenId: string; timeRange: TimeRange }) => {
    return coingeckoAPI.getPriceHistoryByTimeRange(tokenId, timeRange);
  }
);

export const setDetailLoading = createEvent<boolean>();
export const setHistoryLoading = createEvent<boolean>();
export const clearDetail = createEvent();
export const setSelectedTimeRange = createEvent<TimeRange>();

export const $tokenDetail = createStore<TokenDetail | null>(null);
export const $priceHistory = createStore<PriceHistory[]>([]);
export const $detailLoading = createStore(false);
export const $historyLoading = createStore(false);
export const $detailError = createStore<string | null>(null);
export const $historyError = createStore<string | null>(null);
export const $selectedTimeRange = createStore<TimeRange>('30d');

$tokenDetail
  .on(fetchTokenDetail.doneData, (_, data) => data)
  .on(clearDetail, () => null);

$priceHistory
  .on(fetchPriceHistory.doneData, (_, data) => data)
  .on(fetchPriceHistoryByTimeRange.doneData, (_, data) => data)
  .on(clearDetail, () => []);

$detailLoading
  .on(fetchTokenDetail, () => true)
  .on(setDetailLoading, (_, value) => value)
  .on(fetchTokenDetail.finally, () => false);

$historyLoading
  .on(fetchPriceHistory, () => true)
  .on(fetchPriceHistoryByTimeRange, () => true)
  .on(setHistoryLoading, (_, value) => value)
  .on(fetchPriceHistory.finally, () => false)
  .on(fetchPriceHistoryByTimeRange.finally, () => false);

$detailError
  .on(fetchTokenDetail, () => null)
  .on(fetchTokenDetail.failData, (_, error) => error?.message || 'Failed to load token')
  .on(fetchTokenDetail.done, () => null)
  .on(clearDetail, () => null);

$historyError
  .on(fetchPriceHistory, () => null)
  .on(fetchPriceHistoryByTimeRange, () => null)
  .on(fetchPriceHistory.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistoryByTimeRange.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistory.done, () => null)
  .on(fetchPriceHistoryByTimeRange.done, () => null)
  .on(clearDetail, () => null);

$selectedTimeRange
  .on(setSelectedTimeRange, (_, timeRange) => timeRange)
  .on(clearDetail, () => '7d');

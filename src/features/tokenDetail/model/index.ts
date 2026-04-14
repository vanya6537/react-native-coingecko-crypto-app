/**
 * TokenDetail Feature - Model (State)
 */
import { createStore, createEvent, createEffect } from 'effector';
import { tokenDetailAPI } from '../api';
import type { TokenDetail, PriceHistory } from '../../../shared/types';
import type { TokenDetailUIState, HistoryUIState } from '../types';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

// Events
export const selectToken = createEvent<string>('selectToken');
export const clearDetail = createEvent();
export const setSelectedTimeRange = createEvent<TimeRange>();

// Effects
export const fetchTokenDetail = createEffect(async (tokenId: string) => {
  return tokenDetailAPI.getTokenDetail(tokenId);
});

export const fetchPriceHistory = createEffect(async (tokenId: string) => {
  // Get price history for last 30 days (more data points for better visualization)
  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - 30); // 30 days ago
  
  return tokenDetailAPI.getPriceHistoryRange(tokenId, fromDate, toDate);
});

export const fetchPriceHistoryByTimeRange = createEffect(
  async ({ tokenId, timeRange }: { tokenId: string; timeRange: TimeRange }) => {
    return tokenDetailAPI.getPriceHistoryByTimeRange(tokenId, timeRange);
  }
);

// Stores
export const $tokenDetail = createStore<TokenDetail | null>(null)
  .on(fetchTokenDetail.doneData, (_, data) => data)
  .on(clearDetail, () => null);

export const $priceHistory = createStore<PriceHistory[]>([])
  .on(fetchPriceHistory.doneData, (_, data) => data)
  .on(fetchPriceHistoryByTimeRange.doneData, (_, data) => data)
  .on(clearDetail, () => []);

export const $detailLoading = createStore(false)
  .on(fetchTokenDetail, () => true)
  .on(fetchTokenDetail.finally, () => false);

export const $historyLoading = createStore(false)
  .on(fetchPriceHistory, () => true)
  .on(fetchPriceHistoryByTimeRange, () => true)
  .on(fetchPriceHistory.finally, () => false)
  .on(fetchPriceHistoryByTimeRange.finally, () => false);

export const $detailError = createStore<string | null>(null)
  .on(fetchTokenDetail, () => null)
  .on(fetchTokenDetail.failData, (_, error) => error?.message || 'Failed to load token')
  .on(fetchTokenDetail.done, () => null)
  .on(clearDetail, () => null);

export const $historyError = createStore<string | null>(null)
  .on(fetchPriceHistory, () => null)
  .on(fetchPriceHistoryByTimeRange, () => null)
  .on(fetchPriceHistory.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistoryByTimeRange.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistory.done, () => null)
  .on(fetchPriceHistoryByTimeRange.done, () => null)
  .on(clearDetail, () => null);

export const $selectedTimeRange = createStore<TimeRange>('7d')
  .on(setSelectedTimeRange, (_, timeRange) => timeRange)
  .on(clearDetail, () => '7d');

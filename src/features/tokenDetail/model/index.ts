/**
 * TokenDetail Feature - Model (State)
 */
import { createStore, createEvent, createEffect } from 'effector';
import { tokenDetailAPI } from '../api';
import type { TokenDetail, PriceHistory } from '../../../shared/types';
import type { TokenDetailUIState, HistoryUIState } from '../types';

// Events
export const selectToken = createEvent<string>('selectToken');
export const clearDetail = createEvent();

// Effects
export const fetchTokenDetail = createEffect(async (tokenId: string) => {
  return tokenDetailAPI.getTokenDetail(tokenId);
});

export const fetchPriceHistory = createEffect(async (tokenId: string) => {
  return tokenDetailAPI.getPriceHistory(tokenId, 7);
});

// Stores
export const $tokenDetail = createStore<TokenDetail | null>(null)
  .on(fetchTokenDetail.doneData, (_, data) => data)
  .on(clearDetail, () => null);

export const $priceHistory = createStore<PriceHistory[]>([])
  .on(fetchPriceHistory.doneData, (_, data) => data)
  .on(clearDetail, () => []);

export const $detailLoading = createStore(false)
  .on(fetchTokenDetail, () => true)
  .on(fetchTokenDetail.finally, () => false);

export const $historyLoading = createStore(false)
  .on(fetchPriceHistory, () => true)
  .on(fetchPriceHistory.finally, () => false);

export const $detailError = createStore<string | null>(null)
  .on(fetchTokenDetail, () => null)
  .on(fetchTokenDetail.failData, (_, error) => error?.message || 'Failed to load token')
  .on(fetchTokenDetail.done, () => null)
  .on(clearDetail, () => null);

export const $historyError = createStore<string | null>(null)
  .on(fetchPriceHistory, () => null)
  .on(fetchPriceHistory.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistory.done, () => null)
  .on(clearDetail, () => null);

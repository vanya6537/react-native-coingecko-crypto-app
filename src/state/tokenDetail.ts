import { createStore, createEvent, createEffect } from 'effector';
import { coingeckoAPI } from '../api/coingecko';
import type { TokenDetail, PriceHistory } from '../types/index';

export const fetchTokenDetail = createEffect(async (tokenId: string) => {
  return coingeckoAPI.getTokenDetail(tokenId);
});

export const fetchPriceHistory = createEffect(async (tokenId: string) => {
  return coingeckoAPI.getPriceHistory(tokenId, 7);
});

export const setDetailLoading = createEvent<boolean>();
export const setHistoryLoading = createEvent<boolean>();
export const clearDetail = createEvent();

export const $tokenDetail = createStore<TokenDetail | null>(null);
export const $priceHistory = createStore<PriceHistory[]>([]);
export const $detailLoading = createStore(false);
export const $historyLoading = createStore(false);
export const $detailError = createStore<string | null>(null);
export const $historyError = createStore<string | null>(null);

$tokenDetail
  .on(fetchTokenDetail.doneData, (_, data) => data)
  .on(clearDetail, () => null);

$priceHistory
  .on(fetchPriceHistory.doneData, (_, data) => data)
  .on(clearDetail, () => []);

$detailLoading
  .on(fetchTokenDetail, () => true)
  .on(setDetailLoading, (_, value) => value)
  .on(fetchTokenDetail.finally, () => false);

$historyLoading
  .on(fetchPriceHistory, () => true)
  .on(setHistoryLoading, (_, value) => value)
  .on(fetchPriceHistory.finally, () => false);

$detailError
  .on(fetchTokenDetail, () => null)
  .on(fetchTokenDetail.failData, (_, error) => error?.message || 'Failed to load token')
  .on(fetchTokenDetail.done, () => null)
  .on(clearDetail, () => null);

$historyError
  .on(fetchPriceHistory, () => null)
  .on(fetchPriceHistory.failData, (_, error) => error?.message || 'Failed to load price history')
  .on(fetchPriceHistory.done, () => null)
  .on(clearDetail, () => null);

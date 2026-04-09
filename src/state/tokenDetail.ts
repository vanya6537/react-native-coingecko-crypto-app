import { createStore, createEvent, createEffect } from 'effector';
import { coingeckoAPI } from '../api/coingecko';
import type { Token, PriceHistory } from '../types/index';

export const fetchTokenDetail = createEffect(async (tokenId: string) => {
  return coingeckoAPI.getTokenDetail(tokenId);
});

export const fetchPriceHistory = createEffect(async (tokenId: string) => {
  return coingeckoAPI.getPriceHistory(tokenId, 7);
});

export const setDetailLoading = createEvent<boolean>();
export const setHistoryLoading = createEvent<boolean>();
export const clearDetail = createEvent();

export const $tokenDetail = createStore<Token | null>(null);
export const $priceHistory = createStore<PriceHistory[]>([]);
export const $detailLoading = createStore(false);
export const $historyLoading = createStore(false);

$tokenDetail
  .on(fetchTokenDetail.doneData, (_, data) => data)
  .on(clearDetail, () => null);

$priceHistory
  .on(fetchPriceHistory.doneData, (_, data) => data)
  .on(clearDetail, () => []);

$detailLoading
  .on(setDetailLoading, (_, value) => value)
  .on(fetchTokenDetail.finally, () => false);

$historyLoading
  .on(setHistoryLoading, (_, value) => value)
  .on(fetchPriceHistory.finally, () => false);

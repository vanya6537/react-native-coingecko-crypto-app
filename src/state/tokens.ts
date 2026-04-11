import { createStore, createEvent, createEffect, sample } from 'effector';
import { coingeckoAPI } from '../api/coingecko';
import type { Token, ListFilters, UIState } from '../types/index';

// Events
export const fetchInitialTokens = createEvent();
export const refreshTokens = createEvent();
export const fetchNextPage = createEvent();
export const setFilters = createEvent<Partial<ListFilters>>();
export const resetTokens = createEvent();
export const selectToken = createEvent<Token>();

// Effects
const fetchTokensPageFx = createEffect(async (params: { page: number; pageSize: number }) => {
  return coingeckoAPI.getTokensList(params.page, params.pageSize);
});

// Stores
const initialFilters: ListFilters = {
  search: '',
  sortBy: 'market_cap',
  sortOrder: 'desc',
};

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  isEmpty: false,
};

// Main token list store - accumulates from pagination
export const $tokens = createStore<Token[]>([])
  .on(resetTokens, () => [])
  .on(fetchTokensPageFx.doneData, (tokens: Token[], data: Token[]) => {
    // Check if this is first page or next page
    const currentPage = $currentPage.getState();
    // Page 1 replaces all data; subsequent pages append
    if (currentPage === 1) {
      return data;
    }
    return [...tokens, ...data];
  });

// Pagination tracking
export const $currentPage = createStore<number>(1)
  .on(fetchInitialTokens, () => 1)
  .on(refreshTokens, () => 1)
  .on(fetchNextPage, (page) => page + 1)
  .on(resetTokens, () => 1);

export const $pageSize = createStore<number>(50);

// Determine hasMore and isFetchingNextPage from effects
export const $isFetchingNextPage = createStore<boolean>(false)
  .on(fetchNextPage, () => true)
  .on(fetchTokensPageFx.finally, () => false);

export const $isLoadingInitial = createStore<boolean>(false)
  .on(fetchInitialTokens, () => true)
  .on(fetchTokensPageFx.finally, () => false);

export const $isRefreshing = createStore<boolean>(false)
  .on(refreshTokens, () => true)
  .on(fetchTokensPageFx.finally, () => false);

export const $hasMore = createStore<boolean>(true)
  .on(fetchTokensPageFx.doneData, (_: boolean, data: Token[]) => {
    // Assume hasMore if we got a full page of results
    return data.length >= 50;
  })
  .on(resetTokens, () => true);

// Filters
export const $filters = createStore<ListFilters>(initialFilters)
  .on(setFilters, (state: ListFilters, updates: Partial<ListFilters>) => {
    return { ...state, ...updates };
  })
  .on(resetTokens, () => initialFilters);

// UI state for errors
export const $uiState = createStore<UIState>(initialUIState)
  .on(fetchInitialTokens, () => ({ isLoading: true, error: null, isEmpty: false }))
  .on(refreshTokens, (state) => ({ ...state, error: null }))
  .on(fetchTokensPageFx.doneData, (state: UIState, data: Token[]) => {
    // On initial load, check isEmpty. On subsequent loads, preserve isEmpty from before.
    const currentPage = $currentPage.getState();
    if (currentPage === 1) {
      return {
        isLoading: false,
        error: null,
        isEmpty: data.length === 0,
      };
    }
    return { ...state, isLoading: false, error: null };
  })
  .on(fetchTokensPageFx.failData, (state: UIState, error: Error | null) => ({
    isLoading: false,
    error: error?.message || 'Failed to load tokens',
    isEmpty: false,
  }))
  .on(resetTokens, () => initialUIState);

export const $selectedToken = createStore<Token | null>(null)
  .on(selectToken, (_, token: Token) => token);

// Hooks to trigger API calls
const pageSize = 50;

// Combine currentPage with event to pass to effect
sample({
  clock: fetchInitialTokens,
  fn: () => ({ page: 1, pageSize }),
  target: fetchTokensPageFx,
});

sample({
  clock: refreshTokens,
  fn: () => ({ page: 1, pageSize }),
  target: fetchTokensPageFx,
});

sample({
  clock: fetchNextPage,
  source: $currentPage,
  fn: (page) => ({ page: page + 1, pageSize }),
  target: fetchTokensPageFx,
});

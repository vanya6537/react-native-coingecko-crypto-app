/**
 * TokensList Feature - Model (State)
 */
import { createStore, createEvent, createEffect, sample } from 'effector';
import { tokensListAPI } from '../api';
import type { Token } from '../../../shared/types';
import type { ListFilters, ListUIState, ListPaginationState } from '../types';

// Events
export const fetchInitialTokens = createEvent();
export const refreshTokens = createEvent();
export const fetchNextPage = createEvent();
export const setFilters = createEvent<Partial<ListFilters>>();
export const resetTokens = createEvent();

// Effects
const fetchTokensPageFx = createEffect(async (params: { page: number; pageSize: number }) => {
  return tokensListAPI.getTokensList(params.page, params.pageSize);
});

// Initial state
const initialFilters: ListFilters = {
  search: '',
  sortBy: 'market_cap',
  sortOrder: 'desc',
};

const initialUIState: ListUIState = {
  isLoading: false,
  error: null,
  isEmpty: false,
};

// Helper to deduplicate tokens by ID while preserving order
const deduplicateTokens = (tokens: Token[]): Token[] => {
  const seen = new Set<string>();
  const unique: Token[] = [];
  
  for (const token of tokens) {
    if (!seen.has(token.id)) {
      seen.add(token.id);
      unique.push(token);
    }
  }
  
  return unique;
};

// Stores
export const $currentPage = createStore<number>(1)
  .on(fetchInitialTokens, () => 1)
  .on(refreshTokens, () => 1)
  .on(fetchNextPage, (page) => page + 1)
  .on(resetTokens, () => 1);

export const $pageSize = createStore<number>(50);

export const $tokens = createStore<Token[]>([])
  .on(resetTokens, () => [])
  .on(fetchTokensPageFx.doneData, (tokens: Token[], data: Token[]) => {
    const currentPage = $currentPage.getState();
    const merged = currentPage === 1 ? data : [...tokens, ...data];
    return deduplicateTokens(merged);
  });

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
    return data.length >= 50;
  })
  .on(resetTokens, () => true);

export const $filters = createStore<ListFilters>(initialFilters)
  .on(setFilters, (state: ListFilters, updates: Partial<ListFilters>) => {
    return { ...state, ...updates };
  })
  .on(resetTokens, () => initialFilters);

export const $uiState = createStore<ListUIState>(initialUIState)
  .on(fetchInitialTokens, () => ({ isLoading: true, error: null, isEmpty: false }))
  .on(refreshTokens, (state) => ({ ...state, error: null }))
  .on(fetchTokensPageFx.doneData, (state: ListUIState, data: Token[]) => {
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
  .on(fetchTokensPageFx.failData, (state: ListUIState, error: Error | null) => ({
    isLoading: false,
    error: error?.message || 'Failed to load tokens',
    isEmpty: false,
  }));

// Connect events to fetch effect
sample({
  source: { page: $currentPage, pageSize: $pageSize },
  clock: [fetchInitialTokens, refreshTokens, fetchNextPage],
  target: fetchTokensPageFx,
});

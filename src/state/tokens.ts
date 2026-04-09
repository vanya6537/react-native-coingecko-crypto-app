import { createStore, createEvent, createEffect, sample } from 'effector';
import { coingeckoAPI } from '../api/coingecko';
import type { Token, ListFilters, PaginationState, UIState } from '../types/index';

// Events
export const fetchTokens = createEvent<{ page: number }>();
export const setFilters = createEvent<Partial<ListFilters>>();
export const resetTokens = createEvent();
export const selectToken = createEvent<Token>();

// Effects
const fetchTokensFx = createEffect(async (page: number) => {
  return coingeckoAPI.getTokensList(page, 50);
});

// Stores
const initialFilters: ListFilters = {
  search: '',
  sortBy: 'market_cap',
  sortOrder: 'desc',
};

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 50,
};

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  isEmpty: false,
};

export const $tokens = createStore<Token[]>([]);
export const $filters = createStore<ListFilters>(initialFilters);
export const $pagination = createStore<PaginationState>(initialPagination);
export const $uiState = createStore<UIState>(initialUIState);
export const $selectedToken = createStore<Token | null>(null);

// Handlers
$tokens
  .on(fetchTokensFx.doneData, (_: Token[], data: Token[]) => data)
  .on(resetTokens, () => []);

$filters.on(setFilters, (state: ListFilters, updates: Partial<ListFilters>) => ({ ...state, ...updates }));

$uiState
  .on(fetchTokens, () => ({ isLoading: true, error: null, isEmpty: false }))
  .on(fetchTokensFx.doneData, (_: UIState, data: Token[]) => ({
    isLoading: false,
    error: null,
    isEmpty: data.length === 0,
  }))
  .on(fetchTokensFx.failData, (_: UIState, error: Error | null) => ({
    isLoading: false,
    error: error?.message || 'Failed to load tokens',
    isEmpty: false,
  }));

$selectedToken.on(selectToken, (_: Token | null, token: Token) => token);

// Sample for requests
sample({
  clock: fetchTokens,
  fn: (clock: { page: number }) => clock.page,
  target: fetchTokensFx,
});

import { createStore, createEvent, createEffect, sample } from 'effector';
import { coingeckoAPI } from '@api/coingecko';
import { Token, ListFilters, PaginationState, UIState } from '@types/index';

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
  .on(fetchTokensFx.doneData, (_, data) => data)
  .on(resetTokens, () => []);

$filters.on(setFilters, (state, updates) => ({ ...state, ...updates }));

$uiState
  .on(fetchTokens, () => ({ isLoading: true, error: null, isEmpty: false }))
  .on(fetchTokensFx.doneData, (_, data) => ({
    isLoading: false,
    error: null,
    isEmpty: data.length === 0,
  }))
  .on(fetchTokensFx.failData, () => ({
    isLoading: false,
    error: 'Failed to load tokens',
    isEmpty: false,
  }));

$selectedToken.on(selectToken, (_, token) => token);

// Sample for requests
sample({
  clock: fetchTokens,
  fn: (clock) => clock.page,
  target: fetchTokensFx,
});

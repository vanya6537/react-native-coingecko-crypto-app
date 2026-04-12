/**
 * TokensList Feature - Types
 */
export interface ListFilters {
  search: string;
  sortBy: 'price' | 'change24h' | 'market_cap';
  sortOrder: 'asc' | 'desc';
}

export interface ListUIState {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export interface ListPaginationState {
  page: number;
  pageSize: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap_rank: number | null;
  price_change_percentage_24h: number | null;
  market_cap?: number | null;
  total_volume?: number | null;
  ath?: number | null;
  atl?: number | null;
  market_cap_change_24h?: number | null;
  description?: string;
}

export interface TokenDetail extends Token {}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface ListFilters {
  search: string;
  sortBy: 'price' | 'change24h' | 'market_cap';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total?: number;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

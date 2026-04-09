export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number | null;
  price_change_percentage_24h: number;
  market_cap?: number;
  total_volume?: number;
  ath?: number;
  atl?: number;
  market_cap_change_24h?: number;
}

export interface TokenDetail extends Token {
  description?: string;
}

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

/**
 * TokenDetail Feature - API
 */
import client from '../../../shared/api/client';
import type { TokenDetail, PriceHistory } from '../../../shared/types';
import { cache } from '../../../shared/lib/cache';
import { withRetry } from '../../../shared/lib/retry';

const DETAIL_CACHE_TTL = 10 * 60 * 1000; // 10 min

// Cache TTL per CoinGecko API Update Frequency Recommendations
const HISTORY_CACHE_TTL_1D = 60 * 1000; // 1 day = 1 minute cache
const HISTORY_CACHE_TTL_2_90D = 30 * 60 * 1000; // 2-90 days = 30 minutes cache
const HISTORY_CACHE_TTL_90D_PLUS = 12 * 60 * 60 * 1000; // 90+ days = 12 hours cache

interface CoinGeckoLocalizedNumberMap {
  [key: string]: number | null | undefined;
}

interface CoinGeckoTokenDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image?: {
    thumb?: string | null;
    small?: string | null;
    large?: string | null;
  } | null;
  market_cap_rank?: number | null;
  description?: {
    en?: string | null;
  } | null;
  market_data?: {
    current_price?: CoinGeckoLocalizedNumberMap | null;
    price_change_percentage_24h?: number | null;
    market_cap?: CoinGeckoLocalizedNumberMap | null;
    total_volume?: CoinGeckoLocalizedNumberMap | null;
    ath?: CoinGeckoLocalizedNumberMap | null;
    atl?: CoinGeckoLocalizedNumberMap | null;
    market_cap_change_24h?: number | null;
  } | null;
}

const stripHtml = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const usdValue = (value: CoinGeckoLocalizedNumberMap | null | undefined): number | null => {
  const usd = value?.usd;
  return typeof usd === 'number' ? usd : null;
};

const normalizeTokenDetail = (data: CoinGeckoTokenDetailResponse): TokenDetail => {
  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    image: data.image?.large || data.image?.small || data.image?.thumb || '',
    current_price: usdValue(data.market_data?.current_price),
    market_cap_rank: data.market_cap_rank ?? null,
    price_change_percentage_24h: data.market_data?.price_change_percentage_24h ?? null,
    market_cap: usdValue(data.market_data?.market_cap),
    total_volume: usdValue(data.market_data?.total_volume),
    ath: usdValue(data.market_data?.ath),
    atl: usdValue(data.market_data?.atl),
    market_cap_change_24h: data.market_data?.market_cap_change_24h ?? null,
    description: stripHtml(data.description?.en),
  };
};

export const tokenDetailAPI = {
  async getTokenDetail(tokenId: string): Promise<TokenDetail> {
    const cacheKey = `token_detail_${tokenId}`;
    const cached = cache.get<TokenDetail>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cached detail: ${tokenId}`);
      return cached;
    }

    const data = await withRetry(async () => {
      const response = await client.get<CoinGeckoTokenDetailResponse>(
        `/coins/${tokenId}`,
        {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
          },
        }
      );
      return response.data;
    }, 3);

    const normalized = normalizeTokenDetail(data);
    cache.set(cacheKey, normalized, DETAIL_CACHE_TTL);
    return normalized;
  },

  async getPriceHistory(tokenId: string, days: number = 7): Promise<PriceHistory[]> {
    const cacheKey = `price_history_${tokenId}_${days}d`;
    const cached = cache.get<PriceHistory[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cached history: ${tokenId}`);
      return cached;
    }

    const data = await withRetry(async () => {
      const response = await client.get<{ prices: [number, number][] }>(
        `/coins/${tokenId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days,
            interval: 'daily',
          },
        }
      );
      return response.data.prices;
    }, 3);

    const normalized = data.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    cache.set(cacheKey, normalized, HISTORY_CACHE_TTL_2_90D);
    return normalized;
  },

  async getPriceHistoryRange(
    tokenId: string,
    fromDate: Date | string,
    toDate: Date | string = new Date(),
    cacheTTL?: number
  ): Promise<PriceHistory[]> {
    // Преобразовать в ISO строки если это Date объекты
    const fromISO = typeof fromDate === 'string' ? fromDate : fromDate.toISOString().split('T')[0];
    const toISO = typeof toDate === 'string' ? toDate : toDate.toISOString().split('T')[0];
    
    const cacheKey = `price_history_range_${tokenId}_${fromISO}_${toISO}`;
    const cached = cache.get<PriceHistory[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cached history range: ${tokenId}`);
      return cached;
    }

    // Если TTL не указан, выбрать оптимальный по CoinGecko рекомендациям
    let ttl = cacheTTL;
    if (!ttl) {
      const days = Math.ceil((new Date(toISO).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24));
      if (days === 1) {
        ttl = HISTORY_CACHE_TTL_1D;
      } else if (days <= 90) {
        ttl = HISTORY_CACHE_TTL_2_90D;
      } else {
        ttl = HISTORY_CACHE_TTL_90D_PLUS;
      }
    }

    const data = await withRetry(async () => {
      const response = await client.get<{
        prices: [number, number][];
        market_caps: [number, number][];
        total_volumes: [number, number][];
      }>(`/coins/${tokenId}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: fromISO,
          to: toISO,
        },
      });
      return response.data.prices;
    }, 3);

    const normalized = data.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    cache.set(cacheKey, normalized, ttl);
    return normalized;
  },

  async getPriceHistoryByTimeRange(
    tokenId: string,
    timeRange: '1d' | '7d' | '30d' | '90d' | '1y' | 'all'
  ): Promise<PriceHistory[]> {
    // Рассчитать диапазон дат
    const toDate = new Date();
    const fromDate = new Date();
    
    let daysAgo: number;
    switch (timeRange) {
      case '1d':
        daysAgo = 1;
        break;
      case '7d':
        daysAgo = 7;
        break;
      case '30d':
        daysAgo = 30;
        break;
      case '90d':
        daysAgo = 90;
        break;
      case '1y':
        daysAgo = 365;
        break;
      case 'all':
        daysAgo = 5000; // ~13 years, API will handle it
        break;
    }
    
    fromDate.setDate(fromDate.getDate() - daysAgo);
    
    // Определить кэш TTL согласно рекомендациям CoinGecko
    let cacheTTL: number;
    if (timeRange === '1d') {
      cacheTTL = HISTORY_CACHE_TTL_1D;
    } else if (timeRange === '7d' || timeRange === '30d') {
      cacheTTL = HISTORY_CACHE_TTL_2_90D;
    } else {
      cacheTTL = HISTORY_CACHE_TTL_90D_PLUS;
    }
    
    return this.getPriceHistoryRange(tokenId, fromDate, toDate, cacheTTL);
  },
};

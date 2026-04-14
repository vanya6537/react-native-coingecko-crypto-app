import client from './client';
import type { Token, TokenDetail, PriceHistory } from '../types/index';
import { cache } from '../utils/cache';
import { withRetry } from '../utils/retry';

const TOKENS_CACHE_TTL = 5 * 60 * 1000; // 5 min
const DETAIL_CACHE_TTL = 10 * 60 * 1000; // 10 min

// Cache TTL per CoinGecko API Update Frequency Recommendations
const HISTORY_CACHE_TTL_1D = 60 * 1000; // 1 day = 1 minute cache
const HISTORY_CACHE_TTL_2_90D = 30 * 60 * 1000; // 2-90 days = 30 minutes cache
const HISTORY_CACHE_TTL_90D_PLUS = 12 * 60 * 60 * 1000; // 90+ days = 12 hours cache

type CoinGeckoLocalizedNumberMap = Record<string, number | null | undefined>;

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
  if (!value) {
    return undefined;
  }

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

export const coingeckoAPI = {
  /**
   * Получить список токенов с пагинацией (с кэшем)
   */
  async getTokensList(page: number = 1, perPage: number = 50): Promise<Token[]> {
    const cacheKey = `tokens_page_${page}_${perPage}`;
    const cached = cache.get<Token[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
      const data = await withRetry(async () => {
        const response = await client.get<Token[]>('/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: perPage,
            page,
            sparkline: false,
          },
        });
        return response.data;
      }, 3);

      cache.set(cacheKey, data, TOKENS_CACHE_TTL);
      return data;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      throw error;
    }
  },

  /**
   * Получить детали токена (с кэшем)
   */
  async getTokenDetail(tokenId: string): Promise<TokenDetail> {
    const cacheKey = `token_detail_${tokenId}`;
    const cached = cache.get<TokenDetail>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
      const data = await withRetry(async () => {
        const response = await client.get<CoinGeckoTokenDetailResponse>(`/coins/${tokenId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
          },
        });
        return normalizeTokenDetail(response.data);
      }, 3);

      cache.set(cacheKey, data, DETAIL_CACHE_TTL);
      return data;
    } catch (error) {
      console.error(`Failed to fetch token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Получить историю цены за последние N дней (с кэшем)
   */
  async getPriceHistory(tokenId: string, days: number = 7): Promise<PriceHistory[]> {
    const cacheKey = `price_history_${tokenId}_${days}d`;
    const cached = cache.get<PriceHistory[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
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
        return response.data;
      }, 3);
      
      const formatted = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      cache.set(cacheKey, formatted, HISTORY_CACHE_TTL_2_90D);
      return formatted;
    } catch (error) {
      console.error(`Failed to fetch price history for ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Получить историю цены в диапазоне дат (новый endpoint с более гибким интервалом)
   * Поддерживает преобразование интервала: 5m (до 10 дней), hourly (до 100 дней), daily (без лимита)
   */
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
      console.log(`📦 Cache hit: ${cacheKey}`);
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

    try {
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
            // Интервал не указываем - API автоматически выберет оптимальную гранулярность
            // 5m (до 10 дней), hourly (до 100 дней), daily (более 90 дней)
          },
        });
        return response.data;
      }, 3);
      
      const formatted = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      cache.set(cacheKey, formatted, ttl);
      return formatted;
    } catch (error) {
      console.error(
        `Failed to fetch price history range for ${tokenId} from ${fromISO} to ${toISO}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Получить историю цены по выбранному периоду (1d, 7d, 30d, 90d, 1y, all)
   * Автоматически выбирает оптимальный интервал и кэш TTL согласно CoinGecko рекомендациям
   */
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

  /**
   * Поиск токенов по названию
   */
  async searchTokens(query: string): Promise<Token[]> {
    if (!query || query.length < 2) return [];
    
    const cacheKey = `search_${query}`;
    const cached = cache.get<Token[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await client.get<{ coins: Token[] }>('/search', {
        params: { query },
      });
      const results = response.data.coins.slice(0, 10);
      cache.set(cacheKey, results, 30 * 60 * 1000); // 30 min cache
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },

  /**
   * Очистить весь кэш
   */
  clearCache(): void {
    cache.clear();
    console.log('🗑️ Cache cleared');
  },
};

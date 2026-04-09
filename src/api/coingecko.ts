import client from './client';
import type { Token, PriceHistory } from '../types/index';
import { cache } from '../utils/cache';
import { withRetry } from '../utils/retry';

const TOKENS_CACHE_TTL = 5 * 60 * 1000; // 5 min
const HISTORY_CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour
const DETAIL_CACHE_TTL = 10 * 60 * 1000; // 10 min

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
  async getTokenDetail(tokenId: string): Promise<Token> {
    const cacheKey = `token_detail_${tokenId}`;
    const cached = cache.get<Token>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
      const data = await withRetry(async () => {
        const response = await client.get<Token>(`/coins/${tokenId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
          },
        });
        return response.data;
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

      cache.set(cacheKey, formatted, HISTORY_CACHE_TTL);
      return formatted;
    } catch (error) {
      console.error(`Failed to fetch price history for ${tokenId}:`, error);
      throw error;
    }
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

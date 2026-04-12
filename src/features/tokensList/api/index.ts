/**
 * TokensList Feature - API
 */
import client from '../../../shared/api/client';
import type { Token } from '../../../shared/types';
import { cache } from '../../../shared/lib/cache';
import { withRetry } from '../../../shared/lib/retry';

const TOKENS_CACHE_TTL = 5 * 60 * 1000; // 5 min

export const tokensListAPI = {
  async getTokensList(page: number = 1, perPage: number = 50): Promise<Token[]> {
    const cacheKey = `tokens_page_${page}_${perPage}`;
    const cached = cache.get<Token[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Cached: ${cacheKey}`);
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
};

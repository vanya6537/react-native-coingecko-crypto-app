import client from './client';
import { Token, PriceHistory } from '@types/index';

export const coingeckoAPI = {
  /**
   * Получить список токенов с пагинацией
   */
  async getTokensList(page: number = 1, perPage: number = 50): Promise<Token[]> {
    try {
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
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      throw error;
    }
  },

  /**
   * Получить детали токена
   */
  async getTokenDetail(tokenId: string): Promise<Token> {
    try {
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
    } catch (error) {
      console.error(`Failed to fetch token ${tokenId}:`, error);
      throw error;
    }
  },

  /**
   * Получить историю цены за последние N дней
   */
  async getPriceHistory(tokenId: string, days: number = 7): Promise<PriceHistory[]> {
    try {
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
      
      return response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        price,
      }));
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
    
    try {
      const response = await client.get<{ coins: Token[] }>('/search', {
        params: { query },
      });
      return response.data.coins.slice(0, 10);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },
};

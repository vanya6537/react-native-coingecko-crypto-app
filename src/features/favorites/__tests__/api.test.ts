/**
 * Favorites API - Tests
 */

import { favoritesAPI } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('favoritesAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFavorites', () => {
    it('should load favorites from storage', async () => {
      const mockFavorites = ['bitcoin', 'ethereum'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));

      const result = await favoritesAPI.loadFavorites();

      expect(result).toEqual(mockFavorites);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@crypto_tokens_app/favorites');
    });

    it('should return empty array if no favorites stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await favoritesAPI.loadFavorites();

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await favoritesAPI.loadFavorites();

      expect(result).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a new token to favorites', async () => {
      const mockFavorites = ['bitcoin'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await favoritesAPI.addFavorite('ethereum');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@crypto_tokens_app/favorites',
        JSON.stringify(['bitcoin', 'ethereum'])
      );
    });

    it('should not add duplicate favorites', async () => {
      const mockFavorites = ['bitcoin', 'ethereum'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await favoritesAPI.addFavorite('bitcoin');

      // Should not call setItem since bitcoin already exists
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a token from favorites', async () => {
      const mockFavorites = ['bitcoin', 'ethereum'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await favoritesAPI.removeFavorite('bitcoin');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@crypto_tokens_app/favorites',
        JSON.stringify(['ethereum'])
      );
    });
  });

  describe('isFavorited', () => {
    it('should return true if token is favorited', async () => {
      const mockFavorites = ['bitcoin', 'ethereum'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));

      const result = await favoritesAPI.isFavorited('bitcoin');

      expect(result).toBe(true);
    });

    it('should return false if token is not favorited', async () => {
      const mockFavorites = ['bitcoin'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));

      const result = await favoritesAPI.isFavorited('ethereum');

      expect(result).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await favoritesAPI.clearFavorites();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@crypto_tokens_app/favorites');
    });
  });
});

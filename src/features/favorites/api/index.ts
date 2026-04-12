/**
 * Favorites Feature - API
 * AsyncStorage-based persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@crypto_tokens_app/favorites';

export const favoritesAPI = {
  /**
   * Load favorites from AsyncStorage
   */
  async loadFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!data) return [];
      return JSON.parse(data) as string[];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  },

  /**
   * Add token to favorites
   */
  async addFavorite(tokenId: string): Promise<void> {
    try {
      const favorites = await this.loadFavorites();
      if (!favorites.includes(tokenId)) {
        favorites.push(tokenId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  },

  /**
   * Remove token from favorites
   */
  async removeFavorite(tokenId: string): Promise<void> {
    try {
      const favorites = await this.loadFavorites();
      const filtered = favorites.filter((id) => id !== tokenId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  },

  /**
   * Check if token is favorited
   */
  async isFavorited(tokenId: string): Promise<boolean> {
    try {
      const favorites = await this.loadFavorites();
      return favorites.includes(tokenId);
    } catch (error) {
      console.error('Failed to check if favorited:', error);
      return false;
    }
  },

  /**
   * Clear all favorites
   */
  async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      throw error;
    }
  },
};

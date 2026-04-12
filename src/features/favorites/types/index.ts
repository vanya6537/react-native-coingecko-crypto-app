/**
 * Favorites Feature - Types
 */

export interface FavoritesState {
  favoriteIds: Set<string>;
  loading: boolean;
  error: string | null;
}

export interface FavoritesUI {
  isLoading: boolean;
  error: string | null;
}

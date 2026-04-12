/**
 * Favorites Feature - Public API
 */

export {
  initializeFavorites,
  toggleFavorite,
  addFavorite,
  removeFavorite,
  clearFavorites,
  $favoriteIds,
  $favoritesUI,
  createIsFavorited,
} from './model';

export type { FavoritesState, FavoritesUI } from './types';

/**
 * Favorites Feature - Model (State Management with Effector)
 */

import { createStore, createEvent, createEffect, sample } from 'effector';
import { favoritesAPI } from '../api';
import type { FavoritesUI } from '../types';

// Events
export const initializeFavorites = createEvent();
export const toggleFavorite = createEvent<string>();
export const addFavorite = createEvent<string>();
export const removeFavorite = createEvent<string>();
export const clearFavorites = createEvent();

// Effects
const loadFavoritesFx = createEffect(async () => {
  return favoritesAPI.loadFavorites();
});

const addFavoriteFx = createEffect(async (tokenId: string) => {
  await favoritesAPI.addFavorite(tokenId);
  return (await favoritesAPI.loadFavorites()).map((id) => id);
});

const removeFavoriteFx = createEffect(async (tokenId: string) => {
  await favoritesAPI.removeFavorite(tokenId);
  return (await favoritesAPI.loadFavorites()).map((id) => id);
});

const clearFavoritesFx = createEffect(async () => {
  await favoritesAPI.clearFavorites();
  return [];
});

// Stores
export const $favoriteIds = createStore<Set<string>>(new Set())
  .on(loadFavoritesFx.doneData, (_: Set<string>, data: string[]) => new Set(data))
  .on(addFavoriteFx.doneData, (_: Set<string>, data: string[]) => new Set(data))
  .on(removeFavoriteFx.doneData, (_: Set<string>, data: string[]) => new Set(data))
  .on(clearFavoritesFx.doneData, () => new Set());

export const $favoritesUI = createStore<FavoritesUI>({
  isLoading: false,
  error: null,
})
  .on(loadFavoritesFx, (state) => ({ ...state, isLoading: true, error: null }))
  .on(loadFavoritesFx.doneData, () => ({ isLoading: false, error: null }))
  .on(loadFavoritesFx.failData, () => ({ isLoading: false, error: 'Failed to load favorites' }))
  .on(addFavoriteFx.failData, () => ({ isLoading: false, error: 'Failed to add to favorites' }))
  .on(removeFavoriteFx.failData, () => ({ isLoading: false, error: 'Failed to remove from favorites' }));

// Derived store - check if specific token is favorited
export const createIsFavorited = (tokenId: string) => {
  return $favoriteIds.map((favorites) => favorites.has(tokenId));
};

// Wire up events to effects
sample({
  clock: initializeFavorites,
  target: loadFavoritesFx,
});

sample({
  clock: addFavorite,
  target: addFavoriteFx,
});

sample({
  clock: removeFavorite,
  target: removeFavoriteFx,
});

sample({
  clock: clearFavorites,
  target: clearFavoritesFx,
});

// Toggle favorite
sample({
  source: $favoriteIds,
  clock: toggleFavorite,
  fn: (favorites, tokenId) => {
    if (favorites.has(tokenId)) {
      return { action: 'remove', tokenId } as const;
    }
    return { action: 'add', tokenId } as const;
  },
  target: createEffect(async (payload: { action: string; tokenId: string }) => {
    if (payload.action === 'add') {
      return addFavoriteFx(payload.tokenId);
    } else {
      return removeFavoriteFx(payload.tokenId);
    }
  }),
});

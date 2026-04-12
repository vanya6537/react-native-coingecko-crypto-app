/**
 * Theme Feature - State Management
 */

import { createStore, createEvent, createEffect, sample, combine } from 'effector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import type { ThemeMode, ThemeConfig } from '../types';
import { lightThemeColors, darkThemeColors } from './colors';

const THEME_KEY = '@crypto_tokens_app/theme_mode';

// Events
export const initializeTheme = createEffect(async () => {
  try {
    const saved = await AsyncStorage.getItem(THEME_KEY);
    return (saved as ThemeMode) || 'auto';
  } catch {
    return 'auto';
  }
});

export const setThemeMode = createEvent<ThemeMode>();
export const toggleTheme = createEvent();

// Effects
const saveThemeFx = createEffect(async (mode: ThemeMode) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
});

// Store for theme mode preference
export const $themeMode = createStore<ThemeMode>('auto')
  .on(initializeTheme.doneData, (_, mode) => mode)
  .on(setThemeMode, (_, mode) => mode)
  .on(toggleTheme, (current) => {
    if (current === 'light') return 'dark';
    if (current === 'dark') return 'light';
    return 'light'; // Default when 'auto'
  });

// Save theme when changed
sample({
  clock: [$themeMode],
  source: $themeMode,
  target: saveThemeFx,
});

// Store for current theme (computed based on mode + system preference)
export const $isDark = createStore<boolean>(false)
  .on(
    combine($themeMode, (mode) => {
      if (mode === 'dark') return true;
      if (mode === 'light') return false;
      // For 'auto', use system scheme (would need platform-specific logic)
      return false; // Default fallback
    }),
    (_, isDark) => isDark
  );

// Computed theme configuration
export const $themeConfig = combine(
  { isDark: $isDark, mode: $themeMode },
  ({ isDark, mode }) => ({
    mode,
    isDark,
    colors: isDark ? darkThemeColors : lightThemeColors,
  } as ThemeConfig)
);

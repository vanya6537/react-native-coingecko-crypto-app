/**
 * Theme Feature - Public API
 */

export {
  initializeTheme,
  setThemeMode,
  toggleTheme,
  $themeMode,
  $isDark,
  $themeConfig,
} from './model';

export type { ThemeMode, ThemeColors, ThemeConfig } from './types';
export { lightThemeColors, darkThemeColors } from './model/colors';

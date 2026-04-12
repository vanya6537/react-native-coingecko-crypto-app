/**
 * Theme Feature - Types
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  // Background
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Semantic colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Borders
  border: string;
  borderLight: string;
  divider: string;

  // Additional
  skeleton: string;
  overlay: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

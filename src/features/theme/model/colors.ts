/**
 * Theme Color Schemes
 */

import type { ThemeColors } from '../types';

export const lightThemeColors: ThemeColors = {
  // Background
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#EEEEEE',

  // Text
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Semantic colors
  success: '#00C853',
  error: '#D32F2F',
  warning: '#FFA726',
  info: '#1976D2',

  // Primary
  primary: '#1976D2',
  primaryLight: '#42A5F5',
  primaryDark: '#1565C0',

  // Borders
  border: '#E0E0E0',
  borderLight: '#EFEFEF',
  divider: '#BDBDBD',

  // Additional
  skeleton: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkThemeColors: ThemeColors = {
  // Background
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  // Semantic colors
  success: '#00C853',
  error: '#FF6B6B',
  warning: '#FFA726',
  info: '#42A5F5',

  // Primary
  primary: '#42A5F5',
  primaryLight: '#64B5F6',
  primaryDark: '#1976D2',

  // Borders
  border: '#404040',
  borderLight: '#303030',
  divider: '#616161',

  // Additional
  skeleton: '#303030',
  overlay: 'rgba(255, 255, 255, 0.1)',
};

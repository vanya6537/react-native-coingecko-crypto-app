/**
 * Theme Colors - Tests
 */

import { lightThemeColors, darkThemeColors } from '../model/colors';

describe('Theme Colors', () => {
  describe('Light Theme', () => {
    it('should have valid background and text colors', () => {
      expect(lightThemeColors.background).toBe('#FFFFFF');
      expect(lightThemeColors.text).toBe('#1a1a1a');
    });

    it('should have semantic colors', () => {
      expect(lightThemeColors.success).toBe('#00C853');
      expect(lightThemeColors.error).toBe('#D32F2F');
      expect(lightThemeColors.warning).toBe('#FFA726');
      expect(lightThemeColors.info).toBe('#1976D2');
    });

    it('should have primary colors', () => {
      expect(lightThemeColors.primary).toBe('#1976D2');
      expect(lightThemeColors.primaryLight).toBe('#42A5F5');
      expect(lightThemeColors.primaryDark).toBe('#1565C0');
    });
  });

  describe('Dark Theme', () => {
    it('should have valid background and text colors', () => {
      expect(darkThemeColors.background).toBe('#121212');
      expect(darkThemeColors.text).toBe('#FFFFFF');
    });

    it('should have semantic colors', () => {
      expect(darkThemeColors.success).toBe('#00C853');
      expect(darkThemeColors.error).toBe('#FF6B6B');
      expect(darkThemeColors.warning).toBe('#FFA726');
      expect(darkThemeColors.info).toBe('#42A5F5');
    });

    it('should have primary colors', () => {
      expect(darkThemeColors.primary).toBe('#42A5F5');
      expect(darkThemeColors.primaryLight).toBe('#64B5F6');
      expect(darkThemeColors.primaryDark).toBe('#1976D2');
    });
  });
});

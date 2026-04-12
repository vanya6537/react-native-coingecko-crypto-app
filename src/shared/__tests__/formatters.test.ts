/**
 * Formatters Utilities - Tests
 */

import { formatPrice, formatChange, formatMarketCap } from '../../utils/formatters';

describe('Formatters', () => {
  describe('formatPrice', () => {
    it('should format prices correctly', () => {
      expect(formatPrice(1234.567)).toBe('$1,234.57');
      expect(formatPrice(0.00123)).toBe('$0.00');
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
    });

    it('should handle small prices', () => {
      expect(formatPrice(0.0001)).toBe('$0.00');
      expect(formatPrice(0.123)).toBe('$0.12');
    });
  });

  describe('formatChange', () => {
    it('should format positive changes with +', () => {
      expect(formatChange(5.5)).toContain('+');
      expect(formatChange(5.5)).toContain('5.50');
    });

    it('should format negative changes', () => {
      const result = formatChange(-3.2);
      expect(result).toContain('-3.20');
    });

    it('should format zero change', () => {
      const result = formatChange(0);
      expect(result).toContain('0.00');
    });
  });

  describe('formatMarketCap', () => {
    it('should format large numbers with billions', () => {
      const result = formatMarketCap(1500000000000);
      expect(result).toContain('T'); // Trillions
    });

    it('should format millions', () => {
      const result = formatMarketCap(500000000);
      expect(result).toContain('B'); // Billions
    });

    it('should format thousands', () => {
      const result = formatMarketCap(50000);
      expect(result).toContain('K'); // Thousands
    });
  });
});

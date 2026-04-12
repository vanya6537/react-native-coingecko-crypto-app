/**
 * Export Feature - CSV Export
 */

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import type { Token } from '../../../shared/types';

export const csvExportAPI = {
  /**
   * Generate CSV from tokens
   */
  generateTokensCSV(tokens: Token[]): string {
    const headers = ['Name', 'Symbol', 'Price', 'Market Cap', '24h Change %', 'Rank'];
    const rows = tokens.map((token) => [
      token.name,
      token.symbol.toUpperCase(),
      token.current_price || 0,
      token.market_cap || 0,
      token.price_change_percentage_24h || 0,
      token.market_cap_rank || '-',
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => {
        // Escape quotes and wrap fields with commas
        return row
          .map((field) => {
            const escaped = String(field).replace(/"/g, '""');
            const needsQuotes = escaped.includes(',') || escaped.includes('"');
            return needsQuotes ? `"${escaped}"` : escaped;
          })
          .join(',');
      }),
    ].join('\n');

    return csvContent;
  },

  /**
   * Export tokens to CSV file and share
   */
  async exportTokensAsCSV(tokens: Token[]): Promise<void> {
    try {
      const csv = this.generateTokensCSV(tokens);

      // Create file path
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `crypto_tokens_${timestamp}.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Write file
      await RNFS.writeFile(filePath, csv, 'utf8');

      // Share file
      await Share.open({
        url: `file://${filePath}`,
        type: 'text/csv',
        title: 'Export Tokens',
        message: 'Cryptocurrency tokens data',
        filename: fileName,
      });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw error;
    }
  },

  /**
   * Generate CSV from single token detail
   */
  generateTokenDetailCSV(token: Token, priceHistory?: Array<{ date: string; price: number }>): string {
    let csv = 'Cryptocurrency Token Data\n\n';

    // Token info section
    csv += 'Token Information\n';
    csv += `Name,${token.name}\n`;
    csv += `Symbol,${token.symbol.toUpperCase()}\n`;
    csv += `Price,$${token.current_price?.toFixed(2) || '0.00'}\n`;
    csv += `Market Cap,$${(token.market_cap || 0).toLocaleString()}\n`;
    csv += `24h Volume,$${(token.total_volume || 0).toLocaleString()}\n`;
    csv += `Market Cap Rank,${token.market_cap_rank || '-'}\n`;
    csv += `24h Change,${token.price_change_percentage_24h?.toFixed(2) || '0.00'}%\n`;
    csv += `ATH,$${token.ath?.toFixed(2) || '0.00'}\n`;
    csv += `ATL,$${token.atl?.toFixed(2) || '0.00'}\n\n`;

    // Price history section
    if (priceHistory && priceHistory.length > 0) {
      csv += 'Price History\n';
      csv += 'Date,Price\n';
      for (const entry of priceHistory) {
        csv += `${entry.date},$${entry.price.toFixed(2)}\n`;
      }
    }

    return csv;
  },
};

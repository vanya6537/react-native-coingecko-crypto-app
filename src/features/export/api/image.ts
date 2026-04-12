/**
 * Export Feature - Image Export
 */

import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import type { RefObject } from 'react';
import { View } from 'react-native';

export const imageExportAPI = {
  /**
   * Capture and export chart as image
   */
  async exportChartAsImage(viewRef: RefObject<View>): Promise<void> {
    try {
      if (!viewRef.current) {
        throw new Error('View reference not available');
      }

      // Capture view to image
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
      });

      // Generate filename with date
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `crypto_chart_${timestamp}.png`;

      // Share image
      await Share.open({
        url: uri,
        type: 'image/png',
        title: 'Export Chart',
        message: 'Cryptocurrency price chart',
        filename: fileName,
      });
    } catch (error) {
      console.error('Failed to export chart:', error);
      throw error;
    }
  },

  /**
   * Save image to gallery (future implementation)
   */
  async saveChartToGallery(viewRef: RefObject<View>): Promise<void> {
    try {
      if (!viewRef.current) {
        throw new Error('View reference not available');
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
      });

      // TODO: Implement gallery save using react-native-cameraroll or similar
      console.log('Image saved:', uri);
    } catch (error) {
      console.error('Failed to save chart to gallery:', error);
      throw error;
    }
  },
};

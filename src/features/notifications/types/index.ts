/**
 * Notifications Feature - Types
 */

export interface PriceAlert {
  tokenId: string;
  tokenName: string;
  threshold: number; // percentage
  enabled: boolean;
  lastNotifiedPrice?: number;
}

export interface PriceAlertConfig {
  alerts: Map<string, PriceAlert>;
  enabled: boolean;
  globalThreshold: number; // Default threshold percentage
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

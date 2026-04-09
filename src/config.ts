import { Platform } from 'react-native';

interface Config {
  COINGECKO_API_KEY: string;
  COINGECKO_API_URL: string;
  API_TIMEOUT: number;
  DEBUG: boolean;
}

const config: Config = {
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
  COINGECKO_API_URL: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000', 10),
  DEBUG: __DEV__,
};

if (config.DEBUG) {
  console.log('🔧 Config loaded:', {
    COINGECKO_API_URL: config.COINGECKO_API_URL,
    API_TIMEOUT: config.API_TIMEOUT,
    Platform: Platform.OS,
  });
}

export default config;

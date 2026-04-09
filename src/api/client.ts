import axios from 'axios';
import config from '@config';

const client = axios.create({
  baseURL: config.COINGECKO_API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Accept': 'application/json',
  },
});

// Add request interceptor for API key (when available)
client.interceptors.request.use((cfg) => {
  if (config.COINGECKO_API_KEY) {
    cfg.params = cfg.params || {};
    cfg.params.x_cg_pro_api_key = config.COINGECKO_API_KEY;
  }
  return cfg;
});

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit hit, consider upgrading API key');
    }
    return Promise.reject(error);
  }
);

export default client;

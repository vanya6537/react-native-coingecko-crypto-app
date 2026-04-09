import axios from 'axios';

const API_BASE = 'https://api.coingecko.com/api/v3';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export default client;

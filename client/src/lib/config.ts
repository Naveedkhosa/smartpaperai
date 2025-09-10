export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apis.babalrukn.com/api';

// You can also export other API-related configurations
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
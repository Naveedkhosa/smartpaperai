import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from './config';

export class ApiService {

  private token = useAuth().token;

  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        localStorage.removeItem('smartpaper_token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Auth-specific API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    ApiService.post('/user/login', credentials),

  register: (userData: { name: string; email: string; phone: string; password: string }) =>
    ApiService.post('/user/register', userData),

  logout: () => ApiService.post('/user/logout', {}),

  getProfile: () => ApiService.get('/user/profile'),
};



import { API_BASE_URL } from './config';

export class ApiService {
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

// You can create similar helpers for other endpoints
export const classesApi = {
  getAll: () => ApiService.get('/user/classes'),
  create: (classData: any) => ApiService.post('/user/classes', classData),
  // ... other class-related methods
};
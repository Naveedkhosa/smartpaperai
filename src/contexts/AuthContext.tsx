import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  email_verified_at: string | null;
  role: string;
  status: string;
  profile_picture: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  status: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('smartpaper_token');
    const storedUser = localStorage.getItem('smartpaper_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

// In your login function:
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const data = await authApi.login({ email, password });
    
    if (data.status && data.data.token) {
      setUser(data.data.user);
      setToken(data.data.token);
      
      // Store auth data in localStorage
      localStorage.setItem('smartpaper_token', data.data.token);
      localStorage.setItem('smartpaper_user', JSON.stringify(data.data.user));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// In your logout function:
const logout = async () => {
  if (token) {
    try {
      // Call logout API using the authApi service
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }
  
  // Clear local state and storage
  setUser(null);
  setToken(null);
  localStorage.removeItem('smartpaper_token');
  localStorage.removeItem('smartpaper_user');
};
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
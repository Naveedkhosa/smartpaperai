import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();

  // Set theme based on user role
  useEffect(() => {
    if (user) {
      setTheme(user.role === 'admin' ? 'admin' : 'glassmorphism');
      
      // Redirect to appropriate dashboard if on login page
      if (location === '/' || location === '/login') {
        setLocation(`/${user.role}`);
      }
    } else if (!isLoading && location !== '/login') {
      setLocation('/login');
    }
  }, [user, location, setTheme, setLocation, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'admin' ? 'admin-gradient' : 'gradient-bg'}`}>
      {children}
    </div>
  );
}

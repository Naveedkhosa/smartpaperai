import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { GraduationCap } from 'lucide-react';

export default function RoleSelector() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const switchRole = (role: string) => {
    setLocation(`/${role}`);
  };

  const getRoleButtonClass = (role: string) => {
    const isActive = location === `/${role}`;
    return `px-4 py-2 rounded-lg font-medium transition-all ${
      isActive
        ? 'bg-emerald-500 text-white'
        : 'bg-white/20 text-white/70 hover:bg-white/30'
    }`;
  };

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="text-2xl text-emerald-400" size={32} />
            <h1 className="text-xl font-bold text-white">SmartPaper AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                data-testid="button-admin-role"
                onClick={() => switchRole('admin')}
                className={getRoleButtonClass('admin')}
              >
                Admin
              </button>
              <button
                data-testid="button-teacher-role"
                onClick={() => switchRole('teacher')}
                className={getRoleButtonClass('teacher')}
              >
                Teacher
              </button>
              <button
                data-testid="button-student-role"
                onClick={() => switchRole('student')}
                className={getRoleButtonClass('student')}
              >
                Student
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-white/80 text-sm">{user.fullName}</span>
              <button
                data-testid="button-logout"
                onClick={logout}
                className="text-white/60 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

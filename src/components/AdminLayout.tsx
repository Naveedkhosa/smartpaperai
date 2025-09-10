import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleSelector from './RoleSelector';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Book, 
  School, 
  Settings 
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin', active: location === '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users', active: false },
    { icon: Book, label: 'Study Materials', path: '/admin/materials', active: false },
    { icon: School, label: 'Classes & Subjects', path: '/admin/classes', active: false },
    { icon: Settings, label: 'Settings', path: '/admin/settings', active: false },
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-gradient min-h-screen">
      <RoleSelector />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <div className="w-64 admin-sidebar min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Admin Panel</h3>
                <p className="text-slate-400 text-sm">System Control</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setLocation(item.path)}
                  className={`admin-sidebar-item w-full text-left ${
                    item.active ? 'active' : ''
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 admin-scrollbar overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

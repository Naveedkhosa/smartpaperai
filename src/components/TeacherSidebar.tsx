import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Presentation,
  FileText,
  CheckCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Menu,
  X,
  Home,
  BookOpen,
  GraduationCap
} from "lucide-react";

export default function TeacherSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest('.sidebar-container')) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

 const menuItems = [
  { path: "/teacher", label: "Overview", icon: Eye },
  { path: "/teacher/create", label: "Create Paper", icon: FileText },
   { path: "/teacher/papers", label: "Papers", icon: FileText },
  { path: "/teacher/grade", label: "Grade Papers", icon: CheckCircle },
  { path: "/teacher/classes", label: "Classes", icon: Users },
  { path: "/teacher/subjects", label: "Subjects", icon: BookOpen },
  { path: "/teacher/study-materials", label: "Study Materials", icon: BookOpen },
  { path: "/teacher/templates", label: "Templates", icon: Presentation }, // 🔥 New Templates menu
  { path: "/teacher/manage", label: "Manage", icon: Settings },
];


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glassmorphism-strong border border-white/20"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container  fixed left-0 top-0 h-full glassmorphism-strong z-50 transition-all duration-300 
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Toggle Button - Desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block absolute -right-3 top-20 bg-slate-800 rounded-full p-1 border-2 border-emerald-500/30 hover:border-emerald-500 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="text-white" size={16} />
          ) : (
            <ChevronLeft className="text-white" size={16} />
          )}
        </button>

        {/* Sidebar Content */}
     <div className="p-4 h-full flex flex-col overflow-y-auto scrollbar-hide">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8 pt-4">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mr-3">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Teacher Portal</h2>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-white shadow-lg"
                          : "text-slate-200/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Additional Links */}
          {!isCollapsed && (
            <div className="mb-6 pt-4 border-t border-white/20">
              <Link
                to="/"
                className="flex items-center p-3 rounded-lg text-slate-200/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <Home size={20} className="flex-shrink-0" />
                <span className="ml-3 font-medium">Back to Home</span>
              </Link>
             
            </div>
          )}

          {/* User Info & Logout */}
          <div className="mt-auto pt-4 border-t border-white/20">
            {!isCollapsed && (
              <div className="flex items-center mb-4 p-2 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <div className="truncate">
                  <p className="text-white text-sm font-medium truncate">Teacher Account</p>
                  <p className="text-slate-300 text-xs truncate">teacher@example.com</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-slate-200/80 hover:text-white hover:bg-red-500/20 transition-all group"
            >
              <LogOut size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 gradient-bg ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Your existing dashboard content goes here */}
      </div>
    </>
  );
}
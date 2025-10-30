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
  GraduationCap,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { Button } from '@/components/ui/button';

export default function TeacherSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Mock Data for Demonstration ---
  const mockUserName = "Aqeel Abbas";
  const mockUserEmail = "aqeel@teacher.com";
  const mockCredits = 9450; // Increased mock credit to test the "9000+" logic

  // Function to format credits for collapsed view
  const formatCredits = (credits: number, isCollapsed: boolean) => {
    if (!isCollapsed) {
      return credits.toLocaleString();
    }
    // Logic for collapsed view: show 9000+ if > 9000, otherwise show the number
    if (credits > 9000) {
      return "9000+";
    }
    return credits.toString();
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && event.target.closest('.sidebar-container') === null && event.target.closest('.mobile-menu-button') === null) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  const menuItems = [
    { path: "/teacher", label: "Overview", icon: Home },
    { path: "/teacher/create", label: "Create Paper", icon: FileText },
    { path: "/teacher/papers", label: "Papers", icon: FileText },
    { path: "/teacher/grade", label: "Assessment Paper", icon: CheckCircle },
    { path: "/teacher/students", label: "Students", icon: Users },
    { path: "/teacher/classes", label: "Classes", icon: GraduationCap },
    { path: "/teacher/subjects", label: "Subjects", icon: BookOpen },
    { path: "/teacher/study-materials", label: "Study Materials", icon: BookOpen },
    { path: "/teacher/templates", label: "Templates", icon: Presentation },
    { path: "/teacher/manage", label: "Manage", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const handleBuyMore = () => {
    navigate("/teacher/manage/billing");
  };

  return (
    <>
      {/* Scrollbar Customization Style */}
      <style global jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px; /* Thin scrollbar width */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2); /* Subtle white thumb */
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* Transparent track */
        }
      `}</style>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-menu-button lg:hidden fixed top-4 left-4 z-[99] p-2 rounded-lg glassmorphism-strong text-white border border-white/20 shadow-xl"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div
        className={`sidebar-container fixed left-0 top-0 h-full glassmorphism-strong !rounded-[0px] z-50 transition-all duration-300 shadow-2xl
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Toggle Button - Desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block absolute -right-4 top-16 bg-slate-900 rounded-full p-2 border-2 border-emerald-500/30 hover:border-emerald-500 transition-colors z-10 shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="text-white" size={16} />
          ) : (
            <ChevronLeft className="text-white" size={16} />
          )}
        </button>

        {/* Sidebar Content Wrapper */}
        <div className="p-4 h-full flex flex-col">
          
          {/* Logo/Brand Section */}
          <div className="flex items-center justify-center mb-6 pt-2 pb-4 border-b border-white/10">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mr-3">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wider">Teacher Portal</h2>
              </div>
            )}
          </div>

          {/* Navigation Items (Scrollable Area) */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Use startsWith to allow nested active paths (e.g., /teacher/subjects/create)
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-emerald-500/30 text-white shadow-inner-lg border border-emerald-500/50"
                          : "text-slate-200/80 hover:text-white hover:bg-white/10"
                      } ${isCollapsed ? 'justify-center' : ''}`}
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

          {/* --- BOTTOM SECTION (Fixed) --- */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            
            {/* User Info Card */}
            {!isCollapsed && (
              <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10 shadow-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-sm font-bold">{mockUserName.charAt(0)}</span>
                </div>
                <div className="truncate">
                  <p className="text-white text-sm font-semibold truncate">{mockUserName}</p>
                  <p className="text-slate-300 text-xs truncate">{mockUserEmail}</p>
                </div>
              </div>
            )}

            {/* Credit/Balance Section and Buy More Button */}
            <div className={`p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 shadow-lg ${isCollapsed ? 'py-2 flex justify-center' : ''}`}>
              {isCollapsed ? (
                // Collapsed View: Show only Icon and minimized credit text, centered vertically
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <DollarSign size={18} className="text-yellow-400 flex-shrink-0 mb-0.5" />
                  <span className="text-xs font-bold text-emerald-400">
                    {formatCredits(mockCredits, true)}
                  </span>
                </div>
              ) : (
                // Expanded View: Show Credits and Buy More button
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <DollarSign size={20} className="text-yellow-400 mr-2 flex-shrink-0" />
                      <span className="text-yellow-300 text-sm font-medium">Credits:</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCredits(mockCredits, false)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleBuyMore}
                    className="w-full text-white font-semibold transition-all h-9 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    Buy More
                  </Button>
                </>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center w-full p-3 rounded-xl transition-all text-slate-300 hover:bg-red-500/20 hover:text-red-400 group border border-transparent hover:border-red-500/30 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={20} className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <span className="font-medium">Logout</span>
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

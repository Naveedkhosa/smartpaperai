// components/TeacherSidebar.js
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Presentation,
  FileText,
  CheckCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function TeacherSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: "/teacher", label: "Overview", icon: Eye },
    { path: "/teacher/create", label: "Create Paper", icon: FileText },
    { path: "/teacher/grade", label: "Grade", icon: CheckCircle },
    { path: "/teacher/manage", label: "Manage", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    // Redirect to login page or home after logout
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full glassmorphism-strong z-50 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-slate-800 rounded-full p-1 border-2 border-emerald-500/30"
        >
          {isCollapsed ? (
            <ChevronRight className="text-white" size={16} />
          ) : (
            <ChevronLeft className="text-white" size={16} />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="p-4 h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            {isCollapsed ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500"></div>
            ) : (
              <h2 className="text-xl font-bold text-red-500">Teacher Portal</h2>
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
                          ? "bg-emerald-500/30 text-emerald-200"
                          : "text-slate-200/80 hover:text-slate-100 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={20} />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-slate-200/80 hover:text-slate-100 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={20} />
              {!isCollapsed && (
                <span className="ml-3 font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Your existing dashboard content goes here */}
      </div>
    </>
  );
}
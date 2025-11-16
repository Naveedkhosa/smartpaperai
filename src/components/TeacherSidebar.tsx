import { useState, useEffect, useRef } from "react"; // Imported useRef for cleanup
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
  Coins,
  ShoppingCart,
  Loader2, // Imported for the spinning loader animation
} from "lucide-react";
import { Button } from '@/components/ui/button';

// Helper component for the counting animation
const useCreditCounter = (targetValue, duration = 1500) => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Reset count when targetValue changes (important for re-running)
    setCount(0); 
    startTimeRef.current = performance.now();
    
    const animate = (currentTime) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const newCount = Math.floor(progress * targetValue);

      setCount(newCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start the animation
    const animationFrame = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetValue, duration]);

  return count;
};

export default function TeacherSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start as true to show initial load
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Mock Data for Demonstration ---
  const mockUserName = "Aqeel Abbas";
  const mockUserEmail = "aqeel@teacher.com";
  // NOTE: In a real app, this would come from an API call
  const mockCredits = 9450; 
  
  // Use the custom hook for counting animation
  const countedCredits = useCreditCounter(mockCredits, 1500); // 1.5 seconds duration

  // The number shown in the UI will be the counted number
  const displayedCredits = isLoading ? 0 : countedCredits;

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
  
  // --- Loading/Recounting Logic (Every 10 seconds) ---
  useEffect(() => {
    // Initial load/count
    const initialTimeout = setTimeout(() => {
        setIsLoading(false);
    }, 1000); // Show spinner for 1 second initially, then start counting

    // Recount/Refresh loop (every 10 seconds)
    const interval = setInterval(() => {
        // 1. Start loading/spinner
        setIsLoading(true);

        // 2. Stop loading after a brief moment (e.g., 1 second)
        // This brief stop will trigger the 'useCreditCounter' to restart from 0
        const timeout = setTimeout(() => {
            setIsLoading(false);
            // In a real app, you'd fetch the latest credits here before setting isLoading(false)
        }, 2000); 

        // Cleanup the inner timeout
        return () => clearTimeout(timeout);
        
    }, 10000); // 10000 ms = 10 seconds

    // Cleanup for the initial timeout and the interval
    return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
    };
  }, []); // Empty dependency array means it runs only once on mount

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
    navigate("/teacher/credits");
  };

  return (
    <>
      {/* Scrollbar & Shiny Animation Customization Style */}
      <style global jsx>{`
        /* Scrollbar styles (unchanged) */
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

        /* Shiny Glass Animation (Task 2) */
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-20deg);
          }
          100% {
            transform: translateX(200%) skewX(-20deg);
          }
        }
        
        .shiny-glass {
          position: relative;
          overflow: hidden; /* Important for containing the shine effect */
        }
        
        .shiny-glass::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 50%; /* Width of the shine */
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-100%) skewX(-20deg); /* Initial position off-left */
          animation: shine 5s infinite; /* Apply the animation */
          pointer-events: none; /* Make sure it doesn't block clicks */
        }

        /* Loader Animation */
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
            animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Mobile Menu Button ... (unchanged) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-menu-button lg:hidden fixed top-4 left-4 z-[99] p-2 rounded-lg glassmorphism-strong text-white border border-white/20 shadow-xl"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile ... (unchanged) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Container ... (unchanged) */}
      <div
        className={`sidebar-container fixed left-0 top-0 h-full glassmorphism-strong !rounded-[0px] z-50 transition-all duration-300 shadow-2xl
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Toggle Button - Desktop only ... (unchanged) */}
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

        {/* Sidebar Content Wrapper ... (unchanged) */}
        <div className="p-4 h-full flex flex-col">

          {/* Logo/Brand Section ... (unchanged) */}
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

          {/* Navigation Items (Scrollable Area) ... (unchanged) */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
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

            {/* User Info Card ... (unchanged) */}
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

         {/* Credit/Balance Section and Buy More Button (UPDATED SECTION) */}
            <div className={`p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 shadow-lg shiny-glass ${isCollapsed ? 'py-2 flex justify-center' : ''}`}>
              {isCollapsed ? (
                // Collapsed View: Show only Icon and minimized credit text
                <div className="flex flex-col items-center justify-center h-full w-full">
                  {isLoading ? (
                    <Loader2 size={18} className="text-red-400 flex-shrink-0 mb-0.5 animate-spin-custom" /> // Loading circle on icon space
                  ) : (
                    <Coins size={18} className="text-yellow-400 flex-shrink-0 mb-0.5" />
                  )}
                  <span className="text-xs font-bold text-emerald-400">
                    {/* The collapsed view already relies on the displayedCredits */}
                    {formatCredits(displayedCredits, true)}
                  </span>
                </div>
              ) : (
                // Expanded View: Show Credits and Buy More button (MODIFIED)
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {/* Icon: Show Coin unless loading, then show spinner */}
                      
                        
                      
                        <Coins size={20} className="text-yellow-400 mr-2 flex-shrink-0" />
                     
                      <span className="text-yellow-300 text-sm font-medium">Credits:</span>
                    </div>
                    
                    {/* Number Display: Conditionally show spinner OR the counting number */}
                    <span className="text-xl font-bold text-emerald-400 h-6 flex items-center">
                      {isLoading ? (
                        <Loader2 size={20} className="text-red-400 animate-spin-custom" /> // **Loading circle on number space**
                      ) : (
                        // Display the counting credits
                        formatCredits(displayedCredits, false)
                      )}
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

            {/* Logout Button ... (unchanged) */}
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

      {/* Main Content Area ... (unchanged) */}
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
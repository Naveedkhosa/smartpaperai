import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Gauge,
  Users,
  UserCog,
  UserCircle,
  Shield,
  LineChart,
  BadgeCheck,
  BookOpen,
  FileText,
  School,
  Layers,
  ClipboardList,
  Grid,
  Settings,
  Activity as ActivityIcon,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: Gauge },
  { label: "Manage Users", href: "/super-admin/users", icon: Users },
  { label: "Profile", href: "/super-admin/profile", icon: UserCircle },
  { label: "Roles & Permissions", href: "/super-admin/roles", icon: Shield },
  { label: "Reports", href: "/super-admin/reports", icon: LineChart },
  { label: "Subscriptions", href: "/super-admin/subscriptions", icon: BadgeCheck },
  { label: "Study Materials", href: "/super-admin/study-materials", icon: BookOpen },
  { label: "Templates", href: "/super-admin/templates", icon: FileText },
  { label: "Classes", href: "/super-admin/classes", icon: School },
  { label: "Subjects", href: "/super-admin/subjects", icon: Layers },
  { label: "Plans", href: "/super-admin/plans", icon: ClipboardList },
  { label: "CMS", href: "/super-admin/cms", icon: Grid },
  { label: "Settings", href: "/super-admin/settings", icon: Settings },
  { label: "Activity Logs", href: "/super-admin/activity-logs", icon: ActivityIcon },
];

export default function SuperAdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-68 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur shadow-sm hidden lg:flex flex-col">
      <div className="px-4 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            SA
          </div>
          <span>Super Admin</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Unified SaaS UI</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        UI visibility respects role (Super Admin vs Admin)
      </div>
    </aside>
  );
}


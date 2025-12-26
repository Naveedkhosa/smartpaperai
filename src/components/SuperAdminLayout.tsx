import React from "react";
import SuperAdminSidebar from "./SuperAdminSidebar";
import { Bell, Search } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen glass-bg text-slate-900 flex">
      <SuperAdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 glass-card px-4 py-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-emerald-600">Super Admin</div>
              <div className="text-sm text-slate-500">AI Assessment</div>
            </div>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full h-10 rounded-lg border border-slate-200/60 bg-white/60 backdrop-blur pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300"
                  placeholder="Search"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <button className="relative h-10 w-10 rounded-lg border border-slate-200 bg-white/70 backdrop-blur flex items-center justify-center hover:border-emerald-300">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
              </button>
              <div className="h-10 w-10 rounded-full bg-slate-200/80 backdrop-blur" />
              <span className="font-semibold">super.admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">{children}</main>
      </div>
    </div>
  );
}


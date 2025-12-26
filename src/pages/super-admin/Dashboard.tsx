import React from "react";
import {
  UserCheck,
  User,
  Shield,
  BadgeCheck,
  BookOpen,
  Activity,
  ShieldPlus,
  UserPlus,
  School,
  Book,
  FileText,
  FolderPlus,
  LineChart,
  BarChart3,
} from "lucide-react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const kpis = [
  { label: "Users (Teachers)", value: "182", icon: UserCheck, badge: "bg-blue-50 text-blue-600" },
  { label: "Students", value: "4,320", icon: User, badge: "bg-emerald-50 text-emerald-600" },
  { label: "Admins", value: "12", icon: Shield, badge: "bg-indigo-50 text-indigo-600" },
  { label: "Active Subscriptions", value: "156", icon: BadgeCheck, badge: "bg-sky-50 text-sky-600" },
  { label: "Study Materials", value: "1,245", icon: BookOpen, badge: "bg-amber-50 text-amber-600" },
  { label: "Today's Activity", value: "234", icon: Activity, badge: "bg-fuchsia-50 text-fuchsia-600" },
];

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Unified light-theme admin overview</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map(({ label, value, icon: Icon, badge }) => (
            <div
              key={label}
              className="glass-card p-5 flex items-center gap-3 min-h-[110px]"
            >
              <div className={`p-3 rounded-xl ${badge} bg-opacity-80`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="space-y-4 xl:col-span-2">
            <div className="glass-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">System Usage</h2>
                    <p className="text-sm text-gray-500">Line chart</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  {["Daily", "Weekly", "Monthly"].map((range) => (
                    <button
                      key={range}
                      className="rounded-full border border-gray-200 px-3 py-1 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-52 rounded-lg border border-dashed border-white/40 bg-white/20 backdrop-blur flex items-center justify-center text-gray-300 text-sm">
                Line Chart placeholder
              </div>
            </div>

            <div className="glass-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Subscription Growth</h2>
                    <p className="text-sm text-gray-500">Bar chart</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+8% MoM</span>
              </div>
              <div className="h-52 rounded-lg border border-dashed border-white/40 bg-white/20 backdrop-blur flex items-center justify-center text-gray-300 text-sm">
                Bar Chart placeholder
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Admin Jane created class “Grade 10 Science”.",
                  "Teacher Omar uploaded “Physics - Waves”.",
                  "Subscription renewed for “Green Valley School”.",
                  "New admin added for “North Campus”.",
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldPlus className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Add Admin", icon: ShieldPlus },
                  { label: "Add Teacher", icon: UserPlus },
                  { label: "Add Class", icon: School },
                  { label: "Add Subject", icon: Book },
                  { label: "Add Template", icon: FileText },
                  { label: "Add Study Material", icon: FolderPlus },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="w-full h-11 rounded-[10px] border border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:text-blue-600 shadow-[0_3px_10px_rgba(0,0,0,0.06)] flex items-center justify-center gap-2 text-sm font-semibold transition"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


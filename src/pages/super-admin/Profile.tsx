import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { User, Lock, Bell, ShieldCheck } from "lucide-react";

export default function SuperAdminProfile() {
  return (
    <SuperAdminLayout>
      <div className="max-w-5xl mx-auto px-0 py-0 space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-500">Glassmorphic, clean, easy-to-scan settings.</p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="glass-pill p-2 text-slate-700"><User className="h-4 w-4" /></div>
                <h2 className="text-lg font-semibold text-slate-900">Profile Info</h2>
              </div>
              <button className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.25)]">
                Update
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-white/60 backdrop-blur border border-white/50" />
              <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">Upload Photo</button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <div className="text-slate-500">Name</div>
                <div className="font-semibold text-slate-900">Super Admin</div>
              </div>
              <div>
                <div className="text-slate-500">Email</div>
                <div className="font-semibold text-slate-900">super.admin@smartpaper.ai</div>
              </div>
              <div>
                <div className="text-slate-500">Phone</div>
                <div className="font-semibold text-slate-900">+1 (555) 123-4567</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><Lock className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <button className="text-emerald-600 hover:text-emerald-500">Enable</button>
              </div>
              <div className="flex items-center justify-between">
                <span>Change Password</span>
                <button className="text-emerald-600 hover:text-emerald-500">Update</button>
              </div>
              <div>
                <div className="text-slate-500">Allowed IPs (optional)</div>
                <p className="text-slate-500 text-sm">Add IPs to restrict admin access.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="glass-pill p-2 text-slate-700"><Bell className="h-4 w-4" /></div>
            <h2 className="text-lg font-semibold text-slate-900">Notification Settings</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4" /> System alerts
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4" /> Subscription updates
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Product news
            </label>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


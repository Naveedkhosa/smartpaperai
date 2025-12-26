import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const settings = [
  "System Name",
  "Branding (logo, colors)",
  "Email SMTP",
  "Payment Gateway Keys",
  "AI Model Configuration",
  "Maintenance Mode",
  "Backups",
  "Security Settings",
];

export default function Settings() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500">Core configuration and security controls.</p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          {settings.map((s) => (
            <div key={s} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow space-y-2">
              <div className="font-semibold text-white">{s}</div>
              <div className="text-sm text-white/60">Configure and save changes.</div>
              <button className="rounded-lg bg-emerald-400 text-slate-950 px-3 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
                Edit
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3 text-sm text-white/70">
          <h3 className="text-white font-semibold">Maintenance & Backups</h3>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
              Toggle Maintenance Mode
            </button>
            <button className="rounded-lg border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:border-white/40">
              Run Backup
            </button>
            <button className="rounded-lg border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:border-white/40">
              Restore
            </button>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


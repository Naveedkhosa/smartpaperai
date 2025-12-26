import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const filters = ["Date Range", "Activity Type", "User Type", "Role"];
const columns = ["User", "Activity Type", "Action", "IP Address", "Timestamp"];

export default function ActivityLogs() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-slate-500">Audit user actions with filters and purge options.</p>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex flex-wrap gap-3 text-sm text-white/70">
            {filters.map((f) => (
              <div key={f} className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2">
                {f}
              </div>
            ))}
            <button className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
              Apply Filters
            </button>
            <button className="rounded-lg border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:border-white/40">
              Purge Logs
            </button>
          </div>
        </section>

        <section className="overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="text-slate-500 bg-slate-100">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-left font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-800">
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3">Jane Admin</td>
                <td className="px-4 py-3">User Management</td>
                <td className="px-4 py-3">Created Teacher</td>
                <td className="px-4 py-3">192.168.1.10</td>
                <td className="px-4 py-3">2025-12-11 09:21</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const columns = ["Plan", "Limits", "Features", "Price", "Actions"];

export default function Plans() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Plan Management</h1>
          <p className="text-slate-500">Manage available plans, features, and limits.</p>
        </header>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Plans</h2>
            <button className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
              Add Plan
            </button>
          </div>
          <div className="overflow-auto rounded-xl border border-white/10 bg-slate-900/60">
            <table className="min-w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-3 text-left font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-white/80">
                <tr className="border-t border-white/5">
                  <td className="px-4 py-3">Starter</td>
                  <td className="px-4 py-3">Papers/day, storage, AI usage</td>
                  <td className="px-4 py-3">Builder, grader, templates</td>
                  <td className="px-4 py-3">$19</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="text-emerald-300 hover:text-emerald-200">Edit</button>
                    <button className="text-white/70 hover:text-white">Features</button>
                    <button className="text-white/50 hover:text-white/70">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2 text-sm text-white/70">
          <h3 className="text-white font-semibold">Feature Management</h3>
          <p>Configure per-plan limits: papers/day, storage, AI usage, collaboration, exports.</p>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


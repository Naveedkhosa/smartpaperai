import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { School, BookOpen, Users } from "lucide-react";

const columns = ["Class Name", "Students Count", "Assigned Subjects", "Actions"];

export default function Classes() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Classes</h1>
          <p className="text-slate-500">Manage classes, subjects, and teacher assignments.</p>
        </header>

        <section className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><School className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Classes List</h2>
            </div>
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-400">
              Create Class
            </button>
          </div>
          <div className="overflow-auto rounded-xl border border-white/40 bg-white/30 backdrop-blur">
            <table className="min-w-full text-sm">
              <thead className="text-slate-500 bg-white/40 border-b border-white/50">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-3 text-left font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-800">
                <tr className="hover:bg-white/40">
                  <td className="px-4 py-3">Grade 10</td>
                  <td className="px-4 py-3 flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> 120</td>
                  <td className="px-4 py-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-400" /> Physics, Math, English</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="text-emerald-600 hover:text-emerald-500">Edit</button>
                    <button className="text-slate-600 hover:text-slate-800">Assign Subjects</button>
                    <button className="text-slate-400 hover:text-slate-600">Assign Teacher</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-5 space-y-3 text-sm text-slate-700">
          <h3 className="text-slate-900 font-semibold">Create Class</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Class Name</label>
              <input className="w-full rounded-lg bg-white/60 border border-white/50 backdrop-blur px-3 py-2" placeholder="e.g., Grade 10" />
              <label>Description</label>
              <textarea rows={3} className="w-full rounded-lg bg-white/60 border border-white/50 backdrop-blur px-3 py-2" placeholder="Short description" />
            </div>
            <div className="space-y-2">
              <label>Add Subjects</label>
              <div className="h-24 rounded-lg bg-white/40 border border-white/40 backdrop-blur px-3 py-2 text-slate-500">Subject chips placeholder</div>
              <label>Assign to Teacher</label>
              <div className="rounded-lg bg-white/40 border border-white/40 backdrop-blur px-3 py-2 text-slate-500">Teacher select</div>
            </div>
          </div>
          <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-400">
            Save Class
          </button>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


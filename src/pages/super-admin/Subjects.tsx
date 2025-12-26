import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { BookOpen, School, User, Folder } from "lucide-react";

const columns = ["Subject Name", "Class", "Teacher", "Material Count", "Actions"];

export default function Subjects() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
          <p className="text-slate-500">Manage subjects and assignments.</p>
        </header>

        <section className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><BookOpen className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Subjects List</h2>
            </div>
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-400">
              Add Subject
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
                  <td className="px-4 py-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-400" /> Physics</td>
                  <td className="px-4 py-3 flex items-center gap-2"><School className="h-4 w-4 text-slate-400" /> Grade 10</td>
                  <td className="px-4 py-3 flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> Omar Khalid</td>
                  <td className="px-4 py-3 flex items-center gap-2"><Folder className="h-4 w-4 text-slate-400" /> 42</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="text-emerald-600 hover:text-emerald-500">Edit</button>
                    <button className="text-slate-600 hover:text-slate-800">Assign</button>
                    <button className="text-slate-400 hover:text-slate-600">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { FileText, ClipboardList, Brain, UserCheck, Download } from "lucide-react";

const reportTypes = [
  { label: "Papers Generated", icon: FileText },
  { label: "Submissions", icon: ClipboardList },
  { label: "AI Grading", icon: Brain },
  { label: "Most Active Teachers", icon: UserCheck },
];

const exportOptions = ["PDF", "CSV", "Excel"];

export default function Reports() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Glass cards for usage and analytics exports.</p>
        </header>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map(({ label, icon: Icon }) => (
            <div key={label} className="glass-card p-4 flex items-center gap-3">
              <div className="glass-pill p-2 text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm text-slate-800">{label}</div>
            </div>
          ))}
          <div className="glass-card p-4 space-y-2">
            <div className="text-sm font-semibold text-slate-900">Exports</div>
            <div className="flex flex-wrap gap-2">
              {exportOptions.map((opt) => (
                <button
                  key={opt}
                  className="rounded-lg border border-white/40 bg-white/50 backdrop-blur px-3 py-2 text-sm text-slate-800 hover:border-emerald-300 inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-slate-900 font-semibold">Monthly System Load</h3>
            <div className="h-52 rounded-lg border border-dashed border-white/50 bg-white/20 backdrop-blur flex items-center justify-center text-gray-300 text-sm">
              Chart placeholder
            </div>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-slate-900 font-semibold">Subject-wise Usage</h3>
            <div className="h-52 rounded-lg border border-dashed border-white/50 bg-white/20 backdrop-blur flex items-center justify-center text-gray-300 text-sm">
              Chart placeholder
            </div>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


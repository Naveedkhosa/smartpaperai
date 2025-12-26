import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const columns = ["Title", "Category", "Subject", "Class", "Uploaded By", "OCR Status", "Actions"];

export default function StudyMaterials() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Study Material Database</h1>
          <p className="text-slate-500">Categories, OCR, and uploads.</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Material List</h2>
            <button className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
              Upload Material
            </button>
          </div>
          <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50">
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
                  <td className="px-4 py-3">Physics - Waves</td>
                  <td className="px-4 py-3">Key Book</td>
                  <td className="px-4 py-3">Physics</td>
                  <td className="px-4 py-3">Grade 10</td>
                  <td className="px-4 py-3">Teacher Omar</td>
                  <td className="px-4 py-3 text-emerald-300">Complete</td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="text-emerald-300 hover:text-emerald-200">View</button>
                    <button className="text-white/70 hover:text-white">Update</button>
                    <button className="text-white/50 hover:text-white/70">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-white font-semibold">Upload Material</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="space-y-2">
              <label>Upload File</label>
              <div className="h-24 rounded-lg border border-dashed border-emerald-300/50 bg-emerald-50 flex items-center justify-center text-emerald-600">
                Drop file or browse
              </div>
            </div>
            <div className="space-y-2">
              <label>Assign Class/Subject</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">Select class • subject</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Enable OCR
              </label>
            </div>
          </div>
          <div className="text-sm text-slate-600">Preview extracted text will appear after OCR completes.</div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


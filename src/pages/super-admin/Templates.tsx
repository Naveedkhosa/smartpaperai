import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const categories = ["Paper Templates", "Email Templates", "Assessment Templates"];

export default function Templates() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500">Manage template categories and edit content.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="font-semibold text-slate-900">{c}</div>
              <div className="text-sm text-slate-600">Add, duplicate, or delete templates.</div>
              <button className="rounded-lg bg-emerald-500 text-white px-3 py-2 text-sm font-semibold shadow hover:bg-emerald-400">
                Manage
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-slate-900 font-semibold">Template Editor</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="space-y-2">
              <label>Title</label>
              <input className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2" placeholder="Template title" />
              <label>Category</label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-600">Select category</div>
            </div>
            <div className="space-y-2">
              <label>Variables Support</label>
              <p className="text-slate-600">Use placeholders like {"{student_name}"} {"{class_name}"} {"{subject}"} etc.</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <label>Content</label>
            <div className="h-48 rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-500">
              Rich text editor placeholder
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-400">Save</button>
              <button className="rounded-lg border border-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-700">Duplicate</button>
              <button className="rounded-lg border border-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-700">Delete</button>
            </div>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


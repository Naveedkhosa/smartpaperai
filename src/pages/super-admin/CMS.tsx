import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";

const sections = [
  "Home Page Content",
  "Pricing Page Content",
  "Features Page",
  "FAQs",
  "Terms & Conditions",
  "Privacy Policy",
];

export default function CMS() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">CMS</h1>
          <p className="text-slate-500">Manage site content and media library.</p>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <div key={s} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow space-y-2">
              <div className="font-semibold text-white">{s}</div>
              <div className="text-sm text-white/60">Drag-and-drop blocks, media attachments, routing.</div>
              <button className="rounded-lg bg-emerald-400 text-slate-950 px-3 py-2 text-sm font-semibold shadow hover:bg-emerald-300">
                Edit
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3 text-sm text-white/70">
          <h3 className="text-white font-semibold">Content Editor</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Title</label>
              <input className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white" placeholder="Page title" />
              <label>Page Routing</label>
              <input className="w-full rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white" placeholder="/path" />
            </div>
            <div className="space-y-2">
              <label>Media Library</label>
              <div className="h-24 rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-white/60">Upload / pick media</div>
            </div>
          </div>
          <div className="space-y-2">
            <label>Content Blocks</label>
            <div className="h-48 rounded-lg bg-slate-900/60 border border-white/10 p-3 text-white/60">Drag-and-drop editor placeholder</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-300">Save</button>
            <button className="rounded-lg border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:border-white/40">Publish</button>
            <button className="rounded-lg border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:border-white/40">Delete</button>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


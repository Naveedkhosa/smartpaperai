import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { Shield, Users, ListChecks, LayoutGrid } from "lucide-react";

const roles = [
  { name: "Super Admin", users: 1, permissions: "All" },
  { name: "Admin", users: 5, permissions: "Most (no delete admins/roles)" },
  { name: "Teacher", users: 180, permissions: "Teaching scope" },
];

const permissionTree = [
  "User Management",
  "Study Materials",
  "Reports",
  "Subscriptions",
  "CMS",
  "System Settings",
  "Activity Logs",
];

export default function RolesPermissions() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500">Glassmorphic, minimal, easy to use.</p>
        </header>

        <section className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><Shield className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
            </div>
            <button className="rounded-lg bg-[#2563eb] text-white px-4 py-2 text-sm font-semibold shadow hover:bg-[#1d4ed8]">
              Add Role
            </button>
          </div>
          <div className="overflow-auto rounded-[12px] border border-white/40 bg-white/30 backdrop-blur">
            <table className="min-w-full text-sm">
              <thead className="bg-white/40 text-slate-500 border-b border-white/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Role Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Assigned Users</th>
                  <th className="px-4 py-3 text-left font-semibold">Permission Count</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {roles.map((role) => (
                  <tr key={role.name} className="hover:bg-white/40">
                    <td className="px-4 py-3">{role.name}</td>
                    <td className="px-4 py-3 flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> {role.users}</td>
                    <td className="px-4 py-3">{role.permissions}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button className="text-emerald-600 hover:text-emerald-500">Edit</button>
                      <button className="text-slate-600 hover:text-slate-800">Assign</button>
                      <button className="text-slate-400 hover:text-slate-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><LayoutGrid className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Permissions Editor</h2>
            </div>
            <div className="text-slate-500 text-sm">View • Add • Edit • Delete • Manage</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {permissionTree.map((p) => (
              <div key={p} className="glass-compact p-4 space-y-2">
                <div className="text-slate-900 font-semibold">{p}</div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                  {["View", "Add", "Edit", "Delete", "Manage"].map((perm) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" defaultChecked={perm !== "Delete"} />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


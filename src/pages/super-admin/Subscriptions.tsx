import React from "react";
import SuperAdminLayout from "../../components/SuperAdminLayout";
import { BadgeCheck, Users } from "lucide-react";

const plans = [
  { name: "Starter", price: "$19", billing: "Monthly", activeUsers: 42 },
  { name: "Pro", price: "$49", billing: "Monthly", activeUsers: 96 },
  { name: "Institution", price: "Custom", billing: "Yearly", activeUsers: 18 },
];

export default function Subscriptions() {
  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-slate-500">Glass, clean, Stripe-like billing UI.</p>
        </header>

        <section className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="glass-pill p-2 text-slate-700"><BadgeCheck className="h-4 w-4" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Plan Overview</h2>
            </div>
            <div className="space-x-2 text-sm">
              <button className="rounded-lg border border-white/40 bg-white/50 backdrop-blur px-3 py-2 text-slate-700 hover:border-emerald-300">
                Monthly
              </button>
              <button className="rounded-lg border border-white/40 bg-white/50 backdrop-blur px-3 py-2 text-slate-700 hover:border-emerald-300">
                Yearly
              </button>
              <button className="rounded-lg bg-[#2563eb] text-white px-4 py-2 font-semibold shadow hover:bg-[#1d4ed8]">
                Add Plan
              </button>
            </div>
          </div>
          <div className="overflow-auto rounded-[12px] border border-white/40 bg-white/30 backdrop-blur">
            <table className="min-w-full text-sm">
              <thead className="bg-white/40 text-slate-500 border-b border-white/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Plan Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Billing</th>
                  <th className="px-4 py-3 text-left font-semibold">Active Users</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {plans.map((plan) => (
                  <tr key={plan.name} className="hover:bg-white/40">
                    <td className="px-4 py-3">{plan.name}</td>
                    <td className="px-4 py-3">{plan.price}</td>
                    <td className="px-4 py-3">{plan.billing}</td>
                    <td className="px-4 py-3 flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> {plan.activeUsers}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button className="text-emerald-600 hover:text-emerald-500">Edit</button>
                      <button className="text-slate-600 hover:text-slate-800">Change</button>
                      <button className="text-slate-400 hover:text-slate-600">Renew</button>
                      <button className="text-slate-400 hover:text-slate-600">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card p-5 space-y-3">
          <h3 className="text-slate-900 font-semibold">Add / Edit Plan</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="space-y-2">
              <label>Features</label>
              <div className="rounded-lg border border-white/40 bg-white/40 backdrop-blur h-24 p-3 text-slate-500">
                List features here
              </div>
            </div>
            <div className="space-y-2">
              <label>Limits / Max Usage Caps</label>
              <div className="rounded-lg border border-white/40 bg-white/40 backdrop-blur h-24 p-3 text-slate-500">
                Papers/day, storage, AI usage
              </div>
            </div>
            <div className="space-y-2">
              <label>Pricing</label>
              <input className="w-full rounded-lg border border-white/50 bg-white/60 backdrop-blur px-3 py-2" placeholder="$49" />
            </div>
            <div className="space-y-2">
              <label>Assigned Users</label>
              <div className="rounded-lg border border-white/40 bg-white/40 backdrop-blur h-24 p-3 text-slate-500">
                Teacher/Admin mapping
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-emerald-400">
              Save Plan
            </button>
            <button className="rounded-lg border border-white/50 text-slate-700 px-4 py-2 text-sm font-semibold hover:border-emerald-300">
              Cancel
            </button>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}


import React from "react";
import DefaultLayout from "../components/DefaultLayout";
import { ShieldCheck, Info, Scale, Lock } from "lucide-react";

const highlights = [
  { icon: ShieldCheck, title: "Data Security", desc: "Enterprise-grade encryption and RBAC." },
  { icon: Scale, title: "Fair Billing", desc: "Transparent pricing; no hidden fees." },
  { icon: Lock, title: "24/7 Support", desc: "Critical support for exams and grading windows." },
  { icon: Info, title: "Compliance", desc: "Aligned with common edu and privacy standards." },
];

const termsSections = [
  { title: "Acceptance of Terms", desc: "By using SmartPaper AI, you agree to these terms and any future updates with notice." },
  { title: "Account & Access", desc: "You are responsible for safeguarding credentials and assigning correct roles to staff." },
  { title: "Content Ownership", desc: "You own the papers, questions, and grading data you create. We process it to deliver the service." },
  { title: "Prohibited Activities", desc: "No unauthorized sharing of assessment content, misuse of AI outputs, or attempts to breach security." },
  { title: "Subscriptions & Billing", desc: "Fees are billed per plan; renew automatically unless cancelled. Taxes may apply." },
  { title: "Service Changes", desc: "Features may evolve; material changes will be communicated in advance when possible." },
  { title: "Termination", desc: "You may cancel anytime. We may suspend for abuse, fraud, or security risks." },
  { title: "Liability", desc: "Service is provided as-is. We limit liability to the extent permitted by law." },
  { title: "Governing Law", desc: "Disputes are governed by the applicable law of our operating jurisdiction unless otherwise required." },
];

export default function Terms() {
  return (
    <DefaultLayout showSectionLinks backgroundClass="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-4 py-14 space-y-10">
        <section className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Legal Agreement
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Terms & <span className="text-emerald-300">Conditions</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            The rules for using SmartPaper AI — please review before continuing.
          </p>
          <p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 shadow-lg">
              <div className="h-10 w-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-white">{title}</div>
              <div className="text-sm text-white/60">{desc}</div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          {termsSections.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-white/70 text-sm">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Questions about these terms?</h3>
          </div>
          <p className="text-white/70">
            Email legal@smartpaper.ai or support@smartpaper.ai. We aim to respond within 48 hours on business days.
          </p>
        </section>
      </main>
    </DefaultLayout>
  );
}


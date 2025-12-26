import React from "react";
import DefaultLayout from "../components/DefaultLayout";
import { ShieldCheck, Lock, FileSearch, Bell, CheckCircle } from "lucide-react";

const pillars = [
  { icon: ShieldCheck, title: "GDPR Ready", desc: "Aligned with major data protection standards." },
  { icon: Lock, title: "Encrypted Data", desc: "Encryption in transit with TLS and at rest." },
  { icon: FileSearch, title: "Transparent Logs", desc: "Access and activity logs for accountability." },
  { icon: Bell, title: "Proactive Alerts", desc: "Security alerts for unusual activity on accounts." },
];

const sections = [
  {
    title: "Information We Collect",
    points: [
      "Account data (name, email, role) for authentication.",
      "Usage data (actions, device info) to improve reliability.",
      "Content you create (papers, questions, grades) to provide the service.",
    ],
  },
  {
    title: "How We Use Information",
    points: [
      "Operate and secure your sessions and content.",
      "Generate AI-assisted papers and grading outputs you request.",
      "Improve performance, detect abuse, and support customers.",
    ],
  },
  {
    title: "Sharing & Disclosure",
    points: [
      "No selling of personal data.",
      "Vetted sub-processors for hosting, analytics, and support.",
      "Disclosures only when required by law and with notice where possible.",
    ],
  },
  {
    title: "Your Controls",
    points: [
      "Access, update, export, or delete your account data on request.",
      "Opt out of marketing emails while keeping essential notifications.",
      "Admin controls for roles and access within your organization.",
    ],
  },
  {
    title: "Data Security",
    points: [
      "Role-based access control and least-privilege principles.",
      "Backups with secure storage; periodic recovery drills.",
      "Continuous patching and dependency updates.",
    ],
  },
  {
    title: "Data Retention",
    points: [
      "Retention aligned with educational use cases and legal requirements.",
      "Data deleted or anonymized after account closure, following grace periods.",
    ],
  },
];

export default function Privacy() {
  return (
    <DefaultLayout showSectionLinks backgroundClass="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-4 py-14 space-y-10">
        <section className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Your Privacy Matters
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Privacy <span className="text-emerald-300">Policy</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            This explains how SmartPaper AI collects, uses, and protects your data when you create and review assessments.
          </p>
          <p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 shadow-lg">
              <div className="h-10 w-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-white">{title}</div>
              <div className="text-sm text-white/60">{desc}</div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          {sections.map((block) => (
            <div key={block.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-semibold text-white">{block.title}</h3>
              </div>
              <ul className="list-disc list-inside text-white/70 space-y-1">
                {block.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-white">Contact & Requests</h3>
          </div>
          <p className="text-white/70">
            Need help with privacy questions, exports, or deletions? Email{" "}
            <a className="text-emerald-300 hover:text-emerald-200" href="mailto:privacy@smartpaper.ai">
              privacy@smartpaper.ai
            </a>. We typically respond within 48 hours.
          </p>
        </section>

        <p className="text-xs text-white/50 text-center">
          This policy may change as we improve SmartPaper AI. We will notify you of material updates.
        </p>
      </main>
    </DefaultLayout>
  );
}


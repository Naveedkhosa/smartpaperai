// @ts-nocheck
import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, BookOpen, ShieldCheck, PenLine, Users, Zap, Layers } from "lucide-react";
import DefaultLayout from "@/components/DefaultLayout";
import { useAuth } from "../contexts/AuthContext";

const highlights = [
  { icon: Sparkles, title: "AI Paper Builder", desc: "Generate exam papers in minutes with AI-assisted templates." },
  { icon: BookOpen, title: "Smart Checking", desc: "Auto-grade objective answers and assistive review for subjective." },
  { icon: ShieldCheck, title: "Plagiarism Guard", desc: "Keep assessments original with built-in similarity checks." },
  { icon: PenLine, title: "Flexible Templates", desc: "Reuse, version, and remix question banks across subjects." },
  { icon: Users, title: "Collaboration", desc: "Invite teachers, share drafts, and co-review responses securely." },
  { icon: Layers, title: "Curriculum Ready", desc: "Standards-aligned sections, marking schemes, and rubrics." },
];

const steps = [
  { label: "01", title: "Set up in minutes", desc: "Pick a syllabus, grading scheme, and paper goals." },
  { label: "02", title: "Generate & customize", desc: "Blend AI suggestions with your own question bank." },
  { label: "03", title: "Publish & check", desc: "Share securely, collect submissions, and auto-check answers." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    badge: "Best for trials",
    features: [
      "Up to 3 active papers",
      "Objective auto-grading",
      "Basic templates",
      "Export to PDF",
    ],
    limited: [
      "Manual subjective review",
      "Email support",
    ],
    cta: "Start Free",
    variant: "outline",
  },
  {
    name: "Pro",
    price: "$19/mo",
    badge: "Most popular",
    features: [
      "Unlimited papers",
      "AI-assisted subjective feedback",
      "Reusable question banks",
      "Rubric & marks distribution",
      "Team collaboration",
      "Priority support",
    ],
    limited: [],
    cta: "Start 14-day trial",
    variant: "primary",
  },
  {
    name: "Institution",
    price: "Custom",
    badge: "For schools",
    features: [
      "Multi-campus rollout",
      "SSO & role-based access",
      "Bulk imports & SIS sync",
      "Advanced analytics",
      "Dedicated success manager",
    ],
    limited: [],
    cta: "Talk to us",
    variant: "ghost",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" },
  }),
};

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <DefaultLayout includeTopAnchor showSectionLinks backgroundClass="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-900 text-white">
      <main>
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="max-w-6xl mx-auto px-4 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12"
        >
          <motion.div className="flex-1 space-y-6" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/5 border border-white/10 text-xs uppercase tracking-wide text-emerald-200">
              <Sparkles className="h-4 w-4" />
              AI-powered paper maker & checker
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Launch faster with an
              <span className="text-emerald-300"> AI-first </span>
              paper builder and checker.
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Create standards-aligned assessments, auto-check objective answers, and speed up subjective grading with AI suggestions — all in one secure workspace built for educators.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition"
              >
                Start free
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition"
              >
                View demo
              </Link>
              <span className="text-white/50 text-sm">No credit card • 14-day trial</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { title: "5x faster", desc: "to publish new papers" },
                { title: "Auto-check", desc: "MCQ, true/false, fill blanks" },
                { title: "Secure sharing", desc: "role-based links & watermark" },
              ].map((item) => (
                <motion.div key={item.title} className="p-4 rounded-xl bg-white/5 border border-white/10" variants={fadeUp}>
                  <div className="text-emerald-300 font-semibold">{item.title}</div>
                  <div className="text-white/60 text-sm">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div className="flex-1 w-full" variants={fadeUp} custom={0.6}>
            <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl">
              <div className="absolute inset-0 blur-3xl opacity-40 bg-emerald-500/20" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-semibold">AI</div>
                  <span className="text-xs text-white/60">Paper Draft · Science 10</span>
                </div>
                <div className="space-y-3">
                  {["Section A: MCQs", "Section B: Short Answer", "Section C: Long Form"].map((label, idx) => (
                    <motion.div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10" variants={fadeUp} custom={idx * 0.2}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="h-6 w-6 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-xs">{idx + 1}</span>
                          {label}
                        </div>
                        <span className="text-xs text-white/50">AI suggestions ready</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-cyan-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">Integrity mode</div>
                    <div className="text-xs text-white/60">Watermarked PDFs + time-bound access</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          id="features"
          className="max-w-6xl mx-auto px-4 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center space-y-3 mb-10" variants={fadeUp}>
            <p className="text-emerald-200 text-sm uppercase tracking-[0.2em]">Built for educators</p>
            <h2 className="text-3xl font-bold">Everything you need to create and check papers</h2>
            <p className="text-white/60 max-w-2xl mx-auto">AI where it helps, control where you need it. Design, publish, and review with confidence.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-300/40 hover:-translate-y-0.5 transition"
                variants={fadeUp}
                custom={idx * 0.15}
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold mb-1">{title}</div>
                <div className="text-sm text-white/60">{desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="workflow"
          className="max-w-6xl mx-auto px-4 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div className="text-center space-y-3 mb-12" variants={fadeUp}>
            <p className="text-emerald-200 text-sm uppercase tracking-[0.2em]">How it works</p>
            <h2 className="text-3xl font-bold">From syllabus to scored scripts in three steps</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Move faster with an AI copilot that respects your rubric.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.label}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3"
                variants={fadeUp}
                custom={idx * 0.2}
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-semibold">{step.label}</div>
                <div className="font-semibold text-lg">{step.title}</div>
                <div className="text-sm text-white/60">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          className="max-w-6xl mx-auto px-4 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center space-y-3 mb-12" variants={fadeUp}>
            <p className="text-emerald-200 text-sm uppercase tracking-[0.2em]">Simple pricing</p>
            <h2 className="text-3xl font-bold">Pick a plan that fits your faculty</h2>
            <p className="text-white/60 max-w-2xl mx-auto">Start free and upgrade when you need more automation and collaboration.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-300/40 transition space-y-4"
                variants={fadeUp}
                custom={idx * 0.2}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{plan.name}</div>
                  <span className="text-xs text-emerald-200 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
                <div className="text-3xl font-bold">{plan.price}</div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-emerald-300 mt-0.5" /> {f}
                    </li>
                  ))}
                  {plan.limited.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/50">
                      <Check className="h-4 w-4 text-white/40 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center rounded-full px-4 py-3 font-semibold transition ${
                    plan.variant === "primary"
                      ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300"
                      : plan.variant === "outline"
                      ? "border border-white/20 text-white/80 hover:text-white hover:border-white/40"
                      : "bg-white/5 border border-white/10 text-white/80 hover:border-white/30"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="max-w-6xl mx-auto px-4 pb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="rounded-3xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-blue-500/15 border border-white/10 p-10 flex flex-col md:flex-row items-center justify-between gap-6"
            variants={fadeUp}
          >
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Ready to launch</p>
              <h3 className="text-2xl font-bold">Build, publish, and check your next paper with SmartPaper AI</h3>
              <p className="text-white/70">Join educators automating the busywork while keeping academic rigor.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition"
              >
                Start free
              </Link>
              <Link
                to="/login"
                className="px-5 py-3 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </DefaultLayout>
  );
}


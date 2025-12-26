import React from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Phone, Mail, MapPin, ShieldCheck, Clock, Globe } from "lucide-react";

const faqs = [
  {
    q: "How quickly do you respond?",
    a: "Most messages get a reply within 4–24 business hours. Critical issues are prioritized.",
  },
  {
    q: "Do you support enterprise rollouts?",
    a: "Yes. We handle multi-campus onboarding, SSO, and custom SLAs for institutions.",
  },
  {
    q: "Is support 24/7?",
    a: "Email support is 24/7. Live escalation is available during school hours or via enterprise agreements.",
  },
];

export default function Contact() {
  return (
    <DefaultLayout showSectionLinks backgroundClass="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-4 py-14 space-y-12">
        <section className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Get in touch
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Let&apos;s <span className="text-emerald-300">Connect</span> & Build Together
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Questions about SmartPaper AI? Reach out and we&apos;ll help you launch, manage, and
            scale assessments with confidence.
          </p>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Contact Information</h2>
            <p className="text-white/60 text-sm">We reply within 24 hours (faster for critical issues).</p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Phone</div>
                  <div className="text-white/60 text-sm">+1 (555) 123-4567</div>
                  <div className="text-white/40 text-xs">Mon–Fri, 9am–6pm</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Email</div>
                  <div className="text-white/70 text-sm">support@smartpaper.ai</div>
                  <div className="text-white/40 text-xs">Replies within 24h</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Office</div>
                  <div className="text-white/70 text-sm">Remote-first, serving schools globally</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Support Hours</div>
                  <div className="text-white/70 text-sm">Live chat during school hours; email 24/7</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Global Support</div>
                  <div className="text-white/70 text-sm">EN + AR; more languages via partners</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Send us a message</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Your Name</label>
                    <input className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Email Address</label>
                    <input className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" placeholder="you@school.edu" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/70">Subject</label>
                  <input className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm text-white/70">Your Message</label>
                  <textarea rows={4} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" placeholder="Tell us about your project or questions..." />
                </div>
                <button type="button" className="w-full md:w-auto px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/30 hover:from-emerald-300 hover:to-cyan-300 transition">
                  Send Message
                </button>
                <p className="text-xs text-white/50">By submitting, you agree to our Privacy Policy.</p>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-3">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{item.q}</div>
                    <div className="text-white/65 text-sm mt-1">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
}


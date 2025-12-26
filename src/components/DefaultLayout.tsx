import React from "react";
import { Link } from "react-router-dom";

interface DefaultLayoutProps {
  children: React.ReactNode;
  showSectionLinks?: boolean;
  backgroundClass?: string;
  includeTopAnchor?: boolean;
}

export default function DefaultLayout({
  children,
  showSectionLinks = true,
  backgroundClass = "min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-900 text-white",
  includeTopAnchor = false,
}: DefaultLayoutProps) {
  return (
    <div
      className={backgroundClass}
      id={includeTopAnchor ? "top" : undefined}
    >
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="h-10 w-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              SP
            </div>
            <span>SmartPaper AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            {showSectionLinks ? (
              <>
                <a className="hover:text-white transition" href="/">Home</a>
                <a className="hover:text-white transition" href="#features">Features</a>
                <a className="hover:text-white transition" href="#pricing">Pricing</a>
                <a className="hover:text-white transition" href="#workflow">Workflow</a>
              </>
            ) : (
              <Link className="hover:text-white transition" to="/">Home</Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition text-sm"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-300 transition text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/5 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2 text-white/70">
            <div className="h-8 w-8 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">SP</div>
            SmartPaper AI
          </div>
          <div className="flex items-center gap-6">
            <Link className="hover:text-white transition" to="/privacy">Privacy</Link>
            <Link className="hover:text-white transition" to="/terms">Terms</Link>
            <Link className="hover:text-white transition" to="/contact">Contact</Link>
          </div>
          <div>© {new Date().getFullYear()} SmartPaper AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}


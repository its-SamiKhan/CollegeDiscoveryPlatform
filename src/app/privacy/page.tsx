import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex-1 flex flex-col space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={14} />
        Back to Home
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck size={28} className="text-indigo-600" />
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Personal Portfolio Showcase Project
        </p>
      </div>
      <hr className="border-slate-200 dark:border-slate-800" />
      <div className="prose prose-slate dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Welcome to CollegeDiscovery! This platform is built entirely as a <strong>personal portfolio project</strong> to demonstrate full-stack Next.js capabilities, state management, and relational database designs.
        </p>
        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-4">Data Collection & Usage</h2>
        <p>
          Since this is a simulated scholar platform, we do not store, sell, or collect any personal user data. Passwords registered during profile creation are securely hashed using bcryptjs, and Google OAuth tokens are handled solely for standard credentials verification. 
        </p>
        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-4">Cookies & Analytics</h2>
        <p>
          We use simple local cookies and session states strictly to maintain authenticated user sessions and retain selected side-by-side college choices inside the Zustand tray. There are zero tracking pixels or third-party marketing tags deployed on this site.
        </p>
        <p className="text-xs text-slate-400 font-bold pt-8">
          Last updated: May 25, 2026. Made with ❤️ by a passionate scholar developer.
        </p>
      </div>
    </div>
  );
}

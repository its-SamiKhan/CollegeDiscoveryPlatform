import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex-1 flex flex-col space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={14} />
        Back to Home
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={28} className="text-indigo-600" />
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Personal Portfolio Showcase Project
        </p>
      </div>
      <hr className="border-slate-200 dark:border-slate-800" />
      <div className="prose prose-slate dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          By exploring this platform, you acknowledge that all visual assets, database records, and cutoff ratings are simulated for full-stack prototype demonstrations.
        </p>
        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-4">Simulated Services</h2>
        <p>
          CollegeDiscovery provides a comprehensive MVP catalog containing 60 simulated institutions. All student comments, ratings, JEE/NEET rank predictions, and board questions are for showcase purposes and should not be used as high-stakes actual academic advice.
        </p>
        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-4">Acceptable Usage</h2>
        <p>
          As this is an open portfolio showcase, you are free to register mock accounts, test comparison lists, save dashboard booklets, and post questions. Any attempt to exploit, spam, or run unauthorized queries against the Neon database connections will be monitored and blocked.
        </p>
        <p className="text-xs text-slate-400 font-bold pt-8">
          Last updated: May 25, 2026. Made with ❤️ by a passionate scholar developer.
        </p>
      </div>
    </div>
  );
}

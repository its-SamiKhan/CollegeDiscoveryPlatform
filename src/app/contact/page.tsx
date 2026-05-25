import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex-1 flex flex-col space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={14} />
        Back to Home
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Mail size={28} className="text-indigo-600" />
          Contact Support
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Personal Portfolio Showcase Project
        </p>
      </div>
      <hr className="border-slate-200 dark:border-slate-800" />
      <div className="prose prose-slate dark:prose-invert text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Have questions about the platform architecture, tech stack, or database configurations? We'd love to connect!
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Developer Contact Info
          </h3>
          <ul className="space-y-2 text-xs font-semibold">
            <li className="flex items-center gap-2">
              <span className="text-slate-400">Project Type:</span>
              <span className="text-slate-750 dark:text-slate-300">Full-Stack Next.js Portfolio MVP</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-slate-400">Database Connection:</span>
              <span className="text-indigo-600">Neon serverless PostgreSQL</span>
            </li>
          </ul>
        </div>
        
        <p className="text-xs text-slate-400 font-bold">
          Made with ❤️ by a passionate scholar developer. Feel free to view the source code and build upon it!
        </p>
      </div>
    </div>
  );
}

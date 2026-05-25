import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-y-10 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-350 shadow-sm">
                <GraduationCap size={20} />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                CollegeDiscovery
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-left md:text-justify text-slate-400">
              Empowering students to research, compare, and discover their perfect academic pathways. Real-time data, authentic reviews, and robust search filters at your fingertips.
            </p>
          </div>

          {/* Navigation Links Subgrid Wrapper */}
          <div className="md:col-span-7 md:col-start-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-200 mb-4 pb-1 border-b border-slate-800 md:border-none">
                Explore
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/colleges?courseType=engineering" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Engineering Colleges
                  </Link>
                </li>
                <li>
                  <Link href="/colleges?courseType=mba" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Business Schools
                  </Link>
                </li>
                <li>
                  <Link href="/colleges?courseType=medical" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Medical Colleges
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform features */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-200 mb-4 pb-1 border-b border-slate-800 md:border-none">
                Features
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/colleges" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Search & Filters
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Side-by-side Compare
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Saved Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/predictor" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Rank Predictor Tool
                  </Link>
                </li>
                <li>
                  <Link href="/discussions" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Community Discussions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal and Support */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-200 mb-4 pb-1 border-b border-slate-800 md:border-none">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-all hover:translate-x-1 inline-block">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-slate-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} CollegeDiscovery. All rights reserved.</p>
          <p className="hover:text-slate-400 transition-colors">
            Designed & crafted for premier student decision making.
          </p>
        </div>
      </div>
    </footer>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compareStore";
import { X, GitCompare } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";

export default function CompareTray() {
  const { selectedColleges, removeFromCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for persistent localStorage store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || selectedColleges.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-205 dark:border-slate-800 shadow-2xl z-40 transition-transform duration-300 animate-in slide-in-from-bottom-20 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Summary info */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-950 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
            <GitCompare size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Compare Colleges ({selectedColleges.length}/3)
            </h4>
            <p className="text-[11px] text-slate-500">
              Select at least 2 colleges to start comparison
            </p>
          </div>
        </div>

        {/* Center: Selected College Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {selectedColleges.map((college) => (
            <div
              key={college.id}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-205 dark:border-slate-700 py-1.5 pl-2.5 pr-1.5 rounded-lg shadow-sm animate-in zoom-in-95 duration-150"
            >
              <img
                src={college.imageUrl}
                alt={college.name}
                className="w-6 h-6 rounded-md object-cover"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] md:max-w-[160px] truncate">
                {college.name}
              </span>
              <button
                onClick={() => removeFromCompare(college.id)}
                className="text-slate-400 hover:text-red-500 rounded p-0.5 transition-colors focus:outline-none"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 transition-colors"
          >
            Clear All
          </button>
          
          <Link href="/compare">
            <Button
              disabled={selectedColleges.length < 2}
              variant="primary"
              size="sm"
              className="font-semibold shadow-md"
            >
              Compare Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

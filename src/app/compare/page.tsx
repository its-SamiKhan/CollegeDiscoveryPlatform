"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/store/compareStore";
import { useToastStore } from "@/store/toastStore";
import { GitCompare, Landmark, GraduationCap, Star, MapPin, X, ArrowLeft, Award, CheckCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface HighlightData {
  lowestFeesId: string;
  highestPlacementAvgId: string;
  highestPlacementHighestId: string;
  highestRatingId: string;
}

export default function ComparePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToastStore();
  const { selectedColleges, removeFromCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // API comparison states
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<HighlightData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveComparison = async () => {
    if (!session) {
      addToast("Please sign in to save comparisons.", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      const collegeIds = selectedColleges.map((c) => c.id);
      const res = await fetch("/api/compare/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeIds }),
      });
      const json = await res.json();
      
      if (json.success) {
        addToast("Comparison saved to dashboard successfully!", "success");
      } else {
        addToast(json.message || "Failed to save comparison.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network connection error.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Sync state & handle hydration checks
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch comparison highlights from the server API when list changes
  useEffect(() => {
    if (!mounted || selectedColleges.length < 2) return;

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const collegeIds = selectedColleges.map((c) => c.id);
        const res = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeIds }),
        });
        const json = await res.json();
        
        if (json.success) {
          setHighlights(json.data.highlights);
        } else {
          setError(json.message || "Failed to calculate comparison metrics.");
        }
      } catch (err) {
        console.error(err);
        setError("Network connection error. Performing offline comparison.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [mounted, selectedColleges]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Skeleton variant="circular" width={48} height={48} className="animate-spin" />
      </div>
    );
  }

  // If fewer than 2 colleges, render empty state
  if (selectedColleges.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center space-y-6 flex-1">
        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center shadow-sm">
          <GitCompare size={36} />
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-905 dark:text-white">Compare Colleges (Fewer than 2 Selected)</h2>
        
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          Select at least 2 colleges (up to 3) from the directory listings to view an in-depth, side-by-side metric comparison and highlights.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/colleges">
            <Button variant="primary" className="font-semibold shadow-md">
              Browse Colleges List
            </Button>
          </Link>
          {selectedColleges.length === 1 && (
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Reset Selection
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatFees = (fee: number) => {
    if (fee >= 100000) {
      return `₹${(fee / 100000).toFixed(2)} Lakh / yr`;
    }
    return `₹${fee.toLocaleString()} / yr`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors focus:outline-none"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="text-indigo-600" size={28} />
            College Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Side-by-side metric sheet highlighting best values.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveComparison}
            disabled={saveLoading}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 px-3.5 py-2.5 rounded-lg transition-colors border border-indigo-200/50 dark:border-indigo-800/40 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Bookmark size={13} className="fill-indigo-600/10 text-indigo-600 dark:text-indigo-400" />
            {saveLoading ? "Saving..." : "Save Comparison"}
          </button>

          <button
            onClick={() => {
              clearCompare();
              addToast("Comparison selections cleared.", "info");
            }}
            className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/20 px-3.5 py-2.5 rounded-lg transition-colors border border-red-200/50 dark:border-red-900/30 cursor-pointer"
          >
            Reset Selection
          </button>
        </div>
      </div>

      {/* Comparison Grid Sheet */}
      <div className="overflow-x-auto rounded-2xl border border-slate-205 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full border-collapse text-left text-sm">
          {/* Header Row: Images & Names */}
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              {/* First column empty header */}
              <th className="px-6 py-6 font-semibold text-slate-500 w-1/4 min-w-[200px]">
                Features
              </th>
              
              {/* Colleges Header columns */}
              {selectedColleges.map((college) => (
                <th key={college.id} className="px-6 py-6 relative w-1/4 min-w-[260px] border-l border-slate-200 dark:border-slate-800">
                  {/* Remove cross */}
                  <button
                    onClick={() => {
                      removeFromCompare(college.id);
                      addToast(`${college.name} removed.`, "info");
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-full shadow-sm transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>

                  <div className="space-y-3">
                    <img
                      src={college.imageUrl}
                      alt={college.name}
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-slate-850 dark:text-white leading-snug line-clamp-2">
                        {college.name}
                      </h3>
                      <span className="flex items-center gap-0.5 text-xs text-slate-500 truncate font-normal">
                        <MapPin size={12} className="text-slate-400" />
                        {college.location}
                      </span>
                    </div>
                  </div>
                </th>
              ))}

              {/* Pad column if only 2 selected */}
              {selectedColleges.length === 2 && (
                <th className="px-6 py-6 w-1/4 min-w-[260px] border-l border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400">
                      <GitCompare size={20} />
                    </div>
                    <p className="text-xs text-slate-400 font-semibold max-w-[160px]">
                      Add a third college to compare side-by-side
                    </p>
                    <Link href="/colleges">
                      <Button variant="outline" size="sm" className="text-xs font-semibold">
                        Add College
                      </Button>
                    </Link>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
            {/* 1. Rating Row */}
            <tr>
              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Student Rating
              </td>
              {selectedColleges.map((college) => {
                const isBest = highlights?.highestRatingId === college.id;
                return (
                  <td
                    key={college.id}
                    className={`px-6 py-4 border-l border-slate-200 dark:border-slate-800 transition-colors
                      ${isBest ? "bg-emerald-50/15 dark:bg-emerald-950/5 font-semibold text-slate-900 dark:text-white" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                        {college.rating} / 5
                      </span>
                      {isBest && (
                        <Badge variant="success" className="text-[9px] py-0 font-bold tracking-tight">
                          Top Rated
                        </Badge>
                      )}
                    </div>
                  </td>
                );
              })}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>

            {/* 2. Fees Row */}
            <tr>
              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Annual Fees (INR)
              </td>
              {selectedColleges.map((college) => {
                const isBest = highlights?.lowestFeesId === college.id;
                return (
                  <td
                    key={college.id}
                    className={`px-6 py-4 border-l border-slate-200 dark:border-slate-800 transition-colors
                      ${isBest ? "bg-emerald-50/15 dark:bg-emerald-950/5 font-semibold text-slate-900 dark:text-white" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1">
                        <Landmark size={14} className="text-slate-400" />
                        {formatFees(college.fees).replace(" / yr", "")}
                      </span>
                      {isBest && (
                        <Badge variant="success" className="text-[9px] py-0 font-bold">
                          Best Budget
                        </Badge>
                      )}
                    </div>
                  </td>
                );
              })}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>

            {/* 3. Average Package Row */}
            <tr>
              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Avg Placement
              </td>
              {selectedColleges.map((college) => {
                const isBest = highlights?.highestPlacementAvgId === college.id;
                return (
                  <td
                    key={college.id}
                    className={`px-6 py-4 border-l border-slate-200 dark:border-slate-800 transition-colors
                      ${isBest ? "bg-emerald-50/15 dark:bg-emerald-950/5 font-semibold text-slate-900 dark:text-white" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1">
                        <GraduationCap size={14} className="text-slate-400" />
                        ₹{college.placementAverage} LPA
                      </span>
                      {isBest && (
                        <Badge variant="success" className="text-[9px] py-0 font-bold">
                          Highest Avg
                        </Badge>
                      )}
                    </div>
                  </td>
                );
              })}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>

            {/* 4. Highest Package Row */}
            <tr>
              <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Peak Package
              </td>
              {selectedColleges.map((college) => {
                const isBest = highlights?.highestPlacementHighestId === college.id;
                return (
                  <td
                    key={college.id}
                    className={`px-6 py-4 border-l border-slate-200 dark:border-slate-800 transition-colors
                      ${isBest ? "bg-emerald-50/15 dark:bg-emerald-950/5 font-semibold text-slate-900 dark:text-white" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1">
                        <Award size={14} className="text-slate-400" />
                        ₹{college.placementHighest} LPA
                      </span>
                      {isBest && (
                        <Badge variant="success" className="text-[9px] py-0 font-bold">
                          Highest Peak
                        </Badge>
                      )}
                    </div>
                  </td>
                );
              })}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>

            {/* 5. Courses offered Row */}
            <tr>
              <td className="px-6 py-6 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Sample Courses
              </td>
              {selectedColleges.map((college) => (
                <td key={college.id} className="px-6 py-6 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1 max-w-[260px]">
                    {college.courses.slice(0, 4).map((course, idx) => (
                      <Badge key={idx} variant="neutral" className="text-[9px] py-0.5">
                        {course}
                      </Badge>
                    ))}
                    {college.courses.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{college.courses.length - 4} more</span>
                    )}
                  </div>
                </td>
              ))}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>

            {/* 6. Facilities Row */}
            <tr>
              <td className="px-6 py-6 font-bold text-slate-700 dark:text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                Facilities
              </td>
              {selectedColleges.map((college) => (
                <td key={college.id} className="px-6 py-6 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1 max-w-[260px]">
                    {college.facilities.slice(0, 4).map((fac, idx) => (
                      <Badge key={idx} variant="primary" className="text-[9px] py-0.5 lowercase first-letter:uppercase">
                        {fac}
                      </Badge>
                    ))}
                    {college.facilities.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{college.facilities.length - 4} more</span>
                    )}
                  </div>
                </td>
              ))}
              {selectedColleges.length === 2 && <td className="bg-slate-50/10 dark:bg-slate-950/10 border-l border-slate-200 dark:border-slate-800" />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export { ComparePage };

"use client";

import React, { useState } from "react";
import CollegeCard from "./CollegeCard";
import { Heart, Trash2, ArrowLeft, GitCompare, Calendar, Bookmark } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
import { useCompareStore } from "@/store/compareStore";

interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  imageUrl: string;
  courses: string[];
  facilities: string[];
  placementAverage: number;
  placementHighest: number;
  establishedYear: number;
}

interface SavedComparison {
  id: string;
  collegeIds: string[];
  createdAt: string;
  colleges: College[];
}

interface SavedDashboardViewProps {
  initialColleges: College[];
  initialComparisons: SavedComparison[];
  userName: string;
}

export default function SavedDashboardView({
  initialColleges,
  initialComparisons,
  userName,
}: SavedDashboardViewProps) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const { setCompare } = useCompareStore();

  const [activeTab, setActiveTab] = useState<"colleges" | "comparisons">("colleges");
  const [colleges, setColleges] = useState<College[]>(initialColleges);
  const [comparisons, setComparisons] = useState<SavedComparison[]>(initialComparisons);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingCompareId, setLoadingCompareId] = useState<string | null>(null);

  const handleUnsave = async (collegeId: string, collegeName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingId(collegeId);
    try {
      const res = await fetch(`/api/saved/${collegeId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setColleges((prev) => prev.filter((c) => c.id !== collegeId));
        addToast(`${collegeName} removed from saved list successfully.`, "success");
      } else {
        addToast(json.message || "Failed to remove saved college.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error. Could not delete saved college.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteComparison = async (compareId: string, collegeNames: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoadingCompareId(compareId);
    try {
      const res = await fetch(`/api/compare/saved/${compareId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setComparisons((prev) => prev.filter((item) => item.id !== compareId));
        addToast(`Comparison "${collegeNames}" removed successfully.`, "success");
      } else {
        addToast(json.message || "Failed to delete saved comparison.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error. Could not delete comparison.", "error");
    } finally {
      setLoadingCompareId(null);
    }
  };

  const handleLoadComparison = (item: SavedComparison) => {
    // Map colleges to CompareCollege schema for the Zustand store
    const mapped = item.colleges.map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      fees: c.fees,
      rating: c.rating,
      imageUrl: c.imageUrl,
      courses: c.courses,
      facilities: c.facilities,
      placementAverage: c.placementAverage,
      placementHighest: c.placementHighest,
    }));
    
    setCompare(mapped);
    addToast("Comparison metrics loaded successfully!", "success");
    router.push("/compare");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={28} />
            Student Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Welcome back, <strong className="text-slate-700 dark:text-slate-400">{userName}</strong>. Manage your saved colleges and comparison sheets.
          </p>
        </div>

        <Link href="/colleges">
          <Button variant="outline" size="sm" className="font-semibold gap-1.5 cursor-pointer">
            <ArrowLeft size={14} />
            Explore More Colleges
          </Button>
        </Link>
      </div>

      {/* Sleek Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("colleges")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 focus:outline-none cursor-pointer
            ${
              activeTab === "colleges"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          <Bookmark size={15} className={activeTab === "colleges" ? "fill-indigo-600/10 text-indigo-600" : ""} />
          Saved Colleges ({colleges.length})
        </button>
        <button
          onClick={() => setActiveTab("comparisons")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 focus:outline-none cursor-pointer
            ${
              activeTab === "comparisons"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
        >
          <GitCompare size={15} />
          Saved Comparisons ({comparisons.length})
        </button>
      </div>

      {/* Grid container */}
      <div className="flex-1 flex flex-col justify-between">
        {activeTab === "colleges" ? (
          colleges.length === 0 ? (
            /* Empty colleges state */
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <Bookmark size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Saved Colleges Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Keep track of colleges you are interested in. Click the bookmark icon on college cards to save them in your dashboard.
              </p>
              <Link href="/colleges">
                <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
                  Explore Colleges Directory
                </Button>
              </Link>
            </div>
          ) : (
            /* Render colleges cards with quick unsave overlay buttons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college) => (
                <div key={college.id} className="relative group">
                  <CollegeCard college={college} isInitiallySaved={true} />

                  {/* Float unsave trigger at card-bottom to showcase custom dashboard actions */}
                  <div className="absolute bottom-20 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handleUnsave(college.id, college.name, e)}
                      disabled={loadingId === college.id}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg shadow-md transition-all focus:outline-none disabled:opacity-50 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      title="Remove from saved dashboard"
                    >
                      <Trash2 size={13} />
                      Unsave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Saved Comparisons Tab */
          comparisons.length === 0 ? (
            /* Empty comparisons state */
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <GitCompare size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Saved Comparisons Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Save side-by-side metric sheets directly from the compare table to load them instantly anytime.
              </p>
              <Link href="/colleges">
                <Button variant="primary" size="sm" className="font-semibold cursor-pointer">
                  Browse & Compare Colleges
                </Button>
              </Link>
            </div>
          ) : (
            /* Render saved comparisons grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisons.map((item) => {
                const namesStr = item.colleges.map((c) => c.name).join(" vs ");
                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    {/* Background visual flair */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none" />

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <div className="space-y-1 max-w-[85%]">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white leading-snug line-clamp-2">
                          {namesStr}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar size={12} />
                          <span>Saved on {formatDate(item.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteComparison(item.id, namesStr, e)}
                        disabled={loadingCompareId === item.id}
                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors border border-red-200/30 disabled:opacity-50 cursor-pointer"
                        title="Delete comparison"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* College thumbnails with a premium "vs" layout */}
                    <div className="grid grid-cols-3 items-center gap-2 relative bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item.colleges.map((college, idx) => (
                        <React.Fragment key={college.id}>
                          {/* College Cardlet */}
                          <div className="flex flex-col items-center text-center space-y-1.5">
                            <img
                              src={college.imageUrl}
                              alt={college.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
                            />
                            <div className="max-w-[75px] sm:max-w-[90px] space-y-0.5">
                              <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {college.name}
                              </span>
                              <span className="block text-[9px] text-slate-400 truncate">
                                {college.location}
                              </span>
                            </div>
                          </div>

                          {/* VS Badge */}
                          {idx < item.colleges.length - 1 && (
                            <div className="flex items-center justify-center text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-white dark:bg-slate-850 w-5 h-5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 self-center justify-self-center -mx-2 z-10">
                              VS
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Pad column if only 2 selected to make grid alignment work nicely */}
                      {item.colleges.length === 2 && (
                        <>
                          <div className="flex items-center justify-center text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-white dark:bg-slate-850 w-5 h-5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 self-center justify-self-center -mx-2 z-10">
                            VS
                          </div>
                          <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-2 h-12 text-[9px] text-slate-400 text-center leading-tight">
                            Empty Slot
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 relative z-10">
                      <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-md border border-indigo-200/20">
                        {item.colleges.length} Colleges Compared
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleLoadComparison(item)}
                        className="text-xs font-bold gap-1 shadow-sm cursor-pointer"
                      >
                        <GitCompare size={13} />
                        View Comparison
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
export { SavedDashboardView };

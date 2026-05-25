"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, RefreshCw, XCircle } from "lucide-react";
import CollegeCard from "@/components/college/CollegeCard";
import CollegeFilter from "@/components/college/CollegeFilter";
import { CollegeCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

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

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const STATES_LIST = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Gujarat"];

// Inner component wrapped in Suspense
function CollegesSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial Filter State parsed from URLs
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "all",
    feesMin: searchParams.get("feesMin") || "",
    feesMax: searchParams.get("feesMax") || "",
    rating: searchParams.get("rating") || "",
    courseType: searchParams.get("courseType") || "all",
    sortBy: searchParams.get("sortBy") || "rating",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: searchParams.get("page") || "1",
  });

  // Search input state (binds to text-field instantly)
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Colleges & Pagination states
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync Search Input if url search parameter is updated by a different link
  useEffect(() => {
    const searchVal = searchParams.get("search") || "";
    setSearchInput(searchVal);
    setFilters((prev) => ({ ...prev, search: searchVal }));
  }, [searchParams]);

  // Debounce search text input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search !== searchInput) {
          return { ...prev, search: searchInput, page: "1" };
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Core API caller
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.set("search", filters.search);
      if (filters.state && filters.state !== "all") query.set("state", filters.state);
      if (filters.feesMin) query.set("feesMin", filters.feesMin);
      if (filters.feesMax) query.set("feesMax", filters.feesMax);
      if (filters.rating) query.set("rating", filters.rating);
      if (filters.courseType && filters.courseType !== "all") query.set("courseType", filters.courseType);
      
      query.set("sortBy", filters.sortBy);
      query.set("sortOrder", filters.sortOrder);
      query.set("page", filters.page);
      query.set("limit", "9"); // 3x3 layout grid

      const res = await fetch(`/api/colleges?${query.toString()}`);
      const json = await res.json();

      if (json.success) {
        setColleges(json.data.colleges);
        setPagination(json.data.pagination);
      } else {
        setError(json.message || "Failed to load colleges");
      }
    } catch (err: any) {
      console.error(err);
      setError("Database server is currently offline or unreachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Trigger filters & push active URL search params
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (key !== "page") {
        updated.page = "1"; // Reset page on filter changes
      }
      
      const query = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        if (v && v !== "all") {
          query.set(k, v);
        }
      });
      router.push(`/colleges?${query.toString()}`, { scroll: false });
      
      return updated;
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      state: "all",
      feesMin: "",
      feesMax: "",
      rating: "",
      courseType: "all",
      sortBy: "rating",
      sortOrder: "desc",
      page: "1",
    });
    router.push("/colleges", { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Mobile Top-Search bar */}
      <div className="relative w-full max-w-lg mb-8">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search colleges by name..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CollegeFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            statesList={STATES_LIST}
          />
        </div>

        {/* Colleges Grid list */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-950 dark:text-red-300 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
              <XCircle className="text-red-500" size={48} />
              <h3 className="font-bold text-lg">Oops! Something went wrong</h3>
              <p className="text-sm max-w-md">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchColleges}
                className="font-semibold flex items-center gap-2 border-red-300 hover:bg-red-100/50"
              >
                <RefreshCw size={14} />
                Try Again
              </Button>
            </div>
          ) : loading ? (
            /* Loader skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
          ) : colleges.length === 0 ? (
            /* Empty State */
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 flex-1">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <Search size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Colleges Found</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                We couldn't find any colleges matching your criteria. Try resetting or adjusting your search filters.
              </p>
              <Button variant="primary" size="sm" onClick={handleClearFilters} className="font-semibold">
                Reset Search Filters
              </Button>
            </div>
          ) : (
            /* Colleges Render */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-205 dark:border-slate-800 pt-6 mt-8">
                  <span className="text-xs font-semibold text-slate-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
                    {pagination.totalCount} colleges
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => handleFilterChange("page", String(pagination.page - 1))}
                      className="font-semibold"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = pageNum === pagination.page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange("page", String(pageNum))}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold border flex items-center justify-center cursor-pointer transition-colors
                              ${
                                isCurrent
                                  ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => handleFilterChange("page", String(pagination.page + 1))}
                      className="font-semibold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollegesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    }>
      <CollegesSearchContent />
    </Suspense>
  );
}
export { CollegesPage };

"use client";

import React from "react";
import { SlidersHorizontal, MapPin, BadgePercent, Star, BookOpen } from "lucide-react";

interface FilterState {
  search: string;
  state: string;
  feesMin: string;
  feesMax: string;
  rating: string;
  courseType: string;
  sortBy: string;
  sortOrder: string;
}

interface CollegeFilterProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  statesList: string[];
}

export default function CollegeFilter({
  filters,
  onFilterChange,
  onClearFilters,
  statesList,
}: CollegeFilterProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-indigo-600" />
          Filter Colleges
        </h3>
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen size={14} className="text-slate-400" />
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["all", "engineering", "mba", "medical"].map((type) => {
            const isSelected = filters.courseType === type;
            return (
              <button
                key={type}
                onClick={() => onFilterChange("courseType", type)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center capitalize cursor-pointer
                  ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-250 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {type === "all" ? "All Fields" : type === "mba" ? "MBA" : type}
              </button>
            );
          })}
        </div>
      </div>

      {/* State / Location */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-400" />
          State / Location
        </label>
        <select
          value={filters.state}
          onChange={(e) => onFilterChange("state", e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
        >
          <option value="all">All States</option>
          {statesList.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Fees input range */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BadgePercent size={14} className="text-slate-400" />
          Annual Fees (INR)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Min Fees</span>
            <input
              type="number"
              value={filters.feesMin}
              onChange={(e) => onFilterChange("feesMin", e.target.value)}
              placeholder="e.g. 10000"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 dark:text-slate-205"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Max Fees</span>
            <input
              type="number"
              value={filters.feesMax}
              onChange={(e) => onFilterChange("feesMax", e.target.value)}
              placeholder="e.g. 1500000"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 dark:text-slate-205"
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Star size={14} className="text-slate-400" />
          Minimum Rating
        </label>
        <div className="flex gap-2">
          {["all", "4.0", "4.5"].map((r) => {
            const isSelected = (r === "all" && !filters.rating) || (r !== "all" && filters.rating === r);
            return (
              <button
                key={r}
                onClick={() => onFilterChange("rating", r === "all" ? "" : r)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer
                  ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-250 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {r === "all" ? "All" : `${r} ★+`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-slate-400" />
          Sort By
        </label>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            onFilterChange("sortBy", sortBy);
            onFilterChange("sortOrder", sortOrder);
          }}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-slate-200"
        >
          <option value="rating-desc">Rating: High to Low</option>
          <option value="fees-asc">Fees: Low to High</option>
          <option value="fees-desc">Fees: High to Low</option>
          <option value="placementAverage-desc">Avg Placements: High to Low</option>
          <option value="placementHighest-desc">Highest Placements: High to Low</option>
          <option value="establishedYear-asc">Established Year: Oldest First</option>
        </select>
      </div>
    </div>
  );
}
export { CollegeFilter };

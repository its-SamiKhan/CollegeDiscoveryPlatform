"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Star, Bookmark, BookmarkCheck, GitCompare, Landmark, GraduationCap } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useCompareStore } from "@/store/compareStore";
import { useToastStore } from "@/store/toastStore";
import Link from "next/link";

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

interface CollegeCardProps {
  college: College;
  isInitiallySaved?: boolean;
}

export default function CollegeCard({ college, isInitiallySaved = false }: CollegeCardProps) {
  const { data: session } = useSession();
  const { addToast } = useToastStore();
  const { selectedColleges, addToCompare, removeFromCompare } = useCompareStore();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Sync comparison state with global store
  useEffect(() => {
    setIsCompared(selectedColleges.some((c) => c.id === college.id));
  }, [selectedColleges, college.id]);

  const handleCompareToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      addToCompare(
        {
          id: college.id,
          name: college.name,
          location: college.location,
          fees: college.fees,
          rating: college.rating,
          imageUrl: college.imageUrl,
          courses: college.courses,
          facilities: college.facilities,
          placementAverage: college.placementAverage,
          placementHighest: college.placementHighest,
        },
        addToast
      );
    } else {
      removeFromCompare(college.id);
      addToast(`${college.name} removed from comparison list.`, "info");
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      addToast("Please sign in to save colleges.", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        // Delete save
        const res = await fetch(`/api/saved/${college.id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          setIsSaved(false);
          addToast(`${college.name} removed from saved list.`, "success");
        } else {
          addToast(json.message || "Failed to remove college.", "error");
        }
      } else {
        // Save
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
        const json = await res.json();
        if (json.success) {
          setIsSaved(true);
          addToast(`${college.name} saved successfully!`, "success");
        } else {
          addToast(json.message || "Failed to save college.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Network connection error.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const formatFees = (fee: number) => {
    if (fee >= 100000) {
      return `₹${(fee / 100000).toFixed(2)} Lakh/yr`;
    }
    return `₹${fee.toLocaleString()}/yr`;
  };

  return (
    <Card className="hover:shadow-lg dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 flex flex-col group h-full">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={college.imageUrl}
          alt={college.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Est Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="primary" className="font-semibold bg-white/95 text-slate-800 dark:bg-slate-900/90 dark:text-slate-200 border-none shadow-sm">
            Est. {college.establishedYear}
          </Badge>
        </div>

        {/* Save/Bookmark Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all focus:outline-none disabled:opacity-50
              ${
                isSaved
                  ? "bg-indigo-600 text-white"
                  : "bg-white/90 hover:bg-white text-slate-500 hover:text-indigo-600 dark:bg-slate-900/90 dark:text-slate-400 dark:hover:text-white"
              }`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
            <span className="flex items-center gap-1 font-medium truncate max-w-[75%]">
              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
              {college.location}
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
              <Star size={12} className="fill-amber-500 text-amber-500 flex-shrink-0" />
              {college.rating}
            </span>
          </div>

          {/* College Title */}
          <Link href={`/colleges/${college.id}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors mb-2.5 line-clamp-2">
              {college.name}
            </h3>
          </Link>

          {/* Top Courses list */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {college.courses.slice(0, 2).map((c, i) => (
              <Badge key={i} variant="neutral" className="text-[10px]">
                {c}
              </Badge>
            ))}
            {college.courses.length > 2 && (
              <Badge variant="neutral" className="text-[10px]">
                +{college.courses.length - 2} More
              </Badge>
            )}
          </div>
        </div>

        <div>
          <hr className="border-slate-100 dark:border-slate-800/80 mb-4" />

          {/* Stats Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="space-y-0.5">
              <span className="text-slate-500 block">Avg Fees</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Landmark size={12} className="text-slate-400" />
                {formatFees(college.fees)}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-500 block">Avg Package</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <GraduationCap size={13} className="text-slate-400" />
                ₹{college.placementAverage} LPA
              </span>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/80 mb-4" />

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link href={`/colleges/${college.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full font-semibold">
                View Details
              </Button>
            </Link>

            {/* Compare Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-855 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={handleCompareToggle}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <GitCompare size={14} className="text-slate-500" />
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
export { CollegeCard };

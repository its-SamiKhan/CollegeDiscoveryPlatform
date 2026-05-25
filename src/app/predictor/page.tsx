"use client";

import React, { useState } from "react";
import { Search, Loader2, Sparkles, Award, HelpCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { CollegeCard } from "@/components/college/CollegeCard";
import { CollegeCardSkeleton } from "@/components/ui/Skeleton";
import { useToastStore } from "@/store/toastStore";

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

export default function PredictorPage() {
  const { addToast } = useToastStore();
  const [exam, setExam] = useState("jee-advanced");
  const [rank, setRank] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<College[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [queried, setQueried] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rank || Number(rank) <= 0) {
      addToast("Please enter a valid rank or percentile.", "warning");
      return;
    }

    setLoading(true);
    setQueried(true);
    try {
      const res = await fetch("/api/predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, rank }),
      });
      const json = await res.json();

      if (json.success) {
        setResults(json.data.colleges);
        setMessage(json.data.message);
      } else {
        addToast(json.message || "Failed to query predictor.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("A network error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getRankPlaceholder = () => {
    switch (exam) {
      case "cat":
        return "e.g. 98.5 (Percentile)";
      case "jee-advanced":
      case "jee-main":
      case "neet":
      default:
        return "e.g. 2500 (AIR Rank)";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 dark:border-indigo-950 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-sm mb-4">
          <Sparkles size={13} />
          AI Admission Predictor Tool
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-905 dark:text-white leading-tight">
          Find Colleges matching your <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Rank & Scores</span>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Input your entrance exam rank or percentile score to discover recommended colleges where you meet the cutoffs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input Console */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-20">
            <CardBody className="p-6">
              <form onSubmit={handlePredict} className="space-y-5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <Award className="text-indigo-600" size={16} />
                  Predictor Console
                </h3>

                {/* Exam select */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold block">Select Exam</label>
                  <select
                    value={exam}
                    onChange={(e) => {
                      setExam(e.target.value);
                      setRank("");
                      setQueried(false);
                    }}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 dark:text-slate-200"
                  >
                    <option value="jee-advanced">JEE Advanced (B.Tech)</option>
                    <option value="jee-main">JEE Main (B.Tech/NITs)</option>
                    <option value="cat">CAT (MBA Percentile)</option>
                    <option value="neet">NEET (MBBS/Medical)</option>
                  </select>
                </div>

                {/* Rank input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold block">
                    {exam === "cat" ? "Enter Percentile" : "Enter AIR Rank"}
                  </label>
                  <input
                    type="number"
                    step={exam === "cat" ? "0.01" : "1"}
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder={getRankPlaceholder()}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg shadow-sm outline-none focus:border-indigo-500 dark:text-slate-200"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full font-bold shadow-md" isLoading={loading}>
                  Predict Colleges
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right: Results list */}
        <div className="lg:col-span-3">
          {loading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
          ) : !queried ? (
            /* Unqueried welcome block */
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <HelpCircle size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Predictions Awaiting</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Enter your test credentials in the console on the left, and click predict to display the matching colleges dynamically.
              </p>
            </div>
          ) : results.length === 0 ? (
            /* Empty results block */
            <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-slate-105 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                <GraduationCap size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Admissions Match</h3>
              <p className="text-sm text-slate-500 max-w-md">
                {message || "We couldn't find any elite colleges matching your rank cutoffs. Try inputting a higher score or checking other exams."}
              </p>
            </div>
          ) : (
            /* Prediction Results */
            <div className="space-y-6">
              {/* Feedback alert banner */}
              {message && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-950 dark:text-indigo-300 px-5 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
                  <Sparkles className="text-indigo-600 flex-shrink-0" size={18} />
                  <span>{message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { PredictorPage };

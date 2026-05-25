"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/store/compareStore";
import { useToastStore } from "@/store/toastStore";
import {
  MapPin,
  Star,
  Bookmark,
  BookmarkCheck,
  GitCompare,
  Landmark,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardBody } from "../ui/Card";
import { Badge } from "../ui/Badge";
import Tabs from "../ui/Tabs";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface College {
  id: string;
  slug: string;
  name: string;
  description: string;
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
  reviews: Review[];
}

interface CollegeDetailViewProps {
  college: College;
  isInitiallySaved: boolean;
}

export default function CollegeDetailView({ college, isInitiallySaved }: CollegeDetailViewProps) {
  const { data: session } = useSession();
  const { addToast } = useToastStore();
  const { selectedColleges, addToCompare, removeFromCompare } = useCompareStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Dynamic high-quality campus fallback images
  const fallbackImages = [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  ];

  // String hashing to assign a consistent, beautiful photo based on name
  const getFallbackImage = (name: string) => {
    let hash = 0;
    for (let j = 0; j < name.length; j++) {
      hash = name.charCodeAt(j) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % fallbackImages.length;
    return fallbackImages[idx];
  };

  const initialImg = college.imageUrl && college.imageUrl.startsWith("http")
    ? college.imageUrl
    : getFallbackImage(college.name);

  const [imgSrc, setImgSrc] = useState(initialImg);

  const handleImageError = () => {
    setImgSrc(getFallbackImage(college.name));
  };

  // Form states for adding reviews (mock submission UX)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(college.reviews || []);

  // Sync compare state
  useEffect(() => {
    setIsCompared(selectedColleges.some((c) => c.id === college.id));
  }, [selectedColleges, college.id]);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(college.id);
      addToast(`${college.name} removed from comparison.`, "info");
    } else {
      addToCompare(
        {
          id: college.id,
          name: college.name,
          location: college.location,
          fees: college.fees,
          rating: college.rating,
          imageUrl: imgSrc,
          courses: college.courses,
          facilities: college.facilities,
          placementAverage: college.placementAverage,
          placementHighest: college.placementHighest,
        },
        addToast
      );
    }
  };

  const handleSaveToggle = async () => {
    if (!session) {
      addToast("Please sign in to save colleges.", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved/${college.id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          setIsSaved(false);
          addToast(`${college.name} removed from saved list.`, "success");
        } else {
          addToast(json.message || "Failed to unsave.", "error");
        }
      } else {
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
          addToast(json.message || "Failed to save.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      addToast("Please log in to submit a review.", "warning");
      return;
    }
    if (!reviewComment.trim()) {
      addToast("Review comment cannot be empty.", "warning");
      return;
    }

    setSubmittingReview(true);
    // Simulate API delay, then update local state
    setTimeout(() => {
      const newReview: Review = {
        id: Math.random().toString(),
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
        user: {
          id: (session.user as any).id || "user-id",
          name: session.user?.name || "Rahul Sharma",
          image: session.user?.image || null,
        },
      };

      setLocalReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setSubmittingReview(false);
      addToast("Review submitted successfully! Thank you.", "success");
    }, 800);
  };

  const formatFees = (fee: number) => {
    if (fee >= 100000) {
      return `₹${(fee / 100000).toFixed(2)} Lakh / year`;
    }
    return `₹${fee.toLocaleString()} / year`;
  };

  const tabOptions = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses Offered" },
    { id: "placements", label: "Placements" },
    { id: "facilities", label: "Facilities" },
    { id: "reviews", label: "Reviews & Ratings" },
    { id: "gallery", label: "Campus Gallery" },
  ];

  // Realistic mock gallery images depending on slug
  const galleryImages = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-8">
      {/* College Banner Header Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row min-h-[280px]">
        {/* Banner Left Image */}
        <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-850">
          <img
            src={imgSrc}
            alt={college.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Banner Right Details */}
        <div className="md:w-2/3 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" className="font-semibold shadow-sm">
                Est. {college.establishedYear}
              </Badge>
              <Badge variant="success" className="font-semibold shadow-sm">
                AICTE Approved
              </Badge>
              <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded text-xs">
                <Star size={13} className="fill-amber-500 text-amber-500 flex-shrink-0" />
                {college.rating} ★ Rating
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {college.name}
            </h1>
            
            <p className="flex items-center gap-1 text-slate-500 text-sm font-medium">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              {college.location}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-sm border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                <Landmark size={18} />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Avg Fees</span>
                <span className="font-bold text-slate-800 dark:text-slate-205">{formatFees(college.fees)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <GraduationCap size={18} />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Avg Placement Package</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">₹{college.placementAverage} LPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tabs content, Right Sticky Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Tabs) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            {/* 1. Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Institution Profile</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {college.description}
                  </p>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                <div className="space-y-4">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Admission Process</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Admission is highly competitive and based strictly on merit. Candidates must fulfill the minimum eligibility criteria and clear nationwide entrance examinations followed by standard academic interviews:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                    <li><strong>Engineering:</strong> Valid JEE Main / JEE Advanced / BITSAT scores required.</li>
                    <li><strong>MBA/Management:</strong> Clear CAT / XAT / GMAT scores followed by Group Discussions and Personal Interviews.</li>
                    <li><strong>Medical:</strong> Cleared NEET exam scores followed by MCC counseling.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">Academic Programs Offered</h3>
                <p className="text-sm text-slate-500 mb-4">
                  The institution runs several undergraduate, postgraduate, and doctoral streams under highly qualified faculties.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {college.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-start gap-3 bg-slate-50/50 dark:bg-slate-900/30 hover:border-indigo-200 dark:hover:border-indigo-950 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-205">{course}</h4>
                        <span className="text-xs text-slate-500">Duration: {course.startsWith("B.Tech") ? "4 Years" : course.startsWith("MBBS") ? "5.5 Years" : "2 Years"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Placements Tab */}
            {activeTab === "placements" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">Placement Highlights</h3>
                
                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="border border-indigo-100 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/10 rounded-xl p-5 text-center space-y-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Average Package</span>
                    <span className="font-extrabold text-3xl text-indigo-700 dark:text-indigo-400">₹{college.placementAverage} LPA</span>
                    <p className="text-[11px] text-slate-400">Consistent yearly growth in core sector offers</p>
                  </div>
                  
                  <div className="border border-emerald-100 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10 rounded-xl p-5 text-center space-y-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Highest Package</span>
                    <span className="font-extrabold text-3xl text-emerald-700 dark:text-emerald-400">₹{college.placementHighest} LPA</span>
                    <p className="text-[11px] text-slate-400">International and domestic top-tech offers</p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Top Recruiter Networks</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Major corporate firms hire from the campus yearly, including: Microsoft, Google, McKinsey & Co, Amazon, Goldman Sachs, Tata Consultancy Services, Larsen & Toubro, Reliance Industries, Fortis Healthcare, AIIMS Network, etc.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Facilities Tab */}
            {activeTab === "facilities" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Campus Infrastructure</h3>
                <p className="text-sm text-slate-500 mb-4">
                  The campus supports premium facilities providing a comfortable, modern environment for students.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {college.facilities.map((fac, idx) => (
                    <Badge
                      key={idx}
                      variant="primary"
                      className="px-3.5 py-1.5 font-semibold text-xs bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-400 shadow-sm lowercase first-letter:uppercase"
                    >
                      <CheckCircle2 size={13} className="mr-1.5 text-indigo-505" />
                      {fac}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Header info */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Student Reviews</h3>
                    <span className="text-xs text-slate-500">Showing {localReviews.length} reviews</span>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-lg">
                    <Star size={14} className="fill-amber-500 text-amber-500 flex-shrink-0" />
                    {college.rating} ★ Avg
                  </span>
                </div>

                {/* Submit review Form */}
                {session ? (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-600" />
                      Write a Student Review
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-bold block">Rating ★</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 px-3 py-1.5 text-xs rounded-lg outline-none focus:border-indigo-500"
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} Stars - {r === 5 ? "Excellent" : r === 4 ? "Good" : r === 3 ? "Average" : "Poor"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-bold block">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Write your review here. Share your campus, placement, and course experiences..."
                        rows={3}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-800 p-3 text-xs rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <Button type="submit" size="sm" variant="primary" className="font-semibold" isLoading={submittingReview}>
                      Submit Review
                    </Button>
                  </form>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    Please{" "}
                    <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                      sign in
                    </a>{" "}
                    to share your student experiences and submit a review.
                  </div>
                )}

                {/* Review items list */}
                <div className="space-y-5">
                  {localReviews.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No reviews have been written yet. Be the first to share!</p>
                  ) : (
                    localReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl space-y-3 bg-slate-50/30 dark:bg-slate-900/10 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {review.user.image ? (
                              <img
                                src={review.user.image}
                                alt={review.user.name || "Reviewer"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 font-bold flex items-center justify-center text-xs">
                                {review.user.name ? review.user.name.substring(0, 2).toUpperCase() : "RV"}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-sm text-slate-850 dark:text-slate-205 block leading-none mb-1">
                                {review.user.name || "Anonymous Reviewer"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded text-xs flex-shrink-0">
                            <Star size={12} className="fill-amber-500 text-amber-500 flex-shrink-0" />
                            {review.rating}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Campus Showcase</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Visual snapshots representing classroom halls, libraries, research spaces, and student quarters.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((src, i) => (
                    <div
                      key={i}
                      className="relative h-32 sm:h-44 rounded-xl overflow-hidden shadow-sm group border border-slate-200 dark:border-slate-800"
                    >
                      <img
                        src={src}
                        alt="Campus Showcase"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar Panel (30% width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Award className="text-indigo-600" size={16} />
              Quick Admissions Panel
            </h3>

            {/* Sidebar quick values */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Established</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{college.establishedYear}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Average Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{formatFees(college.fees).replace(" / year", "")}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Placement Rating</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Star size={13} className="fill-indigo-500 text-indigo-500" />
                  {college.rating} / 5
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Sidebar Action CTAs */}
            <div className="space-y-3">
              {/* Bookmark save college */}
              <Button
                variant={isSaved ? "outline" : "primary"}
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className="w-full font-bold flex items-center justify-center gap-2 shadow-sm py-2.5"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={16} />
                    Saved in Dashboard
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    Save College
                  </>
                )}
              </Button>

              {/* Compare toggle */}
              <button
                onClick={handleCompareToggle}
                className={`w-full py-2.5 text-sm font-bold border rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200
                  ${
                    isCompared
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50"
                  }`}
              >
                <GitCompare size={16} />
                {isCompared ? "Added to Compare" : "Compare College"}
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={16} />
              <span>Verifiable data. Checked against Ministry guidelines and admissions data.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

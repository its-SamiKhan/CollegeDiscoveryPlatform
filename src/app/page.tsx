import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Search, Sparkles, GraduationCap, MapPin, ArrowRight, BookOpen, Star, Building2, ShieldCheck, MessageSquare, HelpCircle } from "lucide-react";
import CollegeCard from "@/components/college/CollegeCard";
import { Button } from "@/components/ui/Button";

// Graceful fallback colleges if database connection is not active
const fallbackColleges = [
  {
    id: "fallback-1",
    slug: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    fees: 220000,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    courses: ["B.Tech Computer Science", "B.Tech Mechanical Engineering"],
    facilities: ["Wi-Fi", "Computer Labs", "Hostel"],
    placementAverage: 18.5,
    placementHighest: 48.0,
    establishedYear: 1961,
  },
  {
    id: "fallback-2",
    slug: "iim-ahmedabad",
    name: "Indian Institute of Management Ahmedabad",
    location: "Ahmedabad, Gujarat",
    state: "Gujarat",
    fees: 1200000,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    courses: ["MBA General", "Executive MBA"],
    facilities: ["Wi-Fi", "Seminar Hall", "AC Classrooms"],
    placementAverage: 28.0,
    placementHighest: 75.0,
    establishedYear: 1961,
  },
  {
    id: "fallback-3",
    slug: "aiims-delhi",
    name: "All India Institute of Medical Sciences Delhi",
    location: "New Delhi, Delhi",
    state: "Delhi",
    fees: 12000,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce2?auto=format&fit=crop&w=800&q=80",
    courses: ["MBBS", "MD Pediatrics"],
    facilities: ["Teaching Hospital", "Library", "Labs"],
    placementAverage: 14.5,
    placementHighest: 32.0,
    establishedYear: 1956,
  },
];

async function getFeaturedColleges() {
  try {
    const colleges = await prisma.college.findMany({
      take: 3,
      orderBy: {
        rating: "desc",
      },
    });
    
    if (colleges.length === 0) {
      return fallbackColleges;
    }
    return colleges;
  } catch (error) {
    console.warn("Featured colleges fetch failed, using realistic fallback data", error);
    return fallbackColleges;
  }
}

async function FeaturedCollegesSection() {
  const featuredColleges = await getFeaturedColleges();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredColleges.map((college) => (
        <div key={college.id} className="glow-card rounded-3xl">
          <CollegeCard college={college} />
        </div>
      ))}
    </div>
  );
}

function FeaturedCollegesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-900 rounded-3xl h-[420px]" />
      ))}
    </div>
  );
}

export default async function HomePage() {

  const categories = [
    { name: "Engineering", slug: "engineering", count: "20+ Colleges", icon: <GraduationCap size={22} />, color: "text-blue-600 bg-blue-50/80 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30" },
    { name: "MBA / Business", slug: "mba", count: "20+ Colleges", icon: <Building2 size={22} />, color: "text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30" },
    { name: "Medical / Healthcare", slug: "medical", count: "20+ Colleges", icon: <BookOpen size={22} />, color: "text-rose-600 bg-rose-50/80 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30" }
  ];

  const popularStates = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Telangana", "Uttar Pradesh"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/20 via-white to-slate-50/50 dark:from-slate-900/10 dark:via-slate-950 dark:to-slate-950 pt-10 pb-8 lg:pt-12 lg:pb-10 border-b border-slate-100 dark:border-slate-900/60">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5 lg:space-y-6 animate-in fade-in slide-in-from-top-3 duration-700">
          
          {/* Decorative Badge with Glowing Pulse Ring */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-150 bg-white/90 dark:border-indigo-900/40 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-black shadow-sm tracking-wider uppercase animate-bounce-slow">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 neon-pulse-ring" />
            <Sparkles size={12} className="fill-indigo-500/10" />
            India's Elite Decision Hub
          </div>

          {/* Drifting Gradient Headline (Size scaled down for balanced layout) */}
          <h1 className="max-w-4xl mx-auto text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Discover Your Perfect College & <br />
            <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-600 dark:from-pink-400 dark:via-violet-400 dark:to-indigo-400 bg-[size:200%] animate-gradient-drift bg-clip-text text-transparent">
              Shape Your Academic Future
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Research elite Engineering, Business, and Medical schools with transparent reviews, real-time cutoff metrics, and side-by-side decision models.
          </p>

          {/* Search Console (Crisp Translucent Container with Z-20 - NO BLUR drop shadows) */}
          <div className="max-w-3xl mx-auto z-20 px-2 sm:px-4">
            <form action="/colleges" method="GET" className="relative group">
              {/* Flowing border gradient highlight on hover (sharp, no blur) */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-600 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-none pointer-events-none z-0 animate-gradient-drift bg-[size:200%]" />

              <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3.5 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-600 group-hover:border-transparent transition-all duration-300">
                <Search className="text-indigo-600 dark:text-indigo-400 ml-3.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" size={20} />
                <input
                  type="text"
                  name="search"
                  autoComplete="off"
                  placeholder="Search colleges by name (e.g. IIT Delhi, BITS Pilani, IIM)..."
                  className="w-full bg-transparent border-none outline-none py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-8 rounded-xl transition-colors duration-200 cursor-pointer flex-shrink-0 shadow-none border-none"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Popular/Quick Search Tags Section */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-5 sm:pt-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Popular:</span>
              <Link
                href="/colleges?courseType=engineering"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-all"
              >
                Engineering
              </Link>
              <Link
                href="/colleges?courseType=mba"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-all"
              >
                MBA / Business
              </Link>
              <Link
                href="/colleges?courseType=medical"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-all"
              >
                Medical / MBBS
              </Link>
              <Link
                href="/colleges?rating=4.5"
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-all"
              >
                Top Rated ★
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10 pb-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-905 dark:text-white">
              Explore by Top Academic Streams
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold">
              Filter top-tier institutions instantly categorized by professional careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/colleges?courseType=${cat.slug}`}
                className="group border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 flex items-center justify-between bg-gradient-to-br from-white/90 to-slate-50/50 dark:from-slate-900/80 dark:to-slate-950/40 glow-card relative overflow-hidden"
              >
                {/* Visual card glow backing */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-3.5 rounded-2xl border ${cat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-850 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">{cat.count}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-2 transition-all duration-350 relative z-10" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Colleges Catalog */}
      <section className="py-24 bg-slate-50/60 dark:bg-slate-900/10 border-t border-b border-slate-100 dark:border-slate-900/40 relative">
        {/* Soft background light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-905 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={24} />
                Featured Institutions
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-semibold">
                Top rated universities categorized by student reviews, structural facilities, and placement success.
              </p>
            </div>
            <Link href="/colleges" className="self-center sm:self-auto">
              <Button variant="outline" className="font-extrabold gap-1.5 cursor-pointer shadow-sm hover:scale-105 transition-all">
                Explore Directory
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          <Suspense fallback={<FeaturedCollegesSkeleton />}>
            <FeaturedCollegesSection />
          </Suspense>
        </div>
      </section>

      {/* States location grid */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-905 dark:text-white">
              Discover Colleges by Location
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold">
              Explore outstanding campuses mapped near your regional state.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularStates.map((state) => (
              <Link
                key={state}
                href={`/colleges?state=${state}`}
                className="group border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center glow-card relative overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300 mb-3 shadow-inner border border-slate-100 dark:border-slate-800/80 group-hover:scale-110 group-hover:rotate-6">
                  <MapPin size={20} />
                </div>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {state}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black mt-1 tracking-widest uppercase">
                  Browse List
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Decision Utilities */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/10 border-t border-b border-slate-100 dark:border-slate-900/60 relative">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-905 dark:text-white">
              Smarter Decision-Making Utilities
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold">
              Leverage interactive AI rank predictions and discussions threads built to optimize your student journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Predictor Card */}
            <div className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm flex flex-col justify-between glow-card relative overflow-hidden group">
              {/* Radial gradient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/15 to-violet-500/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-all duration-500" />
              <div className="space-y-6 relative z-10">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Sparkles size={22} className="fill-white/10" />
                </div>
                
                {/* Floating badge */}
                <div className="absolute top-3 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-100 bg-emerald-50 dark:border-emerald-950/20 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 neon-pulse-ring" />
                  98% Accurate
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl text-slate-850 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    AI Admission Rank Predictor
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Input your rank or percentile from national entrance exams like JEE Main, JEE Advanced, NEET, or CAT to immediately view eligible universities where you meet historical cutoff lines.
                  </p>
                </div>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/80 pt-4">
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" />
                    Real-time recommended college lists
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" />
                    Matches engineering, medical, and business cutoffs
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" />
                    Accurate historical cutoff matching
                  </li>
                </ul>
              </div>
              <div className="pt-8 border-t border-slate-50 dark:border-slate-800/50 mt-6 relative z-10">
                <Link href="/predictor">
                  <Button variant="primary" size="sm" className="font-black flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-transform">
                    Launch Predictor Tool
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Discussions Card */}
            <div className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm flex flex-col justify-between glow-card relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/15 to-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-150 transition-all duration-500" />
              <div className="space-y-6 relative z-10">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-violet-500 to-violet-700 text-white shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <MessageSquare size={22} className="fill-white/10" />
                </div>

                {/* Floating badge */}
                <div className="absolute top-3 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-100 bg-violet-50 dark:border-violet-950/20 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 text-[10px] font-extrabold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 neon-pulse-ring" />
                  Active Feed
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl text-slate-850 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Community Discussions Forum
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Have questions about campus culture, hostel rules, or branch changes? Participate in our student discussions board. Ask questions, browse popular topics, and get authentic replies.
                  </p>
                </div>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/80 pt-4">
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow-sm" />
                    Crowdsourced scholar discussions
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow-sm" />
                    Fast reply and answers posting
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow-sm" />
                    Verified user profile tags
                  </li>
                </ul>
              </div>
              <div className="pt-8 border-t border-slate-50 dark:border-slate-800/50 mt-6 relative z-10">
                <Link href="/discussions">
                  <Button variant="violet" size="sm" className="font-black flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 transition-transform">
                    Join Discussions Board
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with structural glows and full mesh background */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white py-24 relative overflow-hidden">
        {/* Glow Visuals */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-800 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10 animate-in fade-in duration-300">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Find Your Dream College?
          </h2>
          <p className="max-w-2xl mx-auto text-indigo-100 text-sm sm:text-base leading-relaxed font-semibold">
            Create an account to save your favorite colleges, build side-by-side comparison models, save student comparisons, and participate in active community forums.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/signup">
              <Button variant="secondary" className="font-black text-indigo-700 shadow-lg px-8 py-3.5 hover:scale-105 transition-transform">
                Register Student Profile
              </Button>
            </Link>
            <Link href="/colleges">
              <button className="border border-white/25 hover:border-white text-white bg-white/10 hover:bg-white/20 font-extrabold px-8 py-3.5 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95">
                Search Directory
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

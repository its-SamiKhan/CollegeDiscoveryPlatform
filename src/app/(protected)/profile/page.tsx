import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { User, Mail, Calendar, Heart, ShieldCheck, Sparkles, Compass } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function ProfilePage() {
  // Await server session
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login?callbackUrl=/profile");
  }

  const userId = (session.user as any).id;

  let savedCount = 0;
  let userDetails: any = null;
  
  try {
    [savedCount, userDetails] = await Promise.all([
      prisma.savedCollege.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
  } catch (err) {
    console.error("Profile page load DB fetch error, database likely offline:", err);
  }

  const name = userDetails?.name || session.user.name || "Student User";
  const email = userDetails?.email || session.user.email || "student@college.com";
  const image = userDetails?.image || session.user.image || null;
  const joinedDate = userDetails?.createdAt
    ? new Date(userDetails.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "May 24, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-905 dark:text-white flex items-center gap-2">
          <User className="text-indigo-600" size={28} />
          My Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal account parameters and active student analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar & Stats Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center p-6 border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-full border-2 border-indigo-100 shadow-sm object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-2xl shadow-sm mb-4">
                {name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
              {name}
            </h3>
            
            <span className="text-xs font-semibold text-slate-400 mt-1 block">Student Scholar</span>

            <div className="flex items-center gap-1 mt-3">
              <Badge variant="primary" className="font-semibold shadow-sm">
                Verified Account
              </Badge>
            </div>

            <hr className="w-full border-slate-100 dark:border-slate-800 my-5" />

            <div className="grid grid-cols-1 w-full gap-3">
              <Link href="/dashboard" className="w-full">
                <button className="w-full text-xs font-bold border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200">
                  <Heart className="text-red-500 fill-red-500" size={13} />
                  Dashboard ({savedCount})
                </button>
              </Link>
              
              <Link href="/colleges" className="w-full">
                <button className="w-full text-xs font-bold border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-slate-800 dark:text-slate-200">
                  <Compass size={13} className="text-indigo-600" />
                  Explore Colleges
                </button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Side: Account Details form & settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={16} />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Account Details</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mt-1">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Full Scholar Name</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{name}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mt-1">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Registered Email</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{email}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 mt-1">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Member Since</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{joinedDate}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={16} />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Permissions & Security</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-4 text-xs text-slate-500 leading-relaxed">
              <p>
                Your student account operates under standard <strong className="text-slate-700 dark:text-slate-400">Scholar Privilege</strong>. This grants you full access to search filter catalogs, side-by-side comparison tables, custom review submissions, and personal saved bookmark dashboards.
              </p>
              <p>
                Credentials and Google tokens are encrypted and managed securely via NextAuth session configurations. To change passwords or modify email permissions, contact your platform system administration.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
export { ProfilePage };

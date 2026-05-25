import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SavedDashboardView from "@/components/college/SavedDashboardView";

export default async function DashboardPage() {
  // Await server session
  const session = await getServerSession(authOptions);

  // Secure redirection for unauthorized browsers
  if (!session || !session.user || !(session.user as any).id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userId = (session.user as any).id;
  const userName = session.user.name || "Student User";

  let savedColleges: any[] = [];
  let savedComparisons: any[] = [];
  try {
    const list = await prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    savedColleges = list.map((item) => item.college);

    const compareList = await prisma.savedComparison.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    savedComparisons = await Promise.all(
      compareList.map(async (item) => {
        const colleges = await prisma.college.findMany({
          where: {
            id: { in: item.collegeIds },
          },
        });
        return {
          id: item.id,
          collegeIds: item.collegeIds,
          createdAt: item.createdAt.toISOString(),
          colleges: colleges.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          })),
        };
      })
    );
  } catch (error) {
    console.error("Dashboard fetch failed, database likely offline:", error);
    // Fallback: gracefully display empty dashboard instead of crashing
  }

  // Pre-serialize Date objects for clean Client component rendering
  const serializedColleges = savedColleges.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <SavedDashboardView
      initialColleges={serializedColleges}
      initialComparisons={savedComparisons}
      userName={userName}
    />
  );
}
export { DashboardPage };

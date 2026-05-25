import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CollegeDetailView from "@/components/college/CollegeDetailView";

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params for Next.js 15+ App Router compliance
  const { id } = await params;

  // Query Database directly on the Server (fully SEO optimized)
  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!college) {
    notFound();
  }

  // Pre-calculate initial save state for logged-in user
  const session = await getServerSession(authOptions);
  let isInitiallySaved = false;

  if (session && (session.user as any).id) {
    const userId = (session.user as any).id;
    const saved = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId: id,
        },
      },
    });
    isInitiallySaved = !!saved;
  }

  // Serialize Date properties into strings to safely pass to the Client Component
  const formattedCollege = {
    ...college,
    createdAt: college.createdAt.toISOString(),
    reviews: college.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return (
    <CollegeDetailView
      college={formattedCollege as any}
      isInitiallySaved={isInitiallySaved}
    />
  );
}
export { CollegeDetailPage };

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DiscussionThreadView from "@/components/college/DiscussionThreadView";

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params for Next.js 15+ App Router compliance
  const { id } = await params;

  // Query Database directly on the Server (fully SEO optimized)
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      answers: {
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
          createdAt: "asc",
        },
      },
    },
  });

  if (!question) {
    notFound();
  }

  // Pre-serialize Date properties to safely pass to the Client Component
  const serializedQuestion = {
    ...question,
    createdAt: question.createdAt.toISOString(),
    answers: question.answers.map((ans) => ({
      ...ans,
      createdAt: ans.createdAt.toISOString(),
    })),
  };

  return <DiscussionThreadView question={serializedQuestion as any} />;
}
export { DiscussionDetailPage };

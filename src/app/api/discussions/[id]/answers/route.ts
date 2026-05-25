import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const answerSchema = z.object({
  content: z.string().min(5, "Reply must be at least 5 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. Please log in first.",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    // Await params for Next.js 15+ App Router compliance
    const { id: questionId } = await params;

    const body = await req.json().catch(() => ({}));
    const parsed = answerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Verify question exists in DB
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question thread not found",
        },
        { status: 404 }
      );
    }

    // Insert answer
    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId,
        content,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: answer,
      message: "Reply submitted successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/discussions/[id]/answers error:", error);
    
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed.",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while posting reply",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

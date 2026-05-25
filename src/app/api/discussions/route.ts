import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const questionSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be under 150 characters"),
  content: z.string()
    .min(10, "Content must be at least 10 characters"),
});

export async function GET(req: NextRequest) {
  try {
    const list = await prisma.question.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: list,
      message: "Discussions retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET /api/discussions error:", error);
    
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
        message: "An internal server error occurred while retrieving discussions",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}));
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { title, content } = parsed.data;

    // Insert new question
    const question = await prisma.question.create({
      data: {
        userId,
        title,
        content,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: question,
      message: "Question posted successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/discussions error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while posting question",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

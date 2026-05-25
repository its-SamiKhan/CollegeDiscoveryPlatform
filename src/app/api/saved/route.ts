import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const savedSchema = z.object({
  collegeId: z.string().min(1, "College ID is required"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. Please log in.",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const colleges = savedColleges.map((sc) => sc.college);

    return NextResponse.json({
      success: true,
      data: colleges,
      message: "Saved colleges retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET /api/saved error:", error);
    
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please try again later.",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while retrieving saved colleges",
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
    const parsed = savedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid input data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { collegeId } = parsed.data;

    // Check if college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json(
        {
          success: false,
          message: "College not found",
        },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: college,
        message: "College is already saved",
      });
    }

    // Save college
    const saved = await prisma.savedCollege.create({
      data: {
        userId,
        collegeId,
      },
      include: {
        college: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: saved.college,
      message: "College saved successfully to dashboard",
    });
  } catch (error: any) {
    console.error("POST /api/saved error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while saving college",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

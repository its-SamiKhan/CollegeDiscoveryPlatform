import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const savedCompareSchema = z.object({
  collegeIds: z.array(z.string())
    .min(2, "Select at least 2 colleges")
    .max(3, "Select up to 3 colleges"),
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

    // Fetch saved comparisons list
    const list = await prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Populate compared college card details dynamically
    const populated = await Promise.all(
      list.map(async (item) => {
        const colleges = await prisma.college.findMany({
          where: {
            id: { in: item.collegeIds },
          },
        });
        return {
          id: item.id,
          collegeIds: item.collegeIds,
          createdAt: item.createdAt,
          colleges,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: populated,
      message: "Saved comparisons retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET /api/compare/saved error:", error);
    
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
        message: "An internal server error occurred while retrieving comparisons",
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
    const parsed = savedCompareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { collegeIds } = parsed.data;

    // Verify colleges exist in DB
    const colleges = await prisma.college.findMany({
      where: {
        id: { in: collegeIds },
      },
    });

    if (colleges.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected colleges are invalid or missing",
        },
        { status: 404 }
      );
    }

    // Save comparison set
    const saved = await prisma.savedComparison.create({
      data: {
        userId,
        collegeIds,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        collegeIds: saved.collegeIds,
        colleges,
      },
      message: "Comparison saved successfully!",
    });
  } catch (error: any) {
    console.error("POST /api/compare/saved error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while saving comparison",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

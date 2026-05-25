import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    // Await params for Next.js 15+ compliance
    const { id: collegeId } = await params;

    // Check if it was saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "This college is not saved in your dashboard",
        },
        { status: 404 }
      );
    }

    // Delete saved college record
    await prisma.savedCollege.delete({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: "College removed from saved list successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/saved/[id] error:", error);
    
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
        message: "An internal server error occurred while removing saved college",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

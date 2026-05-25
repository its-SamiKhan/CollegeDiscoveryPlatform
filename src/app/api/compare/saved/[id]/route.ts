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
    
    // Await params for Next.js 15+ App Router compliance
    const { id } = await params;

    // Check if it belongs to user
    const existing = await prisma.savedComparison.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Saved comparison not found or unauthorized",
        },
        { status: 404 }
      );
    }

    // Delete saved comparison
    await prisma.savedComparison.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: "Saved comparison deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/compare/saved/[id] error:", error);
    
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
        message: "An internal server error occurred while deleting saved comparison",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

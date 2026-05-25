import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const compareSchema = z.object({
  collegeIds: z.array(z.string())
    .min(2, "Select at least 2 colleges to compare")
    .max(3, "You can compare up to 3 colleges at a time"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = compareSchema.safeParse(body);

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

    const { collegeIds } = parsed.data;

    // Check for duplicates in inputs
    const uniqueIds = Array.from(new Set(collegeIds));
    if (uniqueIds.length !== collegeIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot compare duplicate colleges",
        },
        { status: 400 }
      );
    }

    // Fetch colleges
    const colleges = await prisma.college.findMany({
      where: {
        id: { in: collegeIds },
      },
    });

    if (colleges.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not retrieve at least 2 valid colleges for comparison",
        },
        { status: 404 }
      );
    }

    // Calculate highlight properties
    let lowestFeesId = colleges[0].id;
    let lowestFees = colleges[0].fees;

    let highestPlacementAvgId = colleges[0].id;
    let highestPlacementAvg = colleges[0].placementAverage;

    let highestPlacementHighestId = colleges[0].id;
    let highestPlacementHighest = colleges[0].placementHighest;

    let highestRatingId = colleges[0].id;
    let highestRating = colleges[0].rating;

    colleges.forEach((c) => {
      if (c.fees < lowestFees) {
        lowestFees = c.fees;
        lowestFeesId = c.id;
      }
      if (c.placementAverage > highestPlacementAvg) {
        highestPlacementAvg = c.placementAverage;
        highestPlacementAvgId = c.id;
      }
      if (c.placementHighest > highestPlacementHighest) {
        highestPlacementHighest = c.placementHighest;
        highestPlacementHighestId = c.id;
      }
      if (c.rating > highestRating) {
        highestRating = c.rating;
        highestRatingId = c.id;
      }
    });

    const comparisonData = {
      colleges,
      highlights: {
        lowestFeesId,
        highestPlacementAvgId,
        highestPlacementHighestId,
        highestRatingId,
      },
    };

    return NextResponse.json({
      success: true,
      data: comparisonData,
      message: "Colleges compared successfully",
    });
  } catch (error: any) {
    console.error("POST /api/compare error:", error);
    
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please check your connection config.",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred during comparison computation",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

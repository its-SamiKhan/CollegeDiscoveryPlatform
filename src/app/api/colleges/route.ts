import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  feesMin: z.coerce.number().min(0).optional(),
  feesMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  courseType: z.string().optional(), // "engineering" | "mba" | "medical"
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(9),
  sortBy: z.enum(["rating", "fees", "placementAverage", "placementHighest", "establishedYear"]).default("rating"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Mapping for course categories to match exact seeded values at DB level
const COURSE_TYPE_MAPPING: { [key: string]: string[] } = {
  engineering: [
    "B.Tech Computer Science",
    "B.Tech Electronics & Communication",
    "B.Tech Mechanical Engineering",
    "B.Tech Civil Engineering",
    "M.Tech Data Science",
    "M.Tech Artificial Intelligence"
  ],
  mba: [
    "MBA General",
    "MBA Finance",
    "MBA Marketing",
    "MBA Human Resources",
    "Executive MBA",
    "MBA Business Analytics"
  ],
  medical: [
    "MBBS",
    "BDS Dental Surgery",
    "MD Pediatrics",
    "MS General Surgery",
    "B.Sc Nursing",
    "MD General Medicine"
  ]
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query params
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsedResult = querySchema.safeParse(rawParams);
    
    if (!parsedResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors: parsedResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      search,
      state,
      feesMin,
      feesMax,
      rating,
      courseType,
      page,
      limit,
      sortBy,
      sortOrder,
    } = parsedResult.data;

    // Build query filters
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (state && state !== "all") {
      where.state = {
        equals: state,
        mode: "insensitive",
      };
    }

    if (feesMin !== undefined || feesMax !== undefined) {
      where.fees = {};
      if (feesMin !== undefined) where.fees.gte = feesMin;
      if (feesMax !== undefined) where.fees.lte = feesMax;
    }

    if (rating !== undefined) {
      where.rating = {
        gte: rating,
      };
    }

    if (courseType && courseType !== "all") {
      const targetCourses = COURSE_TYPE_MAPPING[courseType.toLowerCase()];
      if (targetCourses) {
        where.courses = {
          hasSome: targetCourses,
        };
      }
    }

    // Pagination calculations
    const skip = (page - 1) * limit;

    // Fetch from Database
    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        colleges,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Colleges retrieved successfully",
    });
  } catch (error: any) {
    console.error("GET /api/colleges error:", error);
    
    // Check if it's a database connection error specifically
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please ensure your DATABASE_URL in .env is active and correct.",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while retrieving colleges",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

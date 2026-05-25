import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const predictorSchema = z.object({
  exam: z.enum(["jee-advanced", "jee-main", "cat", "neet"]),
  rank: z.coerce.number().min(0, "Rank / Percentile must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = predictorSchema.safeParse(body);

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

    const { exam, rank } = parsed.data;

    let matchedColleges: any[] = [];
    let message = "Rank is outside major cutoffs. Consider expanding your filters or search criteria.";

    if (exam === "jee-advanced") {
      if (rank <= 1500) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["Indian Institute of Technology Delhi", "Indian Institute of Technology Bombay", "Indian Institute of Technology Madras"] },
          },
        });
        message = "Excellent rank! You qualify for the absolute premier IITs (Delhi, Bombay, Madras).";
      } else if (rank <= 5000) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["IIT Kanpur", "IIT Kharagpur", "IIT Roorkee", "IIIT Hyderabad"] },
          },
        });
        message = "Fantastic rank! You qualify for top-tier IITs (Kanpur, Kharagpur, Roorkee) and IIIT Hyderabad.";
      }
    } else if (exam === "jee-main") {
      if (rank <= 10000) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["National Institute of Technology Trichy", "Delhi Technological University", "IIIT Delhi", "NIT Surathkal", "Birla Institute of Technology and Science Pilani"] },
          },
        });
        message = "Awesome score! You qualify for top NITs, BITS Pilani, and DTU.";
      } else if (rank <= 25000) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["College of Engineering Pune", "RV College of Engineering", "Ramaiah Institute of Technology", "PSG College of Technology", "Thapar Institute of Engineering and Technology", "Manipal Institute of Technology"] },
          },
        });
        message = "Good rank! You qualify for premier private and state universities.";
      }
    } else if (exam === "cat") {
      // rank is percentile (e.g. 99)
      if (rank >= 98) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["Indian Institute of Management Ahmedabad", "Indian Institute of Management Bangalore", "Indian Institute of Management Calcutta"] },
          },
        });
        message = "Outstanding percentile! You qualify for the elite IIM Ahmedabad, Bangalore, and Calcutta.";
      } else if (rank >= 95) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["XLRI Xavier School of Management", "Faculty of Management Studies Delhi", "SPJIMR Mumbai", "Indian Institute of Management Lucknow", "Indian Institute of Management Kozhikode", "Indian Institute of Management Indore"] },
          },
        });
        message = "Excellent percentile! You qualify for FMS, XLRI, SPJIMR, and other top-tier IIMs.";
      } else if (rank >= 90) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["Management Development Institute Gurgaon", "Symbiosis Institute of Business Management", "NMIMS School of Business Management", "IMT Ghaziabad", "Goa Institute of Management"] },
          },
        });
        message = "Great percentile! You qualify for MDI, SIBM, NMIMS, and Goa Institute of Management.";
      }
    } else if (exam === "neet") {
      if (rank <= 1000) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["All India Institute of Medical Sciences Delhi", "Christian Medical College Vellore", "Armed Forces Medical College"] },
          },
        });
        message = "Incredible rank! You qualify for AIIMS Delhi, CMC Vellore, and AFMC Pune.";
      } else if (rank <= 4000) {
        matchedColleges = await prisma.college.findMany({
          where: {
            name: { in: ["Maulana Azad Medical College", "King George's Medical University", "Kasturba Medical College Manipal", "JIPMER Puducherry", "Grant Medical College"] },
          },
        });
        message = "Superb rank! You qualify for premier government medical colleges and Kasturba.";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        colleges: matchedColleges,
        message,
      },
      message: "Predictor query completed successfully",
    });
  } catch (error: any) {
    console.error("POST /api/predictor error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while executing predictor matching",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

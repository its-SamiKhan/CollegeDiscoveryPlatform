import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = signupSchema.safeParse(body);

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

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      message: "Registration successful. You can now log in.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/signup error:", error);
    
    if (error.code === "P1001" || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please ensure the database is active.",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred during registration",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for creating and updating buddies
const buddySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  calendlyLink: z.string().min(1, "Calendly link is required"),
  isActive: z.boolean().default(true),
});

// GET all buddies
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("isActive");
    
    // Build where clause based on query parameters
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    // Get all buddies with their request counts
    const buddies = await prisma.buddy.findMany({
      where,
      include: {
        _count: {
          select: {
            buddyRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(buddies);
  } catch (error) {
    console.error("Error fetching buddies:", error);
    return NextResponse.json(
      { message: "Error fetching buddies" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST new buddy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validatedData = buddySchema.parse(body);
    
    // Check if email already exists
    const existingBuddy = await prisma.buddy.findUnique({
      where: {
        email: validatedData.email,
      },
    });
    
    if (existingBuddy) {
      return NextResponse.json(
        { message: "A buddy with this email already exists" },
        { status: 400 }
      );
    }
    
    // Create new buddy
    const buddy = await prisma.buddy.create({
      data: validatedData,
    });
    
    return NextResponse.json(
      { message: "Buddy created successfully", buddy },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating buddy:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating buddy" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
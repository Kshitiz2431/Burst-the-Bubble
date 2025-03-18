import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for updating buddies
const buddyUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional().nullable(),
  calendlyLink: z.string().min(1, "Calendly link is required").optional(),
  isActive: z.boolean().optional(),
});

// GET buddy by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find buddy by ID
    const buddy = await prisma.buddy.findUnique({
      where: { id },
      include: {
        buddyRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    if (!buddy) {
      return NextResponse.json(
        { message: "Buddy not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(buddy);
  } catch (error) {
    console.error("Error fetching buddy:", error);
    return NextResponse.json(
      { message: "Error fetching buddy" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT update buddy
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate request data
    const validatedData = buddyUpdateSchema.parse(body);
    
    // Check if buddy exists
    const existingBuddy = await prisma.buddy.findUnique({
      where: { id },
    });
    
    if (!existingBuddy) {
      return NextResponse.json(
        { message: "Buddy not found" },
        { status: 404 }
      );
    }
    
    // Check if email is being updated and if it already exists
    if (validatedData.email && validatedData.email !== existingBuddy.email) {
      const emailExists = await prisma.buddy.findUnique({
        where: {
          email: validatedData.email,
        },
      });
      
      if (emailExists) {
        return NextResponse.json(
          { message: "A buddy with this email already exists" },
          { status: 400 }
        );
      }
    }
    
    // Update buddy
    const updatedBuddy = await prisma.buddy.update({
      where: { id },
      data: validatedData,
    });
    
    return NextResponse.json({
      message: "Buddy updated successfully",
      buddy: updatedBuddy,
    });
  } catch (error) {
    console.error("Error updating buddy:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating buddy" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE buddy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if buddy exists
    const existingBuddy = await prisma.buddy.findUnique({
      where: { id },
      include: {
        buddyRequests: {
          where: {
            status: {
              in: ["PENDING", "ASSIGNED"],
            },
          },
        },
      },
    });
    
    if (!existingBuddy) {
      return NextResponse.json(
        { message: "Buddy not found" },
        { status: 404 }
      );
    }
    
    // Check if buddy has active requests
    if (existingBuddy.buddyRequests.length > 0) {
      return NextResponse.json(
        { 
          message: "Cannot delete buddy with active requests. Set isActive to false instead.",
          activeRequests: existingBuddy.buddyRequests.length
        },
        { status: 400 }
      );
    }
    
    // Delete buddy
    await prisma.buddy.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: "Buddy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting buddy:", error);
    return NextResponse.json(
      { message: "Error deleting buddy" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
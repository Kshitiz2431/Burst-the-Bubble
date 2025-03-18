import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BuddyRequestStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for updating buddy requests
const buddyRequestUpdateSchema = z.object({
  status: z.enum(["PENDING", "ASSIGNED", "COMPLETED", "CANCELLED"]).optional(),
  assignedBuddyId: z.string().optional().nullable(),
});

// GET buddy request by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find buddy request by ID
    const buddyRequest = await prisma.buddyRequest.findUnique({
      where: { id },
      include: {
        assignedBuddy: true,
      },
    });
    
    if (!buddyRequest) {
      return NextResponse.json(
        { message: "Buddy request not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(buddyRequest);
  } catch (error) {
    console.error("Error fetching buddy request:", error);
    return NextResponse.json(
      { message: "Error fetching buddy request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT update buddy request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate request data
    const validatedData = buddyRequestUpdateSchema.parse(body);
    
    // Check if buddy request exists
    const existingRequest = await prisma.buddyRequest.findUnique({
      where: { id },
      include: {
        assignedBuddy: true,
      },
    });
    
    if (!existingRequest) {
      return NextResponse.json(
        { message: "Buddy request not found" },
        { status: 404 }
      );
    }
    
    // If assignedBuddyId is provided, check if buddy exists and is active
    if (validatedData.assignedBuddyId) {
      const buddy = await prisma.buddy.findUnique({
        where: { id: validatedData.assignedBuddyId },
      });
      
      if (!buddy) {
        return NextResponse.json(
          { message: "Assigned buddy not found" },
          { status: 400 }
        );
      }
      
      if (!buddy.isActive) {
        return NextResponse.json(
          { message: "Cannot assign to inactive buddy" },
          { status: 400 }
        );
      }
      
      // If changing buddy, check if new buddy is available for the time slot
      if (existingRequest.assignedBuddyId !== validatedData.assignedBuddyId) {
        const conflictingRequests = await prisma.buddyRequest.findMany({
          where: {
            assignedBuddyId: validatedData.assignedBuddyId,
            preferredDate: existingRequest.preferredDate,
            timeSlot: existingRequest.timeSlot,
            status: {
              in: ["PENDING", "ASSIGNED"],
            },
            id: {
              not: id, // Exclude current request
            },
          },
        });
        
        if (conflictingRequests.length > 0) {
          return NextResponse.json(
            { message: "Buddy is not available for this time slot" },
            { status: 400 }
          );
        }
      }
    }
    
    // Update buddy request
    const updatedRequest = await prisma.buddyRequest.update({
      where: { id },
      data: validatedData,
      include: {
        assignedBuddy: true,
      },
    });
    
    return NextResponse.json({
      message: "Buddy request updated successfully",
      buddyRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating buddy request:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error updating buddy request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE buddy request (or mark as cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if buddy request exists
    const existingRequest = await prisma.buddyRequest.findUnique({
      where: { id },
    });
    
    if (!existingRequest) {
      return NextResponse.json(
        { message: "Buddy request not found" },
        { status: 404 }
      );
    }
    
    // Instead of deleting, mark as cancelled
    const cancelledRequest = await prisma.buddyRequest.update({
      where: { id },
      data: {
        status: "CANCELLED" as BuddyRequestStatus,
      },
    });
    
    return NextResponse.json({
      message: "Buddy request cancelled successfully",
      buddyRequest: cancelledRequest,
    });
  } catch (error) {
    console.error("Error cancelling buddy request:", error);
    return NextResponse.json(
      { message: "Error cancelling buddy request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
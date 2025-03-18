import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BuddyRequestType, BuddyMode, BuddyRequestStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Define schema for validation
const buddyRequestSchema = z.object({
  type: z.enum(["FRIENDLY", "DETAILED"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  preferredDate: z.string().or(z.date()),
  timeSlot: z.string(),
  mode: z.enum(["CHAT", "CALL", "VIDEO"]),
  message: z.string().min(10),
  extraInfo: z.string().optional(),
  acknowledged: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the terms",
  }),
});

// Helper function to find an available buddy
async function findAvailableBuddy(preferredDate: Date, timeSlot: string) {
  try {
    // Get all active buddies
    const activeBuddies = await prisma.buddy.findMany({
      where: {
        isActive: true,
      },
      include: {
        buddyRequests: {
          where: {
            preferredDate,
            timeSlot,
            status: {
              in: ["PENDING", "ASSIGNED"]
            }
          }
        },
      },
    });

    if (activeBuddies.length === 0) {
      return null; // No active buddies found
    }

    // Filter out buddies who are already busy at the requested time slot
    const availableBuddies = activeBuddies.filter(buddy => 
      buddy.buddyRequests.length === 0
    );

    if (availableBuddies.length === 0) {
      return null; // No available buddies for the requested time slot
    }

    // Get request counts for each buddy to implement fair distribution
    const buddyRequestCounts = await Promise.all(
      availableBuddies.map(async (buddy) => {
        const count = await prisma.buddyRequest.count({
          where: {
            assignedBuddyId: buddy.id,
            status: {
              in: ["PENDING", "ASSIGNED"]
            }
          }
        });
        return { buddy, count };
      })
    );

    // Sort by request count (ascending) for fair distribution
    buddyRequestCounts.sort((a, b) => a.count - b.count);

    // Return the buddy with the fewest assigned requests
    return buddyRequestCounts[0].buddy;
  } catch (error) {
    console.error("Error finding available buddy:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validatedData = buddyRequestSchema.parse(body);
    
    // Ensure preferredDate is a Date object
    const preferredDate = validatedData.preferredDate instanceof Date
      ? validatedData.preferredDate
      : new Date(validatedData.preferredDate);
    
    // Find an available buddy for the requested time slot
    const availableBuddy = await findAvailableBuddy(preferredDate, validatedData.timeSlot);
    
    if (!availableBuddy) {
      return NextResponse.json(
        { message: "All buddies are busy at this time" },
        { status: 400 }
      );
    }
    
    // Create a new buddy request with the assigned buddy
    const buddyRequest = await prisma.buddyRequest.create({
      data: {
        type: validatedData.type as BuddyRequestType,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        preferredDate,
        timeSlot: validatedData.timeSlot,
        mode: validatedData.mode as BuddyMode,
        message: validatedData.message,
        extraInfo: validatedData.extraInfo || null,
        status: "ASSIGNED" as BuddyRequestStatus,
        assignedBuddyId: availableBuddy.id,
        calendlyLink: availableBuddy.calendlyLink
      },
    });
    
    // TODO: Send email notification to assigned buddy
    
    return NextResponse.json(
      { 
        message: "Buddy request created successfully", 
        requestId: buddyRequest.id,
        buddyName: availableBuddy.name,
        buddyCalendlyLink: availableBuddy.calendlyLink
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating buddy request:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error creating buddy request" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
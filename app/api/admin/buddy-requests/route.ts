import { NextRequest, NextResponse } from "next/server";
import { PrismaClient,Prisma ,BuddyRequestStatus, BuddyRequestType} from "@prisma/client";

const prisma = new PrismaClient();

// GET all buddy requests with filtering
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const buddyId = searchParams.get("buddyId");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build where clause based on query parameters
    const where: Prisma.BuddyRequestWhereInput = {};
    
    if (status && Object.values(BuddyRequestStatus).includes(status as BuddyRequestStatus)) {
      where.status = status as BuddyRequestStatus;
    }
    
    if (buddyId) {
      where.assignedBuddyId = buddyId;
    }
    
    if (type && Object.values(BuddyRequestType).includes(type as BuddyRequestType)) {
      where.type = type as BuddyRequestType;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.buddyRequest.count({
      where,
    });
    
    // Get buddy requests with filtering and pagination
    const buddyRequests = await prisma.buddyRequest.findMany({
      where,
      include: {
        assignedBuddy: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      data: buddyRequests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching buddy requests:", error);
    return NextResponse.json(
      { message: "Error fetching buddy requests" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
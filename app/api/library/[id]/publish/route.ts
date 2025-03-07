// app/api/library/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const itemId = params.id;

    // Fetch current item to get its publish status
    const item = await prisma.libraryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return new NextResponse("Library item not found", { status: 404 });
    }

    // Toggle the published status
    const updatedItem = await prisma.libraryItem.update({
      where: { id: itemId },
      data: {
        published: !item.published,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
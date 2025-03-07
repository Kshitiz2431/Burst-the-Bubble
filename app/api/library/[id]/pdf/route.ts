// app/api/library/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin session for secure access
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const itemId = params.id;

    // Fetch library item from database
    const item = await prisma.libraryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return new NextResponse("Library item not found", { status: 404 });
    }

    // Get signed URL for the PDF
    const signedUrl = await getSignedUrl(item.pdfUrl, 'get');

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error serving PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// app/api/templates/[id]/image/route.ts
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

    const templateId = params.id;

    // Fetch template from database
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Get signed URL for the image
    const signedUrl = await getSignedUrl(template.imageUrl, 'get');

    // Redirect to the signed URL
    // This allows the image to be displayed directly in img tags
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error serving template image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
// app/api/templates/[id]/download/route.ts
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

    // Get signed URL for the image with download parameters
    const signedUrl = await getSignedUrl(template.imageUrl, 'get', {
      ResponseContentDisposition: `attachment; filename="${template.title.replace(/[^a-zA-Z0-9.-]/g, '_')}${getFileExtension(template.imageUrl)}"`,
    });

    // For admin downloads, we don't need to track the download count
    // If you want to track admin downloads separately, you can add that logic here

    // Redirect to the signed URL with download parameters
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error downloading template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to get file extension from S3 key
function getFileExtension(s3Key: string): string {
  const match = s3Key.match(/\.[0-9a-z]+$/i);
  return match ? match[0] : '.jpg'; // Default to .jpg if no extension found
}
// app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3 } from "@/lib/s3";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templateId = params.id;

    // First fetch the template to get the image URL
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Delete the template from the database
    await prisma.template.delete({
      where: { id: templateId },
    });

    // Delete the image from S3
    await deleteFileFromS3(template.imageUrl);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
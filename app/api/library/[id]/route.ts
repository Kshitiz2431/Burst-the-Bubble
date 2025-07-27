// app/api/library/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the item to delete
    const item = await prisma.libraryItem.findUnique({
      where: { id: params.id },
      include: {
        purchases: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Library item not found" },
        { status: 404 }
      );
    }

    // Check if item has any purchases
//    if (item.purchases.length > 0) {
//      return NextResponse.json(
//        { error: "Cannot delete item with existing purchases" },
//        { status: 400 }
//    );
//    }

    // Delete files from S3
    try {
      // Delete PDF
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: item.pdfUrl,
        })
      );

      // Delete cover image
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: item.coverImage,
        })
      );
    } catch (error) {
      console.error("S3 deletion error:", error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await prisma.libraryItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

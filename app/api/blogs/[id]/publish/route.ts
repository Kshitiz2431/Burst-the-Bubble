// app/api/blog/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    const blogId = params.id;

    // Fetch current blog to get its status
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return new NextResponse("Blog not found", { status: 404 });
    }

    // For blogs, we'll toggle between "draft" and "published" status
    const newStatus = blog.status === "draft" ? "published" : "draft";
    
    // Update published datetime if publishing
    const publishedAt = newStatus === "published" ? new Date() : null;

    // Toggle the status
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: newStatus,
        publishedAt
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
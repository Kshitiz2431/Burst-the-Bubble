// app/api/blogs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3 } from "@/lib/s3";

// app/api/blogs/[id]/route.ts

// app/api/blogs/[id]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ... authentication checks ...

    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: "Blog not found" }), 
        { status: 404 }
      );
    }

    // Return the blog with content containing image keys
    return NextResponse.json(blog);

  } catch (error) {
    console.error("Error fetching blog:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ... authentication checks ...

    const data = await request.json();

    // The content already contains image keys instead of URLs
    const updatedBlog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        title: data.title,
        content: data.content, // This now contains image keys
        excerpt: data.excerpt,
        slug: data.slug,
        status: data.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        coverImage: data.coverImage,
        categories: {
          set: [],
          connect: data.categories.map((categoryId: string) => ({ id: categoryId })),
        },
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBlog);

  } catch (error) {
    console.error("Error updating blog:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}
// app/api/blogs/[id]/route.ts

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401 }
      );
    }

    if (!params.id) {
      return new NextResponse(
        JSON.stringify({ message: "Blog ID is required" }), 
        { status: 400 }
      );
    }

    // First get the blog to check if it exists and get the cover image
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: "Blog not found" }), 
        { status: 404 }
      );
    }

    // Delete the blog from the database
    await prisma.blog.delete({
      where: { id: params.id },
    });

    // If blog had a cover image, delete it from S3
    if (blog.coverImage) {
      try {
        await deleteFileFromS3(blog.coverImage);
      } catch (error) {
        console.error('Error deleting cover image from S3:', error);
        // Don't fail the request if S3 deletion fails
      }
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Error deleting blog:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}
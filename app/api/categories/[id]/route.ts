// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if category has any associated blogs or templates
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogs: true,
            templates: true
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if there are associated blogs or templates
    if (category._count.blogs > 0 || category._count.templates > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with associated content",
          message: "This category has associated blogs or templates. Remove those first.",
          count: {
            blogs: category._count.blogs,
            templates: category._count.templates
          }
        },
        { status: 400 }
      );
    }

    // Soft delete the category
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
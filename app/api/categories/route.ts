// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import {z} from "zod";
import { fromZodError } from "zod-validation-error";

const CategoryCreateSchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(50, "Category name cannot exceed 50 characters"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
});

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("categories creation endpoint")

    // Parse and validate request body
    const body = await req.json();
    
    const validationResult = CategoryCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationError.message 
        },
        { status: 400 }
      );
    }

    const { name, slug } = validationResult.data;

    // Check if category with same name or slug exists
    const existingCategory = await db.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ],
        isActive: true
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists" },
        { status: 409 }
      );
    }

    // Create category
    const category = await db.category.create({
      data: {
        name,
        slug,
        description: null, // Can be added later if needed
        isActive: true,
        usageCount: 0
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error("Category creation error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
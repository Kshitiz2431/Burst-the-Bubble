// app/api/library/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

const LibraryItemCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["EBOOK", "GUIDE"], {
    required_error: "Type must be either EBOOK or GUIDE",
  }),
  pdfUrl: z.string().min(1, "PDF URL is required"),
  previewUrl: z.string().optional(),
  coverImage: z.string().min(1, "Cover image is required"),
  price: z.number().min(0, "Price cannot be negative"),
  previewPages: z.number().min(1, "Must allow at least 1 preview page"),
  published: z.boolean().default(false),
  categories: z.array(z.string().cuid("Invalid category ID")).min(1, "At least one category is required"),
});


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

    // Parse and validate request body
    const body = await req.json();
    
    const validationResult = LibraryItemCreateSchema.safeParse(body);
    
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

    const data = validationResult.data;

    // Verify all categories exist
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: data.categories
        },
        isActive: true
      }
    });

    if (categories.length !== data.categories.length) {
      return NextResponse.json(
        { error: "One or more categories do not exist or are inactive" },
        { status: 400 }
      );
    }

    // Create library item in a transaction
    const libraryItem = await prisma.$transaction(async (tx) => {
      // Create the library item
      const newItem = await tx.libraryItem.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          pdfUrl: data.pdfUrl,
          previewUrl: data.previewUrl,
          coverImage: data.coverImage,
          price: data.price,
          published: data.published,
          previewPages: data.previewPages,
          categories: {
            connect: data.categories.map(id => ({ id }))
          }
        },
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      // Update category usage counts
      await Promise.all(
        data.categories.map(categoryId =>
          tx.category.update({
            where: { id: categoryId },
            data: {
              usageCount: {
                increment: 1
              }
            }
          })
        )
      );

      return newItem;
    });

    return NextResponse.json(libraryItem, { status: 201 });

  } catch (error) {
    console.error("Library item creation error:", error);
    return NextResponse.json(
      { error: "Failed to create library item" },
      { status: 500 }
    );
  }
}

// Get all library items (with pagination and filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const published = searchParams.get("published");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(type && { type: type as "EBOOK" | "GUIDE" }),
      ...(published !== null && { published: published === "true" }),
      ...(category && {
        categories: {
          some: {
            id: category
          }
        }
      })
    };

    // Get items
    const [items, total] = await Promise.all([
      prisma.libraryItem.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.libraryItem.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });

  } catch (error) {
    console.error("Library items fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch library items" },
      { status: 500 }
    );
  }
}
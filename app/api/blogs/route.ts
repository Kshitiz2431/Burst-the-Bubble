// app/api/blogs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {z} from "zod";
import { fromZodError } from "zod-validation-error";

const BlogCreateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  
  excerpt: z.string()
    .nullable() // Updated because excerpt is optional in your schema
    .optional(),
  
  content: z.string()
    .min(1, "Content is required"),
  
  categories: z.array(z.string())  // Removed CUID validation since you're using custom IDs
    .min(1, "At least one category is required"),
  
  coverImage: z.string()  // Changed from URL validation since you're receiving the S3 URL
    .min(1, "Cover image is required"),
  
  status: z.enum(["draft", "published"], {
    required_error: "Status must be either draft or published",
  }),
  
  publishedAt: z.union([
    z.string().datetime(),  // Changed to handle ISO date strings
    z.date(),
    z.null()
  ]).optional(),
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
    
    const validationResult = BlogCreateSchema.safeParse(body);
    
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

    const validatedData = validationResult.data;

    // Check for slug uniqueness
    const existingBlog = await db.blog.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "Blog with this slug already exists" },
        { status: 409 }
      );
    }

    // Verify that all categories exist
    const categories = await db.category.findMany({
      where: {
        id: {
          in: validatedData.categories
        }
      }
    });

    if (categories.length !== validatedData.categories.length) {
      return NextResponse.json(
        { error: "One or more categories do not exist" },
        { status: 400 }
      );
    }

    // Create blog post with categories in a transaction
    const blog = await db.$transaction(async (tx) => {
      const newBlog = await tx.blog.create({
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          excerpt: validatedData.excerpt,
          content: validatedData.content,
          coverImage: validatedData.coverImage,
          status: validatedData.status,
          publishedAt: validatedData.status === "published" 
            ? validatedData.publishedAt || new Date() 
            : null,
          categories: {
            connect: validatedData.categories.map(id => ({ id }))
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
        validatedData.categories.map(categoryId =>
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

      return newBlog;
    });

    return NextResponse.json(blog, { status: 201 });

  } catch (error) {
    console.error("Blog creation error:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const blogs = await db.blog.findMany({
      where: {
        status: status as string || undefined
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    });

    const total = await db.blog.count({
      where: {
        status: status as string || undefined
      }
    });

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });

  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
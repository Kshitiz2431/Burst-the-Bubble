// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { Prisma } from "@prisma/client";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  slug: z.string().optional(),
});

// Helper function to format Prisma errors for better logging and user feedback
function handlePrismaError(error: unknown): string {
  console.error("Prisma Error:", error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002': return "A unique constraint would be violated.";
      case 'P2025': return "Record not found.";
      case 'P2003': return "Foreign key constraint failed.";
      case 'P2018': return "The required connected records were not found.";
      case 'P2000': return "The provided value is too long.";
      case 'P2001': return "The record searched for does not exist.";
      default: return `Database error (${error.code}): ${error.message}`;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return "Invalid data provided to the database.";
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    return "A critical database error occurred. Please try again later.";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Could not connect to the database. Please try again later.";
  } else {
    return "An unexpected database error occurred.";
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("Categories API: Received GET request");
    
    // Check authentication for admin routes
    const session = await getServerSession(authOptions);
    console.log("Categories API: Session check", { authenticated: !!session?.user });
    
    // Skip auth check if the categories are being fetched for public content
    const isAdminRoute = req.headers.get("referer")?.includes("/admin");
    
    if (isAdminRoute && !session?.user) {
      console.log("Categories API: Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const includeItems = url.searchParams.get("includeItems") === "true";
    console.log(`Categories API: includeItems=${includeItems}`);

    try {
      if (includeItems) {
        console.log("Categories API: Including detailed items");
        
        try {
          // Get all categories with their related items
          const categories = await prisma.category.findMany({
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  blogs: true,
                  templates: true,
                }
              },
              blogs: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  status: true,
                },
              },
              templates: {
                select: {
                  id: true,
                  title: true,
                  // Don't include slug as it might not exist in the template schema
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          });
          
          // Map categories to include empty array for library since it might not exist in the schema
          const categoriesWithAllDetails = categories.map(category => {
            // Create a new object with the template data we have
            return {
              ...category,
              _count: {
                blogs: category._count.blogs,
                templates: category._count.templates,
                library: 0
              },
              library: []
            };
          });
          
          console.log(`Categories API: Found ${categoriesWithAllDetails.length} categories with details`);
          return NextResponse.json(categoriesWithAllDetails);
        } catch (error) {
          console.error("Error with template query:", error);
          
          // Fallback to just blogs if templates query fails
          const categoriesWithBlogs = await prisma.category.findMany({
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  blogs: true,
                }
              },
              blogs: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  status: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          });
          
          // Add empty arrays for templates and library
          const fallbackCategories = categoriesWithBlogs.map(category => ({
            ...category,
            _count: {
              ...category._count,
              templates: 0,
              library: 0
            },
            templates: [],
            library: []
          }));
          
          console.log(`Categories API: Fallback - Found ${fallbackCategories.length} categories with blogs only`);
          return NextResponse.json(fallbackCategories);
        }
      } else {
        console.log("Categories API: Returning lightweight response");
        const lightweightCategories = await prisma.category.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: {
            name: 'asc',
          },
        });
        console.log(`Categories API: Found ${lightweightCategories.length} categories`);
        return NextResponse.json(lightweightCategories);
      }
    } catch (dbError) {
      console.error("Categories API: Database error:", dbError);
      console.error("Error details:", dbError instanceof Error ? dbError.message : String(dbError));
      const errorMessage = handlePrismaError(dbError);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Categories API ERROR:", error);
    
    // Create a more detailed error message for debugging
    let errorMessage = "Failed to fetch categories";
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error("Stack trace:", error.stack);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    try {
      const { name, description, slug } = categorySchema.parse(body);
      
      // Check if category with same name or slug exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            slug && { slug: { equals: slug, mode: 'insensitive' } },
          ].filter(Boolean) as Prisma.CategoryWhereInput[],
          isActive: true,
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "Category with this name or slug already exists" },
          { status: 400 }
        );
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name,
          description: description || "",
          slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
          isActive: true,
        },
      });

      return NextResponse.json(category, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return NextResponse.json(
          { error: validationError.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
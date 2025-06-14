// app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const createTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["LETTER", "ONELINER"]),
  imageUrl: z.string().min(1, "Image URL is required"),
  price: z.number().nullable(),
  categories: z.array(z.string()),
  published: z.boolean().default(false),
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
    console.log(body);
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

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

    // Create template
    const template = await prisma.template.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        imageUrl: data.imageUrl,
        price: data.price,
        published: data.published,
        categories: {
          connect: data.categories.map(id => ({ id }))
        }
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// Get templates (optional - for listing)
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
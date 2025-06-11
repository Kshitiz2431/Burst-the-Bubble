// app/api/resources/route.ts
import {  NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. First get categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 2. Get blogs
    const blogs = await prisma.blog.findMany({
      where: {
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 3. Get library items
    const libraryItems = await prisma.libraryItem.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        price: true,
        previewPages: true,
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 4. Get templates
    const templates = await prisma.template.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        imageUrl:true,
        categories: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format and return the data
    return NextResponse.json({
      content: {
        blogs: blogs.map(blog => ({
          ...blog,
          type: 'blog' as const
        })),
        libraryItems: libraryItems.map(item => ({
          ...item,
          type: 'library' as const,
          price: Number(item.price) // Convert Decimal to number
        })),
        templates: templates.map(template => ({
          ...template,
          type: 'template' as const,
          price: template.price ? Number(template.price) : null // Convert Decimal to number
        }))
      },
      categories
    });

  } catch (error) {
    console.error('Resources fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
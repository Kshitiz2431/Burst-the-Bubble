// lib/content.ts
import { prisma } from "@/lib/prisma";

export async function getContentForResources() {
  try {
    // Fetch blogs
    const blogs = await prisma.blog.findMany({
      where: {
        status:"published",
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch library items
    const libraryItems = await prisma.libraryItem.findMany({
      where: {
        published: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch templates
    const templates = await prisma.template.findMany({
      where: {
        published: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format data for frontend
    const formattedContent = [
      ...blogs.map(blog => ({
        id: blog.id,
        type: 'blog',
        title: blog.title,
        description: blog.excerpt || '',
        image: blog.coverImage,
        categories: blog.categories.map(cat => cat.name),
        slug: blog.slug,
        isPremium: false,
      })),
      ...libraryItems.map(item => ({
        id: item.id,
        type: 'library',
        title: item.title,
        description: item.description,
        image: item.coverImage,
        categories: item.categories.map(cat => cat.name),
        isPremium: true,
        price: item.price,
      })),
      ...templates.map(template => ({
        id: template.id,
        type: 'template',
        title: template.title,
        description: template.description,
        categories: template.categories.map(cat => cat.name),
        isPremium: template.price ? true : false,
        price: template.price,
      })),
    ];

    return formattedContent;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map(cat => cat.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
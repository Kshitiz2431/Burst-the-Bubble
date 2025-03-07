// app/admin/categories/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/categories/delete-button";

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            blogs: true,
            library: true,
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
      },
      orderBy: {
        name: 'asc'
      },
    });

    return categories;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const categories = await getCategories();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-gray-500">
            Manage your content categories
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {category.description || 'No description'}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>{category._count.blogs} blogs</span>
                  <span>{category._count.library} library items</span>
                  <span>{category._count.templates} templates</span>
                </div>
              </div>
              
              <DeleteButton 
                categoryId={category.id}
                disabled={category._count.blogs > 0}
                // onDelete={() => {
                //   // This will trigger a server rerender
                //   window.location.reload();
                // }}
              />
            </div>

            {category.blogs.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Associated Blogs
                </h3>
                <div className="space-y-2">
                  {category.blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <a
                        href={`/admin/blogs/${blog.slug}`}
                        className="text-gray-600 hover:text-[#B33771]"
                      >
                        {blog.title}
                      </a>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        blog.status === 'published'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {blog.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
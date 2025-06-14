import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  BookOpen, 
  Tag,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getStats() {
  try {
    const [blogs, library, templates, categories, recentContent] =
      await Promise.all([
        prisma.blog.count(),
        prisma.libraryItem.count(),
        prisma.template.count(),
        prisma.category.count(),
        prisma.blog.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { categories: true },
        }),
      ]);

    return {
      blogs,
      library,
      templates,
      categories,
      recentContent,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch dashboard data");
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/admin/login");
  }

  let stats;
  try {
    stats = await getStats();
  } catch (err) {
    console.error("Error fetching stats:", err);
    // Handle error gracefully
    stats = {
      blogs: 0,
      library: 0,
      templates: 0,
      categories: 0,
      recentContent: [],
    };
  }

  if (!stats) {
    stats = {
      blogs: 0,
      library: 0,
      templates: 0,
      categories: 0,
      recentContent: [],
    };
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-gray-600">
          Welcome to your dashboard! Here&apos;s an overview of your content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-[#B33771]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogs}</div>
            <p className="text-xs text-muted-foreground">Total blog posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Library Items</CardTitle>
            <BookOpen className="h-4 w-4 text-[#B33771]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.library}</div>
            <p className="text-xs text-muted-foreground">E-books and guides</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-[#B33771]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templates}</div>
            <p className="text-xs text-muted-foreground">
              Letters and one-liners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-[#B33771]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContent.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {formatDistanceToNow(new Date(content.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {content.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="bg-pink-50 text-[#B33771] text-xs px-2 py-0.5 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/admin/blogs/new"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <FileText className="h-4 w-4 text-[#B33771]" />
              <span>Create new blog post</span>
            </a>
            <a
              href="/admin/library/new"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <BookOpen className="h-4 w-4 text-[#B33771]" />
              <span>Add library item</span>
            </a>
            <a
              href="/admin/templates/new"
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <FileText className="h-4 w-4 text-[#B33771]" />
              <span>Create new template</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

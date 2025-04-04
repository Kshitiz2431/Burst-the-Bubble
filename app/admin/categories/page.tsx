// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/categories/delete-button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
}

interface Template {
  id: string;
  title: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count: {
    blogs: number;
    library: number;
    templates: number;
  };
  blogs: Blog[];
  library: LibraryItem[];
  templates: Template[];
}

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchCategories = async (retryCount = 0, maxRetries = 2) => {
    try {
      setIsLoading(true);
      console.log(`Fetching categories... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await fetch("/api/categories?includeItems=true", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error response from categories API:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        
        // For certain errors, retry the request
        if (retryCount < maxRetries && (response.status === 500 || response.status === 503 || response.status === 429)) {
          console.log(`Retrying categories fetch... (${retryCount + 1}/${maxRetries})`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          return fetchCategories(retryCount + 1, maxRetries);
        }
        
        throw new Error(errorData.error || `HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.length} categories`);
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      
      // Provide a more specific error message to the user
      let errorMessage = "Failed to fetch categories";
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      toast.error(errorMessage, {
        description: "Try refreshing the page or check your connection.",
        action: {
          label: "Retry",
          onClick: () => fetchCategories(0, maxRetries)
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh categories
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status]);

  // Show loading state while checking authentication or fetching data
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#e27396]" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-gray-500">
            Manage your content categories
          </p>
        </div>
        
        {/* Add refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-6">
        {categories.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No categories found
          </Card>
        ) : (
          categories.map((category) => (
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
                    <span>{category._count?.blogs || 0} blogs</span>
                    <span>{category._count?.library || 0} library items</span>
                    <span>{category._count?.templates || 0} templates</span>
                  </div>
                </div>
                
                <DeleteButton 
                  categoryId={category.id}
                  disabled={(category._count?.blogs || 0) > 0}
                  itemCounts={category._count || { blogs: 0 }}
                />
              </div>

              {/* Associated Content Sections */}
              <div className="mt-4 space-y-4">
                {/* Blogs Section */}
                {category.blogs && category.blogs.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Associated Blogs
                    </h3>
                    <div className="space-y-2">
                      {category.blogs.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <Link
                            href={`/admin/blogs/${blog.slug}`}
                            className="text-gray-600 hover:text-[#B33771]"
                          >
                            {blog.title}
                          </Link>
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

                {/* Templates Section */}
                {category.templates && category.templates.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Associated Templates
                    </h3>
                    <div className="space-y-2">
                      {category.templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {template.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
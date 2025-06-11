// app/admin/blogs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { PublishButton } from "@/components/admin/publish-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  views: number;
  publishedAt: string | null;
  createdAt: string;
  categories: {
    name: string;
    id: string;
  }[];
}

export default function BlogsListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await response.json();
      setBlogs(data.blogs);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (blogId: string, newStatus: "draft" | "published") => {
    setBlogs(currentBlogs =>
      currentBlogs.map(blog =>
        blog.id === blogId
          ? {
              ...blog,
              status: newStatus,
              publishedAt: newStatus === "published" ? new Date().toISOString() : null
            }
          : blog
      )
    );
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blogs/${blogToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      setBlogs(currentBlogs => currentBlogs.filter(blog => blog.id !== blogToDelete));
      toast.success("Blog deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete blog");
    } finally {
      setIsDeleting(false);
      setBlogToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchBlogs();
            }}
            className="px-4 py-2 bg-[#B33771] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Blogs</h1>
          <button
            onClick={() => router.push("/admin/blogs/new")}
            className="px-4 py-2 bg-[#B33771] text-white rounded-lg hover:bg-[#92295c]"
          >
            Create New Blog
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={blog.status === "published" ? "success" : "default"}
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.categories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{blog.views}</TableCell>
                  <TableCell>
                    {blog.publishedAt
                      ? format(new Date(blog.publishedAt), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/blogs/preview/${blog.slug}`)}
                        className="p-2 text-gray-600 hover:text-[#B33771]"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </button>
                      <PublishButton
                        id={blog.id}
                        type="blogs"
                        isPublished={blog.status === "published"}
                        onStatusChange={(isPublished) => 
                          handleUpdateStatus(blog.id, isPublished ? "published" : "draft")
                        }
                      />
                      <button
                        onClick={() => router.push(`/admin/blogs/edit/${blog.id}`)}
                        className="p-2 text-gray-600 hover:text-[#B33771]"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setBlogToDelete(blog.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!blogToDelete} onOpenChange={() => setBlogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
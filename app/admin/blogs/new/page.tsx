// app/admin/blogs/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { modules, formats, processContentBeforeSave } from "@/components/admin/blogs/quill-config";
import "react-quill/dist/quill.snow.css";

import { ImageUpload } from "@/components/admin/blogs/image-upload";

// Import Quill dynamically to avoid SSR issues
const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-50 animate-pulse rounded-lg">
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    </div>
  ),
});

interface Category {
  value: string;
  label: string;
}

interface CategoryFromAPI {
  id: string;
  name: string;
  slug: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  categories: Category[];
  featuredImage: File | null;
  status: "draft" | "published";
  publishedAt?: Date | null;
  slug?: string;
}

export default function NewBlogPage() {
  const router=useRouter();
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    categories: [],
    featuredImage: null,
    status: "draft",
    publishedAt: null,
    slug: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (formData.featuredImage instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(formData.featuredImage));
      }
    };
  }, [formData.featuredImage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: CategoryFromAPI[] = await response.json();
        
        // Transform API data to match Select component format
        const formattedCategories = data.map(category => ({
          value: category.id,
          label: category.name
        }));
        
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryError(error instanceof Error ? error.message : 'Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async (inputValue: string) => {
    try {
      const newSlug = generateSlug(inputValue);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: inputValue,
          slug: newSlug
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create category");
      }
  
      const newCategory: CategoryFromAPI = await response.json();
  
      // Update local categories state
      const newCategoryOption = {
        value: newCategory.id,
        label: newCategory.name
      };
  
      setCategories(prev => [...prev, newCategoryOption]);
      
      // Update form data with the new category
      setFormData((prev) => ({
        ...prev,
        categories: [
          ...prev.categories,
          newCategoryOption
        ],
      }));
  
      toast.success(`Category "${inputValue}" created`);
      return newCategoryOption;
      
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error("Failed to create category");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Please enter a title for your blog post");
      }
      if (!formData.excerpt.trim()) {
        throw new Error("Please provide a brief excerpt for your blog post");
      }
      if (!formData.content.trim()) {
        throw new Error("Please add some content to your blog post");
      }
      if (!formData.categories.length) {
        throw new Error(
          "Please select at least one category for your blog post"
        );
      }
      if (!formData.featuredImage) {
        throw new Error("Please upload a featured image for your blog post");
      }
      
      // Upload featured image
      let imageKey = "";
      if (formData.featuredImage) {
        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: formData.featuredImage.name,
              contentType: formData.featuredImage.type,
              type: "cover",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get upload URL");
          }

          const { signedUrl, key } = await response.json();

          // Upload to S3 using signed URL
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: formData.featuredImage,
            headers: { "Content-Type": formData.featuredImage.type },
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload featured image");
          }

          imageKey = key;
        } catch (err) {
          console.log(err);
          throw new Error("Failed to upload featured image");
        }
      }

      const processedContent = processContentBeforeSave(formData.content);

      // Create blog post
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: processedContent,
          categories: formData.categories.map((cat) => cat.value),
          coverImage: imageKey,
          status: formData.status,
          publishedAt: formData.status === "published" ? new Date() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }

      toast.success("Blog post created successfully!");
      // Redirect to blog list or clear form
      router.push("/admin/blogs");
    } catch (err) {
      console.error("Error submitting blog:", err);
      setError(err instanceof Error ? err : new Error("Failed to create blog"));
      toast.error("Failed to create blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => setError(null)}
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 md:p-8"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Blog Post
            </h1>
            <p className="text-gray-600">Write and publish a new blog post</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    title: newTitle,
                    slug: generateSlug(newTitle)
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B33771]"
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image
              </label>
              <ImageUpload
                type="featured"
                value={formData.featuredImage}
                onChange={(file) => {
                  setFormData((prev) => ({ ...prev, featuredImage: file }));
                }}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <CreatableSelect
                isMulti
                value={formData.categories}
                onChange={(newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    categories: newValue as Category[],
                  }))
                }
                onCreateOption={handleCreateCategory}
                options={categories}
                isLoading={isLoadingCategories}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder={
                  isLoadingCategories 
                    ? "Loading categories..." 
                    : "Select or create categories..."
                }
                noOptionsMessage={() => 
                  categoryError 
                    ? `Error: ${categoryError}` 
                    : "No categories found"
                }
              />
              {categoryError && (
                <p className="mt-1 text-sm text-red-600">
                  {categoryError}
                </p>
              )} 
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B33771]"
                placeholder="Write a short excerpt..."
                required
              />
            </div>

            {/* Quill Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <QuillEditor
                  theme="snow"
                  value={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  modules={modules}
                  formats={formats}
                  className="h-96"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value as "draft" | "published";
                  setFormData(prev => ({
                    ...prev,
                    status: newStatus,
                    publishedAt: newStatus === "published" ? new Date() : null
                  }));
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B33771]"
              >
                <option value="draft">Draft</option>
                <option value="published">Publish Now</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#B33771] text-white rounded-lg hover:bg-[#92295c] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
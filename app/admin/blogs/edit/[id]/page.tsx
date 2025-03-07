// app/admin/blogs/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactDOM from 'react-dom/client';
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import { QuillImage } from "@/components/admin/blogs/quill-image";
import { ImageEditor } from "@/components/admin/blogs/new-image-editor";
import { ImageUpload } from "@/components/admin/blogs/image-upload";
import { Image } from "@/components/Image";
import "react-quill/dist/quill.snow.css";
import { Quill } from "react-quill";

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

const ImageBlot = Quill.import('formats/image');
class CustomImageBlot extends ImageBlot {
  static create(value: string) {
    const node = super.create(value);
    if (value.startsWith('/api/image/')) {
      // Create a container div
      const container = document.createElement('div');
      container.className = 'quill-image-container';
      
      // Render our QuillImage component into it
      const root = ReactDOM.createRoot(container);
      root.render(<QuillImage src={value} className="max-w-full h-auto" />);
      
      return container;
    }
    return node;
  }
}
CustomImageBlot.blotName = 'image';
CustomImageBlot.tagName = 'div'; // Change this from 'img' to 'div'

// Register the custom blot
Quill.register(CustomImageBlot, true);

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
  featuredImage: File | string | null; // string for S3 key
  imageUrl?: string | null; // string for signed URL
  status: "draft" | "published";
  publishedAt?: Date | null;
  slug?: string;
}
// Quill modules configuration
const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ script: "sub" }, { script: "super" }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["clean"],
    ],
    handlers: {
      image: async function () {
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/png, image/jpeg");
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const quill = (this as any).quill;
            const range = quill.getSelection(true);

            // Create and show modal with NewImageEditor
            const editorContainer = document.createElement('div');
            editorContainer.style.position = 'fixed';
            editorContainer.style.top = '0';
            editorContainer.style.left = '0';
            editorContainer.style.width = '100%';
            editorContainer.style.height = '100%';
            editorContainer.style.zIndex = '9999';
            document.body.appendChild(editorContainer);

            const root = ReactDOM.createRoot(editorContainer);
            
            root.render(
              <ImageEditor
                image={file}
                aspect={16/9}
                onSave={async (croppedImage) => {
                  try {
                    // Show loading placeholder
                    quill.insertEmbed(range.index, "image", "/placeholder-image.jpg");
                    quill.setSelection(range.index + 1);

                    // Get signed URL and upload
                    const response = await fetch("/api/upload", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        filename: croppedImage.name,
                        contentType: croppedImage.type,
                        type: "content",
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to get upload URL");
                    }

                    const { signedUrl, key } = await response.json();

                    // Upload to S3
                    const uploadResponse = await fetch(signedUrl, {
                      method: "PUT",
                      body: croppedImage,
                      headers: { "Content-Type": croppedImage.type },
                    });

                    if (!uploadResponse.ok) {
                      throw new Error("Failed to upload image");
                    }

                    // Get a fresh signed URL for display
                    const displayUrlResponse = await fetch(`/api/image/${key}`);
                    if (!displayUrlResponse.ok) {
                      throw new Error("Failed to get display URL");
                    }
                    const { url: displayUrl } = await displayUrlResponse.json();

                    // Store both URLs in a data attribute
                    const [leaf] = quill.getLeaf(range.index);
                    const index = quill.getIndex(leaf);
                    quill.deleteText(index, 1);

                    // Insert the image with the display URL
                    quill.insertEmbed(index, "image", displayUrl);

                    // Add a data attribute with our API URL format for storage
                    const imageNode = quill.container.querySelector(`img[src="${displayUrl}"]`);
                    if (imageNode) {
                      imageNode.dataset.apiUrl = `/api/image/${key}`;
                    }

                    quill.setSelection(index + 1);
                    toast.success("Image uploaded successfully");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Failed to upload image"
                    );
                    // Remove placeholder if upload failed
                    const [leaf] = quill.getLeaf(range.index);
                    const index = quill.getIndex(leaf);
                    quill.deleteText(index, 1);
                  } finally {
                    // Clean up
                    root.unmount();
                    document.body.removeChild(editorContainer);
                  }
                }}
                onCancel={() => {
                  root.unmount();
                  document.body.removeChild(editorContainer);
                }}
              />
            );
          };
        });
      },
    },
  },
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "align",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "blockquote",
  "code-block",
];

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string>("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blogs/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch blog");
        
        const blog = await response.json();
  
        // Get signed URL for the existing cover image
        let imageUrl = null;
        if (blog.coverImage) {
          try {
            const imageResponse = await fetch(`/api/image/${encodeURIComponent(blog.coverImage)}`);
            if (imageResponse.ok) {
              const data = await imageResponse.json();
              imageUrl = data.url;
            }
          } catch (error) {
            console.error('Error getting signed URL:', error);
          }
        }
        
        setFormData({
          title: blog.title,
          excerpt: blog.excerpt || "",
          content: blog.content,
          categories: blog.categories.map((cat: CategoryFromAPI) => ({
            value: cat.id,
            label: cat.name,
          })),
          featuredImage: blog.coverImage, // Store S3 key
          imageUrl: imageUrl, // Store signed URL for display
          status: blog.status,
          publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
          slug: blog.slug,
        });
        setOriginalSlug(blog.slug);
      } catch (error) {
        setError(error instanceof Error ? error : new Error("Failed to fetch blog"));
        toast.error("Failed to fetch blog");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data: CategoryFromAPI[] = await response.json();
        
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
      const newCategoryOption = {
        value: newCategory.id,
        label: newCategory.name
      };
  
      setCategories(prev => [...prev, newCategoryOption]);
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategoryOption],
      }));
  
      toast.success(`Category "${inputValue}" created`);
      return newCategoryOption;
      
    } catch (error) {
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
      if (!formData.title.trim()) throw new Error("Please enter a title");
      if (!formData.excerpt.trim()) throw new Error("Please provide an excerpt");
      if (!formData.content.trim()) throw new Error("Please add some content");
      if (!formData.categories.length) throw new Error("Please select at least one category");

      // Handle cover image
      let imageKey: string | null = null;

      if (formData.featuredImage instanceof File) {
        // Upload new image
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

          if (!response.ok) throw new Error("Failed to get upload URL");

          const { signedUrl, key } = await response.json();

          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            body: formData.featuredImage,
            headers: { "Content-Type": formData.featuredImage.type },
          });

          if (!uploadResponse.ok) throw new Error("Failed to upload image");

          imageKey = key;
        } catch (error) {
          throw new Error("Failed to upload featured image");
        }
      } else if (typeof formData.featuredImage === 'string') {
        // Use existing S3 key
        imageKey = formData.featuredImage;
      }

      const processContent = (content: string) => {
        const div = document.createElement('div');
        div.innerHTML = content;
        
        // Replace all image src with their data-api-url
        div.querySelectorAll('img').forEach(img => {
          if (img.dataset.apiUrl) {
            img.src = img.dataset.apiUrl;
          }
        });
        
        return div.innerHTML;
      };

      // Prepare update data
    const updateData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: processContent(formData.content),
        categories: formData.categories.map((cat) => cat.value),
        status: formData.status,
        publishedAt: formData.status === "published" ? new Date().toISOString() : null,
        coverImage: imageKey
      };

      // Update blog post
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update blog post");
      }

      toast.success("Blog post updated successfully!");
      router.push("/admin/blogs");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Something went wrong"));
      toast.error(error instanceof Error ? error.message : "Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => router.push("/admin/blogs")}
            className="px-4 py-2 bg-[#B33771] text-white rounded-lg"
          >
            Go Back
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
              Edit Blog Post
            </h1>
            <p className="text-gray-600">Update your blog post</p>
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
                    // Only update slug if it matches the original title's slug
                    slug: prev.slug === originalSlug ? generateSlug(newTitle) : prev.slug
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B33771]"
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Slug
              </label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: generateSlug(e.target.value),
                  }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B33771]"
                placeholder="url-slug"
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
                displayUrl={formData.imageUrl}
                onChange={(file) =>
                  setFormData((prev) => ({ 
                    ...prev, 
                    featuredImage: file,
                    imageUrl: file ? URL.createObjectURL(file) : null
                  }))
                }
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
                <option value="published">Published</option>
              </select>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/admin/blogs")}
                className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#B33771] text-white rounded-lg hover:bg-[#92295c] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
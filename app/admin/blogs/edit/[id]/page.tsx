// app/admin/blogs/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactDOM from 'react-dom/client';
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import { ImageEditor } from "@/components/admin/blogs/new-image-editor";
import { ImageUpload } from "@/components/admin/blogs/image-upload";
import "react-quill/dist/quill.snow.css";
import { Quill } from "react-quill";
import { processContentAfterLoad, uploadImage, getImageUrl } from "@/components/admin/blogs/quill-config";

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
    console.log('CustomImageBlot.create called with value:', value);
    
    const node = super.create(value) as HTMLImageElement;
    
    // Create a loading placeholder image
    const placeholderDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0EzQUYiPkxvYWRpbmcgaW1hZ2UuLi48L3RleHQ+PC9zdmc+';
    
    // Set crossOrigin for CORS support
    node.setAttribute('crossorigin', 'anonymous');
    
    // Set placeholder immediately to ensure something displays
    node.src = placeholderDataUrl;
    
    // Add error handling to preserve placeholder on error
    node.onerror = () => {
      console.error('Error loading image:', value);
      node.src = placeholderDataUrl;
      
      // If this was a signed URL that failed, try the API URL instead
      if (value.includes('X-Amz-Algorithm') && node.hasAttribute('data-api-url')) {
        const apiUrl = node.getAttribute('data-api-url');
        console.log('Signed URL failed, trying API URL instead:', apiUrl);
        
        // Don't try again if we're already using the API URL
        if (apiUrl !== value) {
          node.src = apiUrl || placeholderDataUrl;
        }
      }
    };
    
    // Check if the value is a URL
    if (typeof value === 'string') {
      console.log('CustomImageBlot: Setting up image with URL:', value);
      
      // Check if it's a direct S3 URL with signature
      if (value.includes('X-Amz-Algorithm')) {
        console.log('Using direct S3 URL');
        node.src = value;
        
        // Extract the key from the URL if possible
        if (value.includes('.amazonaws.com/')) {
          const urlParts = value.split('.amazonaws.com/');
          const keyWithParams = urlParts[1];
          const key = keyWithParams.split('?')[0];
          console.log('Extracted key from S3 URL:', key);
          
          // Store the API URL for future use
          const apiUrl = `/api/image/${key}`;
          node.setAttribute('data-api-url', apiUrl);
          node.setAttribute('data-key', key);
        }
      } 
      // Extract filename if it's a full path
      else if (value.includes('/blog-content-images/')) {
        const keyParts = value.split('/');
        const filename = keyParts[keyParts.length - 1];
        const apiUrl = `/api/image/${filename}`;
        console.log('Modified API URL to:', apiUrl);
        
        // Store the API URL as a data attribute
        node.setAttribute('data-api-url', apiUrl);
        node.setAttribute('data-key', `blog-content-images/${filename}`);
        
        // Check if value is already an API URL
        if (apiUrl.startsWith('/api/image/')) {
          // Fetch the real image URL
          fetch(apiUrl)
            .then(response => {
              if (!response.ok) {
                const errorMsg = `Failed to fetch image: ${response.status}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
              }
              return response.json();
            })
            .then(data => {
              if (data && data.url) {
                console.log('Setting signed URL:', data.url.substring(0, 50) + '...');
                node.src = data.url;
              } else {
                console.error('Invalid response from image API:', data);
                node.src = apiUrl; // Fall back to API URL
              }
            })
            .catch(error => {
              console.error('Error loading image:', error);
              node.src = apiUrl; // Fall back to API URL on error
            });
        }
      } else if (value.startsWith('/api/image/')) {
        // Store the API URL as a data attribute
        node.setAttribute('data-api-url', value);
        
        // Extract the key from the API URL
        const key = value.replace('/api/image/', '');
        node.setAttribute('data-key', key);
        
        // Fetch the real image URL
        fetch(value)
          .then(response => {
            if (!response.ok) {
              const errorMsg = `Failed to fetch image: ${response.status}`;
              console.error(errorMsg);
              throw new Error(errorMsg);
            }
            return response.json();
          })
          .then(data => {
            if (data && data.url) {
              console.log('Setting signed URL:', data.url.substring(0, 50) + '...');
              node.src = data.url;
            } else {
              console.error('Invalid response from image API:', data);
              node.src = value; // Fall back to API URL
            }
          })
          .catch(error => {
            console.error('Error loading image:', error);
            node.src = value; // Fall back to API URL on error
          });
      } else if (value.startsWith('http')) {
        // Direct URL, use it as is
        console.log('Using direct URL:', value);
        node.src = value;
      } else {
        // Assume it's a key and convert to API URL
        const apiUrl = `/api/image/${value}`;
        console.log('Converting key to API URL:', apiUrl);
        node.setAttribute('data-api-url', apiUrl);
        node.setAttribute('data-key', value);
        node.src = apiUrl;
      }
    }
    
    return node;
  }
}

// Register the custom blot with proper settings
CustomImageBlot.blotName = 'image';
CustomImageBlot.tagName = 'img';
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
      image: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        
        // Handle file selection
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          
          const quill = (this as unknown as { quill: { 
            getSelection: (focus: boolean) => { index: number };
            insertEmbed: (index: number, type: string, value: string) => void;
            setSelection: (index: number) => void;
            root: HTMLElement;
          } }).quill;
          const range = quill.getSelection(true);
          
          // Create editor container with explicit z-index that overrides toast
          const editorContainer = document.createElement('div');
          editorContainer.className = 'image-editor-modal';
          editorContainer.style.position = 'fixed';
          editorContainer.style.top = '0';
          editorContainer.style.left = '0';
          editorContainer.style.width = '100%';
          editorContainer.style.height = '100%';
          editorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          editorContainer.style.zIndex = '100000'; // Very high z-index to override all other elements
          editorContainer.style.display = 'flex';
          editorContainer.style.alignItems = 'center';
          editorContainer.style.justifyContent = 'center';
          
          // Add the container to the document
          document.body.appendChild(editorContainer);
          
          // Create React root in the container
          const root = ReactDOM.createRoot(editorContainer);
          
          // Render the image editor
          root.render(
            <div className="relative w-full max-w-4xl mx-auto">
              <ImageEditor
                image={file}
                aspect={16/9}
                onSave={async (croppedImage) => {
                  try {
                    // Show upload toast (appears below the modal)
                    toast.loading('Uploading image...');
                    
                    // Ensure croppedImage is a File object
                    if (!(croppedImage instanceof File)) {
                      throw new Error("Expected a File object from the image editor");
                    }
                    
                    // Upload the image using our helper
                    const { key } = await uploadImage(croppedImage);
                    
                    // Get the signed URL for display
                    const signedUrlResponse = await getImageUrl(encodeURIComponent(key));
                    
                    // Insert the image into the editor
                    quill.insertEmbed(range.index, 'image', signedUrlResponse);
                    quill.setSelection(range.index + 1);
                    
                    // Add data-key using basic DOM
                    const imageElements = quill.root.getElementsByTagName('img') as HTMLCollectionOf<HTMLImageElement>;
                    for (let i = 0; i < imageElements.length; i++) {
                      if (imageElements[i].src === signedUrlResponse) {
                        imageElements[i].setAttribute('data-key', key);
                        imageElements[i].setAttribute('crossorigin', 'anonymous');
                        break;
                      }
                    }
                    
                    // Dismiss any loading toasts and show success
                    toast.dismiss();
                    toast.success('Image uploaded successfully!');
                    
                    // Clean up the editor
                    root.unmount();
                    document.body.removeChild(editorContainer);
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    // Dismiss any loading toasts and show error
                    toast.dismiss();
                    toast.error(error instanceof Error ? error.message : "Failed to upload image");
                    
                    // Clean up the editor
                    root.unmount();
                    document.body.removeChild(editorContainer);
                  }
                }}
                onCancel={() => {
                  // Clean up the editor
                  root.unmount();
                  document.body.removeChild(editorContainer);
                }}
              />
            </div>
          );
        };
        
        // Trigger file selection
        input.click();
      }
    }
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
        console.log('Fetched blog data:', blog);

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

        // Process the content to handle images properly
        const processedContent = await processContentAfterLoad(blog.content);
        
        setFormData({
          title: blog.title,
          excerpt: blog.excerpt || "",
          content: processedContent,
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
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch blog"));
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
      console.log(error);
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
          console.log(error);
          throw new Error("Failed to upload featured image");
        }
      } else if (typeof formData.featuredImage === 'string') {
        // Use existing S3 key
        imageKey = formData.featuredImage;
      }

      const processContent = (content: string) => {
        const div = document.createElement('div');
        div.innerHTML = content;
        
        // Process all images to ensure they use the API URL format for storage
        div.querySelectorAll('img').forEach(img => {
          console.log('Processing image for save:', img.outerHTML);
          
          // Get the data-key attribute (preferred storage format)
          const dataKey = img.getAttribute('data-key');
          if (dataKey) {
            console.log('Using data-key for storage:', dataKey);
            
            // Extract just the filename if needed
            let apiUrl;
            if (dataKey.includes('/')) {
              const keyParts = dataKey.split('/');
              const filename = keyParts[keyParts.length - 1];
              apiUrl = `/api/image/${filename}`;
            } else {
              apiUrl = `/api/image/${dataKey}`;
            }
            
            // Store the API URL as src
            img.setAttribute('src', apiUrl);
          }
          // If no data-key, check for data-api-url
          else if (img.hasAttribute('data-api-url')) {
            const apiUrl = img.getAttribute('data-api-url');
            console.log('Using data-api-url for image src:', apiUrl);
            
            if (apiUrl) {
              img.setAttribute('src', apiUrl);
            }
          }
          // Handle direct URLs that might need conversion
          else {
            const src = img.getAttribute('src');
            if (src) {
              if (src.includes('.amazonaws.com/')) {
                // Extract the key from the S3 URL
                const urlParts = src.split('.amazonaws.com/');
                const keyWithParams = urlParts[1];
                const key = keyWithParams.split('?')[0];
                console.log('Extracted key from S3 URL:', key);
                
                // Convert to API URL format
                const apiUrl = `/api/image/${key}`;
                img.setAttribute('src', apiUrl);
                img.setAttribute('data-key', key);
              }
              else if (src.includes('/blog-content-images/')) {
                // Extract the filename
                const keyParts = src.split('/');
                const filename = keyParts[keyParts.length - 1];
                const apiUrl = `/api/image/${filename}`;
                console.log('Modified API URL to:', apiUrl);
                img.setAttribute('src', apiUrl);
              }
            }
          }
          
          // Remove any extra attributes we don't want to store
          img.removeAttribute('crossorigin');
          
          // Keep only essential attributes
          const src = img.getAttribute('src');
          const alt = img.getAttribute('alt') || '';
          const dataKeyAttr = img.getAttribute('data-key');
          
          // Reset the element to have only what we need
          const newImg = document.createElement('img');
          if (src) newImg.setAttribute('src', src);
          if (alt) newImg.setAttribute('alt', alt);
          if (dataKeyAttr) newImg.setAttribute('data-key', dataKeyAttr);
          
          // Replace the old img with the clean one
          img.parentNode?.replaceChild(newImg, img);
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Something went wrong"));
      toast.error(err instanceof Error ? err.message : "Failed to update blog post");
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
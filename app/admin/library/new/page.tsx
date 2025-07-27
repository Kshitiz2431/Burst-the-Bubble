// app/admin/library/new/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Upload, Eye } from "lucide-react";
import { toast } from "sonner";
import CreatableSelect from "react-select/creatable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { useRouter } from "next/router";
import { Textarea } from "@/components/ui/textarea";
import { PDFPreviewModal } from "@/components/library/pdf-preview-modal";
import { uploadFileToS3 } from "@/lib/upload";

interface LibraryItemFormData {
  title: string;
  description: string;
  price: number;
  categories: { value: string; label: string }[];
  pdfFile: File | null;
  previewPages: number;
  coverImage: File | null;
}

interface Category {
  value: string;
  label: string;
}

interface CategoryFromAPI {
  id: string;
  name: string;
  slug: string;
}

export default function NewLibraryItemPage() {
  const [formData, setFormData] = useState<LibraryItemFormData>({
    title: "",
    description: "",
    price: 0,
    categories: [],
    pdfFile: null,
    previewPages: 3,
    coverImage: null
  });
 // const router=useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
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
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: inputValue,
          slug: inputValue.toLowerCase().replace(/\s+/g, '-')
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

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({ ...prev, pdfFile: file }));
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, coverImage: file }));
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.description.trim()) throw new Error("Description is required");
      if (formData.price < 0) throw new Error("Price cannot be negative");
      if (!formData.pdfFile) throw new Error("Please upload a PDF file");
      if (!formData.coverImage) throw new Error("Please upload a cover image");
      if (formData.categories.length === 0) throw new Error("Please select at least one category");

      const [pdfUpload, coverUpload] = await Promise.all([
        uploadFileToS3(formData.pdfFile, 'pdf'),
        uploadFileToS3(formData.coverImage, 'cover'),
      ]);

      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          categories: formData.categories.map(cat => cat.value),
          pdfUrl: pdfUpload.key,
          coverImage: coverUpload.key,
          previewPages: formData.previewPages,
          type: 'EBOOK',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create library item');
      }

      toast.success("Library item created successfully!");
   //   router.push('/admin/library');

    } catch (err) {
      console.error("Error creating library item:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create library item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Library Item</h1>
        <p className="text-sm text-gray-500">Create a new e-book or guide</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {formData.coverImage ? (
                <div className="relative mx-auto aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload cover image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (INR)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <CreatableSelect
              isMulti
              value={formData.categories}
              onChange={(newValue) => setFormData(prev => ({
                ...prev,
                categories: newValue as Category[],
              }))}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF File
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {formData.pdfFile ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{formData.pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pdfFile: null }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload PDF</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handlePDFUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Pages
            </label>
            <Input
              type="number"
              min="1"
              value={formData.previewPages}
              onChange={(e) => setFormData(prev => ({ ...prev, previewPages: parseInt(e.target.value) }))}
            />
            <p className="mt-1 text-sm text-gray-500">
              Number of pages users can preview before purchase
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#B33771] hover:bg-[#92295c]"
            >
              {isSubmitting ? "Creating..." : "Create Library Item"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPDFPreview(true)}
              disabled={!formData.pdfFile}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview PDF
            </Button>
          </div>
        </form>
      </Card>

      {showPDFPreview && formData.pdfFile && (
        <PDFPreviewModal
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          pdfUrl={URL.createObjectURL(formData.pdfFile)}
          title={formData.title || "PDF Preview"}
          previewPages={formData.previewPages}
        />
      )}
    </div>
  );
}

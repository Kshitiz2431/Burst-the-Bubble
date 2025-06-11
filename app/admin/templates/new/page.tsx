// app/admin/templates/new/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import CreatableSelect from "react-select/creatable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRouter } from "next/navigation";

interface TemplateFormData {
  title: string;
  description: string;
  price: number | null;
  categories: { value: string; label: string }[];
  imageFile: File | null;
  type: "LETTER" | "ONELINER";
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

export default function NewTemplatePage() {
  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    description: "",
    price: null,
    categories: [],
    imageFile: null,
    type: "LETTER"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.imageFile) {
        throw new Error('Please upload a template file');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', (formData.price || 0).toString());
      formDataToSend.append('categoryId', formData.categories[0]?.value || '');
      formDataToSend.append('templateFile', formData.imageFile);
      formDataToSend.append('thumbnailFile', formData.imageFile);

      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      toast.success('Template created successfully!');
      router.push('/admin/templates');
    } catch (err) {
      console.error('Error creating template:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Template</h1>
        <p className="text-sm text-gray-500">Create a new letter or one-liner template</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Image
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              {formData.imageFile ? (
                <div className="relative mx-auto overflow-hidden rounded-lg">
                  <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt="Template preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageFile: null }))}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload template image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value: "LETTER" | "ONELINER") => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LETTER">Letter</SelectItem>
                <SelectItem value="ONELINER">One-liner</SelectItem>
              </SelectContent>
            </Select>
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
              Price (INR, leave empty for free templates)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.price ?? ""}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                price: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="Enter price (optional)"
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#B33771] hover:bg-[#92295c]"
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
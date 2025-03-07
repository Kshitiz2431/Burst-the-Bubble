// components/admin/categories/delete-button.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteButtonProps {
  categoryId: string;
  disabled: boolean;
}

export function DeleteButton({ categoryId, disabled }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        disabled || isDeleting
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-red-50 text-red-600 hover:bg-red-100'
      }`}
      disabled={disabled || isDeleting}
      onClick={handleDelete}
      title={
        disabled
          ? "Cannot delete category with existing blogs"
          : "Delete category"
      }
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
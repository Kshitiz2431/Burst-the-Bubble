// components/admin/categories/delete-button.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ItemCounts {
  blogs?: number;
  library?: number;
  templates?: number;
}

export function DeleteButton({
  categoryId,
  disabled = false,
  itemCounts,
}: {
  categoryId: string;
  disabled?: boolean;
  itemCounts: ItemCounts;
}) {
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

  // Generate tooltip message based on associated items
  const getTooltipMessage = () => {
    if (itemCounts?.blogs && itemCounts.blogs > 0) {
      return `Cannot delete - has ${itemCounts.blogs} associated blog${
        itemCounts.blogs === 1 ? "" : "s"
      }`;
    }
    
    if (itemCounts?.templates && itemCounts.templates > 0) {
      return `Cannot delete - has ${itemCounts.templates} associated template${
        itemCounts.templates === 1 ? "" : "s"
      }`;
    }

    return "Delete category";
  };

  // Check if the delete button should be disabled
  const isDisabled =
    disabled ||
    isDeleting ||
    (itemCounts?.blogs && itemCounts.blogs > 0) ||
    (itemCounts?.templates && itemCounts.templates > 0) ? true : false;

  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        isDisabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-red-50 text-red-600 hover:bg-red-100'
      }`}
      disabled={isDisabled}
      onClick={handleDelete}
      title={getTooltipMessage()}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
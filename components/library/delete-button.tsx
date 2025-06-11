// components/library/delete-button.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteButtonProps {
  itemId: string;
}

export function DeleteButton({ itemId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/library/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      toast.success('Item deleted successfully');
      window.location.reload();
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-red-500 hover:text-red-600"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
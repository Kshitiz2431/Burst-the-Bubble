// components/shared/publish-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PublishButtonProps {
  id: string;
  type: 'library' | 'templates' | 'blogs';
  isPublished: boolean;
  onStatusChange?: (isPublished: boolean) => void;
}

export function PublishButton({ 
  id, 
  type, 
  isPublished,
  onStatusChange 
}: PublishButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${type}/${id}/publish`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle publish status`);
      }

      const newPublishState = !isPublished;
      
      // Call the callback if provided
      if (onStatusChange) {
        onStatusChange(newPublishState);
      }

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} ${isPublished ? "unpublished" : "published"} successfully`
      );
      
      // Only refresh the router if no callback is provided
      if (!onStatusChange) {
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update publish status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={togglePublish}
      disabled={isLoading}
      className={
        isPublished
          ? "text-green-600 hover:text-green-700"
          : "text-gray-600 hover:text-gray-700"
      }
      title={isPublished ? "Unpublish" : "Publish"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublished ? (
        <Globe className="h-4 h-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
    </Button>
  );
}
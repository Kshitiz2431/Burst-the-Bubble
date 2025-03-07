// components/library/download-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DownloadButtonProps {
  itemId: string;
  fileName: string;
}

export function DownloadButton({ itemId, fileName }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Get signed URL
      const response = await fetch(`/api/library/download/${itemId}`);
      if (!response.ok) throw new Error("Failed to get download URL");
      const { url } = await response.json();

      // Download file
      const fileResponse = await fetch(url);
      if (!fileResponse.ok) throw new Error("Failed to download file");
      
      const blob = await fileResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </Button>
  );
}
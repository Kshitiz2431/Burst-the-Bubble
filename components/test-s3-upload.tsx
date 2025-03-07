"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TestS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setUploadedUrl(data.url);
      console.log("Upload successful:", data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Button disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" />
          <label className="cursor-pointer">
            {isUploading ? "Uploading..." : "Test Upload"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
          </label>
        </Button>
      </div>

      {uploadedUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Uploaded Image:</p>
          <img
            src={uploadedUrl}
            alt="Test upload"
            className="mt-2 max-w-md rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}

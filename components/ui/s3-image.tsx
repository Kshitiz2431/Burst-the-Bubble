// components/ui/s3-image.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";


interface S3ImageProps {
  imageKey: string;
  alt: string;
  className?: string;
}

export function S3Image({ imageKey, alt, className }: S3ImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await fetch(`/api/image/${encodeURIComponent(imageKey)}`);
        if (!response.ok) throw new Error("Failed to fetch image URL");
        const data = await response.json();
        setImageUrl(data.url);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setLoading(false);
      }
    };

    if (imageKey) {
      fetchImageUrl();
    }
  }, [imageKey]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
// components/Image.tsx
"use client";

import { useEffect, useState } from "react";

interface ImageProps {
  imageKey: string;
  alt: string;
  className?: string;
}

export function Image({ imageKey, alt, className }: ImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await fetch(`/api/image/${encodeURIComponent(imageKey)}`);
        if (!response.ok) throw new Error("Failed to fetch image URL");
        const data = await response.json();
        setImageUrl(data.url);
        console.log(data.url);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
    };

    if (imageKey) {
      fetchImageUrl();
    }
  }, [imageKey]);

  if (!imageUrl) {
    return <div className={`animate-pulse bg-gray-200 ${className}`} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
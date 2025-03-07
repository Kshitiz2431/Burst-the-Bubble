// components/admin/blogs/quill-image.tsx
"use client";

import { useState, useEffect } from "react";

interface QuillImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function QuillImage({ src, alt = "", className = "" }: QuillImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageUrl = async () => {
      // Only fetch if it's our API URL format
      if (src.startsWith('/api/image/')) {
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error('Failed to fetch image URL');
          const data = await response.json();
          setImageUrl(data.url);
        } catch (error) {
          console.error('Error fetching image URL:', error);
        }
      } else {
        setImageUrl(src);
      }
      setIsLoading(false);
    };

    fetchImageUrl();
  }, [src]);

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 ${className}`} />;
  }

  return <img src={imageUrl} alt={alt} className={className} />;
}
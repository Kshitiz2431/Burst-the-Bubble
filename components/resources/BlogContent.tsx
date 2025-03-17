// components/BlogContent.tsx
"use client";

import { useEffect, useRef } from "react";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Find all <img> elements that have a data-key attribute
      const images = contentRef.current.querySelectorAll('img[data-key]');
      images.forEach((img) => {
        const key = img.getAttribute("data-key");
        if (key) {
          // Call your API endpoint to get a signed URL for this image
          fetch(`/api/image/${encodeURIComponent(key)}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error("Failed to fetch signed URL");
              }
              return res.json();
            })
            .then((data) => {
              if (data.url) {
                // Set the src attribute to the signed URL so the image displays
                img.setAttribute("src", data.url);
                // Optionally remove the data-key attribute to prevent reprocessing
                img.removeAttribute("data-key");
              }
            })
            .catch((err) => {
              console.error("Error fetching signed URL for image:", err);
            });
        }
      });
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

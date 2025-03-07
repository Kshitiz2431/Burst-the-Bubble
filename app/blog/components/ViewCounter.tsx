// app/blog/components/ViewCounter.tsx
'use client';

import { useEffect } from 'react';

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const incrementViews = async () => {
      try {
        const response = await fetch(`/api/blog/views/${slug}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to increment views');
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };

    incrementViews();
  }, [slug]);

  return null; // This component doesn't render anything
}
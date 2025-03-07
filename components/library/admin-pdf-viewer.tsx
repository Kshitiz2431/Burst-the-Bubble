// components/library/admin-pdf-viewer.tsx
"use client";

import { useState, useEffect } from "react";
import { PDFPreview } from "./pdf-preview";
import { Loader2 } from "lucide-react";

interface AdminPDFViewerProps {
  itemId: string;
  previewPages: number;
}

export function AdminPDFViewer({ itemId, previewPages }: AdminPDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const response = await fetch(`/api/library/preview/${itemId}`);
        if (!response.ok) throw new Error("Failed to fetch PDF URL");
        const data = await response.json();
        setPdfUrl(data.url);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        {error || "Failed to load PDF"}
      </div>
    );
  }

  return (
    <PDFPreview
      file={pdfUrl}
      previewPages={previewPages}
      isAdmin={true}
    />
  );
}
// components/library/preview-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PDFPreviewModal } from "./pdf-preview-modal";

interface PreviewButtonProps {
  itemId: string;
  pdfUrl: string;
  title: string;
  previewPages: number;
}

export function PreviewButton({
  itemId,
  title,
  previewPages
}: PreviewButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowPreview(true)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        pdfUrl={`/api/library/${itemId}/pdf`}
        title={title}
        previewPages={previewPages}
        isAdmin={true}
      />
    </>
  );
}
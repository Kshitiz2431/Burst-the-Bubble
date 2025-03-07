// components/library/pdf-preview.tsx
"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewProps {
  file: string | File;
  previewPages: number;
  isAdmin?: boolean;
}

export function PDFPreview({ file, previewPages, isAdmin = false }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  // Check if current page is beyond preview limit
  // const isPageLocked = !isAdmin && currentPage > previewPages;
  const isPageLocked =  currentPage > previewPages;

  return (
    <div className="flex flex-col items-center">
      {loading && (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      <div className="relative">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth - 48, 800)}
          />
          
          {/* Overlay for locked pages */}
          {isPageLocked && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Lock className="w-12 h-12 mb-4" />
              <p className="text-lg font-semibold mb-2">Preview Limit Reached</p>
              <p className="text-sm text-gray-300">
                Purchase to access all {numPages} pages
              </p>
            </div>
          )}
        </Document>
      </div>

      {numPages && (
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm">
            Page {currentPage} of {numPages}
            {!isAdmin && (
              <span className="text-gray-500 ml-2">
                ({previewPages} pages preview available)
              </span>
            )}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numPages))}
            disabled={currentPage >= numPages || (!isAdmin && currentPage >= previewPages)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!isAdmin && numPages && numPages > previewPages && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            {numPages - previewPages} more pages available after purchase
          </p>
        </div>
      )}
    </div>
  );
}
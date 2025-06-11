// components/library/pdf-preview-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from "framer-motion";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  previewPages?: number;
  isAdmin?: boolean;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  previewPages = 3,
  isAdmin = false
}: PDFPreviewModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  // Add a key state to force remount of Document component
  const [documentKey, setDocumentKey] = useState(0);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNumPages(null);
      setCurrentPage(1);
      setIsLoading(true);
      // Increment key to force Document component to remount when modal reopens
      setDocumentKey(prev => prev + 1);
    }
  }, [isOpen]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
  }

  const maxPages = isAdmin ? numPages || 0 : previewPages;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden border-0 shadow-xl">
        {/* Override the default close button by hiding it with CSS */}
        <style jsx global>{`
          .DialogContent button[data-state=open] {
            display: none;
          }
        `}</style>

        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#e27396]/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-pink-100/10 blur-3xl -z-10" />
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 backdrop-blur-sm">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-[#e27396]/10 animate-pulse"></div>
                <Loader2 className="h-10 w-10 animate-spin text-[#e27396]" />
              </div>
            </div>
          )}
          {isOpen && ( // Only render Document when modal is open
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.95 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-xl overflow-hidden shadow-lg bg-white">
                <Document
                  key={documentKey} // Add key to force remount
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="mx-auto"
                    width={Math.min(window.innerWidth * 0.8, 800)}
                    loading={
                      <div className="flex items-center justify-center h-[600px]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#e27396]" />
                      </div>
                    }
                  />
                </Document>
              </div>
              
              {!isAdmin && currentPage >= maxPages && numPages && numPages > maxPages && (
                <div className="mt-4 p-4 rounded-xl bg-[#e27396]/5 border border-[#e27396]/10 text-center">
                  <p className="text-gray-700 font-medium">
                    Preview limit reached. Purchase to view all {numPages} pages.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm"
        >
          <div className="text-sm font-medium text-gray-600">
            {!isAdmin && (
              <span>Preview: <span className="text-[#e27396]">Page {currentPage}</span> of {maxPages} • </span>
            )}
            <span>
              Page <span className="text-[#e27396] font-semibold">{currentPage}</span> of <span className="font-semibold">{numPages || '...'}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border-gray-200 hover:bg-[#e27396]/5 hover:border-[#e27396]/20 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.min(page + 1, maxPages))}
              disabled={currentPage >= maxPages}
              className="rounded-lg border-gray-200 hover:bg-[#e27396]/5 hover:border-[#e27396]/20 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
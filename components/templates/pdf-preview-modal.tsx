import * as React from "react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Custom DialogContent without the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  totalPages: number;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  totalPages,
}: PDFPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CustomDialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden border-0 shadow-xl">
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
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50 backdrop-blur-sm flex items-center justify-center relative">
          {/* Navigation buttons */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:border-[#e27396]/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:border-[#e27396]/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
              <div className="w-16 h-16 rounded-full bg-[#e27396]/10 flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#e27396]/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#e27396]/30"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* PDF container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-xl overflow-hidden shadow-lg w-full h-full bg-white"
          >
            <iframe
              src={`${pdfUrl}#page=${currentPage}`}
              title={title}
              className="w-full h-full"
              onLoad={handleIframeLoad}
            />
          </motion.div>
        </div>
        
        {/* Footer with page indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-[#e27396]">{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>
        </motion.div>
      </CustomDialogContent>
    </Dialog>
  );
} 